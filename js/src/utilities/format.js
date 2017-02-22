var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.format = function() {

    function splitDurations(seconds) {
        var minutes, hours;

        minutes = Math.floor(seconds / 60); // count how many minutes
        seconds = seconds - (minutes * 60); // subtract the minutes from the total seconds
        hours = Math.floor(minutes / 60); // count how many hours
        minutes = minutes - (hours * 60); // subtract the hours from the total minutes

        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        }
    }

    function zeropad(num) {
        var str = '' + num;
        if (num === 0) {
            return '00';
        }
        return (str.length === 1) ? '0' + str : str;
    }

    /**
     * Takes a number of seconds as an integer and returns a formatted duration string
     */
    function durationAsClock(seconds) {
        var times = splitDurations(seconds);
        return times.hours + ':' + zeropad(times.minutes) + ':' + zeropad(times.seconds);
    }

    function durationAsWords(seconds) {
        var times = splitDurations(seconds),
            str = '';

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
    }

    /**
     * Converts a number of units into seconds
     * @param  {integer} time  number of units
     * @param  {string} units one of hours, minutes or seconds
     * @return integer time in seconds
     */
    function timeInSeconds(time, units) {
        switch (units) {
            case 'hours':
                time = time * 60;
                // intentional fallthrough. Should accumulate actions
            case 'minutes':
                time = time * 60;
        }

        return time;
    }

    return {
        timeInSeconds: timeInSeconds,
        durationAsClock: durationAsClock,
        durationAsWords: durationAsWords,
    }
};
