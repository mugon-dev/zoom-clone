import express from "express";
const app = express();

// view 엔진 설정
app.set("view engine","pug");
// template 위치 지정
app.set("views", __dirname+"/views");

// static 설정
app.use("/public",express.static(__dirname + "/public"));

// route 설정
app.get("/", (req,res) => res.render("home"));
// 어떤 url을 입력하던지 home("/")으로 이동
app.get("/*",(req, res) => res.redirect("/"));

const handelListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000,handelListen);