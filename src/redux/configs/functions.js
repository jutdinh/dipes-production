import { v4 as uuidv4 } from 'uuid';

const dateGenerator = ( dateString ) => {
    const date = new Date( dateString );
    return `${ formatDateNumber(date.getDate()) }/${ formatDateNumber(date.getMonth() + 1) }/${ date.getFullYear() } lúc ${ formatDateNumber(date.getHours()) }:${ formatDateNumber(date.getMinutes()) }`
}

const formatDateNumber = (int) => {
    if( int < 10 ){
        return `0${int}`
    }else{
        return `${int}`
    }
}

const openTab = (url) => {
    // window.open(url, '_blank').focus();
    window.location = url;
}



function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

const uid = () => {
    let id = uuidv4();
    id = id.replaceAll('-', '');
    return `#${ id }`
}

const removeDuplicate = ( data ) => {

    const uniqueArray = data.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === data.findIndex(obj => {
            return JSON.stringify(obj) === _value;
        });
    });
    return uniqueArray
}

const numberOfLength2Format = (number) => {
    if( number < 10 ){
        return `0${number}`
    }
    return `${number}`
}

const renderDateTimeByFormat = ( dateString, format ) => {
    if( format ){
        const date = new Date( dateString );
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const secs = date.getSeconds()

        let result = format;
        result = result.replaceAll("dd", numberOfLength2Format(day));
        result = result.replaceAll("MM", numberOfLength2Format(month));
        result = result.replaceAll("yyyy", year);
    
        result = result.replaceAll("hh", numberOfLength2Format(hour));
        result = result.replaceAll("mm", numberOfLength2Format(minute));
        result = result.replaceAll("ss", numberOfLength2Format(secs));
    
        return result;
    }
    return dateString
}
export default {
    uid, removeDuplicate, titleCase, openTab, dateGenerator, renderDateTimeByFormat
}
