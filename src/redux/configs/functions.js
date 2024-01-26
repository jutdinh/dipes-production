import { v4 as uuidv4 } from 'uuid';
import responseMessages from "../../cpn/enum/response-code"
import Swal from 'sweetalert2';
import { format, parseISO } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import { detect } from 'detect-browser';




// function findPageById(data, pageId) {
//     for (const item of data) {
//         if (item.page_id === pageId) {
//             return item; // Tìm thấy ở cấp hiện tại
//         }

//         if (item.children && item.children.length > 0) {
//             const foundInChild = findPageById(item.children, pageId);
//             if (foundInChild) {
//                 return foundInChild; // Tìm thấy ở cấp con
//             }
//         }
//     }
//     return null; // Không tìm thấy
// }

function findPageById(data, pageId) {

    for (const item of data) {
        if (item.page_id === pageId) {

            return item; // Tìm thấy ở cấp hiện tại
        }

        if (item.component && item.component.length > 0) {
            const foundInComponent = findPageById(item.component, pageId);

            if (foundInComponent) {
                return foundInComponent; // Tìm thấy ở cấp con trong thành phần
            }
        }

        if (item.children && item.children.length > 0) {
            const foundInChild = findPageById(item.children, pageId);

            if (foundInChild) {
                return foundInChild; // Tìm thấy ở cấp con
            }
        }
    }
    return null; // Không tìm thấy
}


function findGetApi(data) {
    //console.log(5656, data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.source ? tableComponent.props.source.get.url : '';
    }
    return null;
}

// function findGetApi(data) {
//     if (data && data.component && Array.isArray(data.component)) {
//         const tableComponents = data.component.filter(comp => comp.name === "table");
//         const urls = [];

//         for (const tableComponent of tableComponents) {
//             if (tableComponent.props && tableComponent.props.source && tableComponent.props.source.get && tableComponent.props.source.get.url) {
//                 urls.push(tableComponent.props.source.get.url);
//             }
//         }

//         return urls;
//     }

//     return [];
// }




function findPostApi(data) {
    //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {


        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.buttons ? tableComponent.props.buttons.add.api.url : '';
    }

    return null;
}

// function findPostApi(data) {
//     if (data && data.component && Array.isArray(data.component)) {
//         // Tìm tất cả các thành phần "table" trong trang
//         const tableComponents = data.component.filter(comp => comp.name === "table");
//         //console.log("Data 1")
//         for (const tableComponent of tableComponents) {
//             if (tableComponent.props && tableComponent.props.buttons) {
//                 return tableComponent.props.buttons.add.api.url;
//             }
//         }

//         // Nếu không tìm thấy trong các thành phần "table", hãy tìm trong các thành phần "flex" con
//         for (const tableComponent of tableComponents) {
//             if (tableComponent.props && tableComponent.props.flex && Array.isArray(tableComponent.props.flex.children)) {
//                 //console.log("Data 1")
//                 for (const child of tableComponent.props.flex.children) {
//                     if (child.component) {
//                         //console.log("Data 2")
//                         const childTableComponents = child.component.filter(comp => comp.name === "table");
//                         for (const childTableComponent of childTableComponents) {
//                             if (childTableComponent.props && childTableComponent.props.buttons) {
//                                 //console.log("Data 3")
//                                 //console.log(456,childTableComponent.props.buttons.add.api.url)
//                                 return childTableComponent.props.buttons.add.api.url;
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     return null;
// }




function findPutApi(data) {
    //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.buttons ? tableComponent.props.buttons.update.api : '';
    }
    return null;
}

// function findPutApi(data, url) {
//     //console.log(data);
//     if (data && data.component && Array.isArray(data.component)) {
//         const tableComponent = data.component.find(comp => comp.name === "table");
//         if (tableComponent && tableComponent.props && tableComponent.props.buttons) {
//             const updateApi = tableComponent.props.buttons.update.api;
//             if (updateApi && updateApi.url.split('/')[2] === url) {
//                 return updateApi;
//             }
//         }
//     }
//     return null;
// }

function findDeleteApi(data) {
    // //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.buttons ? tableComponent.props.buttons.delete.api : '';
    }
    return null;
}


function findComponentWithDeleteApiUrl(data, url) {
    //console.log(data);
    if (data && data.component && Array.isArray(data.component)) {
        for (let i = 0; i < data.component.length; i++) {
            const component = data.component[i];
            if (component.props && component.props.buttons && component.props.buttons.delete && component.props.buttons.delete.api) {
                const deleteApi = component.props.buttons.delete.api;
                if (deleteApi.url === url) {
                    return component.props.buttons.delete.api;
                }
            }
        }
    }
    return null;
}



function findDetailApi(data) {
    // //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.buttons ? tableComponent.props.buttons.detail.api.url : '';
    }
    return null;
}

function findExportApi(data) {
    // //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.buttons ? tableComponent.props.buttons.export.api.url : '';
    }
    return null;
}

function findSearchApi(data) {
    // //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props.source ? tableComponent.props.source.search.url : '';
    }
    return null;
}
function findRowsPerPage(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }


    return data.visibility ? data.visibility.row_per_page : '';


}

function getNamePage(data) {
    if (data && data.component && Array.isArray(data.component)) {
        // Tìm kiếm thành phần có tên là "table"
        const tableComponent = data.component.find(comp => comp.name === "table");
        if (tableComponent && tableComponent.props) {
            return tableComponent.props;
        }

        // Nếu không tìm thấy "table", tìm kiếm thành phần có tên là "flex"
        const flexComponent = data.component.find(comp => comp.name === "flex");
        return flexComponent ? flexComponent.children : null;
    }
    return null;
}

const findPropsNameAddByUrl = (data, targetUrl) => {

    // Kiểm tra xem mảng component có tồn tại và đúng định dạng không
    if (!data || typeof data !== 'object' || !Array.isArray(data.component)) {
        return null;
    }

    // Duyệt qua từng đối tượng trong mảng component
    for (const component of data.component) {
        // Kiểm tra xem đối tượng có chứa button.add.api.url phù hợp không
        if (component.props && component.props.buttons && component.props.buttons.add &&
            component.props.buttons.add.api && component.props.buttons.add.api.url.split('/')[2] === targetUrl) {
            // Trả về giá trị của props.name
            return component.props.name;
        }
    }

    // Trả về null nếu không tìm thấy
    return null;
};

const findPropsNameUpdateByUrl = (data, targetUrl) => {


    // Kiểm tra xem mảng component có tồn tại và đúng định dạng không
    if (!data || typeof data !== 'object' || !Array.isArray(data.component)) {
        return null;
    }

    // Duyệt qua từng đối tượng trong mảng component
    for (const component of data.component) {
        // Kiểm tra xem đối tượng có chứa button.add.api.url phù hợp không
        if (component.props && component.props.buttons && component.props.buttons.update &&
            component.props.buttons.update.api && component.props.buttons.update.api.url.split('/')[2] === targetUrl) {
            // Trả về giá trị của props.name
            return component.props.name;
        }
    }
    // Trả về null nếu không tìm thấy
    return null;
};

const findPropsNameDetailByUrl = (data, targetUrl) => {

    // Kiểm tra xem mảng component có tồn tại và đúng định dạng không
    if (!data || typeof data !== 'object' || !Array.isArray(data.component)) {
        return null;
    }

    // Duyệt qua từng đối tượng trong mảng component
    for (const component of data.component) {
        // Kiểm tra xem đối tượng có chứa button.add.api.url phù hợp không
        if (component.props && component.props.buttons && component.props.buttons.detail &&
            component.props.buttons.detail.api && component.props.buttons.detail.api.url.split('/')[2] === targetUrl) {
            // Trả về giá trị của props.name
            return component.props.name;
        }
    }
    // Trả về null nếu không tìm thấy
    return null;
};


const findPropsNameImportByUrl = (data, targetUrl) => {

    // Kiểm tra xem mảng component có tồn tại và đúng định dạng không
    if (!data || typeof data !== 'object' || !Array.isArray(data.component)) {
        return null;
    }

    // Duyệt qua từng đối tượng trong mảng component
    for (const component of data.component) {
        // Kiểm tra xem đối tượng có chứa button.add.api.url phù hợp không
        if (component.props && component.props.buttons && component.props.buttons.import &&
            component.props.buttons.import.api && component.props.buttons.import.api.url.split('/')[2] === targetUrl) {
            // Trả về giá trị của props.name
            return component.props.name;
        }
    }
    // Trả về null nếu không tìm thấy
    return null;
};

















function getComponentText(data) {
    // //console.log(data)
    if (data && data.component && Array.isArray(data.component)) {
        const tableComponent = data.component.find(comp => comp.name === "table");
        return tableComponent && tableComponent.props && tableComponent.props ? tableComponent.props : '';
    }
    return null;
}

function extractValuesFromData(apiInfo, data) {


    if (typeof data !== 'object' || data === null) {
        // Nếu data không phải là một đối tượng hoặc là null, trả về null
        return null;
    }

    const fields = apiInfo.fields || [];
    const params = apiInfo.params || [];

    // Tạo một map từ id của field đến fomular_alias
    const fieldIdToAlias = fields.reduce((map, field) => {
        map[field.id] = field.fomular_alias;
        return map;
    }, {});
    //console.log(fieldIdToAlias);

    // Lặp qua các params và trả về giá trị đầu tiên tìm thấy
    for (let param of params) {
        const fomularAlias = fieldIdToAlias[param];
        if (fomularAlias && data.hasOwnProperty(fomularAlias)) {
            return data[fomularAlias];
        }
    }

    return null;
}


const renderBoolData = (data, field) => {
    const IF_TRUE = field.DEFAULT_TRUE;
    const IF_FALSE = field.DEFAULT_FALSE
    if (data != undefined) {
        if (data) {
            return IF_TRUE ? IF_TRUE : "true"
        }
        return IF_FALSE ? IF_FALSE : "false"
    } else {
        return IF_FALSE ? IF_FALSE : "false"
    }
}

const renderData = (field, data) => {
    // //console.log(field)
    if (data) {
        switch (field.DATATYPE) {
            case "DATE":
            case "DATETIME":
                return renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT);
            case "DECIMAL":
            case "DECIMAL UNSIGNED":
                const { DECIMAL_PLACE } = field;
                const decimalNumber = parseFloat(data[field.fomular_alias]);
                return decimalNumber.toFixed(DECIMAL_PLACE)
            case "BOOL":
                return renderBoolData(data[field.fomular_alias], field)
            default:
                return data[field.fomular_alias];
        }
    } else {
        return "Invalid value"
    }
};

function getBrowser() {
    const browserInfo = detect();
    if (browserInfo) {
        return browserInfo.name;
    }
    return "Unknown";
}


function detectBrowser(userAgent) {
    const isFirefox = typeof userAgent.InstallTrigger !== 'undefined';
    const isChrome = !!userAgent.chrome && (!!userAgent.chrome.webstore || !!userAgent.chrome.runtime);

    const isSafari = /constructor/i.test(userAgent.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!userAgent['safari'] || (typeof userAgent.safari !== 'undefined' && userAgent.safari.pushNotification));

    const isOpera = (!!userAgent.opr && !!userAgent.opr.addons) || !!userAgent.opera || (userAgent.userAgent && userAgent.userAgent.indexOf(' OPR/') >= 0); // Kiểm tra userAgent tồn tại trước khi thực hiện indexOf

    const isIE = /*@cc_on!@*/false || !!userAgent.documentMode;
    const isEdge = !isIE && !!userAgent.StyleMedia;
    const isEdgeChromium = isChrome && (userAgent.userAgent && userAgent.userAgent.indexOf("Edg") !== -1); // Kiểm tra userAgent tồn tại trước khi thực hiện indexOf

    const isBlink = (isChrome || isOpera) && !!userAgent.CSS;

    const browserInfo = {
        isFirefox,
        isChrome,
        isSafari,
        isOpera,
        isIE,
        isEdge,
        isEdgeChromium,
        isBlink
    };

    return browserInfo;
}



const dateGenerator = (dateString) => {
    const date = new Date(dateString);
    return `${formatDateNumber(date.getDate())}/${formatDateNumber(date.getMonth() + 1)}/${date.getFullYear()} lúc ${formatDateNumber(date.getHours())}:${formatDateNumber(date.getMinutes())}`
}

function getAllParamsAfterPageId(currentURL, pageId) {
    const parts = currentURL.split('/');
    const pageIdIndex = parts.indexOf(pageId); // Tìm vị trí của "page_Id" trong mảng
    if (pageIdIndex !== -1 && pageIdIndex < parts.length - 1) {
        const params = parts.slice(pageIdIndex + 1); // Lấy tất cả các phần tử sau "page_Id"
        return params;
    }
    return [];
}

function getTokenExpirationDate(token) {
    if (typeof token !== 'string' || !token.trim()) {
        // console.error('Token phải là một chuỗi hợp lệ.');
        return null;
    }

    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) {
            return null;
        }

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return decoded.exp;
    } catch (error) {
        // console.error('Lỗi khi giải mã token:', error);
        return null;
    }
}


function isTokenExpired(token) {
    const expirationDate = getTokenExpirationDate(token);
    // //console.log(expirationDate)
    return expirationDate < new Date();
}

function refreshToken(proxy, token) {
    // //console.log(token)
    if (token) {
        return fetch(`${proxy}/auth/refreshtoken`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token
            }),
        })
            .then((res) => res.json())
            .then((resp) => {
                const { success, content, token, status } = resp;
                if (success) {
                    return token;
                } else {
                    throw new Error(content || 'Unable to refresh token');
                }
            });

    }
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

// Day ISO

// function formatDateCase(isoString) {
//     if (!isoString) return "";

//     try {
//         const date = new Date(isoString);
//         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//     } catch (error) {
//         console.error(error);
//         return "";  // or maybe return a default date or another string to indicate the error
//     }
// }

//
function formatDateCase(dateString) {
    if (!dateString) return "";

    try {
        // Trích xuất phần số mili giây từ chuỗi
        const match = dateString.match(/\/Date\((\d+)\+\d+\)\//);
        if (!match) throw new Error("Invalid date format");

        const milliseconds = parseInt(match[1]);

        // Tạo đối tượng Date từ số mili giây và chuyển nó sang múi giờ UTC+7
        const date = new Date(milliseconds + 7 * 60 * 60 * 1000); // Thêm 7 giờ để chuyển sang UTC+7

        // Chuyển đổi thành định dạng ngày tháng
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
        // console.error(error);
        return "";
    }
}

//Day ISO
// function formatDateMessage(isoString) {
//     if (!isoString) return "";

//     try {
//         const date = new Date(isoString);

//         // Định dạng ngày
//         const day = date.getDate();
//         let daySuffix;
//         switch (day) {
//             case 1: case 21: case 31: daySuffix = 'st'; break;
//             case 2: case 22: daySuffix = 'nd'; break;
//             case 3: case 23: daySuffix = 'rd'; break;
//             default: daySuffix = 'th';
//         }

//         // Định dạng tháng và năm
//         const month = date.toLocaleString('en-US', { month: 'short' });
//         const year = date.getFullYear();

//         // Định dạng thời gian
//         const hours = date.getHours();
//         const minutes = date.getMinutes();
//         const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

//         // Sử dụng dấu phẩy chỉ một lần để tách ngày tháng và năm với thời gian
//         return `${month} ${day}${daySuffix}, ${year} ${formattedTime}`;
//     } catch (error) {
//         console.error(error);
//         return "";
//     }
// }

function formatDateMessage(dateString) {
    if (!dateString) return "";

    try {
        // Trích xuất số mili giây từ chuỗi
        const match = dateString.match(/\/Date\((\d+)\+\d+\)\//);
        if (!match) throw new Error("Invalid date format");

        const milliseconds = parseInt(match[1]);

        // Tạo đối tượng Date từ số mili giây và chuyển nó sang múi giờ UTC+7
        const date = new Date(milliseconds + 7 * 60 * 60 * 1000); // Thêm 7 giờ để chuyển sang UTC+7

        // Định dạng ngày
        const day = date.getUTCDate(); // Sử dụng getUTCDate() để lấy ngày theo UTC
        let daySuffix;
        switch (day) {
            case 1: case 21: case 31: daySuffix = 'st'; break;
            case 2: case 22: daySuffix = 'nd'; break;
            case 3: case 23: daySuffix = 'rd'; break;
            default: daySuffix = 'th';
        }

        // Định dạng tháng và năm
        const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
        const year = date.getUTCFullYear(); // Sử dụng getUTCFullYear() để lấy năm theo UTC

        // Định dạng thời gian theo định dạng 24 giờ
        const hours = date.getUTCHours(); // Sử dụng getUTCHours() để lấy giờ theo UTC
        const minutes = date.getUTCMinutes(); // Sử dụng getUTCMinutes() để lấy phút theo UTC
        const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');

        // Sử dụng dấu phẩy chỉ một lần để tách ngày tháng và năm với thời gian
        return `${month} ${day}${daySuffix}, ${year} ${formattedTime}`;
    } catch (error) {
        console.error(error);
        return "";
    }
}


// function translateDateToVietnamese(dateString) {
//     const monthNames = {
//         "Jan": "tháng 1",
//         "Feb": "tháng 2",
//         "Mar": "tháng 3",
//         "Apr": "tháng 4",
//         "May": "tháng 5",
//         "Jun": "tháng 6",
//         "Jul": "tháng 7",
//         "Aug": "tháng 8",
//         "Sep": "tháng 9",
//         "Oct": "tháng 10",
//         "Nov": "tháng 11",
//         "Dec": "tháng 12"
//     };
//     if (!dateString) {
//         return "Ngày không xác định";
//     }
//     const parts = dateString.split(' ');
//     const month = monthNames[parts[0]];
//     const day = parts[1].replace(',', '');
//     const year = parts[2];

//     return `${day} ${month}, ${year}`;
// }

function translateDateToVietnamese(dateString) {
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
    if (!dateString) {
        return "Ngày không xác định";
    }
    const parts = dateString.split(' ');
    const month = monthNames[parts[0]];
    const day = parts[1].replace(',', '');
    const year = parts[2];

    return `ngày ${day} tháng ${month} năm ${year}`;
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
    return `${day}/${month}/${year}, ${time}`;
}

const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

function isImageFormat(fileName) {
    if (!fileName) return false;
    const imageFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'svg'];
    return imageFormats.includes(fileName.split('.').pop().toLowerCase());
}

function isVideoFormat(fileName) {
    if (!fileName) return false;
    const videoFormats = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'mkv', 'webm'];
    return videoFormats.includes(fileName.split('.').pop().toLowerCase());
}

function isPdfFormat(fileName) {
    if (!fileName) return false;
    const imageFormats = ['pdf'];
    return imageFormats.includes(fileName.split('.').pop().toLowerCase());
}

function isExcelFormat(fileName) {
    if (!fileName) return false;
    const imageFormats = ['xls', 'xlsx'];
    return imageFormats.includes(fileName.split('.').pop().toLowerCase());
}

function isZipFormat(fileName) {
    if (!fileName) return false;
    const imageFormats = ['zip'];
    return imageFormats.includes(fileName.split('.').pop().toLowerCase());
}

function removeFileExtension(filename) {

    if (typeof filename === 'string' && filename.includes('.')) {
        return filename.substring(0, filename.lastIndexOf('.'));
    }
    return filename;
}

function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            let width = img.width;
            let height = img.height;
            let isResized = false;

            // Tính toán tỷ lệ resize
            if (width > maxWidth || height > maxHeight) {
                isResized = true;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
            }

            // Vẽ ảnh lên canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Xuất ảnh dưới dạng base64
            canvas.toBlob(blob => callback(blob, isResized), 'image/jpeg', 0.92);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
function resizeImageToFit(file, maxWidth, maxHeight, maxSizeKB, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            let width = img.width;
            let height = img.height;

            // Tính toán tỷ lệ resize
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            // Vẽ ảnh lên canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Điều chỉnh chất lượng và kiểm tra kích thước file
            const qualityStep = 0.1;
            let quality = 1;
            const checkSizeAndAdjustQuality = () => {
                canvas.toBlob(blob => {
                    if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                        callback(blob);
                    } else {
                        quality -= qualityStep;
                        ctx.drawImage(img, 0, 0, width, height);
                        checkSizeAndAdjustQuality();
                    }
                }, 'image/jpeg', quality);
            };
            checkSizeAndAdjustQuality();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renameDuplicateFiles(data) {
    const fileNames = {};

    data.forEach(item => {
        let fileName = item["1FN"];
        if (!fileName) {
            // Nếu fileName là null hoặc undefined, bỏ qua lần lặp này
            return;
        }

        if (fileNames[fileName]) {
            // Tìm ra một tên file trùng lặp, thêm chỉ số vào cuối tên file
            let lastDotIndex = fileName.lastIndexOf('.');
            let baseName = lastDotIndex >= 0 ? fileName.substring(0, lastDotIndex) : fileName;
            let extension = lastDotIndex >= 0 ? fileName.substring(lastDotIndex) : '';
            let count = fileNames[fileName];
            item["1FN"] = `${baseName}(${count})${extension}`;
            fileNames[fileName]++;
        } else {
            // Không trùng lặp, đánh dấu tên file này
            fileNames[fileName] = 1;
        }
    });

    return data;

}

function arraysAreEqual(arr1, arr2) {
    if (arr1?.length !== arr2?.length) {
        return false;
    }
    for (let i = 0; i < arr1?.length; i++) {
        if (!objectsAreEqual(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
}

function objectsAreEqual(obj1, obj2) {
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (obj1[key] instanceof Array && obj2[key] instanceof Array) {
                if (!arraysAreEqual(obj1[key], obj2[key])) {
                    return false;
                }
            } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                if (!objectsAreEqual(obj1[key], obj2[key])) {
                    return false;
                }
            } else if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
    }
    return true;
}

// Trong functions.determineFileType
function determineFileType(file) {
    if (file.type.startsWith('video/')) {
        return 'video';
    } else if (file.type.startsWith('image/')) {
        return 'image';
    } else if (file.type === 'application/pdf') {
        return 'pdf';
    } else if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        return 'excel';
    } else if (file.name.endsWith('.zip')) {
        return 'zip';
    } else {
        return 'unknown';
    }
}


function shortenFileName(fileName) {
    const maxPrefixLength = 3; // Số ký tự từ phần đầu của tên file (không tính phần mở rộng)
    const parts = fileName.split('.'); // Tách tên file thành phần trước và sau dấu chấm
    const extension = parts.pop(); // Phần mở rộng của file
    const namePart = parts.join('.'); // Trường hợp có nhiều dấu chấm trong tên file
    const prefix = namePart.length > maxPrefixLength ? namePart.substring(namePart.length - maxPrefixLength) : namePart; // Lấy 3 ký tự cuối của phần tên, hoặc toàn bộ nếu ngắn hơn

    return `${prefix}.${extension}`; // Kết hợp lại và trả về tên file đã rút gọn
}

function renderInput(field, handleInputChange, searchValues, search, handleKeyDown) {
    const datatype = field.DATATYPE;
    const value = searchValues[field.fomular_alias] || '';
    const valueBool = [
        {
            id: 0,
            label: field.DEFAULT_TRUE,
            value: true
        },
        {
            id: 1,
            label: field.DEFAULT_FALSE,
            value: false
        },
    ]
    switch (datatype) {
        case 'TEXT':
            return (
                <input
                    type="text"
                    className="form-control"
                    value={value}
                    onChange={(e) => handleInputChange(e, field.fomular_alias, e.target.value, search)}
                    onKeyDown={handleKeyDown}
                />
            );
        case 'DATE':
            return (
                <input
                    type="date"
                    className="form-control"
                    value={value}
                    onChange={(e) => handleInputChange(e, field.fomular_alias, e.target.value, search)}
                    onKeyDown={handleKeyDown}
                />
            );

        case 'DATETIME':
            return (
                <input
                    type="datetime-local"
                    className="form-control"
                    value={value}
                    onChange={(e) => handleInputChange(e, field.fomular_alias, e.target.value, search)}
                    onKeyDown={handleKeyDown}
                />
            );
        case 'BOOL':
            return (
                <select
                    onChange={(e) => handleInputChange(e, field.fomular_alias, e.target.value === "true", search)}
                    placeholder='hihihih'
                    className="form-control"
                    onKeyDown={handleKeyDown}
                >
                    <option value="" disabled selected>Choose</option>
                    {valueBool.map((val, index) => (
                        <option key={index} value={val.value.toString()}>{val.label}</option>
                    ))}
                </select>
            );

        // Thêm các trường hợp khác tùy theo DATATYPE
        default:
            return (
                <input
                    type="text"
                    className="form-control"
                    value={value}
                    onChange={(e) => handleInputChange(e, field.fomular_alias, e.target.value, search)}
                    onKeyDown={handleKeyDown}
                />
            );
    }
}




export default {
    uid, isTokenExpired, refreshToken, getTokenExpirationDate, removeDuplicate, titleCase, openTab, dateGenerator,
    renderDateTimeByFormat, showApiResponseMessage, formatNumberWithCommas, formatNumber, generateUniqueColors,
    formatDate, formatDateCase, formatDateMessage, translateDateToVietnamese, translateDateTimeToVietnamese,
    isEmpty, isImageFormat, isVideoFormat, removeFileExtension, resizeImage, getAllParamsAfterPageId,
    resizeImageToFit, renameDuplicateFiles, arraysAreEqual, getBrowser, detectBrowser, shortenFileName,
    isPdfFormat, isExcelFormat, determineFileType, isZipFormat, renderData, findGetApi, findPostApi, findPageById, findPutApi, findRowsPerPage,
    getNamePage, findDeleteApi, extractValuesFromData, findSearchApi, findExportApi, findDetailApi, findComponentWithDeleteApiUrl, findPropsNameAddByUrl,
    findPropsNameUpdateByUrl, findPropsNameImportByUrl, findPropsNameDetailByUrl, renderInput
}
