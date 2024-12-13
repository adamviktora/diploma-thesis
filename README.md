# Master's Thesis - Targeted routing for Kafka pipelines

### Author: Adam Viktora

This is a prototype for running the targeted approach of routing Kafka events to ws-server pods.

### Requirements

- `minikube`
- `kubectl`
- `helm`
- `Node.js`, `npm`

## Contents

- `/client` - HTML file + script to test connecting to the WS server (works only with docker driver, not with qemu)
- `/kubernetes` - list of kubernetes specification YAML files and helper scripts
  - `initial-setup.sh` - script for installing helm charts: `kafka`, `redis` and `kube-prometheus-stack`
  - `start.sh` - script for starting the microservices on Kubernetes
  - `stop.sh` - script for stopping the microservices on Kubernetes
  - `/kafka-redis-admin` - helper scripts for starting the `kafka-redis-admin` microservice, creating and deleting topics
- `/microservices` - list of microservice packages, each can be dockerized to an image
  - `/kafka-redis-admin` - REST API service for managing Kafka topics and Redis keys
  - `/notification-producer` - service for producing notifications
  - `/router` - service for routing notifications to correct `ws-server` Pod using Kafka partitions
  - `/ws-server` - service for handling WS connections, consuming notifications from a specific Kafka partition
  - `update-images.sh` - script for creating a Docker image from each service and pushing it to dockerhub
- `/performance-testing`
  - `/grafana` - custom dashboard showing CPU, memory and network metrics
  - `ws-test.js` - script simulating WS connections of thousands users

## Setup before running

Make sure that `ws-server.yaml` spec.replicas number (3) matches `router.yaml` env variable `WS_PODS_COUNT` value: '3'.

Also `/kafka-redis-admin/createTopics.sh` "topic": "notification-targeted", "numPartitions": `3` <-- This number must be `>= WS_PODS_COUNT`

## How to run

1. Start minikube with enough allocated memory and cpu. On macOS, it is recommended to use `qemu` driver with `socket_vmnet` network

   Install socket_vmnet:

   ```
   brew install socket_vmnet
   brew tap homebrew/services
   HOMEBREW=$(which brew) && sudo ${HOMEBREW} services start socket_vmnet
   ```

   Start minikube:

   ```
   minikube start --memory 12000 --cpus 4 --driver qemu --network socket_vmnet
   ```

2. Run `kubernetes/initial-setup.sh` to deploy `kafka`, `redis` and `kube-prometheus-stack` from helm charts
3. `cd` into `kubernetes/kafka-redis-admin`
   - from there run `./start.sh` to deploy the REST API helper service
   - run `./createTopics.sh` to create Kafka topics
4. `cd` back into `kubernetes`
   - run `./start.sh` to deploy all the microservices and wait until pods are running
   - state of the pods and services can be checked with `kubectl get all`
5. `cd` to `performance-testing`
   - run `npm install` and `node ws-test.js` to connect USERS_COUNT users to WebSockets (USERS_COUNT is configurable in the script)

## Observe metrics in Grafana

1. Run `kc port-forward service/monitoring-grafana 9000:80 -n monitoring`
2. Grafana is accessible through browser at `localhost:9000`
   - login: `admin`, password: `prom-operator`
3. Load dashboard from `performance-testing/grafana/custom-dashboard.json`
