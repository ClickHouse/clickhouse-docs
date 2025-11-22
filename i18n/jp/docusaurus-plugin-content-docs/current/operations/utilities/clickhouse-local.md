---
description: 'サーバーを必要とせずにデータを処理するための clickhouse-local の利用ガイド'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
doc_type: 'reference'
---



# clickhouse-local



## clickhouse-localとClickHouseの使い分け {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local`は、完全なデータベースサーバーをインストールすることなく、SQLを使用してローカルおよびリモートファイルを高速処理する必要がある開発者に最適な、使いやすいバージョンのClickHouseです。`clickhouse-local`を使用すると、開発者はコマンドラインから直接SQLコマンド([ClickHouse SQLダイアレクト](../../sql-reference/index.md)を使用)を実行でき、完全なClickHouseのインストールを必要とせずにClickHouseの機能にアクセスできるシンプルで効率的な方法を提供します。`clickhouse-local`の主な利点の1つは、[clickhouse-client](/operations/utilities/clickhouse-local)のインストール時にすでに含まれていることです。これにより、開発者は複雑なインストールプロセスを経ることなく、`clickhouse-local`をすぐに使い始めることができます。

`clickhouse-local`は開発およびテスト目的、ファイル処理には優れたツールですが、エンドユーザーやアプリケーションへのサービス提供には適していません。このような場合は、オープンソースの[ClickHouse](/install)を使用することを推奨します。ClickHouseは大規模な分析ワークロードを処理するように設計された強力なOLAPデータベースです。大規模データセットに対する複雑なクエリを高速かつ効率的に処理し、高性能が求められる本番環境での使用に最適です。さらに、ClickHouseはレプリケーション、シャーディング、高可用性などの幅広い機能を提供しており、これらは大規模データセットの処理とアプリケーションへのサービス提供のためのスケールアップに不可欠です。より大規模なデータセットを処理する必要がある場合、またはエンドユーザーやアプリケーションにサービスを提供する場合は、`clickhouse-local`ではなくオープンソースのClickHouseを使用することを推奨します。

[ローカルファイルのクエリ](#query_data_in_file)や[S3内のParquetファイルの読み取り](#query-data-in-a-parquet-file-in-aws-s3)など、`clickhouse-local`のユースケース例を示す以下のドキュメントをご参照ください。


## clickhouse-localのダウンロード {#download-clickhouse-local}

`clickhouse-local`は、ClickHouseサーバーや`clickhouse-client`を実行する際と同じ`clickhouse`バイナリを使用して実行されます。最新バージョンをダウンロードする最も簡単な方法は、以下のコマンドを使用することです。

```bash
curl https://clickhouse.com/ | sh
```

:::note
ダウンロードしたバイナリでは、さまざまなClickHouseツールやユーティリティを実行できます。ClickHouseをデータベースサーバーとして実行したい場合は、[クイックスタート](/get-started/quick-start)を参照してください。
:::


## SQLを使用してファイル内のデータをクエリする {#query_data_in_file}

`clickhouse-local`の一般的な用途は、ファイルに対してアドホッククエリを実行することです。データをテーブルに挿入する必要がありません。`clickhouse-local`は、ファイルからデータを一時テーブルにストリーミングし、SQLを実行できます。

ファイルが`clickhouse-local`と同じマシン上にある場合は、読み込むファイルを指定するだけです。以下の`reviews.tsv`ファイルには、Amazonの製品レビューのサンプルが含まれています:

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

このコマンドは次のショートカットです:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouseは、ファイル名の拡張子からファイルがタブ区切り形式を使用していることを認識します。形式を明示的に指定する必要がある場合は、[多数のClickHouse入力形式](../../interfaces/formats.md)のいずれかを追加するだけです:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file`テーブル関数はテーブルを作成し、`DESCRIBE`を使用して推論されたスキーマを確認できます:

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
ファイル名にグロブを使用できます([グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path)を参照)。

例:

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

最高評価の製品を見つけてみましょう:

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```


## AWS S3上のParquetファイル内のデータをクエリする {#query-data-in-a-parquet-file-in-aws-s3}

S3にファイルがある場合、`clickhouse-local`と`s3`テーブル関数を使用して、ClickHouseテーブルにデータを挿入せずにファイルを直接クエリできます。パブリックバケットに`house_0.parquet`という名前のファイルがあり、イギリスで販売された不動産の住宅価格が含まれています。行数を確認してみましょう:

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

このファイルには270万行が含まれています:

```response
2772030
```

ClickHouseがファイルから推論したスキーマを確認することは常に有用です:

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

最も高額な地域を確認してみましょう:

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
ファイルをClickHouseに挿入する準備ができたら、ClickHouseサーバーを起動し、`file`および`s3`テーブル関数の結果を`MergeTree`テーブルに挿入してください。詳細については[クイックスタート](/get-started/quick-start)を参照してください。
:::


## フォーマット変換 {#format-conversions}

`clickhouse-local`を使用して、異なるフォーマット間でデータを変換できます。例:

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

フォーマットはファイル拡張子から自動検出されます:

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

ショートカットとして、`--copy`引数を使用して記述することもできます:

```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 使用方法 {#usage}

デフォルトでは、`clickhouse-local`は同一ホスト上のClickHouseサーバーのデータにアクセスでき、サーバーの設定に依存しません。また、`--config-file`引数を使用してサーバー設定の読み込みもサポートしています。一時データ用には、デフォルトで一意の一時データディレクトリが作成されます。

基本的な使用方法(Linux):

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本的な使用方法(Mac):

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local`はWSL2を通じてWindowsでもサポートされています。
:::

引数:

- `-S`, `--structure` — 入力データのテーブル構造。
- `--input-format` — 入力フォーマット。デフォルトは`TSV`。
- `-F`, `--file` — データへのパス。デフォルトは`stdin`。
- `-q`, `--query` — 実行するクエリ。`;`を区切り文字として使用。`--query`は複数回指定可能。例: `--query "SELECT 1" --query "SELECT 2"`。`--queries-file`と同時に使用することはできません。
- `--queries-file` - 実行するクエリを含むファイルパス。`--queries-file`は複数回指定可能。例: `--queries-file queries1.sql --queries-file queries2.sql`。`--query`と同時に使用することはできません。
- `--multiquery, -n` – 指定した場合、セミコロンで区切られた複数のクエリを`--query`オプションの後に記述できます。利便性のため、`--query`を省略して`--multiquery`の直後にクエリを渡すことも可能です。
- `-N`, `--table` — 出力データを格納するテーブル名。デフォルトは`table`。
- `-f`, `--format`, `--output-format` — 出力フォーマット。デフォルトは`TSV`。
- `-d`, `--database` — デフォルトデータベース。デフォルトは`_local`。
- `--stacktrace` — 例外発生時にデバッグ出力をダンプするかどうか。
- `--echo` — 実行前にクエリを出力。
- `--verbose` — クエリ実行の詳細情報を表示。
- `--logger.console` — コンソールにログを出力。
- `--logger.log` — ログファイル名。
- `--logger.level` — ログレベル。
- `--ignore-error` — クエリが失敗しても処理を停止しない。
- `-c`, `--config-file` — ClickHouseサーバーと同じフォーマットの設定ファイルへのパス。デフォルトでは設定は空。
- `--no-system-tables` — システムテーブルをアタッチしない。
- `--help` — `clickhouse-local`の引数リファレンス。
- `-V`, `--version` — バージョン情報を出力して終了。

また、`--config-file`の代わりによく使用される、各ClickHouse設定変数用の引数も存在します。


## 例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前述の例は次と同じです:

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin`や`--file`引数を使用する必要はありません。[`file`テーブル関数](../../sql-reference/table-functions/file.md)を使用して任意の数のファイルを開くことができます:

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

次に、各Unixユーザーのメモリ使用量を出力してみましょう:

クエリ:

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

結果:

```text
Read 186 rows, 4.15 KiB in 0.035 sec., 5302 rows/sec., 118.34 KiB/sec.
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

- [clickhouse-localを使用したローカルファイルのデータ抽出、変換、クエリ](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouseへのデータ取り込み - Part 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [大規模な実世界データセットの探索: ClickHouseにおける100年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- ブログ: [clickhouse-localを使用したローカルファイルのデータ抽出、変換、クエリ](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
