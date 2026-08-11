import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/security";

interface PayrollPeriod { start: Date; end: Date }

/** Calculate payroll from REAL employee data, attendance, penalties, advances, rewards */
export async function calculatePayrollService(userId: string, period: PayrollPeriod) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.isActive) throw new AppError("Employee is inactive", 400);

  // Get attendance for the period
  const attendances = await prisma.attendance.findMany({
    where: { userId, timestamp: { gte: period.start, lte: period.end } },
    orderBy: { timestamp: "asc" },
  });

  // Calculate worked hours, late, absence, overtime from attendance
  const checkIns = attendances.filter((a) => a.status === "CHECK_IN");
  const checkOuts = attendances.filter((a) => a.status === "CHECK_OUT");
  const workingDays = checkIns.length;

  // Pair check-in/check-out to calculate hours
  let totalHoursWorked = 0;
  let totalOvertimeHours = 0;
  let lateMinutes = 0;
  const standardHoursPerDay = 8;

  // Simple pairing: for each day with both check-in and check-out
  const pairs: { checkIn: Date; checkOut: Date }[] = [];
  const sortedByDay = new Map<string, { checkIn?: Date; checkOut?: Date }>();

  for (const a of attendances) {
    const day = a.timestamp.toISOString().slice(0, 10);
    const entry = sortedByDay.get(day) || {};
    if (a.status === "CHECK_IN") entry.checkIn = a.timestamp;
    if (a.status === "CHECK_OUT") entry.checkOut = a.timestamp;
    sortedByDay.set(day, entry);
  }

  for (const [, entry] of sortedByDay) {
    if (entry.checkIn && entry.checkOut) {
      const hours = (entry.checkOut.getTime() - entry.checkIn.getTime()) / 3600000;
      totalHoursWorked += Math.min(hours, standardHoursPerDay);
      if (hours > standardHoursPerDay) {
        totalOvertimeHours += hours - standardHoursPerDay;
      }

      // Late detection: check-in after 9:00 AM
      const nineAM = new Date(entry.checkIn);
      nineAM.setHours(9, 0, 0, 0);
      if (entry.checkIn > nineAM) {
        lateMinutes += (entry.checkIn.getTime() - nineAM.getTime()) / 60000;
      }
    }
  }

  // Absence: working days in period minus days with check-in
  const totalWorkingDays = calculateWorkingDays(period.start, period.end);
  const absentDays = Math.max(0, totalWorkingDays - checkIns.length);

  // Use real employee rates
  const monthlySalary = user.monthlySalary ? Number(user.monthlySalary) : null;
  const hourlyRate = user.hourlyRate ? Number(user.hourlyRate) : null;
  const overtimeRate = user.overtimeRate ? Number(user.overtimeRate) : (hourlyRate ? hourlyRate * 1.5 : null);

  // Calculate base salary from real data
  let baseSalary: number;
  if (monthlySalary && monthlySalary > 0) {
    // Monthly employee: prorate based on attendance
    const dailyRate = monthlySalary / totalWorkingDays;
    baseSalary = dailyRate * workingDays;
  } else if (hourlyRate && hourlyRate > 0) {
    // Hourly employee
    baseSalary = totalHoursWorked * hourlyRate;
  } else {
    throw new AppError("Employee has no salary rate configured (monthlySalary or hourlyRate)", 400);
  }

  // Overtime pay
  const overtimePay = overtimeRate ? totalOvertimeHours * overtimeRate : 0;

  // Late deductions (hourly rate prorated for late time)
  const lateDeductions = hourlyRate ? (lateMinutes / 60) * hourlyRate : 0;

  // Absence deductions
  const absenceDeductions = monthlySalary ? (monthlySalary / totalWorkingDays) * absentDays : 0;

  // Penalties
  const penalties = await prisma.penalty.findMany({
    where: { userId, isDeducted: false },
  });
  const penaltyTotal = penalties.reduce((s, p) => s + Number(p.amount), 0);

  // Advances
  const advances = await prisma.advance.findMany({
    where: { userId, isSettled: false },
  });
  const advanceTotal = advances.reduce((s, a) => s + Number(a.remainingAmount), 0);

  // Rewards
  const rewards = await prisma.reward.findMany({
    where: { userId, isPaid: false },
  });
  const rewardTotal = rewards.reduce((s, r) => s + Number(r.amount), 0);

  // Net salary formula
  const netSalary = baseSalary + overtimePay + rewardTotal - penaltyTotal - advanceTotal - lateDeductions - absenceDeductions;

  return {
    userId, fullName: user.fullName, period,
    isHourly: !monthlySalary,
    workingDays, totalWorkingDays, absentDays, lateMinutes: Math.round(lateMinutes),
    totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    hourlyRate, overtimeRate, monthlySalary,
    baseSalary: Math.round(baseSalary * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    lateDeductions: Math.round(lateDeductions * 100) / 100,
    absenceDeductions: Math.round(absenceDeductions * 100) / 100,
    penaltyTotal: Math.round(penaltyTotal * 100) / 100,
    advanceTotal: Math.round(advanceTotal * 100) / 100,
    rewardTotal: Math.round(rewardTotal * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
  };
}

function calculateWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 5 && day !== 6) count++; // Skip Friday(5) and Saturday(6)
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Generate payroll record from calculated data */
export async function generatePayrollRecordService(userId: string, period: PayrollPeriod) {
  const calc = await calculatePayrollService(userId, period);
  return prisma.payrollRecord.create({
    data: {
      userId,
      periodStart: period.start, periodEnd: period.end,
      baseSalary: calc.baseSalary,
      hourlyRate: calc.hourlyRate,
      hoursWorked: calc.totalHoursWorked,
      overtimeHours: calc.totalOvertimeHours,
      overtimePay: calc.overtimePay,
      allowances: 0,
      bonuses: 0,
      deductions: 0,
      penaltiesTotal: calc.penaltyTotal,
      advancesRecovered: calc.advanceTotal,
      lateDeductions: calc.lateDeductions,
      absenceDeductions: calc.absenceDeductions,
      rewards: calc.rewardTotal,
      netSalary: calc.netSalary,
      status: "DRAFT",
    },
  });
}

/** Approve payroll — moves from DRAFT → APPROVED */
export async function approvePayrollService(recordId: string, userId: string) {
  const record = await prisma.payrollRecord.findUniqueOrThrow({ where: { id: recordId } });
  if (record.status !== "DRAFT" && record.status !== "REVIEW") {
    throw new AppError(`Cannot approve payroll with status ${record.status}`, 400);
  }
  return prisma.payrollRecord.update({
    where: { id: recordId },
    data: { status: "APPROVED" },
  });
}

/** Pay payroll — moves from APPROVED → PAID */
export async function payPayrollService(recordId: string, userId: string) {
  const record = await prisma.payrollRecord.findUniqueOrThrow({ where: { id: recordId } });
  if (record.status !== "APPROVED") {
    throw new AppError(`Cannot pay payroll with status ${record.status}`, 400);
  }
  return prisma.payrollRecord.update({
    where: { id: recordId },
    data: { status: "PAID", paidAt: new Date() },
  });
}

/** Lock payroll — moves to LOCKED, requires special permission */
export async function lockPayrollService(recordId: string, userId: string) {
  const record = await prisma.payrollRecord.findUniqueOrThrow({ where: { id: recordId } });
  if (record.status !== "PAID") {
    throw new AppError(`Can only lock PAID payroll (current: ${record.status})`, 400);
  }
  const updated = await prisma.$transaction(async (tx) => {
    const locked = await tx.payrollRecord.update({
      where: { id: recordId },
      data: { status: "LOCKED", lockedById: userId, lockedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        userId, action: "PAYROLL_LOCKED", entityType: "PayrollRecord",
        entityId: recordId,
        metadata: { netSalary: Number(record.netSalary), period: `${record.periodStart.toISOString()} - ${record.periodEnd.toISOString()}` },
      },
    });
    return locked;
  });
  return updated;
}

/** Get all payroll records for an employee */
export async function getEmployeePayrollService(userId: string) {
  return prisma.payrollRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/** Get payroll record by ID */
export async function getPayrollRecordService(recordId: string) {
  return prisma.payrollRecord.findUnique({
    where: { id: recordId },
    include: { user: { select: { fullName: true, role: true } } },
  });
}
