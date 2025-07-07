---
'title': 'Grafana の使用方法'
'description': '可観測性のための Grafana と ClickHouse の使用方法'
'slug': '/observability/grafana'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

import observability_15 from '@site/static/images/use-cases/observability/observability-15.png';
import observability_16 from '@site/static/images/use-cases/observability/observability-16.png';
import observability_17 from '@site/static/images/use-cases/observability/observability-17.png';
import observability_18 from '@site/static/images/use-cases/observability/observability-18.png';
import observability_19 from '@site/static/images/use-cases/observability/observability-19.png';
import observability_20 from '@site/static/images/use-cases/observability/observability-20.png';
import observability_21 from '@site/static/images/use-cases/observability/observability-21.png';
import observability_22 from '@site/static/images/use-cases/observability/observability-22.png';
import observability_23 from '@site/static/images/use-cases/observability/observability-23.png';
import observability_24 from '@site/static/images/use-cases/observability/observability-24.png';
import Image from '@theme/IdealImage';


# GrafanaとClickHouseを使用した可観測性

Grafanaは、ClickHouseにおける可観測性データのための推奨可視化ツールです。これは、Grafana用の公式ClickHouseプラグインを使用して実現されます。ユーザーは[こちら](https://grafana.com/docs/grafana/latest/explore/)にあるインストール手順に従うことができます。

プラグインのV4では、ログとトレースが新しいクエリビルダー体験の中で第一級市民として扱われます。これにより、SREがSQLクエリを書く必要が最小限に抑えられ、SQLベースの可観測性が簡素化され、この新興パラダイムの前進が促進されます。この一環として、私たちはOpen Telemetry (OTel)をプラグインの中心に置いており、これが今後数年間のSQLベースの可観測性の基盤となり、データ収集の方法になると考えています。

## Open Telemetry統合 {#open-telemetry-integration}

GrafanaでClickHouseデータソースを設定すると、プラグインはユーザーがログとトレースのためのデフォルトデータベースとテーブルを指定し、これらのテーブルがOTelスキーマに準拠しているかどうかを設定できるようにします。これにより、プラグインはGrafanaでのログとトレースの正しいレンダリングに必要なカラムを返すことができます。デフォルトのOTelスキーマに変更を加え、自分独自のカラム名を使用したい場合は、それを指定できます。time（Timestamp）、log level（SeverityText）、message body（Body）などのデフォルトOTelカラム名を使うことにより、変更は不要になります。

:::note HTTPかNative
ユーザーは、HTTPプロトコルまたはNativeプロトコルのいずれかを介してGrafanaをClickHouseに接続できます。後者は、Grafanaユーザーが発行する集約クエリでは感知されないかもしれない若干のパフォーマンス向上を提供します。一方、HTTPプロトコルは通常、ユーザーがプロキシや内部調査を行う際により単純です。
:::

ログが正しくレンダリングされるためには、Logs設定には時間、ログレベル、およびメッセージカラムが必要です。

Traces設定はやや複雑です（フルリストは[こちら](../../engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要なカラムは、フルトレースプロファイルを構築するための後続のクエリを抽象化できるように必要です。これらのクエリはデータがOTelに似た構造であることを前提としているため、標準スキーマから大きく逸脱するユーザーはこの機能を利用するためにビューを使用する必要があります。

<Image img={observability_15} alt="Connector config" size="sm"/>

設定が完了したら、ユーザーは[Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)に移動し、ログやトレースを検索し始めることができます。

## ログ {#logs}

Grafanaのログ要件に従うと、ユーザーはクエリビルダーで`Query Type: Log`を選択し、`Run Query`をクリックすることができます。クエリビルダーは、ログをリストするクエリを作成し、適切にレンダリングされることを保証します。例：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Connector logs config" size="lg" border/>

クエリビルダーは、クエリを変更するための簡単な手段を提供し、ユーザーがSQLを書く必要がなくなります。キーワードを含むログを見つけるなどのフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを作成したいユーザーは、SQLエディタに切り替えることができます。適切なカラムが返され、`logs`がQuery Typeとして選択される限り、結果はログとしてレンダリングされます。ログレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)にリストされています。

### ログからトレースへ {#logs-to-traces}

ログにトレースIDが含まれている場合、ユーザーは特定のログ行のトレースをナビゲートできる利点があります。

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## トレース {#traces}

上記のログ体験と同様に、Grafanaがトレースをレンダリングするために必要なカラムが満たされている場合（たとえば、OTelスキーマを使用）、クエリビルダーは自動的に必要なクエリを形成できます。`Query Type: Traces`を選択し、`Run Query`をクリックすると、次のようなクエリが生成・実行されます（設定されたカラムに応じて - 以下はOTelの使用を前提としています）：

```sql
SELECT "TraceId" as traceID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration
FROM "default"."otel_traces"
WHERE ( Timestamp >= $__fromTime AND Timestamp <= $__toTime )
  AND ( ParentSpanId = '' )
  AND ( Duration > 0 )
  ORDER BY Timestamp DESC, Duration DESC LIMIT 1000
```

このクエリは、Grafanaによって予想されるカラム名を返し、以下に示すトレースのテーブルをレンダリングします。継続時間や他のカラムでのフィルタリングは、SQLを書く必要なく行えます。

<Image img={observability_18} alt="Traces" size="lg" border/>

より複雑なクエリを作成したいユーザーは、`SQL Editor`に切り替えることができます。

### トレース詳細の表示 {#view-trace-details}

上記のように、トレースIDはクリック可能なリンクとしてレンダリングされます。トレースIDをクリックすると、ユーザーは関連するスパンを表示するためのリンク`View Trace`を選択できます。これにより、必要な構造でスパンを取得するためのクエリが次のようになります（OTelカラムを前提としています）：

```sql
WITH '<trace_id>' as trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) as trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) as trace_end
SELECT "TraceId" as traceID,
  "SpanId" as spanID,
  "ParentSpanId" as parentSpanID,
  "ServiceName" as serviceName,
  "SpanName" as operationName,
  "Timestamp" as startTime,
  multiply("Duration", 0.000001) as duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) as tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) as serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
上記のクエリがトレースIDのルックアップにmaterialized view `otel_traces_trace_id_ts`を使用していることに注意してください。詳細については、[Accelerating Queries - Using Materialized views for lookups](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照してください。
:::

<Image img={observability_19} alt="Trace Details" size="lg" border/>

### トレースからログへ {#traces-to-logs}

ログにトレースIDが含まれている場合、ユーザーはトレースから関連するログにナビゲートできます。ログを見るには、トレースIDをクリックし、`View Logs`を選択します。これにより、デフォルトのOTelカラムを前提とした次のクエリが発行されます。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Traces to logs" size="lg" border/>

## ダッシュボード {#dashboards}

ユーザーは、ClickHouseデータソースを使用してGrafanaにダッシュボードを構築できます。詳細については、GrafanaとClickHouseの[データソース文書](https://github.com/grafana/clickhouse-datasource)を参照することをお勧めします。特に[マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)や[変数](https://grafana.com/docs/grafana/latest/dashboards/variables/)に関する情報が有用です。

プラグインは、OTel仕様に準拠したログとトレースデータのためのサンプルダッシュボード「Simple ClickHouse OTel dashboarding」を含む、いくつかの既製ダッシュボードを提供しています。これには、ユーザーがOTelのデフォルトカラム名に準拠する必要があり、データソース設定からインストールできます。

<Image img={observability_21} alt="Dashboards" size="lg" border/>

以下に、ビジュアライゼーションを構築するためのいくつかの簡単なヒントを提供します。

### 時系列 {#time-series}

統計値とともに、折れ線チャートは可観測性ユースケースで使用される最も一般的な視覚化形式です。ClickHouseプラグインは、クエリが`datetime`という名前の`time`と数値カラムを返すと、自動的に折れ線チャートをレンダリングします。たとえば：

```sql
SELECT
 $__timeInterval(Timestamp) as time,
 quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE
 $__timeFilter(Timestamp)
 AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_22} alt="Time series" size="lg" border/>

### マルチラインチャート {#multi-line-charts}

次の条件が満たされると、クエリはマルチラインチャートとして自動的にレンダリングされます：

- フィールド1：エイリアスがtimeのdatetimeフィールド
- フィールド2：グループ化するための値。これは文字列である必要があります。
- フィールド3以上：メトリック値

たとえば：

```sql
SELECT
  $__timeInterval(Timestamp) as time,
  ServiceName,
  quantile(0.99)(Duration)/1000000 AS p99
FROM otel_traces
WHERE $__timeFilter(Timestamp)
AND ( Timestamp  >= $__fromTime AND Timestamp <= $__toTime )
GROUP BY ServiceName, time
ORDER BY time ASC
LIMIT 100000
```

<Image img={observability_23} alt="Multi-line charts" size="lg" border/>

### ジオデータの視覚化 {#visualizing-geo-data}

前のセクションで、IP辞書を使用して可観測性データをジオ座標で強化する方法を探りました。`latitude`と`longitude`のカラムがある場合、`geohashEncode`関数を使用して可観測性を視覚化できます。これにより、Grafana Geo Mapチャートに適合するジオハッシュが生成されます。以下に、クエリと視覚化の例を示します：

```sql
WITH coords AS
        (
        SELECT
                Latitude,
                Longitude,
                geohashEncode(Longitude, Latitude, 4) AS hash
        FROM otel_logs_v2
        WHERE (Longitude != 0) AND (Latitude != 0)
        )
SELECT
        hash,
        count() AS heat,
        round(log10(heat), 2) AS adj_heat
FROM coords
GROUP BY hash
```

<Image img={observability_24} alt="Visualizing geo data" size="lg" border/>
