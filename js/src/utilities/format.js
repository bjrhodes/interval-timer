var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.format = function() {

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
    function duration(seconds) {
        var minutes, hours;
        if (seconds < 60) {
            return seconds + 's';
        }
        minutes = Math.floor(seconds / 60);
        seconds = seconds - (minutes * 60);
        if (minutes < 60) {
            return minutes + ':' + zeropad(seconds);
        }

        hours = Math.floor(minutes / 60);
        minutes = minutes - (hours * 60);

        return hours + ':' + zeropad(minutes) + ':' + zeropad(seconds);
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
        duration: duration,
    }
};
