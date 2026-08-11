import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/bondok_test",
      JWT_ACCESS_SECRET: "test_access_secret_min_16chars",
      JWT_REFRESH_SECRET: "test_refresh_secret_min_16chars",
      CORS_ORIGIN: "http://localhost:5173",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/server.ts"],
    },
  },
});
