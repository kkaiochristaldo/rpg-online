

    const socket = io.connect("http://localhost:3000");

    function btnCreate () {
        document.querySelector("#formCreate").className = "appearCreate";
    }

    function btnFind () {
        document.querySelector("#formFind").className = "appearCreate";
    }

    function closeLogin () {
        document.querySelector("#formCreate").className = "invisible";
        document.querySelector("#formFind").className = "invisible";
    }

    function createRoom(event) {
        event.preventDefault();

        let name = document.querySelector("#nameCreate").value;
        let amount = document.querySelector("#amountCreate").value;
        let character = "http://localhost:3000/characters/characters-1.png";
        socket.emit("createRoom",{name, character, amount})

    }

    function findRoom(event) {
        event.preventDefault();

        let name = document.querySelector("#nameFind").value;
        let code = document.querySelector("#codeFind").value;
        let character = "http://localhost:3000/characters/characters-1.png";
        socket.emit("findRoom", {name, character, code})

    }



    socket.on("game", data => {
        console.log(data)
        
    })
    
    socket.on("tokens", ({idPlayer, codeRoom}) => {
        localStorage.setItem("user", idPlayer)
        localStorage.setItem("code", codeRoom)

        window.location.href = "/game";
    })


    