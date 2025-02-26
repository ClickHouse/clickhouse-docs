---
title: chDBを使い始める
sidebar_label: 使用開始
slug: /chdb/getting-started
description: chDBはClickHouseによって提供されるプロセス内SQL OLAPエンジンです
keywords: [chdb, 埋め込み, clickhouse-lite, プロセス内, in process]
---

# chDBを使い始める

このガイドでは、chDBのPythonバリアントを使用して、セットアップとクエリの実行について説明します。
まず、S3上のJSONファイルをクエリし、その後JSONファイルに基づいてchDBにテーブルを作成し、データに対していくつかのクエリを実行します。
また、クエリの結果をApache ArrowやPandasを含む異なる形式で返す方法や、PandasのDataFrameをクエリする方法についても説明します。

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

このガイドの残りの部分で使用するために`ipython`を利用します。以下のコマンドで起動できます：

```bash
ipython
```

さらに、ガイド内でPandasやApache Arrowも使用するので、これらのライブラリもインストールしましょう：

```bash
pip install pandas pyarrow
```

## S3のJSONファイルをクエリする {#querying-a-json-file-in-s3}

次に、S3バケットに保存されているJSONファイルをクエリする方法を見てみましょう。
[YouTubeの嫌いなデータセット](/getting-started/example-datasets/youtube-dislikes)には、2021年までのYouTube動画の嫌いな数の4億行以上が含まれています。
そのデータセットのJSONファイルの1つを使用します。

chdbをインポートします：

```python
import chdb
```

次のクエリを書いて、JSONファイルの構造を説明します：

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

ファイル内の行数をカウントすることもできます：

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

chdbはまだクエリパラメーターの渡しをサポートしていませんが、パスを取り出し、f-Stringを介して渡すことができます。

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
これは、プログラム内で定義された変数で行うのは問題ありませんが、ユーザーが提供した入力で行うとSQLインジェクションに対する脆弱性が生じるため、避けてください。
:::

## 出力形式の設定 {#configuring-the-output-format}

デフォルトの出力形式は`CSV`ですが、`output_format`パラメータを介して変更できます。
chDBはClickHouseのデータ形式をサポートしており、[独自の形式](/chdb/reference/data-formats.md)もサポートしています。その中にはPandas DataFrameを返す`DataFrame`形式も含まれています：

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

Apache Arrowテーブルを取得したい場合は、次のようにします：

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

## JSONファイルからのテーブル作成 {#creating-a-table-from-json-file}

次に、chDBにテーブルを作成する方法を見てみましょう。
そのためには別のAPIを使用する必要があるので、まずそれをインポートします：

```python
from chdb import session as chs
```

次に、セッションを初期化します。
セッションをディスクに保存する場合はディレクトリ名を指定する必要があります。
空白のままにすると、データベースはメモリ内にあり、Pythonプロセスを終了すると失われます。

```python
sess = chs.Session("gettingStarted.chdb")
```

次に、データベースを作成します：

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

これで、JSONファイルからのスキーマに基づいて`dislikes`テーブルを作成できます。`CREATE...EMPTY AS`技術を使用します。
すべてのカラムタイプが`Nullable`にならないように、[`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable)設定を使用します。

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

次に、`DESCRIBE`句を使用してスキーマを検査できます：

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

これら2つのステップを1度に行うこともでき、`CREATE...AS`技術を使用できます。
その技術を使用して別のテーブルを作成しましょう：

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

## テーブルのクエリ {#querying-a-table}

最後に、テーブルをクエリします：

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

次に、DataFrameに「いいね」と「嫌い」の比率を計算するための追加のカラムを追加するとしましょう。
以下のコードを書けます：

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## Pandas DataFrameのクエリ {#querying-a-pandas-dataframe}

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

Pandas DataFrameをクエリする方法についての詳細は、[Pandasのクエリ開発者ガイド](guides/querying-pandas.md)を参照してください。

## 次のステップ {#next-steps}

このガイドがchDBの良い概要を提供できたことを願っています。
使用方法を学ぶためには、次の開発者ガイドを参照してください：

* [Pandas DataFramesのクエリ](guides/querying-pandas.md)
* [Apache Arrowのクエリ](guides/querying-apache-arrow.md)
* [JupySQLでのchDBの使用](guides/jupysql.md)
* [既存のclickhouse-localデータベースとchDBの使用](guides/clickhouse-local.md)
