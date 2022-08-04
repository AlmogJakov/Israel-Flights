const db = require('./connectRedis');

// DB keys
const keys = ["join", "service", "complaint", "leave", "waiting","averageTime","Jerusalem",
                "Nahariya","Haifa","Tel_Aviv","Ashdod","Ashkelon","Beer_Sheva"];


// data expiration time 
const todayEnd = new Date().setHours(23, 59, 59, 999);

const redisDB = {

    //Delete all keys in end of the day
    setExpiresTime: function () {
        keys.forEach(element => {
            if(db.exists(element)){
                // sets an expiration date for the data 
                db.expireat(element, parseInt(todayEnd / 1000));
            }
        });
        console.log('set an expiration date!'); 
    },

    //Init all keys
    initDB: async function() {
        keys.forEach(key => {
            db.set(key, 0);
        });
        console.log('initDB');
    },

    //Increase valus of specific key
    incrementByOne: async function(key){
        
        try {
            // check if the key exists
            const exists = await db.exists(key);

            if(!exists) {
               // init the key and increaments
               await db.set(key, 1);  
               console.log(`updated ${key} number: ` + 1);
            
            }

            else { //exists
                // gets the data
                let value = await db.get(key);
        
                // increments and stores the updated data in the database
                await db.set(key, ++value);
                console.log(`updated ${key} number: ${value}`);
            }
        
        } catch (error) {
            console.log(error);
        }
    },

    //Set number of waiting calls
    setWaiting: async function(key, value){
        try {
            // stores the data in the database
            await db.set(key, value);
            console.log(`updated ${key} number: ${value}`);
        
        } catch (error) {
            console.log(error);
        }
    },

    //Increase number of specific topic / Set number of waiting calls
    setTopic: async function(topic, value) {
        // we can refactor this
        switch(topic) {
            case 'join':
                await this.incrementByOne('join');
                break;
            case 'service':
                await this.incrementByOne('service');
                break;
            case 'complaint':
                await this.incrementByOne('complaint');
                break;
            case 'leave':
                await this.incrementByOne('leave');
                break;
            case 'TotalWaiting':
                await this.setWaiting('waiting', value);
                break;
            default:
                console.log('invalid topic');
                break;
            }
    },
    
    //Increase value of specific city
    setCity: async function (city){
        switch(city) {
            case 'Jerusalem':
                await this.incrementByOne('Jerusalem');
                break;
            case 'Nahariya':
                await this.incrementByOne('Nahariya');
                break;
            case 'Haifa':
                await this.incrementByOne('Haifa');
                break;
            case 'Tel-Aviv':
                await this.incrementByOne('Tel_Aviv');
                break;
            case 'Ashdod':
                await this.incrementByOne('Ashdod');
                break;
            case 'Ashkelon':
                await this.incrementByOne('Ashkelon');
                break;
            case 'Beer-Sheva':
                await this.incrementByOne('Beer_Sheva');
                break;
            default:
                console.log('invalid City');
                break;
            }
    },

    getAllData: async function() {
        let allData = [];

        //Topic + waiting
        allData.push(await db.get('join'));
        allData.push(await db.get('service'));
        allData.push(await db.get('complaint'));
        allData.push(await db.get('leave'));
        allData.push(await db.get('waiting'));

        //Cities
        allData.push(await db.get('Jerusalem'));
        allData.push(await db.get('Nahariya'));
        allData.push(await db.get('Haifa'));
        allData.push(await db.get('Tel_Aviv'));
        allData.push(await db.get('Ashdod'));
        allData.push(await db.get('Ashkelon'));
        allData.push(await db.get('Beer_Sheva'));
        
        console.log("Get all data from Redis!");
        return allData;
    },
    
    setAverageTime: async function(totaltime) {
        // check if the key exists
        const exists = await db.exists("averageTime");

        //First time / After init
        if(!exists) {
            // init the key
            db.set("averageTime", 0);  

            //Reset each 10 minutes
            setTimeout(db.set("averageTime", 0), 600000);

            //Reset each 1 hour;
            setTimeout(db.set("averageTimePerHour", 0), 6000000);
        }
        
        //Current time is in seconds
        let value = await db.get("averageTime");
        await db.set("averageTime", value + totaltime);

    },

    getAverageTime: async function() {
        // check if the key exists
        const exists = await db.exists("averageTime");

        if(!exists) {
            // init the key
            return 0; 
        }
       
        let totalTime = await db.get("averageTime");
        let calls = parseInt(await db.get("join")) + parseInt(await db.get("service")) + 
                    parseInt(await db.get("complaint")) + parseInt(await db.get("leave"));
        
        return ((parseInt(totalTime)/calls)).toFixed(3); //In minutes
    },
}

module.exports = redisDB;