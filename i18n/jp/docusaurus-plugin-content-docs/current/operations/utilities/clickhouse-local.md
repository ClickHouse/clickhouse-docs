---
description: 'サーバーなしでデータを処理するための clickhouse-local の使用ガイド'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
---


# clickhouse-local

## clickhouse-local と ClickHouse を使うタイミング {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` は、開発者がフルデータベースサーバをインストールすることなく、SQL を使用してローカルおよびリモートファイルを迅速に処理するために最適な、使いやすい ClickHouse のバージョンです。`clickhouse-local` を使用すると、開発者はコマンドラインから直接 SQL コマンド（[ClickHouse SQL 方言](../../sql-reference/index.md)を使用）を利用でき、完全な ClickHouse のインストールなしで ClickHouse の機能にアクセスするシンプルかつ効率的な方法を提供します。`clickhouse-local` の主な利点の1つは、[clickhouse-client](/operations/utilities/clickhouse-local) をインストールする際にすでに含まれていることです。これにより、開発者は複雑なインストールプロセスなしで迅速に `clickhouse-local` を始めることができます。

`clickhouse-local` は、開発やテストの用途、ファイルの処理としては優れたツールですが、エンドユーザーやアプリケーションに対してサービスを提供するには適していません。これらのシナリオでは、オープンソースの [ClickHouse](/install) を使用することをお勧めします。ClickHouse は、大規模な分析負荷を処理するように設計された強力な OLAP データベースです。大規模なデータセットに対する複雑なクエリの迅速かつ効率的な処理を提供し、高パフォーマンスが重要な本番環境での使用に最適です。さらに、ClickHouse は、レプリケーション、シャーディング、高可用性など、大規模データセットを処理し、アプリケーションにサービスを提供するために不可欠な機能を幅広く提供しています。より大規模なデータセットを処理したり、エンドユーザーやアプリケーションにサービスを提供する必要がある場合は、`clickhouse-local` の代わりにオープンソースの ClickHouse を使用することをお勧めします。

以下のドキュメントをお読みください。`clickhouse-local` の例やユースケースが示されています。例えば、[ローカルファイルのクエリ](#query_data_in_file)や[AWS S3 での Parquet ファイルの読み取り](#query-data-in-a-parquet-file-in-aws-s3)などです。

## clickhouse-local のダウンロード {#download-clickhouse-local}

`clickhouse-local` は、ClickHouse サーバと `clickhouse-client` を実行するのと同じ `clickhouse` バイナリを使用して実行されます。最新バージョンをダウンロードする最も簡単な方法は、以下のコマンドを使用することです。

```bash
curl https://clickhouse.com/ | sh
```

:::note
ダウンロードしたバイナリは、さまざまな ClickHouse ツールやユーティリティを実行できます。ClickHouse をデータベースサーバとして実行したい場合は、[クイックスタート](../../quick-start.mdx)をチェックしてください。
:::

## SQL を使用してファイル内のデータをクエリする {#query_data_in_file}

`clickhouse-local` の一般的な使用法は、ファイルに対してアドホッククエリを実行することです。データをテーブルに挿入する必要はありません。`clickhouse-local` は、ファイルからデータをストリームし、テンポラリテーブルにデータを読み込んで SQL を実行できます。

ファイルが `clickhouse-local` と同じマシンにある場合は、単純に読み込むファイルを指定するだけで済みます。以下の `reviews.tsv` ファイルには、Amazon プロダクトレビューのサンプルが含まれています。

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

このコマンドは次のショートカットです：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse は、ファイル名の拡張子からファイルがタブ区切り形式であることを認識します。形式を明示的に指定する必要がある場合は、[多くの ClickHouse 入力形式](../../interfaces/formats.md)のいずれかを追加します：
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` テーブル関数はテーブルを作成し、`DESCRIBE` を使用して推論されたスキーマを見ることができます：

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
ファイル名でグロブを使用することが許可されています（[グロブ置換]( /sql-reference/table-functions/file.md/#globs-in-path)を参照）。

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

最高評価の商品を見つけてみましょう：

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```

## AWS S3 の Parquet ファイル内のデータをクエリする {#query-data-in-a-parquet-file-in-aws-s3}

S3 内にファイルがある場合は、`clickhouse-local` と `s3` テーブル関数を使用して、ClickHouse テーブルにデータを挿入することなく、ファイルをそのままクエリします。公的バケットに `house_0.parquet` というファイルがあり、これはイギリスで販売された不動産の価格が含まれています。行数を確認してみましょう：

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

このファイルには 2.7M 行があります：

```response
2772030
```

ClickHouse がファイルから判断する推論されたスキーマを見ることは常に便利です：

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

最も高額な地域を確認してみましょう：

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
ファイルを ClickHouse に挿入する準備ができたら、ClickHouse サーバを起動し、`file` および `s3` テーブル関数の結果を `MergeTree` テーブルに挿入してください。詳細については、[クイックスタート](../../quick-start.mdx)を参照してください。
:::

## フォーマット変換 {#format-conversions}

`clickhouse-local` を使用して、異なるフォーマット間でデータを変換できます。例：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

フォーマットはファイル拡張子から自動的に検出されます：

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

ショートカットとして、`--copy` 引数を使用して書くこともできます：
```bash
$ clickhouse-local --copy < data.json > data.csv
```

## 使用法 {#usage}

デフォルトの `clickhouse-local` は、同じホスト上の ClickHouse サーバのデータにアクセスでき、サーバの設定には依存しません。`--config-file` 引数を使用してサーバ構成をロードすることもサポートしています。テンポラリデータ用に、デフォルトでユニークな一時データディレクトリが作成されます。

基本的な使用法（Linux）：

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本的な使用法（Mac）：

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` は WSL2 を通じて Windows でもサポートされています。
:::

引数：

- `-S`, `--structure` — 入力データのテーブル構造。
- `--input-format` — 入力フォーマット、デフォルトは `TSV`。
- `-F`, `--file` — データのパス、デフォルトは `stdin`。
- `-q`, `--query` — `;` を区切りとして実行するクエリ。`--query` は複数回指定可能、例えば `--query "SELECT 1" --query "SELECT 2"` 。`--queries-file` と同時に使用することはできません。
- `--queries-file` - 実行するクエリを含むファイルパス。`--queries-file` は複数回指定可能、例えば `--query queries1.sql --query queries2.sql` 。`--query` と同時に使用することはできません。
- `--multiquery, -n` – 指定した場合、`;` で区切られた複数のクエリを `--query` オプションの後にリストできます。便宜上、`--query` を省略してクエリを `--multiquery` の後に直接渡すことができます。
- `-N`, `--table` — 出力データを置くテーブル名、デフォルトは `table`。
- `-f`, `--format`, `--output-format` — 出力フォーマット、デフォルトは `TSV`。
- `-d`, `--database` — デフォルトデータベース、デフォルトは `_local`。
- `--stacktrace` — 例外が発生した場合にデバッグ出力をダンプするかどうか。
- `--echo` — 実行前にクエリを印刷。
- `--verbose` — クエリ実行の詳細情報。
- `--logger.console` — コンソールにログを出力。
- `--logger.log` — ログファイル名。
- `--logger.level` — ログレベル。
- `--ignore-error` — クエリが失敗した場合でも処理を停止しない。
- `-c`, `--config-file` — ClickHouse サーバと同じフォーマットの構成ファイルのパス、デフォルトでは構成は空。
- `--no-system-tables` — システムテーブルを添付しない。
- `--help` — `clickhouse-local` の引数リファレンス。
- `-V`, `--version` — バージョン情報を表示して終了。

また、`--config-file` の代わりにより一般的に使用される ClickHouse の各構成変数の引数もあります。

## 例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前の例は次と同じです：

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin` や `--file` 引数を使用する必要はなく、[`file` テーブル関数](../../sql-reference/table-functions/file.md)を使用して任意の数のファイルを開くことができます：

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

さて、各 Unix ユーザーのメモリ使用量を表示してみましょう：

クエリ：

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

結果：

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

## 関連内容 {#related-content-1}

- [clickhouse-local を使用してローカルファイルの抽出、変換、およびクエリを実行する](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouse にデータを取り込む - パート 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [大規模な実データセットの探索: ClickHouse における 100 年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- ブログ: [clickhouse-local を使用してローカルファイルの抽出、変換、およびクエリを実行する](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
