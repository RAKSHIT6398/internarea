require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const Message = require("./models/Message");

connectDB();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌", socket.id);

  socket.on("join", async (userId) => {
    if (!userId) return;
    const id = String(userId);
    socket.userId = id;
    socket.join(id);
    onlineUsers.set(id, socket.id);
    io.emit("online_users", [...onlineUsers.keys()]);

    const undelivered = await Message.find({ receiver: id, delivered: false });
    const ids = undelivered.map((m) => m._id);

    if (ids.length) {
      await Message.updateMany(
        { _id: { $in: ids } },
        { delivered: true, deliveredAt: new Date() }
      );
      undelivered.forEach((m) =>
        io.to(String(m.sender)).emit("message:delivered", { messageId: m._id })
      );
    }
  });

  socket.on("send_message", async ({ receiverId, message }) => {
    if (!receiverId || !message) return;

    io.to(String(receiverId)).emit("receive_message", message);

    const receiverOnline = onlineUsers.has(String(receiverId));
    if (receiverOnline && message?._id) {
      await Message.updateOne(
        { _id: message._id },
        { delivered: true, deliveredAt: new Date() }
      );
      const senderId = message.sender?._id || message.sender;
      io.to(String(senderId)).emit("message:delivered", { messageId: message._id });
    }
  });

  socket.on("messages:read", async ({ to, from }) => {
    if (!to || !from) return;

    const unreadMsgs = await Message.find({
      sender: to,
      receiver: from,
      read: false,
    }).select("_id");

    const ids = unreadMsgs.map((m) => m._id);

    if (ids.length) {
      await Message.updateMany(
        { _id: { $in: ids } },
        { read: true, readAt: new Date() }
      );
      io.to(String(to)).emit("message:read", { by: from, messageIds: ids });
    }
  });

  socket.on("message:edit", ({ to, message }) => to && io.to(String(to)).emit("message:edited", message));
  socket.on("message:delete", ({ to, messageId }) => to && io.to(String(to)).emit("message:deleted", { messageId }));
  socket.on("typing", ({ to, from }) => to && io.to(String(to)).emit("typing", { from }));
  socket.on("stop_typing", ({ to, from }) => to && io.to(String(to)).emit("stop_typing", { from }));

  socket.on("call:offer", ({ to, from, caller, type, sdp }) => {
    if (!to) return;
    io.to(String(to)).emit("call:offer", { from, caller, type, sdp });
  });

  socket.on("call:answer", ({ to, from, sdp }) => {
    if (!to) return;
    io.to(String(to)).emit("call:answer", { from, sdp });
  });

  socket.on("call:ice", ({ to, from, candidate }) => {
    if (!to) return;
    io.to(String(to)).emit("call:ice", { from, candidate });
  });

  socket.on("call:decline", ({ to, from }) => to && io.to(String(to)).emit("call:declined", { from }));
  socket.on("call:end", ({ to, from }) => to && io.to(String(to)).emit("call:ended", { from }));
  socket.on("call:busy", ({ to, from }) => to && io.to(String(to)).emit("call:busy", { from }));

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online_users", [...onlineUsers.keys()]);
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server + Socket running")
);