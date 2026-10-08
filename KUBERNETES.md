# Eduzap Server — Kubernetes Deployment Guide

This guide covers every file needed to deploy the `eduzap-server` on Kubernetes,
explains the role of each file, and walks through all environment scenarios
(local cluster, MongoDB Atlas, production).

---

## Project Structure

```
eduzap-server/
├── dockerfile              # Builds the server image
├── .env                    # Local dev only — NOT used in k8s
│
├── configmap.yaml          # Non-secret env vars (PORT, NODE_ENV)
├── eduzap-secret.yaml      # App secret (MONGO_URL)
├── mongodb-secret.yaml     # MongoDB root credentials
├── mongodb-pvc.yaml        # Persistent storage for MongoDB
├── mongodb.yaml            # MongoDB Deployment + Service
├── deployment.yaml         # eduzap-server Deployment
└── service.yaml            # eduzap-server Service (NodePort)
```

---

## Files Required for Kubernetes — What Each Does

| File | Kind | Purpose |
|------|------|---------|
| `configmap.yaml` | ConfigMap | Injects `PORT` and `NODE_ENV` into the app container |
| `eduzap-secret.yaml` | Secret | Injects `MONGO_URL` (MongoDB connection string) into the app |
| `mongodb-secret.yaml` | Secret | MongoDB root `username` and `password` used by the mongo container |
| `mongodb-pvc.yaml` | PersistentVolumeClaim | Reserves 1Gi disk so MongoDB data survives pod restarts |
| `mongodb.yaml` | Deployment + Service | Runs the MongoDB container and exposes it as `mongodb-service:27017` |
| `deployment.yaml` | Deployment | Runs 3 replicas of the eduzap-server app |
| `service.yaml` | Service (NodePort) | Exposes the app on a node port (accessible from outside the cluster) |

> **Why secrets and not configmap for MONGO_URL?**
> ConfigMaps are stored in plaintext in etcd. Secrets are base64-encoded and can be
> encrypted at rest. Credentials should always go in Secrets, never ConfigMaps.

---

## Environment Variables Reference

### ConfigMap — `configmap.yaml`
```yaml
data:
  NODE_ENV: "production"
  PORT: "3000"            # Must match containerPort in deployment.yaml
```

### App Secret — `eduzap-secret.yaml`
```yaml
stringData:
  MONGO_URL: "mongodb://admin:password123@mongodb-service:27017/eduzap?authSource=admin"
  #                       ^username ^password  ^service-name  ^db-name
```

### MongoDB Secret — `mongodb-secret.yaml`
```yaml
stringData:
  MONGO_USERNAME: admin       # Must match MONGO_URL username above
  MONGO_PASSWORD: password123 # Must match MONGO_URL password above
```

> The username/password in `eduzap-secret.yaml` (MONGO_URL) and
> `mongodb-secret.yaml` (MONGO_USERNAME / MONGO_PASSWORD) **must always match**.

---

## Deployment Order

Kubernetes does not auto-resolve dependencies. Always apply in this order:

```
Secrets & ConfigMap  →  PVC  →  MongoDB  →  App
```

---

## Scenario 1 — Local Cluster (MongoDB inside k8s)

This is the default setup. MongoDB runs as a pod inside the cluster.

### Step 1 — Build and push your Docker image
```bash
docker build -t suresh0750/eduzap-server:1.1 .
docker push suresh0750/eduzap-server:1.1
```

### Step 2 — Apply all manifests in order
```bash
kubectl apply -f mongodb-secret.yaml
kubectl apply -f eduzap-secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f mongodb-pvc.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Step 3 — Verify everything is running
```bash
kubectl get pods
kubectl get svc
kubectl logs -l app=eduzap-server --tail=5
```

Expected pod output:
```
NAME                             READY   STATUS    RESTARTS
eduzap-server-xxxxx-xxxxx        1/1     Running   0
mongodb-xxxxx-xxxxx              1/1     Running   0
```

Expected log:
```
Database connected successfully
Server running on http://localhost:3000
```

### Step 4 — Access the API

Find the NodePort:
```bash
kubectl get svc eduzap-server-service
# PORT(S): 3000:3XXXX/TCP  <-- use the 3XXXX number
```

Then hit the health endpoint:
```bash
curl http://localhost:31247/health
# or open in browser: http://localhost:31247/health
```

---

## Scenario 2 — MongoDB Atlas (Cloud DB, no MongoDB pod needed)

Use this when you don't want to run MongoDB inside the cluster.

### Step 1 — Update `eduzap-secret.yaml` with your Atlas URL
```yaml
stringData:
  MONGO_URL: "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eduzap"
```

### Step 2 — Skip MongoDB files (not needed)
```bash
kubectl apply -f eduzap-secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

> `mongodb-secret.yaml`, `mongodb-pvc.yaml`, and `mongodb.yaml` are NOT needed
> when using Atlas — MongoDB runs externally.

### Step 3 — Verify connection
```bash
kubectl logs -l app=eduzap-server --tail=5
# Should show: Database connected successfully
```

---

## Scenario 3 — Apply Everything at Once (using a folder)

If all your manifests are in one folder:
```bash
kubectl apply -f ./
```

> ⚠ This applies files in alphabetical order which may cause issues if secrets
> don't exist before the deployment tries to read them. Use the ordered approach
> in Scenario 1 if you hit errors.

---

## Useful Commands

### Check status
```bash
# All resources
kubectl get all

# Just pods
kubectl get pods

# Services and ports
kubectl get svc

# Detailed pod info (good for debugging)
kubectl describe pod <pod-name>
```

### View logs
```bash
# Logs for a specific pod
kubectl logs <pod-name>

# Logs for all app pods (last 20 lines)
kubectl logs -l app=eduzap-server --tail=20

# Follow logs live
kubectl logs -f <pod-name>
```

### Restart the app (after config/secret changes)
```bash
kubectl rollout restart deployment/eduzap-server
```

### Check rollout status
```bash
kubectl rollout status deployment/eduzap-server
```

### Update the image (new version)
```bash
kubectl set image deployment/eduzap-server eduzap-server=suresh0750/eduzap-server:1.2
```

### Scale replicas
```bash
kubectl scale deployment/eduzap-server --replicas=5
```

### Port-forward for local testing (without NodePort)
```bash
kubectl port-forward svc/eduzap-server-service 3000:3000
# Now access: http://localhost:3000/health
```

### Delete all eduzap resources
```bash
kubectl delete -f deployment.yaml
kubectl delete -f service.yaml
kubectl delete -f configmap.yaml
kubectl delete -f eduzap-secret.yaml
```

### Delete MongoDB and its data
```bash
kubectl delete -f mongodb.yaml
kubectl delete -f mongodb-pvc.yaml   # WARNING: deletes all MongoDB data
kubectl delete -f mongodb-secret.yaml
```

---

## Troubleshooting

| Error in logs | Cause | Fix |
|---------------|-------|-----|
| `uri is undefined` | `MONGO_URL` env var not injected | Check `eduzap-secret.yaml` name matches `deployment.yaml` secretKeyRef |
| `Authentication failed` | Wrong username/password in MONGO_URL | Make sure `eduzap-secret.yaml` credentials match `mongodb-secret.yaml` |
| `EAI_AGAIN mongodb-service` | DNS can't find the MongoDB Service | Make sure `mongodb.yaml` is applied and the service name is `mongodb-service` |
| `ECONNREFUSED` | MongoDB pod not running | Run `kubectl get pods` — reapply `mongodb.yaml` if missing |
| `ImagePullBackOff` | Wrong image tag or not pushed | Run `docker push` with the correct tag matching `deployment.yaml` |
| `CrashLoopBackOff` | App crashing on startup | Run `kubectl logs <pod>` to see the actual error |

---

## Important Notes

- The `.env` file is for **local development only**. It is listed in `.dockerignore`
  and does not exist inside the Docker image. All env vars in k8s must come from
  ConfigMaps or Secrets.
- Always apply **Secrets before Deployments**. If a Secret referenced in a
  Deployment doesn't exist, the pod will fail to start.
- After changing a Secret or ConfigMap, you must restart the deployment:
  ```bash
  kubectl rollout restart deployment/eduzap-server
  ```
- The `mongodb-pvc.yaml` PVC will **not be deleted** when you delete the MongoDB
  Deployment. Delete it explicitly only if you want to wipe the data.
