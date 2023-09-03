const { Database } = require("./database");
const { objectComparator } = require('../../functions/validator')

class Table {
    /**
     *  @name Table - Bảng
     *  @desc Đối tượng này sẽ giao tiếp với cơ sở dữ liệu ở cấp độ "Bảng",
     *      Tức là với #__tableName được truyền vào, dữ liệu và các truy vấn
     *      đều sẽ sử dụng #__tableName để xác định bảng nào thì thực thi những
     *      lệnh gì.    
     *  @author DS   
     **/    
    #__tableName = ""
    #__fields = []
    #__foreignKeys = []
    #__primaryKey = [];

    #dbo = Database;

    constructor( name ){

        /**
         * @desc Phương thức khởi tạo
         * @params 
         *      name String
         * @props
         *      #__tableName <String>
         *      #__fields <OBJ{ __fieldMame, __fieldObject }>[]
         *                     => __field_name  String
         *                        __fieldObject Field 
         *      #__foreignKeys <OBJ{__fieldName, __tableName }>[]
         *      #__primaryKey  <String>[]
         * 
         * @author Linguistic
         */

        this.#__tableName = name;
        this.#__fields = [];
        this.#__foreignKeys = [];
        this.#__primaryKey = [];        
    };

    __dbInit__ = async () => {
        /**
         *  @desc Khởi tạo đối tượng dbo, vì nó là một phương thức bất đồng bộ
         * nên khum thể dùng bên trong constructor
         *  @params /
         * 
         *  @author DS
         */

        await this.#dbo.init()
    }

    __createIndex__ = async ( index ) => {
        await this.#dbo.createIndex(this.#__tableName, index)
    }

    __getTableName__ = () => {

        /**
         *  @desc Trả về tên bảng hiện tại, phương thức này được dùng để truy cập thuộc tính __tableName
         *      vì nó là một thuộc tính private nên không thể truy cập một cách trực tiếp
         *  @params /
         * 
         *  @author DS
         */

        return this.#__tableName
    }

    __getFields__ = () => {
        /**
         *  @desc Trả về tất cả trường hiện tại, phương thức này được dùng để truy cập thuộc tính __fields
         *      vì nó là một thuộc tính private nên không thể truy cập một cách trực tiếp
         *  @params /
         * 
         *  @author DS
         */
        return this.#__fields
    }

    __getPrimaryKey__ = () => {
        /**
         *  @desc Trả về danh sách tất cả các trường thuộc khóa chính
         *  @params /
         * 
         *  @author Linguistic
         */
        return this.#__primaryKey
    }

    __getForeignKeys__ = () => {
        /**
         *  @desc Trả về danh sách tất cả các khóa ngoại hiện có
         *  @params /
         * 
         *  @author Linguistic
         */
        return this.#__foreignKeys
    }

    __setFields__ = (fields) => {
        /**
         *  @desc Thiết đặt lại danh sách các trường
         *  @params fields <String>[]
         * 
         *  @author DS
         */
        this.#__fields = fields;
    }


    __getNewId__ = async () => {
        /**
         *  @desc Trả về một ID mới và duy nhất thuộc bảng này
         *  @params /
         * 
         *  @author Linguistic
         */

        await this.__dbInit__();
        const id = await this.#dbo.getAutoIncrementId( this.#__tableName );
        return id;
    }

    __isFieldExisted__ = ( fieldName ) => {
        /**
         *  @desc Kiểm tra xem một field có tồn tại trong danh sách __fields hay không
         *  @params fieldName <String>
         * 
         *  @author Linguistic
         */

        const field = this.#__fields.filter( f => f.__fieldName == fieldName )[0];
        return field != undefined ? true : false
    }

    __addField__ = ( fieldName, fieldObject, fieldProps = undefined ) => {

        /**
         *  @desc Thêm một trường mới vào danh sách 
         *      đồng thời tạo một thuộc tính mới với tên trường và giá trị là một đối tượng kế thừa Field
         *      tuỳ thuộc vào kiểu dữ liệu và danh sách các thuộc tính được truyền vào
         * 
         *  @params fieldName   <String>
         *          fieldObject <Field>
         *          fieldProps  <Object>
         *          
         * 
         *  @author Linguistic
         */

        if( !this.__isFieldExisted__( fieldName ) ){
            this[fieldName] = new fieldObject( fieldName );
            this.#__fields.push({ __fieldName: fieldName, __fieldObject: new fieldObject( fieldName, undefined, fieldProps ) })
        }
    }

    __addForeignKey__ = ( fieldName, referencesOn, onField = undefined ) => {

        /**
         *  @desc Thêm một trường khoá ngoại và GHI ĐÈ một thuộc tính với tên là bảng chứa khoá chính           
         * 
         *  @params fieldName       <String>
         *          referencesOn    <Model>
         *          
         * 
         *  @author Linguistic
         */

        const ObjReferencesOn = new referencesOn()
        const __tableName = ObjReferencesOn.getModel().__getTableName__();                       
        this[ __tableName ] = ObjReferencesOn;       
      
        const __onField = onField ? onField : fieldName 
        this.#__foreignKeys.push({ __fieldName: fieldName, __tableName, __onField });
    }

    __addPrimaryKey__ = ( fields ) => {
        /**
         *  @desc Thên (các) trường vào danh sách khoá chính
         * 
         *  @params fields       <String>[]
         *          
         * 
         *  @author Linguistic
         */

        this.#__primaryKey.push( ...fields )
    }

    __serializePrimaryData__ = ( serializedData ) => {
        /**
         *  @desc Đại loại là tạo một object mới từ object được truyền vào nhưng chỉ giữ lại những thuộc tính
         *     có tên là những trường thuộc khoá chính
         * 
         *  @params serializedData <Object>
         *          
         * 
         *  @author Linguistic
         */

        const data = {}
        this.#__primaryKey.map( field => {
            data[field] = serializedData[field]
        })        
        return data;
    }

    __primaryKeyCheck__ = async (data) => {

        /**
         *  @desc Kiểm tra ràng buộc khóa chính của data truyền vào, nếu (các) trường của data có giá trị chưa từng tồn tại
         *  thì kể như khóa chính đạt.
         * 
         *  @params data <Object>
         *          
         * 
         *  @author Linguistic
         */

        if( this.#__primaryKey.length !== 0 ){
            const key = this.__serializePrimaryData__(data);
            const recordExists = await this.#dbo.select(this.#__tableName, key);
            if( recordExists ){
                return false;
            }else{
                return true;
            }
        }else{
            return true
        }
    }

    __foreignKeyCheck__ = async (data) => {

        /**
         *  @desc Kiểm tra (các) ràng buộc khóa ngoại, nếu dữ liệu được ánh xạ không tồn tại thì
         *  kể như dữ liệu không hợp lệ
         * 
         *  @params data <Object>         *          
         * 
         *  @author Linguistic
         */

        let valid = true;
        /**
         * (1) Vòng lập duyệt từng đối tượng khóa ngoại và băm chúng thành 2 biến với tên __fieldName & __tableName
         * (2) Tạo biến với giá trị là thuộc tính có tên là giá trị __tableName của this, thuộc tính này có kiểu Model và được thêm tự động
         * khi thêm khóa ngoại
         * 
         * (3) Tạo một đối tượng rỗng và đặt giá trị cho thuộc tính __fieldName là giá trị tương ứng của nó trong data
         * (4) Truy vấn dữ liệu từ bảng __tableName thông qua foreignDBObj bằng điều kiện là giá trị của key
         * 
         * (5) Nếu dữ liệu không tồn tại thì đặt lại giá trị cho valid là false
         */ 

        for( let i = 0; i < this.#__foreignKeys.length; i++ ){
            const { __fieldName, __tableName, __onField } = this.#__foreignKeys[i];  /* 1 */
            const foreignDBObj = this[__tableName]; /* 2 */
            const key = {}
            key[ __onField ] = data[ __fieldName ]; /* 3 */
            
            
            const model =  foreignDBObj.getModel()   
            const dataExists = await model.__findCriteria__( key ); /* 4 */
            
            if( !dataExists ){ /* 5 */
                valid = false;
            }
        }
        return valid;
    }

    __insertRecord__ = async ( data ) => {

        /**
         *  @desc Chèn dữ liệu theo dạng một bảng ghi với thông tin được truyền vào tuần tự theo thứ tự của các trường
         *  Phương thức này không khuyến cáo dùng vì có thể làm sai lệch dữ liệu giữa các trường
         * 
         *  @params data <Any>[]                 
         * 
         *  @author Linguistic
         */

        await this.__dbInit__()
        let serializedData = {};

        this.#__fields.map( (field, index) => {
            field.__fieldObject.value( data[ index - 1] )
            serializedData = { ...serializedData, ...field.__fieldObject.serializingValue() }
        })        
        let id = data.id;
        if( !id ){
            id = await this.__getNewId__();
        }            
        const primayKeyCheck = await this.__primaryKeyCheck__( serializedData );
        if( primayKeyCheck ){
            const foreignKeyCheck = await this.__foreignKeyCheck__( serializedData );
            
            if( foreignKeyCheck ){
                const insertResult = await this.#dbo.insert( this.#__tableName, { ...serializedData, id } )
                return true
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    __insertObject__ = async ( serializedData ) => {

        /**
         *  @desc Lưu dữ liệu hiện tại vào cơ sở dữ liệu
         *      (1) Khởi tạo đối tượng truy vấn cơ sở dữ liệu
         *      (2) Kiểm tra khóa chính xem dữ liệu mới có vi phạm khóa khum
         *      (3) Kiểm tra khóa ngoại
         *      (4) Nếu dữ liệu vượt qua được cả 2 ràng buộc thì lưu vào cơ sở dữ liệu
         * 
         *  @params serializedData <Object>                 
         * 
         *  @author Linguistic
         */
        

        await this.__dbInit__() /* 1 */
        const primayKeyCheck = await this.__primaryKeyCheck__( serializedData ); /* 2 */ 
        if( primayKeyCheck ){
            const foreignKeyCheck = await this.__foreignKeyCheck__( serializedData ); /* 3 */
            if( foreignKeyCheck ){
                const insertResult = await this.#dbo.insert( this.#__tableName, { ...serializedData } ) /* 4 */
                return true
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    __insertMany__ = async (objects) => {
        await this.__dbInit__()
        await this.#dbo.insertMany( this.#__tableName, objects )
    }

    __insertRawObject__ = async ( serializedData ) => {
        await this.__dbInit__() /* 1 */
        const insertResult = await this.#dbo.insert( this.#__tableName, { ...serializedData } )
        return;
    }

    __find__ = async ( amount = undefined ) => {

        /**
         *  @desc Truy vấn một số lượng dữ liệu nếu amount có giá trị, nếu không thì truy vấn toàn bộ dữ liệu
         * 
         *  @params amount <Int>                 
         * 
         *  @author Linguistic
         **/
        
        await this.__dbInit__()
        if( amount === undefined ){
            return await this.#dbo.select( this.#__tableName );
        }else{
            if( amount == 0 || amount == 1 ){
                const result = await this.#dbo.select( this.#__tableName );
                return result[0]
            }else{
                if( amount > 0 ){
                    const result = await this.#dbo.select( this.#__tableName );
                    return result.slice(0, amount)
                }else{
                    return null
                }
            }
        }
    }

    __findAll__ = async ( query = undefined ) => {

        /**
         *  @desc Truy vấn một số lượng dữ liệu nếu amount có giá trị, nếu không thì truy vấn toàn bộ dữ liệu
         * 
         *  @params amount <Int>                 
         * 
         *  @author Linguistic
         **/
        
        await this.__dbInit__()
        return await this.#dbo.selectAll( this.#__tableName, query );
    }


    __findCriteria__ = async ( criteria ) => {

        /**
         *  @desc Truy vấn dữ liệu bằng điều kiện là một đối tượng
         * 
         *  @params serializedData <Object>                 
         * 
         *  @author Linguistic
         */

        await this.__dbInit__()
        const result = await this.#dbo.select( this.#__tableName, criteria );
        return result
    }

    __findFrom__ = async ( query, from, to ) => {
        await this.__dbInit__()
        const result = await this.#dbo.selectFrom( this.#__tableName, query, from, to );
        return result
    }

    __updateObject__ = async ( serializedData ) => {

        /**
         *  @desc Cập nhật dữ liệu
         *  Cập nhật dữ liệu chỉ áp dụng với các trường không phải khóa chính
         *  Nếu trường được cập nhật là khóa ngoại mà vi phạm ràng buộc thì cũng sẽ không được cập nhật
         *  (1) Khởi tạo đối tượng truy vấn cơ sở dữ liệu
         *  (2) Truy vấn giá trị cũ nếu tồn tại thì đi đến bước (3), nếu không thì trả về false
         *  (3) Tạo một đối tượng chứa giá trị của (các) trường khóa chính trên dữ liệu cũ
         *  (4) Tạo một đối tượng chứa giá trị của (các) trường khóa chính trên dữ liệu mới
         *  (5) So sánh hai đối tượng khóa chính, nếu giống nhau thì tiếp tục đến bước (6), không thì trả về false
         *  (6) Kiểm trả các ràng buộc khóa ngoại
         *  (7) Nếu các khóa ngoại đều OK thì cập nhật dữ liệu và kết thúc
         * 
         * 
         *  @params serializedData <Object>                 
         * 
         *  @author Linguistic
         */

        await this.__dbInit__()  /* 1 */ 
        const { id } = serializedData;
        const oldValue = await this.__findCriteria__( {id } )  /* 2 */ 

        if( oldValue ){
            const oldKey = this.__serializePrimaryData__( oldValue );  /* 3 */ 
            const newKey = this.__serializePrimaryData__( serializedData );  /* 4 */       
            if( objectComparator(oldKey, newKey) ){   /* 5 */
                const fkCheck = await this.__foreignKeyCheck__(serializedData);  /* 6 */ 
                if( fkCheck ){
                    delete serializedData.id;
                    await this.#dbo.update(this.#__tableName, { id }, { ...serializedData })  /* 7 */ 
                    
                    return true
                }else{
                    return false;
                }            
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    __manualUpdate__ = async ( criteria, values ) => {
        /**
         *  @desc Cập nhật dữ liệu bằng điều kiện tự do
         * 
         *  @params criteria <Object>              
         *          values <Objects>
         * 
         *  @author Linguistic
         */

        await this.__dbInit__()
        await this.#dbo.update(this.#__tableName, criteria, values )
    }

    __deleteObject__ = async ( criteria  = undefined ) => {

        /**
         *  @desc Xóa một (hoặc nhiều) bảng ghi khỏi bảng
         *  (1) Khởi tạo đối tượng truy vấn dữ liệu
         *  (2) So sánh điều kiện xóa với {}
         *  (3) Nếu điều kiện xóa là một đối tượng có nghĩa và khác {} thì thực hiện thao tác xóa, ngoài ra báo lỗi
         * 
         *  @params criteria <Object>              
         * 
         *  @author Linguistic
         */
        await this.__dbInit__() /* 1 */

        const isCriteriaNull = objectComparator( criteria, {} ); /* 2 */
        if( criteria && !isCriteriaNull ){ /* 3 */            
            await this.#dbo.delete( this.#__tableName, criteria ); 
            return true;            
        }else{
            throw Error("Xóa dữ liệu với điều kiện bỏ trống đồng nghĩa với việc xóa toàn bộ dữ liệu, bạn sẽ cần dùng một phương thức khác với tên\n__deleteAll__()\nĐây là phương thức nguy hiểm nên hạn chế sử dụng nhé!")
        }
    }

    __deleteObjects__ = async ( criteria  = undefined ) => {

        /**
         *  @desc Xóa một (hoặc nhiều) bảng ghi khỏi bảng
         *  (1) Khởi tạo đối tượng truy vấn dữ liệu
         *  (2) So sánh điều kiện xóa với {}
         *  (3) Nếu điều kiện xóa là một đối tượng có nghĩa và khác {} thì thực hiện thao tác xóa, ngoài ra báo lỗi
         * 
         *  @params criteria <Object>              
         * 
         *  @author Linguistic
         */
        await this.__dbInit__() /* 1 */

        const isCriteriaNull = objectComparator( criteria, {} ); /* 2 */
        if( criteria && !isCriteriaNull ){ /* 3 */            
            await this.#dbo.deleteMany( this.#__tableName, criteria ); 
            return true;            
        }else{
            throw Error("Xóa dữ liệu với điều kiện bỏ trống đồng nghĩa với việc xóa toàn bộ dữ liệu, bạn sẽ cần dùng một phương thức khác với tên\n__deleteAll__()\nĐây là phương thức nguy hiểm nên hạn chế sử dụng nhé!")
        }
    }

    __deleteAll__ = async () => {

        /**
         *  @desc Xóa toàn bộ dữ liệu của bảng
         * 
         *  @params /
         * 
         *  @author Linguistic
         */

        await this.__dbInit__()
        await this.#dbo.deleteMany( this.#__tableName, {} );
        return true;
    }

    __count__ = async (query = undefined) => {
        await this.__dbInit__()
        return await this.#dbo.count( this.#__tableName, query )
    }
}


module.exports = Table
