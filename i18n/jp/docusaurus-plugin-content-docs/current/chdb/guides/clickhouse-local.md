---
'title': 'clickhouse-local データベースの使用'
'sidebar_label': 'clickhouse-local データベースの使用'
'slug': '/chdb/guides/clickhouse-local'
'description': 'chDBを使用してclickhouse-local データベースを利用する方法を学びます'
'keywords':
- 'chdb'
- 'clickhouse-local'
'doc_type': 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local) は、埋め込み版の ClickHouse を持つ CLI です。これにより、サーバーをインストールすることなく ClickHouse の機能をユーザーに提供します。このガイドでは、chDB から clickhouse-local データベースを使用する方法を学びます。

## セットアップ {#setup}

まずは仮想環境を作成します：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDB をインストールします。バージョン 2.0.2 以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

そして、[ipython](https://ipython.org/) をインストールします：

```bash
pip install ipython
```

このガイドの残りのコマンドを実行するために `ipython` を使用します。起動するには次のコマンドを実行します：

```bash
ipython
```

## clickhouse-local のインストール {#installing-clickhouse-local}

clickhouse-local のダウンロードとインストールは、[ClickHouse のダウンロードとインストール](/install) と同じです。以下のコマンドを実行してこれを行います：

```bash
curl https://clickhouse.com/ | sh
```

データをディレクトリに永続化するために clickhouse-local を起動するには、`--path` を指定する必要があります：

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-local にデータを取り込む {#ingesting-data-into-clickhouse-local}

デフォルトのデータベースはメモリ内のデータしか保存しないため、取り込んだデータがディスクに永続化されるように、名前付きのデータベースを作成する必要があります。

```sql
CREATE DATABASE foo;
```

テーブルを作成し、ランダムな数字を挿入しましょう：

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

どのデータを持っているか確認するクエリを書きます：

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

これが完了したら、CLI から `exit;` することを忘れないでください。このディレクトリにロックを保持できるのは一つのプロセスだけだからです。それを行わないと、chDB からデータベースに接続しようとしたときに次のエラーが発生します：

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## clickhouse-local データベースへの接続 {#connecting-to-a-clickhouse-local-database}

`ipython` シェルに戻り、chDB から `session` モジュールをインポートします：

```python
from chdb import session as chs
```

`demo..chdb` を指すセッションを初期化します：

```python
sess = chs.Session("demo.chdb")
```

その後、数字の分位数を返す同じクエリを実行できます：

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

その後、chDB または clickhouse-local から分位数クエリを再実行できます。
