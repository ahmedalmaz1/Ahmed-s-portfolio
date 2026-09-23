/** Joins truthy class name fragments. `cx('a', false && 'b', 'c')` -> 'a c' */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}
