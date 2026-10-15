export const BASE_PATH = '/zenobia-v2';

export function assetPath(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? `${BASE_PATH}${path}` : path;
}
