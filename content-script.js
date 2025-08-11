let projects = [];

chrome.runtime.sendMessage({ type: 'getProjects' }, response => {
  if (response && response.projects) {
    projects = response.projects;
    buildProjectList();
    observeSidebar();
  }
});

function buildProjectList() {
  const dataList = document.createElement('datalist');
  dataList.id = 'clockify-projects';
  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p.name;
    option.dataset.id = p.id;
    dataList.appendChild(option);
  });
  document.body.appendChild(dataList);
}

function parseDuration(str) {
  const match = str.trim().match(/(?:(\d+)h)?\s*(?:(\d+)m)?/i);
  if (!match) return null;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 3600 + minutes * 60;
}

function observeSidebar() {
  const addInputs = sidebar => {
    if (sidebar.querySelector('.clockify-time-input')) return;
    const timeInput = document.createElement('input');
    timeInput.placeholder = 'Time (e.g., 30m)';
    timeInput.className = 'clockify-time-input';

    const projectInput = document.createElement('input');
    projectInput.setAttribute('list', 'clockify-projects');
    projectInput.placeholder = 'Clockify project';
    projectInput.className = 'clockify-project-input';

    const btn = document.createElement('button');
    btn.textContent = 'Log';
    btn.className = 'clockify-log-btn';

    const wrapper = document.createElement('div');
    wrapper.className = 'clockify-controls';
    wrapper.appendChild(timeInput);
    wrapper.appendChild(projectInput);
    wrapper.appendChild(btn);

    const getDescription = () => {
      const titleEl = document.querySelector('[data-testid="task-view-title"]');
      if (titleEl) {
        return titleEl.value?.trim() || titleEl.textContent.trim();
      }
      const clone = sidebar.cloneNode(true);
      clone.querySelector('.clockify-time-input')?.remove();
      clone.querySelector('.clockify-project-input')?.remove();
      clone.querySelector('.clockify-log-btn')?.remove();
      return clone.textContent.trim();
    };

    btn.addEventListener('click', () => {
      const projectName = projectInput.value;
      const option = Array.from(document.querySelectorAll('#clockify-projects option')).find(o => o.value === projectName);
      const projectId = option ? option.dataset.id : null;
      const duration = parseDuration(timeInput.value);
      const description = getDescription();
      if (!projectId || !duration) return;
      chrome.runtime.sendMessage(
        { type: 'logTime', description, duration, projectId },
        res => {
          if (res && res.error) {
            console.error(res.error);
          } else {
            timeInput.value = '';
            projectInput.value = '';
          }
        }
      );
    });

    const target = sidebar.querySelector(':scope > div:last-child') || sidebar;
    target.appendChild(wrapper);
  };

  document
    .querySelectorAll('[data-testid="task-details-sidebar"] > div')
    .forEach(addInputs);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.matches('[data-testid="task-details-sidebar"] > div')
        ) {
          addInputs(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node
            .querySelectorAll('[data-testid="task-details-sidebar"] > div')
            .forEach(addInputs);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
