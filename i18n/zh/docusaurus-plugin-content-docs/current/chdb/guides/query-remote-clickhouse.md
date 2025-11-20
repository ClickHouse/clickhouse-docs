---
title: '如何查询远程 ClickHouse 服务器'
sidebar_label: '查询远程 ClickHouse'
slug: /chdb/guides/query-remote-clickhouse
description: '在本指南中，我们将学习如何使用 chDB 查询远程 ClickHouse 服务器。'
keywords: ['chdb', 'clickhouse']
doc_type: 'guide'
---

在本指南中，我们将学习如何使用 chDB 查询远程 ClickHouse 服务器。



## 设置 {#setup}

首先创建一个虚拟环境:

```bash
python -m venv .venv
source .venv/bin/activate
```

现在安装 chDB。
请确保版本为 2.0.2 或更高版本:

```bash
pip install "chdb>=2.0.2"
```

接下来安装 pandas 和 ipython:

```bash
pip install pandas ipython
```

我们将使用 `ipython` 来运行本指南后续部分的命令,可以通过以下命令启动:

```bash
ipython
```

您也可以在 Python 脚本或您常用的 notebook 中使用这些代码。


## ClickPy 简介 {#an-intro-to-clickpy}

我们将要查询的远程 ClickHouse 服务器是 [ClickPy](https://clickpy.clickhouse.com)。
ClickPy 跟踪所有 PyPI 包的下载情况,并允许您通过 UI 界面浏览包的统计信息。
底层数据库可使用 `play` 用户进行查询。

您可以在 [其 GitHub 仓库](https://github.com/ClickHouse/clickpy) 中了解更多关于 ClickPy 的信息。


## 查询 ClickPy ClickHouse 服务 {#querying-the-clickpy-clickhouse-service}

让我们导入 chDB：

```python
import chdb
```

我们将使用 `remoteSecure` 函数来查询 ClickPy。
该函数至少需要主机名、表名和用户名这三个参数。

我们可以编写以下查询，以 Pandas DataFrame 的形式返回 [`openai` 包](https://clickpy.clickhouse.com/dashboard/openai)的每日下载量：

```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com',
  'pypi.pypi_downloads_per_day',
  'play'
)
WHERE project = 'openai'
GROUP BY x
ORDER BY x ASC
"""

openai_df = chdb.query(query, "DataFrame")
openai_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

现在让我们用同样的方式返回 [`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn) 的下载量：

```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com',
  'pypi.pypi_downloads_per_day',
  'play'
)
WHERE project = 'scikit-learn'
GROUP BY x
ORDER BY x ASC
"""

sklearn_df = chdb.query(query, "DataFrame")
sklearn_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```


## 合并 Pandas DataFrames {#merging-pandas-dataframes}

现在我们有两个 DataFrames,可以基于日期(即 `x` 列)将它们合并,如下所示:

```python
df = openai_df.merge(
  sklearn_df,
  on="x",
  suffixes=("_openai", "_sklearn")
)
df.head(n=5)
```

```text
            x  y_openai  y_sklearn
0  2018-02-26        83      33971
1  2018-02-27        31      25211
2  2018-02-28         8      26023
3  2018-03-01         8      20912
4  2018-03-02         5      23842
```

然后我们可以计算 OpenAI 下载量与 `scikit-learn` 下载量的比率,如下所示:

```python
df['ratio'] = df['y_openai'] / df['y_sklearn']
df.head(n=5)
```

```text
            x  y_openai  y_sklearn     ratio
0  2018-02-26        83      33971  0.002443
1  2018-02-27        31      25211  0.001230
2  2018-02-28         8      26023  0.000307
3  2018-03-01         8      20912  0.000383
4  2018-03-02         5      23842  0.000210
```


## 查询 Pandas DataFrames {#querying-pandas-dataframes}

接下来,假设我们想要找出比率最优和最差的日期。
我们可以回到 chDB 来计算这些值:

```python
chdb.query("""
SELECT max(ratio) AS bestRatio,
       argMax(x, ratio) AS bestDate,
       min(ratio) AS worstRatio,
       argMin(x, ratio) AS worstDate
FROM Python(df)
""", "DataFrame")
```

```text
   bestRatio    bestDate  worstRatio   worstDate
0   0.693855  2024-09-19    0.000003  2020-02-09
```

如果您想了解更多关于查询 Pandas DataFrames 的信息,请参阅 [Pandas DataFrames 开发者指南](querying-pandas.md)。
