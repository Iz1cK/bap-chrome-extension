const DISCORD_URI_ENDPOINT = "https://discord.com/api/oauth2/authorize";
const CLIENT_ID = encodeURIComponent("1029367755348115506");
const RESPONSE_TYPE = encodeURIComponent("token");
const EXTENSION_ID = chrome.runtime.id;
const REDIRECT_URI = encodeURIComponent(
  `https://${EXTENSION_ID}.chromiumapp.org/`
);
const SCOPE = encodeURIComponent("identify email");
const STATE = encodeURIComponent(
  "meet" + Math.random().toString(36).substring(2, 15)
);

const MENTION_SELECTION_MENU_ID = "MENTION_SELECTION";
const MENTION_SITE_MENU_ID = "MENTION_SITE";
const MENTION_VIDEO_MENU_ID = "MENTION_VIDEO";

// chrome.storage.local.get("access_token", async ({ access_token }) => {
//   if (!access_token) {
//     window.location.replace("./popup-sign-in.html");
//   }
// });

function getword(info, tab) {
  let data;
  if (info.menuItemId === MENTION_SELECTION_MENU_ID) {
    data = info.selectionText;
  } else if (info.menuItemId === MENTION_SITE_MENU_ID) {
    data = info.pageUrl;
  } else if (info.menuItemId === MENTION_VIDEO_MENU_ID) {
    data = info.pageUrl;
  } else return;

  chrome.storage.local.get("access_token", async ({ access_token }) => {
    const channelid = new Promise(function (resolve, reject) {
      chrome.storage.local.get("channelid", function ({ channelid }) {
        resolve(channelid);
      });
    });
    const user = await fetch("https://discordapp.com/api/users/@me", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }).then((data) => data.json());
    fetch("http://3.122.116.236:4000/mention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: data, user: user, channelid: channelid }),
    }).catch(console.log);
  });
}
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Mention Site on BAP",
    contexts: ["page"],
    id: MENTION_SITE_MENU_ID,
  });
  chrome.contextMenus.create({
    title: "Mention on BAP: %s",
    contexts: ["selection"],
    id: MENTION_SELECTION_MENU_ID,
  });
  chrome.contextMenus.create({
    title: "Mention Video on BAP: %s",
    contexts: ["video"],
    id: MENTION_VIDEO_MENU_ID,
  });
});
chrome.contextMenus.onClicked.addListener(getword);

function create_auth_endpoint() {
  let nonce = encodeURIComponent(
    Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  );

  let endpoint_url = `${DISCORD_URI_ENDPOINT}
?client_id=${CLIENT_ID}
&redirect_uri=${REDIRECT_URI}
&response_type=${RESPONSE_TYPE}
&scope=${SCOPE}
&nonce=${nonce}`;

  return endpoint_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "login") {
    chrome.identity.launchWebAuthFlow(
      {
        url: create_auth_endpoint(),
        interactive: true,
      },
      function (redirect_uri) {
        if (
          chrome.runtime.lastError ||
          redirect_uri.includes("access_denied")
        ) {
          console.log("Could not authenticate.");
          sendResponse("fail");
        } else {
          const token = redirect_uri.split("&")[1].split("=")[1];
          chrome.storage.local.set({ access_token: token }, () => {
            console.log("successfully logged in");
            sendResponse("success");
          });
        }
      }
    );
    return true;
  } else if (request.message === "logout") {
    chrome.storage.local.set({ access_token: "" }, () => {
      console.log("successfully logged out");
      sendResponse("success");
    });
  }
});
