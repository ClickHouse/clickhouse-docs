---
title: 'スキーマ設計'
description: '可観測性のためのスキーマ設計'
keywords: [observability, logs, traces, metrics, OpenTelemetry, Grafana, OTel]
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';

# 可観測性のためのスキーマ設計

ユーザーには、以下の理由からログとトレース用の独自のスキーマを常に作成することをお勧めします。

- **主キーの選択** - デフォルトのスキーマは特定のアクセスパターンに最適化された `ORDER BY` を使用します。あなたのアクセスパターンがこれと一致する可能性は低いです。
- **構造の抽出** - ユーザーは既存のカラムから新しいカラムを抽出したい場合があります。例えば、`Body` カラムのように。この作業は、マテリアライズドカラム（そして、より複雑な場合にはマテリアライズドビュー）を使用して行うことができます。これにはスキーマの変更が必要です。
- **マップの最適化** - デフォルトのスキーマは属性の格納にマップ型を使用します。これらのカラムは任意のメタデータの格納を可能にします。この機能は必須ですが、イベントからのメタデータが事前に定義されていないことが多く、したがって ClickHouse のような強い型のデータベースでは他に格納できないため、マップのキーとその値へのアクセスは通常のカラムへのアクセスほど効率的ではありません。私たちは、スキーマを変更し、最も一般的にアクセスされるマップキーをトップレベルのカラムにすることによってこれに対処します - 詳細は ["SQLによる構造の抽出"](#extracting-structure-with-sql) を参照してください。これにはスキーマの変更が必要です。
- **マップキーアクセスの簡略化** - マップ内のキーにアクセスするには、より冗長な構文が必要です。ユーザーはエイリアスを使用してこれを軽減できます。クエリを簡素化するために、["エイリアスの使用"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマは、マップへのアクセスを高速化し、テキストクエリを加速するためにセカンダリインデックスを使用します。これらは通常必要ではなく、追加のディスクスペースを消費します。これらは使用できますが、必要であることを確認するためにテストされるべきです。詳細は ["セカンダリ/データスキッピングインデックス"](#secondarydata-skipping-indices) を参照してください。
- **コーデックの使用** - ユーザーは、想定されるデータを理解しており、これが圧縮の改善につながるという証拠がある場合は、カラムのコーデックをカスタマイズしたいと考えるかもしれません。

_上記の各ユースケースについて詳細に説明します。_

**重要:** ユーザーは最適な圧縮とクエリパフォーマンスを達成するために、自身のスキーマを拡張および変更することを奨励されていますが、可能な限り基本カラムに対して OTel スキーマの命名規則に従うべきです。ClickHouse Grafana プラグインは、クエリ構築を支援するために基本的な OTel カラム（例: Timestamp や SeverityText）の存在を前提としています。ログとトレースに必要なカラムは、こちらに文書化されています [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) において、それぞれ確認できます。これらのカラム名を変更することを選択し、プラグイン設定でデフォルトを上書きすることができます。
## SQLによる構造の抽出 {#extracting-structure-with-sql}

構造化されたログまたは非構造化されたログを取り込む際、ユーザーは次の機能を必要とすることがよくあります。

- **文字列のブロブからカラムを抽出する**。これにクエリする際、文字列操作を使用するよりも速くなります。
- **マップからキーを抽出する**。デフォルトのスキーマは、任意の属性をマップ型のカラムに配置します。この型は、ログとトレースを定義する際に属性のカラムを事前に定義する必要がないという利点があるスキーマレスの能力を提供します。このことは、Kubernetes からログを収集し、ポッドラベルを後で検索できるように保持したい場合にしばしば不可能です。マップキーとその値へのアクセスは、通常の ClickHouse カラムでのクエリよりも遅くなるため、マップからキーをルートテーブルのカラムに抽出することが望まれることが多いです。

次のクエリを考えてみてください：

構造化ログを使用して、どの URL パスが最も多くの POST リクエストを受け取るかをカウントしたいとします。JSONのブロブは、`Body` カラムに文字列として格納されています。さらに、もしユーザーがコレクターで json_parser を有効にした場合は、`LogAttributes` カラムにも `Map(String, String)` として格納されている可能性があります。

```sql
SELECT LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:      	{"remote_addr":"54.36.149.41","remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET","request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1","status":"200","size":"30577","referer":"-","user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"}
LogAttributes: {'status':'200','log.file.name':'access-structured.log','request_protocol':'HTTP/1.1','run_time':'0','time_local':'2019-01-22 00:26:14.000','size':'30577','user_agent':'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)','referer':'-','remote_user':'-','request_type':'GET','request_path':'/filter/27|13 ,27|  5 ,p53','remote_addr':'54.36.149.41'}
```

`LogAttributes` が利用可能であると仮定すると、サイトの URL パスが最も多くの POST リクエストを受け取るかをカウントするためのクエリは次のようになります：

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

ここでのマップ構文の使用に注意してください。例えば、`LogAttributes['request_path']`や、URL からクエリパラメータを取り除くための [`path` 関数](/sql-reference/functions/url-functions#path) です。

もしユーザーがコレクターで JSON パースを有効にしていない場合、`LogAttributes` は空になり、文字列 `Body` からカラムを抽出するために [JSON 関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note ClickHouseによるパースを優先
一般的に、構造化ログの JSON パースは ClickHouse で行うことをお勧めします。ClickHouse が最も高速な JSON パース実装であることに自信を持っています。しかし、ユーザーが他のソースにログを送信したい場合や、このロジックを SQL に居住させたくない場合もあることを認識しています。
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

今度は非構造化ログについて考えてみましょう：

```sql
SELECT Body, LogAttributes
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Body:      	151.233.185.144 - - [22/Jan/2019:19:08:54 +0330] "GET /image/105/brand HTTP/1.1" 200 2653 "https://www.zanbil.ir/filter/b43,p56" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36" "-"
LogAttributes: {'log.file.name':'access-unstructured.log'}
```

非構造化ログの同様のクエリでは、[`extractAllGroupsVertical` 関数](/sql-reference/functions/string-search-functions#extractallgroupsvertical) を使用して正規表現が必要です。

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

非構造化ログをパースするためのクエリの複雑さとコストが増加する（パフォーマンスの違いに注意）ため、可能な限り構造化ログを使用することをお勧めします。

:::note 辞書を考慮
上記のクエリは、正規表現辞書を活用するように最適化できます。詳細は [辞書の使用](#using-dictionaries) を参照してください。 
:::

上記の2つのユースケースは、挿入時に上記のクエリロジックを移動することで ClickHouse によって満たされます。以下で、各アプローチが適切な状況を強調します。

:::note OTel や ClickHouse で処理?
ユーザーは、OTel コレクターのプロセッサやオペレーターを使用して処理を実行することもできます。詳細は [こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching) を参照してください。ほとんどの場合、ClickHouse はコレクターのプロセッサよりもはるかにリソース効率が良く、迅速であることがわかります。すべてのイベント処理を SQL で行うことの主な欠点は、ソリューションが ClickHouse に結びつくことです。たとえば、ユーザーが処理されたログを OTel コレクターから別の宛先（例：S3）に送信したいと考えることがあります。
:::
### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出する最も簡単なソリューションを提供します。このようなカラムの値は常に挿入時に計算され、INSERT クエリで指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、挿入時に新しいカラムとしてディスクに抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムは任意の ClickHouse 表現をサポートし、[文字列の処理](/sql-reference/functions/string-functions)（[正規表現や検索](/sql-reference/functions/string-search-functions)を含む）や [URL](/sql-reference/functions/url-functions) を処理するための任意の分析関数を活用することができます。また、[型変換](/sql-reference/functions/type-conversion-functions)、[JSON からの値の抽出](/sql-reference/functions/json-functions)、または [数学的操作](/sql-reference/functions/math-functions)を実行できます。

基本的な処理にはマテリアライズドカラムをお勧めします。特に、マップから値を抽出し、それらをルートカラムに昇格させ、型変換を実行するのに便利です。これらは、非常に基本的なスキーマやマテリアライズドビューと組み合わせて使用されると最も便利です。次のスキーマは、コレクターによって JSON が `LogAttributes` カラムに抽出されたログ用です：

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

JSON 関数を使用して抽出するための同等のスキーマは [こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==) で確認できます。

マテリアライズドビューの 3 つのカラムは、リクエストページ、リクエストタイプ、リファラーのドメインを抽出します。これらはマップキーにアクセスし、それらの値に関数を適用します。その後のクエリは大幅に高速化されます：

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
マテリアライズドカラムは、デフォルトでは `SELECT *` で返されません。これは、`SELECT *` の結果が常に INSERT を使用してテーブルに再挿入できることを保証するためです。この動作は、 `asterisk_include_materialized_columns=1` を設定することで無効にでき、Grafana でも有効にできます（データソース設定の `追加設定 -> カスタム設定` を参照）。
:::
## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views)は、ログやトレースに対して SQL フィルタリングと変換を適用するためのより強力な手段を提供します。

マテリアライズドビューでは、計算コストをクエリ時から挿入時にシフトすることができます。ClickHouse のマテリアライズドビューは、データがテーブルに挿入されるときにバッチに対してクエリを実行するトリガーです。このクエリの結果が第2の「ターゲット」テーブルに挿入されます。

<img src={observability_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

:::note リアルタイムアップデート
ClickHouse のマテリアライズドビューは、基づくテーブルにデータが流入するとリアルタイムで更新され、継続的に更新されるインデックスのように機能します。対照的に、他のデータベースでは、マテリアライズドビューは通常、リフレッシュが必要な静的なクエリのスナップショットです（ClickHouse の更新可能なマテリアライズドビューに似ています）。
:::

関連するマテリアライズドビューのクエリは、理論上は任意のクエリを使用できますが、集約を含むこともできます。ただし、[ジョインには制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログとトレースの処理およびフィルタリングのワークロードには、ユーザーは任意の `SELECT` ステートメントを使用できると考えても問題ありません。

ユーザーは、クエリは挿入される行を対象とするテーブル（ソーステーブル）で実行され、その結果が新しいテーブル（ターゲットテーブル）に送信されるトリガーであることを忘れないでください。

データ를2重に保存しないようにするために（ソーステーブルとターゲットテーブルの両方）、ソーステーブルのテーブルに [Null テーブルエンジン](/engines/table-engines/special/null) を変更し、元のスキーマを保持できます。我们的 OTel 收集器将继续向此表发送数据。例如，对于日志，`otel_logs` テーブルは以下のようになります：

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

Null テーブルエンジンは強力な最適化です - `/dev/null` と考えてください。このテーブルはデータを保存しませんが、結合されたマテリアライズドビューは挿入された行に対して仍然 実行されます。

次のクエリでは、私たちが保存したい形式に行を変換し、`LogAttributes` からすべてのカラムを抽出します（これはコレクターによって `json_parser` オペレーターを使用して設定されたと仮定しています）、`SeverityText` と `SeverityNumber`（特定の条件に基づいて設定）を設定します。この場合、私たちは私たちが知っているカラムのみを選択します - `TraceId`、`SpanId`、`TraceFlags` などのカラムを無視します。

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

上記では `Body` カラムも抽出しています - 追加の属性が後で追加される場合のためです。ClickHouse ではこのカラムは圧縮されやすく、あまりアクセスされないため、クエリパフォーマンスに悪影響を及ぼすことはありません。最後に、Timestamp を DateTime に削減します（スペースを節約するため - 詳細は ["型の最適化"](#optimizing-types) を参照）し、キャストを行います。

:::note 条件
上記での [条件付き関数](/sql-reference/functions/conditional-functions) の使用に注意してください。これらは複雑な条件を形成するのに非常に便利であり、マップ内の値が設定されているかどうかをチェックするために有用です - 私たちは『すべてのキーが `LogAttributes` に存在するものと仮定する』と無邪気に考えています。ユーザーはこれらに精通することをお勧めします - これらはログのパースにおいて友人であり、[null 値の処理関数](/sql-reference/functions/functions-for-nulls)に関する関数と同様です!
:::

これらの結果を受け取るテーブルが必要です。以下のターゲットテーブルは、上記のクエリに一致します。

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
スキーマが大幅に変更されたことに注意してください。実際には、ユーザーは保持したいトレースカラムやカラム `ResourceAttributes` を持つことが考えられます（これは通常 Kubernetes メタデータを含みます）。Grafana は、トレースカラムを活用してログとトレースの間のリンク機能を提供できます - 詳細は ["Grafanaの使用"](/observability/grafana) を参照してください。
:::

以下で、マテリアライズドビュー `otel_logs_mv` を作成します。このビューは、`otel_logs` テーブルの上記の選択を実行し、結果を `otel_logs_v2` に送信します。

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

上記のビューは、以下のように視覚化存在します：

<img src={observability_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

次に、["ClickHouse へのエクスポート"](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用されるコレクター構成を再起動すると、希望する形式で `otel_logs_v2` にデータが表示されます。型付きの JSON 抽出関数の使用に注意してください。

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

`Body` カラムから JSON 関数を使用してカラムを抽出する同等のマテリアライズドビューは以下のように示されます。

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

上記のマテリアライズドビューは、特に `LogAttributes` マップを使用する場合に暗黙的なキャストに依存しています。ClickHouse は、抽出された値をターゲットテーブルの型に透明にキャストすることが多く、必要な構文が削減されます。ただし、ユーザーには、ターゲットテーブルと同じスキーマを持つ [`INSERT INTO`](/sql-reference/statements/insert-into) ステートメントを使用してビューをテストすることを常にお勧めします。これにより、型が正しく処理されていることを確認できます。特に以下のケースに注意を払うべきです：

- マップ内でキーが存在しない場合は、空の文字列が返されます。数値の場合、ユーザーはこれらを適切な値にマップする必要があります。これは、[条件付き関数](/sql-reference/functions/conditional-functions) で実現できます。例えば、`if(LogAttributes['status'] = ", 200, LogAttributes['status'])` や、デフォルト値が許容される場合は、[キャスト関数](/sql-reference/functions/type-conversion-functions) を使用できます。例えば、`toUInt8OrDefault(LogAttributes['status'] )`です。
- 一部の型は常にキャストされない場合があります。例えば、数値の文字列表現は列挙型の値にキャストされません。
- JSON 抽出関数は、値が見つからない場合に、その型に対するデフォルト値を返します。これらの値が意味を持つことを確認してください！

:::note Nullableの回避
ClickHouse での可観測性データに [Nullable](/sql-reference/data-types/nullable) を使用することは避けるべきです。ログやトレースで空と null を区別する必要があることはまれです。この機能は追加のストレージオーバーヘッドを引き起こし、クエリパフォーマンスに悪影響を及ぼします。詳細は [こちら](https://data-modeling/schema-design#optimizing-types) を参照してください。
:::
## 主（順序）キーの選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出したら、順序/主キーの最適化を開始できます。

いくつかの単純なルールを適用して、順序キーを選択するのに役立ちます。以下では、時折競合する可能性があるため、これらを順番に考慮します。ユーザーは、このプロセスからキーを識別でき、通常は4〜5個で十分です：

1. 一般的なフィルタリングとアクセスパターンに沿ったカラムを選択します。ユーザーが通常、特定のカラム（例：ポッド名）でフィルタリングして可観測性の調査を開始する場合、このカラムは `WHERE` 句で頻繁に使用されます。頻繁に使用されるキーを含めることを優先してください。
2. フィルタリング時に合計行の大半を除外するのに役立つカラムを優先し、読み取る必要のあるデータ量を減らします。サービス名やステータスコードは多くの場合良い候補です。後者の場合は、ユーザーが行のほとんどを除外する値でフィルタリングする場合のみにします。例えば、200 でフィルタリングすると、ほとんどのシステムでほとんどの行と一致しますが、500エラーは小さなサブセットに対応します。
3. テーブル内の他のカラムと強く相関していると思われるカラムを優先します。これにより、これらの値が連続して格納され、圧縮が改善されます。
4. 順序キーのカラムに対する `GROUP BY` および `ORDER BY` 操作は、メモリ効率を向上させることができます。

<br />

順序キーのサブセットを特定したら、特定の順序で宣言する必要があります。この順序は、クエリ内のセカンダリキー列のフィルタリング効率と、テーブルのデータファイルの圧縮率に大きな影響を及ぼす可能性があります。一般的には、**カーディナリティの昇順でキーを並べるのが最良です**。ただし、順序キーで後に表示されるカラムのフィルタリングは、組に表示される前のカラムよりも効率が悪くなることを考慮する必要があります。これらの動作のバランスを取り、アクセスパターンを考慮してください。最も重要なのは、バリエーションをテストすることです。順序キーについてのさらなる理解と最適化については、[この記事](https://guides/best-practices/sparse-primary-indexes)を推奨します。

:::note 構造優先
ログを構造化した後に順序キーを決定することをお勧めします。属性マップ内のキーや JSON 抽出式を順序キーとして使用しないでください。順序キーをテーブルのルートカラムとして持っていることを確認してください。
:::
## マップの使用 {#using-maps}

前の例では、`Map(String, String)` カラム内の値にアクセスするためにマップ構文 `map['key']` の使用が示されています。ネストされたキーにアクセスするためのマップの記法の使用に加えて、フィルタリングやこれらのカラムを選択するために使用できる特別な ClickHouse の [マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys) があります。

例えば、以下のクエリは [`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) を使用して `LogAttributes` カラム内のすべてのユニークキーを識別し、次に [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を適用します。

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

:::note ドットの回避
マップカラム名にドットを使用しないことをお勧めします。使用する場合は `_` を推奨します。
:::
```yaml
title: 'エイリアスの使用'
sidebar_label: 'エイリアスの使用'
keywords: 'ClickHouse, SQL, エイリアス'
description: 'エイリアスの使用に関するClickHouseのドキュメント。エイリアス列の作成方法と使用例について説明します。'
```

## エイリアスの使用 {#using-aliases}

マップ型のクエリは、通常のカラムよりも遅くなります - 参照してください ["クエリの高速化"](#accelerating-queries)。さらに、構文がより複雑であり、ユーザーが記述するのが面倒になる場合があります。この後者の問題を解決するために、エイリアスカラムを使用することを推奨します。

ALIASカラムはクエリ時に計算され、テーブルには保存されません。したがって、このタイプのカラムに値をINSERTすることは不可能です。エイリアスを使用することで、マップキーを参照し、構文を簡素化し、マップエントリを通常のカラムとして透過的に公開できます。次の例を考えてみましょう：

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

いくつかのマテリアライズドカラムと、マップ `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` があります。これにより、このカラムを介して `LogAttributes['remote_addr']` の値をクエリできるため、クエリが簡素化されます。つまり、次のようになります。

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

さらに、`ALTER TABLE` コマンドを通じて `ALIAS` を追加するのは簡単です。これらのカラムは即座に使用可能です。例えば：

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

:::note ALIASはデフォルトで除外される
デフォルトでは、`SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::
## タイプの最適化 {#optimizing-types}

最適化タイプに関する [一般的なClickHouseのベストプラクティス](/data-modeling/schema-design#optimizing-types) は、ClickHouseの使用ケースに適用されます。
## コーデックの使用 {#using-codecs}

タイプの最適化に加えて、ユーザーはClickHouseの可観測性スキーマの圧縮を最適化する際に [コーデックに関する一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に従うことができます。

一般に、ユーザーは `ZSTD` コーデックがログおよびトレースデータセットに非常に適用可能であることを見つけるでしょう。圧縮値をデフォルト値1から増加させると、圧縮が改善される可能性があります。ただし、これをテストする必要があります。高い値は、挿入時により多くのCPUオーバーヘッドをもたらすためです。通常、この値を増加させてもあまり利点は見られません。

さらに、タイムスタンプは圧縮に関してデルタエンコーディングから恩恵を受けますが、このカラムがプライマリ/オーダリングキーに使用されると、クエリパフォーマンスが遅くなることが示されています。ユーザーは、それぞれの圧縮とクエリパフォーマンスのトレードオフを評価することを推奨します。
## 辞書の使用 {#using-dictionaries}

[辞書](/sql-reference/dictionaries)は、さまざまな内部および外部 [ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのメモリ内 [キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供するClickHouseの[重要な機能です](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)。これは、超低遅延の検索クエリ向けに最適化されています。

<img src={observability_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

これは、取り込まれたデータを即座に豊かにし、処理プロセスを遅らせることなく、一般にクエリのパフォーマンスを向上させるさまざまなシナリオで役立ちます。JOINが特に恩恵を受けます。可観測性のユースケースではJOINがほとんど必要ないですが、エンリッチメントの目的で辞書は役立つことがあります - 挿入時およびクエリ時の両方でです。以下に両方の例を示します。

:::note JOINの高速化
辞書を使用してJOINを加速することに興味があるユーザーは、[こちら](/dictionary)に詳細を見つけることができます。
:::
### 挿入時とクエリ時 {#insert-time-vs-query-time}

辞書は、クエリ時または挿入時にデータセットを豊かにするために使用できます。これらのアプローチにはそれぞれ利点と欠点があります。要約すると：

- **挿入時** - これは、エンリッチメント値が変更されず、辞書を同じデータに使用できる外部ソースに存在する場合に通常適切です。この場合、挿入時の行のエンリッチメントは、辞書へのクエリ時のルックアップを回避します。これにより、挿入のパフォーマンスが影響されるほか、強化された値がカラムとして保存されるため、追加のストレージオーバーヘッドが発生します。
- **クエリ時** - 辞書内の値が頻繁に変わる場合、クエリ時のルックアップがより適用されることがよくあります。これにより、マップされた値が変わった場合にカラムを更新する必要がなく（およびデータを再書き込み）、フレキシブルさを得られます。ただし、このフレキシビリティは、クエリ時のルックアップコストの犠牲で得られます。このクエリ時のコストは、フィルター句で辞書のルックアップが必要な多くの行に対して特に顕著です。結果のエンリッチメント、つまり `SELECT` での場合、このオーバーヘッドは通常は目立ちません。

ユーザーは辞書の基本を理解することを推奨します。辞書は、専用の [特化関数](/sql-reference/functions/ext-dict-functions#dictgetall) を使用して値を取得できるメモリ内のルックアップテーブルを提供します。

簡単なエンリッチメントの例については、[こちら](/dictionary)の辞書に関するガイドを参照してください。以下では、一般的な可観測性エンリッチメントタスクに焦点を当てます。
### IP辞書の使用 {#using-ip-dictionaries}

ログとトレースを、IPアドレスを使用して緯度と経度の値で地理的にエンリッチすることは一般的な可観測性の要件です。これは `ip_trie` 構造化辞書を使用して達成できます。

公開されている [DB-IP都市レベルのデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を、[DB-IP.com](https://db-ip.com/) の [CC BY 4.0ライセンス](https://creativecommons.org/licenses/by/4.0/) の条件のもとで使用します。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データは次のように構造化されていることがわかります：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を考慮して、データを［url］(/sql-reference/table-functions/url)テーブル関数を使用して覗いてみましょう：

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

簡単にするため、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使用して、フィールド名を持つClickHouseテーブルオブジェクトを作成し、行数を確認します：

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

`ip_trie` 辞書はIPアドレス範囲をCIDR記法で表す必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲のCIDRは、次のクエリで簡潔に計算できます：

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

4 rows in set. Elapsed: 0.259 sec.
```

:::note
上記のクエリには多くの処理があります。興味のある方は、非常に優れた[説明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を読んでください。それ以外の場合、上記はIP範囲のCIDRを計算します。
:::

我々の目的のために必要なのはIP範囲、国コード、および座標だけですので、新しいテーブルを作成してGeo IPデータを挿入します：

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

低遅延のIPルックアップをClickHouseで実行するために、辞書を利用してGeo IPデータのキー -> 属性マッピングをメモリ内に保存します。ClickHouseは、ネットワークプレフィックス（CIDRブロック）を座標および国コードにマッピングするために `ip_trie` [辞書構造](/sql-reference/dictionaries#ip_trie) を提供します。以下のクエリは、このレイアウトを使用して辞書を指定します。

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

辞書から行を選択して、このデータセットがルックアップ用に利用可能であることを確認します：

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN       	   │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU       	   │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU       	   │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note 定期更新
ClickHouseの辞書は、基になるテーブルデータと上記のライフタイム句に基づいて定期的に更新されます。DB-IPデータセットの最新の変更を反映させるために、geoip_urlリモートテーブルから `geoip` テーブルにデータを再挿入するだけで辞書を更新できます。
:::

Geo IPデータが `ip_trie` 辞書に読み込まれたので（便利に `ip_trie` とも呼ばれます）、これを使用してIPの地理的位置を取得できます。これは、次のように [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して行うことができます。

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ここでの取得速度に注意してください。これによりログをエンリッチできます。この場合、**クエリ時のエンリッチメント**を実施します。

元のログデータセットに戻り、上記を使用して国別にログを集計できます。以下は、`RemoteAddress` カラムが抽出された以前のマテリアライズドビューから得られるスキーマを使用していることを前提としています。

```sql
SELECT dictGet('ip_trie', 'country_code', tuple(RemoteAddress)) AS country,
	formatReadableQuantity(count()) AS num_requests
FROM default.otel_logs_v2
WHERE country != ''
GROUP BY country
ORDER BY count() DESC
LIMIT 5

┌─country─┬─num_requests────┐
│ IR  	  │ 7.36 million	│
│ US  	  │ 1.67 million	│
│ AE  	  │ 526.74 thousand │
│ DE  	  │ 159.35 thousand │
│ FR  	  │ 109.82 thousand │
└─────────┴─────────────────┘

5 rows in set. Elapsed: 0.140 sec. Processed 20.73 million rows, 82.92 MB (147.79 million rows/s., 591.16 MB/s.)
Peak memory usage: 1.16 MiB.
```

IPアドレスから地理的な位置マッピングは変わる可能性があるため、ユーザーはリクエストが行われた時点でのリクエストの発生元を知りたいと思うでしょう - 同じアドレスの現在の地理的位置ではありません。この理由から、インデックスタイムのエンリッチメントが好まれることが多いです。これは、以下のようにマテリアライズドカラムを使用して行うことができます。

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
ユーザーは、新しいデータに基づいてIPエンリッチメント辞書を定期的に更新することを望むでしょう。これは、辞書のLIFETIME句を使用して実現でき、これにより辞書は基になるテーブルから定期的に再読み込まれます。基になるテーブルを更新する方法については、["リフレッシュ可能なマテリアライズドビュー"](/materialized-view/refreshable-materialized-view)を参照してください。
:::

上記の国および座標は、国別にグループ化およびフィルタリングする以上の視覚化能力を提供します。インスピレーションについては、["地理データの視覚化"](/observability/grafana#visualizing-geo-data)を参照してください。
### 正規表現辞書の使用（ユーザーエージェントの解析） {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent)の解析は古典的な正規表現の問題であり、ログとトレースベースのデータセットにおいて一般的な要件です。ClickHouseは、正規表現ツリー辞書を使用してユーザーエージェントを効率的に解析します。

正規表現ツリー辞書は、クリックハウスオープンソースでYAMLRegExpTree辞書ソースタイプを使用して定義され、正規表現ツリーを含むYAMLファイルへのパスが提供されます。独自の正規表現辞書を提供する場合は、必要な構造の詳細が[こちら](https://sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source)にあります。以下では、[uap-core](https://github.com/ua-parser/uap-core)を使用してユーザーエージェント解析を行い、サポートされるCSV形式の辞書を読み込みます。このアプローチはOSSおよびClickHouse Cloudと互換性があります。

:::note
以下の例では、2024年6月からのユーザーエージェント解析用の最新のuap-core正規表現のスナップショットを使用します。最新のファイルは、時折更新され、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)で見つけることができます。ユーザーは、[こちら](https://sql-reference/dictionaries#collecting-attribute-values)の手順に従って、以下で使用するCSVファイルにロードすることができます。
:::

次のメモリテーブルを作成します。これには、デバイス、ブラウザ、およびオペレーティングシステムの解析用の正規表現が保持されます。

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

次の公開ホストCSVファイルからこれらのテーブルを人口させることができます。urlテーブル関数を使用します：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルが充填されたので、正規表現辞書をロードできます。重要なのは、キー値をカラムとして指定する必要があることです - これらはユーザーエージェントから抽出できる属性になります。

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

これらの辞書が読み込まれたら、サンプルユーザーエージェントを提供し、新しい辞書抽出能力をテストします：

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

ユーザーエージェントに関するルールはあまり変わらないため、この抽出は挿入時に行うのが理にかなっています。

この作業をマテリアライズドカラムを使用して行うことも、マテリアライズドビューを使用することもできます。以前に使用されていたマテリアライズドビューを修正しましょう：

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

これにより、目的のテーブル `otel_logs_v2` のスキーマを修正する必要があります：

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

収集器を再起動し、構造化されたログを取り込み、それに基づいて、新しく抽出されたDevice、Browser、Osカラムをクエリできます。

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
これらのユーザーエージェントカラムにタプルを使用する点に注意してください。タプルは、階層があらかじめわかっている複雑な構造に推奨されます。サブカラムは、マップキーとは異なり、通常のカラムと同じパフォーマンスを提供し、異種型を許可します。
:::
### さらなる読み込み {#further-reading}

辞書に関するさらなる例や詳細については、以下の記事をお勧めいたします：

- [高度な辞書トピック](/dictionary#advanced-dictionary-topics)
- ["辞書を使用してクエリを加速する"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)
## クエリの高速化 {#accelerating-queries}

ClickHouseは、クエリパフォーマンスを加速するためのいくつかの技術をサポートしています。以下は、最も人気のあるアクセスパターンに最適化された適切なプライマリ/オーダリングキーを選択し、圧縮を最大化することを選択した後に考慮すべきです。これが通常、最小の労力でパフォーマンスに最大の影響を与えるでしょう。
### 集約に対するマテリアライズドビュー（増分）を使用する {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データの変換とフィルタリングのためのマテリアライズドビューの使い方を探りました。しかし、マテリアライズドビューは、挿入時に集約をあらかじめ計算し、結果を保存するためにも使用できます。この結果は、後続の挿入からの結果で更新されるため、実質的に、挿入時に集約をあらかじめ計算できるようになります。

ここでの主な考え方は、結果が元のデータのより小さな表現（集約の場合は部分的なスケッチ）であることがよくあることです。結果をターゲットテーブルから読むための単純なクエリと組み合わせると、元のデータで同じ計算が実行されるよりもクエリ時間が速くなります。

次のクエリを考えてみましょう。構造化されたログを使用して時間あたりの総トラフィックを計算します：

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

これは、ユーザーがGrafanaで描くであろう一般的な折れ線グラフです。このクエリは非常に高速です - データセットはわずか1000万行であり、ClickHouseは速いです！しかし、これを数十億、数兆の行にスケールアップすると、理想的にはこのクエリパフォーマンスを維持したいと思うでしょう。

:::note
このクエリは、`otel_logs_v2` テーブルを使用すれば10倍速くなります。このテーブルは以前のマテリアライズドビューからのものであり、 `LogAttributes` マップからサイズキーを抽出します。ここでは説明の目的で生データを使用していますが、このクエリが一般的であれば以前のビューを使用することをお勧めします。
:::

この処理をマテリアライズドビューを使用して挿入時に計算した結果を受け取るテーブルを作成する必要があります。このテーブルは、時刻ごとに1行のみを保持する必要があります。既存の時間に対して更新が受信された場合、他のカラムの内容は既存の時間の行にマージされる必要があります。この状態を増分でマージするためには、他のカラムの部分状態を保存しておく必要があります。

これには、ClickHouseの特別なエンジンタイプが必要です。SummingMergeTreeです。これは、同じオーダリングキーのすべての行を1つの行に置き換え、数値カラムの合計値を持つ行を作成します。以下のテーブルは、同じ日付の行をマージし、数値カラムの内容を合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

マテリアライズドビューをデモンストレーションするために、`bytes_per_hour` テーブルが空でデータを受け取る前提として、今後のデータが `otel_logs` から挿入され、上記の `SELECT` が実行され、その結果が `bytes_per_hour` に送られます。この構文は次のようになります：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの`TO`句が重要で、結果が送信される場所を示すものです。つまり、`bytes_per_hour`です。

OTel Collectorを再起動し、ログを再送信すると、`bytes_per_hour` テーブルは上記のクエリ結果で増分的にポピュレートされます。完了後、`bytes_per_hour` のサイズを確認できます。時間ごとに1行ずつ保持されているはずです：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│ 	113 │
└─────────┘
```

ここで、実際には `otel_logs` では1000万行から113行に減少しています。重要なのは、新しいログが `otel_logs` テーブルに挿入されると、`bytes_per_hour` に対して新しい値が送信され、それぞれの時間ごとに非同期で自動的にマージされます。`bytes_per_hour` は常に小さく最新の状態であります。

行のマージは非同期のため、クエリ時にユーザーがクエリを実行した場合、1時間に複数の行が存在する可能性があります。未処理の行をマージするために、次の2つのオプションがあります：

- （上記の `count` クエリに対して行ったように）テーブル名の末尾に [`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier) を使用する。
- 最終テーブルで使用されるオーダリングキーで集約し、メトリックを合計します。

通常、2つ目のオプションはより効率的かつ柔軟です（このテーブルは他の目的にも使用できます）が、1つ目のオプションは一部のクエリで簡単に実行できます。両方を示します：

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

これにより、クエリの速度が0.6秒から0.008秒に向上し、75倍以上のスピードアップが達成されます！

:::note
これらのコスト削減は、より大きなデータセットでより複雑なクエリの場合はさらに大きくなります。例については[こちら](https://github.com/ClickHouse/clickpy)を参照してください。
:::
```

#### より複雑な例 {#a-more-complex-example}

上記の例は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)を使用して、時間ごとの単純なカウントを集約します。単純な合計以上の統計を要求する場合は、異なるターゲットテーブルエンジンが必要です: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

ユニークなIPアドレス（またはユニークユーザー）の数を日ごとに計算したいとします。このクエリは次のようになります。

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

113 rows in set. Elapsed: 0.667 sec. Processed 10.37 million rows, 4.73 GB (15.53 million rows/s., 7.09 GB/s.)
```

インクリメンタル更新のために基数カウントを持続するには、AggregatingMergeTreeが必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouseが集約状態が保存されることを理解できるように、`UniqueUsers`カラムを[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)型として定義し、部分状態の関数ソース（uniq）とソースカラムの型（IPv4）を指定します。SummingMergeTreeと同様に、同じ`ORDER BY`キー値を持つ行はマージされます（上の例ではHour）。

関連するマテリアライズドビューは、前のクエリを使用します。

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
	uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数の末尾に`State`というサフィックスを追加することに注意してください。これにより、関数の集約状態が最終結果の代わりに返されます。これには、他の状態とマージするための追加情報が含まれます。

データがコレクタの再起動を通じて再ロードされた後、`unique_visitors_per_hour`テーブルに113行が利用可能であることを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│ 	113   │
└─────────┘

1 row in set. Elapsed: 0.009 sec.
```

私たちの最終クエリは、関数に対してマージサフィックスを使用する必要があります（カラムが部分集約状態を保存しているため）：

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │   	 4763   │
│ 2019-01-22 00:00:00 │		 536    │
└─────────────────────┴─────────────┘

113 rows in set. Elapsed: 0.027 sec.
```

ここでは`FINAL`ではなく`GROUP BY`を使用することに注意してください。
### マテリアライズドビュー（インクリメンタル）を使用した迅速な検索 {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルタや集約句で頻繁に使用されるカラムと共にClickHouseの並びキーを選択する際に、自分たちのアクセスパターンを考慮すべきです。これは、ユーザーが多様なアクセスパターンを持ち、それが単一のカラムセットに収束できない観測性のユースケースでは制限となる可能性があります。これは、デフォルトのOTelスキーマに組み込まれた例で最もよく示されます。トレースのデフォルトスキーマを考えてみましょう。

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

このスキーマは、`ServiceName`、`SpanName`、および`Timestamp`によるフィルタリングに最適化されています。トレースにおいて、ユーザーは特定の`TraceId`による検索や関連するトレースのスパンを取得する能力も必要です。これは並びキーには存在しますが、最後の位置にあると、[フィルタリングの効率が低下する](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)ことを意味し、一つのトレースを取得する際に大量のデータをスキャンする必要があるかもしれません。

OTelコレクタはこの課題に対処するために、マテリアライズドビューと関連するテーブルもインストールします。テーブルとビューは以下のように示されています。

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

このビューは、テーブル`otel_traces_trace_id_ts`がトレースの最小および最大タイムスタンプを持っていることを効果的に保証します。このテーブルは`TraceId`で並べ替えられており、これによりこれらのタイムスタンプを効率的に取得できます。これらのタイムスタンプ範囲は、メインの`otel_traces`テーブルをクエリするときに使用できます。具体的には、Grafanaが以下のクエリを使用してIDによってトレースを取得します。

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

CTEはここでトレースID `ae9226c78d1d360601e6383928e4d22d` の最小および最大タイムスタンプを特定し、これを使用してメインの`otel_traces`を関連するスパンのフィルタリングに使用します。

このアプローチは、同様のアクセスパターンに対しても適用できます。データモデリングの類似した例を[こちらで](/materialized-view/incremental-materialized-view#lookup-table)探ります。
### プロジェクションを使用する {#using-projections}

ClickHouseのプロジェクションを使用すると、テーブルに対して複数の`ORDER BY`句を指定できます。

以前のセクションでは、マテリアライズドビューがClickHouseで集約を事前計算し、行を変換し、異なるアクセスパターンのために観測性クエリを最適化するためにどのように使用できるかを探討しました。

ここでは、マテリアライズドビューが異なる順序キーを持つターゲットテーブルに行を送信し、トレースIDによる検索の最適化のために、元のテーブルは挿入の順序で受け取る必要があるという例を提供しました。

プロジェクションは同じ問題に対処するために使用でき、ユーザーはプライマリキーの一部でないカラムのクエリの最適化を行うことができます。

理論的には、この機能を使用して、テーブルに対して複数の並びキーを提供できますが、一つの大きな欠点があります：データの重複です。具体的には、データは各プロジェクションに指定された順序とは別に、メインプライマリキーの順序に従って書き込む必要があります。これにより、挿入が遅くなり、ディスクスペースがより多く消費されます。

:::note プロジェクションとマテリアライズドビュー
プロジェクションは、マテリアライズドビューと同様の多くの機能を提供しますが、後者の方が好まれることが多く、使用は控えめにすべきです。ユーザーは欠点を理解し、適切な場合にそれらを使用すべきです。たとえば、プロジェクションは集約を事前計算するために使用できますが、ユーザーはこの目的のためにマテリアライズドビューの使用を推奨します。
:::

<img src={observability_13}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

以下のクエリを考えてみましょう。それは`otel_logs_v2`テーブルを500エラーコードでフィルタリングしています。これは、ユーザーがエラーコードでフィルタリングしたい場合の一般的なアクセスパターンである可能性があります：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 rows in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 685.32 MB (58.66 million rows/s., 3.88 GB/s.)
Peak memory usage: 56.54 MiB.
```

:::note 性能を測定するためにNullを使用する
ここで`FORMAT Null`を使用して結果を出力しません。これにより、すべての結果が読み取られますが、返されないため、LIMITによるクエリの早期終了を防ぎます。これは、全10m行をスキャンするのにかかった時間を示すためだけのものです。
:::

上記のクエリは、選択した並びキー`(ServiceName, Timestamp)`に対して線形スキャンを必要とします。上記のクエリのパフォーマンスを改善するために、`Status`を並びキーの末尾に追加することもできますが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

最初にプロジェクションを作成し、その後に物質化する必要があることに注意してください。この後者のコマンドは、データを二つの異なる順序でディスクに二重に保存することになります。データ作成時にプロジェクションを定義することもできます。以下のように、データが挿入されると自動的に維持されます。

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

重要なのは、プロジェクションが`ALTER`を介して作成された場合、その作成は非同期であり、`MATERIALIZE PROJECTION`コマンドが発行されたときに実行されます。ユーザーは次のクエリでこの操作の進捗を確認し、`is_done=1`を待つことができます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│       	0 │   	1   │                	 │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

上記のクエリを繰り返すと、パフォーマンスが大幅に改善されていることがわかりますが、追加のストレージを犠牲にします（詳しくは["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 rows in set. Elapsed: 0.031 sec. Processed 51.42 thousand rows, 22.85 MB (1.65 million rows/s., 734.63 MB/s.)
Peak memory usage: 27.85 MiB.
```

上記の例では、プロジェクションで以前のクエリで使用されたカラムを指定しています。これにより、指定されたカラムのみがプロジェクションの一部としてディスクに格納され、Statusで並べ替えられます。代わりに`SELECT *`を使用すると、すべてのカラムが保存されます。これにより、任意のカラムの subset を使用してクエリを実行できるようになりますが、追加のストレージが発生します。ディスクスペースと圧縮を測定するには、["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください。
### セカンダリ/データスキッピングインデックス {#secondarydata-skipping-indices}

ClickHouseでプライマリキーがどれほど調整されていても、一部のクエリは必然的にテーブル全体のスキャンを必要とします。これは、マテリアライズドビューを使用することによって緩和できます（そして一部のクエリにはプロジェクションを使用します）が、これらは追加のメンテナンスを必要とし、ユーザーはそれらの使用を確実にするためにその可用性を意識する必要があります。伝統的なリレーショナルデータベースはセカンダリインデックスでこれを解決しますが、これはClickHouseのような列指向データベースでは効果的ではありません。その代わりに、ClickHouseは「スキップ」インデックスを使用し、一致する値のない大きなデータチャンクをスキップできるため、クエリのパフォーマンスを大幅に向上させることができます。

デフォルトのOTelスキーマは、マップアクセスのアクセラレーションを試みるためにセカンダリインデックスを使用しています。これらが一般的に効果がないことがわかり、カスタムスキーマにコピーすることをお勧めしませんが、スキッピングインデックスは依然として便利です。

ユーザーは、これらを適用しようとする前に[セカンダリインデックスのガイド](/optimize/skipping-indexes)を読み、理解しておくべきです。

**一般に、プライマリキーとターゲットとする非プライマリカラム/式との間に強い相関がある場合、かつユーザーが希少な値、つまり多くのグラニュールに存在しない値を探している場合に、効果的です。**
### テキスト検索のためのブルームフィルター {#bloom-filters-for-text-search}

観測性クエリにおいて、テキスト検索を行う必要がある際に、セカンダリインデックスは役立つことがあります。特に、ngramとトークンベースのブルームフィルターインデックス[`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types)と[`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types)は、`LIKE`、`IN`、およびhasToken演算子を使用してStringカラムの検索を加速するために使用できます。重要なのは、トークンベースのインデックスが区切り文字として非アルファベット文字を使用してトークンを生成する点です。これにより、クエリ時にトークン（単語そのもの）のみが一致することができます。より詳細なマッチングには、[N-グラムブルームフィルター](/optimize/skipping-indexes#bloom-filter-types)を使用できます。これは、文字列を指定されたサイズのnグラムに分割し、サブワードマッチングを可能にします。

生成されるトークンとしたがって一致するものを評価するために、`tokens`関数を使用できます：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram`関数は、第二のパラメータとしてnグラムサイズを指定できる同様の機能を提供します。

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 逆インデックス
ClickHouseはまた、セカンダリインデックスとして逆インデックスの実験的なサポートも持っています。現在、これらをログデータセットには推奨していませんが、製品版の準備が整ったらトークンベースのブルームフィルターを置き換えることを予想しています。
:::

この例では構造化されたログデータセットを使用します。`Referer`カラムに`ultra`が含まれるログをカウントしたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

ここで、nグラムサイズが3でマッチする必要があります。そのため、`ngrambf_v1`インデックスを作成します。

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

インデックス`ngrambf_v1(3, 10000, 3, 7)`はここで4つのパラメータを取ります。これらのうち最後の値（7）はシードを表します。他のものはnグラムサイズ（3）、値`m`（フィルタサイズ）、およびハッシュ関数の数`k`（7）を表します。`k`と`m`はチューニングが必要で、ユニークなnグラム/トークンの数やフィルタが真負を返す確率に基づいています。これらの値を確立するためには、[これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を推奨します。

適切にチューニングされた場合、ここでの速度向上はかなり重要です：

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│ 	182   │
└─────────┘

1 row in set. Elapsed: 0.077 sec. Processed 4.22 million rows, 375.29 MB (54.81 million rows/s., 4.87 GB/s.)
Peak memory usage: 129.60 KiB.
```

:::note 例に過ぎない
上記は説明を目的とした例に過ぎません。ユーザーは、テキスト検索を最適化するためにトークンベースのブルームフィルターを使用するのではなく、挿入時にログから構造を抽出することを推奨します。ただし、スタックトレースや構造が不明確な他の大きな文字列がある場合、テキスト検索が役立つことがあります。
:::

ブルームフィルターを使用する際の一般的なガイドライン：

ブルームの目的は、[グラニュール](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)をフィルタリングし、カラムのすべての値を読み込む必要を回避することです。`EXPLAIN`句で、パラメータ`indexes=1`を使用してスキップされたグラニュールの数を特定できます。以下は、元のテーブル`otel_logs_v2`とnグラムブルームフィルターを持つテーブル`otel_logs_bloom`のそれぞれに対するレスポンスです。

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

10 rows in set. Elapsed: 0.016 sec.


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

ブルームフィルターは通常、カラムよりも小さい場合にのみ速度が向上します。もし大きい場合、性能向上はほとんどないでしょう。フィルターサイズとカラムサイズを比較するには、次のクエリを使用します：

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

1 row in set. Elapsed: 0.018 sec.


SELECT
	`table`,
	formatReadableSize(data_compressed_bytes) AS compressed_size,
	formatReadableSize(data_uncompressed_bytes) AS uncompressed_size
FROM system.data_skipping_indices
WHERE `table` = 'otel_logs_bloom'

┌─table───────────┬─compressed_size─┬─uncompressed_size─┐
│ otel_logs_bloom │ 12.03 MiB   	│ 12.17 MiB     	│
└─────────────────┴─────────────────┴───────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

上記の例では、セカンダリブルームフィルターインデックスは12MBで、カラム自体の圧縮サイズの56MBに対してほぼ5倍小さいことがわかります。

ブルームフィルターは大規模な調整が必要です。最適な設定を特定するためのノートは[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を参照してください。ブルームフィルターは挿入やマージ時にコストがかかる場合もあります。ユーザーは生産環境にブルームフィルターを追加する前に、その影響を評価するべきです。

セカンダリスキップインデックスの詳細は[こちら](/optimize/skipping-indexes#skip-index-functions)で確認できます。
### マップからの抽出 {#extracting-from-maps}

マップ型はOTelスキーマで一般的です。この型は、値とキーが同じ型である必要があります - Kubernetesラベルなどのメタデータには十分です。マップ型のサブキーをクエリする際には、親カラム全体が読み込まれることに注意してください。マップに多くのキーがある場合、これによりディスクから読み取るデータが増えるため、クエリペナルティが大きくなることがあります。

特定のキーを頻繁にクエリする場合は、そのキーをルートの専用カラムに移動することを検討してください。これは通常、一般的なアクセスパターンに応じて、展開後に行われる作業であり、製品化前に予測することが難しい場合があります。展開後にスキーマを変更する方法については["スキーマ変更の管理"](/observability/managing-data#managing-schema-changes)を参照してください。
## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouseが観測性のために使用される主な理由の一つは圧縮です。

ストレージコストを劇的に削減するだけでなく、ディスク上のデータが少ないことでI/Oが減り、クエリや挿入がより速くなります。I/Oの削減は、CPUに関する影響を考慮すると、どんな圧縮アルゴリズムのオーバーヘッドも上回るはずです。したがって、データの圧縮を改善することは、ClickHouseのクエリを高速に保つための主要な焦点となるべきです。

圧縮の測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)で確認できます。
