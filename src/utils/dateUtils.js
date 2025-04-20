import { setCookie, getCookie, removeCookie, checkCookie } from './cookieUtils';


export function compareDateTimes(firstDateTime, secondDateTime = null) {
    const [firstDateFormatted, firstTimeWithZ] = firstDateTime.split('T');
    const firstTimeFormatted = firstTimeWithZ ? firstTimeWithZ.replace('Z', '') : undefined;

    const result = {
        date: firstDateFormatted,
        time: firstTimeFormatted,
        matching_date: false
    };

    if (secondDateTime !== null) {
        const [secondDateFormatted] = secondDateTime.split('T');
        result.matching_date = firstDateFormatted === secondDateFormatted;
    }

    setCookie('lastMessageTime', firstDateTime, 1);
    return result;
}

export function formatTime(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'short', day: '2-digit' });
}