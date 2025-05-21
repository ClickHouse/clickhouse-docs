---
title: 'clickhouse-local データベースの使用'
sidebar_label: 'clickhouse-local データベースの使用'
slug: /chdb/guides/clickhouse-local
description: 'chDBを使用してclickhouse-localデータベースを使用する方法を学びます'
keywords: ['chdb', 'clickhouse-local']
---

[clickhouse-local](/operations/utilities/clickhouse-local) は、ClickHouseの埋め込みバージョンを持つCLIです。  
これにより、ユーザーはサーバーをインストールすることなくClickHouseの機能を利用できます。  
このガイドでは、chDBからclickhouse-localデータベースを使用する方法について学びます。

## セットアップ {#setup}

まずは仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。  
バージョン2.0.2以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、[ipython](https://ipython.org/)をインストールします：

```bash
pip install ipython
```

`ipython`を使用して、ガイドの残りのコマンドを実行します。  
以下のコマンドで起動できます：

```bash
ipython
```

## clickhouse-localのインストール {#installing-clickhouse-local}

clickhouse-localのダウンロードとインストールは、[ClickHouseのダウンロードとインストール](/install) と同様です。  
次のコマンドを実行することで行えます：

```bash
curl https://clickhouse.com/ | sh
```

データをディレクトリに保存するためにclickhouse-localを起動するには、`--path`を渡す必要があります：

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-localへのデータの取り込み {#ingesting-data-into-clickhouse-local}

デフォルトのデータベースはメモリ内のデータのみを保存するため、名前付きデータベースを作成して取り込むデータがディスクに永続化されるようにする必要があります。

```sql
CREATE DATABASE foo;
```

テーブルを作成し、ランダムな数値を挿入してみましょう：

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

どのようなデータがあるかを確認するためにクエリを実行してみましょう：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

これが完了したら、CLIから`exit;`して終了してください。  
このディレクトリには1つのプロセスしかロックを取得できないため、これを行わないと、chDBからデータベースに接続しようとしたときに次のエラーが表示されます：

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

chDBからこのデータベースにデータを挿入することも可能です：

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
