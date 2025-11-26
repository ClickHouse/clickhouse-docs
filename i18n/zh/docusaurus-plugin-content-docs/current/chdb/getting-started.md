---
title: '开始使用 chDB'
sidebar_label: '快速开始'
slug: /chdb/getting-started
description: 'chDB 是由 ClickHouse 驱动的进程内 SQL OLAP 引擎'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'in-process', 'in process']
doc_type: 'guide'
---



# chDB 入门

在本指南中，我们将快速上手 chDB 的 Python 版本。
我们会先查询存储在 S3 上的 JSON 文件，然后基于该 JSON 文件在 chDB 中创建一张表，并对其中的数据执行一些查询。
我们还将了解如何让查询结果以不同格式返回数据，包括 Apache Arrow 和 Pandas，最后我们会学习如何查询 Pandas DataFrame。 



## 环境准备

先创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来安装 chDB。
请确保安装的版本为 2.0.3 或更高：

```bash
pip install "chdb>=2.0.2"
```

接下来我们要安装 [ipython](https://ipython.org/)：

```bash
pip install ipython
```

在本指南的其余部分，我们将使用 `ipython` 来运行命令。你可以通过运行以下命令来启动它：

```bash
ipython
```

在本指南中我们还将使用 Pandas 和 Apache Arrow，因此现在也一并安装这些库：

```bash
pip install pandas pyarrow
```


## 在 S3 中查询 JSON 文件

现在来看看如何查询存储在 S3 存储桶中的 JSON 文件。
[YouTube dislikes 数据集](/getting-started/example-datasets/youtube-dislikes) 包含了截至 2021 年的超过 40 亿行 YouTube 视频点踩记录。
我们将使用该数据集中的一个 JSON 文件进行演示。

导入 chdb：

```python
import chdb
```

我们可以编写如下查询语句来描述其中一个 JSON 文件的结构：

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

我们还可以统计该文件的行数：

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

该文件包含略多于 30 万条记录。

chdb 目前还不支持传递查询参数，但我们可以先将路径提取出来，然后通过 f 字符串传入。

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
在程序中对已定义的变量这样做是可以的，但绝不要对用户提供的输入这么做，否则你的查询将暴露在 SQL 注入攻击之下。
:::


## 配置输出格式

默认输出格式为 `CSV`，但我们可以通过 `output_format` 参数进行修改。
chDB 支持 ClickHouse 的数据格式，以及[其自定义的一些格式](/chdb/reference/data-formats.md)，其中包括 `DataFrame`，可返回一个 Pandas DataFrame：

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

或者，如果我们想要获取一个 Apache Arrow 表作为返回值：

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


## 从 JSON 文件创建表

接下来，我们来看一下如何在 chDB 中创建一个表。
我们需要使用另一个 API 来完成这个操作，所以先把它导入进来：

```python
from chdb import session as chs
```

接下来，我们将初始化一个会话。
如果希望会话持久化到磁盘，就需要提供一个目录名称。
如果将其留空，数据库将只在内存中存在，并会在我们终止 Python 进程时被清空。

```python
sess = chs.Session("gettingStarted.chdb")
```

接下来，我们创建一个数据库：

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

现在我们可以基于 JSON 文件中的 schema，使用 `CREATE...EMPTY AS` 方法创建一个 `dislikes` 表。
我们将使用 [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable) 设置，这样列类型就不会全部变成 `Nullable`。

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

然后我们可以使用 `DESCRIBE` 子句来查看表结构：

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

接下来，我们往这张表里写入数据：

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

我们也可以使用 `CREATE...AS` 技巧，把这两个步骤合并为一步完成。
让我们用这种技巧创建另一张表：

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


## 查询表

最后，我们来查询一下这张表：

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
                             上传者  观看次数  点赞数  踩数
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

假设我们接着在 DataFrame 中添加一列，用来计算点赞与点踩的比率。
我们可以编写如下代码：

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```


## 查询 Pandas DataFrame

然后我们可以使用 chDB 查询该 DataFrame：

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

你也可以在[《Pandas 查询开发者指南》](guides/querying-pandas.md)中了解更多关于查询 Pandas DataFrame 的内容。


## 后续步骤 {#next-steps}

本指南希望已为你提供了 chDB 的整体概览。  
要进一步了解其用法，请参阅以下开发指南：

* [查询 Pandas DataFrame](guides/querying-pandas.md)
* [查询 Apache Arrow](guides/querying-apache-arrow.md)
* [在 JupySQL 中使用 chDB](guides/jupysql.md)
* [在现有的 clickhouse-local 数据库中使用 chDB](guides/clickhouse-local.md)
