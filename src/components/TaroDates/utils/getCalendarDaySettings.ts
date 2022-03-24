import getPhrase from './getPhrase';
import { BLOCKED_MODIFIER } from './constants';

function isSelected(modifiers) {
  return (modifiers && modifiers.has('selected'))
  || (modifiers && modifiers.has('selected-span'))
  || (modifiers && modifiers.has('selected-start'))
  || (modifiers && modifiers.has('selected-end'));
}

function shouldUseDefaultCursor(modifiers) {
  return (modifiers && modifiers.has('blocked-minimum-nights'))
  || (modifiers && modifiers.has('blocked-calendar'))
  || (modifiers && modifiers.has('blocked-out-of-range'));
}

function isHoveredSpan(modifiers) {
  if (isSelected(modifiers)) return false;
  return (modifiers && modifiers.has('hovered-span')) || (modifiers && modifiers.has('after-hovered-start'));
}

function getAriaLabel(phrases, modifiers, day, ariaLabelFormat) {
  const {
    chooseAvailableDate,
    dateIsUnavailable,
    dateIsSelected,
    dateIsSelectedAsStartDate,
    dateIsSelectedAsEndDate,
  } = phrases;

  const formattedDate = {
    date: day && day.format(ariaLabelFormat),
  };

  if (modifiers && modifiers.has('selected-start') && dateIsSelectedAsStartDate) {
    return getPhrase(dateIsSelectedAsStartDate, formattedDate);
  } if (modifiers && modifiers.has('selected-end') && dateIsSelectedAsEndDate) {
    return getPhrase(dateIsSelectedAsEndDate, formattedDate);
  } if (isSelected(modifiers) && dateIsSelected) {
    return getPhrase(dateIsSelected, formattedDate);
  } if (modifiers && modifiers.has(BLOCKED_MODIFIER)) {
    return getPhrase(dateIsUnavailable, formattedDate);
  }

  return getPhrase(chooseAvailableDate, formattedDate);
}

export default function getCalendarDaySettings(day, ariaLabelFormat, daySize, modifiers, phrases) {

  return {
    ariaLabel: getAriaLabel(phrases, modifiers, day, ariaLabelFormat),
    hoveredSpan: isHoveredSpan(modifiers),
    isOutsideRange: modifiers && modifiers.has('blocked-out-of-range'),
    selected: modifiers && isSelected(modifiers),
    useDefaultCursor: modifiers && shouldUseDefaultCursor(modifiers),
    isReserveDay: modifiers && modifiers.has('reserve-day'),
    daySizeStyles: {
      width: daySize,
      height: daySize - 1,
    },
  };
}
