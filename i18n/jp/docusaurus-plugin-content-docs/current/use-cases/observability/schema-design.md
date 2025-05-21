---
title: 'スキーマ設計'
description: '可観測性のためのスキーマ設計'
keywords: ['可観測性', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
slug: /use-cases/observability/schema-design
---

import observability_10 from '@site/static/images/use-cases/observability/observability-10.png';
import observability_11 from '@site/static/images/use-cases/observability/observability-11.png';
import observability_12 from '@site/static/images/use-cases/observability/observability-12.png';
import observability_13 from '@site/static/images/use-cases/observability/observability-13.png';
import Image from '@theme/IdealImage';

# 可観測性のためのスキーマ設計

ユーザーには、以下の理由からログとトレースのために独自のスキーマを常に作成することを推奨します。

- **主キーの選択** - デフォルトのスキーマは特定のアクセスパターンに最適化された `ORDER BY` を使用します。そのため、あなたのアクセスパターンがこれに一致する可能性は低いです。
- **構造の抽出** - ユーザーは既存のカラムから新しいカラムを抽出したい場合があります。例えば `Body` カラムから。この作業は、マテリアライズドカラム（より複雑な場合はマテリアライズドビュー）を使用して行うことができます。これにはスキーマの変更が必要です。
- **マップの最適化** - デフォルトのスキーマは属性の保存のために Map タイプを使用します。これらのカラムは任意のメタデータを保存できるようにしますが、メタデータは事前に定義されていないことが多く、このため厳密に型付けされたデータベース（ClickHouseなど）に保存できません。マップのキーとその値へのアクセスは、通常のカラムへのアクセスと比べて効率的ではありません。この問題に対処するために、スキーマを修正して、最も頻繁にアクセスされるマップのキーがトップレベルのカラムになるようにします - 詳細は ["SQL での構造の抽出"](#extracting-structure-with-sql) を参照してください。これにはスキーマの変更が必要です。
- **マップキーアクセスの簡素化** - マップのキーにアクセスするには、より冗長な構文が必要です。ユーザーはエイリアスを使用してこれを軽減できます。クエリを簡素化するために、 ["エイリアスの使用"](#using-aliases) を参照してください。
- **セカンダリインデックス** - デフォルトのスキーマは、マップへのアクセスを高速化し、テキストクエリを加速させるためにセカンダリインデックスを使用します。これらは通常必要ではなく、追加のディスクスペースを消費します。使用することもできますが、必要かどうかを確認するためにテストするべきです。詳細は ["セカンダリ / データスキッピングインデックス"](#secondarydata-skipping-indices)を参照してください。
- **コーデックの使用** - ユーザーは、予測されるデータを理解し、その圧縮が改善される証拠がある場合、カラムのコーデックをカスタマイズしたい場合があります。

_上記の各ユースケースを以下に詳細に説明します。_

**重要:** ユーザーは、最適な圧縮とクエリパフォーマンスを実現するためにスキーマを拡張および変更することが奨励されていますが、可能な限りコアカラムの OTel スキーマ命名に従うべきです。ClickHouse Grafana プラグインは、クエリビルディングを支援するために、いくつかの基本的な OTel カラムが存在することを前提としています。例えば、Timestamp や SeverityText です。ログとトレースに必要なカラムは、ここに文書化されています [[1]](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)[[2]](https://grafana.com/docs/grafana/latest/explore/logs-integration/) および [こちら](https://grafana.com/docs/grafana/latest/explore/trace-integration/#data-frame-structure)、それぞれのリンクを参照してください。これらのカラム名を変更し、プラグイン設定でデフォルトをオーバーライドすることも可能です。

## SQL での構造の抽出 {#extracting-structure-with-sql}

構造化されたログまたは非構造化されたログを取り込む場合、ユーザーは次の機能が必要になることがよくあります。

- **文字列ブロブからのカラムの抽出**。これをクエリすることで、クエリ時の文字列操作よりも高速に処理できます。
- **マップからのキーの抽出**。デフォルトのスキーマは、任意の属性を Map タイプのカラムに配置します。このタイプはスキーマレスの能力を提供し、ユーザーがログとトレースを定義する際に属性のカラムを事前に定義する必要がなくなります。これは、Kubernetes からログを収集し、ポッドラベルを後で検索できるように保持したい場合によく不可能です。マップのキーとその値へのアクセスは、通常の ClickHouse カラムでのクエリよりも遅れます。したがって、マップからルートテーブルカラムにキーを抽出することがしばしば望ましいです。

次のクエリを考慮してください。

特定の URL パスで最も多くの POST リクエストを受け取るものをカウントしたいとします。JSON ブロブは、`Body` カラムに文字列として保存されています。さらに、ユーザーがコレクタで json_parser を有効にしている場合、`LogAttributes` カラムに `Map(String, String)` としても保存できます。

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

`LogAttributes` が利用可能であると仮定すると、サイトのどの URL パスが最も多くの POST リクエストを受け取ったかをカウントするクエリは次のようになります。

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

ここでのマップ構文の使用に注意してください。例えば `LogAttributes['request_path']` や、URL からクエリパラメータを取り除くための [`path` 関数](/sql-reference/functions/url-functions#path) です。

ユーザーがコレクタでJSON パースを有効にしていない場合、`LogAttributes` は空になり、文字列 `Body` からカラムを抽出するために [JSON 関数](/sql-reference/functions/json-functions) を使用する必要があります。

:::note ClickHouse でのパースを推奨
構造化ログの JSON パースは通常 ClickHouse で実行することを推奨します。ClickHouse が最も高速な JSON パース実装であると確信しています。ただし、ユーザーはログを他のソースに送信し、このロジックが SQL に存在しないことを望む場合があることを認識しています。
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

次に、非構造化されたログについて考えてみましょう。

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

非構造化ログに対する同様のクエリでは、正規表現を使用して [`extractAllGroupsVertical` 関数](/sql-reference/functions/string-search-functions#extractallgroupsvertical) を呼び出す必要があります。

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

非構造化ログの解析におけるクエリの複雑さとコストの増加（パフォーマンスの違いに注意）から、可能な限り構造化されたログを使用することを推奨します。

:::note 辞書を考慮してください
上記のクエリは、正規表現辞書を利用して最適化することができます。詳細は [辞書の使用](#using-dictionaries) を参照してください。
:::

上記の二つのユースケースは、挿入時に上記のクエリロジックを移動させることによって ClickHouse で満たすことができます。以下に複数のアプローチを探りますが、それぞれの適切な状況を強調します。

:::note OTel か ClickHouse どちらで処理?
ユーザーはまた、[ここ](/observability/integrating-opentelemetry#processing---filtering-transforming-and-enriching)で説明されている OTel Collector のプロセッサおよびオペレーターを使用して処理を行うこともできます。ほとんどの場合、ユーザーは ClickHouse がコレクタのプロセッサよりも著しくリソース効率的で早いことが分かります。すべてのイベント処理を SQL で実行することの主な欠点は、あなたのソリューションが ClickHouse に結びつくことです。例えば、ユーザーは処理されたログを OTel コレクタから別の宛先（例えば S3）に送信したいと考えることがあります。
:::

### マテリアライズドカラム {#materialized-columns}

マテリアライズドカラムは、他のカラムから構造を抽出するための最も簡単な解決策を提供します。このようなカラムの値は、常に挿入時に計算され、INSERT クエリで指定することはできません。

:::note オーバーヘッド
マテリアライズドカラムは、値が挿入時にディスクの新しいカラムに抽出されるため、追加のストレージオーバーヘッドが発生します。
:::

マテリアライズドカラムは、任意の ClickHouse 表現をサポートし、[文字列の処理](/sql-reference/functions/string-functions)（[正規表現と検索](/sql-reference/functions/string-search-functions)を含む）、[URL](/sql-reference/functions/url-functions)、[型変換](/sql-reference/functions/type-conversion-functions)、[JSONから値を抽出](/sql-reference/functions/json-functions)、または[数学的演算](/sql-reference/functions/math-functions)のための任意の分析関数を利用することができます。

基本的な処理にはマテリアライズドカラムを推奨します。これらは、マップから値を抽出してルートカラムに昇格させたり、型変換を行ったりするのに特に役立ちます。非常に基本的なスキーマで使用するか、マテリアライズドビューと併用する際に最も有用です。コレクタによって `LogAttributes` カラムに JSON が抽出されたログに対する以下のスキーマを考慮してください。

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

JSONから抽出するための同等のスキーマは [こちら](https://pastila.nl/?005cbb97/513b174a7d6114bf17ecc657428cf829#gqoOOiomEjIiG6zlWhE+Sg==) で確認できます。

私たちの3つのマテリアライズドビューのカラムは、リクエストページ、リクエストタイプ、リファラーのドメインを抽出しています。これらはマップのキーにアクセスし、それらの値に関数を適用します。我々の後続のクエリはかなり速くなります。

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
デフォルトでは、マテリアライズドカラムは `SELECT *` に含まれません。この動作により、`SELECT *` の結果が常に INSERT を使用してテーブルに挿入できるように保たれます。この動作は、 `asterisk_include_materialized_columns=1` を設定することで無効にでき、Grafana で有効にすることができます（データソース設定で `追加設定 -> カスタム設定` を参照）。
:::
## マテリアライズドビュー {#materialized-views}

[マテリアライズドビュー](/materialized-views)は、ログやトレースに対して SQL フィルタリングや変換を適用するためのより強力な手段を提供します。

マテリアライズドビューを使用することで、ユーザーはクエリ時間から挿入時間に計算コストを移すことができます。ClickHouse のマテリアライズドビューは、テーブルにデータが挿入される際にデータブロックに対してクエリを実行するトリガーに過ぎません。このクエリの結果は、別の「ターゲット」テーブルに挿入されます。

<Image img={observability_10} alt="マテリアライズドビュー" size="md"/>

:::note リアルタイム更新
ClickHouse のマテリアライズドビューは、基づくテーブルにデータが流入するとリアルタイムで更新され、継続的に更新されるインデックスのように機能します。これに対して、他のデータベースでは、マテリアライズドビューは通常、クエリの静的スナップショットであり、リフレッシュする必要があります（ClickHouse のリフレッシュ可能なマテリアライズドビューと同様）。
:::

マテリアライズドビューに関連付けられたクエリは理論的には任意のクエリが可能であり、集計も含められますが、[結合に制限がある](https://clickhouse.com/blog/using-materialized-views-in-clickhouse#materialized-views-and-joins)ことに注意してください。ログとトレースに必要な変換やフィルタリング操作に対して、ユーザーは任意の `SELECT` 文が可能と見なすことができます。

ユーザーは、このクエリが、行を挿入するテーブル（ソーステーブル）内の行に対して実行され、その結果が新しいテーブル（ターゲットテーブル）に送信されるトリガーに過ぎないことを覚えておくべきです。

データが二重に（ソーステーブルとターゲットテーブルの両方に）永続化されないようにするために、ソーステーブルのテーブルを [Null テーブルエンジン](/engines/table-engines/special/null) に変更し、元のスキーマを保つことができます。我々の OTel コレクタは、このテーブルにデータを送信し続けます。例えば、ログの場合、`otel_logs` テーブルは次のようになります。

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

Null テーブルエンジンは強力な最適化です。`/dev/null` と考えてください。このテーブルはデータを保存しませんが、付随するマテリアライズドビューは行に対して実行され、挿入される前にデータは破棄されます。

次のクエリを考慮してください。これは、我々が保存したい形式に変換し、`LogAttributes` からすべてのカラムを抽出します（我々はコレクタが `json_parser` オペレーターを使用してこれを設定したと仮定します）。ここでは、`SeverityText` と `SeverityNumber` を（これらのカラムの簡単な条件と定義に基づいて）設定します。この場合、我々は populated されることがわかっているカラムだけを選択します - `TraceId`, `SpanId` および `TraceFlags` などのカラムを無視します。

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

上記で `Body` カラムも抽出しています - 今後追加の属性が追加された場合に備えて、我々の SQL によって抽出されませんでした。このカラムは ClickHouse でうまく圧縮され、あまりアクセスされないため、クエリパフォーマンスには影響を与えません。最後に、Timestamp を DateTime に（スペースを節約するために - 詳細は ["型の最適化"](#optimizing-types) を参照）キャストします。

:::note 条件
上記の `SeverityText` と `SeverityNumber` の抽出に [条件式](/sql-reference/functions/conditional-functions) を使用していることに注意してください。これらは、複雑な条件を形成し、マップ内の値が設定されているかどうかをチェックするために非常に便利です。すべてのキーが `LogAttributes` に存在すると単純に仮定しています。これらに精通することをお勧めします - ログパースにおけるあなたの友達であり、[NULL 値](/sql-reference/functions/functions-for-nulls)を処理するための関数を補完します！
:::

これらの結果を受け取るためにはテーブルが必要です。以下のターゲットテーブルは、上記のクエリに一致します。

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

ここで選択された型は、 ["型の最適化"](#optimizing-types) で議論された最適化に基づいています。

:::note
スキーマが大きく変更されていることに注意してください。実際には、ユーザーが保持したい Trace カラムや `ResourceAttributes` カラムも必要になります（通常は Kubernetes メタデータが含まれます）。Grafana はトレースカラムを利用してログとトレース間のリンク機能を提供できます - 詳細は ["Grafanaの使用"](/observability/grafana) を参照してください。
:::

以下に、 `otel_logs` テーブルの上記の選択を実行し、結果を `otel_logs_v2` に送信するマテリアライズドビュー `otel_logs_mv` を作成します。

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

次にビジュアル化された構成は以下の通りです。

<Image img={observability_11} alt="Otel MV" size="md"/>

今、["ClickHouse にエクスポートする"](/observability/integrating-opentelemetry#exporting-to-clickhouse) で使用したコレクタ設定を再起動すると、希望の形式で `otel_logs_v2` にデータが表示されます。明示的な JSON 抽出関数を使用していることに注意してください。

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

`Body` カラムから JSON 関数を使用してカラムを抽出する同等のマテリアライズドビューは以下の通りです。

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
### 型について注意 {#beware-types}

上記のマテリアライズドビューは暗黙のキャストに依存しています - 特に `LogAttributes` マップを使用する場合において。ClickHouse は、抽出した値をターゲットテーブルの型に自動的に変換し、必要な構文を減少させることがよくあります。ただし、ユーザーは、ターゲットテーブルが同じスキーマである `INSERT INTO` 文を使用してビューを常にテストすることをお勧めします。これにより、型が正しく扱われていることを確認できます。特に以下のケースに注意が必要です：

- マップ内のキーが存在しない場合、空の文字列が返されます。数値の場合、ユーザーは適切な値にマッピングする必要があります。これは、[条件式](/sql-reference/functions/conditional-functions) e.g. `if(LogAttributes['status'] = ", 200, LogAttributes['status'])` や、[キャスト関数](/sql-reference/functions/type-conversion-functions)を使用して、デフォルトの値を許容する e.g. `toUInt8OrDefault(LogAttributes['status'] )` で実現できます。
- 一部の型は常にキャストされない場合があります。例えば数値の文字列表現は列挙型の値にキャストされません。
- JSON 抽出関数は、値が見つからない場合、デフォルトの値を返します。これらの値が意味をなすことを確認してください！

:::note Nullable を避ける
Observability データの ClickHouse で [Nullable](/sql-reference/data-types/nullable) を使用することは避けてください。ログやトレースにおいて、空と NULL を区別する必要はあまりありません。この機能は追加のストレージオーバーヘッドを伴い、クエリパフォーマンスに悪影響を及ぼします。詳細は [こちら](https://data-modeling/schema-design#optimizing-types) を参照してください。
:::
## 主 (順序) キーの選択 {#choosing-a-primary-ordering-key}

必要なカラムを抽出したら、順序/主キーの最適化を開始できます。

順序キーを選択するために適用できるいくつかの簡単なルールがあります。以下に示すものは、時には対立する場合があるため、これらを順に考慮してください。このプロセスから得られるキーの数はさまざまですが、通常4〜5が十分です：

1. 一般的なフィルターやアクセスパターンと一致するカラムを選択します。ユーザーが通常、特定のカラム（例：ポッド名）でフィルタリングすることから可観測性の調査を開始する場合、このカラムは `WHERE` 句で頻繁に使用されます。これらを他のあまり使用されないカラムよりも優先してキーに含めることを優先してください。
2. フィルタリングしたときに全体行数の大部分を排除するのに役立つカラムを優先します。これにより、読み取る必要のあるデータ量が削減されます。サービス名やステータスコードは、しばしば良い候補になります - 後者の場合、ユーザーが大部分の行を除外する値でフィルタリングする場合のみです（例えば、200s でフィルタリングすることは、ほぼ全行に該当するのに対して、500 エラーは小さなサブセットに対応します）。
3. テーブル内の他のカラムと高い相関があると考えられるカラムを優先します。これにより、これらの値が連続的に保存され、圧縮が改善されることが保証されます。
4. 順序キーのカラムに対する `GROUP BY` と `ORDER BY` 操作を、よりメモリ効率的にすることができます。

<br />

順序キーのサブセットを特定したら、特定の順序で宣言する必要があります。この順序は、クエリ内のセカンダリキーのフィルタリング効率や、テーブルデータファイルの圧縮率に大きな影響を与える可能性があります。一般的に、**基数が低い順にキーを並べるのがベストです。** ただし、順序キーに後で出てくるカラムでフィルタリングすることよりも、先に出てくるタプルでフィルタリングする方が効率的であることを考慮する必要があります。これらの挙動をバランスよく考察し、アクセスパターンを考慮してください。最も重要なことは、バリアントをテストすることです。順序キーを最適化する方法についてさらに理解を深めるために、[この記事](/guides/best-practices/sparse-primary-indexes)をお勧めします。

:::note 構造優先
ログを構造化した後に順序キーを決定することを推奨します。順序キーや JSON 抽出式内の属性マップのキーを使用しないでください。順序キーをテーブルのルートカラムとして持っていることを確認してください。
:::

## マップの使用 {#using-maps}

以前の例では、`Map(String, String)` カラム内の値にアクセスするためのマップ構文 `map['key']` の使用が示されています。また、ネストされたキーにアクセスするためにマップ記法を使用することに加え、特化した ClickHouse [マップ関数](/sql-reference/functions/tuple-map-functions#mapkeys) が、これらのカラムをフィルタリングまたは選択するために利用可能です。

たとえば、次のクエリは、[`mapKeys` 関数](/sql-reference/functions/tuple-map-functions#mapkeys) と [`groupArrayDistinctArray` 関数](/sql-reference/aggregate-functions/combinators) (コンビネーター) を使用して、`LogAttributes` カラムに利用可能なすべてのユニークキーを識別します。

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
Map カラム名にドットを使用することは推奨せず、その使用を非推奨にする可能性があります。`_` を使用してください。
:::

## エイリアスの使用 {#using-aliases}

マップタイプをクエリすることは、通常のカラムをクエリするよりも遅くなります - 詳しくは ["クエリの高速化"](#accelerating-queries) を参照してください。加えて、構文がより複雑であり、ユーザーが記述するのが面倒になる場合があります。この後者の問題に対処するために、エイリアスカラムの使用をお勧めします。

エイリアスカラムはクエリ時に計算され、テーブルに保存されません。したがって、このタイプのカラムに値を INSERT することは不可能です。エイリアスを使用すると、マップキーを参照して構文を単純化し、マップエントリを通常のカラムとして透過的に公開できます。次の例を考えてみましょう：

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

ここでは、いくつかのマテリアライズドカラムと、マップ `LogAttributes` にアクセスする `ALIAS` カラム `RemoteAddr` が存在します。このカラムを介して `LogAttributes['remote_addr']` 値をクエリすることができ、クエリが簡素化されます。即ち、

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

さらに、`ALTER TABLE` コマンドを使用して `ALIAS` を追加するのは非常に簡単です。これらのカラムは即座に利用可能です。

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

:::note デフォルトでエイリアスは除外される
デフォルトで、`SELECT *` は ALIAS カラムを除外します。この動作は、`asterisk_include_alias_columns=1` を設定することで無効にできます。
:::

## タイプの最適化 {#optimizing-types}

[一般的な ClickHouse のベストプラクティス](/data-modeling/schema-design#optimizing-types) が ClickHouse のユースケースに適用されます。

## コーデックの使用 {#using-codecs}

タイプの最適化に加えて、ユーザーは ClickHouse の可観測性スキーマの圧縮を最適化しようとする際に、[コーデックの一般的なベストプラクティス](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) に従うことができます。

一般的に、ユーザーは `ZSTD` コーデックがログおよびトレースデータセットに非常に適用可能であることを発見します。圧縮値をデフォルト値の 1 から増加させることで、圧縮が改善される可能性があります。ただし、これはテストされるべきであり、高い値は挿入時により大きな CPU オーバーヘッドを伴います。一般的に、この値を増加させてもあまり利益は見られません。

さらに、タイムスタンプは圧縮に関してデルタエンコーディングの恩恵を受ける一方で、このカラムが主キーまたは順序付けキーで使用されるとクエリのパフォーマンスが低下することが示されています。ユーザーには、各々の圧縮とクエリパフォーマンスのトレードオフを評価することをお勧めします。

## 辞書の使用 {#using-dictionaries}

[辞書](/sql-reference/dictionaries) は、ClickHouse の [重要な機能](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) であり、さまざまな内部および外部 [ソース](/sql-reference/dictionaries#dictionary-sources) からのデータのメモリ内 [キー-値](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表現を提供し、超低遅延のルックアップクエリに最適化されています。

<Image img={observability_12} alt="Observability and dictionaries" size="md"/>

これは、データをリアルタイムで拡張し、取り込みプロセスを遅くすることなく、クエリのパフォーマンスを向上させるさまざまなシナリオで便利です。特に JOIN は有利に働きます。
可観測性のユースケースでは、JOIN が必要になることはまれですが、辞書は両方の挿入およびクエリ時に拡張目的で便利です。以下にその両方の例を提供します。

:::note JOIN の高速化
辞書を使用して JOIN を高速化することに興味があるユーザーは、詳細を [こちら](/dictionary) で確認できます。
:::

### 挿入時とクエリ時 {#insert-time-vs-query-time}

辞書は、クエリ時または挿入時にデータセットを拡張するために使用できます。これらのアプローチそれぞれには、利点と欠点があります。まとめると：

- **挿入時** - これは、拡張値が変更されず、辞書を埋めるために使用できる外部ソースに存在する場合に適切です。この場合、挿入時に行を拡張することで辭書へのクエリ時間のルックアップを回避します。これは、挿入パフォーマンスと追加のストレージオーバーヘッドのコストがかかります。拡張された値はカラムとして保存されます。
- **クエリ時** - 辞書の値が頻繁に変わる場合、クエリ時ルックアップがより適用可能です。これにより、マッピングされた値が変更される場合にカラムを更新する必要がなくなります。この柔軟性は、クエリ時ルックアップの費用を伴います。このクエリ時のコストは、多くの行に対してルックアップが必要な場合、例えばフィルタ句で辞書ルックアップを使用する場合に通常目立ちます。結果の拡張、つまり `SELECT` 内でのルックアップに関しては、このオーバーヘッドは通常目立ちません。

ユーザーには、辞書の基本を理解することをお勧めします。辞書は、専用の [スペシャリスト関数](/sql-reference/functions/ext-dict-functions#dictgetall) を使用して値を取得できるメモリ内ルックアップテーブルを提供します。

簡単な拡張の例については、[こちら](/dictionary) の辞書ガイドを参照してください。以下では、一般的な可観測性拡張タスクに焦点を当てます。

### IP 辞書の使用 {#using-ip-dictionaries}

緯度と経度の値を使用して IP アドレスでログやトレースをジオ拡張することは、一般的な可観測性の要件です。これを `ip_trie` 構造辞書を使用して実現できます。

私たちは、[DB-IP.com](https://db-ip.com/) によって提供されている [DB-IP シティレベルデータセット](https://github.com/sapics/ip-location-db#db-ip-database-update-monthly) を使用します。これは [CC BY 4.0 ライセンス](https://creativecommons.org/licenses/by/4.0/) のもとに配布されています。

[README](https://github.com/sapics/ip-location-db#csv-format) から、データは以下のように構成されていることがわかります：

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

私たちの生活を楽にするために、[`URL()`](/engines/table-engines/special/url) テーブルエンジンを使用して、フィールド名を持つ ClickHouse テーブルオブジェクトを作成し、行数を確認します。

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

`ip_trie` 辞書が IP アドレス範囲を CIDR 表記で表現する必要があるため、`ip_range_start` と `ip_range_end` を変換する必要があります。

各範囲に対する CIDR は、次のクエリを使用して簡潔に計算できます。

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

4 rows in set. Elapsed: 0.259 sec.
```

:::note
上記のクエリでは多くのことが行われています。興味のある方は、この優れた [説明](https://clickhouse.com/blog/geolocating-ips-in-clickhouse-and-grafana#using-bit-functions-to-convert-ip-ranges-to-cidr-notation)を読んでみてください。そうでない場合は、上記が IP 範囲に対する CIDR を計算することを受け入れてください。
:::

私たちの目的のために、IP 範囲、国コード、および座標のみが必要ですので、新しいテーブルを作成し、Geo IP データを挿入します。

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

低遅延 IP ルックアップを ClickHouse で実行するために、辞書を使用してキーマッピング (CIDR ブロック) から座標と国コードの属性をメモリ内で保存します。ClickHouse は、私たちのネットワークプレフィックス (CIDR ブロック) を座標と国コードにマップするために `ip_trie` [辞書構造](/sql-reference/dictionaries#ip_trie) を提供します。次のクエリは、このレイアウトを使用して辞書を指定し、上記テーブルをソースとして使用します。

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

辞書から行を選択し、このデータセットがルックアップに利用可能であることを確認できます。

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
ClickHouse の辞書は、基になるテーブルデータと、上記で使用したライフタイム句に基づいて定期的に更新されます。DB-IP データセットの最新の変更を反映させるために Geo IP 辞書を更新するには、geoip_url リモートテーブルからデータを再挿入して `geoip` テーブルに変換を適用すればよいです。
:::

Geo IP データが `ip_trie` 辞書 (便利にも `ip_trie` と名付けられています) にロードされたので、これを使用して IP ジオロケーションを行うことができます。これは、次のように [`dictGet()` 関数](/sql-reference/functions/ext-dict-functions) を使用して実行できます。

```sql
SELECT dictGet('ip_trie', ('country_code', 'latitude', 'longitude'), CAST('85.242.48.167', 'IPv4')) AS ip_details

┌─ip_details──────────────┐
│ ('PT',38.7944,-9.34284) │
└─────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

ここでの取得速度に注意してください。これにより、ログを拡張することが可能になります。この場合、**クエリ時の拡張を行う**ことを選択します。

元のログデータセットに戻ると、これを使用して国別にログを集計することができます。次は、以前のマテリアライズドビューの結果となるスキーマを使っていると仮定します。このスキーマには抽出された `RemoteAddress` カラムがあります。

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

IP から地理的な位置のマッピングは変わる可能性があるため、ユーザーはリクエストが作成された時点での発信元を知りたいと思うでしょう。したがって、インデックス時の拡張がここでは好まれる可能性があります。これは、以下に示すように、マテリアライズドカラムを使用するか、マテリアライズドビューの選択肢として実行できます。

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
ユーザーは、新しいデータに基づいて IP 拡張辞書を定期的に更新したいと考えるでしょう。これは、辞書のライフタイム句を使用することで実現でき、辞書は基になるテーブルから定期的に再読み込みされます。基になるテーブルを更新する方法については、["リフレッシュ可能なマテリアライズドビュー"](/materialized-view/refreshable-materialized-view) を参照してください。
:::

上記の国と座標は、国別にグループ化しフィルタリングする以上の可視化機能を提供します。インスピレーションは、["地理データの可視化"](/observability/grafana#visualizing-geo-data) を参照してください。

### 正規表現辞書の使用 (ユーザーエージェントの解析) {#using-regex-dictionaries-user-agent-parsing}

[ユーザーエージェント文字列](https://en.wikipedia.org/wiki/User_agent) の解析は古典的な正規表現の問題であり、ログおよびトレースベースのデータセットで一般的な要件です。ClickHouse は、正規表現木辞書を使用してユーザーエージェントの効率的な解析を提供します。

正規表現木辞書は、ClickHouse オープンソース内で YAMLRegExpTree 辞書ソースタイプを使用して定義されており、正規表現木を含む YAML ファイルへのパスを提供します。独自の正規表現辞書を提供したい場合、必要な構造の詳細は [こちら](/sql-reference/dictionaries#use-regular-expression-tree-dictionary-in-clickhouse-open-source) で確認できます。以下では、[uap-core](https://github.com/ua-parser/uap-core) を使用してユーザーエージェントの解析に焦点を当て、サポートされている CSV 形式の辞書を読み込みます。このアプローチは OSS および ClickHouse Cloud に対応しています。

:::note
以下の例では、2024年6月のuser-agent解析用の最新のuap-core正規表現のスナップショットを使用しています。最新のファイルは時折更新され、[こちら](https://raw.githubusercontent.com/ua-parser/uap-core/master/regexes.yaml)で確認できます。ユーザーは、[こちら](/sql-reference/dictionaries#collecting-attribute-values)の手順に従って、下記で使用されているCSVファイルにロードすることができます。
:::

次のメモリテーブルを作成します。これらは、デバイス、ブラウザ、およびオペレーティングシステムの解析用の正規表現を保持します。

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

これらのテーブルは、次の公開ホストの CSV ファイルから、url テーブル関数を使用してポピュレートできます。

```sql
INSERT INTO regexp_os SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_os.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_device SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_device.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')

INSERT INTO regexp_browser SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/user_agent_regex/regexp_browser.csv', 'CSV', 'id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
```

メモリテーブルがポピュレートされたので、正規表現辞書をロードできます。ここで、キー値をカラムとして指定する必要があります。これらはユーザーエージェントから抽出可能な属性になります。

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

これらの辞書がロードされたので、サンプルユーザーエージェントを提供し、新しい辞書抽出機能をテストします。

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

ユーザーエージェントに関するルールはあまり変わらないため、辞書は新しいブラウザ、オペレーティングシステム、およびデバイスに応じてのみ更新する必要があります。このため、抽出作業は挿入時に行うのが理にかなっています。

この作業をマテリアライズドカラムを使用して行うか、マテリアライズドビューを使用して行うことができます。以前に使用したマテリアライズドビューを以下のように修正します。

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

これにより、ターゲットテーブル `otel_logs_v2` のスキーマを修正する必要があります。

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

コレクターを再起動し、以前に文書化された手順に基づいて構造化されたログをインジェストすることで、新しく抽出された Device、Browser、および Os カラムをクエリすることができます。

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
これらのユーザーエージェントカラムにはタプルが使用されています。タプルは、階層が事前にわかっている複雑な構造に推奨されます。サブカラムは通常のカラムと同じパフォーマンスを提供します (マップキーとは異なり) が、異種の型を許可します。
:::

### さらなる読み物 {#further-reading}

辞書に関するさらなる例や詳細については、以下の記事を推奨します：

- [高度な辞書トピック](/dictionary#advanced-dictionary-topics)
- ["辞書を使用してクエリを加速する"](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [辞書](/sql-reference/dictionaries)

## クエリの高速化 {#accelerating-queries}

ClickHouse は、クエリパフォーマンスを高速化するためのいくつかの手法をサポートしています。以下は、最も人気のあるアクセスパターンを最適化し、圧縮を最大化するために適切な主キー/順序キーを選択した後に検討すべきです。これは通常、最小限の労力でパフォーマンスに最も大きな影響を与えます。
```
```yaml
title: '集約のためのマテリアライズドビュー（インクリメンタル）の使用'
sidebar_label: '集約のためのマテリアライズドビュー（インクリメンタル）の使用'
keywords: ['集約', 'マテリアライズドビュー', 'インクリメンタル', 'ClickHouse']
description: 'マテリアライズドビューを使用してデータを集約する方法を学びます。'
```

### 集約のためのマテリアライズドビュー（インクリメンタル）の使用 {#using-materialized-views-incremental-for-aggregations}

前のセクションでは、データ変換とフィルタリングのためのマテリアライズドビューの使用について探求しました。しかし、マテリアライズドビューは、挿入時に集約を事前計算し、結果を保存するためにも使用できます。この結果は、後続の挿入からの結果で更新されることができ、実際には挿入時に集約が事前計算されることを可能にします。

ここの主なアイデアは、結果がしばしば元のデータの小さな表現（集約の場合は部分的なスケッチ）であるということです。ターゲットテーブルから結果を読み取るためのよりシンプルなクエリと組み合わせると、クエリタイムは同じ計算が元のデータに対して行われた場合よりも速くなります。

次のクエリを考えてみましょう。ここでは、構造化されたログを使用して時間ごとの合計トラフィックを計算しています。

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

5 行がセットに含まれています。経過時間: 0.666 秒。処理行数: 10.37 百万行、4.73 GB (15.56 百万行/秒、7.10 GB/秒。)
ピークメモリ使用量: 1.40 MiB。
```

このクエリは、Grafanaを使用してユーザーが描画する一般的な折れ線グラフであると想像できます。このクエリは認められるほど非常に速いです - データセットはわずか10m行であり、ClickHouseは高速です！ しかし、これを数十億、数兆行にスケールする場合、理想的にはこのクエリパフォーマンスを維持したいです。

:::note
このクエリは、`otel_logs_v2`テーブルを使用すると、 10倍速くなります。このテーブルは以前のマテリアライズドビューからのもので、`LogAttributes`マップからサイズキーフィールドを抽出します。ここでは、説明の目的で生データを使用しますが、これは一般的なクエリである場合は以前のビューを使用することをお勧めします。
:::

挿入時にマテリアライズドビューを使用してこれを計算する場合、結果を受け取るためのテーブルが必要です。このテーブルは、時間ごとに1行のみを保持する必要があります。既存の時間に対する更新が受信された場合、他のカラムは既存の時間の行にマージされるべきです。このインクリメンタルな状態のマージが行われるためには、他のカラムの部分状態を保存する必要があります。

これには、ClickHouse内の特別なエンジンタイプが必要です：**SummingMergeTree**。これは、同じオーダリングキーを持つすべての行を1行で置き換え、数値カラムの合計値が含まれます。次のテーブルは、同じ日付を持つ行を合算し、数値カラムを合計します。

```sql
CREATE TABLE bytes_per_hour
(
  `Hour` DateTime,
  `TotalBytes` UInt64
)
ENGINE = SummingMergeTree
ORDER BY Hour
```

私たちのマテリアライズドビューを示すために、`bytes_per_hour`テーブルが空でデータをまだ受け取っていないと仮定します。私たちのマテリアライズドビューは、`otel_logs`に挿入されたデータに対して上記の`SELECT`を実行します（これは、設定されたサイズのブロックに対して実行されます）、その結果は`bytes_per_hour`に送信されます。構文は以下の通りです。

```sql
CREATE MATERIALIZED VIEW bytes_per_hour_mv TO bytes_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
       sum(toUInt64OrDefault(LogAttributes['size'])) AS TotalBytes
FROM otel_logs
GROUP BY Hour
```

ここでの`TO`句は重要であり、結果が送信される場所を示します。すなわち、`bytes_per_hour`です。

OTel Collectorを再起動し、ログを再送信すると、`bytes_per_hour`テーブルは上記のクエリ結果でインクリメンタルにポピュレートされます。終了時に、`bytes_per_hour`のサイズを確認できます - 時間ごとに1行持っているはずです：

```sql
SELECT count()
FROM bytes_per_hour
FINAL

┌─count()─┐
│     113 │
└─────────┘

1 行がセットに含まれています。経過時間: 0.039 秒。
```

私たちは、クエリの結果を保存することによって、ここで10m行（`otel_logs`内）から113行に効果的に削減しました。ここでの重要な点は、`otel_logs`テーブルに新しいログが挿入されると、各自の時間に対して新しい値が`bytes_per_hour`に送信され、バックグラウンドで非同期的に自動的にマージされることです - したがって、`bytes_per_hour`は常に小さく、最新の状態を保つことができます。

行のマージが非同期であるため、ユーザーがクエリするときに1時間あたり複数の行が存在する可能性があります。未処理の行がクエリ時にマージされることを確保するために、2つのオプションがあります：

- テーブル名に[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用する（上記のカウントクエリで行ったこと）。
- 最終テーブルで使用されるオーダリングキー、すなわちTimestampで集約し、メトリクスを合計します。

通常、2番目のオプションがより効率的で柔軟ですが（テーブルは他の用途にも使用できます）、最初のオプションは一部のクエリにとってはよりシンプルです。以下に両方を示します：

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

5 行がセットに含まれています。経過時間: 0.008 秒。

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

5 行がセットに含まれています。経過時間: 0.005 秒。
```

これは、クエリの速度を0.6秒から0.008秒に高速化しました - 75倍以上です！

:::note
このようなデータセットが増加し、より複雑なクエリになると、これらの節約はさらに大きくなる可能性があります。例については、[こちら](https://github.com/ClickHouse/clickpy)をご覧ください。
:::
#### より複雑な例 {#a-more-complex-example}

上記の例は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)を使用して時間ごとの単純なカウントを集約します。単純な合計を超える統計には、異なるターゲットテーブルエンジンが必要です：[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)。

ユニークなIPアドレス（またはユニークユーザー）の数を日ごとに計算したいとします。このクエリは以下の通りです：

```sql
SELECT toStartOfHour(Timestamp) AS Hour, uniq(LogAttributes['remote_addr']) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │     4763    │
│ 2019-01-22 00:00:00 │     536     │
└─────────────────────┴─────────────┘

113 行がセットに含まれています。経過時間: 0.667 秒。処理行数: 10.37 百万行、4.73 GB (15.53 百万行/秒、7.09 GB/秒。)
```

インクリメンタルに更新するためのカーディナリティカウントを持続するには、AggregatingMergeTreeが必要です。

```sql
CREATE TABLE unique_visitors_per_hour
(
  `Hour` DateTime,
  `UniqueUsers` AggregateFunction(uniq, IPv4)
)
ENGINE = AggregatingMergeTree
ORDER BY Hour
```

ClickHouseが集約状態が保存されることを認識できるように、`UniqueUsers`カラムを[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)として、部分状態の関数源（uniq）とソースカラムのタイプ（IPv4）を指定します。SummingMergeTreeと同様に、同じ`ORDER BY`キーの値を持つ行はマージされます（上記の例ではHour）。

関連するマテリアライズドビューは、先程のクエリを使用します：

```sql
CREATE MATERIALIZED VIEW unique_visitors_per_hour_mv TO unique_visitors_per_hour AS
SELECT toStartOfHour(Timestamp) AS Hour,
        uniqState(LogAttributes['remote_addr']::IPv4) AS UniqueUsers
FROM otel_logs
GROUP BY Hour
ORDER BY Hour DESC
```

集約関数に`suffix`の`State`を追加して、最終的な結果の代わりに関数の集約状態が返されることを保証します。これには、この部分状態が他の状態とマージできるようにするための追加情報が含まれます。

データが再ロードされた後、Collectorの再起動を通じて、`unique_visitors_per_hour`テーブルに113行が存在することを確認できます。

```sql
SELECT count()
FROM unique_visitors_per_hour
FINAL
┌─count()─┐
│   113   │
└─────────┘

1 行がセットに含まれています。経過時間: 0.009 秒。
```

最終的なクエリは、関数のマージサフィックスを利用する必要があります（カラムは部分的な集約状態を保存しています）：

```sql
SELECT Hour, uniqMerge(UniqueUsers) AS UniqueUsers
FROM unique_visitors_per_hour
GROUP BY Hour
ORDER BY Hour DESC

┌────────────────Hour─┬─UniqueUsers─┐
│ 2019-01-26 16:00:00 │      4763   │
│ 2019-01-22 00:00:00 │      536    │
└─────────────────────┴─────────────┘

113 行がセットに含まれています。経過時間: 0.027 秒。
```

ここで`FINAL`を使用する代わりに`GROUP BY`を使用します。
### マテリアライズドビュー（インクリメンタル）の使用による迅速なルックアップ {#using-materialized-views-incremental--for-fast-lookups}

ユーザーは、フィルタリングおよび集約句で頻繁に使用されるカラムに対してClickHouseのオーダリングキーを選択する際に、アクセスパターンを考慮すべきです。これは、ユーザーが多様なアクセスパターンを持ち、単一のカラムセットにカプセル化できない観測性の使用ケースで制限的な場合があります。これは、デフォルトのOTelスキーマに組み込まれた例で最もよく示されます。トレースのデフォルトスキーマを考えてみましょう：

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

このスキーマは、`ServiceName`、`SpanName`、および`Timestamp`によるフィルタリングに最適化されています。トレースでは、特定の`TraceId`でルックアップを行い、関連するトレースのスパンを取得する能力も必要です。これはオーダリングキーに存在しますが、その位置が最後であるため、[フィルタリングが効率的ではなくなる可能性があります](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)おそらく、単一のトレースを取得する際に、かなりの量のデータをスキャンしなければならなくなります。

OTelコレクタは、この課題に対処するために、マテリアライズドビューおよび関連するテーブルもインストールします。テーブルとビューは以下の通りです：

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

このビューは、テーブル`otel_traces_trace_id_ts`にトレースの最小および最大タイムスタンプを持つことを効果的に保証します。このテーブルは`TraceId`でソートされており、これによりタイムスタンプを効率的に取得できます。これらのタイムスタンプ範囲は、メインの`otel_traces`テーブルをクエリする際に使用できます。より具体的には、トレースをそのIDで取得する際に、Grafanaは次のクエリを使用します：

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

CTEは、トレースID `ae9226c78d1d360601e6383928e4d22d`の最小および最大タイムスタンプを特定し、それを使用してメインの`otel_traces`テーブルをその関連スパンの取得でフィルタリングします。

この同じアプローチは、類似のアクセスパターンに適用できます。類似の例はデータモデリングで探求しています。[こちら](/materialized-view/incremental-materialized-view#lookup-table)。
### プロジェクションの使用 {#using-projections}

ClickHouseのプロジェクションにより、ユーザーはテーブルに対して複数の`ORDER BY`句を指定できます。

前のセクションでは、マテリアライズドビューを使用して、ClickHouseで集約を事前計算し、行を変換し、異なるアクセスパターンのために観測可能性のクエリを最適化する方法について探求しました。

特定のアクセスパターンに最適化するため、マテリアライズドビューがターゲットテーブルに挿入される元のテーブルとは異なるオーダリングキーを持つ行を送る例を提供しました。

プロジェクションは、主キーの一部ではないカラムに対するクエリの最適化を可能にする同じ問題に対処するために使用できます。

理論的には、この機能を使用して、テーブルに対して複数のオーダリングキーを提供できますが、1つの明確な欠点があります：データの重複です。具体的には、データは、すべてのプロジェクションごとに指定された順序に加えて、主な主キーの順序で書き込む必要があります。これにより、挿入が遅くなり、より多くのディスクスペースを消費します。

:::note プロジェクション vs マテリアライズドビュー
プロジェクションは、マテリアライズドビューと同様の機能を多く提供しますが、後者のほうが好まれることが多いため、控えめに使用する必要があります。ユーザーは欠点を理解し、それらが適切なケースであるときにいつ使用するべきかを理解する必要があります。たとえば、プロジェクションは集約の事前計算に使用できますが、ユーザーはこれにマテリアライズドビューを使用することを推奨します。
:::

<Image img={observability_13} alt="Observability and projections" size="md"/>

次のクエリを考えます。これは、500エラーコードで`otel_logs_v2`テーブルをフィルタリングします。これは、ユーザーがエラーコードでフィルタリングしたいと考えるため、ログ記録における一般的なアクセスパターンである可能性があります：

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

Ok.

0 行がセットに含まれています。経過時間: 0.177 秒。処理行数: 10.37 百万行、685.32 MB (58.66 百万行/秒、3.88 GB/秒。)
ピークメモリ使用量: 56.54 MiB。
```

:::note パフォーマンスを測定するためにNullを使用する
ここでは`FORMAT Null`を使用して結果を表示していません。これにより、すべての結果が読み取られますが返されず、LIMITによるクエリの早期終了を防ぎます。これは、10m行すべてをスキャンするのにかかった時間を示すためだけのものです。
:::

上記のクエリは、選択されたオーダリングキー `(ServiceName, Timestamp)` を利用して線形スキャンを必要とします。上記のクエリのパフォーマンスを向上させるために、Statusをオーダリングキーの最後に追加することも可能ですが、プロジェクションを追加することもできます。

```sql
ALTER TABLE otel_logs_v2 (
  ADD PROJECTION status
  (
     SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent ORDER BY Status
  )
)

ALTER TABLE otel_logs_v2 MATERIALIZE PROJECTION status
```

プロジェクションを作成し、その後それをマテリアライズする必要があることに注意してください。この後者のコマンドにより、データは2つの異なる順序でディスク上に二重に保存されます。データ作成時にプロジェクションを定義することもでき、以下に示すように、データが挿入されるにつれて自動的に維持されます。

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

重要なのは、ALTERを介してプロジェクションが作成された場合、その作成は非同期であり、`MATERIALIZE PROJECTION`コマンドが発行されると発生することです。ユーザーは次のクエリでこの操作の進行状況を確認し、`is_done=1`を待つことができます。

```sql
SELECT parts_to_do, is_done, latest_fail_reason
FROM system.mutations
WHERE (`table` = 'otel_logs_v2') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│           0 │     1   │                    │
└─────────────┴─────────┴────────────────────┘
```

上記のクエリを繰り返すと、パフォーマンスが大幅に改善されたことが確認でき、追加のストレージを必要とします（ストレージの測定方法については["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください）。

```sql
SELECT Timestamp, RequestPath, Status, RemoteAddress, UserAgent
FROM otel_logs_v2
WHERE Status = 500
FORMAT `Null`

0 行がセットに含まれています。経過時間: 0.031 秒。処理行数: 51.42 千行、22.85 MB (1.65 百万行/秒、734.63 MB/秒。)
ピークメモリ使用量: 27.85 MiB。
```

上記の例では、プロジェクションの中で以前のクエリで使用されるカラムを指定しています。これにより、指定されたこれらのカラムのみがプロジェクションの一部としてディスクに保存され、Statusでソートされます。代わりにここで`SELECT *`を使用した場合、すべてのカラムが保存されます。これにより、より多くのクエリ（任意のカラムの部分集合を使用する）がプロジェクションの利点を享受できるようになりますが、追加のストレージがかかります。ディスクスペースおよび圧縮の測定については、["テーブルサイズと圧縮の測定"](#measuring-table-size--compression)を参照してください。
### セカンダリ/データスキッピングインデックス {#secondarydata-skipping-indices}

ClickHouseで主キーがどれほどうまく調整されていても、いくつかのクエリは必然的にフルテーブルスキャンを必要とします。これは、マテリアライズドビューや一部のクエリでプロジェクションを使用することで緩和できますが、これらには追加のメンテナンスが必要であり、ユーザーはそれらの可用性を認識しておく必要があります。従来のリレーショナルデータベースは、セカンダリインデックスを使用してこの問題を解決しますが、これらはClickHouseのような列指向データベースでは効果的ではありません。代わりに、ClickHouseは「スキップ」インデックスを使用します。これにより、データベースは一致する値のない大きなデータチャンクをスキップできるため、クエリ性能を大幅に改善します。

デフォルトのOTelスキーマは、マップアクセステーブルへのアクセシビリティを加速するためにセカンダリインデックスを使用します。これらは一般的に効果がないためカスタムスキーマにコピーすることをお勧めしませんが、スキッピングインデックスは依然として有用です。

ユーザーは、セカンダリインデックスに関する[ガイド](/optimize/skipping-indexes)を読み、理解する必要があります。

**一般的に、主キーとターゲットの非主カラム/式との間に強い相関関係がある場合に効果的であり、ユーザーが希少な値、すなわち多くのグラニュールに出現しない値をルックアップする場合に有効です。**
```

### テキスト検索のためのブルームフィルタ {#bloom-filters-for-text-search}

観測性クエリにおいて、ユーザーがテキスト検索を実行する必要がある場合、二次インデックスが役立ちます。具体的には、ngramおよびトークンベースのブルームフィルタインデックス [`ngrambf_v1`](/optimize/skipping-indexes#bloom-filter-types) および [`tokenbf_v1`](/optimize/skipping-indexes#bloom-filter-types) を使用して、`LIKE`、`IN` および hasToken オペレーターを使用した文字列カラムに対する検索を加速できます。特に、トークンベースのインデックスは、非英数字文字をセパレーターとして使用してトークンを生成します。これにより、クエリ時にトークン（または単語全体）のみが一致することになります。より詳細な一致を行うためには、[N-gramブルームフィルタ](/optimize/skipping-indexes#bloom-filter-types) を使用できます。これにより、文字列を指定したサイズのngramに分割し、部分語の一致を可能にします。

生成されるトークンを評価するためには、`tokens` 関数を使用できます：

```sql
SELECT tokens('https://www.zanbil.ir/m/filter/b113')

┌─tokens────────────────────────────────────────────┐
│ ['https','www','zanbil','ir','m','filter','b113'] │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

`ngram` 関数は、第二引数として `ngram` サイズを指定できる同様の機能を提供します：

```sql
SELECT ngrams('https://www.zanbil.ir/m/filter/b113', 3)

┌─ngrams('https://www.zanbil.ir/m/filter/b113', 3)────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['htt','ttp','tps','ps:','s:/','://','//w','/ww','www','ww.','w.z','.za','zan','anb','nbi','bil','il.','l.i','.ir','ir/','r/m','/m/','m/f','/fi','fil','ilt','lte','ter','er/','r/b','/b1','b11','113'] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.008 sec.
```

:::note 反転インデックス
ClickHouseは二次インデックスとして反転インデックスの実験的サポートも提供していますが、現在はログデータセットには推奨しておらず、運用準備が整った際にトークンベースのブルームフィルタに置き換わることを期待しています。
:::

この例の目的のために、構造化ログデータセットを使用します。`Referer` カラムに `ultra` が含まれるログを数えたいとします。

```sql
SELECT count()
FROM otel_logs_v2
WHERE Referer LIKE '%ultra%'

┌─count()─┐
│  114514 │
└─────────┘

1 row in set. Elapsed: 0.177 sec. Processed 10.37 million rows, 908.49 MB (58.57 million rows/s., 5.13 GB/s.)
```

ここでは、ngram サイズ 3 で一致させる必要があるため、`ngrambf_v1` インデックスを作成します。

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

ここでのインデックス `ngrambf_v1(3, 10000, 3, 7)` は4つのパラメータを取ります。これらのうちの最後の値（7）はシードを表します。他の値はngramサイズ（3）、値 `m`（フィルタサイズ）、およびハッシュ関数の数 `k`（7）を表します。`k` と `m` のチューニングは必要であり、ユニークなngram/トークンの数や、フィルタが真の負と確認され、粒度内に値が含まれていない確率に基づきます。これらの値を設定するのに役立つ[関数](/engines/table-engines/mergetree-family/mergetree#bloom-filter)を推奨します。

うまくチューニングされると、ここでのスピードアップは大きいでしょう：

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

:::note 例にすぎません
上記は示例の目的のためのものです。ユーザーには、テキスト検索をトークンベースのブルームフィルタを使用して最適化しようとするのではなく、挿入時にログから構造を抽出することを推奨します。ただし、スタックトレースやその他の大きな文字列に対するテキスト検索が構造の予測不能性のために有用な場合もあります。
:::

ブルームフィルタを使用する際の一般的なガイドライン：

ブルームフィルタの目的は、[グラニュール](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)をフィルタリングし、カラムのすべての値を読み込んで線形スキャンする必要を回避することです。`EXPLAIN` 句でパラメータ `indexes=1` を使用して、スキップされたグラニュールの数を特定できます。以下は、元のテーブル `otel_logs_v2` と、ngramブルームフィルタを持つテーブル `otel_logs_bloom` の応答を考慮してください。

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

ブルームフィルタは通常、カラム自体よりも小さい場合にのみ、速度が向上します。そうでない場合、性能向上は無視できるものになる可能性があります。次のクエリを使用して、フィルタとカラムのサイズを比較してください：

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

上記の例では、二次ブルームフィルタインデックスは12MBで、カラム自体の圧縮サイズ56MBのほぼ5倍小さいことがわかります。

ブルームフィルタは、適切なチューニングを必要とします。最適な設定を特定する際に役立つノートを[こちら](/engines/table-engines/mergetree-family/mergetree#bloom-filter)でフォローすることを推奨します。ブルームフィルタは挿入時やマージ時にコストがかかる場合があります。ユーザーは、ブルームフィルタを本番環境に追加する前に、挿入性能への影響を評価するべきです。

二次スキップインデックスに関する詳細は[こちら](/optimize/skipping-indexes#skip-index-functions)で確認できます。
### マップからの抽出 {#extracting-from-maps}

Map型はOTelスキーマで広く使用されています。この型は、値とキーが同じ型である必要があり、Kubernetesラベルなどのメタデータには十分です。Map型のサブキーをクエリする際には、親カラム全体がロードされることに注意してください。マップに多くのキーがある場合、ディスクから読み込むデータが多くなり、重大なクエリペナルティが発生する可能性があります。

特定のキーを頻繁にクエリする場合は、それをルートで専用のカラムに移動することを検討してください。これは通常、一般的なアクセスパターンに応じて、デプロイ後に発生するタスクであり、本番前に予測するのが難しいことがあります。デプロイ後にスキーマを変更する方法については、["スキーマ変更の管理"](/observability/managing-data#managing-schema-changes)を参照してください。
## テーブルサイズと圧縮の測定 {#measuring-table-size--compression}

ClickHouseが観測性に使用される主な理由の1つは圧縮です。

ストレージコストを劇的に削減するだけでなく、ディスク上のデータが少ないことは、I/Oの削減とクエリおよび挿入の高速化を意味します。I/Oの削減は、CPUに関するいかなる圧縮アルゴリズムのオーバーヘッドを上回ります。したがって、データの圧縮を改善することが、ClickHouseクエリを高速に保つための最初の焦点であるべきです。

圧縮の測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)で確認できます。
