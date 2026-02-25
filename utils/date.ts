export function getStaleTimeUntilEndOfDay() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return endOfDay.getTime() - now.getTime();
}
