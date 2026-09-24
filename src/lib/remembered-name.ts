export function rememberedNameCookieKey() {
  return "meeting_time_picker_name";
}

export function rememberedNameCookiePath() {
  return "/poll";
}

export function parseRememberedName(value: string | undefined): string | null {
  if (!value) return null;
  const name = value.trim();
  return name.length > 0 && name.length <= 120 ? name : null;
}
