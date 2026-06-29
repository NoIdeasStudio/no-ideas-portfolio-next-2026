export function isStudioPath(pathname: string) {
  return pathname === '/studio' || pathname.startsWith('/studio/')
}
