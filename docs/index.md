---
layout: home
hero:
  name: 涛哥的技术博客
  text: Java 研发工程师的工作与学习记录
  tagline: 从 Java 基础到 AI 应用开发，记录成长之路
  actions:
    - theme: brand
      text: 开始阅读
      link: /java/basic/core
    - theme: alt
      text: 关于我
      link: /about/
features:
  - icon: ☕
    title: Java 基础
    details: 核心语法、集合、并发、JVM，打牢基础
  - icon: 🚀
    title: Java 进阶
    details: Spring、Redis、MQ、ES，企业级开发技能
  - icon: 🤖
    title: AI 应用
    details: LLM、Prompt 工程、AI Agent，拥抱新技术
  - icon: 💼
    title: 工作实战
    details: 项目复盘、技术方案、业务挑战，实战经验总结
---

## 📊 博客统计

<div class="stats-container">
  <div class="stat-item">
    <div class="stat-value">67</div>
    <div class="stat-label">篇文章</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">8</div>
    <div class="stat-label">个分类</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">10w+</div>
    <div class="stat-label">字数</div>
  </div>
</div>

---

## 📝 最近更新

- **2026-03-11** | [Java 核心语法](/java/basic/core) - Java 基础
- **2026-03-11** | [Java 集合框架](/java/basic/collections) - Java 基础
- **2026-03-11** | [多线程与并发](/java/basic/concurrency) - Java 基础
- **2026-03-11** | [JVM 基础](/java/basic/jvm) - Java 基础
- **2026-03-11** | [Spring/SpringBoot](/java/advanced/spring) - Java 进阶
- **2026-03-11** | [Elasticsearch 实战](/java/advanced/es) - Java 进阶
- **2026-03-11** | [AI Agent](/ai/agent) - AI 应用
- **2026-03-09** | [上线记录 2026-03-09](/deploy/2026/20260309) - 上线记录

---

## 🎯 学习路线

```
Java 基础 → Java 进阶 → 数据结构与算法 → AI 应用 → 工作实战
```

### 阶段一：Java 基础 ☕
核心语法、集合框架、多线程与并发、JVM 基础

### 阶段二：Java 进阶 🚀
Spring 全家桶、Redis、消息队列、Elasticsearch、MySQL 优化

### 阶段三：数据结构与算法 💻
基础数据结构、经典算法、LeetCode 实战

### 阶段四：AI 应用 🤖
LLM 原理、Prompt 工程、AI Agent 开发

### 阶段五：工作实战 💼
技术方案、项目复盘、性能优化、故障排查

---

## 🔥 热门推荐

<div class="featured-posts">
  <a href="/java/basic/concurrency" class="featured-card">
    <div class="card-icon">⚡</div>
    <div class="card-title">多线程与并发</div>
    <div class="card-desc">ThreadLocal、synchronized、AQS、线程池详解</div>
  </a>
  <a href="/java/advanced/redis" class="featured-card">
    <div class="card-icon">🔴</div>
    <div class="card-title">Redis 核心</div>
    <div class="card-desc">数据结构、持久化、高可用、分布式锁</div>
  </a>
  <a href="/java/advanced/es" class="featured-card">
    <div class="card-icon">🔍</div>
    <div class="card-title">Elasticsearch 实战</div>
    <div class="card-desc">索引设计、查询优化、同步方案</div>
  </a>
  <a href="/ai/agent" class="featured-card">
    <div class="card-icon">🤖</div>
    <div class="card-title">AI Agent</div>
    <div class="card-desc">Agent 架构、工具调用、实战项目</div>
  </a>
</div>

---

## 📬 订阅更新

- 🌟 **GitHub**: [github.com/tao2tt/tao-blog](https://github.com/tao2tt/tao-blog)
- 📮 **Issues**: [留言反馈](https://github.com/tao2tt/tao-blog/issues)

<style>
.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 2rem 0;
  text-align: center;
}

.stat-item {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.featured-posts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.featured-card {
  display: block;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid var(--vp-c-divider);
}

.featured-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.card-desc {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
}
</style>
