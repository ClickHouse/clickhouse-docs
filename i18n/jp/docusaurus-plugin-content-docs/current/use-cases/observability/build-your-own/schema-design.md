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


# オブザーバビリティ向けスキーマの設計

次の理由から、ログおよびトレース用には常に独自のスキーマを作成することを推奨します。

- **主キーの選択** - 既定のスキーマは、特定のアクセスパターン向けに最適化された `ORDER BY` を使用しています。これが自分たちのアクセスパターンと一致する可能性は低いでしょう。
- **構造の抽出** - ユーザーは、既存の列、たとえば `Body` 列から新しい列を抽出したい場合があります。これはマテリアライズドカラム（および、より複雑なケースではマテリアライズドビュー）を使用して実現できます。このためにはスキーマの変更が必要です。
- **Map の最適化** - 既定のスキーマは属性の保存に Map 型を使用します。これらの列は任意のメタデータを保存できます。イベントからのメタデータは事前に定義されていないことが多く、そのため ClickHouse のような強く型付けされたデータベースには通常の方法では保存できないため、この機能は不可欠です。しかし、Map のキーおよびその値へのアクセスは、通常の列へのアクセスほど効率的ではありません。これに対処するため、スキーマを変更し、最も頻繁にアクセスされる Map キーがトップレベルの列になるようにします。詳しくは「[SQL による構造の抽出](#extracting-structure-with-sql)」を参照してください。これにはスキーマの変更が必要です。
- **Map キーアクセスの単純化** - Map 内のキーにアクセスするには、より冗長な構文が必要です。ユーザーはエイリアスを用いることでこれを緩和できます。クエリを簡潔にするには「[エイリアスの使用](#using-aliases)」を参照してください。
- **セカンダリインデックス** - 既定のスキーマは、Map へのアクセスを高速化しテキストクエリを加速するためにセカンダリインデックスを使用します。これは通常必須ではなく、追加のディスク容量を消費します。使用することは可能ですが、本当に必要かどうかを確認するためにテストすべきです。「[セカンダリ / データスキッピングインデックス](#secondarydata-skipping-indices)」を参照してください。
- **Codec の利用** - 想定されるデータを理解しており、その結果として圧縮が向上するという根拠がある場合、ユーザーは列ごとに Codec をカスタマイズしたいことがあります。

_上記の各ユースケースについて、この後で詳細に説明します。_

**重要:** ユーザーが最適な圧縮率とクエリ性能を得るためにスキーマを拡張・変更することは推奨されますが、可能な限りコアとなる列については OTel スキーマの命名規則に従うべきです。ClickHouse Grafana プラグインは、クエリ作成を支援するため、Timestamp や SeverityText など、いくつかの基本的な OTel 列の存在を前提としています。ログおよびトレースに必要な列は、それぞれこちら [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) に記載されています。これらの列名は、プラグイン設定で既定値を上書きすることで変更することも可能です。



## SQL を使った構造の抽出

構造化ログでも非構造化ログでも、取り込み時にユーザーはしばしば次のようなことが必要になります。

* **文字列ブロブからカラムを抽出する**。こうして抽出したカラムに対してクエリを実行する方が、クエリ時に文字列操作を行うより高速になります。
* **マップからキーを抽出する**。デフォルトのスキーマでは、任意の属性が Map 型のカラムに格納されます。この型はスキーマレスな機能を提供し、ログやトレースを定義する際に属性用のカラムを事前定義する必要がないという利点があります。Kubernetes からログを収集し、後で検索できるようにポッドのラベルを保持したい場合など、多くの場合これは事前定義が不可能です。一方で、マップのキーとその値へアクセスするのは、通常の ClickHouse カラムに対するクエリよりも遅くなります。そのため、マップからキーを抽出してルートテーブルのカラムとして切り出すことがしばしば望ましくなります。

次のクエリを考えてみましょう。

構造化ログを使って、どの URL パスが最も多くの POST リクエストを受け取っているかを集計したいとします。JSON ブロブは `Body` カラムに String として保存されています。さらに、ユーザーがコレクターで `json_parser` を有効にしている場合には、`LogAttributes` カラム内に `Map(String, String)` としても保存されている可能性があります。

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

`LogAttributes` が利用できると仮定すると、サイト内でどの URL パスが最も多くの POST リクエストを受信しているかを集計するクエリは次のとおりです。

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

5行のセット。経過時間: 0.735秒。処理済み: 1036万行、4.65 GB (1410万行/秒、6.32 GB/秒)
ピークメモリ使用量: 153.71 MiB。
```

ここでの map 構文の使用、たとえば `LogAttributes['request_path']` や、URL からクエリパラメータを取り除くための [`path` 関数](/sql-reference/functions/url-functions#path) に注目してください。

ユーザーがコレクター側で JSON パースを有効にしていない場合、`LogAttributes` は空になり、String 型の `Body` からカラムを抽出するために [JSON 関数](/sql-reference/functions/json-functions) を使用せざるを得なくなります。

:::note JSON のパースには ClickHouse を推奨
一般的に、構造化ログの JSON パースは ClickHouse で行うことをユーザーに推奨しています。ClickHouse は最速の JSON パース実装であると確信しています。ただし、ユーザーがログを他の送信先にも送信したい場合や、このロジックを SQL に持ち込みたくない場合があることも認識しています。
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5
```


┌─path─────────────────────┬─────c─┐
│ /m/updateVariation       │ 12182 │
│ /site/productCard        │ 11080 │
│ /site/productPrice       │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 行のセット。経過時間: 0.668 秒。処理した行数: 10.37 million 行, 5.13 GB (15.52 million 行/秒, 7.68 GB/秒)。
ピークメモリ使用量: 172.30 MiB.

````

次に、非構造化ログについても同様に確認します:

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:           151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
````

非構造化ログに対して同様のクエリを実行するには、`extractAllGroupsVertical` 関数を使って正規表現を利用する必要があります。

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

5行のセット。経過時間: 1.953秒。処理済み: 1037万行、3.59 GB (531万行/秒、1.84 GB/秒)
```

非構造化ログをパースするクエリの複雑さとコストの増大（パフォーマンス差に注目）は、可能な限り構造化ログを使用することを常に推奨する理由です。

:::note 辞書の利用を検討
上記のクエリは、正規表現辞書を活用するように最適化できます。詳細は [Using Dictionaries](#using-dictionaries) を参照してください。
:::

これら 2 つのユースケースは、上記のクエリロジックを挿入時に移動することで、いずれも ClickHouse で実現できます。以下では、いくつかのアプローチを紹介し、それぞれがいつ適しているかを説明します。

:::note 処理は OTel か ClickHouse か？
ユーザーは、[こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching) で説明しているように、OTel Collector の processor や operator を使用して処理を行うこともできます。多くの場合、ユーザーは ClickHouse が collector の processor よりもはるかにリソース効率が高く高速であることに気付くはずです。すべてのイベント処理を SQL で実行することの主なデメリットは、ソリューションが ClickHouse に密結合されることです。例えば、ユーザーは処理済みログを OTel collector から S3 などの別の送信先に送信したい場合があります。
:::

### マテリアライズドカラム

マテリアライズドカラムは、他のカラムから構造を抽出するための最も単純なソリューションです。このようなカラムの値は常に挿入時に計算され、INSERT クエリで指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、値が挿入時にディスク上の新しいカラムに抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムは任意の ClickHouse の式をサポートしており、[文字列の処理](/sql-reference/functions/string-functions)（[正規表現と検索](/sql-reference/functions/string-search-functions) を含む）や [URL](/sql-reference/functions/url-functions)、[型変換](/sql-reference/functions/type-conversion-functions)、[JSON からの値の抽出](/sql-reference/functions/json-functions)、[数学演算](/sql-reference/functions/math-functions) などの分析関数を活用できます。

基本的な処理にはマテリアライズドカラムを推奨します。特に、map から値を抽出してルートカラムに昇格させたり、型変換を実行したりする場合に有用です。非常にシンプルなスキーマやマテリアライズドビューと組み合わせて使用する場合に最も役立つことが多いです。次のスキーマを検討してください。これは、collector によって JSON が `LogAttributes` カラムに抽出されたログのスキーマです。


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

String `Body` から JSON 関数を使って抽出するための同等のスキーマ定義は[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)にあります。

ここでの 3 つのマテリアライズドカラムは、リクエストページ、リクエストタイプ、およびリファラーのドメインを抽出します。これらはマップのキーにアクセスし、その値に対して関数を適用します。その結果、後続のクエリは大幅に高速に実行できます。

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
マテリアライズド列は、デフォルトでは `SELECT *` の結果に含まれません。これは、`SELECT *` の結果を常に `INSERT` によってそのままテーブルへ挿入できるという性質を保つためです。この挙動は、`asterisk_include_materialized_columns=1` を設定することで変更でき、Grafana でも有効にできます（データソース設定の `Additional Settings -> Custom Settings` を参照してください）。
:::


## マテリアライズドビュー

[マテリアライズドビュー](/materialized-views) は、ログおよびトレースに対して SQL によるフィルタリングや変換を適用する、より強力な手段を提供します。

マテリアライズドビューを用いることで、計算コストをクエリ実行時から挿入時へとシフトできます。ClickHouse のマテリアライズドビューは、テーブルにデータブロックが挿入される際にクエリを実行するトリガーにすぎません。このクエリの結果は、2 つ目の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt="マテリアライズドビュー" size="md" />

:::note リアルタイム更新
ClickHouse のマテリアライズドビューは、基盤とするテーブルにデータが流入するのに合わせてリアルタイムに更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースにおけるマテリアライズドビューは通常、クエリのスナップショットを静的に保持するものであり、（ClickHouse の Refreshable Materialized Views と同様に）リフレッシュが必要です。
:::

マテリアライズドビューに関連付けられたクエリは、理論上どのようなクエリでも構わず、集約も含めることができますが、[Join には制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログおよびトレースに必要な変換およびフィルタリングのワークロードに対しては、任意の `SELECT` 文が利用可能と考えて問題ありません。

クエリは、テーブル（ソーステーブル）に挿入される行に対して実行されるトリガーにすぎず、その結果が新しいテーブル（ターゲットテーブル）に送られるという点を理解しておく必要があります。

ソーステーブルとターゲットテーブルの両方にデータを二重に永続化しないようにするために、ソーステーブルのエンジンを [Null table engine](/engines/table-engines/special/null) に変更し、元のスキーマを維持することができます。OTel collector は引き続きこのテーブルにデータを送信します。たとえば、ログの場合、`otel_logs` テーブルは次のようになります。

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

Null テーブルエンジンは強力な最適化機構で、`/dev/null` のようなものと考えることができます。このテーブル自体はデータを一切保存しませんが、紐づけられたマテリアライズドビューは、行が破棄される前に挿入された行に対して引き続き実行されます。

次のクエリを見てみましょう。これは行を保持したい形式に変換し、`LogAttributes` からすべてのカラムを抽出します（これは `json_parser` オペレーターを使用してコレクターによって設定されていると仮定します）。さらに、`SeverityText` と `SeverityNumber` を、いくつかの単純な条件と[これらのカラム](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)の定義に基づいて設定します。この例では、値が設定されると分かっているカラムだけを選択し、`TraceId`、`SpanId`、`TraceFlags` などのカラムは無視しています。


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

また、将来、SQL で抽出していない追加属性が増えた場合に備えて、上記の `Body` カラムも抽出しています。このカラムは ClickHouse 上で高い圧縮率が期待でき、参照される頻度も低いため、クエリ性能に影響を与えることはほとんどありません。最後に、キャストを用いて Timestamp を DateTime 型に落としています（ストレージ領域を節約するため。「[型の最適化](#optimizing-types)」を参照）。

:::note Conditionals
上記では、`SeverityText` および `SeverityNumber` を抽出するために [conditionals](/sql-reference/functions/conditional-functions) を使用している点に注意してください。これらは、複雑な条件を定義したり、マップ内で値が設定されているか確認したりする際に非常に有用です。ここでは単純化のため、`LogAttributes` 内にすべてのキーが存在すると仮定しています。[null 値](/sql-reference/functions/functions-for-nulls) を扱う関数とあわせて、ログのパースにおける強力な味方となるため、ぜひ使い方に慣れておくことを推奨します。
:::

これらの結果を受け取るためのテーブルが必要です。以下のターゲットテーブルは、上記のクエリに対応しています。

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

ここで選択されている型は、[「型の最適化」](#optimizing-types)で議論した最適化に基づいています。

:::note
スキーマが大きく変更されている点に注目してください。実際には、多くのユーザーは保持しておきたいトレース用の列や、`ResourceAttributes` 列（通常は Kubernetes メタデータを含みます）も持っているはずです。Grafana はトレース列を利用して、ログとトレースを相互にリンクする機能を提供します。詳細は「[Grafana の利用](/observability/grafana)」を参照してください。
:::


以下では、マテリアライズドビュー `otel_logs_mv` を作成します。これは、`otel_logs` テーブルに対して上記の SELECT クエリを実行し、その結果を `otel_logs_v2` に書き込みます。

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

上記の内容は次のように可視化されます:

<Image img={observability_11} alt="Otel MV" size="md" />

ここで [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用した collector 設定を使って collector を再起動すると、`otel_logs_v2` に目的の形式でデータが保存されます。型付き JSON 抽出関数を使用している点に注意してください。

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

1行のセット。経過時間: 0.010秒
```

`Body` 列から JSON 関数で列を抽出する、同等のマテリアライズドビューを以下に示します：


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

### 型に注意する

上記のマテリアライズドビューは、特に `LogAttributes` マップを使用する場合に、暗黙の型変換に依存しています。ClickHouse は多くの場合、抽出された値を自動的にターゲットテーブルの型へキャストし、記述が簡潔になります。ただし、ビューを作成する際は、ビューの `SELECT` 文を、そのビューと同じスキーマを持つターゲットテーブルに対する [`INSERT INTO`](/sql-reference/statements/insert-into) 文と組み合わせて実行し、必ずテストすることを推奨します。これにより、型が正しく扱われていることを確認できます。特に次のケースには注意してください。

* マップ内にキーが存在しない場合、空文字列が返されます。数値型の場合、これらを適切な値にマッピングする必要があります。[条件関数](/sql-reference/functions/conditional-functions) を使用して実現できます（例: `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`）、もしくはデフォルト値で問題ない場合は [型変換関数](/sql-reference/functions/type-conversion-functions) を使用します（例: `toUInt8OrDefault(LogAttributes['status'] )`）
* 一部の型は常にキャストされるとは限りません。例えば、数値を表す文字列は enum 値にはキャストされません。
* JSON 抽出関数は、値が見つからない場合、その型のデフォルト値を返します。これらの値の意味が妥当であることを確認してください。

:::note Avoid Nullable
ClickHouse でオブザーバビリティデータに対して [Nullable](/sql-reference/data-types/nullable) を使用することは避けてください。ログやトレースでは、空と null を区別する必要があるケースはほとんどありません。この機能は追加のストレージオーバーヘッドを発生させ、クエリ性能に悪影響を与えます。詳細は[こちら](/data-modeling/schema-design#optimizing-types)を参照してください。
:::


## 主キー（並び替えキー）の選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出できたら、並び替えキー／主キーの最適化に取りかかれます。

並び替えキーを選択する際には、いくつかのシンプルなルールを適用できます。これらは互いに競合する場合があるため、記載順に検討してください。このプロセスから複数のキー候補を洗い出せますが、通常は4〜5個で十分です。

1. 代表的なフィルター条件およびアクセスパターンと整合するカラムを選択します。たとえば、ユーザーが Observability の調査を特定のカラム（例: ポッド名）でフィルタリングすることから始める場合、そのカラムは `WHERE` 句で頻繁に使用されます。使用頻度の低いカラムよりも、こうしたカラムを優先してキーに含めてください。
2. フィルタリングした際に全体の行数の大きな割合を除外でき、読み取る必要のあるデータ量を削減できるカラムを優先します。サービス名やステータスコードはしばしば良い候補になります。ただし後者については、ほとんどの行を除外できる値でフィルタリングする場合に限ります。たとえば、多くのシステムでは 200 台でフィルタリングするとほとんどの行にマッチしますが、500 エラーでフィルタリングするとごく一部の行にしか一致しません。
3. テーブル内の他のカラムと強く相関する可能性が高いカラムを優先します。これにより、それらの値も連続して保存されるようになり、圧縮効率が向上します。
4. 並び替えキーに含まれるカラムに対する `GROUP BY` および `ORDER BY` の処理は、よりメモリ効率よく実行できます。

<br />

並び替えキーに含めるカラムのサブセットを特定したら、それらを特定の順序で宣言する必要があります。この順序は、クエリ内で並び替えキーの先頭以外に位置するカラムのフィルタリング効率や、テーブルのデータファイルの圧縮率に大きく影響する可能性があります。一般的には、**カーディナリティ（異なる値の種類数）が小さい順にキーを並べるのが最適**です。ただし、並び替えキーの後ろに現れるカラムでのフィルタリングは、先頭付近に現れるカラムでのフィルタリングに比べて効率が下がることとのバランスを取る必要があります。これらの性質を踏まえ、アクセスパターンを考慮して調整してください。何よりも、複数のバリエーションをテストすることが重要です。並び替えキーの詳細と最適化方法については、[こちらの記事](/guides/best-practices/sparse-primary-indexes)を参照することを推奨します。

:::note まずは構造化
ログを構造化してから、並び替えキーを決定することを推奨します。属性マップ内のキーや JSON 抽出式を並び替えキーとして使用しないでください。並び替えキーとなるカラムは、必ずテーブルのトップレベルのカラムとして定義してください。
:::



## マップの使用

前の例では、`Map(String, String)` 列の値にアクセスするためにマップ構文 `map['key']` を使用する方法を示しました。ネストされたキーにアクセスするためにマップ記法を使うだけでなく、これらの列をフィルタリングしたり抽出したりするために、専用の ClickHouse の [map 関数](/sql-reference/functions/tuple-map-functions#mapkeys) も利用できます。

たとえば、次のクエリは、[`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) と、それに続く [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を使用して、`LogAttributes` 列に含まれるすべての一意なキーを特定します。

```sql
SELECT groupArrayDistinctArray(mapKeys(LogAttributes))
FROM otel_logs
FORMAT Vertical

行 1:
──────
groupArrayDistinctArray(mapKeys(LogAttributes)): ['remote_user','run_time','request_type','log.file.name','referer','request_path','status','user_agent','remote_addr','time_local','size','request_protocol']

1行が設定されました。経過時間: 1.139秒。処理済み: 563万行、2.53 GB (494万行/秒、2.22 GB/秒)
ピークメモリ使用量: 71.90 MiB。
```

:::note ドットを避ける
Map 列名でドットを使用することは推奨しておらず、今後非推奨とする可能性があります。`_` を使用してください。
:::


## エイリアスの使用

map 型に対するクエリは通常のカラムに対するクエリよりも遅くなります — [&quot;クエリの高速化&quot;](#accelerating-queries) を参照してください。加えて、構文的にもより複雑で、ユーザーが記述する際に煩雑になりがちです。この後者の問題に対処するため、ALIAS カラムの使用を推奨します。

ALIAS カラムはクエリ時に計算され、テーブル内には保存されません。そのため、この型のカラムに値を INSERT することはできません。エイリアスを使用することで、map のキーを参照して構文を簡略化し、map のエントリを通常のカラムとして透過的に扱えるようにできます。次の例を考えてみましょう。

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

いくつかのマテリアライズドカラムと、マップ `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` を定義しています。これにより、このカラム経由で `LogAttributes['remote_addr']` の値をクエリできるようになり、クエリを簡潔にできます。つまり、次のようになります。

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

5行のセット。経過時間: 0.011秒
```

さらに、`ALIAS` の追加は `ALTER TABLE` コマンドで簡単に行えます。これらのカラムは、たとえば次のようにすぐに利用できるようになります。

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

:::note デフォルトではエイリアス列は除外
デフォルトでは、`SELECT *` は ALIAS 列を除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::


## 型の最適化 {#optimizing-types}

型の最適化に関する[一般的な ClickHouse のベストプラクティス](/data-modeling/schema-design#optimizing-types)は、ClickHouse のユースケースにもそのまま適用できます。



## コーデックの使用 {#using-codecs}

データ型の最適化に加えて、ClickHouse Observability のスキーマで圧縮の最適化を行う際は、[コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)に従うとよいでしょう。

一般的に、`ZSTD` コーデックはログおよびトレースデータセットに非常に適しています。デフォルト値である 1 から圧縮レベルを上げると、圧縮率が向上する場合があります。ただし、値を高くすると挿入時の CPU オーバーヘッドが増大するため、実際に検証する必要があります。通常、この値を上げても得られる効果はわずかです。

さらに、タイムスタンプは圧縮という観点ではデルタエンコーディングの恩恵を受けますが、この列を primary key / ORDER BY キーとして使用するとクエリ性能の低下を招くことが示されています。圧縮率とクエリ性能のトレードオフを評価することを推奨します。



## 辞書の利用

[辞書](/sql-reference/dictionaries)は ClickHouse の[主要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)の 1 つであり、さまざまな内部および外部[ソース](/sql-reference/dictionaries#dictionary-sources)からのデータを、超低レイテンシーなルックアップクエリ向けに最適化されたインメモリの [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式で表現します。

<Image img={observability_12} alt="Observability and dictionaries" size="md" />

これは、インジェスト処理を遅くすることなく取り込んだデータをオンザフライでエンリッチしたり、特に JOIN が大きな恩恵を受ける形でクエリ全般のパフォーマンスを向上させたりする、さまざまなシナリオで役立ちます。
オブザーバビリティのユースケースでは JOIN が必要になることはまれですが、辞書は挿入時とクエリ時の両方でエンリッチ目的に依然として有用です。以下に両方の例を示します。

:::note JOIN を高速化する
辞書を使って JOIN を高速化したいユーザーは[こちら](/dictionary)で詳細を確認できます。
:::

### 挿入時 vs クエリ時

辞書は、クエリ時または挿入時にデータセットをエンリッチするために使用できます。これらのアプローチにはそれぞれ長所と短所があります。まとめると次のとおりです。

* **挿入時** - エンリッチに使用する値が変化せず、辞書の作成に利用できる外部ソースに存在する場合に、一般的に適しています。この場合、挿入時に行をエンリッチすることで、クエリ時に辞書をルックアップする必要がなくなります。その代わり、挿入性能の低下と、エンリッチされた値がカラムとして保存されることによる追加のストレージオーバーヘッドが発生します。
* **クエリ時** - 辞書内の値が頻繁に変化する場合は、クエリ時のルックアップの方が適していることが多いです。これにより、マッピングされた値が変化した際にカラムを更新し（およびデータを書き換え）続ける必要がなくなります。この柔軟性は、クエリ時のルックアップコストという代償を伴います。多くの行に対してルックアップが必要な場合、例えばフィルタ句で辞書ルックアップを使用する場合、このクエリ時のコストは無視できないものになります。一方、`SELECT` 内などの結果のエンリッチにおいては、このオーバーヘッドが問題になることは一般的にほとんどありません。

まずは辞書の基本について理解しておくことをおすすめします。辞書はインメモリのルックアップテーブルを提供し、専用の[関数](/sql-reference/functions/ext-dict-functions#dictgetall)を使用して値を取得できます。

簡単なエンリッチの例については、辞書に関するガイドを[こちら](/dictionary)で参照してください。以下では、一般的なオブザーバビリティのエンリッチタスクに焦点を当てます。

### IP 辞書の利用

IP アドレスを用いて、緯度・経度の値でログやトレースをジオエンリッチすることは、一般的なオブザーバビリティの要件です。これは `ip_trie` 構造の辞書を使用して実現できます。

ここでは、[DB-IP.com](https://db-ip.com/) によって [CC BY 4.0 ライセンス](https://creativecommons.org/licenses/by/4.0/) の条件で提供されている、一般公開の [DB-IP city-level dataset](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を使用します。

[README](https://github.com/sapics/ip-location-db#csv-format) から、このデータが次のような構造になっていることがわかります。

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を踏まえて、まずは [url()](/sql-reference/table-functions/url) テーブル関数を使ってデータを少し確認してみましょう。

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

作業を簡単にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使用してフィールド名を定義した ClickHouse テーブルオブジェクトを作成し、行数の合計を確認します。


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

`ip_trie` 辞書では IP アドレス範囲を CIDR 表記で表現する必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲に対する CIDR は、次のクエリで簡単に求められます。

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
上記のクエリでは多くの処理が行われています。興味がある方は、この優れた[解説](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を読んでください。そうでない場合は、上記のクエリが IP 範囲に対して CIDR を算出しているものとして理解してください。
:::

ここでの目的では、IP 範囲、国コード、および座標だけが必要なので、新しいテーブルを作成し、Geo IP データを挿入しましょう。

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

ClickHouse で低レイテンシな IP ルックアップを実行するために、Geo IP データのキーから属性へのマッピング（`key -> attributes`）をメモリ上に保持する辞書を利用します。ClickHouse は、ネットワークプレフィックス（CIDR ブロック）を座標および国コードにマッピングするための `ip_trie` [`dictionary structure`](/sql-reference/dictionaries#ip_trie) を提供しています。次のクエリでは、このレイアウトを使用し、上記のテーブルをソースとする辞書を定義します。

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

辞書から行を選択し、このデータセットがルックアップに使用可能であることを確認できます。

```sql
SELECT * FROM ip_trie LIMIT 3
```


┌─cidr───────┬─latitude─┬─longitude─┬─country&#95;code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 行の結果。経過時間: 4.662 秒。

````

:::note 定期的な更新
ClickHouseのディクショナリは、基盤となるテーブルデータと上記で使用したlifetime句に基づいて定期的に更新されます。Geo IPディクショナリをDB-IPデータセットの最新の変更に対応させるには、geoip_urlリモートテーブルから変換を適用したデータを`geoip`テーブルに再挿入するだけです。
:::

これで、Geo IPデータが`ip_trie`ディクショナリ（便宜上、同じく`ip_trie`という名前）に読み込まれたので、IPの地理的位置情報の取得に使用できます。これは、次のように[`dictGet()`関数](/sql-reference/functions/ext-dict-functions)を使用して実現できます:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
````

ここでの検索速度に注目してください。これにより、ログに付加情報を付与できます。このケースでは、**クエリ時のエンリッチメントを行う**ことを選択します。

元のログデータセットに戻ると、上記を使ってログを国別に集計できます。以下では、先ほどのマテリアライズドビューから得られるスキーマを使用していることを前提としており、そこには抽出済みの `RemoteAddress` 列が存在します。

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

IP から地理的位置へのマッピングは変化する可能性があるため、ユーザーが知りたいのは「現在そのアドレスがどの地理的位置に対応しているか」ではなく、「リクエストが行われた時点でどこから送信されたのか」であることが多いでしょう。このため、このケースではインデックス時のエンリッチメントを用いるのが望ましいと考えられます。これは、以下に示すようにマテリアライズドカラムを使用するか、マテリアライズドビューの `SELECT` 句内で実行できます。

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
ユーザーは、新しいデータに基づいて IP エンリッチメント辞書を定期的に更新したいと考えることが多いでしょう。これは、辞書の `LIFETIME` 句を使用することで実現できます。この句により、辞書は基盤となるテーブルから定期的に再読み込みされます。基盤となるテーブルの更新方法については、「[Refreshable Materialized views](/materialized-view/refreshable-materialized-view)」を参照してください。
:::

上記の国名および座標データは、単に国ごとのグルーピングやフィルタリングを行うだけでなく、さらに高度な可視化を可能にします。参考として、「[Visualizing geo data](/observability/grafana#visualizing-geo-data)」を参照してください。

### 正規表現辞書の利用（ユーザーエージェントのパース）

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent)のパースは古典的な正規表現の問題であり、ログおよびトレースベースのデータセットで一般的に求められる要件です。ClickHouse は Regular Expression Tree Dictionaries を用いて、ユーザーエージェントを効率的にパースする機能を提供します。

正規表現ツリーディクショナリは、ClickHouse オープンソースでは `YAMLRegExpTree` 辞書ソースタイプを使用して定義されます。これは、正規表現ツリーを含む YAML ファイルへのパスを指定するものです。独自の正規表現辞書を用意したい場合は、必要な構造の詳細が[こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)に記載されています。以下では、[uap-core](https://github.com/ua-parser/uap-core) を用いたユーザーエージェントのパースに焦点を当て、サポートされている CSV 形式向けに辞書をロードします。このアプローチは OSS および ClickHouse Cloud の両方で利用可能です。

:::note
以下の例では、2024 年 6 月時点の最新の uap-core のユーザーエージェントパース用正規表現のスナップショットを使用しています。最新版のファイル（随時更新）は[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)から取得できます。ユーザーは、[こちら](/sql-reference/dictionaries#collecting-attribute-values)の手順に従って、以下で使用する CSV ファイルにロードできます。
:::

以下の Memory テーブルを作成します。これらには、デバイス、ブラウザ、およびオペレーティングシステムをパースするための正規表現が格納されます。

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

これらのテーブルには、`url` テーブル関数を使用して、以下の公開されている CSV ファイルからデータを読み込むことができます。

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルが準備できたので、正規表現辞書をロードできます。キーとなる値はカラムとして指定する必要がある点に注意してください。これらが、ユーザーエージェントから抽出できる属性になります。

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


これらの辞書を読み込んだら、サンプルの User-Agent を入力して、新しい辞書抽出機能をテストできます。

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

ユーザーエージェントに関するルールが変更されることはほとんどなく、辞書の更新も新しいブラウザー、オペレーティングシステム、デバイスへの対応時にのみ必要になるため、この抽出処理はデータ挿入時に実行するのが理にかなっています。

この処理は、マテリアライズドカラムを使用して行うことも、マテリアライズドビューを使用して行うこともできます。以下では、前述で使用したマテリアライズドビューを変更します。

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

このため、ターゲットテーブル `otel_logs_v2` のスキーマを変更する必要があります。

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

コレクターを再起動し、前の手順に従って構造化ログを取り込んだら、新たに抽出された Device、Browser、OS の列に対してクエリを実行できます。


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

:::note 複雑な構造には Tuple を使用
これらのユーザーエージェントカラムで Tuple を使用している点に注目してください。Tuple は、階層があらかじめ分かっている複雑な構造に対して推奨されます。サブカラムは、異種の型を許容しつつ、通常のカラムと同等のパフォーマンスを提供します（Map のキーとは異なります）。
:::

### さらに読む

辞書に関するより多くの例と詳細については、次の記事を参照してください。

* [Advanced dictionary topics](/dictionary#advanced-dictionary-topics)
* [「Using Dictionaries to Accelerate Queries」](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
* [Dictionaries](/sql-reference/dictionaries)


## クエリの高速化

ClickHouse にはクエリパフォーマンスを向上させるためのさまざまな手法があります。以下の手法は、よく利用されるアクセスパターンを最適化し、圧縮率を最大化できる適切な primary/ordering key を選定した「後」にのみ検討してください。通常、このキー設計が、最小の労力で最大の性能向上をもたらします。

### 集計のためにマテリアライズドビュー（インクリメンタル）を利用する

前のセクションでは、データ変換やフィルタリングにマテリアライズドビューを使用する方法を説明しました。マテリアライズドビューは、挿入時に集計結果を事前計算し、その結果を保存するためにも利用できます。この結果は、その後の挿入ごとに新たな結果で更新されるため、集計処理を実質的に挿入時に前倒しして実行できます。

ここでの基本的な考え方は、結果が元データよりも小さな表現になることが多い点です（集計の場合は部分的なスケッチになります）。ターゲットテーブルから結果を読み出すためのより単純なクエリと組み合わせることで、同じ計算を元データに対して行う場合よりもクエリ時間を短縮できます。

次のクエリを考えてみましょう。ここでは、構造化ログを用いて 1 時間ごとのトラフィック合計を計算しています。

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

これが、Grafana でユーザーがよく描画する一般的な折れ線グラフだと考えられます。このクエリは確かに非常に高速です。データセットは 1,000 万行しかなく、ClickHouse 自体も高速だからです。しかし、これを数十億、数兆行までスケールさせた場合でも、このクエリ性能を維持したいところです。

:::note
このクエリは、`LogAttributes` マップから size キーを抽出する、先ほどのマテリアライズドビューによって生成される `otel_logs_v2` テーブルを使用すれば 10 倍高速になります。ここでは説明のために生データを利用していますが、このクエリがよく実行されるものであれば、先ほどのビューを使用することを推奨します。
:::

挿入時にマテリアライズドビューを使ってこれを計算したい場合、その結果を格納するためのテーブルが必要です。このテーブルは 1 時間あたり 1 行のみを保持する必要があります。既存の時間に対する更新が受信された場合、他のカラムは既存のその時間の行にマージされる必要があります。このインクリメンタルな状態のマージを行うためには、他のカラムについて部分的な状態を保存しておかなければなりません。

これには ClickHouse の特別なテーブルエンジンが必要です。SummingMergeTree です。これは、同じ並び替えキーを持つすべての行を、数値カラムについて合計された値を含む 1 行に置き換えます。次のテーブルは、同じ日付を持つ任意の行をマージし、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

マテリアライズドビューを説明するために、`bytes_per_hour` テーブルにはまだ一切データが入っていないものとします。マテリアライズドビューは、`otel_logs` に挿入されたデータに対して上記の `SELECT` を実行し（設定されたサイズのブロックごとに実行されます）、その結果を `bytes_per_hour` に書き込みます。構文は以下のとおりです。

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの `TO` 句が重要であり、結果がどこに送信されるか、つまり `bytes_per_hour` を指定しています。

OTel collector を再起動してログを再送信すると、`bytes_per_hour` テーブルは上記のクエリ結果で順次埋まっていきます。完了したら、`bytes_per_hour` のサイズを確認します。1 時間あたり 1 行になっているはずです。

```sql
SELECT count()
FROM bytes_per_hour
FINAL
```


┌─count()─┐
│     113 │
└─────────┘

結果セット 1 行。経過時間: 0.039 秒。

````

クエリ結果を保存することで、行数を実質的に1000万行(`otel_logs`内)から113行に削減しました。ここで重要なのは、`otel_logs`テーブルに新しいログが挿入されると、それぞれの時間に対応する新しい値が`bytes_per_hour`に送信され、バックグラウンドで自動的に非同期マージされることです。1時間あたり1行のみを保持することで、`bytes_per_hour`は常にコンパクトかつ最新の状態を維持します。

行のマージは非同期で行われるため、ユーザーがクエリを実行する際に1時間あたり複数の行が存在する可能性があります。クエリ実行時に未マージの行を確実にマージするには、次の2つのオプションがあります:

- テーブル名に[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用する(上記のカウントクエリで使用した方法)。
- 最終テーブルで使用されているORDER BY キー(すなわちTimestamp)で集計し、メトリクスを合計する。

通常、2番目のオプションの方が効率的で柔軟性があります(テーブルを他の用途にも使用できます)が、1番目のオプションは一部のクエリではよりシンプルです。以下に両方を示します:

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

5行が返されました。経過時間: 0.008秒。

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

5行が返されました。経過時間: 0.005秒。
````

これにより、クエリの実行時間は 0.6 秒から 0.008 秒へと短縮され、75 倍以上高速化されました。

:::note
こうした効果は、より大きなデータセットや、より複雑なクエリではさらに大きくなり得ます。例については[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::

#### さらに複雑な例

上記の例では、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) を使って、時間ごとの単純なカウントを集計しています。単純な合計を超える統計量を扱うには、別のターゲットテーブルエンジンである [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) が必要です。

1 日あたりのユニーク IP アドレス数（またはユニークユーザー数）を計算したいとします。そのためのクエリは次のとおりです。

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113行のセット。経過時間: 0.667秒。処理済み: 1037万行、4.73 GB (1553万行/秒、7.09 GB/秒)
```

インクリメンタル更新時にカーディナリティカウントを永続化するには、AggregatingMergeTree が必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```


集約状態が保存されることを ClickHouse に認識させるために、`UniqueUsers` 列を型 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) として定義し、部分状態の元となる関数（uniq）と、元の列の型（IPv4）を指定します。SummingMergeTree と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では Hour 列）。

これに対応するマテリアライズドビューでは、前述のクエリを使用します。

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数の末尾に `State` というサフィックスを付けていることに注目してください。これにより、関数の最終結果ではなく、集約の状態が返されます。この状態には、この部分的な状態を他の状態とマージできるようにするための追加情報が含まれます。

Collector を再起動してデータを再読み込みしたら、`unique_visitors_per_hour` テーブルに 113 行が存在することを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

最終的なクエリでは、関数に Merge サフィックスを付けて使用する必要があります（列には部分集約状態が保存されているため）:

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

`FINAL` を使わず、ここでは `GROUP BY` を使用している点に注意してください。

### 高速なルックアップのためのマテリアライズドビュー（インクリメンタル）の利用

ユーザーは、ClickHouse のオーダリングキーを選択する際、フィルター句や集約句で頻繁に使用されるカラムを踏まえ、自身のアクセスパターンを検討する必要があります。Observability のユースケースでは、単一のカラム集合には収まらない、より多様なアクセスパターンが存在するため、これは制約となり得ます。この点は、デフォルトの OTel スキーマに含まれる次の例を見ると分かりやすいでしょう。トレース用のデフォルトスキーマを考えてみましょう：


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

このスキーマは、`ServiceName`、`SpanName`、`Timestamp` によるフィルタリングに最適化されています。トレーシングでは、特定の `TraceId` で検索し、関連するトレースの span を取得できることも必要です。これはオーダリングキーに含まれていますが、末尾に位置しているため、[フィルタリングはそれほど効率的ではなく](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)、単一のトレースを取得する際に大量のデータをスキャンする必要が生じる可能性が高くなります。

OTel collector はこの課題に対処するために、マテリアライズドビューと関連テーブルもインストールします。テーブルとビューは次のとおりです。

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

このビューにより、テーブル `otel_traces_trace_id_ts` が各トレースに対して最小および最大のタイムスタンプを保持していることが実質的に保証されます。このテーブルは `TraceId` でソートされているため、これらのタイムスタンプを効率的に取得できます。これらのタイムスタンプ範囲は、メインの `otel_traces` テーブルをクエリする際に利用できます。より具体的には、トレースを ID で取得する場合、Grafana は次のクエリを使用します。


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

ここでの CTE は、トレース ID `ae9226c78d1d360601e6383928e4d22d` の最小および最大のタイムスタンプを特定し、その後これを使用して、対応するスパンを取得するためにメインの `otel_traces` をフィルタリングします。

同じ手法は、類似したアクセスパターンにも適用できます。データモデリングの[こちら](/materialized-view/incremental-materialized-view#lookup-table)で、類似の例を紹介しています。

### プロジェクションの利用

ClickHouse のプロジェクションを使用すると、テーブルに対して複数の `ORDER BY` 句を指定できます。

前のセクションでは、ClickHouse においてマテリアライズドビューを使用して集計を事前計算し、行を変換し、さまざまなアクセスパターン向けに Observability クエリを最適化する方法を説明しました。

例として、マテリアライズドビューが、挿入を受け付ける元のテーブルとは異なるソートキーを持つターゲットテーブルに行を送信し、trace id によるルックアップを最適化するケースを示しました。

プロジェクションは同じ問題に対処するために使用でき、プライマリキーに含まれない列に対するクエリを最適化できます。

理論的には、この機能を使用して 1 つのテーブルに複数のソートキーを提供できますが、明確な欠点が 1 つあります。それはデータの重複です。具体的には、データはメインのプライマリキーの順序に加えて、各プロジェクションで指定された順序でも書き込む必要があります。これにより、挿入が遅くなり、ディスク容量の消費も増加します。

:::note Projections vs Materialized Views
プロジェクションはマテリアライズドビューと多くの共通機能を提供しますが、使用は慎重に行うべきであり、多くの場合は後者（マテリアライズドビュー）が推奨されます。ユーザーは、そのデメリットと適用すべき状況を理解する必要があります。たとえば、プロジェクションを集計の事前計算に利用することも可能ですが、この用途にはマテリアライズドビューを使用することを推奨します。
:::

<Image img={observability_13} alt="Observability とプロジェクション" size="md" />

次のクエリを考えます。これは `otel_logs_v2` テーブルを 500 エラーコードでフィルタリングしています。これは、ユーザーがエラーコードでフィルタリングしたいと考えることが多い、ログにおける一般的なアクセスパターンである可能性があります。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note 性能測定には Null を使用する
ここでは `FORMAT Null` を使用して結果を出力しません。これにより、すべての結果が読み込まれるものの返却はされず、LIMIT によるクエリの早期終了を防ぎます。これは、1,000万行すべてをスキャンするのにかかる時間を示すためだけのものです。
:::

上記のクエリは、選択した並び替えキー `(ServiceName, Timestamp)` に対して線形スキャンを必要とします。`Status` を並び替えキーの末尾に追加して上記クエリの性能を改善することもできますが、プロジェクションを追加することも可能です。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

まずプロジェクションを作成し、その後でマテリアライズする必要があることに注意してください。後者のコマンドを実行すると、データはディスク上に 2 種類の異なる並び順で二重に保存されます。プロジェクションは、以下に示すようにデータ作成時に定義することもでき、その場合はデータ挿入時に自動的に管理されます。


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

重要なのは、`ALTER` を使用してプロジェクションを作成した場合、`MATERIALIZE PROJECTION` コマンドを発行すると、その作成処理は非同期に実行されることです。ユーザーは、次のクエリを用いてこの処理の進行状況を確認し、`is_done=1` になるまで待機できます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを再実行すると、追加のストレージを犠牲にしてパフォーマンスが大幅に向上していることが分かります（その測定方法については [&quot;テーブルサイズと圧縮の測定&quot;](#measuring-table-size--compression) を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、先ほどのクエリで使用したカラムをプロジェクション内で明示的に指定しています。これにより、プロジェクションの一部としてディスク上に保存されるのは、`Status` で並べ替えられたこれら指定カラムのみになります。代わりにここで `SELECT *` を使用した場合は、すべてのカラムが保存されます。これにより（カラムの任意の部分集合を使用する）より多くのクエリがプロジェクションの恩恵を受けられる一方で、追加のストレージが必要になります。ディスク使用量と圧縮率の計測については、[「テーブルサイズと圧縮の計測」](#measuring-table-size--compression) を参照してください。

### セカンダリインデックス / データスキップインデックス

ClickHouse では、プライマリキーをどれだけうまくチューニングしても、一部のクエリは必然的にテーブル全体のフルスキャンを必要とします。これはマテリアライズドビュー（および一部のクエリに対するプロジェクション）を使用することで軽減できますが、追加のメンテナンスが必要になるうえ、それらを活用するにはユーザーがその存在を理解している必要があります。従来のリレーショナルデータベースではセカンダリインデックスでこれを解決しますが、ClickHouse のようなカラム指向データベースではこれは効果的ではありません。その代わりに、ClickHouse は「スキップインデックス」を使用します。スキップインデックスは、マッチする値を含まない大きなデータチャンクをスキップすることで、クエリ性能を大幅に向上させることができます。

デフォルトの OTel スキーマでは、map へのアクセスを高速化する目的でセカンダリインデックスが使用されています。一般的にはこれらはあまり効果的ではないと考えており、カスタムスキーマにそのままコピーすることは推奨しませんが、スキップインデックス自体は依然として有用な場合があります。

ユーザーは、それらを適用しようとする前に、[セカンダリインデックスに関するガイド](/optimize/skipping-indexes) を読んで理解しておく必要があります。

**一般的に、スキップインデックスが有効に機能するのは、プライマリキーと対象となる非プライマリカラム／式との間に強い相関があり、かつ多くのグラニュールには現れない「まれな値」を検索している場合です。**

### テキスト検索向け Bloom フィルタ


オブザーバビリティ関連のクエリでは、ユーザーがテキスト検索を行う必要がある場合にセカンダリインデックスが有用です。具体的には、ngram ベースおよびトークンベースの Bloom フィルターインデックスである [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) と [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) を使用することで、`LIKE`、`IN`、hasToken 演算子を用いた String カラム上の検索を高速化できます。重要な点として、トークンベースのインデックスは、英数字以外の文字を区切り文字としてトークンを生成します。これは、クエリ時にはトークン（あるいは単語全体）のみがマッチ対象となることを意味します。より細かい粒度でマッチさせたい場合は、[N-gram Bloom フィルター](/optimize/skipping-indexes#bloom-filter-types) を使用できます。これは文字列を指定サイズの ngram に分割し、語の一部レベルでのマッチングを可能にします。

生成され、マッチ対象となるトークンを確認・評価するには、`tokens` 関数を使用できます。

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 関数も同様の機能を備えており、第 2 引数で `ngram` のサイズを指定できます。

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 反転インデックス
ClickHouse には、セカンダリインデックスとして反転インデックスを利用するための実験的サポートも用意されています。現時点ではログデータセットには推奨していませんが、プロダクション利用に十分な成熟度に達した段階で、トークンベースのブルームフィルタを置き換えることを想定しています。
:::

この例では、構造化ログのデータセットを使用します。`Referer` カラムに `ultra` を含むログの件数を数えたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1行のセット。経過時間: 0.177秒。処理: 1037万行、908.49 MB (5857万行/秒、5.13 GB/秒)
```

ここでは、ngram サイズを 3 にしてマッチさせる必要があります。したがって、`ngrambf_v1` インデックスを作成します。

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

ここでのインデックス `ngrambf_v1(3, 10000, 3, 7)` は 4 つのパラメータを取ります。最後の値（7）はシード値を表します。その他は、それぞれ n-gram サイズ (3)、値 `m`（フィルターサイズ）、およびハッシュ関数の数 `k`（7）を表します。`k` と `m` はチューニングが必要で、ユニークな n-gram／トークンの数と、フィルターが真のネガティブを返す（つまり、ある値がグラニュール内に存在しないことを確認できる）確率に基づいて決定されます。これらの値を決める際には、[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を使用することを推奨します。


適切にチューニングできていれば、この部分で得られる高速化効果は非常に大きくなり得ます。

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│   182   │
└─────────┘

1 row in set. Elapsed: 0.077 sec. Processed 4.22 million rows, 375.29 MB (54.81 million rows/s., 4.87 GB/s.)
ピークメモリ使用量: 129.60 KiB.
```

:::note 例のみ
上記は説明を目的とした例にすぎません。テキストベースのブルームフィルターでテキスト検索を最適化しようとするのではなく、ログ挿入時に構造化することを推奨します。ただし、スタックトレースやその他の大きな文字列のように、構造がそれほど決定的ではないためにテキスト検索が有用になるケースもあります。
:::

ブルームフィルターを使用する際の一般的なガイドライン:

ブルームフィルターの目的は、[granules](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) をフィルタリングし、列のすべての値を読み込んで線形スキャンを行う必要をなくすことです。パラメータ `indexes=1` を指定した `EXPLAIN` 句を使用すると、スキップされた granule の数を確認できます。元のテーブル `otel_logs_v2` と、ngram ブルームフィルターを適用したテーブル `otel_logs_bloom` に対する以下の応答を比較してください。

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

10行のセット。経過時間: 0.016秒

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

ブルームフィルターは、通常は列そのものより小さい場合にのみ高速に動作します。フィルターが列より大きい場合、性能向上はほとんど期待できません。次のクエリを実行して、フィルターのサイズを列と比較してください。

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
```


┌─table───────────┬─compressed&#95;size─┬─uncompressed&#95;size─┐
│ otel&#95;logs&#95;bloom │ 12.03 MiB       │ 12.17 MiB         │
└─────────────────┴─────────────────┴───────────────────┘

1 行が得られました。経過時間: 0.004 秒。

```

上記の例では、セカンダリブルームフィルタインデックスのサイズが12MBであり、カラム自体の圧縮サイズ56MBの約5分の1であることがわかります。

ブルームフィルタには大幅なチューニングが必要になる場合があります。最適な設定を特定する際には、[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter)の注意事項を参照することを推奨します。また、ブルームフィルタは挿入時およびマージ時にコストが高くなる可能性があります。本番環境にブルームフィルタを追加する前に、挿入パフォーマンスへの影響を評価してください。

セカンダリスキップインデックスの詳細については、[こちら](/optimize/skipping-indexes#skip-index-functions)を参照してください。

### マップからの抽出 {#extracting-from-maps}

Map型はOTelスキーマで広く使用されています。この型では、値とキーが同じ型である必要があり、Kubernetesラベルなどのメタデータには十分です。Map型のサブキーをクエリする際には、親カラム全体が読み込まれることに注意してください。マップに多数のキーが含まれている場合、キーが独立したカラムとして存在する場合と比較して、ディスクから読み取る必要があるデータ量が増加するため、クエリパフォーマンスに大きな影響を及ぼす可能性があります。

特定のキーを頻繁にクエリする場合は、そのキーをルートレベルの専用カラムに移動することを検討してください。これは通常、一般的なアクセスパターンに応じてデプロイ後に実施されるタスクであり、本番環境導入前に予測することは困難な場合があります。デプロイ後のスキーマ変更方法については、[「スキーマ変更の管理」](/observability/managing-data#managing-schema-changes)を参照してください。
```


## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouse がオブザーバビリティ用途で利用される主な理由の 1 つは、その圧縮機能です。

ストレージコストを劇的に削減できるだけでなく、ディスク上のデータ量が少ないほど I/O が減り、クエリや挿入が高速になります。I/O の削減効果は、CPU の観点で見た場合の圧縮アルゴリズムによるオーバーヘッドを上回ります。そのため、ClickHouse のクエリを高速化する際には、まずデータの圧縮を改善することに注力すべきです。

圧縮の測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)を参照してください。
