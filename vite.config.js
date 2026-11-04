import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import { WebSocketServer, WebSocket } from "ws";

function webSocketChatSignalingPlugin() {
  return {
    name: "vite-websocket-chat-signaling",
    configureServer(server) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ noServer: true });
      const clients = new Map();

      server.httpServer.on("upgrade", (request, socket, head) => {
        try {
          const url = new URL(
            request.url,
            `http://${request.headers.host || "localhost"}`
          );

          if (url.pathname === "/ws") {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit("connection", ws, request);
            });
          }
        } catch (e) {
          console.error("WS Upgrade Error:", e);
        }
      });

      function broadcastToRoom(room, message, senderWs, includeSelf = false) {
        const payload = JSON.stringify(message);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const info = clients.get(client);

            const inRoom =
              !room ||
              room === "global" ||
              (info && info.rooms && info.rooms.has(room));

            if (inRoom) {
              if (includeSelf || client !== senderWs) {
                client.send(payload);
              }
            }
          }
        });
      }

      wss.on("connection", (ws) => {
        const clientInfo = {
          id: `client_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 7)}`,
          rooms: new Set(["global"]),
        };

        clients.set(ws, clientInfo);

        ws.send(
          JSON.stringify({
            type: "connected",
            clientId: clientInfo.id,
            timestamp: new Date().toISOString(),
          })
        );

        ws.on("message", (raw) => {
          try {
            const data = JSON.parse(raw.toString());
            const type = data.type;

            if (type === "join") {
              const { room, role, name, patientCode } = data;

              if (role) clientInfo.role = role;
              if (name) clientInfo.name = name;
              if (patientCode) clientInfo.patientCode = patientCode;
              if (room) clientInfo.rooms.add(room);

              broadcastToRoom(
                room,
                {
                  type: "presence",
                  userId: clientInfo.id,
                  role: clientInfo.role,
                  name: clientInfo.name,
                  patientCode: clientInfo.patientCode,
                  status: "online",
                  timestamp: new Date().toISOString(),
                },
                ws
              );
            } else if (type === "leave") {
              if (data.room) {
                clientInfo.rooms.delete(data.room);
              }
            } else if (
              [
                "chat_message",
                "typing",
                "call_signal",
                "call_offer",
                "call_answer",
                "call_ice",
                "call_end",
                "call_reject",
                "call_start",
              ].includes(type)
            ) {
              const targetRoom = data.room || "global";

              broadcastToRoom(
                targetRoom,
                {
                  ...data,
                  senderId: clientInfo.id,
                  senderRole: data.senderRole || clientInfo.role,
                  senderName: data.senderName || clientInfo.name,
                  timestamp:
                    data.timestamp || new Date().toISOString(),
                },
                ws,
                data.includeSelf
              );
            }
          } catch (err) {
            console.error("WS Message Error:", err);
          }
        });

        ws.on("close", () => {
          clientInfo.rooms.forEach((room) => {
            broadcastToRoom(
              room,
              {
                type: "presence",
                userId: clientInfo.id,
                role: clientInfo.role,
                name: clientInfo.name,
                patientCode: clientInfo.patientCode,
                status: "offline",
                timestamp: new Date().toISOString(),
              },
              ws
            );
          });

          clients.delete(ws);
        });
      });
    },
  };
}

function doctorCdsStaticPlugin() {
  return {
    name: "vite-doctor-cds-static",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (url === "/doctor-cds" || url === "/doctor-cds/") {
          const indexPath = path.resolve(__dirname, "neo4j-cds/static/index.html");
          if (fs.existsSync(indexPath)) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.end(fs.readFileSync(indexPath));
          }
        }
        if (url.startsWith("/static/")) {
          const filePath = path.resolve(__dirname, "neo4j-cds" + url);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            const mimeTypes = {
              ".html": "text/html; charset=utf-8",
              ".js": "application/javascript; charset=utf-8",
              ".css": "text/css; charset=utf-8",
              ".json": "application/json",
              ".svg": "image/svg+xml",
              ".png": "image/png",
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".woff2": "font/woff2"
            };
            res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
            return res.end(fs.readFileSync(filePath));
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    webSocketChatSignalingPlugin(),
    doctorCdsStaticPlugin(),
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== "true",
    watch: process.env.DISABLE_HMR === "true" ? null : {},
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/doctor-cds": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/doctor-cds/, "")
      },
      "/static": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      }
    }
  }
});
