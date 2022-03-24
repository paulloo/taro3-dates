import React from "react";

import { View } from "@tarojs/components";
import dayjs from "dayjs";
import classnames from "classnames";
import getCalendarMonthWeeks from "./utils/getCalendarMonthWeeks";
import toISODateString from "./utils/toISODateString";
import Week from "./Week";
import Day from "./Day";

interface MonthProps {
  month: any;
  isSingle: boolean;
  onDayMouseEnter: any;
  onDayMouseLeave: any;
  onDayClick: any;
  modifiers: any;
  initialVisibleMonth: any;
  firstDayOfWeek: number;
  phrases: any;
}

interface MonthState {
  weeks: any;
}

export default class Month extends React.Component<MonthProps, MonthState> {
  constructor(props: MonthProps) {
    super(props);
    this.state = {
      weeks:
        props.month &&
        getCalendarMonthWeeks(
          props.month,
          false,
          props.firstDayOfWeek == null
            ? dayjs().startOf("week").day()
            : props.firstDayOfWeek
        ),
    };
  }

  public render(): JSX.Element {
    const { weeks } = this.state;
    const {
      onDayMouseEnter,
      onDayMouseLeave,
      onDayClick,
      modifiers,
      phrases,
      month,
      isSingle,
    } = this.props;
    const dayString = (day) => {
      return toISODateString(day, "") || "";
    };
    return (
      <View className={classnames("cal-month")}>
        {weeks &&
          weeks.length &&
          weeks.map((week) => {
            return (
              <Week key={week}>
                {week &&
                  week.length &&
                  week.map((day, dayOfWeek) => {
                    return (
                      <Day
                        key={dayOfWeek}
                        day={day}
                        isSingle={isSingle}
                        isOutsideDay={!day || day.month() !== month.month()}
                        phrases={phrases}
                        modifiers={modifiers[dayString(day)]}
                        onDayMouseEnter={onDayMouseEnter}
                        onDayMouseLeave={onDayMouseLeave}
                        onDayClick={onDayClick}
                      ></Day>
                    );
                  })}
              </Week>
            );
          })}
      </View>
    );
  }
}
