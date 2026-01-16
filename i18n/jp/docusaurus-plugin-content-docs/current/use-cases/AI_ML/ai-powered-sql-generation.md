---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'AI を利用した SQL 生成'
title: 'AI を利用した SQL 生成'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse Client または clickhouse-local で AI を使用して SQL クエリを生成する方法について説明します。'
keywords: ['AI', 'SQL generation']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse 25.7 以降では、[ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) と [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) に、自然言語による説明を SQL クエリに変換する [AI 搭載機能](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation) が含まれています。この機能により、データ要件を平易なテキストで記述でき、システムがそれに対応する SQL ステートメントへと変換します。

この機能は、複雑な SQL 構文に詳しくない場合や、探索的なデータ分析のためにクエリを素早く生成する必要がある場合に特に有用です。この機能は標準的な ClickHouse テーブルで動作し、フィルタリング、集約、結合（JOIN）といった一般的なクエリパターンをサポートします。

この処理は、次の組み込みツール/関数の助けを借りて行われます。

* `list_databases` - ClickHouse インスタンス内で利用可能なすべてのデータベースを一覧表示
* `list_tables_in_database` - 特定のデータベース内のすべてのテーブルを一覧表示
* `get_schema_for_table` - 特定のテーブルの `CREATE TABLE` ステートメント（スキーマ）を取得

## 前提条件 \{#prerequisites\}

Anthropic または OpenAI の API キーを環境変数として追加する必要があります。

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

または、[設定ファイルを指定する](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)こともできます。


## ClickHouse SQL playground への接続 \{#connecting-to-the-clickhouse-sql-playground\}

この機能を試すにあたっては、[ClickHouse SQL playground](https://sql.clickhouse.com/) を使用します。

ClickHouse SQL playground には、次のコマンドを使用して接続できます。

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
ClickHouse がすでにインストールされていることを前提とします。まだインストールしていない場合は、[インストールガイド](https://clickhouse.com/docs/install) を参照してください。
:::


## 自然言語で ClickHouse に質問する \{#asking-clickhouse-questions-in-natural-language\}

それでは、いくつか質問をしてみましょう。

text-to-SQL 機能は、実質的にワンショットのクエリ生成ツールです。会話履歴を保持しないため、質問の中にできるだけ有用なコンテキストを含めてください。次の点を具体的に指定します:

期間や日付範囲\
行いたい分析の種類（平均値、合計、ランキングなど）\
適用したいフィルタ条件

### 住宅価格が高いエリアを見つける \{#finding-expensive-housing-markets\}

まず住宅価格に関する質問から始めましょう。SQL playground には UK の住宅価格データセットが含まれており、AI が自動的に認識します:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

Enter キーを押すと、質問に回答するために AI がどのように考えているかが表示されます。

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

AI は次の手順で処理を行います。

1. スキーマ検出 - 利用可能なデータベースとテーブルを探索する
2. テーブル解析 - 関連するテーブルの構造を調べる
3. クエリ生成 - 質問内容と検出したスキーマに基づいて SQL を生成する

ここで、`uk_price_paid` テーブルが見つかり、実行用のクエリが生成されていることが分かります。
そのクエリを実行すると、次のような出力が得られます。


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

フォローアップの質問をしたい場合も、毎回一から質問し直す必要があります。


### グレーター・ロンドンの高額物件を見つける \{#finding-expensive-properties-in-greater-london\}

この機能は会話履歴を保持しないため、各クエリは自己完結型である必要があります。フォローアップの質問を行う場合は、以前のクエリを参照するのではなく、必要なコンテキストをすべて含めて指定する必要があります。
たとえば、先ほどの結果を確認したあと、グレーター・ロンドンの物件に絞り込みたくなるかもしれません。このとき「グレーター・ロンドンはどうですか？」とだけ尋ねるのではなく、完全なコンテキストを含める必要があります。

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

AI は、このデータを直前に調べたばかりにもかかわらず、同じスキーマ検出プロセスを繰り返していることに注目してください。

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

これにより、グレーター・ロンドンのみを対象にフィルタリングし、結果を年別に集計する、より的を絞ったクエリが生成されます。
クエリの実行結果を以下に示します。


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

City of London は一貫して「最も高価な地区」として現れています！AI が妥当なクエリを生成していることが分かりますが、結果は時系列ではなく平均価格で並べ替えられています。年ごとの推移を比較するような年次分析を行うには、「各年でもっとも高価な地区」を求めるように質問を言い換えて、結果を別のグループ化で取得するとよいでしょう。
