const Field = require('./field');

class Enum extends Field{
    constructor( name, value, props ){
        super( name, "enum", value );
        if( !this.selfValidate() ){
            const ERROR_MSG = `Giá trị truyền vào không tương thích với kiểu dữ liệu ENUM [${ this.__values.toString() }]`;
            throw Error (ERROR_MSG)
        }        
        this.__required = true;
        this.#__initializeProperties__(props);
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
            const { required, values } = props;
            if( required != undefined ){
                this.__required = required
            }

            if( values != undefined ){
                this.__values = values;
            }else{
                throw Error ('Thuộc tính values không được phép bỏ trống! \nprops.values là một danh sách không rỗng thưa quý vị và các bạn!')
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

        if( this.__value == undefined ){
            return true;
        }else{
            if( this.__values.indexOf( this.__value ) != -1 ){
                return true
            }
            return false
        }
    }

    value = (val = undefined) => {
        /**
            @name: phương thức value;
            @desc: Nếu giá trị truyền vào rỗng thì trả về giá trị hiện tại,
            nếu không thì đặt giá trị hiện tại bằng giá trị truyền vào và trả về nó
            @params: val in this.__values[]
            @auth: Linguistic
        **/
            if( val != undefined ){
                this.__value = val;
                if( !this.selfValidate() ){
                    const ERROR_MSG = `Giá trị truyền vào không tương thích với kiểu dữ liệu ENUM [${ this.__values.toString() }]`;
                    throw Error (ERROR_MSG)
                } 
                return val
            }
            else{
                
                return this.__value
            }
    }
}

module.exports = Enum

