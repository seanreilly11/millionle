import { getUuid } from "../store/identity";

function getDevice(): Record<string, unknown> {
  const nav = navigator as Navigator & {
    userAgentData?: { mobile: boolean; platform: string };
    connection?: { effectiveType?: string };
  };

  return {
    ua: nav.userAgent,
    mobile: nav.userAgentData?.mobile ?? nav.maxTouchPoints > 0,
    platform: nav.userAgentData?.platform ?? nav.platform,
    language: nav.language,
    connection: nav.connection?.effectiveType ?? null,
  };
}

export function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
): void {
  fetch("/api/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uuid: getUuid(),
      offset: -new Date().getTimezoneOffset(),
      event,
      properties: { ...properties, device: getDevice() },
    }),
  }).catch(() => {});
}
