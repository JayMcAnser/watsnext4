# Config documentation
version: 2021-09-22

## key: Mediakunst
defines how Mediakunst is generated
example:

```json
"Mediakunst": {  
  "id": 2423  
}

```
### id (numeric)
defines what bookmarklist id used for the selection of the artworks that are used by Mediakunst.net


## key: Database
defines what database are used
```json


"Database": {
    "Mongo": {
        "prefix": "mongodb",
        "host": "localhost",
        "port": "27017",
        "uriParam": false,
        "user": "root",
        "password": false,
        "database": "watsnext",        
        "debug": false,
        "rootEmail.doc": "The email account of the root account with all access",
        "rootEmail": "info@toxus.nl",
        "rootPassword.doc": "The plain text password for this account",
        "rootPassword": "123456",
        "sessionMerge": "3 minutes"
    },
    "MySQL": {
        "host": "mysql.li-ma.nl",
        "port": 3306,
        "username": "toxus",
        "password": "2bad4u",
        "database": "watsnext_test"
    },
    "WatsNext": {
        "doc": "the system root manager, that can do ANY THING. If it does not exist, its created",
        "root": "root",
        "password": "skFd6!$@Cr8wsK",
        "email": "info@toxus.nl"
    }
}
```

## Mongo (string)
defines the definition used for the storage of all information

### debug (boolean)
if true the logging of the mongo db is send to the console

### rootEmail (string)
On startup, the system will check there is a root account with this email address. If missing this user is added with
this email address and the name *root*.

### rootPassword (string)
The plain text password for setting up the default root account

## MySQL
defines the mySQL database used to import / synchronize the database with.

### host, port, username, password, database
*self explanatory*

## WatsNext
defines the root account used by the system. If it does not exist, it will be generated

### root, password, email
*self explanatory* (password is plain text!)

## ServerLogging
defines the server where to log the information to
* url - (string) the server including the protocol
* key - (string) the header key to use
* host - (string) the central host for the stream
* extra - (object) standard extra parameters send to the server
