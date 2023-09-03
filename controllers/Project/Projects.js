
const { Controller } = require('../../config/controllers');
const { intValidate } = require('../../functions/validator');
const { ProjectMembers, ProjectMembersRecord } = require('../../models/ProjectMembers');
const { Projects, ProjectsRecord } = require('../../models/Projects');
const { Tasks } = require('../../models/Tasks');
const { Versions, VersionsRecord } = require('../../models/Versions');
const { Accounts, AccountsRecord } = require('../../models/Accounts');

class ProjectsController extends Controller {
    #__projects = undefined;    
    #__accounts = undefined;
    #__defaultAccount = undefined;
    #__projectMembers = undefined;
    #__versions = undefined;
    #__tasks = undefined

    constructor(){
        super();
        this.#__projects = new Projects()
        this.#__accounts = new Accounts()
        this.#__defaultAccount = Accounts.__defaultAccount;
        this.#__projectMembers = new ProjectMembers()
        this.#__versions = new Versions()
        this.#__tasks = new Tasks()
    }

    get = async ( req, res, privileges = ["uad"] ) => {
        /*
            Request Headers {
                Authorization: <Token>
            }
        */

        this.writeReq(req)
        const verified = await this.verifyToken(req);
        
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username, role } = decodedToken;
            const account = await this.#__accounts.find({ username });
            if( account || decodedToken.username === this.#__defaultAccount.username ){
                if( privileges.indexOf( role ) != -1 || this.isAdmin(account) ){
    
                    const projects = await this.#__projects.AllProjects()
                    if( projects.length == 0 ){
                        context.content = "Khum tìm thấy dự án nào cả";
                        context.status = "0x4501042"
                    }else{
                        context.content = "Thành công"
                        context.status = "0x4501041"
                    }                       
                    for( let i = 0; i < projects.length; i++ ){
                        projects[i].manager = await this.getProjectManager(projects[i])
                        projects[i].members = await this.getProjectMembers(projects[i])
                        projects[i].progress = await this.getProjectProgress( projects[i] )
                    }  
                    context.success = true
                    context.data = projects;
                }else{
                    context.content = "Bạn khum có quyền truy cập API này!";
                    context.status = "0x4501043"
                }
            }else{
                context.content = "Account bạn đang sử dụng đã bị xoá!"
                context.status = "0x4501044"
            }
        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = "0x4501045"
        }
        res.status(200).send(context)
    }

    getStatistic = async (req, res) => {
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         *  
         * 
         */

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }
        if( verified ){
            
            const statuses = Projects.validStatus;
            const state_statis = {}
            for( let i = 0; i < statuses.length; i++ ){
                state_statis[ i.toString() ] = await this.#__projects.count({ project_status: statuses[i] })
            }
            context.success = true;
            context.content = "Thành công"
            context.data = state_statis
            context.status = "0x4501046"

        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = "0x4501047"
        }
        res.status(200).send(context)        
    }

    getOneProject = async (req, res, privileges = ["ad", "pm"]) => {
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Params {
         *      project_id <Int>
         * } 
         * 
         */

        this.writeReq(req)
        const verified = await this.verifyToken(req);
        
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
           const decodedToken = this.decodeToken( req.header("Authorization") );
           const { username, role } = decodedToken;
           const account = await this.#__accounts.find({ username });
           if( account || decodedToken.username === this.#__defaultAccount.username ){
               if( privileges.indexOf( role ) != -1 || this.isAdmin(account) ){
                    const rawProjectId = req.params.project_id;
                    if( rawProjectId != undefined){
                        const isProjectIDValid = intValidate( rawProjectId );
                        if( isProjectIDValid ){
                            const project_id = parseInt( rawProjectId );
                            const project = await this.#__projects.find({ project_id });
                            if( project ){
                                const Project = new ProjectsRecord( project )
                                context.success = true;
                                context.content = "Thành công"
                                context.data = await Project.get();
                                context.data.manager = await this.getProjectManager({ project_id })
                                context.data.members = await this.getProjectMembers({ project_id })
                                context.data.versions = await this.getProjectVersions({ project_id })
                                context.data.progress = await this.getProjectProgress({ project_id })
                                context.status = "0x4501048"
                            }else{
                                context.content = "Khum tìm thấy dự án";
                                context.status = "0x4501049"
                            }
                        }else{
                            context.content = "project_id phải là một số nguyên";
                            context.status = "0x4501050"
                        }
                    }else{
                        context.content = "??";
                        context.status = this.getCode("unknown error");
                    }
               }else{
                    context.content = "Bạn khum có quyền truy cập API này!";
                    context.status = "0x4501051"
               }
           }else{
                context.content = "Account bạn đang sử dụng đã bị xoá!"
                context.status = "0x4501052"
           }
        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = "0x4501053"
        }
        res.status(200).send(context)
    }

    getProjectManager = async ( project ) => {
        const { project_id } = project;
        const projectManager = await this.#__projectMembers.find({ project_id, permission: Controller.permission.mgr });
        if( projectManager ){
            const { username } =  projectManager;
            const manager = await this.#__accounts.find({ username });

            if( manager ){
                const Manager = new AccountsRecord( manager );
                return Manager.get()
            }else{
                return "Người quản lý dự án này đã bị xóa!"    
            }
        }else{
            return "Dự án này chưa có người quản lý"
        }
    }

    getProjectMembers = async ( project ) => {
        const { project_id } = project;
        const projectMembers = await this.#__projectMembers.findAll({ project_id, permission: { $in: [Controller.permission.spv, Controller.permission.dpr ] } })
        
        const accounts = [];
        if( projectMembers ){
            for( let i = 0 ; i< projectMembers.length ; i++){
                const { username, permission } = projectMembers[i];
                const account = await this.#__accounts.find({ username });
                if( account ){
                    const Account = new AccountsRecord( account );
                    const info = Account.get()
                    info.permission = permission;                    
                    accounts.push( info )
                }
            }
        }
        return accounts;
    }

    getProjectProgress = async ({ project_id }) => {
        const completedStatus = true;
        const tasks = await this.#__tasks.findAll({ project_id });
        const total = tasks.length;
        if( total > 0 ){
            const completed = tasks.filter( task => task.task_approve == completedStatus ).length;
            return Math.ceil( 100 * completed / total );
        }else{
            return 0
        }
    }

    getProjectVersions = async (project) => {
        const { project_id } = project;
        const versions = await this.#__versions.getAllProjectVersions(  project_id  );
        return versions;
    }

    createProject = async (req, res, privileges = ["ad"]) => {
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *      project: {
         *          project_name <String>
                    project_code <String>
                    project_status <Int>
                    project_description <String>
         *      }
                manager: {
                    username <String>
                }
                version: {
                    version_name         <String>
                    version_description  <String>
                }
         * }
         * 
         * 
         */
        this.writeReq(req)
        const verified = await this.verifyToken(req);
        
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );

            if( privileges.indexOf( decodedToken.role ) != -1 ){
                const { project } = req.body;
                if( project ){
                    const nullCheck = this.notNullCheck(project, ["project_name", "project_status"])
                    if( project != undefined ){                   
                            if( nullCheck.valid ){
                                const create_by = decodedToken.username;
                                const create_at = new Date()

                                const account = await this.#__accounts.find({ username: create_by });
                                if( account ){
                                    const Project = new ProjectsRecord ({ ...project, create_by, create_at });
                                    await Project.save()                                                                    
                                    const { manager } = req.body;
                                    if( manager ){
                                        const { username } = manager;
                                        const doesManagerExist = await this.#__accounts.find({ username });
                                        if( doesManagerExist ){
                                            const Manager = new AccountsRecord( doesManagerExist );
                                            if( [ Controller.permission.pm ].indexOf( Manager.role.value() ) != -1 ){
                                                const ProjectMember = new ProjectMembersRecord({
                                                    username: Manager.username.value(),
                                                    project_id: Project.project_id.value(),
                                                    permission: Controller.permission.mgr
                                                })
                                                await ProjectMember.save();


                                                const { version } = req.body;
                                                if( version ){
                                                    const { version_name, version_description } = version;
                                                    const Version = new VersionsRecord({ project_id: Project.project_id.value(), version_name, version_description, create_by: decodedToken.username, create_at: new Date() })
                                                    await Version.save();
                                                }else{
                                                    await this.#__versions.makeDefaultVersion({ project_id: Project.project_id.value(), create_by: decodedToken.username })
                                                }


                                                                                  
                                                context.content = "Tạo project & thêm người quản lý dự án thành công!"
                                                context.data = await Project.get();
                                                context.status = "0x4501055"
                                                context.success = true;

                                                await this.saveLog( "info", req.ip, "__createproject", `__projectname ${ Project.project_name.value() } |__manager ${ Manager.fullname.value() }`, decodedToken.username )
                                            }else{
                                                context.content = `${ Manager.fullname.value() } không có quyền làm quản lý dự án`
                                                context.status = "0x4501056"
                                            }
                                        }else{
                                            context.content = "Người quản lý dự án này không tồn tại hoặc đã bị xóa"
                                            context.status = "0x4501057"
                                        }
                                    }else{

                                        const { version } = req.body;
                                        if( version ){
                                            const { version_name, version_description } = version;
                                            const Version = new VersionsRecord({  project_id: Project.project_id.value(), version_name, version_description, create_by: decodedToken.username, create_at: new Date() })
                                            await Version.save();
                                        }else{
                                            await this.#__versions.makeDefaultVersion({ project_id: Project.project_id.value(), create_by: decodedToken.username })
                                        }  
                                        
                                        context.content = "Tạo project thành công!"
                                        context.data = await Project.get();
                                        context.status = "0x4501054"
                                        context.success = true;
                                        await this.saveLog( "info", req.ip,"__createproject", `__projectname ${ Project.project_name.value() }`, decodedToken.username )
                                    }
                                }else{
                                    context.content =  "Account bạn sử dụng để tạo dự án đã bị xoá!"
                                    context.status = "0x4501058"
                                }
                            }else{
                                context.content = "Request body khum hợp lệ"
                                context.status = "0x4501059"
                                await this.saveLog( "error", req.ip,"__createproject", `__badrequest`, decodedToken.username )
                            }
                    }else{
                        context.content = "Request body khum hợp lệ"
                        context.status = "0x4501059"
                        await this.saveLog( "error", req.ip,"__createproject", `__badrequest`, decodedToken.username )
                    }
                }else{
                    context.content = "Request body khum hợp lệ"
                    context.status = "0x4501059"
                    await this.saveLog( "error", req.ip,"__createproject", `__badrequest`, decodedToken.username )        
                }
            }else{
                context.content = "Bạn khum có quyền truy cập API này!"
                context.status = "0x4501060"
                await this.saveLog( "error", req.ip, "__createproject", `__noright`, decodedToken.username )
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501061"
        }        
        res.status(200).send(context)
    }


    addMember = async (req, res, privileges = ["uad", "ad", "pm"] ) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *      project_id <Int>,
         *      usernames: <{
         *          username: <String>
         *          role: <String>    
         *      }>[],               
         * }
         * 
         * 
         */


        const verified = await this.verifyToken(req)
        const validPrivileges = [Controller.permission.spv, Controller.permission.dpr ]
        this.writeReq(req)
        const outerPrivileges = ["uad", "ad", "pm"]
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }
        if( verified ){            
            const { project_id, usernames } = req.body;            
            if( project_id != undefined && usernames != undefined && usernames.length > 0 ){
                const decodedToken = this.decodeToken( req.header("Authorization") );
                const { username } = decodedToken;
                const currentAccount = await this.#__accounts.find({ username });
                if( currentAccount ){
                    const isProjectIDValid = intValidate( project_id );
                    if( isProjectIDValid ){        
                        
                        const project = await this.#__projects.find({ project_id: parseInt(project_id) });
                        if( project ){
                            const member = await this.#__projectMembers.find({ project_id: parseInt(project_id), username });
                            
                            if( (member && [Controller.permission.mgr, Controller.permission.spv].indexOf(member.permission) != -1 ) || outerPrivileges.indexOf( decodedToken.role) != -1 ){
        
                                const failAccounts = []
                                for( let i = 0 ; i < usernames.length; i++ ){
                                    const { username, role } = usernames[i];
                                    const account = await this.#__accounts.find({ username });
                                    if( account ){
                                        const isAMemeber = await this.#__projectMembers.find({ project_id: parseInt(project_id), username })
                                        if( !isAMemeber ){
                                            if( validPrivileges.indexOf( role ) != -1 ){
                                                const Member = new ProjectMembersRecord({ 
                                                    project_id: parseInt(project_id), 
                                                    username,
                                                    permission: role
                                                })
                                                await Member.save()
                                                await this.saveLog( "info", req.ip,"__addmembertoproject", `__username ${ Member.username.value() }`, decodedToken.username )
                                            }else{
                                                failAccounts.push( { username, reason: "Người dùng này khum thuộc nhóm quyền khả dụng"} )    
                                            }
                                        }else{
                                            failAccounts.push( { username, reason: "Người dùng này đã tồn tại trong dự án" } )    
                                        }
                                    }else{
                                        failAccounts.push( { username, reason: "Người dùng này không tồn tại hoặc đã bị xóa"} )
                                    }
                                }
                                if( failAccounts.length > 0 ){
                                    if( failAccounts.length == usernames.length ){
                                        context.success = false;
                                        context.content = "Khum có người dùng nào được thêm vào dự án vì toàn bộ đều đã bị xóa hoặc khum khả dụng!"; /* passed */
                                        context.status = "0x4501064"
                                    }else{
                                        context.success = true
                                        context.content = "Một vài người dùng không được thêm vào vì họ đã bị xóa hoặc khum khả dụng!" /* passed */
                                        context.status = "0x4501063"
                                    }
                                    context.data = {
                                        failAccounts
                                    }
                                }else{
                                    context.success = true
                                    context.content = "Thêm thành công!" /* passed */
                                    context.status = "0x4501062"
                                }
                            }else{
                                context.content = "Bạn khum có quyền thực hiện thao tác này!" /* passed */
                                context.status = "0x4501065"
                                await this.saveLog( "error", req.ip, "__addmembertoproject", `__noright`, decodedToken.username )
                            }
                        }else{
                            context.content = "Dự án khum tồn tại!" /* passed */
                            context.status = "0x4501066"
                        }
                    
                    }else{
                        context.content = "Project_id phải là một số nguyên" /* passed */
                        context.status = "0x4501067"
                    }             
                }else{
                    context.content = "Account của bạn đã bị xóa hoặc không tồn tại!" /* passed */
                    context.status = "0x4501068"
                }
            }else{
                context.content = "Request body khum hợp lệ" /* passed */
                context.status = "0x4501069"
            }
        }else{
            context.content = "Token khum hợp lệ" /* passed */
            context.status = "0x4501070"
        }        
        res.status(200).send(context)
    }


    update = async (req, res, privileges = ["ad", "pm"]) => {

        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *      project: {
         *          project_id <Int>
         *          project_name <String>
                    project_code <String>
                    project_status <Int>
                    project_description <String>
         *      }
         * }
         * 
         * 
         */

        const verified = await this.verifyToken(req)
        this.writeReq(req)

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken =  this.decodeToken( req.header("Authorization") );
            
            if( privileges.indexOf( decodedToken.role ) != -1 || this.isAdmin(decodedToken) ){
                const { project } = req.body;
                if( project ){
                    const { username } = decodedToken;
                    const account = await this.#__accounts.find({ username })
                    if( account || username === this.#__defaultAccount.username ){
                        const nullCheck = this.notNullCheck(project, ["project_id"])
                        if( nullCheck.valid ){
                            const { project_id } = project;
                            const validatedProjectId = intValidate(project_id);
                            if( validatedProjectId ){
                                const parsedIntProjectId = parseInt( project_id)
                                const oldProject = await this.#__projects.find({ project_id: parsedIntProjectId });
                                if( oldProject ){                                
                                    const Project = new ProjectsRecord( oldProject );
                                    const { project_name, project_code, project_description, project_status } = project;
                                    Project.project_name.value( project_name )
                                    Project.project_code.value( project_code )
                                    Project.project_description.value( project_description )
                                    Project.project_status.value( project_status );
                                    await Project.save()

                                    await this.saveLog("info", req.ip, 
                                    "__updateproject", `
| __projectname ${ oldProject.project_name } => ${ Project.project_name.value() } 
| __projectcode ${ oldProject.project_code } => ${ Project.project_code.value() } 
| __projectdescription ${ oldProject.project_description } => ${ Project.project_description.value() } 
| __projectstatus ${ oldProject.project_status } => ${ Project.project_status.value() }`.replaceAll("\n", " "), decodedToken.username)

                                    context.data = await Project.get();
                                    context.success = true;
                                    context.content = "Cập nhật thành công!"
                                    
                                    context.status = "0x4501071"
                                }else{
                                    context.content = `Dự án không tồn tại!` /* passed */
                                    context.status = "0x4501072"    
                                }
                            }else{
                                context.content = "project_id phải là một số nguyên" /* passed */
                                context.status = "0x4501073"   
                            }
                        }else{
                            context.content = "Request body khum hợp lệ" /* passed */
                            context.status = "0x4501074"
                        }
                    }else{
                        context.content = "Account của bạn đã bị xóa hoặc không tồn tại!" /* passed */
                        context.status = "0x4501075"
                    }
                }else{
                    context.content = "Request body khum hợp lệ" /* passed */
                    context.status = "0x4501076"
                }
            }else{
                context.content = "Bạn khum có quyền truy cập API này!" /* passed */
                context.status = "0x4501078"
                await this.saveLog( "error", req.ip, "__updateproject", `__noright`, decodedToken.username )
            }
        }else{            
            context.content = "Token khum hợp lệ" /* passed */
            context.status = "0x4501077"
        }
        res.status(200).send(context)
    }

    delete = async (req, res, privileges=["uad", "ad"]) => {

        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *      project: {
         *          project_id <Int>
                    
         *      }
         * }
         * 
         * 
         */

        const verified = await this.verifyToken(req)
        this.writeReq(req)

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken =  this.decodeToken( req.header("Authorization") );
            if( privileges.indexOf(decodedToken.role) != -1 || this.isAdmin(decodedToken)  ){
                const { username } = decodedToken;
                const account = await this.#__accounts.find({ username })
                if( account || username === this.#__defaultAccount.username ){
                    const { project } = req.body;
                    if( project && project.project_id){
                        const { project_id } = project;
                        const isProjectIDValid = intValidate( project_id );
                        if( isProjectIDValid ){
                            const oldProject = await this.#__projects.find({ project_id: parseInt( project_id ) })
                            if( oldProject ){
                                const Project = new ProjectsRecord( oldProject )
                                await Project.destroy()
                                
                                context.content = "Xóa dự án thành công" /* passed */
                                context.status = "0x4501079"
                                
                                await this.saveLog( "warn", req.ip, "__purgeproject", `__projectname ${ oldProject.project_name }`, decodedToken.username )
                                
                                // remove versions
                                await this.#__projectMembers.removeMembers( oldProject.project_id )
                            }else{
                                context.content = "Project khum tồn tại" /* passed */
                                context.status = "0x4501080"                             
                            }
                            context.success = true;
                        }else{
                            context.content = "project_id phải là một số nguyên" /* passed */
                            context.status = "0x4501081"
                        }
                    }else{
                        context.content = "Request body khum hợp lệ" /* passed */
                        context.status = "0x4501082"
                    }
                }else{
                    context.content = "Account của bạn đã bị xóa hoặc không tồn tại!" /* passed */
                    context.status = "0x4501083"
                }
            }else{
                context.content = "Bạn khum có quyền truy cập API này!" /* passed */
                context.status = "0x4501084"
                await this.saveLog( "error", req.ip, "__purgeproject", `__noright`, decodedToken.username )
            }
        }else{
            context.content = "Token khum hợp lệ" /* passed */
            context.status = "0x4501085"
        }
        res.status(200).send(context)
    }

    changeProjectManager = async ( req, res, privileges=["ad", "pm"] ) => {

        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *     project_id <Int>
               username   <String>
         *      
         * }
         * 
         * 
         */

        const verified = await this.verifyToken(req)
        this.writeReq(req)

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken = this.decodeToken(req.header("Authorization"))
            const { username, role } = decodedToken;

            if( privileges.indexOf( role ) != -1 || this.isAdmin(decodedToken) ){
                const account = await this.#__accounts.find({ username });
                if( account ){
                    const { project_id, username } = req.body;
                    if( project_id != undefined && username != undefined ){
                        const isProjectIDValid = intValidate( project_id );
                        if( isProjectIDValid ){
                            const project = await this.#__projects.find({ project_id: parseInt( project_id ) })
                            if( project ){
                                const user = await this.#__accounts.find({ username });
                                if( user ){
                                    const member = await this.#__projectMembers.find({ project_id: project.project_id, permission: Controller.permission.mgr })                                    
                                    if( member ){
                                        const OldManager = new ProjectMembersRecord( member )
                                        await OldManager.destroy()
                                        await this.saveLog(
                                            "warn", req.ip,
                                             "__removeprojectmanager", 
                                            `__projectname ${ project.project_name } | __username ${ OldManager.username.value() } `, 
                                            decodedToken.username
                                        )
                                    } 
                                    const oldmem = await this.#__projectMembers.find({ project_id: project.project_id, username: user.username })                                   
                                    if( oldmem ){
                                        const OldMem = new ProjectMembersRecord(oldmem);
                                        await OldMem.destroy()
                                    }
                                    const Manager = new ProjectMembersRecord({ project_id: project.project_id, username: user.username, permission: Controller.permission.mgr })                                    
                                    await Manager.save();
                                    context.content = "Cập nhật thành công" /* passed */
                                    context.status = "0x4501086"
                                    context.success = true;

                                    await this.saveLog("info", req.ip,
                                    "__addmanagertoproject", 
                                    `__projectname ${ project.project_name } | __username ${ Manager.username.value() }`, 
                                    decodedToken.username)
                                }else{
                                    context.content = "Người dùng không tồn tại" /* passed */
                                    context.status = "0x4501087"
                                }
                            }else{  
                                context.content = "Project khum tồn tại" /* passed */
                                context.status = "0x4501088"
                            }
                        }else{
                            context.content = "project_id phải là một số nguyên" /* passed */
                            context.status = "0x4501089"
                        }
                    }else{
                        context.content = "Request body khum hợp lệ" /* passed */
                        context.status = "0x4501090"
                    }
                }else{
                    context.content = "Account của bạn đã bị xóa hoặc không tồn tại!" /* passed */
                    context.status = "0x4501091"
                }
            }else{
                context.content = "Bạn khum có quyền truy cập API này!" /* passed */
                context.status = "0x4501092"
                await this.saveLog( "error", req.ip, "__addmanagertoproject", `__noright`, decodedToken.username )
            }
        }else{
            context.content = "Token khum hợp lệ" /* passed */
            context.status = "0x4501093"
        }
        res.status(200).send(context)
    }

    changeProjectMemberPrivilege = async ( req, res, privileges = ["ad", "pm", "ps"] ) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *     project_id <Int>
               username   <String>
               permission <Enum>["pm", "pd", "ps"]

         *      
         * }
         * 
         */
        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const thisAccount = await this.#__accounts.find({ username })
            
            if( thisAccount ){
                const { project_id, username, permission } = req.body;
                const checkNULL = this.notNullCheck( req.body, ["project_id", "username", "permission"] );
                if( checkNULL.valid ){
                    if( thisAccount.username != username ){
                        const isProjectIDValid = intValidate( project_id );
                        if( isProjectIDValid ){
                            const parsedId = parseInt( project_id );                    
                            const project = await this.#__projects.find({ project_id: parsedId });
                            if( project ){
                                const pjmem = await this.#__projectMembers.find({ project_id: parsedId, username: thisAccount.username })
                                if( pjmem || this.isAdmin(decodedToken) ){
                                    if( privileges.indexOf( pjmem.permission ) != -1  || this.isAdmin(decodedToken)  ){
                                        const targetAccount = await this.#__accounts.find({ username });
                                        if( targetAccount ){
                                            const targetPjMem = await this.#__projectMembers.find({ project_id: parsedId, username: targetAccount.username })
                                            if( targetPjMem ){
                                                const projectPri = this.checkPrivilege( pjmem.permission, targetPjMem.permission );                                                                                                
                                                if( projectPri ){
                                                    const newPriCheck =  this.checkPrivilege( pjmem.permission, permission );                                       
                                                    
                                                    if( newPriCheck ){                                               
                                                        const ProjectMember = new ProjectMembersRecord( targetPjMem );                                            
                                                        ProjectMember.permission.value( permission );
                                                        await ProjectMember.save()
                                                        
                                                        context.success = true;
                                                        context.content = "Thay đổi thành công"
                                                        context.status = "0x4501094"
                                                        await this.saveLog("warn", req.ip, "__modifypermission", 
                                                        `__projectname ${ project.project_name } | __username ${ ProjectMember.username.value() } | __permission __${ targetPjMem.permission } => __${ ProjectMember.permission.value() } `, 
                                                        decodedToken.username)
                                                    }else{
                                                        context.content = "Quyền mới phải nhỏ hơn quyền của ng thực hiện"
                                                        context.status = "0x4501095"
                                                    }
                                                }else{
                                                    context.content = "Khum thể thay đổi quyền của ng có quyền lớn hơn mình"
                                                    context.status = "0x4501096"
                                                }
                                            }else{
                                                context.content = "Account chỉ định khum thuộc dự án"
                                                context.status = "0x4501097"
                                            }
                                        }else{
                                            context.content = "Account chỉ định khum tồn tại hoặc bị xóa"
                                            context.status = "0x4501098"
                                        }
                                    }else{
                                        context.content = "Khum có quyền thực hiện thao tác"
                                        context.status = "0x4501099"
                                        await this.saveLog( "error", req.ip, "__modifypermission", `__noright`, decodedToken.username )
                                    }
                                }else{
                                    context.content = "Bạn khum tồn tại trong dự án"
                                    context.status = "0x4501100"
                                }
                            }else{
                                context.content = "Dự án khum tồn tại"
                                context.status = "0x4501101"
                            }
                        }else{
                            context.content = "Mã dự án phải là một số nguyên"
                            context.status = "0x4501102"
                        } 
                    }else{
                        context.content = "Bạn khum thể thay đổi quyền của chính mình"
                        context.status = "0x4501103"
                        await this.saveLog( "error", req.ip, "__addmanagertoproject", `__selfmodifypermission`, decodedToken.username )
                    }
                }else{
                    context.content = "Request body khum hợp lệ"
                    context.status = "0x4501104"
                }
            }else{
                context.content = "Account khum tồn tại hoặc bị xóa"
                context.status = "0x4501105"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501106"
        }
        res.status(200).send(context);
    }

    removeMemberFromProject = async (req, res, privileges = ["uad", "ad", "pm"]) => {
        /* SCOPE: PROJECT */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Body {
         *     project_id <Int>
               username   <String>
         *      
         * }
         * 
         */
        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }
        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") );
            const { username } = decodedToken;
            const thisAccount = await this.#__accounts.find({ username })
            if( thisAccount ){
                const { project_id, username } = req.body;
                const nullCheck = this.notNullCheck( req.body, ["project_id", "username"] );
                if( nullCheck.valid ){
                    const isProjectIDValid = intValidate( project_id );
                    if( isProjectIDValid ){
                        const parsedId = parseInt( project_id )

                        const project = await this.#__projects.find({ project_id: parsedId });
                        if( project ){

                            const pjmem = await this.#__projectMembers.find({ project_id: parsedId, username: thisAccount.username })                        
                            if( pjmem || this.isAdmin(decodedToken) ){
                                if( privileges.indexOf(pjmem.permission) != -1 || this.isAdmin(decodedToken)  ){
                                    const targetAccount = await this.#__accounts.find({ username });
                                    const targetPjMem = await this.#__projectMembers.find({ project_id: parsedId, username })
    
                                    if( targetAccount ){
                                        if( targetPjMem ){
                                            if( this.checkPrivilege( pjmem.permission, targetPjMem.permission ) ){
                                                const ExistedMem = new ProjectMembersRecord( targetPjMem )
                                                await ExistedMem.destroy();
                                                context.content = "Xóa thành công"
                                                context.status = "0x4501107"
                                                context.success = true;

                                                await this.saveLog("info", req.ip,
                                                "__removeprojectmember", 
                                                `__projectname ${ project.project_name } | __username ${ targetPjMem.username }`, 
                                                decodedToken.username)
                                            }else{
                                                context.content = "Bạn khum thể xóa người dùng có quyền hạn cao hơn mình khỏi dự án"
                                                context.status = "0x4501108"
                                            }
                                        }
                                    }else{
                                        if( targetPjMem ){
                                            const NonExistedMem = new ProjectMembersRecord( targetPjMem );
                                            await NonExistedMem.destroy()
                                        }
                                        context.content = "Xóa thành công"
                                        context.status = "0x4501107"
                                        context.success = true;
                                    }
                                }else{
                                    context.content = "Bạn khum có quyền thực hiện thao tác này"
                                    context.status = "0x4501109"
                                    await this.saveLog( "error", req.ip, "__removeprojectmember", `__noright`, decodedToken.username )
                                }
                            }else{
                                context.content = "Bạn khum thuộc dự án này"
                                context.status = "0x4501110"
                                await this.saveLog( "error", req.ip, "__removeprojectmember", `__noright`, decodedToken.username )
                            }
                        }else{
                            context.content = "Dự án khum tồn tại"
                            context.status = "0x4501101"
                        }
                    }else{
                        context.content = "Project id phải là một số nguyên"
                        context.status = "0x4501111"
                    }
                }else{
                    context.content = "Request body khum hợp lệ"
                    context.status = "0x4501112"    
                }
            }else{
                context.content = "Account khum tồn tại hoặc bị xóa"
                context.status = "0x4501113"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501114"
        }
        res.status(200).send(context);
    }


}
module.exports = ProjectsController

    