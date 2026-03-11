import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/tao-blog/',
  title: '涛哥的技术博客',
  description: 'Java 研发工程师的工作和学习记录',
  markdown: {
    // 启用标题锚点
    anchor: {
      pattern: /^h[1-6]$/
    }
  },
  // 忽略死链检查（允许链接到未创建的页面）
  ignoreDeadLinks: true,
  themeConfig: {
    // 启用右侧目录
    outline: {
      level: [2, 3],
      label: '目录'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java 基础', link: '/java/basic/' },
      { text: 'Java 进阶', link: '/java/advanced/' },
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
      '/about/': [
        { text: '关于我', link: '/about/' },
        { text: '学习规划', link: '/about/plan' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-github' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 涛哥'
    }
  }
})
