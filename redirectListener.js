'use strict';

const defaultInstanceUrl = 'https://piped.video';
let currentInstanceUrl;
let isEnabled;

browser.storage.local.get(['url', 'isEnabled']).then(
  ({ url, isEnabled: _isEnabled }) => {
    currentInstanceUrl = url || defaultInstanceUrl;

    isEnabled = _isEnabled;
    isEnabled === false
      ? toggleIconDisabled()
      : redirectListener();
  }
);

// return a Promise only for the messages the listener is meant to respond to — and otherwise return false or undefined
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    if (msg.type === 'popupInit') {
      return Promise.resolve({
        defaultInstanceUrl,
        currentInstanceUrl,
        isEnabled,
      });
    }

    // use storage.onChange event?
    else if (msg.type === 'urlChanged') {
      setCurrentInstanceUrl();
    }
    else if (msg.type === 'checkboxToggled') {
      toggleListener(msg.isChecked);
      isEnabled = msg.isChecked;
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

function redirect(requestDetails) {
  const { pathname, search } = new URL(requestDetails.url);
  return { redirectUrl: currentInstanceUrl + pathname + search };
}

function redirectListener() {
  browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {
      urls: [
        '*://*.youtube.com/',
        '*://*.youtube.com/watch*',
        '*://*.youtube.com/c*'
      ]
    },
    ['blocking']
  );
}

function toggleListener(isChecked) {
  isChecked
    ? startListener()
    : stopListener();
}

function setCurrentInstanceUrl() {
  browser.storage.local.get('url').then(obj =>
    currentInstanceUrl = obj.url || defaultInstanceUrl
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
