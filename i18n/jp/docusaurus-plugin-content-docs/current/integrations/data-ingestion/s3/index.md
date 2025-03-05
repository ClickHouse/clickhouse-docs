
---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: ClickHouseとS3の統合

---
import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';

# ClickHouseとS3の統合

S3からClickHouseにデータを挿入することができ、S3をエクスポート先としても使用できるため、「データレイク」アーキテクチャとの相互作用が可能です。さらに、S3は「コールド」ストレージ階層を提供し、ストレージと計算の分離を助けます。以下のセクションでは、ニューヨーク市のタクシーデータセットを使用して、S3とClickHouse間のデータ移動のプロセスを示し、主要な設定パラメータを特定し、パフォーマンス最適化のヒントを提供します。
## S3テーブル関数 {#s3-table-functions}

`s3`テーブル関数を使用すると、S3互換ストレージからファイルを読み書きできます。この構文のアウトラインは次のとおりです：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

ここで：

* path — ファイルへのパスを含むバケットURL。読み取り専用モードでは、次のワイルドカードがサポートされます：`*`、`?`、`{abc,def}`および`{N..M}`（ここで`N`、`M`は数値、`'abc'`、`'def'`は文字列）。詳細については、[パスのワイルドカードの使用](/engines/table-engines/integrations/s3/#wildcards-in-path)を参照してください。
* format — ファイルの[フォーマット](/interfaces/formats.md/#formats)。
* structure — テーブルの構造。フォーマットは`'column1_name column1_type, column2_name column2_type, ...'`。
* compression — パラメータはオプションです。サポートされている値：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。

パス式でのワイルドカードの使用により、複数のファイルを参照でき、並列処理への扉が開かれます。
### 準備 {#preparation}

ClickHouseでテーブルを作成する前に、S3バケット内のデータを詳細に確認することをお勧めします。これをClickHouseから直接行うには、`DESCRIBE`ステートメントを使用できます：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE`ステートメントの出力は、ClickHouseがこのデータをどのように自動的に推測するかを示し、S3バケットで表示された内容として確認できます。また、gzip圧縮形式を自動的に認識し、解凍することにも注意してください：

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

私たちのS3ベースのデータセットと対話するために、標準の`MergeTree`テーブルを準備します。以下のステートメントは、デフォルトデータベースに`trips`という名前のテーブルを作成します。特に、不要な追加の保存データや性能オーバーヘッドを引き起こす可能性のある[`Nullable()`](/sql-reference/data-types/nullable)データ型修飾子を使用しないように、上記のデータ型をいくつか修正することを選びました：

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

`pickup_date`フィールドに対する[パーティショニング](/engines/table-engines/mergetree-family/custom-partitioning-key.md/#custom-partitioning-key)の使用を注意してください。通常、パーティションキーはデータ管理のために使用されますが、後でこのキーを使用してS3への書き込みを並列化します。

タクシーデータセットの各エントリには、タクシートリップが含まれています。この匿名化されたデータは、S3バケットの https://datasets-documentation.s3.eu-west-3.amazonaws.com/ にコンプレッションされた20Mレコードを含んでおり、**nyc-taxi**フォルダ内に格納されています。データはTSVフォーマットで、1ファイルあたり約1M行です。
### S3からデータを読み込む {#reading-data-from-s3}

ClickHouseでの永続性を必要とせずに、S3データをソースとしてクエリできます。以下のクエリでは、10行をサンプリングします。バケットは公開にアクセス可能であるため、ここに資格情報は必要ありません：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames`フォーマットは最初の行にカラム名をエンコードするため、カラムをリストする必要はありません。他のフォーマット、例えば`CSV`や`TSV`は、このクエリでは自動生成されたカラム（例：`c1`、`c2`、`c3`など）を返します。

クエリには、バケットパスとファイル名に関する情報を提供する[仮想カラム](../sql-reference/table-functions/s3#virtual-columns)もサポートされています。例えば：

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

このサンプルデータセットの行数を確認します。ファイルの展開にワイルドカードを使用して、すべての20ファイルを考慮します。このクエリは、ClickHouseインスタンスのコア数に応じて約10秒かかります：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

データをサンプリングしたり、アドホックな探索的クエリを実行するには便利ですが、S3から直接データを読み取ることは頻繁に行うべきではありません。本格的にデータを取得する時が来たら、データをClickHouseの`MergeTree`テーブルにインポートします。
### clickhouse-localの使用 {#using-clickhouse-local}

`clickhouse-local`プログラムを使用すると、ClickHouseサーバーを展開および構成することなく、ローカルファイルに対して高速処理を実行できます。`s3`テーブル関数を使用した任意のクエリはこのユーティリティで実行できます。例えば：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### S3からのデータ挿入 {#inserting-data-from-s3}

ClickHouseの完全な機能を利用するために、次にデータを読み込み、インスタンスに挿入します。
`INSERT`ステートメントと`s3`関数を組み合わせて、これを実現します。ターゲットテーブルが必要な構造を提供するため、カラムをリストする必要はありません。これは、カラムが`SELECT`句の指定された順序で出現することを要求します。全ての10M行を挿入するには数分かかる場合があり、ClickHouseインスタンスによって異なります。以下では、迅速な応答を確保するために1M行を挿入します。必要に応じて`LIMIT`句やカラム選択を調整してサブセットをインポートします。

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### ClickHouseローカルを使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークセキュリティポリシーにより、ClickHouseクラスターがアウトバウンド接続を行えない場合は、`clickhouse-local`を使用してS3データを挿入することができます。以下の例では、S3バケットから読み込み、`remote`関数を使用してClickHouseに挿入します：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
この操作を安全なSSL接続で実行するには、`remoteSecure`関数を利用してください。
:::
### データのエクスポート {#exporting-data}

`s3`テーブル関数を使用してS3にファイルに書き込むことができます。これには適切な権限が必要です。リクエストに必要な資格情報を渡しますが、詳細については[資格情報の管理](#managing-credentials)ページを参照してください。

以下のシンプルな例では、ソースの代わりにテーブル関数をデスティネーションとして使用します。ここでは、`trips`テーブルからバケットに10,000行をストリーミングし、`lz4`圧縮と出力タイプ`CSV`を指定します：

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

ファイルの形式は拡張子から推測されることに注意してください。`s3`関数でカラムを指定する必要もありません - これは`SELECT`から推測できます。
### 大きなファイルの分割 {#splitting-large-files}

データを単一のファイルとしてエクスポートすることはあまり望ましくありません。ClickHouseを含むほとんどのツールは、並列処理の可能性があるため、複数のファイルに読み書きする際により高いスループット性能を達成します。`INSERT`コマンドを複数回実行し、データのサブセットをターゲットとすることができます。ClickHouseは`PARTITION`キーを使用してファイルを自動的に分割する手段を提供します。

以下の例では、`rand()`関数のモジュラスを使用して10ファイルを作成します。結果のパーティションIDはファイル名で参照されます。これにより、`trips_0.csv.lz4`、`trips_1.csv.lz4`などの数値接尾辞を持つ10のファイルが生成されます：

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

代わりに、データ内のフィールドを参照することもできます。このデータセットの場合、`payment_type`は5のカーディナリティを持つ自然なパーティショニングキーを提供します。

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

上記の関数はすべて単一ノードでの実行に制限されています。読み取り速度はCPUコア数に比例してスケールしますが、他のリソース（通常はネットワーク）が飽和した場合、ユーザーは縦にスケールできます。ただし、このアプローチには制限があります。`INSERT INTO SELECT`クエリを実行するときに分散テーブルに挿入することで、一部のリソース負荷を軽減できますが、依然として単一ノードがデータを読み込み、解析し、処理する必要があります。この課題に対処し、読み込みを水平方向にスケールするために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md)関数があります。

クエリを受け取るノード、すなわちイニシエーターは、クラスター内のすべてのノードへの接続を作成します。どのファイルを読み取る必要があるかを決定するグロブパターンが解決され、イニシエーターはクラスター内のノードにファイルを分配します。これらのノードはワーカーとして機能し、完了した読み取りに応じて処理するファイルをリクエストします。このプロセスにより、読み取りを水平方向にスケールできます。

`s3Cluster`関数は、ターゲットクラスターを指定する必要があることを除けば、単一ノードバリアントと同じ形式です：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスターの名前。
* `source` — ファイルまたは複数のファイルへのURL。読み取り専用モードでは、次のワイルドカードがサポートされます：`*`、`?`、`{'abc','def'}`および`{N..M}`（N、Mは数値、abc、defは文字列）。詳細については[パスのワイルドカード](/engines/table-engines/integrations/s3.md/#wildcards-in-path)を参照してください。
* `access_key_id`及び`secret_access_key` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプション。
* `format` — ファイルの[フォーマット](/interfaces/formats.md/#formats)。
* `structure` — テーブルの構造。フォーマットは'column1_name column1_type, column2_name column2_type, ...'です。

`s3`関数と同様に、バケットが安全でない場合や、環境を通じてセキュリティを定義する場合（例えば、IAMロール）には、資格情報はオプションです。ただし、22.3.1以降、構造はリクエスト内で指定する必要があるため、スキーマは推測されません。

この関数は、ほとんどの場合、`INSERT INTO SELECT`の一部として使用されます。この場合、分散テーブルへの挿入が発生することがよくあります。以下に、`trips_all`が分散テーブルである簡単な例を示します。このテーブルはイベントクラスターを使用していますが、読み取りおよび書き込みに使用されるノードの整合性は要件ではありません：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入はイニシエーターのノードに対して行われます。つまり、読み取りが各ノードで行われる一方で、結果的な行は分配のためにイニシエーターにルーティングされます。高スループットのシナリオでは、これがボトルネックとなる可能性があります。これに対処するために、`s3cluster`関数のための[parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)パラメータを設定します。
## S3テーブルエンジン {#s3-table-engines}

`s3`関数はS3に保存されたデータに対してアドホッククエリを実行できますが、構文が冗長です。`S3`テーブルエンジンを使用すると、バケットURLや資格情報を繰り返し指定する必要がなくなります。これに対処するために、ClickHouseはS3テーブルエンジンを提供します。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — ファイルへのパスを含むバケットURL。読み取り専用モードでは、次のワイルドカードがサポートされます：`*`、`?`、`{abc,def}`および`{N..M}`（N、Mは数値、'abc'、'def'は文字列）。詳細については[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* `format` — ファイルの[フォーマット](/interfaces/formats.md/#formats)。
* `aws_access_key_id`, `aws_secret_access_key` - AWSアカウントユーザーの長期資格情報。これを使用してリクエストを認証できます。このパラメータはオプションです。資格情報が指定されない場合は、構成ファイルの値が使用されます。詳細については[資格情報の管理](#managing-credentials)を参照してください。
* `compression` — 圧縮タイプ。サポートされている値：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。パラメータはオプションです。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。
### データの読み取り {#reading-data}

以下の例では、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`バケット内にある最初の10個のTSVファイルを使用して、`trips_raw`という名前のテーブルを作成します。これらの各ファイルには1M行が含まれています：

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

`{0..9}`パターンを使用して最初の10ファイルに制限していることに注意してください。テーブルを作成後、他のテーブルと同様にこのテーブルをクエリできます：

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

`S3`テーブルエンジンは並列読み取りをサポートします。書き込みは、テーブル定義にグロブパターンを含まない場合にのみサポートされます。したがって、上記のテーブルは書き込むことをブロックします。

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

行は新しいファイルにのみ挿入できることに注意してください。マージサイクルやファイル分割操作はありません。1つのファイルが書き込まれたら、その後の挿入は失敗します。ユーザーには2つの選択肢があります：

* 設定`s3_create_new_file_on_insert=1`を指定します。これにより、各挿入時に新しいファイルが作成されます。挿入操作ごとに末尾に数値の接尾辞が付加されます。上記の例の場合、次の挿入は`trips_1.bin`ファイルの作成を引き起こします。
* 設定`s3_truncate_on_insert=1`を指定します。これにより、ファイルが切り捨てられます。つまり、完全に新しく挿入された行のみが含まれます。

これらの設定の両方はデフォルトで0となっているため、ユーザーはそのいずれかを設定する必要があります。両方が設定されている場合は、`s3_truncate_on_insert`が優先されます。

`S3`テーブルエンジンに関するいくつかの注意点：

- 伝統的な`MergeTree`ファミリーテーブルと異なり、`S3`テーブルを削除しても基盤となるデータは削除されません。
- このテーブルタイプの完全な設定は[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。
- このエンジンを使用する際に注意すべき点：
    * ALTERクエリはサポートされていません
    * SAMPLE操作はサポートされていません
    * 主キーやスキップといったインデックスの概念はありません。
## 資格情報の管理 {#managing-credentials}

前の例では、`s3`関数や`S3`テーブル定義で資格情報を渡しました。これは偶発的な使用には許容できるかもしれませんが、ユーザーは本番環境でより明示的でない認証メカニズムを必要とします。これに対処するために、ClickHouseにはいくつかのオプションがあります：

* **config.xml**または**conf.d**の同等の設定ファイルに接続詳細を指定します。以下は、debianパッケージを使用したインストールの例の内容です。

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

    これらの資格情報は、上記のエンドポイントが要求されたURLと正確にプレフィックスマッチするすべてのリクエストで使用されます。また、この例ではアクセスおよびシークレットキーの代わりに認証ヘッダーを宣言できることにも注意してください。サポートされている設定の完全なリストは[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

* 上記の例は、設定パラメータ`use_environment_credentials`の利用可能性を強調しています。この設定パラメータは、`s3`レベルでグローバルに設定することもできます：

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    この設定により、環境からS3資格情報の取得を試みることが有効になり、IAMロールを通じてアクセスできるようになります。具体的には、次の順序で資格情報の取得が行われます：

   * 環境変数`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`および`AWS_SESSION_TOKEN`の検索
   * **$HOME/.aws**でのチェック
   * AWSセキュリティトークンサービスを介して得られた一時的資格情報 - すなわち[`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) APIを介して
   * ECS環境変数`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`または`AWS_CONTAINER_CREDENTIALS_FULL_URI`および`AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`での資格情報の確認。
   * AWS_EC2_METADATA_DISABLEDがtrueでない場合に提供される[AWS EC2インスタンスメタデータ](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)を介して資格情報を取得します。
   * これらの同じ設定は、同じプレフィックスマッチングルールを使用して特定のエンドポイントにも設定できます。
## パフォーマンス最適化 {#s3-optimizing-performance}

S3関数を用いた読み取りおよび挿入の最適化方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。
### S3ストレージの調整 {#s3-storage-tuning}

内部的に、ClickHouseのマージツリーは、[`Wide`と`Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)の2つの主要なストレージフォーマットを使用しています。現在の実装はClickHouseのデフォルト動作（設定`min_bytes_for_wide_part`および`min_rows_for_wide_part`によって制御）を使用していますが、将来的なリリースではS3に対する動作が分岐することが期待されます。例えば、より大きなデフォルト値の`min_bytes_for_wide_part`が、より`Compact`フォーマットを促進し、ファイル数を減らすことといった具合です。ユーザーは、専らS3ストレージを使用する場合にこれらの設定を調整したいかもしれません。
## S3バック型MergeTree {#s3-backed-mergetree}

`s3`関数と関連するテーブルエンジンは、遅延があるデータを明示的に取得する場合にデータを迅速に取得するのに役立ちますが、データ管理機能やパフォーマンスに関しては限られています。主インデックスのサポートはなく、キャッシュサポートもなく、ファイルの挿入はユーザーによって管理される必要があります。

ClickHouseは、S3が魅力的なストレージソリューションであることを認識しています。特に「コールド」データに対するクエリパフォーマンスがそれほど重要でない場合、ストレージと計算を分離したいユーザーにとって特に魅力的です。これを実現するために、MergeTreeエンジンのストレージとしてS3を使用することをサポートしています。これにより、ユーザーはS3のスケーラビリティとコストの利点、そしてMergeTreeエンジンの挿入とクエリのパフォーマンスを活用できるようになります。
```
### ストレージ階層 {#storage-tiers}

ClickHouseのストレージボリュームは、MergeTreeテーブルエンジンから物理ディスクを抽象化することを可能にします。単一のボリュームは、順序付けられたセットのディスクで構成できます。これは、主にデータストレージに複数のブロックデバイスを使用することを許可するほか、S3を含む他のストレージタイプもサポートしています。ClickHouseデータパーツは、ストレージポリシーに応じてボリューム間で移動でき、充填率に応じて柔軟に対応できるため、ストレージ階層の概念が生まれます。

ストレージ階層は、最新のデータが、通常最もクエリされるデータであり、高性能なストレージ、例えばNVMe SSD上に少量のスペースのみを必要とするホットコールドアーキテクチャをアンロックします。データが古くなるにつれて、クエリ時間のSLAは増加し、クエリ頻度も増加します。このデータのファットテールは、HDDやS3などのオブジェクトストレージのようなより遅い、性能の低いストレージに保存できます。
### ディスクの作成 {#creating-a-disk}

S3バケットをディスクとして利用するには、まずClickHouseの設定ファイル内で宣言する必要があります。config.xmlを拡張するか、できればconf.dの下に新しいファイルを提供します。以下はS3ディスク宣言の例です。

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

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で見つけることができます。Credentialsは[Managing credentials](#managing-credentials)で説明されている同様のアプローチを使用して管理できることに注意してください。つまり、上記の設定ブロックでuse_environment_credentialsをtrueに設定すると、IAMロールを使用できます。
### ストレージポリシーの作成 {#creating-a-storage-policy}

構成が完了すると、この「ディスク」はポリシー内で宣言されたストレージボリュームで使用することができます。以下の例では、s3が唯一のストレージであると仮定します。これはTTLや充填率に基づいてデータを移動できるより複雑なホットコールドアーキテクチャを無視します。

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

ディスクが書き込みアクセスを持つバケットを使用するように設定していると仮定すると、以下の例のようにテーブルを作成できるはずです。簡潔さのために、NYCタクシーカラムのサブセットを使用し、データを直接S3バックのテーブルにストリーミングします。

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

ハードウェアに依存しますが、この1百万行の挿入は実行に数分かかる場合があります。進捗はsystem.processesテーブルで確認できます。行数を最大10万まで調整して、サンプルクエリを探索してみてください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```
### テーブルの変更 {#modifying-a-table}

時折、ユーザーは特定のテーブルのストレージポリシーを変更する必要がある場合があります。これは可能ですが、制限があります。新しいターゲットポリシーには、以前のポリシーのすべてのディスクとボリュームが含まれている必要があります。つまり、ポリシー変更を満たすためにデータが移行されることはありません。これらの制約を検証する際には、ボリュームとディスクはその名前で識別され、違反しようとするとエラーが発生します。ただし、前の例を使用していると仮定すると、以下の変更は有効です。

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

ここでは、私たちの新しいs3_tieredポリシーにメインボリュームを再利用し、新しいホットボリュームを導入しています。これは、パラメータ`<path>`を介して構成された1つのディスクで構成されるデフォルトディスクを使用します。ボリューム名とディスクは変更されません。新しい挿入は、move_factor * disk_sizeに達するまでデフォルトディスクに保存され、その後データはS3に移動されます。
### レプリケーションの処理 {#handling-replication}

S3ディスクを使用したレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実行できます。詳細については、[S3オブジェクトストレージを使用して二つのAWSリージョンにわたる単一シャードをレプリケートする](#s3-multi-region)ガイドを参照してください。
### 読み取りと書き込み {#read--writes}

以下のノートは、ClickHouseとのS3の相互作用の実装について説明します。一般に、情報提供を目的としており、[パフォーマンスの最適化](#s3-optimizing-performance)時に読者に役立つ場合があります。

* デフォルトでは、クエリ処理パイプラインのいずれかのステージで使用されるスレッドの最大数はコアの数と等しくなります。一部のステージは他のステージよりも並列化が容易であるため、この値は上限を提供します。複数のクエリステージは同時に実行される可能性があり、データはディスクからストリーミングされます。したがって、クエリに使用されるスレッドの正確な数はこれを超える可能性があります。設定[ max_threads ](/operations/settings/settings.md/#settings-max_threads)を変更してください。
* S3の読み取りはデフォルトで非同期です。この動作は`remote_filesystem_read_method`を設定することによって決定され、デフォルトでは`threadpool`の値に設定されています。リクエストを処理する際、ClickHouseはストライプでグラニュールを読み取ります。これらのストライプのそれぞれには多くのカラムが含まれている可能性があります。スレッドは、各グラニュールのカラムを1つずつ読み取ります。これを同期的に行うのではなく、データを待っている間にすべてのカラムの事前取得が行われます。これにより、各カラムでの同期的な待機に比べて大幅なパフォーマンス改善が図られます。この設定を変更する必要はない場合がほとんどです - [パフォーマンスの最適化](#s3-optimizing-performance)を参照してください。
* 書き込みは並列で行われ、最大100の同時ファイル書き込みスレッドがあります。`max_insert_delayed_streams_for_parallel_write`は、デフォルト値1000で設定され、並列で書き込まれるS3ブロブの数を制御します。ファイルを書き込むためにはバッファが必要であるため（約1MB）、これによりINSERTのメモリ消費が実効的に制限されます。サーバのメモリが少ない状況下では、この値を下げることが適切かもしれません。
## S3オブジェクトストレージをClickHouseディスクとして使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成する手順を必要とする場合は、**Create S3 buckets and an IAM role**を展開し、それに従ってください。

<BucketDetails />
### S3バケットをディスクとして使用するためにClickHouseを構成する {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
この例は、デフォルトのClickHouseディレクトリを持つサービスとしてインストールされたLinux Debパッケージに基づいています。

1.  ClickHouse `config.d`ディレクトリに新しいファイルを作成し、ストレージ構成を保存します。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 以下をストレージ構成として追加します。前のステップからのバケットパス、アクセスキー、シークレットキーを置き換えます。
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
`<disks>`タグ内の`s3_disk`と`s3_cache`のタグは任意のラベルです。これらは他の何かに設定できますが、ディスクを参照するために`<policies>`タブの`<disk>`タブでも同じラベルを使用する必要があります。 `<S3_main>`タグも任意で、ClickHouseでリソースを作成する際の識別ストレージターゲットとして使用されるポリシーの名前です。

上記に示す構成はClickHouseバージョン22.8以上のためのものです。古いバージョンを使用している場合は、[データの保存](/operations/storing-data.md/#using-local-cache)の文書を参照してください。

S3の使用に関する詳細情報:
統合ガイド: [S3バックのMergeTree](#s3-backed-mergetree)
:::

3. ファイルの所有者を`clickhouse`ユーザーとグループに更新します。
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 変更を有効にするため、ClickHouseインスタンスを再起動します。
```bash
service clickhouse-server restart
```
### テスト {#testing}
1. ClickHouseクライアントでログインします。例えば次のようにします。
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

3. テーブルが正しいポリシーで作成されたことを表示します。
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
6. AWSコンソールでバケットに移動し、新しいものとフォルダを選択します。
以下のようなものが見えるはずです。

<img src={S3J} alt="AWSコンソールでのS3バケットビュー" />
## S3オブジェクトストレージを使用した二つのAWSリージョンにわたる単一シャードのレプリケーション {#s3-multi-region}

:::tip
オブジェクトストレージはClickHouse Cloudでデフォルトで使用されるため、ClickHouse Cloudで実行している場合は、この手順に従う必要はありません。
:::
### 展開を計画する {#plan-the-deployment}
このチュートリアルは、AWS EC2で二つのClickHouseサーバーノードと三つのClickHouse Keeperノードを展開することに基づいています。ClickHouseサーバーのデータストアはS3です。二つのAWSリージョンが使用され、それぞれにClickHouseサーバーとS3バケットがあり、災害復旧をサポートします。

ClickHouseのテーブルは二つのサーバー、すなわち二つのリージョンにわたってレプリケートされます。
### ソフトウェアのインストール {#install-software}
#### ClickHouseサーバーノード {#clickhouse-server-nodes}
ClickHouseサーバーノードの展開手順を実行する際は、[インストール手順](/getting-started/install.md/#available-installation-options)を参照してください。
#### ClickHouseの展開 {#deploy-clickhouse}

二つのホストにClickHouseを展開します。サンプル構成では、これらは`chnode1`、`chnode2`と名付けられています。

`chnode1`を一つのAWSリージョンに配置し、`chnode2`を別のリージョンに配置します。
#### ClickHouse Keeperの展開 {#deploy-clickhouse-keeper}

三つのホストにClickHouse Keeperを展開します。サンプル構成では、これらは`keepernode1`、`keepernode2`、`keepernode3`と名付けられています。`keepernode1`は`chnode1`と同じリージョンに展開し、`keepernode2`は`chnode2`、`keepernode3`は別のリージョンですが、異なるアベイラビリティゾーンに配置します。

ClickHouse Keeperノードの展開手順を実行する際は、[インストール手順](/getting-started/install.md/#install-standalone-clickhouse-keeper)を参照してください。
### S3バケットの作成 {#create-s3-buckets}

二つのリージョンにそれぞれ`chnode1`と`chnode2`を配置し、バケットを作成します。

バケットとIAMロールを作成する手順が必要な場合は、**Create S3 buckets and an IAM role**を展開し、それに従ってください。

<BucketDetails />

構成ファイルは`/etc/clickhouse-server/config.d/`に配置されます。こちらは一つのバケット用のサンプル構成ファイルで、他のバケットは同様に3行が異なります：

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
このガイドの多くの手順は、構成ファイルを`/etc/clickhouse-server/config.d/`に配置するように求めます。これはLinuxシステムの構成オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouseはデフォルトの構成をオーバーライドするためにその内容を使用します。このファイルをオーバーライドディレクトリに配置することで、アップグレード中に構成を失うことを避けることができます。
:::
### ClickHouse Keeperの構成 {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロン（ClickHouseサーバーから分離）で実行する場合、構成は単一のXMLファイルです。このチュートリアルでは、ファイルは`/etc/clickhouse-keeper/keeper_config.xml`です。すべての3つのKeeperサーバーは同じ構成を使用し、異なる設定は`<server_id>`のみです。

`server_id`は、構成ファイルが使用されるホストに割り当てられるIDを示します。以下の例では、`server_id`は`3`で、ファイル内の`<raft_configuration>`セクションの下で、サーバー3は`keepernode3`というホスト名を持っています。これがClickHouse Keeperプロセスがリーダーを選択する際に接続すべき他のサーバーを知るための方法です。

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

ClickHouse Keeperの構成ファイルを配置します（`<server_id>`を設定することを忘れずに）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### ClickHouseサーバーの構成 {#configure-clickhouse-server}
#### クラスターの定義 {#define-a-cluster}

ClickHouseのクラスターは、構成の`<remote_servers>`セクションで定義されます。このサンプルでは、`cluster_1S_2R`という1つのクラスターが定義されており、単一のシャードに二つのレプリカがあります。レプリカは`chnode1`と`chnode2`のホストに配置されています。

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

クラスターで作業する場合、クラスター、シャード、レプリカの設定でDDLクエリを埋め込むマクロを定義すると便利です。このサンプルでは、`shard`と`replica`の詳細なしにレプリケートテーブルエンジンの使用を指定できます。テーブルを作成すると、`system.tables`をクエリすることで`shard`と`replica`のマクロがどのように使用されているかを確認できます。

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
上記のマクロは`chnode1`のものであり、`chnode2`では`replica`を`replica_2`に設定します。
:::
#### ゼロコピーリプリケーションの無効化 {#disable-zero-copy-replication}

ClickHouseのバージョン22.7以前では、`allow_remote_fs_zero_copy_replication`の設定はS3およびHDFSディスクに対してデフォルトで`true`に設定されています。この設定は、災害復旧シナリオでは`false`に設定する必要があり、バージョン22.8以上ではデフォルトで`false`に設定されています。

この設定は二つの理由から`false`に設定すべきです：1) この機能は本番用ではない；2) 災害復旧シナリオではデータとメタデータの両方が複数のリージョンに保存される必要があります。`allow_remote_fs_zero_copy_replication`を`false`に設定してください。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeperは、ClickHouseノード間でのデータのレプリケーションを調整する役割を担っています。ClickHouseにClickHouse Keeperノードを通知するには、各ClickHouseノードに構成ファイルを追加します。

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
### ネットワーキングの構成 {#configure-networking}

AWSでのセキュリティ設定を構成する際に、サーバー間通信が可能であり、外部からアクセスできるようにするため、[ネットワークポート](../../../guides/sre/network-ports.md)リストを参照してください。

すべてのサーバーは、互いに通信し、S3と通信するためにネットワーク接続をリスンする必要があります。デフォルトでは、ClickHouseはループバックアドレスにのみリスンするため、これを変更する必要があります。これは`/etc/clickhouse-server/config.d/`で構成されます。こちらは、ClickHouseとClickHouse KeeperがすべてのIP v4インターフェースでリスンするように構成するサンプルです。詳細については、ドキュメントまたはデフォルトの構成ファイル`/etc/clickhouse/config.xml`を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### サーバーを起動する {#start-the-servers}
#### ClickHouse Keeperの実行 {#run-clickhouse-keeper}

各Keeperサーバーで、お使いのオペレーティングシステムに応じたコマンドを実行します。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### ClickHouse Keeperのステータスを確認する {#check-clickhouse-keeper-status}

`netcat`を使ってClickHouse Keeperにコマンドを送ります。例えば、`mntr`はClickHouse Keeperクラスターの状態を返します。各Keeperノードでこのコマンドを実行すると、1つがリーダーで、他の2つがフォロワーであることが分かります。

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

各ClickHouseサーバーで次のコマンドを実行します。

```bash
sudo service clickhouse-server start
```
#### ClickHouseサーバーを確認する {#verify-clickhouse-server}

[クラスター構成](#define-a-cluster)を追加したとき、二つのClickHouseノード間でレプリケートされた単一シャードが定義されました。この確認ステップでは、ClickHouseが起動したときにクラスターが構築されたことを確認し、そのクラスターを使用してレプリケートテーブルを作成します。
- クラスターが存在するか確認します：
  ```sql
  show clusters
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- `ReplicatedMergeTree`テーブルエンジンを使用してクラスター内にテーブルを作成します：
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
- 先に定義したマクロの使い方を理解します。

  マクロ`shard`、`replica`は[定義された](#define-a-cluster)もので、以下のハイライトした行では、各ClickHouseノードでどのように値が置き換えられるかが示されます。また、`uuid`という値も使用されており、`uuid`はマクロに定義されていないため、システムによって生成されます。
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
  上記の`'clickhouse/tables/{uuid}/{shard}`のzookeeperパスは、`default_replica_path`と`default_replica_name`を設定することでカスタマイズできます。詳細なドキュメントは[こちら](/operations/server-configuration-parameters/settings.md/#default_replica_path)にあります。
  :::
### テスト {#testing-1}

これらのテストでは、データが二つのサーバー間でレプリケートされ、S3バケットに保存されていることを確認します。ローカルディスクには保存されていないことも確認します。

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

  このクエリは、ディスク上のデータのサイズと、どのディスクが使用されているかを決定するために使用されるポリシーを示します。
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

  ローカルディスク上のデータのサイズを確認します。上記から、ストレージされた数百万行のサイズは36.42 MiBです。これはS3にあり、ローカルディスクにはないはずです。また、上記のクエリはローカルディスクのデータとメタデータが保存されている場所も示しています。ローカルのデータを確認します：
```response
root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
536K	/var/lib/clickhouse/disks/s3_disk/store/551
```

各S3バケット内のS3データを確認します（合計は表示されませんが、挿入後に両方のバケットに約36 MiBが保存されています）：

<img src={Bucket1} alt="最初のS3バケットのデータサイズ" />

<img src={Bucket2} alt="二番目のS3バケットのデータサイズ" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)は、Amazon S3の新しい高性能な単一可用性ゾーンストレージクラスです。

この[ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)を参照して、ClickHouseでのS3Expressのテスト結果についてお読みください。

:::note
  S3Expressはデータを単一のAZ内に保存します。AZの障害が発生した場合、データは利用できなくなります。
:::
### S3ディスク {#s3-disk}

S3Expressバケットによるストレージを使用したテーブルを作成するには、次の手順が必要です：

1. `Directory`タイプのバケットを作成します
2. S3ユーザーに必要なすべての権限を付与するための適切なバケットポリシーをインストールします（例：`"Action": "s3express:*"` は制限のないアクセスを許可するためのものです）
3. ストレージポリシーを設定する際は、`region`パラメータを指定してください

ストレージの設定は通常のS3と同じで、たとえば次のようになります：

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

その後、新しいストレージにテーブルを作成します：

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

S3ストレージもサポートされていますが、`Object URL`パスのみで利用可能です。例：

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

構成でバケットのリージョンを指定する必要もあります：

``` xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### バックアップ {#backups}

上記で作成したディスクにバックアップを保存することができます：

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
