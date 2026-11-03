/**
 * Inline SVG icons for high-deliverability HTML emails.
 * These replace raw Unicode emojis with crisp, professional vector clinic icons.
 */

function svg(paths: string, color = "#7A2E7A", size = 15, style = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -2px; margin-right: 4px; ${style}">${paths}</svg>`;
}

export const emailIcons = {
  calendar: (color = "#7A2E7A", size = 15) =>
    svg('<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>', color, size),

  clock: (color = "#7A2E7A", size = 15) =>
    svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', color, size),

  video: (color = "#0284C7", size = 15) =>
    svg('<polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/>', color, size),

  hospital: (color = "#7A2E7A", size = 15) =>
    svg('<path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>', color, size),

  pill: (color = "#7A2E7A", size = 15) =>
    svg('<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>', color, size),

  fileText: (color = "#7A2E7A", size = 15) =>
    svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>', color, size),

  shieldCheck: (color = "#16A34A", size = 15) =>
    svg('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>', color, size),

  lock: (color = "#16A34A", size = 15) =>
    svg('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', color, size),

  phone: (color = "#7A2E7A", size = 15) =>
    svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', color, size),

  mail: (color = "#7A2E7A", size = 15) =>
    svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>', color, size),

  checkCircle: (color = "#16A34A", size = 15) =>
    svg('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', color, size),

  truck: (color = "#16A34A", size = 15) =>
    svg('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18.5" r="2.5"/><circle cx="7" cy="18.5" r="2.5"/>', color, size),

  mapPin: (color = "#7A2E7A", size = 15) =>
    svg('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', color, size),

  stethoscope: (color = "#7A2E7A", size = 15) =>
    svg('<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>', color, size),

  activity: (color = "#7A2E7A", size = 15) =>
    svg('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', color, size),

  user: (color = "#7A2E7A", size = 15) =>
    svg('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>', color, size),
};

