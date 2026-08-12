// HTTP-based DB client — calls Supabase db-proxy Edge Function
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
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB proxy error ${res.status}`);
  }

  const payload = await res.json();
  return payload.data || [];
}

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
      return await dbQuery(
        `SELECT ub.*, b.name as "branchName", w.id as "warehouseId" ` +
        `FROM "UserBranch" ub ` +
        `JOIN "Branch" b ON b.id = ub."branchId" ` +
        `LEFT JOIN "Warehouse" w ON w."branchId" = b.id AND w."isActive" = true ` +
        `WHERE ub."userId" = '${userId}'`
      );
    },
  },

  auditLog: {
    async create({ data }) {
      const id = require("crypto").randomUUID();
      return await dbQuery(
        `INSERT INTO "AuditLog" ("id", "userId", "action", "entityType", "entityId") ` +
        `VALUES ('${id}', ${escapeSql(data.userId)}, '${data.action}', '${data.entityType}', ${escapeSql(data.entityId)})`
      );
    },
  },
};

module.exports = { db, dbQuery };
