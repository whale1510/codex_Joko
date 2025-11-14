const resolveWithRoot = (basePath, relativePath) => {
  if (!relativePath) {
    return relativePath;
  }

  if (
    relativePath.startsWith('#') ||
    relativePath.startsWith('mailto:') ||
    relativePath.startsWith('tel:') ||
    /^(?:[a-z]+:)?\/\//i.test(relativePath)
  ) {
    return relativePath;
  }

  const sanitizedBase = !basePath || basePath === '.' ? '' : basePath.replace(/\/+$/, '');

  if (!sanitizedBase) {
    return relativePath;
  }

  if (relativePath.startsWith('./') || relativePath.startsWith('../')) {
    return `${sanitizedBase}/${relativePath}`;
  }

  return `${sanitizedBase}/${relativePath}`;
};

document.addEventListener('DOMContentLoaded', () => {
  const includeTargets = document.querySelectorAll('[data-include]');

  includeTargets.forEach((target) => {
    const includePath = target.getAttribute('data-include');
    if (!includePath) {
      return;
    }

    const rootPath = target.getAttribute('data-root-path') || document.body.dataset.rootPath || '.';

    fetch(includePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load include: ${includePath}`);
        }
        return response.text();
      })
      .then((html) => {
        target.innerHTML = html;

        const scopedRootElements = target.querySelectorAll('[data-root-href], [data-root-src]');

        scopedRootElements.forEach((element) => {
          if (element.hasAttribute('data-root-href')) {
            const desiredHref = element.getAttribute('data-root-href');
            const resolvedHref = resolveWithRoot(rootPath, desiredHref);
            if (resolvedHref) {
              element.setAttribute('href', resolvedHref);
            }
          }

          if (element.hasAttribute('data-root-src')) {
            const desiredSrc = element.getAttribute('data-root-src');
            const resolvedSrc = resolveWithRoot(rootPath, desiredSrc);
            if (resolvedSrc) {
              element.setAttribute('src', resolvedSrc);
            }
          }
        });
      })
      .catch((error) => {
        console.error(error);
        target.innerHTML = '<!-- include를 불러오지 못했습니다. -->';
      });
  });
});
