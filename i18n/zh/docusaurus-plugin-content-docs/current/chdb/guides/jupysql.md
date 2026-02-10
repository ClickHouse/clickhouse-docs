---
title: 'JupySQL 和 chDB'
sidebar_label: 'JupySQL'
slug: /chdb/guides/jupysql
description: '如何为 Bun 安装 chDB'
keywords: ['chdb', 'JupySQL']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import PlayersPerRank from '@site/static/images/chdb/guides/players_per_rank.png';

[JupySQL](https://jupysql.ploomber.io/en/latest/quick-start.html) 是一个 Python 库，用于在 Jupyter Notebook 和 IPython shell 中运行 SQL。
在本指南中，我们将学习如何使用 chDB 和 JupySQL 来查询数据。

<div class="vimeo-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/2wjl3OijCto?si=EVf2JhjS5fe4j6Cy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
</div>

## 环境准备 \{#setup\}

首先创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来，我们将安装 JupySQL、IPython 和 Jupyter Lab：

```bash
pip install jupysql ipython jupyterlab
```

我们可以在 IPython 中使用 JupySQL，并可通过运行以下命令来启动：

```bash
ipython
```

或者在 JupyterLab 中运行：

```bash
jupyter lab
```

:::note
如果你使用的是 Jupyter Lab，在继续阅读本指南其余内容之前，需要先创建一个 notebook。
:::

## 下载数据集 \{#downloading-a-dataset\}

我们将使用 [Jeff Sackmann 的 tennis&#95;atp](https://github.com/JeffSackmann/tennis_atp) 其中一个数据集，其中包含关于球员及其排名随时间变化的元数据。
首先下载排名文件：

```python
from urllib.request import urlretrieve
```

```python
files = ['00s', '10s', '20s', '70s', '80s', '90s', 'current']
base = "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master"
for file in files:
  _ = urlretrieve(
    f"{base}/atp_rankings_{file}.csv",
    f"atp_rankings_{file}.csv",
  )
```

## 配置 chDB 和 JupySQL \{#configuring-chdb-and-jupysql\}

接下来，让我们导入 chDB 的 `dbapi` 模块：

```python
from chdb import dbapi
```

然后我们将创建一个 chDB 连接。
我们持久化的任何数据都会保存到 `atp.chdb` 目录中：

```python
conn = dbapi.connect(path="atp.chdb")
```

现在我们来加载 `sql` 魔法命令，并建立与 chDB 的连接：

```python
%load_ext sql
%sql conn --alias chdb
```

接下来，我们将提高显示上限，以免查询结果被截断：

```python
%config SqlMagic.displaylimit = None
```

## 在 CSV 文件中查询数据 \{#querying-data-in-csv-files\}

我们已经下载了一批带有 `atp_rankings` 前缀的文件。
让我们使用 `DESCRIBE` 子句来了解其表结构（schema）：

```python
%%sql
DESCRIBE file('atp_rankings*.csv')
SETTINGS describe_compact_output=1,
         schema_inference_make_columns_nullable=0
```

```text
+--------------+-------+
|     name     |  type |
+--------------+-------+
| ranking_date | Int64 |
|     rank     | Int64 |
|    player    | Int64 |
|    points    | Int64 |
+--------------+-------+
```

我们也可以直接对这些文件执行 `SELECT` 查询，来查看其中的数据：

```python
%sql SELECT * FROM file('atp_rankings*.csv') LIMIT 1
```

```text
+--------------+------+--------+--------+
| ranking_date | rank | player | points |
+--------------+------+--------+--------+
|   20000110   |  1   | 101736 |  4135  |
+--------------+------+--------+--------+
```

数据格式有点奇怪。
我们来整理一下这个日期，并使用 `REPLACE` 子句返回整理后的 `ranking_date`：

```python
%%sql
SELECT * REPLACE (
  toDate(parseDateTime32BestEffort(toString(ranking_date))) AS ranking_date
)
FROM file('atp_rankings*.csv')
LIMIT 10
SETTINGS schema_inference_make_columns_nullable=0
```

```text
+--------------+------+--------+--------+
| ranking_date | rank | player | points |
+--------------+------+--------+--------+
|  2000-01-10  |  1   | 101736 |  4135  |
|  2000-01-10  |  2   | 102338 |  2915  |
|  2000-01-10  |  3   | 101948 |  2419  |
|  2000-01-10  |  4   | 103017 |  2184  |
|  2000-01-10  |  5   | 102856 |  2169  |
|  2000-01-10  |  6   | 102358 |  2107  |
|  2000-01-10  |  7   | 102839 |  1966  |
|  2000-01-10  |  8   | 101774 |  1929  |
|  2000-01-10  |  9   | 102701 |  1846  |
|  2000-01-10  |  10  | 101990 |  1739  |
+--------------+------+--------+--------+
```

## 将 CSV 文件导入 chDB \{#querying-data-in-csv-files\}

现在我们要把这些 CSV 文件中的数据存储到一张表中。
默认的数据库不会将数据持久化到磁盘，因此我们需要先创建一个新的数据库：

```python
%sql CREATE DATABASE atp
```

现在我们要创建一个名为 `rankings` 的表，其表结构将根据 CSV 文件中数据的结构推断而来：

```python
%%sql
CREATE TABLE atp.rankings
ENGINE=MergeTree
ORDER BY ranking_date AS
SELECT * REPLACE (
  toDate(parseDateTime32BestEffort(toString(ranking_date))) AS ranking_date
)
FROM file('atp_rankings*.csv')
SETTINGS schema_inference_make_columns_nullable=0
```

我们先简单检查一下表中的数据：

```python
%sql SELECT * FROM atp.rankings LIMIT 10
```

```text
+--------------+------+--------+--------+
| ranking_date | rank | player | points |
+--------------+------+--------+--------+
|  2000-01-10  |  1   | 101736 |  4135  |
|  2000-01-10  |  2   | 102338 |  2915  |
|  2000-01-10  |  3   | 101948 |  2419  |
|  2000-01-10  |  4   | 103017 |  2184  |
|  2000-01-10  |  5   | 102856 |  2169  |
|  2000-01-10  |  6   | 102358 |  2107  |
|  2000-01-10  |  7   | 102839 |  1966  |
|  2000-01-10  |  8   | 101774 |  1929  |
|  2000-01-10  |  9   | 102701 |  1846  |
|  2000-01-10  |  10  | 101990 |  1739  |
+--------------+------+--------+--------+
```

看起来不错——输出结果如预期，与直接查询 CSV 文件时相同。

我们接下来要对球员元数据执行相同的流程。
这次所有数据都在一个单个的 CSV 文件中，所以先下载该文件：

```python
_ = urlretrieve(
    f"{base}/atp_players.csv",
    "atp_players.csv",
)
```

然后基于该 CSV 文件的内容创建一个名为 `players` 的表。
我们还将对 `dob` 字段进行规范化处理，将其转换为 `Date32` 类型。

> 在 ClickHouse 中，`Date` 类型仅支持从 1970 年开始的日期。由于 `dob` 列包含 1970 年之前的日期，因此我们将改用 `Date32` 类型。

```python
%%sql
CREATE TABLE atp.players
Engine=MergeTree
ORDER BY player_id AS
SELECT * REPLACE (
  makeDate32(
    toInt32OrNull(substring(toString(dob), 1, 4)),
    toInt32OrNull(substring(toString(dob), 5, 2)),
    toInt32OrNull(substring(toString(dob), 7, 2))
  )::Nullable(Date32) AS dob
)
FROM file('atp_players.csv')
SETTINGS schema_inference_make_columns_nullable=0
```

运行完成后，就可以查看已经摄取的数据：

```python
%sql SELECT * FROM atp.players LIMIT 10
```

```text
+-----------+------------+-----------+------+------------+-----+--------+-------------+
| player_id | name_first | name_last | hand |    dob     | ioc | height | wikidata_id |
+-----------+------------+-----------+------+------------+-----+--------+-------------+
|   100001  |  Gardnar   |   Mulloy  |  R   | 1913-11-22 | USA |  185   |    Q54544   |
|   100002  |   Pancho   |   Segura  |  R   | 1921-06-20 | ECU |  168   |    Q54581   |
|   100003  |   Frank    |  Sedgman  |  R   | 1927-10-02 | AUS |  180   |   Q962049   |
|   100004  |  Giuseppe  |   Merlo   |  R   | 1927-10-11 | ITA |   0    |   Q1258752  |
|   100005  |  Richard   |  Gonzalez |  R   | 1928-05-09 | USA |  188   |    Q53554   |
|   100006  |   Grant    |   Golden  |  R   | 1929-08-21 | USA |  175   |   Q3115390  |
|   100007  |    Abe     |   Segal   |  L   | 1930-10-23 | RSA |   0    |   Q1258527  |
|   100008  |    Kurt    |  Nielsen  |  R   | 1930-11-19 | DEN |   0    |   Q552261   |
|   100009  |   Istvan   |   Gulyas  |  R   | 1931-10-14 | HUN |   0    |    Q51066   |
|   100010  |    Luis    |   Ayala   |  R   | 1932-09-18 | CHI |  170   |   Q1275397  |
+-----------+------------+-----------+------+------------+-----+--------+-------------+
```

## 查询 chDB \{#importing-csv-files-into-chdb\}

数据摄取已经完成，现在进入有趣的部分 —— 查询这些数据！

网球运动员会根据他们在所参加比赛中的表现获得积分。
我们掌握了每位球员在一个 52 周滚动周期内的积分情况。
我们将编写一个查询，用于查找每位球员在该期间累计的最高积分，以及当时对应的排名：

```python
%%sql
SELECT name_first, name_last,
       max(points) as maxPoints,
       argMax(rank, points) as rank,
       argMax(ranking_date, points) as date
FROM atp.players
JOIN atp.rankings ON rankings.player = players.player_id
GROUP BY ALL
ORDER BY maxPoints DESC
LIMIT 10
```

```text
+------------+-----------+-----------+------+------------+
| name_first | name_last | maxPoints | rank |    date    |
+------------+-----------+-----------+------+------------+
|   Novak    |  Djokovic |   16950   |  1   | 2016-06-06 |
|   Rafael   |   Nadal   |   15390   |  1   | 2009-04-20 |
|    Andy    |   Murray  |   12685   |  1   | 2016-11-21 |
|   Roger    |  Federer  |   12315   |  1   | 2012-10-29 |
|   Daniil   |  Medvedev |   10780   |  2   | 2021-09-13 |
|   Carlos   |  Alcaraz  |    9815   |  1   | 2023-08-21 |
|  Dominic   |   Thiem   |    9125   |  3   | 2021-01-18 |
|   Jannik   |   Sinner  |    8860   |  2   | 2024-05-06 |
|  Stefanos  | Tsitsipas |    8350   |  3   | 2021-09-20 |
| Alexander  |   Zverev  |    8240   |  4   | 2021-08-23 |
+------------+-----------+-----------+------+------------+
```

有趣的是，这个名单中的一些球员累积了大量得分，却从未凭这一得分总数登上第一名。

## 保存查询 \{#querying-chdb\}

我们可以在与 `%%sql` 魔法命令同一行中使用 `--save` 参数来保存查询。
`--no-execute` 参数表示将跳过查询的执行。

```python
%%sql --save best_points --no-execute
SELECT name_first, name_last,
       max(points) as maxPoints,
       argMax(rank, points) as rank,
       argMax(ranking_date, points) as date
FROM atp.players
JOIN atp.rankings ON rankings.player = players.player_id
GROUP BY ALL
ORDER BY maxPoints DESC
```

当我们运行已保存的查询时，它会在执行前被转换为公共表表达式（Common Table Expression，CTE）。
在下面的查询中，我们计算玩家在排名为 1 时获得的最高分数：

```python
%sql select * FROM best_points WHERE rank=1
```

```text
+-------------+-----------+-----------+------+------------+
|  name_first | name_last | maxPoints | rank |    date    |
+-------------+-----------+-----------+------+------------+
|    Novak    |  Djokovic |   16950   |  1   | 2016-06-06 |
|    Rafael   |   Nadal   |   15390   |  1   | 2009-04-20 |
|     Andy    |   Murray  |   12685   |  1   | 2016-11-21 |
|    Roger    |  Federer  |   12315   |  1   | 2012-10-29 |
|    Carlos   |  Alcaraz  |    9815   |  1   | 2023-08-21 |
|     Pete    |  Sampras  |    5792   |  1   | 1997-08-11 |
|    Andre    |   Agassi  |    5652   |  1   | 1995-08-21 |
|   Lleyton   |   Hewitt  |    5205   |  1   | 2002-08-12 |
|   Gustavo   |  Kuerten  |    4750   |  1   | 2001-09-10 |
| Juan Carlos |  Ferrero  |    4570   |  1   | 2003-10-20 |
|    Stefan   |   Edberg  |    3997   |  1   | 1991-02-25 |
|     Jim     |  Courier  |    3973   |  1   | 1993-08-23 |
|     Ivan    |   Lendl   |    3420   |  1   | 1990-02-26 |
|     Ilie    |  Nastase  |     0     |  1   | 1973-08-27 |
+-------------+-----------+-----------+------+------------+
```

## 使用参数进行查询 \{#saving-queries\}

我们也可以在查询中使用参数。
参数其实就是普通变量：

```python
rank = 10
```

然后我们就可以在查询中使用 `{{variable}}` 语法。
下面的查询会找出这样一些球员：他们第一次进入前 10 名排名到最后一次进入前 10 名排名之间间隔的天数最少：

```python
%%sql
SELECT name_first, name_last,
       MIN(ranking_date) AS earliest_date,
       MAX(ranking_date) AS most_recent_date,
       most_recent_date - earliest_date AS days,
       1 + (days/7) AS weeks
FROM atp.rankings
JOIN atp.players ON players.player_id = rankings.player
WHERE rank <= {{rank}}
GROUP BY ALL
ORDER BY days
LIMIT 10
```

```text
+------------+-----------+---------------+------------------+------+-------+
| name_first | name_last | earliest_date | most_recent_date | days | weeks |
+------------+-----------+---------------+------------------+------+-------+
|    Alex    | Metreveli |   1974-06-03  |    1974-06-03    |  0   |   1   |
|   Mikael   |  Pernfors |   1986-09-22  |    1986-09-22    |  0   |   1   |
|   Felix    |  Mantilla |   1998-06-08  |    1998-06-08    |  0   |   1   |
|   Wojtek   |   Fibak   |   1977-07-25  |    1977-07-25    |  0   |   1   |
|  Thierry   |  Tulasne  |   1986-08-04  |    1986-08-04    |  0   |   1   |
|   Lucas    |  Pouille  |   2018-03-19  |    2018-03-19    |  0   |   1   |
|    John    | Alexander |   1975-12-15  |    1975-12-15    |  0   |   1   |
|  Nicolas   |   Massu   |   2004-09-13  |    2004-09-20    |  7   |   2   |
|   Arnaud   |  Clement  |   2001-04-02  |    2001-04-09    |  7   |   2   |
|  Ernests   |   Gulbis  |   2014-06-09  |    2014-06-23    |  14  |   3   |
+------------+-----------+---------------+------------------+------+-------+
```

## 绘制直方图 \{#querying-with-parameters\}

JupySQL 也提供了有限的绘图功能。
我们可以创建箱线图或直方图。

接下来我们要创建一个直方图，但首先先编写（并保存）一个查询，用来计算每位球员在前 100 名中取得过的各次名次。
之后我们将使用这个查询来创建一个直方图，用于统计每个名次有多少球员达到：

```python
%%sql --save players_per_rank --no-execute
select distinct player, rank
FROM atp.rankings
WHERE rank <= 100
```

现在我们可以运行以下命令来创建直方图：

```python
from sql.ggplot import ggplot, geom_histogram, aes

plot = (
  ggplot(
    table="players_per_rank",
    with_="players_per_rank",
    mapping=aes(x="rank", fill="#69f0ae", color="#fff"),
  ) + geom_histogram(bins=100)
)
```

<Image img={PlayersPerRank} size="md" alt="ATP 数据集中球员排名直方图" />
