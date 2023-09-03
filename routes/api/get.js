const express = require("express")
const router = express.Router()

const ApiControllerClass = require("../../controllers/Version/Api")
const ConsumeApiClass = require("../../controllers/ConsumeApi");
const ConsumeApi = new ConsumeApiClass()

const ApiController = new ApiControllerClass()


router.get('/api/:api_id/input_info', async (req, res) => { await ApiController.getApiInputInfo( req, res ) })
router.get('/field/autoid/:field_id', async (req, res) => { await ApiController.getAutoIncrementID(req, res) })
router.get('/table/:table_id/data', async (req, res) => { await ApiController.getForeignData(req, res) })
router.get('/retrieve/:api_id/*', async ( req, res ) => { await ConsumeApi.retrievePutData(req, res) })
router.get('/all/tables/and/fields', async ( req, res ) => { await ApiController.getAllTablesAndFields(req, res) })

router.get('/get/ui', (req, res) => { ApiController.getUI( req, res ) })

module.exports = router;