import dayjs from 'dayjs';

import { DISPLAY_FORMAT, ISO_FORMAT } from './constants';

export default function toDayjsObject(dateString, customFormat) {
  const dateFormats: any = customFormat
    ? [customFormat, DISPLAY_FORMAT, ISO_FORMAT]
    : [DISPLAY_FORMAT, ISO_FORMAT];

  const date = dayjs(dateString, dateFormats, true);
  return date.isValid() ? date.hour(12) : null;
}
