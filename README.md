open-taskman: k ukolu: annonci v urcity den

```
eval $(minikube -p minikube docker-env)
docker build . -f dev/Dockerfile -t modularniurad/taskman
kubectl apply -f dev/pod.yaml
```