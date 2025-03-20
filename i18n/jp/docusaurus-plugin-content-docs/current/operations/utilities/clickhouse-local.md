---
slug: /operations/utilities/clickhouse-local
sidebar_position: 60
sidebar_label: clickhouse-local
---


# clickhouse-local

## 関連コンテンツ {#related-content}

- ブログ: [clickhouse-localを使ってローカルファイルのデータを抽出、変換、クエリする](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)

## clickhouse-local と ClickHouse の使い分け {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` は、ローカルおよびリモートファイルに対して SQL を使用して迅速に処理を行いたい開発者向けの使いやすい ClickHouse のバージョンです。これにより、フルデータベースサーバーをインストールすることなく、コマンドラインから [ClickHouse SQL ダイアレクト](../../sql-reference/index.md) を直接使用して SQL コマンドを実行する、シンプルかつ効率的な方法で ClickHouse の機能にアクセスできます。`clickhouse-local` の主な利点の一つは、[clickhouse-client](/operations/utilities/clickhouse-local) をインストールする際に既に含まれていることです。これにより、開発者は複雑なインストールプロセスを必要とせずに、迅速に `clickhouse-local` を開始できます。

`clickhouse-local` は開発やテスト目的、ファイルの処理に最適なツールですが、最終ユーザーやアプリケーションに提供するためのものではありません。そうしたシナリオでは、オープンソースの [ClickHouse](/install) を使用することをお勧めします。ClickHouse は、大規模な分析ワークロードを処理するように設計された強力な OLAP データベースです。大規模なデータセットに対する複雑なクエリの迅速かつ効率的な処理を提供し、高性能が重要な本番環境での使用に適しています。さらに、ClickHouse では、レプリケーション、シャーディング、高可用性といった幅広い機能を提供しており、大規模なデータセットを処理し、アプリケーションに提供するために必要なものです。より大きなデータセットを処理したり、最終ユーザーやアプリケーションにサービスを提供する必要がある場合は、`clickhouse-local` の代わりにオープンソースの ClickHouse を使用することをお勧めします。

以下のドキュメントをお読みください。`clickhouse-local` の使用例として、[ローカルファイルのクエリ](#query_data_in_file) や [AWS S3 での Parquet ファイルの読み取り](#query-data-in-a-parquet-file-in-aws-s3) が示されています。

## clickhouse-local のダウンロード {#download-clickhouse-local}

`clickhouse-local` は、ClickHouse サーバーおよび `clickhouse-client` を実行するのと同じ `clickhouse` バイナリを使用して実行されます。最新バージョンをダウンロードする最も簡単な方法は、次のコマンドです：

```bash
curl https://clickhouse.com/ | sh
```

:::note
ダウンロードしたバイナリは、さまざまな ClickHouse ツールやユーティリティを実行できます。ClickHouse をデータベースサーバーとして実行したい場合は、[クイックスタート](../../quick-start.mdx)を参照してください。
:::

## SQL を使ってファイル内のデータをクエリする {#query_data_in_file}

`clickhouse-local` の一般的な用途は、ファイルに対してアドホッククエリを実行することです。データをテーブルに挿入する必要がありません。`clickhouse-local` は、ファイルからデータをストリーミングして一時テーブルに移し、SQL を実行できます。

ファイルが `clickhouse-local` と同じマシン上にある場合は、単に読み込むファイルを指定するだけで済みます。次の `reviews.tsv` ファイルには、Amazon の商品レビューのサンプルが含まれています：

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

このコマンドは次のショートカットです：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse は、ファイル名の拡張子からファイルがタブ区切り形式であることを認識します。形式を明示的に指定する必要がある場合は、[多くの ClickHouse 入力形式](../../interfaces/formats.md) のいずれかを追加してください：
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` テーブル関数はテーブルを作成し、`DESCRIBE` を使用して推測されたスキーマを見ることができます：

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
ファイル名にグロブを使用することが許可されています（[グロブの置換](https://sql-reference/table-functions/file.md/#globs-in-path)を参照）。

例：

```bash
./clickhouse local -q "SELECT * FROM 'reviews*.jsonl'"
./clickhouse local -q "SELECT * FROM 'review_?.csv'"
./clickhouse local -q "SELECT * FROM 'review_{1..3}.csv'"
```

:::

```response
marketplace	Nullable(String)
customer_id	Nullable(Int64)
review_id	Nullable(String)
product_id	Nullable(String)
product_parent	Nullable(Int64)
product_title	Nullable(String)
product_category	Nullable(String)
star_rating	Nullable(Int64)
helpful_votes	Nullable(Int64)
total_votes	Nullable(Int64)
vine	Nullable(String)
verified_purchase	Nullable(String)
review_headline	Nullable(String)
review_body	Nullable(String)
review_date	Nullable(Date)
```

評価が最も高い商品を見つけてみましょう：

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game	5
```

## AWS S3のParquetファイル内のデータをクエリする {#query-data-in-a-parquet-file-in-aws-s3}

S3内にファイルがある場合は、`clickhouse-local` と `s3` テーブル関数を使用して、ClickHouse テーブルにデータを挿入することなくファイルをそのままクエリできます。イギリスで販売された物件の価格を含む `house_0.parquet` という名前のファイルが公開バケットにあります。それに行数がいくつあるか見てみましょう：

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

ファイルには 2.7M 行があります：

```response
2772030
```

ClickHouse がファイルから判断する推測されたスキーマを見るのは常に有用です：

```bash
./clickhouse local -q "DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

```response
price	Nullable(Int64)
date	Nullable(UInt16)
postcode1	Nullable(String)
postcode2	Nullable(String)
type	Nullable(String)
is_new	Nullable(UInt8)
duration	Nullable(String)
addr1	Nullable(String)
addr2	Nullable(String)
street	Nullable(String)
locality	Nullable(String)
town	Nullable(String)
district	Nullable(String)
county	Nullable(String)
```

最も高価な地区を見てみましょう：

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
LONDON	CITY OF LONDON	886	2271305	█████████████████████████████████████████████▍
LEATHERHEAD	ELMBRIDGE	206	1176680	███████████████████████▌
LONDON	CITY OF WESTMINSTER	12577	1108221	██████████████████████▏
LONDON	KENSINGTON AND CHELSEA	8728	1094496	█████████████████████▉
HYTHE	FOLKESTONE AND HYTHE	130	1023980	████████████████████▍
CHALFONT ST GILES	CHILTERN	113	835754	████████████████▋
AMERSHAM	BUCKINGHAMSHIRE	113	799596	███████████████▉
VIRGINIA WATER	RUNNYMEDE	356	789301	███████████████▊
BARNET	ENFIELD	282	740514	██████████████▊
NORTHWOOD	THREE RIVERS	184	731609	██████████████▋
```

:::tip
ファイルを ClickHouse に挿入する準備ができたら、ClickHouse サーバーを起動し、`file` および `s3` テーブル関数の結果を `MergeTree` テーブルに挿入します。詳細については、[クイックスタート](../../quick-start.mdx)を参照してください。
:::


## フォーマット変換 {#format-conversions}

`clickhouse-local` を使用して、異なるフォーマット間でデータを変換できます。例：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

フォーマットはファイル拡張子から自動検出されます：

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

ショートカットとして、`--copy` 引数を使用して書くこともできます：
```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 使い方 {#usage}

デフォルトでは、`clickhouse-local` は同じホスト上の ClickHouse サーバーのデータにアクセスでき、サーバーの構成には依存しません。また、`--config-file` 引数を使用してサーバー構成の読み込みもサポートしています。テンポラリデータの場合、デフォルトで一意のテンポラリデータディレクトリが作成されます。

基本的な使い方（Linux）：

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本的な使い方（Mac）：

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` は WSL2 を介して Windows でもサポートされています。
:::

引数：

- `-S`, `--structure` — 入力データ用のテーブル構造。
- `--input-format` — 入力形式、デフォルトは `TSV`。
- `-F`, `--file` — データのパス、デフォルトは `stdin`。
- `-q`, `--query` — `;` を区切りとして実行するクエリ。`--query` は複数回指定可能で、例: `--query "SELECT 1" --query "SELECT 2"`。`--queries-file` と同時には使用できません。
- `--queries-file` - 実行するクエリのファイルパス。`--queries-file` は複数回指定可能で、例: `--query queries1.sql --query queries2.sql`。`--query` と同時には使用できません。
- `--multiquery, -n` – 指定された場合、複数のクエリをセミコロンで区切って `--query` オプションの後に列挙できます。便宜上 `--query` を省略し、クエリを `--multiquery` の後に直接渡すことも可能です。
- `-N`, `--table` — 出力データを入れるテーブル名、デフォルトは `table`。
- `-f`, `--format`, `--output-format` — 出力形式、デフォルトは `TSV`。
- `-d`, `--database` — デフォルトデータベース、デフォルトは `_local`。
- `--stacktrace` — 例外が発生した場合にデバッグ出力をダンプするかどうか。
- `--echo` — 実行前にクエリを表示する。
- `--verbose` — クエリ実行に関する詳細情報。
- `--logger.console` — コンソールにログを記録。
- `--logger.log` — ログファイル名。
- `--logger.level` — ログレベル。
- `--ignore-error` — クエリが失敗しても処理を停止しない。
- `-c`, `--config-file` — ClickHouse サーバーと同じ形式の構成ファイルのパス、デフォルトは空の構成。
- `--no-system-tables` — システムテーブルを接続しない。
- `--help` — `clickhouse-local` の引数リファレンス。
- `-V`, `--version` — バージョン情報を表示して終了。

また、`--config-file` の代わりに一般的に使用される ClickHouse 構成変数ごとの引数もあります。


## 例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前の例は次のように同じです：

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin` や `--file` 引数を使う必要はなく、多数のファイルを [`file` テーブル関数](../../sql-reference/table-functions/file.md) を使って開くことができます：

```bash
$ echo 1 | tee 1.tsv
1

$ echo 2 | tee 2.tsv
2

$ clickhouse-local --query "
    select * from file('1.tsv', TSV, 'a int') t1
    cross join file('2.tsv', TSV, 'b int') t2"
1	2
```

各 Unix ユーザーのメモリ使用量を出力してみましょう：

クエリ：

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

結果：

``` text
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

- [clickhouse-localを使ってローカルファイルのデータを抽出、変換、クエリする](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouse へのデータの投入 - パート 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [大規模な実データセットを探索する：ClickHouse における 100 年以上の気象記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
