---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'AI を活用した SQL 生成'
title: 'AI を活用した SQL 生成'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、ClickHouse Client または clickhouse-local で AI を使用して SQL クエリを生成する方法を説明します。'
keywords: ['AI', 'SQL 生成']
show_related_blogs: true
doc_type: 'guide'
---

ClickHouse 25.7 以降、[ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) と [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) には、自然言語による説明を SQL クエリに変換する [AI を活用した機能](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation) が含まれています。この機能により、ユーザーはデータ要件を自然な文章で記述でき、システムがそれを対応する SQL 文へと変換します。

この機能は、複雑な SQL 構文に詳しくないユーザーや、探索的データ分析のためにクエリをすばやく生成する必要があるユーザーに特に有用です。標準的な ClickHouse テーブルに対して動作し、フィルタリング、集約、結合などの一般的なクエリパターンをサポートします。

この機能は、次の組み込みツール／関数を利用して動作します。

* `list_databases` - ClickHouse インスタンス内で利用可能なすべてのデータベースを一覧表示する
* `list_tables_in_database` - 特定のデータベース内のすべてのテーブルを一覧表示する
* `get_schema_for_table` - 特定のテーブルの `CREATE TABLE` 文（スキーマ）を取得する



## 前提条件 {#prerequisites}

環境変数としてAnthropicまたはOpenAIのキーを追加する必要があります:

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

または、[設定ファイルを指定する](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)こともできます。


## ClickHouse SQLプレイグラウンドへの接続 {#connecting-to-the-clickhouse-sql-playground}

[ClickHouse SQLプレイグラウンド](https://sql.clickhouse.com/)を使用してこの機能を確認します。

以下のコマンドでClickHouse SQLプレイグラウンドに接続できます:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
ClickHouseがインストール済みであることを前提としていますが、未インストールの場合は[インストールガイド](https://clickhouse.com/docs/install)を参照してください
:::


## 自然言語でClickHouseに質問する {#asking-clickhouse-questions-in-natural-language}

それでは、質問を始めましょう!

テキストからSQLへの機能は、実質的にワンショットクエリ生成ツールです。会話履歴を保持しないため、質問にはできるだけ多くの有用なコンテキストを含めてください。以下について具体的に記述してください:

期間または日付範囲
必要な分析の種類(平均、合計、ランキングなど)
フィルタリング条件

### 高額な住宅市場を見つける {#finding-expensive-housing-markets}

まず、住宅価格に関する質問から始めましょう。SQLプレイグラウンドには英国の住宅価格データセットが含まれており、AIが自動的に検出します:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

Enterキーを押すと、AIが質問に答えようとする思考プロセスが表示されます。

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

AIは以下のステップに従います:

1. スキーマ検出 - 利用可能なデータベースとテーブルを探索
2. テーブル分析 - 関連するテーブルの構造を調査
3. クエリ生成 - 質問と検出されたスキーマに基づいてSQLを作成

`uk_price_paid`テーブルが見つかり、実行するクエリが生成されたことがわかります。
このクエリを実行すると、以下の出力が表示されます:


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

追加の質問をする場合は、最初から質問を組み立て直す必要があります。

### グレーター・ロンドンにおける高額物件の検索 {#finding-expensive-properties-in-greater-london}

この機能は会話履歴を保持しないため、各クエリは自己完結型である必要があります。追加の質問をする際は、以前のクエリを参照するのではなく、完全なコンテキストを提供する必要があります。
例えば、前回の結果を確認した後、グレーター・ロンドンの物件に特化して調べたい場合があります。「グレーター・ロンドンについてはどうですか？」と尋ねるのではなく、完全なコンテキストを含める必要があります。

```sql
?? グレーター・ロンドンで年間を通じて最も高額な住宅購入地域を教えてください;
```

AIは、このデータを直前に調査したにもかかわらず、同じ発見プロセスを経ることに注意してください。


```text
• スキーマ検出を用いた AI による SQL 生成を開始...
─────────────────────────────────────────────────
🧠 考え中[INFO] テキスト生成に成功しました - model: claude-3-5-sonnet-latest, response_id: msg_012m4ayaSHTYtX98gxrDy1rz
🔧 呼び出し: list_databases [toolu_01...]
✓ list_databases が完了しました
  └─ 37 個のデータベースが見つかりました: - amazon - bluesky - country - covid - default - dns - en...
🔧 呼び出し: list_databases [toolu_01...]
🧠 考え中.✓ list_databases が完了しました
  └─ 37 個のデータベースが見つかりました: - amazon - bluesky - country - covid - default - dns - en...
🧠 考え中.[INFO] テキスト生成に成功しました - model: claude-3-5-sonnet-latest, response_id: msg_01KU4SZRrJckutXUzfJ4NQtA
🔧 呼び出し: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 考え中..✓ list_tables_in_database が完了しました
  └─ データベース 'uk' に 9 個のテーブルが見つかりました: - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 呼び出し: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database が完了しました
  └─ データベース 'uk' に 9 個のテーブルが見つかりました: - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 考え中[INFO] テキスト生成に成功しました - model: claude-3-5-sonnet-latest, response_id: msg_01X9CnxoBpbD2xj2UzuRy2is
🔧 呼び出し: get_schema_for_table [toolu_01...]
  └─ 引数: {"database":"uk","table":"uk_price_paid"}
🧠 考え中.✓ get_schema_for_table が完了しました
  └─ uk.uk_price_paid のスキーマ: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 呼び出し: get_schema_for_table [toolu_01...]
  └─ 引数: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table が完了しました
  └─ uk.uk_price_paid のスキーマ: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 考え中...[INFO] テキスト生成に成功しました - model: claude-3-5-sonnet-latest, response_id: msg_01QTMypS1XuhjgVpDir7N9wD
─────────────────────────────────────────────────
• ✨ SQL クエリの生成に成功しました！
:) SELECT     district,     toYear(date) AS year,     round(avg(price), 2) AS avg_price,     count() AS total_sales FROM uk.uk_price_paid WHERE county = 'GREATER LONDON' GROUP BY district, year HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10;
```

これにより、グレーター・ロンドンに限定してフィルタし、結果を年ごとに集計する、より目的に合ったクエリが生成されます。
クエリの出力結果を以下に示します。

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

City of London は一貫して最も高価な地区として表示されます！AI が妥当なクエリを生成していることに気付くと思いますが、結果は時系列ではなく平均価格で並べ替えられています。前年比の分析を行うには、結果が別の切り口でグループ化されるように、「各年で最も高価な地区」を求めるように質問を言い換えるとよいでしょう。
