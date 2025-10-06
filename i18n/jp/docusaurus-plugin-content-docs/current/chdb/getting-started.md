---
'title': 'chDBの始め方'
'sidebar_label': '始め方'
'slug': '/chdb/getting-started'
'description': 'chDBはClickHouseによって支えられたプロセス内SQL OLAPエンジンです'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'in-process'
- 'in process'
'doc_type': 'guide'
---


# Getting started with chDB

このガイドでは、chDBのPythonバリアントを使って、導入を行います。
最初にS3にあるJSONファイルをクエリし、そのファイルに基づいてchDBにテーブルを作成し、データに対していくつかのクエリを実行します。
また、クエリの結果をApache ArrowやPandasなどの異なるフォーマットで返す方法を見ていき、最後にPandas DataFramesをクエリする方法を学びます。 

## Setup {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。
バージョンは2.0.3以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、[ipython](https://ipython.org/)をインストールします：

```bash
pip install ipython
```

このガイドの残りの部分でコマンドを実行するために`ipython`を使用します。ipythonを起動するには、次のコマンドを実行します：

```bash
ipython
```

このガイドではPandasとApache Arrowも使用するので、それらのライブラリもインストールします：

```bash
pip install pandas pyarrow
```

## Querying a JSON file in S3 {#querying-a-json-file-in-s3}

次に、S3バケットに保存されているJSONファイルをクエリする方法を見てみましょう。
[YouTubeの嫌いなデータセット](/getting-started/example-datasets/youtube-dislikes)には、2021年までのYouTube動画に対する嫌いな数が40億行以上含まれています。
私たちはそのデータセットのJSONファイルの1つを使用します。

chdbをインポートします：

```python
import chdb
```

JSONファイルの構造を説明するために、次のクエリを書きます：

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

また、そのファイルの行数をカウントすることもできます：

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

このファイルには30万件以上のレコードが含まれています。

chdbはまだクエリパラメータの受け渡しをサポートしていませんが、パスを引き出してf-Stringを介して渡すことができます。

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
この方法はプログラムで定義した変数に対しては問題ありませんが、ユーザー提供の入力に対しては行わないでください。そうでないと、クエリはSQLインジェクションに対して脆弱になります。
:::

## Configuring the output format {#configuring-the-output-format}

デフォルトの出力フォーマットは`CSV`ですが、`output_format`パラメータを使用して変更できます。
chDBはClickHouseデータフォーマットのサポートに加えて、[独自のフォーマット](/chdb/reference/data-formats.md)もサポートしています。例えば、`DataFrame`を使用すると、Pandas DataFrameを返します：

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

また、Apache Arrowのテーブルを返す場合は次のようにします：

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

## Creating a table from JSON file {#creating-a-table-from-json-file}

次に、chDBでテーブルを作成する方法を見てみましょう。
それには別のAPIを使用する必要があるので、まずそれをインポートします：

```python
from chdb import session as chs
```

次に、セッションを初期化します。
もしセッションをディスクに永続化したい場合は、ディレクトリ名を指定する必要があります。
空白のままにすると、データベースはメモリ内にあり、Pythonプロセスを終了させると失われます。

```python
sess = chs.Session("gettingStarted.chdb")
```

次に、データベースを作成します：

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

これで、JSONファイルのスキーマに基づいて`dislikes`テーブルを作成できます。`CREATE...EMPTY AS`のテクニックを使用します。
カラムタイプが全て`Nullable`でないようにするために、[`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable)設定を使用します。

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

その後、`DESCRIBE`句を使用してスキーマを確認できます：

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

次に、そのテーブルをポピュレートします：

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

これら2つのステップを1回の操作で行うために、`CREATE...AS`のテクニックを使用することもできます。
そのテクニックを使用して別のテーブルを作成しましょう：

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

## Querying a table {#querying-a-table}

最後に、そのテーブルをクエリします：

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

その後、DataFrameにいいねと嫌いの比率を計算するための追加のカラムを追加するとしましょう。
次のコードを書けます：

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## Querying a Pandas dataframe {#querying-a-pandas-dataframe}

次に、chDBからそのDataFrameをクエリできます：

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

Pandas DataFramesをクエリする方法については、[Querying Pandas開発者ガイド](guides/querying-pandas.md)でも詳しく読むことができます。

## Next steps {#next-steps}

このガイドがchDBの概要を把握するのに役立ったことを願います。 
それを使う方法についてさらに知りたい場合は、次の開発者ガイドを参照してください：

* [Querying Pandas DataFrames](guides/querying-pandas.md)
* [Querying Apache Arrow](guides/querying-apache-arrow.md)
* [Using chDB in JupySQL](guides/jupysql.md)
* [Using chDB with an existing clickhouse-local database](guides/clickhouse-local.md)
