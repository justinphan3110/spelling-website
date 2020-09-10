const mongooes = require('mongoose');
const ObjectId =  mongooes.Schema.ObjectId;
require('dotenv/config');


const wikiSchema = mongooes.Schema({
    _id: Number,
    text: {
        type:String,
        require:true,
    },
    
    is_checked:Boolean,

    current_id: {
        type:Number,
        require:true
    },
    parent_id: {
        type:Number,
        require:true
    },
    page_id : {
        type:Number,
        require:true
    },
    mistake: [{
        text : String,
        start_offset : Number,
        score: Number,
        suggest: { type : Array , "default" : [] }}]
}, {versionKey: false});

module.exports = mongooes.model('wiki', wikiSchema, process.env.WIKI_DOCUMENT_COLLECTION);
