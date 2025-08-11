async function getStored(key) {
  return new Promise(resolve => chrome.storage.sync.get(key, data => resolve(data[key])));
}

async function fetchProjects() {
  const apiKey = await getStored('apiKey');
  const workspaceId = await getStored('workspaceId');
  if (!apiKey || !workspaceId) return [];
  const res = await fetch(`https://api.clockify.me/api/v1/workspaces/${workspaceId}/projects`, {
    headers: { 'X-Api-Key': apiKey }
  });
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

async function logTime(description, duration, projectId) {
  const apiKey = await getStored('apiKey');
  const workspaceId = await getStored('workspaceId');
  if (!apiKey || !workspaceId) throw new Error('Missing API key or workspace ID');
  const start = new Date();
  const end = new Date(start.getTime() + duration * 1000);
  const res = await fetch(`https://api.clockify.me/api/v1/workspaces/${workspaceId}/time-entries`, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description,
      projectId,
      start: start.toISOString(),
      end: end.toISOString()
    })
  });
  if (!res.ok) throw new Error('Failed to create time entry');
  return res.json();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'getProjects') {
    fetchProjects()
      .then(projects => sendResponse({ projects }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  if (msg.type === 'logTime') {
    logTime(msg.description, msg.duration, msg.projectId)
      .then(entry => sendResponse({ entry }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});
