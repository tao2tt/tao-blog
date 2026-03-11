# AI 入门

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-06-20

---

## 📚 目录

1. [AI 概述](#1-ai-概述)
2. [机器学习基础](#2-机器学习基础)
3. [深度学习基础](#3-深度学习基础)
4. [大语言模型](#4-大语言模型)
5. [Python 基础](#5-python-基础)
6. [AI 开发环境](#6-ai-开发环境)
7. [实战：调用 AI API](#7-实战调用-ai-api)

---

## 1. AI 概述

### 1.1 什么是 AI

**AI（Artificial Intelligence）**：人工智能，让机器模拟人类智能的技术。

**发展历程：**
```
1956 年：AI 概念提出（达特茅斯会议）
1980 年代：专家系统
1997 年：深蓝击败国际象棋冠军
2012 年：深度学习突破（AlexNet）
2016 年：AlphaGo 击败围棋冠军
2022 年：ChatGPT 发布，AIGC 爆发
2026 年：AI Agent 广泛应用
```

### 1.2 AI 分类

```
AI
├── 弱人工智能（ANI）
│   └── 擅长单一任务（下棋、识别、翻译）
├── 强人工智能（AGI）
│   └── 人类水平智能（尚未实现）
└── 超人工智能（ASI）
    └── 超越人类智能（未来概念）
```

### 1.3 AI 应用领域

| 领域 | 应用 | 技术 |
|------|------|------|
| **自然语言处理** | 聊天机器人、翻译、摘要 | NLP、LLM |
| **计算机视觉** | 人脸识别、图像生成 | CNN、GAN |
| **语音处理** | 语音识别、语音合成 | ASR、TTS |
| **推荐系统** | 电商推荐、内容推荐 | 协同过滤、深度学习 |
| **决策系统** | 自动驾驶、游戏 AI | 强化学习 |
| **数据分析** | 预测、分类、聚类 | 机器学习 |

---

## 2. 机器学习基础

### 2.1 什么是机器学习

**机器学习（Machine Learning）**：让计算机从数据中学习规律，无需显式编程。

```
传统编程：输入 + 规则 → 输出
机器学习：输入 + 输出 → 规则
```

### 2.2 机器学习分类

```
机器学习
├── 监督学习（Supervised Learning）
│   ├── 分类：垃圾邮件识别、情感分析
│   └── 回归：房价预测、销量预测
├── 无监督学习（Unsupervised Learning）
│   ├── 聚类：用户分群、异常检测
│   └── 降维：数据可视化
├── 半监督学习
│   └── 少量标注 + 大量未标注数据
└── 强化学习（Reinforcement Learning）
    └── 智能体通过奖励/惩罚学习（AlphaGo）
```

### 2.3 常见算法

| 算法 | 类型 | 应用场景 |
|------|------|----------|
| **线性回归** | 监督学习 | 房价预测、销量预测 |
| **逻辑回归** | 监督学习 | 二分类问题 |
| **决策树** | 监督学习 | 分类、回归 |
| **随机森林** | 监督学习 | 分类、回归（集成学习） |
| **支持向量机** | 监督学习 | 文本分类 |
| **K-Means** | 无监督学习 | 用户分群 |
| **神经网络** | 监督学习 | 图像、语音、文本 |

### 2.4 机器学习流程

```
1. 数据收集
2. 数据清洗
3. 特征工程
4. 模型选择
5. 模型训练
6. 模型评估
7. 模型部署
8. 模型监控与优化
```

---

## 3. 深度学习基础

### 3.1 什么是深度学习

**深度学习（Deep Learning）**：基于神经网络的机器学习方法。

```
深度学习是机器学习的子集
机器学习是 AI 的子集

AI ⊃ 机器学习 ⊃ 深度学习
```

### 3.2 神经网络

```
神经网络结构：
输入层 → 隐藏层 → 输出层

每个神经元：
1. 接收输入
2. 加权求和
3. 激活函数处理
4. 输出
```

### 3.3 常见神经网络

| 网络类型 | 全称 | 应用场景 |
|----------|------|----------|
| **DNN** | 深度神经网络 | 通用任务 |
| **CNN** | 卷积神经网络 | 图像识别、目标检测 |
| **RNN** | 循环神经网络 | 序列数据（文本、语音） |
| **LSTM** | 长短期记忆网络 | 长序列依赖 |
| **Transformer** | 变换器 | NLP、多模态 |
| **GAN** | 生成对抗网络 | 图像生成 |

### 3.4 Transformer 架构

```
Transformer（2017 年 Google 提出）

核心创新：
1. 自注意力机制（Self-Attention）
2. 位置编码（Positional Encoding）
3. 多头注意力（Multi-Head Attention）

优势：
- 并行计算（优于 RNN）
- 长距离依赖
- 可扩展性强

应用：
- BERT（Google）
- GPT 系列（OpenAI）
- 通义千问（阿里）
```

---

## 4. 大语言模型

### 4.1 什么是 LLM

**LLM（Large Language Model）**：大语言模型，基于 Transformer 的超大规模语言模型。

**特点：**
- ✅ 参数量巨大（亿级到万亿级）
- ✅ 海量训练数据
- ✅ 强大的语言理解能力
- ✅ 零样本/少样本学习

### 4.2 主流大模型

| 模型 | 厂商 | 参数量 | 特点 |
|------|------|--------|------|
| **GPT-4** | OpenAI | 未公开 | 最强通用能力 |
| **Claude** | Anthropic | 未公开 | 安全、长上下文 |
| **通义千问** | 阿里 | 未公开 | 中文能力强 |
| **文心一言** | 百度 | 未公开 | 中文生态 |
| **讯飞星火** | 科大讯飞 | 未公开 | 语音交互 |
| **ChatGLM** | 智谱 AI | 开源 | 可本地部署 |

### 4.3 LLM 应用场景

| 场景 | 应用 | 示例 |
|------|------|------|
| **内容生成** | 文章、代码、邮件 | 写周报、写代码 |
| **对话系统** | 客服、助手 | 智能客服 |
| **知识问答** | 问答、搜索 | 知识检索 |
| **文本处理** | 摘要、翻译、润色 | 文档总结 |
| **数据分析** | 提取、分类 | 情感分析 |
| **代码辅助** | 生成、解释、调试 | Copilot |

---

## 5. Python 基础

### 5.1 为什么学 Python

```
✅ AI 领域首选语言
✅ 语法简洁易学
✅ 丰富的 AI 库（TensorFlow、PyTorch）
✅ 强大的数据处理能力（Pandas、NumPy）
```

### 5.2 基础语法

```python
# 变量和数据类型
name = "张三"           # 字符串
age = 25               # 整数
height = 1.75          # 浮点数
is_student = False     # 布尔值

# 列表
fruits = ["苹果", "香蕉", "橙子"]
fruits.append("葡萄")
print(fruits[0])  # 苹果

# 字典
person = {
    "name": "张三",
    "age": 25,
    "city": "西安"
}
print(person["name"])  # 张三

# 条件判断
if age >= 18:
    print("成年人")
else:
    print("未成年人")

# 循环
for fruit in fruits:
    print(fruit)

for i in range(5):
    print(i)

# 函数
def greet(name):
    return f"你好，{name}！"

print(greet("张三"))  # 你好，张三！
```

### 5.3 常用库

```python
# 数据处理
import numpy as np
import pandas as pd

# 数据可视化
import matplotlib.pyplot as plt

# 机器学习
from sklearn import linear_model, svm, cluster

# 深度学习
import tensorflow as tf
import torch

# NLP
import jieba  # 中文分词
from transformers import pipeline

# HTTP 请求
import requests

# JSON 处理
import json
```

### 5.4 实战示例

```python
# 1. 调用 AI API
import requests

def call_ai_api(prompt):
    url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "model": "qwen-turbo",
        "input": {
            "prompt": prompt
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 2. 数据分析
import pandas as pd

# 读取数据
df = pd.read_csv("sales.csv")

# 数据筛选
high_sales = df[df["sales"] > 10000]

# 分组统计
result = df.groupby("category")["sales"].sum()

# 3. 文本处理
from transformers import pipeline

# 情感分析
classifier = pipeline("sentiment-analysis")
result = classifier("这个产品非常好用！")
print(result)  # [{'label': 'POSITIVE', 'score': 0.99}]
```

---

## 6. AI 开发环境

### 6.1 本地环境

```bash
# 安装 Python
# 官网下载：https://www.python.org/

# 创建虚拟环境
python -m venv ai-env

# 激活环境
# Windows:
ai-env\Scripts\activate
# Mac/Linux:
source ai-env/bin/activate

# 安装常用库
pip install numpy pandas matplotlib
pip install scikit-learn
pip install transformers
pip install requests
```

### 6.2 在线环境

| 平台 | 网址 | 特点 |
|------|------|------|
| **Google Colab** | colab.research.google.com | 免费 GPU |
| **Kaggle** | kaggle.com | 数据集 + 竞赛 |
| **阿里云 PAI** | pai.console.aliyun.com | 国产平台 |
| **百度 AI Studio** | aistudio.baidu.com | 免费算力 |

### 6.3 API 平台

| 平台 | 网址 | 模型 |
|------|------|------|
| **Dashscope** | dashscope.aliyun.com | 通义千问 |
| **OpenAI** | platform.openai.com | GPT 系列 |
| **百度智能云** | cloud.baidu.com | 文心一言 |
| **讯飞开放平台** | xfyun.cn | 星火认知 |

---

## 7. 实战：调用 AI API

### 7.1 阿里云 Dashscope

```python
# 安装 SDK
pip install dashscope

# 调用通义千问
import dashscope
from dashscope import Generation

dashscope.api_key = "YOUR_API_KEY"

def call_qwen(prompt):
    response = Generation.call(
        model="qwen-turbo",
        prompt=prompt
    )
    
    if response.status_code == 200:
        return response.output.text
    else:
        return f"Error: {response.code} - {response.message}"

# 使用
result = call_qwen("请用 Python 写一个快速排序算法")
print(result)
```

### 7.2 SpringBoot 集成

```java
// pom.xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

// AI 服务类
@Service
public class AiService {
    
    private static final String API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
    private static final String API_KEY = "YOUR_API_KEY";
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    public Mono<String> generate(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "qwen-turbo");
        
        Map<String, String> input = new HashMap<>();
        input.put("prompt", prompt);
        requestBody.put("input", input);
        
        return webClientBuilder.build()
            .post()
            .uri(API_URL)
            .header("Authorization", "Bearer " + API_KEY)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                Map<String, Object> output = (Map<String, Object>) response.get("output");
                return (String) output.get("text");
            });
    }
}

// Controller
@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    @Autowired
    private AiService aiService;
    
    @PostMapping("/generate")
    public Mono<Result<String>> generate(@RequestBody AiRequest request) {
        return aiService.generate(request.getPrompt())
            .map(Result::success)
            .onErrorReturn(Result.fail("AI 调用失败"));
    }
}
```

### 7.3 实战案例

```python
# 1. 智能客服
def customer_service(question):
    prompt = f"""你是一个电商客服助手，请专业、友好地回答用户问题。
    
用户问题：{question}

回答："""
    return call_qwen(prompt)

# 2. 文档摘要
def summarize_document(text, max_length=200):
    prompt = f"""请总结以下文档的核心内容，不超过{max_length}字：

{text}

总结："""
    return call_qwen(prompt)

# 3. 代码生成
def generate_code(description, language="python"):
    prompt = f"""请用{language}语言实现以下功能：

{description}

代码："""
    return call_qwen(prompt)

# 4. 情感分析
def sentiment_analysis(text):
    prompt = f"""请分析以下文本的情感倾向（正面/负面/中性）：

文本：{text}

情感倾向："""
    return call_qwen(prompt)

# 5. 数据提取
def extract_entities(text):
    prompt = f"""请从以下文本中提取关键实体（人名、地名、组织名、时间等）：

文本：{text}

实体列表："""
    return call_qwen(prompt)
```

---

## 💡 学习建议

1. **Python 基础**：先掌握 Python 基本语法
2. **API 调用**：从调用现成 API 开始
3. **理解原理**：逐步学习机器学习、深度学习原理
4. **实战项目**：边学边做，积累项目经验

---

## 📚 参考资料

- 《人工智能：一种现代方法》
- 《机器学习》（周志华）
- 《深度学习》（花书）
- [吴恩达 Coursera 课程](https://www.coursera.org/specializations/machine-learning-introduction)
- [李宏毅机器学习](https://speech.ee.ntu.edu.tw/~hylee/ml/)

---

> 💡 **学习建议**：AI 是未来趋势，建议 Java 开发者：
> 1. 学习 Python 基础
> 2. 掌握 AI API 调用
> 3. 理解 AI 基本原理
> 4. 实战 AI+Java 应用开发
