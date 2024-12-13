curl -X DELETE $(minikube ip):30700/topics/notification
curl -X DELETE $(minikube ip):30700/topics/notification-targeted
curl -X DELETE $(minikube ip):30700/topics/notification-general
curl -X DELETE $(minikube ip):30700/topics/__consumer_offsets
