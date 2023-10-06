import { v4 as uuidv4 } from 'uuid';
import responseMessages from "../../cpn/enum/response-code"
import Swal from 'sweetalert2';

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

const showApiResponseMessage = (status) => {
    const langItem = (localStorage.getItem("lang") || "Vi").toLowerCase(); // fallback to English if no language is set
    const message = responseMessages[status];

    const title = message?.[langItem]?.type || "Unknown error";
    const description = message?.[langItem]?.description || "Unknown error";
    const icon = (message?.[langItem]?.type === "Thành công" || message?.[langItem]?.type === "Success") ? "success" : "error";

    Swal.fire({
        title,
        text: description,
        icon,
        showConfirmButton: false,
        timer: 1500,
    }).then(() => {
        if (icon === "success") {
            window.location.reload();

        }
    });
};

function formatNumberWithCommas(number) {
	if( floatValidate( number ) ){
		let numberString = number.toString();
		const parts = numberString.split(".");
		let integerPart = parts[0];
		let decimalPart = parts[1];

		integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		if (decimalPart) {
		  	numberString = integerPart + "." + decimalPart;
		} else {
		  	numberString = integerPart;
		}
		return numberString;
	}
	return "INVALID VALUE"  
}

const floatValidate = ( number ) => {
    if( number != undefined){
        const numberString = number.toString()
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
        let valid = true
        for( let i = 0; i < numberString.length ; i++ ){
            const char = numberString[i]
            if( numbers.indexOf( char ) === -1 ){
                valid = false
            }
        }
        return valid;
    }else{
        return false
    }
}

const formatNumber = (num) => {
    if (num == null || isNaN(num)) {
        return '0';
    }

    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function generateUniqueColors(num) {
    const step = Math.cbrt((256 * 256 * 256) / num);
    const colors = [];

    for (let r = 0; r < 256; r += step) {
        for (let g = 0; g < 256; g += step) {
            for (let b = 0; b < 256; b += step) {
                if (colors.length >= num) {
                    return colors;
                }
                if (r === 0 && g === 0 && b === 0) {
                    // Bỏ qua màu đen
                    continue;
                }
                const color = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
                colors.push(color);
            }
        }
    }
    return colors;
}


export default {
    uid, removeDuplicate, titleCase, openTab, dateGenerator, renderDateTimeByFormat,
    showApiResponseMessage, formatNumberWithCommas, formatNumber, generateUniqueColors
}
