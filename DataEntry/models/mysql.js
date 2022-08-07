const mysql = require("mysql");

var connection = mysql.createConnection({
  // MySQL Config (Change to your own details)
  host: "localhost",
  user: "root",
  password: "123456",
  database: "big_data",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

const mysqlConnection = {
  access_writing: async function (data_type_name) {
    // In case the table does not exist - create it (it happens if the table is dropped).
    var sql = `CREATE TABLE IF NOT EXISTS \`access_archive\` (
      \`access_id\` int(11) NOT NULL auto_increment,
      \`data_type\` varchar(100) NOT NULL default \'\',
      \`date\` DATETIME NOT NULL,
       PRIMARY KEY  (\`access_id\`)
    );`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
    });

    // Get current date (in mysql format)
    current_date = new Date().toISOString().slice(0, 19).replace("T", " ");
    // Create the record and insert it to mysql
    var sql = `INSERT INTO access_archive (data_type,date)
               VALUES ('${data_type_name}','${current_date}');`;
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log(`MySQL Record inserted`);
    });
  },
};

module.exports = mysqlConnection;
