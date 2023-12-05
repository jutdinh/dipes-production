import { v4 as uuidv4 } from 'uuid';
import responseMessages from "../../cpn/enum/response-code"
import Swal from 'sweetalert2';
import { format, parseISO } from 'date-fns';

const dateGenerator = (dateString) => {
    const date = new Date(dateString);
    return `${formatDateNumber(date.getDate())}/${formatDateNumber(date.getMonth() + 1)}/${date.getFullYear()} lúc ${formatDateNumber(date.getHours())}:${formatDateNumber(date.getMinutes())}`
}

const formatDateNumber = (int) => {
    if (int < 10) {
        return `0${int}`
    } else {
        return `${int}`
    }
}

const openTab = (url) => {
    // window.open(url, '_blank').focus();
    window.location = url;
}



function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

const uid = () => {
    let id = uuidv4();
    id = id.replaceAll('-', '');
    return `#${id}`
}

const removeDuplicate = (data) => {

    const uniqueArray = data.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === data.findIndex(obj => {
            return JSON.stringify(obj) === _value;
        });
    });
    return uniqueArray
}

const numberOfLength2Format = (number) => {
    if (number < 10) {
        return `0${number}`
    }
    return `${number}`
}

const renderDateTimeByFormat = (dateString, format) => {
    if (format) {
        const date = new Date(dateString);
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
    if (floatValidate(number)) {
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

const floatValidate = (number) => {
    if (number != undefined) {
        const numberString = number.toString()
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
        let valid = true
        for (let i = 0; i < numberString.length; i++) {
            const char = numberString[i]
            if (numbers.indexOf(char) === -1) {
                valid = false
            }
        }
        return valid;
    } else {
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
function formatDate(isoString) {
    if (!isoString) return "";

    try {
        const date = parseISO(isoString); // parse ISO string
        return format(date, 'dd-MM-yyyy  HH:mm:ss'); // format date
    } catch (error) {

        return "";  // or maybe return a default date or another string to indicate the error
    }
}
function formatDateCase(isoString) {
    if (!isoString) return "";

    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
        console.error(error);
        return "";  // or maybe return a default date or another string to indicate the error
    }
}

function formatDateMessage(isoString) {
    if (!isoString) return "";

    try {
        const date = new Date(isoString);

        // Định dạng ngày
        const day = date.getDate();
        let daySuffix;
        switch (day) {
            case 1: case 21: case 31: daySuffix = 'st'; break;
            case 2: case 22: daySuffix = 'nd'; break;
            case 3: case 23: daySuffix = 'rd'; break;
            default: daySuffix = 'th';
        }

        // Định dạng tháng và năm
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();

        // Định dạng thời gian
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

        // Sử dụng dấu phẩy chỉ một lần để tách ngày tháng và năm với thời gian
        return `${month} ${day}${daySuffix}, ${year} ${formattedTime}`;
    } catch (error) {
        console.error(error);
        return "";
    }
}

function translateDateToVietnamese(dateString) {
    const monthNames = {
        "Jan": "tháng 1",
        "Feb": "tháng 2",
        "Mar": "tháng 3",
        "Apr": "tháng 4",
        "May": "tháng 5",
        "Jun": "tháng 6",
        "Jul": "tháng 7",
        "Aug": "tháng 8",
        "Sep": "tháng 9",
        "Oct": "tháng 10",
        "Nov": "tháng 11",
        "Dec": "tháng 12"
    };
    if (!dateString) {
        return "Ngày không xác định";
    }
    const parts = dateString.split(' ');
    const month = monthNames[parts[0]];
    const day = parts[1].replace(',', '');
    const year = parts[2];

    return `${day} ${month}, ${year}`;
}

function translateDateTimeToVietnamese(dateTimeString) {
    const monthNames = {
        "Jan": "1",
        "Feb": "2",
        "Mar": "3",
        "Apr": "4",
        "May": "5",
        "Jun": "6",
        "Jul": "7",
        "Aug": "8",
        "Sep": "9",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12"
    };

    // Tách ngày và thời gian
    const parts = dateTimeString.split(' ');
    if (parts.length < 4) {
        return "Định dạng ngày giờ không đúng";
    }

    const month = monthNames[parts[0]];
    if (!month) {
        return "Tháng không xác định";
    }

    // Loại bỏ kí tự không cần thiết từ ngày (ví dụ: "30th," -> "30")
    const day = parts[1].replace(/(st|nd|rd|th),/, '');
    const year = parts[2];
    const time = parts[3]; // Thời gian nằm ở phần tử thứ 4 của mảng

    // Định dạng lại ngày giờ theo yêu cầu
    return `${day}/${month}/${year} ${time}`;
}

const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

function isImageFormat(fileName) {
    const imageFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'svg'];
    return imageFormats.includes(fileName.split('.').pop().toLowerCase());
}

function isVideoFormat(fileName) {
    const videoFormats = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'mkv', 'webm'];
    return videoFormats.includes(fileName.split('.').pop().toLowerCase());
}








export default {
    uid, removeDuplicate, titleCase, openTab, dateGenerator, renderDateTimeByFormat,
    showApiResponseMessage, formatNumberWithCommas, formatNumber, generateUniqueColors,
    formatDate, formatDateCase, formatDateMessage, translateDateToVietnamese, translateDateTimeToVietnamese, isEmpty,
    isImageFormat, isVideoFormat
}
