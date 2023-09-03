const { Controller } = require('../../config/controllers');
const { Projects, ProjectsRecord } = require('../../models/Projects');
const { ProjectMembers } = require('../../models/ProjectMembers');
const { Tables, TablesRecord } = require('../../models/Tables');
const { Versions, VersionsRecord } = require('../../models/Versions');
const { intValidate, objectComparator } = require('../../functions/validator');
const { Fields, FieldsRecord } = require('../../models/Fields');
const { Apis, ApisRecord } = require('../../models/Apis');
const { UserInterFace, UserInterFaceRecord } = require('../../models/UserInterFace')
const { translateUnicodeToBlanText } = require('../../functions/auto_value');
const { UserInterfaceComponent, UserInterfaceComponentRecord } = require('../../models/UseInterfaceComponent');

class UI extends Controller {
    #__tables = new Tables();
    #__versions = new Versions();
    #__projects = new Projects()
    #__projectMembers = new ProjectMembers()
    #__fields = new Fields();
    #__apis = new Apis();
    #__ui = new UserInterFace();
    #__uic = new UserInterfaceComponent();

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

    generalCheck = async ( req, version_id ) => {
        const verified = await this.verifyToken( req )

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            if( version_id && intValidate( version_id ) ){
                
                const version = await this.#__versions.find({ version_id: parseInt( version_id ) })
                if( version ){
                    const Version = new VersionsRecord( version );
                    const project = await this.#__projects.find({ project_id: Version.project_id.value() })

                    if( project ){
                        const Project = new ProjectsRecord( project )

                        const member = await this.getProjectPrivilege(project.project_id, username)
                        if( member || this.isAdmin( decodedToken ) ){
                            context.success = true
                            context.objects = {
                                Version,
                                Project,
                                token: decodedToken
                            }
                        }else{
                            context.content = "0x4501212"
                            context.status = "Bạn khum thuộc dự án này"
                        }
                    }else{
                        context.content = "Dự án khum tồn tại"
                        context.status = "0x4501213"
                    }
                }else{
                    context.content = "Phiên bản khum tồn tại"
                    context.status = "0x4501214"
                }
            }else{
                context.content = "Mã phiên bản khum hợp lệ"
                context.status = "0x4501215"    
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501216"
        }
        return context;
    }

    getUIs = async (req, res) => {
        const { version_id } = req.params;
        const context = await this.generalCheck( req, version_id )
        const { success, objects } = context;

        if( success ){

            const { Version } = objects;

            const uis = await this.#__ui.getAllUI({ version_id: Version.version_id.value() })
            context.data = {
                uis
            }
        }
        delete context.objects;

        res.status(200).send(context)
    }

    getUI = async ( req, res ) => {
        const { version_id, ui_id } = req.params;
        const context = await this.generalCheck( req, version_id )
        const { success, objects } = context;

        if( success ){

            const { Version } = objects;

            if( ui_id != undefined && intValidate(ui_id) ){
                const uiId = parseInt( ui_id )
                const ui = await this.#__ui.find({ ui_id: uiId });

                const rawCpns = await this.#__uic.findAll({ ui_id: uiId })
                const cpns = []
                for( let i = 0; i < rawCpns.length; i++ ){
                    const CPN = new UserInterfaceComponentRecord( rawCpns[i] )
                    cpns.push( CPN.get() )
                }
                ui.compnents = cpns;
                context.data = {
                    ui
                }
            }
        }
        delete context.objects;

        res.status(200).send(context)
    }

    createUI = async (req, res) => {
        /**
         * Request Header {
         *     Authorization: <Token>
         * }
         * 
         * Request Body {
         *     version_id: <Int>
         *     ui: {
         *         title: <String>
         *         status: <Bool>
         *         params: <Int>[]  => hiện tại cứ bỏ trống cái trường này 
         *     }
         * 
         *     widget: {
         *         table_id: <Int>
         *         layout_id: <Int>
         *         statistic_fields = <Field>[]
         *              Field{
         *                  display_name <Sting>
         *                  fomular: ENUM [ "SUM", "AVERAGE", "COUNT" ],
         *                  fomular_alias => <String>
         *                  field: <String> => cái này là field alias nhe quí dị
         *              }
         * 
         *     }
         * }
         * 
         * 
         */
         


        const { version_id } = req.body;

        const context = await this.generalCheck( req, version_id )
        const { success, objects } = context;
        if( success ){
            const { Version, token } = objects;
            const bodyNullCheck = this.notNullCheck(req.body, ["ui", "widget"]);            
            if( bodyNullCheck.valid ){

                const { ui, widget } = req.body;
                const uiNullCheck = this.notNullCheck( ui, [ "title", "status" ] )
                if(  uiNullCheck.valid ){
                    const rawURL = translateUnicodeToBlanText( ui.title );
                    const URL = `/` + rawURL.replaceAll(" ", '-');
                    const exestedURL = await this.#__ui.find({ url: URL, version_id: Version.version_id.value() })
                    
                    if( !exestedURL ){
                        const UI = new UserInterFaceRecord({ ...ui, create_by: token.username, url: URL, version_id: Version.version_id.value() })
                        // await UI.save()
    
                        const { table_id, statistic } = widget;
                        if( table_id != undefined && intValidate( table_id ) ){
                            const table = await this.#__tables.find({ id: parseInt( table_id ) })
                            if( table ){
                                const fields = await this.#__fields.allFieldsOfASingleTable( { table_id: table.id } )
                                const getID = Apis.createApiID()
                                const postID = Apis.createApiID()
                                const putID = Apis.createApiID()
                                const deleteID = Apis.createApiID()
                                const GET = {
                                    api_method: "get",
                                    api_id: getID,
                                    api_scope: "private",
                                    api_name: `HIDDEN API FOR UI: ${ UI.title.value() } - ${ UI.url.value() }`,
                                    tables: [ table.id ],
                                    fields: fields.map( field => { return { id: field.id, display_name: field.field_name } }),
                                    body: [],
                                    status: true,
                                    params: [],
                                    calculates: [],
                                    statistic,
                                    url: `/api/${ getID }`,
                                    create_by: token.username,
                                    version_id: Version.version_id.value(),
                                    create_at: new Date(),
                                }
                                const POST = {
                                    api_method: "post",
                                    api_id: postID,
                                    api_scope: "private",
                                    api_name: `HIDDEN API FOR UI: ${ UI.title.value() } - ${ UI.url.value() }`,
                                    tables: [ table.id ],
                                    fields: [],
                                    status: true,
                                    body: fields.map( field => { return field.id }),
                                    params: [],
                                    calculates: [],
                                    statistic,
                                    url: `/api/${ postID }`,
                                    create_by: token.username,
                                    version_id: Version.version_id.value(),
                                    create_at: new Date(),
                                }                            
    
                                const updateBodyFields = fields.filter( field => {
                                    const { primary_key } = table;
                                    if( primary_key ){
                                        return primary_key.indexOf( field.id ) == -1
                                    }else{
                                        return false
                                    }
                                })
    
                                const paramFields = fields.filter( field => {
                                    const { primary_key } = table;
                                    if( primary_key ){
                                        return primary_key.indexOf( field.id ) != -1
                                    }else{
                                        return false
                                    }
                                })
    
                                const updateBody = updateBodyFields.map( field => field.id )
                                const params = paramFields.map( field => field.id )
    
                                const PUT = {
                                    api_method: "put",
                                    api_id: putID,
                                    api_scope: "private",
                                    api_name: `HIDDEN API FOR UI: ${ UI.title.value() } - ${ UI.url.value() }`,
                                    tables: [ table.id ],
                                    fields: [],
                                    status: true,
                                    body: updateBody,
                                    params,
                                    calculates: [],
                                    statistic,
                                    url: `/api/${ putID }`,
                                    create_by: token.username,
                                    version_id: Version.version_id.value(),
                                    create_at: new Date(),
                                }
    
                                const DELETE = {
                                    api_method: "delete",
                                    api_id: deleteID,
                                    api_scope: "private",
                                    api_name: `HIDDEN API FOR UI: ${ UI.title.value() } - ${ UI.url.value() }`,
                                    tables: [ table.id ],
                                    fields: [],
                                    body: [],
                                    params,
                                    calculates: [],
                                    statistic,
                                    status: true,
                                    url: `/api/${ deleteID }`,
                                    create_by: token.username,
                                    version_id: Version.version_id.value(),
                                    create_at: new Date(),
                                }
    
                                const APIGET = new ApisRecord( GET )
                                const APIPOST = new ApisRecord( POST )
                                const APIPUT = new ApisRecord( PUT )
                                const APIDELETE = new ApisRecord( DELETE )
                                
                                if( updateBody.length != 0 ){
                                    if( params.length != 0 ){
                                        await UI.save()
                                        await APIGET.save()
                                        await APIPOST.save()
                                        await APIPUT.save()
                                        await APIDELETE.save()
                                        const Component = new UserInterfaceComponentRecord({
                                            component_name: table.table_name,                                            
                                            ui_id: UI.ui_id.value(),
                                            layout_id: widget.layout_id,
                                            api_get: APIGET.url.value(),
                                            api_post: APIPOST.url.value(),
                                            api_put: APIPUT.url.value(),
                                            api_delete: APIDELETE.url.value()
                                        }) 
    
                                        await Component.save();
                                        // await this.saveLog()
                                        context.data = {
                                            ui: UI.get(),
                                            component: Component.get(),
                                            apis: {
                                                get: await APIGET.get(),
                                                post: await APIPOST.get(),
                                                put: await APIPUT.get(),
                                                delete: await APIDELETE.get(),
                                            }
                                        }
                                    }else{
                                        context.success = false;
                                        context.content = "Bảng khum hợp lệ vì khum có cái khóa chính nào hết trơn"    
                                    }
                                }else{
                                    context.success = false;
                                    context.content = "Bảng khum hợp lệ vì khum có cái trường nào khác ngoài khóa chính"    
                                }
                            }else{
                                context.success = false;
                                context.content = "Bảng khum tồn tại"    
                            }
                        }else{
                            context.success = false;
                            context.content = "Bảng khum tồn tại"
                        }                    
                    }else{
                        context.success = false;
                        context.content ="URL này đã tồn cmn tại"    
                    }
                }else{
                    context.success = false;
                    context.content ="Boa đùy khum hụp lịa"
                }
            }else{
                context.success = false;
                context.content ="Boa đùy khum hụp lịa"
            }            
        }
        delete context.objects
        res.status( 200 ).send( context )
    }



    removeComponent = async ( req, res ) => {

        /* SUSPEND UNTIL MULTI COMPONENTS PER PAGE IS AVAILABLE */
        const { version_id } = req.body;

        const context = await this.generalCheck( req, version_id )
        const { success, objects } = context;
        if( success ){
            const { component_id } = req.body;
            if( component_id != undefined && intValidate( component_id ) ){
                const component = this.#__uic.find({ component_id: parseInt( component_id ) })
            }
        }
        res.status(200).send(context)
    }

    removeUI = async ( req, res ) => {
        const { version_id } = req.body;
        const context = await this.generalCheck( req, version_id )
        const { success, objects } = context;

        if( success ){
            const { ui_id } = req.body;
            if( ui_id != undefined && intValidate( ui_id ) ){
                const ui = await this.#__ui.find({ ui_id: parseInt( ui_id ) })                
                if( ui ){
                    const UI = new UserInterFaceRecord(ui)
                    await UI.remove()
                    /* LOG REMAINS  */
                    /* REMOVE CORESPONDING API REMAINS */
                }
            }
            context.content = "Xóa thành công"
        }        
        delete context.objects;
        res.status(200).send(context)
    }

}
module.exports = UI

    