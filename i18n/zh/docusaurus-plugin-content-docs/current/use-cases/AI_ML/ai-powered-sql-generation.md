---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'AI-powered SQL generation'
title: 'AI-powered SQL generation'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何在 ClickHouse Client 或 clickhouse-local 中使用 AI 生成 SQL 查询。'
keywords: ['AI', 'SQL generation']
show_related_blogs: true
doc_type: 'guide'
---

从 ClickHouse 25.7 开始，[ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) 和 [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) 内置了[AI 驱动功能](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation)，可以将自然语言描述转换为 SQL 查询。借助该功能，用户可以用自然语言文本描述自己的数据需求，系统会将其转换为相应的 SQL 语句。

此功能对不熟悉复杂 SQL 语法的用户，或需要快速生成查询以进行探索性数据分析的场景尤其有用。该功能适用于标准的 ClickHouse 表，并支持常见的查询模式，包括过滤、聚合和连接。

其实现依赖以下内置工具/函数：

* `list_databases` - 列出 ClickHouse 实例中所有可用数据库
* `list_tables_in_database` - 列出某个特定数据库中的所有表
* `get_schema_for_table` - 获取特定表的 `CREATE TABLE` 语句（表结构）



## 前提条件 {#prerequisites}

我们需要将 Anthropic 或 OpenAI 密钥添加为环境变量:

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

或者,您也可以[提供配置文件](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)。


## 连接到 ClickHouse SQL 演练场 {#connecting-to-the-clickhouse-sql-playground}

我们将使用 [ClickHouse SQL 演练场](https://sql.clickhouse.com/) 来演示此功能。

可以使用以下命令连接到 ClickHouse SQL 演练场:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
我们假设您已安装 ClickHouse,如果尚未安装,请参阅[安装指南](https://clickhouse.com/docs/install)
:::


## 使用自然语言向 ClickHouse 提问 {#asking-clickhouse-questions-in-natural-language}

现在可以开始提问了!

文本转 SQL 功能本质上是一个单次查询生成工具。由于它不会维护对话历史记录,因此请在问题中包含尽可能多的有用上下文信息。请明确说明:

时间段或日期范围
所需的分析类型(平均值、总计、排名等)
任何筛选条件

### 查找昂贵的房地产市场 {#finding-expensive-housing-markets}

让我们从询问房价问题开始。SQL 演练场包含一个英国房价数据集,AI 将自动发现该数据集:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

按下回车键后,我们将看到 AI 尝试回答问题时的思考过程。

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

AI 遵循以下步骤:

1. 模式发现 - 探索可用的数据库和表
2. 表分析 - 检查相关表的结构
3. 查询生成 - 根据您的问题和发现的模式创建 SQL

我们可以看到它确实找到了 `uk_price_paid` 表并为我们生成了一个查询。
如果运行该查询,我们将看到以下输出:


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

如果要提出后续问题，需要重新完整地提出问题。

### 查找大伦敦地区的昂贵房产 {#finding-expensive-properties-in-greater-london}

由于该功能不会保留对话历史记录,每个查询都必须是完整独立的。在提出后续问题时,需要提供完整的上下文,而不是引用之前的查询。
例如,在查看之前的结果后,我们可能希望专门关注大伦敦地区的房产。此时不应询问"大伦敦地区的情况如何?",而是需要包含完整的上下文:

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

请注意,尽管 AI 刚刚分析过这些数据,但它仍会执行相同的数据探索过程:


```text
• 正在启动 AI SQL 生成并发现架构...
─────────────────────────────────────────────────
🧠 思考中[INFO] 文本生成成功 - 模型:claude-3-5-sonnet-latest,响应 ID:msg_012m4ayaSHTYtX98gxrDy1rz
🔧 Calling: list_databases [toolu_01...]
✓ list_databases 已完成
  └─ 已找到 37 个数据库:- amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
🧠 思考中.✓ list_databases 已完成
  └─ 已找到 37 个数据库:- amazon - bluesky - country - covid - default - dns - en...
🧠 思考中.[INFO] 文本生成成功 - 模型:claude-3-5-sonnet-latest,响应 ID:msg_01KU4SZRrJckutXUzfJ4NQtA
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 思考中..✓ list_tables_in_database 已完成
  └─ 在数据库 'uk' 中已找到 9 个表:- uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database 已完成
  └─ 在数据库 'uk' 中已找到 9 个表:- uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 思考中[INFO] 文本生成成功 - 模型:claude-3-5-sonnet-latest,响应 ID:msg_01X9CnxoBpbD2xj2UzuRy2is
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 思考中.✓ get_schema_for_table 已完成
  └─ uk.uk_price_paid 的架构:CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table 已完成
  └─ uk.uk_price_paid 的架构:CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 思考中...[INFO] 文本生成成功 - 模型:claude-3-5-sonnet-latest,响应 ID:msg_01QTMypS1XuhjgVpDir7N9wD
─────────────────────────────────────────────────
• ✨ SQL 查询已成功生成!
:) SELECT     district,     toYear(date) AS year,     round(avg(price), 2) AS avg_price,     count() AS total_sales FROM uk.uk_price_paid WHERE county = 'GREATER LONDON' GROUP BY district, year HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10;
```

这会生成一个更有针对性的查询，该查询专门筛选大伦敦地区的数据，并按年份拆分结果。
查询的输出如下所示：

```text
┌─区域────────────────┬─年份─┬───平均价格─┬─总销售额─┐
│ 伦敦市              │ 2019 │ 14504772.73 │         299 │
│ 伦敦市              │ 2017 │  6351366.11 │         367 │
│ 伦敦市              │ 2016 │  5596348.25 │         243 │
│ 伦敦市              │ 2023 │  5576333.72 │         252 │
│ 伦敦市              │ 2018 │  4905094.54 │         523 │
│ 伦敦市              │ 2021 │  4008117.32 │         311 │
│ 伦敦市              │ 2025 │  3954212.39 │          56 │
│ 伦敦市              │ 2014 │  3914057.39 │         416 │
│ 伦敦市              │ 2022 │  3700867.19 │         290 │
│ 威斯敏斯特市        │ 2018 │  3562457.76 │        3346 │
└─────────────────────┴──────┴─────────────┴─────────────┘
```

伦敦金融城始终是最昂贵的行政区！你会发现，AI 生成了一个合理的查询，虽然结果是按平均价格排序，而不是按时间顺序排序。对于同比分析，我们可以稍微改写你的问题，明确询问“每年最昂贵的行政区”，以获得按不同方式分组的结果。
