# 数据分析助手项目

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-04-15

---

## 📚 目录

[[toc]]

---

## 1. 项目简介

### 1.1 功能描述

基于 LLM 的数据分析助手，支持自然语言查询、数据可视化

### 1.2 核心功能

- 自然语言 SQL 生成
- 数据可视化
- 洞察分析
- 报告生成

---

## 2. 系统架构

```
用户提问 → NL2SQL → 数据库查询 → 结果处理 → 可视化/报告
```

---

## 3. 核心实现

### 3.1 NL2SQL

```python
from langchain.chains import create_sql_query_chain

chain = create_sql_query_chain(llm, db)
sql = chain.invoke({"question": "查询销售额前 10 的产品"})
```

### 3.2 数据可视化

```python
import pandas as pd
import matplotlib.pyplot as plt

def visualize_data(df, chart_type):
    if chart_type == "bar":
        df.plot.bar()
    elif chart_type == "line":
        df.plot.line()
    plt.show()
```

### 3.3 洞察分析

```python
def analyze_insights(df):
    prompt = f"""
    分析以下数据的洞察：
    {df.describe()}
    
    请提供：
    1. 关键发现
    2. 趋势分析
    3. 建议
    """
    return llm.predict(prompt)
```

---

## 4. Streamlit 界面

```python
import streamlit as st
import pandas as pd

st.title("📊 数据分析助手")

query = st.text_input("请输入分析需求：")
if st.button("分析"):
    sql = nl2sql(query)
    df = pd.read_sql(sql, connection)
    st.dataframe(df)
    st.pyplot(visualize_data(df, "bar"))
    st.write(analyze_insights(df))
```

---

## 📝 练习题

1. 实现 NL2SQL 功能
2. 添加多种图表类型
3. 生成分析报告

---

**最后更新**：2026-03-12
