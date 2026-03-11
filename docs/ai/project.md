# 实战项目

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-07-10

---

## 📚 目录

1. [项目选题](#1-项目选题)
2. [智能客服系统](#2-智能客服系统)
3. [文档自动总结工具](#3-文档自动总结工具)
4. [代码审查助手](#4-代码审查助手)
5. [数据查询 Agent](#5-数据查询-agent)

---

## 1. 项目选题

### 1.1 选题原则

```
✅ 选择原则：
1. 与实际工作相关
2. 难度适中
3. 有明确价值
4. 可迭代优化

❌ 避免：
1. 过于复杂
2. 脱离实际
3. 无法落地
```

### 1.2 推荐项目

| 项目 | 难度 | 技术栈 | 价值 |
|------|------|--------|------|
| **智能客服** | ⭐⭐⭐ | LLM+RAG | 降低客服成本 |
| **文档总结** | ⭐⭐ | LLM API | 提高阅读效率 |
| **代码助手** | ⭐⭐⭐ | LLM+AST | 提升开发效率 |
| **数据查询** | ⭐⭐⭐ | LLM+SQL | 降低数据门槛 |
| **会议纪要** | ⭐⭐ | ASR+LLM | 提高会议效率 |

---

## 2. 智能客服系统

### 2.1 项目概述

```
目标：构建一个智能客服系统，自动回答用户问题

功能：
1. 自动回答常见问题
2. 查询订单状态
3. 创建工单
4. 转人工客服
```

### 2.2 技术架构

```
用户 → API 网关 → Agent 服务 → LLM
                        ↓
                    知识库（ES）
                    订单系统
                    工单系统
```

### 2.3 核心代码

```java
// Agent 服务
@Service
public class CustomerServiceAgent {
    
    @Autowired
    private RestHighLevelClient esClient;
    
    @Autowired
    private OrderMapper orderMapper;
    
    private final ChatOpenAI llm = new ChatOpenAI("gpt-3.5-turbo");
    
    // 知识库检索
    public String searchKnowledgeBase(String query) {
        SearchRequest request = new SearchRequest("knowledge_base");
        request.source().query(QueryBuilders.matchQuery("content", query));
        
        SearchResponse response = esClient.search(request, RequestOptions.DEFAULT);
        
        StringBuilder result = new StringBuilder();
        for (SearchHit hit : response.getHits().getHits()) {
            result.append(hit.getSourceAsString()).append("\n");
        }
        
        return result.toString();
    }
    
    // 查询订单
    public String checkOrder(String orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            return "未找到订单";
        }
        return "订单状态：" + order.getStatus();
    }
    
    // 对话处理
    public String chat(String userId, String message) {
        // 1. 分析意图
        String intent = analyzeIntent(message);
        
        // 2. 根据意图处理
        String response;
        switch (intent) {
            case "FAQ":
                response = searchKnowledgeBase(message);
                break;
            case "ORDER_QUERY":
                String orderId = extractOrderId(message);
                response = checkOrder(orderId);
                break;
            default:
                response = llm.generate(message);
        }
        
        // 3. 记录对话
        saveConversation(userId, message, response);
        
        return response;
    }
}
```

### 2.4 知识库构建

```python
# 知识库导入脚本
from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")

# FAQ 数据
faqs = [
    {
        "question": "如何退货？",
        "answer": "请在订单详情页点击'申请退货'...",
        "tags": ["退货", "售后"]
    },
    {
        "question": "发货时间多久？",
        "answer": "一般 24 小时内发货...",
        "tags": ["发货", "物流"]
    }
]

# 导入 ES
for faq in faqs:
    es.index(index="knowledge_base", document=faq)
```

---

## 3. 文档自动总结工具

### 3.1 项目概述

```
目标：自动总结长文档，提取核心内容

功能：
1. 支持多种格式（PDF、Word、Markdown）
2. 可定制总结长度
3. 提取关键点
4. 生成摘要
```

### 3.2 技术架构

```
文件上传 → 文本提取 → 分块处理 → LLM 总结 → 输出结果
```

### 3.3 核心代码

```java
@Service
public class DocumentSummarizer {
    
    @Autowired
    private RestHighLevelClient esClient;
    
    private final ChatOpenAI llm = new ChatOpenAI("gpt-3.5-turbo-16k");
    
    // 总结文档
    public String summarize(MultipartFile file, int maxLength) throws Exception {
        // 1. 提取文本
        String text = extractText(file);
        
        // 2. 分块处理
        List<String> chunks = chunkText(text, 2000);
        
        // 3. 逐块总结
        List<String> summaries = new ArrayList<>();
        for (String chunk : chunks) {
            String summary = llm.generate(
                "请总结以下内容，100 字以内：\n" + chunk
            );
            summaries.add(summary);
        }
        
        // 4. 整合总结
        String finalSummary = llm.generate(
            "请整合以下总结，形成一份" + maxLength + "字的完整总结：\n" + 
            String.join("\n", summaries)
        );
        
        return finalSummary;
    }
    
    // 提取文本（PDF）
    private String extractText(MultipartFile file) throws Exception {
        if (file.getOriginalFilename().endsWith(".pdf")) {
            return PdfExtractor.extract(file.getInputStream());
        } else if (file.getOriginalFilename().endsWith(".docx")) {
            return DocxExtractor.extract(file.getInputStream());
        } else {
            return new String(file.getBytes());
        }
    }
    
    // 分块
    private List<String> chunkText(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        String[] paragraphs = text.split("\n\n");
        
        StringBuilder currentChunk = new StringBuilder();
        for (String para : paragraphs) {
            if (currentChunk.length() + para.length() > chunkSize) {
                chunks.add(currentChunk.toString());
                currentChunk = new StringBuilder();
            }
            currentChunk.append(para).append("\n\n");
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString());
        }
        
        return chunks;
    }
}
```

---

## 4. 代码审查助手

### 4.1 项目概述

```
目标：自动审查代码，发现问题并给出建议

功能：
1. 代码规范检查
2. 潜在 Bug 检测
3. 性能优化建议
4. 安全漏洞扫描
```

### 4.2 技术架构

```
代码提交 → 静态分析 → LLM 审查 → 生成报告 → 反馈开发者
```

### 4.3 核心代码

```java
@Service
public class CodeReviewAgent {
    
    private final ChatOpenAI llm = new ChatOpenAI("gpt-4");
    
    // 代码审查
    public CodeReviewResult review(String code, String language) {
        CodeReviewResult result = new CodeReviewResult();
        
        // 1. 静态分析
        List<StaticIssue> staticIssues = staticAnalysis(code, language);
        result.setStaticIssues(staticIssues);
        
        // 2. LLM 审查
        String prompt = buildReviewPrompt(code, language);
        String review = llm.generate(prompt);
        result.setLlmReview(review);
        
        // 3. 提取建议
        List<Suggestion> suggestions = extractSuggestions(review);
        result.setSuggestions(suggestions);
        
        return result;
    }
    
    // 构建审查 Prompt
    private String buildReviewPrompt(String code, String language) {
        return String.format(
            "你是一名资深%s开发工程师，请审查以下代码：\n\n" +
            "审查要点：\n" +
            "1. 代码规范\n" +
            "2. 潜在 Bug\n" +
            "3. 性能问题\n" +
            "4. 安全漏洞\n" +
            "5. 可维护性\n\n" +
            "代码：\n```%s\n%s\n```\n\n" +
            "请按以下格式输出：\n" +
            "### 问题列表\n" +
            "### 优化建议\n" +
            "### 评分（1-10 分）",
            language, language, code
        );
    }
    
    // 静态分析
    private List<StaticIssue> staticAnalysis(String code, String language) {
        // 使用 PMD、Checkstyle 等工具
        // ...
        return new ArrayList<>();
    }
}
```

---

## 5. 数据查询 Agent

### 5.1 项目概述

```
目标：用自然语言查询数据库

功能：
1. 自然语言转 SQL
2. 执行查询
3. 结果可视化
4. 数据解读
```

### 5.2 技术架构

```
用户输入 → NL2SQL → SQL 校验 → 执行查询 → 结果展示
```

### 5.3 核心代码

```java
@Service
public class DataQueryAgent {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private final ChatOpenAI llm = new ChatOpenAI("gpt-4");
    
    // 数据库元数据
    private final String schemaInfo = loadSchemaInfo();
    
    // 自然语言查询
    public QueryResult query(String naturalLanguage) {
        // 1. 生成 SQL
        String sql = generateSql(naturalLanguage);
        
        // 2. 校验 SQL
        if (!validateSql(sql)) {
            return QueryResult.error("SQL 生成失败");
        }
        
        // 3. 执行查询
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        
        // 4. 解读结果
        String interpretation = interpretResult(naturalLanguage, data);
        
        return QueryResult.success(data, interpretation);
    }
    
    // 生成 SQL
    private String generateSql(String naturalLanguage) {
        String prompt = String.format(
            "你是 SQL 专家，请根据以下数据库结构，将自然语言转换为 SQL：\n\n" +
            "数据库结构：\n%s\n\n" +
            "用户问题：%s\n\n" +
            "SQL：",
            schemaInfo, naturalLanguage
        );
        
        return llm.generate(prompt);
    }
    
    // 校验 SQL
    private boolean validateSql(String sql) {
        // 只允许 SELECT
        if (!sql.trim().toUpperCase().startsWith("SELECT")) {
            return false;
        }
        
        // 禁止危险操作
        if (sql.matches(".*(DROP|DELETE|UPDATE|INSERT|ALTER).*")) {
            return false;
        }
        
        return true;
    }
    
    // 解读结果
    private String interpretResult(String question, List<Map<String, Object>> data) {
        String prompt = String.format(
            "请解读以下查询结果：\n\n" +
            "用户问题：%s\n\n" +
            "查询结果：%s\n\n" +
            "解读：",
            question, JSON.toJSONString(data)
        );
        
        return llm.generate(prompt);
    }
}
```

---

## 💡 项目建议

### 启动步骤

```
1. 选择一个小项目（文档总结最简单）
2. 搭建基础框架
3. 集成 AI API
4. 测试优化
5. 逐步迭代
```

### 技术选型

```
✅ 推荐：
- LLM：通义千问、GPT-3.5
- 框架：LangChain、SpringBoot
- 存储：MySQL、ES
- 部署：Docker

❌ 避免：
- 一开始就用大模型
- 过度设计
- 忽视安全
```

---

## 📚 参考资料

- [LangChain 实战项目](https://github.com/langchain-ai/langchain)
- [AI 应用开发指南](https://github.com/OpenAI/openai-cookbook)

---

> 💡 **学习建议**：实战项目是学习的最佳方式，建议：
> 1. 从简单项目开始
> 2. 边做边学
> 3. 记录问题和解决方案
> 4. 持续迭代优化
