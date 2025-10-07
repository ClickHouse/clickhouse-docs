---
'slug': '/use-cases/AI/ai-powered-sql-generation'
'sidebar_label': 'AI-powered SQL 生成'
'title': 'AI-powered SQL 生成'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释了如何使用 AI 在 ClickHouse Client 或 clickhouse-local 中生成 SQL クエリ。'
'keywords':
- 'AI'
- 'SQL generation'
'show_related_blogs': true
'doc_type': 'guide'
---

Starting from ClickHouse 25.7, [ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) と [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) は、自然言語の説明を SQL クエリに変換する [AI 搭載の機能](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation) を含んでいます。この機能により、ユーザーはデータ要件を平易なテキストで記述し、システムがそれを対応する SQL 文に変換します。

この機能は、複雑な SQL 構文に不慣れなユーザーや、探索的データ分析のために迅速にクエリを生成する必要があるユーザーにとって特に便利です。この機能は、標準の ClickHouse テーブルで動作し、フィルタリング、集約、結合を含む一般的なクエリパターンをサポートします。

これは、以下のビルトインツール/関数の助けを借りて実現されます：

* `list_databases` - ClickHouse インスタンス内のすべてのデータベースをリストします
* `list_tables_in_database` - 特定のデータベース内のすべてのテーブルをリストします
* `get_schema_for_table` - 特定のテーブルの `CREATE TABLE` 文（スキーマ）を取得します

## 前提条件 {#prerequisites}

Anthropic または OpenAI のキーを環境変数として追加する必要があります：

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

または、[設定ファイルを提供する](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration)こともできます。

## ClickHouse SQL プレイグラウンドへの接続 {#connecting-to-the-clickhouse-sql-playground}

この機能を [ClickHouse SQL プレイグラウンド](https://sql.clickhouse.com/) を使用して探ってみましょう。

次のコマンドを使用して ClickHouse SQL プレイグラウンドに接続できます：

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
ClickHouse がインストールされていることを前提にしますが、そうでない場合は [インストールガイド](https://clickhouse.com/docs/install) を参照してください。
:::

## 自然言語で ClickHouse に質問する {#asking-clickhouse-questions-in-natural-language}

さあ、質問を始めましょう！

テキストから SQL への変換機能は、実質的にワンショットのクエリ生成ツールです。会話履歴を保持しないため、質問にはできるだけ多くの有用なコンテキストを含めてください。具体的には以下の点に注意してください：

- 時間期間や日付範囲
- 希望する分析の種類（平均、合計、ランキングなど）
- フィルタリング基準

### 高価な住宅市場の特定 {#finding-expensive-housing-markets}

住宅価格について質問をしてみましょう。SQL プレイグラウンドには、AI が自動的に検出する UK 住宅価格データセットがあります：

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

Enter キーを押すと、AI が質問に答えようとする過程が表示されます。

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

AI は以下の手順を踏みます：

1. スキーマ発見 - 利用可能なデータベースとテーブルを探索
2. テーブル分析 - 関連テーブルの構造を調べる
3. クエリ生成 - 質問と検出されたスキーマに基づいて SQL を生成

`uk_price_paid` テーブルが見つかり、実行するためのクエリが生成されたことが確認できます。
このクエリを実行すると、以下の出力が得られます：

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

フォローアップの質問をしたい場合、質問を最初から再度行う必要があります。

### グレーター・ロンドンでの高価な物件の特定 {#finding-expensive-properties-in-greater-london}

この機能は会話履歴を保持しないため、各クエリは自己完結型でなければなりません。フォローアップの質問をする場合は、前のクエリを参照するのではなく、コンテキスト全体を提供する必要があります。
例えば、以前の結果を見た後、グレーター・ロンドンの物件に特に焦点を当てたい場合、「グレーター・ロンドンはどうですか？」ではなく、完全なコンテキストを含める必要があります：

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

AI はこのデータをちょうど調査したにも関わらず、同じ発見プロセスを経ることに注目してください：

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

これにより、グレーター・ロンドンのみに特化したフィルタリングを行い、年ごとに結果を分解するという、よりターゲットを絞ったクエリが生成されます。
クエリの出力は以下に示します：

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

ロンドン市は常に最も高価な地区として登場します！AI が合理的なクエリを作成しましたが、結果は平均価格で順序付けられているため、年次分析のために「毎年最も高価な地区」を具体的に尋ねると、異なる集計結果が得られるかもしれません。
