import dayjs from 'dayjs';

export default function isSameDay(a, b) {
  if (!dayjs.isDayjs(a) || !dayjs.isDayjs(b)) return false;
  // Compare least significant, most likely to change units first
  // dayjs's isSame clones dayjs inputs and is a tad slow
  return a.date() === b.date()
    && a.month() === b.month()
    && a.year() === b.year();
}
