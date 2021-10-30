import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

// view 엔진 설정
app.set("view engine", "pug");
// template 위치 지정
app.set("views", __dirname + "/views");

// static 설정
app.use("/public", express.static(__dirname + "/public"));

// route 설정
app.get("/", (req, res) => res.render("home"));
// 어떤 url을 입력하던지 home("/")으로 이동
app.get("/*", (req, res) => res.redirect("/"));

const handelListen = () => console.log(`Listening on http://localhost:3001`);
// express 방식
// app.listen(3000,handelListen);

// node에 내장된 서버 사용
const server = http.createServer(app);
// WebSocket 사용 : http, websocket 서버 둘다 같은 port에서 작동
const wss = new WebSocket.Server({server});

// 소켓 저장용 더미 데이터베이스
const sockets = [];

// on method에서는 event(connection)가 발동하는 것을 기다림
// socket에는 연결된 사람의 정보를 가져옴
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon"
    console.log("Connect to Browser");
    socket.on("close", () => console.log(("Disconnected from Browser")));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        console.log(message);
        switch (message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
                break
            case "nickname":
                socket["nickname"] = message.payload;
                break
        }
    });
    socket.send("hello");
});

server.listen(3001, handelListen);