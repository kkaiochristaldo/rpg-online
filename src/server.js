const express = require("express");
const app = express();
const http = require("http");
const path = require("path")
const server = http.createServer(app);
const io = require ("socket.io")(server)
const ejs = require("ejs");
const crypto = require("crypto");

const { join } = require("path");
const { memory } = require("console");

app.use(express.json());
app.use("/characters", express.static(path.resolve(__dirname, "..", "public", "img", "characters")));


app.use(express.static(path.join(__dirname, "..", "public")));
app.set("views", path.join(__dirname, "..", "public"));
app.engine("html", ejs.renderFile);
app.set("view engine", "html");

    app.get("/", (req, res) => {
        return res.render("./pages/login.html")
    })

    app.get("/game", (req, res) => {
        return res.render("./pages/game.html")
    })

    const memories = [];

    class Room {
        create(idRoom, code, amount) {
            this.room = {
                id: idRoom,
                code: code,
                amount: amount,
                users: [],
                messages: []
            }
            memories.push(this.room);
        }

        addPlayer(idPlayer, name, character, idRoom) {
            this.player = {
                id: idPlayer,
                name: name,
                character: character,
            }
            if((memories[idRoom].users.length + 1) < memories[idRoom].amount) {
                memories[idRoom].users.push(this.player);
                return true;
            }
            else {
                return false;
            }
        

        }

        addMessage(idMessage, author, character, description, idRoom) {
            this.message = {
                id: idMessage,
                author: author,
                character: character,
                description: description, 
            }
            memories[idRoom].messages.push(this.message);
        }

        findCode(code) {
            for(let i = 0; i < memories.length; i++) {
                if(memories[i].code == code) {
                    this.origin = memories[i];
                }
            }
            return this.origin;
        }
    }

    io.on("connect", socket => {
        var Class = new Room();

        socket.on("createRoom", ({name, character, amount}) => {
            var codeRoom = crypto.randomBytes(3).toString('hex');
            socket.join(codeRoom);
        
            let idRoom = memories.length;
            Class.create(idRoom, codeRoom, amount);

            let idPlayer = 1;
            Class.addPlayer(idPlayer, name, character, idRoom);

            const bot = {
                id: 1,
                author: "Bot",
                character: character,
                description: `${name} entrou na sala [${codeRoom}]!`,
            }

            Class.addMessage(bot.id, bot.author, bot.character, bot.description, idRoom);

            // io.to(codeRoom).emit("game", memories[idRoom])
            socket.emit("tokens", {idPlayer, codeRoom})
    
        })

        socket.on("findRoom", ({name, character, code}) => {
          
        socket.join(code);

        let roomOrigin = Class.findCode(code);

        let idRoom = roomOrigin.id;
            let idPlayer = roomOrigin.users.length;
            idPlayer++;
            
            
            Class.addPlayer(idPlayer, name, character,  idRoom);


            const bot = {
                id: 1,
                author: "Bot",
                character: character,
                description: `${name} entrou na sala!`,
            }
            let idMessage = roomOrigin.messages.length + 1;
            Class.addMessage(idMessage, bot.author, bot.character, bot.description, idRoom);


            let codeRoom = code;
            socket.emit("tokens", {idPlayer, codeRoom})
            // io.to(code).emit("game", memories[idRoom])
        
        })

        socket.on("gaming", (code) => {
            socket.join(code);

            let roomOrigin = Class.findCode(code);
            // console.log(roomOrigin)
            io.to(code).emit("game", roomOrigin)
        })

        socket.on("sendMessage", (data) => {
            let code = data.code;
            socket.join(code);

            let {id, author, character, description} = data;

            let roomOrigin = Class.findCode(code);

            let idRoom = roomOrigin.id;

            Class.addMessage(id, author, character, description, idRoom);


            io.to(code).emit("game", memories[idRoom])
    

        })

    })



server.listen(3000, () => {
    console.log("server on")
})