kubectl delete deployment.apps/notification-producer;
kubectl delete deployment.apps/router;
kubectl delete deployment.apps/ws-server;

kubectl delete service/ws-server-service;
