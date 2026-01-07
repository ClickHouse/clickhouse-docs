---
slug: /use-cases/AI_ML/AIChat/semantic-layer
sidebar_label: 'セマンティックレイヤー'
title: 'セマンティックレイヤーを用いた Ask AI エージェントとの会話の最適化'
pagination_prev: null
pagination_next: null
description: 'AGENTS.md を使用して、Ask AI チャットエージェント向けのカスタムビジネスロジックおよびデータ固有の指示を定義するためのガイド'
keywords: ['AI', 'ClickHouse Cloud', 'Agent', 'AGENTS.md', 'Semantic Layer', 'Custom Instructions', 'System Prompt']
show_related_blogs: true
sidebar_position: 1
doc_type: 'guide'
---

# セマンティックレイヤーで Ask AI チャットをカスタマイズする {#customizing-ask-ai-chat-with-a-semantic-layer}

Ask AI チャットエージェントは、エージェントのシステムプロンプトの上にセマンティックレイヤーとして機能する、特別な保存済みクエリである **AGENTS.md** を通じて、特定のビジネスロジック、データ構造、およびドメイン知識を理解するようにカスタマイズできます。

AGENTS.md ファイルを作成することで、組織固有の要件、計算、規約に基づいた SQL クエリ生成とデータ分析をガイドするために、すべての会話の冒頭に挿入されるカスタムの指示を指定できます。

## 仕組み {#how-it-works}

Cloud Console で "AGENTS.md" という名前（大文字・小文字を区別）でクエリを保存すると、次のことが行われます。

1. メッセージが送信されると、Ask AI チャットエージェントが自動的にこのファイルを読み込みます
2. コンテンツは構造化されたコンテンツタグ内に配置され、エージェントのシステムプロンプトに注入されます
3. そのサービスにおけるすべての Ask AI チャットでの会話に対して、これらの指示が適用されます

## AGENTS.md を作成する {#creating-agents-md}

<VerticalStepper headerLevel="h3">

### 保存済みクエリを作成する {#create-query}

1. Cloud Console で新しいクエリを作成します
2. クエリ名を **"AGENTS.md"**（大文字・小文字を区別）として正確に指定します
3. クエリテキストエディタに独自の指示内容を書きます（実際の SQL ではありません）
4. クエリを保存します

### 指示を追加する {#add-instructions}

指示内容は、明確で実行可能な文言で構成してください。次の内容を含めます:

- ビジネスルールと計算方法
- データ構造に関するガイダンス
- ドメイン固有の用語
- 一般的なクエリパターン
- パフォーマンス最適化のためのルール

</VerticalStepper>

## ベストプラクティス {#best-practices}

### コンテキストを有限なリソースとして扱う {#finite-resource}

コンテキストは貴重です。トークンを使うたびに、エージェントの「注意予算」が消費されます。作業記憶に限りがある人間と同様に、言語モデルもコンテキストが増えるにつれて性能が低下します。つまり、望ましい結果が得られる可能性を最大化するには、**できるだけ少ない数でありながら情報量の高いトークンの集合** を見つける必要があります。

### 適切な「高度」を見つける {#right-altitude}

次の 2 つの極端の間でバランスを取りましょう:

- **具体的すぎる**: 脆い if-else ロジックをハードコードしてしまい、システムを壊れやすくし保守も複雑にする
- **抽象的すぎる**: 抽象度が高すぎて具体的なシグナルにならず、共有されている前提があると誤って仮定してしまう高レベルな指針

最適な「高度」は、行動を効果的に導けるだけの具体性を持ちつつ、モデルが強力なヒューリスティックを適用できるだけの柔軟性も備えています。利用可能な中で最良のモデルには、まず最小限のプロンプトだけを与え、観測された失敗モードに基づいて明確な指示を追加していきましょう。

### 構造化されたセクションで整理する {#structured-sections}

XML タグや Markdown の見出しを使用して、区別しやすくざっと見て把握しやすいセクションを作成します。

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


### 多様で代表的な例を提示する {#canonical-examples}

例は「百聞は一見にしかず」を体現するものです。すべてのレアケースをプロンプトに詰め込むのではなく、期待される動作を効果的に示せるよう、多様性を持たせつつ代表的な例を厳選して用意しましょう。

### 最小限かつ完全に保つ {#minimal-complete}

- 頻繁に必要となる手順だけを含める
- 簡潔にする — コンテキストが大きくなりすぎると「context rot」により性能が低下する
- 古い、またはほとんど使われないルールは削除する
- 望ましい動作を導けるだけの十分な情報を確保する

:::tip
最小限であることは、必ずしも短いことを意味しません。エージェントが期待どおりの動作に従うようにするには、十分な詳細が必要ですが、不要な冗長さは避けてください。
:::

## 例：生データからの計算済みメトリクス {#example-calculated-metrics}

メトリクスが単純なカラム参照ではなく特定の計算を必要とする場合に、エージェントをどのように誘導するかを示します。

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


## 例：ビジネスロジック ルール {#example-business-logic}

ドメイン固有の計算や分類などを定義します。

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


## 例: データ構造の独特な点 {#example-data-quirks}

慣例的ではないデータ形式やレガシーなスキーマに由来する設計上の決定事項を文書化します。

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


## 例：ドメイン用語 {#example-terminology}

ビジネス用語を技術的な実装に対応付けます：

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
