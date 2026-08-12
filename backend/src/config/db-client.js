// HTTP-based DB client that calls Supabase db-proxy Edge Function
// Drop-in replacement for Prisma when direct TCP is blocked (e.g. Vercel IPv6 issue)

const SUPABASE_FN_URL = process.env.DB_PROXY_URL; // set in Vercel: https://ljvxruuufyuypesozlwh.supabase.co/functions/v1/db-proxy

function escapeSql(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  // Date
  if (val instanceof Date) return `'${val.toISOString()}'`;
  // String — escape quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildValues(rows) {
  return rows.map(row => `(${row.map(escapeSql).join(", ")})`).join(", ");
}

async function dbQuery(sql) {
  if (!SUPABASE_FN_URL) throw new Error("DB_PROXY_URL env var is not set");

  const res = await fetch(SUPABASE_FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `DB proxy error ${res.status}`);
  }

  const payload = await res.json();
  return payload.data || [];
}

// ===== Prisma-like API =====

const db = {
  user: {
    async findUnique({ where }) {
      const rows = await dbQuery(
        `SELECT * FROM "User" WHERE "username" = '${where.username}' LIMIT 1`
      );
      if (!rows[0]) return null;
      return {
        ...rows[0],
        branches: await db.userBranch.findMany({ userId: rows[0].id }),
      };
    },
  },

  userBranch: {
    async findMany({ userId }) {
      const rows = await dbQuery(
        `SELECT ub.*, b.name as "branchName", w.id as "warehouseId" ` +
        `FROM "UserBranch" ub ` +
        `JOIN "Branch" b ON b.id = ub."branchId" ` +
        `LEFT JOIN "Warehouse" w ON w."branchId" = b.id AND w."isActive" = true ` +
        `WHERE ub."userId" = '${userId}'`
      );
      return rows.map(r => ({
        branchId: r.branchId,
        branch: { id: r.branchId, name: r.branchName, warehouses: r.warehouseId ? [{ id: r.warehouseId }] : [] },
      }));
    },
  },

  auditLog: {
    async create({ data }) {
      await dbQuery(
        `INSERT INTO "AuditLog" ("id", "userId", "action", "entityType", "entityId") ` +
        `VALUES ('${data.id || crypto.randomUUID()}', ${escapeSql(data.userId)}, '${data.action}', '${data.entityType}', ${escapeSql(data.entityId)})`
      );
    },
  },
};

module.exports = { db, dbQuery };
