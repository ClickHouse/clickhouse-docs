---
title: Grafanaの使用
description: GrafanaとClickHouseを使用した可視性
slug: /observability/grafana
keywords: [可視性, ログ, トレース, メトリック, OpenTelemetry, Grafana, OTel]
---

# GrafanaとClickHouseを使用した可視性

Grafanaは、ClickHouseにおける可視性データのための好ましい可視化ツールを表します。これは、Grafana用の公式ClickHouseプラグインを使用することで実現されます。ユーザーは[こちら](/integrations/grafana)に記載されたインストール手順に従うことができます。

プラグインのV4では、ログとトレースが新しいクエリビルダー体験の中で第一級の市民となります。これにより、SREはSQLクエリを書く必要が最小限に抑えられ、SQLに基づく可視性が簡素化され、この新たなパラダイムの推進が進みます。この一環として、私たちはOpen Telemetry (OTel)をプラグインの中心に配置しています。私たちは、これが今後数年間のSQLに基づく可視性の基盤となり、データの収集方法となると信じています。

## Open Telemetry統合 {#open-telemetry-integration}

GrafanaにClickhouseデータソースを設定すると、プラグインはユーザーに対してログとトレースのためにデフォルトのデータベースとテーブルを指定することを許可し、これらのテーブルがOTelスキーマに準拠しているかどうかを指定できます。これにより、プラグインはGrafanaでの正しいログとトレースのレンダリングに必要なカラムを返すことができます。デフォルトのOTelスキーマに変更を加え、自分自身のカラム名を使用したい場合は、これを指定できます。時間（Timestamp）、ログレベル（SeverityText）、メッセージ本文（Body）などのデフォルトのOTelカラム名を使用する場合は、変更を加える必要はありません。

:::note HTTPまたはネイティブ
ユーザーは、HTTPまたはネイティブプロトコルを介してGrafanaをClickHouseに接続できます。後者は性能上の限られた利点を提供しますが、Grafanaユーザーが発行する集約クエリでは、その効果が実感されにくいです。逆に、HTTPプロトコルは通常、ユーザーがプロキシ処理やイントロスペクションを行う際に簡単です。
:::

ログが正しくレンダリングされるためには、Logs設定には時間、ログレベル、およびメッセージカラムが必要です。

Traces設定は少し複雑です（詳細なリストは[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要なカラムは、完全なトレースプロファイルを構築する後続のクエリが抽象化できるようにするために必要です。これらのクエリはデータがOTelと似たように構造化されていることを想定していますので、標準スキーマから大きく逸脱するユーザーはこの機能のメリットを享受するためにビューを使用する必要があります。

<a href={require('./images/observability-15.png').default} target="_blank">
  <img src={require('./images/observability-15.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '400px'}} />
</a>
<br />

設定が完了したら、ユーザーは[Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)に移動し、ログとトレースの検索を始めることができます。

## ログ {#logs}

Grafanaのログ要件に従う場合、ユーザーはクエリビルダーで`Query Type: Log`を選択し、`Run Query`をクリックできます。クエリビルダーはログをリストするクエリを形成し、それらが正しくレンダリングされることを保証します。例えば：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<a href={require('./images/observability-16.png').default} target="_blank">
  <img src={require('./images/observability-16.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

クエリビルダーはクエリを変更するための簡易な手段を提供し、ユーザーがSQLを書く必要を回避します。キーワードを含むログを見つけることなどのフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを作成したいユーザーは、SQLエディタに切り替えることができます。適切なカラムが返され、`logs`がクエリタイプとして選択されている限り、結果はログとしてレンダリングされます。ログレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)にリストされています。

### ログからトレースへ {#logs-to-traces}

ログにトレースIDが含まれている場合、ユーザーは特定のログ行に対してトレースをナビゲートすることができます。

<a href={require('./images/observability-17.png').default} target="_blank">
  <img src={require('./images/observability-17.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## トレース {#traces}

上記のログ体験と同様に、Grafanaがトレースをレンダリングするために必要なカラムが満たされている場合（例：OTelスキーマを使用）、クエリビルダーは必要なクエリを自動的に生成することができます。`Query Type: Traces`を選択し、`Run Query`をクリックすることで、以下のようなクエリが生成され、実行されます（設定されたカラムに依存します - 以下はOTelの使用を前提としています）：

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

このクエリはGrafanaが期待するカラム名を返し、次のようなトレースのテーブルをレンダリングします。期間や他のカラムに基づくフィルタリングは、SQLを書くことなく実行できます。

<a href={require('./images/observability-18.png').default} target="_blank">
  <img src={require('./images/observability-18.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

より複雑なクエリを作成したいユーザーは、`SQL Editor`に切り替えることができます。

### トレース詳細を表示 {#view-trace-details}

上記のように、トレースIDはクリック可能なリンクとしてレンダリングされます。トレースIDをクリックすると、ユーザーは関連するスパンを表示するために`View Trace`リンクを選択できます。これにより、以下のクエリ（OTelカラムを前提とする）が発行され、必要な構造でスパンを取得し、結果をウォーターフォールとしてレンダリングします。

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
上記のクエリが、トレースIDのルックアップを行うためにマテリアライズドビュー`otel_traces_trace_id_ts`を使用している点に注目してください。詳細は[Accelerating Queries - Using Materialized views for lookups](/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照してください。
:::

<a href={require('./images/observability-19.png').default} target="_blank">
  <img src={require('./images/observability-19.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### トレースからログへ {#traces-to-logs}

ログにトレースIDが含まれている場合、ユーザーはトレースから関連するログにナビゲートできます。ログを見るためにはトレースIDをクリックし、`View Logs`を選択します。これにより、デフォルトのOTelカラムを前提とした以下のクエリが発行されます。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<a href={require('./images/observability-20.png').default} target="_blank">
  <img src={require('./images/observability-20.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

## ダッシュボード {#dashboards}

ユーザーはClickHouseデータソースを使用してGrafanaにダッシュボードを構築できます。さらに詳しい情報については、GrafanaおよびClickHouseの[データソースドキュメント](https://github.com/grafana/clickhouse-datasource)を推奨します。特に[マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)と[変数](https://grafana.com/docs/grafana/latest/dashboards/variables/)について参照してください。

このプラグインは、OTel仕様に準拠したログおよびトレースデータのための「シンプルなClickHouse OTelダッシュボード」という例のダッシュボードを含む、いくつかの標準ダッシュボードを提供しています。これには、ユーザーがOTelのデフォルトカラム名に準拠する必要があり、データソース設定からインストール可能です。

<a href={require('./images/observability-21.png').default} target="_blank">
  <img src={require('./images/observability-21.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

以下に、可視化を構築するための簡単なヒントを提供します。

### 時系列 {#time-series}

統計とともに、折れ線グラフは可視性のユースケースで使用される最も一般的な可視化形式です。Clickhouseプラグインは、クエリが`datetime`として名付けられた`time`および数値カラムを返す場合に自動的に折れ線グラフをレンダリングします。例：

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

<a href={require('./images/observability-22.png').default} target="_blank">
  <img src={require('./images/observability-22.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### マルチラインチャート {#multi-line-charts}

マルチラインチャートは、以下の条件が満たされる場合に自動的にレンダリングされます：

- フィールド1：エイリアスがtimeのdatetimeフィールド
- フィールド2：グループ化するための値。これは文字列である必要があります。
- フィールド3+: メトリック値
 
例：

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

<a href={require('./images/observability-23.png').default} target="_blank">
  <img src={require('./images/observability-23.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />

### 地理データの可視化 {#visualizing-geo-data}

以前のセクションでIP辞書を使用して可視性データを地理座標で強化する方法を探りました。`latitude`および`longitude`カラムがあることを前提として、可視性は`geohashEncode`関数を使用して可視化できます。これにより、GrafanaのGeo Mapチャートと互換性のある地理ハッシュが生成されます。以下に例のクエリと可視化を示します。

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

<a href={require('./images/observability-24.png').default} target="_blank">
  <img src={require('./images/observability-24.png').default}    
    class="image"
    alt="NEEDS ALT"
    style={{width: '1450px'}} />
</a>
<br />
