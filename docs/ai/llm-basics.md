# 大模型基础

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-15

---

## 📚 目录

[[toc]]

---

## 1. 大模型简介

### 1.1 什么是大语言模型（LLM）

### 1.2 发展历程

| 年份 | 模型 | 参数量 | 意义 |
|------|------|--------|------|
| 2018 | BERT | 340M | 预训练 + 微调范式 |
| 2020 | GPT-3 | 175B | 涌现能力 |
| 2022 | ChatGPT | 175B | 对话能力突破 |
| 2023 | GPT-4 | 未知 | 多模态能力 |
| 2024 | Claude 3 | 未知 | 长上下文 |

---

## 2. Transformer 架构

### 2.1 Self-Attention 机制

### 2.2 Multi-Head Attention

### 2.3 Position Encoding

### 2.4 Encoder-Decoder 结构

---

## 3. 大模型训练

### 3.1 预训练（Pre-training）

- 无监督学习
- 海量文本数据
- 学习语言表示

### 3.2 微调（Fine-tuning）

- 有监督微调（SFT）
- 指令微调
- 领域适配

### 3.3 对齐（Alignment）

- RLHF（人类反馈强化学习）
- DPO（直接偏好优化）

---

## 4. 大模型能力

### 4.1 涌现能力（Emergent Abilities）

- 少样本学习（Few-shot）
- 思维链（Chain of Thought）
- 代码生成

### 4.2 能力边界

- 知识截止时间
- 幻觉问题
- 推理能力限制

---

## 5. 主流大模型对比

| 模型 | 公司 | 上下文 | 特点 |
|------|------|--------|------|
| GPT-4 | OpenAI | 128K | 综合能力强 |
| Claude 3 | Anthropic | 200K | 长文本、安全 |
| 通义千问 | 阿里 | 200K | 中文优化 |
| 文心一言 | 百度 | 128K | 中文场景 |
| Llama 3 | Meta | 8K | 开源 |

---

## 6. 大模型 API 调用

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "你好"}
    ]
)
print(response.choices[0].message.content)
```

---

## 📝 练习题

1. 调用大模型 API 完成对话
2. 对比不同模型的输出质量
3. 分析大模型的幻觉案例

---

## 🔗 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774)
- 吴恩达《AI For Everyone》

---

**最后更新**：2026-03-12
