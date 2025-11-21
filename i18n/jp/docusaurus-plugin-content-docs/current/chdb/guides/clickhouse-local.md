---
title: 'clickhouse-local データベースの使用'
sidebar_label: 'clickhouse-local データベースの使用'
slug: /chdb/guides/clickhouse-local
description: 'chDB で clickhouse-local データベースを使用する方法について説明します'
keywords: ['chdb', 'clickhouse-local']
doc_type: 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local) は、ClickHouse の組み込み版を搭載した CLI ツールです。
サーバーをインストールすることなく、ClickHouse の機能を利用できます。
このガイドでは、chDB から clickhouse-local データベースを使用する方法について説明します。



## セットアップ {#setup}

まず、仮想環境を作成しましょう:

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。
バージョン2.0.2以上であることを確認してください:

```bash
pip install "chdb>=2.0.2"
```

続いて、[ipython](https://ipython.org/)をインストールします:

```bash
pip install ipython
```

このガイドの残りの部分では、`ipython`を使用してコマンドを実行します。以下のコマンドで起動できます:

```bash
ipython
```


## clickhouse-localのインストール {#installing-clickhouse-local}

clickhouse-localのダウンロードとインストールは、[ClickHouseのダウンロードとインストール](/install)と同じです。
次のコマンドを実行することで実行できます:

```bash
curl https://clickhouse.com/ | sh
```

データをディレクトリに永続化してclickhouse-localを起動するには、`--path`を指定する必要があります:

```bash
./clickhouse -m --path demo.chdb
```


## clickhouse-localへのデータ取り込み {#ingesting-data-into-clickhouse-local}

デフォルトのデータベースはメモリ上にのみデータを保存するため、取り込んだデータをディスクに永続化するには、名前付きデータベースを作成する必要があります。

```sql
CREATE DATABASE foo;
```

テーブルを作成し、ランダムな数値を挿入してみましょう:

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

取得したデータを確認するクエリを実行してみましょう:

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

完了したら、必ずCLIから`exit;`してください。このディレクトリに対してロックを保持できるプロセスは1つだけです。
これを行わないと、chDBからデータベースに接続しようとした際に以下のエラーが発生します:

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```


## clickhouse-localデータベースへの接続 {#connecting-to-a-clickhouse-local-database}

`ipython`シェルに戻り、chDBから`session`モジュールをインポートします:

```python
from chdb import session as chs
```

`demo.chdb`を指すセッションを初期化します:

```python
sess = chs.Session("demo.chdb")
```

次に、数値の分位数を返す同じクエリを実行できます:

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

また、chDBからこのデータベースにデータを挿入することもできます:

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

その後、chDBまたはclickhouse-localから分位数クエリを再実行できます。
