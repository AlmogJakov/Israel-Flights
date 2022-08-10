# BigDataProject


<b>Start Redis:</b> docker-compose -f docker-compose-redis.yml up

<b>Start subsystem A:</b> node ./serverA.js

<b>Start subsystem B:</b> node ./serverB.js

<b>Start subsystem C:</b> node ./serverC.js

Remarks:
- (flightradar24) It seems that it takes a while for a flight to be updated as 'landed' even though the flight has already landed! Therefore, the 'landed record' is the last record that we were able to capture in real time
- In order to fill weather info ('fillWeatherDetails') or period info ('fillPeriodDetails') to a flight record, It is necessary to first fill the extended details using 'fillExtendedDetails' (Because fetching weather info and fetching period info depends on the parameters obtained after running 'fillExtendedDetails'). In other words, It is necessary to call 'fillExtendedDetails' before calling 'fillWeatherDetails' or 'fillPeriodDetails'.
