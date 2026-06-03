const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}

export function plainTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  if (looksLikeHtml(trimmed)) {
    return trimmed;
  }

  const blocks = trimmed.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length === 0) {
        return "";
      }
      if (lines.length === 1) {
        return `<p>${escapeHtml(lines[0])}</p>`;
      }
      return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
    })
    .filter(Boolean)
    .join("");
}

export function htmlToPlainText(html: string): string {
  if (!html.trim()) {
    return "";
  }

  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent ?? div.innerText ?? "").trim();
  }

  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeDescriptionForEditor(
  value: string | null | undefined,
): string {
  const raw = value?.trim() ?? "";
  if (!raw) {
    return "";
  }
  return plainTextToHtml(raw);
}

const EMPTY_EDITOR_HTML = new Set(["", "<p></p>", "<p><br></p>"]);

export function normalizeDescriptionForSave(
  html: string | null | undefined,
): string | undefined {
  const trimmed = html?.trim() ?? "";
  if (!trimmed || EMPTY_EDITOR_HTML.has(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
