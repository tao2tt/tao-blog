# LangChain 框架

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-05-09  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[AI Agent](/ai/agent)、[Function Calling](/ai/function-calling)

---

## 📚 目录

[[toc]]

---

## 1. LangChain 简介

### 1.1 什么是 LangChain

**LangChain** 是一个用于开发大语言模型应用的框架，提供组件化、模块化的工具链。

**核心目标：** 让 LLM 应用开发更简单、更快速、更可靠。

```
LangChain = 模型 + 提示 + 链 + 代理 + 记忆 + 工具
```

### 1.2 为什么使用 LangChain

**传统开发的痛点：**

| 痛点 | 说明 | LangChain 解决 |
|------|------|---------------|
| **代码重复** | 每次都要重写 Prompt、调用逻辑 | 组件化复用 |
| **状态管理** | 对话历史、上下文难管理 | 内置记忆系统 |
| **工具集成** | 每个 API 都要单独对接 | 统一工具接口 |
| **调试困难** | LLM 输出不可控 | 链式追踪、日志 |

### 1.3 核心模块

```
LangChain 核心模块
├── Schema（数据模式）
├── Models（模型集成）
├── Prompts（提示管理）
├── Chains（链式调用）
├── Agents（智能代理）
├── Memory（记忆系统）
├── Tools（工具集成）
└── Vector Stores（向量存储）
```

---

## 2. 安装与配置

### 2.1 安装

```bash
# 基础安装
pip install langchain

# 完整安装（包含所有集成）
pip install langchain-community

# 按需安装
pip install langchain-openai        # OpenAI 集成
pip install langchain-anthropic     # Anthropic 集成
pip install langchain-chroma        # Chroma 向量库
pip install langchain-text-splitters # 文本分割
```

### 2.2 环境配置

```python
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置 API 密钥
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# 或者使用配置文件
# .env 文件：
# OPENAI_API_KEY=your-api-key
# ANTHROPIC_API_KEY=your-api-key
```

---

## 3. 模型集成（Models）

### 3.1 Chat Models（对话模型）

```python
from langchain.chat_models import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# OpenAI
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    max_tokens=1000,
    timeout=30,
    max_retries=3
)

# Anthropic
llm = ChatAnthropic(
    model="claude-3-opus-20240229",
    temperature=0.7,
    max_tokens=1000
)

# 使用
response = llm.invoke("你好，请介绍一下自己")
print(response.content)
```

### 3.2 LLMs（文本模型）

```python
from langchain.llms import OpenAI

# 文本补全模型
llm = OpenAI(
    model="text-davinci-003",
    temperature=0.7,
    max_tokens=1000
)

# 使用
response = llm.invoke("请写一首关于春天的诗")
print(response)
```

### 3.3 Embeddings（嵌入模型）

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

# OpenAI Embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",
    chunk_size=1000
)

# HuggingFace Embeddings（本地）
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 使用
text = "这是一个测试文本"
vector = embeddings.embed_query(text)
print(f"向量维度：{len(vector)}")
```

---

## 4. 提示管理（Prompts）

### 4.1 Prompt Templates

```python
from langchain.prompts import PromptTemplate

# 基础模板
prompt = PromptTemplate(
    input_variables=["topic"],
    template="请用 500 字介绍{topic}"
)

# 使用
formatted = prompt.format(topic="人工智能")
print(formatted)
```

### 4.2 Chat Prompt Templates

```python
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate

# 对话模板
chat_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template("你是一个{role}，擅长{expertise}"),
    HumanMessagePromptTemplate.from_template("{question}")
])

# 使用
messages = chat_prompt.format_messages(
    role="技术专家",
    expertise="Python 编程",
    question="请解释什么是装饰器"
)

response = llm.invoke(messages)
```

### 4.3 Few-Shot Prompts

```python
from langchain.prompts import FewShotPromptTemplate, PromptTemplate

# 示例
examples = [
    {
        "input": "高兴",
        "output": "开心、愉快、愉悦"
    },
    {
        "input": "悲伤",
        "output": "难过、伤心、悲痛"
    },
    {
        "input": "愤怒",
        "output": "生气、恼怒、愤慨"
    }
]

# 示例模板
example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="输入：{input}\n输出：{output}"
)

# Few-Shot Prompt
few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    prefix="请给出以下词语的近义词：",
    suffix="输入：{input}\n输出：",
    input_variables=["input"]
)

# 使用
formatted = few_shot_prompt.format(input="害怕")
```

---

## 5. 链式调用（Chains）

### 5.1 基础链

```python
from langchain.chains import LLMChain

# 创建链
prompt = PromptTemplate(
    input_variables=["topic"],
    template="请用 500 字介绍{topic}"
)

chain = LLMChain(llm=llm, prompt=prompt)

# 使用
result = chain.invoke({"topic": "人工智能"})
print(result["text"])
```

### 5.2 顺序链（Sequential Chain）

```python
from langchain.chains import SequentialChain, LLMChain

# 链 1：生成大纲
outline_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["topic"],
        template="请为{topic}生成一个文章大纲"
    ),
    output_key="outline"
)

# 链 2：根据大纲写文章
article_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["topic", "outline"],
        template="请根据以下大纲写一篇文章：\n主题：{topic}\n大纲：{outline}"
    ),
    output_key="article"
)

# 链 3：总结文章
summary_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["article"],
        template="请总结以下文章：\n{article}"
    ),
    output_key="summary"
)

# 组合成顺序链
overall_chain = SequentialChain(
    chains=[outline_chain, article_chain, summary_chain],
    input_variables=["topic"],
    output_variables=["outline", "article", "summary"],
    verbose=True
)

# 使用
result = overall_chain.invoke({"topic": "人工智能"})
print(result["summary"])
```

### 5.3 路由链（Router Chain）

```python
from langchain.chains import RouterChain
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate

# 定义多个子链
physics_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["question"],
        template="请回答这个物理问题：{question}"
    )
)

math_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["question"],
        template="请回答这个数学问题：{question}"
    )
)

history_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["question"],
        template="请回答这个历史问题：{question}"
    )
)

# 路由链
router_chain = RouterChain.from_llm(
    llm=llm,
    destination_chains={
        "physics": physics_chain,
        "math": math_chain,
        "history": history_chain
    },
    default_chain=physics_chain,
    verbose=True
)
```

---

## 6. 记忆系统（Memory）

### 6.1 Conversation Buffer Memory

```python
from langchain.memory import ConversationBufferMemory

# 基础记忆
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 使用
memory.save_context(
    {"input": "你好"},
    {"output": "你好！有什么可以帮助你的？"}
)

memory.save_context(
    {"input": "今天天气怎么样？"},
    {"output": "今天天气晴朗，温度适宜。"}
)

# 获取历史
history = memory.load_memory_variables({})
print(history["chat_history"])
```

### 6.2 Conversation Summary Memory

```python
from langchain.memory import ConversationSummaryMemory

# 总结记忆（适合长对话）
memory = ConversationSummaryMemory(
    llm=llm,
    memory_key="chat_history"
)

# 自动总结对话历史
memory.save_context(
    {"input": "第一句话"},
    {"output": "第一个回复"}
)

memory.save_context(
    {"input": "第二句话"},
    {"output": "第二个回复"}
)

# 获取总结后的历史
summary = memory.load_memory_variables({})
print(summary["chat_history"])
```

### 6.3 Vector Store Memory

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 向量存储
vectorstore = Chroma(
    embedding_function=OpenAIEmbeddings(),
    persist_directory="./memory"
)

# 向量记忆
memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 3}  # 检索最相关的 3 条
    )
)

# 使用
memory.save_context(
    {"input": "我喜欢 Python 编程"},
    {"output": "Python 是一门很好的编程语言"}
)

memory.save_context(
    {"input": "我在北京工作"},
    {"output": "北京是中国的首都"}
)

# 检索相关记忆
relevant = memory.load_memory_variables({"input": "编程相关"})
print(relevant)
```

---

## 7. 工具集成（Tools）

### 7.1 内置工具

```python
from langchain.agents import load_tools

# 加载内置工具
tools = load_tools([
    "serpapi",        # Google 搜索
    "arxiv",          # 学术论文
    "wikipedia",      # 维基百科
    "wolfram-alpha",  # 计算引擎
    "google-places",  # 地点搜索
    "open-meteo",     # 天气查询
])
```

### 7.2 自定义工具

```python
from langchain.tools import tool

@tool
def search_knowledge_base(query: str) -> str:
    """搜索企业知识库
    
    Args:
        query: 搜索关键词
    
    Returns:
        搜索结果
    """
    # 实现搜索逻辑
    results = knowledge_base.search(query)
    return results

@tool
def execute_sql(sql: str) -> str:
    """执行 SQL 查询
    
    Args:
        sql: SQL 语句
    
    Returns:
        查询结果
    """
    # 实现数据库查询
    result = db.execute(sql)
    return str(result)

@tool("custom_name")  # 自定义工具名
def my_function(param1: str, param2: int = 10) -> str:
    """自定义工具描述"""
    return "结果"
```

### 7.3 工具装饰器详解

```python
from langchain.tools import tool

# 同步工具
@tool
def sync_tool(query: str) -> str:
    """同步工具"""
    return search_api(query)

# 异步工具
@tool
async def async_tool(query: str) -> str:
    """异步工具"""
    return await search_api_async(query)

# 带返回类型注解
@tool
def typed_tool(name: str, age: int) -> dict:
    """带类型注解的工具"""
    return {"name": name, "age": age}

# 多个参数
@tool
def multi_param_tool(
    query: str,
    limit: int = 10,
    sort_by: str = "relevance"
) -> str:
    """多参数工具
    
    Args:
        query: 搜索关键词
        limit: 返回数量限制
        sort_by: 排序方式
    
    Returns:
        搜索结果
    """
    return search_api(query, limit, sort_by)
```

---

## 8. 向量存储（Vector Stores）

### 8.1 Chroma

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 创建向量存储
vectorstore = Chroma(
    embedding_function=OpenAIEmbeddings(),
    persist_directory="./chroma_db"
)

# 添加文档
texts = ["文档 1 内容", "文档 2 内容", "文档 3 内容"]
metadatas = [{"source": "file1"}, {"source": "file2"}, {"source": "file3"}]

vectorstore.add_texts(texts, metadatas)

# 检索
results = vectorstore.similarity_search("查询内容", k=3)
for doc in results:
    print(doc.page_content)
```

### 8.2 FAISS

```python
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# 创建向量存储
vectorstore = FAISS.from_texts(
    texts=["文档 1", "文档 2", "文档 3"],
    embedding=OpenAIEmbeddings()
)

# 保存
vectorstore.save_local("./faiss_index")

# 加载
vectorstore = FAISS.load_local("./faiss_index", OpenAIEmbeddings())

# 检索
results = vectorstore.similarity_search("查询内容", k=3)
```

### 8.3 Pinecone

```python
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
import pinecone

# 初始化 Pinecone
pinecone.init(api_key="your-api-key", environment="us-west1-gcp")

# 创建向量存储
vectorstore = Pinecone.from_texts(
    texts=["文档 1", "文档 2", "文档 3"],
    embedding=OpenAIEmbeddings(),
    index_name="my-index"
)

# 检索
results = vectorstore.similarity_search("查询内容", k=3)
```

---

## 9. 文档加载与分割

### 9.1 文档加载器

```python
from langchain.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredMarkdownLoader,
    WebBaseLoader
)

# 加载文本文件
loader = TextLoader("file.txt")
documents = loader.load()

# 加载 PDF
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 加载 Markdown
loader = UnstructuredMarkdownLoader("document.md")
documents = loader.load()

# 加载网页
loader = WebBaseLoader("https://example.com")
documents = loader.load()
```

### 9.2 文本分割

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter
)

# 递归字符分割（推荐）
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", "。", "！", "？", "！", "?", " ", ""]
)

# 分割文本
texts = text_splitter.split_text(long_document)

# 分割文档
documents = text_splitter.split_documents(documents)

# Token 分割
token_splitter = TokenTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
```

---

## 10. 实战案例

### 10.1 文档问答系统

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 加载文档
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
texts = text_splitter.split_documents(documents)

# 3. 创建向量存储
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=OpenAIEmbeddings(),
    persist_directory="./chroma_db"
)

# 4. 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

# 5. 使用
result = qa_chain.invoke({"query": "文档中提到了什么？"})
print(result["result"])
print("来源文档：", result["source_documents"])
```

### 10.2 智能客服系统

```python
from langchain.agents import initialize_agent, Tool
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI

# 定义工具
@tool
def check_order_status(order_id: str) -> str:
    """查询订单状态"""
    return "订单已发货"

@tool
def process_return(order_id: str, reason: str) -> str:
    """处理退货"""
    return "退货申请已提交"

# 创建 Agent
tools = [check_order_status, process_return]
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

agent = initialize_agent(
    tools,
    ChatOpenAI(model="gpt-4"),
    agent="conversational-react-description",
    memory=memory,
    verbose=True
)

# 使用
response = agent.run("我的订单 12345 发货了吗？")
```

### 10.3 数据分析助手

```python
from langchain.agents import create_pandas_dataframe_agent
import pandas as pd

# 加载数据
df = pd.read_csv("sales_data.csv")

# 创建 Agent
agent = create_pandas_dataframe_agent(
    ChatOpenAI(model="gpt-4"),
    df,
    verbose=True
)

# 使用
agent.run("销售额最高的月份是哪个月？")
agent.run("计算每个季度的平均销售额")
agent.run("销售额和广告投入的相关性是多少？")
```

---

## 📝 练习题

### 基础题

1. **Prompt 模板**：创建一个带变量的 Prompt 模板

2. **简单链**：创建一个 LLMChain，实现文本摘要功能

3. **记忆系统**：为对话添加 ConversationBufferMemory

### 进阶题

4. **向量存储**：使用 Chroma 创建一个文档检索系统

5. **自定义工具**：创建 3 个自定义工具，并集成到 Agent 中

6. **综合练习**：实现一个完整的文档问答系统，支持 PDF 上传、分割、检索、问答

---

## 🔗 参考资料

### 官方文档
- [LangChain 官方文档](https://python.langchain.com/)
- [LangChain API 参考](https://api.python.langchain.com/)

### 学习资源
- 🔗 [LangChain 中文文档](https://www.langchain.com.cn/)
- 📚 《LangChain for LLM Application Development》
- 🔗 [LangChain GitHub](https://github.com/langchain-ai/langchain)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 模型集成 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 提示管理 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 链式调用 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 记忆系统 | ⭐⭐⭐⭐ | 理解掌握 |
| 工具集成 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 向量存储 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [AI Agent](/ai/agent)  
**下一章：** [AutoGen 多 Agent](/ai/autogen)

**最后更新**：2026-03-12
