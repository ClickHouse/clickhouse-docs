---
title: 'Grafana の使用'
description: '可観測性における Grafana と ClickHouse の活用'
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


# 観測性のための Grafana と ClickHouse の利用

Grafana は、ClickHouse における観測性データの推奨可視化ツールです。これは、Grafana 向け公式 ClickHouse プラグインを使用して実現します。インストール手順は[こちら](/integrations/grafana)を参照してください。

プラグインのバージョン 4 では、新しいクエリビルダーにおいてログとトレースが第一級の存在として扱われます。これにより、SRE が SQL クエリを書く必要性を最小限に抑え、SQL ベースの観測性を簡素化し、この新たなパラダイムを一段と推し進めます。
この一環として、プラグインの中核に OpenTelemetry (OTel) を据えています。これは、今後数年にわたって SQL ベースの観測性の基盤となり、データ収集のあり方を形作ると考えているためです。

## OpenTelemetry の統合 {#open-telemetry-integration}

Grafana で ClickHouse のデータソースを設定する際、プラグインではログおよびトレース用のデフォルトのデータベースとテーブル、さらにこれらのテーブルが OTel スキーマに準拠しているかどうかも指定できます。これにより、Grafana でログとトレースを正しくレンダリングするために必要なカラムをプラグインが返せるようになります。デフォルトの OTel スキーマに変更を加えており、独自のカラム名を使用したい場合は、それらを指定できます。`Timestamp`（時刻）、`SeverityText`（ログレベル）、`Body`（メッセージ本文）などのデフォルトの OTel カラム名を使用している場合は、変更を行う必要はありません。

:::note HTTP or Native
ユーザーは Grafana を HTTP プロトコルまたは Native プロトコルのいずれかで ClickHouse に接続できます。後者はわずかなパフォーマンス上の利点を提供しますが、Grafana ユーザーによって発行される集約クエリでは体感できない可能性が高いです。対照的に、HTTP プロトコルは、プロキシ経由での利用やトラフィックの検査が一般的により簡単です。
:::

Logs 設定では、ログを正しくレンダリングするために、時刻、ログレベル、およびメッセージのカラムが必要です。

Traces 設定はやや複雑です（完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)）。ここで必要となるカラムは、その後に実行される、完全なトレースプロファイルを構築するクエリを抽象化するために必要なものです。これらのクエリはデータが OTel と同様の構造になっていることを前提としているため、標準スキーマから大きく逸脱しているユーザーは、この機能の利点を得るためにビューを使用する必要があります。

<Image img={observability_15} alt="Connector config" size="sm"/>

設定が完了したら、ユーザーは [Grafana Explore](https://grafana.com/docs/grafana/latest/explore/) に移動し、ログおよびトレースの検索を開始できます。

## ログ

ログに関する Grafana の要件に準拠している場合は、クエリビルダーで `Query Type: Log` を選択し、`Run Query` をクリックします。するとクエリビルダーがログを一覧表示するためのクエリを生成し、たとえば次のようにログが表示されるようにします。

```sql
SELECT Timestamp as timestamp, Body as body, SeverityText as level, TraceId as traceID FROM "default"."otel_logs" WHERE ( timestamp >= $__fromTime AND timestamp <= $__toTime ) ORDER BY timestamp DESC LIMIT 1000
```

<Image img={observability_16} alt="コネクタのログ設定" size="lg" border />

クエリビルダーは、ユーザーがSQLを記述せずにクエリを簡単に変更できる手段を提供します。キーワードを含むログの検索を含めたフィルタリングは、クエリビルダーから実行できます。より複雑なクエリを記述したいユーザーは、SQLエディタに切り替えることができます。適切なカラムが返され、かつ Query Type として `logs` が選択されていれば、結果はログとしてレンダリングされます。ログのレンダリングに必要なカラムは[こちら](https://grafana.com/developers/plugin-tools/tutorials/build-a-logs-data-source-plugin#logs-data-frame-format)に記載されています。


### ログからトレースへ {#logs-to-traces}

ログにトレース ID が含まれている場合、ユーザーは特定のログ行から対応するトレースへ遷移できると便利です。

<Image img={observability_17} alt="Logs to traces" size="lg" border/>

## トレース

上記のログと同様に、Grafana がトレースを描画するために必要とする列が揃っていれば（たとえば OTel スキーマを使用することで）、クエリビルダーは必要なクエリを自動的に組み立てることができます。`Query Type: Traces` を選択して `Run Query` をクリックすると、次のようなクエリが（設定している列に応じて）生成および実行されます（以下は OTel を使用していることを前提としています）。

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

このクエリは、Grafana が想定する列名を返し、下図のようなトレースのテーブルを表示します。継続時間やその他の列でのフィルタリングは、SQL を書かずに行えます。

<Image img={observability_18} alt="Traces" size="lg" border />

より複雑なクエリを記述したいユーザーは、`SQL Editor` に切り替えることができます。


### トレースの詳細を表示する

上記のとおり、トレース ID はクリック可能なリンクとして表示されます。トレース ID をクリックすると、ユーザーは `View Trace` リンクから関連するスパンを表示できます。これにより（OTel のカラムを前提として）、必要な構造でスパンを取得するための次のクエリが実行され、結果はウォーターフォール形式でレンダリングされます。

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
上記のクエリでは、マテリアライズドビュー `otel_traces_trace_id_ts` を使用してトレース ID のルックアップを行っていることに注目してください。詳しくは、[クエリの高速化 - ルックアップにマテリアライズドビューを使用する](/use-cases/observability/schema-design#using-materialized-views-incremental--for-fast-lookups)を参照してください。
:::

<Image img={observability_19} alt="トレースの詳細" size="lg" border />


### トレースからログへの遷移

ログにトレース ID が含まれている場合、ユーザーはトレースから関連するログへ遷移できます。ログを表示するには、トレース ID をクリックして `View Logs` を選択します。これにより、デフォルトの OTel 列を前提として次のクエリが実行されます。

```sql
SELECT Timestamp AS "timestamp",
  Body AS "body", SeverityText AS "level",
  TraceId AS "traceID" FROM "default"."otel_logs"
WHERE ( traceID = '<trace_id>' )
ORDER BY timestamp ASC LIMIT 1000
```

<Image img={observability_20} alt="トレースからログへの切り替え" size="lg" border />


## ダッシュボード {#dashboards}

ユーザーは ClickHouse データソースを利用して、Grafana 上にダッシュボードを構築できます。詳細については、特に [マクロの概念](https://github.com/grafana/clickhouse-datasource?tab=readme-ov-file#macros) や [変数](https://grafana.com/docs/grafana/latest/dashboards/variables/) について、Grafana および ClickHouse の [データソースドキュメント](https://github.com/grafana/clickhouse-datasource) を参照することを推奨します。

このプラグインはいくつかの標準ダッシュボードを提供しており、その中には OTel 仕様に準拠したログおよびトレースデータ向けのサンプルダッシュボード「Simple ClickHouse OTel dashboarding」も含まれます。これを利用するには、ユーザー側のデータが OTel のデフォルト列名に準拠している必要があり、データソース設定からインストールできます。

<Image img={observability_21} alt="Dashboards" size="lg" border/>

以下に、可視化を作成する際の簡単なヒントをいくつか示します。

### 時系列

統計情報と並んで、折れ線グラフはオブザーバビリティのユースケースにおいて最も一般的な可視化形式です。ClickHouse プラグインは、クエリが `time` という名前の `datetime` 型列と数値列を返した場合、自動的に折れ線グラフをレンダリングします。例えば次のとおりです。

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


### マルチラインチャート

次の条件を満たすクエリでは、自動的にマルチラインチャートがレンダリングされます。

* フィールド 1: `time` というエイリアスを持つ `datetime` フィールド
* フィールド 2: グループ化に使用する値。これは `String` 型である必要があります。
* フィールド 3 以降: メトリクス値

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

<Image img={observability_23} alt="複数の折れ線チャート" size="lg" border />


### 地理データの可視化

前のセクションでは、IP 辞書を用いて地理座標を付与し、オブザーバビリティデータを拡充する方法について説明しました。`latitude` と `longitude` の列がある前提で、`geohashEncode` 関数を使うことで、オブザーバビリティデータを可視化に利用できます。これにより、Grafana の Geo Map チャートと互換性のあるジオハッシュが生成されます。以下に、クエリと可視化の例を示します。

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
