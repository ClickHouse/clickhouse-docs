---
title: 'Grafana の利用'
description: 'オブザーバビリティにおける Grafana と ClickHouse の活用'
slug: /observability/grafana
keywords: ['Observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
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


# Observability に Grafana と ClickHouse を使用する

Grafana は、ClickHouse における Observability データのための推奨可視化ツールです。これは Grafana 向け公式 ClickHouse プラグインを利用することで実現されます。インストール手順は [こちら](/integrations/grafana) を参照してください。

プラグインの v4 では、新しいクエリビルダーエクスペリエンスにおいて、ログとトレースが第一級のデータとして扱われます。これにより、SRE が SQL クエリを書く必要性が最小限となり、SQL ベースの Observability がよりシンプルになり、この新たなパラダイムの推進につながります。
この取り組みの一環として、OpenTelemetry (OTel) をプラグインの中核に据えています。今後数年にわたり、これが SQL ベースの Observability の基盤となり、データの収集方法を形作っていくと考えているためです。



## OpenTelemetry統合 {#open-telemetry-integration}

GrafanaでClickHouseデータソースを設定する際、プラグインではログとトレース用のデフォルトデータベースとテーブル、およびこれらのテーブルがOTelスキーマに準拠しているかどうかを指定できます。これにより、プラグインはGrafanaでログとトレースを正しく表示するために必要なカラムを返すことができます。デフォルトのOTelスキーマに変更を加えて独自のカラム名を使用したい場合は、それらを指定することができます。時刻（`Timestamp`）、ログレベル（`SeverityText`）、メッセージ本文（`Body`）などのカラムにデフォルトのOTelカラム名を使用している場合、変更を加える必要はありません。

:::note HTTPまたはNative
ユーザーはHTTPプロトコルまたはNativeプロトコルのいずれかを使用してGrafanaをClickHouseに接続できます。Nativeプロトコルはわずかなパフォーマンス上の利点を提供しますが、Grafanaユーザーが発行する集計クエリでは体感できる可能性は低いです。一方、HTTPプロトコルは通常、ユーザーがプロキシや検査を行う際により簡単です。
:::

ログ設定では、ログを正しく表示するために、時刻、ログレベル、メッセージのカラムが必要です。

トレース設定はやや複雑です（完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要なカラムは、完全なトレースプロファイルを構築する後続のクエリを抽象化できるようにするために必要です。これらのクエリはデータがOTelと同様に構造化されていることを前提としているため、標準スキーマから大きく逸脱しているユーザーは、この機能を利用するためにビューを使用する必要があります。

<Image img={observability_15} alt='コネクタ設定' size='sm' />

設定が完了すると、ユーザーは[Grafana Explore](https://grafana.com/docs/grafana/latest/explore/)に移動して、ログとトレースの検索を開始できます。


## ログ {#logs}

Grafanaのログ要件に準拠する場合、ユーザーはクエリビルダーで`Query Type: Log`を選択し、`Run Query`をクリックします。クエリビルダーはログを一覧表示するクエリを生成し、以下のように適切にレンダリングされるようにします。

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt='コネクタログ設定' size='lg' border />

クエリビルダーを使用すると、SQLを記述することなく簡単にクエリを変更できます。キーワードを含むログの検索などのフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを記述する場合は、SQLエディタに切り替えることができます。適切なカラムが返され、Query Typeとして`logs`が選択されていれば、結果はログとしてレンダリングされます。ログのレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)に記載されています。

### ログからトレースへ {#logs-to-traces}

ログにトレースIDが含まれている場合、特定のログ行から対応するトレースに移動できるため、利便性が向上します。

<Image img={observability_17} alt='ログからトレースへ' size='lg' border />


## トレース {#traces}

上記のログ機能と同様に、Grafanaがトレースをレンダリングするために必要なカラムが満たされている場合（例：OTelスキーマを使用）、クエリビルダーは必要なクエリを自動的に生成できます。`Query Type: Traces`を選択し、`Run Query`をクリックすると、以下のようなクエリが生成され実行されます（設定されたカラムに依存します - 以下はOTelの使用を想定しています）：

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

このクエリはGrafanaが期待するカラム名を返し、以下に示すようなトレースのテーブルをレンダリングします。期間やその他のカラムでのフィルタリングは、SQLを記述することなく実行できます。

<Image img={observability_18} alt='Traces' size='lg' border />

より複雑なクエリを記述したいユーザーは、`SQL Editor`に切り替えることができます。

### トレース詳細の表示 {#view-trace-details}

上記のように、トレースIDはクリック可能なリンクとしてレンダリングされます。トレースIDをクリックすると、ユーザーは`View Trace`リンクを介して関連するスパンを表示できます。これにより、以下のクエリ（OTelカラムを想定）が発行され、必要な構造でスパンを取得し、結果をウォーターフォール形式でレンダリングします。

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
上記のクエリがマテリアライズドビュー`otel_traces_trace_id_ts`を使用してトレースIDの検索を実行していることに注目してください。詳細については、[クエリの高速化 - 検索のためのマテリアライズドビューの使用](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照してください。
:::

<Image img={observability_19} alt='Trace Details' size='lg' border />

### トレースからログへ {#traces-to-logs}

ログにトレースIDが含まれている場合、ユーザーはトレースから関連するログに移動できます。ログを表示するには、トレースIDをクリックして`View Logs`を選択します。これにより、デフォルトのOTelカラムを想定した以下のクエリが発行されます。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt='Traces to logs' size='lg' border />


## ダッシュボード {#dashboards}

ユーザーはClickHouseデータソースを使用してGrafanaでダッシュボードを構築できます。詳細については、GrafanaとClickHouseの[データソースドキュメント](https://github.com/grafana/clickhouse-datasource)、特に[マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros)と[変数](https://grafana.com/docs/grafana/latest/dashboards/variables/)を参照することを推奨します。

このプラグインは、OTel仕様に準拠したログおよびトレースデータ用のサンプルダッシュボード「Simple ClickHouse OTel dashboarding」を含む、複数のすぐに使えるダッシュボードを提供します。これを使用するには、OTelのデフォルトカラム名に準拠する必要があり、データソース設定からインストールできます。

<Image img={observability_21} alt='Dashboards' size='lg' border />

以下では、可視化を構築するためのいくつかの簡単なヒントを提供します。

### 時系列 {#time-series}

統計と並んで、折れ線グラフはオブザーバビリティのユースケースで最も一般的に使用される可視化形式です。ClickHouseプラグインは、クエリが`time`という名前の`datetime`と数値カラムを返す場合、自動的に折れ線グラフをレンダリングします。例：

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

<Image img={observability_22} alt='Time series' size='lg' border />

### 複数線グラフ {#multi-line-charts}

以下の条件を満たす場合、クエリに対して複数線グラフが自動的にレンダリングされます：

- フィールド1：timeという別名を持つdatetimeフィールド
- フィールド2：グループ化する値。これは文字列型である必要があります。
- フィールド3以降：メトリック値

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

<Image img={observability_23} alt='Multi-line charts' size='lg' border />

### 地理データの可視化 {#visualizing-geo-data}

前のセクションでは、IP辞書を使用してオブザーバビリティデータに地理座標を付加する方法を探りました。`latitude`と`longitude`カラムがある場合、`geohashEncode`関数を使用してオブザーバビリティデータを可視化できます。これにより、Grafana Geo Mapチャートと互換性のあるジオハッシュが生成されます。以下にクエリと可視化の例を示します：

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

<Image img={observability_24} alt='Visualizing geo data' size='lg' border />
