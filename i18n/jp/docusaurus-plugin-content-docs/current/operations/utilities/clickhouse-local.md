---
description: 'サーバーを使わずにデータを処理するための clickhouse-local 利用ガイド'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
doc_type: 'reference'
---



# clickhouse-local



## clickhouse-local を使うときと ClickHouse を使うとき {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` は、フル機能のデータベースサーバーをインストールすることなく、SQL を使ってローカルおよびリモートファイルに対して高速な処理を行いたい開発者に最適な、使いやすい ClickHouse のバージョンです。`clickhouse-local` を使用すると、開発者はコマンドラインから直接 [ClickHouse SQL dialect](../../sql-reference/index.md) を用いた SQL コマンドを実行でき、フルの ClickHouse をインストールすることなく ClickHouse の機能にシンプルかつ効率的にアクセスできます。`clickhouse-local` の主な利点の 1 つは、[clickhouse-client](/operations/utilities/clickhouse-local) をインストールする際に同梱されていることです。これにより、複雑なインストール手順なしに、開発者はすぐに `clickhouse-local` を使い始めることができます。

`clickhouse-local` は、開発およびテスト用途、ならびにファイル処理に非常に有用なツールですが、エンドユーザーやアプリケーションに対するサービス提供には適していません。これらのシナリオでは、オープンソースの [ClickHouse](/install) を使用することを推奨します。ClickHouse は、大規模な分析ワークロードを処理するように設計された強力な OLAP データベースです。大規模なデータセットに対する複雑なクエリを高速かつ効率的に処理できるため、高パフォーマンスが重要となる本番環境に最適です。加えて ClickHouse は、レプリケーション、シャーディング、高可用性など、大規模データセットの処理やアプリケーション提供に必要となるスケールアウトのための幅広い機能を提供します。より大きなデータセットを扱う必要がある場合や、エンドユーザーまたはアプリケーションに提供する必要がある場合は、`clickhouse-local` ではなくオープンソースの ClickHouse を使用することを推奨します。

以下のドキュメントでは、[ローカルファイルのクエリ](#query_data_in_file) や [S3 上の Parquet ファイルの読み取り](#query-data-in-a-parquet-file-in-aws-s3) など、`clickhouse-local` の代表的なユースケースを示していますので、参照してください。



## clickhouse-local をダウンロードする

`clickhouse-local` は、ClickHouse サーバーや `clickhouse-client` と同じ `clickhouse` バイナリで実行されます。最新バージョンをダウンロードする最も簡単な方法は、次のコマンドを使用することです。

```bash
curl https://clickhouse.com/ | sh
```

:::note
ダウンロードしたばかりのバイナリは、さまざまな ClickHouse ツールやユーティリティを実行できます。ClickHouse をデータベースサーバーとして実行したい場合は、[クイックスタート](/get-started/quick-start)を参照してください。
:::


## SQL を使用してファイル内のデータをクエリする

`clickhouse-local` の一般的な用途は、データをテーブルに挿入することなく、ファイルに対してアドホックなクエリを実行することです。`clickhouse-local` はファイルから一時テーブルへデータをストリーミングし、その一時テーブルに対して SQL を実行できます。

ファイルが `clickhouse-local` と同じマシン上にある場合は、読み込むファイルを指定するだけで構いません。次の `reviews.tsv` ファイルには、Amazon の商品レビューのサンプルが含まれています。

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

このコマンドは、次のコマンドのショートカットです：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse は、ファイル名の拡張子からそのファイルがタブ区切り形式であることを認識します。形式を明示的に指定する必要がある場合は、単に [多様な ClickHouse の入力フォーマット](../../interfaces/formats.md) のいずれかを指定してください。

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` テーブル関数はテーブルを作成し、`DESCRIBE` を使って推論されたスキーマを確認できます。

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
ファイル名にはグロブを使用できます（[グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path)を参照してください）。

例：

```bash
./clickhouse local -q "SELECT * FROM 'reviews*.jsonl'"
./clickhouse local -q "SELECT * FROM 'review_?.csv'"
./clickhouse local -q "SELECT * FROM 'review_{1..3}.csv'"
```

:::

```response
marketplace    Nullable(String)
customer_id    Nullable(Int64)
review_id    Nullable(String)
product_id    Nullable(String)
product_parent    Nullable(Int64)
product_title    Nullable(String)
product_category    Nullable(String)
star_rating    Nullable(Int64)
helpful_votes    Nullable(Int64)
total_votes    Nullable(Int64)
vine    Nullable(String)
verified_purchase    Nullable(String)
review_headline    Nullable(String)
review_body    Nullable(String)
review_date    Nullable(Date)
```

評価が最も高い製品を探してみましょう。

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```


## AWS S3 内の Parquet ファイルをクエリする

S3 にファイルがある場合は、`clickhouse-local` と `s3` テーブル関数を使用して、データを ClickHouse のテーブルに挿入せずに、そのファイルをその場でクエリできます。ここでは、英国で売却された不動産の住宅価格を含む `house_0.parquet` という名前のファイルが、パブリックなバケット内にあります。このファイルに何行含まれているかを確認してみましょう。

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

このファイルには 270万行あります：

```response
2772030
```

ClickHouse がファイルからどのようなスキーマを推論したかを確認しておくと便利です。

```bash
./clickhouse local -q "DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

```response
price    Nullable(Int64)
date    Nullable(UInt16)
postcode1    Nullable(String)
postcode2    Nullable(String)
type    Nullable(String)
is_new    Nullable(UInt8)
duration    Nullable(String)
addr1    Nullable(String)
addr2    Nullable(String)
street    Nullable(String)
locality    Nullable(String)
town    Nullable(String)
district    Nullable(String)
county    Nullable(String)
```

最も高額な地域を見てみましょう。

```bash
./clickhouse local -q "
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 10"
```

```response
LONDON    CITY OF LONDON    886    2271305    █████████████████████████████████████████████▍
LEATHERHEAD    ELMBRIDGE    206    1176680    ███████████████████████▌
LONDON    CITY OF WESTMINSTER    12577    1108221    ██████████████████████▏
LONDON    KENSINGTON AND CHELSEA    8728    1094496    █████████████████████▉
HYTHE    FOLKESTONE AND HYTHE    130    1023980    ████████████████████▍
CHALFONT ST GILES    CHILTERN    113    835754    ████████████████▋
AMERSHAM    BUCKINGHAMSHIRE    113    799596    ███████████████▉
VIRGINIA WATER    RUNNYMEDE    356    789301    ███████████████▊
BARNET    ENFIELD    282    740514    ██████████████▊
NORTHWOOD    THREE RIVERS    184    731609    ██████████████▋
```

:::tip
ファイルを ClickHouse に取り込む準備ができたら、ClickHouse サーバーを起動して、`file` および `s3` テーブル関数の結果を `MergeTree` テーブルに挿入します。詳細については [Quick Start](/get-started/quick-start) を参照してください。
:::


## フォーマット変換

`clickhouse-local` を使用して、異なるフォーマット間でデータを変換できます。例：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

形式はファイル拡張子から自動的に判別されます。

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

簡単に書くには、`--copy` 引数を指定して記述することもできます：

```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 使用方法

デフォルトでは、`clickhouse-local` は同一ホスト上の ClickHouse サーバーのデータにアクセスでき、サーバーの設定には依存しません。`--config-file` 引数を使用してサーバーの設定を読み込むこともできます。一時データ用には、デフォルトで一意の一時データディレクトリが作成されます。

基本的な使用方法（Linux）:

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本的な使い方（Mac）:

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` は、Windows では WSL2 経由でも利用できます。
:::

引数:

* `-S`, `--structure` — 入力データのテーブル構造。
* `--input-format` — 入力フォーマット。デフォルトは `TSV`。
* `-F`, `--file` — データのパス。デフォルトは `stdin`。
* `-q`, `--query` — 実行するクエリ（区切りは `;`）。`--query` は複数回指定可能です（例：`--query "SELECT 1" --query "SELECT 2"`）。`--queries-file` と同時には使用できません。
* `--queries-file` - 実行するクエリを含むファイルパス。`--queries-file` は複数回指定可能です（例：`--query queries1.sql --query queries2.sql`）。`--query` と同時には使用できません。
* `--multiquery, -n` – 指定した場合、セミコロン区切りの複数クエリを `--query` オプションの後に列挙できます。利便性のため、`--query` を省略して `--multiquery` の後にクエリを直接渡すことも可能です。
* `-N`, `--table` — 出力データを書き込むテーブル名。デフォルトは `table`。
* `-f`, `--format`, `--output-format` — 出力フォーマット。デフォルトは `TSV`。
* `-d`, `--database` — デフォルトデータベース。デフォルトは `_local`。
* `--stacktrace` — 例外発生時にデバッグ出力をダンプするかどうか。
* `--echo` — 実行前にクエリを表示します。
* `--verbose` — クエリ実行の詳細をより多く出力します。
* `--logger.console` — コンソールにログを出力します。
* `--logger.log` — ログファイル名。
* `--logger.level` — ログレベル。
* `--ignore-error` — クエリが失敗しても処理を停止しません。
* `-c`, `--config-file` — ClickHouse サーバーと同じ形式の設定ファイルへのパス。デフォルトでは設定は空です。
* `--no-system-tables` — system テーブルをアタッチしません。
* `--help` — `clickhouse-local` の引数リファレンスを表示します。
* `-V`, `--version` — バージョン情報を表示して終了します。

また、`--config-file` の代わりによく用いられる、各 ClickHouse 設定変数に対応する引数も用意されています。


## 例

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
2行読み込み、32.00 B、0.000秒、5182行/秒、80.97 KiB/秒
1   2
3   4
```

先ほどの例は次と同じです。

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
2行読み込み、32.00 B、0.000秒、4987行/秒、77.93 KiB/秒。
1   2
3   4
```

`stdin` や `--file` 引数を使う必要はなく、[`file` テーブル関数](../../sql-reference/table-functions/file.md) を使えば任意の数のファイルを開けます。

```bash
$ echo 1 | tee 1.tsv
1

$ echo 2 | tee 2.tsv
2

$ clickhouse-local --query "
    select * from file('1.tsv', TSV, 'a int') t1
    cross join file('2.tsv', TSV, 'b int') t2"
1    2
```

では、各 Unix ユーザーごとのメモリ使用量を出力してみましょう。

クエリ:

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

結果：

```text
186行、4.15 KiBを0.035秒で読み込み、5302行/秒、118.34 KiB/秒
┏━━━━━━━━━━┳━━━━━━━━━━┓
┃ user     ┃ memTotal ┃
┡━━━━━━━━━━╇━━━━━━━━━━┩
│ bayonet  │    113.5 │
├──────────┼──────────┤
│ root     │      8.8 │
├──────────┼──────────┤
...
```


## 関連コンテンツ {#related-content-1}

- [clickhouse-local を使用してローカルファイル内のデータを抽出、変換、クエリする](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouse へのデータ取り込み - パート 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [大規模な実世界データセットを探索する：ClickHouse で 100 年以上の気象記録を扱う](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- ブログ：[clickhouse-local を使用してローカルファイル内のデータを抽出、変換、クエリする](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
