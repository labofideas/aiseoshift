// Detached template contents never execute scripts or load embedded resources.
export function parseHtml(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}
