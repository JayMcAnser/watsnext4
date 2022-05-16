# Watsnext - the next generation

## Intro
The watsnext interface has many parts. These parts are currently under development:
* Wikipedia integration  
* Conversion from mySQL to MongoDB
* Royalties calculations

## General - configuration
All configuration are done by the central config file. The file is in the  **../config** directory. This location is 
used because the user interface also uses this central configuration.



## Wikipedia integration  Version 1.0.0
------ **This is still a work-in-progress**

The wikipedia project import the biography from the wikipedia and convert this into an artist biography. The biography is
merged with at stylesheet and stored into the MongoDb. A copy of the information is stored on mediakunst.net in the
**artist** document, so it can be shown in the catalog.

For this to work the data has to be imported / synchronized from the mySQL to the MongoDB. see conversion.
After that the

### converting one 



### converting all (CRON script)


## Conversion from mySQL to MongoDB
All routines in the new WatsNext API will use the MongoDb as source. But there is still no interface to edit all
information. To solve this, the information from the mySQL database is copied / synchronised into the MongoDB. 
This can run every night, so the data will up-to-date.
Extra information can be stored into the MongoDB, because the data is synchronised. Data added to the mongo will 
persist (it's stored into an other table!).

### setup
To check if mongoDB is running use:
```shell
./start-mongo.sh
```
The empty MongoDB database needs a basic user. It will be create by the next step. Just nice to know
```shell
node create-user.js
```

To import the data needed by mediakunst.net there is a script:
```shell
./import-mediakunst.sh
```
This will create a user (email: info@toxus.nl, user: system, pwd: 123456). This user will import all information
from the watsnext data (configured by the ../config/default.json). This will take a long time on an empty db.
