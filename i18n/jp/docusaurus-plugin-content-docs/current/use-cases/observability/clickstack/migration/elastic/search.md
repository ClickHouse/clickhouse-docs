---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: 'ClickStack と Elastic での検索'
pagination_prev: null
pagination_next: null
sidebar_label: '検索'
sidebar_position: 3
description: 'ClickStack と Elastic での検索'
doc_type: 'guide'
keywords: ['clickstack', '検索', 'ログ', 'オブザーバビリティ', '全文検索']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## ClickStack と Elastic における検索 {#search-in-clickstack-and-elastic}

ClickHouse は SQL ネイティブなエンジンであり、高性能な分析ワークロード向けに一から設計されています。対照的に、Elasticsearch は SQL 風のインターフェイスを提供しますが、SQL を内部の Elasticsearch query DSL にトランスパイルしており、SQL は第一級のサポート対象ではなく、[機能の同等性](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) も限定的です。

ClickHouse は完全な SQL をサポートするだけでなく、[`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram)、[`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) など、観測性にフォーカスしたさまざまな関数によって SQL を拡張しており、構造化されたログ、メトリクス、トレースに対するクエリを容易にします。

シンプルなログおよびトレースの探索に対しては、HyperDX が [Lucene 風シンタックス](/use-cases/observability/clickstack/search) を提供し、フィールド値クエリ、範囲、ワイルドカードなどに対する直感的なテキストベースのフィルタリングを可能にします。これは Elasticsearch の [Lucene シンタックス](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) や [Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql) の一部の要素に相当します。

<Image img={hyperdx_search} alt="検索" size="lg"/>

HyperDX の検索インターフェイスは、このなじみのあるシンタックスをサポートしつつ、裏側では効率的な SQL の `WHERE` 句へと変換します。これにより、Kibana ユーザーにとって親しみやすい操作性を維持しながら、必要に応じて SQL の持つパワーを活用できるようになります。これによって、ClickHouse の [文字列検索関数](/sql-reference/functions/string-search-functions)、[類似度関数](/sql-reference/functions/string-functions#stringJaccardIndex)、[日時関数](/sql-reference/functions/date-time-functions) をフルに利用できます。

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

以下では、ClickStack と Elasticsearch の Lucene クエリ言語を比較します。



## ClickStack の検索構文と Elasticsearch query string の比較 {#hyperdx-vs-elasticsearch-query-string}

HyperDX と Elasticsearch はどちらも柔軟なクエリ言語を提供しており、直感的なログおよびトレースのフィルタリングが可能です。Elasticsearch の query string がその DSL とインデックスエンジンに強く統合されているのに対し、HyperDX は Lucene 風の構文をサポートし、内部的には ClickHouse の SQL に変換されます。以下の表では、代表的な検索パターンが両システムでどのように動作するかを示し、構文の類似点とバックエンドでの実行の違いを強調しています。

| **Feature** | **HyperDX Syntax** | **Elasticsearch Syntax** | **Comments** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| Free text search        | `error` | `error` | すべてのインデックス済みフィールドを横断してマッチします。ClickStack では、複数フィールドに対する SQL の `ILIKE` に書き換えられます。 |
| Field match             | `level:error` | `level:error` | 構文は同一です。HyperDX は ClickHouse 上でフィールド値の完全一致を行います。 |
| Phrase search           | `"disk full"` | `"disk full"` | 引用符で囲まれたテキストは、文字列の並びとして完全一致でマッチします。ClickHouse は文字列の等価比較または `ILIKE` を使用します。 |
| Field phrase match      | `message:"disk full"` | `message:"disk full"` | SQL の `ILIKE` または完全一致に変換されます。 |
| OR conditions           | `error OR warning` | `error OR warning` | 用語の論理 OR。両システムともネイティブにサポートしています。 |
| AND conditions          | `error AND db` | `error AND db` | どちらも論理積（AND）になります。ユーザー側の構文に違いはありません。 |
| Negation                | `NOT error` or `-error` | `NOT error` or `-error` | 同様にサポートされます。HyperDX では SQL の `NOT ILIKE` に変換されます。 |
| Grouping                | `(error OR fail) AND db` | `(error OR fail) AND db` | 両システムで標準的なブールグルーピングです。 |
| Wildcards               | `error*` or `*fail*` | `error*`, `*fail*` | HyperDX は前方/後方ワイルドカードをサポートします。Elasticsearch ではパフォーマンス上の理由から前方ワイルドカードはデフォルトで無効です。語中ワイルドカードはサポートされません (例: `f*ail`)。ワイルドカードはフィールド指定とともに使用する必要があります。|
| Ranges (numeric/date)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX は SQL の `BETWEEN` を使用し、Elasticsearch はレンジクエリに展開します。`*` を用いた上下いずれかが無限の範囲指定はサポートされません (例: `duration:[100 TO *]`)。必要な場合は下記の `Unbounded ranges` を使用してください。|
| Unbounded ranges (numeric/date)   | `duration:>10` or `duration:>=10` | `duration:>10` or `duration:>=10` | HyperDX は標準的な SQL 演算子を使用します。|
| Inclusive/exclusive     | `duration:{100 TO 200}` (exclusive)    | Same                                   | 中かっこは排他的な境界を表します。レンジ内の `*` はサポートされません (例: `duration:[100 TO *]`)。|
| Exists check            | N/A                       | `_exists_:user` or `field:*` | `_exists_` はサポートされません。`Map` 型カラム (例: `LogAttributes`) には `LogAttributes.log.file.path: *` を使用してください。ルートカラムについては、これらは存在しており、イベントに含まれていない場合でもデフォルト値を持ちます。デフォルト値または欠損カラムを検索するには、Elasticsearch と同じ構文 ` ServiceName:*` や `ServiceName != ''` を使用します。 |
| Regex                   |      `match` function          | `name:/joh?n(ath[oa]n)/` | 現在、Lucene 風構文ではサポートされていません。ユーザーは SQL と [`match`](/sql-reference/functions/string-search-functions#match) 関数、またはその他の[文字列検索関数](/sql-reference/functions/string-search-functions)を使用できます。|
| Fuzzy match             |      `editDistance('quikc', field) = 1` | `quikc~` | 現在、Lucene 風構文ではサポートされていません。SQL では距離関数を使用できます (例: `editDistance('rror', SeverityText) = 1`)、または[その他の類似度関数](/sql-reference/functions/string-functions#jaroSimilarity) を利用できます。 |
| Proximity search        | Not supported                       | `"fox quick"~5` | 現在、Lucene 風構文ではサポートされていません。 |
| Boosting                | `quick^2 fox` | `quick^2 fox` | 現在 HyperDX ではサポートされていません。 |
| Field wildcard          | `service.*:error` | `service.*:error` | 現在 HyperDX ではサポートされていません。 |
| Escaped special chars   | Escape reserved characters with `\` | Same      | 予約済みの記号にはエスケープが必要です。 |



## 存在／欠落の違い {#empty-value-differences}

イベントからフィールドを完全に省略でき、その結果として本当に「存在しない」状態を表現できる Elasticsearch と異なり、ClickHouse ではテーブルのスキーマで定義されたすべてのカラムが存在している必要があります。INSERT 時にフィールドが指定されなかった場合:

- [`Nullable`](/sql-reference/data-types/nullable) フィールドの場合は、`NULL` に設定されます。
- 非 Nullable フィールド（デフォルト）の場合は、デフォルト値（多くの場合、空文字列や 0 など）が設定されます。

ClickStack では、[`Nullable`](/sql-reference/data-types/nullable) は[推奨されていない](/optimize/avoid-nullable-columns)ため、後者の挙動を利用します。

この挙動により、Elasticsearch の意味でフィールドが「存在する」かどうかを判定することは、そのままではサポートされません。

その代わりに、ユーザーは `field:*` や `field != ''` を使用して、空でない値が存在するかどうかを確認できます。そのため、本当に欠落しているフィールドと、明示的に空にされているフィールドとを区別することはできません。

実際には、この違いがオブザーバビリティ用途で問題になることはほとんどありませんが、システム間でクエリを移行・変換する際には意識しておくことが重要です。
