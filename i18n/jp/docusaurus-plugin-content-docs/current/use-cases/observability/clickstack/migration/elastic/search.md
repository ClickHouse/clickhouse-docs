---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: 'ClickStack と Elastic での検索'
pagination_prev: null
pagination_next: null
sidebar_label: '検索'
sidebar_position: 3
description: 'ClickStack と Elastic での検索'
doc_type: 'guide'
keywords: ['clickstack', '検索', 'ログ', '可観測性', 'フルテキスト検索']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## ClickStack と Elastic における検索 {#search-in-clickstack-and-elastic}

ClickHouse は SQL ネイティブなエンジンであり、ハイパフォーマンスな分析ワークロード向けにゼロから設計されています。対照的に、Elasticsearch は SQL ライクなインターフェースを提供しますが、SQL を内部の Elasticsearch query DSL にトランスパイルしているだけであり、SQL は第一級の機能として扱われておらず、[機能パリティ](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations) も限定的です。

ClickHouse は完全な SQL をサポートするだけでなく、[`argMax`](/sql-reference/aggregate-functions/reference/argmax)、[`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram)、[`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) など、可観測性に特化した関数群を追加で提供しており、構造化ログ、メトリクス、トレースに対するクエリを簡潔に記述できます。

シンプルなログおよびトレースの探索のために、HyperDX はフィールドと値のクエリ、範囲指定、ワイルドカードなどに対する直感的なテキストベースのフィルタリングが行える [Lucene スタイルの構文](/use-cases/observability/clickstack/search) を提供します。これは Elasticsearch における [Lucene 構文](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) や、[Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql) の要素に相当するものです。

<Image img={hyperdx_search} alt="検索" size="lg"/>

HyperDX の検索インターフェースは、この馴染みのある構文をサポートしつつ、裏側では効率的な SQL の `WHERE` 句へと変換します。これにより、Kibana ユーザーにとって馴染みのある操作感を維持しながら、必要に応じて SQL の強力な機能も活用できるようになります。これにより、ClickHouse における [文字列検索関数](/sql-reference/functions/string-search-functions)、[類似度関数](/sql-reference/functions/string-functions#stringJaccardIndex)、[日付時刻関数](/sql-reference/functions/date-time-functions) をフルに活用できます。

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

以下では、ClickStack と Elasticsearch の Lucene クエリ言語を比較します。

## ClickStack の検索構文と Elasticsearch query string の比較 {#hyperdx-vs-elasticsearch-query-string}

HyperDX と Elasticsearch はどちらも、ログやトレースを直感的にフィルタリングできる柔軟なクエリ言語を提供しています。Elasticsearch の query string は DSL とインデックスエンジンに強く統合されていますが、HyperDX は Lucene 風の構文をサポートしており、内部的には ClickHouse の SQL に変換されます。以下の表では、代表的な検索パターンが両システムでどのように動作するかを示し、構文上の類似点とバックエンド実行の違いを強調しています。

| **Feature** | **HyperDX Syntax** | **Elasticsearch Syntax** | **Comments** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| Free text search        | `error` | `error` | すべてのインデックス済みフィールドを横断してマッチします。ClickStack では複数フィールドに対する SQL の `ILIKE` に書き換えられます。 |
| Field match             | `level:error` | `level:error` | 構文は同一です。HyperDX は ClickHouse 上でフィールド値の完全一致を行います。 |
| Phrase search           | `"disk full"` | `"disk full"` | 引用符で囲まれたテキストは完全に同じ並びの文字列にマッチします。ClickHouse は文字列の等価比較または `ILIKE` を使用します。 |
| Field phrase match      | `message:"disk full"` | `message:"disk full"` | SQL の `ILIKE` または完全一致に変換されます。 |
| OR conditions           | `error OR warning` | `error OR warning` | 語・条件間の論理 OR。どちらのシステムもネイティブにサポートしています。 |
| AND conditions          | `error AND db` | `error AND db` | どちらも論理積（積集合）として解釈されます。ユーザー側の構文の違いはありません。 |
| Negation                | `NOT error` or `-error` | `NOT error` or `-error` | 同一の構文でサポートされます。HyperDX は SQL の `NOT ILIKE` に変換します。 |
| Grouping                | `(error OR fail) AND db` | `(error OR fail) AND db` | どちらも標準的なブール式のグルーピングです。 |
| Wildcards               | `error*` or `*fail*` | `error*`, `*fail*` | HyperDX は前方・後方のワイルドカードをサポートします。Elasticsearch はパフォーマンス上の理由から前方ワイルドカードをデフォルトで無効にしています。語中ワイルドカードはサポートされません (例: `f*ail`)。ワイルドカードはフィールド指定と組み合わせて使用する必要があります。|
| Ranges (numeric/date)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX は SQL の `BETWEEN` を使用します。Elasticsearch は range query に展開します。`*` を用いた片側無限大の範囲はサポートされません (例: `duration:[100 TO *]`)。必要な場合は下記の `Unbounded ranges` を使用してください。|
| Unbounded ranges (numeric/date)   | `duration:>10` or `duration:>=10` | `duration:>10` or `duration:>=10` | HyperDX は標準的な SQL 演算子を使用します。|
| Inclusive/exclusive     | `duration:{100 TO 200}` (exclusive)    | Same                                   | 波括弧は排他的な境界を表します。範囲内での `*` はサポートされません (例: `duration:[100 TO *]`)。|
| Exists check            | N/A                       | `_exists_:user` or `field:*` | `_exists_` はサポートされていません。`LogAttributes` のような `Map` カラムに対しては `LogAttributes.log.file.path: *` を使用してください。ルートカラムについては、イベントに含まれていない場合でも必ず存在しており、デフォルト値が設定されます。デフォルト値や欠損カラムを検索する場合は Elasticsearch と同じ構文 `ServiceName:*` や `ServiceName != ''` を使用してください。 |
| Regex                   |      `match` function          | `name:/joh?n(ath[oa]n)/` | 現在、Lucene 構文ではサポートされていません。ユーザーは SQL と [`match`](/sql-reference/functions/string-search-functions#match) 関数、もしくはその他の [文字列検索関数](/sql-reference/functions/string-search-functions) を使用できます。|
| Fuzzy match             |      `editDistance('quikc', field) = 1` | `quikc~` | 現在、Lucene 構文ではサポートされていません。SQL では距離関数を使用できます (例: `editDistance('rror', SeverityText) = 1`) や [その他の類似度関数](/sql-reference/functions/string-functions#jaroSimilarity) を利用できます。 |
| Proximity search        | Not supported                       | `"fox quick"~5` | 現在、Lucene 構文ではサポートされていません。 |
| Boosting                | `quick^2 fox` | `quick^2 fox` | 現時点では HyperDX ではサポートされていません。 |
| Field wildcard          | `service.*:error` | `service.*:error` | 現時点では HyperDX ではサポートされていません。 |
| Escaped special chars   | Escape reserved characters with `\` | Same      | 予約済みの記号は `\` でエスケープする必要があります。 |

## 存在/欠落の違い {#empty-value-differences}

フィールドがイベントから完全に省略され、文字どおり「存在しない」状態になり得る Elasticsearch と異なり、ClickHouse ではテーブルスキーマに定義されたすべてのカラムが必ず存在している必要があります。INSERT イベントでフィールドが指定されなかった場合は、次のように扱われます。

- [`Nullable`](/sql-reference/data-types/nullable) フィールドの場合は、`NULL` が設定されます。
- 非 Nullable フィールド（デフォルト）の場合は、デフォルト値（多くの場合は空文字列や 0 などの同等値）が設定されます。

ClickStack では、[`Nullable`](/sql-reference/data-types/nullable) は[推奨されない](/optimize/avoid-nullable-columns)ため、後者の挙動を採用しています。

この挙動により、Elasticsearch における意味でフィールドが「存在する」かどうかをチェックすることは、直接的にはサポートされません。

代わりに、ユーザーは `field:*` や `field != ''` を使用して、空でない値が存在するかどうかを確認できます。そのため、真に欠落しているフィールドと、明示的に空にされているフィールドを区別することはできません。

実際のオブザーバビリティ用途においては、この違いが問題になることはまれですが、システム間でクエリを変換する際には念頭に置いておく必要があります。