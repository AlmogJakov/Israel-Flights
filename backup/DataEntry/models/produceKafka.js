// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה

const uuid = require("uuid");
const Kafka = require("node-rdkafka");

// ------------------------------------

// const kafkaConf = {
//   "group.id": "cloudkarafka-example",
//   "metadata.broker.list": "sulky-01.srvs.cloudkafka.com:9094,sulky-02.srvs.cloudkafka.com:9094,sulky-03.srvs.cloudkafka.com:9094".split(","),
//   "socket.keepalive.enable": true,
//   "security.protocol": "SASL_SSL",
//   "sasl.mechanisms": "SCRAM-SHA-256",
//   "sasl.username": "v28g6ayh",
//   "sasl.password": "5d-hix-_k78Sc0mmRS-oqbeang-9si4q",
//   "debug": "generic,broker,security"
// };

// const prefix = "v28g6ayh-";
// const topic = `${prefix}default`;

// const prefix2 = "v28g6ayh-";
// const topic2 = `${prefix2}new`;

// ------------------------------------

// use you own parameters
const kafkaConf = {
  "group.id": "cloudkarafka-example",
  "metadata.broker.list": "tricycle-01.srvs.cloudkafka.com:9094,tricycle-02.srvs.cloudkafka.com:9094,tricycle-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "r32sn9cb",
  "sasl.password": "VZhZOhNE7ItIQycfyTxj2iQ-rdApVl2W",
  "debug": "generic,broker,security"
};

const prefix = "r32sn9cb-";
const topic = `${prefix}new`;

const prefix2 = "r32sn9cb-";
const topic2 = `${prefix2}default`;

// ------------------------------------

// const kafkaConf = {
//   "group.id": "cloudkarafka-example",
//   "metadata.broker.list": "rocket-01.srvs.cloudkafka.com:9094,rocket-02.srvs.cloudkafka.com:9094,rocket-03.srvs.cloudkafka.com:9094".split(","),
//   "socket.keepalive.enable": true,
//   "security.protocol": "SASL_SSL",
//   "sasl.mechanisms": "SCRAM-SHA-256",
//   "sasl.username": "z7nl7npe",
//   "sasl.password": "TS-FUVq8s3OphsBPjU7mKNttz2wXbakC",
//   "debug": "generic,broker,security"
// };

// const prefix = "z7nl7npe-";
// const topic = `${prefix}default`;

// const prefix2 = "z7nl7npe-";
// const topic2 = `${prefix2}new`;

// ------------------------------------

const producer = new Kafka.Producer(kafkaConf);

const genMessage = m => new Buffer.alloc(m.length,m);

producer.on("ready", function(arg) {
  console.log(`producer ${arg.name} ready.`); 
});
producer.connect();

module.exports.publish = function(msg)
{   
  m=JSON.stringify(msg);
  producer.produce(topic, -1, genMessage(m), uuid.v4());   
  producer.produce(topic2, -1, genMessage(m), uuid.v4());  
}