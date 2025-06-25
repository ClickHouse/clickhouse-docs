---
'slug': '/integrations/marimo'
'sidebar_label': 'marimo'
'description': 'marimoはデータとやり取りするための次世代Pythonノートブックです。'
'title': 'ClickHouseとmarimoの使用方法'
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


# ClickHouseを使用したmarimoの利用

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/)は、SQLが組み込まれたオープンソースのリアクティブノートブックです。セルを実行したりUI要素と対話したりすると、marimoは影響を受けるセルを自動的に実行（または古くなったものとしてマーク）し、コードと出力を一貫性を持たせ、バグが発生する前に防ぎます。すべてのmarimoノートブックは純粋なPythonとして保存され、スクリプトとして実行可能で、アプリケーションとしてデプロイ可能です。

<Image img={marimo_connect} size="md" border alt="ClickHouseに接続" />

## 1. SQLサポートのあるmarimoのインストール {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
これにより、localhostで実行されているウェブブラウザが開きます。

## 2. ClickHouseへの接続 {#connect-to-clickhouse}

marimoエディタの左側にあるデータソースパネルに移動し、「データベースを追加」をクリックします。

<Image img={add_db_panel} size="sm" border alt="新しいデータベースを追加" />

データベースの詳細を入力するように求められます。

<Image img={add_db_details} size="md" border alt="データベースの詳細を入力" />

その後、接続を確立するために実行できるセルが表示されます。

<Image img={run_cell} size="md" border alt="ClickHouseに接続するためにセルを実行" />

## 3. SQLを実行 {#run-sql}

接続が設定されると、新しいSQLセルを作成し、clickhouseエンジンを選択できます。

<Image img={choose_sql_engine} size="md" border alt="SQLエンジンを選択" />

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

<Image img={results} size="lg" border alt="データフレーム内の結果" />

これで、データフレーム内の結果を表示できるようになります。特定のピックアップ地点からの最も高額なドロップオフを視覚化したいと思います。marimoはこれをサポートするためにいくつかのUIコンポーネントを提供しています。私はドロップダウンを使用して地点を選択し、altairを使用してチャートを作成します。

<Image img={dropdown_cell_chart} size="lg" border alt="ドロップダウン、テーブルおよびチャートの組み合わせ" />

marimoのリアクティブ実行モデルはSQLクエリにまで拡張されるため、SQLの変更は自動的に依存するセルの下流計算をトリガーします（またはオプションとして、高価な計算のためにセルを古くなったものとしてマークします）。そのため、クエリが更新されるとチャートとテーブルが変更されます。

アプリビューを切り替えてデータを探索するためのクリーンインターフェースを持つこともできます。

<Image img={run_app_view} size="md" border alt="アプリビューを実行" />
