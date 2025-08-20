---
title: 'Using a clickhouse-local database'
sidebar_label: 'Using clickhouse-local database'
slug: '/chdb/guides/clickhouse-local'
description: 'Learn how to use a clickhouse-local database with chDB'
keywords:
- 'chdb'
- 'clickhouse-local'
---



[clickhouse-local](/operations/utilities/clickhouse-local) は、埋め込みバージョンの ClickHouse を持つ CLI です。  
これにより、ユーザーはサーバーをインストールすることなく ClickHouse の機能を利用できます。  
このガイドでは、chDB から clickhouse-local データベースを使用する方法を学びます。

## セットアップ {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDB をインストールします。  
バージョン 2.0.2 以上を確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、[ipython](https://ipython.org/) をインストールします：

```bash
pip install ipython
```

このガイドの残りのコマンドを実行するために `ipython` を使用します。  
`ipython` は以下のコマンドで起動できます：

```bash
ipython
```

## clickhouse-local のインストール {#installing-clickhouse-local}

clickhouse-local のダウンロードとインストールは、[ClickHouse のダウンロードとインストール](/install) と同じです。  
以下のコマンドを実行することでこれを行います：

```bash
curl https://clickhouse.com/ | sh
```

データをディレクトリに永続化するために clickhouse-local を起動するには、`--path` を指定する必要があります：

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-local へのデータの取り込み {#ingesting-data-into-clickhouse-local}

デフォルトのデータベースはメモリ内のデータのみを保存しますので、取り込むデータがディスクに永続化されるように、名前付きデータベースを作成する必要があります。

```sql
CREATE DATABASE foo;
```

テーブルを作成し、いくつかのランダムな数字を挿入しましょう：

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

どのデータがあるかを確認するためのクエリを書きます：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

これが完了したら、CLI から `exit;` して出てください。  
このディレクトリ上でロックを保持できるプロセスは一つだけなので、これを行わないと chDB からデータベースに接続しようとしたときに以下のエラーが発生します：

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## clickhouse-local データベースへの接続 {#connecting-to-a-clickhouse-local-database}

`ipython` シェルに戻り、chDB から `session` モジュールをインポートします：

```python
from chdb import session as chs
```

`demo.chdb` を指すセッションを初期化します：

```python
sess = chs.Session("demo.chdb")
```

次に、数字の分位数を返すクエリを実行します：

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

また、chDB からこのデータベースにデータを挿入することもできます：

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

その後、chDB または clickhouse-local から分位数のクエリを再実行できます。
