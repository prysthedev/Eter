module.exports = {
    async convertTime(duration) {
        if (duration.endsWith('d')) {
            duration = parseInt(duration);
            duration = (duration * 24 * 60 * 60);
        } else if (duration.endsWith('m')) {
            duration = parseInt(duration);
            duration = (duration * 60);
        } else if (duration.endsWith('h')) {
            duration = parseInt(duration);
            duration = (duration * 60 * 60);
        } else if (duration.endsWith('w')) {
            duration = parseInt(duration);
            duration = (duration * 7 * 24 * 60 * 60);
        } else if (duration.endsWith('y')) {
            duration = parseInt(duration);
            duration = (duration * 365 * 24 * 60 * 60);
        };
    
        return duration;
    },
    
    async convertTimeToReadable(duration) {
        if (duration == null) {
            duration = 'Permanent'
            
            return duration;
        };
    
        if (duration.endsWith('d')) {
            duration = parseInt(duration);
            if (duration > 1) {
                duration = `${duration} days`;
            } else {
                duration = `${duration} day`;
            };
        } else if (duration.endsWith('m')) {
            duration = parseInt(duration);
            if (duration > 1) {
                duration = `${duration} minutes`;
            } else {
                duration = `${duration} minute`;
            };
        } else if (duration.endsWith('h')) {
            duration = parseInt(duration);
            if (duration > 1) {
                duration = `${duration} hours`;
            } else {
                duration = `${duration} hour`;
            };
        } else if (duration.endsWith('w')) {
            duration = parseInt(duration);
            if (duration > 1) {
                duration = `${duration} weeks`;
            } else {
                duration = `${duration} week`;
            };
        } else if (duration.endsWith('y')) {
            duration = parseInt(duration);
            if (duration > 1) {
                duration = `${duration} years`;
            } else {
                duration = `${duration} year`;
            };
        };
    
        return duration;
    }
};