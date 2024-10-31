#!/bin/bash
parent_path=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd -P
)
cd "$parent_path"

services=("router" "ws-server" "notification-producer")

for service in "${services[@]}"; do
  docker build -t "adamviktora/$service" "../$service"
  docker push "adamviktora/$service"
done
