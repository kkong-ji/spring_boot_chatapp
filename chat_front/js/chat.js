const eventSource = new EventSource("http://localhost:8080/sender/ssar/receiver/cos");

eventSource.onmessage = (event) => {
    console.log(1,event);
    const data = JSON.parse(event.data);
    console.log(2, data);
    initMessage(data);
}

function getSendMsgBox(msg, time){
    return `<div class="sent_msg">
    <p>${msg}</p>
    <span class="time_date"> ${time} </span>
    </div>`;
}

function initMessage(data) {
    let chatBox = document.querySelector("#chat-box");
    let msgInput = document.querySelector("#chat-outgoing-msg");

    let chatOutgoingBox = document.createElement("div");
    chatOutgoingBox.className = "outgoing_msg";
    

    chatOutgoingBox.innerHTML = getSendMsgBox(data.msg, data.createdAt);
    chatBox.append(chatOutgoingBox);
    msgInput.value = "";
}

function addMessage() {
    let chatBox = document.querySelector("#chat-box");
    let msgInput = document.querySelector("#chat-outgoing-msg");

    let chatOutgoingBox = document.createElement("div");
    chatOutgoingBox.className = "outgoing_msg";

    let date = new Date();
    let now = date.getHours() + ":" + date.getMinutes() + "|" + date.getMonth() + "/" + date.getDate();
    
    chatOutgoingBox.innerHTML = getSendMsgBox(msgInput.value, now);
    chatBox.append(chatOutgoingBox);
    msgInput.value = "";
}

document.querySelector("#chat-send").addEventListener("click", ()=> {
    addMessage();
});

document.querySelector("#chat-outgoing-msg").addEventListener("keydown", (e) => {
    if(e.keyCode===13) {
        addMessage();
    }
});