#! /bin/bash
	# -e "http.cors.allow-origin=http://localhost:8080" \ # for elasticvue in docker
docker run -d \
	-p 9200:9200 \
	-p 9300:9300 \
	-e "http.cors.enabled=true" \
	-e "http.cors.allow-origin=http://localhost:8080" \
	-e "discovery.type=single-node" \
	-e "xpack.security.enabled=false" \
	--name elastic \
	elasticsearch:8.7.0 
