const eventSource = new EventSource("http://localhost:8080/sender/ssar/receiver/cos");

eventSource.onmessage = (event) => {
    console.log(1,event);
    const data = JSON.parse(event.data);
    console.log(2, data);
}

function getSendMsgBox(msg){
    return `<div class="sent_msg">
    <p>${msg}</p>
    <span class="time_date"> 11:18 | Today</span>
    </div>`;
}


document.querySelector("#chat-send").addEventListener("click", ()=> {
    let chatBox = document.querySelector("#chat-box");
    let msgInput = document.querySelector("#chat-outgoing-msg");

    let chatOutgoingBox = document.createElement("div");
    chatOutgoingBox.className = "outgoing_msg";
    
    chatOutgoingBox.innerHTML = getSendMsgBox(msgInput.value);
    chatBox.append(chatOutgoingBox);
    msgInput.value = "";
});

document.querySelector("#chat-outgoing-msg").addEventListener("keydown", (e) => {
    if(e.keyCode===13) {
        let chatBox = document.querySelector("#chat-box");
        let msgInput = document.querySelector("#chat-outgoing-msg");
    
        let chatOutgoingBox = document.createElement("div");
        chatOutgoingBox.className = "outgoing_msg";
        
        chatOutgoingBox.innerHTML = getSendMsgBox(msgInput.value);
        chatBox.append(chatOutgoingBox);
        msgInput.value = "";
    }
});