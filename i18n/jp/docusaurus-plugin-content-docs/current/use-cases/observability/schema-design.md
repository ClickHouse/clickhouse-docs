---
'title': 'スキーマ設計'
'description': '観測可能性のためのスキーマ設計'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'slug': '/use-cases/observability/schema-design'
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';



# 可観測性のためのスキーマ設計

ユーザーには、次の理由から、常にログとトレース用に独自のスキーマを作成することをお勧めします。

- **主キーの選択** - デフォルトのスキーマは、特定のアクセスパターンに最適化された `ORDER BY` を使用します。あなたのアクセスパターンがこれに一致する可能性は低いです。
- **構造の抽出** - ユーザーは、既存のカラムから新しいカラムを抽出したいと考える場合があります。例えば、`Body` カラムからです。これは、物理カラム（およびより複雑な場合にはマテリアライズドビュー）を使用することで実現できます。これにはスキーマの変更が必要です。
- **マップの最適化** - デフォルトのスキーマは、属性のストレージに Map 型を使用しています。これらのカラムは、任意のメタデータのストレージを許可します。これは重要な機能ですが、イベントからのメタデータはしばしば事前に定義されていないため、クリックハウスのような強く型付けられたデータベースに他の方法でストレージできないため、マップのキーとその値へのアクセスは通常のカラムへのアクセスほど効率的ではありません。我々は、スキーマを変更し、最も一般的にアクセスされるマップキーをトップレベルのカラムにすることでこれに対処します - 詳細は ["SQL での構造の抽出"](#extracting-structure-with-sql) を参照してください。これにはスキーマの変更が必要です。
- **マップキーへのアクセスを簡素化** - マップ内のキーへのアクセスには、より冗長な構文が必要です。ユーザーはエイリアスを使用することでこれを緩和できます。クエリを簡素化するためには ["エイリアスの使用"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマは、マップへのアクセスを加速し、テキストクエリを加速するためにセカンダリインデックスを使用します。これは通常必要なく、追加のディスクスペースを消費します。使用することもできますが、本当に必要であることを確認するためにテストする必要があります。詳細は ["セカンダリ / データスキッピングインデックス"](#secondarydata-skipping-indices) を参照してください。
- **コーデックの使用** - ユーザーは、カラムのコーデックをカスタマイズしたいと考えるかもしれません。これは、予想されるデータを理解し、圧縮が改善される証拠がある場合です。

_上記の各ユースケースについては、以下で詳述します。_

**重要:** ユーザーは、最適な圧縮とクエリパフォーマンスを達成するためにスキーマを拡張および変更することを奨励されていますが、可能な限りコアカラムについては、OTelスキーマ命名に従うべきです。ClickHouse Grafanaプラグインは、クエリビルディングを助けるために、いくつかの基本的なOTelカラムの存在を前提としています。例えば、TimestampやSeverityTextです。ログとトレースに必要なカラムについては、こちらに文書化されています [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) で確認できます。これらのカラム名を変更することもできますが、プラグインの設定でデフォルトを上書きする場合は注意が必要です。

## SQLを使用した構造の抽出 {#extracting-structure-with-sql}

構造化されたログまたは非構造化されたログを取り込む場合、ユーザーには次の機能が必要です。

- **文字列の塊からカラムを抽出** - これをクエリ時に文字列操作を使用するよりも速くクエリできます。
- **マップからキーを抽出** - デフォルトのスキーマは、任意の属性を Map 型のカラムに配置します。この型は、スキーマレスの機能を提供し、ユーザーがログとトレースを定義する際に属性のカラムをあらかじめ定義する必要がないという利点がありますが、Kubernetesからログを収集する場合や後で検索できるようにポッドラベルを保持することが求められる場合にはしばしば不可能です。マップキーとその値へのアクセスは、通常のClickHouseカラムのクエリよりも遅くなります。したがって、マップからルートテーブルカラムへのキーの抽出が望ましい場合がしばしばあります。

次のクエリを考えてみてください。

特定のURLパスが最も多くのPOSTリクエストを受け取る回数をカウントしたいと仮定します。JSONブロブは、`Body`カラム内にStringとして保存されます。さらに、ユーザーがコレクタ内でjson_parserを有効にしている場合、それは`LogAttributes`カラムにも`Map(String, String)`として保存される可能性があります。

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

`LogAttributes`が利用可能であると仮定して、サイトのどのURLパスが最も多くのPOSTリクエストを受け取るかをカウントするためのクエリは次のようになります。

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

ここでのマップ構文の使用に注意してください。例えば、`LogAttributes['request_path']`や、URLからクエリパラメータを取り除くための [`path` 関数](/sql-reference/functions/url-functions#path) です。

ユーザーがコレクタ内でJSONパースを有効にしていない場合、`LogAttributes`は空になります。この場合、String `Body` からカラムを抽出するために [JSON 関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note ClickHouseによるパースの推奨
一般的に、構造化ログのJSONパースはClickHouseで行うことをお勧めします。ClickHouseが最も高速なJSONパース実装であると確信しています。しかし、ユーザーがログを他のソースに送信したい場合、このロジックがSQLに存在するべきでないことも理解しています。
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

今度は非構造化ログの例を考えてみてください。

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

非構造化ログに対する同様のクエリは、[`extractAllGroupsVertical` 関数](/sql-reference/functions/string-search-functions#extractallgroupsvertical) を使用して正規表現を介して行う必要があります。

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

非構造化ログのパースに対するクエリの複雑さとコストが上昇していることに注意してください（パフォーマンスの違いに注意）。これが、ユーザーに対して可能な限り構造化ログを使用することを推奨する理由です。

:::note 辞書の考慮
上記のクエリは、正規表現の辞書を利用するように最適化できます。詳細は [辞書の使用]（#using-dictionaries）を参照してください。
:::

これらのユースケースは、上記のクエリロジックを挿入時間に移動することでClickHouseで満たすことができます。以下にいくつかのアプローチを探求し、各アプローチが適切な場合を強調します。

:::note OTelまたはClickHouseによる処理？
ユーザーは、[ここ](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)で説明されているOTel Collectorプロセッサーおよびオペレーターを使用して処理を行うこともできます。ほとんどの場合、ユーザーはClickHouseがコレクタのプロセッサーよりもリソース効率が高く、早いことを発見するでしょう。SQLでイベント処理をすべて実行することの主な欠点は、あなたのソリューションがClickHouseに密接に結びついていることです。例えば、ユーザーは、OTelコレクタから代替の宛先へ処理済みログを送信したい場合があるでしょう。例えば、S3です。
:::
### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出するための最もシンプルな解決策を提供します。そのようなカラムの値は常に挿入時に計算され、INSERTクエリで指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、挿入時にディスク上の新しいカラムに値が抽出されるため、追加のストレージオーバーヘッドが発生します。
:::


マテリアライズドカラムは、任意のClickHouse式をサポートし、[文字列を処理するための分析関数](/sql-reference/functions/string-functions)（[正規表現および検索](/sql-reference/functions/string-search-functions)を含む）、[URL](/sql-reference/functions/url-functions)の[型変換](/sql-reference/functions/type-conversion-functions)、[JSONから値の抽出](/sql-reference/functions/json-functions)または[数学的操作](/sql-reference/functions/math-functions)を利用することができます。

基本的な処理にはマテリアライズドカラムをお勧めします。これらは、マップから値を抽出し、それらをルートカラムに昇格させ、型変換を行う際に特に便利です。それらは、非常に基本的なスキーマや、マテリアライズドビューと併用する場合に最も有用です。以下のスキーマを考えてみましょう。これは、コレクタによって`LogAttributes`カラムにJSONが抽出されているものです。

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

JSON関数を使用して抽出するための同等のスキーマについては、[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)で確認できます。

私たちの3つのマテリアライズドビューカラムは、リクエストページ、リクエストタイプ、およびリファラーのドメインを抽出します。これらはマップキーにアクセスし、その値に関数を適用します。その後のクエリは大幅に高速です。

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
マテリアライズドカラムは、デフォルトでは`SELECT *`の結果には返されません。これは、`SELECT *`の結果が常にINSERTを使用してテーブルに戻せるという不変性を保つためです。この動作は、`asterisk_include_materialized_columns=1`を設定することで無効にすることができ、Grafanaのデータソース設定で有効にすることができます（「追加設定 -> カスタム設定」を参照してください）。
:::
## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views)は、ログとトレースに対してSQLフィルタリングと変換を適用するためのより強力な手段を提供します。

マテリアライズドビューは、ユーザーがクエリ時の計算コストを挿入時にシフトすることを可能にします。ClickHouseのマテリアライズドビューは、テーブルにデータが挿入される際にデータブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、別の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt="Materialized view" size="md"/>

:::note リアルタイム更新
ClickHouseのマテリアライズドビューは、データが基になるテーブルに流れ込むと同時にリアルタイムで更新され、継続的に更新されるインデックスとして機能します。対照的に、他のデータベースではマテリアライズドビューは一般的にクエリの静的なスナップショットであり、更新する必要があります（ClickHouseのリフレッシュ可能なマテリアライズドビューに似ています）。
:::

マテリアライズドビューに関連付けられたクエリは、理論的には任意のクエリが可能であり、集計を含むこともできますが、[ジョインに関する制限]があります。ログとトレースに必要な変換とフィルタリングのワークロードに対して、ユーザーは任意の `SELECT` 文を可能と見なすことができます。

ユーザーは、クエリがテーブルに挿入される行（ソーステーブル）を挿入している間にトリガーが実行され、結果が新しいテーブル（ターゲットテーブル）に送信されることを忘れないでください。

データが二重に保持されないようにするためには、ソーステーブルのテーブルを[Null テーブルエンジン](/engines/table-engines/special/null)に変更し、オリジナルのスキーマを保つことができます。我々のOTelコレクタは、引き続きこのテーブルにデータを送信します。例えば、ログの場合、`otel_logs` テーブルは次のようになります。

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

Nullテーブルエンジンは強力な最適化です。これは `/dev/null` のように考えてください。このテーブルはデータを保存しませんが、添付されたマテリアライズドビューは、挿入された行の上で依然として実行されます。

次のクエリを考えてみましょう。これは、私たちが保持したいと思う形式に行を変換し、`LogAttributes`からすべてのカラムを抽出します（これは、コレクタが`json_parser`オペレーターを使用して設定したと仮定します）。`SeverityText` と `SeverityNumber` を単純な条件に基づいて設定します。ここでは、私たちが知っているポピュレートされるカラムのみを選択します - `TraceId`、`SpanId` および `TraceFlags` のようなカラムは無視します。

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

上記では`Body`カラムも抽出しています - 後で追加の属性が追加された場合に備えています。これはClickHouseで圧縮がうまくいくべきであり、めったにアクセスされないため、クエリパフォーマンスに影響を与えないでしょう。最後に、TimestampをDateTimeに減少させて（スペースを節約するために - 詳細は ["型の最適化"](#optimizing-types) を参照）、キャストを行います。

:::note 条件
上記での [条件関数](/sql-reference/functions/conditional-functions) の使用に注意してください。これらは、複雑な条件を形成し、マップ内で値が設定されているかどうかをチェックするために非常に便利です。すべてのキーが`LogAttributes`に存在すると単純に仮定しています。ユーザーはこれにも慣れることをお勧めします - これは、ログパースでの友人であり、[null値を扱う関数](/sql-reference/functions/functions-for-nulls) も役立ちます。
:::

結果を受け取るためにテーブルが必要です。以下のターゲットテーブルは、上記のクエリに一致します。

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
私たちのスキーマが劇的に変更されたことに注意してください。実際には、ユーザーは保持したいトレースカラムや、通常はKubernetesメタデータを含む`ResourceAttributes`カラムも持っていることが考えられます。Grafanaは、ログとトレース間のリンク機能を提供するためにトレースカラムを利用できます - 詳細は ["Grafanaの使用"](/observability/grafana) を参照してください。
:::

以下に、`otel_logs_v2` に結果を送信する、前述の選択を実行するマテリアライズドビュー `otel_logs_mv` を作成します。

```sql
CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
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
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

これは、以下のように視覚化されます。

<Image img={observability_11} alt="Otel MV" size="md"/>

次に、["ClickHouseへのエクスポート"](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用されるコレクタ設定を再起動すると、データが`otel_logs_v2` に私たちの望む形式で表示されるようになります。型付けされたJSON抽出関数の使用に注意してください。

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

`Body`カラムからの値を抽出するジェイソン関数を使用する同等のマテリアライズドビューは、以下に示されています。

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

上記のマテリアライズドビューは、特に`LogAttributes`マップを使用した場合に、暗黙的なキャストに依存しています。ClickHouseは通常、抽出された値をターゲットテーブルの型に自動的にキャストし、必要な構文を軽減します。しかし、ユーザーは常に、同じスキーマを持つターゲットテーブルを使用してビューの`SELECT`文を使ってテストすることをお勧めします。これは、型が正しく処理されていることを確認します。特に以下のケースに注意してください。

- マップにキーが存在しない場合、空の文字列が返されます。数値の場合、ユーザーはこれを適切な値にマップする必要があります。これは、[条件](/sql-reference/functions/conditional-functions)を使用して達成できます。例えば、`if(LogAttributes['status'] = ", 200, LogAttributes['status'])` や、デフォルト値が許容される場合は [キャスト関数](/sql-reference/functions/type-conversion-functions) を使用して `toUInt8OrDefault(LogAttributes['status'])` を行います。
- 一部の型は常にキャストされるわけではありません。例えば、数値の文字列表現は列挙型の値にキャストされません。
- JSON抽出関数は、値が見つからない場合、デフォルト値を返します。これらの値が意味を持つことを確認してください！

:::note Nullableの回避
ClickHouseの可観測性データにおいては、[Nullable](/sql-reference/data-types/nullable) の使用を避けることをお勧めします。ログやトレースでは、空とnullを区別する必要はまれにしかありません。この機能は追加のストレージオーバーヘッドをもたらし、クエリパフォーマンスに悪影響を及ぼします。詳細については [こちら](/data-modeling/schema-design#optimizing-types) を参照してください。
:::
## 主キー（順序キー）の選択 {#choosing-a-primary-ordering-key}

望ましいカラムを抽出したら、順序/主キーの最適化を始めることができます。

順序キーを選択するのに役立つ簡単なルールがあります。以下のルールは時には矛盾する場合があるため、順番に考慮してください。このプロセスから複数のキーを特定でき、通常は4〜5つが十分です。

1. 一般的なフィルターとアクセスパターンに合致するカラムを選択します。ユーザーが特定のカラム（例：ポッド名）で可観測性の調査を始めることが一般的な場合、このカラムは `WHERE` 句で頻繁に使用されることになります。このキーに含めることが少なくなる他のキーよりも、これを優先します。
2. フィルタリング時に合計行の大きな割合を排除するのに役立つカラムを優先し、読み取る必要があるデータの量を減らします。サービス名やステータスコードは、通常良い候補です。後者の場合、ユーザーがほとんどの行を除外する値でフィルタリングしない限り、200のフィルタリングはほとんどのシステムで大多数を一致させることができるためです。
3. テーブル内の他のカラムとの相関が高い可能性のあるカラムを優先します。これにより、これらの値が連続して保存され、圧縮が向上します。
4. 順序キーのカラムに対して`GROUP BY`および`ORDER BY`演算は、メモリ効率を高めることができます。

<br />

順序キーのカラムのサブセットを特定した後、特定の順序で宣言する必要があります。この順序は、クエリにおけるセカンダリキーのカラムのフィルタリング効率や、テーブルのデータファイルの圧縮比に大きく影響します。一般的に、**キーはカーディナリティの昇順で並べるのが最善です**。これは、順序キーの後に現れるカラムのフィルタリングは、前に現れるカラムのフィルタリングよりも効率が悪くなるという事実とバランスを取る必要があります。これらの動作をバランスさせ、アクセスパターンを考慮してください。最も重要なのは、バリエーションをテストすることです。順序キーの理解と最適化に関しては、[この記事](/guides/best-practices/sparse-primary-indexes)をお勧めします。

:::note 構造を最優先
ログを構造化した後に順序キーを決定することをお勧めします。順序キーやJSON抽出式に属性マップのキーを使用しないようにしてください。テーブルのルートカラムとして順序キーを確保してください。
:::
## マップの使用 {#using-maps}

以前の例では、`Map(String, String)` カラム内の値にアクセスするためにマップ構文 `map['key']` を使用する方法を示しています。ネストされたキーにアクセスするためのマップ表記だけでなく、フィルタリングや選択のために利用できる特化したClickHouseの[マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys)も存在します。

例えば、以下のクエリは、[`mapKeys`関数](/sql-reference/functions/tuple-map-functions#mapkeys)を使用して`LogAttributes`カラムで利用可能なすべてのユニークキーを特定し、その後に[`groupArrayDistinctArray`関数](/sql-reference/aggregate-functions/combinators)（組み合わせ関数）を使用します。

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
マップカラム名にドットを使用しないことをお勧めします。これは使用を廃止する可能性があります。代わりに `_` を使用してください。
:::
```
## エイリアスの使用 {#using-aliases}

map 型のクエリは、通常のカラムのクエリよりも遅くなります - 参照: ["クエリの高速化"](#accelerating-queries)。さらに、構文が複雑であり、ユーザーが書くのが面倒になる可能性があります。この後者の問題に対処するために、エイリアスカラムの使用を推奨します。

ALIAS カラムはクエリ時に計算され、テーブルに保存されません。したがって、このタイプのカラムに値を INSERT することは不可能です。エイリアスを使用することで、map キーを参照し、構文を簡素化し、map エントリを通常のカラムとして透過的に表示することができます。以下の例を考えてみてください：

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

いくつかのマテリアライズドカラムと `ALIAS` カラム `RemoteAddr` があり、map `LogAttributes` にアクセスしています。これにより、このカラムを介して `LogAttributes['remote_addr']` の値をクエリでき、クエリを簡素化できます。次のようになります。

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

5 行がセットされています。経過時間: 0.011 秒。
```

さらに、`ALTER TABLE` コマンドを使って `ALIAS` を追加するのは簡単です。これらのカラムはすぐに利用可能です。たとえば：

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

5 行がセットされています。経過時間: 0.014 秒。
```

:::note エイリアスはデフォルトで除外されます
デフォルトでは、`SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::
## タイプの最適化 {#optimizing-types}

タイプの最適化に関する [一般的な ClickHouse のベストプラクティス](/data-modeling/schema-design#optimizing-types) は、ClickHouse のユースケースにも適用されます。
## コーデックの使用 {#using-codecs}

タイプの最適化に加えて、ユーザーは ClickHouse の Observability スキーマの圧縮を最適化する際に、[コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に従うことができます。

一般的に、ユーザーは `ZSTD` コーデックがロギングおよびトレースデータセットに非常に適用されることを見つけるでしょう。圧縮値をデフォルト値の 1 から増加させると、圧縮が改善される可能性があります。ただし、これはテストする必要があります。高い値では挿入時により大きな CPU オーバーヘッドが発生します。通常、この値を増加させることで得られる利益は少ないです。

さらに、タイムスタンプは、圧縮に関してデルタエンコーディングの恩恵を受けますが、プライマリ/オーダリングキーでこのカラムが使用されると、クエリのパフォーマンスが遅くなることが示されています。ユーザーはそれぞれの圧縮とクエリパフォーマンスのトレードオフを評価することを推奨します。
## 辞書の使用 {#using-dictionaries}

[辞書](/sql-reference/dictionaries)は、さまざまな内部および外部 [ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのメモリ内 [キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供する ClickHouse の [重要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) であり、超低遅延のルックアップクエリに最適化されています。

<Image img={observability_12} alt="Observability and dictionaries" size="md"/>

これにより、ログのデータを即座に強化したり、クエリ全体のパフォーマンスを向上させたりすることが可能です。特に JOIN が有利になります。
Observability のユースケースでは、JOIN がほとんど必要とされませんが、強化目的で辞書が便利である場合もあります - 挿入時とクエリ時の両方で。以下にそれぞれの例を示します。

:::note JOIN の高速化
辞書で JOIN を高速化することに興味のあるユーザーは、[こちら](/dictionary)に詳細を見つけることができます。
:::
### 挿入時とクエリ時 {#insert-time-vs-query-time}

辞書は、クエリ時または挿入時にデータセットを強化するために使用できます。これらのアプローチにはそれぞれ利点と欠点があります。要約すると：

- **挿入時** - これは通常、強化バリューが変わらず、辞書をポピュレーションするために使用できる外部ソースに存在する場合に適しています。この場合、挿入時に行を強化することで辞書へのクエリ時のルックアップを回避します。これは、挿入パフォーマンスと追加のストレージオーバーヘッドのコストがかかります。強化された値はカラムとして保存されます。
- **クエリ時** - 辞書内の値が頻繁に変わる場合、クエリ時のルックアップがしばしばより適用されます。これにより、マッピングされた値が変わる場合にカラムを更新したり（データを書き直したり）する必要がなくなります。この柔軟性は、クエリ時のルックアップコストを伴います。多くの行に対してルックアップが必要な場合、たとえばフィルタ句で辞書ルックアップを使用する場合、このクエリ時のコストは通常重要になります。結果の強化、すなわち `SELECT` 内では、このオーバーヘッドは通常重要ではありません。

ユーザーには辞書の基本を理解することを推奨します。辞書は、専用の [専門関数](/sql-reference/functions/ext-dict-functions#dictgetall) を使用して値を取得できるメモリ内ルックアップテーブルを提供します。

簡単な強化の例については、辞書に関するガイドを [こちら](/dictionary) でご覧ください。以下では、一般的な観察強化タスクに焦点を当てます。
### IP 辞書の使用 {#using-ip-dictionaries}

IP アドレスを使用して緯度と経度の値でログとトレースを地理的に強化することは、一般的な Observability の要件です。これを `ip_trie` 構造化辞書を使用して実現できます。

私たちは、[DB-IP.com](https://db-ip.com/) によって提供される、[DB-IP 市レベルデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を使用します。このデータセットは [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/) の条件の下で提供されています。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データの構造は次のようになっていることがわかります：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を考慮して、[url()](/sql-reference/table-functions/url) テーブル関数を使用してデータを確認してみましょう：

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

私たちの生活を楽にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使用して、フィールド名を持つ ClickHouse テーブルオブジェクトを作成し、行数の合計を確認しましょう：

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
) engine=URL('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV')

select count() from geoip_url;

┌─count()─┐
│ 3261621 │ -- 3.26 million
└─────────┘
```

私たちの `ip_trie` 辞書がCIDR 表記で IP アドレス範囲を表現する必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲のこの CIDR は、次のクエリを使って簡潔に計算することができます：

```sql
with
        bitXor(ip_range_start, ip_range_end) as xor,
        if(xor != 0, ceil(log2(xor)), 0) as unmatched,
        32 - unmatched as cidr_suffix,
        toIPv4(bitAnd(bitNot(pow(2, unmatched) - 1), ip_range_start)::UInt64) as cidr_address
select
        ip_range_start,
        ip_range_end,
        concat(toString(cidr_address),'/',toString(cidr_suffix)) as cidr    
from
        geoip_url
limit 4;

┌─ip_range_start─┬─ip_range_end─┬─cidr───────┐
│ 1.0.0.0        │ 1.0.0.255    │ 1.0.0.0/24 │
│ 1.0.1.0        │ 1.0.3.255    │ 1.0.0.0/22 │
│ 1.0.4.0        │ 1.0.7.255    │ 1.0.4.0/22 │
│ 1.0.8.0        │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4 行がセットされています。経過時間: 0.259 秒。
```

:::note
上記のクエリでは多くのことが行われています。興味のある方は、この優れた [説明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation) を読んでください。そうでなければ、上記が IP 範囲の CIDR を計算することを受け入れましょう。
:::

私たちの目的のためには、IP 範囲、国コード、および座標のみが必要ですので、新しいテーブルを作成し、Geo IP データを挿入しましょう：

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

ClickHouse で低遅延の IP ルックアップを実行するために、辞書を利用してメモリ内に Geo IP データに対するキー - 特性のマッピングを格納します。ClickHouse は、ネットワークプレフィックス (CIDR ブロック) を座標および国コードにマッピングするために、`ip_trie` [辞書構造](/sql-reference/dictionaries#ip_trie) を提供します。次のクエリは、このレイアウトを使用して辞書を指定し、上記テーブルをソースとして指定します。

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

辞書から行を選択し、このデータセットがルックアップのために利用可能であることを確認できます：

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN           │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU           │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU           │
└────────────┴──────────┴───────────┴──────────────┘

3 行がセットされています。経過時間: 4.662 秒。
```

:::note 定期的なリフレッシュ
ClickHouse の辞書は、根本的なテーブルデータと、上記のライフタイム句に基づいて定期的に更新されます。DB-IP データセットの最新の変更を反映するために Geo IP 辞書を更新するには、変換を加えて geoip_url リモートテーブルから geoip テーブルにデータを再挿入するだけで済みます。
:::

Geo IP データが私たちの `ip_trie` 辞書（便利に `ip_trie` という名前でも）にロードされたので、これを使用して IP 地理位置を見つけることができます。これは [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して次のように実現できます：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 行がセットされています。経過時間: 0.003 秒。
```

ここでの取得速度に注意してください。これにより、ログを強化することができます。この場合、**クエリ時の強化を行います**。

元のログデータセットに戻ると、国別にログを集約するために上記を使用できます。以下のクエリは、以前のマテリアライズドビューからのスキーマを使用し、抽出した `RemoteAddress` カラムが存在することを前提としています。

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

5 行がセットされています。経過時間: 0.140 秒。処理された行数: 2073 万行、サイズ: 82.92 MB (147.79 百万行/秒、591.16 MB/秒)。
ピークメモリ使用量: 1.16 MiB。
```

IP と地理的位置のマッピングは変更される可能性があるため、ユーザーはリクエストが行われた時点での出所を知りたいと思うでしょう - 同じアドレスの現在の地理的位置ではありません。このため、インデックス時の強化が好まれる可能性があります。これは、以下のようにマテリアライズドカラムを使用することで実行できます：

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

:::note 定期更新
ユーザーは、新しいデータに基づいて IP 強化辞書を定期的に更新したいと思うでしょう。これは、辞書のライフタイム句を使用することにより、辞書が基となるテーブルから定期的にリロードされるように設定することで達成できます。基底テーブルの更新については、["リフレッシュ可能なマテリアライズドビュー"](/materialized-view/refreshable-materialized-view)を参照してください。
:::

上記の国々と座標は、国別にグループやフィルタリングを超えた視覚化機能を提供します。インスピレーションについては、["地理データの視覚化"](/observability/grafana#visualizing-geo-data)を参照してください。
### 正規表現辞書の使用 (ユーザーエージェントの解析) {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent) の解析は、古典的な正規表現の問題であり、ログやトレースベースのデータセットで一般的な要件です。ClickHouse は、正規表現ツリー辞書を使用してユーザーエージェントの効率的な解析を提供しています。

正規表現ツリー辞書は、正規表現ツリーを含む YAML ファイルのパスを提供する YAMLRegExpTree 辞書ソースタイプを使用して ClickHouse オープンソースで定義されています。独自の正規表現辞書を提供したい場合、必要な構造に関する詳細は [こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) に記載されています。以下では、[uap-core](https://github.com/ua-parser/uap-core) を使用したユーザーエージェント解析に焦点を当て、サポートされている CSV フォーマットで辞書をロードします。このアプローチは OSS および ClickHouse Cloud と互換性があります。

:::note
以下の例では、2024 年 6 月の最新のユーザーエージェント解析用の正規表現のスナップショットを使用しています。最新のファイルは、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)で見つけることができます。このファイルは、定期的に更新されます。ユーザーは、[こちら](/sql-reference/dictionaries#collecting-attribute-values)の手順に従って、以下で使用される CSV ファイルにロードできます。
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

以下の公にホストされた CSV ファイルからこれらのテーブルにデータをポピュレートできます。url テーブル関数を使用します：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルがポピュレートされたので、正規表現辞書を読み込みます。キー値はカラムとして指定する必要があります - これらはユーザーエージェントから抽出できる属性になります。

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

これらの辞書を読み込むことで、サンプルのユーザーエージェントを提供し、新しい辞書抽出機能をテストできます：

```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
        dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
        dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
        dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

1 行がセットされています。経過時間: 0.003 秒。
```

ユーザーエージェントに関するルールはほとんど変更されないため、辞書は新しいブラウザやオペレーティングシステム、デバイスに応じてのみ更新する必要があります。このため、挿入時にこの抽出を行うのが理にかなっています。

この作業は、マテリアライズドカラムまたはマテリアライズドビューを使用して行うことができます。以前に使用されたマテリアライズドビューを次のように変更します：

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

これにより、対象テーブル `otel_logs_v2` のスキーマを変更する必要があります：

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

収集ツールを再起動して、前述の手順に基づいて構造化されたログを取り込んだ後、抽出された Device、Browser、Os カラムをクエリできます。

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

:::note 複雑な構造のためのタプル
これらのユーザーエージェントカラムにはタプルを使用しています。タプルは、階層が事前に知られている複雑な構造に推奨されます。サブカラムは、通常のカラムと同じパフォーマンスを提供します（Map キーとは異なります）。
:::
### さらなる学び {#further-reading}

辞書に関するさらなる例や詳細については、以下の記事を推奨します：

- [高度な辞書トピック](/dictionary#advanced-dictionary-topics)
- ["辞書を使用してクエリを加速する"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)
## クエリの高速化 {#accelerating-queries}

ClickHouse では、クエリパフォーマンスを加速するためのさまざまな手法をサポートしています。以下は、最も人気のあるアクセスパターンを最適化するための適切なプライマリ/オーダリングキーを選択した後に考慮すべき事項です。これが通常最も努力が少なく、パフォーマンスに最大の影響を与えます。
### マテリアライズドビュー（増分）を使用した集計 {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データ変換およびフィルタリングのためのマテリアライズドビューの使用について説明しました。ただし、マテリアライズドビューは、挿入時に集計を事前計算して結果を格納するためにも使用できます。この結果は、後続の挿入の結果で更新でき、実質的に集計を挿入時に事前計算することができます。

ここでの主なアイデアは、結果がしばしば元のデータのより小さな表現になるということです（集計の場合は部分的なスケッチ）。ターゲットテーブルから結果を読み取るためのよりシンプルなクエリと組み合わせることで、元のデータに対して同じ計算を行うよりもクエリ時間が短縮されます。

次のクエリを考えてみましょう。我々の構造化ログを使用して、時間ごとの総トラフィックを計算します：

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

これはユーザーがGrafanaで描画する一般的な折れ線グラフであると想像できます。このクエリは非常に速いですが、データセットはわずか10百万行で、ClickHouseは速いのでしょう！ただし、これが数十億または数兆の行にスケールされる場合、理想的にはこのクエリパフォーマンスを維持したいところです。

:::note
このクエリは、以前のマテリアライズドビュー`otel_logs_v2`を使用すると、10倍速くなります。このビューは`LogAttributes`マップからサイズキーを抽出します。ここでは説明目的のために生データを使用していますが、これは一般的なクエリであれば以前のビューを使用することをお勧めします。
:::

マテリアライズドビューを使用して挿入時にこれを計算したい場合は、結果を受け取るためのテーブルが必要です。このテーブルは、時間ごとに1行のみを保持する必要があります。既存の時間に対して更新が受信される場合、他のカラムは既存の時間の行にマージされる必要があります。この増分状態のマージを行うために、他のカラムの部分的な状態を保存する必要があります。

これにはClickHouseの特別なエンジンタイプが必要です：SummingMergeTree。このエンジンは、同じ順序キーを持つすべての行を、数値カラムの合計値を含む1つの行に置き換えます。以下のテーブルは、同じ日付を持つ任意の行をマージし、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

マテリアライズドビューを示すために、仮に`bytes_per_hour`テーブルが空で、まだデータを受け取っていないとします。このマテリアライズドビューは、`otel_logs`に挿入されたデータに対して上記の`SELECT`を実行し（設定したサイズのブロックにわたって実行されます）、結果を`bytes_per_hour`に送ります。構文は以下の通りです：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの`TO`句は重要で、結果が送信される場所を示します、つまり`bytes_per_hour`です。

OTel Collectorを再起動してログを再送信すると、`bytes_per_hour`テーブルは上記のクエリ結果で増分的に更新されます。完了すると、`bytes_per_hour`のサイズを確認できます。1時間あたり1行があるはずです：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

ここでは、クエリの結果を保存することで、10m行（`otel_logs`）から113行まで、行数を効果的に減少させています。ここでの重要な点は、新しいログが`otel_logs`テーブルに挿入されると、新しい値がそれぞれの時間の`bytes_per_hour`に送信され、それらは自動的にバックグラウンドで非同期にマージされます。1時間ごとに行を1つだけ保持することで、`bytes_per_hour`は常に小さく、最新の状態を保つことができます。

行のマージは非同期で行われるため、ユーザーがクエリを実行したとき、1時間あたり複数の行が存在する可能性があります。未処理の行がクエリ時にマージされるようにするには、2つのオプションがあります。

- テーブル名に[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用します（上記のカウントクエリで実行した通り）。
- 最終テーブルで使用される順序キーすなわち、Timestampで集計し、メトリクスを合計します。

通常、2番目のオプションはより効率的で柔軟です（テーブルは他のことにも使用できます）。しかし、最初のものは一部のクエリにとっては簡単です。以下に両方を示します：

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

これにより、クエリは0.6秒から0.008秒に加速しました - 75倍以上です！

:::note
これらの節約は、大規模データセットでの複雑なクエリにおいてさらに大きくなる可能性があります。例については[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::
#### より複雑な例 {#a-more-complex-example}

上記の例は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)を使用して時間ごとの単純なカウントを集計します。単純な合計を越えた統計には、異なるターゲットテーブルエンジンが必要です： [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

特定の日ごとのユニークなIPアドレス（またはユニークユーザー）の数を計算したいとします。そのためのクエリは次の通りです：

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

増分更新のためのカーディナリティカウントを持続させるには、AggregatingMergeTreeが必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouseが集計状態を格納することを知るようにするために、`UniqueUsers`カラムの型を[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)として定義し、部分状態の関数ソース（uniq）とソースカラムの型（IPv4）を指定します。SummingMergeTreeとは異なり、同じ`ORDER BY`キーの値を持つ行はマージされます（上記の例ではHour）。

関連するマテリアライズドビューは先ほどのクエリを使用します：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集計関数の末尾に`suffix`を追加している点に注意してください。これにより、関数の集計状態が返され、最終結果ではなくなることが保証されます。これには他の状態とマージするために必要な追加情報が含まれます。

データがリロードされた後、Collectorの再起動を通じて、`unique_visitors_per_hour`テーブルに113行が利用可能であることを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

最終クエリでは、関数にMergeサフィックスを利用する必要があります（カラムが部分的な集計状態を保存するため）：

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

ここでは、`FINAL`ではなく`GROUP BY`を使用している点に注意してください。
### マテリアライズドビュー（増分）を使用した迅速なルックアップ {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルタおよび集計条項で頻繁に使用されるカラムとのClickHouseの順序キーを選択する際に、アクセスパターンを考慮する必要があります。これは、ユーザーが1つのカラムセットに要約できない多様なアクセスパターンを持つObservabilityのユースケースでは制約となる可能性があります。このまた良い例は、デフォルトのOTelスキーマにビルトインされています。トレースのデフォルトスキーマを考えてみましょう：

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

このスキーマは、`ServiceName`、`SpanName`、および`Timestamp`でのフィルタリングに最適化されています。トレースでは、ユーザーは特定の`TraceId`によるルックアップを行い、関連するトレースのスパンを取得する必要があります。これは順序キーに存在しますが、最後に配置されているため、[フィルタリングはそれほど効率的ではありません](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)と評価され、単一のトレースを取得する際に大量のデータをスキャンする必要がある可能性が高いです。

OTel Collectorは、この課題に対処するためにマテリアライズドビューと関連テーブルをインストールします。テーブルとビューは以下の通りです：

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

このビューは、テーブル`otel_traces_trace_id_ts`がトレースの最小および最大タイムスタンプを持つことを確実にします。このテーブルは、`TraceId`で順序付けされており、これによりこれらのタイムスタンプを効率的に取得できます。これらのタイムスタンプの範囲は、主要な`otel_traces`テーブルをクエリする際に使用できます。具体的には、GrafanaがトレースをIDで取得する際には、以下のクエリが使用されます：

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

ここでのCTEは、トレースID `ae9226c78d1d360601e6383928e4d22d` の最小および最大タイムスタンプを特定し、これを使用して主要な`otel_traces`に関連するスパンをフィルタリングします。

同様のアクセスパターンに対しては、同様のアプローチが適用できます。データモデリングでの似た例については[こちら](https://example.com)を参照してください。
### プロジェクションの使用 {#using-projections}

ClickHouseのプロジェクションは、ユーザーがテーブルに対して複数の`ORDER BY`句を指定することを可能にします。

前のセクションでは、マテリアライズドビューがどのようにClickHouseで集計を事前計算し、行を変換し、異なるアクセスパターンのObservabilityクエリを最適化するために使用できるかを探りました。

マテリアライズドビューが、トレースIDによるルックアップのために挿入を受け取る元のテーブルとは異なる順序キーでターゲットテーブルに行を送信する例を提供しました。

プロジェクションを同じ問題に対処するために使用でき、ユーザーは主キーの一部でないカラムに対するクエリを最適化することができます。

理論的には、この機能を使用してテーブルのために複数の順序キーを提供できますが、1つの明確な欠点があります：データの重複です。具体的には、データは主な主キーの順序で書き込まれる必要がある上に、各プロジェクションのために指定された順序でも書き込まれます。これにより挿入が遅くなり、ディスクスペースが消費されます。

:::note プロジェクションとマテリアライズドビュー
プロジェクションは、マテリアライズドビューと同じ機能を提供しますが、後者が優先されることが多く、控えめに使用するべきです。ユーザーは欠点を理解し、どのような場合に適切かを把握する必要があります。例えば、プロジェクションは集計を事前計算するために使用できますが、この目的にはマテリアライズドビューを使用することをお勧めします。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

次のクエリを考えてみましょう。このクエリは、`otel_logs_v2`テーブルから500エラーコードでフィルタリングします。これは、ユーザーがエラーコードでフィルタリングを希望する一般的なアクセスパターンであると思われます：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note パフォーマンスを測定するためにNullを使用
ここでは、`FORMAT Null`を使用して結果を表示しません。これはすべての結果が読み取られることを強制しますが、返されないため、LIMITによるクエリの早期終了を防ぎます。これは10m行をスキャンするのに必要な時間を示すためだけのものです。
:::

上記のクエリは、選択した順序キー`(ServiceName, Timestamp)`に対して線形スキャンを必要とします。上記のクエリの性能を改善するために`Status`を順序キーの最後に追加することもできますが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

プロジェクションを最初に作成し、それをマテリアライズする必要があることに留意してください。この後者のコマンドは、データが2つの異なる順序でディスクに2度保存される原因になります。データが作成される際にプロジェクションを定義することもでき、以下のように、データの挿入に応じて自動的に管理されます。

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

重要な点として、プロジェクションが`ALTER`を介して作成された場合、その作成は非同期であり、`MATERIALIZE PROJECTION`コマンドが発行されるときに行われます。ユーザーは次のクエリを使用して、この操作の進捗を確認し、`is_done=1` になるのを待つことができます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを繰り返すと、追加のストレージ（詳細については["テーブルのサイズと圧縮の測定"](#measuring-table-size--compression)を参照）によってパフォーマンスが大幅に改善されます。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、プロジェクションにおいて先に使用された列を指定しています。これは、指定された列のみがディスクにプロジェクションの一部として保存され、Statusで順序付けされることを意味します。代わりに、ここで`SELECT *`を使用した場合、すべての列が保存されます。これは、より多くのクエリがプロジェクションから恩恵を受けることを可能にしますが、追加のストレージが発生します。ディスクスペースと圧縮の計測については、["テーブルのサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください。
### セカンダリ／データスキッピングインデックス {#secondarydata-skipping-indices}

ClickHouseで主キーがどれだけ調整されていても、いくつかのクエリでは必然的に完全なテーブルスキャンを必要とします。これは、マテリアライズドビューを使用することで軽減できますが、これには追加のメンテナンスが必要であり、ユーザーはそれらの利用可能性を意識する必要があります。従来のリレーショナルデータベースがこれをセカンダリインデックスで解決している一方で、これらはClickHouseのような列指向データベースでは効果的ではありません。代わりにClickHouseは「スキップ」インデックスを使用しており、これはデータベースが一致する値のない大きなデータチャンクをスキップすることでクエリパフォーマンスを大幅に向上させることができます。

デフォルトのOTelスキーマは、マップアクセスを加速する試みとしてセカンダリインデックスを使用しています。これらは一般的に効果がないと考えられており、カスタムスキーマにコピーすることはお勧めしませんが、スキップインデックスは依然として有用です。

ユーザーは、これらを適用する前に[セカンダリインデックスに関するガイド](/optimize/skipping-indexes)を読み、理解する必要があります。

**一般的に、それらは主キーと対象の非主キー列や表現との間に強い相関が存在し、ユーザーがまれな値（すなわち、多くのグラニュールで発生しない値）を検索している場合に効果的です。**
### Bloomフィルタによるテキスト検索 {#bloom-filters-for-text-search}

Observabilityクエリにおいては、ユーザーがテキスト検索を実行する必要がある場合に、二次インデックスが役立つことがあります。具体的には、ngramおよびトークンベースのBloomフィルタインデックス [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) および [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) が、`LIKE`、`IN`、およびhasToken演算子を使用してStringカラムに対する検索を加速するために使用できます。特に、トークンベースのインデックスは、非英数字文字をセパレータとして使用してトークンを生成します。これは、クエリ時にトークン（または完全な単語）のみが一致することを意味します。より詳細な一致を行うためには、[N-gram Bloomフィルタ](/optimize/skipping-indexes#bloom-filter-types)を使用できます。これにより、文字列を指定されたサイズのngramsに分割し、サブワードマッチングを行えるようになります。

生成されるトークンを評価するには、`tokens`関数を使用できます：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram`関数も類似の機能を提供し、N-gramのサイズを第二引数として指定できます：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 逆インデックス
ClickHouseは、二次インデックスとして逆インデックスの実験的なサポートも行っています。現在、これをログデータセットに推奨することはありませんが、製品として準備が整い次第、トークンベースのBloomフィルタに代わることを期待しています。
:::

この例の目的のために、構造化ログデータセットを使用します。`Referer`カラムに`ultra`を含むログの数をカウントしたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

ここでは、ngramサイズ3で一致させる必要があります。したがって、`ngrambf_v1`インデックスを作成します。

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

ここでのインデックス`ngrambf_v1(3, 10000, 3, 7)`は、四つのパラメータを取ります。このうち最後の値7はシードを表し、他はngramサイズ（3）、値`m`（フィルターサイズ）、およびハッシュ関数の数`k`（7）を表します。`k`と`m`は調整が必要であり、ユニークなngram/トークンの数とフィルターが真のネガティブを返す確率に基づいて調整されます - これにより、特定の値がグラニュールに存在しないことを確認できます。これらの値を設定するのに役立つ[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を推奨します。

正しく調整されれば、ここでのスピードアップは大きくなります：

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
上記は説明のためのものであり、実際にはユーザーはログ挿入時に構造を抽出することを推奨します。トークンベースのBloomフィルタを用いてテキスト検索を最適化しようとするのではなく、通常のアクセスパターンに応じて対応するためのタスクとして行います。しかし、スタックトレースや他の大きな文字列のようなケースでは、テキスト検索が役立つ場合があります。
:::

Bloomフィルタを使用する際の一般的なガイドライン：

Bloomの目的は、[グラニュール](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)をフィルタリングし、カラムのすべての値を読み込んで線形スキャンを行う必要を避けることです。`EXPLAIN`句は、`indexes=1`のパラメータを使用してスキップされたグラニュールの数を特定するために使用できます。以下のように、元のテーブル`otel_logs_v2`とngram Bloomフィルタを持つ`otel_logs_bloom`テーブルの応答を考慮してください。

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

Bloomフィルタは、通常、カラムそのものよりも小さい場合にのみ高速です。大きい場合、パフォーマンスの利点はほとんどなくなる可能性があります。以下のクエリを使用して、フィルタとカラムのサイズを比較してください：

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

上記の例では、二次Bloomフィルタインデックスは12MBで、カラム自体の圧縮サイズ56MBの約5倍小さいことがわかります。

Bloomフィルタは大幅な調整が必要な場合があります。最適な設定を特定するのに役立つ[こちらのメモ](/engines/table-engines/mergetree-family/mergetree#bloom-filter)に従うことを推奨します。Bloomフィルタは、挿入およびマージ時にコストがかかることもあります。ユーザーは、Bloomフィルタを本番環境に追加する前に、挿入パフォーマンスへの影響を評価することが重要です。

二次スキップインデックスに関する詳細は[こちら](/optimize/skipping-indexes#skip-index-functions)で確認できます。
### マップからの抽出 {#extracting-from-maps}

Map型は、OTelスキーマで広く使用されています。この型では、値とキーが同じ型でなければなりません - Kubernetesラベルなどのメタデータに十分です。Map型のサブキーをクエリする際は、親カラム全体が読み込まれることに注意してください。マップに多くのキーがある場合、キーがカラムとして存在する場合よりもディスクから読み込むデータが多くなり、クエリペナルティが大きくなる可能性があります。

特定のキーを頻繁にクエリする場合は、それをルートに独自の専用カラムに移動することを検討してください。これは通常、一般的なアクセスパターンに応じて、展開後に行われる作業であり、本番環境の前に予測するのは難しいかもしれません。スキーマ変更を後から修正する方法については、["スキーマ変更の管理"](/observability/managing-data#managing-schema-changes)を参照してください。
## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouseがObservabilityのために使用される主な理由の一つは、圧縮です。

ストレージコストを劇的に削減するだけでなく、ディスク上のデータが少なくなることで、I/Oが減少し、クエリや挿入が速くなります。I/Oの削減は、CPUに関する圧縮アルゴリズムのオーバーヘッドを上回ります。したがって、データの圧縮を改善することが、ClickHouseのクエリを高速に保つための最初の焦点となるべきです。

圧縮の測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)で確認できます。
