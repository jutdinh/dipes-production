const a = {
    base: {
        base: "a",
        unicode: [ "ă", "â" ],
        unicodeWithSound: ["á", "à", "ả", "ã", "ạ", "ắ", "ằ", "ẳ", "ẵ", "ặ", "ấ", "ầ", "ẩ", "ẫ", "ậ"],
    }    
}

const d = {
    base: {
        base: "d",
        unicode: ["đ"],
        unicodeWithSound: []
    }
} 

const e = {
    base: {
        base: "e",
        unicode: [ "ê" ],
        unicodeWithSound: ["é", "è", "ẻ", "ẽ", "ẹ", "ế", "ề", "ể", "ễ", "ệ"]
    }
}

const i = {
    base: {
        base: "i",
        unicode: [],
        unicodeWithSound: [ "í", "ì", "ỉ", "ĩ", "ị" ]
    }
}

const o = {
    base: {
        base: "o",
        unicode: [ "ô", "ơ" ],
        unicodeWithSound: [ "ó", "ò", "ỏ", "õ", "ọ", "ố", "ồ", "ổ", "ỗ", "ộ", "ớ", "ờ", "ở", "ỡ", "ợ" ]
    }
}

const u = {
    base: {
        base: "u",
        unicode: [ "ư" ],
        unicodeWithSound: [ "ú", "ù", "ủ", "ũ", "ụ", "ứ", "ử", "ử", "ữ", "ự" ]
    }
}

const y = {
    base: {
        base: "y",
        unicode: [],
        unicodeWithSound: [ "ý", "ỳ", "ỷ", "ỹ", "ỵ" ]
    }
}

module.exports = {
    vietnameseChars: [
        a,
        d,
        e,
        i,
        o, 
        u,
        y
    ]
}