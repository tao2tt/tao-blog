import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '涛哥的技术博客',
  description: 'Java 研发工程师的学习记录',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java 基础', link: '/java/basic/' },
      { text: 'Java 进阶', link: '/java/advanced/' },
      { text: 'AI 学习', link: '/ai/' },
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
        { text: 'Spring/SpringBoot', link: '/java/advanced/spring' },
        { text: 'MyBatis', link: '/java/advanced/mybatis' },
        { text: '数据库优化', link: '/java/advanced/db' },
        { text: 'Redis', link: '/java/advanced/redis' },
        { text: '消息队列', link: '/java/advanced/mq' },
        { text: 'Elasticsearch', link: '/java/advanced/es' }
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
