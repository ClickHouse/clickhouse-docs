---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: ClickHouseとのS3統合

---
import BucketDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';

# ClickHouseとのS3統合

S3からClickHouseにデータを挿入することができ、S3をエクスポート先として使用することもできるため、「データレイク」アーキテクチャとの相互作用を可能にします。さらに、S3は「コールド」ストレージ層を提供し、ストレージとコンピュートの分離を助けます。以下のセクションでは、ニューヨーク市のタクシーデータセットを使用して、S3とClickHouse間でデータを移動するプロセスを示し、主要な設定パラメータを特定し、パフォーマンスの最適化に関するヒントを提供します。

## S3テーブル関数 {#s3-table-functions}

`s3`テーブル関数を使用すると、S3互換ストレージからファイルを読み書きできます。この構文の概要は次のとおりです：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

ここで：

* path — ファイルへのパスを含むバケットのURL。このモードでは、読み取り専用で以下のワイルドカードをサポートします: `*`, `?`, `{abc,def}` および `{N..M}`（ここで `N`, `M` は数字、`'abc'`, `'def'` は文字列です）。詳細については、[パスでのワイルドカードの使用](/engines/table-engines/integrations/s3/#wildcards-in-path)に関するドキュメントを参照してください。
* format — ファイルの[形式](/interfaces/formats.md/#formats)。
* structure — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。
* compression — パラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮形式が自動検出されます。

パス式でワイルドカードを使用することで、複数のファイルを参照し、並列処理の扉を開くことができます。

### 準備 {#preparation}

ClickHouseにテーブルを作成する前に、まずS3バケット内のデータを詳しく確認したい場合があります。これは、ClickHouseから直接`DESCRIBE`ステートメントを使用して行うことができます：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE`ステートメントの出力は、ClickHouseがS3バケット内のデータをどのように自動的に推測するかを示します。ここで、gzip圧縮形式を自動的に認識し、解凍することも自動的に行われることに注意してください：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

┌─name──────────────────┬─type───────────────┐
│ trip_id               │ Nullable(Int64)    │
│ vendor_id             │ Nullable(Int64)    │
│ pickup_date           │ Nullable(Date)     │
│ pickup_datetime       │ Nullable(DateTime) │
│ dropoff_date          │ Nullable(Date)     │
│ dropoff_datetime      │ Nullable(DateTime) │
│ store_and_fwd_flag    │ Nullable(Int64)    │
│ rate_code_id          │ Nullable(Int64)    │
│ pickup_longitude      │ Nullable(Float64)  │
│ pickup_latitude       │ Nullable(Float64)  │
│ dropoff_longitude     │ Nullable(Float64)  │
│ dropoff_latitude      │ Nullable(Float64)  │
│ passenger_count       │ Nullable(Int64)    │
│ trip_distance         │ Nullable(String)   │
│ fare_amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta_tax               │ Nullable(String)   │
│ tip_amount            │ Nullable(String)   │
│ tolls_amount          │ Nullable(Float64)  │
│ ehail_fee             │ Nullable(Int64)    │
│ improvement_surcharge │ Nullable(String)   │
│ total_amount          │ Nullable(String)   │
│ payment_type          │ Nullable(String)   │
│ trip_type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab_type              │ Nullable(String)   │
│ pickup_nyct2010_gid   │ Nullable(Int64)    │
│ pickup_ctlabel        │ Nullable(Float64)  │
│ pickup_borocode       │ Nullable(Int64)    │
│ pickup_ct2010         │ Nullable(String)   │
│ pickup_boroct2010     │ Nullable(String)   │
│ pickup_cdeligibil     │ Nullable(String)   │
│ pickup_ntacode        │ Nullable(String)   │
│ pickup_ntaname        │ Nullable(String)   │
│ pickup_puma           │ Nullable(Int64)    │
│ dropoff_nyct2010_gid  │ Nullable(Int64)    │
│ dropoff_ctlabel       │ Nullable(Float64)  │
│ dropoff_borocode      │ Nullable(Int64)    │
│ dropoff_ct2010        │ Nullable(String)   │
│ dropoff_boroct2010    │ Nullable(String)   │
│ dropoff_cdeligibil    │ Nullable(String)   │
│ dropoff_ntacode       │ Nullable(String)   │
│ dropoff_ntaname       │ Nullable(String)   │
│ dropoff_puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘
```

私たちのS3ベースのデータセットと対話するために、標準の`MergeTree`テーブルを宛先として準備します。以下のステートメントは、デフォルトデータベースに`trips`という名前のテーブルを作成します。上記で推測されたデータ型の一部を変更したことに注意してください。特に、`Nullable()`データ型修飾子を使用しないことを選択しました。これは、不要な追加保存データや追加のパフォーマンスオーバーヘッドを引き起こす可能性があります：

```sql
CREATE TABLE trips
(
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
SETTINGS index_granularity = 8192
```

`pickup_date`フィールドで[パーティショニング](/engines/table-engines/mergetree-family/custom-partitioning-key.md/#custom-partitioning-key)を使用していることに注意してください。通常、パーティションキーはデータ管理用ですが、後でこのキーを使用してS3への書き込みを並列化します。

タクシーデータセットの各エントリには、タクシーの旅行が含まれています。この匿名化されたデータは、S3バケットhttps://datasets-documentation.s3.eu-west-3.amazonaws.com/内の**nyc-taxi**フォルダーに圧縮された20Mレコードを含んでいます。データはTSV形式で、ファイルごとに約1M行です。

### S3からのデータの読み取り {#reading-data-from-s3}

S3データをソースとしてクエリを実行する際に、ClickHouseでの永続性は必要ありません。次のクエリでは、10行をサンプルします。バケットは公開アクセシブルなため、ここでは資格情報が不要です：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames`形式は列名を最初の行にエンコードしているため、列をリストアップする必要はありません。他の形式、例えば`CSV`や`TSV`では、このクエリのために自動生成された列、例えば、`c1`, `c2`, `c3`などが返されます。

クエリは、バケットパスやファイル名に関する情報を提供する[バーチャルカラム](../sql-reference/table-functions/s3#virtual-columns)（例：`_path`および`_file`）もサポートしています。例えば：

```sql
SELECT  _path, _file, trip_id
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_0.gz', 'TabSeparatedWithNames')
LIMIT 5;
```

```response
┌─_path──────────────────────────────────────┬─_file──────┬────trip_id─┐
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999902 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999919 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999944 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999969 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999990 │
└────────────────────────────────────────────┴────────────┴────────────┘
```

このサンプルデータセットの行数を確認します。ファイル拡張用にワイルドカードを使用するため、20ファイルすべてを考慮します。このクエリは、ClickHouseインスタンスのコア数に応じて約10秒かかります：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

データのサンプリングや即時の探索クエリを実行するのに便利ですが、S3から直接データを頻繁に読み取ることは推奨されません。本格的に作業を開始する時が来たら、データをClickHouseの`MergeTree`テーブルにインポートします。

### clickhouse-localの使用 {#using-clickhouse-local}

`clickhouse-local`プログラムを使うと、ClickHouseサーバーをデプロイおよび設定することなく、ローカルファイルでの高速処理を行うことができます。`s3`テーブル関数を使用したクエリはすべて、このユーティリティで実行できます。例えば：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### S3からのデータの挿入 {#inserting-data-from-s3}

ClickHouseのすべての機能を活用するために、次にデータを読み込んでインスタンスに挿入します。
これを達成するために、`s3`関数をシンプルな`INSERT`ステートメントと組み合わせます。ターゲットテーブルが必要な構造を提供するため、列をリストアップする必要はありません。列は、`SELECT`句内での位置に基づいてマッピングされます。全ての10M行を挿入するには、ClickHouseインスタンスによって数分かかることがあります。すぐに応答を得るために、ここでは1M行を挿入します。必要に応じて`LIMIT`句や列選択を調整して部分セットをインポートしてください：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### ClickHouseローカルを使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークセキュリティポリシーにより、ClickHouseクラスターが外部接続を持つことを防ぐ場合、`clickhouse-local`を使用してS3データを挿入できる可能性があります。以下の例では、S3バケットから読み取り、`remote`関数を使用してClickHouseに挿入します：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
安全なSSL接続上でこれを実行するには、`remoteSecure`関数を利用してください。
:::

### データのエクスポート {#exporting-data}

`S3`テーブル関数を使用してS3のファイルに書き込むことができます。これには適切な権限が必要です。リクエストに必要な資格情報を渡すことができますが、他のオプションについては[資格情報の管理](#managing-credentials)ページをご覧ください。

以下のシンプルな例では、ソースの代わりに宛先としてテーブル関数を使用します。ここでは、`trips`テーブルからバケットに10,000行をストリーミングし、`lz4`圧縮と`CSV`出力タイプを指定します：

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
SELECT *
FROM trips
LIMIT 10000;
```

ここでは、ファイルの形式が拡張子から推測されることに注意してください。また、`s3`関数内で列を指定する必要はありません - これは`SELECT`から推測することができます。

### 大きなファイルの分割 {#splitting-large-files}

データを単一のファイルとしてエクスポートすることはあまり望ましくないでしょう。ClickHouseを含むほとんどのツールは、並列処理の可能性のために複数のファイルに読み書きすることで、より高いスループットパフォーマンスを達成します。挿入コマンドを複数回実行し、データのサブセットをターゲットにすることができます。ClickHouseは、`PARTITION`キーを使用してファイルを自動的に分割する手段を提供します。

以下の例では、`rand()`関数の剰余を使用して、10ファイルを作成します。生成されたパーティションIDがファイル名に参照されていることに注意してください。これにより、数値サフィックスが付いた10ファイルが生成されます。例：`trips_0.csv.lz4`, `trips_1.csv.lz4` など：

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY rand() % 10
SELECT *
FROM trips
LIMIT 100000;
```

別の方法として、データ内のフィールドを参照することもできます。このデータセットの場合、`payment_type`は、カーDナリティが5の自然なパーティショニングキーを提供します。

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY payment_type
SELECT *
FROM trips
LIMIT 100000;
```

### クラスターの活用 {#utilizing-clusters}

上記の関数はすべて単一ノードでの実行に制限されています。読み取り速度は、CPUコアとともに線形にスケールし、他のリソース（通常はネットワーク）が飽和するまで、ユーザーは垂直にスケールできます。しかし、このアプローチには限界があります。ユーザーは`INSERT INTO SELECT`クエリを実行する際に、分散テーブルに挿入することで一部のリソース圧力を軽減できますが、これは依然として単一ノードがデータを読み取り、解析し、処理することを残します。この課題に対処し、読み取りを水平にスケールするために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md)関数が用意されています。

クエリを受信するノード（イニシエーター）は、クラスター内の各ノードへの接続を作成します。どのファイルを読み取る必要があるかを決定するグロブパターンがファイルのセットに解決されます。イニシエーターは、クラスター内のノードにファイルを分配します。これらのノードはワーカーとして機能します。これにより、読み取りが完了するごとに処理するファイルを要求します。このプロセスにより、読み取りを水平にスケールすることができます。

`s3Cluster`関数は、単一ノードバリアントと同じ形式を取りますが、ターゲットクラスターを指定する必要があります：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — リモートおよびローカルサーバーへの一連のアドレスと接続パラメータを構築するために使用されるクラスターの名前。
* `source` — ファイルまたは複数のファイルへのURL。読み取り専用モードで次のワイルドカードをサポートします: `*`, `?`, `{'abc','def'}` および `{N..M}`（ここで N, M は数字、abc, def は文字列です）。詳細については、[パスでのワイルドカード](/engines/table-engines/integrations/s3.md/#wildcards-in-path)を参照してください。
* `access_key_id` と `secret_access_key` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプションです。
* `format` — ファイルの[形式](/interfaces/formats.md/#formats)。
* `structure` — テーブルの構造。形式は 'column1_name column1_type, column2_name column2_type, ...'。

任意の`s3`関数と同様に、バケットが不正な場合、または環境を通じてセキュリティを定義する場合（例：IAMロールを使用する場合）は、資格情報はオプションです。ただし、s3関数とは異なり、22.3.1以降は、リクエスト内で構造を指定する必要があります。つまり、スキーマは推測されません。

この関数は、ほとんどの場合、`INSERT INTO SELECT`の一部として使用されます。この場合、通常は分散テーブルに挿入します。以下に簡単な例を示します。`trips_all`は分散テーブルです。このテーブルはイベントクラスターを使用していますが、読み取りと書き込みで使用されるノードの一貫性は要件ではありません：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入はイニシエーターのノードに対して行われます。これにより、読み取りが各ノードで行われても、結果の行はイニシエーターにルーティングされ分配されます。高スループットシナリオでは、この部分がボトルネックになる場合があります。これに対処するために、`s3cluster`関数の[parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)パラメータを設定します。

## S3テーブルエンジン {#s3-table-engines}

`s3`関数は、S3に保存されたデータに対して即時クエリを実行できるようにしますが、文法的には冗長です。`S3`テーブルエンジンを使用すると、バケットのURLや資格情報を何度も指定する必要がなくなります。これにより、ClickHouseはS3テーブルエンジンを提供します。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — ファイルへのパスを含むバケットのURL。読み取り専用モードで以下のワイルドカードをサポートします: `*`, `?`, `{abc,def}` および `{N..M}`（ここで N, M は数字、'abc', 'def' は文字列です）。詳細については、[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* `format` — ファイルの[形式](/interfaces/formats.md/#formats)。
* `aws_access_key_id`, `aws_secret_access_key` - AWSアカウントユーザー用の長期資格情報。これを使用してリクエストを認証できます。このパラメータはオプションです。資格情報が指定されていない場合は、設定ファイルの値が使用されます。詳細については[資格情報の管理](#managing-credentials)を参照してください。
* `compression` — 圧縮タイプ。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。このパラメータはオプションです。デフォルトでは、ファイル拡張子によって圧縮形式が自動検出されます。

### データの読み取り {#reading-data}

次の例では、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`バケットにある最初の10個のTSVファイルを使用して、`trips_raw`という名前のテーブルを作成します。これらのファイルはそれぞれ1M行を含みます：

```sql
CREATE TABLE trips_raw
(
   `trip_id`               UInt32,
   `vendor_id`             Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_date`          Date,
   `dropoff_datetime`      DateTime,
   `store_and_fwd_flag`    UInt8,
   `rate_code_id`          UInt8,
   `pickup_longitude`      Float64,
   `pickup_latitude`       Float64,
   `dropoff_longitude`     Float64,
   `dropoff_latitude`      Float64,
   `passenger_count`       UInt8,
   `trip_distance`         Float64,
   `fare_amount`           Float32,
   `extra`                 Float32,
   `mta_tax`               Float32,
   `tip_amount`            Float32,
   `tolls_amount`          Float32,
   `ehail_fee`             Float32,
   `improvement_surcharge` Float32,
   `total_amount`          Float32,
   `payment_type_`         Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
   `trip_type`             UInt8,
   `pickup`                FixedString(25),
   `dropoff`               FixedString(25),
   `cab_type`              Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
   `pickup_nyct2010_gid`   Int8,
   `pickup_ctlabel`        Float32,
   `pickup_borocode`       Int8,
   `pickup_ct2010`         String,
   `pickup_boroct2010`     FixedString(7),
   `pickup_cdeligibil`     String,
   `pickup_ntacode`        FixedString(4),
   `pickup_ntaname`        String,
   `pickup_puma`           UInt16,
   `dropoff_nyct2010_gid`  UInt8,
   `dropoff_ctlabel`       Float32,
   `dropoff_borocode`      UInt8,
   `dropoff_ct2010`        String,
   `dropoff_boroct2010`    FixedString(7),
   `dropoff_cdeligibil`    String,
   `dropoff_ntacode`       FixedString(4),
   `dropoff_ntaname`       String,
   `dropoff_puma`          UInt16
) ENGINE = S3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..9}.gz', 'TabSeparatedWithNames', 'gzip');
```

最初の10ファイルに制限するために`{0..9}`パターンの使用に注意してください。作成後は、他のテーブルと同様にこのテーブルにクエリを実行できます：

```sql
SELECT DISTINCT(pickup_ntaname)
FROM trips_raw
LIMIT 10;

┌─pickup_ntaname───────────────────────────────────┐
│ Lenox Hill-Roosevelt Island                      │
│ Airport                                          │
│ SoHo-TriBeCa-Civic Center-Little Italy           │
│ West Village                                     │
│ Chinatown                                        │
│ Hudson Yards-Chelsea-Flatiron-Union Square       │
│ Turtle Bay-East Midtown                          │
│ Upper West Side                                  │
│ Murray Hill-Kips Bay                             │
│ DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill │
└──────────────────────────────────────────────────┘
```

### データの挿入 {#inserting-data}

`S3`テーブルエンジンは、並列読み取りをサポートします。ただし、テーブル定義にグロブパターンが含まれていない場合にのみ書き込みがサポートされます。したがって、上記のテーブルは書き込みをブロックします。

書き込みを示すために、書き込み可能なS3バケットを指すテーブルを作成します：

```sql
CREATE TABLE trips_dest
(
   `trip_id`               UInt32,
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_datetime`      DateTime,
   `tip_amount`            Float32,
   `total_amount`          Float32
) ENGINE = S3('<bucket path>/trips.bin', 'Native');
```

```sql
INSERT INTO trips_dest
   SELECT
      trip_id,
      pickup_date,
      pickup_datetime,
      dropoff_datetime,
      tip_amount,
      total_amount
   FROM trips
   LIMIT 10;
```

```sql
SELECT * FROM trips_dest LIMIT 5;
```

```response
┌────trip_id─┬─pickup_date─┬─────pickup_datetime─┬────dropoff_datetime─┬─tip_amount─┬─total_amount─┐
│ 1200018648 │  2015-07-01 │ 2015-07-01 00:00:16 │ 2015-07-01 00:02:57 │          0 │          7.3 │
│ 1201452450 │  2015-07-01 │ 2015-07-01 00:00:20 │ 2015-07-01 00:11:07 │       1.96 │        11.76 │
│ 1202368372 │  2015-07-01 │ 2015-07-01 00:00:40 │ 2015-07-01 00:05:46 │          0 │          7.3 │
│ 1200831168 │  2015-07-01 │ 2015-07-01 00:01:06 │ 2015-07-01 00:09:23 │          2 │         12.3 │
│ 1201362116 │  2015-07-01 │ 2015-07-01 00:01:07 │ 2015-07-01 00:03:31 │          0 │          5.3 │
└────────────┴─────────────┴─────────────────────┴─────────────────────┴────────────┴──────────────┘
```

行は新しいファイルにのみ挿入できることに注意してください。マージサイクルやファイル分割操作はありません。一度ファイルが書き込まれると、その後の挿入は失敗します。ユーザーには2つの選択肢があります：

* 設定`s3_create_new_file_on_insert=1`を指定します。これにより、各挿入時に新しいファイルが作成され、挿入操作ごとに単調に増加する数値サフィックスが各ファイルの終わりに追加されます。上記の例の場合、次の挿入は`trips_1.bin`ファイルの作成を引き起こします。
* 設定`s3_truncate_on_insert=1`を指定します。これにより、ファイルが切り詰められ、つまり、完了時には新しく挿入された行のみを含むことになります。

これらの設定はどちらもデフォルトで0になります。従って、ユーザーはそれらのいずれかを設定する必要があります。`s3_truncate_on_insert`は、両方が設定されている場合は優先されます。

`S3`テーブルエンジンについての一部の注意点：

- 従来の`MergeTree`ファミリーテーブルとは異なり、`S3`テーブルを削除しても、基になるデータは削除されません。
- このテーブルタイプの完全な設定は[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。
- このエンジンを使用する際の注意点は次のとおりです：
    * ALTERクエリはサポートされていません
    * SAMPLE操作はサポートされていません
    * インデックスの概念はありません。すなわち、主キーやスキップインデックスは存在しません。

## 資格情報の管理 {#managing-credentials}

前の例では、`s3`関数や`S3`テーブル定義に資格情報を渡しました。これは時折の使用には許容されるかもしれませんが、本番環境では、ユーザーはより明示的でない認証メカニズムを求めるでしょう。これに対処するために、ClickHouseは数つのオプションを提供しています：

* **config.xml**または**conf.d**配下の同等の構成ファイルに接続情報を指定します。以下に、debianパッケージを使用してインストールした場合の例ファイルの内容を示します。

    ```xml
    ubuntu@single-node-clickhouse:/etc/clickhouse-server/config.d$ cat s3.xml
    <clickhouse>
        <s3>
            <endpoint-name>
                <endpoint>https://dalem-files.s3.amazonaws.com/test/</endpoint>
                <access_key_id>key</access_key_id>
                <secret_access_key>secret</secret_access_key>
                <!-- <use_environment_credentials>false</use_environment_credentials> -->
                <!-- <header>Authorization: Bearer SOME-TOKEN</header> -->
            </endpoint-name>
        </s3>
    </clickhouse>
    ```

    これらの資格情報は、上記のエンドポイントが要求されたURLに正確に一致する場合にすべてのリクエストで使用されます。また、この例では、アクセスキーやシークレットキーの代わりに認証ヘッダーを宣言する能力もあります。サポートされている設定の完全なリストは[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

* 上記の例は、`use_environment_credentials`という設定パラメータの利用可能性を強調しています。この設定パラメータは、クラスターの`クリックハウス`レベルでグローバルに設定することもできます：

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    この設定は、環境からS3資格情報を取得しようとする試みを有効にします。このため、IAMロールを通じたアクセスが可能になります。具体的には、以下のリトリーバルオーダーが実行されます：

   * 環境変数`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`の検索
   * **$HOME/.aws**ディレクトリでのチェック
   * AWSセキュリティトークンサービスによる一時資格情報の取得（`AssumeRole` APIを介して）
   * ECS環境変数`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`や`AWS_CONTAINER_CREDENTIALS_FULL_URI`および`AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`における資格情報のチェック。
   * AWS EC2インスタンスメタデータを介しての資格情報の取得（`AWS_EC2_METADATA_DISABLED`がtrueに設定されていない場合）。
   * これらの同じ設定は、同じプレフィックス一致ルールを使用して特定のエンドポイントに対しても設定できます。

## パフォーマンスの最適化 {#s3-optimizing-performance}

S3関数を使用した読み取りおよび挿入の最適化方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。

### S3ストレージチューニング {#s3-storage-tuning}

内部的に、ClickHouseのマージツリーは、[`Wide` と `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)の2つの主要なストレージ形式を使用します。現在の実装は、ClickHouseのデフォルトの動作（`min_bytes_for_wide_part`や`min_rows_for_wide_part`設定を通じて制御される）を使用していますが、将来的なリリースではS3に対する動作が異なることが予想されます。例えば、デフォルトの`min_bytes_for_wide_part`の値を大きく設定することで、より`Compact`形式を促進し、ファイル数を減らすことができるでしょう。ユーザーは現在、S3ストレージを専用で使用する場合にこれらの設定を調整することが望まれます。

## S3バックテッドMergeTree {#s3-backed-mergetree}

`s3`関数および関連するテーブルエンジンは、慣れ親しんだClickHouseの構文を使用してS3内のデータをクエリできるようにします。しかし、データ管理機能やパフォーマンスに関しては、限られています。主インデックスのサポートはなく、キャッシュのサポートもなく、ファイルの挿入はユーザーによって管理する必要があります。

ClickHouseは、S3が特に「コールド」データに対するクエリパフォーマンスがそれほど重要でなく、ユーザーがストレージとコンピュートを分離したい場合に魅力的なストレージソリューションであることを認識しています。この実現を助けるために、MergeTreeエンジンのストレージとしてS3を使用するサポートが提供されています。これにより、ユーザーはS3のスケーラビリティとコストの利点を利用し、MergeTreeエンジンの挿入およびクエリパフォーマンスを活用できます。

### ストレージ層 {#storage-tiers}

ClickHouseのストレージボリュームは、物理ディスクをMergeTreeテーブルエンジンから抽象化することを可能にします。単一のボリュームは、ディスクの順序付きセットから構成されることがあります。基本的には、データストレージに複数のブロックデバイスを使用できるようにするためのものですが、この抽象化により、S3を含む他のストレージタイプも使用できます。ClickHouseデータパーツは、ストレージポリシーに従ってボリューム間で移動したり、充填率を調整することができ、これによりストレージ層の概念が作成されます。

ストレージ層は、最近のデータが通常最もクエリされるデータであり、優れたストレージ（例えば、NVMe SSD）のみで必要な量しか必要としないホット・コールドアーキテクチャを可能にします。データが古くなるにつれて、クエリ時間のSLAは増加し、クエリ頻度も増加します。この太い尾のデータは、HDDのようなより遅い、性能が低いストレージまたはS3のようなオブジェクトストレージに保存することができます。

### ディスクの作成 {#creating-a-disk}


To utilize an S3バケットをディスクとして使用するには、まずClickHouseの設定ファイル内で宣言する必要があります。config.xmlを拡張するか、好ましくはconf.d内に新しいファイルを提供してください。以下にS3ディスク宣言の例を示します。

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://sample-bucket.s3.us-east-2.amazonaws.com/tables/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            </s3>
            <s3_cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/var/lib/clickhouse/disks/s3_cache/</path>
                <max_size>10Gi</max_size>
            </s3_cache>
        </disks>
        ...
    </storage_configuration>
</clickhouse>
```

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。資格情報は、[Managing credentials](#managing-credentials)で説明されているのと同じアプローチを使用して管理できます。つまり、上記の設定ブロック内でuse_environment_credentialsをtrueに設定することで、IAMロールを使用できます。

### ストレージポリシーの作成 {#creating-a-storage-policy}

設定が完了すると、この「ディスク」はポリシー内で宣言されたストレージボリュームとして使用できます。以下の例では、s3が唯一のストレージであると仮定しています。これは、TTLや充填率に基づいてデータを移動できるより複雑なホット・コールドアーキテクチャを無視します。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
            ...
            </s3>
            <s3_cache>
            ...
            </s3_cache>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### テーブルの作成 {#creating-a-table}

ディスクが書き込みアクセスを持つバケットを使用するように設定されていると仮定すると、以下の例のようにテーブルを作成できるはずです。簡潔さのために、NYCタクシーのカラムのサブセットを使用し、データを直接s3バックテーブルにストリーム配信します。

```sql
CREATE TABLE trips_s3
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
SETTINGS index_granularity = 8192, storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

ハードウェアによっては、この100万行の挿入には数分かかる場合があります。進行状況はsystem.processesテーブルを介して確認できます。行数は最大で1000万行まで調整して、いくつかのサンプルクエリを探索できます。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### テーブルの変更 {#modifying-a-table}

ユーザーは特定のテーブルのストレージポリシーを変更する必要がある場合があります。これは可能ですが、制限があります。新しいターゲットポリシーは前のポリシーのすべてのディスクとボリュームを含む必要があり、つまり、ポリシー変更を満たすためにデータは移行されません。これらの制約が確認されると、ボリュームとディスクはその名前によって特定され、違反しようとするとエラーが発生します。ただし、前の例を使用していると仮定すると、以下の変更は有効です。

```xml
<policies>
   <s3_main>
       <volumes>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
   </s3_main>
   <s3_tiered>
       <volumes>
           <hot>
               <disk>default</disk>
           </hot>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
       <move_factor>0.2</move_factor>
   </s3_tiered>
</policies>
```

```sql
ALTER TABLE trips_s3 MODIFY SETTING storage_policy='s3_tiered'
```

ここでは、新しいs3_tieredポリシーでメインボリュームを再利用し、新しいホットボリュームを導入します。これは、単一のディスクで構成されるデフォルトディスクを使用します。この際、ボリューム名とディスクは変更されません。新しい挿入はこのデフォルトディスクに格納され、このディスクがmove_factor * disk_sizeに達すると、データはS3に移動されます。

### レプリケーションの扱い {#handling-replication}

S3ディスクでのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用することで実現できます。詳細については、[S3オブジェクトストレージを使用した2つのAWSリージョン間の単一シャードのレプリケーション](#s3-multi-region)ガイドを参照してください。

### 読み込みおよび書き込み {#read--writes}

以下の注意事項は、ClickHouseとのS3インタラクションの実装に関するものです。一般的には情報提供を目的としていますが、[パフォーマンスの最適化](#s3-optimizing-performance)の際に皆様の参考になるかもしれません。

* デフォルトでは、クエリ処理パイプラインの任意のステージで使用される最大クエリ処理スレッド数はコアの数と等しくなります。一部のステージは他よりも並行処理が可能性があるため、この値は上限を提供します。データがディスクからストリーミングされるため、複数のクエリステージが同時に実行される場合があります。したがって、クエリに使用されるスレッドの正確な数はこの値を超えることがあります。[max_threads](/operations/settings/settings.md/#settings-max_threads)設定を介して変更できます。
* S3からの読み込みはデフォルトで非同期です。この動作は`remote_filesystem_read_method`を設定することによって決まっており、デフォルトで`threadpool`の値が設定されています。リクエストを処理する際、ClickHouseはストライプ内のグラニュールを読み込みます。これらの各ストライプには多くのカラムが含まれている可能性があります。スレッドは、カラムのグラニュールを1つずつ読み込みます。これを同期的に行うのではなく、データを待機する前にすべてのカラムのプリフェッチが行われます。これにより、各カラムの同期待機に比べて大幅なパフォーマンス改善が得られます。ほとんどのケースでは、ユーザーはこの設定を変更する必要がありません - [パフォーマンスの最適化](#s3-optimizing-performance)を参照してください。
* 書き込みは並行して実行され、最大100の同時ファイル書き込みスレッドで行われます。`max_insert_delayed_streams_for_parallel_write`はデフォルトで1000の値を持ち、並行に書き込まれるS3ブロブの数を制御します。書き込まれる各ファイルにはバッファが必要であるため（約1MB）、これによりINSERTのメモリ消費が実質的に制限されます。サーバーのメモリが低いシナリオでは、この値を下げることが適切な場合があります。

## S3オブジェクトストレージをClickHouseディスクとして使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成するための手順が必要な場合は、**S3バケットとIAMロールの作成**を展開し、その手順に従ってください：

<BucketDetails />

### ClickHouseにS3バケットをディスクとして使用するように設定 {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下の例は、デフォルトのClickHouseディレクトリでサービスとしてインストールされたLinux Debパッケージに基づいています。

1.  ClickHouse `config.d` ディレクトリに新しいファイルを作成してストレージ設定を保存します。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 貯蔵構成用に以下を追加します。以前のステップからバケットパス、アクセスキー、および秘密キーを置き換えます。
```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>https://mars-doc-test.s3.amazonaws.com/clickhouse3/</endpoint>
        <access_key_id>ABC123</access_key_id>
        <secret_access_key>Abc+123</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

:::note
`<disks>`タグ内の`s3_disk`および`s3_cache`タグは任意のラベルです。これらは他の名前に設定できますが、`<policies>`タグの`<disk>`タブで同じラベルを使用してディスクを参照する必要があります。
`<S3_main>`タグも任意で、ClickHouseでリソースを作成する際の識別子ストレージターゲットとして使用されるポリシーの名前です。

上記の設定はClickHouseバージョン22.8以上用です。古いバージョンを使用している場合は、[データの保存](/operations/storing-data.md/#using-local-cache)ドキュメントを参照してください。

S3の使用に関する詳細情報：
統合ガイド：[S3バックドメージツリー](#s3-backed-mergetree)
:::

3. ファイルの所有者を`clickhouse`ユーザーおよびグループに変更します。
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 変更を有効にするためにClickHouseインスタンスを再起動します。
```bash
service clickhouse-server restart
```

### テスト {#testing}
1. ClickHouseクライアントにログインします。次のように入力します。
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. 新しいS3ストレージポリシーを指定してテーブルを作成します。
```sql
CREATE TABLE s3_table1
           (
               `id` UInt64,
               `column1` String
           )
           ENGINE = MergeTree
           ORDER BY id
           SETTINGS storage_policy = 's3_main';
```

3. テーブルが正しいポリシーで作成されたことを示します。
```sql
SHOW CREATE TABLE s3_table1;
```
```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

4. テスト行をテーブルに挿入します。
```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```
```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```
5. 行を表示します。
```sql
SELECT * FROM s3_table1;
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```
6. AWSコンソールでバケットに移動し、新しいものとそのフォルダーを選択します。
次のような表示がされるはずです：

![create_s3_bucket_10](./images/s3-j.png)

## S3オブジェクトストレージを使用して単一シャードを2つのAWSリージョンにレプリケーションする {#s3-multi-region}

:::tip
ClickHouse Cloudではデフォルトでオブジェクトストレージが使用されているため、ClickHouse Cloudで実行している場合はこの手順に従う必要はありません。
:::

### デプロイメントの計画 {#plan-the-deployment}
このチュートリアルは、AWS EC2における2つのClickHouseサーバーノードと3つのClickHouse Keeperノードをデプロイすることに基づいています。ClickHouseサーバーのデータストアはS3です。各リージョンに1つずつClickHouseサーバーとS3バケットが存在し、災害復旧をサポートするために2つのAWSリージョンが使用されます。

ClickHouseテーブルは2つのサーバー間でレプリケートされ、したがって、2つのリージョン間でレプリケートされます。

### ソフトウェアのインストール {#install-software}

#### ClickHouseサーバーノード {#clickhouse-server-nodes}
ClickHouseサーバーノードにおけるデプロイメントステップを実施するときは、[インストール手順](/getting-started/install.md/#available-installation-options)を参照してください。

#### ClickHouseのデプロイ {#deploy-clickhouse}

2つのホストにClickHouseをデプロイします。サンプル構成では、これらは`chnode1`、`chnode2`と名付けられています。

`chnode1`を1つのAWSリージョンに、`chnode2`を別のリージョンに配置します。

#### ClickHouse Keeperのデプロイ {#deploy-clickhouse-keeper}

3つのホストにClickHouse Keeperをデプロイします。サンプル構成では、これらは`keepernode1`、`keepernode2`、`keepernode3`と名付けられています。`keepernode1`は`chnode1`と同じリージョンに、`keepernode2`は`chnode2`と、`keepernode3`はどちらのリージョンでも良いが、そのリージョンのClickHouseノードとは異なるアベイラビリティゾーンに配置できます。

ClickHouse Keeperノードにおけるデプロイメントステップを実施するときは、[インストール手順](/getting-started/install.md/#install-standalone-clickhouse-keeper)を参照してください。

### S3バケットの作成 {#create-s3-buckets}

`chnode1`および`chnode2`を配置した各リージョンに1つずつS3バケットを作成します。

バケットとIAMロールを作成するための手順が必要な場合は、**S3バケットとIAMロールの作成**を展開し、その手順に従ってください：

<BucketDetails />

その後、設定ファイルは`/etc/clickhouse-server/config.d/`に配置されます。以下は1つのバケットのサンプル設定ファイルで、他のものはハイライトされている3行が異なります。

```xml title="/etc/clickhouse-server/config.d/storage_config.xml"
<clickhouse>
  <storage_configuration>
     <disks>
        <s3_disk>
           <type>s3</type>
	<!--highlight-start-->
           <endpoint>https://docs-clickhouse-s3.s3.us-east-2.amazonaws.com/clickhouses3/</endpoint>
           <access_key_id>ABCDEFGHIJKLMNOPQRST</access_key_id>
           <secret_access_key>Tjdm4kf5snfkj303nfljnev79wkjn2l3knr81007</secret_access_key>
	<!--highlight-end-->
           <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
        </s3_disk>

        <s3_cache>
           <type>cache</type>
           <disk>s3</disk>
           <path>/var/lib/clickhouse/disks/s3_cache/</path>
           <max_size>10Gi</max_size>
        </s3_cache>
     </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3_disk</disk>
                    </main>
                </volumes>
            </s3_main>
    </policies>
   </storage_configuration>
</clickhouse>
```
:::note
このガイドの多くのステップでは、 `/etc/clickhouse-server/config.d/`に設定ファイルを配置することを求められます。これは、Linuxシステムにおける設定オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouseはデフォルト設定をオーバーライドするためにその内容を使用します。これらのファイルをオーバーライドディレクトリに配置することで、アップグレード中に設定を失うことを避けられます。
:::

### ClickHouse Keeperの設定 {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロンで実行すると（ClickHouseサーバーから分離されている）、設定は単一のXMLファイルになります。このチュートリアルでは、ファイルは`/etc/clickhouse-keeper/keeper_config.xml`です。すべての3つのKeeperサーバーは同じ設定を使用しますが、1つの設定が異なります; `<server_id>`。

`server_id`は、設定ファイルが使用されるホストに割り当てられるIDを示します。以下の例では、`server_id`は`3`であり、ファイルの下にある`<raft_configuration>`セクションをさらに見てみると、サーバー3のホスト名が`keepernode3`であることがわかります。これがClickHouse Keeperプロセスがリーダーを選ぶ際やその他の活動を行う際に接続すべき他のサーバーを知る方法です。

```xml title="/etc/clickhouse-keeper/keeper_config.xml"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
<!--highlight-next-line-->
        <server_id>3</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>keepernode1</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

ClickHouse Keeperの設定ファイルを配置し、`<server_id>`を設定することを忘れないでください：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### ClickHouseサーバーの設定 {#configure-clickhouse-server}

#### クラスタの定義 {#define-a-cluster}

ClickHouseクラスタは、設定の`<remote_servers>`セクションで定義されます。このサンプルでは、`cluster_1S_2R`という1つのクラスタが定義されており、単一のシャードと2つのレプリカで構成されています。レプリカは、ホスト`chnode1`と`chnode2`にあります。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

クラスターで作業する際は、DDLクエリをクラスタ、シャード、レプリカの設定で埋めるマクロを定義すると便利です。このサンプルでは、レプリケートテーブルエンジンの使用を指定する際に`shard`および`replica`の詳細を提供せずに済むようにします。テーブルを作成するときには、`system.tables`をクエリすることで、`shard`および`replica`マクロがどのように使用されているかを確認できます。

```xml title="/etc/clickhouse-server/config.d/macros.xml"
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```
:::note
上記のマクロは`chnode1`用のもので、`chnode2`では`replica`を`replica_2`に設定します。
:::

#### ゼロコピー複製の無効化 {#disable-zero-copy-replication}

ClickHouseバージョン22.7およびそれ以前では、設定`allow_remote_fs_zero_copy_replication`がS3およびHDFSディスクに対してデフォルトで`true`に設定されています。この設定は、災害復旧シナリオのために`false`に設定する必要があり、バージョン22.8以降はデフォルトで`false`に設定されています。

この設定は2つの理由から`false`にする必要があります。1）この機能は生産準備が整っていない。2）災害復旧シナリオでは、データとメタデータの両方が複数のリージョンに保存される必要があります。`allow_remote_fs_zero_copy_replication`を`false`に設定してください。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeperは、クリックハウスノード間のデータ複製の調整を担当しています。ClickHouseにClickHouse Keeperノードについて知らせるために、各ClickHouseノードに設定ファイルを追加します。

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

### ネットワークの設定 {#configure-networking}

AWSのセキュリティ設定を構成するときに、[ネットワークポート](../../../guides/sre/network-ports.md)リストを参照して、サーバー間の通信およびそれらとの通信を行えるようにしてください。

すべてのサーバーが相互に通信できるように、ネットワーク接続をリスニングする必要があります。デフォルトでは、ClickHouseはループバックアドレスのみにリスニングするため、これを変更する必要があります。これは`/etc/clickhouse-server/config.d/`で構成されます。以下は、クリックハウスとクリックハウスキーパーがすべてのIPv4インターフェースでリスニングするように構成するサンプルです。詳細については、ドキュメントまたはデフォルトの設定ファイル `/etc/clickhouse/config.xml` を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

### サーバーの起動 {#start-the-servers}

#### ClickHouse Keeperを実行する {#run-clickhouse-keeper}

各Keeperサーバーで、オペレーティングシステムに応じたコマンドを実行します。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeperのステータスを確認する {#check-clickhouse-keeper-status}

`netcat`を使用してClickHouse Keeperにコマンドを送信します。例えば、`mntr`はClickHouse Keeperクラスターの状態を返します。各Keeperノードでこのコマンドを実行すると、1つのリーダーが存在し、他の2つがフォロワーであることがわかります。

```bash
echo mntr | nc localhost 9181
```
```response
zk_version	v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency	0
zk_max_latency	11
zk_min_latency	0
zk_packets_received	1783
zk_packets_sent	1783
# highlight-start
zk_num_alive_connections	2
zk_outstanding_requests	0
zk_server_state	leader
# highlight-end
zk_znode_count	135
zk_watch_count	8
zk_ephemerals_count	3
zk_approximate_data_size	42533
zk_key_arena_size	28672
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	182
zk_max_file_descriptor_count	18446744073709551615
# highlight-start
zk_followers	2
zk_synced_followers	2
# highlight-end
```

#### ClickHouseサーバーを実行する {#run-clickhouse-server}

各ClickHouseサーバーで次を実行します。

```bash
sudo service clickhouse-server start
```

#### ClickHouseサーバーを確認する {#verify-clickhouse-server}

[クラスタ構成](#define-a-cluster)を追加した際に、2つのClickHouseノード間でレプリケートされた単一のシャードが定義されました。この検証ステップでは、ClickHouseが開始されたときにクラスタが構築されたかどうかを確認し、そのクラスタを使用してレプリケートテーブルを作成します。

- クラスタが存在することを確認します：
  ```sql
  show clusters
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- `ReplicatedMergeTree`テーブルエンジンを使用してクラスタでテーブルを作成します：
  ```sql
  create table trips on cluster 'cluster_1S_2R' (
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  ENGINE = ReplicatedMergeTree
  PARTITION BY toYYYYMM(pickup_date)
  ORDER BY pickup_datetime
  SETTINGS index_granularity = 8192, storage_policy='s3_main'
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode1 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode2 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```
- 前に定義されたマクロの利用を理解します。

  マクロ`shard`と`replica`は[以前に定義された](#define-a-cluster)もので、以下のハイライトされた行で、各ClickHouseノードで値がどのように置き換えられているかが示されています。さらに、値`uuid`が使用されています。`uuid`はシステムによって生成されたため、マクロでは定義されていません。
  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0

  Row 1:
  ──────
  create_table_query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  # highlight-next-line
  ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
  PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS index_granularity = 8192, storage_policy = 's3_main'

  1 row in set. Elapsed: 0.012 sec.
  ```
  :::note
  上記の`clickhouse/tables/{uuid}/{shard}`というzookeeperパスは、`default_replica_path`と`default_replica_name`を設定することでカスタマイズできます。詳細については、[こちら](/operations/server-configuration-parameters/settings.md/#default_replica_path)を参照してください。
  :::

### テスト {#testing-1}

これらのテストでは、データが2つのサーバー間でレプリケートされているか、S3バケットに格納されておりローカルディスクに格納されていないことを確認します。

- ニューヨーク市のタクシーデータセットからデータを追加します：
  ```sql
  INSERT INTO trips
  SELECT trip_id,
         pickup_date,
         pickup_datetime,
         dropoff_datetime,
         pickup_longitude,
         pickup_latitude,
         dropoff_longitude,
         dropoff_latitude,
         passenger_count,
         trip_distance,
         tip_amount,
         total_amount,
         payment_type
     FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
  ```
- データがS3に保存されていることを確認します。

  このクエリは、ディスク上のデータのサイズと、どのディスクが使用されているかを判断するためのポリシーを示します。
  ```sql
  SELECT
      engine,
      data_paths,
      metadata_path,
      storage_policy,
      formatReadableSize(total_bytes)
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: af7a3d1b-7730-49e0-9314-cc51c4cf053c

  Row 1:
  ──────
  engine:                          ReplicatedMergeTree
  data_paths:                      ['/var/lib/clickhouse/disks/s3_disk/store/551/551a859d-ec2d-4512-9554-3a4e60782853/']
  metadata_path:                   /var/lib/clickhouse/store/e18/e18d3538-4c43-43d9-b083-4d8e0f390cf7/trips.sql
  storage_policy:                  s3_main
  formatReadableSize(total_bytes): 36.42 MiB

  1 row in set. Elapsed: 0.009 sec.
  ```

  ローカルディスク上のデータサイズを確認します。上記の内容によると、保存された数百万行のサイズは36.42 MiBです。これはS3に保存されているはずで、ローカルディスク上には保存されていないはずです。上記のクエリは、ローカルディスク上でデータとメタデータがどこに保存されているかも示します。ローカルデータを確認します：
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K	/var/lib/clickhouse/disks/s3_disk/store/551
  ```

  各S3バケット内のS3データを確認します（合計は示されませんが、挿入後に両方のバケットに約36 MiBが保存されています）：

![size in first S3 bucket](./images/bucket1.png)

![size in second S3 bucket](./images/bucket2.png)

## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)は、Amazon S3における新しい高パフォーマンスのシングルアベイラビリティゾーンストレージクラスです。

この[ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)を参照することで、ClickHouseでのS3Expressテストの経験について読むことができます。

:::note
  S3Expressは、単一のAZ内にデータを保存します。これは、AZが障害に遭った場合にデータが利用できなくなることを意味します。
:::

### S3ディスク {#s3-disk}

S3Expressバケットでバックアップされたストレージのテーブルを作成するには、次のステップが必要です。

1. `Directory`タイプのバケットを作成する
2. 必要なすべてのアクセス権をS3ユーザーに付与するための適切なバケットポリシーをインストールします（例えば、`"Action": "s3express:*"`は無制限のアクセスを許可します）
3. ストレージポリシーを設定する際に`region`パラメータを指定します

ストレージ設定は通常のS3と同じで、例えば以下のようになります。

``` sql
<storage_configuration>
    <disks>
        <s3_express>
            <type>s3</type>
            <endpoint>https://my-test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/store/</endpoint>
            <region>eu-north-1</region>
            <access_key_id>...</access_key_id>
            <secret_access_key>...</secret_access_key>
        </s3_express>
    </disks>
    <policies>
        <s3_express>
            <volumes>
                <main>
                    <disk>s3_express</disk>
                </main>
            </volumes>
        </s3_express>
    </policies>
</storage_configuration>
```

そして、新しいストレージでテーブルを作成します：

``` sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```
### S3ストレージ {#s3-storage}

S3ストレージはサポートされていますが、`Object URL`パスにのみ対応しています。例:

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

設定にバケットの地域を指定する必要があります:

``` xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### バックアップ {#backups}

上記で作成したディスクにバックアップを保存することが可能です:

``` sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

``` sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
