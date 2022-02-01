#!/bin/bash -e

echo "refresh wikipedia information"
echo "import artists from watnext to mongodb"
node api/job.js import:watsnext -o agent.log -r --parts agent

echo "import wikipedia artist from this data/wikipedia/artist.csv"
node api/job.js import:wiki -f wikipedia/artist.csv -r -d

echo "generate biography into mediakunst.net"
node api/job.js generate:wikipedia -d
