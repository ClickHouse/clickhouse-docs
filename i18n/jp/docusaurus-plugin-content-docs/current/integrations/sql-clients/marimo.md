---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimo はデータと対話的に扱うための次世代 Python ノートブックです'
title: 'ClickHouse での marimo の利用'
doc_type: 'guide'
keywords: ['marimo', 'notebook', 'data analysis', 'python', 'visualization']
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


# ClickHouse での marimo の利用

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) は、SQL が組み込まれた Python 向けのオープンソースのリアクティブノートブックです。セルを実行したり UI 要素を操作したりすると、marimo は影響を受けるセルを自動的に再実行（または古い状態としてマーク）し、コードと出力の整合性を保つことで、バグの発生を未然に防ぎます。すべての marimo ノートブックは純粋な Python として保存され、スクリプトとして実行でき、アプリとしてデプロイ可能です。

<Image img={marimo_connect} size="md" border alt="ClickHouse に接続" />



## 1. SQLサポート付きmarimoのインストール {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```

これによりlocalhost上で動作するWebブラウザが開きます。


## 2. ClickHouseへの接続 {#connect-to-clickhouse}

marimoエディタの左側にあるデータソースパネルに移動し、「Add database」をクリックします。

<Image img={add_db_panel} size='sm' border alt='新しいデータベースを追加' />

データベースの詳細情報の入力が求められます。

<Image
  img={add_db_details}
  size='md'
  border
  alt='データベースの詳細情報を入力'
/>

接続を確立するために実行できるセルが表示されます。

<Image
  img={run_cell}
  size='md'
  border
  alt='セルを実行してClickHouseに接続'
/>


## 3. SQLの実行 {#run-sql}

接続を設定したら、新しいSQLセルを作成し、clickhouseエンジンを選択します。

<Image img={choose_sql_engine} size='md' border alt='SQLエンジンの選択' />

このガイドでは、New York Taxiデータセットを使用します。

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

<Image img={results} size='lg' border alt='データフレームでの結果表示' />

これで、結果をデータフレームで表示できるようになりました。ここでは、特定の乗車地点から最も料金の高い降車地点を可視化します。marimoは、これを支援する複数のUIコンポーネントを提供しています。ここでは、ドロップダウンで地点を選択し、altairでグラフを作成します。

<Image
  img={dropdown_cell_chart}
  size='lg'
  border
  alt='ドロップダウン、テーブル、グラフの組み合わせ'
/>

marimoのリアクティブ実行モデルはSQLクエリにも拡張されているため、SQLの変更は依存するセルの下流計算を自動的にトリガーします(または、コストの高い計算の場合はオプションでセルを古いものとしてマークします)。そのため、クエリが更新されるとグラフとテーブルも変更されます。

また、App Viewに切り替えることで、データ探索のためのクリーンなインターフェースを利用できます。

<Image img={run_app_view} size='md' border alt='アプリビューの実行' />
