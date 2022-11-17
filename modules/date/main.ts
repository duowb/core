class fastjsDate {
    constructor(format: string, date: number = new Date().getTime()) {
        /*
         * Y = year
         * M = month
         * D = day
         *
         * H = hour (12)
         * A = AM/PM
         * a = am/pm
         * h = hour (24)
         * m = minute
         * s = second
         * S = millisecond
         *
         * <any> to ignore (eg. "<date>: Y-M-D h:m:s")
         */

        this.format = format;
        this.date = date;
        this.createAt = new Date().getTime();
        this.construct = "fastjsDate";
    }

    toString() {
        let timestamp: number = this.toNumber();
        const date: Date = new Date(timestamp);
        const year: number = date.getFullYear();
        const month: number = date.getMonth() + 1;
        const day: number = date.getDate();
        const hour: number = date.getHours();
        const minute: number = date.getMinutes();
        const second: number = date.getSeconds();
        const millisecond: number = date.getMilliseconds();
        const ampm: string = hour >= 12 ? "PM" : "AM";
        const ampm2: string = hour >= 12 ? "pm" : "am";
        const hour12: number = hour % 12;

        let string = this.format;

        // ignore
        let token = 0
        let ignoreTemp = []
        // check ignore format
        while ((/<.*?>/.test(string))) {
            const match = string.match(/<.*?>/);
            if (match === null) break;
            // get user ignore text
            const matchString = match[0];
            // noinspection UnnecessaryLocalVariableJS
            const exactString = matchString.replace(/</g, "").replace(/>/g, "");
            ignoreTemp[token] = exactString;
            // replace ignore text to token
            string = string.replace(/<.*?>/, `{{*${token}}}`);
            token++;
        }

        interface replaceFormat {
            0: string
            1: string | number
        }

        // replace format
        const replaceFormatList: Array<replaceFormat> = [
            ["Y", year],
            ["M", month],
            ["D", day],
            ["H", hour12],
            ["A", ampm],
            ["a", ampm2],
            ["h", hour],
            ["m", minute],
            ["s", second],
            ["S", millisecond]
        ]
        replaceFormatList.forEach((e: replaceFormat) => {
            // replace keyword
            string = string.replaceAll(e[0], String(e[1]));
        })

        // replace ignore
        ignoreTemp.forEach((ignoreText: string, key: number) => {
            string = string.replace(`{{*${key}}}`, ignoreText);
        })

        return string;
    }

    toNumber() {
        const timeLeft = new Date().getTime() - this.createAt;
        return this.date + timeLeft;
    }

    format: string;
    date: number;
    createAt: number;
    construct: string;
}