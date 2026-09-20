const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();

    navItems.forEach((nav) => {
      nav.classList.remove("active");
    });

    item.classList.add("active");
  });
});
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");

sendChat.addEventListener("click", () => {
  const message = chatInput.value.trim();

  if (message === "") return;

  const messageElement = document.createElement("div");
  messageElement.className = "user-message";
  messageElement.textContent = message;

  chatMessages.appendChild(messageElement);

  chatInput.value = "";
});
