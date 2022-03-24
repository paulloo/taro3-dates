import dayjs from 'dayjs';

import isBeforeDay from './isBeforeDay';
import isSameDay from './isSameDay';

export default function isAfterDay(a, b) {
  if (!dayjs.isDayjs(a) || !dayjs.isDayjs(b)) return false;
  return !isBeforeDay(a, b) && !isSameDay(a, b);
}
