# Israel Flights - Big Data Project

<h2>Overview</h2>

<b>Dashboard Live WebSite: <a href=ilflights.herokuapp.com>https://ilflights.herokuapp.com</a></b>

| Dashboard Server |
| ------------- |
| <p align="center"><img src="https://user-images.githubusercontent.com/68508896/191278721-aa3c1f60-90c4-4bfc-8c13-ebc1ad82c9c8.png"/></p> |

| DataEntry Server | DataLake Server |
| ------------- | ------------- |
| <p align="center"><img src="https://user-images.githubusercontent.com/68508896/191405320-df4f94e6-d1c8-4195-9f92-a67b9633195c.png"/></p>  | <p align="center"><img src="https://user-images.githubusercontent.com/68508896/191405632-eee8c018-b0b3-466a-9bcc-b9af86f2fb98.png"/></p>  |


<h3>Technologies</h3>

<span>
  
  <img src="https://user-images.githubusercontent.com/68508896/192110139-17516596-8625-46be-8f8a-1f75f5f11a50.png" title="Java Script" alt="js" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110164-3cc0735d-a0b6-4b74-a3cc-dd29f730b34b.png" title="CSS" alt="css" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110177-06b7c17a-0317-40d7-9ba2-d5f1d8f708dc.png" title="Html" alt="html" height="80"/>
  
  <img src="https://user-images.githubusercontent.com/68508896/192110208-46336dc4-59cf-486a-8cab-21d0990aee04.png" title="NodeJS" alt="nodejs" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110492-52dc3219-22f9-420b-b2a2-ddc2e4d18686.png" title="MongoDB" alt="mongodb" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110203-d3cc3f86-6d77-49cf-af16-89c3bcd314c6.png" title="Redis" alt="redis" height="80"/>
  
  <img src="https://user-images.githubusercontent.com/68508896/192110212-7e6d8560-9a46-4301-b8e0-bf58c387e7ac.png" title="mySQL" alt="mySQL" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110220-ab9d7353-60cd-4dfa-a397-d03d1a78ae7b.png" title="Docker" alt="docker" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110223-f8439115-21e5-4ce9-8013-39669f7882f4.png" title="Kafka" alt="kafka" height="80"/>
  
  <img src="https://user-images.githubusercontent.com/68508896/192123576-0d720f3f-4367-4063-8ea4-bff1a6694019.png" title="BigML" alt="expressjs" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110224-2b9dfa65-dcaf-4b77-af4b-bcfe189c5b7f.png" title="Socket IO" alt="socketio" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110229-e29d4f50-b251-48ef-85d4-4363fbb7d993.png" title="Bing Maps" alt="bingmaps" height="80"/>
  <img src="https://user-images.githubusercontent.com/68508896/192110399-78e8e720-449d-433e-aed0-9b48257cbb87.png" title="ExpressJS" alt="expressjs" height="80"/>

</span>


<h2>Introduction</h2>   

In the current period, in addition to the data extracted from operational systems, many data are located and collected from a variety of sources as a basis for analysis, forming insights, adopting strategies and evidence-based decision-making.   
Big Data Analytics systems require many organizational resources, so using cloud service providers for storage and processing is a common practice.
In planning a distributed system of this type, there is no obstacle to weaving a variety of services from several providers, combining services originating from the organization itself, into a complete solution.   
In the current project, we will create a solution for data processing and display inspired by the Lamda template, which monitors air traffic to Israel through Israel and enables machine learning and the formation of a predictive model from the accumulated data - the solution will integrate cloud services and web services into a complete system.   
   
The system consists of three sub-systems which together enable Near Real Time monitoring of landings and takeoffs via Dashboard as well as the creation of a prediction model, for each flight, whether it will be on time or delayed in the schedule.    

The system predicts the arrival times from the following data: type of period (holidays, summer vacations, normal days), month of the year, day of the week, company, country of origin, destination country, type of flight (up to 1500 kilometers: short, up to 3500 kilometers: medium, over 3500 kilometers: long), the weather in the country of origin, the weather in the destination country, the nature of arrival (under 15 minutes: normal, up to an hour: late, over an hour: severely late).     
   
- Subsystem A (data collection) uses the Axiom package to collect data cyclically from cloud services, and records the accesses to the data in MySql database (local/Docker), including the day and time of access.   
- Subsystem B (dashboard) displays the data received from subsystem A on a map using the Bing Maps infrastructure. In addition, the system will store the data for retrieval using Redis.   
- Subsystem C (datalake & machine learning) stores historical flight data using MongoDB and uses BigML to create a prediction model which will be used to predict the type of arrival time of the flights.   
   
<p align="center"><img src="https://user-images.githubusercontent.com/68508896/185351045-d63cc293-1993-4d04-a457-61afcd00fe71.png" width="600px"/></p>
   
The organization of services is implemented in the Node.js environment and under the MVC (Model-View-Controller) design pattern.   

<p align="center"><img src="https://user-images.githubusercontent.com/68508896/186008951-d7911a94-0361-4913-8f4a-f277e297d02b.png" width="350px"/></p>


<h2>Remarks & Data analysis</h2>   

- (flightradar24 API) After a quick sampling of about 50-100 flight records (where each sample is individual access to extended flight details) it is necessary to wait about 15-20 seconds in order not to receive a refusal error (403) from the flightradar24 server.   
- (flightradar24 API) It seems that it takes a while for a flight to be updated as 'landed' even though the flight has already landed! Therefore, the 'landed' record is the last record that we were able to capture in real time   
- In order to fill weather info ('fillWeatherDetails') or period info ('fillPeriodDetails') to a flight record, It is necessary to first fill the extended details using 'fillExtendedDetails' (Because fetching weather info and fetching period info depends on the parameters obtained after running 'fillExtendedDetails'). In other words, It is necessary to call 'fillExtendedDetails' before calling 'fillWeatherDetails' or 'fillPeriodDetails'.   


<h2>Getting Started</h2>

- In this project, kafka is used as a massage broker. It is necessary to open a kafka account with 3 topics. 2 topics for sending data from the DataEntry to Dashboard/Datalake (one for each) and another topic to send the results of the prediction model (obtained from BigML) from the Datalake to the Dashboard [See the explanation below for the names of the topics and their uses].   
- In this project we used the following provider: cloudkarafka.com   
- If kafka becomes slow (after heavy use) it is necessary to open a new instance (and of course, redefine the above 3 topics)   

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

<b>Create a new Git repository & Deploy:</b>   
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
