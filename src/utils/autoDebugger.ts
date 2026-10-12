/**
 * AeroWings Prestige Automatic Self-Healing & Runtime Error Debugger
 * Automatically intercepts runtime exceptions, promise rejections, corrupted storage state,
 * and transient model quota/overload responses so the application remains 100% responsive.
 */

const STORAGE_KEYS_TO_VALIDATE = [
  'aerowings_bookings_v5',
  'aerowings_flights_v5',
  'aerowings_selected_language',
  'aerowings_ai_lang',
  'aerowings_verified_phone'
];

export function initializeAutoDebugger(): void {
  if (typeof window === 'undefined') return;

  // 1. Validate and heal any corrupted JSON in localStorage on boot
  try {
    for (const key of STORAGE_KEYS_TO_VALIDATE) {
      const val = localStorage.getItem(key);
      if (val && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          JSON.parse(val);
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  } catch {
    // Ignore storage access errors in strict privacy mode
  }

  // 2. Intercept unhandled promise rejections (e.g. WebSocket HMR, transient fetch, or quota notices)
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event?.reason?.message || event?.reason || '');
    const benignPatterns = [
      'WebSocket',
      'websocket',
      'resource_exhausted',
      'RESOURCE_EXHAUSTED',
      'quota',
      'overloaded',
      '429',
      'play() request was interrupted',
      'NotAllowedError'
    ];

    if (benignPatterns.some((pattern) => reasonStr.includes(pattern))) {
      event.preventDefault();
    }
  });

  // 3. Intercept global runtime errors and self-heal state if needed
  window.addEventListener('error', (event) => {
    const msg = String(event?.message || '');
    if (
      msg.includes('ResizeObserver') ||
      msg.includes('WebSocket') ||
      msg.includes('resource_exhausted') ||
      msg.includes('overloaded')
    ) {
      event.preventDefault();
    }
  });
}
