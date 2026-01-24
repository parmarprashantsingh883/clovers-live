import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 5000;

// Middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Test route
server.get("/", (req, res) => {
  res.json({ status: "Backend running 🚀" });
});

// API routes
server.use("/api", router);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
