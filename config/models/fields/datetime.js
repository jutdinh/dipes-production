const Field = require('./field');
const { formatDecNum } = require('../../../functions/auto_value')
class Datetime extends Field{
    constructor( name, value, props ){
        super( name, "datetime", value );
        this.__required = false;
        this.__format = "DD-MM-YYYY hh:mm:ss"
        this.#__initializeProperties__(props)
    }

    #__initializeProperties__ = (props) => {
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
            const { required, format } = props;
            if( required != undefined ){
                this.__required = required
            }
            if( format != undefined ){
                this.__format = format
            }
        }
    }

    #__format_date__ = () => {

        /**
            @name: phương thức định cmn dạng ngày giờ
            @desc: 
                    Thiệt là không biết mô tả cái gì nữa tại cái code nó lù lù trơ trơ
                ra như thế này mà đọc không hiểu thì cũng không còn gì để nói

            @param: /
            @author: Moc
        **/

        const date = new Date(this.__value);
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const secs = date.getSeconds()

        let result = this.__format;
        result = result.replaceAll("DD", formatDecNum(day));
        result = result.replaceAll("MM", formatDecNum(month));
        result = result.replaceAll("YYYY", formatDecNum(year));

        result = result.replaceAll("hh", formatDecNum(hour));
        result = result.replaceAll("mm", formatDecNum(minute));
        result = result.replaceAll("ss", formatDecNum(secs));

        return result;
    }

    getFormatedValue = () => {
        return this.#__format_date__()
    }
}

module.exports = Datetime
