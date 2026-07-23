#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_CMS_URL = "https://bam-cms-auth.bammediaauth.workers.dev/content/site.json";
const CMS_URL = process.env.CMS_CONTENT_URL || DEFAULT_CMS_URL;
const INDEX_PATH = process.env.INDEX_PATH || "index.html";
const CONTENT_PATH = process.env.CONTENT_PATH || "content/site.json";

const getValue = (source, path) =>
  path.split(".").reduce((value, key) => {
    if (value == null) {
      return undefined;
    }

    return Array.isArray(value) ? value[Number(key)] : value[key];
  }, source);

const getString = (source, path) => {
  const value = getValue(source, path);

  return typeof value === "string" && value.trim() ? value.trim() : "";
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const escapeAttribute = (value) =>
  escapeHtml(value)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const escapeCssUrl = (value) => value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");

const setAttribute = (tag, attribute, value) => {
  if (!value) {
    return tag;
  }

  const escaped = escapeAttribute(value);
  const attributePattern = new RegExp(`(\\s)${attribute}="[^"]*"`);

  if (attributePattern.test(tag)) {
    return tag.replace(attributePattern, `$1${attribute}="${escaped}"`);
  }

  return tag.replace(/>$/, ` ${attribute}="${escaped}">`);
};

const setStyleProperty = (tag, property, value) => {
  if (!value) {
    return tag;
  }

  const declaration = property === "--loop-image" ? `${property}: url(${escapeCssUrl(value)})` : `${property}: ${value}`;
  const styleMatch = tag.match(/\bstyle="([^"]*)"/);

  if (!styleMatch) {
    return tag.replace(/>$/, ` style="${escapeAttribute(`${declaration};`)}">`);
  }

  const currentStyle = styleMatch[1];
  const propertyPattern = new RegExp(`${property}\\s*:\\s*[^;]+;?`);
  const nextStyle = propertyPattern.test(currentStyle)
    ? currentStyle.replace(propertyPattern, `${declaration};`)
    : `${currentStyle.trim().replace(/;?$/, ";")} ${declaration};`.trim();

  return tag.replace(/\bstyle="[^"]*"/, `style="${escapeAttribute(nextStyle)}"`);
};

const formatTextContent = (inner, value) => {
  const escaped = escapeHtml(value);

  if (!inner.includes("\n")) {
    return escaped;
  }

  const closeIndent = inner.match(/\n([ \t]*)$/)?.[1] || "";
  const textIndent = `${closeIndent}  `;

  return `\n${textIndent}${escaped}\n${closeIndent}`;
};

const syncSeo = (html, content) => {
  const title = getString(content, "seo.title");
  const description = getString(content, "seo.description");
  let nextHtml = html;

  if (title) {
    const escapedTitle = escapeHtml(title);
    nextHtml = nextHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`)
      .replace(/<meta([^>]*(?:property|name)="(?:og:title|twitter:title)"[^>]*)>/gi, (tag) =>
        setAttribute(tag, "content", title),
      );
  }

  if (description) {
    nextHtml = nextHtml.replace(
      /<meta([^>]*(?:name|property)="(?:description|og:description|twitter:description)"[^>]*)>/gi,
      (tag) => setAttribute(tag, "content", description),
    );
  }

  return nextHtml;
};

const syncTextNodes = (html, content) =>
  html.replace(
    /(<([a-zA-Z][\w:-]*)\b(?=[^>]*\bdata-content="([^"]+)")[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (match, openTag, tagName, path, inner, closeTag) => {
      const value = getString(content, path);

      if (!value) {
        return match;
      }

      return `${openTag}${formatTextContent(inner, value)}${closeTag}`;
    },
  );

const syncOpeningTags = (html, content) =>
  html.replace(/<([a-zA-Z][\w:-]*)\b[^>]*>/g, (tag) => {
    let nextTag = tag;

    const hrefPath = tag.match(/\bdata-href="([^"]+)"/)?.[1];
    let ariaLabelPath = tag.match(/\bdata-aria-label="([^"]+)"/)?.[1];
    const srcPath = tag.match(/\bdata-src="([^"]+)"/)?.[1];
    const posterPath = tag.match(/\bdata-poster="([^"]+)"/)?.[1];
    const videoSrcPath = tag.match(/\bdata-video-src="([^"]+)"/)?.[1];
    const bgImagePath = tag.match(/\bdata-bg-image="([^"]+)"/)?.[1];
    const bgPositionPath = tag.match(/\bdata-bg-position="([^"]+)"/)?.[1];
    const socialNetwork = tag.match(/\bdata-social="([^"]+)"/)?.[1];

    if (bgImagePath || bgPositionPath) {
      nextTag = nextTag.replace(/\sstyle="[^"]*"/, "");
    }

    if (hrefPath) {
      nextTag = setAttribute(nextTag, "href", getString(content, hrefPath));
    }

    if (ariaLabelPath && !getString(content, ariaLabelPath) && hrefPath?.endsWith(".url")) {
      const inferredAriaLabelPath = hrefPath.replace(/\.url$/, ".ariaLabel");

      if (getString(content, inferredAriaLabelPath)) {
        ariaLabelPath = inferredAriaLabelPath;
        nextTag = setAttribute(nextTag, "data-aria-label", ariaLabelPath);
      }
    }

    if (ariaLabelPath) {
      nextTag = setAttribute(nextTag, "aria-label", getString(content, ariaLabelPath));
    }

    if (videoSrcPath) {
      nextTag = setAttribute(nextTag, "data-src", getString(content, videoSrcPath));
    } else if (srcPath) {
      nextTag = setAttribute(nextTag, "src", getString(content, srcPath));
    }

    if (posterPath) {
      nextTag = setAttribute(nextTag, "poster", getString(content, posterPath));
    }

    if (bgImagePath) {
      nextTag = setStyleProperty(nextTag, "--loop-image", getString(content, bgImagePath));
    }

    if (bgPositionPath) {
      nextTag = setStyleProperty(nextTag, "--loop-position", getString(content, bgPositionPath));
    }

    if (/\sdata-contact-email(?:[\s=>])/.test(tag)) {
      const email = getString(content, "contact.email");

      if (email) {
        nextTag = setAttribute(nextTag, "href", `mailto:${email}`);
      }
    }

    if (socialNetwork) {
      nextTag = setAttribute(nextTag, "href", getString(content, `social.${socialNetwork}`));
    }

    return nextTag;
  });

const syncContactLabels = (html, content) => {
  const email = getString(content, "contact.email");

  if (!email) {
    return html;
  }

  return html.replace(
    /(<([a-zA-Z][\w:-]*)\b(?=[^>]*\bdata-contact-email-label\b)[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (match, openTag, tagName, inner, closeTag) =>
      `${openTag.replace(/\shref="[^"]*"/, "")}${formatTextContent(inner, email)}${closeTag}`,
  );
};

const fetchContent = async () => {
  const response = await fetch(`${CMS_URL}${CMS_URL.includes("?") ? "&" : "?"}sync=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`CMS request failed: ${response.status} ${response.statusText}`);
  }

  const content = await response.json();

  if (!content || typeof content !== "object" || !content.hero || !content.clients) {
    throw new Error("CMS response did not look like BAM site content.");
  }

  return content;
};

const main = async () => {
  const content = await fetchContent();
  const currentHtml = await readFile(INDEX_PATH, "utf8");
  const syncedHtml = syncContactLabels(syncOpeningTags(syncTextNodes(syncSeo(currentHtml, content), content), content), content);

  await writeFile(CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`);
  await writeFile(INDEX_PATH, syncedHtml);

  console.log(`Synced ${CONTENT_PATH} and ${INDEX_PATH} from ${CMS_URL}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
