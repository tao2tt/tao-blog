# 大模型基础

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-27  
> 难度：⭐⭐⭐☆☆  
> 前置知识：[AI 入门](/ai/intro)

---

## 📚 目录

[[toc]]

---

## 1. 大模型简介

### 1.1 什么是大语言模型

**大语言模型（Large Language Model，LLM）** 是基于深度学习技术，在海量文本数据上训练的超大规模神经网络模型。

**核心特点：**

| 特点 | 说明 |
|------|------|
| **大规模** | 参数量从几十亿到万亿级别 |
| **大数据** | 训练数据涵盖互联网大部分文本 |
| **通用性** | 可处理多种任务，无需专门训练 |
| **涌现能力** | 展现出意想不到的能力 |

### 1.2 大模型发展历程

```
2017 → Transformer 架构提出
    ↓
2018 → BERT（双向编码）
    ↓
2019 → GPT-2（1.5B 参数）
    ↓
2020 → GPT-3（175B 参数，涌现能力）
    ↓
2022 → ChatGPT（对话优化）
    ↓
2023 → GPT-4（多模态）
    ↓
2024 → 多模态大模型爆发
```

### 1.3 主流大模型对比

| 模型 | 公司 | 发布时间 | 参数量 | 上下文 | 特点 |
|------|------|---------|--------|--------|------|
| **GPT-4** | OpenAI | 2023.03 | 未知 | 128K | 综合能力最强 |
| **GPT-4o** | OpenAI | 2024.05 | 未知 | 128K | 多模态、速度快 |
| **Claude 3** | Anthropic | 2024.03 | 未知 | 200K | 长文本、安全 |
| **通义千问** | 阿里 | 2023.04 | 未知 | 200K | 中文优化 |
| **文心一言** | 百度 | 2023.03 | 未知 | 128K | 中文场景 |
| **Llama 3** | Meta | 2024.04 | 70B | 8K | 开源 |
| **Gemini** | Google | 2023.12 | 未知 | 1M+ | 多模态 |

---

## 2. Transformer 架构

### 2.1 架构概述

**Transformer** 是 2017 年 Google 提出的神经网络架构，是大模型的基础。

**核心创新：**
- ✅ Self-Attention 机制
- ✅ 并行计算（替代 RNN）
- ✅ 长距离依赖捕捉

**架构图：**

```
┌─────────────────────────────────────┐
│            Transformer               │
├─────────────────────────────────────┤
│  Encoder（编码器）    Decoder（解码器）│
│  ┌─────────────┐     ┌─────────────┐│
│  │ Self-Attention │  │ Self-Attention ││
│  │ Multi-Head    │  │ Multi-Head    ││
│  │ Feed Forward  │  │ Cross-Attention││
│  │ Layer Norm    │  │ Feed Forward  ││
│  └─────────────┘     └─────────────┘│
└─────────────────────────────────────┘
```

### 2.2 Self-Attention 机制

**作用：** 让模型能够"关注"输入中的重要部分。

**计算过程：**

```
输入 → Query(Q), Key(K), Value(V)
    ↓
计算注意力分数：Attention(Q, K, V) = softmax(QK^T / √d) * V
    ↓
输出加权和
```

**示意图：**

```
输入："我 爱 人工 智能"
    ↓
每个词关注其他词：
"我" → 关注 "爱"（动作）
"爱" → 关注 "我"（主语）、"人工智能"（宾语）
    ↓
捕捉词与词之间的关系
```

### 2.3 Multi-Head Attention

**多头注意力：** 同时从多个角度捕捉关系。

```
Single-Head Attention
    ↓
Multi-Head Attention（多个头并行）
├── Head 1：关注语法关系
├── Head 2：关注语义关系
├── Head 3：关注位置关系
└── ...
    ↓
拼接所有头的输出
```

**优势：**
- ✅ 捕捉多种关系
- ✅ 增强表达能力
- ✅ 并行计算

### 2.4 Position Encoding

**位置编码：** 让模型知道词的顺序。

```
为什么需要位置编码？
- Transformer 没有 RNN 的顺序概念
- 需要显式记录词的位置

实现方式：
- 使用正弦/余弦函数
- 或学习位置嵌入
```

---

## 3. 大模型训练

### 3.1 训练流程

```
数据收集 → 数据清洗 → 分词 → 训练 → 评估 → 部署
```

**详细流程：**

```
1. 数据收集
   ├── 网页文本
   ├── 书籍
   ├── 代码
   └── 对话数据

2. 数据清洗
   ├── 去重
   ├── 过滤低质量
   ├── 去除敏感信息
   └── 格式化

3. 分词（Tokenization）
   ├── 将文本切分为 Token
   └── 构建词表

4. 训练
   ├── 预训练（无监督）
   ├── 微调（有监督）
   └── 对齐（RLHF）

5. 评估
   ├── 基准测试
   └── 人工评估

6. 部署
   ├── API 服务
   └── 本地部署
```

### 3.2 预训练（Pre-training）

**无监督学习，学习语言表示**

```
目标：预测下一个词

输入："今天天气真"
目标："好"

损失函数：交叉熵损失
优化器：AdamW
```

**训练数据：**

| 数据类型 | 占比 | 说明 |
|---------|------|------|
| 网页文本 | 60% | Common Crawl 等 |
| 书籍 | 10% | 公开书籍 |
| 代码 | 10% | GitHub 等 |
| 维基百科 | 5% | 多语言百科 |
| 对话数据 | 5% | 论坛、问答 |
| 其他 | 10% | 新闻、论文等 |

### 3.3 微调（Fine-tuning）

**有监督微调（SFT）**

```
预训练模型
    ↓
有监督微调（指令数据）
    ↓
指令跟随模型
```

**微调数据示例：**

```json
{
  "instruction": "请翻译以下句子",
  "input": "Hello, how are you?",
  "output": "你好，你怎么样？"
}
```

### 3.4 对齐（Alignment）

**让人类价值观与模型行为对齐**

**RLHF（人类反馈强化学习）：**

```
1. 收集人类偏好数据
   - 标注员对多个回答排序
   
2. 训练奖励模型
   - 学习人类偏好
   
3. 强化学习优化
   - PPO 算法优化模型
```

**DPO（直接偏好优化）：**

```
更简单的对齐方法
- 直接使用偏好数据优化
- 无需奖励模型
- 训练更稳定
```

---

## 4. 大模型能力

### 4.1 涌现能力

**涌现能力（Emergent Abilities）** 是指模型在达到一定规模后，突然展现出的意想不到的能力。

**常见涌现能力：**

| 能力 | 说明 | 出现规模 |
|------|------|---------|
| **少样本学习** | 通过少量示例学习新任务 | ~10B 参数 |
| **思维链** | 逐步推理解决问题 | ~100B 参数 |
| **代码生成** | 根据描述生成代码 | ~10B 参数 |
| **多步推理** | 多步骤逻辑推理 | ~100B 参数 |

### 4.2 核心能力

| 能力 | 说明 | 示例 |
|------|------|------|
| **文本生成** | 生成连贯文本 | 写文章、写故事 |
| **问答** | 回答问题 | 知识问答 |
| **翻译** | 多语言互译 | 中英文翻译 |
| **摘要** | 提取关键信息 | 文章摘要 |
| **代码** | 生成、解释、调试代码 | 写 Python 代码 |
| **推理** | 逻辑推理、数学计算 | 数学题、逻辑题 |
| **创作** | 创意写作 | 写诗、写歌词 |

### 4.3 能力边界

**大模型不是万能的：**

| 局限性 | 说明 |
|--------|------|
| **知识截止时间** | 训练数据有截止时间，不知道最新事件 |
| **幻觉问题** | 可能编造事实 |
| **数学计算** | 复杂计算容易出错 |
| **长文本** | 超长文本理解有限 |
| **专业领域** | 医疗、法律等需谨慎 |

---

## 5. 大模型 API 使用

### 5.1 OpenAI API

```python
# 安装
# pip install openai

from openai import OpenAI

# 初始化
client = OpenAI(api_key="your-api-key")

# 对话
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手"},
        {"role": "user", "content": "你好"}
    ]
)

print(response.choices[0].message.content)
```

### 5.2 通义千问 API

```python
# 安装
# pip install dashscope

import dashscope
from dashscope import Generation

dashscope.api_key = "your-api-key"

response = Generation.call(
    model="qwen-max",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手"},
        {"role": "user", "content": "你好"}
    ]
)

print(response.output.text)
```

### 5.3 本地部署模型

```python
# 使用 Ollama 运行本地模型
# pip install ollama

import ollama

response = ollama.chat(
    model="llama3",
    messages=[
        {"role": "user", "content": "你好"}
    ]
)

print(response["message"]["content"])
```

---

## 6. 实战案例

### 6.1 智能问答

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

def answer_question(question):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "你是一个知识渊博的助手"},
            {"role": "user", "content": question}
        ]
    )
    return response.choices[0].message.content

# 使用
answer = answer_question("什么是人工智能？")
print(answer)
```

### 6.2 代码生成

```python
def generate_code(description):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "你是一个专业的程序员"},
            {"role": "user", "content": f"请用 Python 实现：{description}"}
        ]
    )
    return response.choices[0].message.content

# 使用
code = generate_code("计算斐波那契数列")
print(code)
```

### 6.3 文本摘要

```python
def summarize_text(text, max_length=100):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "你是一个专业的摘要助手"},
            {"role": "user", "content": f"请总结以下文本（{max_length}字以内）：\n{text}"}
        ]
    )
    return response.choices[0].message.content

# 使用
summary = summarize_text(long_article)
print(summary)
```

---

## 📝 练习题

### 基础题

1. **概念理解**：解释 Transformer 架构的核心组件

2. **训练流程**：描述大模型的训练流程（预训练、微调、对齐）

3. **能力边界**：列举大模型的 3 个局限性

### 进阶题

4. **API 调用**：注册一个大模型平台，完成第一次 API 调用

5. **实战练习**：使用大模型 API 实现一个简单的问答机器人

6. **综合练习**：调研一个开源大模型（如 Llama 3），尝试本地部署

---

## 🔗 参考资料

### 技术文档
- [Transformer 论文](https://arxiv.org/abs/1706.03762)
- [GPT-4 技术报告](https://arxiv.org/abs/2303.08774)
- [OpenAI API 文档](https://platform.openai.com/docs)

### 学习资源
- 🎓 吴恩达《Generative AI for Everyone》
- 🔗 [Hugging Face 课程](https://huggingface.co/learn)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| Transformer 架构 | ⭐⭐⭐⭐ | 理解 |
| 大模型训练 | ⭐⭐⭐⭐ | 了解 |
| 涌现能力 | ⭐⭐⭐ | 了解 |
| API 使用 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 能力边界 | ⭐⭐⭐⭐⭐ | 熟悉 |

---

**上一章：** [AI 入门](/ai/intro)  
**下一章：** [Python 快速上手](/ai/python-basics)

**最后更新**：2026-03-12
