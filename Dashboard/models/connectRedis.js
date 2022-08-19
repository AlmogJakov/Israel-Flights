const redis = require("ioredis");

// https://app.redislabs.com/#/databases/11176232/subscription/1827195/view-bdb/metric

// Connect Using Redis Cloud Details
const conn = {
  port: 12938,
  host: "redis-12938.c59.eu-west-1-2.ec2.cloud.redislabs.com",
  db: 0,
  // password: process.env.REDIS_AUTH
  password: "mkZgFfZX71wrayQne37XbCUdgAfC0a46",
};

// Connect Using Local Redis Details (Via Docker)
// const conn = {
//   port: 6379,
//   host: "127.0.0.1",
//   db: 0,
//   // password: process.env.REDIS_AUTH
//   password: "eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81",
// };

const redisDb = new redis(conn);
module.exports = redisDb;
