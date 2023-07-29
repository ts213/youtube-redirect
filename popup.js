let defaultInstanceUrl;
let currentInstanceUrl;

sendMessage({ type: 'popupInit' })
  .then(msgResponse => {
    ({ defaultInstanceUrl, currentInstanceUrl, isEnabled } = msgResponse);

    updateInstanceUrl({ url: currentInstanceUrl });

    if (isEnabled === false) {
      document.getElementById('is-enabled-checkbox').checked = false;
    }
  });

document.getElementById('change-instance-btn').addEventListener('click', toggleInputVisible);
document.getElementById('is-enabled-checkbox').addEventListener('click', toggleEnabled);
document.getElementById('instance-save-btn').addEventListener('click', instanceSave);
document.getElementById('instance-reset-btn').addEventListener('click', instanceReset);

async function instanceSave() {
  const url = validateUrl();
  toggleInputVisible();
  await updateInstanceUrl({ saveKey: true, url: url });
  sendMessage({ type: 'urlChanged' });
}

async function instanceReset() {
  toggleInputVisible();
  await updateInstanceUrl({ url: defaultInstanceUrl });
  await storage_removeUrl();
  sendMessage({ type: 'urlChanged' });
}

async function toggleEnabled(ev) {
  await storage_setUrl('isEnabled', ev.target.checked);
  sendMessage({ type: 'checkboxToggled', isChecked: ev.target.checked });
}

function toggleInputVisible() {
  document.getElementById('change-instance-wrap').toggleAttribute('hidden');
}

function sendMessage({ type, isChecked = undefined }) {
  if (type === 'popupInit') {
    return browser.runtime.sendMessage({ type: 'popupInit' });
  } else {
    browser.runtime.sendMessage({
      type,
      'isChecked': isChecked
    });
  }
}

async function updateInstanceUrl({ url, saveKey }) {
  if (saveKey) {
    await storage_setUrl('url', url);
  }
  updateUI(url);
}

function updateUI(url) {
  document.getElementById('redirect-instance').innerText = url;
  document.getElementById('instance-input').placeholder = url;
}

function storage_setUrl(key, value) {
  return browser.storage.local.set({
    [key]: value
  })
}

function storage_removeUrl() {
  return browser.storage.local.remove('url');
}

function validateUrl() {
  // add proper url validation? todo
  const input = document.getElementById('instance-input');
  let url = input.value;
  url = url.trim();
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  if (
    !url.match(/https*:\/\//) ||
    !url.length
  ) {
    document.getElementById('error').innerText = 'Invalid url.\nNo "http(s)://..."?';
    throw new Error('Invalid url');
  }
  setTimeout(() => input.value = '', 100);
  return url;
}
