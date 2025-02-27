---
slug: /operations/utilities/clickhouse-local
sidebar_position: 60
sidebar_label: clickhouse-local
---

# clickhouse-local

## 関連コンテンツ {#related-content}

- ブログ: [clickhouse-localを使用したローカルファイルのデータ抽出、変換、クエリ](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)

## clickhouse-localをいつ使用するか vs. ClickHouse {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local`は、SQLを使用してローカルおよびリモートファイルの高速処理を行う必要がある開発者向けの使いやすいClickHouseのバージョンです。フルデータベースサーバーをインストールする必要がありません。`clickhouse-local`を使用すると、開発者は[ClickHouse SQL方言](../../sql-reference/index.md)を使用してコマンドラインから直接SQLコマンドを実行でき、フルのClickHouseインストールがなくてもClickHouseの機能に簡単かつ効率的にアクセスできます。`clickhouse-local`の主な利点の1つは、[clickhouse-client](/integrations/sql-clients/clickhouse-client-local)をインストールするときに既に含まれていることです。これにより、開発者は複雑なインストールプロセスなしに迅速に`clickhouse-local`を始めることができます。

`clickhouse-local`は、開発およびテスト目的やファイル処理に非常に便利なツールですが、エンドユーザーやアプリケーションに対してサービスを提供するには適していません。このようなシナリオでは、オープンソースの[ClickHouse](/install)を使用することをお勧めします。ClickHouseは、大規模な分析ワークロードを処理するために設計された強力なOLAPデータベースです。大規模データセットに対して複雑なクエリを迅速かつ効率的に処理できるため、高パフォーマンスが重要な本番環境での使用に最適です。さらに、ClickHouseはレプリケーション、シャーディング、高可用性など、データセットをスケーリングしてアプリケーションを提供するために不可欠な幅広い機能を提供します。より大規模なデータセットを扱う必要がある場合やエンドユーザーやアプリケーションを提供する場合は、`clickhouse-local`の代わりにオープンソースのClickHouseを使用することをお勧めします。

`clickhouse-local`の使用例（[ローカルファイルのクエリ](#query_data_in_file)や[S3内のparquetファイルの読み取り](#query-data-in-a-parquet-file-in-aws-s3)など）を示す以下のドキュメントをお読みください。

## clickhouse-localのダウンロード {#download-clickhouse-local}

`clickhouse-local`は、ClickHouseサーバーおよび`clickhouse-client`を実行するのと同じ`clickhouse`バイナリを使用して実行されます。最新バージョンをダウンロードする最も簡単な方法は、次のコマンドを使用することです:

```bash
curl https://clickhouse.com/ | sh
```

:::note
あなたがダウンロードしたバイナリは、様々なClickHouseツールやユーティリティを実行できます。ClickHouseをデータベースサーバーとして実行したい場合は、[クイックスタート](../../quick-start.mdx)を確認してください。
:::

## SQLを使用してファイル内のデータをクエリ {#query_data_in_file}

`clickhouse-local`の一般的な使用法は、テーブルにデータを挿入することなくファイルに対してアドホッククエリを実行することです。`clickhouse-local`は、ファイルからデータをストリーミングして一時テーブルに読み込み、SQLを実行することができます。

ファイルが`clickhouse-local`と同じマシンにある場合、ロードするファイルを単に指定することができます。以下の`reviews.tsv`ファイルには、Amazonの製品レビューのサンプルが含まれています:

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

このコマンドは、次のショートカットです:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouseはファイル名の拡張子から、ファイルがタブ区切り形式であることを認識します。形式を明示的に指定する必要がある場合は、[多くのClickHouse入力形式](../../interfaces/formats.md)の1つを追加できます:
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file`テーブル関数はテーブルを作成し、`DESCRIBE`を使用して推論されたスキーマを確認できます:

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
ファイル名にグロブを使用することが許可されています（[グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path)を参照）。

例えば:

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

最高評価の製品を見つけてみましょう:

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game	5
```

## AWS S3のParquetファイル内のデータをクエリ {#query-data-in-a-parquet-file-in-aws-s3}

S3にファイルがある場合、`clickhouse-local`と`s3`テーブル関数を使用して、ファイルをそのままクエリできます（ClickHouseテーブルにデータを挿入せずに）。イギリスで販売された物件の価格を含む`house_0.parquet`という名前のファイルが公開バケットにあります。何行あるか見てみましょう:

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

このファイルには2.7M行があります:

```response
2772030
```

ClickHouseがファイルから推論するスキーマを確認するのは常に役立ちます:

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

最も高価な地区を見てみましょう:

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
ファイルをClickHouseに挿入する準備が整ったら、ClickHouseサーバーを起動し、`file`および`s3`テーブル関数の結果を`MergeTree`テーブルに挿入してください。詳細については[クイックスタート](../../quick-start.mdx)を参照してください。
:::


## フォーマット変換 {#format-conversions}

`clickhouse-local`を使用して、異なるフォーマット間でデータを変換できます。例:

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

フォーマットはファイル拡張子から自動的に検出されます:

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

ショートカットとして、`--copy`引数を使用して書くこともできます:
```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 使用法 {#usage}

デフォルトでは、`clickhouse-local`は同じホスト上のClickHouseサーバーのデータにアクセスでき、サーバーの構成に依存しません。また、`--config-file`引数を使用してサーバー構成をロードすることもサポートしています。一時データの場合、デフォルトでユニークな一時データディレクトリが作成されます。

基本的な使用法（Linux）:

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本的な使用法（Mac）:

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local`はWSL2を通じてWindowsでもサポートされています。
:::

引数:

- `-S`, `--structure` — 入力データのテーブルスキーマ。
- `--input-format` — 入力フォーマット、デフォルトは`TSV`。
- `-F`, `--file` — データへのパス、デフォルトは`stdin`。
- `-q`, `--query` — `;`を区切り文字として実行するクエリ。`--query`は複数回指定可能です（例: `--query "SELECT 1" --query "SELECT 2"`）。`--queries-file`とは同時に使用できません。
- `--queries-file` - 実行するクエリを含むファイルパス。`--queries-file`は複数回指定可能です（例: `--query queries1.sql --query queries2.sql`）。`--query`とは同時に使用できません。
- `--multiquery, -n` – 指定すると、`--query`オプションの後にセミコロンで区切られた複数のクエリをリストできます。便利なことに、`--query`を省略して`--multiquery`の後に直接クエリを渡すこともできます。
- `-N`, `--table` — 出力データを格納するテーブル名、デフォルトは`table`。
- `-f`, `--format`, `--output-format` — 出力フォーマット、デフォルトは`TSV`。
- `-d`, `--database` — デフォルトデータベース、デフォルトは`_local`。
- `--stacktrace` — 例外が発生した場合にデバッグ出力をダンプするかどうか。
- `--echo` — 実行前にクエリを印刷。
- `--verbose` — クエリ実行に関する詳細情報。
- `--logger.console` — コンソールにログ。
- `--logger.log` — ログファイル名。
- `--logger.level` — ログレベル。
- `--ignore-error` — クエリが失敗しても処理を止めない。
- `-c`, `--config-file` — ClickHouseサーバーの形式と同じ形式の構成ファイルへのパス、デフォルトは設定は空。
- `--no-system-tables` — システムテーブルをアタッチしない。
- `--help` — `clickhouse-local`の引数リファレンス。
- `-V`, `--version` — バージョン情報を印刷して終了。

また、`--config-file`の代わりに一般的に使用されるClickHouseの構成変数ごとの引数もあります。


## 例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前の例は次のように表現できます:

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin`や`--file`引数を使用する必要はなく、[`file`テーブル関数](../../sql-reference/table-functions/file.md)を使って任意の数のファイルを開くことができます:

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

Unixユーザーごとのメモリ使用量を出力してみましょう:

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
- [ClickHouseへのデータ取り込み - パート1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [本物の大規模データセットを探る: ClickHouseにおける100年以上の天気記録](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
