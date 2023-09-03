const jwt = require('jsonwebtoken');
require('dotenv').config()
const events = require('./LogEvents');

const { EventLogsRecord } = require('../../models/EventLogs');
const { response } = require('./ResponseCode');
const { Projects, ProjectsRecord } = require('../../models/Projects');
const { ProjectMembers } = require('../../models/ProjectMembers');
const { intValidate } = require('../../functions/validator');
const { Versions, VersionsRecord } = require('../../models/Versions');

const permission = require('./permission')

class Controller {    

    static permission = permission;

    #__code = undefined;
    #__projects = new Projects()
    #__projectMembers = new ProjectMembers()
    #__versions = new Versions()
    constructor(){
        this.tokenKey = process.env.TOKEN_KEY;
        this.events = events;
        this.#__code = response;   
        this.__taskStatus = [ 1, 2, 3, 4, 5 ]   
    }

    #__privileges = {
        uad: 1,
        ad:  0,
        pm: -1,
        pd: -2,
        ps: -3,
        manager: -4,
        supervisor: -5,
        deployer: -6,
    }  
    
    

    getCode = (code) => {
        const responseCode = this.#__code[ code ];
        return responseCode ? responseCode : "Unknown problem";
    }

    checkPrivilege = ( current, target ) => {
        if( this.#__privileges[current] != undefined && this.#__privileges[target] != undefined ){
            return this.#__privileges[current] >= this.#__privileges[target];
        }
        return false
    }

    notNullCheck = ( data, fields) => { // new
        let valid = true;
        const nullFields = []
        for( let i = 0; i < fields.length; i++ ){
            const field = fields[i];
            if( data[field] == undefined ){
                valid = false;
                nullFields.push(field)
                this.errorLog(`${ field } NULL`)
            }
        }
        return { valid, nullFields };
    }

    makeToken = ( data ) => { // new
        const token = jwt.sign(data, this.tokenKey, { expiresIn: '12h' });
        return token;
    }

    decodeToken = (token) => { // new
        const result = jwt.decode(token);
        return result;
    }

    isAdmin = ( user ) => {
        if( user.role == permission.ad ){
            return true;
        }
        return false
    }

    verifyToken = async (req) => {
        const token = req.header('Authorization');
        if( !token ){
            return false;
        }else{
            const result = await new Promise( (resolve, reject) => {
                jwt.verify(token, this.tokenKey, ( err, decoded ) => {
                    resolve({ err, decoded })
                })
            })
            if( result.err ){
                return false;
            }
            return true
        }
    }

    saveLog = async ( logtype, ip, title, description, createBy, create_at = undefined ) => {        
        const log = new EventLogsRecord({
            id: undefined,
            event_type: logtype,
            event_title: title,
            event_description: description,            
            create_user: createBy,
            create_at: create_at ? create_at : new Date(),
            user_ip: ip
        })
        await log.save()
    }

    getProject = async ( rawProjectId ) => {
        if( intValidate(rawProjectId) ){
            const project_id = parseInt( rawProjectId )
            const project =  await this.#__projects.find({ project_id })
            if( project ){
                const Project = new ProjectsRecord( project )
                return Project;
            }else{
                return false
            }
        }else{
            return false
        }
    }

    getProjectPrivilege = async (project_id, username) => {
        const member = await this.#__projectMembers.find({ project_id, username });
        if( member ){
            return member.permission;
        }else{
            return false
        }
    }

    getVersion = async (raw_version_id) => {
        if( intValidate( raw_version_id ) ){
            const version_id = parseInt( raw_version_id )
            const version = await this.#__versions.find({ version_id })
            if( version ){
                const Version = new VersionsRecord( version )
                return Version;
            }else{
                return false
            }
        }else{
            return false
        }
    }


    writeReq = (request) => {
        const { originalUrl, method } = request
        console.log(`REQ: ${ method } - ${  originalUrl }`)
    }

    writeRes = (response) => {
        const { status, message } = response;
        console.log(`RES: ${ status } - ${ message }`)
    } 

    successLog = (msg, prefix="" ) => {
        console.log(`${prefix}PASSED:   ${msg}`)
    }
    
    errorLog = (msg, prefix="" ) => {
        console.log(`${prefix}ERROR!:   ${ msg }`)
    }
    
    warningLog = (msg, prefix="" ) => {
        console.log(`${prefix}WARNNING: ${ msg }`)
    }
    
    infoLog = (msg, prefix="" ) => {
        console.log(`${prefix}INFOR:    ${ msg }`)
    }
    
}

module.exports = Controller
