#!/bin/bash
parent_path=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd -P
)
cd "$parent_path"

services=("router" "ws-server" "notification-producer" "kafka-redis-admin")

for service in "${services[@]}"; do
  echo "Building $service image"
  docker build -t "adamviktora/$service" "./$service"
  docker push "adamviktora/$service"
done
