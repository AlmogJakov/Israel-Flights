# BigDataProject


<b>Start Redis:</b> docker-compose -f docker-compose-redis.yml up

<b>Start subsystem A:</b> node ./serverA.js

<b>Start subsystem B:</b> node ./serverB.js

<b>Start subsystem C:</b> node ./serverC.js

Remarks & Data analysis:
- (flightradar24) It seems that it takes a while for a flight to be updated as 'landed' even though the flight has already landed! Therefore, the 'landed' record is the last record that we were able to capture in real time
- In order to fill weather info ('fillWeatherDetails') or period info ('fillPeriodDetails') to a flight record, It is necessary to first fill the extended details using 'fillExtendedDetails' (Because fetching weather info and fetching period info depends on the parameters obtained after running 'fillExtendedDetails'). In other words, It is necessary to call 'fillExtendedDetails' before calling 'fillWeatherDetails' or 'fillPeriodDetails'.


<h2>Getting Started:</h2>

In this project kafka is used as a massage broker. It is necessary to open a kafka account with 3 topics. 2 topics for sending data from the DataEntry to Dashboard/Datalake (one for each) and another topic to send the results of the prediction model (obtained from BigML) from the Datalake to the Dashboard.

<h3>DataEntry Server (A)</h3>

<b>Kafka:</b>
- Navigate to DataEntry->models->produceKafka.js and set-up your connection details (used 'default' topic to send the flights info to the Dashboard server and 'new' topic used to send the flights info to Datalake server)

<b>SQL:</b>
- Navigate to DataEntry->models->mysql.js and set-up your connection details

<h3>Dashboard (B)</h3>

<b>Kafka:</b>
- Navigate to Dashboard->models->consumeKafka.js and set-up your connection details (used 'default' topic to receive the flights info from DataEntry server)   
- Navigate to Dashboard->models->consumeKafkaML.js and set-up your connection details (used 'ml' topic to receive the prediction info from DataEntry server)

<b>Redis:</b>
- navigate to Dashboard->models->connectRedis.js and set-up your connection details (In this project we used Redis locally using Docker. Later, we uploaded the server [Dashboard] to Heroku using Cloud Redis)

<h3>DataLake (C)</h3>

<b>Kafka:</b>
- Navigate to DataLake->models->consumeKafka.js and set-up your connection details (used 'new' topic to receive the flights info from DataEntry server)
- Navigate to DataLake->models->produceKafkaML.js and set-up your connection details (used 'ml' topic to send the prediction info to Dashboard server)

<b>Redis:</b>
- navigate to Dashboard->models->connectRedis.js and set-up your connection details (In this project we used Redis locally using Docker. Later, we uploaded the server [Dashboard] to Heroku using Cloud Redis)

(To run Redis Locally using Docker follow this tutorial: https://geshan.com.np/blog/2022/01/redis-docker and the run the command: "docker-compose -f docker-compose-redis.yml up" to active Redis)
