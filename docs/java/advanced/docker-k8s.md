# Docker & K8s

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-05-25

---

## 📚 目录

[[toc]]

---

## 1. Docker 基础

### 1.1 核心概念

| 概念 | 说明 |
|------|------|
| 镜像（Image） | 只读模板，包含应用及依赖 |
| 容器（Container） | 镜像的运行实例 |
| 仓库（Registry） | 存储镜像的地方（Docker Hub） |
| Dockerfile | 构建镜像的脚本 |

### 1.2 常用命令

```bash
# 镜像操作
docker pull nginx:latest
docker images
docker rmi image_id

# 容器操作
docker run -d -p 8080:80 --name my-nginx nginx
docker ps
docker stop/start/restart container_id
docker rm container_id
docker logs container_id
docker exec -it container_id bash

# 构建镜像
docker build -t myapp:1.0 .

# 查看资源使用
docker stats
docker inspect container_id
```

### 1.3 Dockerfile 示例

```dockerfile
# 基础镜像
FROM openjdk:17-jdk-slim

# 作者信息
LABEL maintainer="tao@example.com"

# 设置工作目录
WORKDIR /app

# 复制文件
COPY target/myapp.jar app.jar

# 暴露端口
EXPOSE 8080

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]

# 构建参数
ARG VERSION=1.0
ENV APP_VERSION=$VERSION
```

### 1.4 多阶段构建

```dockerfile
# 构建阶段
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 2. Docker Compose

### 2.1 配置文件

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
    depends_on:
      - mysql
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs
    restart: always
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: mydb
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - app-network
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql-data:
```

### 2.2 常用命令

```bash
docker-compose up -d          # 后台启动
docker-compose down           # 停止并删除
docker-compose ps             # 查看状态
docker-compose logs -f        # 查看日志
docker-compose restart        # 重启
docker-compose build          # 重新构建
```

---

## 3. Kubernetes 基础

### 3.1 核心概念

| 概念 | 说明 |
|------|------|
| Pod | 最小调度单元，包含一个或多个容器 |
| Deployment | 管理 Pod 的副本和更新 |
| Service | 服务发现和负载均衡 |
| ConfigMap | 配置管理 |
| Secret | 敏感信息管理 |
| Ingress | 外部访问入口 |
| Namespace | 资源隔离 |

### 3.2 Pod 配置

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    ports:
    - containerPort: 8080
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    livenessProbe:
      httpGet:
        path: /actuator/health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /actuator/health
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
```

### 3.3 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db.host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db.password
```

### 3.4 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP  # ClusterIP, NodePort, LoadBalancer

---
# NodePort 示例
apiVersion: v1
kind: Service
metadata:
  name: myapp-nodeport
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
  type: NodePort
```

### 3.5 Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

---

## 4. 常用命令

```bash
# 集群信息
kubectl cluster-info
kubectl get nodes
kubectl version

# 资源管理
kubectl get pods/deployments/services
kubectl create/delete -f file.yaml
kubectl apply -f file.yaml

# 查看详细信息
kubectl describe pod myapp-pod
kubectl logs myapp-pod
kubectl logs -f myapp-pod  # 跟踪日志

# 进入容器
kubectl exec -it myapp-pod -- bash

# 扩缩容
kubectl scale deployment myapp --replicas=5

# 滚动更新
kubectl set image deployment/myapp myapp=myapp:2.0
kubectl rollout status deployment/myapp
kubectl rollout undo deployment/myapp

# 配置管理
kubectl create configmap app-config --from-literal=db.host=mysql
kubectl create secret generic app-secret --from-literal=db.password=123
```

---

## 5. Helm

### 5.1  Chart 结构

```
my-chart/
├── Chart.yaml          # Chart 元信息
├── values.yaml         # 默认配置
├── charts/             # 依赖 Charts
└── templates/          # K8s 资源模板
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

### 5.2 常用命令

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm search repo nginx
helm install my-release bitnami/nginx
helm list
helm upgrade my-release bitnami/nginx --set image.tag=1.20
helm uninstall my-release
```

---

## 6. 最佳实践

### 6.1 镜像优化

```dockerfile
# 使用小基础镜像
FROM alpine:3.18

# 清理缓存
RUN apt-get update && apt-get install -y xxx \
    && rm -rf /var/lib/apt/lists/*

# 多阶段构建减少最终镜像大小
```

### 6.2 健康检查

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

### 6.3 资源限制

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

---

## 7. 生产环境部署

### 7.1 完整 CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: harbor.example.com
  APP_NAME: mall-user

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      run: mvn clean package -DskipTests
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.APP_NAME }}:latest
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
    - name: Deploy to K8s
      uses: azure/k8s-deploy@v4
      with:
        namespace: production
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
          k8s/ingress.yaml
        images: |
          ${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }}
```

### 7.2 生产 Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mall-user
  namespace: production
  labels:
    app: mall-user
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: mall-user
  template:
    metadata:
      labels:
        app: mall-user
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: mall-user
              topologyKey: kubernetes.io/hostname
      containers:
      - name: mall-user
        image: harbor.example.com/mall-user:v1.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9999
          name: debug
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: prod
        - name: JAVA_OPTS
          value: "-Xms1g -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db.host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db.password
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: logs
        emptyDir: {}
      - name: tmp
        emptyDir: {}
      terminationGracePeriodSeconds: 60
```

### 7.3 HPA 自动扩缩容

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mall-user-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mall-user
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
```

### 7.4 配置中心

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  db.host: "mysql.production.svc.cluster.local"
  db.port: "3306"
  db.name: "mall"
  redis.host: "redis.production.svc.cluster.local"
  redis.port: "6379"
  nacos.server: "nacos.production.svc.cluster.local:8848"
  sentinel.server: "sentinel.production.svc.cluster.local:8080"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: production
type: Opaque
stringData:
  db.password: "YourDbPassword123!"
  redis.password: "YourRedisPassword123!"
  jwt.secret: "YourJwtSecretKey123456789"
```

---

## 8. 运维管理

### 8.1 常用命令

```bash
# 查看资源
kubectl get pods -n production
kubectl get deployments -n production
kubectl get services -n production
kubectl get ingress -n production
kubectl get configmap -n production
kubectl get secrets -n production

# 查看详情
kubectl describe pod mall-user-xxx -n production
kubectl describe deployment mall-user -n production

# 查看日志
kubectl logs -f deployment/mall-user -n production
kubectl logs -f deployment/mall-user -c mall-user -n production

# 进入容器
kubectl exec -it deployment/mall-user -n production -- bash

# 扩缩容
kubectl scale deployment mall-user --replicas=5 -n production

# 滚动更新
kubectl set image deployment/mall-user mall-user=harbor.example.com/mall-user:v2.0 -n production
kubectl rollout status deployment/mall-user -n production

# 回滚
kubectl rollout history deployment/mall-user -n production
kubectl rollout undo deployment/mall-user -n production
kubectl rollout undo deployment/mall-user --to-revision=2 -n production

# 资源使用
kubectl top pods -n production
kubectl top nodes

# 故障排查
kubectl get events -n production --sort-by='.lastTimestamp'
```

### 8.2 监控告警

```yaml
# Prometheus ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: mall-user
  namespace: production
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: mall-user
  namespaceSelector:
    matchNames:
    - production
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s

# Grafana 告警规则
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: mall-alerts
  namespace: production
spec:
  groups:
  - name: mall
    rules:
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 * 5 > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} 频繁重启"
    
    - alert: PodNotReady
      expr: kube_pod_status_ready{condition="true"} == 0
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pod {{ $labels.pod }} 未就绪"
    
    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "容器内存使用率超过 90%"
```

---

## 📝 实战清单

**Docker 基础：**
- [ ] Docker 安装与配置
- [ ] 镜像操作（pull/push/build）
- [ ] 容器操作（run/exec/logs）
- [ ] Dockerfile 编写
- [ ] 多阶段构建优化
- [ ] Docker Compose 编排

**K8s 核心：**
- [ ] K8s 集群搭建（kubeadm/k3s）
- [ ] Pod 配置与调度
- [ ] Deployment 部署
- [ ] Service 服务发现
- [ ] ConfigMap/Secret 配置管理
- [ ] Ingress 外部访问

**生产就绪：**
- [ ] 健康检查配置（liveness/readiness）
- [ ] 资源限制（requests/limits）
- [ ] HPA 自动扩缩容
- [ ] 滚动更新策略
- [ ] 亲和性配置（podAntiAffinity）
- [ ] 优雅停机（terminationGracePeriodSeconds）

**CI/CD：**
- [ ] GitHub Actions 配置
- [ ] 镜像构建与推送
- [ ] K8s 自动部署
- [ ] 灰度发布策略

**监控运维：**
- [ ] Prometheus 监控
- [ ] Grafana 可视化
- [ ] 告警规则配置
- [ ] 日志收集（EFK）
- [ ] 链路追踪（SkyWalking/Jaeger）

---

**推荐资源：**
- 📚 《Kubernetes 权威指南》
- 📚 《Docker 技术入门与实战》
- 📖 Docker 官方文档：https://docs.docker.com
- 📖 Kubernetes 官方文档：https://kubernetes.io
- 🎥 B 站：Kubernetes 从入门到实战
