---
title: Grafanaの使用
description: GrafanaとClickHouseを使用した可観測性
slug: /observability/grafana
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
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


# GrafanaとClickHouseを使用した可観測性

Grafanaは、ClickHouseにおける可観測性データのための推奨ビジュアライゼーションツールです。これは、Grafana用の公式ClickHouseプラグインを使用して達成されます。ユーザーは、[こちら](/integrations/grafana)にあるインストール手順に従うことができます。

プラグインのV4では、ログとトレースが新しいクエリビルダー体験の一級市民となります。これにより、SREがSQLクエリを書く必要が最小限になり、SQLベースの可観測性が簡素化され、この新興パラダイムの進展が促されます。その一環として、Open Telemetry (OTel) をプラグインの中心に配置しています。これは、今後数年間のSQLベースの可観測性の基盤となり、データの収集方法を決定すると信じています。

## Open Telemetry統合 {#open-telemetry-integration}

GrafanaでClickhouseデータソースを構成すると、プラグインはログとトレースのためのデフォルトのデータベースとテーブルを指定し、これらのテーブルがOTelスキーマに準拠しているかどうかをユーザーが指定できるようにします。これにより、Grafanaで正しいログとトレースのレンダリングに必要なカラムをプラグインが返すことができます。デフォルトのOTelスキーマに変更を加え、自分のカラム名を使用したい場合は、それらを指定することができます。時間（Timestamp）、ログレベル（SeverityText）、またはメッセージ本文（Body）などのデフォルトOTelカラム名を使用する場合は、変更は必要ありません。

:::note HTTPまたはネイティブ
ユーザーは、HTTPまたはネイティブプロトコルのいずれかを介してGrafanaをClickHouseに接続できます。後者は、Grafanaユーザーが発行する集約クエリで顕著なパフォーマンス向上を提供する可能性が低いです。対照的に、HTTPプロトコルは通常、ユーザーがプロキシや調査を行う際により単純です。
:::

ログが正しくレンダリングされるためには、ログレベル、時間、メッセージのカラムが必要です。

トレースの構成はやや複雑です（完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要なカラムは、完全なトレースプロファイルを構築する後続のクエリが抽象化できるようにするために必要です。これらのクエリは、データがOTelに似た構造であることを前提としているため、標準スキーマから大きく逸脱するユーザーは、ビューを使用してこの機能を活用する必要があります。

<a href={observability_15} target="_blank">
  <img src={observability_15}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '400px'}} />
</a>
<br />

構成が完了すると、ユーザーは[Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)に移動し、ログとトレースを検索し始めることができます。

## ログ {#logs}

Grafanaのログの要件に従っている場合、ユーザーはクエリビルダーで`Query Type: Log`を選択し、`Run Query`をクリックすることができます。クエリビルダーは、ログをリストするためのクエリを生成し、次のようにレンダリングされることを確認します。

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<a href={observability_16} target="_blank">
  <img src={observability_16}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

クエリビルダーはクエリを簡単に修正できる手段を提供し、ユーザーがSQLを書く必要を避けます。キーワードを含むログを見つけるなどのフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを記述したいユーザーは、SQLエディタに切り替えることができます。適切なカラムが返され、`logs`がQuery Typeとして選択されている限り、結果はログとしてレンダリングされます。ログレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)にリストされています。

### ログからトレースへ {#logs-to-traces}

ログにトレースIDが含まれている場合、ユーザーは特定のログ行のトレースをナビゲートすることができるメリットがあります。

<a href={observability_17} target="_blank">
  <img src={observability_17}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## トレース {#traces}

上記のログ体験と同様に、Grafanaがトレースをレンダリングするために必要なカラムが満たされている場合（例えば、OTelスキーマを使用している場合）、クエリビルダーは自動的に必要なクエリを形成することができます。`Query Type: Traces`を選択し、`Run Query`をクリックすると、次のようなクエリが生成され、実行されます（設定されたカラムによります - 次の例はOTelの使用を前提としています）。

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

このクエリは、Grafanaによって期待されるカラム名を返し、次のようにトレースのテーブルをレンダリングします。期間や他のカラムでのフィルタリングは、SQLを書く必要なしに実行できます。

<a href={observability_18} target="_blank">
  <img src={observability_18}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

より複雑なクエリを書きたいユーザーは、`SQL Editor`に切り替えることができます。

### トレースの詳細を表示 {#view-trace-details}

上記のように、トレースIDはクリック可能なリンクとしてレンダリングされます。トレースIDをクリックすると、ユーザーはリンク`View Trace`を通じて関連するスパンを表示することを選択できます。これは、必要な構造でスパンを取得するために次のクエリを発行します（OTelカラムを前提としています）。

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
上記のクエリがトレースIDの検索を行うためにマテリアライズドビュー`otel_traces_trace_id_ts`を使用していることに注意してください。詳しくは、[Accelerating Queries - マテリアライズドビューを使用したルックアップ](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照してください。
:::

<a href={observability_19} target="_blank">
  <img src={observability_19}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### トレースからログへ {#traces-to-logs}

ログにトレースIDが含まれている場合、ユーザーはトレースから関連するログにナビゲートすることができます。ログを表示するには、トレースIDをクリックし、`View Logs`を選択します。これは、デフォルトOTelカラムを前提とした次のクエリを発行します。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<a href={observability_20} target="_blank">
  <img src={observability_20}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## ダッシュボード {#dashboards}

ユーザーは、ClickHouseデータソースを使用してGrafanaにダッシュボードを構築できます。詳細については、GrafanaとClickHouseの[data source documentation](https://github.com/grafana/clickhouse-datasource)を推奨します。特に[マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)や[変数](https://grafana.com/docs/grafana/latest/dashboards/variables/)について確認してください。

プラグインは、OTel仕様に準拠したログおよびトレースデータ用のシンプルなClickHouse OTelダッシュボードの例を含む、いくつかの既製のダッシュボードを提供します。これは、ユーザーがOTelのデフォルトカラム名に準拠する必要があり、データソース構成からインストールできます。

<a href={observability_21} target="_blank">
  <img src={observability_21}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

以下に、ビジュアライゼーションを構築するためのいくつかの簡単なヒントを提供します。

### 時系列 {#time-series}

統計とともに、折れ線グラフは可観測性ユースケースで最も一般的な視覚化形式です。Clickhouseプラグインは、クエリが`datetime`型の`time`という名前のカラムと数値型のカラムを返す場合、自動的に折れ線グラフをレンダリングします。例えば：

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

<a href={observability_22} target="_blank">
  <img src={observability_22}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### マルチラインチャート {#multi-line-charts}

次の条件が満たされる場合、マルチラインチャートは自動的にレンダリングされます：

- フィールド1：エイリアスが`time`のdatetimeフィールド
- フィールド2：グループ化する値。これは文字列である必要があります。
- フィールド3以上：メトリック値

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

<a href={observability_23} target="_blank">
  <img src={observability_23}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### 地理データの視覚化 {#visualizing-geo-data}

前のセクションでは、IP辞書を使用して可観測性データを地理座標で強化する方法を探りました。`latitude`および`longitude`カラムがある場合、可観測性は`geohashEncode`関数を使用して視覚化できます。これにより、Grafana Geo Mapチャートに対応したジオハッシュが生成されます。以下に例のクエリと視覚化を示します。

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

<a href={observability_24} target="_blank">
  <img src={observability_24}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />
