import React from 'react';

import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import dayjs from 'dayjs';
import isSameDay from './utils/isSameDay';
import Festival from './utils/festival';
import getCalendarDaySettings from './utils/getCalendarDaySettings';
import { CalendarDayPhrases } from './utils/defaultPhrases';
import { DAY_SIZE } from './utils/constants';

interface DayProps {
    day: any;
    isSingle: boolean;
    onDayMouseEnter: any;
    onDayMouseLeave: any;
    onDayClick: any;
    modifiers: any;
    phrases: any;
    isOutsideDay: boolean;
}

interface DayState {
    ariaLabelFormat: string;
    daySize: any;
    phrases: any;
}




export default class Day extends React.Component<DayProps, DayState> {
    constructor(props: DayProps) {
        super(props);
        this.state = {

            ariaLabelFormat: 'dddd, LL',

            daySize: DAY_SIZE,

            phrases: CalendarDayPhrases
        };
    }


    private _onDayClick = (day) => (e) => {
        const { onDayClick } = this.props;
        // console.log("day: ", day.format('YYYY-MM-DD'))
        if (day) {
            onDayClick(day, e);
        }
    }

    // private onDayMouseEnter = (day) => (e) => {
    //     const { onDayMouseEnter } = this.props;
    //     // console.log("enter : ", day)
    //     onDayMouseEnter(day, e);
    // }

    // private onDayMouseLeave = (day) => (e) => {
    //     const { onDayMouseLeave } = this.props;
    //     // console.log("leave : ", day)
    //     onDayMouseLeave(day, e);
    // }

    // private onKeyDown = (day) => (e) => {
    //     const { onDayClick } = this.props;

    //     const { key } = e;
    //     if (key === 'Enter' || key === ' ') {
    //         onDayClick(day, e);
    //     }
    // }

    public render(): JSX.Element {
        const {
            ariaLabelFormat,
            daySize,
            phrases
        } = this.state;
        const {
            day,
            modifiers,
            isOutsideDay,
            isSingle
        } = this.props;
        const {
            // daySizeStyles,
            useDefaultCursor,
            selected,
            hoveredSpan,
            isOutsideRange,
            isReserveDay,
            ariaLabel,
        } = getCalendarDaySettings(day, ariaLabelFormat, daySize, modifiers, phrases);
        let dayVal = day && day.format('D')
        let _holiday: any = ''

        // 设置节假日
        if (day) {
            var festival = Festival(new Date(day.format()))
            if (isSameDay(dayjs(), day)) {
                dayVal = '今天'
            }
            // console.log(festival)
            _holiday = festival.holiday
        }
        return (

            <View className={classnames(
                'cal-day',
                dayVal && 'cal-day__default',
                // daySizeStyles,
                useDefaultCursor && 'cal-day__cursor-default',
                isOutsideRange && 'cal-day__blocked-out_of_range',

                isOutsideDay && 'cal-day__outside',

                isReserveDay && 'cal-day__reserve',

                _holiday && 'cal-day__holiday',

                hoveredSpan && 'cal-day__hovered_span',

                modifiers && modifiers.has('hovered-offset') && 'cal-day__hovered_offset',
                modifiers && modifiers.has('hovered-start-first-possible-end') && 'cal-day__hovered_start_first_possible_end',
                modifiers && modifiers.has('hovered-start-blocked-minimum-nights') && 'cal-day__hovered_start_blocked_min_nights',
                modifiers && modifiers.has('highlighted-calendar') && 'cal-day__highlighted_calendar',
                modifiers && modifiers.has('blocked-minimum-nights') && 'cal-day__blocked_minimum_nights',

                modifiers && modifiers.has('blocked-calendar') && 'cal-day__blocked_calendar',
                modifiers && modifiers.has('selected-span') && 'cal-day__selected_span',
                modifiers && modifiers.has('selected-start') && 'cal-day__selected_start',
                modifiers && modifiers.has('selected-end') && 'cal-day__selected_end',

                selected && !modifiers.has('selected-span') && 'cal-day__selected',

                modifiers && modifiers.has('today') && 'cal-day__today',
                modifiers && modifiers.has('first-day-of-week') && 'cal-day__firstDayOfWeek',
                modifiers && modifiers.has('last-day-of-week') && 'cal-day__lastDayOfWeek',
                modifiers && modifiers.has('saturday-ofweek') && !isOutsideDay && !isOutsideRange && 'cal-day__saturdayOfweek',

                modifiers && modifiers.has('last-day-of-week') && !isOutsideDay && !isOutsideRange && 'cal-day__lastday_theme'

            )}
              aria-label={ariaLabel}
              onClick={this._onDayClick(day)}
            //   onMouseEnter={this.onDayMouseEnter(day)}
            //   onMouseLeave={this.onDayMouseLeave(day)}
            //   onMouseUp={(e) => e.currentTarget.blur()}
            //   onKeyDown={this.onKeyDown(day)}
            >
                <View className='cal-day__txt-wrp'>
                    {
                        modifiers && modifiers.has('selected-start') && !isSingle && <Text className='cal-day__dir start'>去程</Text>
                    }
                    {
                        modifiers && modifiers.has('selected-end') && !isSingle && <Text className='cal-day__dir end'>返程</Text>
                    }
                    {
                        dayVal && <Text className='cal-day__txt'>{dayVal}</Text>
                    }
                    {
                        _holiday && !isReserveDay &&  <Text className='cal-day__txt-holiday'>{_holiday}</Text>
                    }

                    {
                        isReserveDay && !isOutsideDay && !isOutsideRange && <Text className='cal-day__txt cal-day__txt-price'>预约</Text>
                    }
                </View>

            </View>
        );
    }
}

