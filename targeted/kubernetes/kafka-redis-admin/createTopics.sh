curl -X POST $(minikube ip):30700/topics \
  -H "Content-Type: application/json" \
  -d '{
  "topic": "notification",
  "numPartitions": 3,
  "replicationFactor": 2
}'
