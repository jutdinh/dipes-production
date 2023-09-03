const Field = require('./field');

class Number extends Field{
    constructor( name, value, props ){
        super( name, "number", value );
        this.__required = false;
        this.__values = []
        this.__auto = false;
        this.#__initializeProperties__(props);

        if( !this.selfValidate() ){
            throw Error ('Giá trị truyền vào không tương thích với kiểu dữ liệu number')
        }        
    }

    #__initializeProperties__ = ( props ) => {
        /**
            @name: phương thức khởi tạo thuộc tính;
            @desc: 
                Sử dụng các thuộc tính từ props để đặt lại cho trường và dùng chúng để
            kiểm soát dữ liệu một cách độc lập.
                Các thuộc tính được truyền vào là không bắt buộc, có nhỏ nào xào nhỏ đó.
                Với những thuộc tính được đánh giá là undefined thì vẫn giữ nguyên giá trị mặc định.
            @param: props <Object>
            @author: DS
        **/
        if( props ){
            const { required, auto } = props;
            if( required != undefined ){
                this.__required = required
            }            
            if( auto != undefined ){
                this.__auto = auto
            }
        }
    }

    selfValidate = () => {
        /**
            @auth Linguistic
            @desc Kiểm tra giá trị khởi tạo, nếu phù hợp thì passed, còn không thì báo lỗi

            @params \
            @return Boolean
        **/

        const numericChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
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
            if(valid){
                this.value( parseFloat(value) )
            }
            return valid;
        }
    }
}

module.exports = Number

