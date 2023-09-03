const { intValidate } = require('../../../functions/validator');
const Number = require('./number');

class Int extends Number{
    constructor( name, value, props ){
        super( name, value, props );
        this.__alterDataType__("int");
        if( !this.selfValidate() ){
            throw Error ('Giá trị truyền vào không tương thích với kiểu dữ liệu int')
        }               
    }

    selfValidate = () => {
        /**
            @auth Linguistic
            @desc Kiểm tra giá trị khởi tạo, nếu phù hợp thì passed, còn không thì báo lỗi

            @params \
            @return Boolean
        **/

        const numericChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        const value = this.__value;
        if( value === undefined ){
            return true
        }else{
            const stringifiedValue = value.toString();
            let valid = true;
            for( let i = 0 ; i < stringifiedValue.length; i++ ){
                const char = stringifiedValue[i]
                if( numericChars.indexOf( char ) == -1 ){
                    valid = false
                }
            }

            if( valid ) {
                this.value( parseInt( value ) )
            }
            return valid;
        }
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
            if( intValidate(val) ){
                this.__value = parseInt(val)               
                return this.__value
            }else{
                throw Error ('Giá trị truyền vào không tương thích với kiểu dữ liệu int')
            }
        }
        else{
            return this.__value
        }
    }
}

module.exports = Int
