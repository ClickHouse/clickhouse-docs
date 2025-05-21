---
'title': '如何使用chDB查询Apache Arrow'
'sidebar_label': '查询Apache Arrow'
'slug': '/chdb/guides/apache-arrow'
'description': '在本指南中，我们将学习如何使用chDB查询Apache Arrow表'
'keywords':
- 'chdb'
- 'Apache Arrow'
---



[Apache Arrow](https://arrow.apache.org/) 是一种标准化的面向列的内存格式，在数据社区中越来越受欢迎。
在本指南中，我们将学习如何使用 `Python` 表函数查询 Apache Arrow。

## 设置 {#setup}

首先，我们创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来，我们将安装 chDB。
确保您安装的版本是 2.0.2 或更高：

```bash
pip install "chdb>=2.0.2"
```

现在我们将安装 PyArrow、pandas 和 ipython：

```bash
pip install pyarrow pandas ipython
```

我们将使用 `ipython` 在本指南的剩余部分运行命令，您可以通过运行以下命令启动它：

```bash
ipython
```

您也可以在 Python 脚本或您喜欢的笔记本中使用代码。

## 从文件创建 Apache Arrow 表 {#creating-an-apache-arrow-table-from-a-file}

首先，我们下载 [Ookla 数据集](https://github.com/teamookla/ookla-open-data) 中的一个 Parquet 文件，使用 [AWS CLI 工具](https://aws.amazon.com/cli/)：

```bash
aws s3 cp \
  --no-sign \
  s3://ookla-open-data/parquet/performance/type=mobile/year=2023/quarter=2/2023-04-01_performance_mobile_tiles.parquet .
```

:::note
如果您想下载更多文件，请使用 `aws s3 ls` 获取所有文件的列表，然后更新上述命令。
:::

接下来，我们将从 `pyarrow` 包中导入 Parquet 模块：

```python
import pyarrow.parquet as pq
```

然后我们可以将 Parquet 文件读取为 Apache Arrow 表：

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

我们可以通过调用 `shape` 属性获取行和列的数量：

```python
arrow_table.shape
```

```text
(3864546, 11)
```

## 查询 Apache Arrow {#querying-apache-arrow}

现在让我们从 chDB 查询 Arrow 表。
首先，导入 chDB：

```python
import chdb
```

然后我们可以描述该表：

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

我们还可以计算行的数量：

```python
chdb.query("SELECT count() FROM Python(arrow_table)", "DataFrame")
```

```text
   count()
0  3864546
```

现在，让我们做一些更有趣的事情。
以下查询排除了 `quadkey` 和 `tile.*` 列，然后计算所有剩余列的平均值和最大值：

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
