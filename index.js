const MENTION_SELECTION_MENU_ID = "MENTION_SELECTION";
const MENTION_SITE_MENU_ID = "MENTION_SITE";
const MENTION_VIDEO_MENU_ID = "MENTION_VIDEO";
function getword(info, tab) {
  console.log(info);
  let data;
  if (info.menuItemId === MENTION_SELECTION_MENU_ID) {
    data = info.selectionText;
  } else if (info.menuItemId === MENTION_SITE_MENU_ID) {
    data = info.pageUrl;
  } else if (info.menuItemId === MENTION_VIDEO_MENU_ID) {
    data = info.pageUrl;
  } else return;

  fetch("http://localhost:4000/mention", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: data }),
  }).catch(console.log);
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
