---
title: clickhouse-localデータベースの使用
sidebar_label: clickhouse-localデータベースの使用
slug: /chdb/guides/clickhouse-local
description: chDBを使用したclickhouse-localデータベースの使い方を学びましょう
keywords: [chdb, clickhouse-local]
---

[clickhouse-local](/operations/utilities/clickhouse-local) は、埋め込まれたClickHouseのバージョンを持つCLIです。
サーバーのインストールを必要とせずに、ユーザーにClickHouseの力を提供します。
このガイドでは、chDBを使ってclickhouse-localデータベースを使用する方法を学びます。

## セットアップ {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。
バージョンは2.0.2以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、[ipython](https://ipython.org/)をインストールします：

```bash
pip install ipython
```

`ipython`を使用して、ガイドの残りの部分のコマンドを実行します。以下のコマンドで起動できます：

```bash
ipython
```

## clickhouse-localのインストール {#installing-clickhouse-local}

clickhouse-localのダウンロードとインストールは、[ClickHouseのダウンロードとインストール](/install)と同じです。
以下のコマンドを実行することで行えます：

```bash
curl https://clickhouse.com/ | sh
```

データをディレクトリに永続化するためにclickhouse-localを起動するには、`--path`を渡す必要があります：

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-localへのデータの取り込み {#ingesting-data-into-clickhouse-local}

デフォルトのデータベースはメモリ内にのみデータを保存するため、データをディスクに永続化するには名前付きデータベースを作成する必要があります。

```sql
CREATE DATABASE foo;
```

テーブルを作成して、ランダムな数値をいくつか挿入しましょう：

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

どのようなデータがあるか確認するためのクエリを書くことにしましょう：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

これが終わったら、CLIから`exit;`してください。1つのプロセスのみがこのディレクトリのロックを保持できます。
これを行わないと、chDBからデータベースに接続しようとしたときに以下のエラーが発生します：

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## clickhouse-localデータベースへの接続 {#connecting-to-a-clickhouse-local-database}

`ipython`シェルに戻り、chDBから`session`モジュールをインポートします：

```python
from chdb import session as chs
```

`demo.chdb`を指すセッションを初期化します：

```python
sess = chs.Session("demo.chdb")
```

次に、数値の分位数を返す同じクエリを実行できます：

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

また、このデータベースにchDBからデータを挿入することもできます：

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
