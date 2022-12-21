# Watsnext - the next generation

## Intro
The watsnext interface has many parts. These parts are currently under development:
* Wikipedia integration  
* Conversion from mySQL to MongoDB
* Royalties calculations

## General - configuration
All configuration are done by the central config file. The file is in the  **../config** directory. This location is 
used because the user interface also uses this central configuration.

## Logging - configuration
The logging can be done to the local logging system or the remote server. In the configuration (**../config**) there are 
two keys: **Logging** and **LoggingServer**. The **Logging** is the local logging on the server.

### LoggingServer
The LoggingServer is a GrayLog server and uses the following keys:
* url - the url of the server to log to, or null / false to stop logging of true to log to the console
* key - the autorisation key used by the Graylog
* host - the application sending the message (here: api.watsnext.nl
* extra - other things to log


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


## short run
To completely rebuild the wikipedia interface use the following commands

```shell
## import data into the mongo db
./import-mediakunst.sh
## import the query.csv (watnext id to wikipedia link
node job import:wiki -f ../api/data/query.csv
## import the data into the mediakunst database
node job generate:wikipedia
```

## Jobs
The job interface handles the scripts to import and convert data for the wikipedia integration

### Sync between wikipedia QID and watsnext ids.
command:
```shell
node job import:wiki -f part.csv
```
This command updates the MongoDB with the urls for the known artists. It uses a .CSV file to import the data.
Standard the files should be relative the **./api/../data** directory, but this can be changed by the setup in the **../config**
definition by the **Path.importRoot** key. The default root is the **../** directory of the API (systemRoot).

The format of the .CSV (comma separated) is:
* item - the wikipedia url
* itemLabel - the name of the artist
* LIMA_media_artist_ID - the id of the artist / agent
* 
The format can be change the config in the section **Import.csv** with the keys:
* delimiter: ",",
* encoding: "utf8",
* comment: "#",
* hasFieldNames: true

### Generate Wikipedia biography in Mediakunst
command:
```shell
node job generate:wikipedia
```
The generated HTML fragments are stored in the mySQL database for use in mediakunst.net. This process should run **after**
the mediakunst import has been done, because it extends the existin data with the biography information.


### import watsnext
command:
```shell
node job import:watsnext
```


