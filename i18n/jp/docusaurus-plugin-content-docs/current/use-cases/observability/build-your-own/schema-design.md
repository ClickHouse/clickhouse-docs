---
title: 'スキーマ設計'
description: '可観測性向けのスキーマ設計'
keywords: ['可観測性', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';

# オブザーバビリティ向けスキーマ設計 {#designing-a-schema-for-observability}

ログおよびトレースに対しては、常に独自のスキーマを作成することを推奨します。その理由は次のとおりです。

- **プライマリキーの選択** - デフォルトのスキーマでは、特定のアクセスパターンに最適化された `ORDER BY` を使用しています。利用したいアクセスパターンがこれと一致する可能性は低いでしょう。
- **構造の抽出** - ユーザーは、既存の列（例: `Body` 列）から新しい列を抽出したい場合があります。これはマテリアライズドカラム（および、より複雑なケースではマテリアライズドビュー）を用いて実現できますが、そのためにはスキーマ変更が必要です。
- **Map の最適化** - デフォルトのスキーマでは、属性の保存に Map 型を使用しています。これらの列は任意のメタデータを保存できます。イベントからのメタデータは事前に定義されていないことが多く、そのため ClickHouse のような強く型付けされたデータベースには他の方法では保存できないことを考えると、これは本質的に重要な機能です。ただし、Map のキーとその値へのアクセスは、通常の列へのアクセスほど効率的ではありません。この課題には、スキーマを変更し、最も頻繁にアクセスされる Map キーをトップレベルの列とすることで対処します。詳細は ["Extracting structure with SQL"](#extracting-structure-with-sql) を参照してください。これにはスキーマ変更が必要です。
- **Map キーアクセスの簡素化** - Map 内のキーにアクセスするには、より冗長な構文が必要です。ユーザーはエイリアスを用いることでこれを軽減できます。クエリを簡素化するには ["Using Aliases"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマでは、Map へのアクセスの高速化およびテキストクエリの高速化のためにセカンダリインデックスを使用します。これらは通常必須ではなく、追加のディスク容量を要します。利用することはできますが、本当に必要かどうかを確認するためにテストすべきです。詳細は ["Secondary / Data Skipping indices"](#secondarydata-skipping-indices) を参照してください。
- **Codecs の利用** - 想定されるデータを理解しており、それによって圧縮が改善されるという根拠がある場合、ユーザーは列ごとに Codec をカスタマイズしたい場合があります。

_上記の各ユースケースについて、この後で詳しく説明します。_

**重要:** ユーザーは最適な圧縮率とクエリ性能を得るためにスキーマを拡張・変更することが推奨されますが、可能な限りコアとなる列については OTel スキーマの命名に従うべきです。ClickHouse 用 Grafana プラグインは、クエリビルドを支援するために、いくつかの基本的な OTel 列（例: Timestamp や SeverityText）の存在を前提としています。ログおよびトレースに必要な列は、それぞれこちら [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) に記載されています。プラグイン設定でデフォルトを上書きすることで、これらの列名を変更することもできます。

## SQL による構造の抽出 {#extracting-structure-with-sql}

構造化ログでも非構造化ログでも、ユーザーはしばしば次のようなことを行う必要があります。

* **文字列ブロブからカラムを抽出する**。こうして抽出されたカラムに対するクエリは、クエリ時に文字列操作を行うより高速になります。
* **Map からキーを抽出する**。デフォルトのスキーマでは、任意の属性は Map 型のカラムに格納されます。この型はスキーマレスな機能を提供し、ログやトレースを定義する際に属性用のカラムを事前定義する必要がないという利点があります。しばしば、Kubernetes からログを収集し、後で検索できるようにポッドラベルを保持したい場合などには、事前定義が不可能です。Map のキーとその値にアクセスするのは、通常の ClickHouse カラムに対するクエリよりも遅くなります。そのため、Map からキーを抽出してルートテーブルのカラムにすることが望ましいケースが多くあります。

次のクエリを考えてみましょう。

構造化ログを用いて、どの URL パスが最も多くの POST リクエストを受け取っているかをカウントしたいとします。JSON のブロブは `Body` カラム内に String として格納されています。さらに、ユーザーがコレクターで `json&#95;parser` を有効にしている場合には、`LogAttributes` カラム内に `Map(String, String)` としても格納されている可能性があります。

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

`LogAttributes` が利用可能であれば、サイト上でどの URL パスが最も多くの POST リクエストを受けているかを集計するクエリは次のとおりです：

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

ここで使用しているマップ構文（例: `LogAttributes['request_path']`）と、URL からクエリパラメータを取り除くための [`path` 関数](/sql-reference/functions/url-functions#path) に注目してください。

ユーザーがコレクター側で JSON 解析を有効にしていない場合、`LogAttributes` は空となり、String 型の `Body` からカラムを抽出するために [JSON 関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note Prefer ClickHouse for parsing
構造化ログの JSON 解析は、一般的に ClickHouse で実行することを推奨します。ClickHouse が最速の JSON 解析実装であると確信しています。ただし、ユーザーがログを他の送信先にも送信したい場合や、このロジックを SQL 側に持たせたくない場合があることも理解しています。
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

次に、非構造化ログの場合も見てみましょう。

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

非構造化ログに対して同様のクエリを実行するには、`extractAllGroupsVertical` 関数で正規表現を使用する必要があります。

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

非構造化ログを解析するクエリの複雑さとコスト（パフォーマンス差に注目してください）の増大が理由で、可能な限り常に構造化ログを使用することを推奨します。

:::note 辞書の活用を検討
上記のクエリは、正規表現辞書を活用するように最適化できます。詳細は [Using Dictionaries](#using-dictionaries) を参照してください。
:::

これら 2 つのユースケースは、上記のクエリロジックをデータ挿入時に実行するように移すことで、ClickHouse によっていずれも満たすことができます。以下で複数のアプローチを紹介し、それぞれが適切となる場面を示します。

:::note 処理は OTel か ClickHouse か？
[こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching) で説明しているように、OTel collector の processors や operators を使用して処理を行うこともできます。多くの場合、ClickHouse の方が collector の processors よりも大幅にリソース効率が高く、高速であると感じられるでしょう。すべてのイベント処理を SQL で行うことの主なデメリットは、ソリューションが ClickHouse に密結合してしまうことです。例えば、処理済みログを OTel collector から S3 などの別の宛先に送信したい場合があります。
:::


### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出するための最もシンプルな手段を提供します。この種のカラムの値は常に挿入時に計算され、INSERT クエリで明示的に指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、挿入時に値がディスク上の新しいカラムへ抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムには任意の ClickHouse 式を指定でき、[文字列の処理](/sql-reference/functions/string-functions)（[正規表現や検索](/sql-reference/functions/string-search-functions) を含む）や [URL](/sql-reference/functions/url-functions) の処理、[型変換](/sql-reference/functions/type-conversion-functions)、[JSON からの値の抽出](/sql-reference/functions/json-functions)、[数値演算](/sql-reference/functions/math-functions) など、各種分析関数を利用できます。

基本的な処理にはマテリアライズドカラムの利用を推奨します。特に、map から値を抽出してルートカラムに昇格させたり、型変換を行ったりする場合に有用です。ごく基本的なスキーマで使用する場合や、マテリアライズドビューと併用する場合に、最も効果を発揮することが多くあります。次のスキーマは、コレクターによって JSON が抽出されて `LogAttributes` カラムに格納されているログを想定しています。

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

`String` 型の `Body` 列から JSON 関数を使って抽出する場合の同等のスキーマは、[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)で確認できます。

ここでは 3 つのマテリアライズドカラムで、リクエストページ、リクエストタイプ、およびリファラのドメインを抽出しています。これらのカラムはマップ内のキーにアクセスし、その値に関数を適用します。これにより、後続のクエリは大幅に高速化されます。

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
マテリアライズドカラムは、デフォルトでは `SELECT *` の結果には含まれません。これは、`SELECT *` の結果を常に INSERT 文を使ってそのままテーブルに挿入できるという不変性を保つためです。この挙動は `asterisk_include_materialized_columns=1` を設定することで変更でき、Grafana ではデータソース設定（`Additional Settings -> Custom Settings`）の中でこの設定を有効化できます。
:::

## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views) は、ログおよびトレースに対して SQL によるフィルタリングや変換を適用する、より強力な手段を提供します。

マテリアライズドビューを使用すると、計算コストをクエリ実行時から挿入時へと移すことができます。ClickHouse のマテリアライズドビューは、テーブルにデータブロックが挿入される際にクエリを実行するトリガーに相当します。このクエリの結果は 2 つ目の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt="Materialized view" size="md" />

:::note Real-time updates
ClickHouse のマテリアライズドビューは、それらが基づいているテーブルにデータが流入するのに伴いリアルタイムで更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースにおけるマテリアライズドビューは通常、リフレッシュが必要な（ClickHouse の Refreshable Materialized Views に類似した）クエリの静的なスナップショットです。
:::

マテリアライズドビューに関連付けられたクエリは、理論上どのようなクエリでもよく、集約も含めて利用可能ですが、[Join には制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログとトレースに必要な変換およびフィルタリングのワークロードに対しては、任意の `SELECT` 文を使用できると考えて問題ありません。

このクエリは、テーブル（ソーステーブル）に挿入される行に対して実行される単なるトリガーであり、その結果が新しいテーブル（ターゲットテーブル）に送られるだけであることを理解しておく必要があります。

ソーステーブルとターゲットテーブルの両方にデータを二重に永続化しないようにするために、ソーステーブルのテーブルエンジンを [Null table engine](/engines/table-engines/special/null) に変更し、元のスキーマを維持します。OTel collector は引き続きこのテーブルにデータを送信します。例えばログの場合、`otel_logs` テーブルは次のようになります。

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

Null テーブルエンジンは強力な最適化機構で、`/dev/null` のようなものと考えることができます。このテーブル自体は一切データを保持しませんが、関連付けられたマテリアライズドビューは、行が破棄される前に挿入された行に対して引き続き実行されます。

次のクエリを見てみましょう。これは行を保持したい形式に変換し、`LogAttributes` からすべてのカラムを抽出します（これはコレクターが `json_parser` オペレーターを使って設定したものと仮定します）。さらに、いくつかの単純な条件と[これらのカラム](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)の定義に基づいて `SeverityText` と `SeverityNumber` を設定します。この例では、`TraceId`、`SpanId`、`TraceFlags` などのカラムは無視し、値が入ることが分かっているカラムだけを選択しています。


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

上記では、`Body` 列も抽出しています。これは、後から SQL では抽出していない追加属性が付与される場合に備えるためです。この列は ClickHouse では高い圧縮率が期待でき、かつ参照頻度も低いため、クエリ性能への影響はほとんどありません。最後に、`Timestamp` を `DateTime` にキャストしてサイズを削減しています（「[型の最適化](#optimizing-types)」を参照）。

:::note Conditionals
上記では、`SeverityText` と `SeverityNumber` を抽出するために [条件関数](/sql-reference/functions/conditional-functions) を使用している点に注目してください。これらは、複雑な条件を定義したり、マップ内で値が設定されているか確認したりするのに非常に有用です。ここでは素朴に、`LogAttributes` 内にすべてのキーが存在すると仮定しています。読者の方には、[null 値](/sql-reference/functions/functions-for-nulls) を扱う関数とあわせて、これらの使い方に習熟することを強くお勧めします。ログ解析における心強い味方になります。
:::

これらの結果を受け取るためのテーブルが必要です。以下のターゲットテーブルは、上記のクエリと対応しています。

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

ここで選択しているデータ型は、[「型の最適化」](#optimizing-types) で説明している最適化に基づいています。

:::note
スキーマを大幅に変更している点に注目してください。実際には、保持しておきたいトレース用のカラムや、`ResourceAttributes` カラム（通常は Kubernetes のメタデータを含みます）も併せて持っていることが多いでしょう。Grafana はこれらのトレース関連カラムを活用して、ログとトレース間のリンク機能を提供できます。詳しくは [「Grafana の利用」](/observability/grafana) を参照してください。
:::


以下では、`otel_logs` テーブルに対して上記の SELECT を実行し、その結果を `otel_logs_v2` に送るマテリアライズドビュー `otel_logs_mv` を作成します。

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

上記の内容は、以下のように可視化できます。

<Image img={observability_11} alt="OTel MV" size="md" />

もし、[「ClickHouse へのエクスポート」](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用したコレクターの設定を再起動すると、データは目的の形式で `otel_logs_v2` に出力されます。型付き JSON 抽出関数を使用している点に注意してください。

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

行 1:
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

1行のデータセット。経過時間: 0.010秒
```

`Body` カラムから JSON 関数を使って列を抽出することで構成される、同等のマテリアライズドビューを次に示します。

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

上記のマテリアライズドビューは、特に `LogAttributes` マップを使用する場合に、暗黙の型変換に依存しています。ClickHouse は多くの場合、抽出された値を対象テーブルの型に自動的にキャストし、記述すべき構文を減らすことができます。ただし、ビューが正しく動作することを確認するため、ビューの `SELECT` 文と、同じスキーマを持つ対象テーブルに対する [`INSERT INTO`](/sql-reference/statements/insert-into) 文を組み合わせて常にテストすることを推奨します。これにより、型が正しく扱われていることを確認できます。特に次のケースには注意してください：

- マップにキーが存在しない場合、空文字列が返されます。数値型の場合、これらを適切な値にマッピングする必要があります。これは [条件関数](/sql-reference/functions/conditional-functions) を使って実現できます（例: `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`）、またはデフォルト値が許容できる場合は [キャスト関数](/sql-reference/functions/type-conversion-functions)（例: `toUInt8OrDefault(LogAttributes['status'] )`）を使用します。
- 一部の型は常にキャストされるとは限りません。例えば、数値の文字列表現は Enum 値にはキャストされません。
- JSON 抽出関数は、値が見つからない場合、その型に対するデフォルト値を返します。これらの値が妥当かどうかを必ず確認してください。

:::note Nullable を避ける
オブザーバビリティデータに対して ClickHouse で [Nullable](/sql-reference/data-types/nullable) を使用することは避けてください。ログやトレースでは、空と null を区別する必要があるケースはほとんどありません。この機能は追加のストレージオーバーヘッドを発生させ、クエリパフォーマンスに悪影響を与えます。詳細は [こちら](/data-modeling/schema-design#optimizing-types) を参照してください。
:::

## プライマリ（ソート）キーの選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出できたら、ソート/プライマリキーの設計と最適化を開始できます。

ソートキーを選択する際には、いくつかの簡単なルールを適用できます。以下のルール同士は衝突する場合があるため、記載順に検討してください。このプロセスを通じて複数のキー候補を洗い出せますが、通常は 4～5 個で十分です。

1. よく使うフィルターやアクセスパターンに合致するカラムを選択します。たとえば通常オブザーバビリティの調査を始める際に、特定のカラム（例: ポッド名）でフィルタリングすることが多い場合、そのカラムは `WHERE` 句で頻繁に使用されます。使用頻度の低いカラムよりも、こうしたカラムをキーに含めることを優先してください。
2. フィルタリングした際に、全行の大きな割合を除外できるカラムを優先します。これにより、読み取る必要のあるデータ量を削減できます。サービス名やステータスコードは良い候補であることが多いです。ただし後者の場合は、多くの行を除外できる値でフィルタリングする場合に限ります。例えば 200 番台でフィルタリングすると、多くのシステムでは大半の行にマッチしますが、500 エラーでフィルタリングすると、対応するのは全体のうちごく一部になります。
3. テーブル内の他のカラムと高い相関が見込まれるカラムを優先します。これにより、これらの値が連続して格納されやすくなり、圧縮効率が向上します。
4. ソートキーに含まれるカラムに対する `GROUP BY` や `ORDER BY` の処理は、よりメモリ効率よく実行できます。

<br />

ソートキーとするカラムのサブセットを特定したら、それらを特定の順序で宣言する必要があります。この順序は、クエリでセカンダリキーとなるカラムをフィルタリングする際の効率と、テーブルのデータファイルに対する圧縮率の両方に大きな影響を与える可能性があります。一般に、**カーディナリティ（値の種類の数）が小さいものから大きいものへ昇順に並べるのが最善**です。ただし、ソートキー内で後ろに配置されたカラムでのフィルタリングは、先頭付近に配置されたカラムでのフィルタリングより効率が落ちることも考慮する必要があります。これらの性質と実際のアクセスパターンのバランスを取ってください。特に重要なのは、複数のバリエーションをテストすることです。ソートキーの詳細と最適化方法についてさらに理解したい場合は、[この記事](/guides/best-practices/sparse-primary-indexes) を参照することをおすすめします。

:::note Structure first
ログの構造化が完了してからソートキーを決定することを推奨します。属性マップ内のキーや JSON 抽出式をソートキーとして使用しないでください。ソートキーにするカラムは、テーブルのルートカラムとして定義されていることを確認してください。
:::

## マップの使用 {#using-maps}

前の例では、`Map(String, String)` 型の列内の値にアクセスするために、マップ構文 `map['key']` を使用する方法を示しました。ネストされたキーにアクセスするためにマップ表記を使うだけでなく、これらの列をフィルタリングまたは選択するために使用できる、ClickHouse 専用の [map 関数](/sql-reference/functions/tuple-map-functions#mapkeys) も用意されています。

たとえば、次のクエリでは、[`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) と、それに続く [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を使用して、`LogAttributes` 列で利用可能な一意なキーをすべて抽出します。

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

行 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1行のセット。経過時間: 1.139秒。処理済み 563万行、2.53 GB (494万行/秒、2.22 GB/秒)
ピークメモリ使用量: 71.90 MiB。
```

:::note ドットを避ける
Map 型の列名でドットを使用することは推奨しません。将来的にその使用を非推奨とする可能性があります。代わりに `_` を使用してください。
:::

## エイリアスの使用 {#using-aliases}

Map 型へのクエリは通常のカラムへのクエリよりも低速です — [&quot;Accelerating queries&quot;](#accelerating-queries) を参照してください。さらに、構文がより複雑で、ユーザーがクエリを記述する際に煩雑になりがちです。この後者の問題に対処するため、ALIAS カラムの使用を推奨します。

ALIAS カラムはクエリ実行時に計算され、テーブル内には保存されません。そのため、この型のカラムに値を INSERT することはできません。エイリアスを使用することで、Map のキーを参照しつつ構文を簡略化し、Map のエントリを通常のカラムとして透過的に公開できます。次の例を考えてみましょう。

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

いくつかのマテリアライズドカラムと、Map `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` を定義しました。これにより、このカラム経由で `LogAttributes['remote_addr']` の値を参照できるようになり、クエリを簡略化できます。つまり、次のようになります。

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

さらに、`ALTER TABLE` コマンドを使えば `ALIAS` の追加は簡単です。これらのカラムはすぐに利用可能になり、たとえば次のように使えます。

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

:::note デフォルトでは ALIAS は除外されます
デフォルトでは、`SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::


## 型の最適化 {#optimizing-types}

型最適化に関する[ClickHouse の一般的なベストプラクティス](/data-modeling/schema-design#optimizing-types)は、本ユースケースにも適用されます。

## コーデックの使用 {#using-codecs}

型に関する最適化に加えて、ユーザーは ClickHouse Observability のスキーマに対して圧縮を最適化しようとする際に、[コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)に従うことができます。

一般的に、`ZSTD` コーデックはログおよびトレースのデータセットに対して非常に有用です。デフォルト値である 1 から圧縮レベルを上げると、圧縮率が向上する可能性があります。ただし、より高い値は挿入時の CPU オーバーヘッドの増大を伴うため、必ず検証する必要があります。通常、この値を上げても得られる効果はわずかです。

さらに、タイムスタンプは、圧縮の観点ではデルタエンコーディングによる恩恵を受ける一方で、この列がプライマリ／オーダリングキーに使用されている場合、クエリパフォーマンスの低下を引き起こすことが示されています。ユーザーには、圧縮効率とクエリパフォーマンスのトレードオフを評価することを推奨します。

## ディクショナリの利用 {#using-dictionaries}

[Dictionaries](/sql-reference/dictionaries) は ClickHouse の[重要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)であり、さまざまな内部および外部[ソース](/sql-reference/dictionaries#dictionary-sources)からのデータをインメモリの [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式で表現し、超低レイテンシなルックアップクエリ向けに最適化します。

<Image img={observability_12} alt="オブザーバビリティとディクショナリ" size="md"/>

これはさまざまなシナリオで有用です。インジェスト処理を遅くすることなく取り込み中のデータをオンザフライでエンリッチしたり、クエリ全般のパフォーマンスを向上させることができ、特に JOIN が大きな恩恵を受けます。
オブザーバビリティのユースケースでは JOIN が必要となることはまれですが、ディクショナリは挿入時とクエリ時の両方でエンリッチ用途として依然として有用です。以下でそれぞれの例を示します。

:::note JOIN の高速化
ディクショナリを用いて JOIN を高速化したいユーザー向けの詳細は[こちら](/dictionary)を参照してください。
:::

### 挿入時とクエリ時の比較 {#insert-time-vs-query-time}

Dictionary は、データセットのエンリッチメントをクエリ時または挿入時に実行するために利用できます。これらのアプローチにはそれぞれ長所と短所があります。まとめると次のとおりです。

- **挿入時** - エンリッチメントに用いる値が変化せず、Dictionary を構築するために利用できる外部ソースに存在している場合に一般的に適しています。この場合、挿入時に行をエンリッチすることで、クエリ時に Dictionary へルックアップする必要を回避できます。その代わり、挿入処理のパフォーマンスの低下と、エンリッチされた値がカラムとして保存されることによる追加のストレージオーバーヘッドが発生します。
- **クエリ時** - Dictionary 内の値が頻繁に変化する場合は、クエリ時のルックアップのほうが適していることが多いです。これにより、マッピングされた値が変化した際にカラムを更新（およびデータを書き換え）する必要がなくなります。この柔軟性は、クエリ時のルックアップコストという代償を伴います。クエリ時のこのコストは、多数の行に対してルックアップが必要な場合、たとえばフィルター句で Dictionary ルックアップを使用するようなケースでは、無視できないことがよくあります。`SELECT` 内での結果のエンリッチメントに限れば、このオーバーヘッドは通常それほど問題になりません。

ユーザーには、まず Dictionary の基本に慣れておくことを推奨します。Dictionary はインメモリのルックアップテーブルを提供し、専用の[関数](/sql-reference/functions/ext-dict-functions#dictGetAll)を使用して値を取得できます。

簡単なエンリッチメントの例については、Dictionary に関するガイドを[こちら](/dictionary)で参照してください。以下では、一般的なオブザーバビリティのエンリッチメントタスクに焦点を当てます。

### IP 辞書の使用 {#using-ip-dictionaries}

IP アドレスを用いて緯度・経度の値でログやトレースに地理情報を付与することは、オブザーバビリティ上の一般的な要件です。これは `ip_trie` 構造化辞書を使用することで実現できます。

ここでは、[DB-IP.com](https://db-ip.com/) が提供し、[CC BY 4.0 ライセンス](https://creativecommons.org/licenses/by/4.0/) の条件の下で公開されている [DB-IP city-level dataset](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を使用します。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データが次のような構造になっていることが分かります。

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を踏まえて、[url()](/sql-reference/table-functions/url) テーブル関数を使ってデータを少し覗いてみましょう。

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n           \tip_range_start IPv4, \n       \tip_range_end IPv4, \n         \tcountry_code Nullable(String), \n     \tstate1 Nullable(String), \n           \tstate2 Nullable(String), \n           \tcity Nullable(String), \n     \tpostcode Nullable(String), \n         \tlatitude Float64, \n          \tlongitude Float64, \n         \ttimezone Nullable(String)\n   \t')
LIMIT 1
FORMAT Vertical
行 1:
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

作業を楽にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使ってフィールド名を定義した ClickHouse のテーブルオブジェクトを作成し、行数の合計を確認しましょう。

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
│ 3261621 │ -- 326万件
└─────────┘
```

`ip_trie` 辞書では IP アドレス範囲を CIDR 表記で指定する必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲に対応する CIDR は、次のクエリで簡潔に算出できます。

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
上記のクエリでは多くの処理が行われています。詳しく知りたい方は、この優れた[解説](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を参照してください。そうでない場合は、上記のクエリが IP レンジに対して CIDR を計算していると理解してください。
:::

ここで必要なのは IP レンジ、国コード、および座標だけなので、新しいテーブルを作成し、GeoIP データを挿入しましょう。

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

ClickHouse で低レイテンシな IP ルックアップを行うために、Geo IP データのキーから属性へのマッピングをインメモリで保持するためのディクショナリを利用します。ClickHouse には、ネットワークプレフィックス（CIDR ブロック）を座標および国コードにマッピングするための `ip_trie` [dictionary structure](/sql-reference/dictionaries#ip_trie) が用意されています。次のクエリでは、このレイアウトを使用し、上記のテーブルをソースとするディクショナリを定義します。

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

辞書から行を選択して、このデータセットがルックアップに利用可能であることを確認できます。

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3行のデータセット。経過時間: 4.662秒
```

:::note 定期的な更新
ClickHouse のディクショナリは、基盤となるテーブルデータと、上で使用した lifetime 句に基づいて定期的に更新されます。DB-IP データセット内の最新の変更を Geo IP ディクショナリに反映するには、変換を適用しつつ、リモートテーブル `geoip_url` から `geoip` テーブルにデータを再挿入するだけで済みます。
:::

Geo IP データが `ip_trie` ディクショナリ（便宜上、`ip_trie` という同じ名前を付けています）に読み込まれたので、これを IP ジオロケーションに利用できます。これは、次のように [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して行えます。

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ここでの取得速度に注目してください。この速度があれば、ログをエンリッチできます。今回のケースでは、**クエリ時エンリッチメントを行う**ことを選択します。

元のログデータセットに戻ると、上記を利用してログを国別に集計できます。以下では、先ほどのマテリアライズドビューの結果として得られたスキーマを使用しており、そこには抽出済みの `RemoteAddress` 列が含まれていることを前提としています。

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

IP から地理的位置への対応は変化し得るため、ユーザーは同じアドレスに対する「現在の」地理的位置ではなく、リクエストが発行された当時にどこから送信されたのかを知りたいと考えるはずです。このため、このケースではインデックス時のエンリッチメントが推奨されます。これは、以下に示すようにマテリアライズドカラムを使用するか、マテリアライズドビューの SELECT 句で実行できます。

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
ユーザーは、新しいデータに基づいて IP エンリッチメント辞書を定期的に更新したいと考えることが多いでしょう。これは辞書の `LIFETIME` 句を使用することで実現でき、基盤となるテーブルから辞書を定期的に再読み込みさせることができます。基盤となるテーブルを更新する方法については、「[更新可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)」を参照してください。
:::

上記の国情報と座標を利用することで、国ごとのグルーピングやフィルタリングにとどまらない可視化が可能になります。活用のヒントについては、「[地理情報データの可視化](/observability/grafana#visualizing-geo-data)」を参照してください。

### 正規表現辞書の使用（User-Agent の解析） {#using-regex-dictionaries-user-agent-parsing}

[User-Agent 文字列](https://en.wikipedia.org/wiki/User_agent)の解析は、典型的な正規表現の問題であり、ログおよびトレースベースのデータセットで一般的に求められる処理です。ClickHouse は Regular Expression Tree Dictionary を使用して、User-Agent を効率的に解析する機能を提供します。

Regular Expression Tree Dictionary は、ClickHouse オープンソースでは `YAMLRegExpTree` 辞書ソース・タイプを使用して定義されます。これは、正規表現ツリーを含む YAML ファイルへのパスを指定するものです。独自の正規表現辞書を用意したい場合は、必要な構造の詳細が[こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)に記載されています。以下では、[uap-core](https://github.com/ua-parser/uap-core) を用いた User-Agent 解析に焦点を当て、サポートされている CSV 形式向けに辞書をロードします。この方法は、OSS と ClickHouse Cloud の両方で利用できます。

:::note
以下の例では、2024 年 6 月時点での最新 uap-core の User-Agent 解析用正規表現のスナップショットを使用しています。最新のファイルは随時更新されており、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)から取得できます。[こちら](/sql-reference/dictionaries#collecting-attribute-values)の手順に従って、以下で使用している CSV ファイルに読み込むことができます。
:::

次の Memory エンジンのテーブルを作成します。これらは、デバイス、ブラウザ、オペレーティングシステムを解析するための正規表現を保持します。

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

これらのテーブルには、`url` テーブル関数を使用して、以下の公開 CSV ファイルからデータを投入できます。

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルにデータが投入できたので、正規表現辞書をロードできます。キーとなる値をカラムとして指定する必要がある点に注意してください。これらが、User-Agent から抽出できる属性になります。

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

これらの辞書を読み込んだら、サンプルの User-Agent 文字列を指定して、この新しい辞書抽出機能をテストできます。


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

ユーザーエージェントに関するルールが変わることはほとんどなく、辞書も新しいブラウザ、オペレーティングシステム、デバイスが登場したときに更新すればよいだけなので、この抽出処理は挿入時に実行するのが理にかなっています。

この処理は、マテリアライズドカラムを使って実行することも、マテリアライズドビューを使って実行することもできます。以下では、前述のマテリアライズドビューを修正します。

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

コレクターを再起動し、これまでの手順どおりに構造化ログを取り込んだら、新たに抽出された Device、Browser、Os の各列に対してクエリを実行できるようになります。

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

:::note 複雑な構造のための Tuple
これらのユーザーエージェント列では Tuple を使用している点に注意してください。Tuple は、階層があらかじめ分かっている複雑な構造に対して推奨されます。サブカラムも、異なる型を許容しつつ、通常のカラムと同等のパフォーマンスを発揮します（Map のキーとは異なります）。
:::

### さらに詳しく {#further-reading}

辞書のさらなる例や詳細については、以下の記事を参照してください。

- [辞書の高度なトピック](/dictionary#advanced-dictionary-topics)
- ["Using Dictionaries to Accelerate Queries"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)

## クエリの高速化 {#accelerating-queries}

ClickHouse には、クエリ性能を向上させるためのさまざまな手法があります。これらは、まず最も一般的なアクセスパターンに合わせて適切な primary/ordering key を選択し、圧縮率を最大化するよう設計した「後」に検討してください。通常、primary/ordering key の最適化が、最小の労力で最大の性能向上をもたらします。

### 集計のためのマテリアライズドビュー（インクリメンタル）の利用 {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データの変換とフィルタリングにマテリアライズドビューを使用する方法を見てきました。マテリアライズドビューは、挿入時に集計をあらかじめ計算して結果を保存する用途にも使用できます。この結果は、その後の挿入で得られた結果によって更新されるため、実質的に集計を挿入時に前もって計算しておくことができます。

ここでの主な考え方は、結果がしばしば元データのより小さな表現（集計の場合は部分的なスケッチ）になるという点です。ターゲットテーブルから結果を読み出すための、より単純なクエリと組み合わせることで、同じ計算を元データに対して実行する場合よりもクエリ時間を短縮できます。

次のクエリを考えてみましょう。ここでは、構造化ログを使用して 1 時間あたりの総トラフィックを計算します。

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

Grafana でユーザーがよく描画する一般的な折れ線グラフを想像してみてください。このクエリは確かに非常に高速です ― データセットは 1,000 万行しかなく、しかも ClickHouse は高速です。とはいえ、これを数十億、数兆行にスケールさせた場合でも、このクエリ性能を維持できることが理想です。

:::note
このクエリは、`LogAttributes` マップから `size` キーを抽出する、先ほどのマテリアライズドビューの結果である `otel_logs_v2` テーブルを使用すると、10 倍高速になります。ここでは説明目的のために生データを使用しており、このクエリが一般的なユースケースであれば、先ほどのビューを使用することを推奨します。
:::

挿入時にマテリアライズドビューを使ってこれを計算したい場合、その結果を受け取るためのテーブルが必要です。このテーブルは 1 時間あたり 1 行だけを保持する必要があります。既存の時間に対して更新が受信された場合、他のカラムは既存のその時間の行にマージされる必要があります。このインクリメンタルな状態のマージを行うには、他のカラムについて部分的な状態を保存しておく必要があります。

このためには、ClickHouse で特別なエンジンタイプが必要です: `SummingMergeTree` です。これは、同じ並び替えキーを持つすべての行を、数値カラムの合計値を含む 1 行に置き換えます。次のテーブル定義では、同じ日付を持つ任意の行をマージし、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

マテリアライズドビューの動作を確認するために、`bytes_per_hour` テーブルが空で、まだデータを受け取っていないと仮定します。マテリアライズドビューは、`otel_logs` に挿入されたデータに対して上記の `SELECT` を実行し（設定したサイズのブロックごとに実行されます）、その結果を `bytes_per_hour` に格納します。構文は次のとおりです。

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの `TO` 句が重要であり、結果がどのテーブルに送信されるか、すなわち `bytes_per_hour` テーブルであることを示しています。

OTel collector を再起動してログを再送信すると、`bytes_per_hour` テーブルには上記クエリ結果がインクリメンタルに蓄積されていきます。処理が完了したら、`bytes_per_hour` の行数を確認します。1 時間あたり 1 行になっているはずです。

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1行のセット。経過時間: 0.039秒
```

ここでは、クエリ結果を保存することで、`otel_logs` の 1,000 万行から 113 行まで行数を効果的に削減しました。ここで重要なのは、新しいログが `otel_logs` テーブルに挿入されると、それぞれの時間帯に対応する新しい値が `bytes_per_hour` に書き込まれ、バックグラウンドで非同期に自動マージされる点です。1 時間あたり 1 行のみを保持することで、`bytes_per_hour` は常に小さく、かつ最新の状態に保たれます。

行のマージは非同期で行われるため、ユーザーがクエリした時点では、1 時間あたり複数行が存在する可能性があります。クエリ時に未マージの行も必ずマージされるようにするには、次の 2 つの選択肢があります。

* テーブル名に対して [`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier) を使用する（上記のカウントクエリで用いた方法）。
* 最終的なテーブルで使用している並び替えキー、すなわち Timestamp でグループ化し、メトリクスを合計する。

一般的には、2 つ目の方法の方が効率的かつ柔軟（テーブルを他の用途にも利用可能）ですが、1 つ目の方法の方がシンプルなクエリもあります。以下に両方の方法を示します。

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

5行のセット。経過時間: 0.008秒

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

5行のセット。経過時間: 0.005秒
```

これにより、クエリの実行時間は 0.6 秒から 0.008 秒へと短縮され、75 倍以上高速化されました。

:::note
この高速化効果は、より大きなデータセットやより複雑なクエリではさらに大きくなる可能性があります。サンプルについては[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::

#### さらに複雑な例 {#a-more-complex-example}

上記の例では、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) を使って、1時間ごとの単純なカウントを集計しています。単純な合計を超える統計を計算するには、別のターゲットテーブルエンジン、すなわち [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) が必要です。

1日あたりのユニーク IP アドレス数（またはユニークユーザー数）を計算したいとします。そのためのクエリは次のようになります。

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113行を取得。経過時間: 0.667秒。処理: 1037万行、4.73 GB (1553万行/秒、7.09 GB/秒)
```

インクリメンタル更新でカーディナリティのカウントを永続的に保持するには、AggregatingMergeTree が必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouse に対して集約状態が保存される列であることを示すために、`UniqueUsers` 列を型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) として定義し、部分状態の元となる集約関数（uniq）と、元の列の型（IPv4）を指定します。SummingMergeTree と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では Hour 列）。

関連するマテリアライズドビューは、先ほどのクエリを使用します。

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数の末尾に `State` サフィックスを付けている点に注目してください。これにより、関数の最終結果ではなく、集約状態が返されます。この状態には、この部分的な状態を他の状態と結合できるようにするための追加情報が含まれます。

Collector を再起動してデータを再読み込みしたら、`unique_visitors_per_hour` テーブルに 113 行のデータが存在することを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

最終的なクエリでは、関数に Merge サフィックスを付けて使用する必要があります（カラムには部分集約状態が格納されているため）:

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

ここでは `FINAL` ではなく `GROUP BY` を使用していることに注意してください。

### 高速なルックアップのためのマテリアライズドビュー（インクリメンタル）の活用 {#using-materialized-views-incremental--for-fast-lookups}

ClickHouse の並び替えキーを選択する際には、`WHERE` 句や集約句で頻繁に使用されるカラムを含めるよう、自身のアクセスパターンを考慮する必要があります。Observability のユースケースでは、単一のカラム集合には収まらない多様なアクセスパターンが存在するため、これは制約になり得ます。この点は、デフォルトの OTel スキーマに組み込まれている例で示すのが最も分かりやすいでしょう。トレース用のデフォルトスキーマを考えてみましょう。

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

このスキーマは、`ServiceName`、`SpanName`、`Timestamp` でのフィルタリングに最適化されています。トレーシングでは、特定の `TraceId` で検索し、そのトレースに関連付けられたスパンを取得できることも必要です。`TraceId` はオーダリングキーに含まれていますが、末尾に位置しているため、[フィルタリングがそれほど効率的にならない](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently) 可能性が高く、単一のトレースを取得する際に大量のデータをスキャンする必要が生じるおそれがあります。

OTel collector は、この課題に対処するためにマテリアライズドビューとそれに対応するテーブルもインストールします。テーブルとビューは次のとおりです。

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


このビューにより、テーブル `otel_traces_trace_id_ts` には各トレースの最小および最大タイムスタンプが必ず保持されるようになります。このテーブルは `TraceId` で並べ替えられているため、これらのタイムスタンプを効率的に取得できます。これらのタイムスタンプの範囲は、メインの `otel_traces` テーブルをクエリする際に利用できます。より具体的には、トレースをその ID で取得する際、Grafana は次のクエリを使用します。

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

ここでの CTE は、トレース ID `ae9226c78d1d360601e6383928e4d22d` に対する最小・最大のタイムスタンプを特定し、その結果を用いてメインの `otel_traces` テーブルをフィルタリングし、対応する span を抽出しています。

同様の手法は、同種のアクセスパターンにも適用できます。類似の例を Data Modeling の[こちら](/materialized-view/incremental-materialized-view#lookup-table)で説明しています。

### プロジェクションの使用 {#using-projections}

ClickHouseプロジェクションを使用すると、1つのテーブルに対して複数の`ORDER BY`句を指定できます。

前のセクションでは、ClickHouseでマテリアライズドビューを使用して集計を事前計算し、行を変換し、さまざまなアクセスパターンに対応したObservabilityクエリの最適化を行う方法について説明しました。

トレースIDによる検索を最適化するため、materialized viewが挿入を受け取る元のテーブルとは異なるオーダリングキーを持つターゲットテーブルに行を送信する例を示しました。

プロジェクションを使用することで同じ問題に対処でき、プライマリキーに含まれないカラムに対するクエリを最適化できます。

理論上、この機能を使用してテーブルに複数の順序キーを提供できますが、明確な欠点が1つあります。それはデータの重複です。具体的には、各プロジェクションに指定された順序に加えて、メインのプライマリキーの順序でもデータを書き込む必要があります。これにより、挿入処理が遅くなり、ディスク容量の消費量が増加します。

:::note プロジェクション vs マテリアライズドビュー
プロジェクションはマテリアライズドビューと多くの同等機能を提供しますが、使用は控えめにし、通常はマテリアライズドビューを優先すべきです。各手法の欠点と適切な使用場面を理解する必要があります。例えば、プロジェクションを集計の事前計算に使用することは可能ですが、この用途にはマテリアライズドビューの使用を推奨します。
:::

<Image img={observability_13} alt="オブザーバビリティとプロジェクション" size="md" />

以下のクエリは、`otel_logs_v2`テーブルを500エラーコードでフィルタリングします。これは、ユーザーがエラーコードでフィルタリングしたい場合のログ記録における一般的なアクセスパターンです。

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
ここでは`FORMAT Null`を使用して結果を出力していません。これにより、すべての結果が読み取られますが返されないため、LIMITによるクエリの早期終了が防止されます。これは1000万行すべてをスキャンするのに要する時間を示すためのものです。
:::

上記のクエリは、選択した順序キー `(ServiceName, Timestamp)` による線形スキャンが必要です。順序キーの末尾に `Status` を追加して上記のクエリのパフォーマンスを向上させることもできますが、プロジェクションを追加する方法もあります。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

プロジェクションは、まず作成してからマテリアライズする必要があります。このマテリアライズコマンドにより、データは異なる2つの順序でディスク上に二重に保存されます。プロジェクションは、以下に示すようにデータ作成時に定義することも可能で、その場合はデータ挿入時に自動的に維持されます。

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

重要な点として、`ALTER`によってプロジェクションを作成する場合、`MATERIALIZE PROJECTION`コマンドの発行時に作成処理は非同期で実行されます。この操作の進行状況は以下のクエリで確認でき、`is_done=1`になるまで待機してください。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを再実行すると、追加ストレージの代償としてパフォーマンスが大幅に向上していることが確認できます（測定方法については[&quot;テーブルサイズと圧縮の測定&quot;](#measuring-table-size--compression)を参照）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、先ほどのクエリで使用した列をプロジェクションで指定しています。これにより、指定したこれらの列のみがプロジェクションの一部としてディスク上に保存され、`Status` で並べ替えられます。代わりにここで `SELECT *` を使用した場合は、すべての列が保存されます。これは、任意の列の組み合わせを用いる、より多くのクエリがプロジェクションの恩恵を受けられる一方で、追加のストレージ使用量が発生することを意味します。ディスク容量と圧縮率の測定方法については、「[テーブルサイズと圧縮の測定](#measuring-table-size--compression)」を参照してください。

### Secondary/data skipping indices {#secondarydata-skipping-indices}

ClickHouse でどれだけプライマリキーを適切にチューニングしても、一部のクエリではテーブル全体のスキャンがどうしても必要になる場合があります。これはマテリアライズドビュー（および一部のクエリに対するプロジェクション）を用いることで軽減できますが、これらには追加のメンテナンスが必要であり、ユーザーがその存在を把握したうえで積極的に利用しなければなりません。従来のリレーショナルデータベースではセカンダリインデックスでこれを解決しますが、ClickHouse のようなカラム指向データベースでは非効率です。その代わり、ClickHouse では「スキップインデックス」を使用し、一致する値が存在しない大きなデータチャンクをデータベースがスキップできるようにすることで、クエリ性能を大幅に向上させます。

デフォルトの OTel スキーマは、マップ型へのアクセスを高速化しようとしてセカンダリインデックスを使用しています。これは一般的にはあまり効果的ではないと考えており、カスタムスキーマにコピーすることは推奨しませんが、スキップインデックス自体は依然として有用です。

適用を試みる前に必ず[セカンダリインデックスに関するガイド](/optimize/skipping-indexes)を読み、理解するようにしてください。

**一般的に、プライマリキーと対象となる非プライマリカラム／式との間に強い相関があり、かつ多くのグラニュールには現れないような希少な値を検索する場合に有効です。**

### テキスト検索用のブルームフィルタ {#bloom-filters-for-text-search}

オブザーバビリティクエリでは、テキスト検索を実行する必要がある場合にセカンダリインデックスが有用です。具体的には、ngramおよびトークンベースのブルームフィルタインデックスである[`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types)と[`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types)を使用することで、`LIKE`、`IN`、hasToken演算子を用いたStringカラムの検索を高速化できます。重要な点として、トークンベースのインデックスは非英数字文字を区切り文字としてトークンを生成します。これは、クエリ時にはトークン(完全な単語)のみがマッチ対象となることを意味します。より細かいマッチングを行う場合は、[N-gramブルームフィルタ](/optimize/skipping-indexes#bloom-filter-types)を使用できます。これは文字列を指定されたサイズのngramに分割するため、単語の部分一致が可能になります。

生成されるトークンを評価し、マッチングを確認するには、`tokens`関数を使用します:

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

:::note 転置インデックス
ClickHouseは、セカンダリインデックスとして転置インデックスの実験的サポートを提供しています。現時点ではログデータセットへの使用を推奨していませんが、本番環境対応が完了した際には、トークンベースのブルームフィルタに代わるものになると想定しています。
:::

この例では、構造化ログデータセットを使用します。`Referer`列に`ultra`を含むログをカウントする場合を想定します。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

ここでは、ngramサイズ3でマッチングを行う必要があります。そのため、`ngrambf_v1`インデックスを作成します。

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

ここでのインデックス `ngrambf_v1(3, 10000, 3, 7)` は4つのパラメータを取ります。最後のパラメータ（値7）はシード値を表します。その他のパラメータは、ngramサイズ（3）、値 `m`（フィルタサイズ）、およびハッシュ関数の数 `k`（7）を表します。`k` と `m` はチューニングが必要であり、一意のngram/トークンの数とフィルタが真陰性を返す確率（つまり、値がグラニュールに存在しないことを確認する確率）に基づいて設定されます。これらの値を決定するには、[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)の使用を推奨します。

適切にチューニングすれば、ここで得られる高速化は非常に大きなものになり得ます。

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
上記は説明のみを目的とした例です。トークンベースのブルームフィルターでテキスト検索を最適化しようとするのではなく、ログ挿入時に構造を抽出することを推奨します。ただし、スタックトレースやその他の大きな文字列など、構造があまり明確でないためにテキスト検索が有用となるケースもあります。
:::

ブルームフィルターを使用する際の一般的なガイドラインは次のとおりです。

ブルームフィルターの目的は、[granules](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) をフィルタリングし、列のすべての値を読み込んで線形スキャンを行う必要をなくすことです。`indexes=1` パラメータを指定した `EXPLAIN` 句を使用すると、スキップされた granule の数を確認できます。以下は、元のテーブル `otel_logs_v2` と、ngram ブルームフィルターを使用したテーブル `otel_logs_bloom` に対する結果例です。

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

ブルームフィルターは一般的に、フィルターのサイズが対象カラム自体より小さい場合にのみ高速になります。フィルターのほうが大きい場合は、パフォーマンス向上はほとんど見込めません。次のクエリを使用して、フィルターのサイズとカラムのサイズを比較してください。

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

上記の例では、セカンダリ Bloom フィルターインデックスは 12MB で、56MB のカラム自体の圧縮サイズと比べてほぼ 5 分の 1 のサイズです。

Bloom フィルターには、かなりのチューニングが必要になる場合があります。最適な設定を特定する際に有用な注意事項として、[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter) に記載されている内容に従うことを推奨します。また、Bloom フィルターは挿入時やマージ時にコストが高くなる可能性があります。本番環境に Bloom フィルターを追加する前に、挿入パフォーマンスへの影響を評価してください。

セカンダリスキップインデックスの詳細については、[こちら](/optimize/skipping-indexes#skip-index-functions) を参照してください。


### マップからの抽出 {#extracting-from-maps}

`Map` 型は OTel のスキーマで広く使われています。この型では値とキーが同じ型である必要があり、Kubernetes のラベルなどのメタデータに適しています。`Map` 型のサブキーをクエリするときは、親カラム全体が読み込まれることに注意してください。マップに多くのキーが含まれている場合、キーが個別のカラムとして存在している場合と比べてディスクから読み込むデータ量が増えるため、クエリに大きなオーバーヘッドが発生する可能性があります。

特定のキーを頻繁にクエリする場合は、それをルートレベルに専用のカラムとして切り出すことを検討してください。これは通常、よくあるアクセスパターンに応じてデプロイ後に行われる作業であり、本番稼働前に予測するのは難しい場合があります。デプロイ後にスキーマを変更する方法については、["スキーマ変更の管理"](/observability/managing-data#managing-schema-changes) を参照してください。

## テーブルサイズと圧縮の計測 {#measuring-table-size--compression}

ClickHouse が Observability 用途に利用される主な理由の 1 つは圧縮です。

ストレージコストを大幅に削減できるだけでなく、ディスク上のデータ量が少ないほど I/O が減り、クエリの実行やデータ挿入が高速になります。I/O 削減の効果は、CPU に対する圧縮アルゴリズムのオーバーヘッドを上回ります。したがって、ClickHouse のクエリを高速に保つためのチューニングを行う際には、まずデータの圧縮効率を高めることに注力すべきです。

圧縮の計測に関する詳細は[こちら](/data-compression/compression-in-clickhouse)を参照してください。