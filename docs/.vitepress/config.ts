import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/tao-blog/',
  srcDir: '.',
  outDir: '.vitepress/dist',
  title: '涛哥的技术博客',
  titleTemplate: ':title - 涛哥的技术博客',
  description: 'Java 研发工程师的工作和学习记录，涵盖 Java 基础、Spring 框架、Redis、消息队列、Elasticsearch、AI 应用开发等技术内容',
  head: [
    ['meta', { name: 'keywords', content: 'Java,Spring,Redis，消息队列，Elasticsearch,AI，大模型，技术博客，后端开发' }],
    ['meta', { name: 'author', content: '涛哥' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
  ],
  markdown: {
    // 启用标题锚点
    anchor: {
      pattern: /^h[1-6]$/
    }
  },
  // 忽略死链检查（允许链接到未创建的页面）
  ignoreDeadLinks: true,
  lastUpdated: true,
  themeConfig: {
    // 启用本地搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },
    // 启用右侧目录
    outline: {
      level: [2, 3],
      label: '目录'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java 基础', link: '/java/basic/' },
      { text: 'Java 进阶', link: '/java/advanced/' },
      { text: '数据结构与算法', link: '/data-structure-algorithm/' },
      { text: 'AI 学习', link: '/ai/' },
      { text: '技术沉淀', link: '/work/' },
      { text: '上线记录', link: '/deploy/' },
      { text: '关于我', link: '/about/' }
    ],
    sidebar: {
      '/java/basic/': [
        { text: 'Java 核心语法', link: '/java/basic/core' },
        { text: '集合框架', link: '/java/basic/collections' },
        { text: '多线程与并发', link: '/java/basic/concurrency' },
        { text: 'JVM 基础', link: '/java/basic/jvm' }
      ],
      '/java/advanced/': [
        {
          text: '核心框架',
          collapsed: false,
          items: [
            { text: 'Spring/SpringBoot', link: '/java/advanced/spring' },
            { text: 'Spring Cloud', link: '/java/advanced/spring-cloud' },
            { text: 'Spring Security', link: '/java/advanced/spring-security' },
            { text: 'MyBatis', link: '/java/advanced/mybatis' },
            { text: 'MyBatis-Plus', link: '/java/advanced/mybatis-plus' }
          ]
        },
        {
          text: '中间件',
          collapsed: false,
          items: [
            { text: 'Redis 核心', link: '/java/advanced/redis' },
            { text: 'Redis 高级', link: '/java/advanced/redis-advanced' },
            { text: '消息队列选型', link: '/java/advanced/mq' },
            { text: 'Elasticsearch 实战', link: '/java/advanced/es' }
          ]
        },
        {
          text: '数据库',
          collapsed: false,
          items: [
            { text: 'MySQL 进阶', link: '/java/advanced/mysql-advanced' },
            { text: '数据库优化', link: '/java/advanced/db' },
            { text: '分库分表', link: '/java/advanced/sharding' }
          ]
        },
        {
          text: '工程效能',
          collapsed: false,
          items: [
            { text: '单元测试', link: '/java/advanced/unit-test' },
            { text: '代码规范', link: '/java/advanced/code-style' },
            { text: 'CI/CD', link: '/java/advanced/cicd' },
            { text: 'Docker & K8s', link: '/java/advanced/docker-k8s' }
          ]
        },
        {
          text: '性能与排查',
          collapsed: false,
          items: [
            { text: 'JVM 调优', link: '/java/advanced/jvm-tuning' },
            { text: '性能优化', link: '/java/advanced/performance' },
            { text: '故障排查', link: '/java/advanced/troubleshooting' }
          ]
        },
        {
          text: '分布式',
          collapsed: false,
          items: [
            { text: '分布式事务', link: '/java/advanced/distributed-transaction' },
            { text: '分布式锁', link: '/java/advanced/distributed-lock' },
            { text: '限流熔断', link: '/java/advanced/rate-limit' }
          ]
        }
      ],
      '/work/': [
        { text: '技术方案', link: '/work/tech-design' },
        { text: '项目复盘', link: '/work/project-review' },
        { text: '业务挑战', link: '/work/business-challenge' },
        { text: '性能优化', link: '/work/performance' },
        { text: '故障排查', link: '/work/troubleshooting' }
      ],
      '/deploy/': [
        { text: '上线记录总览', link: '/deploy/' },
        { text: '2026 年', link: '/deploy/2026/' }
      ],
      '/ai/': [
        { text: 'AI 入门', link: '/ai/intro' },
        { text: 'Prompt 工程', link: '/ai/prompt' },
        { text: 'AI Agent', link: '/ai/agent' },
        { text: '实战项目', link: '/ai/project' }
      ],
      '/data-structure-algorithm/': [
        {
          text: '基础篇',
          collapsed: false,
          items: [
            { text: '学习路线', link: '/data-structure-algorithm/' },
            { text: '复杂度分析', link: '/data-structure-algorithm/basic/complexity' },
            { text: '数组与链表', link: '/data-structure-algorithm/basic/array-list' },
            { text: '栈与队列', link: '/data-structure-algorithm/basic/stack-queue' },
            { text: '哈希表', link: '/data-structure-algorithm/basic/hash-table' }
          ]
        },
        {
          text: '进阶篇',
          collapsed: true,
          items: [
            { text: '树与二叉树', link: '/data-structure-algorithm/advanced/tree' },
            { text: '堆与优先队列', link: '/data-structure-algorithm/advanced/heap' },
            { text: '图论基础', link: '/data-structure-algorithm/advanced/graph' },
            { text: '跳表与 B 树', link: '/data-structure-algorithm/advanced/skip-list-b-tree' }
          ]
        },
        {
          text: '算法篇',
          collapsed: true,
          items: [
            { text: '排序算法', link: '/data-structure-algorithm/algorithm/sorting' },
            { text: '查找算法', link: '/data-structure-algorithm/algorithm/searching' },
            { text: '递归与分治', link: '/data-structure-algorithm/algorithm/recursion' },
            { text: '贪心算法', link: '/data-structure-algorithm/algorithm/greedy' },
            { text: '动态规划', link: '/data-structure-algorithm/algorithm/dp' },
            { text: '回溯算法', link: '/data-structure-algorithm/algorithm/backtracking' }
          ]
        },
        {
          text: '实战篇',
          collapsed: true,
          items: [
            { text: 'LeetCode 高频 100 道', link: '/data-structure-algorithm/practice/leetcode-100' },
            { text: '业务场景应用', link: '/data-structure-algorithm/practice/business-scenario' },
            { text: '性能优化案例', link: '/data-structure-algorithm/practice/performance' }
          ]
        }
      ],
      '/about/': [
        { text: '关于我', link: '/about/' },
        { text: '学习规划', link: '/about/plan' }
      ]
    },
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tao2tt' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/your-profile' },
    ],
    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 涛哥'
    }
  }
})
