export const format = () => {

    const splitDurations = (seconds) => {
        const totalMinutes = Math.floor(seconds / 60); // count how many minutes
        const hours = Math.floor(totalMinutes / 60); // count how many hours

        return {
            hours: hours,
            minutes: totalMinutes - (hours * 60), // subtract the hours from the total minutes
            seconds: seconds - (totalMinutes * 60), // subtract the minutes from the total seconds
        };
    };

    const zeropad = (num) => {
        const str = '' + num;
        if (num === 0) {
            return '00';
        }
        return (str.length === 1) ? '0' + str : str;
    };

    /**
     * Takes a number of seconds as an integer and returns a formatted duration string
     */
    const durationAsClock = (seconds) => {
        const times = splitDurations(seconds);
        return times.hours + ':' + zeropad(times.minutes) + ':' + zeropad(times.seconds);
    };

    const durationAsWords = (seconds) => {
        const times = splitDurations(seconds);
        const parts = [
            [times.hours, 'hour'],
            [times.minutes, 'minute'],
            [times.seconds, 'second'],
        ];

        return parts
            .filter(([count]) => count)
            .map(([count, unit]) => count + ' ' + unit + (count === 1 ? '' : 's'))
            .join(', ');
    };

    /**
     * Converts a number of units into seconds
     * @param  {integer} time  number of units
     * @param  {string} units one of hours, minutes or seconds
     * @return integer time in seconds
     */
    const secondsPerUnit = {
        hours: 3600,
        minutes: 60,
    };

    const timeInSeconds = (time, units) => {
        return time * (secondsPerUnit[units] || 1);
    };

    return {
        timeInSeconds: timeInSeconds,
        durationAsClock: durationAsClock,
        durationAsWords: durationAsWords,
    };
};
