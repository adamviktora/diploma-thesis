helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus https://prometheus-community.github.io/helm-charts

helm install kafka bitnami/kafka
helm install redis bitnami/redis

kubectl create namespace monitoring
helm install monitoring prometheus/kube-prometheus-stack --namespace monitoring
