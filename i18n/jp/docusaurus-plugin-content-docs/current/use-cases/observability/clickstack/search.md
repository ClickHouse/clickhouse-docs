---
'slug': '/use-cases/observability/clickstack/search'
'title': 'ClickStackでの検索'
'sidebar_label': '検索'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackでの検索'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';

ClickStack は、イベント（ログやトレース）に対してフルテキスト検索を行うことができます。イベントに一致するキーワードを入力するだけで、検索を始めることができます。たとえば、ログに「Error」が含まれている場合、検索バーに「Error」と入力するだけで見つけることができます。

同じ検索構文は、ダッシュボードやチャートでのイベントフィルタリングにも使用されます。

## 自然言語検索構文 {#natural-language-syntax}

- 検索は大文字と小文字を区別しません。
- 検索はデフォルトで完全な単語に一致します（例： `Error` は `Error here` に一致しますが、 `Errors here` には一致しません）。部分的な単語に一致させるには、単語をワイルドカードで囲むことができます（例： `*Error*` は `AnyError` および `AnyErrors` に一致します）。
- 検索語は任意の順序で検索されます（例： `Hello World` は `Hello World` および `World Hello` を含むログに一致します）。
- キーワードを除外するには、 `NOT` または `-` を使用します（例： `Error NOT Exception` または `Error -Exception`）。
- 複数のキーワードを組み合わせるには、 `AND` および `OR` を使用します（例： `Error OR Exception`）。
- 正確な一致は二重引用符で指定できます（例： `"Error tests not found"`）。

<Image img={hyperdx_27} alt="Search" size="md"/>

### カラム/プロパティ検索 {#column-search}

- `column:value` を使用してカラムや JSON/マッププロパティを検索できます（例： `level:Error` 、 `service:app`）。
- 比較演算子（ `>` 、 `<` 、 `>=` 、 `<=` ）を使用して値の範囲を検索できます（例： `Duration:>1000`）。
- プロパティの存在を検索するには、 `property:*` を使用します（例： `duration:*`）。

## 時間入力 {#time-input}

- 時間入力は自然言語の入力を受け付けます（例： `1 hour ago` 、 `yesterday` 、 `last week`）。
- 単一の時点を指定すると、その時点から現在まで検索します。
- 時間範囲は、時間クエリのデバッグを容易にするために、検索時に常に解析された時間範囲に変換されます。
- ヒストグラムのバーをハイライトすることで、特定の時間範囲にズームインすることもできます。

## SQL 検索構文 {#sql-syntax}

検索入力を SQL モードに切り替えることができます。これにより、検索のための有効な SQL WHERE 句を受け入れます。これは、Lucene 構文では表現できない複雑なクエリに便利です。

## SELECT 文 {#select-statement}

検索結果に表示するカラムを指定するには、 `SELECT` 入力を使用します。これは検索ページで選択するカラムのための SQL SELECT 式です。エイリアスは現在サポートされていません（例： `column as "alias"` は使用できません）。
