---
title: '如何使用 chDB 查询 Apache Arrow'
sidebar_label: '查询 Apache Arrow'
slug: /chdb/guides/apache-arrow
description: '本指南将介绍如何使用 chDB 查询 Apache Arrow 表'
keywords: ['chdb', 'Apache Arrow']
doc_type: 'guide'
---

[Apache Arrow](https://arrow.apache.org/) 是一种标准化的列式内存格式，在数据领域中已获得广泛认可。
在本指南中，我们将学习如何使用 `python` 表函数来查询 Apache Arrow。

## 设置 \\{#setup\\}

我们先来创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

现在我们来安装 chDB。
请确保已安装的版本为 2.0.2 或更高：

```bash
pip install "chdb>=2.0.2"
```

现在我们来安装 PyArrow、pandas 和 IPython：

```bash
pip install pyarrow pandas ipython
```

接下来我们将使用 `ipython` 来运行本指南其余部分中的命令。你可以通过运行以下命令来启动它：

```bash
ipython
```

你也可以在 Python 脚本或常用的 Notebook 环境中使用这段代码。

## 从文件创建 Apache Arrow 表 \\{#creating-an-apache-arrow-table-from-a-file\\}

让我们首先使用 [AWS CLI 工具](https://aws.amazon.com/cli/) 下载 [Ookla 数据集](https://github.com/teamookla/ookla-open-data) 中的一个 Parquet 文件：

```bash
aws s3 cp \
  --no-sign \
  s3://ookla-open-data/parquet/performance/type=mobile/year=2023/quarter=2/2023-04-01_performance_mobile_tiles.parquet .
```

:::note
如果需要下载更多文件，可以使用 `aws s3 ls` 列出所有文件，然后相应地更新上述命令。
:::

接下来，我们将从 `pyarrow` 包中导入 Parquet 模块：

```python
import pyarrow.parquet as pq
```

接下来，我们可以将 Parquet 文件读取到 Apache Arrow 表中：

```python
arrow_table = pq.read_table("./2023-04-01_performance_mobile_tiles.parquet")
```

架构如下所示：

```python
arrow_table.schema
```

```text
quadkey: string
tile: string
tile_x: double
tile_y: double
avg_d_kbps: int64
avg_u_kbps: int64
avg_lat_ms: int64
avg_lat_down_ms: int32
avg_lat_up_ms: int32
tests: int64
devices: int64
```

我们可以通过调用 `shape` 属性来获取行数和列数：

```python
arrow_table.shape
```

```text
(3864546, 11)
```

## 查询 Apache Arrow \\{#querying-apache-arrow\\}

现在让我们从 chDB 查询该 Arrow 表。
首先，导入 chDB：

```python
import chdb
```

接下来我们可以查看该表的结构：

```python
chdb.query("""
DESCRIBE Python(arrow_table)
SETTINGS describe_compact_output=1
""", "DataFrame")
```

```text
               name     type
0           quadkey   String
1              tile   String
2            tile_x  Float64
3            tile_y  Float64
4        avg_d_kbps    Int64
5        avg_u_kbps    Int64
6        avg_lat_ms    Int64
7   avg_lat_down_ms    Int32
8     avg_lat_up_ms    Int32
9             tests    Int64
10          devices    Int64
```

我们还可以计算行数：

```python
chdb.query("SELECT count() FROM Python(arrow_table)", "DataFrame")
```

```text
   count()
0  3864546
```

现在，我们来做一件更有趣的事情。
下面的查询会排除 `quadkey` 和 `tile.*` 列，然后对其余所有列计算平均值和最大值：

```python
chdb.query("""
WITH numericColumns AS (
  SELECT * EXCEPT ('tile.*') EXCEPT(quadkey)
  FROM Python(arrow_table)
)
SELECT * APPLY(max), * APPLY(avg) APPLY(x -> round(x, 2))
FROM numericColumns
""", "Vertical")
```

```text
Row 1:
──────
max(avg_d_kbps):                4155282
max(avg_u_kbps):                1036628
max(avg_lat_ms):                2911
max(avg_lat_down_ms):           2146959360
max(avg_lat_up_ms):             2146959360
max(tests):                     111266
max(devices):                   1226
round(avg(avg_d_kbps), 2):      84393.52
round(avg(avg_u_kbps), 2):      15540.4
round(avg(avg_lat_ms), 2):      41.25
round(avg(avg_lat_down_ms), 2): 554355225.76
round(avg(avg_lat_up_ms), 2):   552843178.3
round(avg(tests), 2):           6.31
round(avg(devices), 2):         2.88
```
