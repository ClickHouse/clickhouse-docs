---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: 'セマンティックレイヤーによる Ask AI チャットのカスタマイズ'
title: 'セマンティックレイヤーを用いた Ask AI エージェントとの会話の最適化'
pagination_prev: null
pagination_next: null
description: 'AGENTS.md を使用して、Ask AI チャットエージェントにカスタムビジネスロジックとデータ特有の指示を与えるためのガイド'
keywords: ['AI', 'ClickHouse Cloud', 'エージェント', 'AGENTS.md', 'セマンティックレイヤー', 'カスタム指示', 'システムプロンプト']
show_related_blogs: true
doc_type: 'guide'
---

# セマンティックレイヤーで Ask AI チャットをカスタマイズする \{#customize-ask-ai-chat-with-a-semantic-layer\}

Ask AI チャットエージェントは、**AGENTS.md** を通じて、ビジネス固有のロジック、データ構造、ドメイン知識を理解するようにカスタマイズできます。これは、エージェントのシステムプロンプトに対するセマンティックレイヤーとして機能する特別な保存済みクエリです。

AGENTS.md ファイルを作成することで、すべての会話の冒頭に挿入されるカスタムインストラクションを提供でき、組織固有の要件、計算方法、慣習に基づいて SQL クエリ生成とデータ分析をガイドできます。

## 仕組み \{#how-it-works\}

Cloud Console で「AGENTS.md」という名前（大文字と小文字を区別する）のクエリを保存すると、次のことが起こります：

1. Ask AI チャットエージェントは、メッセージが送信されると自動的にこのファイルを読み込みます
2. コンテンツは構造化コンテンツタグ内に配置され、エージェントのシステムプロンプトに注入されます
3. そのサービス内のすべての Ask AI チャットの会話に、これらの指示が適用されます

## AGENTS.md を作成する \{#creating-agents-md\}

<VerticalStepper headerLevel="h3">

### 保存クエリを作成する \{#create-query\}

1. Cloud Console で新しいクエリを作成します
2. 名前は **"AGENTS.md"** とし、大文字・小文字も含めて完全に一致させます
3. クエリテキストエディタにカスタムの指示を書きます（実際の SQL ではありません）
4. クエリを保存します

### 指示を追加する \{#add-instructions\}

指示は明確で、実行に移しやすい表現で構成します。次を含めるようにします:

- ビジネスルールおよび計算
- データ構造に関するガイドライン
- ドメイン固有の用語
- 一般的なクエリパターン
- パフォーマンス最適化に関するルール

</VerticalStepper>

## ベストプラクティス \{#best-practices\}

### コンテキストを有限なリソースとして扱う \{#finite-resource\}

コンテキストは貴重なものです — トークンが増えるごとにエージェントの「注意予算」が消費されます。限られたワーキングメモリしか持たない人間と同様に、言語モデルもコンテキストが増えるほどパフォーマンスが低下します。つまり、望む結果が得られる可能性を最大化するために、**情報量の高いトークンの最小限の集合** を見つける必要があります。

### 適切な「高度」を見つける \{#right-altitude\}

次の 2 つの極端な状態のあいだでバランスを取りましょう:

- **細かすぎる**: 壊れやすい if-else ロジックをハードコードしてしまい、脆さと保守の複雑さを生む
- **抽象的すぎる**: 具体的な指針を与えられず、あるいは共有されているとは限らないコンテキストを前提としてしまう高レベルな指示だけになる

最適な「高度」は、振る舞いを効果的にガイドできるだけの具体性を持ちつつ、モデルが強力なヒューリスティクスを適用できるだけの柔軟性も備えています。利用可能な中で最良のモデルに対して最小限のプロンプトから始め、観測された失敗モードに基づいて明確な指示を追加していきましょう。

### セクションを構造化して整理する \{#structured-sections\}

明確で一目で把握しやすい区切られたセクションを作成するために、XML タグまたは Markdown の見出しを使用します。

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


### 多様で代表的なサンプルを用意する \{#canonical-examples\}

サンプルは、まさに「百聞は一見にしかず」を体現するものです。プロンプトにあらゆる例外的なケースを詰め込むのではなく、期待する挙動を効果的に表現できる、多様で厳選されたサンプルのセットを用意しましょう。

### 最小限だが十分にする \{#minimal-complete\}

- 頻繁に必要となる指示だけを含める
- 簡潔にする—コンテキストが大きくなりすぎると「コンテキストの腐敗」によりパフォーマンスが低下する
- 古くなった、またはほとんど使われないルールは削除する
- 望ましい振る舞いを導けるだけの情報量は必ず確保する

:::tip
最小限というのは、必ずしも短いという意味ではありません。エージェントが期待どおりに振る舞えるだけの十分な詳細は必要であり、不必要に冗長にならないようにすればよいのです。
:::

## 例: 生データから算出したメトリクス \{#example-calculated-metrics\}

メトリクスがカラムへの直接アクセスではなく特定の計算を必要とする場合は、その計算方法をエージェントに指示します:

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


## 例: ビジネスロジックのルール \{#example-business-logic\}

ドメイン固有の計算や分類を定義します。

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


## 例: データ構造上の癖 \{#example-data-quirks\}

慣例的でないデータ形式やレガシーなスキーマ設計上の判断を文書化します:

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


## 例: ドメイン用語 \{#example-terminology\}

ビジネス用語を技術的な実装に対応付けます:

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
