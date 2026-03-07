export function assertOwnership(resourceUserId: string, sessionUserId: string) {
  if (resourceUserId !== sessionUserId) {
    throw new Error("Forbidden");
  }
}
