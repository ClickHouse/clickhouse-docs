---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: '使用语义层自定义 Ask AI 聊天'
title: '使用语义层优化 Ask AI 聊天 Agent 会话'
pagination_prev: null
pagination_next: null
description: '使用 AGENTS.md 向 Ask AI 聊天 Agent 提供自定义业务逻辑和数据特定指令的指南'
keywords: ['AI', 'ClickHouse Cloud', 'Agent', 'AGENTS.md', 'Semantic Layer', 'Custom Instructions', 'System Prompt']
show_related_blogs: true
doc_type: 'guide'
---

# 使用语义层自定义 Ask AI 聊天 \{#customize-ask-ai-chat-with-a-semantic-layer\}

Ask AI 聊天代理可以通过 **AGENTS.md** 进行自定义，从而理解你的特定业务逻辑、数据结构和领域知识——它是一个特殊的已保存查询，作为代理系统提示之上的语义层。

通过创建一个 AGENTS.md 文件，你可以提供自定义指令，这些指令会在每次会话开始时被注入，用于根据你组织独特的需求、计算规则和约定来引导 SQL 查询生成和数据分析。

## 工作原理 \{#how-it-works\}

当你在 Cloud Console 中保存一个名为“AGENTS.md”的查询（区分大小写）时：

1. 在发送消息时，Ask AI 聊天代理会自动加载该文件
2. 文件内容会被放入一个结构化内容标签中，并注入到代理的 system prompt 中
3. 这些指令会应用于该服务中的所有 Ask AI 聊天会话

## 创建 AGENTS.md \{#creating-agents-md\}

<VerticalStepper headerLevel="h3">

### 创建保存的查询 \{#create-query\}

1. 在 Cloud 控制台中创建一个新的查询
2. 将其名称精确设置为：**"AGENTS.md"**（区分大小写）
3. 在查询文本编辑器中编写自定义指令（不是实际的 SQL 语句）
4. 保存该查询

### 添加指令 \{#add-instructions\}

使用清晰、可执行的语言来组织指令。包括：

- 业务规则和计算
- 关于数据结构的指导
- 领域特定的术语
- 常见查询模式
- 性能优化规则

</VerticalStepper>

## 最佳实践 \{#best-practices\}

### 将上下文视为有限资源 \{#finite-resource\}

上下文十分宝贵——每个 token 都会消耗智能体的“注意力预算”。就像人类的工作记忆有限一样，随着上下文增长，语言模型的性能会逐渐下降。这意味着你需要找到**规模最小的一组高信号 token**，以最大化获得期望结果的概率。

### 找到合适的“高度” \{#right-altitude\}

在两个极端之间找到平衡：

- **过于具体**：将脆弱的 if-else 逻辑硬编码进去，导致系统脆弱且维护复杂
- **过于空泛**：只有高层指导，没有给出具体信号，或错误地假设已有共享上下文

理想的“高度”应当既足够具体，能有效引导行为，又足够灵活，让模型可以运用强大的启发式策略。先在可用的最佳模型上使用尽可能精简的 prompt 起步，然后根据观察到的失败模式补充清晰的指令。

### 使用结构化部分进行组织 \{#structured-sections\}

使用 XML 标签或 Markdown 标题来创建清晰、易于浏览的独立部分：

```xml
<background_information>
Context about your data and domain
</background_information>

<calculation_rules>
Specific formulas and business logic
</calculation_rules>

<tool_guidance>
How to use specific ClickHouse features
</tool_guidance>
```


### 提供多样且典型的示例 \{#canonical-examples\}

示例就像“胜过千言万语的图片”。与其在提示词中塞入每一个边界情况，不如精心挑选一组多样化的典型示例，以有效呈现期望的行为。

### 保持精简但完整 \{#minimal-complete\}

- 只包含经常需要的指令
- 保持简洁——过大的上下文会因“上下文腐蚀（context rot）”而降低性能
- 移除过时或极少使用的规则
- 确保信息足够，以引导出期望的行为

:::tip
精简不一定意味着篇幅很短。你需要提供足够的细节，以确保智能体（agent）能遵循预期行为，只是要避免不必要的冗长。
:::

## 示例：从原始数据计算指标 \{#example-calculated-metrics\}

当某些指标需要通过特定计算而不是直接读取列数据获得时，对代理进行相应的引导：

```xml
<metric_calculations>
IMPORTANT: "active_sessions" is NOT a column. It must be calculated.

To calculate active sessions:
COUNT(DISTINCT session_id || '|' || user_id) AS active_sessions

This counts unique combinations of session and user identifiers.

When the user asks for "active sessions" or "session count", always use this formula:
SELECT
    date,
    COUNT(DISTINCT session_id || '|' || user_id) AS active_sessions
FROM events
GROUP BY date;

</metric_calculations>
```


## 示例：业务逻辑规则 \{#example-business-logic\}

定义特定领域的计算和分类：

```xml
<business_rules>
Revenue Calculation:
- Exclude refunded transactions: WHERE transaction_status != 'refunded'
- Apply regional tax rates using CASE expressions
- Use MRR for subscriptions:
  SUM(CASE
    WHEN billing_cycle = 'monthly' THEN amount
    WHEN billing_cycle = 'yearly' THEN amount / 12
    ELSE 0
  END) AS mrr

Traffic Source Classification:
Use CASE expression to categorize:
CASE
  WHEN traffic_source IN ('google', 'bing', 'organic') THEN 'Organic Search'
  WHEN traffic_source IN ('facebook', 'instagram', 'social') THEN 'Social Media'
  WHEN traffic_source = 'direct' THEN 'Direct'
  ELSE 'Other'
END AS source_category

Customer Segmentation:
- Enterprise: annual_contract_value >= 100000
- Mid-Market: annual_contract_value >= 10000 AND annual_contract_value < 100000
- SMB: annual_contract_value < 10000

Always include these categorizations when generating traffic or revenue reports.
</business_rules>
```


## 示例：数据结构中的特殊情况 \{#example-data-quirks\}

记录非常规数据格式或历史遗留的 schema 设计决策：

```xml
<data_structure_notes>
The user_status column uses numeric codes, not strings:
- 1 = 'active'
- 2 = 'inactive'
- 3 = 'suspended'
- 99 = 'deleted'

When filtering or displaying user status, always use:
CASE user_status
  WHEN 1 THEN 'active'
  WHEN 2 THEN 'inactive'
  WHEN 3 THEN 'suspended'
  WHEN 99 THEN 'deleted'
END AS status_label

The product_metadata column contains JSON strings that must be parsed:
SELECT
    product_id,
    JSONExtractString(product_metadata, 'category') AS category,
    JSONExtractInt(product_metadata, 'inventory_count') AS inventory
FROM products;
</data_structure_notes>
```


## 示例：领域术语 \{#example-terminology\}

将业务术语映射到具体的技术实现：

```xml
<terminology>
When users refer to "conversions", they mean:
- For e-commerce: transactions WHERE transaction_type = 'purchase'
- For SaaS: subscriptions WHERE subscription_status = 'active' AND first_payment_date IS NOT NULL

"Churn" is calculated as:
COUNT(DISTINCT user_id) WHERE last_active_date < today() - INTERVAL 90 DAY
AND previous_subscription_status = 'active'

"DAU" (Daily Active Users) means:
COUNT(DISTINCT user_id) WHERE activity_date = today()

"Qualified leads" must meet ALL criteria:
- lead_score >= 70
- company_size >= 50
- budget_confirmed = true
- contact_role IN ('Director', 'VP', 'C-Level')
</terminology>
```
