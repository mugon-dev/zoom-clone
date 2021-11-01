import http from "http";
import SocketIO from "socket.io";
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

// express 방식
// app.listen(3000,handelListen);

// node에 내장된 서버 사용
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// public room 가져오기
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  // 위와 동일
  // const sids = wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

wsServer.on("connection", (socket) => {
  // middleware
  // socket에 있는 모든 event를 살핌
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  // msg : front에서 보내주는 json data
  // done : front에서 보내는 함수 (backend에서 실행)
  socket.on("enter_room", (roomName, done) => {
    // 닉네임 초기화
    socket["nickname"] = "Anon";
    // room에 참가
    socket.join(roomName);
    done();
    // "welcome"이벤트를 roomName에 있는 모든 사람들에게 emit
    socket.to(roomName).emit("welcome", socket.nickname);

    // 새로운 방이 만들어 졌다고 연결된 모든 socket에게 알려주기
    wsServer.sockets.emit("room_change", publicRooms());

    // 접속은 끊겼지만 완전히 나가지 않은 상태
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) =>
        socket.io(room).emit("bye", socket.nickname)
      );
    });
    socket.on("disconnect", () => {
      socket.rooms.forEach((room) =>
        wsServer.sockets.emit("room_change", publicRooms())
      );
    });
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
    });
    // 닉네임 생성
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
