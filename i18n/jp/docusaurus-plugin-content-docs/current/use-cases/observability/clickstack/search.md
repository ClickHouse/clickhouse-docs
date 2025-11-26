---
slug: /use-cases/observability/clickstack/search
title: 'ClickStack を使った検索'
sidebar_label: '検索'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使った検索'
doc_type: 'guide'
keywords: ['clickstack', '検索', 'ログ', 'オブザーバビリティ', '全文検索']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack を使用すると、イベント（ログやトレース）に対してフルテキスト検索を行えます。イベント内に含まれるキーワードを入力するだけで検索を開始できます。たとえば、ログに &quot;Error&quot; が含まれている場合、検索バーに &quot;Error&quot; と入力するだけでそのログを見つけることができます。

同じ検索構文は、ダッシュボードやチャートでイベントをフィルタリングする際にも使用されます。


## 検索機能 {#search-features}

### 自然言語検索の構文 {#natural-language-syntax}

- 検索クエリは大文字・小文字を区別しません
- デフォルトでは単語全体に一致します（例: `Error` は `Error here` には一致しますが、`Errors here` には一致しません）。部分一致させたい場合は、単語をワイルドカードで囲みます（例: `*Error*` は `AnyError` および `AnyErrors` に一致します）
- 複数の検索語は順不同で評価されます（例: `Hello World` は、`Hello World` および `World Hello` を含むログに一致します）
- `NOT` または `-` を使ってキーワードを除外できます（例: `Error NOT Exception` または `Error -Exception`）
- `AND` および `OR` を使って複数のキーワードを組み合わせることができます（例: `Error OR Exception`）
- ダブルクオートで囲むことでフレーズの完全一致検索ができます（例: `"Error tests not found"`）

<Image img={hyperdx_27} alt="検索" size="md"/>

#### カラム/プロパティ検索 {#column-search}

- `column:value` を使用して、カラムおよび JSON/map プロパティを検索できます（例：`level:Error`、`service:app`）
- 比較演算子（`>`, `<`, `>=`, `<=`）を使用して値の範囲で検索できます（例：`Duration:>1000`）
- `property:*` を使用してプロパティが存在するかどうかを検索できます（例：`duration:*`）

### 時刻入力 {#time-input}

- 時刻入力フィールドでは自然言語での入力を受け付けます（例: `1 hour ago`、`yesterday`、`last week`）。
- 単一の時刻を指定した場合、その時刻から現在までの範囲が検索対象になります。
- 時間範囲は、検索時に常にパース済みの時間範囲に変換されるため、時間クエリのデバッグが容易になります。
- ヒストグラムのバーを選択すると、その時間範囲にズームインできます。

### SQL 検索構文 {#sql-syntax}

必要に応じて、検索入力を SQL モードに切り替えることができます。SQL モードでは、検索のために任意の有効な SQL の WHERE 句を指定できます。これは、Lucene 構文では表現できないような複雑なクエリに役立ちます。

### Select ステートメント  {#select-statement}

検索結果に表示する列を指定するには、`SELECT`
入力フィールドを使用します。これは、検索ページで表示する列を指定するための SQL の SELECT 式です。
現時点ではエイリアスはサポートされておらず（例: `column as "alias"` のようには使用できません）、使用できません。

## 保存済み検索 {#saved-searches}

後で素早くアクセスできるように、検索条件を保存できます。保存すると、検索は左側のサイドバーに表示され、よく使用する検索クエリを毎回作り直すことなく簡単に再利用できます。

検索を保存するには、検索クエリを設定し、保存ボタンをクリックします。後で判別しやすいように、保存済み検索にわかりやすい名前を付けることができます。

<Image img={saved_search} alt="検索を保存する" size="md" />

### 保存済み検索へのアラート追加 {#alerts-on-saved-searches}

保存済み検索にアラートを設定して、特定の条件を満たしたときに通知を受け取ることができます。保存済み検索に一致するイベント数が指定したしきい値を超えた場合や下回った場合に、アラートがトリガーされるように設定できます。

アラートの設定および構成の詳細については、[アラートのドキュメント](/use-cases/observability/clickstack/alerts)を参照してください。

### タグ付け {#tagging}

<Tagging />