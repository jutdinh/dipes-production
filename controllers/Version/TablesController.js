
const { Controller } = require('../../config/controllers');
const { Projects, ProjectsRecord } = require('../../models/Projects');
const { ProjectMembers } = require('../../models/ProjectMembers');
const { Tables, TablesRecord } = require('../../models/Tables');
const { Versions, VersionsRecord } = require('../../models/Versions');
const { intValidate, objectComparator } = require('../../functions/validator');
const { Fields, FieldsRecord } = require('../../models/Fields');

class TablesController extends Controller {
    #__tables = new Tables();
    #__versions = new Versions();
    #__projects = new Projects()
    #__projectMembers = new ProjectMembers()
    #__fields = new Fields();

    constructor(){
        super();
    }
}
module.exports = TablesController

    