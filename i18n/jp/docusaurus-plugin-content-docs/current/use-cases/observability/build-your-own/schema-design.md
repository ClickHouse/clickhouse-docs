---
'title': 'スキーマ設計'
'description': '可観測性のためのスキーマ設計の設計'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'slug': '/use-cases/observability/schema-design'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';



# 可観測性のためのスキーマ設計

ユーザーには、以下の理由からログとトレースのために常に独自のスキーマを作成することをお勧めします：

- **主キーの選択** - デフォルトのスキーマは特定のアクセスポイントに最適化された `ORDER BY` を使用します。アクセスパターンがこれに一致する可能性は低いです。
- **構造の抽出** - ユーザーは既存のカラム（例：`Body` カラム）から新しいカラムを抽出したい場合があります。これは、マテリアライズされたカラム（およびより複雑な場合にはマテリアライズドビュー）を使用して行うことができます。これにはスキーマ変更が必要です。
- **マップの最適化** - デフォルトのスキーマは属性のストレージにマップ型を使用しています。これらのカラムは任意のメタデータのストレージを可能にします。これは重要な機能ですが、イベントからのメタデータは通常事前に定義されておらず、ClickHouseのような強く型付けされたデータベースに他の方法で格納できないため、マップのキーとその値へのアクセスは通常のカラムへのアクセスほど効率的ではありません。これに対処するため、スキーマを修正し、最も一般的にアクセスされるマップキーをトップレベルのカラムとして確保する必要があります - 詳細は ["SQLでの構造の抽出"](#extracting-structure-with-sql) を参照してください。これにはスキーマ変更が必要です。
- **マップキーアクセスの簡素化** - マップ内のキーにアクセスするには、より冗長な構文が必要です。ユーザーはエイリアスを使用してこれを軽減できます。クエリを簡素化するために ["エイリアスの使用"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマはマップへのアクセスを迅速化し、テキストクエリを加速するためにセカンダリインデックスを使用します。これらは通常必要なく、追加のディスクスペースを消費します。使用することはできますが、それが必要であることがテストされるべきです。詳細は ["セカンダリ/データスキッピングインデックス"](#secondarydata-skipping-indices) を参照してください。
- **コーデックの使用** - ユーザーは、予想されるデータを理解し、これが圧縮を改善する証拠を持っている場合、カラムのコーデックをカスタマイズしたい場合があります。

_上記の各ユースケースを以下で詳しく説明します。_

**重要**：ユーザーは最適な圧縮とクエリパフォーマンスを達成するためにスキーマを拡張および修正することを奨励されていますが、可能な限り基本カラムに対してOTelスキーマ命名に従うべきです。ClickHouse Grafanaプラグインは、クエリ構築を支援するためにいくつかの基本的なOTelカラムの存在を想定しています（例：TimestampおよびSeverityText）。ログとトレースに必要なカラムはここに文書化されています [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [ここ](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) にそれぞれ示されています。これらのカラム名を変更し、プラグイン設定でデフォルトをオーバーライドすることもできます。

## SQLでの構造の抽出 {#extracting-structure-with-sql}

構造化されたログや非構造化されたログを取り込む際、ユーザーには次の能力が必要です：

- **文字列ブロブからカラムを抽出**。これらをクエリする方が、クエリ時に文字列操作を使用するよりも速くなります。
- **マップからキーを抽出**。デフォルトスキーマは任意の属性をマップ型のカラムに配置します。この型はスキーマなしの機能を提供し、ログとトレースを定義する際にユーザーが属性のカラムを事前に定義する必要がないという利点があります - Kubernetesからログを収集する際には、ポッドラベルが後での検索のために保持されることが必要であるため、しばしばこれは不可能です。マップキーとその値へのアクセスは、通常のClickHouseカラムでクエリするよりも遅くなるため、マップからルートテーブルカラムへのキーの抽出がしばしば望ましいです。

以下のクエリを考えてみましょう：

構造化ログを使用して、最もPOSTリクエストを受け取るURLパスをカウントしたいとします。JSONブロブは、`Body` カラム内に文字列として保存されています。さらに、ユーザーがコレクタ内でjson_parserを有効にしている場合、`LogAttributes` カラム内に `Map(String, String)` としても保存されるかもしれません。

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

`LogAttributes` が利用可能であると仮定した場合、サイトのどのURLパスが最もPOSTリクエストを受け取るかをカウントするためのクエリは次の通りです：

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

ここでのマップ構文の使用に注意してください。例：`LogAttributes['request_path']` と、URLからクエリパラメータを削除するための [`path` 関数](/sql-reference/functions/url-functions#path) の使用です。

ユーザーがコレクタでJSON解析を有効にしていない場合、`LogAttributes` は空になり、`Body` の文字列からカラムを抽出するために [JSON関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note ClickHouseによる解析を優先
通常、構造化ログのJSON解析をClickHouseで行うことをお勧めします。ClickHouseが最も高速なJSON解析実装であると自信を持っています。ただし、ユーザーはログを他のソースに送信したい場合や、このロジックがSQLに存在しないことを望む場合があることを認識しています。
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

同様のことを非構造化ログにも考慮しましょう：

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

非構造化ログの同様のクエリでは、[`extractAllGroupsVertical` 関数](/sql-reference/functions/string-search-functions#extractallgroupsvertical)を使用するために正規表現が必要です。

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

非構造化ログの解析のクエリの複雑さとコストの増加（パフォーマンスの違いに注意）から、できるだけ構造化ログを使用することをお勧めします。

:::note 辞書の考慮
上記のクエリは、正規表現辞書を利用するように最適化できます。詳細については [辞書の使用](#using-dictionaries) を参照してください。
:::

これらのユースケースの両方は、ClickHouseを使用して上記のクエリロジックを挿入時に移動させることで満たすことができます。以下にいくつかのアプローチを探ります，各アプローチが適切な場合について強調します。

:::note OTelまたはClickHouseによる処理？
ユーザーは、[ここ](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)で説明されているOTel Collectorプロセッサやオペレータを使用して処理を行うこともできます。ほとんどのケースで、ユーザーはClickHouseがコレクタのプロセッサよりもかなりリソース効率が良く、速いことを発見します。すべてのイベント処理をSQLで行う主な欠点は、ソリューションがClickHouseに結合されてしまうことです。例えば、ユーザーはOTelコレクタから他の宛先へ処理されたログを送信したい場合があります（例：S3）。
:::

### マテリアライズされたカラム {#materialized-columns}

マテリアライズされたカラムは、他のカラムから構造を抽出するための最もシンプルな解決策を提供します。このようなカラムの値は、挿入時に常に計算され、INSERTクエリで指定することはできません。

:::note オーバーヘッド
マテリアライズされたカラムは、挿入時に値が新しいカラムに抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズされたカラムは、任意のClickHouse式をサポートし、[文字列処理](/sql-reference/functions/string-functions)のための任意の分析関数を利用し（[正規表現と検索](/sql-reference/functions/string-search-functions)や[URL](/sql-reference/functions/url-functions)を含む）、[型変換](/sql-reference/functions/type-conversion-functions)、[JSONから値の抽出](/sql-reference/functions/json-functions)、または[数学的操作](/sql-reference/functions/math-functions)を行います。

基本的な処理にはマテリアライズされたカラムを推奨します。これらは、マップから値を抽出し、ルートカラムに昇格させ、型変換を行うのに特に便利です。非常に基本的なスキーマやマテリアライズドビューと組み合わせて使用される場合に最も役立つことがあります。次のスキーマを考慮してください。これは、コレクタによって`LogAttributes` カラムにJSONが抽出されたものです：

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

文字列 `Body` からJSON関数を使用して抽出するための同等のスキーマは、[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==) で見つかります。

私たちの3つのマテリアライズされたカラムは、リクエストページ、リクエストタイプ、およびリファラーのドメインを抽出しています。これらはマップキーにアクセスし、その値に関数を適用します。次のクエリは大幅に高速になります：

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
マテリアライズされたカラムは、デフォルトでは `SELECT *` で返されません。これは、 `SELECT *` の結果が常にINSERTを使用してテーブルに戻すことができるという不変性を保持するためです。この動作は、`asterisk_include_materialized_columns=1` を設定することによって無効にでき、Grafanaでは（データソース設定の `追加設定 -> カスタム設定` を参照）有効にできます。
:::

## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views)は、ログやトレースに対してSQLフィルタリングと変換を適用するより強力な手段を提供します。

マテリアライズドビューは、ユーザーがクエリ時の計算コストを挿入時に移行することを可能にします。ClickHouseのマテリアライズドビューは、データが挿入される際にテーブルのブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、別の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt="Materialized view" size="md"/>

:::note リアルタイム更新
ClickHouseのマテリアライズドビューは、基づくテーブルにデータが流入する際にリアルタイムで更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースでは、マテリアライズドビューは通常、クエリの静的スナップショットであり、更新が必要です（ClickHouseのリフレッシュ可能なマテリアライズドビューに似ています）。
:::

マテリアライズドビューに関連付けられたクエリは、理論的には任意のクエリ、集計を含むことができますが、[ジョインに制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログやトレースに必要な変換やフィルタリングの負荷に対して、ユーザーは任意の `SELECT` 文を考慮することができます。

ユーザーは、クエリは挿入される行に対して実行されるトリガーに過ぎず（ソーステーブル）、結果は新しいテーブル（ターゲットテーブル）に送信されることを覚えておくべきです。

データを二重に永続化しないためには (ソーステーブルとターゲットテーブルで)、ソーステーブルのテーブルエンジンを[Nullテーブルエンジン](/engines/table-engines/special/null) に変更し、元のスキーマを保持することができます。私たちのOTelコレクタは、このテーブルにデータを送信し続けます。例えば、ログの場合、`otel_logs` テーブルは次のようになります：

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

Nullテーブルエンジンは強力な最適化です - `/dev/null` と考えてください。このテーブルはデータを保存しませんが、接続されたマテリアライズドビューは、行が破棄される前に挿入された行に対して実行されます。

次のクエリを考慮してください。これにより、私たちの行は、リクエストオブジェクトを保持したいフォーマットに変換され、 `LogAttributes` からすべてのカラムを抽出します（これがコレクタによって`json_parser` オペレータを使用して設定されていると仮定します）。 `SeverityText` と `SeverityNumber` を設定します（いくつかのシンプルな条件と[これらのカラムの定義](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)に基づきます）。このケースでは、私たちはまた、通常補充されるカラムのみを選択しています - `TraceId`、`SpanId`、`TraceFlags` などのカラムは無視しています。

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

上記で `Body` カラムも抽出しています - 後で追加の属性が追加される場合に備えて、私たちのSQLによって抽出されない可能性があります。このカラムはClickHouseでうまく圧縮されるべきで、滅多にアクセスされないため、クエリパフォーマンスに影響を与えません。最後に、タイムスタンプをDateTimeに減少させます（スペースを節約するためです - 詳細は ["型の最適化"](#optimizing-types) を参照してください）。

:::note 条件式
上記で `SeverityText` と `SeverityNumber` を抽出するために条件式が使用されていることに注意してください。これらは複雑な条件を形成し、マップで値が設定されているかどうかをチェックするために非常に役立ちます - 私たちはすべてのキーが `LogAttributes` に存在すると単純に仮定しています。ユーザーがそれに慣れることをお勧めします - これは、[null値](/sql-reference/functions/functions-for-nulls) を処理するための関数と共にログ解析の友です！
:::

これらの結果を受け取るためにテーブルが必要です。以下のターゲットテーブルは、上記のクエリと一致します：

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

ここで選択された型は、["型の最適化"](#optimizing-types) で議論された最適化に基づいています。

:::note
私たちのスキーマが劇的に変更されたことに注意してください。実際には、ユーザーは保持したいトレースカラムや `ResourceAttributes` カラム（通常はKubernetesメタデータを含む）も持つ可能性があります。Grafanaはトレースカラムを活用してログとトレース間のリンク機能を提供できます - 詳細は ["Grafanaの使用"](/observability/grafana) を参照してください。
:::

以下に、 `otel_logs_mv` というマテリアライズドビューを作成します。これは、`otel_logs` テーブルに対して上記のセレクトを実行し、その結果を `otel_logs_v2` に送信します。

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

これは、以下のように視覚化されます：

<Image img={observability_11} alt="Otel MV" size="md"/>

現在、["ClickHouseへのエクスポート"](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用したコレクターの設定を再起動すると、必要なフォーマットで `otel_logs_v2` にデータが表示されます。型付きJSON抽出関数を使用していることに注意してください。

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

`Body` カラムからJSON関数を使用してカラムを抽出する、同等のマテリアライズドビューが以下に示されています：

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

上記のマテリアライズドビューは、特に `LogAttributes` マップを使用する場合、暗黙のキャストに依存しています。ClickHouseは、抽出された値をターゲットテーブルの型に透明にキャストすることがよくあり、必要な構文を減らします。しかし、ユーザーは常に、そのビューの `SELECT` 文を使用して、同じスキーマを持つターゲットテーブルに対する [`INSERT INTO`](/sql-reference/statements/insert-into) 文を使用して、自分のビューをテストすることをお勧めします。これは、型が正しく処理されていることを確認するはずです。特に注意すべきケースは次の通りです：

- マップ内にキーが存在しない場合、空の文字列が返されます。数値の場合、ユーザーはこれを適切な値にマッピングする必要があります。これには [条件式](/sql-reference/functions/conditional-functions) 例えば `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` や、デフォルト値が許容される場合には [キャスト関数](/sql-reference/functions/type-conversion-functions) を使用できます。例えば `toUInt8OrDefault(LogAttributes['status'] )`
- 一部の型は常にキャストされない場合があります。例えば、数値の文字列表現は enum 値にキャストされません。
- JSON抽出関数は、値が見つからない場合、その型のデフォルト値を返します。これらの値が意味を持つことを確認してください！

:::note Nullableを避ける
ClickHouseでの可観測性データに対して [Nullable](/sql-reference/data-types/nullable) を使用することを避けてください。ログやトレースにおいて空とnullを区別する必要はほとんどありません。この機能は追加のストレージオーバーヘッドを引き起こし、クエリパフォーマンスに悪影響を与えます。詳細については [こちら](https://data-modeling/schema-design#optimizing-types) を参照してください。
:::

## 主（順序）キーの選択 {#choosing-a-primary-ordering-key}

望ましいカラムを抽出したら、順序/主キーの最適化を開始できます。

順序キーを選択するのに役立ついくつかの簡単なルールが適用できます。以下の点は、場合によっては衝突する可能性があるため、順に考慮してください。ユーザーは、このプロセスから複数のキーを特定でき、この数は通常4〜5あれば十分です：

1. 一般的なフィルターやアクセスパターンに沿ったカラムを選択します。ユーザーが通常、特定のカラム（例：ポッド名）でフィルタリングして可観測性の調査を開始する場合、このカラムは `WHERE` 節で頻繁に使用されます。これらをキーに含めることを優先し、使用頻度の低いものよりも重視します。
2. フィルタリング時にデータの大部分を除外するのに役立つカラムを優先することで、読み込む必要のあるデータ量を減らします。サービス名やステータスコードは、しばしば良い候補です。この場合、ユーザーがほとんどの行を除外する値でフィルタリングする場合に限ります。例：200sでフィルタリングすることは、ほとんどのシステムでほとんどの行に一致しますが、500エラーは小さなサブセットに対応します。
3. テーブル内の他のカラムと高い相関性を持つ可能性のあるカラムを優先します。これにより、これらの値が連続して格納され、圧縮が向上します。
4. 並べ替えキーのカラムに対する `GROUP BY` および `ORDER BY` 操作は、メモリ効率を向上させられます。

<br />

順序キーのカラムのサブセットを特定したら、特定の順序で宣言する必要があります。この順序は、セカンダリキーのカラムに対するフィルタリングの効率と、テーブルのデータファイルの圧縮率の両方に大きく影響します。一般に、キーは **基数の増加順に並べるのが最適です** 。この点を踏まえて、順序キーの後に出現するカラムでフィルタリングすることは、最初に出現するタプルのカラムでフィルタリングするよりも効率が低下します。これらの動作を調整し、自身のアクセスパターンを考慮してください。最も重要なことは、バリアントをテストすることです。順序キーの理解と最適化については、[この記事](/guides/best-practices/sparse-primary-indexes) を参照することをお勧めします。

:::note 構造が最初
ログを構造化した後で順序キーを決定することをお勧めします。順序キーやJSON抽出式のために属性マップ内のキーを使用しないでください。順序キーをテーブルのルートカラムとして持っていることを確認してください。
:::

## マップの使用 {#using-maps}

前の例では、 `Map(String, String)` カラム内の値にアクセスするために `map['key']` のマップ構文の使用を示しています。ネストされたキーにアクセスするためのマップ表記に加えて、これらのカラムをフィルタリングまたは選択するための特殊なClickHouseの [マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys) も利用可能です。

例えば、次のクエリは [`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) を使用して `LogAttributes` カラムで使用可能なすべてのユニークキーを特定し、それに続いて [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を使用します。

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

:::note ドットを避ける
マップカラム名にドットを使用することは推奨しません。また、その使用は非推奨になる可能性があります。代わりに `_` を使用してください。
:::

## エイリアスの使用 {#using-aliases}

マップ型をクエリすることは、通常のカラムをクエリするよりも遅くなります - 詳細は ["クエリの加速"](#accelerating-queries) を参照してください。加えて、構文がより複雑で、ユーザーが記述する際に面倒です。この後者の問題に対処するために、エイリアスカラムを使用することを推奨します。

ALIASカラムはクエリ時に計算され、テーブルに保存されません。そのため、この型のカラムに値をINSERTすることは不可能です。エイリアスを使用することで、マップキーを参照し、構文を簡素化し、マップエントリを通常のカラムとして透過的に公開できます。次の例を考慮してください：

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

いくつかのマテリアライズされたカラムと、マップ `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` があります。これにより、`LogAttributes['remote_addr']` の値をこのカラムを介してクエリでき、クエリが簡素化されます。すなわち、

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

さらに、 `ALIAS` を追加することは、 `ALTER TABLE` コマンドを使用して簡単です。このカラムはすぐに使用可能です。例えば、

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

:::note デフォルトでエイリアスを除外
デフォルトでは、 `SELECT *` はエイリアスカラムを除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::

## 型の最適化 {#optimizing-types}

ClickHouseの型最適化に関する[一般的なベストプラクティス](/data-modeling/schema-design#optimizing-types)がClickHouseのユースケースに適用されます。

## コーデックの使用 {#using-codecs}

型の最適化に加えて、ユーザーはClickHouseの可観測性スキーマに対して圧縮を最適化する際の[一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に従うことができます。

一般に、ユーザーは `ZSTD` コーデックがログおよびトレースデータセットに非常に適用可能であることに気付くでしょう。デフォルト値の1から圧縮値を増加させると、圧縮が改善される可能性があります。ただし、これはテストされるべきであり、高い値は挿入時にCPUオーバーヘッドを増加させます。通常、この値を増加させても大きな利点は見られません。

さらに、タイムスタンプは圧縮に対してデルタエンコーディングの恩恵を受けますが、このカラムが主キー/順序キーで使用される場合、クエリパフォーマンスが遅くなることが示されています。ユーザーは、それぞれの圧縮とクエリパフォーマンスのトレードオフを評価することをお勧めします。

## 辞書の使用 {#using-dictionaries}

[辞書](/sql-reference/dictionaries)は、さまざまな内部および外部の[ソース](/sql-reference/dictionaries#dictionary-sources)からのデータのインメモリ[キー-値](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)表現を提供するClickHouseの[重要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)です。これは、超低遅延_lookup_クエリに最適化されています。

<Image img={observability_12} alt="Observability and dictionaries" size="md"/>

これは、取り込まれたデータをフライで強化することや、クエリのパフォーマンス全般を改善し、特にJOINが利益を得ることから便利です。可観測性のユースケースではJOINはまれですが、辞書はエンリッチメントの目的での両方（挿入時およびクエリ時）に便利です。以下に両方の例を示します。

:::note JOINを加速
辞書を使用してJOINを加速したいユーザーは、[こちら](/dictionary)で詳細を見つけることができます。
:::

### 挿入時とクエリ時 {#insert-time-vs-query-time}

辞書は、データセットをクエリ時または挿入時に強化するために使用できます。これらのアプローチにはそれぞれ長所と短所があります。要約すると：

- **挿入時** - 暖駄入値が変わらず、辞書を埋めるために使用できる外部ソースに存在する場合に通常適切です。この場合、挿入時に行を強化することで、辞書へのクエリ時のルックアップが回避されます。これは、挿入パフォーマンスとストレージの追加オーバーヘッドのコストがかかります。なぜなら、強化された値がカラムとして保存されるからです。
- **クエリ時** - 辞書内の値が頻繁に変化する場合、クエリ時のルックアップがより適用されることが多いです。これにより、マッピングされた値が変わる場合にカラムを更新する必要がなくなります。この柔軟性は、クエリ時ルックアップコストの代償となります。これは、フィルタ条件で辞書ルックアップが必要な多くの行がある場合に通常顕著です。結果の強化（すなわち `SELECT` 時）では、このオーバーヘッドは通常顕著ではありません。

ユーザーは、辞書の基本を理解することをお勧めします。辞書は、専用の[専門関数](/sql-reference/functions/ext-dict-functions#dictgetall)を使用して値を取得するためのインメモリルックアップテーブルを提供します。

簡単な強化の例については、[こちらの辞書ガイド](https://dictionary)を参照してください。以下では、一般的な可観測性の強化タスクに焦点を当てます。

### IP辞書の使用 {#using-ip-dictionaries}

IPアドレスを使用してログやトレースに緯度と経度の値で地理的に強化することは、一般的な可観測性の要件です。これは、`ip_trie` 構造辞書を使用して実現できます。

私たちは、[DB-IP.com](https://db-ip.com/) によって提供される、パブリックに利用可能な [DB-IPの都市レベルデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を使用します。このデータセットは [CC BY 4.0 ライセンス](https://creativecommons.org/licenses/by/4.0/) のもとに提供されています。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データが以下のように構造化されていることがわかります：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を考慮して、[url()](/sql-reference/table-functions/url) テーブル関数を使用してデータを覗いてみましょう：

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

私たちの手を簡単にするために、[`URL()`](/engines/table-engines/special/url)テーブルエンジンを使用して、フィールド名を持つClickHouseテーブルオブジェクトを作成し、行数を確認します：

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

私たちの `ip_trie` 辞書がCIDR表記でIPアドレス範囲を表す必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

このCIDRは、次のクエリで簡潔に計算できます：

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
上記のクエリには多くのことが行われています。興味のある方は、この素晴らしい[説明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を読んでください。そうでなければ、上記はIP範囲のCIDRを計算することを受け入れてください。
:::

私たちの目的には、IP範囲、国コード、座標が必要なだけですので、新しいテーブルを作成し、私たちのGeo IPデータを挿入します：

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

ClickHouseにおいて低遅延のIPルックアップを実行するために、辞書を活用してインメモリでキーマッピングを保存します。ClickHouseは、私たちのネットワークプレフィックス（CIDRブロック）を座標と国コードにマッピングするための `ip_trie` [辞書構造](/sql-reference/dictionaries#ip_trie) を提供します。次のクエリは、このレイアウトと上記テーブルをソースとして指定します。

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

辞書から行を選択して、このデータセットがルックアップに利用可能であることを確認できます：

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
ClickHouseの辞書は、基となるテーブルデータと、上記で使用されるライフタイム句に基づいて定期的に更新されます。DB-IPデータセットの最新の変更を反映させるために、geoip_urlリモートテーブルから `geoip` テーブルにデータを再挿入するだけで辞書を更新できます。
:::

私たちの `ip_trie` 辞書にGeo IPデータが読み込まれたら（便利なことに名前も `ip_trie` です）、IPの地理的位置情報を取得するためにそれを使用できます。これは、次のように [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して実行できます：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ここでの取得速度に注意してください。これにより、ログを強化できます。この場合、**クエリ時の強化を実行**することを選びます。

元のログデータセットに戻ると、上記を使用して、国ごとに集計することができます。次の内容は、先にマテリアライズドビューから得られたスキーマを使用すると仮定します。これには、抽出された `RemoteAddress` カラムが含まれます。

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

IPと地理的な位置付けのマッピングは変更される可能性があるため、ユーザーはリクエストが発生した時点でどこから発信されたかを知りたがるでしょう - 同じアドレスの現在の地理的位置ではなく。したがって、ここではインデックス時のエンリッチメントが好まれるでしょう。これは、以下のようにマテリアライズされたカラムを使用して実行することができます。または、マテリアライズドビューの選択で行うこともできます：

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
ユーザーは、IPエンリッチメント辞書が新しいデータに基づいて定期的に更新されることを望む可能性があります。これは、辞書の `LIFETIME` 句を使用することで実現でき、これにより辞書は基底テーブルから定期的に再読み込みされます。基底テーブルを更新するには、["リフレッシュ可能なマテリアイズドビュー"](/materialized-view/refreshable-materialized-view) を参照してください。
:::

上記の国と座標は、国ごとにグループ化しフィルタリングすることを超えた視覚化機能を提供します。インスピレーションについては、["地理データの視覚化"](/observability/grafana#visualizing-geo-data) を参照してください。

### 正規表現辞書の使用（ユーザーエージェント解析） {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent)の解析は古典的な正規表現の問題であり、ログおよびトレースデータセットにおける一般的な要件です。ClickHouseは、正規表現ツリー辞書を使用して、ユーザーエージェントの効率的な解析を提供します。

正規表現ツリー辞書は、正規表現ツリーを含むYAMLファイルへのパスを提供するYAMLRegExpTree辞書ソースタイプを使用してClickHouseオープンソースで定義されています。独自の正規表現辞書を提供する場合、必要な構造の詳細は[こちら](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)で見つけることができます。以下では、[uap-core](https://github.com/ua-parser/uap-core)を使用してユーザーエージェント解析に焦点を当て、新しい辞書をサポートするCSV形式をロードします。このアプローチはOSSおよびClickHouse Cloudと互換性があります。

:::note
以下の例では、2024年6月のユーザーエージェント解析のための最新のuap-core正規表現のスナップショットを使用しています。最新のファイルは定期的に更新され、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)で見つけることができます。ユーザーは、以下で使用されるCSVファイルにロードするための手順を[こちら](https://sql-reference/dictionaries#collecting-attribute-values)で確認できます。
:::

以下のメモリテーブルを作成します。これらは、デバイス、ブラウザ、オペレーティングシステムを解析するための正規表現を保持します。

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

これらのテーブルは、以下の広くホストされているCSVファイルから、URLテーブル関数を使用してポピュレートできます：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルをポピュレートしたら、正規表現辞書をロードします。キー値をカラムとして指定する必要があります。これらはユーザーエージェントから抽出できる属性です。

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

これらの辞書をロードしたら、サンプルのユーザーエージェントを提供して新しい辞書抽出機能をテストできます：

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

ユーザーエージェントに関する規則はほとんど変化しないため、辞書は新しいブラウザ、オペレーティングシステム、デバイスに応じてのみ更新が必要です。そのため、この抽出を挿入時に実行することが理にかなっています。

この作業は、マテリアライズされたカラムまたはマテリアライズドビューを使用して実行できます。以下に、以前に使用されたマテリアライズドビューを修正します：

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

ターゲットテーブル `otel_logs_v2` のスキーマを修正する必要があります：

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

コレクタを再起動し、構造化ログを取り込んだ後、先に文書化された手順に基づいて、新しく抽出されたDevice、Browser、Osカラムをクエリできます。

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

:::note 複雑な構造に対するタプル
これらのユーザーエージェントカラムに対してタプルを使用していることに注意してください。タプルは、階層があらかじめ知られている複雑な構造に推奨されます。サブカラムは、通常のカラムと同じパフォーマンスを提供します（マップキーとは異なり）、異種型も許可されます。
:::

### Further reading {#further-reading}

辞書に関するさらなる例や詳細については、以下の記事をお勧めします：

- [高度な辞書トピック](/dictionary#advanced-dictionary-topics)
- ["辞書を使用してクエリを高速化する"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)
## Accelerating queries {#accelerating-queries}

ClickHouseは、クエリパフォーマンスを加速するためのいくつかの技術をサポートしています。最も一般的なアクセスパターンを最適化し、圧縮を最大化するために適切な主キー/順序キーを選択した後で、以下のオプションを検討する必要があります。これは通常、最小限の労力でパフォーマンスに最も大きな影響を与えます。
### Using Materialized views (incremental) for aggregations {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データ変換とフィルタリングのためのMaterialized Viewの使用について探索しました。しかし、Materialized Viewは、挿入時に集計を事前に計算し、結果を格納するためにも使用できます。この結果は、その後の挿入からの結果で更新できるため、実際には挿入時に集計を事前計算できることになります。

ここでの主なアイデアは、結果がオリジナルデータの小さな表現になることが多いということです（集計の場合は部分的なスケッチ）。ターゲットテーブルから結果を読み取るためのシンプルなクエリと組み合わせることで、元のデータで同じ計算を行うよりもクエリ時間が速くなります。

次のクエリを考えてみてください。ここで、構造化されたログを使用して時間あたりの総トラフィックを計算します：

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

これは、ユーザーがGrafanaでプロットするかもしれない一般的な折れ線グラフだと想像できます。このクエリは確かに非常に速く、データセットは10m行で、ClickHouseは速いです！しかし、これを数十億行や数兆行にスケールアップすると、理想的にはこのクエリパフォーマンスを維持したいと考えます。

:::note
このクエリは、以前のMaterialized Viewから得られる`otel_logs_v2`テーブルを使用した場合、10倍速くなります。このテーブルは、`LogAttributes`マップからサイズキーを抽出します。ここでは説明のために生データを使用しており、一般的なクエリの場合は以前のビューを使用することを推奨します。
:::

挿入時にMaterialized Viewを使用してこの計算を行う場合、結果を受け取るためのテーブルが必要です。このテーブルは、時間あたり1行のみを保持するべきです。既存の時間に対して更新が受信された場合、他のカラムは既存の時間の行にマージされる必要があります。このインクリメンタル状態のマージを行うためには、他のカラムの部分的な状態を保存する必要があります。

これには、ClickHouseの特別なエンジンタイプが必要です：SummingMergeTreeです。同じ順序キーを持つすべての行を、数値カラムの合計値を持つ1行に置き換えます。以下のテーブルは、同じ日付の行をマージし、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

Materialized Viewを示すために、`bytes_per_hour`テーブルが空で、まだデータを受け取っていないと仮定します。私たちのMaterialized Viewは`otel_logs`に挿入されたデータに対して上述の`SELECT`を実行し（これは設定されたブロックサイズで行われます）、結果を`bytes_per_hour`に送ります。構文は以下に示します：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの`TO`句は、結果が送られる場所、つまり`bytes_per_hour`を示すための重要な部分です。

OTelコレクタを再起動してログを再送信すると、`bytes_per_hour`テーブルは上述のクエリ結果でインクリメンタルにポピュレートされます。完了したら、`bytes_per_hour`のサイズを確認できます - 時間あたり1行であるべきです：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

私たちは、クエリの結果を保存することにより、ここでの行数を10m（`otel_logs`において）から113に効果的に減らしました。ここでの重要な点は、新しいログが`otel_logs`テーブルに挿入されると、それぞれの時間の`bytes_per_hour`に新しい値が送信され、それらはバックグラウンドで非同期に自動的にマージされるということです。したがって、`bytes_per_hour`は常に小さく、最新の状態を保つことができます。

行のマージが非同期であるため、ユーザーがクエリを発行したときには、時間ごとに1行以上存在する場合があります。クエリ時に未処理の行がマージされることを確実にするために、2つのオプションがあります：

- テーブル名の末尾に[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用します（上記のカウントクエリで使用したものです）。
- 我々の最終テーブルで使用されている順序キー、つまりタイムスタンプで集約し、メトリックを合計します。

通常、2番目のオプションがより効率的で柔軟性があります（テーブルは他の目的にも使用できます）が、最初のオプションは一部のクエリの場合、簡潔であることがあります。以下に両方の例を示します：

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

このことは、私たちのクエリを0.6秒から0.008秒にスピードアップしました - 75倍以上です！

:::note
これらの節約は、より大きなデータセットでより複雑なクエリの場合には、さらに大きくなることがあります。詳細な例については[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::
#### A more complex example {#a-more-complex-example}

上記の例は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)を使用して時間ごとの単純なカウントを集約しています。単純な合計を超える統計には、異なるターゲットテーブルエンジンである[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)が必要です。

ユニークなIPアドレス（またはユニークユーザー）の1日あたりの数を計算したいとします。このためのクエリは次の通りです：

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

インクリメンタル更新のために基数カウントを保持するには、AggregatingMergeTreeが必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouseが集計状態が保存されることを認識するようにするため、`UniqueUsers`カラムを[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)型として定義し、部分的な状態のソース関数（uniq）とソースカラムの型（IPv4）を指定します。SummingMergeTreeのように、同じ`ORDER BY`キー値を持つ行はマージされます（上記の例ではHourです）。

関連するMaterialized Viewは、以前のクエリを使用します：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集計関数の末尾に`State`というサフィックスを追加する点に注目してください。これにより、関数の集計状態が最終結果の代わりに返されるようになります。これには、この部分的な状態が他の状態とマージされるのを許可する追加情報が含まれます。

データがコレクターの再起動を通じて再読み込みされた後、`unique_visitors_per_hour`テーブルに113行が存在することを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

最終クエリでは、関数のMergeサフィックスを使用して、カラムが部分集計状態を保持していることを確認する必要があります：

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

ここで`FINAL`を使用する代わりに`GROUP BY`を使用している点に注意してください。
### Using Materialized views (incremental) for fast lookups {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルタリングおよび集約句で頻繁に使用されるカラムとともにClickHouseの順序キーを選択する際に、アクセスパターンを考慮する必要があります。これは、ユーザーが多様なアクセスパターンを持ち、1つのカラムのセットにカプセル化できないObservabilityのユースケースでは制限的です。これは、デフォルトのOTelスキーマに組み込まれた例で最もよく示されます。トレースのデフォルトスキーマを考えてみましょう：

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

このスキーマは、`ServiceName`、`SpanName`、`Timestamp`によるフィルタリングに最適化されています。トレースでは、ユーザーは特定の`TraceId`によるルックアップと、関連するトレースのスパンを取得する能力も必要です。これは順序キーに存在していますが、最後に位置するため、[フィルタリングはそれほど効率的ではない](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)と考えられ、単一のトレースを取得する際に大量のデータをスキャンする必要がある可能性が高いです。

OTelコレクタは、この課題に対処するために、Materialized Viewと関連するテーブルをインストールします。テーブルとビューは以下の通りです：

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

このビューは、テーブル`otel_traces_trace_id_ts`がトレースの最小および最大タイムスタンプを持つことを効果的に保証します。このテーブルは、`TraceId`で順序付けされており、これによりタイムスタンプを効率的に取得できます。これらのタイムスタンプ範囲は、メインの`otel_traces`テーブルをクエリする際に使用できます。より具体的には、GrafanaがIDによってトレースを取得する際には、次のクエリを使用します：

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

ここでのCTEは、トレースID `ae9226c78d1d360601e6383928e4d22d` の最小および最大タイムスタンプを特定し、これを使用してメインの`otel_traces`から関連するスパンをフィルタリングします。

このアプローチは、同様のアクセスパターンに適用できます。データモデリングにおいて[こちら](/materialized-view/incremental-materialized-view#lookup-table)で類似の例を探ります。
### Using projections {#using-projections}

ClickHouseのプロジェクションは、ユーザーがテーブルに対して複数の`ORDER BY`句を指定することを可能にします。

前のセクションでは、Materialized ViewをClickHouseで使用して集計を事前計算し、行を変換し、異なるアクセスパターンに対するObservabilityクエリを最適化する方法について探求しました。

私たちは、Materialized Viewが挿入順序の異なるターゲットテーブルに行を送信する例を提供しました。これは、トレースIDによるルックアップを最適化するために使用されます。

プロジェクションは、同じ問題に対処するために使用でき、ユーザーが主キーの一部ではないカラムのクエリを最適化することを可能にします。

理論的には、この能力を使用してテーブルに対して複数の順序キーを提供することができますが、1つの独特な欠点があります：データの重複です。特に、データは、各プロジェクションの順序に加えて、メインの主キーの順序で書き込む必要があります。これにより挿入が遅くなり、ディスクスペースをより消費します。

:::note Projections vs Materialized Views
プロジェクションは、Materialized Viewと同様の多くの機能を提供しますが、後者が好まれることが多いため、控えめに使用するべきです。ユーザーは、欠点を理解し、いつそれらが適切かを知る必要があります。たとえば、プロジェクションは集計を事前計算するために使用できますが、これにはMaterialized Viewの使用を推奨します。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

次のクエリを考えてみましょう。これは、`otel_logs_v2`テーブルを500のエラーコードでフィルタリングします。これは、ユーザーがエラーコードでフィルタリングしたいと思う一般的なアクセスパターンであると思われます：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note Nullを使用してパフォーマンスを測定する
ここでは`FORMAT Null`を使用して結果を印刷していません。これにより、すべての結果を読み取ることが強制されますが、返されないため、LIMITによるクエリの早期終了を防ぎます。これは、すべての10m行をスキャンするのにかかる時間を示すだけです。
:::

上記のクエリは、選択した順序キー`(ServiceName, Timestamp)`でリニアスキャンを必要とします。上記のクエリのパフォーマンスを改善するために、`Status`を順序キーの末尾に追加することもできますが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

プロジェクションを作成するには、まずプロジェクションを作成し、その後それを物質化する必要があることに注意してください。この後者のコマンドにより、データが異なる順序でディスクに2倍に保存されます。データが作成されるときにプロジェクションを定義することもでき、以下のように、データが挿入されると自動的に維持されます。

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

重要なのは、プロジェクションが`ALTER`を介して作成される場合、`MATERIALIZE PROJECTION`コマンドが発行されたときにその作成が非同期であることです。ユーザーは、次のクエリでこの操作の進行状況を確認でき、`is_done=1`を待ちます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを繰り返すと、パフォーマンスが大幅に改善されたことがわかります。これにより追加のストレージが発生します（どうすればこれを測定できるかについては["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、プロジェクションにおいて、前のクエリで使用されたカラムを指定しています。これは、指定されたカラムのみがStatusで順序付けられた状態でプロジェクションの一部としてディスク上に保存されることを意味します。逆に、ここで`SELECT *`を使用した場合、すべてのカラムが保存されます。これにより、より多くのクエリ（カラムの任意の部分集合を使用）がプロジェクションの利点を受けることができますが、追加のストレージが発生します。ディスクスペースおよび圧縮の測定については["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください。
### Secondary/data skipping indices {#secondarydata-skipping-indices}

ClickHouseでは、主キーがどれだけ適切に調整されていても、いくつかのクエリでは必然的に全テーブルスキャンを要求します。Materialized Viewや一部のクエリのためのプロジェクションを使用することで、これを緩和することは可能ですが、これらは追加のメンテナンスを必要とし、ユーザーはその利用可能性を知っておく必要があります。しかし、従来のリレーショナルデータベースはこれを二次インデックスで解決していますが、これらはClickHouseのような列指向データベースでは効果的ではありません。代わりに、ClickHouseは「スキップ」インデックスを使用します。これにより、データベースは一致する値のない大きなデータチャンクをスキップでき、クエリパフォーマンスが大幅に向上します。

デフォルトのOTelスキーマは、マップアクセスへのアクセスを加速するために二次インデックスを使用しています。これらは一般的に効果的でないことが分かっており、カスタムスキーマにコピーすることは推奨していませんが、スキッピングインデックスは依然として有用です。

ユーザーは、適用を試みる前に[二次インデックスに関するガイド](/optimize/skipping-indexes)を読み理解することをお勧めします。

**一般的に、主キーとターゲット非主カラム/式との間に強い相関関係が存在し、ユーザーが希少な値（すなわち、多くのグラニュールに存在しない値）を検索している場合に効果的です。**
### Bloom filters for text search {#bloom-filters-for-text-search}

Observabilityクエリにおいては、ユーザーがテキスト検索を行う必要がある場合に二次インデックスが有用です。具体的には、ngramおよびトークンベースのブルームフィルターインデックス[`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types)および[`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types)は、`LIKE`、`IN`、および`hasToken`演算子を使用してStringカラム上の検索を加速するために使用できます。重要なのは、トークンベースのインデックスが、区切りとして非アルファベット文字を使用してトークンを生成することです。これにより、クエリ時にトークン（または単語全体）のみが一致します。より細かいマッチングには、[N-gram bloom filter](/optimize/skipping-indexes#bloom-filter-types)を使用できます。これにより、文字列が指定したサイズのngramsに分割され、部分単語のマッチングが可能になります。

生成されるトークンを評価するために、`tokens`関数を使用できます：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram`関数も同様の機能を提供し、ここで第二のパラメータとして`ngram`サイズを指定できます：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note Inverted indices
ClickHouseはまた、二次インデックスとしての逆インデックスの実験的サポートを持っています。現在、ログデータセットにはこれを推奨しておらず、商用環境で準備が整った際にトークンベースのブルームフィルターに取って代わることを期待しています。
:::

この例では、構造化されたログデータセットを使用します。例えば、`Referer`カラムに`ultra`を含むログをカウントしたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

ここでは、nグラムサイズ3でマッチする必要があります。したがって、`ngrambf_v1`インデックスを作成します。

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

インデックス`ngrambf_v1(3, 10000, 3, 7)`は4つのパラメータをとります。最後のパラメータ（値7）はシードを表します。他のパラメータはnグラムサイズ（3）、値`m`（フィルターサイズ）、およびハッシュ関数の数`k`（7）です。`k`と`m`は調整が必要で、ユニークなngrams/トークンの数やフィルタが真の負である確率に基づいて調整する必要があります。これらの値を確立するのに役立つ[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を推奨します。

適切に調整されれば、ここでのスピードアップはかなり重要です：

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

:::note Example only
上記は説明目的のみです。ユーザーは、トークンベースのブルームフィルターを使用してテキスト検索を最適化しようとするのではなく、挿入時にログから構造を抽出することを推奨します。ただし、ユーザーがスタックトレースやその他の大きな文字列を持っている場合、テキスト検索が有用である場合があります。
:::

ブルームフィルターを使用する際の一般的なガイドライン：

ブルームの目的は、[グラニュール](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)をフィルタリングすることであり、これによりカラムのすべての値をロードする必要がなくなり、線形走査を避けることができます。`EXPLAIN`句にパラメータ`indexes=1`を付けることにより、スキップされたグラニュールの数を特定することができます。元のテーブル`otel_logs_v2`とngramブルームフィルタを備えたテーブル`otel_logs_bloom`のレスポンスを考えてみてください。

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

ブルームフィルターは通常、カラム自体よりも小さい場合にのみ高速になります。大きい場合は、性能埋没効果を得る可能性が高いです。次のクエリを使用して、フィルターとカラムのサイズを比較できます：

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

上記の例では、二次ブルームフィルターインデックスのサイズが12MBであり、カラム自体の圧縮サイズの56MBよりも約5倍小さいことがわかります。

ブルームフィルターはかなりの調整を必要とします。最適設定を特定するのに役立つノートを[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter)に従うことを推奨します。ブルームフィルターは、挿入やマージ時にも高コストです。ユーザーは、プロダクションにブルームフィルターを追加する前に、挿入パフォーマンスへの影響を評価する必要があります。

二次スキップインデックスに関する詳細は[こちら](/optimize/skipping-indexes#skip-index-functions)で確認できます。
### Extracting from maps {#extracting-from-maps}

Map型はOTelスキーマで広く使われています。この型は、値とキーが同じ型であることを要求します - Kubernetesラベルなどのメタデータに対して十分です。Map型のサブキーをクエリする場合、親カラム全体がロードされることに注意してください。マップにキーが多い場合、キーがカラムとして存在する場合よりも、ディスクから読み取るデータ量が増え、大きなクエリペナルティがかかることがあります。

特定のキーを頻繁にクエリする場合は、それをルートに専用のカラムに移動することを検討してください。これは通常、一般的なアクセスパターンへの応答として展開後に行われるタスクであり、プロダクション前に予測するのは難しいことがあります。展開後にスキーマを変更する方法については、["スキーマ変更の管理"](/observability/managing-data#managing-schema-changes)を参照してください。
## Measuring table size & compression {#measuring-table-size--compression}

ClickHouseがObservabilityに使用される主な理由の1つは、圧縮です。

ストレージコストを大幅に削減するだけでなく、ディスク上のデータが少ないことは、I/Oの削減を意味し、より速いクエリと挿入を可能にします。I/Oの削減は、CPUに関するいかなる圧縮アルゴリズムのオーバーヘッドに対しても上回ります。したがって、データの圧縮を改善することは、ClickHouseのクエリが高速であることを確保するための最初の焦点になるべきです。

圧縮の計測に関する詳細は[こちら](/data-compression/compression-in-clickhouse)で確認できます。
