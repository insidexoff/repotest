const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");


myVideo.muted = true;

backBtn.addEventListener("click", () => {
    document.querySelector(".main__left").style.display = "flex";
    document.querySelector(".main__left").style.flex = "1";
    document.querySelector(".main__right").style.display = "none";
    document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
    document.querySelector(".main__right").style.display = "flex";
    document.querySelector(".main__right").style.flex = "1";
    document.querySelector(".main__left").style.display = "none";
    document.querySelector(".header__back").style.display = "block";
});

function stripHtmlToText(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    var res = tmp.textContent || tmp.innerText || '';
    res.replace('\u200B', ''); // zero width space
    res = res.trim();
    return res;
}







const user = prompt("Enter your name");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

let myVideoStream;
navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });
    });

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);

    });
};

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
        const countuser = document.querySelectorAll('video').length;
        if (countuser == 1) {
            document.querySelectorAll('video')[0].style.width = "95%";
            document.querySelectorAll('video')[0].style.height = "80%";
            document.querySelectorAll('video')[0].style.maxHeight = "500px";

        }
        if (countuser === 2) {
            document.querySelectorAll('video')[0].style.width = "95%";
            document.querySelectorAll('video')[0].style.height = "200px";
            document.querySelectorAll('video')[0].style.maxHeight = "250px";
            document.querySelectorAll('video')[1].style.width = "95%";
            document.querySelectorAll('video')[1].style.height = "200px";
            document.querySelectorAll('video')[1].style.maxHeight = "250px";
        }
        if (countuser === 3) {
            document.querySelectorAll('video')[0].style.width = "95%";
            document.querySelectorAll('video')[0].style.height = "200px";
            document.querySelectorAll('video')[0].style.maxHeight = "250px";
            document.querySelectorAll('video')[1].style.width = "45%";
            document.querySelectorAll('video')[1].style.height = "200px";
            document.querySelectorAll('video')[1].style.maxHeight = "250px";
            document.querySelectorAll('video')[2].style.width = "45%";
            document.querySelectorAll('video')[2].style.height = "200px";
            document.querySelectorAll('video')[2].style.maxHeight = "250px";
        }
        if (countuser === 4) {
            document.querySelectorAll('video')[0].style.width = "45%";
            document.querySelectorAll('video')[1].style.width = "45%";
            document.querySelectorAll('video')[2].style.width = "45%";
            document.querySelectorAll('video')[3].style.width = "45%";
            document.querySelectorAll('video')[3].style.height = "200px";
            document.querySelectorAll('video')[3].style.maxHeight = "250px";
        }
        if (countuser > 4) {
            document.querySelectorAll('video').forEach(el => {
                el.style.width = "45%";
                el.style.height = "200px";
                el.style.maxHeight = "250px";
            })
        }

    });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
        socket.emit("message", stripHtmlToText(text.value));
        text.value = "";
    }
});

text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
        socket.emit("message", stripHtmlToText(text.value));
        text.value = "";
    }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="bi bi-mic-mute-fill"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="bi bi-mic-fill"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="bi bi-camera-video-off-fill"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="bi bi-camera-video-fill"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
});

inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});

socket.on("createMessage", (message, userName) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
        <b style="justify-content:${
          userName === user ? "right" : "left"
        };">${
          userName === user ? "<i class='far fa-user-circle' style='color:var(--primary-color);'></i> <span>me</span>" : "<i class='far fa-user-circle'></i> <span>" + userName + "</span>"
        } </b>
        <span style="${
            userName === user ? "background:#bdb2ff;" : ""
          }">${message}</span>
    </div>`;
});