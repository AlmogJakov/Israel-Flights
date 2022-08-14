// Running Kafka as part of the provider https://www.cloudkarafka.com/

const uuid = require("uuid");
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

// SHOULD UNCOMMENT THIS LINES
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

// // SHOULD UNCOMMENT THIS LINES
// const prefix = "b45qtkrx-";
// const topic = `${prefix}ml`;

// ------------------------------------

const producer = new Kafka.Producer(kafkaConf);

const genMessage = (m) => new Buffer.alloc(m.length, m);

producer.on("ready", function (arg) {
  console.log(`producer ${arg.name} ready.`);
});
producer.connect();

module.exports.publish = function (msg) {
  m = JSON.stringify(msg);
  // SHOULD UNCOMMENT THIS LINE
  producer.produce(topic, -1, genMessage(m), uuid.v4());
};
