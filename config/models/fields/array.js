const Field = require('./field');
const { intValidate } = require('../../../functions/validator')


class List extends Field{
    /**      
     * @props
     *      - required  ( BOOLEAN )
     *     
     **/
    constructor( name, value, props ){
        super( name, "array", value );
        this.__required = false;
        this.__value = []
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
            const { required } = props;           
            if( required != undefined ){
                this.__required = required
            }            
        }
    }

    valueOrNot = () => {
        return this.__value ? this.__value : []
    }

    valueAt = (pos = undefined) => {
        /**
            @name: phương thức valueAt;
            
            @desc: Trả về giá trị ở vị trí pos, nếu pos < 0 || pos == undefined trả về this.__value[0]
            @author: Linguistic
        **/
        let result = undefined;
        if( pos ){
            if( pos >= 0 ){
                const len = this.__value.length;                
                if( pos >= len ){
                    result = this.__value[len - 1];    
                }
                result = this.__value[pos]
            }else{
                result = this.__value[0]
            }
        }
        result = this.__value[0]
        return result;
    }

    find = ( val ) => {
        if( this.__value.indexOf(val) == -1 ){
            return false
        }
        return true;
    }
    append = ( val ) => {
        this.__value.push( val );
    }
}

module.exports = List
