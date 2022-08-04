const fs = require('fs'); 
const Json2csvParser = require("json2csv").Parser;
const Collection = require('./schemaTable')

const MongoDB = {
    
    saveDetailCall: function (msg) {
        const call = new Collection(JSON.parse(msg.value));
        //Enter call details to DB
        call.save().then(() => console.log("Inserted to MongoDB"))
        .catch((err) => console.log(err));
    },
    export2csv: async function () {
        Collection.find({},{_id:0}).lean().exec((err, data) => {
            if (err) throw err;
            const csvFields = ['id','firstName','lastName','phone','city', 'gender', 'age','prevCalls','totalTime','product', 'period','topic']
            console.log(csvFields);
            const json2csvParser = new Json2csvParser({
                csvFields
            });
            const csvData = json2csvParser.parse(data);
            fs.writeFile("callDetails.csv", csvData, function(error) {
                if (error) throw error;
                console.log("Write to callDetails.csv successfully!");
            });
        });
    }
}

module.exports = MongoDB;
