---
title: 'スキーマ設計'
description: 'オブザーバビリティのためのスキーマ設計'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
show_related_blogs: true
doc_type: 'guide'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';


# オブザーバビリティのためのスキーマ設計

次の理由から、ログおよびトレース用には必ず独自のスキーマを作成することを推奨します。

- **主キーの選択** - デフォルトのスキーマでは、特定のアクセスパターンに最適化された `ORDER BY` を使用しています。多くの場合、ユーザーのアクセスパターンがこれと一致することはありません。
- **構造の抽出** - 既存のカラム、たとえば `Body` カラムから新しいカラムを抽出したい場合があります。これは、マテリアライズドカラム（およびより複雑なケースではマテリアライズドビュー）を使用して実現できます。この操作にはスキーマ変更が必要です。
- **Map の最適化** - デフォルトのスキーマでは、属性の保存に Map 型を使用しています。これらのカラムは任意のメタデータを保存できます。イベントからのメタデータは事前に定義されていないことが多く、そのため ClickHouse のような強い型付けのデータベースには通常のカラムとして格納できないため、これは重要な機能です。ただし、Map のキーおよびその値へのアクセスは、通常のカラムへのアクセスほど効率的ではありません。これに対処するため、スキーマを変更し、最も頻繁にアクセスされる Map キーをトップレベルのカラムとして定義します。「[SQL による構造の抽出](#extracting-structure-with-sql)」を参照してください。この操作にはスキーマ変更が必要です。
- **Map キーアクセスの簡略化** - Map のキーへアクセスするには、より冗長な構文が必要になります。エイリアスを用いることでこれを軽減できます。クエリを簡素化するには「[エイリアスの使用](#using-aliases)」を参照してください。
- **セカンダリインデックス** - デフォルトスキーマでは、Map へのアクセス高速化およびテキストクエリの高速化にセカンダリインデックスを使用しています。これらは通常必須ではなく、追加のディスク容量を消費します。利用は可能ですが、本当に必要かどうかを確認するためにテストするべきです。「[セカンダリ / データスキップインデックス](#secondarydata-skipping-indices)」を参照してください。
- **Codecs の使用** - 予想されるデータを理解しており、圧縮の改善に有効であるという根拠がある場合、カラムごとに codec をカスタマイズしたい場合があります。

_上記の各ユースケースについて、以下で詳細に説明します。_

**重要:** 最適な圧縮およびクエリパフォーマンスを達成するためにスキーマの拡張および変更を行うことは推奨されますが、可能な限りコアカラムについては OTel スキーマの命名規則に従うべきです。ClickHouse Grafana プラグインは、クエリビルディングを支援するために、Timestamp や SeverityText など、いくつかの基本的な OTel カラムの存在を前提としています。ログおよびトレースに必要なカラムは、それぞれ [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) に文書化されています。これらのカラム名は、プラグイン設定でデフォルトを上書きすることで変更することもできます。



## SQLによる構造の抽出 {#extracting-structure-with-sql}

構造化ログまたは非構造化ログを取り込む際、ユーザーは以下の機能を必要とすることがよくあります:

- **文字列ブロブからカラムを抽出する**。これらをクエリする方が、クエリ時に文字列操作を使用するよりも高速です。
- **マップからキーを抽出する**。デフォルトのスキーマは、任意の属性をMap型のカラムに配置します。この型は、ログやトレースを定義する際に属性のカラムを事前定義する必要がないというスキーマレス機能を提供します。これは、Kubernetesからログを収集し、後の検索のためにポッドラベルを保持したい場合に、しばしば不可能となります。マップのキーとその値へのアクセスは、通常のClickHouseカラムに対するクエリよりも低速です。したがって、マップからルートテーブルカラムへキーを抽出することが望ましい場合が多くあります。

以下のクエリを考えてみましょう:

構造化ログを使用して、どのURLパスが最も多くのPOSTリクエストを受信しているかをカウントしたいとします。JSONブロブは`Body`カラムにString型として格納されています。さらに、ユーザーがコレクターでjson_parserを有効にしている場合、`LogAttributes`カラムに`Map(String, String)`として格納されることもあります。

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

`LogAttributes`が利用可能であると仮定すると、サイトのどのURLパスが最も多くのPOSTリクエストを受信しているかをカウントするクエリは次のようになります:

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

ここでは、マップ構文(例: `LogAttributes['request_path']`)と、URLからクエリパラメータを削除するための[`path`関数](/sql-reference/functions/url-functions#path)の使用に注意してください。

ユーザーがコレクターでJSON解析を有効にしていない場合、`LogAttributes`は空になり、String型の`Body`からカラムを抽出するために[JSON関数](/sql-reference/functions/json-functions)を使用する必要があります。

:::note 解析にはClickHouseを推奨
構造化ログのJSON解析は、一般的にClickHouseで実行することを推奨します。ClickHouseは最速のJSON解析実装であると確信しています。ただし、ユーザーがログを他のソースに送信し、このロジックをSQLに配置したくない場合があることも認識しています。
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
│ /m/updateVariation │ 12182 │
│ /site/productCard │ 11080 │
│ /site/productPrice │ 10876 │
│ /site/productAdditives │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5行のセット。経過時間: 0.668秒。処理済み: 1037万行、5.13 GB（1552万行/秒、7.68 GB/秒）
ピークメモリ使用量: 172.30 MiB。

````

次に、非構造化ログに対して同様の処理を考えてみましょう:

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

非構造化ログに対する同様のクエリでは、`extractAllGroupsVertical`関数による正規表現の使用が必要になります。

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

5行のセット。経過時間: 1.953秒。処理済み: 1037万行、3.59 GB（531万行/秒、1.84 GB/秒）
```

非構造化ログを解析するクエリの複雑さとコストの増加（パフォーマンスの差に注目してください）が、可能な限り構造化ログの使用を推奨する理由です。

:::note ディクショナリの検討
上記のクエリは、正規表現ディクショナリを活用することで最適化できます。詳細については、[ディクショナリの使用](#using-dictionaries)を参照してください。
:::

これらのユースケースはいずれも、上記のクエリロジックを挿入時に移動することで、ClickHouseを使用して実現できます。以下では、それぞれが適切な場面を示しながら、いくつかのアプローチを検討します。

:::note 処理にOTelとClickHouseのどちらを使用するか？
ユーザーは、[こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)で説明されているように、OTel Collectorのプロセッサとオペレータを使用して処理を実行することもできます。ほとんどの場合、ClickHouseはコレクタのプロセッサよりも大幅にリソース効率が高く、高速です。SQLですべてのイベント処理を実行する主な欠点は、ソリューションがClickHouseに依存することです。たとえば、ユーザーはOTel CollectorからS3などの代替の送信先に処理済みログを送信したい場合があります。
:::

### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出する最もシンプルなソリューションを提供します。このようなカラムの値は常に挿入時に計算され、INSERTクエリで指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、挿入時に値がディスク上の新しいカラムに抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムは、任意のClickHouse式をサポートし、[文字列処理](/sql-reference/functions/string-functions)（[正規表現と検索](/sql-reference/functions/string-search-functions)を含む）、[URL](/sql-reference/functions/url-functions)、[型変換](/sql-reference/functions/type-conversion-functions)、[JSONからの値抽出](/sql-reference/functions/json-functions)、[数学演算](/sql-reference/functions/math-functions)のための分析関数を活用できます。

基本的な処理にはマテリアライズドカラムを推奨します。マップから値を抽出してルートカラムに昇格させたり、型変換を実行したりする際に特に有用です。非常に基本的なスキーマで使用する場合、またはマテリアライズドビューと組み合わせて使用する場合に最も効果的です。コレクタによってJSONが`LogAttributes`カラムに抽出されたログの次のスキーマを考えてみましょう:


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

String `Body` から JSON 関数を使って抽出するための同等のスキーマは[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)で確認できます。

ここで定義した 3 つのマテリアライズドカラムは、リクエストページ、リクエストタイプ、およびリファラーのドメインを抽出します。これらはマップのキーにアクセスし、その値に対して関数を適用します。これに続くクエリは大幅に高速になります。

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
マテリアライズドカラムは、デフォルトでは `SELECT *` に含まれません。これは、`SELECT *` の結果を常に INSERT を使ってテーブルにそのまま挿入し直せるという不変条件を維持するためです。この挙動は `asterisk_include_materialized_columns=1` を設定することで変更でき、Grafana のデータソース設定でも有効化できます（`Additional Settings -> Custom Settings` を参照してください）。
:::


## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views)は、ログとトレースに対してSQLフィルタリングと変換を適用するための、より強力な手段を提供します。

マテリアライズドビューを使用すると、計算コストをクエリ時から挿入時へシフトできます。ClickHouseのマテリアライズドビューは、テーブルへのデータブロック挿入時にクエリを実行するトリガーです。このクエリの結果は、2番目の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt='マテリアライズドビュー' size='md' />

:::note リアルタイム更新
ClickHouseのマテリアライズドビューは、基となるテーブルへのデータ流入に応じてリアルタイムで更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースでは、マテリアライズドビューは通常、更新が必要な静的なクエリのスナップショットです(ClickHouse Refreshable Materialized Viewsに類似)。
:::

マテリアライズドビューに関連付けられたクエリは、理論的には集計を含む任意のクエリが可能ですが、[結合には制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログとトレースに必要な変換とフィルタリングのワークロードについては、任意の`SELECT`文が使用可能と考えることができます。

クエリは、テーブル(ソーステーブル)に挿入される行に対して実行されるトリガーであり、結果は新しいテーブル(ターゲットテーブル)に送信されることを覚えておく必要があります。

データを2回永続化しない(ソーステーブルとターゲットテーブルの両方に)ようにするため、ソーステーブルのテーブルエンジンを[Nullテーブルエンジン](/engines/table-engines/special/null)に変更し、元のスキーマを保持できます。OTelコレクターは引き続きこのテーブルにデータを送信します。例えば、ログの場合、`otel_logs`テーブルは次のようになります:

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

Nullテーブルエンジンは強力な最適化です - `/dev/null`のようなものと考えてください。このテーブルはデータを保存しませんが、アタッチされたマテリアライズドビューは、行が破棄される前に挿入された行に対して実行されます。

次のクエリを考えてみましょう。これは、行を保持したい形式に変換し、`LogAttributes`からすべての列を抽出し(コレクターが`json_parser`オペレーターを使用して設定したと仮定)、`SeverityText`と`SeverityNumber`を設定します(いくつかの単純な条件と[これらの列](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)の定義に基づく)。この場合、データが入力されることがわかっている列のみを選択し、`TraceId`、`SpanId`、`TraceFlags`などの列は無視します。


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
RemoteAddr:     54.36.149.41
RefererDomain:
RequestPage:    /filter/27|13 ,27|  5 ,p53
SeverityText:   INFO
SeverityNumber:  9

1行を取得しました。経過時間: 0.027秒
```

また、将来的に SQL で抽出していない追加属性が追加される可能性に備えて、上記の `Body` 列も抽出しています。この列は ClickHouse で高い圧縮率が期待でき、参照頻度も低いため、クエリ性能への影響はほとんどありません。最後に、`Timestamp` を `DateTime` にキャストして型を縮小しています（スペースを節約するため — [&quot;Optimizing Types&quot;](#optimizing-types) を参照）。

:::note Conditionals
上記で `SeverityText` と `SeverityNumber` を抽出するために [条件関数](/sql-reference/functions/conditional-functions) を使用している点に注目してください。これらは複雑な条件を定義したり、マップ内で値が設定されているかを確認したりするのに非常に有用です。ここでは単純化のため、`LogAttributes` にすべてのキーが存在すると仮定しています。ぜひこれらの関数には習熟してください。[null 値](/sql-reference/functions/functions-for-nulls) を扱う関数と並んで、ログ解析における心強い味方となります！
:::

これらの結果を書き込むためのテーブルが必要です。以下のターゲットテーブルは、上記のクエリに対応しています。

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

ここで選択されている型は、[「型の最適化」](#optimizing-types) で説明されている最適化に基づいています。

:::note
スキーマを大きく変更している点に注目してください。実際には、多くの場合、ユーザーは保持しておきたいトレース関連のカラムや、`ResourceAttributes` カラム（通常は Kubernetes メタデータを含みます）も併せて持っています。Grafana はトレースのカラムを活用し、ログとトレースを相互に行き来できるリンク機能を提供します。詳しくは「[Grafana の利用](/observability/grafana)」を参照してください。
:::


以下では、マテリアライズドビュー `otel_logs_mv` を作成します。このビューは、上記の `otel_logs` テーブルに対して先ほどの SELECT 文を実行し、その結果を `otel_logs_v2` に送信します。

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

上記は次のように可視化されます:

<Image img={observability_11} alt="Otel MV" size="md" />

ここで [&quot;Exporting to ClickHouse&quot;](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用した collector の設定を再起動すると、データは `otel_logs_v2` に所望の形式で格納されます。型付き JSON 抽出関数を利用している点に注意してください。

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

1行を取得しました。経過時間: 0.010秒
```

`Body` カラムから JSON 関数を使ってカラムを抽出することで実現した、同等の Materialized View を以下に示します。


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

上記のマテリアライズドビューは暗黙的な型変換に依存しています。特に`LogAttributes`マップを使用する場合に顕著です。ClickHouseは抽出された値をターゲットテーブルの型に透過的に変換することが多く、必要な構文を削減します。ただし、ビューの`SELECT`文を同じスキーマを持つターゲットテーブルへの[`INSERT INTO`](/sql-reference/statements/insert-into)文と組み合わせて使用し、ビューを常にテストすることを推奨します。これにより、型が正しく処理されていることを確認できます。以下のケースには特に注意が必要です:

- マップにキーが存在しない場合、空文字列が返されます。数値の場合、ユーザーはこれらを適切な値にマッピングする必要があります。これは[条件関数](/sql-reference/functions/conditional-functions)を使用して実現できます。例: `if(LogAttributes['status'] = ", 200, LogAttributes['status'])`。デフォルト値が許容される場合は[キャスト関数](/sql-reference/functions/type-conversion-functions)を使用することもできます。例: `toUInt8OrDefault(LogAttributes['status'] )`
- 一部の型は常に変換されるわけではありません。例えば、数値の文字列表現はenum値に変換されません。
- JSON抽出関数は、値が見つからない場合にその型のデフォルト値を返します。これらの値が妥当であることを確認してください!

:::note Nullableの使用を避ける
オブザーバビリティデータにおいてClickHouseで[Nullable](/sql-reference/data-types/nullable)を使用することは避けてください。ログやトレースにおいて空とnullを区別する必要があることはほとんどありません。この機能は追加のストレージオーバーヘッドを発生させ、クエリパフォーマンスに悪影響を及ぼします。詳細は[こちら](/data-modeling/schema-design#optimizing-types)を参照してください。
:::


## プライマリ（ソート）キーの選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出したら、ソートキー/プライマリキーの最適化を開始できます。

ソートキーの選択には、いくつかのシンプルなルールを適用できます。以下のルールは時に相反する場合があるため、順番に検討してください。このプロセスから複数のキーを特定できますが、通常は4～5個で十分です：

1. 一般的なフィルタやアクセスパターンに合致するカラムを選択します。ユーザーが通常、特定のカラム（例：ポッド名）でフィルタリングしてオブザーバビリティの調査を開始する場合、そのカラムは`WHERE`句で頻繁に使用されます。使用頻度の低いカラムよりも、これらをキーに含めることを優先してください。
2. フィルタリング時に全体の行の大部分を除外できるカラムを優先し、読み取る必要があるデータ量を削減します。サービス名やステータスコードは良い候補となることが多いですが、後者の場合はユーザーが大部分の行を除外する値でフィルタリングする場合に限ります。例えば、200番台でフィルタリングすると多くのシステムでほとんどの行にマッチしますが、500エラーでフィルタリングすると小さなサブセットに対応します。
3. テーブル内の他のカラムと高い相関関係を持つ可能性のあるカラムを優先します。これにより、これらの値も連続して格納されることが保証され、圧縮率が向上します。
4. ソートキーに含まれるカラムに対する`GROUP BY`および`ORDER BY`操作は、よりメモリ効率的に実行できます。

<br />

ソートキーに含めるカラムのサブセットを特定したら、それらを特定の順序で宣言する必要があります。この順序は、クエリにおけるセカンダリキーカラムのフィルタリング効率とテーブルのデータファイルの圧縮率の両方に大きく影響します。一般的に、**カーディナリティの昇順でキーを並べるのが最適**です。ただし、ソートキーの後方に現れるカラムでのフィルタリングは、タプルの前方に現れるカラムでのフィルタリングよりも効率が低くなることを考慮する必要があります。これらの動作のバランスを取り、アクセスパターンを考慮してください。最も重要なのは、バリエーションをテストすることです。ソートキーの理解とその最適化方法については、[この記事](/guides/best-practices/sparse-primary-indexes)を推奨します。

:::note 構造を優先
ログを構造化した後にソートキーを決定することを推奨します。属性マップ内のキーやJSON抽出式をソートキーに使用しないでください。ソートキーがテーブルのルートカラムとして存在することを確認してください。
:::


## マップの使用 {#using-maps}

前述の例では、`Map(String, String)` カラムの値にアクセスするためにマップ構文 `map['key']` を使用する方法を示しました。ネストされたキーにアクセスするためのマップ表記の使用に加えて、これらのカラムをフィルタリングまたは選択するための専用のClickHouse [マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys)が利用可能です。

例えば、次のクエリは [`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys)とそれに続く [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)(コンビネータ)を使用して、`LogAttributes` カラムで利用可能なすべての一意のキーを識別します。

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
Mapカラム名にドットを使用することは推奨されず、将来的に非推奨となる可能性があります。`_` を使用してください。
:::


## エイリアスの使用 {#using-aliases}

マップ型のクエリは通常のカラムのクエリよりも低速です - ["クエリの高速化"](#accelerating-queries)を参照してください。さらに、構文が複雑でユーザーが記述するのが煩雑になる可能性があります。この後者の問題に対処するため、エイリアスカラムの使用を推奨します。

ALIASカラムはクエリ時に計算され、テーブルには保存されません。したがって、このタイプのカラムに値をINSERTすることはできません。エイリアスを使用することで、マップキーを参照し、構文を簡素化し、マップエントリを通常のカラムとして透過的に公開できます。次の例を考えてみましょう:

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

複数のマテリアライズドカラムと、マップ`LogAttributes`にアクセスする`ALIAS`カラム`RemoteAddr`があります。このカラムを介して`LogAttributes['remote_addr']`の値をクエリできるようになり、クエリが簡素化されます。例えば:

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

さらに、`ALTER TABLE`コマンドを使用して`ALIAS`を追加するのは簡単です。これらのカラムは即座に利用可能になります。例えば:

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

:::note デフォルトでエイリアスは除外されます
デフォルトでは、`SELECT *`はALIASカラムを除外します。この動作は`asterisk_include_alias_columns=1`を設定することで無効化できます。
:::


## 型の最適化 {#optimizing-types}

型の最適化に関する[ClickHouseの一般的なベストプラクティス](/data-modeling/schema-design#optimizing-types)が適用されます。


## コーデックの使用 {#using-codecs}

型の最適化に加えて、ClickHouse Observabilityスキーマの圧縮を最適化する際には、[コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)を参照してください。

一般的に、`ZSTD`コーデックはログおよびトレースデータセットに非常に適しています。圧縮レベルをデフォルト値の1から増やすことで圧縮率が向上する可能性があります。ただし、値を大きくすると挿入時のCPUオーバーヘッドが増加するため、テストを行う必要があります。通常、この値を増やしても得られる効果はわずかです。

さらに、タイムスタンプは圧縮に関してデルタエンコーディングの恩恵を受けますが、このカラムをプライマリキー/ソートキーに使用するとクエリパフォーマンスが低下することが示されています。圧縮とクエリパフォーマンスのトレードオフを評価することを推奨します。


## ディクショナリの使用 {#using-dictionaries}

[ディクショナリ](/sql-reference/dictionaries)は、ClickHouseの[主要機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)であり、様々な内部および外部[ソース](/sql-reference/dictionaries#dictionary-sources)からのデータをインメモリで[キーバリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)形式で表現し、超低レイテンシの検索クエリに最適化されています。

<Image img={observability_12} alt='オブザーバビリティとディクショナリ' size='md' />

これは、取り込みプロセスを遅延させることなく取り込みデータをその場でエンリッチメントしたり、クエリのパフォーマンスを全般的に向上させたりする様々なシナリオで有用であり、特にJOINが大きな恩恵を受けます。
オブザーバビリティのユースケースでは結合が必要になることは稀ですが、ディクショナリは挿入時とクエリ時の両方でエンリッチメント目的に有用です。以下では両方の例を示します。

:::note 結合の高速化
ディクショナリを使用した結合の高速化に興味のあるユーザーは、詳細を[こちら](/dictionary)で確認できます。
:::

### 挿入時とクエリ時の比較 {#insert-time-vs-query-time}

ディクショナリは、クエリ時または挿入時にデータセットをエンリッチメントするために使用できます。これらのアプローチにはそれぞれ長所と短所があります。要約すると:

- **挿入時** - エンリッチメント値が変更されず、ディクショナリの生成に使用できる外部ソースに存在する場合に適しています。この場合、挿入時に行をエンリッチメントすることで、クエリ時のディクショナリ検索を回避できます。ただし、エンリッチメントされた値が列として保存されるため、挿入パフォーマンスの低下と追加のストレージオーバーヘッドが発生します。
- **クエリ時** - ディクショナリ内の値が頻繁に変更される場合、クエリ時の検索がより適していることが多いです。これにより、マッピングされた値が変更された場合に列を更新する(およびデータを書き換える)必要がなくなります。この柔軟性は、クエリ時の検索コストを犠牲にして得られます。このクエリ時のコストは、多数の行に対して検索が必要な場合(例えば、フィルタ句でディクショナリ検索を使用する場合)に顕著になります。結果のエンリッチメント、つまり`SELECT`句での使用では、このオーバーヘッドは通常無視できる程度です。

ユーザーはディクショナリの基本を理解することをお勧めします。ディクショナリは、専用の[特殊関数](/sql-reference/functions/ext-dict-functions#dictgetall)を使用して値を取得できるインメモリ検索テーブルを提供します。

簡単なエンリッチメントの例については、ディクショナリに関するガイドを[こちら](/dictionary)で参照してください。以下では、一般的なオブザーバビリティのエンリッチメントタスクに焦点を当てます。

### IPディクショナリの使用 {#using-ip-dictionaries}

IPアドレスを使用してログとトレースに緯度と経度の値を地理的にエンリッチメントすることは、オブザーバビリティの一般的な要件です。これは`ip_trie`構造のディクショナリを使用して実現できます。

[DB-IP.com](https://db-ip.com/)が[CC BY 4.0ライセンス](https://creativecommons.org/licenses/by/4.0/)の条件下で提供する、公開されている[DB-IP都市レベルデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly)を使用します。

[readme](https://github.com/sapics/ip-location-db#csv-format)から、データが次のように構造化されていることがわかります:

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を踏まえて、まず[url()](/sql-reference/table-functions/url)テーブル関数を使用してデータを確認してみましょう:

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

作業を簡単にするために、[`URL()`](/engines/table-engines/special/url)テーブルエンジンを使用してフィールド名を持つClickHouseテーブルオブジェクトを作成し、総行数を確認しましょう:


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
│ 3261621 │ -- 326万
└─────────┘
```

`ip_trie` 辞書では IP アドレス範囲を CIDR 表記で表す必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

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
上記のクエリでは多くの処理が行われています。詳しく知りたい方は、この優れた[解説](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を参照してください。詳細は気にしない場合は、「上記のクエリは IP レンジから CIDR を算出している」と理解して先に進んでかまいません。
:::

ここでは IP レンジ、国コード、座標だけが必要なので、新しいテーブルを作成し、Geo IP データを挿入しましょう。

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

ClickHouse で低レイテンシーな IP ルックアップを行うために、Geo IP データのキー → 属性マッピングをインメモリで保持するための辞書を利用します。ClickHouse には、ネットワークプレフィックス（CIDR ブロック）を座標および国コードにマッピングするための `ip_trie` [dictionary structure](/sql-reference/dictionaries#ip_trie) が用意されています。次のクエリでは、このレイアウトを使用し、上記のテーブルをソースとする辞書を定義します。

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

ディクショナリから行を選択して、このデータセットがルックアップに利用できることを確認できます。

```sql
SELECT * FROM ip_trie LIMIT 3
```


┌─cidr───────┬─latitude─┬─longitude─┬─country&#95;code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 行が結果セットに含まれています。経過時間: 4.662 秒。

````

:::note 定期的な更新
ClickHouseのディクショナリは、基盤となるテーブルデータと上記で使用したlifetime句に基づいて定期的に更新されます。Geo IPディクショナリをDB-IPデータセットの最新の変更内容に更新するには、geoip_urlリモートテーブルから変換を適用したデータを`geoip`テーブルに再挿入するだけです。
:::

これで`ip_trie`ディクショナリ（便利なことに同名の`ip_trie`）にGeo IPデータが読み込まれたので、IPジオロケーションに使用できます。これは次のように[`dictGet()`関数](/sql-reference/functions/ext-dict-functions)を使用して実現できます:

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
````

ここでの取得速度に注目してください。これにより、ログをリッチ化できます。今回は、**クエリ実行時にエンリッチメントを行う**ことを選択します。

元のログデータセットに戻り、上記を用いてログを国別に集約できます。以下では、先ほどのマテリアライズドビューによって得られたスキーマを使用しているものとし、そのスキーマには抽出済みの `RemoteAddress` カラムが含まれていることを前提とします。

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

IP から地理的位置へのマッピングは変更され得るため、ユーザーは同じアドレスの現在の地理的位置ではなく、「リクエストが行われた時点でどこから送信されたのか」を知りたいと考える可能性が高くなります。このため、このケースではインデックス時のエンリッチメントの方が好まれる傾向があります。これは、以下に示すようにマテリアライズドカラムを用いるか、またはマテリアライズドビューの `SELECT` 句の中で実行できます。

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
ユーザーは新しいデータに基づいてIPエンリッチメント辞書を定期的に更新したい場合があります。これは辞書の`LIFETIME`句を使用することで実現でき、基盤となるテーブルから辞書が定期的に再読み込みされます。基盤となるテーブルを更新する方法については、["リフレッシュ可能なマテリアライズドビュー"](/materialized-view/refreshable-materialized-view)を参照してください。
:::

上記の国と座標情報により、国別のグループ化やフィルタリングを超えた可視化機能が利用できます。詳細については、["地理データの可視化"](/observability/grafana#visualizing-geo-data)を参照してください。

### 正規表現辞書の使用(ユーザーエージェント解析) {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent)の解析は、正規表現を用いた古典的な問題であり、ログやトレースベースのデータセットにおける一般的な要件です。ClickHouseは、正規表現ツリー辞書を使用してユーザーエージェントの効率的な解析を提供します。

正規表現ツリー辞書は、ClickHouseオープンソースにおいてYAMLRegExpTree辞書ソースタイプを使用して定義され、正規表現ツリーを含むYAMLファイルへのパスを指定します。独自の正規表現辞書を提供する場合は、必要な構造の詳細を[こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)で確認できます。以下では、[uap-core](https://github.com/ua-parser/uap-core)を使用したユーザーエージェント解析に焦点を当て、サポートされているCSV形式で辞書を読み込みます。このアプローチはOSSとClickHouse Cloudの両方に対応しています。

:::note
以下の例では、2024年6月時点の最新のuap-core正規表現のスナップショットをユーザーエージェント解析に使用しています。最新のファイルは随時更新され、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)で確認できます。ユーザーは[こちら](/sql-reference/dictionaries#collecting-attribute-values)の手順に従って、以下で使用するCSVファイルに読み込むことができます。
:::

以下のMemoryテーブルを作成します。これらはデバイス、ブラウザ、オペレーティングシステムを解析するための正規表現を保持します。

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

これらのテーブルは、urlテーブル関数を使用して、以下の公開ホストされているCSVファイルからデータを投入できます:

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルへのデータ投入が完了したら、正規表現辞書を読み込むことができます。キー値を列として指定する必要があることに注意してください。これらはユーザーエージェントから抽出できる属性になります。

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


これらの辞書を読み込んだら、サンプルの user-agent を指定して、新しい辞書抽出機能をテストできます。

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

ユーザーエージェントに関するルールはほとんど変わらず、辞書の更新も新しいブラウザ、オペレーティングシステム、デバイスに対応する場合に限られるため、この抽出処理は挿入時に実行するのが理にかなっています。

この処理は、マテリアライズドカラムを使って行うことも、マテリアライズドビューを使って行うこともできます。以下では、先ほど使用したマテリアライズドビューを修正します。

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

コレクターを再起動して構造化ログを取り込んだら、前述の手順に従って新たに抽出された Device、Browser、Os 列をクエリできます。


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
これらのユーザーエージェントカラムでタプルが使用されていることに注目してください。タプルは、階層が事前に判明している複雑な構造に推奨されます。サブカラムは通常のカラムと同等のパフォーマンスを提供し（Mapキーとは異なり）、異種型を許容します。
:::

### 参考資料 {#further-reading}

ディクショナリに関するより詳しい例と詳細については、以下の記事を参照してください：

- [ディクショナリの高度なトピック](/dictionary#advanced-dictionary-topics)
- [「ディクショナリを使用したクエリの高速化」](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [ディクショナリ](/sql-reference/dictionaries)


## クエリの高速化 {#accelerating-queries}

ClickHouseは、クエリパフォーマンスを高速化するための多数の技術をサポートしています。以下の内容は、最も一般的なアクセスパターンに最適化し、圧縮を最大化するために適切なプライマリキー/ソートキーを選択した後にのみ検討すべきです。通常、これが最小限の労力で最大のパフォーマンス向上をもたらします。

### 集計のためのマテリアライズドビュー(増分)の使用 {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データ変換とフィルタリングのためのマテリアライズドビューの使用について説明しました。しかし、マテリアライズドビューは、挿入時に集計を事前計算し、その結果を保存するためにも使用できます。この結果は、後続の挿入からの結果で更新できるため、挿入時に集計を効果的に事前計算することが可能です。

ここでの基本的な考え方は、結果が元のデータのより小さな表現(集計の場合は部分的なスケッチ)になることが多いということです。ターゲットテーブルから結果を読み取るためのよりシンプルなクエリと組み合わせると、元のデータに対して同じ計算を実行する場合よりもクエリ時間が高速になります。

次のクエリを考えてみましょう。構造化ログを使用して1時間あたりの総トラフィックを計算します:

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

これは、ユーザーがGrafanaでプロットする一般的な折れ線グラフかもしれません。このクエリは確かに非常に高速です - データセットはわずか1000万行であり、ClickHouseは高速です!しかし、これを数十億、数兆行にスケールする場合、このクエリパフォーマンスを維持したいと考えるでしょう。

:::note
このクエリは、`LogAttributes`マップからsizeキーを抽出する以前のマテリアライズドビューから生成される`otel_logs_v2`テーブルを使用すれば、10倍高速になります。ここでは説明目的でのみ生データを使用しており、これが一般的なクエリである場合は、以前のビューを使用することをお勧めします。
:::

マテリアライズドビューを使用して挿入時にこれを計算する場合、結果を受け取るテーブルが必要です。このテーブルは1時間あたり1行のみを保持する必要があります。既存の時間に対して更新を受け取った場合、他の列は既存の時間の行にマージされる必要があります。この増分状態のマージを実現するには、他の列の部分的な状態を保存する必要があります。

これには、ClickHouseの特別なエンジンタイプが必要です:SummingMergeTreeです。これは、同じソートキーを持つすべての行を、数値列の合計値を含む1つの行に置き換えます。次のテーブルは、同じ日付を持つすべての行をマージし、すべての数値列を合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

マテリアライズドビューを実演するために、`bytes_per_hour`テーブルが空で、まだデータを受け取っていないと仮定します。マテリアライズドビューは、`otel_logs`に挿入されたデータに対して上記の`SELECT`を実行し(これは設定されたサイズのブロックに対して実行されます)、結果を`bytes_per_hour`に送信します。構文は以下の通りです:

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの`TO`句が重要で、結果の送信先、つまり`bytes_per_hour`を示しています。

OTel Collectorを再起動してログを再送信すると、`bytes_per_hour`テーブルは上記のクエリ結果で増分的に入力されます。完了時に、`bytes_per_hour`のサイズを確認できます - 1時間あたり1行が存在するはずです:

```sql
SELECT count()
FROM bytes_per_hour
FINAL

```


┌─count()─┐
│ 113 │
└─────────┘

1行が返されました。経過時間: 0.039秒

````

ここでは、クエリの結果を保存することで、行数を(`otel_logs`の)1000万行から113行に効果的に削減しました。重要なのは、`otel_logs`テーブルに新しいログが挿入されると、それぞれの時間に対応する新しい値が`bytes_per_hour`に送信され、バックグラウンドで自動的に非同期にマージされることです。1時間あたり1行のみを保持することで、`bytes_per_hour`は常に小さく、かつ最新の状態を維持します。

行のマージは非同期で行われるため、ユーザーがクエリを実行する際に1時間あたり複数の行が存在する可能性があります。クエリ時に未処理の行が確実にマージされるようにするには、2つの選択肢があります:

- テーブル名に[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用する(上記のカウントクエリで実行したもの)。
- 最終テーブルで使用されている順序キー(すなわちTimestamp)で集約し、メトリクスを合計する。

通常、2番目の選択肢の方が効率的で柔軟性があります(テーブルを他の用途にも使用できます)が、一部のクエリでは1番目の方がシンプルになる場合があります。以下に両方を示します:

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

5行が返されました。経過時間: 0.008秒

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

5行が返されました。経過時間: 0.005秒
````

これにより、クエリの実行時間が0.6秒から0.008秒に短縮され、75倍以上高速化されました!

:::note
より大規模なデータセットやより複雑なクエリでは、この削減効果はさらに大きくなる可能性があります。例については[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::

#### より複雑な例 {#a-more-complex-example}

上記の例では、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)を使用して1時間あたりの単純なカウントを集約しています。単純な合計を超える統計には、異なるターゲットテーブルエンジンが必要です:[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)です。

1日あたりのユニークIPアドレス数(またはユニークユーザー数)を計算したいとします。そのためのクエリは次のとおりです:

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113行が返されました。経過時間: 0.667秒 処理: 1037万行、4.73 GB (1553万行/秒、7.09 GB/秒)
```

増分更新のためにカーディナリティカウントを永続化するには、AggregatingMergeTreeが必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```


ClickHouseが集約状態を保存することを認識できるようにするため、`UniqueUsers`カラムを[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)型として定義し、部分状態の関数ソース(uniq)とソースカラムの型(IPv4)を指定します。SummingMergeTreeと同様に、同じ`ORDER BY`キー値を持つ行はマージされます(上記の例ではHour)。

関連するマテリアライズドビューは、先ほどのクエリを使用します:

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数の末尾に`State`サフィックスを追加していることに注目してください。これにより、最終結果ではなく関数の集約状態が返されます。この状態には、他の状態とマージできるようにするための追加情報が含まれます。

Collectorの再起動によってデータが再読み込みされた後、`unique_visitors_per_hour`テーブルに113行が存在することを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

最終的なクエリでは、関数に`Merge`サフィックスを使用する必要があります(カラムには部分集約状態が保存されているため):

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

ここでは`FINAL`を使用する代わりに`GROUP BY`を使用していることに注意してください。

### 高速検索のためのマテリアライズドビュー(増分)の使用 {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルタや集約句で頻繁に使用されるカラムを含むClickHouseのオーダリングキーを選択する際に、アクセスパターンを考慮する必要があります。これは、単一のカラムセットでは包含できない多様なアクセスパターンを持つObservabilityのユースケースでは制約となる可能性があります。これは、デフォルトのOTelスキーマに組み込まれた例で最もよく示されます。トレースのデフォルトスキーマを考えてみましょう:


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

このスキーマは、`ServiceName`、`SpanName`、`Timestamp` によるフィルタリングに最適化されています。トレーシングでは、特定の `TraceId` で検索し、関連するトレースのスパンを取得できることも必要です。`TraceId` は並び替えキーに含まれていますが、末尾にあるため[フィルタリングの効率が低下し](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)、単一のトレースを取得する際に大量のデータをスキャンしなければならない可能性が高くなります。

この課題に対処するために、OTel コレクターはマテリアライズドビューと、それに関連するテーブルも作成します。テーブルとビューは以下のとおりです。

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

このビューによって、テーブル `otel_traces_trace_id_ts` には各トレースの最小および最大タイムスタンプが保持されるようになります。このテーブルは `TraceId` で並べ替えられているため、これらのタイムスタンプを効率的に取得できます。さらに、これらのタイムスタンプ範囲は、メインの `otel_traces` テーブルをクエリする際に利用できます。より具体的には、トレースをその ID で取得する場合、Grafana は次のクエリを使用します。


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

このCTEは、トレースID `ae9226c78d1d360601e6383928e4d22d` の最小および最大タイムスタンプを特定し、それを使用してメインの `otel_traces` テーブルから関連するスパンをフィルタリングします。

同じアプローチを類似のアクセスパターンに適用できます。データモデリングにおける類似の例を[こちら](/materialized-view/incremental-materialized-view#lookup-table)で解説しています。

### プロジェクションの使用 {#using-projections}

ClickHouseのプロジェクションを使用すると、テーブルに対して複数の `ORDER BY` 句を指定できます。

前のセクションでは、ClickHouseでマテリアライズドビューを使用して集計を事前計算し、行を変換し、さまざまなアクセスパターンに対してObservabilityクエリを最適化する方法を解説しました。

トレースIDによる検索を最適化するために、マテリアライズドビューが挿入を受け取る元のテーブルとは異なるソートキーを持つターゲットテーブルに行を送信する例を示しました。

プロジェクションを使用して同じ問題に対処でき、プライマリキーに含まれていない列に対するクエリを最適化できます。

理論上、この機能を使用してテーブルに複数のソートキーを提供できますが、明確な欠点が1つあります。それはデータの重複です。具体的には、メインのプライマリキーの順序に加えて、各プロジェクションに指定された順序でデータを書き込む必要があります。これにより挿入が遅くなり、より多くのディスク容量を消費します。

:::note プロジェクション vs マテリアライズドビュー
プロジェクションはマテリアライズドビューと同様の機能を多く提供しますが、控えめに使用すべきであり、多くの場合マテリアライズドビューが推奨されます。ユーザーは欠点と適切な使用場面を理解する必要があります。例えば、プロジェクションは集計の事前計算に使用できますが、この用途にはマテリアライズドビューの使用を推奨します。
:::

<Image img={observability_13} alt='Observability and projections' size='md' />

次のクエリを考えてみましょう。これは `otel_logs_v2` テーブルを500エラーコードでフィルタリングします。これは、エラーコードでフィルタリングしたいユーザーにとって、ログ記録における一般的なアクセスパターンと考えられます。

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
ここでは `FORMAT Null` を使用して結果を出力していません。これにより、すべての結果が読み取られますが返されないため、LIMITによるクエリの早期終了を防ぎます。これは単に1000万行すべてをスキャンするのにかかる時間を示すためです。
:::

上記のクエリは、選択したソートキー `(ServiceName, Timestamp)` による線形スキャンが必要です。ソートキーの末尾に `Status` を追加して上記クエリのパフォーマンスを向上させることもできますが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

まずプロジェクションを作成してから、それをマテリアライズする必要があることに注意してください。この後者のコマンドにより、データは2つの異なる順序でディスク上に2回保存されます。以下に示すように、データ作成時にプロジェクションを定義することもでき、データが挿入されると自動的に維持されます。


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

重要な点として、プロジェクションを`ALTER`で作成する場合、`MATERIALIZE PROJECTION`コマンドの発行時に作成処理は非同期で実行されます。ユーザーは以下のクエリでこの操作の進行状況を確認し、`is_done=1`になるまで待機できます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを再実行すると、追加のストレージを代償としてパフォーマンスが大幅に向上していることが確認できます(測定方法については["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください)。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、先ほどのクエリで使用された列をプロジェクションに指定しています。これにより、指定されたこれらの列のみがプロジェクションの一部としてディスク上に保存され、Statusで順序付けられます。代わりに`SELECT *`を使用した場合、すべての列が保存されます。これにより、より多くのクエリ(任意の列のサブセットを使用)がプロジェクションの恩恵を受けられますが、追加のストレージが必要になります。ディスク容量と圧縮の測定については、["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください。

### セカンダリ/データスキップインデックス {#secondarydata-skipping-indices}

ClickHouseでプライマリキーをどれほど適切にチューニングしても、一部のクエリは必然的にフルテーブルスキャンを必要とします。これはマテリアライズドビュー(および一部のクエリではプロジェクション)を使用することで軽減できますが、これらには追加のメンテナンスが必要であり、ユーザーがそれらを確実に活用するためには、その存在を認識している必要があります。従来のリレーショナルデータベースはセカンダリインデックスでこの問題を解決しますが、ClickHouseのようなカラム指向データベースではこれらは効果的ではありません。代わりに、ClickHouseは「スキップ」インデックスを使用します。これにより、データベースが一致する値を含まない大きなデータチャンクをスキップできるようになり、クエリパフォーマンスを大幅に向上させることができます。

デフォルトのOTelスキーマは、マップアクセスを高速化するためにセカンダリインデックスを使用しています。これらは一般的に効果的でないことが判明しており、カスタムスキーマへのコピーは推奨しませんが、スキップインデックスは依然として有用な場合があります。

ユーザーは、これらを適用する前に[セカンダリインデックスのガイド](/optimize/skipping-indexes)を読んで理解する必要があります。

**一般的に、プライマリキーと対象となる非プライマリ列/式の間に強い相関関係が存在し、ユーザーが稀な値、つまり多くのグラニュールに出現しない値を検索する場合に効果的です。**

### テキスト検索のためのブルームフィルタ {#bloom-filters-for-text-search}


Observability クエリにおいては、ユーザーがテキスト検索を行う必要がある場合に、セカンダリインデックスが有用です。具体的には、ngram およびトークンベースの Bloom フィルタインデックスである [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) と [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) を使用して、`LIKE`、`IN`、および hasToken 演算子による String 型カラムの検索を高速化できます。重要な点として、トークンベースインデックスは英数字以外の文字を区切りとしてトークンを生成します。これは、クエリ実行時にマッチ可能なのがトークン（すなわち単語全体）のみであることを意味します。より細かい粒度でマッチさせたい場合は、[N-gram Bloom フィルタ](/optimize/skipping-indexes#bloom-filter-types) を使用できます。これは、文字列を指定サイズの n-gram に分割することで、単語の一部に対するマッチングを可能にします。

どのようなトークンが生成され、ひいてはマッチ対象となるかを確認するには、`tokens` 関数を使用できます。

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 関数も同様の機能を提供しており、`ngram` のサイズは 2 番目のパラメーターとして指定できます。

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1行取得。経過時間: 0.008秒
```

:::note 反転インデックス
ClickHouse には、セカンダリインデックスとして反転インデックスを利用できる実験的な機能もあります。現時点ではログデータセットに対しての利用は推奨していませんが、本番運用レベルに達した際には、トークンベースのブルームフィルターを置き換えることを想定しています。
:::

この例では、構造化ログのデータセットを使用します。`Referer` 列に `ultra` が含まれるログの件数をカウントしたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1行のセット。経過時間: 0.177秒。処理: 1037万行、908.49 MB (5857万行/秒、5.13 GB/秒)
```

ここでは、サイズ 3 の ngram にマッチさせる必要があります。そのため、`ngrambf_v1` インデックスを作成します。

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

ここでのインデックス `ngrambf_v1(3, 10000, 3, 7)` は 4 つのパラメータを取ります。最後のパラメータ（値 7）はシードを表します。その他は、それぞれ ngram サイズ (3)、値 `m`（フィルターサイズ）、およびハッシュ関数の数 `k` (7) を表します。`k` と `m` はチューニングが必要で、ユニークな ngram/トークンの数と、フィルターが真の否定結果を返す（したがって、ある値がグラニュールに存在しないことを確認できる）確率に基づいて決定されます。これらの値を決定する際には、[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) を利用することを推奨します。


適切にチューニングすれば、ここで得られる高速化は非常に大きくなり得ます。

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
上記は例示のみを目的としています。トークンベースのブルームフィルタを使ってテキスト検索を最適化しようとするのではなく、ログ挿入時にログから構造を抽出することを推奨します。ただし、スタックトレースやその他の大きな文字列など、構造があまり決定的でないためにテキスト検索が有用となるケースもあります。
:::

ブルームフィルタを使用する際の一般的なガイドラインは次のとおりです。

ブルームフィルタの目的は、[granules](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) をふるいにかけ、列のすべての値を読み込んで線形走査を行う必要がないようにすることです。パラメータ `indexes=1` を指定した `EXPLAIN` 句を使用すると、スキップされた granule の数を確認できます。元のテーブル `otel_logs_v2` と、ngram ブルームフィルタを使用したテーブル `otel_logs_bloom` に対する以下のレスポンスを比較してみてください。

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

ブルームフィルターは、通常はカラム自体よりも小さい場合にのみ高速になります。カラムより大きい場合は、性能向上はほとんど見込めません。次のクエリを使用して、フィルターのサイズとカラムのサイズを比較してください。

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

1行のセット。経過時間: 0.018秒

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

1 行がセットに含まれます。経過時間: 0.004 秒。

```

上記の例では、セカンダリブルームフィルタインデックスが12MBであることがわかります。これは、カラム自体の圧縮サイズである56MBと比較して、ほぼ5分の1のサイズです。

ブルームフィルタには大幅なチューニングが必要になる場合があります。最適な設定を特定するのに役立つ[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter)の注意事項に従うことを推奨します。ブルームフィルタは、挿入時とマージ時にコストがかかる場合もあります。本番環境にブルームフィルタを追加する前に、挿入パフォーマンスへの影響を評価してください。

セカンダリスキップインデックスの詳細については、[こちら](/optimize/skipping-indexes#skip-index-functions)を参照してください。

### マップからの抽出 {#extracting-from-maps}

Map型はOTelスキーマで広く使用されています。この型では、値とキーが同じ型である必要があります。これはKubernetesラベルなどのメタデータには十分です。Map型のサブキーをクエリする際には、親カラム全体が読み込まれることに注意してください。マップに多数のキーがある場合、キーがカラムとして存在する場合と比較して、ディスクから読み取る必要があるデータが増えるため、クエリに大きなペナルティが発生する可能性があります。

特定のキーを頻繁にクエリする場合は、そのキーをルートレベルの専用カラムに移動することを検討してください。これは通常、一般的なアクセスパターンに応じてデプロイ後に行われるタスクであり、本番環境前に予測することが困難な場合があります。デプロイ後にスキーマを変更する方法については、[「スキーマ変更の管理」](/observability/managing-data#managing-schema-changes)を参照してください。
```


## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouseがオブザーバビリティ用途で使用される主な理由の一つは、その圧縮機能です。

ストレージコストを大幅に削減するだけでなく、ディスク上のデータ量が少なくなることで、I/Oが減少し、クエリと挿入が高速化されます。I/Oの削減効果は、CPUに対する圧縮アルゴリズムのオーバーヘッドを上回ります。したがって、ClickHouseクエリの高速化を実現する際には、データの圧縮改善を最優先に取り組むべきです。

圧縮の測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)をご覧ください。
