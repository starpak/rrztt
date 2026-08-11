// 读取历史依据.json文件并生成更新日志HTML
function loadChangelog(container) {
  fetch('assets/历史依据.json')
    .then(response => response.json())
    .then(data => {
      // 按版本代号排序
      const sortedVersions = data.versionHistory.sort((a, b) => {
        const versionA = a.version.replace('v', '').split('.').map(Number);
        const versionB = b.version.replace('v', '').split('.').map(Number);

        for (let i = 0; i < Math.min(versionA.length, versionB.length); i++) {
          if (versionA[i] !== versionB[i]) {
            return versionA[i] - versionB[i];
          }
        }
        return versionB.length - versionA.length;
      });

      // 生成HTML
      let html = '';

      sortedVersions.forEach((version, index) => {
        const isFirst = index === 0;
        const isLatest = index === 0;
        const showDivider = index > 0 && !isFirst;

        html += `
          <div class="card" style="animation: fadeInUp 0.3s ease-out;">
            <div class="flex items-center gap-3 mb-6">
              <span class="tag text-base">${version.version}</span>
              ${isLatest ? '<span class="tag" style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">最新</span>' : ''}
            </div>
            <ul class="space-y-3">
        `;

        version.content.forEach(item => {
          html += `
            <li class="flex items-start gap-3" style="color: var(--color-text-secondary);">
              <svg class="mt-1 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${item}</span>
            </li>
          `;
        });

        html += `</ul></div>`;

        if (showDivider) {
          html += `<hr style="border: 0; border-top: 1px solid var(--color-border);">`;
        }
      });

      container.innerHTML = html;
    })
    .catch(error => {
      console.error('加载历史依据.json失败:', error);
      container.innerHTML = `
        <div class="text-center py-12">
          <div style="font-size: 60px;">⚠️</div>
          <p class="mt-4 text-text-tertiary">加载失败，请稍后再试</p>
        </div>
      `;
    });
}

// 如果在页面加载时直接执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('changelog-container');
    if (container) {
      loadChangelog(container);
    }
  });
} else {
  const container = document.getElementById('changelog-container');
  if (container) {
    loadChangelog(container);
  }
}
