---
title: '使用 chDB 开始'
sidebar_label: '开始使用'
slug: /chdb/getting-started
description: 'chDB 是一个由 ClickHouse 驱动的进程内 SQL OLAP 引擎'
keywords: [chdb, 嵌入式, clickhouse-lite, 进程内, in process]
---


# 使用 chDB 开始

在本指南中，我们将快速上手 chDB 的 Python 版本。
我们将首先查询存储在 S3 上的 JSON 文件，然后根据 JSON 文件在 chDB 中创建一个表，并对数据执行一些查询。
我们还将看到如何让查询以不同格式返回数据，包括 Apache Arrow 和 Pandas，最后我们将学习如何查询 Pandas DataFrames。

## 设置 {#setup}

让我们首先创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

现在我们将安装 chDB。
确保您安装的版本为 2.0.3 或更高：

```bash
pip install "chdb>=2.0.2"
```

现在我们将安装 [ipython](https://ipython.org/)：

```bash
pip install ipython
```

我们将使用 `ipython` 来运行指南中的命令，您可以通过运行以下命令来启动它：

```bash
ipython
```

在本指南中，我们还将使用 Pandas 和 Apache Arrow，所以让我们也安装这些库：

```bash
pip install pandas pyarrow
```

## 查询 S3 中的 JSON 文件 {#querying-a-json-file-in-s3}

现在让我们看看如何查询存储在 S3 存储桶中的 JSON 文件。
[YouTube 不喜欢的数据集](/getting-started/example-datasets/youtube-dislikes) 包含了超过 40 亿行关于 YouTube 视频的“不喜欢”记录（截至2021年）。
我们将使用该数据集中的一个 JSON 文件。

导入 chdb：

```python
import chdb
```

我们可以写以下查询来描述其中一个 JSON 文件的结构：

```python
chdb.query(
  """
  DESCRIBE s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )
  SETTINGS describe_compact_output=1
  """
)
```

```text
"id","Nullable(String)"
"fetch_date","Nullable(String)"
"upload_date","Nullable(String)"
"title","Nullable(String)"
"uploader_id","Nullable(String)"
"uploader","Nullable(String)"
"uploader_sub_count","Nullable(Int64)"
"is_age_limit","Nullable(Bool)"
"view_count","Nullable(Int64)"
"like_count","Nullable(Int64)"
"dislike_count","Nullable(Int64)"
"is_crawlable","Nullable(Bool)"
"is_live_content","Nullable(Bool)"
"has_subtitles","Nullable(Bool)"
"is_ads_enabled","Nullable(Bool)"
"is_comments_enabled","Nullable(Bool)"
"description","Nullable(String)"
"rich_metadata","Array(Tuple(
    call Nullable(String),
    content Nullable(String),
    subtitle Nullable(String),
    title Nullable(String),
    url Nullable(String)))"
"super_titles","Array(Tuple(
    text Nullable(String),
    url Nullable(String)))"
"uploader_badges","Nullable(String)"
"video_badges","Nullable(String)"
```

我们还可以计算该文件中的行数：

```python
chdb.query(
  """
  SELECT count()
  FROM s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )"""
)
```

```text
336432
```

该文件包含稍超过 300,000 条记录。

chdb 还不支持传入查询参数，但我们可以提取路径并通过 f-String 传入。

```python
path = 's3://clickhouse-public-datasets/youtube/original/files/youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst'
```

```python
chdb.query(
  f"""
  SELECT count()
  FROM s3('{path}','JSONLines')
  """
)
```

:::warning
这样做的变量定义在程序中是可以的，但不要使用用户提供的输入，否则您的查询可能会面临 SQL 注入攻击。
:::

## 配置输出格式 {#configuring-the-output-format}

默认的输出格式为 `CSV`，但我们可以通过 `output_format` 参数更改它。
chDB 支持 ClickHouse 数据格式，以及 [它自己的一些格式](/chdb/reference/data-formats.md)，包括 `DataFrame`，它返回一个 Pandas DataFrame：

```python
result = chdb.query(
  f"""
  SELECT is_ads_enabled, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="DataFrame"
)

print(type(result))
print(result)
```

```text
<class 'pandas.core.frame.DataFrame'>
   is_ads_enabled  count()
0           False   301125
1            True    35307
```

或者如果我们想要返回 Apache Arrow 表：

```python
result = chdb.query(
  f"""
  SELECT is_live_content, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="ArrowTable"
)

print(type(result))
print(result)
```

```text
<class 'pyarrow.lib.Table'>
pyarrow.Table
is_live_content: bool
count(): uint64 not null
----
is_live_content: [[false,true]]
count(): [[315746,20686]]
```

## 从 JSON 文件创建表 {#creating-a-table-from-json-file}

接下来，让我们看看如何在 chDB 中创建一个表。
我们需要使用不同的 API 来完成这一点，所以让我们先导入它：

```python
from chdb import session as chs
```

接下来，我们将初始化一个会话。
如果我们希望会话持久化到磁盘，我们需要提供一个目录名称。
如果我们留空，则数据库将在内存中，Python 进程结束后会丢失。

```python
sess = chs.Session("gettingStarted.chdb")
```

接下来，我们将创建一个数据库：

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

现在我们可以创建一个基于 JSON 文件模式的 `dislikes` 表，使用 `CREATE...EMPTY AS` 技术。
我们将使用 [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable) 设置，以便列类型不是全部 `Nullable`。

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes
  ORDER BY fetch_date 
  EMPTY AS 
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

然后我们可以使用 `DESCRIBE` 子句检查模式：

```python
sess.query(f"""
   DESCRIBE youtube.dislikes
   SETTINGS describe_compact_output=1
   """
)
```

```text
"id","String"
"fetch_date","String"
"upload_date","String"
"title","String"
"uploader_id","String"
"uploader","String"
"uploader_sub_count","Int64"
"is_age_limit","Bool"
"view_count","Int64"
"like_count","Int64"
"dislike_count","Int64"
"is_crawlable","Bool"
"is_live_content","Bool"
"has_subtitles","Bool"
"is_ads_enabled","Bool"
"is_comments_enabled","Bool"
"description","String"
"rich_metadata","Array(Tuple(
    call String,
    content String,
    subtitle String,
    title String,
    url String))"
"super_titles","Array(Tuple(
    text String,
    url String))"
"uploader_badges","String"
"video_badges","String"
```

接下来，让我们填充该表：

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

我们也可以一次完成这两个步骤，使用 `CREATE...AS` 技术。
让我们使用该技术创建一个不同的表：

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes2
  ORDER BY fetch_date 
  AS 
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

## 查询表 {#querying-a-table}

最后，让我们查询该表：

```sql
df = sess.query("""
  SELECT uploader, sum(view_count) AS viewCount, sum(like_count) AS likeCount, sum(dislike_count) AS dislikeCount
  FROM youtube.dislikes
  GROUP BY ALL
  ORDER BY viewCount DESC
  LIMIT 10
  """,
  "DataFrame"
)
df
```

```text
                             uploader  viewCount  likeCount  dislikeCount
0                             Jeremih  139066569     812602         37842
1                     TheKillersMusic  109313116     529361         11931
2  LetsGoMartin- Canciones Infantiles  104747788     236615        141467
3                    Xiaoying Cuisine   54458335    1031525         37049
4                                Adri   47404537     279033         36583
5                  Diana and Roma IND   43829341     182334        148740
6                      ChuChuTV Tamil   39244854     244614        213772
7                            Cheez-It   35342270        108            27
8                            Anime Uz   33375618    1270673         60013
9                    RC Cars OFF Road   31952962     101503         49489
```

假设我们接着添加一个额外的列到 DataFrame 中以计算点赞与点踩的比率。
我们可以写如下代码：

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## 查询 Pandas DataFrame {#querying-a-pandas-dataframe}

然后我们可以从 chDB 查询该 DataFrame：

```python
chdb.query(
  """
  SELECT uploader, likeDislikeRatio
  FROM Python(df)
  """,
  output_format="DataFrame"
)
```

```text
                             uploader  likeDislikeRatio
0                             Jeremih         21.473548
1                     TheKillersMusic         44.368536
2  LetsGoMartin- Canciones Infantiles          1.672581
3                    Xiaoying Cuisine         27.842182
4                                Adri          7.627395
5                  Diana and Roma IND          1.225857
6                      ChuChuTV Tamil          1.144275
7                            Cheez-It          4.000000
8                            Anime Uz         21.173296
9                    RC Cars OFF Road          2.051021
```

您还可以阅读更多关于查询 Pandas DataFrames 的内容，可以参考 [查询 Pandas 开发者指南](guides/querying-pandas.md)。

## 下一步 {#next-steps}

希望本指南能为您提供有关 chDB 的良好概述。
要了解如何使用它，请参阅以下开发者指南：

* [查询 Pandas DataFrames](guides/querying-pandas.md)
* [查询 Apache Arrow](guides/querying-apache-arrow.md)
* [在 JupySQL 中使用 chDB](guides/jupysql.md)
* [与现有 clickhouse-local 数据库一起使用 chDB](guides/clickhouse-local.md)
