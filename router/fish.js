const router = require("express").Router()
const invoke = require("../tools/invoke")
const query = require("../tools/query")
router.post("/record",(req,res,next) => {
    let data = req.body
    data.channelId = "mychannel"
    data.chaincodeId = "181011"
    data.fcn = "recordFish"
    invoke(data,() => {
        res.success()
    },msg => {
        res.fail(msg)
    })
})
router.post("/query",(req,res,next) => {
    let data = req.body
    data.channelId = "mychannel"
    data.chaincodeId = "181011"
    data.fcn = "queryFish"
    query(data,r => {
        res.success(r)
    },msg => {
        res.fail(msg)
    })
})
router.post("/transfer",(req,res,next) => {
    let data = req.body
    data.channelId = "mychannel"
    data.chaincodeId = "181011"
    data.fcn = "transferFish"
    invoke(data,() => {
        res.success()
    },msg => {
        res.fail(msg)
    })
})
router.post("/queryrange",(req,res,next) => {
    let data = req.body
    data.channelId = "mychannel"
    data.chaincodeId = "181011"
    data.fcn = "queryFishByRange"
    query(data,r => {
        res.success(r)
    },msg => {
        res.fail(msg)
    })
})
module.exports = router
