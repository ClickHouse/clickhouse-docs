---
description: 'Guide to using clickhouse-local for processing data without a server'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: '/operations/utilities/clickhouse-local'
title: 'clickhouse-local'
---





# clickhouse-local

## clickhouse-local と ClickHouse を使い分けるタイミング {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` は、完全なデータベースサーバーをインストールすることなく、SQL を使用してローカルおよびリモートファイルの高速処理を行う必要がある開発者に理想的な、使いやすい ClickHouse のバージョンです。`clickhouse-local` を使用すると、開発者はコマンドラインから直接 [ClickHouse SQL ダイアレクト](../../sql-reference/index.md) を使用して SQL コマンドを実行でき、完全な ClickHouse のインストールなしで ClickHouse の機能に簡単かつ効率的にアクセスできます。`clickhouse-local` の主な利点の1つは、[clickhouse-client](/operations/utilities/clickhouse-local) をインストールする際にすでに含まれていることです。これにより、複雑なインストールプロセスを必要とせずに、開発者は迅速に `clickhouse-local` を始めることができます。

`clickhouse-local` は、開発およびテスト目的、そしてファイルの処理に優れたツールですが、エンドユーザーやアプリケーションにサービスを提供するには適していません。このようなシナリオでは、オープンソースの [ClickHouse](/install) の使用をお勧めします。ClickHouse は、大規模な分析ワークロードを処理するために設計された強力な OLAP データベースです。大規模なデータセットに対して複雑なクエリを高速かつ効率的に処理し、高パフォーマンスが重要な本番環境での使用に理想的です。さらに、ClickHouse は、スケールアップして大規模なデータセットを処理しアプリケーションにサービスを提供するために必要不可欠なレプリケーション、シャーディング、高可用性などの幅広い機能を提供します。より大きなデータセットを処理したり、エンドユーザーやアプリケーションにサービスを提供する必要がある場合は、`clickhouse-local` の代わりにオープンソースの ClickHouse を使用することをお勧めします。

以下のドキュメントを読んで、`clickhouse-local` の使用例を確認してください。例えば、[ローカルファイルのクエリ](#query_data_in_file)や、[S3 の Parquet ファイルの読み取り](#query-data-in-a-parquet-file-in-aws-s3)などです。

## clickhouse-local のダウンロード {#download-clickhouse-local}

`clickhouse-local` は、ClickHouse サーバーや `clickhouse-client` を実行するのと同じ `clickhouse` バイナリを使用して実行されます。最新バージョンをダウンロードする最も簡単な方法は、次のコマンドを使用することです：

```bash
curl https://clickhouse.com/ | sh
```

:::note
ダウンロードしたバイナリは、様々な ClickHouse ツールやユーティリティを実行できます。ClickHouse をデータベースサーバーとして実行したい場合は、[クイックスタート](../../quick-start.mdx)を確認してください。
:::

## SQL を使用してファイルのデータをクエリする {#query_data_in_file}

`clickhouse-local` の一般的な使用法は、ファイルに対するアドホッククエリを実行することです：テーブルにデータを挿入する必要はありません。`clickhouse-local` は、ファイルからデータをストリームし、一時的なテーブルにデータを流し込み、あなたの SQL を実行できます。

ファイルが `clickhouse-local` と同じマシンにある場合、単に読み込むファイルを指定できます。以下の `reviews.tsv` ファイルには、Amazon の製品レビューのサンプリングが含まれています：

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

このコマンドは以下のショートカットです：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse は、ファイル名の拡張子からそのファイルがタブ区切り形式であることを認識します。形式を明示的に指定する必要がある場合は、多くの [ClickHouse 入力形式](../../interfaces/formats.md) のいずれかを追加してください：
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` テーブル関数はテーブルを作成し、`DESCRIBE` を使用して推測されたスキーマを見ることができます：

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
ファイル名にワイルドカードを使用することが許可されています（[パスのワイルドカード置換](http://sql-reference/table-functions/file.md/#globs-in-path)を参照）。

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

最高評価の商品を見つけましょう：

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```

## AWS S3 の Parquet ファイルのデータをクエリする {#query-data-in-a-parquet-file-in-aws-s3}

S3 にファイルがある場合は、`clickhouse-local` と `s3` テーブル関数を使用して、ClickHouse テーブルにデータを挿入することなく、ファイルをそのままクエリすることができます。英国で販売された不動産の価格を含む `house_0.parquet` という名前のファイルがあります。このファイルに何行あるか見てみましょう：

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

このファイルは 2.7M 行あります：

```response
2772030
```

ClickHouse がファイルから決定する推測されたスキーマを見るのは常に便利です：

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

最も高価な地域を見てみましょう：

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
ファイルを ClickHouse に挿入する準備ができたら、ClickHouse サーバーを起動し、`file` と `s3` テーブル関数の結果を `MergeTree` テーブルに挿入してください。詳細は [クイックスタート](../../quick-start.mdx) を参照してください。
:::


## フォーマット変換 {#format-conversions}

`clickhouse-local` を使用して、異なるフォーマット間でデータを変換できます。例：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

フォーマットはファイルの拡張子から自動的に検出されます：

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

ショートカットとして、`--copy` 引数を使用することもできます：
```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 使用法 {#usage}

デフォルトでは、`clickhouse-local` は同じホスト上の ClickHouse サーバーのデータにアクセスでき、サーバーの設定には依存しません。また、`--config-file` 引数を使用してサーバー構成を読み込むこともサポートしています。一時データの場合は、デフォルトで一意の一時データディレクトリが作成されます。

基本的な使用法（Linux）：

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本的な使用法（Mac）：

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` は、WSL2 を通して Windows でもサポートされています。
:::

引数：

- `-S`, `--structure` — 入力データのテーブル構造。
- `--input-format` — 入力フォーマット、デフォルトは `TSV`。
- `-F`, `--file` — データのパス、デフォルトは `stdin`。
- `-q`, `--query` — クエリを実行、区切りは `;`。`--query` は複数回指定可能、例：`--query "SELECT 1" --query "SELECT 2"`。`--queries-file` と同時には使用できません。
- `--queries-file` - 実行するクエリを含むファイルパス。`--queries-file` は複数回指定可能、例：`--query queries1.sql --query queries2.sql`。`--query` と同時には使用できません。
- `--multiquery, -n` – 指定した場合、`--query` オプションの後にセミコロンで区切られた複数のクエリを列挙できます。便利なことに、`--query` を省略して直接 `--multiquery` の後にクエリを渡すことも可能です。
- `-N`, `--table` — 出力データを保存するテーブル名。デフォルトは `table`。
- `-f`, `--format`, `--output-format` — 出力フォーマット。デフォルトは `TSV`。
- `-d`, `--database` — デフォルトデータベース、デフォルトは `_local`。
- `--stacktrace` — 例外が発生した場合にデバッグ出力をダンプするかどうか。
- `--echo` — 実行前にクエリを印刷。
- `--verbose` — クエリ実行の詳細。
- `--logger.console` — コンソールにログを記録。
- `--logger.log` — ログファイル名。
- `--logger.level` — ログレベル。
- `--ignore-error` — クエリが失敗した場合も処理を停止しない。
- `-c`, `--config-file` — ClickHouse サーバー用の設定ファイルへのパス。デフォルトでは構成は空。
- `--no-system-tables` — システムテーブルをアタッチしない。
- `--help` — `clickhouse-local` の引数リファレンス。
- `-V`, `--version` — バージョン情報を印刷して終了します。

また、`--config-file` の代わりに一般的に使用される ClickHouse 構成変数に対する引数もあります。


## 例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前の例は以下と同じです：

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin` または `--file` 引数を使用する必要はなく、任意の数のファイルを [`file` テーブル関数](../../sql-reference/table-functions/file.md) を使用して開くことができます：

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

次に、各 Unix ユーザーのメモリ使用量を出力しましょう：

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

## 関連コンテンツ {#related-content-1}

- [clickhouse-local を使用してローカルファイル内のデータを抽出、変換、クエリする](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouse にデータを取り込む - パート 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [大規模な実世界のデータセットを探索する：ClickHouse における100年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- ブログ：[clickhouse-local を使用してローカルファイル内のデータを抽出、変換、クエリする](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
