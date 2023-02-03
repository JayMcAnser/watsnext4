#!/bin/bash
# import all of watnext, removing existing data, merging local data

echo "importing all of watnext remove existing information"
echo "do you want to continu (it will take a long time) y/n"
read clearDb

if [ $clearDb -ne 'y' ]
then
  echo "YES"
  fi

# node api/job import:watsnext -r
