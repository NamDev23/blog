export function enhanceCodeBlocks(content: string) {
  return content.replace(
    /<pre([^>]*)>([\s\S]*?)<\/pre>/gi,
    (match, preAttributes: string, innerHtml: string) => {
      if (/data-code-terminal/i.test(preAttributes)) return match;

      const codeAttributes = innerHtml.match(/<code([^>]*)>/i)?.[1] || '';
      const title = getCodeBlockTitle(`${preAttributes} ${codeAttributes}`);

      return `<div class="code-terminal" data-code-terminal><div class="code-terminal__bar"><span class="code-terminal__dots" aria-hidden="true"><span></span><span></span><span></span></span><span class="code-terminal__label">${title}</span><button type="button" class="code-terminal__copy" data-code-copy-button aria-label="Copy code"><span aria-hidden="true"></span></button></div><pre${preAttributes}>${innerHtml}</pre></div>`;
    }
  );
}

export function createCodeCopyHandler() {
  return async (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest<HTMLButtonElement>('[data-code-copy-button]');
    if (!button) return;

    const block = button.closest('[data-code-terminal]');
    const code = block?.querySelector('code')?.textContent || '';
    if (!code.trim()) return;

    try {
      await copyText(code);
      button.dataset.copied = 'true';
      button.setAttribute('aria-label', 'Copied');

      window.setTimeout(() => {
        delete button.dataset.copied;
        button.setAttribute('aria-label', 'Copy code');
      }, 1600);
    } catch {
      button.dataset.copyFailed = 'true';
      button.setAttribute('aria-label', 'Copy failed');

      window.setTimeout(() => {
        delete button.dataset.copyFailed;
        button.setAttribute('aria-label', 'Copy code');
      }, 1600);
    }
  };
}

function getCodeBlockTitle(attributes: string) {
  const normalized = attributes.toLowerCase();
  if (/language-(bash|sh|shell|zsh|terminal|console)/.test(normalized)) return 'Terminal';
  if (/language-(yaml|yml)/.test(normalized)) return 'YAML';
  if (/language-dockerfile/.test(normalized)) return 'Dockerfile';
  if (/language-nginx/.test(normalized)) return 'Nginx';
  if (/language-(js|javascript|jsx)/.test(normalized)) return 'JavaScript';
  if (/language-(ts|typescript|tsx)/.test(normalized)) return 'TypeScript';
  if (/language-php/.test(normalized)) return 'PHP';
  if (/language-sql/.test(normalized)) return 'SQL';
  if (/language-css/.test(normalized)) return 'CSS';
  if (/language-html/.test(normalized)) return 'HTML';
  if (/language-(text|txt)/.test(normalized)) return 'Text';
  return 'Terminal';
}

async function copyText(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand('copy');
    if (!copied) throw new Error('Copy command failed');
  } finally {
    document.body.removeChild(textarea);
  }
}
