// html에 socket.io.js 를 넣어주면 io function을 사용할 수 있음
// io는 자동적으로 back-end socket.io와 연결해주는 function

const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(addMessage) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = addMessage;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  // argument 보내기 (object 전송 가능)
  // callback (서버로부터 실행되는 function)
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// back에서 원한 welcome 실행
socket.on("welcome", () => {
  addMessage("Someone Joined");
});
