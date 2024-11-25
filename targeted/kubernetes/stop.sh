kubectl delete deployment.apps/notification-producer;
kubectl delete deployment.apps/router;
kubectl delete statefulset.apps/ws-server;

kubectl delete service/ws-server-service;
kubectl delete service/ws-server-headless-service ;
