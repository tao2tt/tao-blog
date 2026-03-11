# CI/CD

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-05

---

## 📚 目录

[[toc]]

---

## 1. CI/CD 概述

### 1.1 核心概念

| 概念 | 说明 |
|------|------|
| CI（持续集成） | 频繁提交代码，自动构建测试 |
| CD（持续交付） | 自动部署到测试/预发环境 |
| CD（持续部署） | 自动部署到生产环境 |

### 1.2 流水线流程

```
代码提交 → 代码检查 → 编译构建 → 单元测试 → 打包 → 部署 → 验证
```

---

## 2. GitHub Actions

### 2.1 工作流配置

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      run: mvn clean compile
    
    - name: Run tests
      run: mvn test
    
    - name: Code quality check
      run: mvn checkstyle:check
  
  package:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Package
      run: mvn clean package -DskipTests
    
    - name: Upload artifact
      uses: actions/upload-artifact@v4
      with:
        name: app
        path: target/*.jar
  
  deploy:
    needs: package
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download artifact
      uses: actions/download-artifact@v4
      with:
        name: app
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          sudo systemctl stop myapp
          sudo cp app.jar /opt/myapp/
          sudo systemctl start myapp
```

### 2.2 环境变量与密钥

```yaml
env:
  APP_NAME: myapp
  REGISTRY: ghcr.io

jobs:
  build:
    steps:
    - name: Login to Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
```

---

## 3. Jenkins

### 3.1 Jenkinsfile（声明式）

```groovy
pipeline {
    agent any
    
    environment {
        APP_NAME = 'myapp'
        REGISTRY = 'harbor.example.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/tao2tt/myapp.git',
                    credentialsId: 'github-credentials'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
                junit 'target/surefire-reports/*.xml'
            }
        }
        
        stage('Code Quality') {
            steps {
                sh 'mvn checkstyle:check'
                sh 'mvn sonar:sonar -Dsonar.host.url=${SONAR_URL}'
            }
        }
        
        stage('Package') {
            steps {
                sh 'mvn clean package -DskipTests'
                archiveArtifacts artifacts: 'target/*.jar'
            }
        }
        
        stage('Build Image') {
            steps {
                script {
                    docker.build("${REGISTRY}/${APP_NAME}:${BUILD_ID}")
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    docker push ${REGISTRY}/${APP_NAME}:${BUILD_ID}
                    ssh user@server "docker pull ${REGISTRY}/${APP_NAME}:${BUILD_ID} && docker restart ${APP_NAME}"
                '''
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
            // 发送通知
        }
    }
}
```

---

## 4. Docker 部署

### 4.1 Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/myapp.jar app.jar

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 4.2 Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
    depends_on:
      mysql:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql-data:
```

---

## 5. K8s 部署

### 5.1 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
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
        image: harbor.example.com/myapp:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: prod
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
```

### 5.2 滚动更新

```bash
# 更新镜像
kubectl set image deployment/myapp myapp=myapp:v2.0

# 查看状态
kubectl rollout status deployment/myapp

# 回滚
kubectl rollout undo deployment/myapp

# 查看历史
kubectl rollout history deployment/myapp
```

---

## 6. 最佳实践

### 6.1 构建优化

```yaml
# 使用缓存
- uses: actions/cache@v4
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}

# 并行构建
jobs:
  test:
    strategy:
      matrix:
        test-group: [unit, integration]
    steps:
    - run: mvn test -Dtest=${{ matrix.test-group }}
```

### 6.2 部署策略

```yaml
# 蓝绿部署
spec:
  strategy:
    type: Recreate  # 先停后启

# 滚动更新
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

### 6.3 监控告警

```yaml
# Prometheus 监控
monitoring:
  enabled: true
  scrapeInterval: 30s
  alerting:
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.1
        for: 5m
```

---

## 5. 实战：电商系统 CI/CD

### 5.1 完整流水线设计

```
代码提交 → 代码检查 → 编译构建 → 单元测试 → 集成测试 → 
打包镜像 → 推送仓库 → 部署测试 → 自动化测试 → 部署生产
```

### 5.2 多环境部署策略

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [develop, main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: harbor.example.com
  APP_NAME: mall-user

jobs:
  # ========== 代码质量 ==========
  code-quality:
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
    
    - name: Checkstyle
      run: mvn checkstyle:check
    
    - name: Spotless Check
      run: mvn spotless:check
    
    - name: SonarQube Scan
      run: mvn sonar:sonar
      env:
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # ========== 编译测试 ==========
  build-test:
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Compile
      run: mvn clean compile
    
    - name: Unit Test
      run: mvn test
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        file: target/site/jacoco/jacoco.xml
    
    - name: Integration Test
      run: mvn verify -Pintegration-test
      env:
        TEST_DB_URL: ${{ secrets.TEST_DB_URL }}
        TEST_REDIS_URL: ${{ secrets.TEST_REDIS_URL }}

  # ========== 打包镜像 ==========
  build-image:
    runs-on: ubuntu-latest
    needs: build-test
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Build Package
      run: mvn clean package -DskipTests
    
    - name: Build Docker Image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile
        push: false
        tags: ${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }}
    
    - name: Scan Image
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }}
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Scan Results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  # ========== 部署测试环境 ==========
  deploy-dev:
    runs-on: ubuntu-latest
    needs: build-image
    if: github.ref == 'refs/heads/develop'
    environment: development
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup K8s
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.29.0'
      env:
        KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_DEV }}
    
    - name: Deploy to Dev
      run: |
        kubectl set image deployment/${{ env.APP_NAME }} \
          ${{ env.APP_NAME }}=${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }} \
          -n development
        kubectl rollout status deployment/${{ env.APP_NAME }} -n development
    
    - name: Smoke Test
      run: |
        curl -f http://dev-api.example.com/actuator/health || exit 1

  # ========== 部署预发环境 ==========
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-image
    if: startsWith(github.ref, 'refs/tags/v')
    environment: staging
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup K8s
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.29.0'
      env:
        KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_STAGING }}
    
    - name: Deploy to Staging
      run: |
        kubectl set image deployment/${{ env.APP_NAME }} \
          ${{ env.APP_NAME }}=${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }} \
          -n staging
        kubectl rollout status deployment/${{ env.APP_NAME }} -n staging
    
    - name: Integration Test
      run: |
        npm install -g newman
        newman run tests/postman_collection.json \
          --environment tests/staging_environment.json

  # ========== 部署生产环境 ==========
  deploy-prod:
    runs-on: ubuntu-latest
    needs: [build-image, deploy-staging]
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup K8s
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.29.0'
      env:
        KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_PROD }}
    
    - name: Deploy to Prod (Canary)
      run: |
        # 金丝雀发布：先发布 1 个副本
        kubectl scale deployment/${{ env.APP_NAME }} --replicas=1 -n production
        kubectl set image deployment/${{ env.APP_NAME }} \
          ${{ env.APP_NAME }}=${{ env.REGISTRY }}/${{ env.APP_NAME }}:${{ github.sha }} \
          -n production
        kubectl rollout status deployment/${{ env.APP_NAME }} -n production
        
        # 观察 5 分钟
        sleep 300
        
        # 检查指标
        ERROR_RATE=$(curl -s http://prometheus:9090/api/v1/query?query=error_rate | jq '.data.result[0].value[1]')
        if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
          echo "错误率过高，自动回滚"
          kubectl rollout undo deployment/${{ env.APP_NAME }} -n production
          exit 1
        fi
        
        # 全量发布
        kubectl scale deployment/${{ env.APP_NAME }} --replicas=3 -n production
    
    - name: Notify
      if: success()
      run: |
        curl -X POST ${{ secrets.DINGTALK_WEBHOOK }} \
          -H 'Content-Type: application/json' \
          -d '{
            "msgtype": "text",
            "text": {
              "content": "🎉 生产部署成功：${{ env.APP_NAME }} ${{ github.sha }}"
            }
          }'
```

### 5.3 Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        REGISTRY = 'harbor.example.com'
        APP_NAME = 'mall-user'
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-creds')
        KUBE_CONFIG = credentials('kube-config-prod')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Checkstyle') {
                    steps {
                        sh 'mvn checkstyle:check'
                    }
                }
                stage('Spotless') {
                    steps {
                        sh 'mvn spotless:check'
                    }
                }
                stage('SonarQube') {
                    steps {
                        withSonarQubeEnv('SonarQube') {
                            sh 'mvn sonar:sonar'
                        }
                    }
                }
            }
        }
        
        stage('Build & Test') {
            steps {
                sh 'mvn clean compile'
                sh 'mvn test'
                junit 'target/surefire-reports/*.xml'
                jacoco execPattern: 'target/jacoco.exec'
            }
        }
        
        stage('Integration Test') {
            steps {
                withCredentials([
                    string(credentialsId: 'test-db-url', variable: 'TEST_DB_URL'),
                    string(credentialsId: 'test-redis-url', variable: 'TEST_REDIS_URL')
                ]) {
                    sh 'mvn verify -Pintegration-test'
                }
            }
        }
        
        stage('Build Image') {
            steps {
                script {
                    docker.build("${REGISTRY}/${APP_NAME}:${BUILD_ID}")
                }
            }
        }
        
        stage('Scan Image') {
            steps {
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy image \
                      ${REGISTRY}/${APP_NAME}:${BUILD_ID}
                '''
            }
        }
        
        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", 'harbor-creds') {
                        docker.image("${REGISTRY}/${APP_NAME}:${BUILD_ID}").push()
                        docker.image("${REGISTRY}/${APP_NAME}:${BUILD_ID}").push('latest')
                    }
                }
            }
        }
        
        stage('Deploy Dev') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    kubectl set image deployment/${APP_NAME} \
                      ${APP_NAME}=${REGISTRY}/${APP_NAME}:${BUILD_ID} \
                      -n development
                    kubectl rollout status deployment/${APP_NAME} -n development
                '''
            }
        }
        
        stage('Deploy Prod') {
            when {
                expression { return env.GIT_TAG.startsWith('v') }
            }
            steps {
                input message: '确认部署到生产？', ok: '确认部署'
                sh '''
                    # 金丝雀发布
                    kubectl scale deployment/${APP_NAME} --replicas=1 -n production
                    kubectl set image deployment/${APP_NAME} \
                      ${APP_NAME}=${REGISTRY}/${APP_NAME}:${BUILD_ID} \
                      -n production
                    kubectl rollout status deployment/${APP_NAME} -n production
                    
                    # 观察
                    sleep 300
                    
                    # 全量发布
                    kubectl scale deployment/${APP_NAME} --replicas=3 -n production
                '''
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            script {
                currentBuild.result = 'SUCCESS'
            }
        }
        failure {
            echo 'Pipeline failed!'
            script {
                currentBuild.result = 'FAILURE'
                // 发送通知
                emailext (
                    subject: "构建失败：${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                    body: "请查看：${env.BUILD_URL}",
                    to: 'team@example.com'
                )
            }
        }
    }
}
```

### 5.4 蓝绿部署

```yaml
# k8s/blue-green-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: mall-user-active
  namespace: production
spec:
  selector:
    app: mall-user
    version: blue  # 或 green
  ports:
  - port: 80
    targetPort: 8080

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mall-user-blue
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mall-user
      version: blue
  template:
    metadata:
      labels:
        app: mall-user
        version: blue
    spec:
      containers:
      - name: mall-user
        image: harbor.example.com/mall-user:v2.0
        ports:
        - containerPort: 8080

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mall-user-green
  namespace: production
spec:
  replicas: 0  # 初始为 0
  selector:
    matchLabels:
      app: mall-user
      version: green
  template:
    metadata:
      labels:
        app: mall-user
        version: green
    spec:
      containers:
      - name: mall-user
        image: harbor.example.com/mall-user:v2.0
        ports:
        - containerPort: 8080
```

```bash
# 切换流量脚本
#!/bin/bash
# switch-traffic.sh

VERSION=$1  # blue 或 green

# 切换 Service 选择器
kubectl patch service mall-user-active \
  -n production \
  -p '{"spec":{"selector":{"version":"'$VERSION'"}}}'

echo "流量已切换到 $VERSION"

# 验证
kubectl get pods -l version=$VERSION -n production
```

### 5.5 回滚方案

```bash
#!/bin/bash
# rollback.sh

NAMESPACE=$1
APP_NAME=$2
REVISION=${3:-0}  # 0 表示回滚到上一个版本

echo "开始回滚：$APP_NAME (namespace: $NAMESPACE, revision: $REVISION)"

# 查看历史
kubectl rollout history deployment/$APP_NAME -n $NAMESPACE

# 执行回滚
if [ $REVISION -eq 0 ]; then
    kubectl rollout undo deployment/$APP_NAME -n $NAMESPACE
else
    kubectl rollout undo deployment/$APP_NAME --to-revision=$REVISION -n $NAMESPACE
fi

# 等待完成
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE

# 验证
kubectl get pods -l app=$APP_NAME -n $NAMESPACE
kubectl get deployment $APP_NAME -n $NAMESPACE -o yaml | grep image

echo "回滚完成"
```

---

## 6. 监控告警

### 6.1 Prometheus 配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node

rule_files:
  - 'alerts/*.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 6.2 告警规则

```yaml
# alerts/deployment.yml
groups:
  - name: deployment
    rules:
      - alert: DeploymentReplicasMismatch
        expr: kube_deployment_spec_replicas != kube_deployment_status_replicas_available
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Deployment 副本数不匹配"
          description: "Deployment {{ $labels.deployment }} 期望 {{ $value }} 个副本，实际 {{ $value }}"
      
      - alert: DeploymentRolloutStuck
        expr: kube_deployment_status_condition{condition="Progressing",status="false"} == 1
        for: 15m
        labels:
          severity: critical
        annotations:
          summary: "Deployment 滚动更新卡住"
          description: "Deployment {{ $labels.deployment }} 滚动更新超过 15 分钟未完成"
      
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 * 5 > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod 频繁重启"
          description: "Pod {{ $labels.pod }} 5 分钟内重启超过 5 次"
      
      - alert: PodNotReady
        expr: kube_pod_status_ready{condition="true"} == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Pod 未就绪"
          description: "Pod {{ $labels.pod }} 超过 5 分钟未就绪"
```

### 6.3 通知配置

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alertmanager@example.com'
  smtp_auth_username: 'alertmanager@example.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'dingtalk-critical'
    - match:
        severity: warning
      receiver: 'dingtalk-warning'

receivers:
  - name: 'default'
    email_configs:
      - to: 'team@example.com'
        send_resolved: true
  
  - name: 'dingtalk-critical'
    webhook_configs:
      - url: 'http://dingtalk-webhook:8080/dingtalk/webhook1'
        send_resolved: true
  
  - name: 'dingtalk-warning'
    webhook_configs:
      - url: 'http://dingtalk-webhook:8080/dingtalk/webhook2'
        send_resolved: true
```

---

## 📝 实战清单

**CI/CD 平台：**
- [ ] GitHub Actions 配置
- [ ] Jenkins Pipeline 编写
- [ ] GitLab CI 配置
- [ ] ArgoCD 部署（GitOps）

**构建流程：**
- [ ] 代码检查（Checkstyle/Spotless）
- [ ] 单元测试
- [ ] 集成测试
- [ ] 代码覆盖率
- [ ] SonarQube 分析
- [ ] 安全扫描（Trivy）

**镜像管理：**
- [ ] Dockerfile 优化
- [ ] 多阶段构建
- [ ] 镜像仓库（Harbor）
- [ ] 镜像扫描
- [ ] 镜像版本管理

**部署策略：**
- [ ] 滚动更新
- [ ] 蓝绿部署
- [ ] 金丝雀发布
- [ ] A/B 测试
- [ ] 特性开关

**环境管理：**
- [ ] 开发环境
- [ ] 测试环境
- [ ] 预发环境
- [ ] 生产环境
- [ ] 环境隔离

**监控告警：**
- [ ] Prometheus 配置
- [ ] Grafana 可视化
- [ ] 告警规则配置
- [ ] 通知渠道（钉钉/企业微信/邮件）
- [ ] 告警分级

**回滚方案：**
- [ ] 快速回滚脚本
- [ ] 版本管理
- [ ] 配置回滚
- [ ] 数据回滚预案

**最佳实践：**
- [ ] 主干开发（Trunk Based）
- [ ] 小步提交
- [ ] 自动化测试
- [ ] 不可变基础设施
- [ ] 基础设施即代码（IaC）

---

**推荐资源：**
- 📖 GitHub Actions 官方文档：https://docs.github.com/actions
- 📖 Jenkins 官方文档：https://www.jenkins.io/doc/
- 📖 Kubernetes 官方文档：https://kubernetes.io
- 📚 《持续交付：发布可靠软件的系统方法》
- 📚 《Google SRE 工作手册》
- 🔗 GitOps：https://opengitops.dev
- 🛠️ ArgoCD：https://argoproj.github.io/cd/
