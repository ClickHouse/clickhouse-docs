---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimo はデータと対話的にやり取りするための次世代の Python ノートブックです'
title: 'ClickHouse で marimo を使う'
doc_type: 'guide'
keywords: ['marimo', 'ノートブック', 'データ分析', 'python', '可視化']
integration:
  - support_level: 'コミュニティ'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import marimo_connect from '@site/static/images/integrations/sql-clients/marimo/clickhouse-connect.gif';
import add_db_panel from '@site/static/images/integrations/sql-clients/marimo/panel-arrow.png';
import add_db_details from '@site/static/images/integrations/sql-clients/marimo/add-db-details.png';
import run_cell from '@site/static/images/integrations/sql-clients/marimo/run-cell.png';
import choose_sql_engine from '@site/static/images/integrations/sql-clients/marimo/choose-sql-engine.png';
import results from '@site/static/images/integrations/sql-clients/marimo/results.png';
import dropdown_cell_chart from '@site/static/images/integrations/sql-clients/marimo/dropdown-cell-chart.png';
import run_app_view from '@site/static/images/integrations/sql-clients/marimo/run-app-view.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse で marimo を使う \{#using-marimo-with-clickhouse\}

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) は、SQL が組み込まれた Python 向けのオープンソースのリアクティブノートブックです。セルを実行したり UI 要素を操作したりすると、marimo は影響を受けるセルを自動的に再実行（または古い状態としてマーク）し、コードと出力の整合性を保つことで、不具合の発生を未然に防ぎます。すべての marimo ノートブックはプレーンな Python コードとして保存されており、スクリプトとして実行でき、アプリとしてデプロイすることもできます。

<Image img={marimo_connect} size="md" border alt="ClickHouse に接続" />

## 1. SQL サポート対応の marimo をインストールする \{#install-marimo-sql\}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```

これで、localhost 上のページを表示するウェブブラウザが開きます。


## 2. ClickHouse へ接続する \{#connect-to-clickhouse\}

marimo エディター左側のデータソースパネルに移動し、「Add database」をクリックします。

<Image img={add_db_panel} size="sm" border alt="新しいデータベースを追加" />

データベースの詳細を入力するように求められます。

<Image img={add_db_details} size="md" border alt="データベースの詳細を入力" />

その後、接続を確立するために実行できるセルが追加されます。

<Image img={run_cell} size="md" border alt="セルを実行して ClickHouse に接続" />

## 3. SQL を実行する \{#run-sql\}

接続を確立したら、新しい SQL セルを作成し、ClickHouse エンジンを選択できます。

<Image img={choose_sql_engine} size="md" border alt="SQL エンジンを選択" />

このガイドでは、New York Taxi データセットを使用します。

```sql
CREATE TABLE trips (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO trips
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_0.gz',
    'TabSeparatedWithNames'
);
```

```sql
SELECT * FROM trips LIMIT 1000;
```

<Image img={results} size="lg" border alt="データフレームでの結果" />

これで、結果をデータフレームで確認できるようになりました。ここでは、特定の乗車地点からの、最も高額な料金が発生した降車を可視化したいとします。marimo には、そのために役立ついくつかの UI コンポーネントが用意されています。ロケーションの選択にはドロップダウンを使い、チャート描画には altair を使用します。

<Image img={dropdown_cell_chart} size="lg" border alt="ドロップダウン、テーブル、チャートの組み合わせ" />

marimo のリアクティブな実行モデルは SQL クエリにも適用されるため、SQL を変更すると、それに依存するセルの後続の計算処理が自動的にトリガーされます（あるいは、コストの高い計算についてはセルを古い状態としてマークすることもできます）。そのため、クエリを更新するとチャートとテーブルも自動的に更新されます。

また、App View に切り替えて、データ探索用のすっきりしたインターフェイスで表示することもできます。

<Image img={run_app_view} size="md" border alt="App View の実行" />
