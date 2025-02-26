---
title: スキーマ設計
description: 可観測性のためのスキーマ設計
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---
# 可観測性のためのスキーマ設計

ユーザーには、以下の理由からログとトレースのために独自のスキーマを作成することを推奨します。

- **主キーの選択** - デフォルトのスキーマは特定のアクセスパターンに最適化された`ORDER BY`を使用しています。あなたのアクセスパターンがこれに一致する可能性は低いです。
- **構造の抽出** - ユーザーは、既存のカラムから新しいカラムを抽出したい場合があります。例えば、`Body`カラムからです。これは、マテリアライズドカラム（より複雑な場合はマテリアライズドビュー）を使用して実現できます。これにはスキーマの変更が必要です。
- **マップの最適化** - デフォルトのスキーマは属性のストレージにマップ型を使用しています。これらのカラムは任意のメタデータをストレージすることを可能にします。この能力は重要ですが、イベントからのメタデータはしばしば事前に定義されていないため、強い型のデータベースであるClickHouseに他の方法で保存できません。そのため、マップのキーとその値へのアクセスは通常のカラムへのアクセスほど効率的ではありません。これを解決するために、スキーマを変更し、最も一般的にアクセスされるマップキーがトップレベルのカラムになるようにします - 詳細は ["SQLを使用した構造の抽出"](#extracting-structure-with-sql) を参照してください。これにはスキーマの変更が必要です。
- **マップキーアクセスの簡素化** - マップ内のキーにアクセスするには、より冗長な構文が必要です。ユーザーはエイリアスを使用してこれを軽減できます。クエリを簡素化するための詳細は ["エイリアスの使用"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマは、マップへのアクセスを高速化し、テキストクエリを加速するためにセカンダリインデックスを使用しています。これらは通常不要であり、追加のディスクスペースを消費します。使用できますが、本当に必要かどうかを確認するためにテストする必要があります。詳細は ["セカンダリ / データスキッピングインデックス"](#secondarydata-skipping-indices) を参照してください。
- **コーデックの使用** - ユーザーは、予想されるデータを理解し、圧縮が改善される証拠がある場合、カラムに対してコーデックをカスタマイズしたい場合があります。

_上記の使用ケースの詳細を以下に記します。_

**重要:** ユーザーには、最適な圧縮とクエリパフォーマンスを実現するためにスキーマを拡張および変更することを奨励しますが、可能な限り基本的なカラムに対してOTelスキーマの命名規則に従うべきです。ClickHouse Grafanaプラグインは、クエリビルディングを支援するためにいくつかの基本的なOTelカラムの存在を前提としています。例えば、TimestampやSeverityTextです。ログとトレースに必要なカラムについては、こちらに文書化されています [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/)および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)です。これらのカラム名を変更し、プラグイン設定でデフォルトを上書きすることもできます。
## SQLを使用した構造の抽出 {#extracting-structure-with-sql}

構造化されたログや非構造化されたログを取り込む際に、ユーザーはしばしば以下の能力を必要とします：

- **文字列のBLOBからカラムを抽出する**。これをクエリ時に文字列操作を使用するよりもクエリは速くなります。
- **マップからキーを抽出する**。デフォルトのスキーマは、任意の属性をマップ型のカラムに配置します。この型は、ログやトレースを定義する際に事前にカラムを定義する必要がないという利点を持つスキーマレスの能力を提供します。この場合、Kubernetesからログを収集する場合は、ポッドラベルを保持したいことが多く、事前定義は不可能です。マップのキーとその値へのアクセスは、通常のClickHouseカラムでのクエリよりも遅くなります。したがって、マップからルートテーブルカラムへのキーを抽出することは、しばしば望ましいです。

以下のクエリを考慮してください：

構造化されたログを使用して、どのURLパスが最もPOSTリクエストを受け取るかをカウントしたいとします。JSON BLOBは、`Body`カラムに文字列として保存されています。また、ユーザーがコレクターで`json_parser`を有効にしている場合、`LogAttributes`カラムにも`Map(String, String)`として保存される場合があります。

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:       {"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

`LogAttributes`が利用可能だと仮定して、サイトのどのURLパスが最もPOSTリクエストを受け取るかをカウントするクエリ：

```sql
SELECT path(LogAttributes['request_path']) AS path, count() AS c
FROM otel_logs
WHERE ((LogAttributes['request_type']) = 'POST')
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.735 sec. Processed 10.36 million rows, 4.65 GB (14.10 million rows/s., 6.32 GB/s.)
Peak memory usage: 153.71 MiB.
```

ここでのマップ構文の使用に注意してください。例：`LogAttributes['request_path']`、およびURLからクエリパラメータを削除するための [`path`関数](/sql-reference/functions/url-functions#path) 。

ユーザーがコレクターでJSON解析を有効にしていない場合、`LogAttributes`は空になり、列を文字列`Body`から抽出するために[JSON関数](/sql-reference/functions/json-functions)を使用する必要があります。

:::note ClickHouseでの解析を推奨
一般的に、ユーザーには構造化ログのJSON解析をClickHouseで行うことを推奨します。ClickHouseが最速のJSON解析実装であると自信を持っています。ただし、ユーザーはログを他のソースに送信し、このロジックをSQLに残さないことを望む場合があることも認識しています。
:::

```sql
SELECT path(JSONExtractString(Body, 'request_path')) AS path, count() AS c
FROM otel_logs
WHERE JSONExtractString(Body, 'request_type') = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.668 sec. Processed 10.37 million rows, 5.13 GB (15.52 million rows/s., 7.68 GB/s.)
Peak memory usage: 172.30 MiB.
```

次に、非構造化ログについて考えてみましょう：

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:       151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

非構造化ログの類似のクエリは、[`extractAllGroupsVertical`関数](/sql-reference/functions/string-search-functions#extractallgroupsvertical)を使用して正規表現を介して行う必要があります。

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
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productModelImages │ 10866 │
│ /site/productAdditives   │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 1.953 sec. Processed 10.37 million rows, 3.59 GB (5.31 million rows/s., 1.84 GB/s.)
```

クエリの複雑さと非構造化ログの解析コストの増加（パフォーマンスの違いに注意）が、ユーザーに常に可能な限り構造化ログを使用するよう推奨する理由です。

:::note 辞書の考慮
上記のクエリは、正規表現辞書の利用を最適化することができます。詳しくは [辞書の使用](#using-dictionaries) を参照してください。
:::

これらの利用ケースの両方は、ClickHouseを使用して、上記のクエリロジックを挿入時に移動することで満たすことができます。以下にいくつかのアプローチを探ります。それぞれが適切な状況を強調します。

:::note OTelまたはClickHouseによる処理？
ユーザーは、[こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)に記載されているように、OTel Collectorプロセッサやオペレーターを使用して処理を行うこともできます。ほとんどの場合、ユーザーはClickHouseがコレクターのプロセッサよりもはるかにリソース効率が良く、速いことがわかります。SQLで全てのイベント処理を行うことの主な欠点は、ソリューションがClickHouseに結び付けられることです。例えば、ユーザーは処理されたログをOTelコレクターからS3などの別の送信先に送りたい場合があります。
:::
### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出するための最も簡単なソリューションを提供します。このようなカラムの値は常に挿入時に計算され、INSERTクエリで指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、挿入時に新しいカラムに値が抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムは、任意のClickHouse式をサポートし、[文字列の処理](/sql-reference/functions/string-functions)や[URL](/sql-reference/functions/url-functions)のための任意の分析関数を利用でき、[型変換](/sql-reference/functions/type-conversion-functions)、[JSONからの値の抽出](/sql-reference/functions/json-functions)や[数学的操作](/sql-reference/functions/math-functions)を行います。

基本的な処理にはマテリアライズドカラムを推奨します。特に、マップから値を抽出し、ルートカラムに昇格させ、型変換を行うのに便利です。非常に基本的なスキーマで、またはマテリアライズドビューと組み合わせて使用する場合に特に有用です。以下は、コレクターによってJSONが`LogAttributes`カラムに抽出されたログのスキーマです：

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

JSON関数を使用して文字列`Body`から抽出するための同等のスキーマについては、[こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==)で確認できます。

私たちの3つのマテリアライズドビューカラムは、リクエストページ、リクエストタイプ、リファラーのドメインを抽出します。これらはマップのキーにアクセスし、その値に対して関数を適用します。次のクエリはかなり速くなります：

```sql
SELECT RequestPage AS path, count() AS c
FROM otel_logs
WHERE RequestType = 'POST'
GROUP BY path
ORDER BY c DESC
LIMIT 5

┌─path─────────────────────┬─────c─┐
│ /m/updateVariation   	   │ 12182 │
│ /site/productCard    	   │ 11080 │
│ /site/productPrice   	   │ 10876 │
│ /site/productAdditives   │ 10866 │
│ /site/productModelImages │ 10866 │
└──────────────────────────┴───────┘

5 rows in set. Elapsed: 0.173 sec. Processed 10.37 million rows, 418.03 MB (60.07 million rows/s., 2.42 GB/s.)
Peak memory usage: 3.16 MiB.
```

:::note
デフォルトでは、マテリアライズドカラムは`SELECT *`で返されません。これは、`SELECT *`の結果が常にINSERTを使用してテーブルに挿入できることを保つためです。この動作は、`asterisk_include_materialized_columns=1`を設定して無効にすることができ、Grafanaで有効にすることができます（データソース設定の`Additional Settings -> Custom Settings`を参照してください）。
:::

## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-view)は、ログやトレースに対してSQLフィルタリングと変換を適用するためのより強力な手段を提供します。

マテリアライズドビューは、ユーザーがクエリ時の計算コストを挿入時に移行することを可能にします。ClickHouseのマテリアライズドビューは、データがテーブルに挿入されるときにブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果が2番目の「ターゲット」テーブルに挿入されます。

<img src={require('./images/observability-10.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

:::note リアルタイム更新
ClickHouseのマテリアライズドビューは、データが基になっているテーブルに流れ込むとすぐにリアルタイムで更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースでは、マテリアライズドビューは通常、クエリの静的スナップショットであり、リフレッシュされる必要があります（ClickHouseのリフレッシュ可能なマテリアライズドビューに似ています）。
:::

マテリアライズドビューに関連付けられたクエリは、理論的には任意のクエリを使用できますが、集約を含むことも可能ですが、[結合には制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログやトレースに必要な変換やフィルタリングの作業負荷に対して、ユーザーは任意の`SELECT`文を可能だと考えても良いでしょう。

ユーザーは、クエリがテーブルに挿入されている行（ソーステーブル）に対してトリガーとして実行され、結果が新しいテーブル（ターゲットテーブル）に送信されることを忘れないでください。

データがソーステーブルとターゲットテーブルに二重に保存されないようにするために、ソーステーブルのテーブルを[Nullテーブルエンジン](/engines/table-engines/special/null)に変更して、元のスキーマを保持できます。私たちのOTelコレクターはこのテーブルにデータを送り続けます。例えば、ログのために`otel_logs`テーブルは次のようになります：

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

Nullテーブルエンジンは強力な最適化です - `/dev/null`のように考えてください。このテーブルはデータを保存せず、接続されたマテリアライズドビューは、挿入された行の上で実行され、その後破棄されます。

次のクエリを考えてみましょう。これは、私たちが保存したい形式に行を変換し、`LogAttributes`からすべてのカラムを抽出します（これはコレクターが`json_parser`オペレーターを使用して設定されていると仮定します）、`SeverityText`と`SeverityNumber`を設定します（いくつかの簡単な条件に基づいています）[これらのカラム](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext)の定義に基づいています。この場合、私たちは生成されるであろうカラムだけを選択します - `TraceId`、`SpanId`、`TraceFlags`のようなカラムを無視します。

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
Body:        	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:   	2019-01-22 00:26:14
ServiceName:
Status:      	200
RequestProtocol: HTTP/1.1
RunTime:     	0
Size:        	30577
UserAgent:   	Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:     	-
RemoteUser:  	-
RequestType: 	GET
RequestPath: 	/filter/27|13 ,27|  5 ,p53
RemoteAddr: 	54.36.149.41
RefererDomain:
RequestPage: 	/filter/27|13 ,27|  5 ,p53
SeverityText:	INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.027 sec.
```

私たちはまた、上記に`Body`カラムを抽出しました - 将来的に追加の属性が追加される場合に備えて、私たちのSQLによって抽出されていないことがあるかもしれません。このカラムはClickHouseでよく圧縮され、稀にしかアクセスされないため、クエリパフォーマンスに影響を与えることはありません。最後に、時間を節約するために、TimestampをDateTimeに減らします（詳細は ["型の最適化"](#optimizing-types) を参照）。

:::note 条件文
上記で`SeverityText`と`SeverityNumber`を抽出するために使用されている[条件文](/sql-reference/functions/conditional-functions)に注意してください。これらは、複雑な条件を作成し、マップ内の値が設定されているかどうかを確認するのに非常に便利です - 私たちはすべてのキーが`LogAttributes`に存在すると仮定しています。ユーザーがこれに慣れることを推奨します - これらはログ解析の友であり、[null値を扱う](/sql-reference/functions/functions-for-nulls)ための関数と一緒に使用します！
:::

これらの結果を受け取るためにテーブルが必要です。以下のターゲットテーブルは、上記のクエリに一致します：

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

ここで選択された型は、["型の最適化"](#optimizing-types)で議論された最適化に基づいています。

:::note
スキーマが劇的に変更されたことに注意してください。実際には、ユーザーは保持したいトレースカラムや`ResourceAttributes`カラムも持っている可能性があります（このカラムは通常Kubernetesメタデータを含みます）。Grafanaは、トレースカラムを利用して、ログとトレース間のリンク機能を提供できます - 詳細は ["Grafanaの使用"](/observability/grafana) を参照してください。
:::

以下に、マテリアライズドビュー`otel_logs_mv`を作成し、上記のSELECTを`otel_logs`テーブルに対して実行し、結果を`otel_logs_v2`に送ります。

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

この内容は、以下のように視覚化されます：

<img src={require('./images/observability-11.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

["ClickHouseへのエクスポート"](/observability/integrating-opentelemetry#exporting-to-clickhouse)で使用されたコレクター構成を再起動すると、データは我々の望む形式で`otel_logs_v2`に現れます。ここでは、型付きのJSON抽出関数の使用に注意してください。

```sql
SELECT *
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:        	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
Timestamp:   	2019-01-22 00:26:14
ServiceName:
Status:      	200
RequestProtocol: HTTP/1.1
RunTime:     	0
Size:        	30577
UserAgent:   	Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)
Referer:     	-
RemoteUser:  	-
RequestType: 	GET
RequestPath: 	/filter/27|13 ,27|  5 ,p53
RemoteAddress: 	54.36.149.41
RefererDomain:
RequestPage: 	/filter/27|13 ,27|  5 ,p53
SeverityText:	INFO
SeverityNumber:  9

1 row in set. Elapsed: 0.010 sec.
```

`Body`カラムからJSON関数を使用してカラムを抽出する同等のマテリアライズドビューは以下に示されます：

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

上記のマテリアライズドビューは、特に`LogAttributes`マップを使用する場合、暗黙的なキャストに依存しています。ClickHouseはしばしば抽出された値をターゲットテーブルの型に自動的に変換し、必要な構文を減らします。しかし、ユーザーは常に、同じスキーマを使用してターゲットテーブルに対して[`INSERT INTO`](/sql-reference/statements/insert-into)ステートメントを使用してビューをテストすることを推奨します。これにより、型が正しく処理されているかを確認できます。特に次の場合には特別な注意が必要です：

- マップにキーが存在しない場合、空の文字列が返されます。数値の場合、ユーザーはこれらを適切な値にマッピングする必要があります。これは、[条件文](/sql-reference/functions/conditional-functions)で達成できます。例えば、`if(LogAttributes['status'] = "", 200, LogAttributes['status'])`または、デフォルト値が許可される場合は[キャスト関数](/sql-reference/functions/type-conversion-functions#touint8163264256ordefault)を使用できます。例えば、`toUInt8OrDefault(LogAttributes['status'])`。
- 一部の型は常にキャストされない場合があります。例えば、数値の文字列表現は列挙値にキャストされません。
- JSON抽出関数は、値が見つからない場合にはその型に対してデフォルト値を返します。これらの値が妥当であることを確認してください！

:::note Nullableの回避
可観測性データに対してClickhouseで[Nullable](/sql-reference/data-types/nullable)を使用することは避けてください。ログやトレースでは、空とnullを区別する必要はめったにありません。この機能は追加のストレージオーバーヘッドを引き起こし、クエリパフォーマンスに悪影響を与えます。詳細は [こちら](/data-modeling/schema-design#optimizing-types) を参照してください。
:::
## 主（順序）キーの選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出したら、順序/主キーを最適化し始めることができます。

順序キーを選択する際に役立ついくつかの簡単なルールがあります。以下の点は時に対立することがあるため、これらを順に考慮してください。ユーザーはこのプロセスからいくつかのキーを特定でき、4-5個が通常十分です：

1. 一般的なフィルタやアクセスパターンに合ったカラムを選択します。ユーザーが通常特定のカラム（例えば、ポッド名）でフィルタリングして可観測性の調査を開始する場合、このカラムは`WHERE`句で頻繁に使用されます。使用頻度の低いものよりも、これらをキーに含むことを優先してください。
2. フィルタリングしたときに全体の行数の大部分を除外するのに役立つカラムを選択します。これにより、読み取る必要のあるデータ量が減少します。サービス名やステータスコードはしばしば良い候補です - 後者は、ユーザーがほとんどの行を除外する値でフィルタリングする場合に限ります。例えば、200によるフィルタリングは多くのシステムでほとんどの行にマッチしますが、500エラーの場合は小さなサブセットに関連します。
3. テーブル内の他のカラムと強い相関がありそうなカラムを優先します。これにより、これらの値が連続して保存され、圧縮が改善されます。
4. 順序キーに含まれるカラムの`GROUP BY`および`ORDER BY`操作は、メモリ効率を高めることができます。

<br />

順序キーのサブセットを特定したら、特定の順序で宣言する必要があります。この順序は、クエリの二次キー列のフィルタリング効率や、テーブルのデータファイルの圧縮率に大きな影響を与えます。一般的には、**キーをカーディナリティの昇順で並べるのが最良です**。ただし、順序キーに後から現れるカラムでフィルタリングすると、前に現れるタプルのカラムよりも少なくとも効率が悪くなることを考慮してください。これらの挙動をバランスさせ、アクセスパターンを考慮します。最も重要なのは、さまざまなバリアントをテストすることです。順序キーについてさらに理解を深め、それを最適化する方法については、[この記事](/optimize/sparse-primary-indexes)を推奨します。

:::note 構造最優先
ログが構造化されるまで、順序キーを決定することをお勧めします。順序キーやJSON抽出式に属性マップのキーを使用しないでください。順序キーはテーブルのルートカラムである必要があります。
:::
## マップの使用 {#using-maps}

以前の例では、マップ型のカラム`smap['key']`を使用して`Map(String, String)`カラム内の値にアクセスする方法が示されています。ネストされたキーにアクセスするためのマップ記法を使用することに加えて、フィルタリングや選択のための特別なClickHouseの[マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys)が利用可能です。

例えば、以下のクエリは、[`mapKeys`関数](/sql-reference/functions/tuple-map-functions#mapkeys)を使用して`LogAttributes`カラム内のすべてのユニークなキーを特定し、それに続いて[`groupArrayDistinctArray`関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を使用します。

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
マップカラム名にドットを使用することは推奨しておらず、その使用を非推奨にする可能性があります。`_`を使用してください。
:::
## アリアスの使用 {#using-aliases}

マップタイプのクエリは、通常のカラムよりも遅くなります - 詳細は ["クエリの加速"](#accelerating-queries) を参照してください。さらに、構文がより複雑であり、ユーザーが記述するのが面倒になることがあります。この後者の問題に対処するために、エイリアスカラムの使用をお勧めします。

ALIASカラムはクエリ時に計算され、テーブルには保存されません。したがって、このタイプのカラムに値をINSERTすることは不可能です。エイリアスを使用することで、マップキーを参照し、構文を簡素化し、マップエントリを通常のカラムとして透過的に公開することができます。次の例を考えてみましょう：

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

いくつかのマテリアライズドカラムと、マップ `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` があります。このカラムを介して `LogAttributes['remote_addr']` の値をクエリすることができ、クエリを簡素化できます。つまり、次のようにできます：

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

5行のセット。経過時間: 0.011秒。
```

さらに、`ALTER TABLE` コマンドを使用して `ALIAS` を追加するのは簡単です。これらのカラムはすぐに利用可能です。例えば、

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

5行のセット。経過時間: 0.014秒。
```

:::note ALIASはデフォルトで除外されています
デフォルトでは、`SELECT *` には ALIAS カラムが含まれていません。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::
## タイプの最適化 {#optimizing-types}

タイプの最適化に関する [一般的な ClickHouse のベストプラクティス](/data-modeling/schema-design#optimizing-types) は、ClickHouse のユースケースに適用されます。
## コーデックの使用 {#using-codecs}

タイプの最適化に加え、ユーザーは、ClickHouse の可観測性スキーマの圧縮を最適化する際には [コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に従うことができます。

一般的に、ユーザーは `ZSTD` コーデックがログおよびトレースデータセットに非常に適用できることに気付くでしょう。デフォルトの値である 1 から圧縮値を増加させると、圧縮が改善される可能性があります。しかし、これはテストする必要があります。なぜなら、高い値では挿入時により大きな CPU 負荷が発生するからです。通常、私はこの値を増加させることであまり利益が見られません。

さらに、タイムスタンプは圧縮に関してデルタエンコーディングの恩恵を受けますが、このカラムがプライマリー/オーダリングキーで使用されると、クエリパフォーマンスが遅くなることが示されています。ユーザーはそれぞれの圧縮とクエリパフォーマンスのトレードオフを評価することをお勧めします。
## 辞書の使用 {#using-dictionaries}

[辞書](/sql-reference/dictionaries)は、さまざまな内部および外部 [ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのメモリ内 [キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低レイテンシのルックアップクエリに最適化された ClickHouse の [重要な特徴](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) です。

<img src={require('./images/observability-12.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

これは、データを即座に増強し、取り込みプロセスを遅延させることなく、クエリのパフォーマンスを向上させるのに役立ちます。特にJOINが有利になります。可観測性のユースケースではJOINはまれに必要ですが、辞書は挿入時およびクエリ時の両方で増強目的に役立ちます。これらの両方の例を以下に示します。

:::note JOINの加速
辞書を使ってJOINを加速したいユーザーは、[ここ](/dictionary) で詳細を見つけることができます。
:::
### 挿入時 vs クエリ時 {#insert-time-vs-query-time}

辞書は、クエリ時または挿入時にデータセットを増強するために使用できます。これらのアプローチにはそれぞれ利点と欠点があります。要約すると次の通りです：

- **挿入時** - 増強値が変わらず、辞書をポピュレートするために使用できる外部ソースに存在する場合に適切です。この場合、挿入時に行を増強することで、辞書へのクエリ時のルックアップを回避できます。これには、挿入パフォーマンスの観点からのコストや、増強された値がカラムとして保存されるための追加のストレージオーバーヘッドが伴います。
- **クエリ時** - 辞書内の値が頻繁に変わる場合、クエリ時のルックアップがしばしばより適することがあります。これにより、マッピングされた値が変更された場合にカラムを更新（およびデータを再書き込み）する必要がなくなります。この柔軟性は、クエリ時のルックアップコストの面での負担がかかります。このクエリ時のコストは、フィルター句内で辞書ルックアップが必要な多数の行に対して必要な場合には通常顕著です。結果の増強、つまり `SELECT` 内での使用の場合、このオーバーヘッドは通常は顕著ではありません。

ユーザーが辞書の基本を理解することをお勧めします。辞書は、専用の [専門関数](/sql-reference/functions/ext-dict-functions#dictgetall) を使用して値を取得できるメモリ内ルックアップテーブルを提供します。

簡単な増強の例については、[こちら](/dictionary) の辞書に関するガイドを参照してください。以下では一般的な可観測性の増強タスクに焦点を当てます。
### IP 辞書の使用 {#using-ip-dictionaries}

IPアドレスを使って、緯度と経度の値でログやトレースを地理的に増強することは一般的な可観測性の要件です。これを `ip_trie` 構造辞書を使用して達成できます。

[DB-IP.com](https://db-ip.com/) が提供する公共で入手可能な [DB-IP 都市レベルデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を使用します。このデータセットは [CC BY 4.0 ライセンス](https://creativecommons.org/licenses/by/4.0/) の下で提供されています。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データは次のように構造化されていることがわかります：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を考慮して、以下の [url()](/sql-reference/table-functions/url) テーブル関数を使用してデータを覗いてみましょう：

```sql
SELECT *
FROM url('https://raw.githubusercontent.com/sapics/ip-location-db/master/dbip-city/dbip-city-ipv4.csv.gz', 'CSV', '\n    	\tip_range_start IPv4, \n    	\tip_range_end IPv4, \n    	\tcountry_code Nullable(String), \n    	\tstate1 Nullable(String), \n    	\tstate2 Nullable(String), \n    	\tcity Nullable(String), \n    	\tpostcode Nullable(String), \n    	\tlatitude Float64, \n    	\tlongitude Float64, \n    	\ttimezone Nullable(String)\n	\t')
LIMIT 1
FORMAT Vertical
Row 1:
──────
ip_range_start: 1.0.0.0
ip_range_end:   1.0.0.255
country_code:   AU
state1:     	Queensland
state2:     	ᴺᵁᴸᴸ
city:       	South Brisbane
postcode:   	ᴺᵁᴸᴸ
latitude:   	-27.4767
longitude:  	153.017
timezone:   	ᴺᵁᴸᴸ
```

作業を楽にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使って、フィールド名を持つ ClickHouse テーブルオブジェクトを作成し、行数を確認します：

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
│ 3261621 │ -- 3.26百万
└─────────┘
```

私たちの `ip_trie` 辞書は、IP アドレス範囲を CIDR 形式で表現する必要があるため、`ip_range_start` と `ip_range_end` を変換します。

各範囲の CIDR は、次のクエリで簡潔に計算できます：

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
│ 1.0.0.0    	 │ 1.0.0.255	│ 1.0.0.0/24 │
│ 1.0.1.0    	 │ 1.0.3.255	│ 1.0.0.0/22 │
│ 1.0.4.0    	 │ 1.0.7.255	│ 1.0.4.0/22 │
│ 1.0.8.0    	 │ 1.0.15.255   │ 1.0.8.0/21 │
└────────────────┴──────────────┴────────────┘

4行のセット。経過時間: 0.259秒。
```

:::note
上のクエリには多くのことが行われています。興味のある方は、次の優れた [説明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation) を読んでください。さもなくば、上記の内容がIP範囲のCIDRを計算していると認識してください。
:::

私たちの目的には、IP範囲、国コード、座標だけが必要なので、新しいテーブルを作成してGeo IPデータを挿入します：

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

ClickHouseで低レイテンシのIPルックアップを実行するために、Geo IPデータのキー->属性マッピングをメモリ内に保存するために辞書を活用します。ClickHouseは、ネットワークプレフィックス（CIDRブロック）を座標と国コードにマッピングするための `ip_trie` [辞書構造](/sql-reference/dictionaries#ip_trie) を提供します。次のクエリは、このレイアウトを使用し、上記のテーブルをソースとして指定します。

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
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN       	   │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU       	   │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU       	   │
└────────────┴──────────┴───────────┴──────────────┘

3行のセット。経過時間: 4.662秒。
```

:::note 定期的な更新
ClickHouseの辞書は、基礎となるテーブルデータと上記のライフタイム句に基づいて定期的に更新されます。DB-IPデータセットに最新の変更を反映させるためには、ただ `geoip` テーブルに変換を適用したデータを再挿入すれば良いです。
:::

Geo IPデータが `ip_trie` 辞書（便利にも `ip_trie` と名付けられています）にロードされたので、IP地理的な位置を特定するためにこれを使用できます。これは、以下のように [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して実行できます：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1行のセット。経過時間: 0.003秒。
```

ここで注意すべきは、取得速度です。これにより、ログを増強できます。この場合、**クエリ時の増強を実行することを選択しました**。

元のログデータセットに戻ると、次のように、国ごとにログを集約するためにこれを使用できます。以下は、以前のマテリアライズドビューから得られたスキーマを使用することを前提とし、抽出された `RemoteAddress` カラムがあります。

```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
	formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR  	  │ 7.36百万	│
│ US  	  │ 1.67百万	│
│ AE  	  │ 526.74千 │
│ DE  	  │ 159.35千 │
│ FR  	  │ 109.82千 │
└─────────┴─────────────────┘

5行のセット。経過時間: 0.140秒。処理済み 20.73百万行、82.92 MB (147.79百万行/s., 591.16 MB/s.)
ピークメモリ使用量: 1.16 MiB。
```

IPと地理的位置のマッピングは変更される可能性があるため、ユーザーは、リクエストが行われた時点でどこからリクエストが発信されたかを知りたいと考えがちです - 同じアドレスが現在の地理的な場所として何であるかではありません。このため、インデックス時の増強が好まれる可能性があります。これは、以下に示すようにマテリアライズドカラムまたはマテリアライズドビューの選択で行うことができます：

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

:::note 定期的に更新
ユーザーは、新しいデータに基づいて IP 増強辞書を定期的に更新したいと考えるでしょう。これは、辞書の `LIFETIME` 句を使用することで実現できます。この句により、辞書は基礎となるテーブルから定期的に再ロードされます。基礎となるテーブルを更新する方法については、 ["リフレッシュ可能なマテリアライズドビュー"](/materialized-view/refreshable-materialized-view) を参照してください。
:::

上記の国と座標は、国別でのグループ化やフィルタリングを超えた可視化能力を提供します。インスピレーションを得るために、["地理データの可視化"](/observability/grafana#visualizing-geo-data) を参照してください。
### 正規表現辞書の使用（ユーザーエージェントの解析） {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent) の解析は、古典的な正規表現の問題であり、ログやトレースベースのデータセットで一般的な要件です。ClickHouseは、正規表現ツリー辞書を使用してユーザーエージェントの効率的な解析を提供します。

正規表現ツリー辞書は、YAMLRegExpTree 辞書ソースタイプを使用して ClickHouse オープンソースで定義されており、正規表現ツリーを含む YAML ファイルへのパスを提供します。独自の正規表現辞書を提供したい場合、必要な構造の詳細は [こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) で確認できます。以下では、[uap-core](https://github.com/ua-parser/uap-core) を使用したユーザーエージェントの解析に焦点を当て、サポートされている CSV 形式の辞書をロードします。このアプローチは、OSS と ClickHouse Cloud の両方と互換性があります。

:::note
以下の例では、2024年6月のユーザーエージェント解析用の最新の uap-core 正規表現のスナップショットを使用します。最新のファイルは、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) で見つけることができます。ユーザーは、[こちら](/sql-reference/dictionaries#collecting-attribute-values) の手順に従って、以下で使用される CSV ファイルにロードできます。
:::

以下のメモリテーブルを作成します。これらは、デバイス、ブラウザ、およびオペレーティングシステムを解析するための正規表現を保持します。

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

これらのテーブルは、次の公開ホストされた CSV ファイルから、url テーブル関数を使用してポピュレートできます：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルがポピュレートされたら、正規表現辞書をロードします。キー値をカラムとして指定する必要があります - これらはユーザーエージェントから抽出する属性になります。

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

これらの辞書がロードされたら、サンプルユーザーエージェントを提供して、新しい辞書抽出機能をテストできます：

```sql
WITH 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0' AS user_agent
SELECT
	dictGet('regexp_device_dict', ('device_replacement', 'brand_replacement', 'model_replacement'), user_agent) AS device,
	dictGet('regexp_browser_dict', ('family_replacement', 'v1_replacement', 'v2_replacement'), user_agent) AS browser,
	dictGet('regexp_os_dict', ('os_replacement', 'os_v1_replacement', 'os_v2_replacement', 'os_v3_replacement'), user_agent) AS os

┌─device────────────────┬─browser───────────────┬─os─────────────────────────┐
│ ('Mac','Apple','Mac') │ ('Firefox','127','0') │ ('Mac OS X','10','15','0') │
└───────────────────────┴───────────────────────┴────────────────────────────┘

1行のセット。経過時間: 0.003秒。
```

ユーザーエージェントに関する規則は、ほとんど変わることはないため、新しいブラウザやオペレーティングシステム、デバイスに応じて変更される必要があるため、挿入時にこの抽出を行うことが理にかなっています。

これは、マテリアライズドカラムを使用するか、マテリアライズドビューを使用して行うことができます。以前使用したマテリアライズドビューを変更します：

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

コレクタを再起動し、文書化された手順に基づいて構造化されたログを取り込んだ後、私たちは新たに抽出されたDevice、Browser、およびOsカラムをクエリできます。

```sql
SELECT Device, Browser, Os
FROM otel_logs_v2
LIMIT 1
FORMAT Vertical

Row 1:
──────
Device:  ('Spider','Spider','Desktop')
Browser: ('AhrefsBot','6','1')
Os:  	('Other','0','0','0')
```

:::note 複雑な構造のためのタプル
注意: これらのユーザーエージェントカラムにはタプルを使用しています。タプルは、階層が事前に知られている複雑な構造に推奨されます。サブカラムは、マップキーとは異なり、通常のカラムと同じパフォーマンスを提供し、異種型を許可します。
:::
### さらなる読み物 {#further-reading}

辞書についてのさらなる例や詳細については、以下の記事をお勧めします：

- [高度な辞書トピック](/dictionary#advanced-dictionary-topics)
- ["辞書を使用してクエリを加速する"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)
## クエリの加速 {#accelerating-queries}

ClickHouse は、クエリパフォーマンスを加速するためのいくつかの手法をサポートしています。以下の点は、適切なプライマリー/オーダリングキーを選択して、最も人気のあるアクセスパターンを最適化し、圧縮を最大化した後にのみ考慮すべきです。これが通常、最小の努力でパフォーマンスに最大の影響を与えます。
### 集約のためのマテリアライズドビュー（増分）の使用 {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データ変換とフィルタリングのためのマテリアライズドビューの使用を探りました。マテリアライズドビューは、挿入時に集約を事前計算して結果を保存するためにも使用できます。この結果は、後続の挿入の結果で更新されるため、挿入時に集約を事前計算できる効果的な方法です。

ここでの主なアイデアは、結果がしばしば元のデータの小さな表現（集約の場合は部分的なスケッチ）であるということです。これを、対象テーブルから結果を読み取るためのよりシンプルなクエリと組み合わせることで、元のデータに対して同じ計算を実行するよりもクエリ時間が短縮されるでしょう。

次のクエリを考えてみましょう。構造化されたログを使用して、時間ごとの総トラフィックを計算します：

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

5行のセット。経過時間: 0.666秒。処理済み 10.37百万行、4.73 GB (15.56百万行/s., 7.10 GB/s.)
ピークメモリ使用量: 1.40 MiB。
```

これは、ユーザーがGrafanaでプロットするかもしれない一般的な折れ線グラフであると想像できます。このクエリは確かに非常に速いですが、データセットはわずかに1千万行であり、ClickHouseは速いです！しかし、これを数十億や数兆の行にスケールさせる場合、理想的には、このクエリパフォーマンスを維持したいと考えます。

:::note
このクエリは、`otel_logs_v2` テーブルを使用する場合、10倍速くなります。これは以前のマテリアライズドビューの結果であり、`LogAttributes` マップからサイズキーを抽出します。ここでは説明のために生データを使用していますが、これは一般的なクエリの場合、以前のビューを使用することをお勧めします。
:::

マテリアライズドビューを使用して、挿入時にこれを計算したい場合は、結果を受け取るテーブルが必要です。このテーブルは、1時間あたり1行のみを保持すべきです。既存の時間の更新が受信された場合、他のカラムは既存の時間の行にマージされるべきです。この他の列に対して部分的な状態を保存する必要があります。

これには、ClickHouse の特殊なエンジンタイプが必要です。SummingMergeTree です。これにより、同じオーダリングキーを持つすべての行が、一つの行に置き換えられ、その行には数値カラムの合計値が含まれます。次のテーブルは、同じ日付を持つ行をマージし、数値カラムの合計を計算します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

私たちのマテリアライズドビューを示すために、`bytes_per_hour` テーブルが空でデータを受け取っていないと仮定します。マテリアライズドビューは、`otel_logs` に挿入されたデータについて上記の `SELECT` を実行し、その結果を `bytes_per_hour` に送信します。構文は以下の通りです：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの `TO` 句は重要です。結果がどこに送られるのかを示します。つまり、`bytes_per_hour` に送られます。

OTelコレクタを再起動し、ログを再送信すると、`bytes_per_hour` テーブルは、上記のクエリ結果で逐次的にポピュレートされます。完了すると、`bytes_per_hour` のサイズを確認できます。時間ごとに1行があるはずです：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│ 	113 │
└─────────┘

1行のセット。経過時間: 0.039秒。
```

私たちは、ここで `otel_logs` の 10百万行から 113 行に右ポリシーの結果を記録することに成功しました。重要なのは、新しいログが `otel_logs` テーブルに挿入されると、それぞれの時間の新しい値が `bytes_per_hour` に送信され、バックグラウンドで非同期に自動的にマージされることです。`bytes_per_hour` は常に小さくかつ最新であるため、1時間ごとに1行のみを保持します。

行のマージは非同期で行われるため、ユーザーがクエリした際、1時間に複数の行があってもよいです。残っている行がクエリ時にマージされることを保証するために、次の2つのオプションがあります：

- テーブル名の [`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier) を使用する（このクエリではカウントクエリに対してこれを行いました）。
- 最終テーブルに使用されるオーダリングキー（つまり、タイムスタンプ）で集約し、メトリックを合計します。

通常、2 番目のオプションはより効率的で柔軟性があり（テーブルは他の用途にも使用できます）、最初のオプションは一部のクエリにとっては単純である可能性があります。以下に両方を示します：

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

5行のセット。経過時間: 0.008秒。

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

5行のセット。経過時間: 0.005秒。
```

これにより、クエリの速度が 0.6 秒から 0.008 秒に向上しました - 75 倍です！

:::note
これらの節約は、より大規模なデータセットでより複雑なクエリの場合、さらに大きくなる可能性があります。詳細な例については [こちら](https://github.com/ClickHouse/clickpy) を参照してください。
:::
#### より複雑な例 {#a-more-complex-example}

上記の例は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) を使用して、時間ごとの単純なカウントを集計しています。単純な合計を超えた統計では、異なるターゲットテーブルエンジンが必要です。それが [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) です。

日ごとにユニークなIPアドレス（またはユニークユーザー）の数を計算したいと仮定します。このためのクエリは次のようになります：

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	4763    │
…
│ 2019-01-22 00:00:00 │    	536     │
└─────────────────────┴─────────────┘

113 行がセットにあります。経過時間: 0.667 秒。処理された行数: 1037 万行、サイズ: 4.73 GB (1570 万行/秒、7.09 GB/秒)
```

増分更新のために基数カウントを永続化するには、AggregatingMergeTree が必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouse が集計状態を保存することを理解できるように、`UniqueUsers` カラムを [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 型として定義し、部分状態の関数ソース（uniq）とソースカラムの型（IPv4）を指定します。SummingMergeTree と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では Hour）。

関連するマテリアライズドビューは、以前のクエリを使用します：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
	uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集計関数の末尾に `State` サフィックスを付けることに注意してください。これにより、関数の集計状態が最終結果ではなく返されることが保証されます。これには、この部分状態が他の状態とマージできるようにするための追加情報が含まれます。

データが収集されて再読み込みされると、Collector の再起動を通じて、`unique_visitors_per_hour` テーブルに 113 行があることを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│ 	113   │
└─────────┘

1 行がセットにあります。経過時間: 0.009 秒。
```

最終的なクエリは、関数のマージサフィックスを利用する必要があります（カラムが部分集計状態を保存しているため）：

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	 4763   │

│ 2019-01-22 00:00:00 │		 536    │
└─────────────────────┴─────────────┘

113 行がセットにあります。経過時間: 0.027 秒。
```

ここでは `FINAL` を使用するのではなく、`GROUP BY` を使用することに注意してください。
### マテリアライズドビュー（増分）の利用による迅速なルックアップ {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルターおよび集計句で頻繁に使用されるカラムを伴う ClickHouse の順序キーを選択する際に、アクセスパターンを考慮すべきです。これは、ユーザーが多様なアクセスパターンを持ち、それを単一のカラムセットでカプセル化することができない観測性のユースケースでは制約となることがあります。これは、デフォルトのOTel スキーマに組み込まれた例で最もよく示されます。トレースのデフォルトスキーマを考えてみましょう：

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

このスキーマは、`ServiceName`、`SpanName`、`Timestamp` でのフィルタリングに最適化されています。トレースでは、ユーザーは特定の `TraceId` によるルックアップの能力と、関連するトレースのスパンを取得する必要があります。これは順序キーに存在しますが、その位置が最後であるため、[フィルタリングは効率的ではない](/optimize/sparse-primary-indexes#ordering-key-columns-efficiently) ことが示されており、1つのトレースを取得する際にスキャンするデータの量が大幅になる可能性があります。

OTel コレクターは、この課題に対処するために、マテリアライズドビューと関連するテーブルをインストールします。テーブルとビューは以下の通りです：

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

このビューは、テーブル `otel_traces_trace_id_ts` がトレースの最小および最大タイムスタンプを持つことを保証します。このテーブルは `TraceId` によって順序付けられ、これによりこれらのタイムスタンプを効率的に取得できます。これらのタイムスタンプ範囲は、メインの `otel_traces` テーブルをクエリする際に使用できます。具体的には、Grafana がトレースを ID で取得する際には、次のクエリを使用します：

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

このCTEは、トレース ID `ae9226c78d1d360601e6383928e4d22d` のための最小および最大タイムスタンプを特定し、その後この情報を使用してメインの `otel_traces` をフィルタリングし、関連スパンを取得します。

この同様のアプローチは、同じアクセスパターンに適用できます。データモデルにおける類似の例を[こちら](#/materialized-view#lookup-table)で探求します。
### プロジェクションの利用 {#using-projections}

ClickHouse のプロジェクションにより、ユーザーはテーブルのために複数の `ORDER BY` 句を指定することができます。

以前のセクションでは、マテリアライズドビューが ClickHouse で集計を事前に計算し、行を変換し、異なるアクセスパターンへの観測性クエリを最適化するためにどのように使用できるかを探求しました。

マテリアライズドビューが、挿入を受け取る元のテーブルとは異なる順序キーを持つターゲットテーブルに行を送信する例を提供しました。プロジェクションは、プライマリキーの一部でないカラムのクエリを最適化できるため、この問題に対処するために使用できます。

理論的には、この機能はテーブルに対して複数の順序キーを提供するために使用できますが、ひとつ明確なデメリットがあります：データの重複です。具体的には、データは各プロジェクションのために指定された順序に加えて、メインのプライマリキーの順序で書き込まれる必要があります。これにより、挿入が遅くなり、ディスクスペースがさらに消費されます。

:::note プロジェクションとマテリアライズドビュー
プロジェクションはマテリアライズドビューと同様の機能を多数提供しますが、後者がしばしば好まれるため、控えめに使用すべきです。ユーザーはその欠点を理解し、使用が適切な場合を理解するべきです。例えば、プロジェクションが集計を事前に計算するために使用される一方で、ユーザーがこの目的にマテリアライズドビューを利用することをお勧めします。
:::

<img src={require('./images/observability-13.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

次のクエリを考えてみましょう。このクエリは、`otel_logs_v2` テーブルを 500 エラーコードでフィルタリングします。これは、エラーコードでフィルタリングを行いたいユーザーにとって一般的なアクセスパターンとなるでしょう：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 行がセットにあります。経過時間: 0.177 秒。処理された行数: 1037 万行、サイズ: 685.32 MB (5866 万行/秒、3.88 GB/秒)
ピークメモリ使用量: 56.54 MiB。
```

:::note 性能測定に Null を使用
ここでは `FORMAT Null` を使用して結果を表示しません。これにより、すべての結果が読み取られますが、返されることはないため、LIMIT によるクエリの早期終了を防ぎます。これは10m行をスキャンするためにかかる時間を示すためだけのものです。
:::

上記のクエリは、選択した順序キー `(ServiceName, Timestamp)` を使用してリニアスキャンを必要とします。上記のクエリのパフォーマンスを改善するために `Status` を順序キーの最後に追加することもできますが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

最初にプロジェクションを作成し、その後マテリアライズする必要があることに注意してください。この後者のコマンドにより、データが異なる2つの順序でディスクに二重に保存される原因になります。データ生成時にプロジェクションを定義することも可能で、以下のように示され、データが挿入される際に自動的に維持されます。

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

重要なのは、プロジェクションが `ALTER` を介して作成された場合、`MATERIALIZE PROJECTION` コマンドが発行されたときにその作成が非同期で行われることです。ユーザーは次のクエリを使用してこの操作の進行状況を確認でき、`is_done=1` を待ちます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│       	0 │   	1   │                	 │
└─────────────┴─────────┴────────────────────┘

1 行がセットにあります。経過時間: 0.008 秒。
```

上記のクエリを繰り返すと、追加ストレージのコストを伴ってパフォーマンスが大幅に改善されていることがわかります（ディスクサイズと圧縮の測定方法については、[#measuring-table-size--compression](#measuring-table-size--compression) を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 行がセットにあります。経過時間: 0.031 秒。処理された行数: 51420 行、サイズ: 22.85 MB (165万行/秒、734.63 MB/秒)
ピークメモリ使用量: 27.85 MiB。
```

上記の例では、プロジェクション内で以前のクエリに使用するカラムを指定しました。これにより、これらの指定されたカラムのみがプロジェクションの一部としてディスクに保存され、Status によって順序付けられることになります。逆に、ここで `SELECT *` を使用した場合、すべてのカラムが保存されます。これにより、プロジェクションを利用するためのクエリは増えますが、追加のストレージが発生します。ディスクスペースと圧縮の測定には、[#measuring-table-size--compression](#measuring-table-size--compression) を参照してください。
### セカンダリ/データスキッピングインデックス {#secondarydata-skipping-indices}

ClickHouse においてプライマリキーがどれだけうまく調整されていても、いくつかのクエリは必然的に全テーブルスキャンを必要とします。これはマテリアライズドビューを使用することで軽減できますが（および一部のクエリに対するプロジェクションを使用することで）、これには追加の保守が必要であり、ユーザーがそれらの存在を理解していることが必要です。伝統的なリレーショナルデータベースはセカンダリインデックスを使用してこの問題を解決しますが、これは ClickHouse のような列指向データベースでは無効です。代わりに、ClickHouse は「スキップ」インデックスを使用して、マッチング値のない大きなデータブロックをスキップできるようにすることによってクエリパフォーマンスを大幅に向上させます。

デフォルトのOTel スキーマは、マップアクセスのアクセラレーションを試みるためにセカンダリインデックスを使用します。これらは一般的に効果がないと見なさ れ、カスタムスキーマにコピーすることは推奨しませんが、スキップインデックスは依然として有用です。

ユーザーは、適用する前に[セカンダリインデックスガイド](/optimize/skipping-indexes)を読み、理解するべきです。

**一般に、プライマリキーとターゲットとなる非プライマリカラム/式との間に強い相関関係が存在する場合、そしてユーザーが希少な値、すなわち多くのグラニュールに存在しない値を検索している場合に効果的です。**
### テキスト検索のためのブルームフィルタ {#bloom-filters-for-text-search}

観測性クエリにおいて、ユーザーがテキスト検索を行う必要があるとき、セカンダリインデックスは有用です。具体的には、ngram とトークンベースのブルームフィルタインデックス [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) と [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) を使用して、`LIKE`、`IN`、および hasToken 演算子を使用して文字列カラムに対する検索を加速できます。重要なのは、トークンベースのインデックスは、非英数字の文字を区切りとして使用してトークンを生成します。これは、クエリ時にのみトークン（または単語全体）が一致することを意味します。より厳密なマッチングには、[N-gramブルームフィルタ](/optimize/skipping-indexes#bloom-filter-types)を使用することができます。これは、文字列を指定されたサイズのngramに分割し、サブワードのマッチングを可能にします。

トークンが生成される結果を評価するために、`tokens` 関数を使用できます：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 行がセットにあります。経過時間: 0.008 秒。
```

`ngram` 関数は類似の機能を提供し、`ngram` サイズを第二引数として指定できます：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 行がセットにあります。経過時間: 0.008 秒。
```

:::note 逆インデックス
ClickHouse はセカンダリインデックスとして逆インデックスの実験的サポートを持っていますが、現在のところログデータセットにはこれを推奨していません。しかし、これが生産準備が整ったらトークンベースのブルームフィルタに取って代わることを期待しています。
:::

この例では、構造化されたログデータセットを使用します。`Referer` カラムに `ultra` を含むログをカウントしたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 行がセットにあります。経過時間: 0.177 秒。処理された行数: 1037 万行、サイズ: 908.49 MB (5857 万行/秒、5.13 GB/秒)
```

ここで、ngram サイズ 3 で一致させる必要があります。したがって、`ngrambf_v1` インデックスを作成します。

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

インデックス `ngrambf_v1(3, 10000, 3, 7)` は、ここで 4 つのパラメータを取ります。最後のもの（値 7）はシードを表し、他のものはngram サイズ（3）、値 `m`（フィルタサイズ）、およびハッシュ関数の数 `k`（7）を表します。`k` および `m` は調整が必要で、ユニークなngram/トークンの数と、フィルタが真の否定を得る確率に基づいて決定されます。これは、グラニュールに値が存在しないことを確認します。これらの値を確立するために[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を推奨します。

正しく調整すれば、ここでのスピードアップは大幅になる可能性があります。

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│ 	182   │
└─────────┘

1 行がセットにあります。経過時間: 0.077 秒。処理された行数: 422 万行、サイズ: 375.29 MB (5481 万行/秒、4.87 GB/秒)
ピークメモリ使用量: 129.60 KiB。
```

:::note 例示目的のみ
上記は説明のためのものであり、トークンベースのブルームフィルタを使用してテキスト検索を最適化しようとするのではなく、挿入時にログから構造を抽出することをお勧めします。ただし、ユーザーがスタックトレースや他の大きな文字列を持っている場合など、構造が不確定なためテキスト検索が有用である場合もあります。
:::

ブルームフィルタの使用に関するいくつかの一般的なガイドライン：

ブルームの目的は、[グラニュール](/optimize/sparse-primary-indexes#clickhouse-index-design)をフィルターすることであり、それによってカラムのすべての値を読み込んでリニアスキャンを実行する必要を回避することです。`EXPLAIN` 句とパラメータ `indexes=1` を使用して、スキップされたグラニュールの数を特定することができます。次の応答を見てみましょう：元のテーブル `otel_logs_v2` と `otel_logs_bloom` のテーブルの例で、ngram ブルームフィルタを用いたものです。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                      	 │
│   Aggregating                                                  	 │
│ 	Expression (Before GROUP BY)                               	     │
│   	Filter ((WHERE + Change column names to column identifiers)) │
│     	ReadFromMergeTree (default.otel_logs_v2)               	     │
│     	Indexes:                                               	     │
│       	PrimaryKey                                           	 │
│         	Condition: true                                    	     │
│         	Parts: 9/9                                         	     │
│         	Granules: 1278/1278                                	     │
└────────────────────────────────────────────────────────────────────┘

10 行がセットにあります。経過時間: 0.016 秒。


EXPLAIN indexes = 1
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                      	 │
│   Aggregating                                                  	 │
│ 	Expression (Before GROUP BY)                               	     │
│   	Filter ((WHERE + Change column names to column identifiers)) │
│     	ReadFromMergeTree (default.otel_logs_bloom)            	     │
│     	Indexes:                                               	     │
│       	PrimaryKey                                           	 │ 
│         	Condition: true                                    	     │
│         	Parts: 8/8                                         	     │
│         	Granules: 1276/1276                                 	 │
│       	Skip                                                 	 │
│         	Name: idx_span_attr_value                          	     │
│         	Description: ngrambf_v1 GRANULARITY 1              	     │
│         	Parts: 8/8                                         	     │
│         	Granules: 517/1276                                 	     │
└────────────────────────────────────────────────────────────────────┘
```

ブルームフィルタは、通常、列自体よりも小さい場合にのみ効率的です。逆に、フィルタが大きい場合には、パフォーマンス上の利益はほとんど無い可能性があります。以下のクエリを使用して、フィルタとカラムのサイズを比較します：

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
│ Referer │ 56.16 MiB   	│ 789.21 MiB    	│ 14.05 │
└─────────┴─────────────────┴───────────────────┴───────┘

1 行がセットにあります。経過時間: 0.018 秒。


SELECT
	`table`,
	formatReadableSize(data_compressed_bytes) AS compressed_size,
	formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB   	│ 12.17 MiB     	│
└─────────────────┴─────────────────┴───────────────────┘

1 行がセットにあります。経過時間: 0.004 秒。
```

上の例では、セカンダリブルームフィルタインデックスは、列自体の圧縮サイズ56MBのほぼ5倍小さい12MBであることがわかります。

ブルームフィルタは、かなりの調整が必要な場合があります。どの設定が最適かを特定する際に役立つリファレンスとして、[こちら](#bloom-filter) を参照してください。また、ブルームフィルタは挿入とマージの時に高額になる可能性があります。生産環境にブルームフィルタを追加する前に、挿入パフォーマンスへの影響を評価してください。

セカンダリスキップインデックスに関するさらなる詳細は[こちら](#skip-index-functions)を参照してください。
### マップからの抽出 {#extracting-from-maps}

マップ型はOTel スキーマ内で一般的に使用されます。この型は、キーと値が同じ型である必要があります—Kubernetesラベルのようなメタデータに十分です。マップ型のサブキーをクエリする際は、親カラム全体がロードされることに注意してください。マップが多数のキーを持つ場合、これはディスクから読み取るデータが増えるため、重大なクエリペナルティを引き起こす可能性があります。

特定のキーを頻繁にクエリする場合、そのキーをルートの専用カラムに移動することを検討してください。これは通常、一般的なアクセスパターンに応じて行われ、デプロイ後に発生する作業であり、生産前に予測するのは困難です。デプロイ後のスキーマ変更方法については、[#managing-schema-changes](#managing-schema-changes)を参照してください。
## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouse が観測性に使用される主な理由のひとつは、圧縮です。

ストレージコストを劇的に削減し、ディスク上のデータが少ないほど入力/出力が少なく、クエリや挿入が速くなります。入出力が削減されることで、CPUに関してどの圧縮アルゴリズムのオーバーヘッドよりも重視されます。データの圧縮を改善することは、ClickHouse のクエリが速くなることを確保する際の最初の焦点であるべきです。

圧縮を測定する詳細については、[こちら](/#compression-in-clickhouse)を参照してください。
