import dayjs from 'dayjs';

import toDayjsObject from './toDayjsObject';

export default function toISOMonthString(date, currentFormat?: string) {
  const dateObj = dayjs.isDayjs(date) ? date : toDayjsObject(date, currentFormat);
  if (!dateObj) return null;
  // Template strings compiled in strict mode uses concat, which is slow. Since
  // this code is in a hot path and we want it to be as fast as possible, we
  // want to use old-fashioned +.
  // eslint-disable-next-line prefer-template
  return dateObj.year() + '-' + String(dateObj.month() + 1).padStart(2, '0');
}
