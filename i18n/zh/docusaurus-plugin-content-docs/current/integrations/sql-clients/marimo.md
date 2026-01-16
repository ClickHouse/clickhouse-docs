---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimo 是用于数据交互的下一代 Python notebook'
title: '将 marimo 与 ClickHouse 搭配使用'
doc_type: 'guide'
keywords: ['marimo', 'notebook', '数据分析', 'python', '可视化']
integration:
  - support_level: 'community'
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

# 将 marimo 与 ClickHouse 配合使用 \{#using-marimo-with-clickhouse\}

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) 是一个开源的 Python 响应式 notebook，内置 SQL。每当你运行某个单元格或与某个 UI 元素交互时，marimo 会自动运行受影响的单元格（或将其标记为需重新运行），以保持代码与输出的一致性，并提前避免错误。每个 marimo notebook 都以纯 Python 代码形式存储，可以作为脚本执行，也可以部署为应用。

<Image img={marimo_connect} size="md" border alt="连接到 ClickHouse" />

## 1. 安装支持 SQL 的 marimo \\{#install-marimo-sql\\}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```

这会在本机（localhost）打开一个浏览器窗口。


## 2. 连接到 ClickHouse。 \\{#connect-to-clickhouse\\}

在 marimo 编辑器左侧进入数据源面板，点击 “Add database”。

<Image img={add_db_panel} size="sm" border alt="添加新数据库" />

系统会提示你填写数据库详细信息。

<Image img={add_db_details} size="md" border alt="填写数据库详细信息" />

随后你将获得一个可运行的代码单元格，用于建立连接。

<Image img={run_cell} size="md" border alt="运行单元格以连接到 ClickHouse" />

## 3. 运行 SQL \\{#run-sql\\}

在设置好连接之后，你可以创建一个新的 SQL 单元格，并选择 ClickHouse 引擎。

<Image img={choose_sql_engine} size="md" border alt="选择 SQL 引擎" />

在本指南中，我们将使用 New York Taxi 数据集。

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

现在，你可以在 dataframe 中查看结果了。接下来，我们希望从给定的上车地点中可视化费用最高的下车点。marimo 提供了多个 UI 组件来帮助实现这一点。我将使用一个下拉列表来选择地点，并使用 Altair 进行可视化绘图。

<Image img={dropdown_cell_chart} size="lg" border alt="下拉菜单、表格和图表的组合" />

marimo 的响应式执行模型同样适用于 SQL 查询，因此对 SQL 的更改会自动触发依赖单元格的下游计算（或者可选地将单元格标记为过期，以控制高成本计算的刷新）。因此，当查询更新时，图表和表格也会随之变化。

你也可以切换到 App View，以获得一个简洁的界面来探索你的数据。

<Image img={run_app_view} size="md" border alt="运行应用视图" />
