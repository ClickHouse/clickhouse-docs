---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: 'ClickStack と Elastic での検索'
pagination_prev: null
pagination_next: null
sidebar_label: '検索'
sidebar_position: 3
description: 'ClickStack と Elastic での検索'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## ClickStackとElasticにおける検索 {#search-in-clickstack-and-elastic}

ClickHouseは、高性能な分析ワークロード向けにゼロから設計されたSQLネイティブエンジンです。対照的に、Elasticsearchは、SQLを基盤となるElasticsearchクエリDSLにトランスパイルするSQL風のインターフェースを提供しており、SQLはファーストクラスの機能ではなく、[機能の同等性](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations)も限定的です。

ClickHouseは完全なSQLをサポートするだけでなく、[`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram)、[`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)などの可観測性に特化した関数群でSQLを拡張しており、構造化ログ、メトリクス、トレースのクエリを簡素化します。

シンプルなログとトレースの探索のために、HyperDXは、フィールド値クエリ、範囲、ワイルドカードなどに対する直感的なテキストベースのフィルタリングを実現する[Lucene形式の構文](/use-cases/observability/clickstack/search)を提供します。これは、Elasticsearchの[Lucene構文](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax)や[Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql)の要素に相当します。

<Image img={hyperdx_search} alt='検索' size='lg' />

HyperDXの検索インターフェースはこの馴染みのある構文をサポートしていますが、裏側では効率的なSQL `WHERE`句に変換されるため、Kibanaユーザーにとって使い慣れた体験を提供しながら、必要に応じてSQLの機能を活用することができます。これにより、ユーザーはClickHouseの[文字列検索関数](/sql-reference/functions/string-search-functions)、[類似度関数](/sql-reference/functions/string-functions#stringJaccardIndex)、[日時関数](/sql-reference/functions/date-time-functions)を最大限に活用できます。

<Image img={hyperdx_sql} alt='SQL' size='lg' />

以下では、ClickStackとElasticsearchのLuceneクエリ言語を比較します。


## ClickStack検索構文 vs Elasticsearchクエリ文字列 {#hyperdx-vs-elasticsearch-query-string}

HyperDXとElasticsearchはどちらも、直感的なログとトレースのフィルタリングを可能にする柔軟なクエリ言語を提供しています。Elasticsearchのクエリ文字列がそのDSLとインデックスエンジンに緊密に統合されているのに対し、HyperDXはLuceneにインスパイアされた構文をサポートし、内部的にClickHouse SQLに変換されます。以下の表は、両システムで一般的な検索パターンがどのように動作するかを概説し、構文の類似点とバックエンド実行の違いを示しています。

| **機能**                     | **HyperDX構文**                  | **Elasticsearch構文**          | **コメント**                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ----------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フリーテキスト検索                | `error`                             | `error`                           | すべてのインデックス化されたフィールドにマッチします。ClickStackでは、これは複数フィールドのSQL `ILIKE`に書き換えられます。                                                                                                                                                                                                                                          |
| フィールドマッチ                     | `level:error`                       | `level:error`                     | 同一の構文です。HyperDXはClickHouseで正確なフィールド値にマッチします。                                                                                                                                                                                                                                                                       |
| フレーズ検索                   | `"disk full"`                       | `"disk full"`                     | 引用符で囲まれたテキストは正確なシーケンスにマッチします。ClickHouseは文字列の等価性または`ILIKE`を使用します。                                                                                                                                                                                                                                        |
| フィールドフレーズマッチ              | `message:"disk full"`               | `message:"disk full"`             | SQL `ILIKE`または完全一致に変換されます。                                                                                                                                                                                                                                                                                                 |
| OR条件                   | `error OR warning`                  | `error OR warning`                | 項の論理OR。両システムともネイティブにサポートしています。                                                                                                                                                                                                                                                                                  |
| AND条件                  | `error AND db`                      | `error AND db`                    | 両方とも積集合に変換されます。ユーザー構文に違いはありません。                                                                                                                                                                                                                                                                             |
| 否定                        | `NOT error` または `-error`             | `NOT error` または `-error`           | 同一にサポートされています。HyperDXはSQL `NOT ILIKE`に変換します。                                                                                                                                                                                                                                                                               |
| グループ化                        | `(error OR fail) AND db`            | `(error OR fail) AND db`          | 両方とも標準的なブール値のグループ化です。                                                                                                                                                                                                                                                                                                        |
| ワイルドカード                       | `error*` または `*fail*`                | `error*`、`*fail*`                | HyperDXは先頭/末尾のワイルドカードをサポートしています。ESはパフォーマンスのためデフォルトで先頭のワイルドカードを無効にしています。項内のワイルドカードはサポートされていません（例：`f*ail`）。ワイルドカードはフィールドマッチと共に適用する必要があります。                                                                                                                                                    |
| 範囲（数値/日付）           | `duration:[100 TO 200]`             | `duration:[100 TO 200]`           | HyperDXはSQL `BETWEEN`を使用します。Elasticsearchは範囲クエリに展開されます。範囲内の無制限の`*`はサポートされていません（例：`duration:[100 TO *]`）。必要な場合は、以下の`無制限範囲`を使用してください。                                                                                                                                         |
| 無制限範囲（数値/日付） | `duration:>10` または `duration:>=10`   | `duration:>10` または `duration:>=10` | HyperDXは標準的なSQL演算子を使用します                                                                                                                                                                                                                                                                                                       |
| 包含/排他             | `duration:{100 TO 200}` (排他) | 同じ                              | 波括弧は排他的境界を示します。範囲内の`*`はサポートされていません（例：`duration:[100 TO *]`）。                                                                                                                                                                                                                                                       |
| 存在チェック                    | N/A                                 | `_exists_:user` または `field:*`      | `_exists_`はサポートされていません。`Map`カラム（例：`LogAttributes`）には`LogAttributes.log.file.path: *`を使用してください。ルートカラムの場合、これらは存在する必要があり、イベントに含まれていない場合はデフォルト値を持ちます。デフォルト値または欠落しているカラムを検索するには、Elasticsearchと同じ構文` ServiceName:*`または`ServiceName != ''`を使用してください。 |
| 正規表現                           | `match`関数                    | `name:/joh?n(ath[oa]n)/`          | 現在Lucene構文ではサポートされていません。ユーザーはSQLと[`match`](/sql-reference/functions/string-search-functions#match)関数、または他の[文字列検索関数](/sql-reference/functions/string-search-functions)を使用できます。                                                                                                      |
| あいまい一致                     | `editDistance('quikc', field) = 1`  | `quikc~`                          | 現在Lucene構文ではサポートされていません。距離関数はSQLで使用できます（例：`editDistance('rror', SeverityText) = 1`）、または[他の類似度関数](/sql-reference/functions/string-functions#jaroSimilarity)を使用できます。                                                                                                                  |
| 近接検索                | サポートされていません                       | `"fox quick"~5`                   | 現在Lucene構文ではサポートされていません。                                                                                                                                                                                                                                                                                                 |
| ブースティング                        | `quick^2 fox`                       | `quick^2 fox`                     | 現在HyperDXではサポートされていません。                                                                                                                                                                                                                                                                                                      |
| フィールドワイルドカード                  | `service.*:error`                   | `service.*:error`                 | 現在HyperDXではサポートされていません。                                                                                                                                                                                                                                                                                                      |
| エスケープされた特殊文字           | 予約文字を`\`でエスケープ | 同じ                              | 予約記号にはエスケープが必要です。                                                                                                                                                                                                                                                                                                   |


## 存在/欠損の違い {#empty-value-differences}

Elasticsearchではイベントからフィールドを完全に省略でき、真に「存在しない」状態を表現できますが、ClickHouseではテーブルスキーマ内のすべてのカラムが存在する必要があります。挿入イベントでフィールドが提供されない場合:

- [`Nullable`](/sql-reference/data-types/nullable)フィールドの場合、`NULL`に設定されます。
- 非nullableフィールド（デフォルト）の場合、デフォルト値（多くの場合、空文字列、0、または同等の値）が設定されます。

ClickStackでは、[`Nullable`](/sql-reference/data-types/nullable)は[推奨されない](/optimize/avoid-nullable-columns)ため、後者を使用しています。

この動作により、Elasticsearchの意味でフィールドが「存在する」かどうかを確認することは直接サポートされていません。

代わりに、ユーザーは`field:*`または`field != ''`を使用して、空でない値の存在を確認できます。したがって、真に欠損しているフィールドと明示的に空のフィールドを区別することはできません。

実際には、この違いがオブザーバビリティのユースケースで問題を引き起こすことはほとんどありませんが、システム間でクエリを変換する際には留意しておくことが重要です。
