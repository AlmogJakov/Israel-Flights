const mysql = require('mysql');
const {faker} = require("@faker-js/faker");

//Connect to MySQL DB
// var connection = mysql.createConnection({
//     //Properties
//     host: 'localhost',
//     user: 'root',
//     password: 'OfirOfir1996!',
//     port: '3306',
//     database: 'big_data'
// });

var connection = mysql.createConnection({
  //Properties
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'big_data'
});


//Function to create fake details person
const randomPerson = () => {
    let id = Math.floor(Math.random() * 1000000000);
    let firstName = faker.name.firstName();
    let lastName = faker.name.lastName();
    let phone = faker.phone.phoneNumber();
    let city = ['Jerusalem', 'Nahariya', 'Haifa', 'Tel-Aviv', 'Ashdod', 'Ashkelon', 'Beer-Sheva'];
    const randomCity = city[Math.floor(Math.random() * city.length)];
    let gender = ['Female','Male'];
    let randomGender = gender[Math.floor(Math.random() * gender.length)];
    let age = Math.floor(Math.random() * 100) + 18;

    let person = {id,firstName,lastName,phone,randomCity,randomGender,age};
    return person;
}

// // Insert fake details person to DB (Table - users)
// connection.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");

//     for (let i = 0; i < 5; i++) {

//         let person = randomPerson();
//         //Query of MySQL
//         var sql = `INSERT INTO users (id, first_name,last_name,phone,city,gender,age,prev_calls) 
//             VALUES (${person.id},'${person.firstName}','${person.lastName}','${person.phone}','${person.randomCity}','${person.randomGender}',${person.age},0);`;
//         //Insert row
//         connection.query(sql, function (err, result) {
//           if (err) throw err;
//           console.log(`${i+1} record inserted`);
//         });
//     }
//   });

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);

    for (let i = 0; i < 5; i++) {
        let person = randomPerson();
        //Query of MySQL
        var sql = `INSERT INTO users (id, first_name,last_name,phone,city,gender,age,prev_calls) 
            VALUES (${person.id},'${person.firstName}','${person.lastName}','${person.phone}','${person.randomCity}','${person.randomGender}',${person.age},0);`;
        //Insert row
        connection.query(sql, function (err, result) {
          if (err) throw err;
          console.log(`${i+1} record inserted`);
        });
    }
});

  module.exports = connection;

  //truncate big_data.users; - Delete all rows from table