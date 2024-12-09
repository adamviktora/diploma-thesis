kubectl delete deployment.apps/notification-producer
kubectl delete statefulset.apps/ws-server

kubectl delete service/ws-server-service
kubectl delete service/ws-server-headless-service
