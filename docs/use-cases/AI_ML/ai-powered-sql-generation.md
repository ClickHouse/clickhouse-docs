---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'AI-powered SQL generation'
title: 'AI-powered SQL generation'
pagination_prev: null
pagination_next: null
description: 'This guide explains how to use AI to generate SQL queries in ClickHouse Client or clickhouse-local.'
keywords: ['AI', 'SQL generation']
show_related_blogs: true
doc_type: 'explanation'
---

Starting from ClickHouse 25.7, [ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) and [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) include [AI-powered functionality](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation) that converts natural language descriptions into SQL queries. This feature allows users to describe their data requirements in plain text, which the system then translates into corresponding SQL statements.

This capability is particularly useful for users who may not be familiar with complex SQL syntax or need to quickly generate queries for exploratory data analysis. The feature works with standard ClickHouse tables and supports common query patterns including filtering, aggregation, and joins.

It does this with help from the following in-built tools/functions:

* `list_databases` - List all available databases in the ClickHouse instance
* `list_tables_in_database` - List all tables in a specific database
* `get_schema_for_table` - Get the `CREATE TABLE` statement (schema) for a specific table

## Prerequisites {#prerequisites}

We'll need to add an Anthropic or OpenAI key as an environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

Alternatively, you can [provide a configuration file](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration).

## Connecting to the ClickHouse SQL playground {#connecting-to-the-clickhouse-sql-playground}

We're going to explore this feature using the [ClickHouse SQL playground](https://sql.clickhouse.com/).

We can connect to the ClickHouse SQL playground using the following command:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
We'll assume you have ClickHouse installed, but if not, refer to the [installation guide](https://clickhouse.com/docs/install)
:::

## Asking ClickHouse questions in natural language {#asking-clickhouse-questions-in-natural-language}

Now it's time to start asking some questions!

The text to SQL feature is effectively a one-shot query generation tool. Since it doesn't maintain conversation history, include as much useful context as possible in your question. Be specific about:

Time periods or date ranges
The type of analysis you want (averages, totals, rankings, etc.)
Any filtering criteria

### Finding expensive housing markets {#finding-expensive-housing-markets}

Let's start by asking a question about house prices. The SQL playground contains a UK house prices dataset, which the AI will automatically discover:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

Once we press enter, we'll see the thought process of the AI as it tries to answer our question.

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

The AI follows these steps:

1. Schema discovery - Explores available databases and tables
2. Table analysis - Examines the structure of relevant tables
3. Query generation - Creates SQL based on your question and the discovered schema

We can see that it did find the `uk_price_paid` table and generated a query for us to run.
If we run that query, we'll see the following output:

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

If we want to ask follow up questions, we need to ask our question from scratch.

### Finding expensive properties in Greater London {#finding-expensive-properties-in-greater-london}

Since the feature doesn't maintain conversation history, each query must be self-contained. When asking follow-up questions, you need to provide the full context rather than referring to previous queries.
For example, after seeing the previous results, we might want to focus specifically on Greater London properties. Rather than asking "What about Greater London?", we need to include the complete context:

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

Notice that the AI goes through the same discovery process, even though it just examined this data:

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

This generates a more targeted query that filters specifically for Greater London and breaks down results by year.
The output of the query is shown below:

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

The City of London consistently appears as the most expensive district! You'll notice the AI created a reasonable query, though the results are ordered by average price rather than chronologically. For a year-over-year analysis, we might refine your question to ask specifically for "the most expensive district each year" to get results grouped differently.