---
'title': '开始使用 chDB'
'sidebar_label': '开始使用'
'slug': '/chdb/getting-started'
'description': 'chDB 是一个由 ClickHouse 驱动的内嵌 SQL OLAP 引擎'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'in-process'
- 'in process'
'doc_type': 'guide'
---


# 开始使用 chDB

在本指南中，我们将使用 chDB 的 Python 版本进行操作。  
我们将从查询存储在 S3 上的 JSON 文件开始，然后根据该 JSON 文件在 chDB 中创建一个表，并对数据进行一些查询。  
我们还将看到如何使查询以不同格式返回数据，包括 Apache Arrow 和 Pandas，最后我们将学习如何查询 Pandas DataFrames。 

## 设置 {#setup}

首先，让我们创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来，我们将安装 chDB。  
确保您安装的版本是 2.0.3 或更高：

```bash
pip install "chdb>=2.0.2"
```

现在我们将安装 [ipython](https://ipython.org/)：

```bash
pip install ipython
```

我们将使用 `ipython` 来运行本指南中的命令，您可以通过运行以下命令来启动它：

```bash
ipython
```

在本指南中，我们还将使用 Pandas 和 Apache Arrow，因此让我们也安装这些库：

```bash
pip install pandas pyarrow
```

## 查询 S3 中的 JSON 文件 {#querying-a-json-file-in-s3}

现在让我们看看如何查询存储在 S3 存储桶中的 JSON 文件。  
[YouTube 不喜欢数据集](/getting-started/example-datasets/youtube-dislikes) 包含了截至 2021 年的超过 40 亿行不喜欢 YouTube 视频的数据。  
我们将使用该数据集中的一个 JSON 文件。

导入 chdb：

```python
import chdb
```

我们可以写以下查询以描述其中一个 JSON 文件的结构：

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

该文件包含略多于 300,000 条记录。

chdb 目前还不支持传入查询参数，但我们可以提取路径并通过 f-String 传入。

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
这样做对于程序中定义的变量是可以的，但不要对用户提供的输入这样做，否则您的查询将面临 SQL 注入风险。
:::

## 配置输出格式 {#configuring-the-output-format}

默认输出格式是 `CSV`，但我们可以通过 `output_format` 参数更改它。  
chDB 支持 ClickHouse 数据格式，以及 [一些自己的格式](/chdb/reference/data-formats.md)，包括 `DataFrame`，返回 Pandas DataFrame：

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

或者如果我们想获取一个 Apache Arrow 表：

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
我们需要使用不同的 API 来实现，因此让我们先导入它：

```python
from chdb import session as chs
```

接下来，我们将初始化一个会话。  
如果我们希望会话持久化到磁盘，则需要提供一个目录名称。  
如果留空，数据库将在内存中，并在我们终止 Python 进程后丢失。

```python
sess = chs.Session("gettingStarted.chdb")
```

接下来，我们将创建一个数据库：

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

现在我们可以基于 JSON 文件中的模式使用 `CREATE...EMPTY AS` 技术创建一个 `dislikes` 表。  
我们将使用 [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable) 设置，以便列类型不会全部设为 `Nullable`。

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

然后我们可以使用 `DESCRIBE` 子句来检查架构：

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

我们也可以将这两个步骤合并为一个，通过 `CREATE...AS` 技术进行。  
让我们使用该技术创建另一个表：

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

假设我们然后向 DataFrame 中添加一个额外的列来计算喜欢与不喜欢的比率。  
我们可以写以下代码：

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## 查询 Pandas DataFrame {#querying-a-pandas-dataframe}

然后，我们可以从 chDB 查询该 DataFrame：

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

您还可以在 [查询 Pandas 开发者指南](guides/querying-pandas.md) 中阅读更多关于查询 Pandas DataFrames 的内容。

## 下一步 {#next-steps}

希望本指南能够为您提供 chDB 的良好概述。  
要了解更多有关如何使用它的信息，请参阅以下开发者指南：

* [查询 Pandas DataFrames](guides/querying-pandas.md)
* [查询 Apache Arrow](guides/querying-apache-arrow.md)
* [在 JupySQL 中使用 chDB](guides/jupysql.md)
* [使用现有的 clickhouse-local 数据库的 chDB](guides/clickhouse-local.md)
