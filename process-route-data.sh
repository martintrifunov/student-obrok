#!/bin/bash

# Download the data
wget -P ./data/map http://download.geofabrik.de/europe/macedonia-latest.osm.pbf

# Preprocess the data
docker run -t -v $(pwd)/data/map:/data osrm/osrm-backend osrm-extract -p /opt/car.lua /data/macedonia-latest.osm.pbf
docker run -t -v $(pwd)/data/map:/data osrm/osrm-backend osrm-partition /data/macedonia-latest.osrm
docker run -t -v $(pwd)/data/map:/data osrm/osrm-backend osrm-customize /data/macedonia-latest.osrm
