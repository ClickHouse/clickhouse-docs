---
title: スキーマ設計
description: 可観測性のためのスキーマ設計
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';

# 可観測性のためのスキーマ設計

ユーザーは、以下の理由から、ログおよびトレースのための独自のスキーマを常に作成することをお勧めします。

- **主キーの選択** - デフォルトスキーマは特定のアクセスパターンに最適化された `ORDER BY` を使用します。あなたのアクセスパターンがこれに一致する可能性は低いです。
- **構造の抽出** - ユーザーは、既存のカラムから新しいカラムを抽出したいと考えるかもしれません。例えば、`Body` カラムから新しいカラムを抽出することができます。これは、マテリアライズドカラム（より複雑な場合はマテリアライズドビュー）を使用して行うことができます。これにはスキーマの変更が必要です。
- **マップの最適化** - デフォルトスキーマでは、属性の保存のためにマップ型が使用されます。これらのカラムは任意のメタデータを保存することを可能にします。これは重要な機能ですが、イベントからのメタデータは事前に定義されていないことが多いため、ClickHouseのような強く型付けされたデータベースに保存できないため、マップのキーとその値へのアクセスは通常のカラムへのアクセスほど効率的ではありません。私たちはこれに対処するためにスキーマを変更し、最も一般的にアクセスされるマップキーを最上位のカラムにすることを確認します - 詳細は ["SQLを使用した構造の抽出"](#extracting-structure-with-sql) を参照してください。これにはスキーマの変更が必要です。
- **マップキーへのアクセスを簡素化** - マップ内のキーにアクセスするにはより冗長な構文が必要です。ユーザーはエイリアスを使用することでこれを軽減できます。クエリを簡素化するための ["Using Aliases"](#using-aliases) を参照してください。
- **二次インデックス** - デフォルトスキーマはマップへのアクセスを高速化し、テキストクエリを加速するために二次インデックスを使用します。通常、これは必要ではなく、追加のディスクスペースを消費します。使用することはできますが、それが本当に必要であることを確認するためにテストするべきです。["Secondary / Data Skipping indices"](#secondarydata-skipping-indices) を参照してください。
- **コーデックの使用** - ユーザーは、予想されるデータを理解している場合、カラムに対してコーデックをカスタマイズしたいと考えるかもしれません。

_上記の各ユースケースについては、以下に詳細に説明します。_

**重要:** ユーザーは、最適な圧縮とクエリパフォーマンスを達成するためにスキーマを拡張および変更することが奨励されますが、可能な限りコアカラムのためにOTelのスキーマ命名に従うべきです。ClickHouseのGrafanaプラグインは、クエリビルディングを助けるために、いくつかの基本的なOTelカラムの存在を前提としています。例として、TimestampおよびSeverityTextが挙げられます。ログおよびトレースのために必要なカラムは、ここで文書化されています [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [here](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure) を参照してください。これらのカラム名を変更することも可能で、プラグイン設定内でデフォルトを上書きできます。

## SQLを使用した構造の抽出 {#extracting-structure-with-sql}

構造化されたログまたは非構造化のログを取り込む際に、ユーザーはしばしば以下の機能が必要です：

- **文字列のブロブからカラムを抽出** - これをクエリすることは、クエリ時に文字列操作を使用するよりも速くなります。
- **マップからキーを抽出** - デフォルトスキーマでは、任意の属性がマップ型のカラムに配置されます。この型は、スキーマなしの機能を提供し、ユーザーがログおよびトレースを定義するときに属性のカラムを事前に定義する必要がないという利点があります - これは、Kubernetesからのログを収集し、後で検索のためにポッドラベルを保持したい場合には多くの場合不可能です。マップキーおよびその値へのアクセスは、通常のClickHouseカラムのクエリよりも遅くなります。したがって、マップからルートテーブルカラムへのキーを抽出することは、よく望まれます。

次のクエリを考えてみてください：

構造化されたログを使用して最も多くのPOSTリクエストを受け取るURLパスをカウントしたいとします。JSONブロブは `Body` カラム内に文字列として保存されています。さらに、ユーザーがコレクターにjson_parserを有効にした場合、`LogAttributes`カラムに `Map(String, String)` として保存されることもあります。

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

`LogAttributes`が使用可能であると仮定した場合、サイトの最も多くのPOSTリクエストを受けるURLパスをカウントするためのクエリは次のようになります：

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

ここでのマップ構文の使用（例：`LogAttributes['request_path']`）と、[クエリパラメーターをURLから削除するための `path` 関数](/sql-reference/functions/url-functions#path)に注意してください。

もし、ユーザーがコレクターでJSON解析を有効にしていない場合、`LogAttributes`は空になるため、文字列 `Body` からカラムを抽出するために [JSON関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note ClickHouseでの解析を優先
一般的に、ユーザーには構造化されたログのJSONパースをClickHouseで行うことをお勧めします。ClickHouseが最も速いJSONパーシング実装であると確信しています。ただし、ユーザーはログを他のソースに送信したい場合があり、このロジックがSQLに存在しないことをにご注意ください。
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

次に、非構造化ログについて同様のことを考えます：

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

非構造化ログに対する同様のクエリは、[`extractAllGroupsVertical` 関数](/sql-reference/functions/string-search-functions#extractallgroupsvertical)を介して正規表現を使用する必要があります。

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

非構造化ログの解析にかかる複雑さとコストの増加（パフォーマンスの違いに注意）が、ユーザーに常に構造化されたログの使用を推奨する理由です。

:::note 辞書を考慮
上記のクエリは、正規表現辞書を利用するように最適化することができます。詳細は [Using Dictionaries](#using-dictionaries) を参照してください。 
:::

これらのユースケースの両方は、ClickHouseを使用して、上記のクエリロジックを挿入時に移動することで満たすことができます。以下にいくつかのアプローチを探り、各アプローチがいつ適切かを強調します。

:::note OTelまたはClickHouseを使用した処理？
ユーザーは、[こちら](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)に説明されているOTelコレクターのプロセッサおよびオペレーターを使用して処理を行うこともできます。ほとんどの場合、ユーザーはClickHouseがコレクターのプロセッサよりもリソース効率が高く、速いことを発見するでしょう。SQLでイベント処理をすべて行う主な欠点は、あなたのソリューションがClickHouseに結びつくことです。例えば、ユーザーは処理されたログをOTelコレクターから別の宛先に送信することを望む場合があります。
:::

### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出するための最も簡単な解決策を提供します。そのようなカラムの値は、挿入時に常に計算され、INSERTクエリでは指定できません。

:::note オーバーヘッド
マテリアライズドカラムは、値が挿入時にディスク上の新しいカラムに抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムは、ClickHouseの任意の式をサポートし、[文字列処理](/sql-reference/functions/string-functions)のための任意の分析関数、[正規表現と検索](/sql-reference/functions/string-search-functions)および[URL](/sql-reference/functions/url-functions)のための分析関数を活用でき、[型変換](/sql-reference/functions/type-conversion-functions)を行い、[JSONからの値の抽出](/sql-reference/functions/json-functions)、または[数学的操作](/sql-reference/functions/math-functions)を実行できます。

基本処理にはマテリアライズドカラムを推奨します。これらは特に、マップからの値の抽出、ルートカラムへの昇格、および型変換に便利です。非常に基本的なスキーマで使用する場合や、マテリアライズドビューと連携して使用する場合に特に有用です。以下は、JSONがコレクターによって `LogAttributes` カラムに抽出されたログのためのスキーマです：

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

JSON関数を使用して抽出するための同等のスキーマは、[here](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==) にあります。

私たちの3つのマテリアライズドビューカラムは、リクエストページ、リクエストタイプ、およびリファラーのドメインを抽出します。これらはマップキーにアクセスし、それらの値に関数を適用します。私たちの後続のクエリは大幅に速くなります：

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
マテリアライズドカラムは、デフォルトでは `SELECT *` に含まれません。これは、`SELECT *` の結果が常にINSERTを使用してテーブルに戻すことができることを保持するためです。この動作は `asterisk_include_materialized_columns=1` を設定することで無効にでき、Grafana内で有効にすることができます（データソース設定の `Additional Settings -> Custom Settings` を参照）。
:::

## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views)は、ログやトレースに対するSQLフィルタリングと変換を適用するためのより強力な手段を提供します。

マテリアライズドビューを使用すると、ユーザーは計算のコストをクエリ時から挿入時に移すことができます。ClickHouseのマテリアライズドビューは、データがテーブルに挿入される際にブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、別の「ターゲット」テーブルに挿入されます。

<img src={observability_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

:::note リアルタイム更新
ClickHouseのマテリアライズドビューは、ベースとなるテーブルにデータが流れ込むとリアルタイムで更新され、継続的に更新されるインデックスのように機能します。それに対して、他のデータベースでは、マテリアライズドビューは通常、クエリの静的スナップショットであり、更新が必要です（ClickHouse Refreshable Materialized Viewsに似ています）。
:::

マテリアライズドビューに関連付けられたクエリは、理論的には任意のクエリである可能性があり、集約を含むこともできますが、[結合には制限があります](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)。ログやトレースに必要な変換とフィルタリングのワークロードに対して、ユーザーは任意の `SELECT` ステートメントが可能であると考えることができます。

ユーザーは、クエリがテーブル（ソーステーブル）に挿入される行に対して実行されるトリガーに過ぎないことを忘れないでください。結果は新しいテーブル（ターゲットテーブル）に送信されます。

データをソーステーブルとターゲットテーブルの両方に保存しないようにするために、ソーステーブルのテーブルエンジンを[Nullテーブルエンジン](/engines/table-engines/special/null)に変更し、元のスキーマを保持できます。私たちのOTelコレクターは、このテーブルにデータを送り続けます。たとえば、ログ用に、`otel_logs` テーブルは次のようになります：

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

Nullテーブルエンジンは強力な最適化です - `/dev/null` のように考えてください。このテーブルはデータを保存しませんが、接続されたマテリアライズドビューは、挿入された行の上に実行され、破棄されます。

次のクエリを考えます。これは、私たちが保持したい形式に行を変換し、`LogAttributes` からすべてのカラムを抽出します（これはコレクターによって `json_parser` オペレーターを使用して設定されたと仮定します）、`SeverityText` および `SeverityNumber` を設定します（これらのカラムの定義に基づく単純な条件に基づいて）[これらのカラム](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitytext) の条件に基づいています。この場合、私たちはまた、ポピュレートされることが分かっているカラムのみを選択し、`TraceId`、`SpanId`、`TraceFlags` のようなカラムを無視します。

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

上記では、私たちは `Body` カラムを抽出しました - 後で追加の属性が私たちのSQLによって抽出されない場合に備えています。このカラムはClickHouseでうまく圧縮され、めったにアクセスされないため、クエリパフォーマンスに影響を与えることはありません。最後に、TimestampをDateTimeに減らします（スペースを節約するために - 詳細は ["Optimizing Types"](#optimizing-types) を参照）。

:::note 条件
上記での[条件](/sql-reference/functions/conditional-functions)の使用に注意してください。これらは、複雑な条件を形成し、マップ内で値が設定されているかを確認するのに非常に便利です - 私たちはすべてのキーが `LogAttributes` に存在すると仮定します。ユーザーにはこれらに精通することをお勧めします - ログ解析の友達であり、[NULL値](/sql-reference/functions/functions-for-nulls)の処理に関する関数とともに役立ちます！
:::

結果を受け取るためのテーブルが必要です。以下のターゲットテーブルは、上記のクエリと一致します：

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

ここで選択されたタイプは、["Optimizing types"](#optimizing-types) で議論された最適化に基づいています。

:::note
私たちのスキーマが劇的に変化したことに注意してください。実際には、ユーザーは、保持したいトレースカラムや、`ResourceAttributes` カラム（ここにはKubernetesメタデータが含まれていることが通常です）も持っている可能性があります。Grafanaは、ログとトレース間のリンク機能を提供するためにトレースカラムを活用できます - 詳細は ["Using Grafana"](/observability/grafana) を参照してください。
:::

以下にマテリアライズドビュー `otel_logs_mv` を作成し、`otel_logs` テーブルに対して上記のセレクトを実行し、その結果を `otel_logs_v2` に送信します。

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

これを以下にビジュアル化します：

<img src={observability_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

今、『Exporting to ClickHouse』(/observability/integrating-opentelemetry#exporting-to-clickhouse)で使用されたコレクターの設定を再起動すると、データが `otel_logs_v2` に希望の形式で表示されます。型付きJSON抽出関数の使用に注意してください。

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

`Body` カラムからJSON関数を使用してカラムを抽出することに依存する同等のマテリアライズドビューは以下のとおりです：

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

上記のマテリアライズドビューは、特に `LogAttributes` マップを使用する際に、暗黙的な型変換に依存しています。ClickHouseはしばしば、抽出された値をターゲットテーブルの型に透明にキャストするため、必要な構文が減ります。ただし、ユーザーは常に、同じスキーマを持つターゲットテーブルを使用して、`SELECT` ステートメントを使用してビューをテストすることをお勧めします。これにより、型が正しく処理されていることを確認できます。特に注意が必要なケースは次のとおりです：

- マップ内にキーが存在しない場合、空の文字列が返されます。数値の場合、ユーザーはこれを適切な値にマッピングする必要があります。これは、[条件](/sql-reference/functions/conditional-functions)を使用して達成できます。例えば、`if(LogAttributes['status'] = ", 200, LogAttributes['status'])` または、デフォルト値が許可される場合は、[キャスト関数](/sql-reference/functions/type-conversion-functions#touint8163264256ordefault)を使用して達成できます。例えば、`toUInt8OrDefault(LogAttributes['status'] )`
- 一部の型は常にキャストされるわけではありません。数値の文字列表現は列挙値にキャストされることはありません。
- JSON抽出関数は、値が見つからない場合にその型のデフォルト値を返します。これらの値が妥当であることを確認してください！

:::note Nullableを避ける
ClickHouseで可観測性データにNULLABLEを使用しないことをお勧めします。ログやトレースでは、空とNULLを区別する必要はほとんどありません。この機能は追加のストレージオーバーヘッドを発生させ、クエリパフォーマンスに悪影響を与えるでしょう。詳細は [こちら](/data-modeling/schema-design#optimizing-types) を参照してください。
:::

## 主キー（順序キー）の選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出したら、順序/主キーを最適化し始めることができます。

順序キーを選択する際に適用できるいくつかのシンプルなルールがあります。以下は時には衝突することがあるので、これらを順番に考慮してください。このプロセスから多くのキーを識別することができ、通常は4〜5個で十分です。

1. 一般的なフィルターおよびアクセスパターンに合うカラムを選択します。ユーザーが通常、特定のカラム（例：ポッド名）で可観測性の調査を開始する場合、このカラムは `WHERE` 句で頻繁に使用されます。これらを優先的にキーに含め、あまり使用されていないものよりも優先しましょう。
2. フィルタリングされたときに全体の行数の大部分を除外するのに役立つカラムを優先する、したがって読み取る必要があるデータの量を減少させます。サービス名およびステータスコードはしばしば良い候補です - 後者の場合は特に、ユーザーがほとんどの行を除外する値でフィルターする場合（例：200のフィルターはほとんどの行に合致することが多い）、500のエラーは小さなサブセットに対応します。
3. テーブル内の他のカラムと高い相関がある可能性のあるカラムを選択します。これにより、これらの値も連続して格納され、圧縮が改善されます。
4. 順序キーのカラムに関しては、`GROUP BY` および `ORDER BY` 操作はよりメモリ効率良く行われます。

<br />

順序キーのサブセットを特定したら、それらは特定の順序で宣言される必要があります。この順序は、クエリ内の二次キーのフィルタリングの効率性とテーブルのデータファイルの圧縮率の両方に大きく影響します。一般に、**キーはカーディナリティの昇順に並べるのが最適です**。これに対して注意するべき事実は、順序キーに後に表示されるカラムでフィルタリングすることは、先に表示されるカラムでフィルタリングすることよりも効率的ではないということです。これらの振る舞いのバランスをとり、アクセスパターンを考慮する必要があります。最も重要なことは、バリアントをテストすることです。順序キーの理解を深め、それを最適化するために、[この記事](/guides/best-practices/sparse-primary-indexes)をお勧めします。

:::note 構造を最優先
ログを構造化した後に順序キーを決定することをお勧めします。順序キーやJSON抽出式のために属性マップ内のキーを使用しないでください。順序キーとしてルートカラムとして配置したことを確認してください。
:::

## マップの使用 {#using-maps}

前の例では、マップ構文 `map['key']` を使用して `Map(String, String)` カラム内の値にアクセスしています。また、ネストされたキーにアクセスするためのマップ表記に加えて、これらのカラムをフィルタリングまたは選択するための専門のClickHouse [マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys)も利用可能です。

例えば、次のクエリは、 [`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) を使用して `LogAttributes` カラム内で利用可能なすべてのユニークキーを特定し、その後 [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators)（コンビネータ）を使用します。

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
マップカラム名にドットを使用しないことをお勧めします。これらの使用は廃止される可能性があります。`_` を使用してください。
:::
## エイリアスの使用 {#using-aliases}

マップタイプをクエリすることは、通常のカラムをクエリするよりも遅くなります - 詳細は [「クエリの高速化」](#accelerating-queries) をご覧ください。さらに、文法的に複雑で、ユーザーが記述するのが面倒な場合があります。この後者の問題に対処するために、エイリアスカラムを使用することをおすすめします。

**ALIAS** カラムはクエリ時に計算され、テーブルには保存されません。したがって、このタイプのカラムに値をINSERTすることは不可能です。エイリアスを使用することで、マップキーを参照し、文法を簡素化し、マップエントリを通常のカラムとして透過的に露出させることができます。以下の例を考えてみましょう：

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

私たちにはいくつかのマテリアライズドカラムと、マップ `LogAttributes` を参照する `ALIAS` カラムである `RemoteAddr` があります。これにより、このカラムを介して `LogAttributes['remote_addr']` の値をクエリできるようになり、クエリが簡略化されます。すなわち、

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

さらに、`ALTER TABLE` コマンドを介して `ALIAS` を追加するのは簡単です。これらのカラムはすぐに利用可能となります。例えば、

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

:::note デフォルトで除外されるエイリアス
デフォルトでは、`SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::
## タイプの最適化 {#optimizing-types}

[一般的な Clickhouse のベストプラクティス](/data-modeling/schema-design#optimizing-types) は、タイプの最適化に適用され、ClickHouse のユースケースに関連しています。
## コーデックの使用 {#using-codecs}

タイプの最適化に加えて、ユーザーは [ClickHouse の可観測性スキーマの圧縮を最適化するための一般的なコーデックのベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に従うことができます。

一般的に、ユーザーは `ZSTD` コーデックがログおよびトレースデータセットに非常に適用可能であることがわかります。圧縮値をデフォルトの1から増加させると、圧縮が改善される可能性がありますが、これはテストすべきです。値が高くなると、INSERT 時に CPU オーバーヘッドが増加します。この値を増加させてもほとんどゲインが得られないことが一般的です。

さらに、タイムスタンプは圧縮に関してデルタエンコーディングのメリットを享受しますが、このカラムがプライマリ/オーダリングキーで使用されるとクエリパフォーマンスが遅くなることが示されています。ユーザーはそれぞれの圧縮とクエリパフォーマンスのトレードオフを評価することをお勧めします。
## 辞書の使用 {#using-dictionaries}

[辞書](/sql-reference/dictionaries) は、ClickHouse の [重要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) であり、さまざまな内部および外部の [ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのインメモリ [キー-バリュー](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低遅延のルックアップクエリに最適化されています。

<img src={observability_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

これは、取り込まれたデータをリアルタイムで強化し、取り込みプロセスを遅くすることなく、クエリのパフォーマンス全般を向上させる場合に便利であり、特に JOIN が恩恵を受けます。
可観測性のユースケースでは、結合が必要になることは稀ですが、辞書は強化目的で依然として便利です - 挿入時およびクエリ時の両方で。以下に両方の例を示します。

:::note 参加の高速化
辞書を使用して参加を加速したいユーザーは、[こちら](/dictionary) で詳細を確認できます。
:::
### 挿入時 vs クエリ時 {#insert-time-vs-query-time}

辞書は、クエリ時または挿入時にデータセットを強化するために使用できます。これらのアプローチには、それぞれの利点と欠点があります。要約すると：

- **挿入時** - これは、強化値が変わらず、辞書を満たすために使用可能な外部ソースに存在する場合に通常適切です。この場合、挿入時に行を強化することで、辞書へのクエリ時のルックアップを回避できます。ただし、挿入パフォーマンスと追加のストレージオーバーヘッドが発生するため、強化された値はカラムとして保存されます。
- **クエリ時** - 辞書内の値が頻繁に変更される場合、クエリ時のルックアップがより適用されることが一般的です。これは、マッピングされた値が変更された場合にカラムを更新（およびデータを書き換える）する必要を回避します。この柔軟性は、クエリ時のルックアップコストを伴います。多くの行に対してルックアップが必要な場合、たとえばフィルター句で辞書のルックアップを使用する場合、このクエリ時のコストは通常顕著です。結果強化、つまり `SELECT` での強化の場合、このオーバーヘッドは通常顕著ではありません。

ユーザーが辞書の基本を把握することをお勧めします。辞書は、値を取得するために専用の [専門関数](/sql-reference/functions/ext-dict-functions#dictgetall) を使用できるインメモリのルックアップテーブルを提供します。

単純な強化の例については、辞書に関するガイドを [こちら](/dictionary) で参照してください。以下では、一般的な可観測性の強化タスクに焦点を当てます。
### IP 辞書の使用 {#using-ip-dictionaries}

IP アドレスを使用してログおよびトレースを緯度と経度の値で地理的に強化することは、一般的な可観測性の要件です。これを `ip_trie` 構造辞書を使用して実現できます。

私たちは、[DB-IP.com](https://db-ip.com/) から提供されている [DB-IP 都市レベルデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を米国著作権法 [CC BY 4.0 ライセンス](https://creativecommons.org/licenses/by/4.0/) の条件の下で使用します。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データは次のように構造化されていることがわかります：

```csv
| ip_range_start | ip_range_end | country_code | state1 | state2 | city | postcode | latitude | longitude | timezone |
```

この構造を考慮して、[url()](/sql-reference/table-functions/url) テーブル関数を使用してデータを覗いてみましょう：

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

私たちの生活を簡単にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使用して、フィールド名を持つ ClickHouse のテーブルオブジェクトを作成し、合計行数を確認しましょう：

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

私たちの `ip_trie` 辞書は、CIDR 表記で IP アドレス範囲を表現する必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲の CIDR は、以下のクエリでコンパクトに計算できます：

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
上記のクエリには多くのことが起こっています。興味がある方は、この素晴らしい [説明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation) をお読みください。そうでなければ、上記は IP 範囲の CIDR を計算することを受け入れてください。
:::

私たちの目的のために、IP 範囲、国コード、および座標のみが必要ですので、新しいテーブルを作成し、Geo IP データを挿入しましょう：

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

低遅延の IP ルックアップを ClickHouse で実行するために、辞書を活用して Geo IP データのキー -> 属性マッピングをインメモリにストアします。ClickHouse は、ネットワークプレフィックス (CIDR ブロック) を座標と国コードにマッピングするために `ip_trie` [辞書構造](/sql-reference/dictionaries#ip_trie) を提供します。以下のクエリは、このレイアウトと上記のテーブルをソースとして使用して辞書を指定します。

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

辞書から行を選択し、このデータセットがルックアップに使用可能であることを確認できます：

```sql
SELECT * FROM ip_trie LIMIT 3

┌─cidr───────┬─latitude─┬─longitude─┬─country_code─┐
│ 1.0.0.0/22 │  26.0998 │   119.297 │ CN       	   │
│ 1.0.0.0/24 │ -27.4767 │   153.017 │ AU       	   │
│ 1.0.4.0/22 │ -38.0267 │   145.301 │ AU       	   │
└────────────┴──────────┴───────────┴──────────────┘

3 rows in set. Elapsed: 4.662 sec.
```

:::note 定期的な更新
ClickHouse の辞書は、基本テーブルデータおよび上記のライフタイム条項に基づいて定期的に更新されます。DB-IP データセットの最新の変更を反映するために Geo IP 辞書を更新するには、変換が適用された `geoip` テーブルにデータを再挿入するだけです。
:::

Geo IP データが `ip_trie` 辞書 (便利に `ip_trie` とも呼ばれます) に読み込まれたので、IP 地理位置特定に使用できます。これは、次のように [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して実現できます：

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ルックアップ速度に注目してください。これにより、ログを強化することができます。この場合、**クエリ時の強化を実行することを選択します**。

元のログデータセットに戻ると、上記の内容を使用して国別にログを集計することができます。以下では、`RemoteAddress` カラムが抽出された以前のマテリアライズドビューから得られたスキーマを使用します。

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

IP から地理的位置へのマッピングは変更される可能性があるため、ユーザーはリクエストが行われた時点で、同じアドレスの現在の地理的位置ではなく、どこからリクエストが来たのかを知りたいと考えるでしょう。これが理由で、インデックス時の強化が望ましいことが多いです。以下のように、マテリアライズドカラムを使用してこれを行ったり、マテリアライゼビューの SELECT で実行したりできます：

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
ユーザーは、新しいデータに基づいて IP 強化辞書を定期的に更新したいと考えるでしょう。これは、辞書の `LIFETIME` 条項を使用することで実現でき、この辞書が基本テーブルから定期的にリロードされるようにします。基本テーブルを更新する方法については、「[更新可能なマテリアライズドビュー」](/materialized-view/refreshable-materialized-view) を参照してください。
:::

上記の国および座標は、国別でのグルーピングやフィルタリングを超えた視覚化機能を提供します。インスピレーションについては、[「地理データの視覚化」](/observability/grafana#visualizing-geo-data) を参照してください。
### 正規表現辞書の使用 (ユーザーエージェントの解析) {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent) の解析は、古典的な正規表現の問題であり、ログおよびトレースベースのデータセットで一般的な要件です。ClickHouse は、正規表現ツリー辞書を使用してユーザーエージェントの効率的な解析を提供します。

正規表現ツリー辞書は、正規表現ツリーを含む YAML ファイルへのパスを提供する YAMLRegExpTree 辞書ソースタイプを使用して ClickHouse オープンソースで定義されています。独自の正規表現辞書を提供する場合は、必要な構造についての詳細が [こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) にあります。以下では、[uap-core](https://github.com/ua-parser/uap-core) を使用してユーザーエージェントの解析を行い、サポートされている CSV 形式の辞書を読み込みます。このアプローチは、OSS と ClickHouse Cloud の両方で互換性があります。

:::note
以下の例では、2024年6月のユーザーエージェント解析用の最新の uap-core 正規表現のスナップショットを使用します。更新されることがある最新のファイルは [こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml) で見つけることができます。ユーザーは [こちら](/sql-reference/dictionaries#collecting-attribute-values) の手順に従って、以下で使用する CSV ファイルにロードできます。
:::

以下のメモリテーブルを作成します。これらは、デバイス、ブラウザ、オペレーティングシステムの解析用の正規表現を保持します。

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

これらのテーブルは、以下の公開ホストの CSV ファイルから、url テーブル関数を使用してポピュレートできます：

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルがポピュレートされると、正規表現辞書をロードできます。これにより、キー値をカラムとして指定する必要があります。これらは、ユーザーエージェントから抽出可能な属性となります。

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

これらの辞書がロードされると、サンプルユーザーエージェントを提供し、新しい辞書抽出機能をテストできます：

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

ユーザーエージェントに関するルールは滅多に変更されないため、新しいブラウザ、オペレーティングシステム、デバイスに応じて辞書のみが更新されるべきです。このため、挿入時にこの抽出を実行することは理にかなっています。

この作業をマテリアライズドカラムを使用して行うか、マテリアライズドビューを使用して実行することができます。以下では、以前使用されたマテリアライズドビューを修正します：

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

これにより、ターゲットテーブル `otel_logs_v2` のスキーマを修正する必要があります：

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

コレクターを再起動し、構造化ログを取り込むと、以前の手順に基づいて、新しく抽出された Device、Browser、Os カラムをクエリできます。

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
ユーザーエージェントカラムでのタプルの使用に注意してください。タプルは、階層があらかじめ知られている複雑な構造に推奨されます。サブカラムは、通常のカラムと同様のパフォーマンスを提供し (マップキーとは異なります)、異種型を許可します。
:::
### さらなる読み物 {#further-reading}

辞書に関する詳細な例や情報については、以下の記事をお勧めします：

- [高度な辞書トピック](/dictionary#advanced-dictionary-topics)
- [「辞書を使用してクエリを加速する」](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)
## クエリの高速化 {#accelerating-queries}

ClickHouse には、クエリパフォーマンスを加速するためのいくつかの手法がサポートされています。これらは、適切なプライマリ/オーダリングキーを選択して最も人気のあるアクセスパターンを最適化し、圧縮を最大化した後に検討すべきです。これは通常、最も少ない労力でパフォーマンスに最も大きな影響を与えます。
### 集計のためのマテリアライズドビュー (インクリメンタル) の使用 {#using-materialized-views-incremental-for-aggregations}

これまでのセクションでは、データ変換やフィルタリングのためのマテリアライズドビューの使用について探りますが、マテリアライズドビューは挿入時に集計を事前計算し、その結果を保存するためにも使用できます。この結果は、後続の挿入の結果で更新されるため、効果的に集計を挿入時に事前計算することができます。

ここでの主なアイデアは、結果が元のデータのより小さな表現 (集計の場合の部分的スケッチ) であることが多いということです。ターゲットテーブルから結果を読み取るためのシンプルなクエリと組み合わせると、同じ計算が元のデータ上で行われるのと比べてクエリ時間が速くなります。

次のクエリを考えてみましょう。ここでは構造化ログを使用して、時間ごとのトラフィックの合計を計算します：

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

これは、ユーザーが Grafana で描くおそらく一般的な折れ線グラフになると思われます。このクエリは非常に速いですが、データセットはわずか 10m 行で、ClickHouse は高速です！しかし、これが数十億、数兆行に拡大すると、理想的にはこのクエリパフォーマンスを維持したいと思います。

:::note
このクエリは、`otel_logs_v2` テーブルを使用した場合、10倍速くなります。これは、`LogAttributes` マップのサイズキーを抽出する結果として得られます。ここでは説明の目的のために生データを使用していますが、このクエリが一般的なものであれば、以前のビューを使用することをお勧めします。
:::

マテリアライズドビューを使用してこれを挿入時に計算するには、結果を受け取るためのテーブルが必要です。このテーブルは、1 時間あたり 1 行のみを保持する必要があります。既存の時間に対してアップデートが受信された場合、他のカラムは既存の時間の行にマージされるべきです。この増分状態のマージを行うには、他のカラムのために部分状態を保存する必要があります。

これには、ClickHouse の特殊なエンジンタイプが必要です：SummingMergeTree。これは、同じオーダリングキーを持つすべての行を、数値カラムの合計値を含む 1 行に置き換えます。以下のテーブルは、同じ日付の行をマージし、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

マテリアライズドビューをデモンストレーションするために、`bytes_per_hour` テーブルが空でデータを受信していないと仮定します。このマテリアライズドビューは、挿入された `otel_logs` のデータに対して上記の `SELECT` を実行し、その結果を `bytes_per_hour` に送信します。構文は以下の通りです：

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの **TO** 句は重要であり、結果がどこに送られるか、すなわち `bytes_per_hour` を示します。

OTel Collector を再起動し、ログを再送信すると、`bytes_per_hour` テーブルは上述のクエリ結果でインクリメンタルにポピュレートされます。完了後、`bytes_per_hour` のサイズを確認すると、1 時間あたり 1 行があるはずです：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│ 	113 │
└─────────┘

1 row in set. Elapsed: 0.039 sec.
```

ここで、私たちは 10m 行 ( `otel_logs` の中にある) から 113 行に実際に行数を減らしています。ここでの重要な点は、`otel_logs` テーブルに新しいログが挿入されると、それぞれの時間のための新しい値が `bytes_per_hour` に送信され、バックグラウンドで非同期に自動的にマージされることです - 1 時間あたり 1 行しか保持しないことで、`bytes_per_hour` は常に小さく、最新のままになります。

行のマージは非同期であるため、ユーザーがクエリを実行すると、1 時間あたり複数の行が存在する可能性があります。未処理の行をクエリ時にマージするために、2 つのオプションがあります：

- テーブル名に [`FINAL 修飾子`](/sql-reference/statements/select/from#final-modifier) を使用する (上記のカウントクエリで行ったように)。
- 最終テーブルで使用されたオーダリングキー、すなわち Timestamp で集約する。

通常、2 番目のオプションはより効率的で柔軟です (テーブルは他の目的にも使用できます) が、最初のオプションは一部のクエリにはより簡単かもしれません。以下では、両方を示します：

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

これにより、私たちのクエリは 0.6 秒から 0.008 秒にスピードアップされ、75 倍以上の向上がありました！

:::note
これらの節約は、より大きなデータセットやより複雑なクエリでさらに大きくなります。他の例については [こちら](https://github.com/ClickHouse/clickpy) を参照してください。
:::
#### より複雑な例 {#a-more-complex-example}

上記の例は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)を使用して、1時間ごとの単純なカウントを集約しています。単純な合計を超えた統計を必要とする場合、別のターゲットテーブルエンジンが必要です: [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

ユニークなIPアドレス（またはユニークユーザー）の数を1日ごとに計算したいとしましょう。このクエリは次のとおりです：

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

113 行がセットにあります。経過時間: 0.667 秒。処理した行数: 10.37 百万行、4.73 GB (15.53 百万行/秒、7.09 GB/秒)
```

インクリメンタル更新のためにカーディナリティカウントを保持するには、AggregatingMergeTreeが必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouseが集約状態が保存されることを認識できるように、`UniqueUsers` カラムを [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 型として定義し、部分状態の関数ソース（uniq）とソースカラムのタイプ（IPv4）を指定します。SummingMergeTree と同様に、同じ `ORDER BY` キー値を持つ行はマージされます（上記の例では Hour）。

関連するマテリアライズドビューは、以前のクエリを使用します：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
	uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数の末尾に `State` サフィックスが追加されることに注意してください。これにより、関数の集約状態が最終結果ではなく返されることが保証されます。これには、この部分状態が他の状態とマージされるのを可能にするための追加情報が含まれます。

データが再ロードされた後、Collectorの再起動を経て、`unique_visitors_per_hour` テーブルに113行が利用可能であることを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│ 	113   │
└─────────┘

1 行がセットにあります。経過時間: 0.009 秒。
```

最終的なクエリは、関数に対して Merge サフィックスを利用する必要があります（カラムは部分的な集約状態を保存しているため）：

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

ここでは `FINAL` を使うのではなく `GROUP BY` を使用することに注意してください。

### マテリアライズドビューを使用した高速検索（インクリメンタル） {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルターおよび集約句で頻繁に使用されるカラムを持つ ClickHouse の ordering key を選択する際に、自分のアクセスパターンを考慮する必要があります。これは、ユーザーが多様なアクセスパターンを持ち、それを単一のカラムセットにカプセル化できない観測性のユースケースでは制約となる可能性があります。これは、デフォルト OTel スキーマに組み込まれた例で最もよく示されます。トレースのデフォルトスキーマを考えてみましょう：

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

このスキーマは、`ServiceName`、`SpanName`、および `Timestamp` でフィルタリングするために最適化されています。トレーシングでは、特定の `TraceId` で検索を行い、関連するトレースのスパンを取得する機能も必要です。この機能はオーダリングキーに存在しますが、その位置が最後にあるため、[フィルタリングが効率的ではなくなる可能性があります](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)および、単一のトレースを取得する際にスキャンされる必要のあるデータ量が多くなることを意味します。

OTel コレクターも、この課題に対処するためのマテリアライズドビューと関連テーブルをインストールします。テーブルとビューは以下のようになります：

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

このビューは、テーブル `otel_traces_trace_id_ts` がトレースの最小および最大タイムスタンプを持っていることを効果的に保証します。このテーブルは `TraceId` によって順序付けられているため、これらのタイムスタンプを効率的に取得できます。これらのタイムスタンプ範囲は、メインの `otel_traces` テーブルをクエリする際に使用されます。より具体的には、GrafanaがトレースをIDで取得する際には、次のクエリを使用します：

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

ここでのCTEは、トレースID `ae9226c78d1d360601e6383928e4d22d` の最小および最大タイムスタンプを特定し、その後それを使用して関連するスパンに対してメインの `otel_traces` をフィルタリングします。

このアプローチは、同様のアクセスパターンに対しても適用できます。 [こちら](/materialized-view/incremental-materialized-view#lookup-table)で類似の例を探ります。

### プロジェクションを使用する {#using-projections}

ClickHouseのプロジェクションを使用すると、テーブルに対して複数の `ORDER BY` 句を指定することができます。

前のセクションでは、マテリアライズドビューがClickHouseで集約を事前計算し、行を変換し、異なるアクセスパターンに対する観測性のクエリを最適化するためにどのように使用できるかを探りました。

マテリアライズドビューは、トレースIDによる検索を最適化するために、元のテーブルとは異なるオーダリングキーを持つターゲットテーブルに行を送信する例を提供しました。

プロジェクションは、プライマリキーの一部でないカラムに対するクエリを最適化するために同じ問題に対応するために使用できます。

理論的には、この機能はテーブルに複数のオーダリングキーを提供するために使用できますが、1つの顕著な欠点があります：データの重複です。具体的には、各プロジェクションのために指定された順序に加えて、メインプライマリキーの順序でデータを書き込む必要があります。これにより、インサートが遅くなり、より多くのディスクスペースが消費されます。

:::note プロジェクションとマテリアライズドビュー
プロジェクションはマテリアライズドビューと同様の多くの機能を提供しますが、後者が好まれることが多いため、控えめに使用するべきです。ユーザーは欠点を理解し、それが適切な時期に使用する必要があります。たとえば、プロジェクションは集計の事前計算に使用できますが、ユーザーにはこれにマテリアライズドビューを使用することをお勧めします。
:::

<img src={observability_13}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

次のクエリでは、`otel_logs_v2` テーブルを500エラーコードでフィルター処理します。これは、ユーザーがエラーコードでフィルタリングしたい一定のアクセスパターンになる可能性があります：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 行がセットにあります。経過時間: 0.177 秒。処理した行数: 10.37 百万行、685.32 MB (58.66百万行/秒、3.88 GB/秒)
ピークメモリ使用量: 56.54 MiB。
```

:::note パフォーマンスを測定するために Null を使用
ここでは `FORMAT Null` を使用して結果を印刷しません。これにより、すべての結果が読み込まれますが返されず、LIMIT によるクエリの早期終了を防ぎます。これは、すべての10m行をスキャンするのに必要な時間を示すためだけのものです。
:::

上記のクエリは、選択したオーダリングキー `(ServiceName, Timestamp)` に対して線形スキャンを必要とします。上記のクエリのパフォーマンスを向上させるために `Status` をオーダリングキーの末尾に追加することもできますが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

プロジェクションを最初に作成し、その後マテリアライズする必要があることに注意してください。この後者のコマンドは、データを異なる順序で2回ディスクに保存させます。プロジェクションはデータ作成時に定義することも可能で、データが挿入される際には自動的に維持されます。

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

重要なのは、プロジェクションが `ALTER` を介して作成された場合、その作成は `MATERIALIZE PROJECTION` コマンドが発行されたときに非同期で進行することです。ユーザーは、次のクエリを使用してこの操作の進捗を確認でき、`is_done=1` を待ちます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│       	0 │   	1   │                	 │
└─────────────┴─────────┴────────────────────┘

1 行がセットにあります。経過時間: 0.008 秒。
```

上記のクエリを繰り返すと、追加ストレージの代償としてパフォーマンスが大幅に改善されたことを確認できます（ディスクサイズと圧縮の測定については ["メジャリングテーブルサイズと圧縮"](#measuring-table-size--compression) を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 行がセットにあります。経過時間: 0.031 秒。処理した行数: 51.42 千行、22.85 MB (1.65百万行/秒、734.63 MB/秒)
ピークメモリ使用量: 27.85 MiB。
```

上記の例では、プロジェクション内で前のクエリで使用したカラムを指定しています。これにより、指定されたこれらのカラムのみがディスクに投影の一部として Status により順序付けられて保存されます。代わりに `SELECT *` をここで使用した場合、すべてのカラムが保存されます。これにより（カラムの任意のサブセットを使用して）より多くのクエリがプロジェクションを利用できるようになりますが、追加のストレージがかかります。ディスクスペースと圧縮の測定の詳細は、["メジャリングテーブルサイズと圧縮"](#measuring-table-size--compression) を参照してください。

### セカンダリ/データスキップインデックス {#secondarydata-skipping-indices}

ClickHouseでプライマリキーがどれだけ適切に調整されていても、一部のクエリではテーブル全体のスキャンが避けられません。これを軽減するためにマテリアライズドビュー（およびクエリによってはプロジェクション）を使用することはできますが、これには追加のメンテナンスが必要であり、ユーザーはそれらの可用性を認識している必要があります。従来のリレーショナルデータベースは、セカンダリインデックスを使用してこの問題を解決しますが、列指向データベースであるClickHouseでは効果が薄いです。代わりに、ClickHouseは「スキップ」インデックスを使用しており、これによりデータベースが一致しない値のない大きなデータチャンクをスキップできるため、クエリパフォーマンスを大幅に向上させることができます。

デフォルトのOTelスキーマは、マップアクセスを加速しようとする試みとしてセカンダリインデックスを使用しています。これらは一般的には効果が薄いと考えられ、カスタムスキーマにコピーすることを推奨しませんが、スキップインデックスは依然として有用です。

ユーザーは、これらを適用する前に [セカンダリインデックスのガイド](/optimize/skipping-indexes) を読んで理解するべきです。

**一般的に、プライマリキーとターゲットの非プライマリカラム/式の間に強い相関関係がある場合に効果的であり、珍しい値を検索するユーザーに適しています。数が少ない粒子などである必要があります。**

### テキスト検索のためのブルームフィルター {#bloom-filters-for-text-search}

観測性のクエリでは、ユーザーがテキスト検索を行う必要がある場合、セカンダリインデックスが役立つことがあります。具体的には、ngram およびトークンベースのブルームフィルターインデックス [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) および [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) を使用して、`LIKE`、`IN`、および `hasToken` 演算子を使った文字列カラムの検索を加速することができます。重要な点として、トークンベースのインデックスは、非アルファベット文字を区切り文字として使用してトークンを生成します。これにより、トークン（または単語全体）のみがクエリ時に一致することができます。より詳細な一致のために、[N-gram ブルームフィルター](/optimize/skipping-indexes#bloom-filter-types)を使用できます。これは、文字列を指定サイズのngramに分割し、部分単語の一致を許可します。

生成されるトークンを評価するためには、`tokens` 関数を使用できます：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 行がセットにあります。経過時間: 0.008 秒。
```

`ngram`関数は、ngramサイズを2番目のパラメーターとして指定できる同様の機能を提供します：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 行がセットにあります。経過時間: 0.008 秒。
```

:::note 逆引きインデックス
ClickHouse は、セカンダリインデックスとして逆引きインデックスの実験的サポートも行っていますが、これをログデータセットに現在推奨しておらず、製品準備が整っている時にトークンベースのブルームフィルターを置き換えると期待しています。
:::

この例の目的のために、構造化ログデータセットを使用します。`Referer` カラムに `ultra` が含まれるログをカウントしたいとしましょう。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 行がセットにあります。経過時間: 0.177 秒。処理した行数: 10.37 百万行、908.49 MB (58.57百万行/秒、5.13 GB/秒)。
```

ここでは、ngramサイズが3で一致する必要があります。そのため、`ngrambf_v1` インデックスを作成します。

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

インデックス `ngrambf_v1(3, 10000, 3, 7)` には4つのパラメーターがあります。最後の値（7）はシードを表し、他はngramサイズ（3）、値 `m`（フィルターサイズ）、およびハッシュ関数の数 `k`（7）を表します。`k` と `m` は調整が必要で、これはユニークなngram/トークンの数と、フィルターが真の負である可能性を基にします。これは、粒子内に値が存在しないことを確認するものです。これらの値を確立するための [これらの関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter) を推奨します。

正しく調整されれば、ここでのスピードアップは顕著です。

```sql
SELECT count()
FROM otel_logs_bloom
WHERE Referer LIKE '%ultra%'
┌─count()─┐
│ 	182   │
└─────────┘

1 行がセットにあります。経過時間: 0.077 秒。処理した行数: 4.22 百万行、375.29 MB (54.81百万行/秒、4.87 GB/秒)。
ピークメモリ使用量: 129.60 KiB。
```

:::note 例に過ぎない
上記は説明の目的だけです。ユーザーには、トークンベースのブルームフィルターを使用してテキスト検索を最適化するのではなく、挿入時にログから構造を抽出することを推奨します。ただし、スタックトレースや他の大きな文字列など構造があまり決定的でないため、テキスト検索が有用な場合があります。
:::

ブルームフィルターを使用する際の一般的なガイドライン：

ブルームの目的は、[粒子](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)をフィルタリングし、カラムのすべての値を読み込んで線形スキャンを実行する必要を避けることです。`EXPLAIN` 句を使用し、パラメーター `indexes=1` を設定すると、スキップされた粒子の数を特定できます。次の応答は、元のテーブル `otel_logs_v2` とn-gramブルームフィルターを持つテーブル `otel_logs_bloom` についてです。

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

ブルームフィルターは、通常、列自体よりも小さい場合のみ高速化されます。それが大きい場合は、パフォーマンスの向上はほとんどないでしょう。フィルターとカラムのサイズを比較するには、次のクエリを使用します。

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

上記の例では、セカンダリブルームフィルターインデックスが12MBであり、カラム自体の圧縮サイズ56MBの約5倍小さいことがわかります。

ブルームフィルターは、かなりの調整を必要とすることがあります。最適な設定を特定する際に役立つ [こちらのノート](/engines/table-engines/mergetree-family/mergetree#bloom-filter) を参照することをお勧めします。ブルームフィルターは、挿入時およびマージ時に高コストになる場合もあります。ユーザーは、プロダクションにブルームフィルターを追加する前に、挿入パフォーマンスへの影響を評価する必要があります。

セカンダリスキップインデックスに関する詳細は [こちら](/optimize/skipping-indexes#skip-index-functions) で確認できます。

### マップからの抽出 {#extracting-from-maps}

マップ型はOTelスキーマで広く使用されています。この型では、値とキーが同じ型である必要があります - Kubernetes のラベルなどのメタデータには十分です。マップ型のサブキーをクエリすると、親カラム全体がロードされることに注意してください。マップに多くのキーが含まれている場合、キーがカラムとして存在する場合よりも多くのデータをディスクから読み込む必要があり、クエリのペナルティが大きくなる可能性があります。

特定のキーを頻繁にクエリする場合は、それをルートに専用のカラムに移動することを検討してください。これは、一般的なアクセスパターンに応じて行われるタスクであり、デプロイ後に発生することが一般的ですが、プロダクション前に予測することは難しいかもしれません。スキーマ変更の管理については、["スキーマ変更の管理"](/observability/managing-data#managing-schema-changes) を参照してください。

## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouseが観測に使用される主な理由の一つは圧縮です。

ストレージコストを大幅に削減するだけでなく、ディスク上のデータが少なくなることで、I/Oが減り、クエリと挿入が高速化されます。I/Oの削減は、CPUに関するあらゆる圧縮アルゴリズムのオーバーヘッドを上回るでしょう。したがって、データの圧縮を改善することが、ClickHouse のクエリを高速に保つために最初に注力すべき事項です。

圧縮の測定に関する詳細は、[こちら](/data-compression/compression-in-clickhouse) で確認できます。
