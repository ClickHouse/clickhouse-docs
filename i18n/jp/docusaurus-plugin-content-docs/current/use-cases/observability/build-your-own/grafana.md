---
'title': '使用 Grafana'
'description': '使用 Grafana 和 ClickHouse 进行可观察性'
'slug': '/observability/grafana'
'keywords':
- 'Observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
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

Grafanaは、ClickHouseの可観測性データのための最適な可視化ツールです。これは、Grafanaの公式ClickHouseプラグインを使用して実現されています。ユーザーは、[こちら](/integrations/grafana)にあるインストール手順に従うことができます。

プラグインのV4では、ログとトレースが新しいクエリビルダー体験の中で第一級の市民として扱われています。これにより、SREはSQLクエリを書く必要が最小限に抑えられ、SQLベースの可観測性が簡素化され、この新興のパラダイムが前進しています。その一部として、プラグインの中心にはOpenTelemetry (OTel)が据えられており、これが今後数年間のSQLベースの可観測性及びデータ収集の基盤になると考えています。

## OpenTelemetry統合 {#open-telemetry-integration}

GrafanaでClickHouseのデータソースを設定すると、プラグインはユーザーがログとトレースのためのデフォルトのデータベースとテーブルを指定できるようにし、これらのテーブルがOTelスキーマに準拠しているかどうかを確認します。これにより、プラグインはGrafanaで正しくログとトレースをレンダリングするために必要なカラムを返すことができます。デフォルトのOTelスキーマに変更を加え、自分のカラム名を使用したい場合は、これを指定することが可能です。time（`Timestamp`）、log level（`SeverityText`）、message body（`Body`）などのデフォルトOTelカラム名を使用する場合は、変更する必要はありません。

:::note HTTPまたはネイティブ
ユーザーはHTTPまたはネイティブプロトコルを通じてGrafanaをClickHouseに接続できます。後者は、Grafanaユーザーが発行する集計クエリにはあまり顕著ではない性能上の利点を提供します。対照的に、HTTPプロトコルは通常、ユーザーにとってプロキシや内省が簡単です。
:::

ログが正しくレンダリングされるためには、ログ設定に時間、ログレベル、およびメッセージカラムが必要です。

トレース設定はやや複雑です（完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要なカラムは、完全なトレースプロファイルを構築するための以降のクエリが抽象化できるようにするためです。これらのクエリはデータがOTelに似た構造であることを前提としているため、標準のスキーマから大きく逸脱するユーザーは、この機能を利用するためにビューを使用する必要があります。

<Image img={observability_15} alt="Connector config" size="sm"/>

設定が完了したら、ユーザーは[Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)に移動し、ログとトレースを検索し始めることができます。

## ログ {#logs}

Grafanaのログ要件に従う場合、ユーザーはクエリビルダーで`Query Type: Log`を選択し、`Run Query`をクリックできます。クエリビルダーは、ログを一覧表示し、レンダリングされることを保証するクエリを作成します。

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="Connector logs config" size="lg" border/>

クエリビルダーは、ユーザーがSQLを書く必要を避けてクエリを修正する簡単な手段を提供します。キーワードを含むログを見つけることなどのフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを書きたいユーザーは、SQLエディタに切り替えることができます。適切なカラムが返され、`logs`がクエリタイプとして選択されている場合、結果はログとしてレンダリングされます。ログレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)にリストされています。

### ログからトレースへ {#logs-to-traces}

ログにトレースIDが含まれている場合、ユーザーは特定のログ行のトレースに移動することができます。

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## トレース {#traces}

上記のログ体験と同様に、Grafanaがトレースをレンダリングするために要求するカラムが満たされている場合（例：OTelスキーマを使用）、クエリビルダーは必要なクエリを自動的に作成できます。`Query Type: Traces`を選択し、`Run Query`をクリックすると、次のようなクエリが生成され、実行されます（構成されたカラムに応じて - 以下はOTelの使用を前提としています）。

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

このクエリは、Grafanaが期待するカラム名を返し、以下に示すようにトレースのテーブルをレンダリングします。期間やその他のカラムでのフィルタリングは、SQLを書く必要なく実行できます。

<Image img={observability_18} alt="Traces" size="lg" border/>

より複雑なクエリを書きたいユーザーは、`SQL Editor`に切り替えることができます。

### トレース詳細の表示 {#view-trace-details}

上記に示すように、トレースIDはクリック可能なリンクとしてレンダリングされます。トレースIDをクリックすると、ユーザーは`View Trace`リンクを介して関連するスパンを表示することを選択できます。これにより、必要な構造でスパンを取得するために次のクエリが発行され、結果がウォーターフォールとしてレンダリングされます。

```sql
WITH '<trace_id>' AS trace_id,
  (SELECT min(Start) FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_start,
  (SELECT max(End) + 1 FROM "default"."otel_traces_trace_id_ts"
    WHERE TraceId = trace_id) AS trace_end
SELECT "TraceId" AS traceID,
  "SpanId" AS spanID,
  "ParentSpanId" AS parentSpanID,
  "ServiceName" AS serviceName,
  "SpanName" AS operationName,
  "Timestamp" AS startTime,
  multiply("Duration", 0.000001) AS duration,
  arrayMap(key -> map('key', key, 'value',"SpanAttributes"[key]),
  mapKeys("SpanAttributes")) AS tags,
  arrayMap(key -> map('key', key, 'value',"ResourceAttributes"[key]),
  mapKeys("ResourceAttributes")) AS serviceTags
FROM "default"."otel_traces"
WHERE traceID = trace_id
  AND startTime >= trace_start
  AND startTime <= trace_end
LIMIT 1000
```

:::note
上記のクエリが、トレースIDのルックアップを行うためにマテリアライズドビュー`otel_traces_trace_id_ts`を使用していることに注意してください。詳細については[Accelerating Queries - Using Materialized views for lookups](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照してください。
:::

<Image img={observability_19} alt="Trace Details" size="lg" border/>

### トレースからログへ {#traces-to-logs}

ログにトレースIDが含まれている場合、ユーザーはトレースから関連するログに移動できます。ログを表示するには、トレースIDをクリックし、`View Logs`を選択します。これにより、デフォルトのOTelカラムを前提として次のクエリが発行されます。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="Traces to logs" size="lg" border/>

## ダッシュボード {#dashboards}

ユーザーは、ClickHouseデータソースを使用してGrafanaでダッシュボードを構築できます。さらに詳しい情報は、GrafanaとClickHouseの[データソースドキュメント](https://github.com/grafana/clickhouse-datasource)を推奨します。特に[マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)や[変数](https://grafana.com/docs/grafana/latest/dashboards/variables/)についてです。

このプラグインは、OTel仕様に準拠したログとトレースデータ用の例示ダッシュボードである「Simple ClickHouse OTel dashboarding」を含む、いくつかの標準ダッシュボードを提供します。これには、ユーザーがOTelのデフォルトカラム名に準拠する必要があり、データソースの設定からインストールできます。

<Image img={observability_21} alt="Dashboards" size="lg" border/>

以下に、可視化を構築するための簡単なヒントをいくつか提供します。

### 時系列 {#time-series}

統計と並んで、折れ線グラフは可観測性のユースケースで最も一般的な可視化形式です。ClickHouseプラグインは、クエリが`datetime`という名前の`time`と数値のカラムを返す場合、自動的に折れ線グラフをレンダリングします。例えば：

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

次の条件を満たす場合、クエリのためにマルチラインチャートが自動的にレンダリングされます。

- フィールド1：エイリアスとしてのtimeを持つdatetimeフィールド
- フィールド2：グループ化のための値。これは文字列である必要があります。
- フィールド3+：メトリック値

例えば：

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

### 地理情報データの可視化 {#visualizing-geo-data}

以前のセクションで示したように、IP辞書を使用して可観測性データに地理座標を付与することを検討しました。`latitude`および`longitude`のカラムを持っている場合、`geohashEncode`関数を使用して可観測性を可視化できます。これにより、GrafanaのGeo Mapチャートに対応したジオハッシュが生成されます。クエリと可視化の例を以下に示します。

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
