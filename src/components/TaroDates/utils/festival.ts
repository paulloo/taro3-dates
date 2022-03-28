/*-----------------------------------------------
1900年至2100年公历转农历、节假日、节气、生肖等
使用方法：var xx = date2holiday('2017-03-31');
-----------------------------------------------*/

/* 公历转农历代码思路：
1、建立农历年份查询表
2、计算输入公历日期与公历基准的相差天数
3、从农历基准开始遍历农历查询表，计算自农历基准之后每一年的天数，并用相差天数依次相减，确定农历年份
4、利用剩余相差天数以及农历每个月的天数确定农历月份
5、利用剩余相差天数确定农历哪一天 */

// 农历1949-2100年查询表
const lunarYearArr = [
    0x0b557, //1949
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, //1950-1959
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, //1960-1969
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, //1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, //1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, //1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
    0x0d520 //2100
]

// 1900-2100各年的24节气日期表
const solarTermsTable = ["9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "9778397bd19801ec9210c965cc920e", "97b6b97bd19801ec95f8c965cc920f", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd197c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bcf97c3598082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd19801ec9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bd07f1487f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b97bd197c36c9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b70c9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "977837f0e37f149b0723b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0723b06bd", "7f07e7f0e37f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e37f14998083b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14898082b0723b02d5", "7f07e7f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66aa89801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e26665b66a449801e9808297c35", "665f67f0e37f1489801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722"];
const arrSolarTerms = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const diZhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const arrAnimals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const lunarDay = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '初', '廿'];
const arrChineseMonthTitles: string[] = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
// 节假日（除夕不在下列，需要动态计算）
const oFestivals = {
    t0101: "t,春节 ", // t 开头的是中国传统节日
    t0115: "t,元宵节",
    t0202: "t,龙头节",
    t0505: "t,端午节",
    t0707: "t,七夕节",
    t0715: "t,中元节",
    t0815: "t,中秋节",
    t0909: "t,重阳节",
    //t1001: "t,寒衣节",
    //t1015: "t,下元节",
    t1208: "t,腊八节",
    t1223: "t,小年",
    //"0202": "i,湿地日,1996",
    "0308": "i,妇女节,1975",
    //"0315": "i,消费者权益日,1983",
    "0401": "i,愚人节,1564",
    //"0422": "i,地球日,1990",
    "0501": "i,劳动节,1889",
    //"0512": "i,护士节,1912",
    //"0518": "i,博物馆日,1977",
    //"0605": "i,环境日,1972",
    //"0623": "i,奥林匹克日,1948",
    //"1020": "i,骨质疏松日,1998",
    //"1117": "i,学生日,1942",
    //"1201": "i,艾滋病日,1988",
    "0101": "h,元旦",
    "0312": "h,植树节,1979",
    "0504": "h,五四青年节,1939",
    "0601": "h,儿童节,1950",
    "0701": "h,建党节,1941",
    "0801": "h,建军节,1933",
    //"0903": "h,抗战胜利日,1945",
    "0910": "h,教师节,1985",
    "1001": "h,国庆节,1949",
    "1224": "c,平安夜",
    "1225": "c,圣诞节",
    "0214": "a,情人节",
    extra: { // 前2位: 月份，第3位: 第几个星期，第4位: 星期几
        "0520": "i,母亲节,1913",
        "0630": "a,父亲节",
        "1144": "a,感恩节"
    }
};


const fnLunarTmp = {
    // 公历转农历函数
    sloarToLunar: function (sy, sm, sd) {
        // 输入的月份减1处理
        sm -= 1;

        // 计算与公历基准的相差天数
        // Date.UTC()返回的是距离公历1970年1月1日的毫秒数,传入的月份需要减1
        let daySpan = (Date.UTC(sy, sm, sd) - Date.UTC(1949, 0, 29)) / (24 * 60 * 60 * 1000) + 1;
        let ly, lm, ld;
        let lunarY, lunarM, lunarD, isBigMonth = false;
        // 确定输出的农历年份
        for (let j = 0; j < lunarYearArr.length; j++) {
            daySpan -= this.lunarYearDays(lunarYearArr[j]);
            if (daySpan <= 0) {
                ly = 1949 + j;
                // 获取农历年份确定后的剩余天数
                daySpan += this.lunarYearDays(lunarYearArr[j]);
                break
            }
        }

        // 确定输出的农历月份
        for (let k = 0; k < this.lunarYearMonths(lunarYearArr[ly - 1949]).length; k++) {
            daySpan -= this.lunarYearMonths(lunarYearArr[ly - 1949])[k];
            if (daySpan <= 0) {
                // 有闰月时，月份的数组长度会变成13，因此，当闰月月份小于等于k时，lm不需要加1
                if (this.hasLeapMonth(lunarYearArr[ly - 1949]) && this.hasLeapMonth(lunarYearArr[ly - 1949]) <= k) {
                    if (this.hasLeapMonth(lunarYearArr[ly - 1949]) < k) {
                        lm = k;
                    } else if (this.hasLeapMonth(lunarYearArr[ly - 1949]) === k) {
                        lm = '闰' + k;
                    } else {
                        lm = k + 1;
                    }
                } else {
                    lm = k + 1;
                }
                // 获取农历月份确定后的剩余天数
                daySpan += this.lunarYearMonths(lunarYearArr[ly - 1949])[k];
                break
            }
        }

        // 确定输出农历哪一天
        ld = daySpan;

        lunarY = ly
        lunarM = lm
        lunarD = ld

        isBigMonth = ld === 30


        // 将计算出来的农历月份转换成汉字月份，闰月需要在前面加上闰字
        if (this.hasLeapMonth(lunarYearArr[ly - 1949]) && (typeof (lm) === 'string' && lm.indexOf('闰') > -1)) {
            const _lm: any = /\d/.exec(lm)
            if (_lm) {
                lm = `闰${arrChineseMonthTitles[_lm - 1]}`
            }
        } else {
            lm = arrChineseMonthTitles[lm - 1];
        }
        // 将计算出来的农历年份转换为天干地支年
        ly = this.getTianGan(ly) + this.getDiZhi(ly);

        // 将计算出来的农历天数转换成汉字
        if (ld < 11) {
            ld = `${lunarDay[10]}${lunarDay[ld - 1]}`
        } else if (ld > 10 && ld < 20) {
            ld = `${lunarDay[9]}${lunarDay[ld - 11]}`
        } else if (ld === 20) {
            ld = `${lunarDay[1]}${lunarDay[9]}`
        } else if (ld > 20 && ld < 30) {
            ld = `${lunarDay[11]}${lunarDay[ld - 21]}`
        } else if (ld === 30) {
            ld = `${lunarDay[2]}${lunarDay[9]}`
        }

        return {
            lunarYear: ly,
            lunarMonth: lm,
            lunarDay: ld,
            lunarY,
            lunarM,
            lunarD,
            isBigMonth
        }
    },

    // 计算农历年是否有闰月，参数为存储农历年的16进制
    // 农历年份信息用16进制存储，其中16进制的最后1位可以用于判断是否有闰月
    hasLeapMonth: function (ly) {
        // 获取16进制的最后1位，需要用到&与运算符
        if (ly & 0xf) {
            return ly & 0xf
        } else {
            return false
        }
    },

    // 如果有闰月，计算农历闰月天数，参数为存储农历年的16进制
    // 农历年份信息用16进制存储，其中16进制的第1位（0x除外）可以用于表示闰月是大月还是小月
    leapMonthDays: function (ly) {
        if (this.hasLeapMonth(ly)) {
            // 获取16进制的第1位（0x除外）
            return (ly & 0xf0000) ? 30 : 29
        } else {
            return 0
        }
    },

    // 计算农历一年的总天数，参数为存储农历年的16进制
    // 农历年份信息用16进制存储，其中16进制的第2-4位（0x除外）可以用于表示正常月是大月还是小月
    lunarYearDays: function (ly) {
        let totalDays = 0;

        // 获取正常月的天数，并累加
        // 获取16进制的第2-4位，需要用到>>移位运算符
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            let monthDays = (ly & i) ? 30 : 29;
            totalDays += monthDays;
        }
        // 如果有闰月，需要把闰月的天数加上
        if (this.hasLeapMonth(ly)) {
            totalDays += this.leapMonthDays(ly);
        }

        return totalDays
    },

    // 获取农历每个月的天数
    // 参数需传入16进制数值
    lunarYearMonths: function (ly) {
        let monthArr: number[] = [];

        // 获取正常月的天数，并添加到monthArr数组中
        // 获取16进制的第2-4位，需要用到>>移位运算符
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            monthArr.push((ly & i) ? 30 : 29);
        }
        // 如果有闰月，需要把闰月的天数加上
        if (this.hasLeapMonth(ly)) {
            monthArr.splice(this.hasLeapMonth(ly), 0, this.leapMonthDays(ly));
        }

        return monthArr
    },

    // 将农历年转换为天干，参数为农历年
    getTianGan: function (ly) {
        let tianGanKey = (ly - 3) % 10;
        if (tianGanKey === 0) tianGanKey = 10;
        return tianGan[tianGanKey - 1]
    },

    // 将农历年转换为地支，参数为农历年
    getDiZhi: function (ly) {
        let diZhiKey = (ly - 3) % 12;
        if (diZhiKey === 0) diZhiKey = 12;
        return diZhi[diZhiKey - 1]
    },


}

// 农历1900-2100的闰大小信息 return: hex 2 DateTime
const getLeapYearTime = function (year, doubleMonth) {
    const v = solarTermsTable[year - 1900];
    let hex: string[] = [];
    let s = 0;
    let q;
    for (; s < 30; s += 5) {
        q = (+("0x" + v.substr(s, 5))).toString();
        hex.push(q.substr(0, 1));
        hex.push(q.substr(1, 2));
        hex.push(q.substr(3, 1));
        hex.push(q.substr(4, 2));
    }
    const _dbMonth = Number(doubleMonth)
    const month = _dbMonth / 2
    const day = Number(hex[doubleMonth])
    return new Date(year, month, day);
};
// 阴历相关计算函数(获得数字年份/月份/日期 等)
const fnLunarDate = {
    calculate: function (q) {
        return tianGan[q % 10] + diZhi[q % 12]
    },
    getGzYear: function (s, q) {
        return this.calculate(s - 1900 + 36 - (q === s ? 0 : 1))
    },
    getGzMonth: function (q, r, s) {
        var t = getLeapYearTime(r, q.getMonth() * 2);
        return this.calculate((r - 1900) * 12 + s + 12 - (q < t ? 1 : 0))
    },
    getGzDay: function (q) {
        return this.calculate(Math.ceil(q / 86400000 + 25567 + 10))
    }
};

const zeroPad = function (num) { // 填充零
    return num < 10 ? "0" + num : num;
};
const getFestival = function (oDate, lunarInfo) {
    const _year = oDate.getFullYear();
    const _month = oDate.getMonth() + 1;
    const _date = oDate.getDate();
    const _day = oDate.getDay();
    const _week = Math.ceil(_date / 7);
    const _extra = zeroPad(_month) + _week + _day;
    const _traditional = "t" + zeroPad(lunarInfo.lunarMonth) + zeroPad(lunarInfo.lunarDay);
    const _normal = zeroPad(_month) + zeroPad(_date);
    let arrHolidays: string[] | any = [];
    let item;
    if (lunarInfo.lunarMonth === 12 && lunarInfo.lunarDay === (lunarInfo.isBigMonth ? 30 : 29)) {
        arrHolidays.push("t,除夕");
    }

    if (oFestivals.extra[_extra]) {
        arrHolidays = [oFestivals.extra[_extra]]
    }
    if (oFestivals[_normal]) {
        arrHolidays = arrHolidays.concat([oFestivals[_normal]])
    }
    if (oFestivals[_traditional]) {
        arrHolidays = arrHolidays.concat([oFestivals[_traditional]])
    }
    // arrHolidays = arrHolidays.concat([oFestivals.extra[_extra], oFestivals[_normal], oFestivals[_traditional]]);

    let i = 0;
    for (; i < arrHolidays.length; i++) {
        if (arrHolidays[i]) {
            item = arrHolidays[i].split(",");
            if (item[2] && _year < item[2]) {
                arrHolidays[i] = null;
                continue;
            }
            arrHolidays[i] = {
                type: item[0] || '',
                desc: item[1] || '',
                value: item[1] || ''
            }
        }
    }
    arrHolidays.sort(function (a, b) { // 按 type 字母倒序排列(靠后的字母权重高，会排到前面)
        if (a && b) {
            return b.type.charCodeAt(0) - a.type.charCodeAt(0)
        }
        return !a ? 1 : -1;
    });

    return arrHolidays.map(hol => {
        if (hol) {
            return hol || '';
        }
    })
};
const init = function (oDate) {
    const _year = oDate.getFullYear();
    const _month = oDate.getMonth() + 1;
    const _date = oDate.getDate();
    const doubleMonth = (_month - 1) * 2;
    const s = getLeapYearTime(_year, doubleMonth);
    let q;
    let solarTerm = "";
    // let holiday = '';
    if (_date != s.getDate()) {
        q = getLeapYearTime(_year, doubleMonth + 1);
        if (_date == q.getDate()) {
            solarTerm = arrSolarTerms[doubleMonth + 1]
        }
    } else {
        solarTerm = arrSolarTerms[doubleMonth]
    }
    const lunarInfo = fnLunarTmp.sloarToLunar(_year, _month, _date);
    const weekDay = oDate.getDay();
    const festivals = getFestival(oDate, lunarInfo) || [];
    return {
        animal: arrAnimals[(lunarInfo.lunarY - 4) % 12],               // 生肖
        gzDate: fnLunarDate.getGzDay(oDate),                              // 阴历日期
        gzMonth: fnLunarDate.getGzMonth(oDate, _year, _month),             // 阴历月份
        gzYear: fnLunarDate.getGzYear(_year, lunarInfo.lunarYear), // 阴历年份
        lunarYear: lunarInfo.lunarYear,                                      // 阴历数字年份
        lunarMonth: lunarInfo.lunarMonth,                                     // 阴历数字月份
        lunarDate: lunarInfo.lunarDay,                                       // 阴历数字日期
        lMonth: lunarInfo.lunarM,
        lDate: lunarInfo.lunarD,
        lYear: lunarInfo.lunarY,

        solarTerm: solarTerm, // 节气
        //festival: function() { // 没啥用
        //    return getFestival(oDate, lunarInfo);
        //},
        festivals: festivals,                 // 获取对应的节假日
        isBigMonth: lunarInfo.isBigMonth,      // 阴历: 30天为true, 29天为false
        oDate: oDate,                     // 公历日期对象
        weekDay: weekDay,                   // 公历一周中的第几天，从0开始(0表示周日)
        cnWeekDay: "日一二三四五六".charAt(weekDay), // 公历星期几
        holiday: festivals.length ? festivals[0] && festivals[0].value : solarTerm ? solarTerm : '' // 如果有多个节假日，返回一个(有节日则返回权重最高的一个，没有的话就返回节气，再没有就返回空值)
    };
};

export default init;