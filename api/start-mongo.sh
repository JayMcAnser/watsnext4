#!/bin/bash
# Start mongo in any directory
#   -d: demon

docker run -d -p 27017:27017 -v /Users/jaap/Sites/Lima/WatsNext2020/wn40/api/data/mongo:/data/db --restart unless-stopped mongo
# docker run -p 27017:27017 -v mongodbdata:/data/db mongo

# start docker in a fix directory
# docker run -d -p 27017:27017 -v ~/data:/data/db mongo


# Start redis with persitent storage
# docker run --name some-redis -d redis redis-server --appendonly yes
# docker run -d --cap-add sys_resource --name rp -p 8443:8443 -p 9443:9443 -p 12000:12000 redislabs/redis

# see: https://stackoverflow.com/questions/35400740/how-to-set-docker-mongo-data-volume
# create a mongo volume:
#   >> docker volume create mongodbdata
# to show the location of the files
#   >> docker volume inspect mongodbdata
