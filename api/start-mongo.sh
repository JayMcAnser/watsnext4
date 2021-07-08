#!/bin/bash
# Start mongo in any directory
docker run -d -p 27017:27017 mongo

# start docker in a fix directory
# docker run -d -p 27017:27017 -v ~/data:/data/db mongo


# Start redis with persitent storage
# docker run --name some-redis -d redis redis-server --appendonly yes
# docker run -d --cap-add sys_resource --name rp -p 8443:8443 -p 9443:9443 -p 12000:12000 redislabs/redis
