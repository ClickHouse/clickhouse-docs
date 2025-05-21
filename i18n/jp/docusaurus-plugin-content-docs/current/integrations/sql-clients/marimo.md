---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimoはデータと対話するための次世代Pythonノートブックです'
title: 'ClickHouseとmarimoを使用する'
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


# ClickHouseとmarimoを使用する

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/)は、SQLが組み込まれたオープンソースのリアクティブノートブックです。セルを実行したり、UI要素と対話したりすると、marimoは自動的に影響を受けるセルを実行（またはそれらを期限切れとしてマーク）し、コードと出力を一貫性を保ち、バグが発生する前に防ぎます。すべてのmarimoノートブックは純粋なPythonとして保存され、スクリプトとして実行可能で、アプリとしてデプロイ可能です。

<Image img={marimo_connect} size="md" border alt="ClickHouseに接続する" />

## 1. SQLサポート付きのmarimoをインストールする {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
これにより、localhostで実行されているウェブブラウザが開くはずです。

## 2. ClickHouseに接続する {#connect-to-clickhouse}

marimoエディタの左側にあるデータソースパネルに移動し、「データベースを追加」をクリックします。

<Image img={add_db_panel} size="sm" border alt="新しいデータベースを追加する" />

データベースの詳細を入力するように求められます。

<Image img={add_db_details} size="md" border alt="データベースの詳細を入力する" />

その後、接続を確立するために実行できるセルが表示されます。

<Image img={run_cell} size="md" border alt="ClickHouseに接続するためのセルを実行する" />

## 3. SQLを実行する {#run-sql}

接続を設定したら、新しいSQLセルを作成し、ClickHouseエンジンを選択できます。

<Image img={choose_sql_engine} size="md" border alt="SQLエンジンを選択する" />

このガイドでは、ニューヨークタクシーデータセットを使用します。

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

<Image img={results} size="lg" border alt="データフレームの結果" />

これで、データフレームで結果を表示できるようになりました。特定のピックアップ場所からの最も高額なドロップオフを視覚化したいと思います。marimoは、これを支援するためのいくつかのUIコンポーネントを提供しています。場所を選択するためにドロップダウンを使用し、チャート作成にはAltairを使用します。

<Image img={dropdown_cell_chart} size="lg" border alt="ドロップダウン、テーブル、チャートの組み合わせ" />

marimoのリアクティブ実行モデルはSQLクエリにも広がるため、SQLの変更は自動的に依存セルの下流計算をトリガーします（またはオプションで、コストのかかる計算を行うセルを期限切れとしてマークします）。したがって、クエリが更新されると、チャートとテーブルが変更されます。

アプリビューを切り替えて、データを探索するためのクリーンなインターフェースを持つこともできます。

<Image img={run_app_view} size="md" border alt="アプリビューを実行する" />
