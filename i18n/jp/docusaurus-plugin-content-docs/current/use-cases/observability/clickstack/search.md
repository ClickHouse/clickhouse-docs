---
slug: /use-cases/observability/clickstack/search
title: 'ClickStack を使用した検索'
sidebar_label: '検索'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した検索'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack を使用すると、イベント（ログやトレース）に対してフルテキスト検索を行うことができます。イベントに一致するキーワードを入力するだけで、すぐに検索を開始できます。たとえば、ログに「Error」が含まれている場合、検索バーに「Error」と入力するだけで、そのログを見つけることができます。

同じ検索構文は、ダッシュボードやチャートでイベントをフィルタリングする場合にも利用されます。


## 検索機能 {#search-features}

### 自然言語検索構文 {#natural-language-syntax}

- 検索では大文字と小文字は区別されません
- 検索はデフォルトで単語全体に一致します（例：`Error`は`Error here`に一致しますが、`Errors here`には一致しません）。ワイルドカードで単語を囲むことで部分一致させることができます（例：`*Error*`は`AnyError`と`AnyErrors`に一致します）
- 検索語は任意の順序で検索されます（例：`Hello World`は`Hello World`と`World Hello`を含むログに一致します）
- `NOT`または`-`を使用してキーワードを除外できます（例：`Error NOT Exception`または`Error -Exception`）
- `AND`と`OR`を使用して複数のキーワードを組み合わせることができます（例：`Error OR Exception`）
- 完全一致は二重引用符を使用して行うことができます（例：`"Error tests not found"`）

<Image img={hyperdx_27} alt='検索' size='md' />

#### カラム/プロパティ検索 {#column-search}

- `column:value`を使用してカラムとJSON/mapプロパティを検索できます（例：`level:Error`、`service:app`）
- 比較演算子（`>`、`<`、`>=`、`<=`）を使用して値の範囲を検索できます（例：`Duration:>1000`）
- `property:*`を使用してプロパティの存在を検索できます（例：`duration:*`）

### 時刻入力 {#time-input}

- 時刻入力は自然言語入力を受け付けます（例：`1 hour ago`、`yesterday`、`last week`）
- 単一の時点を指定すると、その時点から現在までの検索が行われます
- 時間範囲は検索時に常に解析された時間範囲に変換され、時刻クエリのデバッグが容易になります
- ヒストグラムバーをハイライトして特定の時間範囲にズームインすることもできます

### SQL検索構文 {#sql-syntax}

検索入力をSQLモードに切り替えることができます。これにより、検索に有効な任意のSQL WHERE句を使用できます。これはLucene構文では表現できない複雑なクエリに便利です。

### Select文 {#select-statement}

検索結果に表示するカラムを指定するには、`SELECT`入力を使用できます。これは検索ページで選択するカラムのSQL SELECT式です。現時点ではエイリアスはサポートされていません（例：`column as "alias"`は使用できません）。


## 保存された検索 {#saved-searches}

検索を保存することで、後から素早くアクセスできます。保存した検索は左サイドバーに表示されるため、頻繁に使用する検索クエリを再構築することなく簡単に再利用できます。

検索を保存するには、検索クエリを設定して保存ボタンをクリックします。保存した検索には、後で識別しやすいようにわかりやすい名前を付けることができます。

<Image img={saved_search} alt='検索の保存' size='md' />

### 保存された検索へのアラートの追加 {#alerts-on-saved-searches}

保存された検索にアラートを設定することで、特定の条件が満たされたときに通知を受け取ることができます。保存された検索に一致するイベント数が指定されたしきい値を超えた場合、または下回った場合にトリガーされるアラートを設定できます。

アラートの設定と構成の詳細については、[アラートのドキュメント](/use-cases/observability/clickstack/alerts)を参照してください。

### タグ付け {#tagging}

<Tagging />
