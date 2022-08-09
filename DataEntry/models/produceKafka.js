// Running Kafka as part of the provider https://www.cloudkarafka.com/

const uuid = require("uuid");
const Kafka = require("node-rdkafka");

// ------------------------------------

const kafkaConf = {
  "group.id": "cloudkarafka-example",
  "metadata.broker.list":
    "sulky-01.srvs.cloudkafka.com:9094,sulky-02.srvs.cloudkafka.com:9094,sulky-03.srvs.cloudkafka.com:9094".split(
      ","
    ),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "v28g6ayh",
  "sasl.password": "5d-hix-_k78Sc0mmRS-oqbeang-9si4q",
  debug: "generic,broker,security",
};

const prefix = "v28g6ayh-";
const topic = `${prefix}default`;

const prefix2 = "v28g6ayh-";
const topic2 = `${prefix2}new`;

// ------------------------------------

const producer = new Kafka.Producer(kafkaConf);

const genMessage = (m) => new Buffer.alloc(m.length, m);

producer.on("ready", function (arg) {
  console.log(`producer ${arg.name} ready.`);
});
producer.connect();

module.exports.publish = function (msg) {
  m = JSON.stringify(msg);
  producer.produce(topic, -1, genMessage(m), uuid.v4());
  producer.produce(topic2, -1, genMessage(m), uuid.v4());
};
