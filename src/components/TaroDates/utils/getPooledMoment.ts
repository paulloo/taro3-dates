import dayjs from 'dayjs';

const momentPool = new Map();
export default function getPooledMoment(dayString) {
  if (!momentPool.has(dayString)) {
    momentPool.set(dayString, dayjs(dayString));
  }

  return momentPool.get(dayString);
}
