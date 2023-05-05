function redirect(requestDetails) {
  const url = new URL(requestDetails.url);
  const pathname = url.pathname;
  const searchStr = url.search;
  return { redirectUrl: 'https://piped.video' + pathname + searchStr };
}

function redirectListener() {
  browser.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ['*://www.youtube.com/', '*://www.youtube.com/watch*', '*://www.youtube.com/c*'] },
    ['blocking']
  );
}

redirectListener();
let isEnabled = true;

browser.browserAction.onClicked.addListener(() => {
  if (isEnabled) {
    browser.webRequest.onBeforeRequest.removeListener(redirect);
    browser.browserAction.setIcon({
      path: 'icon2.jpeg',
    });

  } else {
    redirectListener();
    browser.browserAction.setIcon({
      path: 'icon.jpeg',
    });
  }

  isEnabled = !isEnabled;
});
