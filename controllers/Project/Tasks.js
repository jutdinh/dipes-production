
const { Controller } = require('../../config/controllers');
const { intValidate, boolValidate } = require('../../functions/validator');

const { ProjectMembers, ProjectMembersRecord } = require('../../models/ProjectMembers');
const { Projects, ProjectsRecord } = require('../../models/Projects');
const { TaskModify, TaskModifyRecord } = require('../../models/TaskModify');
const { Accounts, AccountsRecord } = require('../../models/Accounts');
const { Tasks, TasksRecord } = require('../../models/Tasks');


class TasksController extends Controller {
    
    #__projects = undefined;    
    #__accounts = undefined;
    #__defaultAccount = undefined;
    #__projectMembers = undefined;
    #__tasks = undefined;
    #__taskModify = undefined;
    constructor(){
        super();
        this.#__projects = new Projects()
        this.#__accounts = new Accounts()
        this.#__defaultAccount = Accounts.__defaultAccount;
        this.#__projectMembers = new ProjectMembers()
        this.#__tasks = new Tasks()
        this.#__taskModify = new TaskModify()
    }

    getTask = async ( rawTaskId, project_id ) => {
        if( intValidate( rawTaskId ) ){
            const task_id = parseInt( rawTaskId )
            const task = await this.#__tasks.find({ task_id, project_id })
            if( task ){
                const Task = new TasksRecord( task );
                return Task;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    getTaskModified = async ( task_id ) => {
        const modifies = await this.#__taskModify.findAll({ task_id })
        const result = [];
        for( let i = 0; i < modifies.length; i++ ){
            const Modify = new TaskModifyRecord( modifies[i] )
            const info = await Modify.get()
            result.push( info )
        }
        return result;
    }

    getAll = async ( req, res ) => {

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
        const verified = await this.verifyToken( req );
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }        
        if( verified ){
            const { project_id } = req.params;
            const decodedToken = this.decodeToken( req.header("Authorization") )
            
            const Project = await this.getProject( project_id );            
            
            if( Project ){

                const member = await this.getProjectPrivilege( Project.project_id.value(), decodedToken.username )
                if( member || this.isAdmin(decodedToken) ){
                    const tasks = await this.#__tasks.getAllTasks( Project.project_id.value() )
                    for( let i = 0 ; i < tasks.length; i++  ){
                        tasks[i].history = await this.getTaskModified( tasks[i].task_id )
                    }
                    context.success = true;
                    context.content = "Gọi dữ liệu thành công!"
                    context.data = tasks
                    context.status = "0x4501115"
                }else{
                    context.content = "Bạn khum thuộc dự án này"
                    context.status = "0x4501116"  
                }
            }else{
                context.content = "Dự án khum tồn tại hoặc đã bị xóa"
                context.status = "0x4501117"
            }
        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = "0x4501118"
        }
        res.status(200).send(context)
    }

    createTask = async (req, res, privileges = ["ad", "pm"]) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }
         * Request Params {
         *      project_id <Int>
         * } 
         * Request Body {
                task_name        <String>
                task_description <String>
                task_status      <Int>
                task_priority    <Int>
                members          <String>[username, ...]
         * } 
         */

        const verified = await this.verifyToken( req );
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }  
        if( verified ){
            const { project_id } = req.params;
            const decodedToken = this.decodeToken( req.header("Authorization") )
            
            const Project = await this.getProject( project_id );
            if( Project ){
                const member = await this.getProjectPrivilege( Project.project_id.value(), decodedToken.username )
                if( member && privileges.indexOf(member) != -1 || this.isAdmin(decodedToken) ){

                    const { task } = req.body;
                    if( task && this.notNullCheck(task, [
                        "task_name",
                        "task_description",
                        "task_status",
                        "task_priority",
                        "members"]) ){
                        const { members, task_status, task_priority } = task;

                        const numberPropsAreAllValid = intValidate( task_priority ) && intValidate( task_status );
                        if( numberPropsAreAllValid ){
                            const failAccounts = []
                            const validAccounts = [];
                            for( let i = 0; i < members.length; i++ ){
                                const username = members[i];
                                const account = await this.#__accounts.find({ username });
                                const ismember = await this.#__projectMembers.find({ username, project_id: Project.project_id.value() });
                                if( account && ismember ){
                                    validAccounts.push( username );
                                }else{
                                    failAccounts.push( username );
                                }
                            }
    
                            const Task = new TasksRecord({ ...task, 
                                project_id: Project.project_id.value(), 
                                members: validAccounts,
                                create_by: decodedToken.username,
                                create_at: new Date()
                            })
                            await Task.save();
                            await this.saveLog("info", req.ip, "__createtask", `__taskname: ${ Task.task_name.value() } | __taskdescription: ${ Task.task_description.value().slice(0, 50) }${ Task.task_description.value().length > 50 && "..." } | __taskpriority ${ Task.task_priority.value() } | __taskmembers: ${ Task.members.value().join(", ") }`, decodedToken.username)

                            if( failAccounts.length > 0 ){
                                if( failAccounts.length == members.length ){
                                    context.content = "Tạo yêu cầu thành công nhưng không có thành viên nào được thêm vào nhóm thực hiện"    
                                    context.status = "0x4501120"
                                }else{
                                    context.content = "Tạo yêu cầu thành công nhưng một vài người không được thêm vào nhóm thực hiện vì họ không có quyền truy cập"    
                                    context.status = "0x4501121"
                                }
                            }else{
                                context.content = "Tạo yêu cầu thành công"
                                context.status = "0x4501119"
                            }
                            context.success = true;                            
                        }else{
                            context.content = "Request body khum hợp lệ"
                            context.status = "0x4501122"
                        }
                    }else{
                        context.content = "Request body khum hợp lệ"
                        context.status = "0x4501122"  
                    }
                }else{
                    context.content = "Bạn khum thuộc dự án này hoặc không có quyền"
                    context.status = "0x4501123"
                }
            }else{
                context.content = "Dự án khum tồn tại hoặc đã bị xóa"
                context.status = "0x4501124"   
            }
        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = "0x4501125"
        }
        res.status(200).send(context)
    }

    updateState = async (req, res) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }         
         * Request Body {
                task_status <Int>
                project_id <Int>
                task_id <Int>
         * } 
         */

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        } 
        if( verified ){
            const decodedToken = this.decodeToken(req.header("Authorization"));
            const isBodyValid = this.notNullCheck(req.body, ["project_id", "task_id", "task_status"]);
            if( isBodyValid.valid ){
                const { project_id, task_id, task_status } = req.body;
                const Project = await this.getProject( project_id )
                if( Project ){
                    const member = await this.getProjectPrivilege(Project.project_id.value(), decodedToken.username);
                    if( member || this.isAdmin(decodedToken) ){
                        const Task = await this.getTask( task_id, Project.project_id.value() )
                        if( Task ){

                            const isTaskMember = Task.members.find( decodedToken.username );
                            if( isTaskMember || this.isAdmin(decodedToken) ){
                                const statusIsValid = intValidate( task_status );
                                if( statusIsValid ){
                                    const parsedStatus = parseInt( task_status );
                                    if( Tasks.validStatus.indexOf(parsedStatus) != -1 ){
                                        const oldStatus = Task.task_status.value()
                                        Task.task_status.value( parsedStatus );
                                        await Task.save();
                                        context.content = "Thành công"
                                        context.status = "0x4501126"
                                        context.success = true;
                                        // console.log({ task_id: Task.task_id.value(), modified_by: decodedToken.username, modified_what: "task_status", modified_at: new Date(), old_value: oldStatus, new_value: Task.task_status.value() })
                                        const Modify = new TaskModifyRecord({ 
                                            task_id: Task.task_id.value(), 
                                            modified_by: decodedToken.username, 
                                            modified_what: "status", 
                                            modified_at: new Date(), 
                                            old_value: oldStatus, new_value: Task.task_status.value() })
                                        await Modify.save();
                                        context.data = {
                                            modify: await Modify.get()
                                        }
                                        await this.saveLog("info", req.ip, "__modifytaskstatus", `__taskname ${ Task.task_name.value() } | __taskstatus ${ oldStatus } => ${ Task.task_status.value() }`, decodedToken.username )
                                    }else{
                                        context.content = "Status khum hợp lệ"
                                        context.status = "0x4501127"     
                                    }
                                }else{
                                    context.content = "Body khum hợp lệ"
                                    context.status = "0x4501128"      
                                }
                            }else{
                                context.content = "Không có quyền thay đổi vì bạn không thuộc nhóm thực hiện yêu cầu"
                                context.status = "0x4501204"
                            }
                        }else{
                            context.content = "Khum tìm thấy yêu cầu"
                            context.status = "0x4501129"
                        }
                    }else{
                        context.content = "Bạn khum thuộc dự án này"
                        context.status = "0x4501130"
                        await this.saveLog("error", req.ip, "__modifytaskstatus", `__noright`, decodedToken.username )
                    }
                }else{
                    context.content = "Khum tìm thấy dự án hoặc mã dự án khum hợp lệ"
                    context.status = "0x4501131"
                }            
            }else{
                context.content = "Body khum hợp lệ"
                context.status = "0x4501128"
            }
        }else{
            context.content = "Token khum hợp lệ "
            context.status = "0x4501132"
        } 
        res.status(200).send(context)                
    }

    updateInfo = async ( req, res, privileges = ["ad", "pm"] ) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }         
         * Request Body {                
                project_id <Int>
                task_id <Int>
                task_name <String>
                task_description <String>
                task_priority <String>

         * } 
         */

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        } 
        if( verified ){
            const decodedToken = this.decodeToken(req.header("Authorization"));
            const isBodyValid = this.notNullCheck(req.body, ["project_id", "task_id", "task_name", "task_description", "task_priority"]);
            if( isBodyValid.valid ){
                const { project_id, task_id, task_name, task_description, task_priority } = req.body;
                const Project = await this.getProject( project_id )
                if( Project ){
                    const member = await this.getProjectPrivilege(Project.project_id.value(), decodedToken.username);
                    if( member && privileges.indexOf(member) != -1 || this.isAdmin(decodedToken) ){
                        const Task = await this.getTask( task_id, Project.project_id.value() )
                        if( Task ){
                            const priorityIsValid = intValidate( task_priority );
                            if( priorityIsValid ){
                                const priority = parseInt( task_priority );
                                const oldTask = await Task.get();
                                Task.task_name.value( task_name )
                                Task.task_description.value( task_description )
                                Task.task_priority.value( priority );                                
                                await Task.save();
                                const newTask = await Task.get()

                                const Modify = new TaskModifyRecord({
                                    task_id: Task.task_id.value(),
                                    modified_by: decodedToken.username,
                                    modified_at: new Date(),
                                    modified_what: "infor",
                                    old_value: `Tiêu đề: ${ oldTask.task_name } | Độ ưu tiên: ${ oldTask.task_priority }| Mô tả: ${ oldTask.task_description }`,
                                    new_value: `Tiêu đề: ${ newTask.task_name } | Độ ưu tiên: ${ newTask.task_priority }| Mô tả: ${ newTask.task_description }`,
                                })
                                await Modify.save();
                                await this.saveLog("info", req.ip, "__modifytaskinfor", `__taskname ${ Task.task_name.value() } | __taskpriority: ${ oldTask.task_priority } => ${ newTask.task_priority } |  __taskname ${ oldTask.task_name } => ${ newTask.task_name } | __taskdescription: ${ oldTask.task_description } => ${ newTask.task_description }`, decodedToken.username )
                                
                                context.content = "Thành công"
                                context.status = "0x4501133"
                                context.success = true;
                                context.data = {
                                    modify: await Modify.get()
                                }
                            }else{
                                context.content = "Độ ưu tiên khum hợp lệ"
                                context.status = "0x4501134"   
                            }
                        }else{
                            context.content = "Khum tìm thấy yêu cầu"
                            context.status = "0x4501136"
                        }
                    }else{
                        context.content = "Bạn khum thuộc dự án này hoặc khum có quyền thay đổi"
                        context.status = "0x4501137"
                        await this.saveLog("error", req.ip, "__modifytaskinfor", `__noright`, decodedToken.username )
                    }
                }else{
                    context.content = "Khum tìm thấy dự án hoặc mã dự án khum hợp lệ"
                    context.status = "0x4501138"
                }            
            }else{
                context.content = "Body khum hợp lệ"
                context.status = "0x4501135"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501139"
        } 
        res.status(200).send(context)             
    }

    taskAddMembers = async (req, res, privileges = ["ad", "pm"]) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }         
         * Request Body {
                task_id <Int>
                project_id <Int>
                members <String>[] exp: [ su1, su2, ... ] 
         * } 
         */

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        } 
        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") )
            const isBodyValid = this.notNullCheck(req.body, ["project_id", "task_id", "members"]);
            if( isBodyValid.valid ){
                const { project_id, task_id, members } = req.body;
                const Project = await this.getProject( project_id )
                if( Project ){
                    const member = await this.getProjectPrivilege(Project.project_id.value(), decodedToken.username );
                    if( member && privileges.indexOf(member) != -1 || this.isAdmin(decodedToken)){
                        const Task = await this.getTask( task_id, Project.project_id.value() )
                        if( Task ){
                            const failAccounts = [];
                            const oldMembers = Task.members.value().join(", ")
                            
                            for( let i = 0 ; i < members.length; i++ ){
                                const member = members[i];
                                const account = await this.#__accounts.find({ username: member });
                                const isAMember = await this.getProjectPrivilege(Project.project_id.value(), member)
                                
                                if( account && isAMember && !Task.members.find(member) ){
                                    Task.members.append(member)
                                }else{
                                    failAccounts.push( member )
                                }
                            }
                            await Task.save();
                            if( failAccounts.length > 0 ){
                                if( failAccounts.length == members.length ){
                                    context.content = "Không một ai được thêm vào yêu cầu vì không có quyền hoặc không khả dụng"
                                    context.status = "0x4501142"
                                }else{
                                    context.content = "Thành công! Một vài thành viên không được thêm vào vì không có quyền hoặc không khả dụng"
                                    context.status = "0x4501141"
                                    context.success = true;  
                                    context.data = failAccounts
                                }
                            }else{
                                context.content = "Thành công! Tất cả thành viên đã được thêm vào yêu cầu"
                                context.status = "0x4501140"
                                context.success = true;                                
                            }  
                            if( failAccounts.length != members.length && members.length != 0 ){
                                await this.saveLog("info", req.ip,"__addtaskmembers", `__taskname ${ Task.task_name.value() } | __members: ${ oldMembers } => ${ Task.members.value().join(", ") }`, decodedToken.username)
                                const Modify = new TaskModifyRecord({
                                    task_id: Task.task_id.value(),
                                    modified_by: decodedToken.username,
                                    modified_at: new Date(),
                                    modified_what: "members",
                                    old_value: oldMembers,
                                    new_value: Task.members.value().join(", ")
                                })
                                await Modify.save();
                            }                          
                        }else{
                            context.content = "Khum tìm thấy yêu cầu"
                            context.status = "0x4501143"
                        }
                    }else{
                        context.content = "Bạn khum thuộc dự án này hoặc khum có quyền thay đổi"
                        context.status = "0x4501144"
                        await this.saveLog("error", req.ip, "__addtaskmembers", `__noright`, decodedToken.username )
                    }
                }else{
                    context.content = "Khum tìm thấy dự án"
                    context.status = "0x4501145"  
                }
            }else{
                context.content = "Body khum hợp lệ"
                context.status = "0x4501146"
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501147"
        } 
        res.status(200).send(context) 
    }

    taskRemoveMember = async (req, res, privileges = ["ad", "pm"]) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }         
         * Request Body {
                task_id <Int>
                project_id <Int>
                username
         * } 
         */

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        } 
        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") )
            const isBodyValid = this.notNullCheck(req.body, ["project_id", "task_id", "username"]);
            if( isBodyValid.valid ){
                const { project_id, task_id, username } = req.body;
                const Project = await this.getProject( project_id )
                if( Project ){
                    const member = await this.getProjectPrivilege(Project.project_id.value(), decodedToken.username );
                    if( member && privileges.indexOf(member) != -1 ){
                        const Task = await this.getTask( task_id, Project.project_id.value() )
                        if( Task ){                            
                            const targetIsAMember = await this.getProjectPrivilege( Project.project_id.value(), username )
                            if( targetIsAMember ){
                                context.content = "Xóa thành công"
                                context.status = "0x4501148"
                            }else{
                                context.content = "Người dùng này khum phải là thành viên của dự án"
                                context.status = "0x4501149"  
                            }
                            const members = Task.members.value()
                            const oldMembers = Task.members.value().join(", ")
                            const newMembers = members.filter( mem => mem != username )
                            Task.members.value( newMembers )
                            await Task.save()
                            const Modify = new TaskModifyRecord({
                                task_id: Task.task_id.value(),
                                modified_by: decodedToken.username,
                                modified_at: new Date(),
                                modified_what: "members",
                                old_value: oldMembers,
                                new_value: Task.members.value().join(", ")
                            })
                            await Modify.save()
                            await this.saveLog("info", req.ip,"__taskremovemember", `__taskname ${ Task.task_name.value() } | __username ${ username }`, decodedToken.username )
                            context.success = true;
                        }else{
                            context.content = "Khum tìm thấy yêu cầu"
                            context.status = "0x4501150" 
                        }
                    }else{
                        context.content = "Bạn khum thuộc dự án này hoặc khum có quyền thay đổi"
                        context.status = "0x4501151" 
                        await this.saveLog("error", req.ip, "__taskremovemember", `__noright`, decodedToken.username )
                    }
                }else{
                    context.content = "Khum tìm thấy dự án"
                    context.status = "0x4501152"   
                }
            }else{
                context.content = "Body khum hợp lệ"
                context.status = "0x4501153" 
            }
        }else{
            context.content = "Token khum hợp lệ"
            context.status = "0x4501154" 
        } 
        res.status(200).send(context) 
    }

    updateApproval = async (req, res) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }         
         * Request Body {
                task_id <Int>
                project_id <Int>
                task_approve <Bool>
         * } 
         */

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        } 
        if( verified ){
            const decodedToken = this.decodeToken(req.header("Authorization"));
            const isBodyValid = this.notNullCheck(req.body, ["project_id", "task_id", "task_approve"]);
            if( isBodyValid.valid ){
                const { project_id, task_id, task_approve } = req.body;
                const Project = await this.getProject( project_id )
                if( Project ){
                    const member = await this.getProjectPrivilege(Project.project_id.value(), decodedToken.username);
                    if( member ){
                        const Task = await this.getTask( task_id, Project.project_id.value() )
                        if( Task ){
                            const approveIsValid = boolValidate( task_approve );
                            if( approveIsValid ){                                
                                const old = Task.task_approve.value();
                                Task.task_approve.value( task_approve );
                                await Task.save()
                                const Modify = new TaskModifyRecord({
                                    task_id: Task.task_id.value(),
                                    modified_by: decodedToken.username,
                                    modified_at: new Date(),
                                    modified_what: "approve",
                                    old_value: old,
                                    new_value: Task.task_approve.value()
                                })
                                await Modify.save()
                                await this.saveLog("info", req.ip, "__taskapprove", `__taskname ${ Task.task_name.value() } | ${ old ? "__approved": "__unapproved" } => ${ Task.task_approve.value() ? "__approved": "__unapproved" }`, decodedToken.username)

                                context.success = true;
                                context.content = "Cập nhật thành công"
                                context.status = "0x4501155" 
                                context.data = {
                                    modify: await Modify.get()
                                }
                            }else{
                                context.content = "Approve khum hợp lệ"
                                context.status = "0x4501156"     
                            }
                        }else{
                            context.content = "Khum tìm thấy yêu cầu"
                            context.status = "0x4501157"     
                        }
                    }else{
                        context.content = "Bạn khum thuộc dự án này"
                        context.status = "0x4501158" 
                    }
                }else{
                    context.content = "Khum tìm thấy dự án hoặc mã dự án khum hợp lệ"
                    context.status = "0x4501159" 
                    await this.saveLog("error", req.ip, "__taskapprove", `__noright`, decodedToken.username )
                }            
            }else{
                context.content = "Body khum hợp lệ"
                context.status = "0x4501156" 
            }
        }else{
            context.content = "Token khum hợp lệ "
            context.status = "0x4501160" 
        } 
        res.status(200).send(context)                
    }


    removeTask = async ( req, res, privileges=["ad", "pm"] ) => {
        /* SCOPE: PROJECT  */
        /**
         * Request Headers {
         *      Authorization: <Token>    
         * }         
         * Request Body {
                task_id <Int>
                project_id <Int>
         * } 
         */
        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }
        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") )
            const isBodyValid = this.notNullCheck(req.body, ["project_id", "task_id"]);

            if( isBodyValid.valid ){
                const { project_id, task_id } = req.body;
                const Project = await this.getProject( project_id )
                if( Project ){
                    const member = await this.getProjectPrivilege(Project.project_id.value(), decodedToken.username);
                    if( member && privileges.indexOf(member) != -1 ){
                        const Task = await this.getTask( task_id, Project.project_id.value() )
                        if( Task ){
                            await Task.destroy();
                            await this.#__taskModify.destroyAll( Task.task_id.value() )
                        }
                        context.content = "Thành công"
                        context.status = "0x4501161" 
                        context.success = true;
                        await this.saveLog("info", req.ip, "__purgetask", `__taskname ${ Task.task_name.value() }`, decodedToken.username )
                    }else{
                        context.content = "Bạn khum có quyền thực hiện thao tác này"
                        context.status = "0x4501162" 
                        await this.saveLog("error", req.ip, "__purgetask", `__noright`, decodedToken.username )
                    }
                }else{
                    context.content = "Khum tìm thấy dự án"
                    context.status = "0x4501163"   
                }
            }else{
                context.content = "Body khum hợp lệ"
                context.status = "0x4501164" 
            }
        }else{
            context.content = "Token khum hợp lệ "
            context.status = "0x4501165" 
        } 
        res.status(200).send(context)
    }
}
module.exports = TasksController

    