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

<script setup>
import { ref, onMounted } from 'vue'

// 博客统计
const stats = ref({
  articles: 67,
  categories: 8,
  words: '10w+'
})

// 最近更新的文章
const recentPosts = ref([
  { title: 'Java 核心语法', link: '/java/basic/core', date: '2026-03-11', category: 'Java 基础' },
  { title: 'Java 集合框架', link: '/java/basic/collections', date: '2026-03-11', category: 'Java 基础' },
  { title: '多线程与并发', link: '/java/basic/concurrency', date: '2026-03-11', category: 'Java 基础' },
  { title: 'JVM 基础', link: '/java/basic/jvm', date: '2026-03-11', category: 'Java 基础' },
  { title: 'Spring/SpringBoot', link: '/java/advanced/spring', date: '2026-03-11', category: 'Java 进阶' },
  { title: 'Elasticsearch 实战', link: '/java/advanced/es', date: '2026-03-11', category: 'Java 进阶' },
  { title: 'AI Agent', link: '/ai/agent', date: '2026-03-11', category: 'AI 应用' },
  { title: '上线记录 2026-03-09', link: '/deploy/2026/20260309', date: '2026-03-09', category: '上线记录' },
])
</script>

## 📊 博客统计

<div class="stats-container">
  <div class="stat-item">
    <div class="stat-value">{{ stats.articles }}</div>
    <div class="stat-label">篇文章</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">{{ stats.categories }}</div>
    <div class="stat-label">个分类</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">{{ stats.words }}</div>
    <div class="stat-label">字数</div>
  </div>
</div>

---

## 📝 最近更新

<div class="recent-posts">
  <div v-for="post in recentPosts" :key="post.link" class="post-item">
    <div class="post-category">{{ post.category }}</div>
    <a :href="post.link" class="post-title">{{ post.title }}</a>
    <div class="post-date">{{ post.date }}</div>
  </div>
</div>

---

## 🎯 学习路线

```
Java 基础 → Java 进阶 → 数据结构与算法 → AI 应用 → 工作实战
```

### 阶段一：Java 基础 ☕
- 核心语法、集合框架、多线程与并发、JVM 基础

### 阶段二：Java 进阶 🚀
- Spring 全家桶、Redis、消息队列、Elasticsearch、MySQL 优化

### 阶段三：数据结构与算法 💻
- 基础数据结构、经典算法、LeetCode 实战

### 阶段四：AI 应用 🤖
- LLM 原理、Prompt 工程、AI Agent 开发

### 阶段五：工作实战 💼
- 技术方案、项目复盘、性能优化、故障排查

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

---

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

.recent-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  transition: background 0.2s;
}

.post-item:hover {
  background: var(--vp-c-bg-alt);
}

.post-category {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.post-title {
  flex: 1;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
}

.post-title:hover {
  color: var(--vp-c-brand);
}

.post-date {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  white-space: nowrap;
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
  
  .post-item {
    flex-wrap: wrap;
  }
  
  .post-date {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>
