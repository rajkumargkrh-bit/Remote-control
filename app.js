const loginScreen=document.querySelector("#loginScreen"),remoteApp=document.querySelector("#remoteApp"),loginPin=document.querySelector("#loginPin"),loginBtn=document.querySelector("#loginBtn"),loginText=document.querySelector("#loginText"),manualLock=document.querySelector("#manualLock"),lockNow=document.querySelector("#lockNow");
function unlockLocal(){remoteApp.classList.remove("hidden");loginScreen.classList.add("hidden")}
function lockLocal(){localStorage.removeItem("crystalUnlocked");loginScreen.classList.remove("hidden");remoteApp.classList.add("hidden");loginPin.value="";loginText.textContent="Enter your PIN"}
function setupAuth(){const p=localStorage.getItem("crystalPin");if(localStorage.getItem("crystalUnlocked")==="1"&&p){unlockLocal();return}loginText.textContent=p?"Enter your PIN":"Create a PIN once. No automatic lockout.";if(p)manualLock.classList.remove("hidden")}
loginBtn.addEventListener("click",()=>{const e=loginPin.value.trim(),p=localStorage.getItem("crystalPin");if(e.length<4)return toast("Use at least 4 digits");if(!p){localStorage.setItem("crystalPin",e);localStorage.setItem("crystalUnlocked","1");unlockLocal()}else if(e===p){localStorage.setItem("crystalUnlocked","1");unlockLocal()}else toast("Wrong PIN. Try again. No lockout.")});
manualLock.addEventListener("click",lockLocal);lockNow.addEventListener("click",lockLocal);loginPin.addEventListener("keydown",e=>{if(e.key==="Enter")loginBtn.click()});setupAuth();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let socket = null;
let connected = false;

const toast = (msg) => {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove("show"), 1800);
};

function wsUrl() {
  return `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/remote`;
}

function connect() {
  const ip = $("#tvIp").value.trim();
  const name = $("#deviceName").value.trim() || "Crystal Remote";
  if (!ip) return toast("Enter TV IP address");

  socket = new WebSocket(wsUrl());
  socket.onopen = () => socket.send(JSON.stringify({
    type: "connect", ip, name, token: localStorage.getItem("samsungToken") || ""
  }));
  socket.onmessage = event => {
    let msg;
    try { msg = JSON.parse(event.data); } catch { return; }
    if (msg.type === "connected") {
      connected = true;
      $("#setup").close();
      toast("TV connected");
    } else if (msg.type === "token") {
      localStorage.setItem("samsungToken", msg.token);
      toast("Pairing saved");
    } else if (msg.type === "error") {
      toast(msg.message || "Connection error");
      $("#setupStatus").textContent = msg.message || "Connection error";
    } else if (msg.type === "disconnected") {
      connected = false;
      toast("TV disconnected");
    }
  };
  socket.onerror = () => toast("Cannot reach remote server");
}

function sendKey(key) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    $("#setup").showModal();
    return;
  }
  socket.send(JSON.stringify({type:"key", key}));
}

$$("[data-key]").forEach(btn => {
  btn.addEventListener("click", () => {
    sendKey(btn.dataset.key);
    btn.animate([{transform:"scale(.92)"},{transform:"scale(1)"}], {duration:120});
  });
});

$("#numbers").addEventListener("click", () => $("#numberPad").classList.toggle("hidden"));
$("#connectBtn").addEventListener("click", e => {
  e.preventDefault();
  connect();
});

$("#more").addEventListener("click", () => $("#setup").showModal());
$("#search").addEventListener("click", () => sendKey("KEY_SEARCH"));
$("#voice").addEventListener("click", () => toast("Voice input depends on TV model"));
$$(".app").forEach(btn => btn.addEventListener("click", () => toast(`${btn.dataset.app}: app launch can be mapped per TV model`)));

window.addEventListener("keydown", e => {
  const map = {
    ArrowUp:"KEY_UP", ArrowDown:"KEY_DOWN", ArrowLeft:"KEY_LEFT", ArrowRight:"KEY_RIGHT",
    Enter:"KEY_ENTER", Escape:"KEY_RETURN", "+":"KEY_VOLUP", "-":"KEY_VOLDOWN",
    m:"KEY_MENU", h:"KEY_HOME"
  };
  if (map[e.key]) { e.preventDefault(); sendKey(map[e.key]); }
});

$("#setup").addEventListener("cancel", e => e.preventDefault());

if (localStorage.getItem("tvIp")) $("#tvIp").value = localStorage.getItem("tvIp");
$("#tvIp").addEventListener("change", () => localStorage.setItem("tvIp", $("#tvIp").value));
setTimeout(() => { if (!connected) $("#setup").showModal(); }, 500);
