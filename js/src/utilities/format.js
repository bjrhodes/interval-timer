window.mml = window.mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.format = () => {

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
        let str = '';

        if (times.hours) {
            str += times.hours + ' hour' + (times.hours === 1 ? '' : 's');
        }
        if (times.minutes) {
            str += str.length ? ', ' : '';
            str += times.minutes + ' minute' + (times.minutes === 1 ? '' : 's');
        }
        if (times.seconds) {
            str += str.length ? ', ' : '';
            str += times.seconds + ' second' + (times.seconds === 1 ? '' : 's');
        }

        return str;
    };

    /**
     * Converts a number of units into seconds
     * @param  {integer} time  number of units
     * @param  {string} units one of hours, minutes or seconds
     * @return integer time in seconds
     */
    const timeInSeconds = (time, units) => {
        switch (units) {
            case 'hours':
                time = time * 60;
                // intentional fallthrough. Should accumulate actions
            case 'minutes':
                time = time * 60;
        }

        return time;
    };

    return {
        timeInSeconds: timeInSeconds,
        durationAsClock: durationAsClock,
        durationAsWords: durationAsWords,
    };
};
