const { Controller } = require('../config/controllers');
const { Apis, ApisRecord } = require('../models/Apis');
const { Fields } = require('../models/Fields');
const { Tables } = require('../models/Tables');
const Model = require('../config/models/model');
const { Projects } = require('../models/Projects');
const { intValidate, floatValidate, objectComparator } = require('../functions/validator');
const { removeDuplicate } = require('../functions/modulars');

const { Database } = require('../config/models/database');
const { translateUnicodeToBlanText, formatDecNum } = require('../functions/auto_value');

const fastcsv = require('fast-csv')
const XLSX = require('xlsx-js-style');

const Cache = require('./Cache/Cache');
const { Privileges } = require('../models/Privileges');
const { Statistics, StatisticsRecord } = require('../models/Statistics');

const RESULT_PER_SEARCH_PAGE = 15
const DEFAULT_ERROR_CALCLATED_VALUE = "NaN"
const TOTAL_DATA_PER_PARTITION = 10000

class ConsumeApi extends Controller {
    #__apis = new Apis();
    #__tables = new Tables();
    #__fields = new Fields();
    #__projects = new Projects()
    #__privileges = new Privileges()
    #__statistics = new Statistics()

    constructor() {
        super();
        this.url = ""
        this.req = undefined
        this.res = undefined
        this.API = undefined
    }

    consume = async (req, res, api_id) => {
        this.writeReq(req)
        const start = new Date()

        const { url, method } = req;
        this.url = decodeURI(url);
        const [api, projects, tables, fields] = await Promise.all([this.#__apis.find({ api_id }), this.#__projects.findAll(), this.#__tables.findAll(), this.#__fields.findAll()])
        if (api && api.api_method == method.toLowerCase() && api.status) {
            const Api = new ApisRecord(api)
            const project = projects[0]
            this.project = project;

            this.API = Api;
            this.req = req;
            this.res = res;
            this.fields = fields;
            this.tables = tables.map(table => {
                const { id } = table;
                table.fields = fields.filter(field => field.table_id == id)
                return table
            });

            if (project) {
                const { project_type } = project
                if (project_type == "database") {
                    switch (api.api_method) {
                        case "get":

                            await this.GET()

                            const end = new Date()
                            console.log("PROCCESS IN : " + `${end - start} `)
                            break;

                        case "post":
                            await this.POST()
                            break;
                        case "put":
                            await this.PUT()
                            break;
                        case "delete":
                            await this.DELETE()
                            break;
                        default:
                            this.res.status(200).send("Not found nè")
                            break;

                    }
                } else {
                    switch (api.api_method) {
                        case "get":
                            await this.REMOTE_GET()
                            break;

                        case "post":
                            await this.REMOTE_POST()
                            break;
                        case "put":
                            await this.REMOTE_PUT()
                            break;
                        case "delete":
                            await this.REMOTE_DELETE()
                            break;
                        default:
                            this.res.status(200).send("Not found nè")
                            break;

                    }
                }
            } else {
                res.status(200).send({ succes: false, content: "Not found" })
            }
        } else {
            res.status(200).send({ succes: false, content: "Not found" })
        }
    }

    consumeUI = async (req, res, api_id) => {
        this.writeReq(req)
        const start = new Date()

        const verified = await this.verifyToken(req)

        if (verified) {

            const user = this.decodeToken(req.header("Authorization"))
            const { url, method } = req;
            this.url = decodeURI(url);
            const [api, projects, tables, fields, privileges] = await Promise.all([
                this.#__apis.find({ api_id }),
                this.#__projects.findAll(),
                this.#__tables.findAll(),
                this.#__fields.findAll(),
                this.#__privileges.findAll({ username: user.username })
            ])
            if (api && api.api_method == method.toLowerCase() && api.status) {
                const Api = new ApisRecord(api)
                const project = projects[0]
                this.project = project;

                this.API = Api;

                this.req = req;
                this.res = res;
                this.fields = fields;
                this.tables = tables.map(table => {
                    const { id } = table;
                    table.fields = fields.filter(field => field.table_id == id)
                    return table
                });

                const apiTables = api.tables.map(table_id => this.tables.find(tb => tb.id == table_id));
                console.log(api)
                let isGranted;

                if (project) {
                    const { project_type } = project
                    if (project_type == "database") {
                        switch (api.api_method) {
                            case "get":
                                isGranted = this.hasEnoughPrivileges(apiTables, ["read"], privileges)
                                if (isGranted) {
                                    await this.GET_UI()
                                    const end = new Date()
                                    console.log("PROCCESS IN : " + `${end - start} `)
                                } else {
                                    res.status(200).send({ succes: false, content: "Không có quyền truy cập" })
                                }
                                break;

                            case "post":
                                isGranted = this.hasEnoughPrivileges(apiTables, ["write"], privileges)
                                if (isGranted) {
                                    await this.POST_UI()
                                    const end = new Date()
                                    console.log("PROCCESS IN : " + `${end - start} `)
                                } else {
                                    res.status(200).send({ succes: false, content: "Không có quyền truy cập" })
                                }
                                break;

                            case "put":

                                isGranted = this.hasEnoughPrivileges(apiTables, ["modify"], privileges)
                                if (isGranted) {
                                    await this.PUT_UI()
                                    const end = new Date()
                                    console.log("PROCCESS IN : " + `${end - start} `)
                                } else {
                                    res.status(200).send({ succes: false, content: "Không có quyền truy cập" })
                                }
                                break;
                            case "delete":
                                isGranted = this.hasEnoughPrivileges(apiTables, ["purge"], privileges)
                                if (isGranted) {
                                    await this.DELETE_UI()
                                    const end = new Date()
                                    console.log("PROCCESS IN : " + `${end - start} `)
                                } else {
                                    res.status(200).send({ succes: false, content: "Không có quyền truy cập" })
                                }

                                break;
                            default:
                                this.res.status(200).send("Not found nè")
                                break;

                        }
                    } else {
                        switch (api.api_method) {
                            case "get":
                                await this.REMOTE_GET()
                                break;

                            case "post":
                                await this.REMOTE_POST()
                                break;
                            case "put":
                                await this.REMOTE_PUT()
                                break;
                            case "delete":
                                await this.REMOTE_DELETE()
                                break;
                            default:
                                this.res.status(200).send("Not found nè")
                                break;

                        }
                    }
                } else {
                    res.status(200).send({ succes: false, content: "Not found" })
                }
            } else {
                res.status(200).send({ succes: false, content: "Not found" })
            }
        } else {
            res.status(200).send({ succes: false, content: "Token khum hợp lệ" })
        }
    }

    tearTablesAndFieldsToObjects = () => {

        /**
         * This method queries ALL tables from API and tears them to seperated objects with the structure below:
         * {
         *     id: 27,
         *     table_alias: '785C0C9C5B5243108C5CFBD9ACFFE13F',
         *     table_name: 'NHÂN ZIÊN',
         *     version_id: 11,
         *     primary_key: [ 77 ],
         *     foreign_keys: [],
         *     create_by: 'ad1',
         *     create_at: 2023-06-19T02:25:10.394Z,
         *     fields: [],
         *     body: [],
         *     params: []
            },
         * 
         * 
         */

        const tableIds = this.API.tables.value()
        const rawFields = this.API.fields.valueOrNot()
        const fieldIds = rawFields.map(field => field.id)
        const bodyIds = this.API.body.valueOrNot()
        const paramIds = this.API.params.valueOrNot()

        const tables = tableIds.map(tbID => {
            const table = this.tables.find(tb => tb.id == tbID)
            return table;
        })

        const fields = this.fields.filter(fd => fieldIds.indexOf(fd.id) != -1)
        const bodyFields = this.fields.filter(fd => bodyIds.indexOf(fd.id) != -1)
        const paramFields = this.fields.filter(fd => paramIds.indexOf(fd.id) != -1)

        const objects = tables.map(table => {
            const fieldsBelongToThisTable = this.fields.filter(field => field.table_id == table.id)
            const paramsBelongToThisTable = paramFields.filter(field => field.table_id == table.id)
            const bodyBeLongToThisTable = bodyFields.filter(field => field.table_id == table.id)
            return {
                ...table,
                fields: fieldsBelongToThisTable,
                body: bodyBeLongToThisTable,
                params: paramsBelongToThisTable
            }
        })
        return objects
    }

    getFieldsByTableId = (tableId) => {
        const fields = this.fields.filter(fd => fd.table_id == tableId)
        return fields;
    }

    getFields = (fieldIds) => {
        const fields = fieldIds.map(id => {
            const field = this.fields.find(f => f.id == id)
            return field
        })
        return fields
    }

    getFieldsByAlias = (fieldAliases) => {
        const fields = fieldAliases.map(alias => {
            const field = this.fields.find(f => f.fomular_alias == alias)
            return field
        }).filter(f => f != undefined)
        return fields
    }

    getField = (fieldId) => {
        const field = this.fields.find(fd => fieldId == fd.id)
        return field
    }

    getTable = (tableId) => {
        const table = this.tables.find(tb => tb.id == tableId)
        return table;
    }

    isFieldForeign = (field, table) => {
        const { id } = field;
        const { foreign_keys } = table

        const fk = foreign_keys.find(key => key.field_id == id)
        return fk;
    }

    parseType = (field, value) => {

        const type = field.DATATYPE
        /**
         * This method parses data to its valid type and return an object with the structures below:
         * 
         * In case of success: { valid: true  , result: <CorrespondingValueAfterParsing> }
         * In case of failure: { valid: false , reason: <String> }
         */
        if (value !== undefined && value !== "") {
            const { MAX, MIN } = field;
            switch (type) {
                case "INT":
                case "INT UNSIGNED":
                case "BIGINT":
                case "BIGINT UNSIGNED":
                    const { AUTO_INCREMENT } = field;
                    if (!AUTO_INCREMENT) {
                        const validateInt = intValidate(value);
                        if (validateInt) {
                            const intValue = parseInt(value)
                            if (intValue >= MIN && intValue <= MAX) {
                                return { valid: true, result: intValue };
                            } else {
                                return { valid: false, reason: "Giá chị khum nằm chong zới hẹn cho phép" };
                            }
                        } else {
                            return { valid: false, reason: "Dữ liệu của trường số nguyên & NO_AUTO phải là kiểu int" }
                        }
                    } else {
                        if (intValidate(value)) {
                            return { valid: true, result: parseInt(value) };
                        } else {
                            return { valid: true, result: value };
                        }
                    }
                case "DECIMAL":
                case "DECIMAL UNSIGNED":
                    const validateDouble = floatValidate(value);
                    if (validateDouble) {
                        const { DECIMAL_PLACE } = field;
                        const floatNumber = parseFloat(value)

                        const fixedValue = floatNumber.toFixed(DECIMAL_PLACE ? DECIMAL_PLACE : 0)
                        if (floatNumber >= parseFloat(MIN) && floatNumber <= parseFloat(MAX)) {
                            return { valid: true, result: parseFloat(fixedValue) }
                        } else {
                            return { valid: false, reason: "Giá trị khum nằm trong giới hạn cho phép" }
                        }

                    } else {
                        return { valid: false, reason: "Dữ liệu của trường số thực phải là một số thực" }
                    }
                case "BOOL":
                    const typeBool = typeof (value);
                    if (typeBool == 'boolean') {
                        return { valid: true, result: value }
                    }
                    else {
                        return { valid: false, reason: "Dữ liệu của trường BOOL phải là giá trị trong ENUM [ true, false ]" }
                    }
                case "DATE":
                case "DATETIME":
                    const date = new Date(value);
                    if (!isNaN(date)) {
                        return { valid: true, result: date }
                    } else {
                        return { valid: false, reason: "Ngày giờ khum hợp lệ" }
                    }
                case "TEXT":
                    const stringifiedValue = value.toString();
                    const { LENGTH } = field;
                    if (LENGTH && LENGTH > 0 && stringifiedValue.length <= LENGTH) {
                        return { valid: true, result: stringifiedValue }
                    } else {
                        return { valid: false, reason: "Dài quá dài z rồi ai chơi má" }
                    }
                case "CHAR":
                    const charifiedValue = value.toString()
                    if (charifiedValue.length == 1) {
                        return { valid: true, result: charifiedValue }
                    } return { valid: false, reason: "Kiểu char yêu cầu dữ liệu với độ dài bằng 1" }
                case "PHONE":
                case "EMAIL":
                    return { valid: true, result: value }
                default:
                    return { valid: false }
            }
        } else {
            const { NULL } = field;
            if (NULL) {
                return { valid: true, result: null }
            } else {
                return { valid: false, reason: "Dữ liệu rỗng" }
            }
        }
    }


    generatePeriodIndex = (rawIndex) => {
        const partitions = this.periods;
        const RECORD_PER_PAGE = RESULT_PER_SEARCH_PAGE
        if (intValidate(rawIndex) && partitions.length > 0) {
            const START_INDEX = parseInt(rawIndex)
            let PRIMAL_START_POINT = START_INDEX * RECORD_PER_PAGE

            const PARTITION_LENGTH = partitions.length
            let TARGET_PARTITION_INDEX = 0

            for (let i = 0; i < PARTITION_LENGTH; i++) {
                const total = partitions[i]["total"]
                const CURRENT_REMAINING_INDEX = PRIMAL_START_POINT
                PRIMAL_START_POINT -= total

                if (PRIMAL_START_POINT <= 0) {
                    TARGET_PARTITION_INDEX = i
                    partitions[i]["total"] = total - CURRENT_REMAINING_INDEX
                    partitions[i]["from"] = CURRENT_REMAINING_INDEX
                    partitions[i]["to"] = CURRENT_REMAINING_INDEX + RECORD_PER_PAGE
                    break
                }
            }

            const FINALE_PARTIONS = [partitions[TARGET_PARTITION_INDEX]]
            const TOTAL_RESULT_ITEM = RECORD_PER_PAGE
            let REMAINING_ITEM_AMOUNT = TOTAL_RESULT_ITEM - partitions[TARGET_PARTITION_INDEX]["total"]

            for (let i = TARGET_PARTITION_INDEX + 1; i < PARTITION_LENGTH; i++) {
                const total = partitions[i]["total"]
                const CURRENT_REMAINING_INDEX = REMAINING_ITEM_AMOUNT
                REMAINING_ITEM_AMOUNT -= total
                partitions[i]["from"] = 0
                partitions[i]["to"] = REMAINING_ITEM_AMOUNT > 0 ? total : CURRENT_REMAINING_INDEX

                FINALE_PARTIONS.push(partitions[i])

                if (REMAINING_ITEM_AMOUNT <= 0) break
            }
            return FINALE_PARTIONS
        } else {
            return [{
                position: partitions[0]?.position,
                from: 0,
                to: RECORD_PER_PAGE
            }]
        }
    }

    translateColIndexToName = (index) => {
        return `${index * TOTAL_DATA_PER_PARTITION}-${(index + 1) * TOTAL_DATA_PER_PARTITION - 1}`
    }

    sortTablesByKeys = (tables) => {
        let sortedTables = [tables[0]]
        let index = 0;
        let remainingTables = tables.slice(1, tables.length)

        while (remainingTables.length > 0) {
            const foreignKeys = []
            sortedTables.map(tb => { foreignKeys.push(...tb.foreign_keys) })

            for (let i = 0; i < foreignKeys.length; i++) {
                const { table_id } = foreignKeys[i]
                const targetTable = remainingTables.find(tb => tb.id == table_id)
                if (targetTable) {
                    sortedTables.push(targetTable)
                    remainingTables = remainingTables.filter(tb => tb.id != table_id)
                }
            }
        }
        return sortedTables
    }


    PRECISE_PARTITIONS = (partitions, START_INDEX, RECORD_AMOUNT) => {
        const partitions_length = partitions.length
        let partition_counter = 0;
        let remain_index = START_INDEX
        let targetStartIndex = 0
        let targetStartItem = 0
        for (let i = 0; i < partitions_length; i++) {
            const data = partitions[i]["data"]
            const data_length = data.length
            partition_counter += data_length

            if (partition_counter >= START_INDEX) {
                let latest_index = remain_index - 1
                targetStartIndex = i
                targetStartItem = latest_index
                break
            }
            else {
                remain_index -= data_length
            }
        }
        let remain_items_container = partitions[targetStartIndex]["data"]
        let remain_items = remain_items_container.slice(targetStartItem, remain_items_container.length)


        const finalePartitions = []
        const precisedTargetPartition = { ...partitions[targetStartIndex] }

        if (remain_items.length > RECORD_AMOUNT) {
            precisedTargetPartition["data"] = remain_items.slice(0, RECORD_AMOUNT)
            finalePartitions.push(precisedTargetPartition)
        } else {
            precisedTargetPartition["data"] = remain_items.slice(0, RECORD_AMOUNT)
            finalePartitions.push(precisedTargetPartition)
            let result_counter = precisedTargetPartition["data"].length

            for (let i = targetStartIndex + 1; i < partitions_length; i++) {
                let data = partitions[i]["data"]
                let data_length = data.length;
                let required_item_amount = RECORD_AMOUNT - result_counter;

                if (required_item_amount > data_length) {
                    finalePartitions.push(partitions[i])
                    result_counter += data_length
                } else {
                    partitions[i]["data"] = data.slice(0, required_item_amount)
                    finalePartitions.push(partitions[i])
                    result_counter += data_length
                    break;
                }
            }
        }

        return finalePartitions
    }


    GET = async (PARAMS_PLACE = 3) => {
        const tableids = this.API.tables.valueOrNot()
        const tables = tableids.map(id => this.getTable(id))
        const params = this.getFields(this.API.params.valueOrNot())
        const fields = this.getFields(this.API.fields.valueOrNot().map(field => field.id))
        let paramQueries = [];
        const datafrom = intValidate(this.req.header("start-at")) ? parseInt(this.req.header("start-at")) : 0
        let dataPerBreak = intValidate(this.req.header("data-amount")) ? parseInt(this.req.header("data-amount")) : RESULT_PER_SEARCH_PAGE
        let tmpDataFrom = datafrom
        if (dataPerBreak > 100_000) {
            this.res.status(200).send({
                success: false,
                msg: "Invalid data amount ( maximum 100.000 records per request )",
            })
        } else {

            const startTime = new Date()

            if (params.length > 0) {
                const formatedUrl = this.url.replaceAll('//', '/')
                const splittedURL = formatedUrl.split('/')
                const paramValues = splittedURL.slice(PARAMS_PLACE) /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

                let paramsValid = true;
                paramQueries = params.map((param, index) => {
                    const query = {}
                    const parsedValue = this.parseType(param, paramValues[index])
                    query[param.fomular_alias] = parsedValue.result;
                    if (paramValues[index] == '') {
                        paramsValid = false;
                    }
                    return { table_id: param.table_id, query }
                })
                if (paramValues.length < params.length || !paramsValid) {
                    this.res.status(200).send({
                        msg: "INVALID PARAMS SET",
                        data: []
                    })
                    return
                }
            }

            const foreignKeys = []
            tables.map(tb => {
                foreignKeys.push(...tb.foreign_keys)
            })

            const mainTable = tables[0]
            const paramQuery = paramQueries.filter(q => q.table_id == mainTable.id)

            const sideQueries = {}
            paramQuery.map(sideQuery => {
                const { query } = sideQuery;
                const keys = Object.keys(query)
                return sideQueries[`${keys[0]}`] = query[keys[0]]
            })


            let partitions = [];
            const dataLimitation = await Database.selectFields(mainTable.table_alias, { position: "sumerize" }, ["total"])
            
            const stringifiedPeriods = await Cache.getData(`${tables[0].table_alias}-periods`)
            const periods = stringifiedPeriods?.value
            if (stringifiedPeriods && periods.length > 0) {
                partitions = periods
            } else {

            }
            const redundantPartitions = []

            if (paramQueries.length > 0) {

                let data_counter = 0;
                let finale_raw_data_counter = 0;
                let found = false
                for (let i = 0; i < partitions.length; i++) {


                    const redundantPartition = partitions[i]

                    if (redundantPartition && redundantPartition.total) {
                        const currentDataLength = redundantPartition.total
                        data_counter += currentDataLength;
                        tmpDataFrom -= currentDataLength
                        // console.log(630, data_counter, found, finale_raw_data_counter, tmpDataFrom )
                        if (tmpDataFrom < 0 && !found) {
                            const redundantPartitionData = await Database.selectAll(mainTable.table_alias, { position: partitions[i].position, ...sideQueries })
                            const data = redundantPartitionData.slice(redundantPartitionData.length + tmpDataFrom, redundantPartitionData.length)
                            // console.log(636, { position: partitions[i].position, ...sideQueries })
                            redundantPartitions.push({
                                position: partitions[i].position,
                                total: data.length,
                                data: data,
                            })
                            found = true
                            finale_raw_data_counter += data.length
                            continue;
                        }

                        if (finale_raw_data_counter < dataPerBreak && found) {
                            finale_raw_data_counter += redundantPartition.total
                            // console.log(656, finale_raw_data_counter)

                            const redundantPartitionData = await Database.selectAll(mainTable.table_alias, { position: partitions[i].position, ...sideQueries })

                            redundantPartitions.push({
                                position: partitions[i].position,
                                total: redundantPartitionData.length,
                                data: redundantPartitionData,
                            })
                            if (finale_raw_data_counter >= dataPerBreak) {
                                break;
                            }
                        }
                    }
                }
            } else {
                let data_counter = 0;
                let finale_raw_data_counter = 0;
                let found = false
                for (let i = 0; i < partitions.length; i++) {
                    const redundantPartition = partitions[i]

                    if (redundantPartition && redundantPartition.total) {
                        const currentDataLength = redundantPartition.total
                        data_counter += currentDataLength;
                        tmpDataFrom -= currentDataLength
                        // console.log(630, data_counter, found, finale_raw_data_counter, tmpDataFrom )
                        if (tmpDataFrom < 0 && !found) {
                            const redundantPartitionData = await Database.selectAll(mainTable.table_alias, { position: partitions[i].position })
                            const data = redundantPartitionData.slice(redundantPartitionData.length + tmpDataFrom, redundantPartitionData.length)
                            // console.log(636, redundantPartitionData.length + tmpDataFrom, redundantPartitionData.length)
                            redundantPartitions.push({
                                position: partitions[i].position,
                                total: data.length,
                                data: data,
                            })
                            found = true
                            finale_raw_data_counter += data.length
                            continue;
                        }

                        if (finale_raw_data_counter < dataPerBreak && found) {
                            finale_raw_data_counter += redundantPartition.total
                            // console.log(656, finale_raw_data_counter)

                            const redundantPartitionData = await Database.selectAll(mainTable.table_alias, { position: partitions[i].position })

                            redundantPartitions.push({
                                position: partitions[i].position,
                                total: redundantPartitionData.length,
                                data: redundantPartitionData,
                            })
                            if (finale_raw_data_counter >= dataPerBreak) {
                                break;
                            }
                        }
                    }
                }
            }

            // console.log( redundantPartitions.length)

            if (redundantPartitions.length > 0) {

                const partitions = this.PRECISE_PARTITIONS(redundantPartitions, tmpDataFrom + 1, dataPerBreak)
                const keySortedTables = this.sortTablesByKeys(tables)
                const cacheData = {}
                
                keySortedTables.map(table => {
                    cacheData[table.table_alias] = []
                })

                const data = []


                for (let i = 0; i < partitions.length; i++) {
                    data.push(...partitions[i].data) // P[i]                        
                }

                const finaleData = data

                let filtedData = finaleData.filter(record => record != undefined);
                const calculates = this.API.calculates.valueOrNot();

                if (calculates.length > 0) {
                    filtedData = filtedData.map(record => {
                        const calculateValue = {};
                        const keys = Object.keys(record)
                        keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
                        for (let i = 0; i < calculates.length; i++) {
                            const { fomular_alias, fomular } = calculates[i]
                            let result = fomular;
                            keys.map(key => {
                                /* replace the goddamn fomular with its coresponding value in record values */
                                result = result.replaceAll(key, record[key])
                            })
                            try {
                                calculateValue[fomular_alias] = eval(result)
                            } catch {
                                calculateValue[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                            }
                        }
                        return { ...record, ...calculateValue }
                    })
                }
                const rawAPIFields = this.API.fields.valueOrNot()
                const apiFields = this.getFields(rawAPIFields.map(field => field.id));

                const displayFields = apiFields.map(field => {
                    const { id, display_name } = field;
                    const corespondingField = apiFields.find(f => f.id == id);
                    return { display_name, ...corespondingField }
                })

                const calculateDisplay = calculates.map(field => {
                    const { fomular_alias, display_name } = field;
                    return { fomular_alias, display_name }
                })

                const model = new Model(mainTable.table_alias);
                const Table = model.getModel();

                const sumerize = await Table.__findCriteria__({ position: "sumerize" })
                const statistic = this.API.statistic.valueOrNot()
                const statistics = []

                if (sumerize && !objectComparator(sumerize, {})) {
                    statistic.map(statis => {
                        const { display_name, fomular_alias, fomular, group_by } = statis;
                        const statisRecord = { display_name }
                        if (group_by && group_by.length > 0) {
                            const rawData = sumerize[fomular_alias]
                            if (rawData != undefined) {
                                if (fomular == "AVERAGE") {
                                    const headers = Object.keys(rawData)
                                    const values = Object.values(rawData).map(({ total, value }) => value)

                                    statisRecord["data"] = { headers, values }
                                    statisRecord["type"] = "table"
                                } else {
                                    const headers = Object.keys(rawData)
                                    const values = Object.values(rawData)
                                    statisRecord["data"] = { headers, values }
                                    statisRecord["type"] = "table"
                                }
                            }
                        } else {
                            statisRecord["type"] = "text"
                            statisRecord["data"] = sumerize[fomular_alias]
                        }
                        statistics.push(statisRecord)
                    })
                }



                const endTime = new Date()
                console.log("API CALL IN " + `${endTime - startTime}`)
                this.res.status(200).send({
                    msg: "Successfully retrieved data",
                    success: true,
                    total: finaleData.length,
                    count: dataLimitation[0]?.total,
                    data: filtedData,
                    fields: [...displayFields, ...calculateDisplay],
                    statistic: statistics
                })
            } else {
                this.res.status(200).send({
                    msg: "Successfully retrieved data",
                    success: true,
                    total: [],
                    data: [],
                    fields,
                    count: dataLimitation[0]?.total
                })
            }
        }
    }

    GET_UI = async (defaultFromIndex) => {
        const PARAMS_PLACE = 3
        const tables = this.tearTablesAndFieldsToObjects()
        const params = this.getFields(this.API.params.valueOrNot())
        const fromIndex = defaultFromIndex ? defaultFromIndex : this.req.header(`start_index`)

        if (!this.periods) {
            const start = new Date()
            const periods = await Cache.getData(`${tables[0].table_alias}-periods`)
            if (periods) {
                this.periods = periods.value
            } else {
                this.periods = []
                await Cache.setData(`${tables[0].table_alias}-periods`, [])
            }
            const end = new Date()
            console.log(`GET CACHE PARTITION IN: ${end - start}`)
        }

        const indices = this.generatePeriodIndex(fromIndex)
        // console.log(indices)
        let paramQueries = [];

        if (params.length > 0) {
            const formatedUrl = this.url.replaceAll('//', '/')
            const splittedURL = formatedUrl.split('/')
            const paramValues = splittedURL.slice(PARAMS_PLACE) /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

            let paramsValid = true;
            paramQueries = params.map((param, index) => {
                const query = {}
                const parsedValue = this.parseType(param, paramValues[index])
                query[param.fomular_alias] = parsedValue.result;
                if (paramValues[index] == '') {
                    paramsValid = false;
                }
                return { table_id: param.table_id, query }
            })
            if (paramValues.length < params.length || !paramsValid) {
                this.res.status(200).send({
                    msg: "INVALID PARAMS SET",
                    data: []
                })
                return
            }
        }

        const primaryKeys = {}
        const foreignKeys = {}


        const rawAPIFields = this.API.fields.valueOrNot()
        const apiFields = this.getFields(rawAPIFields.map(field => field.id));
        const dbFields = this.fields;
        for (let i = 0; i < tables.length; i++) {
            const { primary_key, foreign_keys, table_alias } = tables[i]
            primaryKeys[table_alias] = primary_key ? primary_key : []
            foreignKeys[table_alias] = foreign_keys ? foreign_keys : []
        }
        let sumerize = {}
        const rawData = []
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const queriesDataFromParams = paramQueries.filter(tb => tb.table_id == table.id);

            let query = {}
            for (let j = 0; j < queriesDataFromParams.length; j++) {
                query = { ...query, ...queriesDataFromParams[j].query }
            }

            const { id, table_alias, table_name, primary_key, foreign_keys } = table;
            const model = new Model(table_alias);
            const Table = model.getModel();
            await Table.__createIndex__("position")
            const data = []

            if (objectComparator(query, {})) {
                sumerize = await Table.__findCriteria__({ position: "sumerize" })
                for (let j = 0; j < indices.length; j++) {
                    const period = indices[j]

                    const splittedData = await Table.__findAll__({ position: period.position })
                    for (let ii = period.from; ii < period.to; ii++) {
                        data.push(splittedData[ii])
                    }

                }
            } else {
                const keys = Object.keys(query)
                const formatedQuery = {}
                keys.map(key => {
                    formatedQuery[`${key}`] = query[key]
                })

                const partition = await Table.__findAll__(formatedQuery)

                if (partition) {
                    let partitionData = partition;

                    const keys = Object.keys(query)
                    const values = Object.values(query)

                    for (let h = 0; h < keys.length; h++) {
                        if (partitionData) {
                            partitionData = partitionData.filter(record => record[keys[h]] == values[h])
                        }
                    }
                    if (partitionData) {
                        data.push(...partitionData)
                    }
                }


            }
            rawData.push({ table_id: id, table_alias, table_name, primary_key, foreign_keys, data })
        }
        rawData.sort((a, b) => a.data.length > b.data.length ? 1 : -1)
        let mergedRawData = rawData[0].data;

        let filteringData = mergedRawData;

        let filtedData = filteringData.filter(record => record != undefined);
        const calculates = this.API.calculates.valueOrNot();

        if (calculates.length > 0) {
            filtedData = filtedData.map(record => {
                const calculateValue = {};
                const keys = Object.keys(record)
                keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
                for (let i = 0; i < calculates.length; i++) {
                    const { fomular_alias, fomular } = calculates[i]
                    let result = fomular;
                    keys.map(key => {
                        /* replace the goddamn fomular with its coresponding value in record values */
                        result = result.replaceAll(key, record[key])
                    })
                    try {
                        calculateValue[fomular_alias] = eval(result)
                    } catch {
                        calculateValue[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                    }
                }
                return { ...record, ...calculateValue }
            })
        }

        const displayFields = apiFields.map(field => {
            const { id, display_name } = field;
            const corespondingField = apiFields.find(f => f.id == id);
            return { display_name, ...corespondingField }
        })

        const calculateDisplay = calculates.map(field => {
            const { fomular_alias, display_name } = field;
            return { fomular_alias, display_name }
        })

        const statistic = this.API.statistic.valueOrNot()
        const statistics = []

        if (sumerize && !objectComparator(sumerize, {})) {
            statistic.map(statis => {
                const { display_name, fomular_alias, fomular, group_by } = statis;
                const statisRecord = { display_name }
                if (group_by && group_by.length > 0) {
                    const rawData = sumerize[fomular_alias]
                    if (rawData != undefined) {
                        if (fomular == "AVERAGE") {
                            const headers = Object.keys(rawData)
                            const values = Object.values(rawData).map(({ total, value }) => value)

                            statisRecord["data"] = { headers, values }
                            statisRecord["type"] = "table"
                        } else {
                            const headers = Object.keys(rawData)
                            const values = Object.values(rawData)
                            statisRecord["data"] = { headers, values }
                            statisRecord["type"] = "table"
                        }
                    }
                } else {
                    statisRecord["type"] = "text"
                    statisRecord["data"] = sumerize[fomular_alias]
                }
                statistics.push(statisRecord)
            })
        }

        this.res.status(200).send({
            msg: "GET",
            success: true,
            fields: [...displayFields, ...calculateDisplay],
            data: filtedData,
            sumerize: sumerize?.total,
            statistic: statistics
        })
        return
    }

    POST = async () => {
        const tables = this.tearTablesAndFieldsToObjects()
        const tearedBody = []
        const primaryKeys = {}
        const foreignKeys = {}

        /**
         *  Tearing the fucking body to seperate objects that contain only their fields alone
         * 
         *  After these lines of code, we've got a goddamn object called "tearedBody" which is a list of objects with the structure below
         *  {
         *      table_alias: "NSDKGFK6JLKANFSJFK1D6A4",
         *      data: {
         *          "fomular_alias": "coresponding_value",
         *          ... 
         *      }
         *  }
         * 
         *  And two objects called primaryKeys & foreignKeys, they contain every key exists in tables set.
         *  
         */

        for (let i = 0; i < tables.length; i++) {
            const { primary_key, foreign_keys, table_alias, body, id, fields } = tables[i]
            const tearedObject = { table_id: id, table_alias, data: {} }

            primaryKeys[table_alias] = primary_key ? primary_key : []
            foreignKeys[table_alias] = foreign_keys ? foreign_keys : []

            for (let j = 0; j < body.length; j++) {
                const field = body[j]
                const { fomular_alias } = field;
                const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;
                let isAutoIncreTriggerd = false;
                if (this.req.body[fomular_alias] != undefined) {
                    const primaryKey = primaryKeys[table_alias].find(key => key == id)
                    if (primaryKey) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                        } else {
                            if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                                tearedObject.data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN)
                            } else {
                                tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                            }
                        }
                    } else {
                        tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                    }
                } else {
                    if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            const foreignField = this.getField(foreignKey.ref_field_id);
                            const foreignTable = this.getTable(foreignField.table_id);
                            tearedObject.data[fomular_alias] = await this.makeAutoIncreament(foreignTable.table_alias, PATTERN)
                        } else {
                            tearedObject.data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN)
                        }
                    } else {
                        tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                    }
                }
            }
            tearedBody.push(tearedObject)
        }

        let typeError = false;
        const errorFields = []
        const existedPrimaryKeys = []
        const foreignConflicts = []

        for (let i = 0; i < tearedBody.length; i++) {
            const object = tearedBody[i]
            const { table_id, data } = object;
            const fields = this.getFieldsByTableId(table_id)
            const table = this.getTable(table_id)
            const { foreign_keys } = table;

            for (let j = 0; j < fields.length; j++) {
                const { id, fomular_alias, field_name } = fields[j]

                const isThisFieldForeign = foreign_keys.find(key => key.field_id == id)

                if (isThisFieldForeign) {
                    fields[j].NULL = true
                }
                const validate = this.parseType(fields[j], data[fomular_alias])
                const { valid, result, reason } = validate;
                if (valid) {
                    tearedBody[i].data[fomular_alias] = result
                } else {
                    errorFields.push({ field: `${fomular_alias}-${field_name}`, value: data[fomular_alias], reason })
                    typeError = true;
                }

            }
        }
        const sortedTables = this.sortTablesByKeys(tables)
        const sortedBody = []
        if (!typeError) {

            for (let i = 0; i < sortedTables.length; i++) {
                const tb = sortedTables[i]
                const corespondingTable = tearedBody.find(body => body.table_id == tb.id)
                const slaves = this.detectAllSlave(tb)
                const { data } = corespondingTable


                for (let j = 0; j < slaves.length; j++) {
                    const slave = slaves[j]
                    const { foreign_keys } = slave
                    for (let h = 0; h < sortedBody.length; h++) {
                        const body = sortedBody[h]

                        if (body.table_id != undefined && body.table_id == slave.id) {
                            const foreign_key = foreign_keys.find(key => key.table_id == tb.id)
                            if (foreign_key) {
                                const { field_id, ref_field_id } = foreign_key;
                                const field = this.getField(field_id)
                                const ref_field = this.getField(ref_field_id)
                                body.data[`${field.fomular_alias}`] = data[`${ref_field.fomular_alias}`]
                            }
                        }
                    }
                }
                sortedBody.push(corespondingTable)
            }


            for (let i = 0; i < sortedBody.length; i++) {
                const body = sortedBody[i]
                const table = this.getTable(body.table_id)
                const slaves = this.detectAllSlave(table)

                for (let j = 0; j < slaves.length; j++) {
                    const slave = slaves[j]

                    for (let h = 0; h < sortedBody.length; h++) {
                        const body = sortedBody[h]
                        if (body.table_id != undefined && body.table_id == slave.id) {
                            sortedBody[h].data = { ...sortedBody[i].data, ...body.data }
                        }
                    }
                }
            }

            // primary key check

            const primaryKeyValuesSelectFunc = []
            for (let i = 0; i < sortedBody.length; i++) {
                const { table_id, data } = sortedBody[i]
                const table = this.getTable(table_id)

                const { primary_key } = table
                const primaryQuery = {}
                const primaryFields = this.getFields(primary_key)
                for (let j = 0; j < primaryFields.length; j++) {
                    const field = primaryFields[j]
                    primaryQuery[field.fomular_alias] = data[field.fomular_alias]
                }
                primaryKeyValuesSelectFunc.push(
                    Database.selectAll(table.table_alias, primaryQuery)
                )
            }

            const primaryKeyValues = await Promise.all(primaryKeyValuesSelectFunc)


            for (let i = 0; i < sortedBody.length; i++) {
                const primaryValues = primaryKeyValues[i]

                if (primaryValues && primaryValues.length > 0) {
                    const { table_id } = sortedBody[i]
                    const table = this.getTable(table_id)

                    const conflictObject = {
                        'table': table.table_name,
                        'key': primaryValues
                    }
                    existedPrimaryKeys.push(conflictObject)
                }
            }

            if (existedPrimaryKeys.length == 0) {
                // foreign check

                for (let i = 0; i < sortedBody.length; i++) {

                    const { table_id, data } = sortedBody[i]
                    const table = this.getTable(table_id)
                    const { foreign_keys } = table;

                    const referenceTables = foreign_keys.map(key => {
                        return {
                            table: this.getTable(key.table_id),
                            field: this.getField(key.field_id)
                        }
                    })

                    for (let j = 0; j < referenceTables.length; j++) {
                        const refTable = referenceTables[j].table
                        const slaveField = referenceTables[j].field
                        const corespondingTearedBody = sortedBody.find(body => body.table_id == refTable.id)

                        if (!corespondingTearedBody) {
                            const { table_alias, primary_key } = refTable
                            const primaryQuery = {}
                            const primaryFields = this.getFields(primary_key)
                            if (primaryFields.length == 1) {
                                const field = primaryFields[0]
                                primaryQuery[field.fomular_alias] = data[slaveField.fomular_alias]

                                const corespondingPrimaryData = await Database.selectAll(table_alias, primaryQuery)
                                if (corespondingPrimaryData.length == 0) {
                                    foreignConflicts.push({
                                        field: slaveField.fomular_alias,
                                        references: field.fomular_alias,
                                        value: data[slaveField.fomular_alias]
                                    })
                                }
                            } else {
                                foreignConflicts.push({
                                    table: refTable.table_name,
                                    error: `Cấu hình khóa ngoại không hợp lệ`
                                })
                            }
                        }
                    }
                }
            }
        }
        let success = true
        let msg = ""
        if (errorFields.length == 0 && existedPrimaryKeys.length == 0 && foreignConflicts.length == 0) {
            for (let i = 0; i < sortedBody.length; i++) {
                const { table_alias, table_id, data } = sortedBody[i]

                const table = this.getTable(table_id)
                const { foreign_keys } = table;


                for (let j = 0; j < foreign_keys.length; j++) {
                    const { field_id, table_id, ref_field_id } = foreign_keys[j]
                    const corespondingBody = sortedBody.find(body => body.table_id == table_id)

                    if (!corespondingBody) {
                        const table = this.getTable(table_id)
                        const field = this.getField(field_id)
                        const ref_field = this.getField(ref_field_id)
                        const foreignData = await Database.selectAll(table.table_alias, { [ref_field.fomular_alias]: data[field.fomular_alias] })
                        if (foreignData.length > 0) {

                            delete foreignData[0].position

                            const keys = Object.keys(foreignData[0])
                            keys.map(key => {
                                data[key] = foreignData[0][key]
                            })
                        }
                    }
                }


                let cache = await Cache.getData(`${table_alias}-periods`)
                if (!cache) {
                    await Cache.setData(`${table_alias}-periods`, [])
                    cache = {
                        key: `${table_alias}-periods`,
                        value: []
                    }
                }
                const periods = cache.value
                let found = false;
                let targetPosition = ""
                let tartgetPositionObject = {}
                let targetPositionIndex = 0
                for (let j = 0; j < periods.length; j++) {
                    if (!found) {
                        const { position, total } = periods[j]
                        if (total < TOTAL_DATA_PER_PARTITION) {
                            targetPosition = position
                            tartgetPositionObject = periods[j]
                            targetPositionIndex = j
                            found = true;
                        }
                    }
                }

                if (found) {

                    data.position = targetPosition
                    await Database.insert(`${table_alias}`, data)
                    tartgetPositionObject.total += 1
                    periods[targetPositionIndex] = tartgetPositionObject


                } else {
                    const newPosition = this.translateColIndexToName(periods.length)
                    const serializedData = []
                    serializedData.push(data);

                    const newPartition = {
                        position: newPosition,
                        total: 1
                    }
                    data.position = newPosition
                    await Database.insert(`${table_alias}`, data)
                    periods.push(newPartition)
                }

                await Cache.setData(`${table_alias}-periods`, periods)
                const sum = await Database.select(table_alias, { position: "sumerize" })
                if (sum) {
                    await Database.update(table_alias, { position: "sumerize" }, { total: sum.total + 1 })
                } else {
                    const newSumerize = {
                        position: "sumerize",
                        total: 1
                    }
                    await Database.insert(table_alias, newSumerize)
                }


                const Statis = await this.#__statistics.findAll({ table_id })
                const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id })

                const statistic = statis.statistic.valueOrNot()
                const calculates = statis.calculates.valueOrNot()

                const statisSum = await Database.select(table_alias, { position: "sumerize" })

                for (let i = 0; i < calculates.length; i++) {
                    const { fomular_alias, fomular } = calculates[i]
                    let result = fomular;
                    const keys = Object.keys(data)
                    keys.map(key => {
                        /* replace the goddamn fomular with its coresponding value in record values */
                        result = result.replaceAll(key, data[key])
                    })
                    try {
                        data[fomular_alias] = eval(result)
                    } catch {
                        data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                    }
                }
                for (let i = 0; i < statistic.length; i++) {
                    const statis = statistic[i]
                    const { fomular_alias, field, group_by, fomular } = statis;
                    const stringifyGroupKey = group_by.map(group => data[group]).join("_")
                    const statisField = statisSum[fomular_alias];
                    if (!statisField) {
                        if (group_by && group_by.length > 0) {
                            statisSum[fomular_alias] = {}
                        } else {
                            statisSum[fomular_alias] = 0
                        }
                    }
                    if (fomular == "SUM") {
                        if (typeof (data[field]) == "number") {
                            if (group_by && group_by.length > 0) {

                                if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                    statisSum[fomular_alias][stringifyGroupKey] = data[field]
                                } else {
                                    statisSum[fomular_alias][stringifyGroupKey] += data[field]
                                }
                            } else {
                                statisSum[fomular_alias] += data[field]
                            }
                        }
                    }

                    if (fomular == "AVERAGE") {
                        if (typeof (data[field]) == "number") {
                            if (group_by && group_by.length > 0) {

                                if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                    statisSum[fomular_alias][stringifyGroupKey] = {
                                        total: 1,
                                        value: data[field]
                                    }
                                } else {
                                    if (statisSum[fomular_alias][stringifyGroupKey].value) {
                                        statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total + 1)
                                    } else {
                                        statisSum[fomular_alias][stringifyGroupKey].value = data[field]
                                    }
                                    statisSum[fomular_alias][stringifyGroupKey].total += 1
                                }
                            } else {
                                statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total + data[field]) / (statisSum.total + 1)
                            }
                        }
                    }

                    if (fomular == "COUNT") {
                        if (group_by && group_by.length > 0) {

                            if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                statisSum[fomular_alias][stringifyGroupKey] = 1
                            } else {
                                statisSum[fomular_alias][stringifyGroupKey] += 1
                            }
                        } else {
                            statisSum[fomular_alias] += 1
                        }
                    }
                }
                await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })


            }
        } else {
            success = false
        }
        this.res.status(200).send({
            msg: "POST",
            success,
            conflict: {
                type: errorFields,
                primary: existedPrimaryKeys,
                foreign: foreignConflicts
            }
        })
        return
    }


    makeAutoIncreament = async (table_alias, pattern, distance = 0) => {
        console.log(table_alias)
        const auto_id = await Database.getAutoIncrementId(`${table_alias}-id`)
        const number = auto_id + distance
        let result = pattern
        if (!pattern) {
            result = "[N]"
        }
        const today = new Date();
        const date = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        result = result.replaceAll("[DD]", date);
        result = result.replaceAll("[MM]", month);
        result = result.replaceAll("[YYYY]", year);
        const numberPlaces = [];
        for (let i = 0; i < result.length; i++) {
            if (result[i] === '[') {
                var temp = ""
                for (let j = i + 1; j < result.length; j++) {
                    if (result[j] === 'N' && result[j] !== ']') {
                        temp += result[j];
                    } else {
                        if (result[j] === ']') {
                            numberPlaces.push(temp);
                            i = j;
                            temp = ""
                        }
                    }
                }
            }
        }

        if (numberPlaces.length == 0) {
            result += "[N]"
            numberPlaces.push("N")
        }
        const places = numberPlaces.map(place => {
            const placeLength = place.length;
            let numberLength = number.toString().length;
            let header = "";
            for (let i = 0; i < placeLength; i++) {
                header += "0";
            }
            const result = header.slice(0, placeLength - numberLength) + number.toString();
            return { place, value: result };
        })
        for (let i = 0; i < places.length; i++) {
            const { place, value } = places[i];
            result = result.replace(`[${place}]`, value)
        }
        return result;
    }

    POST_UI = async () => {
        const tables = this.tearTablesAndFieldsToObjects()
        const tearedBody = []
        const primaryKeys = {}
        const foreignKeys = {}


        for (let i = 0; i < tables.length; i++) {
            const { primary_key, foreign_keys, table_alias, body, id, fields } = tables[i]
            const tearedObject = { table_id: id, table_alias, data: {} }

            primaryKeys[table_alias] = primary_key ? primary_key : []
            foreignKeys[table_alias] = foreign_keys ? foreign_keys : []

            for (let j = 0; j < body.length; j++) {
                const field = body[j]
                const { fomular_alias } = field;
                const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;

                if (this.req.body[fomular_alias] != undefined) {
                    const primaryKey = primaryKeys[table_alias].find(key => key == id)
                    if (primaryKey) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                        } else {
                            if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                                tearedObject.data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN)
                            } else {
                                tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                            }
                        }
                    } else {
                        tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                    }
                } else {
                    if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            const foreignField = this.getField(foreignKey.ref_field_id);
                            const foreignTable = this.getTable(foreignField.table_id);
                            tearedObject.data[fomular_alias] = await this.makeAutoIncreament(foreignTable.table_alias, PATTERN)
                        } else {
                            tearedObject.data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN)
                        }
                    } else {
                        tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                    }
                }
            }
            tearedBody.push(tearedObject)
        }

        let typeError = false;
        let primaryConflict = false;
        let foreignConflict = false;

        const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
        const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

        const statistic = statis.statistic.valueOrNot()
        const calculates = statis.calculates.valueOrNot()

        for (let i = 0; i < tearedBody.length; i++) {
            const object = tearedBody[i]
            const { table_id, table_alias, data } = object;
            const fields = this.getFieldsByTableId(table_id)
            tearedBody[i].errorFields = [];

            for (let j = 0; j < fields.length; j++) {
                const { fomular_alias } = fields[j]
                const validate = this.parseType(fields[j], data[fomular_alias])
                const { valid, result, reason } = validate;
                if (valid) {
                    tearedBody[i].data[fomular_alias] = result
                } else {
                    tearedBody[i].errorFields.push({ field: fields[j], value: data[fomular_alias], reason })
                    typeError = true;
                }
            }
        }
        /**
         * Response JSON remains
         */

        if (!typeError) {

            const { primary_key, foreign_keys, table_alias } = tables[0]
            const primaryFields = this.getFields(primary_key)
            const data = tearedBody[0].data;
            const keyList = primaryFields.map(key => data[key.fomular_alias])

            const query = {}

            primaryFields.map(field => {
                query[`${field.fomular_alias}`] = data[field.fomular_alias]
            })

            const doesThisKeyExist = Database.selectAll(table_alias, query)
            const queries = [doesThisKeyExist]

            for (let i = 0; i < foreign_keys.length; i++) {
                const { field_id, table_id, ref_field_id } = foreign_keys[i]
                const [thisField] = this.getFields([field_id])
                const [thatField] = this.getFields([ref_field_id])
                const thatTable = this.getTable(table_id)
                const query = {}
                query[`${thatField.fomular_alias}`] = data[thisField.fomular_alias]
                queries.push(Database.selectAll(`${thatTable.table_alias}`, query))
            }
            const allKeys = await Promise.all(queries)
            // console.log(allKeys)
            const primaryRecord = allKeys[0];

            const foreignRecords = allKeys.slice(1, allKeys.length)
            const atLeastOneForeignisInvalid = foreignRecords.filter(record => record == undefined || record.length == 0)

            if ((primaryRecord && primaryRecord.length == 0) && atLeastOneForeignisInvalid.length == 0) {

                for (let i = 0; i < tearedBody.length; i++) {
                    const { table_alias, data } = tearedBody[i]
                    let cache = await Cache.getData(`${table_alias}-periods`)
                    if (!cache) {
                        await Cache.setData(`${table_alias}-periods`, [])
                        cache = {
                            key: `${table_alias}-periods`,
                            value: []
                        }
                    }
                    const periods = cache.value
                    let found = false;
                    let targetPosition = ""
                    let tartgetPositionObject = {}
                    let targetPositionIndex = 0
                    for (let j = 0; j < periods.length; j++) {
                        if (!found) {
                            const { position, total } = periods[j]
                            if (total < TOTAL_DATA_PER_PARTITION) {
                                targetPosition = position
                                tartgetPositionObject = periods[j]
                                targetPositionIndex = j
                                found = true;
                            }
                        }
                    }

                    allKeys.map(([foreignData]) => {
                        if (foreignData) {
                            delete foreignData.id
                            delete foreignData._id
                            const foreignDataKeys = Object.keys(foreignData)
                            foreignDataKeys.map(key => {
                                data[key] = foreignData[key]
                            })
                        }
                    })



                    if (found) {

                        data.position = targetPosition
                        await Database.insert(`${table_alias}`, data)
                        tartgetPositionObject.total += 1
                        periods[targetPositionIndex] = tartgetPositionObject


                    } else {
                        const newPosition = this.translateColIndexToName(periods.length)
                        const serializedData = []
                        serializedData.push(data);

                        const newPartition = {
                            position: newPosition,
                            total: 1
                        }
                        data.position = newPosition
                        await Database.insert(`${table_alias}`, data)
                        periods.push(newPartition)
                    }

                    await Cache.setData(`${table_alias}-periods`, periods)

                    const sum = await Database.select(table_alias, { position: "sumerize" })
                    if (sum) {
                        await Database.update(table_alias, { position: "sumerize" }, { total: sum.total + 1 })
                    } else {
                        const newSumerize = {
                            position: "sumerize",
                            total: 1
                        }
                        await Database.insert(table_alias, newSumerize)
                    }



                    const statisSum = await Database.select(table_alias, { position: "sumerize" })

                    for (let i = 0; i < calculates.length; i++) {
                        const { fomular_alias, fomular } = calculates[i]
                        let result = fomular;
                        const keys = Object.keys(data)
                        keys.map(key => {
                            /* replace the goddamn fomular with its coresponding value in record values */
                            result = result.replaceAll(key, data[key])
                        })
                        try {
                            data[fomular_alias] = eval(result)
                        } catch {
                            data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                        }
                    }
                    for (let i = 0; i < statistic.length; i++) {
                        const statis = statistic[i]
                        const { fomular_alias, field, group_by, fomular } = statis;
                        const stringifyGroupKey = group_by.map(group => data[group]).join("_")
                        const statisField = statisSum[fomular_alias];
                        if (!statisField) {
                            if (group_by && group_by.length > 0) {
                                statisSum[fomular_alias] = {}
                            } else {
                                statisSum[fomular_alias] = 0
                            }
                        }
                        if (fomular == "SUM") {
                            if (typeof (data[field]) == "number") {
                                if (group_by && group_by.length > 0) {

                                    if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                        statisSum[fomular_alias][stringifyGroupKey] = data[field]
                                    } else {
                                        statisSum[fomular_alias][stringifyGroupKey] += data[field]
                                    }
                                } else {
                                    statisSum[fomular_alias] += data[field]
                                }
                            }
                        }

                        if (fomular == "AVERAGE") {
                            if (typeof (data[field]) == "number") {
                                if (group_by && group_by.length > 0) {

                                    if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                        statisSum[fomular_alias][stringifyGroupKey] = {
                                            total: 1,
                                            value: data[field]
                                        }
                                    } else {
                                        if (statisSum[fomular_alias][stringifyGroupKey].value) {
                                            statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total + 1)
                                        } else {
                                            statisSum[fomular_alias][stringifyGroupKey].value = data[field]
                                        }
                                        statisSum[fomular_alias][stringifyGroupKey].total += 1
                                    }
                                } else {
                                    statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total + data[field]) / (statisSum.total + 1)
                                }
                            }
                        }

                        if (fomular == "COUNT") {
                            if (group_by && group_by.length > 0) {

                                if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                    statisSum[fomular_alias][stringifyGroupKey] = 1
                                } else {
                                    statisSum[fomular_alias][stringifyGroupKey] += 1
                                }
                            } else {
                                statisSum[fomular_alias] += 1
                            }
                        }
                    }
                    await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
                }
            } else {
                if (primaryRecord && primaryRecord.length == 0 ) {
                    primaryConflict = true
                }

                if (atLeastOneForeignisInvalid.length > 0) {
                    foreignConflict = true
                }
            }

        }
        this.res.status(200).send({ msg: "POST", typeError, primaryConflict, foreignConflict })
    }


    getTableByAlias = (alias) => {
        const table = this.tables.find(tb => tb.table_alias == alias)
        return table
    }

    PUT = async () => {
        const tables = this.tearTablesAndFieldsToObjects()
        const params = this.getFields(this.API.params.valueOrNot())
        let paramQueries = [];

        if (params.length > 0) {
            const formatedUrl = this.url.replaceAll('//', '/')
            const splittedURL = formatedUrl.split('/')
            const paramValues = splittedURL.slice(3) /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

            let paramsValid = true;
            paramQueries = params.map((param, index) => {
                const query = {}
                const parsedValue = this.parseType(param, paramValues[index])
                query[param.fomular_alias] = parsedValue.result;

                if (paramValues[index] == '') {
                    paramsValid = false;
                }
                return { table_id: param.table_id, query }
            })
            if (paramValues.length < params.length || !paramsValid) {
                this.res.status(200).send({
                    msg: "INVALID PARAMS SET",
                    data: []
                })
                return
            }
        }

        const tearedBody = []
        const primaryKeys = {}
        const foreignKeys = {}
        let typeError = false

        for (let i = 0; i < tables.length; i++) {
            const { primary_key, foreign_keys, table_alias, body, id, fields } = tables[i]
            const tearedObject = { table_id: id, table_alias, data: {} }

            primaryKeys[table_alias] = primary_key ? primary_key : []
            foreignKeys[table_alias] = foreign_keys ? foreign_keys : []

            for (let j = 0; j < body.length; j++) {
                const field = body[j]
                const { fomular_alias } = field;
                const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;

                if (this.req.body[fomular_alias] != undefined) {
                    const primaryKey = primaryKeys[table_alias].find(key => key == id)
                    if (primaryKey) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                        } else {
                            if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                                // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(table_alias, PATTERN)
                                isAutoIncreTriggerd = true
                            } else {
                                const { valid, result } = this.parseType(field, this.req.body[fomular_alias])
                                if (valid) {
                                    tearedObject.data[fomular_alias] = result
                                } else {
                                    typeError = true
                                }
                            }
                        }
                    } else {
                        const { valid, result } = this.parseType(field, this.req.body[fomular_alias])
                        if (valid) {
                            tearedObject.data[fomular_alias] = result
                        } else {
                            typeError = true
                        }
                    }
                } else {
                    if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            const foreignField = this.getField(foreignKey.ref_field_id);
                            const foreignTable = this.getTable(foreignField.table_id);
                            // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(foreignTable.table_alias, PATTERN)
                        } else {
                            // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(table_alias, PATTERN)
                            isAutoIncreTriggerd = true
                        }
                    } else {
                        const { valid, result } = this.parseType(field, this.req.body[fomular_alias])
                        if (valid) {
                            tearedObject.data[fomular_alias] = result
                        } else {
                            typeError = true
                        }
                    }
                }
            }
            tearedBody.push(tearedObject)
        }

        if (!typeError) {

            const sortedTables = this.sortTablesByKeys(tables)
            let mergedParams = {}
            paramQueries.map(({ query }) => { mergedParams = { ...mergedParams, ...query } })
            const sortedBody = []

            // MERGE ANY PRIMARY KEY IF FOUND
            for (let i = 0; i < sortedTables.length; i++) {
                const { id, primary_key } = sortedTables[i]
                const corespondingBody = tearedBody.find(body => body.table_id == id)

                const primaryFields = this.getFields(primary_key)
                primaryFields.map(field => {
                    if (mergedParams[field.fomular_alias] != undefined) {
                        corespondingBody.data[field.fomular_alias] = mergedParams[field.fomular_alias]
                    }
                })
                sortedBody.push(corespondingBody)
            }

            // MERGE FOREIGN KEYS IF FOUND & FILL MASTER DATA IF IT's UNDEFINED

            for (let i = 0; i < sortedTables.length; i++) {
                const { id, foreign_keys } = sortedTables[i]
                const corespondingBody = tearedBody.find(body => body.table_id == id)

                foreign_keys.map(key => {
                    const { field_id, table_id, ref_field_id } = key;
                    const field = this.getField(field_id)
                    const ref_field = this.getField(ref_field_id)
                    if (mergedParams[field.fomular_alias] != undefined) {
                        corespondingBody.data[field.fomular_alias] = mergedParams[field.fomular_alias]

                        for (let h = 0; h < sortedBody.length; h++) {
                            if (sortedBody[h].table_id == table_id) {
                                sortedBody[h].data[ref_field.fomular_alias] = mergedParams[field.fomular_alias]
                            }
                        }
                    }
                    if (mergedParams[ref_field.fomular_alias] != undefined) {
                        corespondingBody.data[field.fomular_alias] = mergedParams[ref_field.fomular_alias]
                    }
                })
            }

            for (let i = 0; i < sortedBody.length; i++) {
                const body = sortedBody[i]
                const table = this.getTable(body.table_id)
                const slaves = this.detectAllSlave(table)

                for (let j = 0; j < slaves.length; j++) {
                    const slave = slaves[j]

                    for (let h = 0; h < sortedBody.length; h++) {
                        const body = sortedBody[h]
                        if (body.table_id != undefined && body.table_id == slave.id) {
                            sortedBody[h].data = { ...sortedBody[i].data, ...body.data }
                        }
                    }
                }
            }

            let areAllQueriesReturnAtLeastOneRecord = true
            for (let i = 0; i < sortedBody.length; i++) {
                const { table_id, data } = sortedBody[sortedBody.length - i - 1]

                const table = this.getTable(table_id)
                const { table_alias, primary_key } = table;
                const primaryFields = this.getFields(primary_key)
                const updateQuery = {}

                primaryFields.map(field => {
                    const { fomular_alias } = field;
                    if (data[fomular_alias] != undefined) {
                        updateQuery[fomular_alias] = data[fomular_alias]
                    }
                })

                const masters = this.detectAllMaster(table)
                const existedMasters = masters.filter(master => sortedBody.find(body => body.table_id == master.id))

                existedMasters.map(master => {
                    const corespondingBody = sortedBody.find(tb => tb.table_id == master.id)
                    const { table_id, data } = corespondingBody
                    const { primary_key } = master;

                    const primaryFields = this.getFields(primary_key)
                    primaryFields.map(field => {
                        const { fomular_alias } = field;
                        if (data[fomular_alias] != undefined) {
                            updateQuery[fomular_alias] = data[fomular_alias]
                        }
                    })
                })

                const queryResult = await Database.count(table_alias, updateQuery);
                if (queryResult == 0) {
                    areAllQueriesReturnAtLeastOneRecord = false
                    break;
                }
            }

            if (areAllQueriesReturnAtLeastOneRecord) {

                let areAllForeignKeyValid = true

                for (let i = 0; i < sortedBody.length; i++) {
                    const { table_id, data } = sortedBody[sortedBody.length - i - 1]

                    const table = this.getTable(table_id)
                    const { table_alias, foreign_keys } = table;

                    const outsideMasters = foreign_keys.filter(key => {
                        const { table_id } = key;
                        const corespondingBody = sortedBody.find(body => body.table_id == table_id)
                        return !corespondingBody
                    })

                    for (let j = 0; j < outsideMasters.length; j++) {
                        if (areAllForeignKeyValid) {
                            const { table_id, field_id, ref_field_id } = outsideMasters[j]
                            const table = this.getTable(table_id)
                            const field = this.getField(field_id)
                            const ref_field = this.getField(ref_field_id)
                            const foreignData = await Database.selectAll(table.table_alias, { [ref_field.fomular_alias]: data[field.fomular_alias] })
                            if (foreignData.length == 0) {
                                areAllForeignKeyValid = false
                            } else {
                                delete foreignData[0].position
                                sortedBody[sortedBody.length - i - 1].data = { ...data, ...foreignData[0] }
                            }
                        }
                    }
                }

                if (areAllForeignKeyValid) {

                    for (let i = 0; i < sortedBody.length; i++) {
                        const { table_id, data } = sortedBody[sortedBody.length - i - 1]

                        const table = this.getTable(table_id)
                        const { table_alias, primary_key, foreign_keys } = table;
                        const primaryFields = this.getFields(primary_key)
                        const updateQuery = {}

                        const thisTableFields = this.getFieldsByTableId(table_id)

                        primaryFields.map(field => {
                            const { fomular_alias } = field;
                            if (data[fomular_alias] != undefined) {
                                updateQuery[fomular_alias] = data[fomular_alias]
                            }
                        })


                        const masters = this.detectAllMaster(table)
                        const existedMasters = masters.filter(master => sortedBody.find(body => body.table_id == master.id))

                        existedMasters.map(master => {
                            const corespondingBody = sortedBody.find(tb => tb.table_id == master.id)
                            const { table_id, data } = corespondingBody
                            const { primary_key, foreign_keys } = master;

                            const primaryFields = this.getFields(primary_key)
                            primaryFields.map(field => {
                                const { fomular_alias } = field;
                                if (data[fomular_alias] != undefined) {
                                    updateQuery[fomular_alias] = data[fomular_alias]
                                }
                            })
                        })

                        const originDatas = await Database.selectAll(table_alias, updateQuery);                        
                        console.log(updateQuery)

                        const slaves = this.detectAllSlave(table)
                        console.log(`${table.table_name} => `, slaves.map(slave => slave.table_name).join(', '))

                        foreign_keys.map(key => {
                            const { field_id, table_id, ref_field_id } = key;
                            const field = this.getField(field_id)
                            const ref_field = this.getField(ref_field_id)

                            data[ref_field.fomular_alias] = data[field.fomular_alias]
                        })

                        await Database.update(table_alias, updateQuery, { ...data })

                        // if (queryResult == 1) {
                        //     await Promise.all(slaves.map(slave => {
                        //         return Database.update(slave.table_alias, updateQuery, { ...data })
                        //     }))
                        // } else {
                        // }
                        const targetRecords = await Database.selectAll(table_alias, updateQuery)

                        // console.log(targetRecords)
                        targetRecords.map(record => {
                            delete record.position
                        })

                        for (let j = 0; j < targetRecords.length; j++) {
                            const record = targetRecords[j]
                            const recordUpdateQuery = {}

                            primaryFields.map(field => {
                                const { fomular_alias } = field;
                                if (record[fomular_alias] != undefined) {
                                    recordUpdateQuery[fomular_alias] = record[fomular_alias]
                                }
                            })
                            Promise.all(slaves.map(slave => {
                                return Database.update(slave.table_alias, recordUpdateQuery, { ...record })
                            }))
                        }
                        const Statis = await this.#__statistics.findAll({ table_id })
                        const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id })

                        const statistics = statis.statistic.valueOrNot()
                        const calculates = statis.calculates.valueOrNot()

                        console.log(data)
                        for( let br  = 0 ; br < originDatas.length; br++ ){
                            const originData = originDatas[br];
                            console.log(originData)
    
                            if (calculates && calculates.length > 0) {
                                const keys = Object.keys(data)
                                keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
            
                                for (let i = 0; i < calculates.length; i++) {
                                    const { fomular_alias, fomular } = calculates[i]
                                    let result = fomular;
                                    let originResult = fomular
                                    keys.map(key => {
                                        result = result.replaceAll(key, data[key])
                                        originResult = originResult.replaceAll(key, originData[key])
                                    })
                                    try {
                                        data[fomular_alias] = eval(result)
                                    } catch {
                                        data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                                    }
                                    try {
                                        originData[fomular_alias] = eval(originResult)
                                    } catch {
                                        originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                                    }
                                }
                            }
            
                            if (statistics && statistics.length > 0) {
                                const sumerize = await Database.select(table_alias, { position: "sumerize" })
                                const statisSum = sumerize
                                for (let i = 0; i < statistics.length; i++) {
                                    const statis = statistics[i]
                                    const { fomular_alias, field, group_by, fomular } = statis;
                                    const stringifyGroupKey = group_by.map(group => data[group]).join("_")
                                    const statisField = statisSum[fomular_alias];
            
                                    if (!statisField) {
                                        if (group_by && group_by.length > 0) {
                                            statisSum[fomular_alias] = {}
                                        } else {
                                            statisSum[fomular_alias] = 0
                                        }
                                    }
            
                                    if (fomular == "SUM") {
                                        if (typeof (data[field]) == "number") {
                                            if (group_by && group_by.length > 0) {
            
                                                if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                                    statisSum[fomular_alias][stringifyGroupKey] = data[field]
                                                } else {
                                                    statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
                                                }
                                            } else {
                                                statisSum[fomular_alias] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
                                            }
                                        }
                                    }
            
                                    if (fomular == "AVERAGE") {
                                        if (group_by && group_by.length > 0) {
            
                                            if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                                statisSum[fomular_alias][stringifyGroupKey] = {
                                                    value: data[field],
                                                    total: 1
                                                }
                                            } else {
                                                statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field] + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total)
                                                statisSum[fomular_alias][stringifyGroupKey].value += 1
                                            }
                                        } else {
                                            statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field] + data[field]) / (statisSum.total)
                                        }
                                    }
            
                                    if (fomular == "COUNT") {
                                        if (group_by && group_by.length > 0) {
                                            const newGroup = stringifyGroupKey;
                                            const oldGroup = group_by.map(group => originData[group]).join("_")
                                            if (newGroup != oldGroup) {
                                                if (!statisSum[fomular_alias][newGroup]) {
                                                    statisSum[fomular_alias][newGroup] = 1
                                                } else {
                                                    statisSum[fomular_alias][newGroup] += 1
                                                }
                                                statisSum[fomular_alias][oldGroup] -= 1
                                                if (statisSum[fomular_alias][oldGroup] == 0) {
                                                    delete statisSum[fomular_alias][oldGroup]
                                                }
                                            }
                                        }
                                    }
                                }
                                await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
                            }
                        }

                    }

                    this.res.status(200).send({ success: true })
                } else {
                    this.res.status(200).send({
                        success: false,
                        errors: {
                            'type': 'foreign keys',
                            'description': 'Some datasets have invalid foreign keys'
                        }
                    })
                }
            } else {
                this.res.status(200).send({
                    success: false,
                    errors: {
                        'type': 'not found',
                        'description': 'Some params return empty dataset'
                    }
                })
            }
        } else {
            this.res.status(200).send({
                success: false,
                errors: {
                    'type': 'type error',
                    'description': 'Some fields have invalid data type'
                }
            })
        }
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

    PUT_UI = async () => {
        /* CONSTRAINTS CHECK REQUIRED  */
        const tables = this.tearTablesAndFieldsToObjects()
        const params = this.getFields(this.API.params.valueOrNot())

        const data = this.req.body;
        let paramQueries = [];

        if (params.length > 0) {
            const formatedUrl = this.url.replaceAll('//', '/')
            const splittedURL = formatedUrl.split('/')
            const paramValues = splittedURL.slice(3) /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

            let paramsValid = true;
            paramQueries = params.map((param, index) => {
                const query = {}
                const parsedValue = this.parseType(param, paramValues[index])
                query[param.fomular_alias] = parsedValue.result;

                if (paramValues[index] == '') {
                    paramsValid = false;
                }
                return { table_id: param.table_id, query }
            })
            if (paramValues.length < params.length || !paramsValid) {
                this.res.status(200).send({
                    msg: "INVALID PARAMS SET",
                    data: []
                })
                return
            }
        }

        const tearedBody = []
        const primaryKeys = {}
        const foreignKeys = {}


        for (let i = 0; i < tables.length; i++) {
            const { primary_key, foreign_keys, table_alias, body, id, fields } = tables[i]
            const tearedObject = { table_id: id, table_alias, data: {} }

            primaryKeys[table_alias] = primary_key ? primary_key : []
            foreignKeys[table_alias] = foreign_keys ? foreign_keys : []

            for (let j = 0; j < body.length; j++) {
                const field = body[j]
                const { fomular_alias } = field;
                const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;

                if (this.req.body[fomular_alias] != undefined) {
                    const primaryKey = primaryKeys[table_alias].find(key => key == id)
                    if (primaryKey) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                        } else {
                            if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                                tearedObject.data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN)
                            } else {
                                tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                            }
                        }
                    } else {
                        tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                    }
                } else {
                    if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                        const foreignKey = foreignKeys[table_alias].find(key => key.field_id == id)
                        if (foreignKey) {
                            const foreignField = this.getField(foreignKey.ref_field_id);
                            const foreignTable = this.getTable(foreignField.table_id);
                            tearedObject.data[fomular_alias] = await this.makeAutoIncreament(foreignTable.table_alias, PATTERN)
                        } else {
                            tearedObject.data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN)
                        }
                    } else {
                        tearedObject.data[fomular_alias] = this.req.body[fomular_alias]
                    }
                }
            }
            tearedBody.push(tearedObject)
        }


        const table = tables[0]

        let query = {}

        for (let i = 0; i < paramQueries.length; i++) {
            const paramQuery = paramQueries[i].query;
            query = { ...query, ...paramQuery }
        }

        const { primary_key, foreign_keys, fields, table_alias } = table;
        const indexQuery = {}
        const primaryFields = this.getFields(primary_key)

        const recordIndex = primaryFields.map(field => query[field.fomular_alias])

        primaryFields.map(field => {
            indexQuery[field.fomular_alias] = data[field.fomular_alias]
        })

        const keys = Object.keys(query)
        const formatedQuery = {}
        keys.map(key => {
            formatedQuery[`${key}`] = query[key]
        })


        /* PRIMARY CHECK */

        const doesThisKeyExist = await Database.selectAll(table_alias, formatedQuery)
        const truePrimaryRecord = doesThisKeyExist[0]
        if (truePrimaryRecord != undefined) {
            const originData = truePrimaryRecord;

            const fields = this.getFieldsByTableId(table.id)

            for (let j = 0; j < fields.length; j++) {
                const { fomular_alias } = fields[j]
                const validate = this.parseType(fields[j], data[fomular_alias])
                const { valid, result, reason } = validate;
                if (valid) {
                    data[fomular_alias] = result
                }
            }

            /* FOREIGN KEY CHECK */

            const foreignSerialized = foreign_keys.map(key => {
                const { field_id, table_id, ref_field_id } = key;
                const foreignTable = this.getTable(table_id)

                const [thisField] = this.getFields([field_id])
                const [thatField] = this.getFields([ref_field_id])

                return { field: thisField, foreignTable, ref: thatField }
            })

            const foreignData = await Promise.all(foreignSerialized.map((key) => {
                const { field, foreignTable, ref } = key
                return Database.selectAll(foreignTable.table_alias, { [`${ref.fomular_alias}`]: data[field.fomular_alias] ? data[field.fomular_alias] : data[ref.fomular_alias] })
            }))

            let areForeignDataValid = true

            for (let i = 0; i < foreignData.length; i++) {
                if (foreignData[i].length == 0) {
                    areForeignDataValid = false
                } else {
                    const foreignRecord = foreignData[i][0]
                    const keys = Object.keys(foreignRecord)
                    keys.map(key => data[key] = foreignRecord[key])
                }
            }

            if (areForeignDataValid) {

                // const partitionData = partition.data;
                await Database.update(`${table_alias}`, formatedQuery, { ...data })

                const slaves = this.detectAllSlave(table)
                for (let i = 0; i < slaves.length; i++) {
                    const startAt = new Date()
                    const slave = slaves[i]
                    await Database.update(`${slave.table_alias}`, formatedQuery, { ...data })
                    const endAt = new Date()
                    console.log(`Synchorized data in table ${slave.table_name} costs: ${endAt - startAt}ms`)
                }



                const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
                const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

                const statistics = statis.statistic.valueOrNot()
                const calculates = statis.calculates.valueOrNot()



                if (calculates && calculates.length > 0) {
                    const keys = Object.keys(data)
                    keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                    for (let i = 0; i < calculates.length; i++) {
                        const { fomular_alias, fomular } = calculates[i]
                        let result = fomular;
                        let originResult = fomular
                        keys.map(key => {
                            result = result.replaceAll(key, data[key])
                            originResult = originResult.replaceAll(key, originData[key])
                        })
                        try {
                            data[fomular_alias] = eval(result)
                        } catch {
                            data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                        }
                        try {
                            originData[fomular_alias] = eval(originResult)
                        } catch {
                            originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                        }
                    }
                }

                if (statistics && statistics.length > 0) {
                    const sumerize = await Database.select(table_alias, { position: "sumerize" })
                    const statisSum = sumerize
                    for (let i = 0; i < statistics.length; i++) {
                        const statis = statistics[i]
                        const { fomular_alias, field, group_by, fomular } = statis;
                        const stringifyGroupKey = group_by.map(group => data[group]).join("_")
                        const statisField = statisSum[fomular_alias];

                        if (!statisField) {
                            if (group_by && group_by.length > 0) {
                                statisSum[fomular_alias] = {}
                            } else {
                                statisSum[fomular_alias] = 0
                            }
                        }

                        if (fomular == "SUM") {
                            if (typeof (data[field]) == "number") {
                                if (group_by && group_by.length > 0) {

                                    if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                        statisSum[fomular_alias][stringifyGroupKey] = data[field]
                                    } else {
                                        statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
                                    }
                                } else {
                                    statisSum[fomular_alias] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
                                }
                            }
                        }

                        if (fomular == "AVERAGE") {
                            if (group_by && group_by.length > 0) {

                                if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                    statisSum[fomular_alias][stringifyGroupKey] = {
                                        value: data[field],
                                        total: 1
                                    }
                                } else {
                                    statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field] + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total)
                                    statisSum[fomular_alias][stringifyGroupKey].value += 1
                                }
                            } else {
                                statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field] + data[field]) / (statisSum.total)
                            }
                        }

                        if (fomular == "COUNT") {
                            if (group_by && group_by.length > 0) {
                                const newGroup = stringifyGroupKey;
                                const oldGroup = group_by.map(group => originData[group]).join("_")
                                if (newGroup != oldGroup) {
                                    if (!statisSum[fomular_alias][newGroup]) {
                                        statisSum[fomular_alias][newGroup] = 1
                                    } else {
                                        statisSum[fomular_alias][newGroup] += 1
                                    }
                                    statisSum[fomular_alias][oldGroup] -= 1
                                    if (statisSum[fomular_alias][oldGroup] == 0) {
                                        delete statisSum[fomular_alias][oldGroup]
                                    }
                                }
                            }
                        }
                    }
                    await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
                }

                this.res.send({ success: true })
            } else {
                this.res.send({ success: false })
            }
        } else {
            this.res.send({ success: false })
        }
    }

    DELETE = async () => {
        const tables = this.tearTablesAndFieldsToObjects()
        const params = this.getFields(this.API.params.valueOrNot())
        let paramQueries = [];

        if (params.length > 0) {
            const formatedUrl = this.url.replaceAll('//', '/')
            const splittedURL = formatedUrl.split('/')
            const paramValues = splittedURL.slice(3)

            let paramsValid = true;
            paramQueries = params.map((param, index) => {
                const query = {}
                query[param.fomular_alias] = paramValues[index];
                if (paramValues[index] == '') {
                    paramsValid = false;
                }
                return { table_id: param.table_id, query }
            })
            if (paramValues.length < params.length || !paramsValid) {
                this.res.status(200).send({
                    msg: "INVALID PARAMS SET",
                    data: []
                })
                return
            }
        }
        const table = tables[0]
        let query = {}

        for (let i = 0; i < paramQueries.length; i++) {
            const paramQuery = paramQueries[i].query;
            query = { ...query, ...paramQuery }
        }

        const { primary_key, foreign_keys, fields, table_alias } = table;
        const indexQuery = {}
        const primaryFields = this.getFields(primary_key)


        primaryFields.map(field => {
            indexQuery[field.fomular_alias] = query[field.fomular_alias]
        })

        const keys = Object.keys(query)
        const formatedQuery = {}
        const itemQuery = {}
        keys.map(key => {
            const qr = {}
            formatedQuery[`${key}`] = query[key]
        })

        const model = new Model(table_alias);
        const Table = model.getModel();

        const doesThisKeyExist = await Database.selectAll(table_alias, formatedQuery)
        const primaryRecord = doesThisKeyExist[0];


        if (primaryRecord) {

            const slaves = this.detectAllSlave(table)
            const slaveryBoundRecords = await Promise.all(slaves.map(slave => Database.count(slave.table_alias, formatedQuery)))
            const isBoundBySlaves = slaveryBoundRecords.find(count => count > 0)
            console.log(slaveryBoundRecords)
            if (!isBoundBySlaves) {

                const sumerize = await Table.__findCriteria__({ position: "sumerize" })

                const deletedItems = await Database.selectAll(`${table_alias}`, query)
                
                await Database.deleteMany(`${table_alias}`, query)

                const cache = await Cache.getData(`${table_alias}-periods`)
                const periods = cache.value;

                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i]
                    if (period.position == primaryRecord.position) {
                        periods[i].total -= 1
                        break;
                    }
                }
                await Cache.setData(`${table_alias}-periods`, periods)
                await Table.__manualUpdate__({ position: "sumerize" }, { total: sumerize.total - deletedItems.length })
                
                const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
                const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

                const statistics = statis.statistic.valueOrNot()
                const calculates = statis.calculates.valueOrNot()

                for( let i = 0 ; i < deletedItems.length; i++ ){
                    const originData = deletedItems[i]

                    if (calculates && calculates.length > 0) {
                        const keys = Object.keys(originData)
                        keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                        for (let i = 0; i < calculates.length; i++) {
                            const { fomular_alias, fomular } = calculates[i]
                            let originResult = fomular
                            keys.map(key => {
                                originResult = originResult.replaceAll(key, originData[key])
                            })
                            try {
                                originData[fomular_alias] = eval(originResult)
                            } catch {
                                originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                            }
                        }
                    }

                    if (statistics && statistics.length > 0) {
                        const sumerize = await Table.__findCriteria__({ position: "sumerize" })
                        const statisSum = sumerize
                        for (let i = 0; i < statistics.length; i++) {
                            const statis = statistics[i]
                            const { fomular_alias, field, group_by, fomular } = statis;
                            const stringifyGroupKey = group_by.map(group => originData[group]).join("_")
                            const statisField = statisSum[fomular_alias];

                            if (!statisField) {
                                if (group_by && group_by.length > 0) {
                                    statisSum[fomular_alias] = {}
                                } else {
                                    statisSum[fomular_alias] = 0
                                }
                            }

                            if (fomular == "SUM") {
                                if (typeof (originData[field]) == "number") {
                                    if (group_by && group_by.length > 0) {
                                        if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                            statisSum[fomular_alias][stringifyGroupKey] = 0
                                        } else {
                                            statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field]
                                        }
                                    } else {
                                        statisSum[fomular_alias] = statisSum[fomular_alias] - originData[field]
                                    }
                                }
                            }

                            if (fomular == "AVERAGE") {
                                if (typeof (originData[field]) == "number") {
                                    if (group_by && group_by.length > 0) {

                                        if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                            statisSum[fomular_alias][stringifyGroupKey] = {
                                                total: 0,
                                                value: 0
                                            }
                                        } else {
                                            if (statisSum.total - 1 <= 0) {
                                                delete statisSum[fomular_alias][stringifyGroupKey]
                                            } else {
                                                statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field]) / (statisSum[fomular_alias][stringifyGroupKey].total - 1)
                                                statisSum[fomular_alias][stringifyGroupKey].total -= 1
                                            }
                                        }
                                    } else {
                                        if (statisSum.total - 1 == 0) {
                                            delete statisSum[fomular_alias]
                                        } else {
                                            statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field]) / (statisSum.total - 1)
                                        }
                                    }
                                }
                            }

                            if (fomular == "COUNT") {
                                if (group_by && group_by.length > 0) {
                                    const oldGroup = group_by.map(group => originData[group]).join("_")

                                    statisSum[fomular_alias][oldGroup] -= 1
                                    if (statisSum[fomular_alias][oldGroup] == 0) {
                                        delete statisSum[fomular_alias][oldGroup]
                                    }
                                }
                            }
                        }
                        await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
                    }
                }

                this.res.status(200).send({
                    success: true,
                    errors: {}
                })
            } else {
                // slaveries bound
                this.res.status(200).send({
                    success: false,
                    errors: {
                        type: "relation violating",
                        description: "Foreign key violation"
                    }
                })
            }
        } else {
            // primary record not found
            this.res.status(200).send({
                success: false,
                errors: {
                    type: "not found",
                    description: "Target record(s) not found"
                }
            })
        }
    }

    DELETE_UI = async () => {
        const tables = this.tearTablesAndFieldsToObjects()
        const params = this.getFields(this.API.params.valueOrNot())
        let paramQueries = [];

        /* CASCADING OPTION REQUIRED  */

        if (params.length > 0) {
            const formatedUrl = this.url.replaceAll('//', '/')
            const splittedURL = formatedUrl.split('/')
            const paramValues = splittedURL.slice(3)

            let paramsValid = true;
            paramQueries = params.map((param, index) => {
                const query = {}
                query[param.fomular_alias] = paramValues[index];
                if (paramValues[index] == '') {
                    paramsValid = false;
                }
                return { table_id: param.table_id, query }
            })
            if (paramValues.length < params.length || !paramsValid) {
                this.res.status(200).send({
                    msg: "INVALID PARAMS SET",
                    data: []
                })
                return
            }
        }
        const table = tables[0]
        let query = {}

        for (let i = 0; i < paramQueries.length; i++) {
            const paramQuery = paramQueries[i].query;
            query = { ...query, ...paramQuery }
        }

        const { primary_key, foreign_keys, fields, table_alias } = table;
        const indexQuery = {}
        const primaryFields = this.getFields(primary_key)


        primaryFields.map(field => {
            indexQuery[field.fomular_alias] = query[field.fomular_alias]
        })

        const keys = Object.keys(query)
        const formatedQuery = {}
        const itemQuery = {}
        keys.map(key => {
            const qr = {}
            formatedQuery[`${key}`] = query[key]
        })

        const model = new Model(table_alias);
        const Table = model.getModel();

        const doesThisKeyExist = await Database.selectAll(table_alias, formatedQuery)
        const primaryRecord = doesThisKeyExist[0]; // ? this may cause error if more than 1 partition were returned

        // const partitionData = partition.data;
        if (primaryRecord) {


            const slaves = this.detectAllSlave(table)
            const slaveryBoundRecords = await Promise.all(slaves.map(slave => Database.count(slave.table_alias, formatedQuery)))
            const isBoundBySlaves = slaveryBoundRecords.find(count => count > 0)

            if (!isBoundBySlaves) {

                const sumerize = await Table.__findCriteria__({ position: "sumerize" })
                await Database.delete(`${table_alias}`, query)

                const cache = await Cache.getData(`${table_alias}-periods`)
                const periods = cache.value;

                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i]
                    if (period.position == primaryRecord.position) {
                        periods[i].total -= 1
                        break;
                    }
                }

                await Cache.setData(`${table_alias}-periods`, periods)
                const originData = primaryRecord;


                const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
                const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

                const statistics = statis.statistic.valueOrNot()
                const calculates = statis.calculates.valueOrNot()

                if (calculates && calculates.length > 0) {
                    const keys = Object.keys(originData)
                    keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                    for (let i = 0; i < calculates.length; i++) {
                        const { fomular_alias, fomular } = calculates[i]
                        let originResult = fomular
                        keys.map(key => {
                            originResult = originResult.replaceAll(key, originData[key])
                        })
                        try {
                            originData[fomular_alias] = eval(originResult)
                        } catch {
                            originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                        }
                    }
                }

                if (statistics && statistics.length > 0) {
                    const sumerize = await Table.__findCriteria__({ position: "sumerize" })
                    const statisSum = sumerize
                    for (let i = 0; i < statistics.length; i++) {
                        const statis = statistics[i]
                        const { fomular_alias, field, group_by, fomular } = statis;
                        const stringifyGroupKey = group_by.map(group => originData[group]).join("_")
                        const statisField = statisSum[fomular_alias];

                        if (!statisField) {
                            if (group_by && group_by.length > 0) {
                                statisSum[fomular_alias] = {}
                            } else {
                                statisSum[fomular_alias] = 0
                            }
                        }

                        if (fomular == "SUM") {
                            if (typeof (originData[field]) == "number") {
                                if (group_by && group_by.length > 0) {
                                    if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                        statisSum[fomular_alias][stringifyGroupKey] = 0
                                    } else {
                                        statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field]
                                    }
                                } else {
                                    statisSum[fomular_alias] = statisSum[fomular_alias] - originData[field]
                                }
                            }
                        }

                        if (fomular == "AVERAGE") {
                            if (typeof (originData[field]) == "number") {
                                if (group_by && group_by.length > 0) {

                                    if (!statisSum[fomular_alias][stringifyGroupKey]) {
                                        statisSum[fomular_alias][stringifyGroupKey] = {
                                            total: 0,
                                            value: 0
                                        }
                                    } else {
                                        if (statisSum.total - 1 <= 0) {
                                            delete statisSum[fomular_alias][stringifyGroupKey]
                                        } else {
                                            statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field]) / (statisSum[fomular_alias][stringifyGroupKey].total - 1)
                                            statisSum[fomular_alias][stringifyGroupKey].total -= 1
                                        }
                                    }
                                } else {
                                    if (statisSum.total - 1 == 0) {
                                        delete statisSum[fomular_alias]
                                    } else {
                                        statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field]) / (statisSum.total - 1)
                                    }
                                }
                            }
                        }

                        if (fomular == "COUNT") {
                            if (group_by && group_by.length > 0) {
                                const oldGroup = group_by.map(group => originData[group]).join("_")

                                statisSum[fomular_alias][oldGroup] -= 1
                                if (statisSum[fomular_alias][oldGroup] == 0) {
                                    delete statisSum[fomular_alias][oldGroup]
                                }
                            }
                        }
                    }
                    await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
                }

                await Table.__manualUpdate__({ position: "sumerize" }, { total: sumerize.total - 1 })
                this.res.send({ success: true })
            } else {
                this.res.status(200).send({
                    success: false,
                    errors: {
                        type: "relation violating",
                        description: "Foreign key violation"
                    }
                })
            }

        } else {
            this.res.status(200).send({
                success: false,
                errors: {
                    type: "not found",
                    description: "Target record(s) not found"
                }
            })
        }
    }

    generateRemoteURL = () => {
        const { proxy_server } = this.project ? this.project : { proxy_server: "http://127.0.0.1" };
        const formatedUrl = this.req.url.replaceAll('//', '/')
        let remoteDomain = proxy_server;
        while (remoteDomain[remoteDomain.length - 1] == '/') {
            remoteDomain = remoteDomain.slice(0, remoteDomain.length - 1)
        }

        const remoteURL = `${remoteDomain}${formatedUrl}`
        return remoteURL
    }

    REMOTE_GET = async () => {
        const remoteURL = this.generateRemoteURL()
        console.log(this.req.headers)
        const response = await new Promise((resolve, reject) => {
            fetch(remoteURL, {
                headers: {
                    Authorization: this.req.header("Authorization")
                }
            }).then(res => res.json()).then(res => {
                resolve(res)
            })
        })

        this.res.status(200).send(response)
    }

    REMOTE_POST = async () => {
        const body = this.req.body;
        const remoteURL = this.generateRemoteURL()

        const response = await new Promise((resolve, reject) => {
            fetch(remoteURL, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(body)
            }).then(res => res.json()).then(res => {
                resolve(res)
            })
        })

        this.res.status(200).send(response)
    }

    REMOTE_PUT = async () => {
        const remoteURL = this.generateRemoteURL()
        const response = await new Promise((resolve, reject) => {
            fetch(remoteURL, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(body)
            }).then(res => res.json()).then(res => {
                resolve(res)
            })
        })

        this.res.status(200).send(response)
    }

    REMOTE_DELETE = async () => {
        const remoteURL = this.generateRemoteURL()
        const response = await new Promise((resolve, reject) => {
            fetch(remoteURL, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(body)
            }).then(res => res.json()).then(res => {
                resolve(res)
            })
        })

        this.res.status(200).send(response)
    }


    retrievePutData = async (req, res) => {
        this.writeReq(req)
        const { api_id } = req.params;
        const { url } = req;
        this.url = decodeURI(url)
        const [api, projects, tables, fields] = await Promise.all([this.#__apis.find({ api_id }), this.#__projects.findAll(), this.#__tables.findAll(), this.#__fields.findAll()])
        if (api) {
            const Api = new ApisRecord(api)
            const project = projects[0]
            this.project = project;

            this.API = Api;
            this.req = req;
            this.res = res;
            this.fields = fields;
            this.tables = tables.map(table => {
                const { id } = table;
                table.fields = fields.filter(field => field.table_id == id)
                return table
            });

            await this.GET_UI()
        } else {
            this.res.status(200).send("Not found")
        }
    }

    consumeSearch = async (req, res, api_id) => {
        this.writeReq(req)
        const start = new Date()

        const { url, method } = req;
        this.url = decodeURI(url);
        const [api, projects, tables, fields] = await Promise.all([this.#__apis.find({ api_id }), this.#__projects.findAll(), this.#__tables.findAll(), this.#__fields.findAll()])
        if (api && api.status && api.api_method == method.toLowerCase()) {
            const Api = new ApisRecord(api)
            const project = projects[0]
            this.project = project;

            this.API = Api;
            this.req = req;
            this.res = res;
            this.fields = fields;
            this.tables = tables.map(table => {
                const { id } = table;
                table.fields = fields.filter(field => field.table_id == id)
                return table
            });

            const { criteria } = req.body;
            req.body.query = { ...criteria }
            delete req.body.criteria

            this.SEARCH_BROADCAST()
        } else {
            res.status(200).send({ success: false, content: "No API Found" })
        }
    }

    consumeExport = async (req, res, api_id) => {
        this.writeReq(req)

        const { url, method } = req;
        this.url = decodeURI(url);
        const [api, projects, tables, fields] = await Promise.all([this.#__apis.find({ api_id }), this.#__projects.findAll(), this.#__tables.findAll(), this.#__fields.findAll()])
        // if (api && api.status && api.api_method == method.toLowerCase() ) {
        if (api && api.status) {
            const Api = new ApisRecord(api)
            const project = projects[0]
            this.project = project;

            this.API = Api;
            this.req = req;
            this.res = res;
            this.fields = fields;
            this.tables = tables.map(table => {
                const { id } = table;
                table.fields = fields.filter(field => field.table_id == id)
                return table
            });

            const { export_type } = req.body;

            if (export_type == "excel") {
                this.EXPORT_EXCEL()
            } else {
                this.EXPORT_CSV()
            }



        } else {
            res.status(200).send({ success: false, content: "No API Found" })
        }
    }

    consumeImport = async (req, res, api_id) => {
        this.writeReq(req)

        const { url, method } = req;
        this.url = decodeURI(url);
        const [api, projects, tables, fields] = await Promise.all([this.#__apis.find({ api_id }), this.#__projects.findAll(), this.#__tables.findAll(), this.#__fields.findAll()])
        // if (api && api.status && api.api_method == method.toLowerCase() ) {
        if (api && api.status) {
            const Api = new ApisRecord(api)
            const project = projects[0]
            this.project = project;

            this.API = Api;
            this.req = req;
            this.res = res;
            this.fields = fields;
            this.tables = tables.map(table => {
                const { id } = table;
                table.fields = fields.filter(field => field.table_id == id)
                return table
            });

            const { type } = this.req.body
            if (type == "import") {
                this.IMPORT()
            } else {
                this.DATA_VALIDATION()
            }
        } else {
            res.status(200).send({ success: false, content: "No API Found" })
        }
    }

    SEARCH = async () => {

        const tables = this.tearTablesAndFieldsToObjects()

        const table = tables[0]

        const { query, start_index, require_count, exact } = this.req.body;

        const start = (start_index ? start_index : 0) * RESULT_PER_SEARCH_PAGE
        const end = start + RESULT_PER_SEARCH_PAGE

        const keys = Object.keys(query)
        const fields = this.getFieldsByTableId(table.id)
        const result = []
        let index = 0
        let count = 0;


        const isAtLeastOneCriteriaIsNotNull = keys.filter(key => {
            const value = query[key];
            return value
        })

        if (isAtLeastOneCriteriaIsNotNull.length > 0) {

            const formatedQuery = { $and: [] }
            keys.map(key => {
                const qr = {}
                qr[`${key}`] = { $regex: query[key] }
                formatedQuery["$and"].push(qr)
            })

            const data = await Database.selectFrom(table.table_alias, formatedQuery, start, end)

            let count;
            if (require_count) {
                count = await Database.count(table.table_alias, formatedQuery)
            }


            this.res.send({
                success: true,
                total: result.length,
                result,
                fields,
                data,
                count: count
            })
        } else {
            this.req.body = {
                table_id: table.id,
                start_index: 0,
                criteria: {},
                require_count: false,
                exact: false,
                api_id: undefined
            }
            this.FOREIGNDATA(this.req, this.res)
        }
    }

    SEARCH_BROADCAST = async () => {
        const tables = this.tearTablesAndFieldsToObjects()

        const table = tables[0]

        const { query, start_index, require_count, require_statistic , exact } = this.req.body;

        const start = (start_index ? start_index : 0) * RESULT_PER_SEARCH_PAGE
        const end = start + RESULT_PER_SEARCH_PAGE

        const keys = Object.keys(query)
        const fields = this.getFieldsByTableId(table.id)
        const result = []
        let index = 0
        let count = 0;


        const isAtLeastOneCriteriaIsNotNull = keys.filter(key => {
            const value = query[key];
            return value
        })

        if (isAtLeastOneCriteriaIsNotNull.length > 0) {

            const formatedQuery = { $and: [] }
            keys.map(key => {
                const qr = {}
                
                const [field] = this.getFieldsByAlias([key])

                if( field ){

                    const { DATATYPE, AUTO_INCREMENT } = field;
                    if( Fields.stringFamily.indexOf( DATATYPE ) != -1 || ( Fields.intFamily.indexOf( DATATYPE ) != -1 && AUTO_INCREMENT ) ){                        
                        qr[`${key}`] = { $regex: query[key] } //approximate
                        // qr[`${key}`] = query[key] // exact
                    }else{
                        qr[`${key}`] = query[key]
                    }

                    formatedQuery["$and"].push(qr)
                }

            })
            
            const data = await Database.selectFrom(table.table_alias, formatedQuery, start, end)            
            let count = 0;
            
            const statistics = this.API.statistic.valueOrNot()
            const statisData = {}
            const calculates = this.API.calculates.valueOrNot();
            const statistic = []
            if (require_count) {
                count = await Database.count( table.table_alias, formatedQuery )                
                console.log("REQ COUNT", count)
            }

            if( require_statistic ){
                count = await Database.count( table.table_alias, formatedQuery )
                console.log("REQ STATIS", count)
                
                if( statistics.length > 0 ){

                    for( let i = 0 ; i < count; i+= 10000 ){
                        const tmpData = await Database.selectFrom(table.table_alias, formatedQuery, i, i+10000 )
                        
                        for (let j = 0; j < tmpData.length; j++) {                        
                            const record = tmpData[j]
            
                            const keys = Object.keys(record)
            
                            keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
            
                            for (let k = 0; k < calculates.length; k++) {
                                const { fomular_alias, fomular } = calculates[k]
                                let result = fomular;
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
            
                            statistics.map(statis => {
                                const { field, fomular_alias, fomular, group_by } = statis;
                                const statisRecord = statisData[fomular_alias]
            
                                const stringifiedKey = group_by.map(group => record[group]).join("_")
            
                                if (!statisRecord) {
                                    if (group_by && group_by.length > 0) {
                                        statisData[fomular_alias] = {}
                                    } else {
                                        statisData[fomular_alias] = 0
                                    }
                                }
            
                                if (fomular == "SUM") {
                                    if (group_by && group_by.length > 0) {
            
                                        if (!statisData[fomular_alias][stringifiedKey]) {
                                            statisData[fomular_alias][stringifiedKey] = record[field]
                                        } else {
                                            statisData[fomular_alias][stringifiedKey] += record[field]
                                        }
                                    } else {
                                        statisData[fomular_alias] += record[field]
                                    }
                                }
            
                                if (fomular == "AVERAGE") {
                                    if (group_by && group_by.length > 0) {
            
                                        if (!statisData[fomular_alias][stringifiedKey]) {
                                            statisData[fomular_alias][stringifiedKey] = {
                                                total: 1,
                                                value: record[field]
                                            }
                                        } else {
                                            statisData[fomular_alias][stringifiedKey].value = (statisData[fomular_alias][stringifiedKey].value * statisData[fomular_alias][stringifiedKey].total + record[field]) / (statisData[fomular_alias][stringifiedKey].total + 1)
                                            statisData[fomular_alias][stringifiedKey].total += 1
                                        }
                                    } else {
                                        statisData[fomular_alias] = (statisData[fomular_alias] * (count - 1) + record[field]) / count
                                    }
                                }
            
                                if (fomular == "COUNT") {
                                    if (group_by && group_by.length > 0) {
            
                                        if (!statisData[fomular_alias][stringifiedKey]) {
                                            statisData[fomular_alias][stringifiedKey] = 1
                                        } else {
                                            statisData[fomular_alias][stringifiedKey] += 1
                                        }
                                    } else {
                                        statisData[fomular_alias] += 1
                                    }
                                }
                            })
                        }            
                        
                    }
                    statistics.map(statis => {
                        const { display_name, fomular_alias, group_by, fomular } = statis;
                        const statisRecord = { display_name }
                        if (group_by && group_by.length > 0) {
                            const rawData = statisData[fomular_alias]
                            if (rawData != undefined) {
                                if (fomular == "AVERAGE") {
                                    const headers = Object.keys(rawData)
                                    const values = Object.values(rawData).map(({ total, value }) => value)
        
                                    statisRecord["data"] = { headers, values }
                                    statisRecord["type"] = "table"
                                } else {
                                    const headers = Object.keys(rawData)
                                    const values = Object.values(rawData)
                                    statisRecord["data"] = { headers, values }
                                    statisRecord["type"] = "table"
                                }
                            }
                        } else {
                            statisRecord["type"] = "text"
                            statisRecord["data"] = statisData[fomular_alias]
                        }
                        statistic.push(statisRecord)
                    })
                }
            }


            data.map( record => {
                const keys = Object.keys(record)
            
                keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                for (let k = 0; k < calculates.length; k++) {
                    const { fomular_alias, fomular } = calculates[k]
                    let result = fomular;
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
            })

            const result = data

            this.res.send({
                success: true,
                total: result.length,                
                fields: [...fields, ...calculates],
                data: result,
                count: count,
                statistic
            })
        } else {
            this.req.body = {
                table_id: table.id,
                start_index: 0,
                criteria: {},
                require_count: false,
                exact: false,
                api_id: undefined
            }
            this.FOREIGNDATA(this.req, this.res)
        }
    }

    // SEARCH = async () => {

    //     const tables = this.tearTablesAndFieldsToObjects()

    //     const table = tables[0]

    //     const { query, start_index, require_count, exact } = this.req.body;

    //     let start = (start_index ? start_index : 0) * RESULT_PER_SEARCH_PAGE
    //     const end = start + RESULT_PER_SEARCH_PAGE

    //     const keys = Object.keys(query)
    //     const fields = this.getFieldsByTableId(table.id)
    //     const result = []
    //     let index = 0
    //     let count = 0;


    //     const isAtLeastOneCriteriaIsNotNull = keys.filter(key => {
    //         const value = query[key];
    //         return value
    //     })

    //     if (isAtLeastOneCriteriaIsNotNull.length > 0) {

    //         const formatedQuery = { $and: [] }
    //         keys.map(key => {
    //             const qr = {}
    //             qr[`data.${key}`] = { $regex: query[key] }
    //             formatedQuery["$and"].push(qr)
    //         })

    //         const dbo = await Database.getDBO()
    //         const regexMatches = { $and: [] }
    //         keys.map(key => {
    //             const match = {
    //                 input: `$$item.${key}`,
    //                 regex: query[key]
    //             }
    //             regexMatches["$and"].push({
    //                 $regexMatch: match
    //             })
    //         })

    //         const startTime = new Date()

    //         const filtedData = await dbo.collection(table.table_alias).aggregate([
    //             { $match: formatedQuery },
    //             {
    //                 $project: {
    //                     data: {
    //                         $filter: {
    //                             input: `$data`,
    //                             as: `item`,
    //                             cond: regexMatches
    //                         }
    //                     }
    //                 }
    //             }]
    //         ).toArray()

    //         const endTime = new Date()
    //         console.log(`FILTING DATA IN ${ endTime - startTime }`)

    //         let indexCounter = 0
    //         for( let i = 0 ; i < filtedData.length ; i++ ){
    //             const { data } = filtedData[i]
    //             if( require_count ){
    //                 count += data.length;                  

    //                 indexCounter += data.length;

    //                 if(start - indexCounter < 0 && result.length < RESULT_PER_SEARCH_PAGE ){
    //                     result.push( ...data.slice( start, start + RESULT_PER_SEARCH_PAGE ) )
    //                     start -= result.length
    //                 }
    //             }else{                    
    //                 if(result.length == RESULT_PER_SEARCH_PAGE){
    //                     break;
    //                 }else{
    //                     indexCounter += data.length;

    //                     if(start - indexCounter < 0 && result.length < RESULT_PER_SEARCH_PAGE ){
    //                         result.push( ...data.slice( start, start + RESULT_PER_SEARCH_PAGE ) )
    //                         start -= result.length
    //                     }
    //                 }
    //             }
    //         }             

    //         let calculateData = result
    //         const calculates = this.API.calculates.valueOrNot();

    //         if (calculates.length > 0) {
    //             calculateData = calculateData.map(record => {
    //                 const calculateValue = {};
    //                 const keys = Object.keys(record)
    //                 keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
    //                 for (let i = 0; i < calculates.length; i++) {
    //                     const { fomular_alias, fomular } = calculates[i]
    //                     let result = fomular;
    //                     keys.map(key => {
    //                         /* replace the goddamn fomular with its coresponding value in record values */
    //                         result = result.replaceAll(key, record[key])
    //                     })
    //                     try {
    //                         calculateValue[fomular_alias] = eval(result)
    //                     } catch {
    //                         calculateValue[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
    //                     }
    //                 }
    //                 return { ...record, ...calculateValue }
    //             })
    //         }

    //         this.res.send({
    //             success: true,
    //             total: calculateData.length,
    //             result: calculateData,
    //             fields: [...fields, ...calculates],
    //             data: calculateData,
    //             count: count
    //         })
    //     } else {
    //         this.req.body = {
    //             table_id: table.id,
    //             start_index: 0,
    //             criteria: {},
    //             require_count: false,
    //             exact: false,
    //             api_id: undefined
    //         }
    //         this.FOREIGNDATA(this.req, this.res)
    //     }
    // }

    hasEnoughPrivileges = (tables, rights, privileges) => {

        if (tables.length && tables.length > 0) {

            let isGranted = true;
            for (let i = 0; i < tables.length; i++) {
                const table_id = tables[i].id;
                const tablePrivileges = privileges.filter(pri => pri.table_id == table_id)

                for (let j = 0; j < tablePrivileges.length; j++) {

                    const privilege = tablePrivileges[j]
                    for (let h = 0; h < rights.length; h++) {
                        const right = rights[h]
                        console.log(tables[i].table)
                        console.log(privilege[right])
                        console.log(privilege)
                        console.log(right)
                        if (!privilege[right]) {
                            isGranted = false
                        }
                    }
                }
            }

            return isGranted
        } else {
            return false
        }
    }

    FOREIGNDATA = async (req, res) => {
        this.writeReq(req)

        const verified = await this.verifyToken(req)

        if (verified) {
            const user = this.decodeToken(req.header("Authorization"))
            const { table_id, start_index, criteria, require_count, exact, api_id } = req.body;
            const [tables, fields, privileges] = await Promise.all([
                this.#__tables.findAll(),
                this.#__fields.findAll(),
                this.#__privileges.findAll({ username: user.username })
            ])

            const table = tables.find(tb => tb.id == table_id)

            if (table && req.method.toLowerCase() == "post") {
                // console.log(3220, privileges)
                const tbFields = fields.filter(f => f.table_id == table_id)

                let api = await this.#__apis.find({ api_id })
                if (api == undefined) {
                    api = {
                        id: undefined,
                        api_id: undefined,
                        api_name: undefined,
                        tables: [table.id],
                        fields: tbFields.map(field => {
                            return { id: field.id, display_name: field.field_name, fomular_alias: field.fomular_alias }
                        }),
                        body: tbFields.map(field => field.id),
                        params: table.primary_key,
                    }
                }

                const api_table = tables.find(tb => tb.id == api.tables[0])
                console.log()
                let isGranted = this.hasEnoughPrivileges([api_table], ["read"], privileges)

                if (this.isAdmin(user) || isGranted) {

                    const Api = new ApisRecord(api)
                    this.API = Api
                    this.req = req
                    this.res = res

                    this.fields = fields;
                    this.tables = tables.map(table => {
                        const { id } = table;
                        table.fields = fields.filter(field => field.table_id == id)
                        return table
                    });

                    if (!criteria || objectComparator(criteria, {})) {

                        this.API.params.value([])
                        this.GET_UI(start_index)
                    } else {
                        this.req.body = { query: criteria, start_index, require_count, exact }
                        this.SEARCH()
                    }
                } else {
                    res.status(200).send({ success: false, content: "Không có quyền truy cập API này" })
                }

            } else {
                res.status(200).send({ success: false, content: "No TABLE Found" })
            }
        } else {
            res.status(200).send({ success: false, content: "Token không hợp lệ" })
        }
    }

    EXPORT_CSV = async () => {

        const start = new Date()
        const { criteria, export_fields } = this.req.body
        const EXPORTER = "Khánh Chi Nè"
        const tables = this.tearTablesAndFieldsToObjects()

        const table = tables[0]
        let fields = this.fields.filter(field => field.table_id == table.id)

        if (export_fields != undefined && export_fields.length > 0) {
            const rawFields = export_fields.map(alias => this.fields.find(field => field.fomular_alias == alias)).filter(field => field != undefined)

            if (rawFields.length > 0) {
                fields = rawFields
            } else {
                fields = []
            }
        }

        const calculates = this.API.calculates.valueOrNot()
        const keys = fields.map(field => field.fomular_alias)
        keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

        if (fields.length != 0) {

            const csvHeaders = [...fields.map(field => field.field_name), ...calculates.map(cal => cal.display_name)]
            const csvData = []
            csvData.push(csvHeaders);
            const cache = await Cache.getData(`${table.table_alias}-periods`)
            const periods = cache.value

            if (criteria == undefined || objectComparator(criteria, {})) {

                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i]
                    const { position } = period;
                    const data = await Database.selectAll(table.table_alias, { position })
                    csvData.push(...data.map(record => {
                        const tmp = {}
                        fields.map(field => {
                            tmp[field.fomular_alias] = record[field.fomular_alias]
                        })

                        calculates.map(calc => {
                            const { fomular, fomular_alias } = calc;
                            let result = fomular;
                            keys.map(key => { result = result.replaceAll(key, record[key]) })

                            try {
                                tmp[fomular_alias] = eval(result)
                            } catch {
                                tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`
                            }
                        })

                        return Object.values(tmp)
                    }))
                }
            } else {
                const keys = Object.keys(criteria)
                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i]
                    const { position } = period;
                    const data = await Database.select(table.table_alias, { position })
                    for (let j = 0; j < data.length; j++) {
                        const record = data[j]
                        delete record.id;
                        delete record.position
                        let isValid = true
                        keys.map(key => {
                            if (record[key] != undefined && criteria[key] != undefined) {
                                const recordProp = translateUnicodeToBlanText(record[key].toString().toLowerCase())
                                const value = translateUnicodeToBlanText(criteria[key].toString().toLowerCase())

                                if (!recordProp.includes(value)) {
                                    isValid = false
                                }
                            } else {
                                isValid = false
                            }
                        })
                        if (isValid) {
                            const tmp = {}
                            fields.map(field => {
                                tmp[field.fomular_alias] = record[field.fomular_alias]
                            })

                            calculates.map(calc => {
                                const { fomular, fomular_alias } = calc;
                                let result = fomular;
                                keys.map(key => { result = result.replaceAll(key, record[key]) })

                                try {
                                    tmp[fomular_alias] = eval(result)
                                } catch {
                                    tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`
                                }
                            })

                            csvData.push(Object.values(tmp))
                        }

                    }
                }
            }

            const csvString = await fastcsv.writeToString(csvData, { headers: false, quoteColumns: true });
            const end = new Date()

            this.res.setHeader('Content-Type', 'text/csv; charset=ANSI');
            this.res.setHeader('Content-Disposition', 'attachment; filename=data.csv');

            this.res.send(csvString);
        } else {
            this.res.send({ success: false, content: "No fields found!" })
        }
    }




    EXPORT_EXCEL = async () => {
        function styleHeaders(ws) {
            const headerStyle = {
                fill: {
                    fgColor: { rgb: "008000" }
                },
                font: {
                    bold: true,
                    color: { rgb: "fffffff" }
                }
            };

            const colNum = XLSX.utils.decode_range(ws['!ref']).e.c + 1;
            for (let i = 0; i < colNum; ++i) {
                const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
                if (ws[cellRef]) {
                    ws[cellRef].s = headerStyle;
                }
            }
        }

        const start = new Date()
        const { criteria, export_fields } = this.req.body
        const tables = this.tearTablesAndFieldsToObjects()

        const table = tables[0]
        let fields = this.fields.filter(field => field.table_id == table.id)
        const tableFields = fields
        if (export_fields != undefined && export_fields.length > 0) {
            const rawFields = export_fields.map(alias => this.fields.find(field => field.fomular_alias == alias)).filter(field => field != undefined)

            if (rawFields.length > 0) {
                fields = rawFields
            } else {
                fields = []
            }
        }
        const selectedHeaders = fields;
        const headerRow = selectedHeaders.reduce((obj, header) => ({ ...obj, [header.fomular_alias]: header.field_name }), {});

        const calculates = this.API.calculates.valueOrNot()

        calculates.map(calc => {
            const { fomular_alias, display_name } = calc
            headerRow[fomular_alias] = display_name
        })
        const newCsvData = [
            headerRow
        ];

        const keys = tableFields.map(field => field.fomular_alias)
        keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

        const splittedData = []
        if (fields.length != 0) {
            const cache = await Cache.getData(`${table.table_alias}-periods`)
            const periods = cache.value
            if (criteria == undefined || objectComparator(criteria, {})) {

                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i]
                    const { position } = period;
                    const data = await Database.selectAll(table.table_alias, { position })
                    newCsvData.push(...data.map(record => {
                        const tmp = {}
                        fields.map(field => { tmp[field.fomular_alias] = record[field.fomular_alias] })

                        calculates.map(calc => {
                            const { fomular, fomular_alias } = calc;
                            let result = fomular;
                            keys.map(key => { result = result.replaceAll(key, record[key]) })

                            try {
                                tmp[fomular_alias] = eval(result)
                            } catch {
                                tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`
                            }
                        })

                        return tmp
                    }))
                }
            } else {
                const keys = Object.keys(criteria)
                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i]
                    const { position } = period;

                    const data = await Database.selectAll(table.table_alias, { position })

                    for (let j = 0; j < data.length; j++) {
                        const record = data[j]
                        delete record.id;
                        delete record.__position__
                        let isValid = true
                        keys.map(key => {
                            if (record[key] != undefined && criteria[key] != undefined) {
                                const recordProp = translateUnicodeToBlanText(record[key].toString().toLowerCase())
                                const value = translateUnicodeToBlanText(criteria[key].toString().toLowerCase())

                                if (!recordProp.includes(value)) {
                                    isValid = false
                                }
                            } else {
                                isValid = false
                            }
                        })
                        if (isValid) {
                            const tmp = {}
                            fields.map(field => {
                                tmp[field.fomular_alias] = record[field.fomular_alias]
                            })

                            calculates.map(calc => {
                                const { fomular, fomular_alias } = calc;
                                let result = fomular;
                                keys.map(key => { result = result.replaceAll(key, record[key]) })

                                try {
                                    tmp[fomular_alias] = eval(result)
                                } catch {
                                    tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`
                                }
                            })
                            const finalResult = {}
                            const finaleFields = [...fields, ...calculates]
                            finaleFields.map(field => {
                                finalResult[field.fomular_alias] = tmp[field.fomular_alias]
                            })
                            newCsvData.push(finalResult)
                        }
                    }

                }
            }
            const ws = XLSX.utils.json_to_sheet(newCsvData, { skipHeader: true });

            styleHeaders(ws);


            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, table.table_name);

            const statistics = this.API.statistic.valueOrNot()
            const statisData = []
            const sumerize = await Database.select(table.table_alias, { position: "sumerize" })

            for (let i = 0; i < statistics.length; i++) {
                const statis = statistics[i]
                const { display_name, fomular_alias, fomular, group_by } = statis;
                const statisRecord = { display_name }
                if (group_by && group_by.length > 0) {
                    const rawData = sumerize[fomular_alias]
                    if (rawData != undefined) {
                        if (fomular == "AVERAGE") {
                            const headers = Object.keys(rawData)
                            const values = Object.values(rawData).map(({ total, value }) => value)

                            statisRecord["data"] = { headers, values }
                            statisRecord["type"] = "table"
                        } else {
                            const headers = Object.keys(rawData)
                            const values = Object.values(rawData)
                            statisRecord["data"] = { headers, values }
                            statisRecord["type"] = "table"
                        }
                    }
                } else {
                    statisRecord["type"] = "text"
                    statisRecord["data"] = sumerize[fomular_alias]
                }
                statisData.push(statisRecord)
            }

            for (let i = 0; i < statisData.length; i++) {
                const { type, data, display_name } = statisData[i]
                if (type == "table") {
                    const { headers, values } = data;
                    const recordsData = [{
                        key: "Tiêu chí",
                        value: "Kết quả"
                    }]
                    headers.map((header, index) => {
                        const record = {
                            ["key"]: header,
                            ["value"]: values[index]
                        }
                        recordsData.push(record)
                    })
                    const ws = XLSX.utils.json_to_sheet(recordsData, { skipHeader: true });
                    styleHeaders(ws);
                    XLSX.utils.book_append_sheet(wb, ws, display_name.slice(0, 30));
                } else {

                    const recordsData = [{
                        key: "Tiêu chí",
                        value: "Kết quả"
                    }, {
                        key: display_name,
                        value: data
                    }]
                    const ws = XLSX.utils.json_to_sheet(recordsData, { skipHeader: true });
                    styleHeaders(ws);
                    XLSX.utils.book_append_sheet(wb, ws, display_name.slice(0, 30));
                }
            }

            const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

            this.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            this.res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');

            this.res.send(buffer);
        } else {
            this.res.send({ success: false, content: "No fields found!" })
        }
    }

    FormingImportData = async (record, autoID) => {
        const { table, import_fields, primaryFields, primaryKeys, foreignKeys } = this;
        const { table_alias } = table;
        const data = record
        const body = import_fields
        for (let j = 0; j < body.length; j++) {
            const field = body[j]

            const { fomular_alias } = field;
            const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;
            if (record[fomular_alias] != undefined) {
                const primaryKey = primaryKeys.find(key => key == id)
                if (primaryKey) {
                    const foreignKey = foreignKeys.find(key => key.field.id == id)
                    if (foreignKey) {
                        data[fomular_alias] = record[fomular_alias]
                    } else {
                        if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                            data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN, autoID)
                        } else {
                            data[fomular_alias] = record[fomular_alias]
                        }
                    }
                }
            } else {
                if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                    const foreignKey = foreignKeys.find(key => key.field_id == id)
                    if (foreignKey) {
                        const foreignField = this.getField(foreignKey.ref_field_id);
                        const foreignTable = this.getTable(foreignField.table_id);
                        data[fomular_alias] = await this.makeAutoIncreament(foreignTable.table_alias, PATTERN, autoID)
                    } else {
                        data[fomular_alias] = await this.makeAutoIncreament(table_alias, PATTERN, autoID)
                    }
                } else {
                    data[fomular_alias] = record[fomular_alias]
                }
            }
        }
        return record
    }

    DATA_VALIDATION = async () => {

        const start = new Date()
        const data = this.req.body.data ? this.req.body.data : []
        const tables = this.tearTablesAndFieldsToObjects()
        const table = tables[0]

        const { fields, primary_key, foreign_keys, table_alias } = table
        this.import_fields = this.getFieldsByTableId(table.id);
        this.primaryKeys = primary_key
        this.primaryFields = this.getFields(primary_key)
        this.table = table
        const rawIndices = []

        if (data.length > 0) {
            const keys = Object.keys(data[0])
            const fields = this.getFieldsByTableId(table.id);
            const fieldAliases = fields.map(field => field.fomular_alias)

            let areAllAliasesEquivalent = true;
            for (let i = 0; i < keys.length; i++) {
                if (fieldAliases.indexOf(keys[i]) == -1) {
                    areAllAliasesEquivalent = false;
                }
            }

            if (areAllAliasesEquivalent) {

                for (let i = 0; i < data.length; i++) {
                    rawIndices.push(i)
                }

                this.foreignKeys = foreign_keys.map(key => {
                    const { field_id, table_id, ref_field_id } = key;
                    const table = this.getTable(table_id)
                    const [field] = this.getFields([field_id])
                    const [refField] = this.getFields([ref_field_id])
                    return { table, field, refField }
                })

                const formedData = await Promise.all(data.map((record, index) => this.FormingImportData(record, index)))

                const primaryDataSet = formedData.map(record => {
                    const primaryQuery = {}
                    this.primaryFields.map(field => {
                        primaryQuery[field.fomular_alias] = record[field.fomular_alias]
                    })
                    return primaryQuery
                })

                // PRIMARY KEY CHECK

                const primaryData = await Database.selectAll(table.table_alias, { $or: primaryDataSet })
                const serializedPrimaryData = {}
                primaryData.map(record => {
                    const key = this.primaryFields.map(field => record[field.fomular_alias]).join('')
                    serializedPrimaryData[key] = record
                })
                // FOREIGN KEYS CHECK

                const serializedForeignData = {}
                for (let i = 0; i < foreign_keys.length; i++) {
                    const master = foreign_keys[i]
                    const { table_id, field_id, ref_field_id } = master;
                    const masterTable = this.getTable(table_id)
                    const field = this.getField(field_id)
                    const refField = this.getField(ref_field_id)

                    const foreignDataSet = formedData.map(record => record[field.fomular_alias])
                    const foreignData = await Database.selectAll(masterTable.table_alias, { [refField.fomular_alias]: { $in: foreignDataSet } })
                    const serialized = {}
                    foreignData.map(record => {
                        delete record._id
                        serialized[record[refField.fomular_alias]] = record
                    })

                    serializedForeignData[masterTable.table_alias] = serialized
                }

                const checkedData = []

                for (let i = 0; i < formedData.length; i++) {
                    let record = formedData[i]
                    record.errors = { primary: false, foreign: [], duplicate: false, type: [] }

                    for (let j = 0; j < fields.length; j++) {
                        const field = fields[j]
                        const check = this.parseType(field, record[field.fomular_alias])
                        const { valid, result, reason } = check;
                        if (valid) {
                            record[field.fomular_alias] = result;
                        } else {
                            record.errors.type.push(field.fomular_alias)
                        }
                    }

                    if (record.errors.type.length == 0) {

                        let cloneCheckData = [...checkedData]
                        for (let j = 0; j < this.primaryFields.length; j++) {
                            const field = this.primaryFields[j]
                            cloneCheckData = cloneCheckData.filter(row => row[field.fomular_alias] == record[field.fomular_alias])
                        }

                        if (cloneCheckData.length > 0) {
                            record.errors.duplicate = true
                        } else {
                            const corespondingPrimaryKey = this.primaryFields.map(field => record[field.fomular_alias]).join('')
                            const corespondingPrimaryData = serializedPrimaryData[corespondingPrimaryKey]

                            if (corespondingPrimaryData) {
                                record.errors.primary = true
                            } else {

                                for (let j = 0; j < this.foreignKeys.length; j++) {
                                    const { table, field, refField } = this.foreignKeys[j]

                                    const corespondingForeignData = serializedForeignData[table.table_alias][record[field.fomular_alias]]
                                    if (corespondingForeignData) {
                                        record = { ...record, ...corespondingForeignData }
                                    } else {
                                        record.errors.foreign.push(field.fomular_alias)
                                    }
                                }
                            }
                            checkedData.push(record)
                        }
                    }
                    /** CHECK KEYS AND FILL ERRORS */
                    delete record.position
                    formedData[i] = record
                }

                this.res.send({ success: true, data: formedData })
            } else {
                this.res.send({ success: false })
            }
        } else {
            this.res.send({ success: false, data: [] })
        }

    }

    IMPORT = async () => {
        const start = new Date()

        const { data } = this.req.body;
        const tables = this.tearTablesAndFieldsToObjects()
        const table = tables[0]
        const fields = this.getFieldsByTableId(table.id);
        if (data && data.length > 0) {
            // if ( false ) {

            data.map(record => {
                delete record.errors;
                fields.map(field => {
                    const { valid, result } = this.parseType(field, record[field.fomular_alias])
                    if (valid) {
                        record[field.fomular_alias] = result;
                    } else {
                        record[field.fomular_alias] = "NULL";
                    }
                })
            })

            let cache = await Cache.getData(`${table.table_alias}-periods`)
            if (!cache) {
                cache = {
                    key: `${table.table_alias}-periods`,
                    value: []
                }
                await Cache.setData(`${table.table_alias}-periods`, [])
            }

            const periods = cache.value
            const sumerizes = await Database.selectAll(table.table_alias, { position: "sumerize" })

            let sumerize = sumerizes[0];

            if (!sumerize) {
                sumerize = {
                    position: "sumerize",
                    total: 0
                }
                await Database.insert(table.table_alias, sumerize)
            }

            const positions = []
            for (let j = 0; j < periods.length; j++) {
                const { position, total } = periods[j]

                if (total < TOTAL_DATA_PER_PARTITION) {
                    const amount = TOTAL_DATA_PER_PARTITION - total;
                    for (let h = 0; h < amount; h++) {
                        positions.push(position)
                        periods[j].total += 1
                        if (positions.length >= data.length) {
                            break;
                        }
                    }
                }
            }

            if (positions.length < data.length) {
                const newPartition = this.translateColIndexToName(periods.length)
                const amount = data.length - positions.length;
                for (let i = 0; i < amount; i++) {
                    positions.push(newPartition)
                }

                const newPeriods = {
                    position: newPartition,
                    total: amount
                }
                periods.push(newPeriods)
            }

            data.map((record, index) => {
                record.position = positions[index]
            })
            await Database.insertMany(table.table_alias, data)
            await Cache.setData(`${table.table_alias}-periods`, periods)

            sumerize.total += data.length

            // console.log(sumerize)

            const calculates = this.API.calculates.valueOrNot()
            const statistics = this.API.statistic.valueOrNot()




            if (calculates.length > 0) {
                const keys = Object.keys(data[0])
                keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                for (let i = 0; i < calculates.length; i++) {
                    const { fomular, fomular_alias } = calculates[i]

                    data.map(record => {
                        let result = fomular;

                        keys.map(key => { result = result.replaceAll(key, record[key]) })

                        try {
                            record[fomular_alias] = eval(result)
                        } catch {
                            record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`
                        }
                    })
                }
            }
            if (statistics.length > 0) {
                for (let i = 0; i < statistics.length; i++) {
                    const { fomular_alias, field, group_by, fomular } = statistics[i]
                    for (let h = 0; h < data.length; h++) {

                        const stringifyGroupKey = group_by.map(group => data[h][group]).join("_")
                        const statisField = sumerize[fomular_alias];

                        if (!statisField) {
                            if (group_by.length > 0) {
                                sumerize[fomular_alias] = {}
                            } else {
                                sumerize[fomular_alias] = 0
                            }
                        }

                        if (fomular == "SUM") {

                            if (group_by.length > 0) {
                                if (sumerize[fomular_alias][stringifyGroupKey] == undefined) {
                                    sumerize[fomular_alias][stringifyGroupKey] = 0
                                }
                                sumerize[fomular_alias][stringifyGroupKey] += data[h][field]
                            } else {
                                sumerize[fomular_alias] += data[h][field]
                            }
                        }

                        if (fomular == "AVERAGE") {
                            if (typeof (data[h][field]) == "number") {
                                if (group_by && group_by.length > 0) {

                                    if (!sumerize[fomular_alias][stringifyGroupKey]) {
                                        sumerize[fomular_alias][stringifyGroupKey] = {
                                            value: data[h][field],
                                            total: 1
                                        }
                                    } else {
                                        sumerize[fomular_alias][stringifyGroupKey].value = (sumerize[fomular_alias][stringifyGroupKey].value * sumerize[fomular_alias][stringifyGroupKey].total + data[h][field]) / (sumerize[fomular_alias][stringifyGroupKey].total + 1)
                                        sumerize[fomular_alias][stringifyGroupKey].total += 1
                                    }
                                } else {
                                    sumerize[fomular_alias] = (sumerize[fomular_alias][stringifyGroupKey] * sumerize.total + data[h][field]) / (sumerize.total + 1)
                                }
                            }
                        }

                        if (fomular == "COUNT") {
                            if (group_by.length > 0) {
                                if (sumerize[fomular_alias][stringifyGroupKey] == undefined) {
                                    sumerize[fomular_alias][stringifyGroupKey] = 0
                                }
                                sumerize[fomular_alias][stringifyGroupKey] += 1
                            } else {
                                sumerize[fomular_alias] += 1
                            }
                        }
                    }
                }
            }

            await Database.update(table.table_alias, { position: "sumerize" }, { ...sumerize })
            const auto_id = await Database.getAutoIncrementId(`${table.table_alias}-id`)
            await Database.update("auto_increment_collection", { name: `${table.table_alias}-id` }, { id: auto_id + data.length })
            this.res.send({ success: true })

        } else {
            this.res.send({ success: false })
        }
    }
}


module.exports = ConsumeApi
