---
title: 'clickhouse-local データベースの使用'
sidebar_label: 'clickhouse-local データベースの使用'
slug: /chdb/guides/clickhouse-local
description: 'chDB で clickhouse-local データベースを使用する方法について説明します'
keywords: ['chdb', 'clickhouse-local']
doc_type: 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local) は、ClickHouse の組み込み版を搭載した CLI ツールです。
ClickHouse サーバーをインストールせずに、その機能を利用できます。
このガイドでは、chDB から clickhouse-local データベースを使用する方法を説明します。

## セットアップ \{#setup\}

まず仮想環境を作成します。

```bash
python -m venv .venv
source .venv/bin/activate
```

次に chDB をインストールします。
chDB のバージョンが 2.0.2 以上であることを確認してください。

```bash
pip install "chdb>=2.0.2"
```

それでは、ここで [IPython](https://ipython.org/) をインストールします：

```bash
pip install ipython
```

このガイドでは、以降のコマンドを `ipython` を使って実行します。次のコマンドを実行して `ipython` を起動してください。

```bash
ipython
```

## clickhouse-local のインストール \{#installing-clickhouse-local\}

clickhouse-local のダウンロードとインストールは、[ClickHouse のダウンロードとインストール](/install) と同じです。
次のコマンドを実行してください。

```bash
curl https://clickhouse.com/ | sh
```

データをディレクトリに永続化するように clickhouse-local を起動するには、`--path` オプションを指定する必要があります：

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-local へのデータ取り込み \{#ingesting-data-into-clickhouse-local\}

デフォルトのデータベースはメモリ上にのみデータを保存するため、取り込んだデータをディスクに永続的に保存できるよう、名前付きデータベースを作成する必要があります。

```sql
CREATE DATABASE foo;
```

テーブルを作成し、いくつかのランダムな数値を挿入してみましょう。

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

どのようなデータがあるか確認するクエリを書いてみましょう：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

それが終わったら、必ず CLI で `exit;` を実行して終了してください。このディレクトリにロックを取得できるプロセスは 1 つだけです。
そうしないと、chDB からデータベースに接続しようとしたときに、次のエラーが発生します。

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## clickhouse-local データベースへの接続 \{#connecting-to-a-clickhouse-local-database\}

`ipython` シェルに戻り、chDB の `session` モジュールをインポートします。

```python
from chdb import session as chs
```

`demo.chdb` を対象としたセッションを初期化します:

```python
sess = chs.Session("demo.chdb")
```

次に、同じクエリを実行して数値の分位数を取得できます：

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

また、chDB からこのデータベースにデータを挿入することもできます。

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

その後、chDB または clickhouse-local から、分位数を取得するクエリを再実行できます。
