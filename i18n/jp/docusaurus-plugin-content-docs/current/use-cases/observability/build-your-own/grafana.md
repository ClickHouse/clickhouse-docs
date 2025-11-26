---
title: 'Grafana の活用'
description: 'Grafana と ClickHouse を用いた可観測性'
slug: /observability/grafana
keywords: ['可観測性', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
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


# オブザーバビリティに Grafana と ClickHouse を使用する

Grafana は、ClickHouse におけるオブザーバビリティデータのための推奨可視化ツールです。これは、Grafana 向け公式 ClickHouse プラグインを使用することで実現されます。ユーザーは、[こちら](/integrations/grafana) にあるインストール手順に従うことができます。

このプラグインの v4 では、新しいクエリビルダーのエクスペリエンスにおいて、ログとトレースが第一級の存在として扱われます。これにより、SRE が SQL クエリを書く必要性が最小限になり、SQL ベースのオブザーバビリティが簡素化され、この新たなパラダイムをさらに前進させます。
この一環として、プラグインの中心に OpenTelemetry (OTel) を据えています。これは、今後数年にわたって SQL ベースのオブザーバビリティの基盤となり、データ収集の在り方を規定していくと考えているためです。



## OpenTelemetry Integration {#open-telemetry-integration}

Grafana で ClickHouse のデータソースを設定する際、プラグインではログとトレース用のデフォルトのデータベースおよびテーブル、さらにそれらのテーブルが OTel スキーマに準拠しているかどうかを指定できます。これにより、プラグインは Grafana でログとトレースを正しく表示するために必要なカラムを返せます。デフォルトの OTel スキーマを変更しており、独自のカラム名を使用したい場合は、それらを指定することも可能です。time（`Timestamp`）、log level（`SeverityText`）、message body（`Body`）といったカラムでデフォルトの OTel カラム名を使用している場合は、変更を加える必要はありません。

:::note HTTP or Native
ユーザーは、Grafana を ClickHouse に HTTP プロトコルまたは Native プロトコルのいずれかで接続できます。後者はわずかな性能上の利点がありますが、Grafana ユーザーが発行する集約クエリでは体感できない可能性が高いです。一方、HTTP プロトコルは一般的にプロキシ設定や挙動の確認が容易です。
:::

Logs の設定では、ログを正しく表示するために time、log level、message の各カラムが必要です。

Traces の設定はやや複雑です（完全な一覧は[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要となるカラムは、その後に実行されるクエリが完全なトレースプロファイルを構築できるように抽象化するために必要です。これらのクエリは、データが OTel と同様の構造になっていることを前提としているため、標準スキーマから大きく逸脱しているユーザーは、この機能を活用するためにビューを使用する必要があります。

<Image img={observability_15} alt="コネクタ設定" size="sm"/>

設定が完了したら、ユーザーは [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) に移動して、ログとトレースの検索を開始できます。



## Logs

ログに関する Grafana の要件を満たしている場合、ユーザーはクエリビルダーで `Query Type: Log` を選択し、`Run Query` をクリックできます。クエリビルダーはログを一覧表示するためのクエリを作成し、ログがたとえば次のようにレンダリングされることを保証します。

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="コネクターログの設定" size="lg" border />

クエリビルダーは、ユーザーが SQL を記述することなくクエリを変更できる、シンプルな手段を提供します。キーワードを含むログの検索を含めたフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを書きたい場合は、SQL エディタに切り替えることができます。適切な列が返され、かつ Query Type として `logs` が選択されていれば、結果はログとしてレンダリングされます。ログのレンダリングに必要な列は[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)に一覧があります。

### Logs から traces へ

ログに trace ID が含まれている場合、ユーザーは特定のログ行から対応するトレースへ遷移できます。

<Image img={observability_17} alt="Logs から traces へ" size="lg" border />


## トレース

上記のログの場合と同様に、Grafana がトレースを描画するために必要とするカラムが満たされていれば（たとえば OTel スキーマを使用することで）、クエリビルダーは必要なクエリを自動的に組み立てることができます。`Query Type: Traces` を選択し、`Run Query` をクリックすると、次のようなクエリが生成されて実行されます（設定しているカラムによって内容は異なります。以下は OTel を使用していることを前提としています）。

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

このクエリは Grafana が想定するカラム名を返し、以下のようなトレースのテーブルをレンダリングします。duration やその他のカラムでのフィルタリングは、SQL を記述する必要なく実行できます。

<Image img={observability_18} alt="Traces" size="lg" border />

より複雑なクエリを記述したいユーザーは、`SQL Editor` に切り替えることができます。

### トレース詳細の表示

上記のように、トレース ID はクリック可能なリンクとして表示されます。トレース ID をクリックすると、ユーザーは `View Trace` リンクから関連するスパンを表示することを選択できます。これは、必要な構造でスパンを取得するために（OTel のカラムを前提として）次のクエリを実行し、結果をウォーターフォールとしてレンダリングします。

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
上記のクエリでは、トレース ID のルックアップを行うためにマテリアライズドビュー `otel_traces_trace_id_ts` を使用している点に注意してください。詳細については、[クエリの高速化 - ルックアップにマテリアライズドビューを使用する](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups) を参照してください。
:::

<Image img={observability_19} alt="トレースの詳細" size="lg" border />

### トレースからログへ

ログにトレース ID が含まれている場合、ユーザーはトレースから関連するログへ遷移できます。ログを表示するには、トレース ID をクリックし、`View Logs` を選択します。これは、デフォルトの OTel カラムを前提として次のクエリを実行します。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="トレースからログへ" size="lg" border />


## ダッシュボード

ユーザーは ClickHouse データソースを用いて Grafana でダッシュボードを構築できます。詳細については、特に [マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) や [変数](https://grafana.com/docs/grafana/latest/dashboards/variables/) について、Grafana と ClickHouse の [データソースに関するドキュメント](https://github.com/grafana/clickhouse-datasource) を参照することを推奨します。

このプラグインには、OTel 仕様に準拠したログおよびトレースデータ向けのサンプルダッシュボード「Simple ClickHouse OTel dashboarding」を含む、いくつかの標準ダッシュボードがあらかじめ用意されています。これを利用するには、ユーザー側で OTel のデフォルト列名に準拠する必要があり、データソースの設定画面からインストールできます。

<Image img={observability_21} alt="Dashboards" size="lg" border />

以下に、可視化を作成する際の簡単なヒントをいくつか示します。

### 時系列

統計と並んで、折れ線グラフはオブザーバビリティのユースケースで最も一般的に使用される可視化形式です。クエリが `time` という名前の `datetime` 列と数値列を返した場合、ClickHouse プラグインは自動的に折れ線グラフを描画します。たとえば次のようになります。

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

<Image img={observability_22} alt="時系列" size="lg" border />

### 複数系列チャート

以下の条件を満たしている場合、クエリに対して複数系列チャートが自動的にレンダリングされます。

* フィールド 1: エイリアスが `time` の datetime フィールド
* フィールド 2: グループ化対象の値。String 型である必要があります。
* フィールド 3 以降: メトリックの値

例:

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

<Image img={observability_23} alt="複数行チャート" size="lg" border />

### 地理データの可視化

これまでのセクションでは、IP 辞書を使用してオブザーバビリティデータを位置情報（ジオ座標）で拡充する方法について説明しました。`latitude` と `longitude` 列があると仮定すると、`geohashEncode` 関数を使用してオブザーバビリティデータを可視化できます。これは Grafana の Geo Map チャートと互換性のあるジオハッシュを生成します。以下にクエリ例と可視化例を示します。

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

<Image img={observability_24} alt="地理データの可視化" size="lg" border />
