// https://www.cloudkarafka.com/
const Kafka = require("node-rdkafka");

// ------------------------------------

const kafkaConf = {
  "group.id": "cloudkarafka-example",
  "metadata.broker.list":
    "moped-01.srvs.cloudkafka.com:9094,moped-02.srvs.cloudkafka.com:9094,moped-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "rbzulc43",
  "sasl.password": "gAmGs_cZQPBcVLC-J53XnecHC2mVNq95",
  debug: "generic,broker,security",
};

const prefix = "rbzulc43-";
const topic = `${prefix}ml`;

// ------------------------------------

// const kafkaConf = {
//   "group.id": "cloudkarafka-example",
//   "metadata.broker.list":
//     "moped-01.srvs.cloudkafka.com:9094,moped-02.srvs.cloudkafka.com:9094,moped-03.srvs.cloudkafka.com:9094".split(","),
//   "socket.keepalive.enable": true,
//   "security.protocol": "SASL_SSL",
//   "sasl.mechanisms": "SCRAM-SHA-256",
//   "sasl.username": "b45qtkrx",
//   "sasl.password": "p_Lax9r_1ya-nTu9MEtFpVeMBUO_q2gL",
//   debug: "generic,broker,security",
// };

// const prefix = "b45qtkrx-";
// const topic = `${prefix}ml`;

// ------------------------------------

const topics = [topic];
const consumer = new Kafka.KafkaConsumer(kafkaConf, {
  "auto.offset.reset": "beginning",
});

consumer.on("error", (err) => {
  console.error(err);
});

consumer.on("ready", function (arg) {
  console.log(`Consumer ${arg.name} ready - for Redis & Dashboard`);
  consumer.subscribe(topics);
  consumer.consume();
});

consumer.on("data", function (m) {
  //console.log(m.value.toString());
  console.log("Got ML data from kafka!");
});

consumer.on("disconnected", (arg) => {
  process.exit();
});
consumer.on("event.error", (err) => {
  console.error(err);
  process.exit(1);
});
consumer.on("event.log", function (log) {
  console.log(log);
});
consumer.connect();

module.exports.consumer = consumer;
