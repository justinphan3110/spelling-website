const express = require('express');
const router = express.Router();
require('dotenv/config');


const wiki = require('../models/WikiModel');



// GET All the documents
router.get('/', async (req, res) => {
    console.log("here")
    try{
        const queryResults = await wiki.find();
        console.log(queryResults)
        res.json(queryResults);
    }catch(err){
        res.json({message:"error"});
    }
})

function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
}

// Get documents by page 
router.get('/:page', async(req, res) => {
    const page = req.params.page;
    const pageLimit = parseInt(process.env.PAGE_LIMIT);
    // each page has 50 docs
    const ids = range(page * pageLimit - pageLimit + 1, page * pageLimit + 1);
    // console.log(ids)
    try{
        const queryResult = await wiki.find().where('_id').in(ids).exec();
        console.log(queryResult)
        res.json(queryResult);
    }catch (err) {
        res.json({message: err});
    }
});


router.delete('/:docId', async (req, res) => {
    console.log("delete docId " + req.params.docId)
    try {
        const removed = await wiki.deleteOne({
            _id: req.params.docId
        });

        res.json(removed);
    }catch (err){
        res.json({message: err});
    }
});


module.exports = router; 