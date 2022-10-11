const button = document.querySelector("#sign-out");
const main = document.querySelector("#main");

chrome.storage.local.get("access_token", async ({ access_token }) => {
  if (!access_token) window.location.replace("./popup-sign-in.html");
  const user = await fetch("https://discordapp.com/api/users/@me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((data) => data.json());
  const img = document.createElement("img");
  const username = document.createElement("h3");
  const email = document.createElement("h3");
  username.textContent = user.username + "#" + user.discriminator;
  email.textContent = user.email;
  img.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=128`;
  main.insertBefore(img, button);
  main.insertBefore(username, button);
  main.insertBefore(email, button);
});

button.addEventListener("mouseover", () => {
  button.style.backgroundColor = "black";
  button.style.color = "white";
  button.style.transform = "scale(1.05)";
});

button.addEventListener("mouseleave", () => {
  button.style.backgroundColor = "white";
  button.style.color = "black";
  button.style.transform = "scale(1)";
});

button.addEventListener("click", () => {
  chrome.runtime.sendMessage({ message: "logout" }, function (response) {
    console.log(response);
    if (response === "success") window.location.replace("./popup-sign-in.html");
  });
});
