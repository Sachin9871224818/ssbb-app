import app from "./app.js";

const PORT = parseInt(process.env.API_PORT || "8000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SSBB API running at http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
