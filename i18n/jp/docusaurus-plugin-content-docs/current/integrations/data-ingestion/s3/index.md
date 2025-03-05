---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: ClickHouseとのS3統合

---
import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';

# ClickHouseとのS3統合

S3からClickHouseにデータを挿入することができ、またS3をエクスポート先として使用することも可能で、「データレイク」アーキテクチャとの相互作用を実現します。さらに、S3は「コールド」ストレージ層を提供し、ストレージと計算を分離するのに役立ちます。以下のセクションでは、ニューヨーク市のタクシーデータセットを使用して、S3とClickHouseの間でデータを移動するプロセスを示し、主要な構成パラメータを特定し、パフォーマンス最適化についてのヒントを提供します。
## S3テーブル関数 {#s3-table-functions}

`s3`テーブル関数を使用すると、S3互換ストレージからのファイルの読み書きが可能になります。この構文の概要は次の通りです。

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

ここで：

* path — ファイルのパスを含むバケットのURL。読み取り専用モードで以下のワイルドカードをサポートしています：`*`, `?`, `{abc,def}` および `{N..M}`（ここで `N`, `M` は数字で、`'abc'` や `'def'` は文字列です）。詳細については、[パスのワイルドカード使用に関するドキュメント](/engines/table-engines/integrations/s3/#wildcards-in-path)を参照してください。
* format — ファイルの[形式](/interfaces/formats#formats-overview)。
* structure — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'` 。
* compression — パラメータはオプションです。サポートされている値： `none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮が自動的に検出されます。

パス式でワイルドカードを使用することで、複数のファイルを参照でき、並列処理を行うことが可能になります。
### 準備 {#preparation}

ClickHouseにテーブルを作成する前に、S3バケット内のデータを詳しく見ることをお勧めします。これをClickHouseから直接行うには、`DESCRIBE`ステートメントを使用します：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE`ステートメントの出力には、ClickHouseがこのデータを自動的に推測する方法が表示されます。S3バケットで表示される内容に注意してください。また、gzip圧縮形式を自動的に認識してデコンプレッションすることにも注目してください：

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

私たちのS3ベースのデータセットと対話するために、デフォルトのデータベースに`trips`という名前の標準`MergeTree`テーブルを準備します。以下のステートメントは、推測されたデータ型の一部を変更することを選択したことに注意してください。特に、`Nullable()`データ型修飾子を使用しないことにしたため、不要な追加保存データと追加のパフォーマンスオーバーヘッドを回避できます：

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

`pickup_date`フィールドでの[パーティション化](/engines/table-engines/mergetree-family/custom-partitioning-key)の使用に注意してください。通常、パーティションキーはデータ管理のために使用されますが、後でこのキーを使用してS3への書き込みを並列化します。

タクシーデータセットの各エントリには、タクシー旅行が含まれています。この匿名化されたデータは、S3バケット https://datasets-documentation.s3.eu-west-3.amazonaws.com/ 内の **nyc-taxi** フォルダーに圧縮された2000万件のレコードで構成されています。データはTSV形式で、ファイルごとに約100万行があります。
### S3からデータを読み取る {#reading-data-from-s3}

ClickHouse内に永続性が必要ないソースとしてS3データをクエリすることができます。次のクエリでは、10行をサンプルしています。ここではバケットが公開されているため、資格情報は必要ありません：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames`形式では、最初の行にカラム名がエンコードされているため、カラムをリストする必要はありません。`CSV`や`TSV`などの他の形式では、クエリのための自動生成されたカラム（例：`c1`、`c2`、`c3`など）が返されます。

クエリは `_path` と `_file` のような[仮想カラム](../sql-reference/table-functions/s3#virtual-columns)もサポートしており、それぞれバケットパスとファイル名に関する情報を提供します。例えば：

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

このサンプルデータセットの行数を確認します。ファイルの展開のためにワイルドカードを使用していることに注意し、20ファイルすべてを考慮します。このクエリは、ClickHouseインスタンスのコア数によって約10秒かかります：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

データをサンプリングしたり、アドホックな探索クエリを実行したりするのには便利ですが、S3から直接データを読み取ることは定期的に行うことはおすすめしません。真剣な作業の時には、データをClickHouseの`MergeTree`テーブルにインポートします。
### clickhouse-localの使用 {#using-clickhouse-local}

`clickhouse-local`プログラムを使用すると、ClickHouseサーバーを展開して構成することなく、ローカルファイルの迅速な処理を行うことができます。`s3`テーブル関数を使用した任意のクエリをこのユーティリティで実行できます。例えば：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### S3からのデータ挿入 {#inserting-data-from-s3}

ClickHouseの全機能を活用するために、次にデータを読み取ってインスタンスに挿入します。これを達成するために、`s3`関数とシンプルな`INSERT`文を組み合わせます。ターゲットテーブルが必要な構造を提供するため、カラムをリストする必要はありません。これにより、カラムが`SELECT`句の位置に従ってマッピングされます。すべての1000万行を挿入するには数分かかる場合がありますが、応答を迅速に確保するために、ここでは100万行を挿入します。必要に応じて、それぞれの`LIMIT`句やカラム選択を調整して部分的にインポートします：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### ClickHouse Localを使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークのセキュリティポリシーによりClickHouseクラスターが外部接続を行うことができない場合、`clickhouse-local`を使ってS3データを挿入することが可能です。以下の例では、S3バケットから読み取ってClickHouseに挿入するために`remote`関数を使用します：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
安全なSSL接続を介してこれを実行するには、`remoteSecure`関数を利用してください。
:::
### データのエクスポート {#exporting-data}

`s3`テーブル関数を使用してS3にファイルを書き込むことができます。これには適切な権限が必要です。リクエストで必要な資格情報を渡しますが、詳細は[資格情報の管理](#managing-credentials)ページを参照してください。

以下の簡単な例では、ソースではなく宛先としてテーブル関数を使用します。ここでは、`trips`テーブルから1万行をバケットにストリームし、`lz4`圧縮と`CSV`出力タイプを指定します：

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

ここでは、ファイルの形式は拡張子から推測されていることに注意してください。また、`s3`関数内でカラムを指定する必要はなく、この情報は`SELECT`から推測できます。
### 大きなファイルの分割 {#splitting-large-files}

データを単一のファイルとしてエクスポートすることは考えにくいです。ClickHouseを含むほとんどのツールは、並列処理の可能性があるため、複数のファイルに対して読み書きすることでより高いスループットパフォーマンスを達成します。データのサブセットをターゲットにして`INSERT`コマンドを複数回実行することができます。ClickHouseは、`PARTITION`キーを使用して自動的にファイルを分割する手段を提供しています。

以下の例では、`rand()`関数の剰余を使用して10個のファイルを作成します。生成されたパーティションIDがファイル名に参照される方法に注目してください。これにより、数字のサフィックスを持つ10個のファイル（例：`trips_0.csv.lz4`、`trips_1.csv.lz4`など）が作成されます：

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

あるいは、データ内のフィールドを参照することもできます。このデータセットにおいて、`payment_type`は5のカーディナリティを持つ自然なパーティショニングキーを提供します。

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
### クラスターの利用 {#utilizing-clusters}

上記の関数はすべて、単一ノードでの実行に制限されています。読み取り速度はCPUコアとともにリニアにスケールし、他のリソース（通常はネットワーク）が飽和するまで続き、ユーザーは垂直スケーリングを行えます。ただし、このアプローチには限界があります。ユーザーは、`INSERT INTO SELECT`クエリを実行する際に分散テーブルに挿入することで、リソースの圧力を一部軽減することができますが、データを読み取り、解析し、処理するのは依然として単一ノードです。この課題に対処し、読み取りを水平方向にスケーリングできるようにするために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md)関数を提供しています。

クエリを受信するノード（イニシエーターと呼ばれる）は、クラスター内のすべてのノードとの接続を作成します。どのファイルを読み取るかを決定するグロブパターンは、一連のファイルに解決されます。イニシエーターは、クラスター内のノードにファイルを配布し、これらのノードはワーカーとして機能します。これにより、読み取りを水平方向にスケールさせることが可能になります。

`s3Cluster`関数は、単一ノードのバリアントと同じ形式をとりますが、ターゲットクラスターを指定する必要があります：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータを構築するために使用されるクラスターの名前。
* `source` — ファイルまたは複数のファイルへのURL。読み取り専用モードで以下のワイルドカードをサポートします：`*`、`?`、`{'abc','def'}` および `{N..M}`（ここで N、M は数字で、abc、def は文字列です）。詳細については[パスのワイルドカード](/engines/table-engines/integrations/s3.md/#wildcards-in-path)を参照してください。
* `access_key_id` および `secret_access_key` — 指定されたエンドポイントで使用する資格情報を指定する鍵。オプションです。
* `format` — ファイルの[形式](/interfaces/formats#formats-overview)。
* `structure` — テーブルの構造。形式は 'column1_name column1_type, column2_name column2_type, ...' です。

`s3`関数と同様に、バケットが不正な場合は資格情報はオプションです。また、IAMロールを介してセキュリティを定義する場合も同様です。ただし、22.3.1以降は、構造をリクエストに指定する必要があります。つまり、スキーマは推測されません。

この関数は、ほとんどの場合、`INSERT INTO SELECT`の一部として使用されます。この場合、通常は分散テーブルに挿入します。以下は簡単な例です。ここで`trips_all`は分散テーブルです。このテーブルはイベントクラスターを使用しますが、読み取りと書き込みに使用するノードの一貫性は要件ではありません：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入はイニシエーターノードに対して行われます。これにより、各ノードで読み取りが行われますが、結果の行はイニシエーターにルーティングされて配布されます。高スループットシナリオでは、これがボトルネックになる可能性があります。これに対処するために、`s3cluster`関数の[parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)パラメータを設定します。
## S3テーブルエンジン {#s3-table-engines}

`s3`関数は、S3に格納されているデータに対してアドホッククエリを実行できますが、構文が冗長です。`S3`テーブルエンジンを使用することで、バケットURLや資格情報を何度も指定する必要がなくなります。ClickHouseはS3テーブルエンジンを提供しています。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — ファイルへのパスを持つバケットのURL。読み取り専用モードで以下のワイルドカードをサポートします：`*`、`?`、`{abc,def}` および `{N..M}`（ここで N、M は数字、'abc'、'def' は文字列です）。詳細は[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* `format` — ファイルの[形式](/interfaces/formats#formats-overview)。
* `aws_access_key_id`, `aws_secret_access_key` - AWSアカウントユーザー用の長期的な資格情報。リクエストを認証するために使用できます。このパラメータはオプションです。資格情報が指定されていない場合、設定ファイルの値が使用されます。詳細は[資格情報の管理](#managing-credentials)を参照してください。
* `compression` — 圧縮タイプ。サポートされる値：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。パラメータはオプションです。デフォルトでは、ファイル拡張子によって圧縮が自動的に検出されます。
### データの読み込み {#reading-data}

以下の例では、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`バケット内にある最初の10個のTSVファイルを使用して、`trips_raw`という名前のテーブルを作成します。これらの各ファイルには100万行が含まれています：

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

`{0..9}`パターンを使用して最初の10個のファイルに制限していることに注意してください。作成後、このテーブルを他のテーブルのようにクエリできます：

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

`S3`テーブルエンジンは並列読み取りをサポートします。テーブル定義にグロブパターンが含まれている場合、書き込みはサポートされません。したがって、上記のテーブルでは書き込みがブロックされます。

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

行は新しいファイルにのみ挿入できることに注意してください。マージサイクルやファイル分割操作はありません。ファイルが書き込まれると、その後の挿入は失敗します。ユーザーは次の2つのオプションを持っています：

* 設定 `s3_create_new_file_on_insert=1` を指定すると、各挿入ごとに新しいファイルが作成されます。各挿入操作に対して単調に増加する数値サフィックスが各ファイルの末尾に付与されます。この場合、次の挿入は`trips_1.bin`ファイルの作成を引き起こします。
* 設定 `s3_truncate_on_insert=1` を指定すると、ファイルが切り捨てられます。すなわち、完了時に新しく挿入された行のみが含まれます。

これらの設定はデフォルトで0に設定されているため、ユーザーはそのいずれかを設定する必要があります。両方が設定されている場合、`s3_truncate_on_insert`が優先されます。

`S3`テーブルエンジンに関するいくつかの注意事項：

- 従来の`MergeTree`ファミリーテーブルとは異なり、`S3`テーブルを削除した場合、基になるデータは削除されません。
- このテーブルタイプの完全な設定は[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。
- このエンジンを使用する際の次の制限に注意してください：
    * ALTERクエリはサポートされていません。
    * SAMPLE操作はサポートされていません。
    * インデックス、すなわち主キーやスキップの概念はありません。
## 資格情報の管理 {#managing-credentials}

前の例では、`s3`関数または`S3`テーブル定義に資格情報を渡しました。これは偶発的な使用に対しては受け入れられるかもしれませんが、ユーザーは本番環境ではより明示的な認証メカニズムを必要とします。この対処法として、ClickHouseはいくつかのオプションを提供しています：

* 接続の詳細を`config.xml`または相当の設定ファイルの`conf.d`内に指定します。以下に例となるファイルの内容を示します。これはdebianパッケージを使用してのインストールを想定しています。

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

    これらの資格情報は、上記のエンドポイントが要求されたURLに対して完全に一致する場合に、すべてのリクエストで使用されます。また、この例では、アクセスキーおよび秘密キーの代わりに認証ヘッダーを宣言する能力も強調されています。サポートされる設定の完全なリストは[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

* 上記の例は、設定パラメータ`use_environment_credentials`の利用可能性を強調しています。この設定パラメータは、`s3`レベルでグローバルに設定することもできます：

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    この設定を使用すると、環境からS3資格情報を取得しようとする試みが行われ、IAMロールを介してのアクセスが可能になります。具体的には、以下の取得順序が実行されます：

   * 環境変数 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、および `AWS_SESSION_TOKEN`の検索
   * **$HOME/.aws**内のチェック
   * AWSセキュリティトークンサービスを介した一時的な資格情報の取得 — すなわち [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) APIを介して
   * ECS環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` または `AWS_CONTAINER_CREDENTIALS_FULL_URI`および`AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`の資格情報をチェック
   * [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED)がtrueでない場合、Amazon EC2インスタンスメタデータを介して資格情報を取得
   * これらの同じ設定を、同じ接頭辞一致ルールを使用して特定のエンドポイントに対しても設定可能です。
## パフォーマンスの最適化 {#s3-optimizing-performance}

S3関数を使用して読み取りと挿入を最適化する方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。
### S3ストレージの調整 {#s3-storage-tuning}

内部的に、ClickHouseマージツリーは、[`Wide`および `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)という2つの主要なストレージ形式を使用します。現在の実装はClickHouseのデフォルト動作（設定`min_bytes_for_wide_part` および `min_rows_for_wide_part`を通じて管理）が使用されていますが、S3に対する動作は今後のリリースで分岐することが期待されます。たとえば、より大きなデフォルト値の`min_bytes_for_wide_part`は、より`Compact`形式を促し、ファイル数を減少させることが期待されます。ユーザーは、専らS3ストレージを使用する場合、これらの設定を調整することを希望する場合があります。
## S3バックアップMergeTree {#s3-backed-mergetree}

`s3`関数と関連するテーブルエンジンを使用すると、S3内のデータを馴染みのあるClickHouse構文を使用してクエリできます。ただし、データ管理機能とパフォーマンスに関しては制限があります。主インデックスのサポートがなく、キャッシュサポートもなく、ファイルの挿入はユーザーによって管理する必要があります。

ClickHouseは、S3が特に「コールド」データ上でのクエリパフォーマンスがそれほど重要でない場合、魅力的なストレージソリューションであることを認識しており、ユーザーはストレージと計算を分離することを求めています。これを達成するために、S3をMergeTreeエンジンのストレージとして使用することによるサポートが提供されており、ユーザーはS3のスケーラビリティとコスト利点、そしてMergeTreeエンジンの挿入とクエリパフォーマンスを活用できるようになります。
### ストレージ Tier {#storage-tiers}

ClickHouseのストレージボリュームでは、物理ディスクをMergeTreeテーブルエンジンから抽象化できます。単一のボリュームは、整然としたディスクのセットから構成される可能性があります。主に、複数のブロックデバイスがデータストレージに使用されることを許すだけでなく、この抽象化によりS3を含む他のストレージタイプも利用できるようになります。ClickHouseデータパーツは、ストレージポリシーに基づいてボリューム間で移動可能であり、フィルレートを調整することでストレージTierの概念が作成されます。

ストレージTierは、最新のデータを保持するためのホット-コールドアーキテクチャを解放します。これは通常、最もクエリされるデータも包含し、パフォーマンスが高いストレージ、例えば、NVMe SSD上で少量のスペースのみを必要とします。データが古くなるにつれて、クエリ時間のSLAは増加し、クエリ頻度も増加します。このデータのファットテールを、HDDやS3などのオブジェクトストレージなど、遅いストレージに保存できます。
### ディスクの作成 {#creating-a-disk}

S3バケットをディスクとして利用するには、まずClickHouseの設定ファイル内でそれを宣言する必要があります。config.xmlを拡張するか、好ましくはconf.dの下に新しいファイルを用意します。以下にS3ディスク宣言の例を示します：

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

このディスク宣言に関する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。認証情報は[Managing credentials](#managing-credentials)で説明されているのと同様のアプローチを使用して管理できることに注意してください。すなわち、上記の設定ブロック内でuse_environment_credentialsをtrueに設定することでIAMロールを使用できます。
### ストレージポリシーの作成 {#creating-a-storage-policy}

設定が完了すると、この「ディスク」はポリシー内で宣言されたストレージボリュームで使用されます。以下の例では、s3が唯一のストレージであると仮定します。これは、TTLやフィルレートに基づいてデータが移動できるより複雑なホット-コールドアーキテクチャを無視しています。

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

ディスクをライティングアクセスのあるバケットに設定している場合、以下の例のようにテーブルを作成できるはずです。簡潔さのために、NYCタクシーのカラムのサブセットを使用し、データを直接s3バックのテーブルにストリーミングします：

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

ハードウェアにより、この1百万行の挿入には数分かかることがあります。進捗はsystem.processesテーブルを使って確認できます。行数を10mの制限まで調整し、一部のサンプルクエリを試してみてください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```
### テーブルの変更 {#modifying-a-table}

ユーザーは特定のテーブルのストレージポリシーを変更する必要がある場合があります。これは可能ですが、制約があります。新しいターゲットポリシーには、以前のポリシーのすべてのディスクとボリュームを含む必要があります。つまり、ポリシー変更を満たすためにデータが移行されることはありません。これらの制約を検証する際、ボリュームとディスクはその名前で識別され、違反しようとするとエラーになります。ただし、前の例を使用していると仮定すると、以下の変更は有効です。

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

ここでは、新しいs3_tieredポリシーの中でメインボリュームを再利用し、新しいホットボリュームを導入しています。これは、パラメータ`<path>`を介して設定された1つのディスクのみで構成されるデフォルトディスクを使用します。ボリューム名とディスクは変わりません。テーブルへの新しい挿入は、thisがmove_factor * disk_sizeに達するまでデフォルトディスクに存在します。その時点でデータはS3に移転されます。
### レプリケーションの管理 {#handling-replication}

S3ディスクを使用したレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実現できます。詳細については、[S3オブジェクトストレージを介して2つのAWSリージョンにわたる単一のシャードのレプリケーション](#s3-multi-region)ガイドをご覧ください。
### 読み取りと書き込み {#read--writes}

以下のノートは、ClickHouseとのS3インタラクションの実装をカバーしています。一般的には情報提供のみですが、[パフォーマンスの最適化](#s3-optimizing-performance)の際に読者の助けになるかもしれません：

* デフォルトでは、クエリ処理パイプラインの任意のステージで使用される最大クエリ処理スレッド数はコアの数と等しくなります。一部のステージは他のステージよりも並行性が高いため、この値は上限を提供します。データはディスクからストリーミングされるため、複数のクエリステージが同時に実行される可能性があります。したがって、クエリに使用されるスレッドの正確な数はこれを超えることがあります。[max_threads](/operations/settings/settings#max_threads)設定を使用して修正できます。
* S3の読み取りはデフォルトで非同期です。この動作は`remote_filesystem_read_method`を設定することによって決定され、デフォルトでは`threadpool`の値に設定されています。リクエストを処理する際、ClickHouseはストライプでグラニュールを読み取ります。これらのストライプのそれぞれには多くのカラムが含まれている可能性があります。スレッドは自身のグラニュールのカラムを一つずつ読み取ります。これを同期的に行うのではなく、データを待つ前にすべてのカラムのためにプリフェッチを行います。これにより、各カラムの同期的な待機に比べてかなりのパフォーマンス向上が得られます。ほとんどの場合、ユーザーはこの設定を変更する必要はありません - [パフォーマンスの最適化](#s3-optimizing-performance)をご覧ください。
* 書き込みは並行して行われ、最大100の同時ファイル書き込みスレッドがあります。`max_insert_delayed_streams_for_parallel_write`は、デフォルト値が1000です。この値は、並行して書き込まれるS3ブロブの数を制御します。書き込まれる各ファイルにバッファが必要なため（~1MB）、これはINSERTのメモリ消費を効果的に制限します。サーバーのメモリが少ないシナリオでは、この値を下げることが適切かもしれません。
## ClickHouseディスクとしてS3オブジェクトストレージを使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成するための手順を必要とする場合は、**S3バケットとIAMロールの作成**を展開し、次に進んでください：

<BucketDetails />
### S3バケットをディスクとして使用するようClickHouseを設定する {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下の例は、デフォルトのClickHouseディレクトリがあるサービスとしてインストールされたLinux Debパッケージに基づいています。

1.  ClickHouseの`config.d`ディレクトリに新しいファイルを作成して、ストレージ設定を保存します。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 保存先の設定に以下を追加します；先のステップからバケットパス、アクセスキー、およびシークレットキーを置き換えます。
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
`<disks>`タグ内の`s3_disk`および`s3_cache`ラベルは任意のラベルです。これらは別の名前に設定することもできますが、同じラベルを`<policies>`タブの下の`<disk>`タブで使用してディスクを参照する必要があります。
`<S3_main>`タグも任意であり、ClickHouseでリソースを作成する際のストレージターゲットの識別子として使用されるポリシー名です。

上記の構成はClickHouseバージョン22.8以上用です。古いバージョンを使用している場合は、[データの保存](/operations/storing-data.md/#using-local-cache)ドキュメントを参照してください。

S3の使用に関する詳細：
統合ガイド：[S3バックのMergeTree](#s3-backed-mergetree)
:::

3. ファイルのオーナーを`clickhouse`ユーザーとグループに更新します。
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 変更を反映させるためにClickHouseインスタンスを再起動します。
```bash
service clickhouse-server restart
```
### テスト {#testing}
1. ClickHouseクライアントにログインします。以下のように実行します。
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

3. テーブルが正しいポリシーで作成されたことを確認します。
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
6. AWSコンソールで、バケットに移動し、新しいバケットとフォルダーを選択します。
次のようなものが表示されるはずです：

<img src={S3J} alt="AWSコンソール内のS3バケットビュー" />
## S3オブジェクトストレージを使用して2つのAWSリージョン間で単一のシャードをレプリケートする {#s3-multi-region}

:::tip
ClickHouse Cloudではデフォルトでオブジェクトストレージが使用されているので、ClickHouse Cloud実行中の場合はこの手順を踏む必要はありません。
:::
### デプロイメントを計画する {#plan-the-deployment}
このチュートリアルは、AWS EC2上で2つのClickHouse Serverノードと3つのClickHouse Keeperノードをデプロイすることに基づいています。ClickHouseサーバーのデータストアはS3です。災害復旧を支援するために、各リージョンにClickHouse ServerとS3バケットを配置した2つのAWSリージョンが使用されます。

ClickHouseテーブルは2つのサーバー間、つまり2つのリージョン間でレプリケートされます。
### ソフトウェアをインストールする {#install-software}
#### ClickHouseサーバーノード {#clickhouse-server-nodes}
ClickHouseサーバーノードのデプロイメント手順を実行する際は、[インストール手順](/getting-started/install.md/#available-installation-options)を参照してください。
#### ClickHouseをデプロイする {#deploy-clickhouse}

2つのホストにClickHouseをデプロイします。サンプル構成では、これらは`chnode1`と`chnode2`と呼ばれます。

`chnode1`を1つのAWSリージョンに、`chnode2`を別のリージョンに配置します。
#### ClickHouse Keeperをデプロイする {#deploy-clickhouse-keeper}

3つのホストにClickHouse Keeperをデプロイします。サンプル構成では、これらは`keepernode1`、`keepernode2`、`keepernode3`と呼ばれます。`keepernode1`は`chnode1`と同じリージョンにデプロイできますし、`keepernode2`は`chnode2`に、`keepernode3`はどちらかのリージョンにデプロイできますが、そのリージョンのClickHouseノードとは異なるアベイラビリティゾーンに配置する必要があります。

ClickHouse Keeperノードのデプロイメント手順を実行する際は、[インストール手順](/getting-started/install.md/#install-standalone-clickhouse-keeper)を参照してください。
### S3バケットを作成する {#create-s3-buckets}

`chnode1`と`chnode2`を配置した各リージョンに1つのS3バケットを作成します。

バケットとIAMロールを作成するための手順が必要な場合は、**S3バケットとIAMロールの作成**を展開し、次に進んでください：

<BucketDetails />

構成ファイルは`/etc/clickhouse-server/config.d/`に配置されます。ここに1つのバケットのサンプル構成ファイルがあります。他のバケットも類似していますが、3つのハイライトされた行が異なります。

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
このガイドの多くの手順では、`/etc/clickhouse-server/config.d/`に構成ファイルを配置するように求められます。これは、Linuxシステムでの構成オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに入れると、ClickHouseは内容を使用してデフォルトの構成をオーバーライドします。これをオーバーライドディレクトリに配置することで、アップグレード中に構成が失われるのを防ぎます。
:::
### ClickHouse Keeperを設定する {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロンで実行する場合（ClickHouseサーバーとは別に）、構成は単一のXMLファイルです。このチュートリアルでは、ファイルは`/etc/clickhouse-keeper/keeper_config.xml`です。すべての3つのKeeperサーバーは同じ構成を使用し、1つの設定が異なります；`<server_id>`。

`server_id`は、構成ファイルが使用されるホストに割り当てるIDを示します。以下の例では、`server_id`は`3`であり、ファイルの下部にある`<raft_configuration>`セクションを確認すると、サーバー3のホスト名は`keepernode3`であることがわかります。これは、ClickHouse Keeperプロセスがリーダーを選択する際や他のすべての活動において、どの他のサーバーに接続するかを知る方法です。

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

ClickHouse Keeperの構成ファイルを配置し、`<server_id>`を設定することを忘れないでください：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### ClickHouseサーバーを設定する {#configure-clickhouse-server}
#### クラスターを定義する {#define-a-cluster}

ClickHouseクラスターは、構成の`<remote_servers>`セクションで定義されます。このサンプルでは、`cluster_1S_2R`という1つのクラスターが定義されており、単一のシャードに2つのレプリカが含まれています。レプリカはホスト`chnode1`と`chnode2`に配置されています。

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

クラスターとともに作業する際に便利なマクロを定義すると、DDLクエリにクラスター、シャード、およびレプリカの設定が自動的に入力されます。このサンプルでは、`shard`および`replica`の詳細を指定せずに複製テーブルエンジンを使用することを可能にします。テーブルを作成する際、`shard`と`replica`のマクロが`system.tables`をクエリすることでどのように使用されるかがわかります。

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
上記のマクロは`chnode1`用であり、`chnode2`では`replica`を`replica_2`に設定してください。
:::
#### ゼロコピーのレプリケーションを無効にする {#disable-zero-copy-replication}

ClickHouseのバージョン22.7およびそれ以下では、設定`allow_remote_fs_zero_copy_replication`は、S3およびHDFSディスクに対してデフォルトで`true`に設定されています。この設定は、この災害復旧シナリオでは`false`に設定する必要があり、バージョン22.8以上ではデフォルトで`false`に設定されています。

この設定は次の2つの理由からfalseに設定する必要があります：1）この機能は本番環境での使用に適していない；2）災害復旧シナリオでは、データとメタデータの両方が複数のリージョンに保存する必要があります。`allow_remote_fs_zero_copy_replication`を`false`に設定します。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeperは、ClickHouseノード間でデータのレプリケーションを調整する責任があります。ClickHouseにClickHouse Keeperノードを知らせるには、各ClickHouseノードに構成ファイルを追加します。

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
### ネットワーキングの設定 {#configure-networking}

AWSでセキュリティ設定を構成する際にサーバー間で通信できるように、[ネットワークポート](../../../guides/sre/network-ports.md)のリストを参照してください。また、サーバーが相互に通信し、S3と通信できるように、すべての3つのサーバーはネットワーク接続を待ち受ける必要があります。デフォルトでは、ClickHouseはループバックアドレスのみにリスンしているため、これを変更する必要があります。これは`/etc/clickhouse-server/config.d/`で設定されています。以下は、ClickHouseとClickHouse KeeperがすべてのIP v4インターフェースにリスンするように構成するサンプルです。詳細な情報は、ドキュメントまたはデフォルトの設定ファイル`/etc/clickhouse/config.xml`を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### サーバーを起動する {#start-the-servers}
#### ClickHouse Keeperを実行する {#run-clickhouse-keeper}

各Keeperサーバーで、オペレーティングシステムに応じたコマンドを実行します。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### ClickHouse Keeperの状態を確認する {#check-clickhouse-keeper-status}

`netcat`を用いてClickHouse Keeperにコマンドを送信します。例えば、`mntr`はClickHouse Keeperクラスターの状態を返します。各Keeperノードでこのコマンドを実行した場合、1つはリーダーになり、他の2つはフォロワーになります：

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
#### ClickHouseサーバーを検証する {#verify-clickhouse-server}

[クラスター設定](#define-a-cluster)を追加した際、2つのClickHouseノードにわたって複製された単一のシャードが定義されました。この検証ステップでは、ClickHouseが起動したときにクラスターが構築されたことを確認し、そのクラスターを使用して複製テーブルを作成します。
- クラスターが存在することを確認します：
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
- 前述のマクロの使用方法を理解する

  マクロ`shard`および`replica`は、[クラスターを定義する](#define-a-cluster)際に[定義されました](#define-a-cluster)、次のハイライトされた行では、これらの値が各ClickHouseノードで置き換えられる様子が示されています。加えて、値`uuid`も使用されます。`uuid`はシステムによって生成されるため、マクロには定義されていません。
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
  上記に示された`'clickhouse/tables/{uuid}/{shard}`のZooKeeperパスは、`default_replica_path`および`default_replica_name`を設定することによりカスタマイズできます。ドキュメントは[ここ](/operations/server-configuration-parameters/settings.md/#default_replica_path)にあります。
  :::
### テスト {#testing-1}

これらのテストは、データが2つのサーバー間でレプリケートされていること、またそれがローカルディスクではなくS3バケットに保存されていることを確認します。

- ニューヨーク市タクシーデータセットからデータを追加します：
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

  このクエリは、ディスク上のデータのサイズ、どのディスクが使用されたかを判断するためのポリシーを示します。
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

  ローカルディスク上のデータのサイズを確認します。上記から、ストレージされた百万行のサイズは36.42MiBです。これはS3上にあり、ローカルディスク上には存在しないはずです。上記のクエリも、データとメタデータがローカルディスク上に保存されている場所を示します。ローカルデータを確認します：
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K	/var/lib/clickhouse/disks/s3_disk/store/551
  ```

  各S3バケット内のS3データを確認します（合計は示されていませんが、挿入後に両方のバケットに約36MiBが保存されています）：

<img src={Bucket1} alt="最初のS3バケット内のデータサイズ" />

<img src={Bucket2} alt="2つ目のS3バケット内のデータサイズ" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)は、Amazon S3内の新しい高性能な単一アベイラビリティゾーンのストレージクラスです。

この[ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)を参照すると、ClickHouseでのS3Expressのテスト経験について読むことができます。

:::note
  S3Expressはデータを単一のAZ内に保存します。これは、AZの障害が発生した場合にデータが利用できなくなることを意味します。
:::
### S3ディスク {#s3-disk}

S3Expressバケットにバックアップされたストレージでテーブルを作成するには、以下の手順を実行します：

1. `Directory`タイプのバケットを作成する
2. 必要なすべての権限をS3ユーザーに付与するために適切なバケットポリシーをインストールする（例：`"Action": "s3express:*"` は無制限のアクセスを許可します）
3. ストレージポリシーを設定する際に`region`パラメータを指定してください

ストレージ設定は通常のS3と同様で、次のようになります：

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

次に、新しいストレージ上にテーブルを作成します：

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

S3ストレージもサポートされていますが、`Object URL`パスの場合のみです。例：

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

設定でバケットリージョンを指定する必要があります：

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
