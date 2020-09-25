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

// Get all checked Documents
router.get('/checkedDocuments', async (req, res) => {
    console.log("here")
    try{
        const queryResults = await wiki.find({is_checked: true});
        console.log(queryResults.length)
        var countMistakes = 0;
        queryResults.forEach(r => {
            countMistakes = countMistakes + r.mistakes.length
        })
        res.json({"countDocs": queryResults.length, "countMistakes": countMistakes});
    }catch(err){
        // res.json({message:e});
        console.log(err)
    }
})

// Get documents by id 
router.get('/id/:id', async(req, res) => {
    const id = req.params.id;
    
    // each page has 50 docs
    try{
        // const queryResult = await wiki.find({'is_checked': false}).where('_id').in(ids).exec();
        const queryResult = await wiki.find({'_id': id})
        console.log("get page id " + id)
        res.json(queryResult);
    }catch (err) {
        res.json({message: err});
    }
});

// Get documents by page 
router.get('/:page', async(req, res) => {
    const page = req.params.page;
    const pageLimit = parseInt(process.env.PAGE_LIMIT);
    console.log("pageLimit: " + pageLimit);
    
    // each page has 50 docs
    const ids = range(page * pageLimit - pageLimit + 1, page * pageLimit + 1);
    try{
        // const queryResult = await wiki.find({'is_checked': false}).where('_id').in(ids).exec();
        const queryResult = await wiki.find({'is_checked': false}).skip((page - 1) * pageLimit).limit(pageLimit)
        console.log("get page " + page)
        res.json(queryResult);
    }catch (err) {
        res.json({message: err});
    }
});

router.post('/check/:docID', async (req,res) => {
    const docID = req.params.docID;
    var data = req.body
    // data.is_checked = true
    // console.log(data);
    
    try {
        var query = {'_id': docID};
        const removed = await wiki.deleteOne({
            _id: docID
        });


        const newData = new wiki(data)
        const result = await newData.save()
        console.log("inserted " + result)

        console.log("update checked " + docID);
        res.json(result)
    }catch (err) {
        res.json({message: err});
    }

})


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