// HTTP-based DB client — calls Supabase db-proxy Edge Function
// Generic CRUD helpers so new modules can avoid Prisma (IPv6 issue on Vercel)
const SUPABASE_FN_URL = process.env.DB_PROXY_URL;
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdnhydXV1Znl1eXBlc296bHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM5Njk4MCwiZXhwIjoyMTAxOTcyOTgwfQ.4NT1CKvY6hvUZbxOG4UGiW23qxwj8PpPbdrG4IctHEY";

function escapeSql(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function dbQuery(sql) {
  if (!SUPABASE_FN_URL) throw new Error("DB_PROXY_URL env var is not set");
  const res = await fetch(SUPABASE_FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) throw new Error(`DB proxy error ${res.status}`);
  const payload = await res.json();
  return payload.data || [];
}

// Generic table helper
function table(name, cols) {
  return {
    async findMany({ where = {}, orderBy, limit } = {}) {
      const conds = Object.entries(where).map(([k, v]) => `"${k}" = ${escapeSql(v)}`);
      const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
      const orderSql = orderBy ? `ORDER BY "${orderBy}" DESC` : '';
      const limitSql = limit ? `LIMIT ${limit}` : '';
      return dbQuery(`SELECT * FROM "${name}" ${whereSql} ${orderSql} ${limitSql}`);
    },
    async findFirst(where = {}) {
      const rows = await this.findMany({ where, limit: 1 });
      return rows[0] || null;
    },
    async create(data) {
      const id = data.id || require("crypto").randomUUID();
      const keys = [...cols, 'id'];
      const keyList = keys.filter(k => data[k] !== undefined);
      const colsSql = keyList.map(k => `"${k}"`).join(', ');
      const valsSql = keyList.map(k => escapeSql(k === 'id' ? id : data[k])).join(', ');
      await dbQuery(`INSERT INTO "${name}" (${colsSql}) VALUES (${valsSql})`);
      return { ...data, id };
    },
    async update(id, data) {
      const sets = Object.entries(data).filter(([k]) => k !== 'id').map(([k, v]) => `"${k}" = ${escapeSql(v)}`).join(', ');
      if (!sets) return { id };
      await dbQuery(`UPDATE "${name}" SET ${sets} WHERE "id" = '${id}'`);
      return { id, ...data };
    },
    async remove(id) {
      await dbQuery(`DELETE FROM "${name}" WHERE "id" = '${id}'`);
      return { id };
    },
  };
}

// Existing user lookup (for auth)
const db = {
  user: {
    async findUnique({ where }) {
      const key = where.username ? `"username" = '${where.username}'` : `"id" = '${where.id}'`;
      const rows = await dbQuery(`SELECT * FROM "User" WHERE ${key} LIMIT 1`);
      if (!rows[0]) return null;
      const user = rows[0];
      user.branches = await db.userBranch.findMany({ userId: user.id });
      return user;
    },
  },
  userBranch: {
    async findMany({ userId }) {
      return dbQuery(`SELECT ub.*, b.name as "branchName", w.id as "warehouseId" FROM "UserBranch" ub JOIN "Branch" b ON b.id = ub."branchId" LEFT JOIN "Warehouse" w ON w."branchId" = b.id AND w."isActive" = true WHERE ub."userId" = '${userId}'`);
    },
  },
  auditLog: {
    async create({ data }) {
      const id = require("crypto").randomUUID();
      return dbQuery(`INSERT INTO "AuditLog" ("id", "userId", "action", "entityType", "entityId") VALUES ('${id}', ${escapeSql(data.userId)}, '${data.action}', '${data.entityType}', ${escapeSql(data.entityId)})`);
    },
  },
  // V8 new tables
  task: table("Task", ["companyId", "title", "description", "status", "priority", "assigneeId", "branchId", "dueDate"]),
  workflow: table("Workflow", ["companyId", "name", "description", "steps", "isActive"]),
  haccpCheck: table("HACCPCheck", ["companyId", "branchId", "checkPoint", "targetValue", "actualValue", "frequency", "status", "checkedById", "notes"]),
  asset: table("Asset", ["companyId", "branchId", "name", "type", "serialNumber", "lastMaintenance", "nextMaintenance", "status", "notes"]),
};

module.exports = { db, dbQuery, table, escapeSql };
