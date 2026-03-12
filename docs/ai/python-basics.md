# Python 快速上手

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-17

---

## 📚 目录

[[toc]]

---

## 1. Python 简介

### 1.1 为什么选择 Python

- 语法简洁
- 生态丰富
- AI 领域首选语言

### 1.2 环境安装

```bash
# 安装 Python 3.10+
brew install python  # macOS
apt install python3  # Linux

# 创建虚拟环境
python -m venv venv
source venv/bin/activate
```

---

## 2. 基础语法

### 2.1 变量与数据类型

```python
# 基本类型
name = "Alice"      # str
age = 25            # int
height = 1.75       # float
is_student = True   # bool

# 容器类型
fruits = ["apple", "banana"]     # list
person = {"name": "Bob", "age": 30}  # dict
unique_ids = {1, 2, 3}           # set
```

### 2.2 控制流

```python
# 条件判断
if age >= 18:
    print("成年")
else:
    print("未成年")

# 循环
for fruit in fruits:
    print(fruit)

for i in range(5):
    print(i)
```

---

## 3. 函数

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# 调用
print(greet("Alice"))
print(greet("Bob", "Hi"))

# Lambda 函数
add = lambda x, y: x + y
```

---

## 4. 面向对象

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"我是{self.name}，今年{self.age}岁"

p = Person("Alice", 25)
print(p.introduce())
```

---

## 5. 常用库

### 5.1 数据处理

```python
import pandas as pd
import numpy as np

df = pd.read_csv("data.csv")
```

### 5.2 HTTP 请求

```python
import requests

response = requests.get("https://api.example.com/data")
data = response.json()
```

### 5.3 JSON 处理

```python
import json

data = json.loads('{"name": "Alice"}')
json_str = json.dumps(data)
```

---

## 6. 异步编程

```python
import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return "data"

async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
```

---

## 7. AI 相关库

```python
# OpenAI
from openai import OpenAI

# LangChain
from langchain.chat_models import ChatOpenAI

# Hugging Face
from transformers import pipeline
```

---

## 📝 练习题

1. 编写一个函数处理列表数据
2. 使用 requests 调用 API
3. 用 asyncio 实现并发请求

---

## 🔗 参考资料

- [Python 官方教程](https://docs.python.org/3/tutorial/)
- 《Python 编程：从入门到实践》
- [Real Python](https://realpython.com/)

---

**最后更新**：2026-03-12
