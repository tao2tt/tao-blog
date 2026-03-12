# Python 快速上手

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-29  
> 难度：⭐⭐☆☆☆  
> 前置知识：[大模型基础](/ai/llm-basics)

---

## 📚 目录

[[toc]]

---

## 1. Python 简介

### 1.1 为什么选择 Python

**Python 是 AI 开发的首选语言**

| 优势 | 说明 |
|------|------|
| **语法简洁** | 代码量少，易读易写 |
| **生态丰富** | 海量 AI/ML 库 |
| **学习曲线低** | 适合初学者 |
| **社区活跃** | 问题容易找到答案 |

**AI 相关库：**

```
AI 开发生态
├── 大模型 API
│   ├── openai（OpenAI API）
│   ├── dashscope（通义千问）
│   └── ollama（本地模型）
│
├── 开发框架
│   ├── langchain（应用编排）
│   ├── llama-index（数据索引）
│   └── autogen（多 Agent）
│
├── 数据处理
│   ├── pandas（数据分析）
│   ├── numpy（数值计算）
│   └── requests（HTTP 请求）
│
└── 可视化
    ├── matplotlib（绘图）
    └── streamlit（Web 界面）
```

### 1.2 环境安装

**安装 Python：**

```bash
# macOS
brew install python@3.10

# Linux
sudo apt install python3 python3-pip

# Windows
# 从官网下载：https://www.python.org/downloads/
```

**验证安装：**

```bash
python3 --version
# 输出：Python 3.10.x

pip3 --version
# 输出：pip x.x.x
```

**创建虚拟环境（推荐）：**

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# 退出虚拟环境
deactivate
```

---

## 2. 基础语法

### 2.1 变量与数据类型

```python
# 变量定义（无需声明类型）
name = "张三"        # 字符串 str
age = 25             # 整数 int
height = 1.75        # 浮点数 float
is_student = False   # 布尔 bool

# 查看类型
print(type(name))    # <class 'str'>
print(type(age))     # <class 'int'>

# 类型转换
age_str = str(age)   # 25 → "25"
age_int = int("30")  # "30" → 30
price = float("19.9") # "19.9" → 19.9
```

### 2.2 容器类型

```python
# 列表（List）- 有序、可变
fruits = ["apple", "banana", "orange"]
fruits.append("grape")      # 添加
fruits[0] = "Apple"         # 修改
first = fruits[0]           # 访问

# 字典（Dict）- 键值对
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}
person["age"] = 26          # 修改
name = person["name"]       # 访问
person["email"] = "test@example.com"  # 添加

# 元组（Tuple）- 有序、不可变
coordinates = (10, 20)
x, y = coordinates          # 解包

# 集合（Set）- 无序、不重复
unique_numbers = {1, 2, 3, 3, 2}
print(unique_numbers)       # {1, 2, 3}
```

### 2.3 控制流

```python
# 条件判断
age = 20

if age < 18:
    print("未成年")
elif age < 60:
    print("成年")
else:
    print("退休")

# for 循环
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)

# while 循环
count = 0
while count < 5:
    print(count)
    count += 1
```

---

## 3. 函数

### 3.1 函数定义

```python
# 基础函数
def greet(name):
    return f"你好，{name}！"

message = greet("张三")
print(message)  # 你好，张三！

# 带默认参数
def greet_with_default(name="朋友"):
    return f"你好，{name}！"

print(greet_with_default())        # 你好，朋友！
print(greet_with_default("张三"))  # 你好，张三！

# 可变参数
def sum_all(*numbers):
    return sum(numbers)

print(sum_all(1, 2, 3))      # 6
print(sum_all(1, 2, 3, 4, 5)) # 15

# 关键字参数
def create_person(**kwargs):
    return kwargs

person = create_person(name="张三", age=25, city="北京")
print(person)  # {'name': '张三', 'age': 25, 'city': '北京'}
```

### 3.2 Lambda 函数

```python
# 匿名函数
add = lambda x, y: x + y
print(add(2, 3))  # 5

# 配合高阶函数使用
numbers = [1, 2, 3, 4, 5]

# map：转换
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# filter：过滤
even = list(filter(lambda x: x % 2 == 0, numbers))
print(even)  # [2, 4]

# sorted：排序
pairs = [(1, 3), (3, 1), (2, 2)]
sorted_pairs = sorted(pairs, key=lambda x: x[0])
print(sorted_pairs)  # [(1, 3), (2, 2), (3, 1)]
```

---

## 4. 面向对象

### 4.1 类与对象

```python
class Person:
    # 构造方法
    def __init__(self, name, age):
        self.name = name  # 实例属性
        self.age = age
    
    # 实例方法
    def introduce(self):
        return f"我是{self.name}，今年{self.age}岁"
    
    # 类方法
    @classmethod
    def create_adult(cls, name):
        return cls(name, 18)
    
    # 静态方法
    @staticmethod
    def is_adult(age):
        return age >= 18

# 创建对象
person = Person("张三", 25)
print(person.introduce())  # 我是张三，今年 25 岁

# 类方法
adult = Person.create_adult("李四")

# 静态方法
print(Person.is_adult(20))  # True
```

### 4.2 继承

```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        pass

class Dog(Animal):  # 继承 Animal
    def speak(self):  # 重写方法
        return "汪汪汪"

class Cat(Animal):
    def speak(self):
        return "喵喵喵"

dog = Dog("旺财")
print(dog.speak())  # 汪汪汪

cat = Cat("咪咪")
print(cat.speak())  # 喵喵喵
```

---

## 5. 常用库

### 5.1 HTTP 请求（requests）

```python
# 安装
# pip install requests

import requests

# GET 请求
response = requests.get("https://api.example.com/data")
data = response.json()

# 带参数
params = {"q": "python", "limit": 10}
response = requests.get("https://api.example.com/search", params=params)

# POST 请求
data = {"name": "张三", "age": 25}
response = requests.post("https://api.example.com/users", json=data)

# 带请求头
headers = {"Authorization": "Bearer your-token"}
response = requests.get("https://api.example.com/protected", headers=headers)

# 异常处理
try:
    response = requests.get("https://api.example.com/data", timeout=5)
    response.raise_for_status()  # 检查状态码
    data = response.json()
except requests.exceptions.RequestException as e:
    print(f"请求失败：{e}")
```

### 5.2 JSON 处理

```python
import json

# Python 对象 → JSON 字符串
data = {"name": "张三", "age": 25}
json_str = json.dumps(data, ensure_ascii=False)
print(json_str)  # {"name": "张三", "age": 25}

# JSON 字符串 → Python 对象
data = json.loads(json_str)
print(data["name"])  # 张三

# 读取 JSON 文件
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 写入 JSON 文件
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

### 5.3 文件操作

```python
# 读取文件
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 逐行读取
with open("file.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

# 写入文件
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\n")
    f.write("第二行\n")

# 追加写入
with open("output.txt", "a", encoding="utf-8") as f:
    f.write("追加内容\n")
```

---

## 6. AI 相关库

### 6.1 OpenAI

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

### 6.2 LangChain

```python
# 安装
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

### 6.3 Pandas（数据处理）

```python
# 安装
# pip install pandas

import pandas as pd

# 创建 DataFrame
data = {
    "name": ["张三", "李四", "王五"],
    "age": [25, 30, 35],
    "city": ["北京", "上海", "广州"]
}
df = pd.DataFrame(data)

# 查看数据
print(df.head())      # 前几行
print(df.info())      # 数据信息
print(df.describe())  # 统计信息

# 筛选
adults = df[df["age"] > 30]

# 分组统计
avg_age_by_city = df.groupby("city")["age"].mean()

# 读取 CSV
df = pd.read_csv("data.csv")

# 写入 CSV
df.to_csv("output.csv", index=False, encoding="utf-8-sig")
```

---

## 7. 异步编程

### 7.1 asyncio 基础

```python
import asyncio

# 定义异步函数
async def fetch_data(url):
    print(f"开始请求：{url}")
    await asyncio.sleep(1)  # 模拟异步操作
    print(f"完成请求：{url}")
    return {"url": url, "data": "some data"}

# 运行异步函数
async def main():
    # 串行执行
    result1 = await fetch_data("https://api1.com")
    result2 = await fetch_data("https://api2.com")
    
    # 并行执行
    results = await asyncio.gather(
        fetch_data("https://api1.com"),
        fetch_data("https://api2.com"),
        fetch_data("https://api3.com")
    )
    
    print(results)

# 运行
asyncio.run(main())
```

### 7.2 aiohttp（异步 HTTP）

```python
# 安装
# pip install aiohttp

import aiohttp
import asyncio

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.json()

async def main():
    async with aiohttp.ClientSession() as session:
        # 并发请求
        urls = [
            "https://api1.com/data",
            "https://api2.com/data",
            "https://api3.com/data"
        ]
        
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        print(results)

asyncio.run(main())
```

---

## 8. 实战案例

### 8.1 调用大模型 API

```python
from openai import OpenAI

def chat_with_ai(question):
    """与大模型对话"""
    client = OpenAI(api_key="your-api-key")
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "你是一个有帮助的助手"},
            {"role": "user", "content": question}
        ]
    )
    
    return response.choices[0].message.content

# 使用
answer = chat_with_ai("什么是人工智能？")
print(answer)
```

### 8.2 批量处理

```python
import asyncio
from openai import AsyncOpenAI

async def process_questions(questions):
    """批量处理问题"""
    client = AsyncOpenAI(api_key="your-api-key")
    
    async def ask(question):
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": question}
            ]
        )
        return response.choices[0].message.content
    
    # 并发处理
    tasks = [ask(q) for q in questions]
    answers = await asyncio.gather(*tasks)
    
    return answers

# 使用
questions = ["问题 1", "问题 2", "问题 3"]
answers = asyncio.run(process_questions(questions))

for q, a in zip(questions, answers):
    print(f"Q: {q}")
    print(f"A: {a}\n")
```

### 8.3 数据清洗

```python
import pandas as pd
import re

def clean_text(text):
    """清洗文本"""
    # 去除特殊字符
    text = re.sub(r'[^\w\s\u4e00-\u9fff]', '', text)
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# 读取数据
df = pd.read_csv("raw_data.csv")

# 清洗
df["cleaned_text"] = df["text"].apply(clean_text)

# 保存
df.to_csv("cleaned_data.csv", index=False, encoding="utf-8-sig")
```

---

## 📝 练习题

### 基础题

1. **变量与类型**：创建一个字典存储个人信息（姓名、年龄、城市）

2. **函数**：编写一个函数，计算列表的平均值

3. **文件操作**：读取一个文本文件，统计每行字数

### 进阶题

4. **API 调用**：使用 requests 库调用一个公开 API（如天气 API）

5. **异步编程**：使用 asyncio 并发请求 3 个 URL

6. **综合练习**：编写一个脚本，读取 CSV 文件，清洗数据，调用大模型 API 进行分析

---

## 🔗 参考资料

### 官方文档
- [Python 官方教程](https://docs.python.org/3/tutorial/)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [LangChain 文档](https://python.langchain.com/)

### 学习资源
- 📚 《Python 编程：从入门到实践》
- 📺 B 站「廖雪峰 Python 教程」
- 🔗 [Real Python](https://realpython.com/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 基础语法 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 函数 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 面向对象 | ⭐⭐⭐⭐ | 理解掌握 |
| 常用库 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 异步编程 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [大模型基础](/ai/llm-basics)  
**下一章：** [Prompt 基础](/ai/prompt)

**最后更新**：2026-03-12
