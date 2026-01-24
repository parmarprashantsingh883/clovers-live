import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// ✅ Railway auto-detects PORT, fallback is mandatory
const PORT = process.env.PORT || 5000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Health check
server.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is live 🚀" });
});

// API routes
server.use("/api", router);

// ✅ Must listen on 0.0.0.0
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
