const intValidate = ( number ) => {
    if( number != undefined){
        const numberString = number.toString()
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        let valid = true
        for( let i = 0; i < numberString.length ; i++ ){
            const char = numberString[i]
            if( numbers.indexOf( char ) === -1 ){
                valid = false
            }
        }
        return valid;
    }
    else{
        return false
    }
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

const boolValidate = (value) => {
    const type = typeof(value);
    if( type == "boolean" ){
        return true
    }
    return false
}


const objectComparator = (object_1, object_2) => {
    const strObject_1 = JSON.stringify(object_1)
    const strObject_2 = JSON.stringify(object_2)
    return strObject_1 === strObject_2;
}


module.exports = {
    intValidate,
    floatValidate,
    boolValidate,
    objectComparator
}