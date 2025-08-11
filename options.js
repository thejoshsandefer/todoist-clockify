function save() {
  const apiKey = document.getElementById('apiKey').value;
  const workspaceId = document.getElementById('workspaceId').value;
  chrome.storage.sync.set({ apiKey, workspaceId }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Saved!';
    setTimeout(() => (status.textContent = ''), 2000);
  });
}

function restore() {
  chrome.storage.sync.get(['apiKey', 'workspaceId'], data => {
    document.getElementById('apiKey').value = data.apiKey || '';
    document.getElementById('workspaceId').value = data.workspaceId || '';
  });
}

document.getElementById('save').addEventListener('click', save);
document.addEventListener('DOMContentLoaded', restore);
