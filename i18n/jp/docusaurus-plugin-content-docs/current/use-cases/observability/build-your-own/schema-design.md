---
title: 'スキーマ設計'
description: 'オブザーバビリティのためのスキーマ設計'
keywords: ['オブザーバビリティ', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# オブザーバビリティのためのスキーマ設計 {#designing-a-schema-for-observability}

以下の理由から、ログおよびトレース用には常に独自のスキーマを作成することを推奨します。

- **プライマリキーの選択** - デフォルトのスキーマは、特定のアクセスパターンに最適化された `ORDER BY` を使用しています。自分たちのアクセスパターンがこれと一致する可能性は低いと考えられます。
- **構造の抽出** - 既存のカラム、たとえば `Body` カラムから新しいカラムを抽出したい場合があります。これは materialized columns（および、より複雑なケースでは materialized views）を使用して実現できます。このためにはスキーマ変更が必要です。
- **Map の最適化** - デフォルトのスキーマは属性の保存に Map 型を使用します。これらのカラムには任意のメタデータを保存できます。イベント由来のメタデータは事前に定義されていないことが多く、そのため ClickHouse のような強い型付けのデータベースには他の方法では保存できないため、これは重要な機能です。一方で、Map のキーおよびその値へのアクセスは、通常のカラムへのアクセスほど効率的ではありません。この問題には、スキーマを変更し、最も頻繁にアクセスされる Map キーをトップレベルのカラムとして昇格させることで対処します。["Extracting structure with SQL"](#extracting-structure-with-sql) を参照してください。これにはスキーマ変更が必要です。
- **Map キーアクセスの簡素化** - Map 内のキーへアクセスするには、より冗長な構文が必要です。これはエイリアスを使用することで軽減できます。クエリを簡略化するには ["Using Aliases"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマは、Map へのアクセスおよびテキストクエリの高速化のためにセカンダリインデックスを使用します。これは通常必須ではなく、追加のディスク容量を消費します。利用することは可能ですが、本当に必要かどうかを検証すべきです。["Secondary / Data Skipping indices"](#secondarydata-skipping-indices) を参照してください。
- **Codec の利用** - 想定されるデータの特性を把握しており、圧縮の改善に効果があるという根拠がある場合は、カラムごとに codec をカスタマイズしたい場合があります。

_上記の各ユースケースについて、この後で詳細に説明します。_

**重要:** 最適な圧縮率とクエリ性能を達成するためにスキーマの拡張や変更を行うことは推奨されますが、可能な限りコアカラムについては OTel のスキーマ命名に準拠すべきです。ClickHouse Grafana プラグインは、クエリビルディングを支援するため、Timestamp や SeverityText などいくつかの基本的な OTel カラムの存在を前提としています。ログおよびトレースに必要なカラムは、それぞれこちら [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) に記載されています。これらのカラム名を変更し、プラグイン設定でデフォルト値を上書きすることもできます。

## SQL を使って構造を抽出する {#extracting-structure-with-sql}

構造化ログでも非構造化ログでも、取り込む際にユーザーはしばしば次のようなことを行う必要があります。

* **文字列ブロブからカラムを抽出する**。こうしておくと、クエリ時に文字列操作を行うよりも高速にクエリできます。
* **Map からキーを抽出する**。デフォルトのスキーマでは、任意の属性は Map 型のカラムに格納されます。この型はスキーマレスな機能を提供しており、ユーザーがログやトレースを定義する際に属性用のカラムを事前に定義しておく必要がないという利点があります。特に、Kubernetes からログを収集し、後から検索できるようにポッドラベルを保持したい場合には、事前定義が事実上不可能なことも多くあります。ただし、Map のキーとその値へのアクセスは、通常の ClickHouse のカラムに対するクエリより遅くなります。そのため、Map からキーを抽出してルートテーブルのカラムに展開することが望ましいケースが多くあります。

次のクエリを考えます。

構造化ログを使って、どの URL パスが最も多くの POST リクエストを受け取っているかをカウントしたいとします。JSON ブロブは `Body` カラム内に String として保存されています。さらに、ユーザーがコレクターで `json_parser` を有効にしている場合には、`LogAttributes` カラム内に `Map(String, String)` としても保存されている可能性があります。

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

`LogAttributes` が利用可能だと仮定すると、サイト上のどの URL パスが最も多くの POST リクエストを受け取っているかを集計するクエリは次のようになります：`

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.735 sec. Processed 10.36 million rows, 4.65 GB (14.10 million rows/s., 6.32 GB/s.)
Peak memory usage: 153.71 MiB.
```

ここでのマップ構文の使い方、例えば `LogAttributes['request_path']` のような指定方法と、URL からクエリパラメータを除去するための [`path` 関数](/sql-reference/functions/url-functions#path) に注目してください。

ユーザーがコレクター側で JSON 解析を有効化していない場合、`LogAttributes` は空となり、String 型の `Body` からカラムを抽出するために [JSON 関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note 解析には ClickHouse の利用を推奨
一般的に、構造化ログの JSON 解析は ClickHouse 上で実行することをユーザーに推奨します。ClickHouse が JSON 解析の実装として最速であると確信しています。ただし、他の送信先にログを送信したい場合や、このロジックを SQL に含めたくない場合もあることも認識しています。
:::


```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.668 sec. Processed 10.37 million rows, 5.13 GB (15.52 million rows/s., 7.68 GB/s.)
Peak memory usage: 172.30 MiB.
```

では、非構造化ログについても同様に考えてみましょう。

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

非構造化ログに対して同様のクエリを発行するには、`extractAllGroupsVertical` 関数を使って正規表現を適用する必要があります。

```sql
SELECT
        path((groups[1])[2]) AS path,
        count() AS c
FROM
(
        SELECT extractAllGroupsVertical(Body, '(\\w+)\\s([^\\s]+)\\sHTTP/\\d\\.\\d') AS groups
        FROM otel_logs
        WHERE ((groups[1])[1]) = 'POST'
)
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 1.953 sec. Processed 10.37 million rows, 3.59 GB (5.31 million rows/s., 1.84 GB/s.)
```

非構造化ログをパースするためのクエリは複雑さとコストが増大する（パフォーマンス差に注意）ため、可能な限り常に構造化ログを使用することを推奨します。

:::note 辞書の利用を検討する
上記のクエリは、正規表現辞書を活用するように最適化できます。詳細は [Using Dictionaries](#using-dictionaries) を参照してください。
:::

これら 2 つのユースケースは、上記のクエリロジックを挿入時点の処理に移すことで、ClickHouse を用いてどちらも満たすことができます。以下では、いくつかのアプローチを取り上げ、それぞれがどのような場合に適しているかを解説します。

:::note 処理は OTel か ClickHouse か？
[こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching) で説明しているように、OTel collector の processor や operator を使用して処理を行うこともできます。多くの場合、ClickHouse は collector の processor 群よりも大幅にリソース効率が高く、高速であることがわかるでしょう。すべてのイベント処理を SQL で実行する場合の主なデメリットは、ソリューションが ClickHouse に密結合されることです。たとえば、処理済みログを OTel collector から S3 など別の宛先に送信したくなる場合があります。
:::


### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出するための最もシンプルな手段を提供します。このようなカラムの値は常に挿入時に計算され、INSERT クエリで明示的に指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、値が挿入時にディスク上の新しいカラムへ抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムはあらゆる ClickHouse の式をサポートし、[文字列処理](/sql-reference/functions/string-functions)（[正規表現と検索](/sql-reference/functions/string-search-functions)を含む）や [URL](/sql-reference/functions/url-functions) の処理、[型変換](/sql-reference/functions/type-conversion-functions)、[JSON からの値の抽出](/sql-reference/functions/json-functions)、[数学演算](/sql-reference/functions/math-functions) などの各種分析関数を利用できます。

基本的な処理にはマテリアライズドカラムを推奨します。特に、Map 型から値を抽出してルートカラムに昇格させたり、型変換を行ったりする用途で有用です。非常にシンプルなスキーマで使用する場合や、materialized view と組み合わせて使用する場合に最も効果を発揮することが多いです。次のログ用スキーマでは、コレクターによってログから JSON が抽出され、`LogAttributes` カラムに格納されています。

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPage` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer'])
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

String 型の `Body` から JSON 関数を使って抽出するための同等のスキーマは[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)にあります。

ここで作成した 3 つのマテリアライズドカラムは、リクエストページ、リクエストタイプ、およびリファラーのドメインを抽出します。これらはマップのキーにアクセスし、その値に関数を適用します。その結果、後続のクエリは大幅に高速になります。

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.173 sec. Processed 10.37 million rows, 418.03 MB (60.07 million rows/s., 2.42 GB/s.)
Peak memory usage: 3.16 MiB.
```

:::note
マテリアライズドカラムは、デフォルトでは `SELECT *` の結果に含まれません。これは、`SELECT *` の結果を常にそのまま INSERT を用いてテーブルに挿入できるというインバリアント（不変条件）を維持するためです。このデフォルト動作は、`asterisk_include_materialized_columns=1` を設定することで変更でき、Grafana のデータソース設定（`Additional Settings -> Custom Settings` を参照）でも同様に有効化できます。
:::


## materialized view {#materialized-views}

[materialized view](/materialized-views) は、ログおよびトレースに対して SQL によるフィルタリングや変換を適用する、より強力な手段を提供します。

materialized view を使用すると、計算コストをクエリ時から挿入時へと移行できます。ClickHouse の materialized view は、テーブルにデータブロックが挿入される際にクエリを実行するトリガーに過ぎません。このクエリの結果は、2つ目の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt="Materialized view" size="md" />

:::note リアルタイム更新
ClickHouse の materialized view は、それらが基づいているテーブルにデータが流入するとリアルタイムに更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースでは、materialized view は通常クエリの静的スナップショットであり、（ClickHouse の Refreshable Materialized Views と同様に）リフレッシュする必要があります。
:::

materialized view に関連付けられたクエリは、理論的には集約を含む任意のクエリにすることができますが、[Join には制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログおよびトレースに必要な変換およびフィルタリングのワークロードに対しては、任意の `SELECT` 文が使用可能と考えて差し支えありません。

このクエリは、テーブル（ソーステーブル）に挿入される行に対して実行され、その結果が新しいテーブル（ターゲットテーブル）に送られるトリガーに過ぎないことを覚えておいてください。

ソーステーブルとターゲットテーブルの両方にデータを二重に永続化しないようにするために、元のスキーマを維持したまま、ソーステーブルのエンジンを [Null table engine](/engines/table-engines/special/null) に変更できます。OTel collectors は引き続きこのテーブルにデータを送信します。例えばログの場合、`otel_logs` テーブルは次のようになります。

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1))
) ENGINE = Null
```

Null テーブルエンジンは強力な最適化機構であり、`/dev/null` のようなものと考えることができます。このテーブル自体は一切データを保持しませんが、関連付けられたすべての materialized view は、行が破棄される前に挿入された行に対して実行されます。

次のクエリを見てみます。これは行を、保持したい形式に変換します。`LogAttributes` からすべてのカラムを抽出し（これはコレクターが `json_parser` オペレーターを使って設定していると仮定します）、`SeverityText` と `SeverityNumber` を設定します（いくつかの単純な条件と [これらのカラム](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext) の定義に基づきます）。この例では、値が入ることが分かっているカラムだけを選択し、`TraceId`、`SpanId`、`TraceFlags` といったカラムは無視しています。


```sql
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddr,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddr:     54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.027 sec.
```

また、将来的に追加の属性が追加されても SQL で抽出されない場合に備えて、上記で `Body` カラムも抽出しています。このカラムは ClickHouse 上で高い圧縮率が期待でき、アクセス頻度も低いため、クエリ性能への影響はほとんどありません。最後に、Timestamp を DateTime にキャストして縮小します（容量を節約するため - [&quot;Optimizing Types&quot;](#optimizing-types) を参照）。

:::note Conditionals
上記では、`SeverityText` と `SeverityNumber` を抽出するために [conditionals](/sql-reference/functions/conditional-functions) を使用している点に注目してください。これは複雑な条件式を組み立てたり、マップ内で値が設定されているかをチェックしたりする際に非常に有用です。ここでは、`LogAttributes` 内にすべてのキーが存在すると単純に仮定しています。これらの関数にはぜひ慣れ親しんでください。ログパースにおいて、[null values](/sql-reference/functions/functions-for-nulls) を扱う関数と並んで心強い味方になります！
:::

これらの結果を受け取るためのテーブルが必要です。以下のターゲットテーブルは、上記のクエリと一致する構造になっています。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

ここで選択されている型は、[「Optimizing types」](#optimizing-types) で説明している最適化に基づいています。

:::note
スキーマが大きく変化していることに注意してください。実際には、保持しておきたい Trace カラムや、`ResourceAttributes` カラム（通常は Kubernetes のメタデータを含みます）もあるでしょう。Grafana は Trace カラムを利用してログとトレース間のリンク機能を提供できます。詳細は [「Using Grafana」](/observability/grafana) を参照してください。
:::


以下では、`otel_logs` テーブルに対して上記の SELECT を実行し、その結果を `otel_logs_v2` に書き込む materialized view `otel_logs_mv` を作成します。

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

上記は、以下のように可視化されます。

<Image img={observability_11} alt="Otel MV" size="md" />

ここで [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用した collector を再起動すると、`otel_logs_v2` に目的の形式でデータが保存されます。型付き JSON 抽出関数が使われている点に注意してください。

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:      2019-01-22 00:26:14
ServiceName:
Status:         200
RequestProtocol: HTTP/1.1
RunTime:        0
Size:           30577
UserAgent:      Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:        -
RemoteUser:     -
RequestType:    GET
RequestPath:    /filter/27|13 ,27|  5 ,p53
RemoteAddress:  54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.010 sec.
```

`Body` カラムから JSON 関数を用いてカラムを抽出する、同等の materialized view を以下に示します。


```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT  Body, 
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        JSONExtractUInt(Body, 'status') AS Status,
        JSONExtractString(Body, 'request_protocol') AS RequestProtocol,
        JSONExtractUInt(Body, 'run_time') AS RunTime,
        JSONExtractUInt(Body, 'size') AS Size,
        JSONExtractString(Body, 'user_agent') AS UserAgent,
        JSONExtractString(Body, 'referer') AS Referer,
        JSONExtractString(Body, 'remote_user') AS RemoteUser,
        JSONExtractString(Body, 'request_type') AS RequestType,
        JSONExtractString(Body, 'request_path') AS RequestPath,
        JSONExtractString(Body, 'remote_addr') AS remote_addr,
        domain(JSONExtractString(Body, 'referer')) AS RefererDomain,
        path(JSONExtractString(Body, 'request_path')) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```


### 型に注意 {#beware-types}

上記の materialized view は暗黙的な型キャストに依存しています。特に `LogAttributes` マップを使用する場合がそうです。ClickHouse は多くの場合、抽出された値を対象テーブルの型へ透過的にキャストし、必要な記述を減らします。ただし、常に view の `SELECT` 文と、同じスキーマを持つ対象テーブルへの [`INSERT INTO`](/sql-reference/statements/insert-into) 文を組み合わせて view をテストすることを推奨します。これにより、型が正しく扱われていることを確認できます。特に次のケースに注意してください:

- マップ内にキーが存在しない場合、空文字列が返されます。数値型の場合は、これらを適切な値にマッピングする必要があります。これは [conditionals](/sql-reference/functions/conditional-functions)（例: `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`）や、デフォルト値で問題ない場合は [cast functions](/sql-reference/functions/type-conversion-functions)（例: `toUInt8OrDefault(LogAttributes['status'] )`）を使用することで実現できます。
- 一部の型は常にキャストされるとは限りません。例: 数値の文字列表現は enum 値にはキャストされません。
- JSON 抽出関数は、値が見つからない場合、その型に応じたデフォルト値を返します。これらの値が妥当かどうかを必ず確認してください。

:::note Nullable を避ける
ClickHouse でオブザーバビリティデータに [Nullable](/sql-reference/data-types/nullable) を使用することは避けてください。ログやトレースにおいて、空と null を区別する必要があるケースはまれです。この機能は追加のストレージオーバーヘッドを発生させ、クエリ性能に悪影響を与えます。詳細は[こちら](/data-modeling/schema-design#optimizing-types)を参照してください。
:::

## プライマリ（ソート）キーの選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出したら、ソートキー／プライマリキーの最適化を開始できます。

ソートキーを選択する際には、いくつかの簡単なルールを適用できます。以下のルール同士が衝突する場合もあるため、記載順に検討してください。このプロセスから複数のキー候補を特定できますが、通常は 4〜5 個あれば十分です。

1. よく使うフィルタやアクセスパターンと整合するカラムを選択します。通常、特定のカラム（例: ポッド名）でフィルタしてオブザーバビリティの調査を開始する場合、そのカラムは `WHERE` 句で頻繁に使用されます。使用頻度の低いカラムよりも、こうしたカラムをキーに含めることを優先してください。
2. フィルタしたときに全体の行の大部分を除外できるカラムを優先します。これにより、読み取る必要のあるデータ量を削減できます。サービス名やステータスコードは多くの場合有力な候補です。ただし後者については、大半の行を除外する値でフィルタする場合に限ります。例えば、多くのシステムでは 200 番台でフィルタするとほとんどの行にマッチしますが、500 エラーでフィルタすると小さなサブセットのみが対象になります。
3. テーブル内の他のカラムと高い相関が見込めるカラムを優先します。これにより、それらの値も連続して格納されやすくなり、圧縮効率が向上します。
4. ソートキーに含まれるカラムに対する `GROUP BY` や `ORDER BY` 演算は、メモリ効率を高めることができます。

<br />

ソートキー用のカラムのサブセットを特定したら、それらを特定の順序で宣言する必要があります。この順序は、クエリでソートキー内の後続カラムをフィルタする際の効率と、テーブルのデータファイルの圧縮率の両方に大きな影響を与える可能性があります。一般的には、**カーディナリティの昇順でキーを並べるのが最善**です。ただし、ソートキー内で後ろに配置されたカラムでのフィルタリングは、先頭付近に配置されたカラムでのフィルタリングより効率が低くなることとのバランスを取る必要があります。これらの振る舞いを踏まえつつ、アクセスパターンを考慮してください。最も重要なのは、異なるパターンを実際にテストしてみることです。ソートキーの理解とその最適化方法について詳しくは、[こちらの記事](/guides/best-practices/sparse-primary-indexes)を参照してください。

:::note Structure first
ログの構造化が完了してからソートキーを決定することを推奨します。属性マップ内のキーや JSON 抽出式をソートキーとして使用しないでください。ソートキーに含めるカラムは必ずテーブル内のルートレベルのカラムとして定義されていることを確認してください。
:::

## マップの使用 {#using-maps}

前の例では、`Map(String, String)` カラム内の値にアクセスするために、`map['key']` というマップ構文を使用する方法を示しました。ネストされたキーにアクセスするためにマップ記法を使えるだけでなく、これらのカラムをフィルタリングまたは抽出するための、ClickHouse 専用の [map 関数](/sql-reference/functions/tuple-map-functions#mapkeys) も利用できます。

たとえば、次のクエリは、[`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) と、それに続く [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を使用して、`LogAttributes` カラムで利用可能なすべての一意なキーを特定します。

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

Row 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1 row in set. Elapsed: 1.139 sec. Processed 5.63 million rows, 2.53 GB (4.94 million rows/s., 2.22 GB/s.)
Peak memory usage: 71.90 MiB.
```

:::note ドットの使用を避ける
Map カラム名にドットを使うことは推奨しておらず、今後廃止される可能性があります。代わりに `_` を使用してください。
:::


## エイリアスの使用 {#using-aliases}

map 型へのクエリは、通常のカラムへのクエリよりも遅くなります。 [&quot;Accelerating queries&quot;](#accelerating-queries) を参照してください。加えて、構文もより複雑になり、記述が煩雑になる場合があります。後者の問題に対処するため、ALIAS カラムの使用を推奨します。

ALIAS カラムはクエリ実行時に計算され、テーブルには保存されません。したがって、この型のカラムに値を INSERT することはできません。エイリアスを使用することで、map のキーを参照しつつ構文を簡略化し、map のエントリを通常のカラムとして透過的に扱えるようになります。次の例を考えてみましょう。

```sql
CREATE TABLE otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `RequestPath` String MATERIALIZED path(LogAttributes['request_path']),
        `RequestType` LowCardinality(String) MATERIALIZED LogAttributes['request_type'],
        `RefererDomain` String MATERIALIZED domain(LogAttributes['referer']),
        `RemoteAddr` IPv4 ALIAS LogAttributes['remote_addr']
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, Timestamp)
```

いくつかのマテリアライズドカラムと、マップ `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` を定義しています。これにより、このカラム経由で `LogAttributes['remote_addr']` の値をクエリできるようになり、クエリを簡潔にできます。つまり、

```sql
SELECT RemoteAddr
FROM default.otel_logs
LIMIT 5

┌─RemoteAddr────┐
│ 54.36.149.41  │
│ 31.56.96.51   │
│ 31.56.96.51   │
│ 40.77.167.129 │
│ 91.99.72.15   │
└───────────────┘

5 rows in set. Elapsed: 0.011 sec.
```

さらに、`ALIAS` は `ALTER TABLE` コマンドで簡単に追加できます。これらのカラムはたとえば次のようにすぐに利用できます。

```sql
ALTER TABLE default.otel_logs
        (ADD COLUMN `Size` String ALIAS LogAttributes['size'])

SELECT Size
FROM default.otel_logs_v3
LIMIT 5

┌─Size──┐
│ 30577 │
│ 5667  │
│ 5379  │
│ 1696  │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.014 sec.
```

:::note デフォルトでは ALIAS が除外される
デフォルトでは、`SELECT *` は ALIAS カラムを除外します。この挙動は、`asterisk_include_alias_columns=1` を設定することで無効化できます。
:::


## 型の最適化 {#optimizing-types}

型の最適化に関する [一般的な ClickHouse のベストプラクティス](/data-modeling/schema-design#optimizing-types) は、本節で扱う ClickHouse のユースケースにもそのまま適用できます。

## コーデックの使用 {#using-codecs}

型の最適化に加えて、ClickHouse Observability スキーマで圧縮を最適化しようとする場合は、[コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)に従うことができます。

一般的に、`ZSTD` コーデックはログおよびトレースのデータセットに対して非常に適しています。デフォルト値である 1 から圧縮レベルを上げることで圧縮率が向上する可能性があります。ただし、この値を高くすると挿入時の CPU オーバーヘッドが大きくなるため、必ず検証する必要があります。通常、この値を上げても得られるメリットはほとんどありません。

さらに、タイムスタンプは圧縮の観点からはデルタエンコーディングの恩恵を受けますが、このカラムがプライマリキーや ORDER BY キーに使用されている場合、クエリ性能の低下を引き起こすことが示されています。圧縮率とクエリ性能のトレードオフを評価することを推奨します。

## Dictionary の利用 {#using-dictionaries}

[Dictionaries](/sql-reference/dictionaries) は、ClickHouse の[重要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)であり、さまざまな内部および外部の[ソース](/sql-reference/dictionaries#dictionary-sources)からのデータをインメモリの [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式で表現し、超低レイテンシーなルックアップクエリ向けに最適化します。

<Image img={observability_12} alt="オブザーバビリティと Dictionary" size="md"/>

これは、インジェスト処理を低速化させることなく取り込んだデータをオンザフライでエンリッチしたり、クエリ全般、とりわけ JOIN のパフォーマンスを向上させたりするなど、さまざまなシナリオで有用です。
オブザーバビリティのユースケースでは JOIN が必要となる場面はまれですが、Dictionary はデータ挿入時とクエリ実行時のどちらにおいても、エンリッチ目的で有効に活用できます。以下にそれぞれの例を示します。

:::note Accelerating joins
Dictionary を用いて JOIN を高速化したいユーザーは、[こちら](/dictionary)で詳細を確認できます。
:::

### 挿入時とクエリ時の比較 {#insert-time-vs-query-time}

Dictionary は、データセットを挿入時またはクエリ時にエンリッチするために使用できます。どちらのアプローチにも、それぞれ利点と欠点があります。概要は次のとおりです。

- **挿入時** - エンリッチに使用する値が変化せず、Dictionary を埋めるために利用可能な外部ソースに存在する場合に、一般的に適しています。この場合、挿入時に行をエンリッチしておくことで、クエリ時に Dictionary を参照する必要がなくなります。その代償として、挿入パフォーマンスの低下とストレージのオーバーヘッドが発生します。これは、エンリッチされた値がカラムとして保存されるためです。
- **クエリ時** - Dictionary 内の値が頻繁に変化する場合は、クエリ時のルックアップの方が適していることが多いです。これにより、マッピングされた値が変更された際にカラムを更新（およびデータを書き換え）する必要がなくなります。この柔軟性は、クエリ時のルックアップコストという代償を伴います。クエリ時コストは、多数の行に対してルックアップが必要な場合、例えばフィルタ句で Dictionary ルックアップを使用する場合には、通常は無視できないものとなります。一方で、`SELECT` における結果のエンリッチに使用する場合、このオーバーヘッドは通常それほど問題になりません。

まずは Dictionary の基本に慣れておくことを推奨します。Dictionary は、専用の[特化関数](/sql-reference/functions/ext-dict-functions#dictGetAll)を使用して値を取得できる、インメモリのルックアップテーブルを提供します。

単純なエンリッチの例については、Dictionary に関するガイドを[こちら](/dictionary)で参照してください。以下では、一般的なオブザーバビリティ向けのエンリッチタスクに焦点を当てます。

### IP Dictionary の使用 {#using-ip-dictionaries}

IP アドレスを使って緯度・経度の情報でログやトレースをジオ情報として拡張することは、一般的なオブザーバビリティ要件です。これは `ip_trie` 構造の Dictionary を使用することで実現できます。

ここでは、[DB-IP.com](https://db-ip.com/) が提供し、[CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/) の条件で公開されている [DB-IP city-level dataset](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を利用します。

[README](https://github.com/sapics/ip-location-db#csv-format) から、このデータは次のような構造になっていることがわかります。

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構成を踏まえて、まずは [url()](/sql-reference/table-functions/url) テーブル関数でデータを少し覗いてみましょう。

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n           \tip_range_start IPv4, \n       \tip_range_end IPv4, \n         \tcountry_code Nullable(String), \n     \tstate1 Nullable(String), \n           \tstate2 Nullable(String), \n           \tcity Nullable(String), \n     \tpostcode Nullable(String), \n         \tlatitude Float64, \n          \tlongitude Float64, \n         \ttimezone Nullable(String)\n   \t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:         Queensland
state2:         ᴺᵁᴸᴸ
city:           South Brisbane
postcode:       ᴺᵁᴸᴸ
latitude:       -27.4767
longitude:      153.017
timezone:       ᴺᵁᴸᴸ
```

作業を簡単にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使用してフィールド名を定義した ClickHouse のテーブルオブジェクトを作成し、総行数を確認しましょう。

```sql
CREATE TABLE geoip_url(
        ip_range_start IPv4,
        ip_range_end IPv4,
        country_code Nullable(String),
        state1 Nullable(String),
        state2 Nullable(String),
        city Nullable(String),
        postcode Nullable(String),
        latitude Float64,
        longitude Float64,
        timezone Nullable(String)
) ENGINE=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

`ip_trie` Dictionary では IP アドレス範囲を CIDR 表記で指定する必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲の CIDR は、次のクエリで簡単に求められます。

```sql
WITH
        bitXor(ip_range_start, ip_range_end) AS xor,
        if(xor != 0, ceil(log2(xor)), 0) AS unmatched,
        32 - unmatched AS cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) AS cidr_address
SELECT
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) AS cidr    
FROM
        geoip_url
LIMIT 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 rows in set. Elapsed: 0.259 sec.
```


:::note
上記のクエリでは多くの処理が行われています。詳細に興味がある方は、この優れた[解説](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を参照してください。そうでなければ、上記のクエリが IP レンジに対して CIDR を計算しているものとして受け入れてください。
:::

ここでの目的では、IP レンジ、国コード、および座標だけが必要なので、新しいテーブルを作成し、Geo IP データを挿入します。

```sql
CREATE TABLE geoip
(
        `cidr` String,
        `latitude` Float64,
        `longitude` Float64,
        `country_code` String
)
ENGINE = MergeTree
ORDER BY cidr

INSERT INTO geoip
WITH
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
SELECT
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr,
        latitude,
        longitude,
        country_code    
FROM geoip_url
```

ClickHouse で低レイテンシな IP ルックアップを行うために、GeoIP データのキーから属性へのマッピングをインメモリで保持する Dictionary を利用します。ClickHouse は、ネットワークプレフィックス（CIDR ブロック）を座標や国コードにマッピングするための `ip_trie` [dictionary structure](/sql-reference/dictionaries#ip_trie) を提供しています。次のクエリでは、このレイアウトを用い、上記のテーブルをソースとする Dictionary を定義します。

```sql
CREATE DICTIONARY ip_trie (
   cidr String,
   latitude Float64,
   longitude Float64,
   country_code String
)
primary key cidr
source(clickhouse(table 'geoip'))
layout(ip_trie)
lifetime(3600);
```

Dictionary から行を選択し、このデータセットがルックアップに利用できることを確認します。

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note 定期的な更新
ClickHouse の Dictionary は、基盤となるテーブルデータと、上で使用した lifetime 句に基づいて定期的に更新されます。DB-IP データセットの最新の変更内容を Geo IP Dictionary に反映するには、変換を適用したうえで、`geoip_url` リモートテーブルから `geoip` テーブルへデータを再挿入するだけです。
:::

`ip_trie` Dictionary（便宜上、名前も `ip_trie` としています）に Geo IP データをロードできたので、これを IP ジオロケーションに利用できます。これは、[`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を次のように使用することで実現できます。

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ここでの取得速度に注目してください。これによりログをエンリッチできます。このケースでは、**クエリ実行時のエンリッチメントを行う**ことにします。

元のログデータセットに戻ると、上記を利用して国別にログを集計できます。以下では、先ほどの materialized view によって `RemoteAddress` カラムが抽出済みのスキーマを利用していることを前提とします。


```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
        formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR      │ 7.36 million    │
│ US      │ 1.67 million    │
│ AE      │ 526.74 thousand │
│ DE      │ 159.35 thousand │
│ FR      │ 109.82 thousand │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

IP アドレスから地理的位置へのマッピングは変更される可能性があるため、ユーザーは同じアドレスの現在の地理的位置ではなく、リクエストが行われた時点でどこから送信されたのかを知りたいと考えるでしょう。このため、このケースではインデックス時のエンリッチメントが好まれる傾向があります。これは、以下に示すように materialized カラムを使用するか、materialized view の SELECT 句内で実行できます。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        `Country` String MATERIALIZED dictGet('ip_trie', 'country_code', tuple(RemoteAddress)),
        `Latitude` Float32 MATERIALIZED dictGet('ip_trie', 'latitude', tuple(RemoteAddress)),
        `Longitude` Float32 MATERIALIZED dictGet('ip_trie', 'longitude', tuple(RemoteAddress))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note 定期的な更新
ユーザーは、新しいデータに基づいて IP エンリッチメント用 Dictionary を定期的に更新したいと考える可能性があります。これは、Dictionary の `LIFETIME` 句を使用することで実現できます。この句により、Dictionary は背後のテーブルから定期的に再読み込みされます。背後のテーブルを更新する方法については、[「Refreshable Materialized views」](/materialized-view/refreshable-materialized-view) を参照してください。
:::

上記の国情報と座標は、単に国ごとのグルーピングやフィルタリングにとどまらず、より高度な可視化も可能にします。参考として、[「Visualizing geo data」](/observability/grafana#visualizing-geo-data) を参照してください。


### 正規表現 Dictionary の利用（ユーザーエージェントのパース） {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent)のパースは、古典的な正規表現の問題であり、ログやトレースベースのデータセットで一般的に求められる処理です。ClickHouse は、Regular Expression Tree Dictionaries を用いることで、ユーザーエージェントを効率的にパースできます。

Regular Expression Tree Dictionaries は、ClickHouse オープンソース版では `YAMLRegExpTree` Dictionary ソースタイプを使って定義します。このソースタイプでは、正規表現ツリーを含む YAML ファイルへのパスを指定します。独自の正規表現 Dictionary を用意したい場合は、必要な構造の詳細が[こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)に記載されています。以下では、[uap-core](https://github.com/ua-parser/uap-core) を使ったユーザーエージェントのパースに焦点を当て、サポートされている CSV 形式に Dictionary をロードします。このアプローチは OSS と ClickHouse Cloud の両方で利用可能です。

:::note
以下の例では、2024 年 6 月時点の最新版 uap-core に含まれるユーザーエージェント解析用正規表現のスナップショットを使用しています。最新のファイル（不定期に更新されます）は[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)から取得できます。下記の CSV ファイルにロードする手順は[こちら](/sql-reference/dictionaries#collecting-attribute-values)を参照してください。
:::

次の Memory テーブルを作成します。これらはデバイス、ブラウザ、オペレーティングシステムをパースするための正規表現を保持します。

```sql
CREATE TABLE regexp_os
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_browser
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;

CREATE TABLE regexp_device
(
        id UInt64,
        parent_id UInt64,
        regexp String,
        keys   Array(String),
        values Array(String)
) ENGINE=Memory;
```

これらのテーブルには、`url` テーブル関数を用いて、以下の公開されている CSV ファイルからデータを投入できます。

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルにデータが投入されたら、正規表現辞書を読み込むことができます。キーとなる値はカラムとして指定する必要がある点に注意してください。これらが、ユーザーエージェントから抽出できる属性になります。

```sql
CREATE DICTIONARY regexp_os_dict
(
        regexp String,
        os_replacement String default 'Other',
        os_v1_replacement String default '0',
        os_v2_replacement String default '0',
        os_v3_replacement String default '0',
        os_v4_replacement String default '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);

CREATE DICTIONARY regexp_device_dict
(
        regexp String,
        device_replacement String default 'Other',
        brand_replacement String,
        model_replacement String
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_device'))
LIFETIME(0)
LAYOUT(regexp_tree);

CREATE DICTIONARY regexp_browser_dict
(
        regexp String,
        family_replacement String default 'Other',
        v1_replacement String default '0',
        v2_replacement String default '0'
)
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_browser'))
LIFETIME(0)
LAYOUT(regexp_tree);
```

これらの Dictionary を読み込んだので、サンプルの user-agent を渡して、新しい Dictionary の抽出機能をテストしてみましょう。


```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ユーザーエージェントに関するルールが変更されることは稀であり、Dictionary の更新も新しいブラウザ、オペレーティングシステム、デバイスが登場したときだけでよいことから、この抽出処理はデータの挿入時に実行するのが理にかなっています。

この処理は、materialized column を使っても、materialized view を使っても実現できます。以下では、先ほど使用した materialized view を修正します。

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2
AS SELECT
        Body,
        CAST(Timestamp, 'DateTime') AS Timestamp,
        ServiceName,
        LogAttributes['status'] AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(CAST(Status, 'UInt64') > 500, 'CRITICAL', CAST(Status, 'UInt64') > 400, 'ERROR', CAST(Status, 'UInt64') > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(CAST(Status, 'UInt64') > 500, 20, CAST(Status, 'UInt64') > 400, 17, CAST(Status, 'UInt64') > 300, 13, 9) AS SeverityNumber,
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), UserAgent) AS Device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), UserAgent) AS Browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), UserAgent) AS Os
FROM otel_logs
```

そのためには、対象テーブル `otel_logs_v2` のスキーマを変更する必要があります。

```sql
CREATE TABLE default.otel_logs_v2
(
 `Body` String,
 `Timestamp` DateTime,
 `ServiceName` LowCardinality(String),
 `Status` UInt8,
 `RequestProtocol` LowCardinality(String),
 `RunTime` UInt32,
 `Size` UInt32,
 `UserAgent` String,
 `Referer` String,
 `RemoteUser` String,
 `RequestType` LowCardinality(String),
 `RequestPath` String,
 `remote_addr` IPv4,
 `RefererDomain` String,
 `RequestPage` String,
 `SeverityText` LowCardinality(String),
 `SeverityNumber` UInt8,
 `Device` Tuple(device_replacement LowCardinality(String), brand_replacement LowCardinality(String), model_replacement LowCardinality(String)),
 `Browser` Tuple(family_replacement LowCardinality(String), v1_replacement LowCardinality(String), v2_replacement LowCardinality(String)),
 `Os` Tuple(os_replacement LowCardinality(String), os_v1_replacement LowCardinality(String), os_v2_replacement LowCardinality(String), os_v3_replacement LowCardinality(String))
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp, Status)
```

コレクターを再起動し、前の手順で説明したとおりに構造化ログを取り込んだ後、新たに抽出された Device、Browser、OS カラムに対してクエリを実行できます。


```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:     ('Other','0','0','0')
```

:::note 複雑な構造のための Tuples
これらのユーザーエージェント用カラムでの Tuples の使用に注目してください。Tuples は、階層が事前に分かっている複雑な構造に適しています。サブカラムは、Map のキーとは異なり、異種の型を扱いつつも、通常のカラムと同等のパフォーマンスを発揮します。
:::


### 参考資料 {#further-reading}

Dictionary のさらなる例や詳細については、次の記事を参照することを推奨します。

- [Dictionary の高度なトピック](/dictionary#advanced-dictionary-topics)
- [「Using Dictionaries to Accelerate Queries」](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [Dictionaries](/sql-reference/dictionaries)

## クエリの高速化 {#accelerating-queries}

ClickHouse には、クエリ性能を高めるためのさまざまな手法が用意されています。これらは、最も一般的なアクセスパターンに最適化し、かつ圧縮率を最大化できる適切な primary／ordering key をまず選定したうえで、その後に検討してください。通常、このようなキー設計が、最小の労力で最大のパフォーマンス向上につながります。

### 集約処理のために Materialized views（インクリメンタル）を使用する {#using-materialized-views-incremental-for-aggregations}

これまでのセクションでは、データ変換とフィルタリングのために Materialized views を利用する方法について説明しました。Materialized views は、挿入時に集約をあらかじめ計算し、その結果を保存するためにも使用できます。この結果は、その後の挿入の結果で更新できるため、事実上、集約処理を挿入時に事前計算できるようになります。

ここでの主な考え方は、結果がしばしば元データよりも小さい表現（集約の場合はスケッチのような要約構造）になるという点です。対象テーブルから結果を読み出すための、より単純なクエリと組み合わせることで、同じ計算を元データに対して実行する場合と比べて、クエリの処理時間を短縮できます。

次のクエリを考えてみます。ここでは、構造化ログを用いて 1 時間あたりのトラフィック合計を計算します。

```sql
SELECT toStartOfHour(Timestamp) AS Hour,
        sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.666 sec. Processed 10.37 million rows, 4.73 GB (15.56 million rows/s., 7.10 GB/s.)
Peak memory usage: 1.40 MiB.
```

Grafana を使ってユーザーがよくプロットする折れ線グラフを想像してみてください。このクエリは正直なところ非常に高速です — データセットは 1,000 万行しかなく、ClickHouse は高速です！ しかし、これが数十億・数兆行の規模にスケールした場合でも、このクエリ性能を維持し続けたいところです。

:::note
このクエリは、`LogAttributes` マップから size キーを抽出する、先ほどの materialized view の結果である `otel_logs_v2` テーブルを使えば 10 倍高速になります。ここでは説明のために生データを使用しており、このクエリがよく実行されるクエリである場合は先ほどの view を使用することを推奨します。
:::

Materialized view を使ってインサート時にこれを計算したい場合、その結果を受け取るテーブルが必要です。このテーブルは 1 時間あたり 1 行のみ保持する必要があります。既存の時間に対する更新を受け取った場合、他のカラムは既存のその時間の行にマージされる必要があります。この増分状態のマージを行うには、他のカラムについて部分的な状態を保存しなければなりません。

これには ClickHouse で特別なエンジンタイプが必要です: SummingMergeTree です。これは、同じソートキーを持つすべての行を、数値カラムについて合計値を含む 1 行に置き換えます。次のテーブルは、同じ日付を持つ任意の行をマージし、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

materialized view の動作を説明するために、`bytes_per_hour` テーブルが空で、まだデータを受信していないと仮定します。materialized view は、`otel_logs` に挿入されたデータに対して上記の `SELECT` を実行し（これは設定されたサイズのブロック単位で実行されます）、その結果を `bytes_per_hour` に書き込みます。構文は以下のとおりです。

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの `TO` 句が重要であり、結果の送信先、つまり `bytes_per_hour` を指定しています。

OTel collector を再起動してログを再送すると、`bytes_per_hour` テーブルは上記クエリ結果で段階的に蓄積されていきます。処理が完了したら、`bytes_per_hour` のサイズを確認できます。1時間あたり1行になっているはずです。

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```


ここでは、クエリの結果を保存することで、`otel_logs` の 1,000 万行から 113 行まで効果的に行数を削減しました。ここでのポイントは、新しいログが `otel_logs` テーブルに追加されると、それぞれの時間に対応する新しい値が `bytes_per_hour` に送られ、バックグラウンドで非同期に自動マージされるという点です。1 時間あたり 1 行のみを保持することで、`bytes_per_hour` は常に小さく、かつ最新の状態に保たれます。

行のマージは非同期であるため、ユーザーがクエリを実行したときに 1 時間あたり複数の行が存在する場合があります。クエリ時に未マージの行がすべてマージされるようにするには、次の 2 つのオプションがあります。

* テーブル名に [`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier) を使用する（上記の COUNT クエリで行った方法）。
* 最終的なテーブルで使用しているソートキー、すなわち Timestamp で集約し、メトリクスを合計する。

一般的に、2 番目のオプションの方が効率的かつ柔軟です（テーブルを他の用途にも使用できるため）が、一部のクエリについては 1 番目の方法の方がより単純です。以下に両方の方法を示します。

```sql
SELECT
        Hour,
        sum(TotalBytes) AS TotalBytes
FROM bytes_per_hour
GROUP BY Hour
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.008 sec.

SELECT
        Hour,
        TotalBytes
FROM bytes_per_hour
FINAL
ORDER BY Hour DESC
LIMIT 5

┌────────────────Hour─┬─TotalBytes─┐
│ 2019-01-26 16:00:00 │ 1661716343 │
│ 2019-01-26 15:00:00 │ 1824015281 │
│ 2019-01-26 14:00:00 │ 1506284139 │
│ 2019-01-26 13:00:00 │ 1580955392 │
│ 2019-01-26 12:00:00 │ 1736840933 │
└─────────────────────┴────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

これにより、クエリ処理時間は 0.6 秒から 0.008 秒に短縮され、75 倍以上高速になりました。

:::note
この効果は、より大きなデータセットやより複雑なクエリではさらに大きくなり得ます。サンプルについては[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::


#### さらに複雑な例 {#a-more-complex-example}

上記の例では、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) を使って、1 時間ごとの単純な件数を集計しました。単純な合計以上の統計量を計算するには、別のターゲットテーブルエンジンが必要です。それが [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) です。

1 日あたりのユニークな IP アドレス数（あるいはユニークユーザー数）を計算したいとします。このためのクエリは次のようになります。

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.667 sec. Processed 10.37 million rows, 4.73 GB (15.53 million rows/s., 7.09 GB/s.)
```

カーディナリティカウントを増分更新しつつ永続化するには、AggregatingMergeTree が必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

集約状態が保存されることを ClickHouse に認識させるために、`UniqueUsers` カラムを [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 型として定義し、部分状態の元となる集約関数（uniq）と、ソースカラムの型（IPv4）を指定します。SummingMergeTree と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では Hour）。

関連する materialized view では、先ほどのクエリを使用します。

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数の末尾にサフィックスとして `State` を付けている点に注目してください。これにより、最終結果ではなく関数の集約状態が返されます。この集約状態には、この部分状態を他の状態とマージできるようにするための追加情報が含まれます。

Collector を再起動してデータを再読み込みしたら、`unique_visitors_per_hour` テーブルに 113 行が利用可能になっていることを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

最終的なクエリでは、カラムに部分集約状態が保存されているため、関数には Merge サフィックスを付けて使用する必要があります。

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.027 sec.
```

ここでは `FINAL` ではなく `GROUP BY` を使用している点に注意してください。


### Materialized view（インクリメンタル）を用いた高速ルックアップ {#using-materialized-views-incremental--for-fast-lookups}

ClickHouse の ordering key を選択する際には、フィルタおよび集約句で頻繁に使用されるカラムに合わせて、アクセスパターンを考慮する必要があります。これは、ユーザーのアクセスパターンがより多様で、単一のカラム集合に落とし込むことができないことが多いオブザーバビリティのユースケースでは制約となり得ます。これについては、デフォルトの OTel スキーマに組み込まれている例を用いると最もわかりやすいでしょう。トレース用のデフォルトスキーマを考えてみましょう。

```sql
CREATE TABLE otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
```

このスキーマは、`ServiceName`、`SpanName`、`Timestamp` によるフィルタリングに最適化されています。トレースでは、特定の `TraceId` で検索し、関連するトレースの span を取得できることも必要です。`TraceId` は並び替えキーに含まれていますが、末尾にあるため、[フィルタリング効率が低下し](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)、単一のトレースを取得する際に大量のデータをスキャンする必要が生じる可能性が高くなります。

OTel collector は、この課題に対応するために materialized view とそれに対応するテーブルもインストールします。テーブルと view を以下に示します。

```sql
CREATE TABLE otel_traces_trace_id_ts
(
        `TraceId` String CODEC(ZSTD(1)),
        `Start` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `End` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.01) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (TraceId, toUnixTimestamp(Start))

CREATE MATERIALIZED VIEW otel_traces_trace_id_ts_mv TO otel_traces_trace_id_ts
(
        `TraceId` String,
        `Start` DateTime64(9),
        `End` DateTime64(9)
)
AS SELECT
        TraceId,
        min(Timestamp) AS Start,
        max(Timestamp) AS End
FROM otel_traces
WHERE TraceId != ''
GROUP BY TraceId
```


このビューにより、テーブル `otel_traces_trace_id_ts` には各トレースの最小および最大のタイムスタンプが確実に保持されます。このテーブルは `TraceId` でソートされているため、これらのタイムスタンプを効率的に取得できます。さらに、これらのタイムスタンプ範囲は、メインの `otel_traces` テーブルに対してクエリを実行する際に利用できます。より具体的には、トレース ID でトレースを取得する場合、Grafana は次のクエリを実行します。

```sql
WITH 'ae9226c78d1d360601e6383928e4d22d' AS trace_id,
        (
        SELECT min(Start)
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_start,
        (
        SELECT max(End) + 1
          FROM default.otel_traces_trace_id_ts
          WHERE TraceId = trace_id
        ) AS trace_end
SELECT
        TraceId AS traceID,
        SpanId AS spanID,
        ParentSpanId AS parentSpanID,
        ServiceName AS serviceName,
        SpanName AS operationName,
        Timestamp AS startTime,
        Duration * 0.000001 AS duration,
        arrayMap(key -> map('key', key, 'value', SpanAttributes[key]), mapKeys(SpanAttributes)) AS tags,
        arrayMap(key -> map('key', key, 'value', ResourceAttributes[key]), mapKeys(ResourceAttributes)) AS serviceTags
FROM otel_traces
WHERE (traceID = trace_id) AND (startTime >= trace_start) AND (startTime <= trace_end)
LIMIT 1000
```

ここでの CTE は、トレース ID `ae9226c78d1d360601e6383928e4d22d` に対して最小および最大の timestamp を特定し、その後これを用いて、関連する span を取得するためにメインの `otel_traces` をフィルタリングします。

同様の手法は、似たようなアクセスパターンにも適用できます。データモデリングにおける類似の例については、[こちら](/materialized-view/incremental-materialized-view#lookup-table)で紹介しています。


### プロジェクションの使用 {#using-projections}

ClickHouseのプロジェクションを使用すると、1つのテーブルに対して複数の`ORDER BY`句を指定できます。

前のセクションでは、ClickHouseでmaterialized viewを使用して集計の事前計算、行の変換、および異なるアクセスパターンに対するオブザーバビリティクエリの最適化を行う方法について説明しました。

トレースIDによる検索を最適化するため、materialized viewが挿入を受け取る元のテーブルとは異なる順序キーを持つターゲットテーブルに行を送信する例を示しました。

プロジェクションを使用することで同じ問題に対処でき、プライマリキーに含まれないカラムに対するクエリを最適化することが可能です。

理論上、この機能を使用することで、テーブルに複数の順序キーを提供できますが、明確な欠点が1つあります。それはデータの重複です。具体的には、各プロジェクションに指定された順序に加えて、メインのプライマリキーの順序でもデータを書き込む必要があります。これにより、挿入処理が遅くなり、ディスク容量の消費量が増加します。

:::note PROJECTIONとmaterialized viewの比較
PROJECTIONはmaterialized viewと同様の機能を多く提供しますが、一般的にはmaterialized viewの使用が推奨されるため、PROJECTIONは慎重に使用する必要があります。それぞれの欠点と適切な使用場面を理解しておく必要があります。例えば、PROJECTIONは集計の事前計算に使用できますが、この用途にはmaterialized viewの使用を推奨します。
:::

<Image img={observability_13} alt="オブザーバビリティとプロジェクション" size="md" />

以下のクエリは、`otel_logs_v2` テーブルを 500 エラーコードでフィルタリングします。これは、エラーコードでフィルタリングを行う際の一般的なアクセスパターンです。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note パフォーマンス測定にはNullを使用
ここでは`FORMAT Null`を使用して結果を出力していません。これにより、すべての結果が読み取られますが返されないため、LIMITによるクエリの早期終了を防ぎます。これは全1000万行のスキャンにかかる時間を示すためです。
:::

上記のクエリでは、選択したソートキー `(ServiceName, Timestamp)` による線形スキャンが必要です。ソートキーの末尾に `Status` を追加することで上記のクエリのパフォーマンスを向上させることができますが、PROJECTIONを追加する方法もあります。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

まず PROJECTION を作成し、次にそれをマテリアライズする必要があります。このマテリアライズコマンドにより、データは2つの異なる順序でディスク上に2回保存されます。PROJECTION は、以下に示すように、テーブル作成時に定義することもでき、データ挿入時に自動的に維持されます。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        PROJECTION status
        (
           SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
           ORDER BY Status
        )
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

重要な点として、プロジェクションが`ALTER`を介して作成される場合、`MATERIALIZE PROJECTION`コマンドが発行されると、その作成は非同期で実行されます。この操作の進行状況は、以下のクエリで確認でき、`is_done=1`になるまで待機してください。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを再実行すると、追加のストレージを代償としてパフォーマンスが大幅に向上していることが確認できます（測定方法については[&quot;テーブルサイズと圧縮の測定&quot;](#measuring-table-size--compression)を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、前のクエリで使用したカラムを PROJECTION 内で指定しています。これにより、指定したこれらのカラムだけが、Status で並べ替えられた PROJECTION の一部としてディスク上に保存されます。代わりにここで `SELECT *` を使用した場合は、すべてのカラムが保存されます。これは、任意のカラムの組み合わせを使う、より多くのクエリが PROJECTION の恩恵を受けられる一方で、追加のストレージ容量が必要になることを意味します。ディスク容量と圧縮率の測定については、[&quot;Measuring table size &amp; compression&quot;](#measuring-table-size--compression) を参照してください。


### セカンダリ / データスキッピング・インデックス {#secondarydata-skipping-indices}

ClickHouse でどれだけプライマリキーをチューニングしても、一部のクエリではフルスキャンが必然的に発生します。これを軽減するために Materialized views（および一部のクエリに対するプロジェクション）を使うこともできますが、これらは追加のメンテナンスが必要であり、さらにユーザーがそれらの存在を把握したうえで、それを前提にクエリを書く必要があります。従来のリレーショナルデータベースではセカンダリインデックスでこれを解決しますが、ClickHouse のようなカラム指向データベースではこれは効果的ではありません。その代わり、ClickHouse は「スキップインデックス」を使用し、一致する値が存在しない大きなデータ chunk をスキップできるようにすることで、クエリ性能を大きく向上させることができます。

デフォルトの OTel スキーマは、map 型フィールドへのアクセスを高速化しようとしてセカンダリインデックスを使用しています。これらは一般的には効果が低く、カスタムスキーマにそのままコピーすることは推奨しませんが、スキッピングインデックス自体は依然として有用な場合があります。

適用を試みる前に、必ず [セカンダリインデックスに関するガイド](/optimize/skipping-indexes) を読み、理解してください。

**一般的に、プライマリキーと対象となる非プライマリカラム / 式の間に強い相関があり、かつユーザーが希少な値（多くのグラニュールには出現しない値）を検索している場合に効果的です。**

### テキスト検索用のBloomフィルタ {#bloom-filters-for-text-search}

オブザーバビリティクエリにおいて、テキスト検索を実行する必要がある場合、セカンダリ索引が有用です。 具体的には、ngramおよびトークンベースのブルームフィルタ索引である[`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types)と[`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types)を使用することで、`LIKE`、`IN`、hasToken演算子を用いたStringカラムに対する検索を高速化できます。 重要な点として、トークンベース索引は英数字以外の文字を区切り文字として使用してトークンを生成します。 これは、クエリ実行時にはトークン(または単語全体)のみがマッチング対象となることを意味します。 より細かい粒度でのマッチングが必要な場合は、[N-gramブルームフィルタ](/optimize/skipping-indexes#bloom-filter-types)を使用できます。 これは文字列を指定されたサイズのngramに分割することで、単語内の部分マッチングを可能にします。

生成されマッチングされるトークンを評価するには、`tokens`関数を使用します:

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram`関数も同様の機能を提供します。第2パラメータで`ngram`のサイズを指定できます:

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 転置索引
ClickHouseはセカンダリ索引として転置索引の実験的サポートを提供しています。現時点ではログデータセットでの使用を推奨していませんが、本番環境で利用可能になった際にはトークンベースのブルームフィルタに取って代わると想定しています。
:::

この例では、構造化ログデータセットを使用します。`Referer`カラムに`ultra`が含まれるログの件数を取得したいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

ここでは、ngramサイズ3でマッチングする必要があります。そのため、`ngrambf_v1`索引を作成します。

```sql
CREATE TABLE otel_logs_bloom
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
        INDEX idx_span_attr_value Referer TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY (Timestamp)
```

索引 `ngrambf_v1(3, 10000, 3, 7)` は4つのパラメータを取ります。最後のパラメータ（値7）はシード値を表します。その他のパラメータは、ngramサイズ（3）、値 `m`（フィルタサイズ）、ハッシュ関数の数 `k`（7）を表します。`k` と `m` はチューニングが必要であり、一意のngram/トークンの数とフィルタが真陰性を返す確率（つまり、値がグラニュール内に存在しないことを確認する確率）に基づいて設定されます。これらの値を決定するには、[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を参照することを推奨します。

適切にチューニングすれば、ここで得られる高速化効果は非常に大きくなり得ます。

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 row in set. Elapsed: 0.077 sec. Processed 4.22 million rows, 375.29 MB (54.81 million rows/s., 4.87 GB/s.)
Peak memory usage: 129.60 KiB.
```

:::note 例のみ
上記は説明のみを目的とした例です。テキスト検索をトークンベースの Bloom フィルタで最適化しようとするのではなく、ユーザーには挿入時にログから構造を抽出することを推奨します。ただし、スタックトレースやその他の大きな文字列で、構造があまり決まっていないためにテキスト検索が有用となるケースも存在します。
:::

Bloom フィルタを使用する際の一般的なガイドライン:

Bloom フィルタの目的は[グラニュール](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)をフィルタリングし、カラムの全値を読み込んで線形スキャンを行う必要を回避することです。`indexes=1` をパラメータに取る `EXPLAIN` 句を使用すると、スキップされたグラニュール数を特定できます。以下の応答は、元のテーブル `otel_logs_v2` と、ngram Bloom フィルタを適用したテーブル `otel_logs_bloom` を比較したものです。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_v2)                     │
│       Indexes:                                                     │
│               PrimaryKey                                           │
│               Condition: true                                      │
│               Parts: 9/9                                           │
│               Granules: 1278/1278                                  │
└────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.016 sec.

EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│       Expression (Before GROUP BY)                                 │
│       Filter ((WHERE + Change column names to column identifiers)) │
│       ReadFromMergeTree (default.otel_logs_bloom)                  │
│       Indexes:                                                     │
│               PrimaryKey                                           │ 
│               Condition: true                                      │
│               Parts: 8/8                                           │
│               Granules: 1276/1276                                  │
│               Skip                                                 │
│               Name: idx_span_attr_value                            │
│               Description: ngrambf_v1 GRANULARITY 1                │
│               Parts: 8/8                                           │
│               Granules: 517/1276                                   │
└────────────────────────────────────────────────────────────────────┘
```

ブルームフィルターは、一般にフィルター自体がカラムより小さい場合にのみ高速に動作します。カラムより大きくなってしまうと、性能向上の効果はほとんど得られない可能性があります。次のクエリを使って、フィルターのサイズとカラムのサイズを比較してください。


```sql
SELECT
        name,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (`table` = 'otel_logs_bloom') AND (name = 'Referer')
GROUP BY name
ORDER BY sum(data_compressed_bytes) DESC

┌─name────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ Referer │ 56.16 MiB       │ 789.21 MiB        │ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 row in set. Elapsed: 0.018 sec.

SELECT
        `table`,
        formatReadableSize(data_compressed_bytes) AS compressed_size,
        formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

上記の例では、セカンダリ Bloom フィルター索引は 12MB であり、カラム自体の圧縮後サイズである 56MB と比べて、ほぼ 5 倍小さいことが分かります。

Bloom フィルターには、かなりのチューニングが必要になる場合があります。最適な設定を見つける際に有用な注意点として、[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter) を参照することを推奨します。また、Bloom フィルターは挿入およびマージ時に高コストになる可能性があります。Bloom フィルターを本番環境に追加する前に、挿入パフォーマンスへの影響を評価する必要があります。

セカンダリ skip 索引の詳細については、[こちら](/optimize/skipping-indexes#skip-index-functions) を参照してください。


### マップからの抽出 {#extracting-from-maps}

`Map` 型は OTel のスキーマで広く使用されています。この型では、キーと値はいずれも同じ型である必要があり、Kubernetes のラベルのようなメタデータには十分です。`Map` 型のサブキーに対してクエリを実行する場合、親のカラム全体が読み込まれることに注意してください。マップに多数のキーがある場合、そのキーが個別のカラムとして存在している場合と比べて、ディスクから読み取るデータ量が増えるため、クエリのコストが大きくなる可能性があります。

特定のキーに頻繁にクエリを実行する場合は、それをテーブルのルートレベルに専用のカラムとして移動することを検討してください。これは一般的に、よくあるアクセスパターンに応じてデプロイ後に行われるタスクであり、本番稼働前に予測するのは難しい場合があります。スキーマをデプロイ後にどのように変更するかについては、["Managing schema changes"](/observability/managing-data#managing-schema-changes) を参照してください。

## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouse がオブザーバビリティに使われる主な理由の 1 つは圧縮です。

ストレージコストを劇的に削減できるだけでなく、ディスク上のデータ量が少ないほど I/O が減り、クエリや挿入処理が高速になります。CPU の観点では、どのような圧縮アルゴリズムのオーバーヘッドであっても、I/O 削減効果の方が大きくなります。したがって、ClickHouse のクエリの高速化に取り組む際には、まずデータ圧縮の改善に注力すべきです。

圧縮の測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)を参照してください。