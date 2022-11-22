const express = require('express');
var bodyParser = require('body-parser');

const route = require('./routes/route.js');
const mongoose  = require('mongoose');

const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://Project-3:uuNLzFWJfFFOifv8@cluster0.zojbu9p.mongodb.net/group2Database?retryWrites=true&w=majority"
, {
   useNewUrlParser: true 
}
).then( () => {console.log("MongoDb is connected")})
.catch( err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
