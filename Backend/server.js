import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// ⚠️ MUST use process.env.PORT
const PORT = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Health check
server.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is live 🚀" });
});

// API
server.use("/api", router);

// ⚠️ MUST listen on PORT
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
