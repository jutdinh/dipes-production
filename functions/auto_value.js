const { vietnameseChars } = require('./vietnamese-chars');

const id = () => {
    return 'id' + (new Date()).getTime();
}

const formatDecNum = (num) => {
    if( num < 10 ){
        return `0${num}`
    }
    return num.toString()
}

const translateUnicodeToBlanText = (text) => {
    let blanText = text;
    for( let i = 0; i < vietnameseChars.length; i++ ){
        const char = vietnameseChars[i];
        const { base, unicode, unicodeWithSound } = char.base;
        for( let j = 0 ; j < unicode.length; j++ ){
            const unichar = unicode[j];
            blanText = blanText.replaceAll( unichar, base );
        }
        
        for( let j = 0; j < unicodeWithSound.length; j++ ){
            const soundChar = unicodeWithSound[j];
            blanText = blanText.replaceAll(soundChar, base);
        }
    }
    return blanText
}



module.exports = {
    autoID: id,
    formatDecNum,
    translateUnicodeToBlanText
}