---
'slug': '/integrations/marimo'
'sidebar_label': 'marimo'
'description': 'marimo 是一个与数据交互的下一代 Python 笔记本'
'title': 'Using marimo with ClickHouse'
'doc_type': 'guide'
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


# ClickHouseとmarimoの使用

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) は、SQLが組み込まれたオープンソースのリアクティブノートブックで、Python用です。セルを実行したりUI要素と対話したりすると、marimoは影響を受けたセルを自動的に実行し（またはそれらを古くなったとマークし）、コードと出力を一貫性のあるものに保ち、バグが発生する前に防ぎます。すべてのmarimoノートブックは純粋なPythonとして保存され、スクリプトとして実行可能で、アプリとしてデプロイ可能です。

<Image img={marimo_connect} size="md" border alt="ClickHouseに接続" />

## 1. SQLサポート付きのmarimoをインストールする {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
これにより、localhostで動作しているWebブラウザが開かれるはずです。

## 2. ClickHouseに接続する {#connect-to-clickhouse}

marimoエディタの左側のデータソースパネルに移動し、「データベースを追加」をクリックします。

<Image img={add_db_panel} size="sm" border alt="新しいデータベースを追加" />

データベースの詳細を入力するように求められます。

<Image img={add_db_details} size="md" border alt="データベースの詳細を入力" />

次に、接続を確立するために実行できるセルがあります。

<Image img={run_cell} size="md" border alt="ClickHouseに接続するためのセルを実行" />

## 3. SQLを実行する {#run-sql}

接続を設定したら、新しいSQLセルを作成し、clickhouseエンジンを選択できます。

<Image img={choose_sql_engine} size="md" border alt="SQLエンジンを選択" />

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

<Image img={results} size="lg" border alt="データフレーム内の結果" />

これで、データフレーム内の結果を表示できるようになりました。指定したピックアップ位置からの最も高価なドロップオフを可視化したいと思います。marimoは、これを助けるためのいくつかのUIコンポーネントを提供します。私は、場所を選択するためにドロップダウンと、チャートを作成するためにaltairを使用します。

<Image img={dropdown_cell_chart} size="lg" border alt="ドロップダウン、テーブル、チャートの組み合わせ" />

marimoのリアクティブ実行モデルはSQLクエリにまで拡張されるため、SQLの変更は依存セルの下流計算を自動的にトリガーします（またはオプションで計算が高価なためセルを古くなったとマークします）。したがって、クエリを更新するとチャートとテーブルが変わります。

データを探索するためのクリーンなインターフェースを持つApp Viewに切り替えることもできます。

<Image img={run_app_view} size="md" border alt="アプリ表示を実行" />
