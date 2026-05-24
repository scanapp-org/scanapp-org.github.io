/**
 * Helper function to create DOM elements with attributes and children.
 * Analogous to React.createElement but outputs native DOM.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  ...children: Array<HTMLElement | SVGElement | string | undefined | null | Array<HTMLElement | SVGElement>>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === "class" || key === "className") {
      el.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (key === "htmlFor") {
      el.setAttribute("for", value);
    } else if (typeof value === "boolean") {
      if (value) {
        el.setAttribute(key, "");
      } else {
        el.removeAttribute(key);
      }
    } else {
      el.setAttribute(key, String(value));
    }
  }
  
  const appendChild = (child: any) => {
    if (child === undefined || child === null) return;
    if (Array.isArray(child)) {
      child.forEach(appendChild);
    } else if (child instanceof HTMLElement || child instanceof SVGElement) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  };
  
  children.forEach(appendChild);
  return el;
}

/**
 * Helper to create SVG elements with attributes.
 */
export function s(
  tag: string,
  attrs: Record<string, any> = {},
  ...children: Array<SVGElement | HTMLElement | string | undefined | null | Array<SVGElement | HTMLElement>>
): SVGElement {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === "class" || key === "className") {
      el.setAttribute("class", value);
    } else {
      el.setAttribute(key, String(value));
    }
  }
  
  const appendChild = (child: any) => {
    if (child === undefined || child === null) return;
    if (Array.isArray(child)) {
      child.forEach(appendChild);
    } else if (child instanceof SVGElement || child instanceof HTMLElement) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  };
  
  children.forEach(appendChild);
  return el as SVGElement;
}
