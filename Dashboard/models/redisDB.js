const db = require("./connectRedis");

const redisDB = {
  setData: async function (data, nameTostoreAs, ttl) {
    // Store the current flights details with expiry time (TTL) received in the input
    // (In a real-time system, the data becomes irrelevant after a certain time)
    db.set(nameTostoreAs, data, "EX", ttl, function (callback) {});
  },

  getData: async function (dataName) {
    // Check if the record exists
    const exists = await db.exists(dataName);
    // Return an empty array if the record does not exist
    if (!exists) {
      return JSON.parse({});
    }
    // Otherwise, if it exists, get the record and return it
    let flights = await db.get(dataName);
    return flights;
  },
};

module.exports = redisDB;
