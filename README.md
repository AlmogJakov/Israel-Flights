# BigDataProject

<h2>Overview</h2>



<h2>Introduction</h2>   

In the current period, in addition to the data extracted from operational systems, many data are located and collected from a variety of sources as a basis for analysis, forming insights, adopting strategies and evidence-based decision-making.   
Big Data Analytics systems require many organizational resources, so using cloud service providers for storage and processing is a common practice.
In planning a distributed system of this type, there is no obstacle to weaving a variety of services from several providers, combining services originating from the organization itself, into a complete solution.   
In the current project, we will create a solution for data processing and display inspired by the Lamda template, which monitors air traffic to Israel through Israel and enables machine learning and the formation of a predictive model from the accumulated data - the solution will integrate cloud services and web services into a complete system.   
   
The system consists of three sub-systems which together enable Near Real Time monitoring of landings and takeoffs via Dashboard as well as the creation of a prediction model, for each flight, whether it will be on time or delayed in the schedule.    

The system predicts the arrival times from the following data: type of period (holidays, summer vacations, normal days), month of the year, day of the week, company, country of origin, destination country, type of flight (up to 1500 kilometers: short, up to 3500 kilometers: medium, over 3500 kilometers: long), the weather in the country of origin, the weather in the destination country, the nature of arrival (under 15 minutes: normal, up to an hour: late, over an hour: severely late).     
   
- Subsystem A (data collection) will use the Axiom package to collect data cyclically from cloud services, will record in a MySql database (local/Docker) the access to a type of service, including the day and time of access.   
- Subsystem B (dashboard) displays the data received from subsystem A on a map using the Bing Maps infrastructure. In addition, the system will store the data for retrieval using Redis.   
- Subsystem C (datalake & machne learning) stores historical flight data using MongoDB and creates a prediction model using BigML for predicting the arrival times of the flights.   
   
<p align="center"><img src="https://user-images.githubusercontent.com/68508896/185351045-d63cc293-1993-4d04-a457-61afcd00fe71.png" width="600px"/></p>
   
The organization of services is implemented in the Node.js environment and in the MVC pattern.   

<p align="center"><img src="https://user-images.githubusercontent.com/68508896/185351757-4303ab5c-1ba9-4180-9e05-b0f025d8a0be.png" width="250px"/></p>


<h2>Remarks & Data analysis</h2>   

- (flightradar24) After a quick sampling of about 50-100 flight records (where each sample is individual access to extended flight details) it is necessary to wait about 15-20 seconds in order not to receive a refusal error (403) from the flightradar24 server.   
- (flightradar24) It seems that it takes a while for a flight to be updated as 'landed' even though the flight has already landed! Therefore, the 'landed' record is the last record that we were able to capture in real time   
- In order to fill weather info ('fillWeatherDetails') or period info ('fillPeriodDetails') to a flight record, It is necessary to first fill the extended details using 'fillExtendedDetails' (Because fetching weather info and fetching period info depends on the parameters obtained after running 'fillExtendedDetails'). In other words, It is necessary to call 'fillExtendedDetails' before calling 'fillWeatherDetails' or 'fillPeriodDetails'.   


<h2>Getting Started</h2>

- In this project kafka is used as a massage broker. It is necessary to open a kafka account with 3 topics. 2 topics for sending data from the DataEntry to Dashboard/Datalake (one for each) and another topic to send the results of the prediction model (obtained from BigML) from the Datalake to the Dashboard [See the explanation below for the names of the topics and their uses].   
- In this project we used the following provider: cloudkarafka.com   
- Sometimes, after some time, kafka becomes slow and then it is necessary to open a new instance (and of course, redefine the above 3 topics)   

<h3>DataEntry Server (A)</h3>

-----   

<b>Kafka:</b>
- Navigate to DataEntry->models->produceKafka.js and set-up your connection details (used 'default' topic to send the flights info to the Dashboard server and used 'new' topic to send the flights info to Datalake server)

<b>SQL:</b>
- Navigate to DataEntry->models->mysql.js and set-up your connection details (in addition, the specified database must be created first)

<b>Start Command:</b> node ./serverA.js

<h3>Dashboard (B)</h3>

-----   

<b>Kafka:</b>
- Navigate to Dashboard->models->consumeKafka.js and set-up your connection details (used 'default' topic to receive the flights info from DataEntry server)   
- Navigate to Dashboard->models->consumeKafkaML.js and set-up your connection details (used 'ml' topic to receive the prediction info from DataEntry server)

<b>Redis:</b>
- navigate to Dashboard->models->connectRedis.js and set-up your connection details (In this project we used Redis locally using Docker. Later, we uploaded the server [Dashboard] to Heroku using Cloud Redis connection details)

(To run Redis Locally using Docker follow this tutorial: https://geshan.com.np/blog/2022/01/redis-docker and then run the command: "<b>docker-compose -f docker-compose-redis.yml up</b>" to active Redis)

<b>Start Command:</b> node ./serverB.js

<h3>DataLake (C)</h3>

-----   

<b>Kafka:</b>
- Navigate to DataLake->models->consumeKafka.js and set-up your connection details (used 'new' topic to receive the flights info from DataEntry server)
- Navigate to DataLake->models->produceKafkaML.js and set-up your connection details (used 'ml' topic to send the prediction info to Dashboard server)

<b>MongoDB:</b>
- navigate to DataLake->models->MongoDB->connect.js and set-up your connection details

<b>BigML:</b>
- navigate to DataLake->models->bml.js and set-up your connection details

<b>Start Command:</b> node ./serverC.js

<h3>Heroku Commands</h3>

-----   

Heroku commands (used to upload the Dashboard server to Heroku):  

<b>Cloning:</b>   
- heroku git:clone -a APP_NAME 
- cd APP_NAME 

<b>Conf & Pushing:</b>   
- heroku login
- git init
- heroku git:remote -a APP_NAME
- git add .
- git commit -am "make it better"
- git push heroku main

<b>Opening the app:</b>
- heroku open

<b>Shutdown app:</b>
- heroku ps:scale web=0

<b>Revive app:</b>
- heroku ps:scale web=1

<b>Restart app:</b>
- heroku ps:restart

<b>App Log:</b>
- heroku logs --tail

<h3>Docker Commands</h3>

-----   

<b>Watch Docker images list:</b>
- docker ps
