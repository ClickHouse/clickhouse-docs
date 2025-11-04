---
'slug': '/use-cases/observability/clickstack/migration/elastic/search'
'title': 'ClickStack と Elastic での検索'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '検索'
'sidebar_position': 3
'description': 'ClickStack と Elastic での検索'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';

## ClickStack と Elastic における検索 {#search-in-clickstack-and-elastic}

ClickHouse は、高性能の分析ワークロード用にゼロから設計された SQL ネイティブエンジンです。対照的に、Elasticsearch は SQL に似たインターフェースを提供し、SQL を基盤となる Elasticsearch クエリ DSL にトランスパイルします。つまり、これは一級市民ではなく、[機能の対等性](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations)が制限されています。

ClickHouse は完全な SQL をサポートするだけでなく、[`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram)、および[`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)などの可観測性向けの関数を豊富に拡張し、構造化されたログ、メトリクス、およびトレースのクエリを簡素化します。

簡単なログおよびトレースの探索には、HyperDX が提供する[Luceneスタイルの構文](/use-cases/observability/clickstack/search)を使用して、フィールドと値のクエリ、範囲、ワイルドカードなどに対する直感的でテキストベースのフィルタリングが可能です。これは、Elasticsearch における[Lucene 構文](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax)および[Kibana クエリ言語](https://www.elastic.co/docs/reference/query-languages/kql)の要素に相当します。

<Image img={hyperdx_search} alt="Search" size="lg"/>

HyperDX の検索インターフェースは、この使い慣れた構文をサポートしていますが、その背後では効率的な SQL `WHERE` 句に変換されているため、Kibana のユーザーには馴染みのある体験を提供しつつ、必要に応じて SQL のパワーを活用することも可能です。これにより、ユーザーは ClickHouse における[文字列検索関数](/sql-reference/functions/string-search-functions)、[類似性関数](/sql-reference/functions/string-functions#stringjaccardindex)、および[日時関数](/sql-reference/functions/date-time-functions)の全範囲を活用できます。

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

以下に、ClickStack と Elasticsearch の Lucene クエリ言語を比較します。

## ClickStack の検索構文と Elasticsearch のクエリ文字列の比較 {#hyperdx-vs-elasticsearch-query-string}

HyperDX と Elasticsearch の両方が、直感的なログとトレースのフィルタリングを可能にする柔軟なクエリ言語を提供します。Elasticsearch のクエリ文字列はその DSL やインデクシングエンジンと緊密に統合されていますが、HyperDX は ClickHouse SQL に変換される Lucene 風の構文をサポートしています。以下の表は、両システムにおける一般的な検索パターンの挙動を示し、構文の類似性とバックエンドでの実行の違いを強調しています。

| **機能** | **HyperDX 構文** | **Elasticsearch 構文** | **コメント** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| フリーテキスト検索        | `error` | `error` | すべてのインデックスされたフィールドに一致；ClickStack ではこれがマルチフィールド SQL `ILIKE` に書き換えられる。 |
| フィールドマッチ             | `level:error` | `level:error` | 同一の構文。HyperDX は ClickHouse における正確なフィールド値をマッチングします。 |
| フレーズ検索           | `"disk full"` | `"disk full"` | 引用されたテキストは正確なシーケンスに一致；ClickHouse は文字列の等価性または `ILIKE` を使用。 |
| フィールドフレーズマッチ      | `message:"disk full"` | `message:"disk full"` | SQL `ILIKE` または正確なマッチに変換される。 |
| OR 条件           | `error OR warning` | `error OR warning` | 用語の論理 OR；両システムはこれをネイティブにサポート。 |
| AND 条件          | `error AND db` | `error AND db` | 双方が交差に変換；ユーザー構文に差はない。 |
| 否定                | `NOT error` または `-error` | `NOT error` または `-error` | 同様にサポート；HyperDX は SQL `NOT ILIKE` に変換。 |
| グルーピング                | `(error OR fail) AND db` | `(error OR fail) AND db` | 両者で標準のブールグルーピング。 |
| ワイルドカード               | `error*` または `*fail*` | `error*`, `*fail*` | HyperDX は先頭および末尾のワイルドカードをサポート；ES はパフォーマンスのため先頭のワイルドカードをデフォルトで無効にします。用語内のワイルドカードはサポートされません。例：`f*ail.` ワイルドカードはフィールドマッチと共に適用する必要があります。|
| 範囲 (数値/日付)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX は SQL `BETWEEN` を使用；Elasticsearch は範囲クエリに展開。無制限の `*` は範囲においてサポートされていません。例：`duration:[100 TO *]` は無効です。必要に応じて以下の `無制限の範囲` を使用してください。|
| 無制限の範囲 (数値/日付)   | `duration:>10`または `duration:>=10` | `duration:>10`または `duration:>=10` | HyperDX は標準の SQL 演算子を使用します。|
| 包含/除外     | `duration:{100 TO 200}` （除外）    | 同様                                   | 波括弧は除外の境界を示します。範囲内での `*` はサポートされていません。例：`duration:[100 TO *]` |
| 存在確認            | N/A                       | `_exists_:user` または `field:*` | `_exists_` はサポートされていません。`LogAttributes.log.file.path: *` を `Map` カラムに使用してください。例：`LogAttributes`。ルートカラムの場合は、これらは存在しなければならず、イベントに含まれていない場合にはデフォルト値を持ちます。デフォルト値または欠落しているカラムを検索する場合は、Elasticsearch と同様の構文を使用します。例：`ServiceName:*` または `ServiceName != ''`。 |
| 正規表現                   |      `match` 関数          | `name:/joh?n(ath[oa]n)/` | 現在 Lucene 構文ではサポートされていません。ユーザーは SQL および [`match`](/sql-reference/functions/string-search-functions#match) 関数や他の[文字列検索関数](/sql-reference/functions/string-search-functions)を使用できます。|
| フォズィーマッチ             |      `editDistance('quikc', field) = 1` | `quikc~` | 現在 Lucene 構文ではサポートされていません。距離関数は SQL で使用できます。例：`editDistance('rror', SeverityText) = 1` または [他の類似性関数](/sql-reference/functions/string-functions#jarosimilarity)。 |
| 近接検索        | サポートされていない                       | `"fox quick"~5` | 現在 Lucene 構文ではサポートされていません。 |
| ブースティング                | `quick^2 fox` | `quick^2 fox` | 現在 HyperDX ではサポートされていません。 |
| フィールドワイルドカード          | `service.*:error` | `service.*:error` | 現在 HyperDX ではサポートされていません。 |
| 特殊文字のエスケープ   | 予約された文字を `\` でエスケープ | 同様      | 予約されたシンボルにはエスケープが必要です。 |

## 存在/欠如の違い {#empty-value-differences}

フィールドがイベントから完全に省略される可能性のある Elasticsearch に対して、ClickHouse ではテーブルスキーマ内のすべてのカラムが存在する必要があります。挿入イベントでフィールドが提供されていない場合：

- [`Nullable`](/sql-reference/data-types/nullable) フィールドの場合、それは `NULL` に設定されます。
- 非 Nullable フィールドの場合（デフォルト）、デフォルト値（しばしば空文字列、0、または同等の値）で埋められます。

ClickStack では、後者を使用します。[`Nullable`](/sql-reference/data-types/nullable) は [推奨されていません](/optimize/avoid-nullable-columns)。

この動作により、Elasticsearch の意味でフィールドが「存在するか」を確認することは直接的にサポートされません。

代わりに、ユーザーは `field:*` または `field != ''` を使用して非空の値の存在を確認することができます。したがって、真に欠落しているフィールドと明示的に空のフィールドを区別することはできません。

実際には、この違いが可観測性のユースケースで問題になることはほとんどありませんが、システム間でクエリを変換する際には留意しておくことが重要です。
