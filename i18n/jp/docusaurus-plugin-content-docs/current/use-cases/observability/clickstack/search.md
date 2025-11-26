---
slug: /use-cases/observability/clickstack/search
title: 'ClickStack で検索する'
sidebar_label: '検索'
pagination_prev: null
pagination_next: null
description: 'ClickStack で検索する'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack を使用すると、イベント（ログやトレース）に対してフルテキスト検索を行えます。イベントにマッチするキーワードを入力するだけで検索を開始できます。たとえば、ログに「Error」が含まれていれば、検索バーにそのまま「Error」と入力するだけで検索できます。

同じ検索構文は、ダッシュボードやチャートでイベントをフィルタリングする場合にも使用されます。


## 検索機能 {#search-features}

### 自然言語検索構文 {#natural-language-syntax}

- 検索では大文字と小文字を区別しません
- 検索はデフォルトで単語全体に対して行われます（例: `Error` は `Error here` には
  一致しますが、`Errors here` には一致しません）。部分一致を行うには、単語を
  ワイルドカードで囲みます（例: `*Error*` は `AnyError` および `AnyErrors` に一致します）
- 複数の検索語は順不同でマッチします（例: `Hello World` は `Hello World` および
  `World Hello` を含むログに一致します）
- `NOT` や `-` を使ってキーワードを除外できます（例: `Error NOT Exception` や
  `Error -Exception`）
- `AND` および `OR` を使って複数のキーワードを組み合わせることができます（例:
  `Error OR Exception`）
- ダブルクォートを使うことでフレーズ単位の完全一致検索ができます（例: `"Error tests not found"`）

<Image img={hyperdx_27} alt="検索" size="md"/>

#### カラム / プロパティ検索 {#column-search}

- `column:value` の形式で、カラムや JSON/map のプロパティを検索できます（例: `level:Error`,
  `service:app`）
- 比較演算子（`>`, `<`, `>=`, `<=`）を使って、値の範囲で検索できます（例: `Duration:>1000`）
- `property:*` を使うことで、プロパティの存在有無で検索できます（例:
  `duration:*`）

### 時刻入力 {#time-input}

- 時刻入力は自然言語での指定を受け付けます（例: `1 hour ago`, `yesterday`,
  `last week`）
- 単一の時刻のみを指定した場合、その時刻から現在までの範囲で検索されます。
- 検索時には、指定された時間範囲は常にパース結果の時間範囲に変換され、時間クエリの
  デバッグを容易にします。
- ヒストグラムのバーをハイライトすることで、その特定の時間範囲へズームインすることもできます。

### SQL 検索構文 {#sql-syntax}

検索入力をオプションとして SQL モードに切り替えることができます。このモードでは、検索のために
任意の有効な SQL の WHERE 句を受け付けます。これは、Lucene 構文では表現できない
複雑なクエリに有用です。

### SELECT ステートメント  {#select-statement}

検索結果に表示するカラムを指定するには、`SELECT` 入力を使用します。これは検索ページで
選択するカラムを指定するための SQL の SELECT 式です。
現時点ではエイリアスはサポートされていません（例: `column as "alias"` は使用できません）。



## 保存済み検索 {#saved-searches}

後から素早くアクセスできるように、検索を保存できます。検索を保存すると、左側のサイドバーに表示され、よく使う検索クエリを再構築することなく簡単に再利用できます。

検索を保存するには、検索条件を設定し、保存ボタンをクリックします。後から識別しやすいように、保存済み検索にわかりやすい名前を付けることができます。

<Image img={saved_search} alt="検索の保存" size="md" />

### 保存済み検索へのアラートの追加 {#alerts-on-saved-searches}

保存済み検索はアラートで監視でき、特定の条件が満たされたときに通知を受け取ることができます。保存済み検索に一致するイベント数が、指定したしきい値を超えた場合や下回った場合にアラートがトリガーされるように設定できます。

アラートの設定および構成の詳細については、[アラートのドキュメント](/use-cases/observability/clickstack/alerts)を参照してください。

### タグ付け {#tagging}
<Tagging />