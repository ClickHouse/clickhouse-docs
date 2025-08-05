---
title: 'Getting started with chDB'
sidebar_label: 'Getting started'
slug: '/chdb/getting-started'
description: 'chDBはClickHouseを搭載したインプロセスSQL OLAPエンジンです'
keywords:
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'in-process'
- 'in process'
---





# chDBの使い方

このガイドでは、chDBのPythonバリアントを使用して設定を行います。
まず、S3に保存されたJSONファイルをクエリしてから、そのJSONファイルに基づいてchDBにテーブルを作成し、データに対していくつかのクエリを実行します。
また、クエリがApache ArrowやPandaを含むさまざまな形式でデータを返す方法を見て、最後にPandas DataFramesをクエリする方法を学びます。

## セットアップ {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。
バージョン2.0.3以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、[ipython](https://ipython.org/)をインストールします：

```bash
pip install ipython
```

このガイドの残りのコマンドを実行するために`ipython`を使用する予定です。次のコマンドを実行して起動できます：

```bash
ipython
```

このガイドではPandasとApache Arrowも使用するので、これらのライブラリもインストールしましょう：

```bash
pip install pandas pyarrow
```

## S3内のJSONファイルをクエリする {#querying-a-json-file-in-s3}

次に、S3バケットに保存されているJSONファイルをどのようにクエリするかを見ていきます。
[YouTubeの嫌いなデータセット](/getting-started/example-datasets/youtube-dislikes)には、2021年までのYouTube動画の嫌いの数が40億行以上含まれています。
そのデータセットからのJSONファイルの1つを使用します。

chdbをインポートします：

```python
import chdb
```

次に、JSONファイルの構造を記述するクエリを次のように書くことができます：

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

そのファイル内の行数をカウントすることもできます：

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

このファイルにはちょうど300,000件を超えるレコードが含まれています。

chdbはまだクエリパラメータを渡すことをサポートしていませんが、パスを抽出してf-Stringを介して渡すことができます。

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
プログラム内で定義された変数を使うのは問題ありませんが、ユーザー提供の入力に対しては行わないでください。そうしないと、クエリがSQLインジェクション攻撃を受ける可能性があります。
:::

## 出力形式の設定 {#configuring-the-output-format}

デフォルトの出力形式は`CSV`ですが、`output_format`パラメーターを介して変更できます。
chDBはClickHouseのデータ形式をサポートしており、[独自の形式もいくつか用意しています](/chdb/reference/data-formats.md)。その中には、Pandas DataFrameを返す`DataFrame`という形式もあります：

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

また、Apache Arrowテーブルを得たい場合は次のようにします：

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

## JSONファイルからテーブルを作成する {#creating-a-table-from-json-file}

次に、chDBにテーブルを作成する方法を見ていきましょう。
このために異なるAPIを使用する必要があるので、まずそれをインポートします：

```python
from chdb import session as chs
```

次に、セッションを初期化します。
セッションをディスクに保持する場合は、ディレクトリ名を提供する必要があります。
空白のままにすると、データベースはメモリ内に留まることになり、Pythonプロセスが終了すると失われます。

```python
sess = chs.Session("gettingStarted.chdb")
```

次に、データベースを作成します：

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

次に、`CREATE...EMPTY AS`技法を使用して、JSONファイルからのスキーマに基づいて`dislikes`テーブルを作成します。
すべてのカラムタイプを`Nullable`にしないために、[`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable)設定を使用します。

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

次に、`DESCRIBE`句を使用してスキーマを確認します：

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

次に、そのテーブルにデータを挿入します：

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

これらの手順を1回で実行するために、`CREATE...AS`技法を使うこともできます。
その技法を使用して別のテーブルを作成しましょう：

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

## テーブルをクエリする {#querying-a-table}

最後に、テーブルをクエリしてみましょう：

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

データフレームに「いいね」と「嫌い」の比率を計算するために追加のカラムを加えるとします。
次のように書くことができます：

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## Pandas DataFrameをクエリする {#querying-a-pandas-dataframe}

その後、chDBからそのDataFrameをクエリできます：

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

Pandas DataFramesのクエリに関しては、[Pandasをクエリする開発者ガイド](guides/querying-pandas.md)でさらに詳しく読むことができます。

## 次のステップ {#next-steps}

このガイドがchDBの概要を把握するのに役立ったことを願っています。
使用方法の詳細については、以下の開発者ガイドを参照してください：

* [Pandas DataFramesをクエリする](guides/querying-pandas.md)
* [Apache Arrowをクエリする](guides/querying-apache-arrow.md)
* [JupySQLでchDBを使用する](guides/jupysql.md)
* [既存のclickhouse-localデータベースでchDBを使用する](guides/clickhouse-local.md)
