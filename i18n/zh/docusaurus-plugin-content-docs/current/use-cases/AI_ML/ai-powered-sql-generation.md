---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'AI 驱动的 SQL 生成'
title: 'AI 驱动的 SQL 生成'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何在 ClickHouse Client 或 clickhouse-local 中使用 AI 生成 SQL 查询。'
keywords: ['AI', 'SQL 生成']
show_related_blogs: true
doc_type: 'guide'
---

从 ClickHouse 25.7 开始，[ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) 和 [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) 内置了[AI 驱动的功能](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation)，可以将自然语言描述转换为 SQL 查询。借助该功能，用户可以用普通文本描述自己的数据需求，系统会将其转换为相应的 SQL 语句。

这一功能对不熟悉复杂 SQL 语法的用户，或需要快速生成查询以进行探索式数据分析的用户尤其有用。该功能适用于标准的 ClickHouse 表，并支持常见的查询模式，包括过滤、聚合和连接。

这是通过以下内置工具和函数实现的：

* `list_databases` - 列出 ClickHouse 实例中所有可用的数据库
* `list_tables_in_database` - 列出指定数据库中的所有表
* `get_schema_for_table` - 获取指定表的 `CREATE TABLE` 语句（表结构）

## 前提条件 {#prerequisites}

我们需要将 Anthropic 或 OpenAI 密钥添加为环境变量：

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

或者可以[提供一个配置文件](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)。


## 连接到 ClickHouse SQL Playground {#connecting-to-the-clickhouse-sql-playground}

我们将使用 [ClickHouse SQL Playground](https://sql.clickhouse.com/) 来演示该功能。

我们可以使用以下命令连接到 ClickHouse SQL Playground：

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
我们假定您已经安装了 ClickHouse；如果尚未安装，请参阅[安装指南](https://clickhouse.com/docs/install)。
:::


## 使用自然语言向 ClickHouse 提问 {#asking-clickhouse-questions-in-natural-language}

现在是开始提问的时候了！

文本转 SQL 功能本质上是一个一次性查询生成工具。由于它不会保留对话历史，请在你的问题中尽可能包含有用的上下文。请明确说明：

时间段或日期范围\
你希望进行的分析类型（平均值、总量、排名等）\
任何筛选条件

### 查找高房价住房市场 {#finding-expensive-housing-markets}

我们先从一个关于房价的问题开始。SQL playground 中包含一个英国房价数据集，AI 会自动识别该数据集：

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

按下回车键后，我们就能看到 AI 在尝试回答我们问题时的思考过程。

```text
• Starting AI SQL generation with schema discovery...
─────────────────────────────────────────────────
🧠 thinking...[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01QpQd35ZD8HM9QSYFZuQ8Wh
🔧 Calling: list_databases [toolu_01...]
🧠 thinking✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_016DxK8SMVKGrUPfFwi43AzE
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 thinking.✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 thinking.[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_015giF12wm619beNGC5aTrmw
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 thinking..✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01HxT1HKbaTT3165Wx5bDtY9
─────────────────────────────────────────────────
• ✨ SQL query generated successfully!
:) SELECT     town,     district,     county,     round(avg(price), 2) as avg_price,     count() as total_sales FROM uk.uk_price_paid WHERE date >= '2021-01-01' AND date <= '2021-12-31' GROUP BY     town,     district,     county HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10
```

AI 会按以下步骤执行：

1. 架构发现（Schema discovery）- 探索可用的数据库和数据表
2. 数据表分析（Table analysis）- 检查相关数据表的结构
3. 查询生成（Query generation）- 基于你的问题和已发现的架构生成 SQL

我们可以看到，它确实找到了 `uk_price_paid` 表，并为我们生成了一条可执行的查询语句。
如果我们运行该查询，将会看到如下输出：


```text
┌─town───────────┬─district───────────────┬─county──────────┬──avg_price─┬─total_sales─┐
│ ILKLEY         │ HARROGATE              │ NORTH YORKSHIRE │    4310200 │          10 │
│ LONDON         │ CITY OF LONDON         │ GREATER LONDON  │ 4008117.32 │         311 │
│ LONDON         │ CITY OF WESTMINSTER    │ GREATER LONDON  │ 2847409.81 │        3984 │
│ LONDON         │ KENSINGTON AND CHELSEA │ GREATER LONDON  │  2331433.1 │        2594 │
│ EAST MOLESEY   │ RICHMOND UPON THAMES   │ GREATER LONDON  │ 2244845.83 │          12 │
│ LEATHERHEAD    │ ELMBRIDGE              │ SURREY          │ 2051836.42 │         102 │
│ VIRGINIA WATER │ RUNNYMEDE              │ SURREY          │ 1914137.53 │         169 │
│ REIGATE        │ MOLE VALLEY            │ SURREY          │ 1715780.89 │          18 │
│ BROADWAY       │ TEWKESBURY             │ GLOUCESTERSHIRE │ 1633421.05 │          19 │
│ OXFORD         │ SOUTH OXFORDSHIRE      │ OXFORDSHIRE     │ 1628319.07 │         405 │
└────────────────┴────────────────────────┴─────────────────┴────────────┴─────────────┘
```

如果我们想要继续追问，就需要从头重新表述问题。


### 在大伦敦地区查找高价房产 {#finding-expensive-properties-in-greater-london}

由于该功能不会保留会话历史，因此每个查询都必须是独立的。当提出后续问题时，你需要提供完整的上下文，而不是引用之前的查询。
例如，在看到前面的结果之后，我们可能希望专门关注大伦敦地区的房产。此时不能只问“那大伦敦地区呢？”，而是需要包含完整的上下文信息：

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

可以看到，尽管刚刚已经检查过这些数据，AI 仍然会再次执行相同的发现流程：

```text
• Starting AI SQL generation with schema discovery...
─────────────────────────────────────────────────
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_012m4ayaSHTYtX98gxrDy1rz
🔧 Calling: list_databases [toolu_01...]
✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
🧠 thinking.✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🧠 thinking.[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01KU4SZRrJckutXUzfJ4NQtA
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 thinking..✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01X9CnxoBpbD2xj2UzuRy2is
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 thinking.✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 thinking...[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01QTMypS1XuhjgVpDir7N9wD
─────────────────────────────────────────────────
• ✨ SQL query generated successfully!
:) SELECT     district,     toYear(date) AS year,     round(avg(price), 2) AS avg_price,     count() AS total_sales FROM uk.uk_price_paid WHERE county = 'GREATER LONDON' GROUP BY district, year HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10;
```

这将生成一个更有针对性的查询，只筛选大伦敦地区的数据，并按年份细分结果。
查询结果如下：


```text
┌─district────────────┬─year─┬───avg_price─┬─total_sales─┐
│ CITY OF LONDON      │ 2019 │ 14504772.73 │         299 │
│ CITY OF LONDON      │ 2017 │  6351366.11 │         367 │
│ CITY OF LONDON      │ 2016 │  5596348.25 │         243 │
│ CITY OF LONDON      │ 2023 │  5576333.72 │         252 │
│ CITY OF LONDON      │ 2018 │  4905094.54 │         523 │
│ CITY OF LONDON      │ 2021 │  4008117.32 │         311 │
│ CITY OF LONDON      │ 2025 │  3954212.39 │          56 │
│ CITY OF LONDON      │ 2014 │  3914057.39 │         416 │
│ CITY OF LONDON      │ 2022 │  3700867.19 │         290 │
│ CITY OF WESTMINSTER │ 2018 │  3562457.76 │        3346 │
└─────────────────────┴──────┴─────────────┴─────────────┘
```

伦敦金融城一贯位列最昂贵的行政区之首！你会注意到，AI 生成了一个相当合理的查询，不过结果是按平均价格排序，而不是按时间先后排序。对于年度同比分析，我们可以将你的问题进一步细化，明确询问“每一年最昂贵的行政区”，从而以不同的方式对结果进行分组。
