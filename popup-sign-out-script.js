const button = document.querySelector("#sign-out");
const main = document.querySelector("#main");
const profile = document.querySelector("#profile");
const channelsList = document.querySelector("#channelsList");

chrome.storage.local.get("access_token", async ({ access_token }) => {
  if (!access_token) window.location.replace("./popup-sign-in.html");
  const user = await fetch("https://discordapp.com/api/users/@me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((data) => data.json());
  const channels = await fetch("http://3.122.116.236:4000/text-channels").then(
    (data) => data.json()
  );
  channels.forEach((channel) => {
    const listItem = document.createElement("li");
    listItem.textContent = channel.name;
    listItem.setAttribute("channelid", channel.id);
    listItem.addEventListener("click", (e) => {
      chrome.storage.local.get("channelid", ({ channelid }) => {
        if (channelid != channel.id) {
          chrome.storage.local.set({ channelid: channel.id }, () => {
            const oldListItem = document.querySelector(".chosen");
            if (oldListItem) oldListItem.classList.remove("chosen");
            listItem.classList.add("chosen");
          });
        }
      });
    });
    channelsList.appendChild(listItem);
  });
  const img = document.createElement("img");
  const username = document.createElement("h3");
  const email = document.createElement("h3");
  username.textContent = user.username + "#" + user.discriminator;
  email.textContent = user.email;
  img.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=128`;
  profile.appendChild(img);
  profile.appendChild(username);
  profile.appendChild(email);
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
