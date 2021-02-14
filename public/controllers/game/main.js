
const socket = io.connect("http://localhost:3000");

window.onkeydown = (e) => {
    if(e.code == "Enter") {
        sendMessage(e)
    }
}

var messages;
var player;
var users;

var code = localStorage.getItem("code");

if(code != "") {
    socket.emit("gaming", code)
}
else {
    window.location.href = "/";
}

socket.on("game", data => {
    var playerId = localStorage.getItem("user");
    playerId--;
    player = data.users[playerId];
    console.log(player.name)

    messages = data.messages;
    users = data.users;
    LoadingMessages(data.messages)

    LoadingPlayers(data.users)

})

const LoadingMessages = (messages) => {
        let box = document.querySelector(".containerMessages")
        box.innerHTML = "";

        for( let i = 0 ; i< messages.length; i++ ) {
            box.innerHTML += "<div class='message'> <img src="+messages[i].character+"> <p> <strong>"+messages[i].author+":</strong> "+messages[i].description+" </p> </div>"
        }
    }

const LoadingPlayers = (users) => {
    let boxUsers = document.querySelector("#topRow");
    boxUsers.innerHTML = "";

    for(let i = 0; i< users.length ; i++) {
        boxUsers.innerHTML += "<div class='gamer'><img src='"+users[i].character+"' /><p>"+users[i].name+"</p></div>"
    }

}

function sendMessage(event) {
    event.preventDefault();

    let description = document.querySelector("#boxMessage").value;

    const message = {
        id:(messages.length + 1),
        author: player.name,
        character: player.character,
        description: description,
        code: code,
    }
    if (description != "") {
        socket.emit("sendMessage", message)
    }

    document.querySelector("#boxMessage").value = "";
}

