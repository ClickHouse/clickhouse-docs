---
title: 'Grafanaの使用'
description: 'GrafanaとClickHouseを使った可観測性のための使用法'
slug: /observability/grafana
keywords: ['可観測性', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
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


# GrafanaとClickHouseを使った可観測性

Grafanaは、ClickHouseにおける可観測性データのための主要な可視化ツールです。これは、Grafana用の公式ClickHouseプラグインを使用することで実現されます。ユーザーは、[こちら](/integrations/grafana)で見つけられるインストール手順に従うことができます。

プラグインのV4は、ログとトレースを新しいクエリビルダーの体験においてファーストクラスの市民にします。これにより、SREがSQLクエリを書く必要が最小限に抑えられ、SQLベースの可観測性が簡素化され、この新興パラダイムが前進します。このアプローチの一部は、Open Telemetry (OTel)をプラグインの中心に置くことです。私たちはこれが、今後数年間のSQLベースの可観測性の基盤であり、データがどのように収集されるかとなると考えています。

## Open Telemetry統合 {#open-telemetry-integration}

GrafanaでClickhouseデータソースを構成すると、プラグインはユーザーに、ログとトレースのためのデフォルトのデータベースとテーブル、これらのテーブルがOTelスキーマに準拠するかどうかを指定することを許可します。これにより、Grafanaで正しいログとトレースのレンダリングに必要なカラムをプラグインが返すことが可能になります。デフォルトのOTelスキーマに変更を加え、自分自身のカラム名を使用することを好むユーザーは、それを指定できます。時間 (Timestamp)、ログレベル (SeverityText)、またはメッセージ本文 (Body)などのデフォルトのOTelカラム名を使用することで、変更は必要ありません。

:::note HTTPまたはNative
ユーザーは、HTTPまたはNativeプロトコルを介してGrafanaをClickHouseに接続できます。後者は、Grafanaユーザーが発行する集約クエリでは顕著なパフォーマンスの利点がない可能性があります。一方で、HTTPプロトコルは通常、ユーザーがプロキシし観察するのがより簡単です。
:::

ログ構成には、ログが正しくレンダリングされるために時間、ログレベル、およびメッセージカラムが必要です。

トレース構成は若干複雑です（完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要なカラムは、完全なトレースプロファイルを構築する後続のクエリが抽象化できるようにするために必要です。これらのクエリは、データがOTelに似た構造になっていると仮定しますので、標準スキーマから大きく逸脱するユーザーは、この機能を活用するためにビューを使用する必要があります。

<Image img={observability_15} alt="コネクター設定" size="sm"/>

構成が完了したら、ユーザーは[Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)に移動し、ログとトレースの検索を開始できます。

## ログ {#logs}

Grafanaのログ要件に従う場合、ユーザーはクエリビルダーで`Query Type: Log`を選択し、`Run Query`をクリックできます。クエリビルダーがログをリストするためのクエリを作成し、正しくレンダリングされることを保証します。例えば：

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="コネクターのログ設定" size="lg" border/>

クエリビルダーは、ユーザーがSQLを書く必要を避けるシンプルな手段を提供します。フィルタリングやキーワードを含むログの検索もクエリビルダーから実行できます。より複雑なクエリを書きたいユーザーは、SQLエディタに切り替えることができます。適切なカラムが返され、`logs`がクエリタイプとして選択されている限り、結果はログとしてレンダリングされます。ログレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)にリストされています。

### ログからトレースへ {#logs-to-traces}

ログにトレースIDが含まれている場合、ユーザーは特定のログ行のトレースに移動することができます。

<Image img={observability_17} alt="ログからトレースへ" size="lg" border/>

## トレース {#traces}

上記のログ体験に類似して、Grafanaがトレースをレンダリングするために必要なカラムが満たされている場合（例：OTelスキーマを使用）、クエリビルダーは必要なクエリを自動的に生成できます。`Query Type: Traces`を選択し、`Run Query`をクリックすると、次のようなクエリが生成されて実行されます（設定されたカラムによります - 次のクエリはOTelの使用を想定しています）：

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

このクエリは、Grafanaが期待するカラム名を返し、次のようにトレースのテーブルをレンダリングします。持続時間や他のカラムでのフィルタリングが、SQLを書くことなく行えます。

<Image img={observability_18} alt="トレース" size="lg" border/>

より複雑なクエリを書きたいユーザーは、`SQL Editor`に切り替えることができます。

### トレース詳細の表示 {#view-trace-details}

上記のように、トレースIDはクリック可能なリンクとしてレンダリングされます。トレースIDをクリックすると、ユーザーは関連するスパンを表示するために`View Trace`リンクを選択できます。これにより、以下のクエリが発行され（OTelカラムを仮定）、必要な構造でスパンを取得し、結果をウォーターフォールとしてレンダリングします。

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
上記のクエリが、トレースIDルックアップを行うためにマテリアライズドビュー`otel_traces_trace_id_ts`を使用していることに注意してください。[クエリの高速化 - マテリアライズドビューを使用したルックアップ](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照して詳細を確認してください。
:::

<Image img={observability_19} alt="トレース詳細" size="lg" border/>

### トレースからログへ {#traces-to-logs}

ログにトレースIDが含まれている場合、ユーザーはトレースから関連するログに移動できます。ログを見るにはトレースIDをクリックし、`View Logs`を選択します。デフォルトのOTelカラムを仮定した場合、次のクエリが発行されます。

```sql
SELECT Timestamp as "timestamp",
  Body as "body", SeverityText as "level",
  TraceId as "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="トレースからログへ" size="lg" border/>

## ダッシュボード {#dashboards}

ユーザーはClickHouseデータソースを使用してGrafanaでダッシュボードを構築できます。詳細については、GrafanaとClickHouseの[データソースドキュメント](https://github.com/grafana/clickhouse-datasource)をお勧めします。特に、[マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)と[変数](https://grafana.com/docs/grafana/latest/dashboards/variables/)に注意してください。

プラグインは、OTel仕様に準拠したロギングとトレースデータ用のサンプルダッシュボード「Simple ClickHouse OTelダッシュボード」を含む、いくつかの即使用可能なダッシュボードを提供します。これは、ユーザーがOTelのデフォルトのカラム名に準拠する必要があり、データソース設定からインストールできます。

<Image img={observability_21} alt="ダッシュボード" size="lg" border/>

以下に、視覚化を構築するための簡単なヒントを提供します。

### 時系列 {#time-series}

統計とともに、折れ線グラフは可観測性のユースケースで最も一般的な視覚化形式です。Clickhouseプラグインは、クエリが`datetime`型の`time`という名前のカラムと数値カラムを返すと、自動的に折れ線グラフをレンダリングします。例：

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

<Image img={observability_22} alt="時系列" size="lg" border/>

### マルチラインチャート {#multi-line-charts}

マルチラインチャートは、以下の条件が満たされている場合に自動的にレンダリングされます：

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

<Image img={observability_23} alt="マルチラインチャート" size="lg" border/>

### 地理データの視覚化 {#visualizing-geo-data}

以前のセクションで、IPディクショナリを使用して可観測性データに地理座標を付加する方法を探求しました。`latitude`と`longitude`カラムがあると仮定すると、`geohashEncode`関数を使用して可観測性を視覚化できます。これにより、Grafana Geo Mapチャートに互換性のある地理ハッシュが生成されます。以下に例のクエリと視覚化を示します：

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

<Image img={observability_24} alt="地理データの視覚化" size="lg" border/>
