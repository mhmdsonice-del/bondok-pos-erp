import { prisma } from "../../config/prisma";

export async function requestLeaveService(input: any) { return prisma.leave.create({ data: input }); }
export async function approveLeaveService(leaveId: string, approvedById: string) {
  await prisma.leave.findUniqueOrThrow({ where: { id: leaveId } });
  return prisma.leave.update({ where: { id: leaveId }, data: { status: "APPROVED", approvedById, approvedAt: new Date() } });
}
export async function rejectLeaveService(leaveId: string, rejectedById: string) {
  await prisma.leave.findUniqueOrThrow({ where: { id: leaveId } });
  return prisma.leave.update({ where: { id: leaveId }, data: { status: "REJECTED", approvedById: rejectedById, approvedAt: new Date() } });
}
export async function getEmployeeLeavesService(userId: string) { return prisma.leave.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); }
export async function getLeaveBalanceService(userId: string) {
  const leaves = await prisma.leave.findMany({ where: { userId, status: "APPROVED" } });
  return { userId, totalUsed: leaves.length, balance: Math.max(0, 30 - leaves.length), maxAnnualDays: 30 };
}
export async function createAdvanceService(input: any) { return prisma.advance.create({ data: input }); }
export async function deductAdvanceService(advanceId: string, amount: number) {
  const advance = await prisma.advance.findUniqueOrThrow({ where: { id: advanceId } });
  const newRemaining = Number(advance.remainingAmount) - amount;
  return prisma.advance.update({ where: { id: advanceId }, data: { remainingAmount: newRemaining, isSettled: newRemaining <= 0, settledAt: newRemaining <= 0 ? new Date() : undefined } });
}
export async function getEmployeeAdvancesService(userId: string) { return prisma.advance.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); }
export async function createPenaltyService(input: any) { return prisma.penalty.create({ data: input }); }
export async function markPenaltyDeductedService(penaltyId: string) { return prisma.penalty.update({ where: { id: penaltyId }, data: { isDeducted: true, deductedAt: new Date() } }); }
export async function getEmployeePenaltiesService(userId: string) { return prisma.penalty.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); }
export async function createRewardService(input: any) { return prisma.reward.create({ data: input }); }
export async function markRewardPaidService(rewardId: string) { return prisma.reward.update({ where: { id: rewardId }, data: { isPaid: true, paidAt: new Date() } }); }
export async function getEmployeeRewardsService(userId: string) { return prisma.reward.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); }
export async function createShiftService(input: any) { return prisma.shift.create({ data: input }); }
export async function assignShiftService(input: any) { return prisma.shiftAssignment.create({ data: input }); }
export async function getBranchShiftsService(branchId: string) {
  return prisma.shift.findMany({ where: { branchId, isActive: true }, include: { assignments: { include: { user: { select: { fullName: true } } } } } });
}