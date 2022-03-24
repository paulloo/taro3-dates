import React from 'react';

import { View } from '@tarojs/components';
import classnames from 'classnames';

interface WeekProps {
}

interface WeekState {
}

export default class Week extends React.Component<WeekProps, WeekState> {
    constructor(props: WeekProps) {
        super(props);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { children } = this.props;
        return (
            <View className={classnames(
                'cal-week'
            )}
            >
                {children}
            </View>
        );
    }
}

