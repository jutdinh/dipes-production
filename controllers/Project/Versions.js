const Crypto = require('../Crypto')
const Cache = require('../Cache/Cache')

const { Controller } = require('../../config/controllers');
const { Versions, VersionsRecord } = require('../../models/Versions');
const { ProjectMembers, ProjectMembersRecord } = require('../../models/ProjectMembers');
const { Accounts } = require('../../models/Accounts');
const { Projects } = require('../../models/Projects');
const { intValidate } = require('../../functions/validator');

const { Tables, TablesRecord } = require('../../models/Tables');
const { Fields, FieldsRecord } = require('../../models/Fields');
const { Apis, ApisRecord } = require('../../models/Apis');
const { Privileges, PrivilegesRecord } = require('../../models/Privileges')

const { Statistics, StatisticsRecord } = require('../../models/Statistics')

const { Activation } = require('../../models/Activation');
const { Database } = require('../../config/models/database');

class VersionsController extends Controller {
    #__versions = undefined;
    #__projectMembers = undefined;
    #__accounts = undefined;    

    #__tables = new Tables();
    #__fields = new Fields();
    #__apis = new Apis();    
    #__projects = new Projects()
    #__keys = new Activation();
    #__privileges = new Privileges()


    constructor(){
        super();
        this.#__versions = new Versions()
        this.#__projectMembers = new ProjectMembers();
        this.#__accounts = new Accounts()
        this.#__projects = new Projects()
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

    getVersions = async ( req, res ) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * 
         */
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account || this.isAdmin(decodedToken)){                
                
                const versions = await this.#__versions.getAllProjectVersions(); 
                context.content = "Thành công"
                context.success = true;
                context.status = "0x4501166" 
                context.data = versions;                    

            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501169"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501170"
        }
        res.status(200).send(context);
    }


    newVersion = async (req, res) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * Request Body {         
         *      version_name: <String>,
         *      version_description: <String>,
         *      
         *      
         * } 
         * 
         */

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account || this.isAdmin( decodedToken ) ){
        
                const { version_name, version_description } = req.body
                const NewVer = new VersionsRecord({
                    version_name,
                    version_description,
                    modified_at: new Date()
                })

                await NewVer.save()
                const data = NewVer.get()

                context.content = "Tạo thành công nha quí vị"
                context.success = true
                context.data = data
                
            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501169"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501170"
        }

        res.status(200).send(context);
    }


    updateVersion = async (req, res) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * Request Body {         
         *      version_id: <Int>,
         *      version_name: <String>,
         *      version_description: <String>,
         *      
         *      
         * } 
         * 
         */

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account || this.isAdmin( decodedToken ) ){
        
                const { version_id, version_name, version_description } = req.body
                
                const versions = await this.#__versions.findAll({ version_id })
                if( versions.length > 0 ){
                    const version = versions[0]

                    const NewVer = new VersionsRecord({
                        id: version.id, 
                        version_id, 
                        version_name, 
                        version_description,
                        modified_at: new Date()
                    })

                    await NewVer.save()
                    const data = NewVer.get()
    
                    context.content = "Tạo thành công nha quí vị"
                    context.success = true
                    context.data = data

                }else{
                    context.content = "Version không tồn tại" 
                }

                
            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501169"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501170"
        }

        res.status(200).send(context);
    }

    removeVersion = async  (req, res) => {
/* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * Request Body {         
         *      version_id: <Int>,
         *      version_name: <String>,
         *      version_description: <String>,
         *      
         *      
         * } 
         * 
         */

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account || this.isAdmin( decodedToken ) ){
        
                const { version_id } = req.body
                
                const versions = await this.#__versions.findAll({ version_id })
                if( versions.length > 0 ){
                    const version = versions[0]
                   
                    const Ver = new VersionsRecord(version)
                    await Ver.remove()

                    context.content = "Xóa version thành công"
                    context.success = true                    

                }else{
                    context.content = "Version không tồn tại"
                }

                
            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501169"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501170"
        }

        res.status(200).send(context);
    }

    getOneVersion = async ( req, res ) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * 
         * Request Params {
         *      version_id
         * } 
         * 
         */
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }       

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account ){                
                const Version = await this.getVersion( req.params.version_id )
                if( Version ){
                    const permission = await this.getProjectPrivilege( Version.project_id.value(), account.username )
                    if( permission ){                        
                        context.success = true
                        context.data = {
                            version: await Version.get()
                        }
                        context.status = "0x4501171"
                    }else{
                        context.content = "Bạn khum thuộc dự án này"
                        context.status = "0x4501172"
                    }
                }else{
                    // bad request
                    context.content = "Request header khum hợp lệ"
                    context.status = "0x4501173"
                }
            }else{
                // accoun un avail able
                context.content = "Tài khoản của bạn khum khả dụng hoặc đã bị xóa"
                context.status = "0x4501174"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501175"
        }
        res.status(200).send(context);
    }

    duplicateVersion = async (req, res, privileges = ["ad", "pm"]) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *     project_id <Int>,
         *     version_id <Int>             
         *      
         * }
         * 
         */
    }



    getProjectIDFromKey = ( key ) => {
        const { ACTIVATION_KEY } = key;
        const splittedKey = ACTIVATION_KEY.split('\n');
        const encryptRawProjectID = splittedKey[2];
        const encryptProjectID = encryptRawProjectID.replaceAll("-", "")        
        
        const Decipher = new Crypto()
        
        const rawProjectId = Decipher.decrypt( encryptProjectID )
        const isInt = intValidate( rawProjectId )
        if( isInt ){
            return parseInt( rawProjectId )
        }else{
            return undefined
        }
    }

    getTable = (tableId) => {
        const table = this.tables.find(tb => tb.id == tableId)
        return table;
    }

    
    findSlaveRecursive = (table, master) => {
        const { foreign_keys } = table;
        const slaveRelation = foreign_keys.find(key => key.table_id == master.id)

        if (slaveRelation) {
            return true
        } else {
            if (foreign_keys.length == 0) {
                return false
            } else {
                let found = false
                for (let i = 0; i < foreign_keys.length; i++) {
                    const { table_id } = foreign_keys[i]
                    const nextMaster = this.getTable(table_id)
                    if (!found) {
                        found = this.findSlaveRecursive(nextMaster, master)
                    }
                }
                return found
            }
        }
    }

    detectAllSlave = (master) => {
        const tables = this.tables;
        const slaves = []
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i]
            let found = this.findSlaveRecursive(table, master)
            if (found) {
                slaves.push(table)
            }
        }
        return slaves
    }


    detectAllMaster = (slave) => {
        const tables = this.tables;
        const masters = []

        for (let i = 0; i < tables.length; i++) {
            const table = tables[i]

            const slaves = this.detectAllSlave(table)
            const isAMaster = slaves.find(tb => tb.id == slave.id)

            if (isAMaster) {
                masters.push(table)
            }
        }
        return masters
    }

    fillPositionsToData = ( data = [] ) => {
        const length = data.length;
        const periodDelimiter = 10000
        const total_partition = Math.ceil( length / periodDelimiter ) // default record per partition
        for( let i = 0; i < length; i++ ){
            const num = i
            const multiples = Math.floor(num / periodDelimiter)
            const start = multiples * periodDelimiter
            const end = (multiples + 1) * periodDelimiter
            data[i].position = `${start}-${end - 1}`
        }

        const periods = []
        let leftBehind = length

        for( let i = 0; i < total_partition; i++ ){

            const start = i * periodDelimiter
            const end = (i + 1) * periodDelimiter

            const period = `${ start }-${ end - 1 }`
            leftBehind -= 10000

            let total = 0;
            if( leftBehind > 0 ){
                total = periodDelimiter
            }else{
                total = leftBehind + periodDelimiter
            }            

            periods.push({
                position: period,
                total: total
            })
        }

        return { data, periods }
    }


    importDatabase = async ( req, res ) => {
        const { data } = req.body;

        const checkNull = this.notNullCheck( data, ["database"] )
        if( checkNull.valid ){
            const Decipher = new Crypto();
            const decryptedData =  Decipher.decrypt( data.database )
            const { database } = JSON.parse( decryptedData )
            const keys = await this.#__keys.findAll()
            const key = keys[0]            
            
            if( key ){
                // const project_id = this.getProjectIDFromKey( key )
                // if( project_id != undefined ){
                    
                    if( database ){
                        const { project, tables, fields } = database;
                        const dbo = await Database.getDBO()
                        // console.log(project_id)
                        // console.log(project)
                        // if( project_id == project.project_id ){
                            const newFields = fields.map( field => {
                                const tearedField =  {  ...field, ...field.props }
                                delete tearedField.props;
                                return tearedField
                            })
                            await this.#__tables.deleteAll();
                            await this.#__fields.deleteAll();
                            await this.#__projects.deleteAll()
                            await this.#__privileges.deleteAll()
                    
                            await this.#__tables.insertMany( tables );
                            await this.#__fields.insertMany( newFields );   
                            await this.#__projects.insertMany( [ project ] )  
                            const accounts = await this.#__accounts.findAll()
                            const privileges = []
                            this.tables = tables;


                            const systemTables = [
                                { table_alias: "accounts", keys: [ "username" ] },
                                { table_alias: "table", keys: [ "id" ] },
                                { table_alias: "fields", keys: [ "id", "table_id" ] },
                                { table_alias: "buttons", keys: [ "button_id", "id" ] },
                                { table_alias: "privileges", keys: [ "username", "table_id" ] },
                                { table_alias: "privilegegroup", keys: [ "privilegegroup_id", "id" ] },
                                { table_alias: "privilegedetail", keys: [ "privilegegroup_id", "id", "privilegedetail_id", "button_id" ] },
                                { table_alias: "userprivileges", keys: [ "id", "username", "privilegegroup_id" ] },
                            ]

                            await Promise.all(systemTables.map( (table) => {
                                const { table_alias, keys } = table
                                const indexing = {}
                                keys.map( key => indexing[key] = 1 )
                                return dbo.collection(`${table_alias}`).createIndex( indexing )
                            }))

                            const { preimports } = database;
                            const serializedImportData = Object.values( preimports )


                            for(  let r = 0; r < serializedImportData.length; r++ ){
                                const { table_alias, data } = serializedImportData[r]                                

                                const serializedData = this.fillPositionsToData( data )

                                const positionedData = serializedData.data;
                                const periods = serializedData.periods

                                data.unshift({
                                    position: "sumerize",
                                    total: data.length
                                })

                                

                                await dbo.collection(`${table_alias}`).deleteMany({})
                                await dbo.collection(`${table_alias}`).insertMany(data)

                                await dbo.collection("CACHE_TABLE_NEVER_DIE").deleteOne({ key: `${ table_alias }-periods` })
                                await dbo.collection("CACHE_TABLE_NEVER_DIE").insertOne({ key: `${ table_alias }-periods`, value: periods })
                            }


                            /** check indexing and privileges */

                            
                            for( let i = 0 ; i < tables.length; i++ ){
                                const table = tables[i]
                                const { primary_key, table_alias, foreign_keys } = table 
                                const indexing = {}
                                primary_key.map( field_id => {
                                    const primaryField = fields.find( f => f.id == field_id )
                                    if( primaryField ){
                                        indexing[primaryField.fomular_alias] = 1
                                    }
                                })
                                const masters = this.detectAllMaster(table)
                                for( let j = 0 ; j < masters.length; j++ ){
                                    const master = masters[j]
                                    const { primary_key } = master;
                                    const primary_fields =  fields.filter( field => primary_key.indexOf( field.id ) != -1 );
                                    const masterIndexing = {}
                                    primary_fields.map( field => {
                                        masterIndexing[field.fomular_alias] = 1
                                    })
                                    await dbo.collection(`${table_alias}`).createIndex( masterIndexing )                                
                                }                                

                                await Promise.all( foreign_keys.map( key => {
                                    const { field_id } = key;
                                    const field = fields.find( f => f.id == field_id )
                                    return dbo.collection(`${table_alias}`).createIndex( { [field.fomular_alias]: 1 } )                                
                                }))

                                if( primary_key.length > 0 ){                                    
                                    await dbo.collection(`${table_alias}`).createIndex( indexing )                                
                                }
                                await dbo.collection(`${table_alias}`).createIndex( { "position": 1 } )     
                                


                                accounts.map( account => {
                                    const isAdmin = account.role == "ad" ? true : false;

                                    const privilege = {
                                        username: account.username,
                                        table_id: table.id,
                                        read: true,
                                        write: isAdmin,
                                        modify: isAdmin,
                                        purge: isAdmin
                                    }
                                    privileges.push( privilege )
                                })
                            }

                            await this.#__privileges.insertMany( privileges );                              
                            res.status(200).send({ success: true })
                        // }
                        // else{
                        //     res.status(200).send({ success: false, content: " Project khác với khóa " })    
                        // }
                    }else{
                        res.status(200).send({ success: false, content: "Khum tìm thấy dữ liệu" })
                    }
                // }
                // else{
                //     res.status(200).send({ success: false, content: "Khum tìm thấy project id trong khóa" })    
                // }
            }else{
                res.status(200).send({ success: false, content: "Chưa kích hoạt khóa mấy má oi" })
            }
        }else{
            res.status(200).send({ success: false , content: "Body bị null nhe má"})
        }
    }

    formatCalculateString = ( rawString = "" ) => {
        let string = rawString.toUpperCase()
        const fomulars = [
            {
                fomular: "DATE",
                prefix: " new Date",
                postfix: ".getDate() "
            },
             {
                fomular: "MONTH",
                prefix: " (new Date",
                postfix: ".getMonth() + 1) "
            },
            {
                fomular: "YEAR",
                prefix: " new Date",
                postfix: ".getFullYear() "
            }
        ]

        // console.log(string)

        for( let i = 0 ; i < fomulars.length; i++ ){
            // console.log(string)
            const { fomular, prefix, postfix } = fomulars[i]
            const splitted = string.split(fomular)

            if( splitted.length > 1 ){
                for( let h = 1; h < splitted.length; h++ ){
                    // console.log(splitted[h-1])
                    splitted[h - 1] += prefix
                    const post = splitted[h]
                    let newPost = ""
                    let loopBreak = false
                    for( let j = 0 ; j < post.length; j++ ){
                        newPost += post[j]                        
                        if( post[j] == ")" && !loopBreak ){
                            newPost += postfix    
                            loopBreak = true
                            // break                        
                        }
                    }
                    splitted[h] = newPost
                }
            }    
            // console.log(911, splitted)        
            string = splitted.join('')
            // console.log(913, string)

            if( i == fomulars.length - 1 ){
                let dateSplitted = string.split('new Date')
                for( let k = 0 ; k < dateSplitted.length; k++ ){
                    const piece = dateSplitted[k]
                    // console.log(piece)
                    if( piece.length > 2 ){
                        let pieceCopy = ""
                        let loopBreak = false
                        for( let c = 0 ; c < piece.length; c++ ){
                            pieceCopy += piece[c]
    
                            if( piece[c] == "(" && !loopBreak){
                                pieceCopy += "'"
                            }
    
                            if(piece[c + 1] == ")" && !loopBreak){
                                pieceCopy += "'"
                                loopBreak = true                            
                            }
                        }
                        dateSplitted[k] = pieceCopy
                    }
                }
                string = dateSplitted.join('new Date')
            }
        }        

        return string
    }

    synchronizeAPIData = async ( api ) => {
        const table_id = api.tables[0]        
        const table = await this.#__tables.find({ id: table_id })
        if( table ){
            const { calculates, statistic } = api
            const fields = await this.#__fields.findAll({ table_id })
            const { table_alias } = table;
            const keys = fields.map( field => field.fomular_alias )
            keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
            const oldSumerize = await Database.select(table_alias, { position: "sumerize" })
            // console.log(api.api_name)  
            // console.log(statistic.length)
            if( statistic.length > 0 ){

                if( oldSumerize != undefined && oldSumerize.total > 0){
                    const sumerize = {
                        total: oldSumerize.total
                    }                
                    const cache = await Cache.getData(`${ table_alias }-periods`)
                    if(cache){
                        const partitions = cache.value   
    
                        for( let i = 0; i < partitions.length; i++ ){
                            const { position } = partitions[i]
                            const data = await Database.selectAll( table_alias, { position } )                           
                            
                            for( let j = 0; j < data.length; j++ ){
                                const record = data[j]
                                
                                for (let k = 0; k < calculates.length; k++) {
                                    const { fomular_alias, fomular } = calculates[k]
                                    let result = this.formatCalculateString(fomular);
                                    keys.map(key => {
                                        /* replace the goddamn fomular with its coresponding value in record values */
                                        result = result.replaceAll(key, record[key])
                                    })
                                    try {
                                        record[fomular_alias] = eval(result)
                                    } catch {
                                        record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                                    }
                                }
        
        
                                for( let k = 0 ; k < statistic.length; k++ ){
                                    const data = record
                                    const statis = statistic[k]
                                    const { fomular_alias, field, group_by, fomular } = statis;
                                    const stringifyGroupKey = group_by.map(group => data[group]).join("_")
                                    const statisField = sumerize[fomular_alias];
                                    if (!statisField) {
                                        if (group_by && group_by.length > 0) {
                                            sumerize[fomular_alias] = {}
                                        } else {
                                            sumerize[fomular_alias] = 0
                                        }
                                    }
                                    if (fomular == "SUM") {
                                        if (typeof (data[field]) == "number") {
                                            if (group_by && group_by.length > 0) {
        
                                                if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                                    sumerize[fomular_alias][stringifyGroupKey] = data[field]
                                                } else {
                                                    sumerize[fomular_alias][stringifyGroupKey] += data[field]
                                                }
                                            } else {
                                                sumerize[fomular_alias] += data[field]
                                            }
                                        }
                                    }
        
                                    if (fomular == "AVERAGE") {
                                        if (typeof (data[field]) == "number") {
                                            if (group_by && group_by.length > 0) {
        
                                                if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                                    sumerize[fomular_alias][stringifyGroupKey] = {
                                                        total: 1,
                                                        value: data[field] 
                                                    }
                                                } else {
                                                    if( sumerize[fomular_alias][stringifyGroupKey].value ){
                                                        sumerize[fomular_alias][stringifyGroupKey].value = ( sumerize[fomular_alias][stringifyGroupKey].value * sumerize[fomular_alias][stringifyGroupKey].total  + data[field]) / ( sumerize[fomular_alias][stringifyGroupKey].total + 1 ) 
                                                    }else{
                                                        sumerize[fomular_alias][stringifyGroupKey].value = data[field]
                                                    }
                                                    sumerize[fomular_alias][stringifyGroupKey].total += 1
                                                }
                                            } else {
                                                sumerize[fomular_alias] = (sumerize[fomular_alias][stringifyGroupKey] * sumerize.total  + data[field]) / ( sumerize.total + 1 ) 
                                            }
                                        }
                                    }
        
                                    if (fomular == "COUNT") {
                                        if (group_by && group_by.length > 0) {
        
                                            if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                                sumerize[fomular_alias][stringifyGroupKey] = 1
                                            } else {
                                                sumerize[fomular_alias][stringifyGroupKey] += 1
                                            }
                                        }
                                    }
                                }
        
        
                            }
                        }
                    }   
                            
                    Database.update(table_alias, {"position": "sumerize"}, { ...sumerize })
                }else{
                    console.log("No api found")        
                }
            }
        }else{
            console.log("Table not found")
        }
    }

    resetStatis = async () => {
        const Statis = new Statistics();
        const model = Statis.getModel()
        const tableName = model.__getTableName__()

        await Database.update( tableName, {}, { calculates: [], statistic: [] } )
    }


    saveStatisticInfor = async (api) => {
        const { tables, calculates, statistic } = api
        const table_id = tables[0];
        const Statis = new Statistics()
        const table = await Statis.find({ table_id })
        // console.log(table)
        if( !table ){
            const statisConfig = new StatisticsRecord({
                table_id,
                statistic,
                calculates
            })
            // console.log("INSERT")
            await statisConfig.save()
        }else{
            const statisConfig = new StatisticsRecord( table )
            const tableCalculates = statisConfig.calculates.valueOrNot() 
            
            for( let i = 0; i < calculates.length; i++ ){
                const calculate = calculates[i]

                const oldCal = tableCalculates.find( c => c.fomular_alias == calculate.fomular_alias )
                if( oldCal ){
                    const index = tableCalculates.indexOf( oldCal )
                    tableCalculates[index] = calculate
                    // console.log("REPLACE CALCULATE")
                }else{
                    tableCalculates.push( calculate )
                }
            }
            statisConfig.calculates.value( tableCalculates )


            const tableStatistics = statisConfig.statistic.valueOrNot() 
            for( let i = 0; i < statistic.length; i++ ){
                const statis = statistic[i]

                const oldCal = tableStatistics.find( c => c.fomular_alias == statis.fomular_alias )
                if( oldCal ){
                    const index = tableStatistics.indexOf( oldCal )
                    tableStatistics[index] = statis
                    // console.log("REPLACE STATIS")
                }else{
                    tableStatistics.push( statis )
                }
            }
            statisConfig.statistic.value( tableStatistics )
            await statisConfig.save()
        }
    }
    
    importAPI = async ( req, res ) => {
        const { data } = req.body;
        
        const checkNull = this.notNullCheck( data, ["apis"] )
        if( checkNull.valid ){

            const Decipher = new Crypto();
            const decryptedData =  Decipher.decrypt( data.apis )
            const { apis } = JSON.parse( decryptedData )
            if( apis ){
                await this.#__apis.deleteAll()

                // apis.map(  api => console.log(api) )
                
                const syncAPIs = apis.filter( api => {
                    const { url, api_method } = api;
                    const apiType = url.split('/')[1]
                    if( apiType=="ui" && api_method == "post" ){
                        return true
                    }
                    return false
                })               
                await this.#__apis.insertMany(apis)
                await this.resetStatis()
                for( let i = 0 ; i < syncAPIs.length; i++ ){
                    await this.saveStatisticInfor(syncAPIs[i])
                }                
                for( let i = 0 ; i < syncAPIs.length; i++ ){
                    await this.synchronizeAPIData(syncAPIs[i])
                }
                res.status(200).send({ success: true })
            }else{
                res.status(200).send({ success: false })
            }
        }else{
            res.status(200).send({ success: false })
        }
    }
}
module.exports = VersionsController

    