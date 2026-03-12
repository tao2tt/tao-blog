# AI 入门

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-25  
> 难度：⭐⭐☆☆☆  
> 前置知识：无

---

## 📚 目录

[[toc]]

---

## 1. AI 简介

### 1.1 什么是人工智能

**人工智能（Artificial Intelligence，AI）** 是计算机科学的一个分支，旨在创造能够模拟、延伸和扩展人类智能的机器。

**AI 的三个层次：**

```
ANI（弱人工智能）→ AGI（强人工智能）→ ASI（超级人工智能）
```

| 类型 | 说明 | 示例 |
|------|------|------|
| **ANI** | 弱人工智能，擅长单一任务 | 语音助手、围棋 AI、推荐系统 |
| **AGI** | 强人工智能，具备人类水平智能 | 科幻电影中的 AI（尚未实现） |
| **ASI** | 超级人工智能，超越人类智能 | 理论概念 |

**💡 现状：** 我们目前处于 ANI 时代，所有现有 AI 都是弱人工智能。

### 1.2 AI 发展简史

```
1950s → AI 概念诞生（图灵测试）
    ↓
1956 → 达特茅斯会议（AI 正式诞生）
    ↓
1970s → 第一次 AI 寒冬
    ↓
1980s → 专家系统兴起
    ↓
1990s → 机器学习崛起
    ↓
2006 → 深度学习提出
    ↓
2012 → AlexNet（深度学习爆发）
    ↓
2016 → AlphaGo 战胜李世石
    ↓
2020 → GPT-3（大模型时代）
    ↓
2022 → ChatGPT（AI 应用爆发）
    ↓
2024 → 多模态大模型
```

### 1.3 AI、机器学习、深度学习的关系

```
人工智能（AI）
    └── 机器学习（ML）
        └── 深度学习（DL）
            └── 大语言模型（LLM）
```

| 概念 | 说明 | 关系 |
|------|------|------|
| **AI** | 最广泛的概念 | 包含 ML |
| **ML** | 让计算机从数据中学习 | AI 的子集，包含 DL |
| **DL** | 使用神经网络的机器学习 | ML 的子集 |
| **LLM** | 基于 Transformer 的大模型 | DL 的应用 |

**示意图：**

```
┌─────────────────────────────┐
│      人工智能 (AI)           │
│  ┌───────────────────────┐  │
│  │    机器学习 (ML)       │  │
│  │  ┌─────────────────┐  │  │
│  │  │  深度学习 (DL)   │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  大模型    │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 2. 大语言模型（LLM）

### 2.1 什么是 LLM

**大语言模型（Large Language Model，LLM）** 是基于深度学习技术，在海量文本数据上训练的超大规模神经网络模型。

**核心能力：**

| 能力 | 说明 | 示例 |
|------|------|------|
| **文本生成** | 根据提示生成连贯文本 | 写文章、写代码 |
| **问答** | 回答问题 | 知识问答、客服 |
| **翻译** | 多语言互译 | 中英文翻译 |
| **摘要** | 提取关键信息 | 文章摘要 |
| **推理** | 逻辑推理、数学计算 | 数学题、逻辑题 |

### 2.2 主流大模型对比

| 模型 | 公司 | 参数量 | 上下文 | 特点 |
|------|------|--------|--------|------|
| **GPT-4** | OpenAI | 未知 | 128K | 综合能力最强 |
| **GPT-4o** | OpenAI | 未知 | 128K | 多模态、速度快 |
| **Claude 3** | Anthropic | 未知 | 200K | 长文本、安全 |
| **通义千问** | 阿里 | 未知 | 200K | 中文优化 |
| **文心一言** | 百度 | 未知 | 128K | 中文场景 |
| **Llama 3** | Meta | 70B | 8K | 开源 |
| **Gemini** | Google | 未知 | 1M+ | 多模态 |

### 2.3 Transformer 架构

**LLM 的基础架构**

```
Transformer（2017 年提出）
├── Encoder（编码器）
│   └── 理解输入
│
└── Decoder（解码器）
    └── 生成输出
```

**核心组件：**

| 组件 | 作用 |
|------|------|
| **Self-Attention** | 捕捉词与词之间的关系 |
| **Multi-Head Attention** | 多头注意力，捕捉多种关系 |
| **Position Encoding** | 位置编码，记录词的位置 |
| **Feed Forward** | 前馈神经网络 |
| **Layer Normalization** | 层归一化，稳定训练 |

**💡 理解：** Transformer 让模型能够"关注"输入中的重要部分。

### 2.4 LLM 工作原理

```
输入文本
    ↓
分词（Tokenization）
    ↓
向量化（Embedding）
    ↓
Transformer 处理
    ↓
预测下一个词
    ↓
重复直到完成
```

**示例：**

```
输入："今天天气真"
    ↓
模型预测："好"
    ↓
输入："今天天气真好"
    ↓
模型预测："，"
    ↓
继续生成...
```

---

## 3. AI 应用场景

### 3.1 内容创作

| 场景 | 说明 | 工具 |
|------|------|------|
| **文章写作** | 写博客、新闻、报告 | ChatGPT、Claude |
| **代码生成** | 写代码、调试、解释 | GitHub Copilot |
| **图像生成** | 根据描述生成图片 | Midjourney、DALL-E 3 |
| **视频生成** | 文本生成视频 | Sora、Runway |
| **音乐创作** | 生成音乐 | Suno、Udio |

### 3.2 智能助手

| 场景 | 说明 | 工具 |
|------|------|------|
| **客服机器人** | 自动回答客户问题 | 智能客服系统 |
| **个人助理** | 日程管理、提醒 | Siri、小爱同学 |
| **编程助手** | 代码补全、解释 | Cursor、Codeium |
| **学习助手** | 答疑、辅导 | Khanmigo |

### 3.3 数据分析

| 场景 | 说明 | 工具 |
|------|------|------|
| **数据查询** | 自然语言查询数据库 | Chat2DB |
| **数据可视化** | 自动生成图表 | ChatGPT Data Analyst |
| **洞察分析** | 自动分析数据趋势 | Various BI Tools |

### 3.4 企业应用

| 场景 | 说明 |
|------|------|
| **文档处理** | 合同审核、报告生成 |
| **知识管理** | 企业知识库问答 |
| **营销文案** | 广告文案、社交媒体内容 |
| **培训教育** | 智能导师、个性化学习 |

---

## 4. AI 开发基础

### 4.1 技术栈

```
AI 应用开发技术栈
├── 编程语言
│   ├── Python（主流）
│   └── JavaScript/TypeScript（前端集成）
│
├── 大模型 API
│   ├── OpenAI API
│   ├── Anthropic API
│   ├── 通义千问 API
│   └── 本地部署模型
│
├── 开发框架
│   ├── LangChain（应用编排）
│   ├── LlamaIndex（数据索引）
│   └── AutoGen（多 Agent）
│
├── 向量数据库
│   ├── ChromaDB（轻量）
│   ├── Milvus（分布式）
│   └── Pinecone（云服务）
│
└── 部署工具
    ├── Docker
    ├── FastAPI
    └── Streamlit（快速原型）
```

### 4.2 第一个 AI 应用

**使用 Python 调用大模型 API**

```python
# 安装依赖
# pip install openai

from openai import OpenAI

# 初始化客户端
client = OpenAI(api_key="your-api-key")

# 发送请求
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手"},
        {"role": "user", "content": "你好，请介绍一下自己"}
    ]
)

# 获取回复
print(response.choices[0].message.content)
```

**输出：**
```
你好！我是一个 AI 助手，由 OpenAI 开发。我可以帮助你回答问题、提供建议、协助创作等。有什么我可以帮助你的吗？
```

### 4.3 使用 LangChain

```python
# 安装依赖
# pip install langchain langchain-openai

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# 初始化模型
llm = ChatOpenAI(model="gpt-4")

# 创建提示模板
prompt = ChatPromptTemplate.from_template(
    "请用一句话解释什么是{name}？"
)

# 创建链
chain = prompt | llm

# 执行
response = chain.invoke({"name": "人工智能"})
print(response.content)
```

---

## 5. 学习路线

### 5.1 学习路径

```
第 1 阶段：基础认知（1-2 周）
├── 了解 AI 基本概念
├── 学习大模型原理
└── 体验主流 AI 工具

第 2 阶段：Prompt 工程（2-3 周）
├── 学习 Prompt 基础
├── 掌握高级技巧
└── 实践 Function Calling

第 3 阶段：应用开发（4-6 周）
├── 学习 LangChain 框架
├── 掌握 RAG 技术
├── 开发 AI Agent
└── 实战项目

第 4 阶段：进阶提升（持续）
├── 模型微调
├── 本地部署
└── 性能优化
```

### 5.2 推荐资源

**在线课程：**
- 🎓 吴恩达《AI For Everyone》- Coursera
- 🎓 吴恩达《Generative AI for Everyone》- DeepLearning.AI
- 🎓 李宏毅《生成式 AI 课程》- YouTube

**官方文档：**
- 🔗 [OpenAI API 文档](https://platform.openai.com/docs)
- 🔗 [LangChain 文档](https://python.langchain.com/)
- 🔗 [通义千问文档](https://help.aliyun.com/product/42154.html)

**学习社区：**
- 💬 [Hugging Face](https://huggingface.co/)
- 💬 [GitHub AI 项目](https://github.com/topics/llm)
- 💬 [Reddit r/MachineLearning](https://www.reddit.com/r/MachineLearning/)

**中文资源：**
- 📚 《ChatGPT 原理与架构》
- 📚 《大模型应用开发实战》
- 🔗 [知乎 AI 专栏](https://www.zhihu.com/topic/19552833)

---

## 6. 实践建议

### 6.1 入门建议

| 建议 | 说明 |
|------|------|
| **从体验开始** | 先用 ChatGPT 等工具，感受 AI 能力 |
| **学习 Prompt** | 掌握提问技巧，事半功倍 |
| **动手实践** | 边学边做，开发小项目 |
| **关注社区** | AI 发展快，保持学习 |

### 6.2 避免误区

| 误区 | 正确做法 |
|------|---------|
| **AI 万能论** | AI 有局限性，不是万能的 |
| **完全依赖 AI** | AI 是助手，不是替代者 |
| **忽视基础** | 编程基础、业务理解很重要 |
| **盲目追新** | 选择稳定技术，不要盲目追新 |

### 6.3 职业发展

**AI 相关职位：**

| 职位 | 技能要求 | 薪资范围 |
|------|---------|---------|
| **AI 应用工程师** | Python、LangChain、API 集成 | 20-50k |
| **Prompt 工程师** | Prompt 设计、优化 | 15-40k |
| **AI 产品经理** | 产品设计、AI 理解 | 25-60k |
| **机器学习工程师** | 深度学习、模型训练 | 30-80k |
| **AI 架构师** | 系统设计、技术选型 | 50-100k+ |

---

## 📝 练习题

### 基础题

1. **概念理解**：解释 AI、机器学习、深度学习的关系

2. **模型对比**：列举 3 个主流大模型及其特点

3. **应用场景**：列举 5 个 AI 应用场景

### 进阶题

4. **实践练习**：注册 OpenAI 或其他大模型平台，完成第一次 API 调用

5. **Prompt 设计**：设计一个 Prompt，让 AI 帮你写一封邮件

6. **综合练习**：调研一个 AI 应用案例，分析其技术架构和实现方式

---

## 🔗 参考资料

### 入门读物
- 📚 《AI 3.0》- 梅拉妮·米歇尔
- 📚 《生命 3.0》- 迈克斯·泰格马克
- 📺 吴恩达《AI For Everyone》

### 技术文档
- 🔗 [OpenAI 官方文档](https://platform.openai.com/docs)
- 🔗 [LangChain 文档](https://python.langchain.com/)
- 🔗 [Hugging Face](https://huggingface.co/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| AI 基本概念 | ⭐⭐⭐⭐⭐ | 理解 |
| 大模型原理 | ⭐⭐⭐⭐ | 了解 |
| 应用场景 | ⭐⭐⭐⭐⭐ | 熟悉 |
| 开发技术栈 | ⭐⭐⭐⭐⭐ | 掌握 |
| 学习路线 | ⭐⭐⭐⭐ | 遵循 |

---

**下一章：** [大模型基础](/ai/llm-basics)

**最后更新**：2026-03-12
