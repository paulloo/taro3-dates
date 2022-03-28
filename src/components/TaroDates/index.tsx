import React from "react";
import Taro from "@tarojs/taro";
import { View, Text, ScrollView } from "@tarojs/components";
import PropTypes, { InferProps } from "prop-types";
import classnames from "classnames";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import isBetween from "dayjs/plugin/isBetween";
import __compact from "lodash/compact";
import __values from "lodash/values";
import { TaroDateProps, TaroDateState } from "../../../types/taro-dates";
import { addModifier, deleteModifier } from "./utils/modifiers";
import toISODateString from "./utils/toISODateString";
import getVisibleDays from "./utils/getVisibleDays";
import isSameDay from "./utils/isSameDay";
import toISOMonthString from "./utils/toISOMonthString";
import isInclusivelyAfterDay from "./utils/isInclusivelyAfterDay";
import isNextDay from "./utils/isNextDay";
import isAfterDay from "./utils/isAfterDay";
import isBeforeDay from "./utils/isBeforeDay";
import getSelectedDateOffset from "./utils/getSelectedDateOffset";
import getPooledMoment from "./utils/getPooledMoment";
import getNumberOfCalendarMonthWeeks from "./utils/getNumberOfCalendarMonthWeeks";
import { delayQuerySelector } from "./utils";
import Month from "./Month";

import {
  START_DATE,
  END_DATE,
  CYCLES,
  WEEKDAYS,
  // HORIZONTAL_ORIENTATION,
  VERTICAL_SCROLLABLE,
  // DAY_SIZE,
  // INFO_POSITION_BOTTOM
} from "./utils/constants";

// import { transformFromAst } from '@babel/core';
dayjs.locale("zh-cn");

const ENV = Taro.getEnv();

/**
 * 获取月份
 * @param initialMonth
 * @param numberOfMonths
 * @param withoutTransitionMonths
 */
function getMonths(initialMonth, numberOfMonths, withoutTransitionMonths) {
  let month = initialMonth.clone();
  if (!withoutTransitionMonths) month = month.subtract(1, "month");
  let months: any = [];

  for (let i = 0;i < (withoutTransitionMonths ? numberOfMonths : numberOfMonths + 2);i += 1) {
    months.push(month);
    month = month.clone().add(1, "month");
  }

  return months;
}
const getChooseAvailableDatePhrase = (phrases, focusedInput) => {
  if (!phrases) return;
  if (focusedInput === START_DATE) {
    return phrases.chooseAvailableStartDate;
  }
  if (focusedInput === END_DATE) {
    return phrases.chooseAvailableEndDate;
  }
  return phrases.chooseAvailableDate;
};
export default class TaroDates extends React.PureComponent<
  TaroDateProps,
  TaroDateState
> {


  public static propTypes: InferProps<TaroDateProps>;
  public static defaultProps: TaroDateProps;
  constructor(props: TaroDateProps) {
    super(props);

    dayjs.extend(isBetween);
    this.today = dayjs();

    this.modifiers = {
      today: (day) => this.isToday(day),
      blocked: (day) => this.isBlocked(day),
      "blocked-calendar": (day) => props.isDayBlocked(day),
      "blocked-out-of-range": (day) => props.isOutsideRange(day),
      "highlighted-calendar": (day) => props.isDayHighlighted(day),
      "reserve-day": (day) => props.isReserveOfDay(day),
      valid: (day) => !this.isBlocked(day),
      "selected-start": (day) => this.isStartDate(day),
      "selected-end": (day) => this.isEndDate(day),
      "blocked-minimum-nights": (day) => this.doesNotMeetMinimumNights(day),
      "selected-span": (day) => this.isInSelectedSpan(day),
      "last-in-range": (day) => this.isLastInRange(day),
      hovered: (day) => this.isHovered(day),
      "hovered-span": (day) => this.isInHoveredSpan(day),
      "hovered-offset": (day) => this.isInHoveredSpan(day),
      "after-hovered-start": (day) => this.isDayAfterHoveredStartDate(day),
      "first-day-of-week": (day) => this.isFirstDayOfWeek(day),
      "last-day-of-week": (day) => this.isLastDayOfWeek(day),
      "saturday-ofweek": (day) => this.isSaturdayOfWeek(day),
      "hovered-start-first-possible-end": (day, hoverDate) =>
        this.isFirstPossibleEndDateForHoveredStartDate(day, hoverDate),
      "hovered-start-blocked-minimum-nights": (day, hoverDate) =>
        this.doesNotMeetMinNightsForHoveredStartDate(day, hoverDate),
    };

    const { currentMonth, visibleDays } = this.getStateForNewMonth(props);

    const chooseAvailableDate = getChooseAvailableDatePhrase(
      props.phrases,
      props.focusedInput
    );

    this.setCalendarMonthWeeks(currentMonth);

    const withoutTransitionMonths = props.orientation === VERTICAL_SCROLLABLE;
    const _months = getMonths(
      dayjs(),
      props.numberOfMonths,
      withoutTransitionMonths
    );
    this.state = {
      endDateState: props.endDate,
      months: _months,
      hoverDate: null,
      visibleDays,
      currentMonth,
      dateOffset: null,
      phrasesState: {
        ...props.phrases,
        chooseAvailableDate,
      },
      intoView: "",
    };

    this.onDayClick = this.onDayClick.bind(this);
    this.onDayMouseEnter = this.onDayMouseEnter.bind(this)
    this.onDayMouseLeave = this.onDayMouseLeave.bind(this)
  }

  componentDidMount() {
    // this.isTouchDevice = true;

    // this.setState({
    //   endDateState: endDate,
    // });

    // 滚动到当前月份
    // this.delay(200).then(() => {
    //   that.scrollToSelectMonth(startDate)
    // })

    // 这里会影响页面滚动
    // Taro.onWindowResize(() => {
    //   that.scrollToSelectMonth(startDate)
    // })
  }

  componentWillReceiveProps(nextProps) {
    const {
      startDate,
      endDate,
      focusedInput,
      getMinNightsForHoverDate,
      minimumNights,
      isOutsideRange,
      isDayBlocked,
      isDayHighlighted,
      phrases,
      initialVisibleMonth,
      numberOfMonths,
      enableOutsideDays,
    } = nextProps;

    const {
      startDate: prevStartDate,
      endDate: prevEndDate,
      focusedInput: prevFocusedInput,
      minimumNights: prevMinimumNights,
      isOutsideRange: prevIsOutsideRange,
      isDayBlocked: prevIsDayBlocked,
      isDayHighlighted: prevIsDayHighlighted,
      phrases: prevPhrases,
      initialVisibleMonth: prevInitialVisibleMonth,
      numberOfMonths: prevNumberOfMonths,
      enableOutsideDays: prevEnableOutsideDays,
    } = this.props;
    const { hoverDate } = this.state;
    let { visibleDays } = this.state;

    let recomputeOutsideRange = false;
    let recomputeDayBlocked = false;
    let recomputeDayHighlighted = false;

    if (isOutsideRange !== prevIsOutsideRange) {
      this.modifiers["blocked-out-of-range"] = (day) => isOutsideRange(day);
      recomputeOutsideRange = true;
    }

    if (isDayBlocked !== prevIsDayBlocked) {
      this.modifiers["blocked-calendar"] = (day) => isDayBlocked(day);
      recomputeDayBlocked = true;
    }

    if (isDayHighlighted !== prevIsDayHighlighted) {
      this.modifiers["highlighted-calendar"] = (day) => isDayHighlighted(day);
      recomputeDayHighlighted = true;
    }

    const recomputePropModifiers =
      recomputeOutsideRange || recomputeDayBlocked || recomputeDayHighlighted;

    const didStartDateChange = startDate !== prevStartDate;
    const didEndDateChange = endDate !== prevEndDate;
    const didFocusChange = focusedInput !== prevFocusedInput;

    if (
      numberOfMonths !== prevNumberOfMonths ||
      enableOutsideDays !== prevEnableOutsideDays ||
      (initialVisibleMonth !== prevInitialVisibleMonth &&
        !prevFocusedInput &&
        didFocusChange)
    ) {
      const newMonthState = this.getStateForNewMonth(nextProps);
      const { currentMonth } = newMonthState;
      ({ visibleDays } = newMonthState);
      this.setState({
        currentMonth,
        visibleDays,
      });
    }

    let modifiers = {};
    if (didStartDateChange) {
      modifiers = this.deleteModifier(
        modifiers,
        prevStartDate,
        "selected-start"
      );
      modifiers = this.addModifier(modifiers, startDate, "selected-start");

      if (prevStartDate) {
        const startSpan = prevStartDate.clone().add(1, "day");
        const endSpan = prevStartDate.clone().add(prevMinimumNights + 1, "day");
        modifiers = this.deleteModifierFromRange(
          modifiers,
          startSpan,
          endSpan,
          "after-hovered-start"
        );
      }
    }

    if (didEndDateChange) {
      modifiers = this.deleteModifier(modifiers, prevEndDate, "selected-end");
      modifiers = this.addModifier(modifiers, endDate, "selected-end");
    }

    if (didStartDateChange || didEndDateChange) {
      if (prevStartDate && prevEndDate) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          prevStartDate,
          prevEndDate.clone().add(1, "day"),
          "selected-span"
        );
      }

      if (startDate && endDate) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          startDate,
          endDate.clone().add(1, "day"),
          "hovered-span"
        );

        modifiers = this.addModifierToRange(
          modifiers,
          startDate.clone().add(1, "day"),
          endDate,
          "selected-span"
        );
      }
    }

    if (!this.isTouchDevice && didStartDateChange && startDate && !endDate) {
      const startSpan = startDate.clone().add(1, "day");
      const endSpan = startDate.clone().add(minimumNights + 1, "day");
      modifiers = this.addModifierToRange(
        modifiers,
        startSpan,
        endSpan,
        "after-hovered-start"
      );
    }

    if (prevMinimumNights > 0) {
      if (
        didFocusChange ||
        didStartDateChange ||
        minimumNights !== prevMinimumNights
      ) {
        const startSpan = prevStartDate || this.today;
        modifiers = this.deleteModifierFromRange(
          modifiers,
          startSpan,
          startSpan.clone().add(prevMinimumNights, "day"),
          "blocked-minimum-nights"
        );

        modifiers = this.deleteModifierFromRange(
          modifiers,
          startSpan,
          startSpan.clone().add(prevMinimumNights, "day"),
          "blocked"
        );
      }
    }

    if (didFocusChange || recomputePropModifiers) {
      __values(visibleDays).forEach((days) => {
        Object.keys(days).forEach((day) => {
          const momentObj = getPooledMoment(day);
          let isBlocked = false;

          if (didFocusChange || recomputeOutsideRange) {
            if (isOutsideRange(momentObj)) {
              modifiers = this.addModifier(
                modifiers,
                momentObj,
                "blocked-out-of-range"
              );
              isBlocked = true;
            } else {
              modifiers = this.deleteModifier(
                modifiers,
                momentObj,
                "blocked-out-of-range"
              );
            }
          }

          if (didFocusChange || recomputeDayBlocked) {
            if (isDayBlocked(momentObj)) {
              modifiers = this.addModifier(
                modifiers,
                momentObj,
                "blocked-calendar"
              );
              isBlocked = true;
            } else {
              modifiers = this.deleteModifier(
                modifiers,
                momentObj,
                "blocked-calendar"
              );
            }
          }

          if (isBlocked) {
            modifiers = this.addModifier(modifiers, momentObj, "blocked");
          } else {
            modifiers = this.deleteModifier(modifiers, momentObj, "blocked");
          }

          if (didFocusChange || recomputeDayHighlighted) {
            if (isDayHighlighted(momentObj)) {
              modifiers = this.addModifier(
                modifiers,
                momentObj,
                "highlighted-calendar"
              );
            } else {
              modifiers = this.deleteModifier(
                modifiers,
                momentObj,
                "highlighted-calendar"
              );
            }
          }
        });
      });
    }

    if (
      !this.isTouchDevice &&
      didFocusChange &&
      hoverDate &&
      !this.isBlocked(hoverDate)
    ) {
      const minNightsForHoverDate = getMinNightsForHoverDate(hoverDate);
      if (minNightsForHoverDate > 0 && focusedInput === END_DATE) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          hoverDate.clone().add(1, "day"),
          hoverDate.clone().add(minNightsForHoverDate, "day"),
          "hovered-start-blocked-minimum-nights"
        );

        modifiers = this.deleteModifier(
          modifiers,
          hoverDate.clone().add(minNightsForHoverDate, "day"),
          "hovered-start-first-possible-end"
        );
      }

      if (minNightsForHoverDate > 0 && focusedInput === START_DATE) {
        modifiers = this.addModifierToRange(
          modifiers,
          hoverDate.clone().add(1, "day"),
          hoverDate.clone().add(minNightsForHoverDate, "day"),
          "hovered-start-blocked-minimum-nights"
        );

        modifiers = this.addModifier(
          modifiers,
          hoverDate.clone().add(minNightsForHoverDate, "day"),
          "hovered-start-first-possible-end"
        );
      }
    }

    if (minimumNights > 0 && startDate && focusedInput === END_DATE) {
      modifiers = this.addModifierToRange(
        modifiers,
        startDate,
        startDate.clone().add(minimumNights, "day"),
        "blocked-minimum-nights"
      );

      modifiers = this.addModifierToRange(
        modifiers,
        startDate,
        startDate.clone().add(minimumNights, "day"),
        "blocked"
      );
    }

    const today = dayjs();
    if (!isSameDay(this.today, today)) {
      modifiers = this.deleteModifier(modifiers, this.today, "today");
      modifiers = this.addModifier(modifiers, today, "today");
      this.today = today;
    }

    if (Object.keys(modifiers).length > 0) {
      this.setState({
        visibleDays: {
          ...visibleDays,
          ...modifiers,
        },
      });
    }

    if (didFocusChange || phrases !== prevPhrases) {
      // set the appropriate CalendarDay phrase based on focusedInput
      const chooseAvailableDate = getChooseAvailableDatePhrase(
        phrases,
        focusedInput
      );

      this.setState({
        phrasesState: {
          ...phrases,
          chooseAvailableDate,
        },
      });
    }
  }

  private today: any;
  private modifiers: any;
  private calendarMonthWeeks: any;
  private isTouchDevice: boolean;


  delay(delayTime = 500): Promise<null> {
    return new Promise((resolve) => {
      if ([Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.SWAN].includes(ENV)) {
        setTimeout(() => {
          resolve();
        }, delayTime);
        return;
      }
      resolve();
    });
  }

  scrollToSelectMonth(selectMonth) {
    const that = this;
    delayQuerySelector(".cal-month__wrp", 100).then((rect) => {
      const monthItemHeight = (rect && rect[0] && rect[0].height) || 0;
      const _scrollTo: any =
        (selectMonth.month() - dayjs().month()) * monthItemHeight - 28;

      Taro.pageScrollTo({
        selector: ".taro-dates__wrap",
        scrollTop: _scrollTo,
        duration: 300,
        success(data) {
          console.log("scrollPageTo result: ", data);
        },
        fail() {},
        complete() {},
      });
    });
    const _selectMonth = dayjs(selectMonth).format("YYYY-MM");
    that.setState({
      intoView: `into${_selectMonth}`,
    });
  }

  setCalendarMonthWeeks(currentMonth) {
    const { numberOfMonths } = this.props;

    this.calendarMonthWeeks = [];
    let month = currentMonth.clone().subtract(1, "months");
    const firstDayOfWeek = this.getFirstDayOfWeek();
    for (let i = 0; i < numberOfMonths + 2; i += 1) {
      const numberOfWeeks = getNumberOfCalendarMonthWeeks(
        month,
        firstDayOfWeek
      );
      this.calendarMonthWeeks.push(numberOfWeeks);
      month = month.add(1, "months");
    }
  }

  isToday(day) {
    return isSameDay(day, this.today);
  }

  isStartDate(day) {
    const { startDate } = this.props;
    return isSameDay(day, startDate);
  }

  isEndDate(day) {
    const { endDate } = this.props;
    return isSameDay(day, endDate);
  }

  isHovered(day) {
    const { hoverDate } = this.state || {};
    const { focusedInput } = this.props;
    return !!focusedInput && isSameDay(day, hoverDate);
  }

  isInHoveredSpan(day) {
    const { startDate, endDate } = this.props;
    const { hoverDate } = this.state || {};
    const isForwardRange =
      !!startDate &&
      !endDate &&
      (day.isBetween(startDate, hoverDate) || isSameDay(hoverDate, day));
    const isBackwardRange =
      !!endDate &&
      !startDate &&
      (day.isBetween(hoverDate, endDate) || isSameDay(hoverDate, day));

    const isValidDayHovered = hoverDate && !this.isBlocked(hoverDate);

    return (isForwardRange || isBackwardRange) && isValidDayHovered;
  }

  isDayAfterHoveredStartDate(day) {
    const { startDate, endDate, minimumNights } = this.props;
    const { hoverDate } = this.state || {};
    return (
      !!startDate &&
      !endDate &&
      !this.isBlocked(day) &&
      isNextDay(hoverDate, day) &&
      minimumNights > 0 &&
      isSameDay(hoverDate, startDate)
    );
  }

  isFirstDayOfWeek(day) {
    const { firstDayOfWeek } = this.props;
    return day.day() === (firstDayOfWeek || dayjs().startOf("week").day());
  }
  isLastDayOfWeek(day) {
    const { firstDayOfWeek } = this.props;
    return (
      day.day() === ((firstDayOfWeek || dayjs().startOf("week").day()) + 6) % 7
    );
  }

  isFirstPossibleEndDateForHoveredStartDate(day, hoverDate) {
    const { focusedInput, getMinNightsForHoverDate } = this.props;
    if (focusedInput !== END_DATE || !hoverDate || this.isBlocked(hoverDate))
      return false;
    const minNights = getMinNightsForHoverDate(hoverDate);
    const firstAvailableEndDate = hoverDate.clone().add(minNights, "days");
    return isSameDay(day, firstAvailableEndDate);
  }

  doesNotMeetMinNightsForHoveredStartDate(day, hoverDate) {
    const { focusedInput, getMinNightsForHoverDate } = this.props;
    if (focusedInput !== END_DATE) return false;

    if (hoverDate && !this.isBlocked(hoverDate)) {
      const minNights = getMinNightsForHoverDate(hoverDate);
      const dayDiff = day.diff(
        hoverDate.clone().startOf("day").hour(12),
        "days"
      );
      return dayDiff < minNights && dayDiff >= 0;
    }
    return false;
  }

  isSaturdayOfWeek(day) {
    const { firstDayOfWeek } = this.props;
    return (
      day.day() === ((firstDayOfWeek || dayjs().startOf("week").day()) + 5) % 7
    );
  }

  isInSelectedSpan(day) {
    const { startDate, endDate } = this.props;
    // console.log("startDate: ", startDate.format('YYYY-MM-DD'))
    return day.isBetween(startDate, endDate, "day");
  }
  isLastInRange(day) {
    const { endDate } = this.props;
    return this.isInSelectedSpan(day) && isNextDay(day, endDate);
  }
  isBlocked(day) {
    const { isDayBlocked, isOutsideRange } = this.props;
    return (
      isDayBlocked(day) ||
      isOutsideRange(day) ||
      this.doesNotMeetMinimumNights(day)
    );
  }

  getModifiersForDay(day) {
    return new Set(
      Object.keys(this.modifiers).filter((modifier) =>
        this.modifiers[modifier](day)
      )
    );
  }
  getStateForNewMonth(nextProps) {
    const {
      initialVisibleMonth,
      numberOfMonths,
      enableOutsideDays,
      orientation,
      // startDate,
    } = nextProps;
    // const initialVisibleMonthThunk = initialVisibleMonth || (
    //   startDate ? () => startDate : () => this.today
    // );
    const initialVisibleMonthThunk = initialVisibleMonth || (() => this.today);
    const currentMonth = initialVisibleMonthThunk();
    const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
    const visibleDays = this.getModifiers(
      getVisibleDays(
        currentMonth,
        numberOfMonths,
        enableOutsideDays,
        withoutTransitionMonths
      )
    );
    return { currentMonth, visibleDays };
  }

  getModifiers(visibleDays) {
    const modifiers = {};
    Object.keys(visibleDays).forEach((month) => {
      modifiers[month] = {};
      visibleDays[month].forEach((day) => {
        modifiers[month][toISODateString(day, "")] =
          this.getModifiersForDay(day);
      });
    });

    return modifiers;
  }

  doesNotMeetMinimumNights(day) {
    const { startDate, isOutsideRange, focusedInput, minimumNights } =
      this.props;
    if (focusedInput !== END_DATE) return false;

    if (startDate) {
      const dayDiff =
        day && day.diff(startDate.clone().startOf("day").hour(12), "day");
      return dayDiff < minimumNights && dayDiff >= 0;
    }
    return isOutsideRange(dayjs(day).subtract(minimumNights, "day"));
  }

  getFirstDayOfWeek() {
    const { firstDayOfWeek } = this.props;
    if (firstDayOfWeek == null) {
      return dayjs().startOf("week").day();
    }

    return firstDayOfWeek;
  }

  deleteModifier(updatedDays, day, modifier) {
    return deleteModifier(updatedDays, day, modifier, this.props, this.state);
  }
  addModifier(updatedDays, day, modifier) {
    return addModifier(updatedDays, day, modifier, this.props, this.state);
  }
  addModifierToRange(updatedDays, start, end, modifier) {
    let days = updatedDays;

    let spanStart = start.clone();
    while (isBeforeDay(spanStart, end)) {
      days = this.addModifier(days, spanStart, modifier);
      spanStart = spanStart.clone().add(1, "day");
    }

    return days;
  }

  deleteModifierFromRange(updatedDays, start, end, modifier) {
    let days = updatedDays;

    let spanStart = start.clone();
    while (isBeforeDay(spanStart, end)) {
      days = this.deleteModifier(days, spanStart, modifier);
      spanStart = spanStart.clone().add(1, "day");
    }

    return days;
  }

  componentDidShow() {
    const { startDate } = this.props;
    this.scrollToSelectMonth(startDate);
  }

  resetIntoView() {
    this.setState({
      intoView: "",
    });
  }

  onDayClick(day, e) {
    const {
      keepOpenOnDateSelect,
      minimumNights,
      onBlur,
      focusedInput,
      onFocusChange,
      onClose,
      onDatesChange,
      startDateOffset,
      endDateOffset,
      disabled,
    } = this.props;
    if (e) e.preventDefault();
    if (this.isBlocked(day)) return;
    let { startDate, endDate } = this.props;

    this.resetIntoView();

    if (startDateOffset || endDateOffset) {
      startDate = getSelectedDateOffset(startDateOffset, day);
      endDate = getSelectedDateOffset(endDateOffset, day);

      if (this.isBlocked(startDate) || this.isBlocked(endDate)) {
        return;
      }

      onDatesChange({ startDate, endDate });

      if (!keepOpenOnDateSelect) {
        onFocusChange(null);
        onClose({ startDate, endDate });
      }
    } else if (focusedInput === START_DATE) {
      const lastAllowedStartDate =
        endDate && endDate.clone().subtract(minimumNights, "day");
      const isStartDateAfterEndDate =
        isBeforeDay(lastAllowedStartDate, day) ||
        isAfterDay(startDate, endDate);
      const isEndDateDisabled = disabled;

      if (!isEndDateDisabled || !isStartDateAfterEndDate) {
        startDate = day;
        if (isStartDateAfterEndDate) {
          endDate = null;
        }
      }

      onDatesChange({ startDate, endDate });

      // if (isSingle) {
      onFocusChange(null);
      onClose({ startDate, endDate });
      return;
      // }

      // if (isEndDateDisabled && !isStartDateAfterEndDate) {
      //   onFocusChange(null);
      //   onClose({ startDate, endDate });
      // } else if (!isEndDateDisabled) {
      //   onFocusChange(END_DATE);
      // }
    } else if (focusedInput === END_DATE) {
      const firstAllowedEndDate =
        startDate && startDate.clone().add(minimumNights, "day");
      if (!startDate) {
        endDate = day;
        onDatesChange({ startDate, endDate });
        onFocusChange(START_DATE);
      } else if (isInclusivelyAfterDay(day, firstAllowedEndDate)) {
        endDate = day;
        onDatesChange({ startDate, endDate });
        if (!keepOpenOnDateSelect) {
          onFocusChange(null);
          onClose({ startDate, endDate });
        }
      } else if (!disabled) {
        startDate = day;
        endDate = null;
        onDatesChange({ startDate, endDate });
      } else {
        onDatesChange({ startDate, endDate });
      }
    } else {
      onDatesChange({ startDate, endDate });
    }
    onBlur({ startDate, endDate });
  }

  onDayMouseEnter(day) {
    /* eslint react/destructuring-assignment: 1 */
    if (this.isTouchDevice) return;
    const {
      startDate,
      endDate,
      focusedInput,
      getMinNightsForHoverDate,
      minimumNights,
      startDateOffset,
      endDateOffset,
    } = this.props;

    const { hoverDate, visibleDays, dateOffset } = this.state;

    let nextDateOffset: any = null;

    if (focusedInput) {
      const hasOffset = startDateOffset || endDateOffset;
      let modifiers = {};

      if (hasOffset) {
        const start = getSelectedDateOffset(startDateOffset, day);
        const end = getSelectedDateOffset(endDateOffset, day, (rangeDay) =>
          rangeDay.add(1, "day")
        );

        nextDateOffset = {
          start,
          end,
        };

        // eslint-disable-next-line react/destructuring-assignment
        if (dateOffset && dateOffset.start && dateOffset.end) {
          modifiers = this.deleteModifierFromRange(
            modifiers,
            dateOffset.start,
            dateOffset.end,
            "hovered-offset"
          );
        }
        modifiers = this.addModifierToRange(
          modifiers,
          start,
          end,
          "hovered-offset"
        );
      }

      if (!hasOffset) {
        modifiers = this.deleteModifier(modifiers, hoverDate, "hovered");
        modifiers = this.addModifier(modifiers, day, "hovered");

        if (startDate && !endDate && focusedInput === END_DATE) {
          if (isAfterDay(hoverDate, startDate)) {
            const endSpan = hoverDate.clone().add(1, "day");
            modifiers = this.deleteModifierFromRange(
              modifiers,
              startDate,
              endSpan,
              "hovered-span"
            );
          }

          if (!this.isBlocked(day) && isAfterDay(day, startDate)) {
            const endSpan = day.clone().add(1, "day");
            modifiers = this.addModifierToRange(
              modifiers,
              startDate,
              endSpan,
              "hovered-span"
            );
          }
        }

        if (!startDate && endDate && focusedInput === START_DATE) {
          if (isBeforeDay(hoverDate, endDate)) {
            modifiers = this.deleteModifierFromRange(
              modifiers,
              hoverDate,
              endDate,
              "hovered-span"
            );
          }

          if (!this.isBlocked(day) && isBeforeDay(day, endDate)) {
            modifiers = this.addModifierToRange(
              modifiers,
              day,
              endDate,
              "hovered-span"
            );
          }
        }

        if (startDate) {
          const startSpan = startDate.clone().add(1, "day");
          const endSpan = startDate.clone().add(minimumNights + 1, "day");
          modifiers = this.deleteModifierFromRange(
            modifiers,
            startSpan,
            endSpan,
            "after-hovered-start"
          );

          if (isSameDay(day, startDate)) {
            const newStartSpan = startDate.clone().add(1, "day");
            const newEndSpan = startDate.clone().add(minimumNights + 1, "day");
            modifiers = this.addModifierToRange(
              modifiers,
              newStartSpan,
              newEndSpan,
              "after-hovered-start"
            );
          }
        }

        if (hoverDate && !this.isBlocked(hoverDate)) {
          const minNightsForPrevHoverDate = getMinNightsForHoverDate(hoverDate);
          if (minNightsForPrevHoverDate > 0 && focusedInput === START_DATE) {
            modifiers = this.deleteModifierFromRange(
              modifiers,
              hoverDate.clone().add(1, "day"),
              hoverDate.clone().add(minNightsForPrevHoverDate, "day"),
              "hovered-start-blocked-minimum-nights"
            );

            modifiers = this.deleteModifier(
              modifiers,
              hoverDate.clone().add(minNightsForPrevHoverDate, "day"),
              "hovered-start-first-possible-end"
            );
          }
        }

        if (!this.isBlocked(day)) {
          const minNightsForHoverDate = getMinNightsForHoverDate(day);
          if (minNightsForHoverDate > 0 && focusedInput === START_DATE) {
            modifiers = this.addModifierToRange(
              modifiers,
              day.clone().add(1, "day"),
              day.clone().add(minNightsForHoverDate, "day"),
              "hovered-start-blocked-minimum-nights"
            );

            modifiers = this.addModifier(
              modifiers,
              day.clone().add(minNightsForHoverDate, "day"),
              "hovered-start-first-possible-end"
            );
          }
        }
      }

      this.setState({
        hoverDate: day,
        dateOffset: nextDateOffset,
        visibleDays: {
          ...visibleDays,
          ...modifiers,
        },
      });
    }
  }

  onDayMouseLeave(day) {
    const {
      startDate,
      endDate,
      focusedInput,
      getMinNightsForHoverDate,
      minimumNights,
    } = this.props;
    const { hoverDate, visibleDays, dateOffset } = this.state;
    if (this.isTouchDevice || !hoverDate) return;

    let modifiers = {};
    modifiers = this.deleteModifier(modifiers, hoverDate, "hovered");

    if (dateOffset) {
      modifiers = this.deleteModifierFromRange(
        modifiers,
        dateOffset.start,
        dateOffset.end,
        "hovered-offset"
      );
    }

    if (startDate && !endDate && isAfterDay(hoverDate, startDate)) {
      const endSpan = hoverDate.clone().add(1, "day");
      modifiers = this.deleteModifierFromRange(
        modifiers,
        startDate,
        endSpan,
        "hovered-span"
      );
    }

    if (!startDate && endDate && isAfterDay(endDate, hoverDate)) {
      modifiers = this.deleteModifierFromRange(
        modifiers,
        hoverDate,
        endDate,
        "hovered-span"
      );
    }

    if (startDate && isSameDay(day, startDate)) {
      const startSpan = startDate.clone().add(1, "day");
      const endSpan = startDate.clone().add(minimumNights + 1, "day");
      modifiers = this.deleteModifierFromRange(
        modifiers,
        startSpan,
        endSpan,
        "after-hovered-start"
      );
    }

    if (!this.isBlocked(hoverDate)) {
      const minNightsForHoverDate = getMinNightsForHoverDate(hoverDate);
      if (minNightsForHoverDate > 0 && focusedInput === START_DATE) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          hoverDate.clone().add(1, "day"),
          hoverDate.clone().add(minNightsForHoverDate, "day"),
          "hovered-start-blocked-minimum-nights"
        );

        modifiers = this.deleteModifier(
          modifiers,
          hoverDate.clone().add(minNightsForHoverDate, "day"),
          "hovered-start-first-possible-end"
        );
      }
    }

    this.setState({
      hoverDate: null,
      visibleDays: {
        ...visibleDays,
        ...modifiers,
      },
    });
  }

  tarnsCycle(cycle) {
    let cycleNotices: any = [];
    if (typeof cycle === "string") {
      if (cycle !== "0") {
        const cycles = __compact(cycle.split(";"));
        if (cycles && cycles.length > 0) {
          cycles.sort((a: any, b: any) => {
            return a - b;
          });
          cycleNotices = cycles.map((item) => {
            return `周${CYCLES[parseInt(item) - 1]}`;
          });
        }
      }
    }
    return cycleNotices;
  }

  public render(): JSX.Element {
    const {
      weekDayFormat,
      fromTop,
      cycle,
      phrases,
      isSingle,
      // isOutsideDay
    } = this.props;

    const {
      // endDate,
      months,
      visibleDays,
      currentMonth,
      intoView,
      // phrases
    } = this.state;
    // const _endDate = endDate && endDate.format('YYYY-MM-DD')
    const firstDayOfWeek = this.getFirstDayOfWeek();

    const cycleNotices = this.tarnsCycle(cycle);

    return (
      <View
        className={classnames("taro-dates__wrap", {
          "taro-dates__cycle": cycleNotices.length > 0,
        })}
        style={{ top: fromTop }}
      >
        <View className='cal-week-header'>
          {WEEKDAYS.map((i) => {
            return (
              <View
                key={i}
                className={classnames("cal-week-item", {
                  "cal-week-item__active": i === 0 || i === 6,
                })}
              >
                <Text>
                  {dayjs()
                    .day((i + firstDayOfWeek) % 7)
                    .format(weekDayFormat)}
                </Text>
              </View>
            );
          })}
        </View>
        <ScrollView
          className='cal-month__scroll'
          scrollIntoView={intoView}
          scrollY
        >
          <View
            className={classnames("cal-week-monthes", {
              "cal-month__round": !isSingle,
            })}
          >
            {months.map((month) => {
              const monthString = toISOMonthString(month, "YYYY-MM-DD");
              return (
                <View
                  id={"into" + monthString || ""}
                  className='cal-month__wrp'
                  key={monthString || ""}
                >
                  <View className='cal-month-title'>
                    {month.format("YYYY年MM月")}
                  </View>
                  <Month
                    month={month}
                    isSingle={isSingle}
                    firstDayOfWeek={firstDayOfWeek}
                    phrases={phrases}
                    modifiers={visibleDays[monthString || ""]}
                    // isOutsideDay={isOutsideDay}
                    onDayMouseEnter={this.onDayMouseEnter}
                    onDayMouseLeave={this.onDayMouseLeave}
                    onDayClick={this.onDayClick}
                    initialVisibleMonth={() => currentMonth}
                  ></Month>
                </View>
              );
            })}
          </View>
        </ScrollView>
        {cycleNotices.length > 0 ? (
          <View className='cal-cycle-notice'>
            每周{cycleNotices.join("、")}发船
          </View>
        ) : null}
      </View>
    );
  }
}

TaroDates.defaultProps = {
  isSingle: false,
  startDate: dayjs(),
  endDate: null,
  block: false,
  cycle: "",
  firstDayOfWeek: 0,
  weekDayFormat: "",
  fromTop: 0,
  minimumNights: 0,
  numberOfMonths: 0,
  keepOpenOnDateSelect: false,
  disabled: false,
  orientation: "",
  phrases: "",
  enableOutsideDays: false,
  isOutsideDay: false,
  focusedInput: "",
  initialVisibleMonth: null,
  isDayHighlighted: () => false,
  isDayBlocked: () => false,
  isOutsideRange: () => false,
  getMinNightsForHoverDate: () => 0,
  isReserveOfDay: () => false,
  startDateOffset: false,
  endDateOffset: false,
  onBlur: () => {},
  onClose: () => {},
  onFocusChange: () => {},
  onDatesChange: () => {},
};

TaroDates.propTypes = {
  /**
   * 出发日期
   */
  startDate: PropTypes.any,
  /**
   * 到达日期
   */
  endDate: PropTypes.any,
  block: PropTypes.bool,
  cycle: PropTypes.string,
  firstDayOfWeek: PropTypes.number,
  weekDayFormat: PropTypes.string,
  fromTop: PropTypes.number,
  minimumNights: PropTypes.number,
  numberOfMonths: PropTypes.number,
  keepOpenOnDateSelect: PropTypes.bool,
  disabled: PropTypes.bool,
  orientation: PropTypes.string,
  phrases: PropTypes.object,
  enableOutsideDays: PropTypes.bool,
  isOutsideDay: PropTypes.bool,
  isSingle: PropTypes.bool,
  focusedInput: PropTypes.string,
  // getMinNightsForHoverDate: PropTypes.func,
  // isDayHighlighted: PropTypes.func,
  // onBlur: PropTypes.func,
  // onClose: PropTypes.func,
  // onFocusChange: PropTypes.func,
  // onDatesChange: PropTypes.func,
  // isDayBlocked: PropTypes.func,
  // isOutsideRange: PropTypes.func,
  // startDateOffset: PropTypes.func,
  // endDateOffset: PropTypes.func,
  // initialVisibleMonth: PropTypes.any
};
