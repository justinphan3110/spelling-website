const express = require('express');
const app = express();
const mongoose = require('mongoose');
const wikiRoute = require('./routes/wikiRoute'); 
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

//Middlewares
app.use(bodyParser.json());
app.use(cors());

// Listtening on PORT 3002
app.listen(process.env.PORT);

// Route
app.use('/wiki', wikiRoute);



mongoose.connect(
    process.env.DB_CONNECTION, 
    { useNewUrlParser: true, useUnifiedTopology: true}, 
    () => console.log('connected to MongoDB!')
);

