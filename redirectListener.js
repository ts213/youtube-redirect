const defaultInstanceUrl = 'https://piped.video';
let currentInstanceUrl;
let isEnabled;

browser.storage.local.get(['url', 'isEnabled']).then(({ url, isEnabled: _isEnabled }) => {
  currentInstanceUrl = url || defaultInstanceUrl;

  isEnabled = _isEnabled;
  isEnabled === false
    ? toggleIconDisabled()
    : redirectListener();
});

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    switch (msg.type) {
      case 'popupInit':
        return Promise.resolve({
          defaultInstanceUrl,
          currentInstanceUrl,
          isEnabled,
        });
      // use storage.onChange event?
      case 'urlChanged':
        setCurrentInstanceUrl();
        break;
      case 'checkboxToggled':
        toggleListener(msg.isChecked);
        isEnabled = msg.isChecked;
        break;
      default:
        return false;
    }
  }
);

function startListener() {
  redirectListener();
  toggleIconEnabled();
}

function stopListener() {
  browser.webRequest.onBeforeRequest.removeListener(redirect);
  toggleIconDisabled();
}

function toggleListener(isChecked) {
  isChecked
    ? startListener()
    : stopListener();
}

function setCurrentInstanceUrl() {
  browser.storage.local.get('url').then(obj => {
      console.log(obj);
      currentInstanceUrl = obj.url || defaultInstanceUrl
    }
  );
}

function redirect(requestDetails) {
  const { pathname, search } = new URL(requestDetails.url);
  return { redirectUrl: currentInstanceUrl + pathname + search };
}

function redirectListener() {
  browser.webRequest.onBeforeRequest.addListener(
    redirect,
    { urls: ['*://www.youtube.com/', '*://www.youtube.com/watch*', '*://www.youtube.com/c*'] },
    ['blocking']
  );
}

function toggleIconEnabled() {
  browser.browserAction.setIcon({
    path: 'icon.jpeg',
  });
}

function toggleIconDisabled() {
  browser.browserAction.setIcon({
    path: 'icon2.jpeg',
  });
}
