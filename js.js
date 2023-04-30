function redirect(requestDetails) {
    const url = new URL(requestDetails.url);
    const pathname = url.pathname;
    const searchStr = url.search;
    return { redirectUrl: 'https://piped.video' + pathname + searchStr};
}

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["*://www.youtube.com/", "*://www.youtube.com/watch*", "*://www.youtube.com/c*"]},
    ["blocking"]
);
