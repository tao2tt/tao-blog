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

## 📝 待办事项

- [ ] GitHub Actions 配置
- [ ] Jenkins 流水线编写
- [ ] Docker 镜像构建
- [ ] K8s 部署配置
- [ ] 自动化测试集成
- [ ] 监控告警配置
- [ ] 回滚方案制定

---

**推荐资源：**
- 📖 GitHub Actions 官方文档
- 📖 Jenkins 官方文档
- 🔗 https://github.com/actions
