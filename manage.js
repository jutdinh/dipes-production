/* ==== LIBRARY ==== */
const fs = require('fs');
require('dotenv').config();

/* ==== GLOBAL VARIABLES ==== */
const managePATH        = './manage.json'
const modelBaseDir      = './models'
const controllerBaseDir = './controllers'

const validChars = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Y', 'W', 'U', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'v', 'x', 'y', 'w', 'u', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '_'
];

const numericChars = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ]

/* ==== MANAGE MANIPULATE ==== */

const readManageJSON = () => {
    const rawJSON = fs.readFileSync(managePATH);
    const manageData = JSON.parse(rawJSON);
    return manageData
}

const writeManageJSON = () => {
    if( fs.existsSync(managePATH) ){
        infoLog("Xóa tệp manage.js")
        fs.unlinkSync(managePATH)
    }
    const stringifiedData = JSON.stringify({ models, controllers });
    infoLog("Ghi lại giá trị vào manage.js")
    fs.writeFileSync(managePATH, stringifiedData)
}

const writeManageJSONWithData = ({ models, controllers }) => {
    if( fs.existsSync(managePATH) ){   
        infoLog("Xóa tệp manage.js")
        fs.unlinkSync(managePATH)
    }
    const stringifiedData = JSON.stringify({ models, controllers });
    infoLog("Ghi lại giá trị vào manage.js")
    fs.writeFileSync(managePATH, stringifiedData)
}

/* ==== BASIC FUNCTIONS ====*/

const validateName = ( name ) => {
    let valid = true;
    for( let i = 0 ; i < name.length; i++ ){
        if( validChars.indexOf( name[i] ) == -1 ){
            valid = false;
        }
    }
    if( numericChars.indexOf(name[0]) != -1 ){
        valid = false;
    }
    return valid;
} 


/* ==== LOGGERS ====*/

const successLog = (msg, prefix="" ) => {
    console.log(`${prefix}PASSED:   ${msg}`)
}

const errorLog = (msg, prefix="" ) => {
    console.log(`${prefix}ERROR!:   ${ msg }`)
}

const warningLog = (msg, prefix="" ) => {
    console.log(`${prefix}WARNNING: ${ msg }`)
}

const infoLog = (msg, prefix="" ) => {
    console.log(`${prefix}INFOR:    ${ msg }`)
}

/* ==== COMMANDS RESOLVING ====*/


const __command_create__ = ( ) => {
    if( commands.length < 4 ){
        warningLog("Rồi tạo là tạo cái gì mà ghi chữ create xong cái bỏ ngang dzậy ? ")
        return
    }
    const command = commands[3].toLowerCase();
    switch(command){
        case "model":
            __command_create_model__();
            break;
        case "controller":
            __command_create__controller__();
            break;
        default:
            errorLog(`Ở đây không có lệnh tạo ${ commands[3] } nhe quí dị!`)
            break;
    }
}

const __command_create_model__ = () => {
    if( commands.length < 5 ){
        warningLog("Không tìm thấy tên model trong command!")
        return
    }
    const modelName = commands[4];    
    const makeModelResult = __make_model__( modelName )
    if( makeModelResult ){
        models.push( modelName );
        successLog(`Tạo model ${ modelName } thành công!\n`)
        writeManageJSON()
    }
}

const __command_create__controller__ = () => {
    if( commands.length < 5 ){
        errorLog("Không tìm thấy tên controller trong command!")
        return
    }
    const controllerName = commands[4];
   
    const makeControllerResult =  __make_controller__( controllerName )
    if( makeControllerResult ){
        controllers.push( controllerName );
        successLog(`Tạo controller ${ controllerName } thành công!\n`)
        writeManageJSON()
    }
}


const __make_model__ = ( modelPath ) => {
    const splitedName = modelPath.split('/');
    const modelName = splitedName[splitedName.length - 1];
    
    const isNameValid = validateName(modelName);
    if( !isNameValid ){
       errorLog("Tên không hợp lệ!")
        return false;
    }

    const modelDirs  = splitedName.filter( dir => dir != modelName );

    const modelTemplate = `
const { Model } = require('${"../".repeat(splitedName.length) }config/models');
class ${ modelName } extends Model{
    constructor(){
        super("${ modelName.toLowerCase() }");
        this.__addField__( "${ modelName.toLowerCase() }_id", Model.types.int )
    
        this.__addPrimaryKey__( ["${ modelName.toLowerCase() }_id"] )        
    }
}   
class ${ modelName }Record extends ${ modelName } {
    constructor( { id, ${ modelName.toLowerCase() }_id } ){
        super();
        this.setDefaultValue( { id, ${ modelName.toLowerCase() }_id } )        
    }

    get = () => {
        return {
            id: this.id.value(),
            ${ modelName.toLowerCase() }_id: this.${ modelName.toLowerCase() }_id.value()
        }
    }
}
module.exports = { ${ modelName }, ${ modelName }Record }
    `;    
    
    for( let i = 0 ; i < modelDirs.length; i++ ){
        let modelStringPath = `${modelBaseDir}/${modelDirs.slice(0, i + 1).join('/')}`;
        modelStringPath = modelStringPath.replace('//', '/');
        
        if( !fs.existsSync( modelStringPath ) ){
            infoLog(`Tạo thư mục ${ modelStringPath }`)
            fs.mkdirSync( modelStringPath )
        }
    }
    const newModelFilePath = `${ modelBaseDir }/${ modelPath }.js`;

    if( fs.existsSync( newModelFilePath ) ){
        warningLog(`Xóa tệp cũ tại ${ newModelFilePath }`)
        fs.unlinkSync( newModelFilePath )
    }
    fs.writeFileSync(newModelFilePath, modelTemplate )  
    return true;
}

const __make_controller__ = ( controllerPath ) => {
    const splitedName = controllerPath.split('/');
    const controllerName = splitedName[splitedName.length - 1];
    
    const isNameValid = validateName(controllerName);

    if( !isNameValid ){
        errorLog("Tên không hợp lệ!")
        return false;
    }

    const controllerDirs  = splitedName.filter( dir => dir != controllerName );

    const controllerTemplate = `
const { Controller } = require('${"../".repeat(splitedName.length) }config/controllers');

class ${ controllerName } extends Controller {
    constructor(){
        super();
    }

    get = async ( req, res ) => {
        this.writeReq(req)

        /* Logical code goes here */

        this.writeRes({ status: 200, message: "Sample response" })
        res.status(200).send({
            success: true,
            content: "Sample response",
            data: []
        })
    }

}
module.exports = ${ controllerName }

    `;
    for( let i = 0 ; i < controllerDirs.length; i++ ){
        let controllerStringPath = `${controllerBaseDir}/${controllerDirs.slice(0, i + 1).join('/')}`;
        controllerStringPath = controllerStringPath.replace('//', '/');
        
        if( !fs.existsSync( controllerStringPath ) ){
            infoLog(`Tạo thư mục ${ controllerStringPath }`)
            fs.mkdirSync( controllerStringPath )
        }
    }

    const newControllerFilePath = `${ controllerBaseDir }/${ controllerPath }.js`

    if( fs.existsSync( newControllerFilePath ) ){
        warningLog(`Xóa tệp cũ tại ${ newControllerFilePath }`)
        fs.unlinkSync( newControllerFilePath )
    }

    fs.writeFileSync(newControllerFilePath, controllerTemplate )   
    return true 
}


const __command_migrate__ = async ( migration = undefined ) => {
    let migrateModels = models;
    let saveModels = [];
    if( commands.length > 3 ){
        migrateModels = commands.slice( 3, commands.length );
        let valid = true;
        for( let i = 0; i < migrateModels.length; i++ ){
            if( models.indexOf(migrateModels[i]) == -1 ){
                errorLog(`Model ${ migrateModels[i] } không tồn tại!`)
                valid = false
            }
        }
        if( !valid ){
            return
        }
        saveModels = models;
    }

    const existingModels = []
    const modelObjects = migrateModels.map( model => {
        const modelPath = `${ modelBaseDir }/${ model }`.replace('//', '/'); 
        try{
            const obj = require(modelPath)
            const keys = Object.keys(obj);
            const modelObject = obj[keys[0]]   
            existingModels.push( model )
            
            return modelObject
        }catch{
            return undefined
        }
    }).filter( obj => obj != undefined );

    let valid = true;
    for( let i = 0 ; i < modelObjects.length; i++ ){
        const modelObject = modelObjects[i]
        const validateResult = modelValidator(modelObject)
        if( !validateResult ){
            valid = false
        }
    }

    if( valid ){        
        if( migration != undefined ){
            await migration(modelObjects);
        }
    }

    infoLog("Cập nhật manage.json", "\n")
    writeManageJSONWithData({ controllers, models: (saveModels.length > 0 ? saveModels: existingModels) })
}


const modelValidator = ( modelObj ) => {

    const Model       = new modelObj()
    const model       = Model.getModel()
    const fields      = model.__getFields__()
    const tableName   = model.__getTableName__();
    const primaryKey  = model.__getPrimaryKey__()
    const foreignKeys = model.__getForeignKeys__() 
    const fieldAmountCheck = () => {
        if( fields.length > 1 ){
            return true;
        }
        errorLog(`Bảng ${ tableName } cần có ít nhất một trường`)
        return false
    }

    const pkAmountCheck = () => {
        if( primaryKey.length > 0 ){
            return true;
        }
        errorLog(`Bảng ${ tableName } cần có ít nhất một trường làm khóa chính`)
        return false
    }

    const pkValidator = () => {
        let valid = true;
        for( let i = 0; i < primaryKey.length; i++ ){
            const primaryField = primaryKey[i];

            const filtedField = fields.filter( field => field.__fieldName == primaryField )[0];
            if( filtedField == undefined ){
                errorLog(`Khóa ${ primaryField } không tồn tại trong danh sách trường của bảng ${ tableName }`)
                valid = false;
            }else{
                successLog(`Khóa ${ primaryField } hợp lệ`)
            }
        }
        return valid;
    }

    const fkValidator = () => {

        if( foreignKeys.length == 0 ){
            return true;
        }else{

            let valid = true;
            for( let i = 0; i < foreignKeys.length; i++ ){
                const { __fieldName, __tableName, __onField } = foreignKeys[i];
                const foreignModel = Model[ __tableName ];

                const fieldExisted = fields.filter( field => field.__fieldName === __fieldName )[0]

                const foreignFields = foreignModel.__getFields__()
                const foreignTableName = foreignModel.__getTableName__()
                const filtedField = foreignFields.filter( field => field.__fieldName === __onField )[0];

                if( fieldExisted != undefined && filtedField != undefined ){
                    const fieldObject = fieldExisted.__fieldObject;
                    const foreignFieldObject = filtedField.__fieldObject;

                    if( fieldObject.__datatype === foreignFieldObject.__datatype ){
                        successLog(`Khóa ngoại ${ __fieldName } hợp lệ`)
                    }else{
                        errorLog(`${ tableName }.${ __fieldName }[ ${ fieldObject.__datatype.toUpperCase() } ] và ${ foreignTableName }.${ __onField }[ ${ foreignFieldObject.__datatype.toUpperCase() } ] phải có cùng kiểu dữ liệu`)
                        valid = false;
                    }
                }else{
                    if( fieldExisted == undefined ){
                        errorLog(`Khóa ${ __fieldName } không tồn tại trong danh sách trường của bảng ${ tableName }`)
                    }
                    if( filtedField == undefined ){
                        errorLog(`Khóa ${ __onField } không tồn tại trong danh sách trường của bảng ${ foreignTableName }`)
                    }
                    valid = false;
                }
            }
            return valid;
        }

    }
    const condition_1 = fieldAmountCheck()
    const condition_2 = pkAmountCheck()
    const condition_3 = pkValidator()
    const condition_4 = fkValidator()
    const result = condition_1 && condition_2 && condition_3 && condition_4;

    return result;
}

const __command_makemigration__ = async (models) => {
    for( let i = 0; i < models.length ; i++ ){
        const Model = new models[i]()
        const model = Model.getModel()
        infoLog(`Make migration trên bảng ${ model.__getTableName__() }`)
        await model.__deleteAll__()
    }      
}


const __command_sync__ = async () => {
    let migrateModels = models;
    let saveModels = [];
    if( commands.length > 3 ){
        migrateModels = commands.slice( 3, commands.length );
        let valid = true;
        for( let i = 0; i < migrateModels.length; i++ ){
            if( models.indexOf(migrateModels[i]) == -1 ){
                errorLog(`Model ${ migrateModels[i] } không tồn tại!`)
                valid = false
            }
        }
        if( !valid ){
            return
        }
        saveModels = models;
    }

    const existingModels = []
    const modelObjects = migrateModels.map( model => {
        const modelPath = `${ modelBaseDir }/${ model }`.replace('//', '/'); 
        try{
            const obj = require(modelPath)
            const keys = Object.keys(obj);
            const modelObject = obj[keys[0]]   
            const modelRecord = obj[keys[1]]   
            existingModels.push( model )
            
            return { modelObject, modelRecord }
        }catch{
            return undefined
        }
    }).filter( obj => obj != undefined );

    let valid = true;
    for( let i = 0 ; i < modelObjects.length; i++ ){
        const { modelObject, modelRecord } = modelObjects[i]
        const validateResult = await modelDataSync(modelObject, modelRecord)        
    }
}

const modelDataSync = async (ModelObject, ModelRecord ) => {
    const Model = new ModelObject()
    const model = Model.getModel();
    const fields = model.__getFields__()
    const data = await model.__find__()
    infoLog(`Đồng bộ hóa dữ liệu của bảng ${ model.__getTableName__() }` )
    for( let i = 0; i < data.length; i++ ){
        
        const Record = new ModelRecord( data[i] );

        for( let j = 0 ; j < fields.length; j++ ){          
            const field = fields[j];  
            const fieldObject = Record[field.__fieldName ];
            const fieldValue = fieldObject.value()

            if( fieldValue == undefined ){
                let defaultValue;
                switch( field.__datatype ){
                    case "date":
                    case "datetime":
                        defaultValue = new Date()
                        break;                
                    case "number":
                    case "int":
                        defaultValue = 0;
                         break;
                    case "bool":
                        defaultValue = true;
                        break;
                    case "enum":
                        defaultValue = field.__values[0];
                        break;
                    case "array":
                        defaultValue = []
                        break;
                }
                Record[ field.__fieldName ].value( defaultValue );   
            }
        }

        await Record.save()
    }  
    successLog(`Thành công!` )  
} 


/* ==== MAIN THREAD ==== */
const manageData = readManageJSON()
const { controllers, models } = manageData;
const commands = process.argv 


const __main__ = async () => {
    if( commands.length < 3 ){
        infoLog(`
Cú pháp: 
node manage create [ model < modelName > ]  ||
            create [ controller < controllerName > ] ||

            migrate
    

Ví dụ:
    node manage create model MyModel
    node manage migrate

:>
`)
        return
    }
    const mainCommand = commands[2].toLowerCase();

    switch(mainCommand){
        case "create":
            __command_create__()
            break;
        case "migrate":
            await __command_migrate__()
            break;
        case "makemigration":
            await __command_migrate__( __command_makemigration__ )                                    
            break;
        case "sync":
            await __command_sync__()
            break;
        default:
            warningLog(`Không tìm thấy lệnh! :( `)
            break;
    }
    process.exit(1);
}
        
__main__()