const db = require("./connectRedis");

const redisDB = {
  setFlights: async function (flights, storeAs, ttl) {
    // Store the current flights details with expiry time (TTL) received in the input
    // (In a real-time system, the data becomes irrelevant after a certain time)
    db.set(storeAs, flights, "EX", ttl, function (callback) {});
  },

  getFlights: async function () {
    // Check if 'flights' record exists
    const exists = await db.exists("flights");
    // Return an empty array if the record does not exist
    if (!exists) {
      return {};
    }
    // Otherwise, if it exists, get the record and return it
    let flights = await db.get("flights");
    return flights;
  },

  getLearningResult: async function () {
    // Check if 'flights' record exists
    const exists = await db.exists("learningResult");
    // Return an empty array if the record does not exist
    if (!exists) {
      return {};
    }
    // Otherwise, if it exists, get the record and return it
    let flights = await db.get("learningResult");
    return flights;
  },
};

module.exports = redisDB;
