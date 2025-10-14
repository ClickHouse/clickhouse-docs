---
'slug': '/use-cases/AI/ai-powered-sql-generation'
'sidebar_label': 'AI驱动的 SQL 生成'
'title': 'AI驱动的 SQL 生成'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释如何使用 AI 在 ClickHouse Client 或 clickhouse-local 中生成 SQL 查询。'
'keywords':
- 'AI'
- 'SQL generation'
'show_related_blogs': true
'doc_type': 'guide'
---

从 ClickHouse 25.7 开始，[ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) 和 [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) 包含 [人工智能驱动的功能](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation)，可以将自然语言描述转换为 SQL 查询。此功能允许用户以纯文本描述其数据需求，系统随后将其翻译成相应的 SQL 语句。

这项功能对于那些可能不熟悉复杂 SQL 语法或需要快速生成探索性数据分析查询的用户特别有用。该功能适用于标准的 ClickHouse 表，并支持包括过滤、聚合和连接在内的常见查询模式。

它借助以下内置工具/函数实现这一点：

* `list_databases` - 列出 ClickHouse 实例中所有可用的数据库
* `list_tables_in_database` - 列出特定数据库中的所有表
* `get_schema_for_table` - 获取特定表的 `CREATE TABLE` 语句（模式）

## 先决条件 {#prerequisites}

我们需要将 Anthropic 或 OpenAI 密钥添加为环境变量：

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

另外，您可以 [提供配置文件](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)。

## 连接到 ClickHouse SQL 游乐场 {#connecting-to-the-clickhouse-sql-playground}

我们将使用 [ClickHouse SQL 游乐场](https://sql.clickhouse.com/) 探索此功能。

我们可以使用以下命令连接到 ClickHouse SQL 游乐场：

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
我们假设您已经安装了 ClickHouse，但如果没有，请参考 [安装指南](https://clickhouse.com/docs/install)
:::

## 用自然语言向 ClickHouse 提问 {#asking-clickhouse-questions-in-natural-language}

现在是时候开始提问了！

文本到 SQL 功能实际上是一个一次性查询生成工具。由于它不维护对话历史，因此在提问时要尽可能包含有用的上下文。请具体说明：

时间段或日期范围
您希望进行的分析类型（平均值、总和、排名等）
任何过滤标准

### 查找昂贵的房地产市场 {#finding-expensive-housing-markets}

让我们首先提出有关房价的问题。SQL 游乐场包含一个英国房价数据集，人工智能会自动发现它：

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

一旦我们按下回车键，我们将看到人工智能在尝试回答我们的问题时的思维过程。

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

AI 遵循以下步骤：

1. 模式发现 - 探索可用的数据库和表
2. 表分析 - 检查相关表的结构
3. 查询生成 - 根据您的问题和发现的模式创建 SQL

我们可以看到它确实找到了 `uk_price_paid` 表并为我们生成了一个查询。如果我们运行该查询，将看到以下输出：

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

如果我们想提出后续问题，则需要从头开始提问。

### 查找大伦敦地区昂贵的房产 {#finding-expensive-properties-in-greater-london}

由于该功能不维护对话历史，因此每个查询必须是自包含的。在提问后续问题时，您需要提供完整的上下文，而不是引用先前的查询。例如，在看到先前的结果后，我们可能希望专注于大伦敦地区的房产。我们需要包含完整上下文，而不是问“关于大伦敦地区怎么样？”：

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

请注意，尽管它刚刚检查过这些数据，人工智能仍然经历相同的发现过程：

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

这生成了一个更加针对性强的查询，专门过滤大伦敦地区的结果并按年份分解结果。查询的输出如下所示：

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

伦敦市始终出现在最昂贵的地区！您会注意到，人工智能创建了一个合理的查询，尽管结果是按平均价格排序而不是按时间顺序排列。为了进行年度分析，我们可以将问题精炼为具体询问“每年最昂贵的地区”，以获得分组不同的结果。
