class Field {
    constructor(name, datatype, value = undefined){
        this.__fieldName = name;
        this.__datatype = datatype;
        this.__value = value;
    }

    __alterDataType__ = ( newType ) => {
        this.__datatype = newType
    }


    value = ( val = undefined ) => {
        /**
            @name: phương thức value;
            @desc: Nếu giá trị truyền vào rỗng thì trả về giá trị hiện tại,
            nếu không thì đặt giá trị hiện tại bằng giá trị truyền vào và trả về nó
            @params: val <Any>
            @auth: Linguistic
        **/
        if( val != undefined ){
            this.__value = val;
            return val
        }
        else{
            return this.__value
        }
    }

    serializingValue = () => {
        /**
            @name: phương thức định dạng;
            @desc: trả về một json với khoá là tên trường và giá trị là giá trị của trường
            @params:  /
            @auth: Linguistic
        **/

        const serializedData = {}
        serializedData[ this.__fieldName ] = this.__value
        return serializedData
    }

}

module.exports = Field;
