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

sendChat.addEventListener("click", () => {
  const message = chatInput.value.trim();

  if (message === "") return;

  console.log("User message:", message);

  chatInput.value = "";
});
