const Field = require('./field');
const { intValidate } = require('../../../functions/validator')


class String extends Field{
    /**      
     * @props
     *      - maxLength ( INT )
     *      - nullable  ( BOOLEAN )
     *      - default   ( STRING )
     **/
    constructor( name, value, props ){
        super( name, "string", value );
        this.__maxLength = 255;
        this.__required = false;
        this.__default = undefined;

        this.#__initializeProperties( props )
    }

    #__initializeProperties = ( props ) => {
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


        if( props != undefined ){
            const { maxLength, required } = props;
            if( maxLength != undefined ){
                this.setMaxLength( maxLength );
            }
            if( required != undefined ){
                this.__required = required
            }
            if( props.default != undefined ){
                this.__default = props.default
            }
        }
    }

    setMaxLength = ( length = undefined ) => {
        /**
            @name: phương thức sexMaxLength;
            @desc: Nếu giá trị truyền vào rỗng thì báo lỗi,
            xác thực giá trị truyền vào có phải là số nguyên không,
            đặt lại độ dài hiện tại và trả về nó
            @param: val <Any>
            @author: DS
        **/
        
       if( !length ){
            throw Error("Không được phép để trống độ dài!")
        }else{
            const isLengthValid = intValidate( length.toString() );
            if( !isLengthValid ){
                throw Error(`Độ dài ${ length } không hợp lệ!`)
            }
            else{
                if( length <= 0 ){
                    throw Error(`Độ dài phải là một số dương!`)
                }else{
                    this.__maxLength = length;
                    return length;                
                }
            }
        }
    }

    value = (_val = undefined) => {
        /**
            @name: phương thức value;
            @override: Field::value;
            @desc: Nếu giá trị truyền vào rỗng thì trả về giá trị hiện tại,
            nếu không thì đặt giá trị hiện tại bằng giá trị truyền vào và trả về nó
            @params: val <String>
            @author: DS
        **/
       if( _val != undefined ){
            const val = _val.toString()
            if( val.length <= this.__maxLength ){
                this.__value = val;
                return val
            }else{
                throw Error(`Chuỗi dài hơn độ dài tối đa ${ this.__maxLength }`)
            }
        }
        else{
            return this.__value ? this.__value: this.__default;
        }
    }
}

module.exports = String
