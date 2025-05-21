---
'slug': '/integrations/marimo'
'sidebar_label': 'marimo'
'description': 'marimo 是一个与数据交互的下一代 Python 笔记本'
'title': '使用 marimo 与 ClickHouse'
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


# 使用 marimo 与 ClickHouse

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) 是一个开源的带有内置 SQL 的响应式 Python 笔记本。当你运行一个单元格或与 UI 元素交互时，marimo 会自动运行受影响的单元格（或将其标记为过期），保持代码和输出的一致性，并在问题发生之前避免错误。每个 marimo 笔记本都作为纯 Python 存储，可以作为脚本执行，并可以作为应用程序部署。

<Image img={marimo_connect} size="md" border alt="连接到 ClickHouse" />

## 1. 安装支持 SQL 的 marimo {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
这将打开一个在 localhost 上运行的网页浏览器。

## 2. 连接到 ClickHouse {#connect-to-clickhouse}

在 marimo 编辑器左侧的 数据源 面板中，点击 '添加数据库'。

<Image img={add_db_panel} size="sm" border alt="添加新数据库" />

系统将提示你填写数据库详细信息。

<Image img={add_db_details} size="md" border alt="填写数据库详细信息" />

然后你将有一个可以运行的单元格，以建立连接。

<Image img={run_cell} size="md" border alt="运行单元格以连接到 ClickHouse" />

## 3. 运行 SQL {#run-sql}

一旦你建立了连接，你可以创建一个新的 SQL 单元格并选择 clickhouse 引擎。

<Image img={choose_sql_engine} size="md" border alt="选择 SQL 引擎" />

在本指南中，我们将使用纽约出租车数据集。

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

<Image img={results} size="lg" border alt="数据框中的结果" />

现在，你可以在数据框中查看结果。我想可视化从给定接载地点出发的最昂贵的掉头。marimo 提供多个 UI 组件来帮助你。我将使用一个下拉菜单选择地点，并使用 altair 进行图表绘制。

<Image img={dropdown_cell_chart} size="lg" border alt="下拉菜单、表格和图表的组合" />

marimo 的响应式执行模型扩展到 SQL 查询，因此对 SQL 的更改将自动触发下游计算以支持依赖的单元格（或者可选择将单元格标记为过期以进行昂贵计算）。因此，当查询更新时，图表和表格会发生变化。

你还可以切换应用视图，以便拥有一个干净的界面来探索你的数据。

<Image img={run_app_view} size="md" border alt="运行应用视图" />
