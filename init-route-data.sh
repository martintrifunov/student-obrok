#!/bin/bash

# Check if the directory /data exists, if not, create it
if [ ! -d "./data" ]; then
  mkdir ./data
  echo "Created directory: ./data"
fi

# Check if the directory /data/map exists, if not, create it
if [ ! -d "./data/map" ]; then
  mkdir ./data/map
  echo "Created directory: ./data/map"
fi

# Download the data
wget -P ./data/map http://download.geofabrik.de/europe/macedonia-latest.osm.pbf

# Preprocess the data
docker run -t -v $(pwd)/data/map:/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/macedonia-latest.osm.pbf
docker run -t -v $(pwd)/data/map:/data osrm/osrm-backend osrm-partition /data/macedonia-latest.osrm
docker run -t -v $(pwd)/data/map:/data osrm/osrm-backend osrm-customize /data/macedonia-latest.osrm
