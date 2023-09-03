const Field = require('./field');

class Bool extends Field{
    constructor( name, value, props ){
        super( name, "bool", value );
        if( !this.selfValidate() ){
            throw Error ('Giá trị truyền vào không tương thích với kiểu dữ liệu bool')
        }
        this.value(true);        
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
            if( typeof(props.default) == "boolean" ){
                this.value( props.default )            
            }else{
                throw Error("Giá trị mặc định phải có kiểu BOOL")
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

        const value = this.__value;
        
        if( value === undefined ){
            return true
        }else{
            if( typeof(value) == "boolean" ){
                return true;
            }
            return false;
        }
    }
}

module.exports = Bool
