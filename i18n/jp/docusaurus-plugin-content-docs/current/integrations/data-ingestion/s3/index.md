---
'slug': '/integrations/s3'
'sidebar_position': 1
'sidebar_label': 'S3とClickHouseの統合'
'title': 'S3とClickHouseの統合'
'description': 'S3をClickHouseと統合する方法を説明するページ'
'doc_type': 'guide'
---

import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# S3をClickHouseと統合する

S3からClickHouseにデータを挿入することができ、またS3をエクスポート先として利用することもできるため、「データレイク」アーキテクチャとの相互作用が可能です。さらに、S3は「コールド」ストレージ階層を提供し、ストレージとコンピュートを分離する支援も行います。以下のセクションでは、ニューヨーク市のタクシーデータセットを使用して、S3とClickHouseの間でデータを移動するプロセスを示し、重要な設定パラメータを特定し、パフォーマンスを最適化するためのヒントを提供します。
## S3テーブル関数 {#s3-table-functions}

` s3 `テーブル関数を使用すると、S3互換ストレージからファイルを読み書きできます。この構文の概要は次の通りです：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

ここで：

* path — ファイルへのパスを持つバケットURL。このモードでは、読み取り専用のワイルドカード ` * `、` ? `、` {abc,def} `および `{N..M} `がサポートされています。ここで ` N `、` M `は数値、` 'abc' `、` 'def' `は文字列です。詳しくは、[パスでのワイルドカードの使用](/engines/table-engines/integrations/s3/#wildcards-in-path)を参照してください。
* format — ファイルの[形式](/interfaces/formats#formats-overview)。
* structure — テーブルの構造。形式は ` 'column1_name column1_type, column2_name column2_type, ...' `。
* compression — パラメータはオプションです。サポートされる値：` none `、` gzip/gz `、` brotli/br `、` xz/LZMA `、` zstd/zst `。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。

パス式でのワイルドカードの使用により、複数のファイルを参照し、並列処理の可能性が開かれます。
### 準備 {#preparation}

ClickHouseでテーブルを作成する前に、S3バケット内のデータを詳細に見ることをお勧めします。これをClickHouseから直接行うことができ、` DESCRIBE `文を使用します：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

` DESCRIBE TABLE `文の出力は、ClickHouseがS3バケットでどのように自動的にこのデータを推測するかを示します。また、gzip圧縮形式も自動的に認識して解凍することに注意してください：

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

私たちのS3ベースのデータセットと対話するために、標準の `MergeTree` テーブルを宛先として準備します。以下の文は、デフォルトデータベースに ` trips ` という名前のテーブルを作成します。注目すべきは、上記で推測されたデータ型のいくつかを修正し、特に ` Nullable() `データ型修飾子を使用しないようにしていることで、これにより不要な追加ストレージデータと追加のパフォーマンスオーバーヘッドを引き起こす可能性があります：

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
```

` pickup_date `フィールドに対する[パーティショニング](/engines/table-engines/mergetree-family/custom-partitioning-key)の使用に注目してください。通常、パーティションキーはデータ管理のためですが、後でこのキーを使用してS3への書き込みを並列化します。

私たちのタクシーデータセットの各エントリは、タクシートリップを含みます。この匿名化データは、**nyc-taxi**フォルダの下にあるS3バケット https://datasets-documentation.s3.eu-west-3.amazonaws.com/ に圧縮された20M件のレコードから構成されます。データはTSV形式で、ファイルごとに約1Mの行があります。
### S3からのデータ読み取り {#reading-data-from-s3}

私たちは、ClickHouse内に永続性を必要とせず、S3データをソースとしてクエリできます。次のクエリでは、10行をサンプリングします。バケットが公開されているため、ここに認証情報は必要ありません：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

` TabSeparatedWithNames `形式はカラム名を最初の行にエンコードしているため、カラムを列挙する必要はありません。` CSV `や` TSV `などの他の形式は、このクエリのために自動生成されたカラムを返します。例：` c1 `、` c2 `、` c3 `など。

クエリは、バケットパスやファイル名に関する情報を提供する[仮想カラム](../sql-reference/table-functions/s3#virtual-columns)のようなものもサポートしています。例えば：

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

このサンプルデータセット内の行数を確認します。ファイル展開のためのワイルドカードの使用に注意し、20のファイル全てを考慮します。このクエリは、ClickHouseインスタンスのコア数に応じて約10秒かかります：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

データをサンプリングしたり、ad-hocの探索的なクエリを実行するには便利ですが、S3から直接データを読み取ることは定期的に行うべきではありません。本格的に行うタイミングが来たら、データをClickHouse内の ` MergeTree ` テーブルにインポートします。
### clickhouse-localの使用 {#using-clickhouse-local}

` clickhouse-local `プログラムを使用すると、ClickHouseサーバーを展開および設定せずにローカルファイルを迅速に処理できます。 ` s3 `テーブル関数を使用するクエリは、このユーティリティで実行できます。例えば：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### S3からのデータ挿入 {#inserting-data-from-s3}

ClickHouseの全機能を活用するために、次にデータを読み取り、私たちのインスタンスに挿入します。
これを実現するために、` s3 `関数を単純な ` INSERT `文と組み合わせます。ターゲットテーブルが必要な構造を提供するため、カラムをリストアップする必要はありません。カラムは ` SELECT `句で指定された順序で出現する必要があります。全10m行の挿入は、ClickHouseインスタンスに応じて数分かかることがあります。以下では、迅速なレスポンスを確保するために1M行を挿入します。必要に応じて ` LIMIT `句やカラム選択を調整して部分セットをインポートします：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### ClickHouse Localを使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークセキュリティポリシーによりClickHouseクラスターがアウトバウンド接続を行うことができない場合、` clickhouse-local `を使用してS3データを挿入することができます。以下の例では、S3バケットから読み取り、` remote `関数を使用してClickHouseに挿入します：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
安全なSSL接続でこれを実行するには、` remoteSecure `関数を使用してください。
:::
### データのエクスポート {#exporting-data}

` s3 `テーブル関数を使用して、S3にファイルを書き込むことができます。これには適切な権限が必要です。我々はリクエスト内で必要な認証情報を渡しますが、より多くのオプションについては、[認証情報の管理](#managing-credentials)ページを参照してください。

以下の単純な例では、ソースの代わりに宛先としてテーブル関数を使用します。ここでは、` trips `テーブルからバケットに10,000行をストリーミングし、` lz4 `圧縮と出力タイプ` CSV `を指定します：

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

ファイルの形式が拡張子から推測されることに注意してください。また、` s3 `関数内でカラムを指定する必要はありません - これは ` SELECT `から推測できます。
### 大きなファイルの分割 {#splitting-large-files}

データを単一のファイルとしてエクスポートすることは考えにくいです。ClickHouseを含むほとんどのツールは、並列性の可能性により、複数のファイルへの読み書きの際により高いスループット性能を達成します。データの部分集合をターゲットとする ` INSERT `コマンドを複数回実行することができます。ClickHouseは ` PARTITION `キーを使用して自動的にファイルを分割する手段を提供します。

以下の例では、` rand() `関数のモジュラスを使用して10個のファイルを作成します。結果のパーティションIDがファイル名に参照されることに注意してください。これにより、数値接尾辞を持つ10個のファイル、例：` trips_0.csv.lz4 `、` trips_1.csv.lz4 `などが生成されます：

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

または、データ内のフィールドを参照することもできます。このデータセットでは、` payment_type `が自然なパーティショニングキーを提供し、カーディナリティは5です。

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
### クラスタの利用 {#utilizing-clusters}

上記の関数は、すべて単一ノードでの実行に制限されています。読み取り速度はCPUコアの数に応じて直線的にスケールし、他のリソース（通常はネットワーク）が飽和状態になるまでの間、ユーザーは垂直スケールを許可します。しかし、このアプローチには制限があります。ユーザーは ` INSERT INTO SELECT `クエリを実行するときに分散テーブルに挿入することにより、リソースの圧力を軽減することができますが、依然として単一ノードでデータを読み取り、解析し、処理する必要があります。この課題に対処し、読み取りを水平方向にスケールできるようにするために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md)関数を使用します。

クエリを受信するノード（イニシエータとも呼ばれる）は、クラスター内のすべてのノードに接続を作成します。どのファイルを読み取る必要があるかを決定するグロブパターンがファイルのセットに解決されます。イニシエータは、クラスター内のノードにファイルを配布します。これらはワーカーとして機能します。これらのワーカーは、読み取りが完了するたびに処理するファイルを要求します。このプロセスは、読み取りを水平方向にスケールできることを保証します。

`s3Cluster`関数は、単一ノードのバリアントと同様の形式を取り、ターゲットクラスターを指定してワーカーノードを示す必要があります：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* ` cluster_name ` — リモートおよびローカルサーバーに接続するためのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
* ` source ` — ファイルまたはファイルの一群へのURL。読み取り専用モードで次のワイルドカードをサポートします：` * `、` ? `、` {'abc','def'} `および `{N..M}`（ここでN、Mは数値、abc、defは文字列）。詳しくは[こちら](https://engines/table-engines/integrations/s3.md/#wildcards-in-path)をご覧ください。
* ` access_key_id `および` secret_access_key ` — 指定されたエンドポイントで使用する資格情報を指定するキー。オプション。
* ` format ` — ファイルの[形式](/interfaces/formats#formats-overview)。
* ` structure ` — テーブルの構造。形式は 'column1_name column1_type, column2_name column2_type, ...'。

`s3`関数と同様に、バケットが不安全の場合や環境を通じてセキュリティを定義する場合（例：IAMロール）、資格情報はオプションです。しかし、s3関数とは異なり、22.3.1以降はリクエストで構造を指定する必要があり、すなわちスキーマは推測されません。

この関数は、ほとんどの場合 ` INSERT INTO SELECT `の一部として使用されます。この場合は、多くの場合、分散テーブルを挿入します。以下の簡単な例では、trips_allは分散テーブルです。このテーブルはイベントクラスターを使用していますが、読み取りと書き込みに使用されるノードの一貫性は要求されません：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入はイニシエータノードに対して行われます。これは、読み取りが各ノードで行われる一方で、結果の行が配布のためにイニシエータにルーティングされることを意味します。高スループットのシナリオでは、これがボトルネックになる可能性があります。これに対処するために、[parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)パラメータをs3cluster関数に設定してください。
## S3テーブルエンジン {#s3-table-engines}

`s3`関数は、S3に保存されたデータに対してad-hocクエリを実行することを可能にしますが、構文が冗長です。 ` S3`テーブルエンジンを使用すると、バケットURLや資格情報を繰り返し指定する必要がなくなります。この問題に対処するために、ClickHouseはS3テーブルエンジンを提供します。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* ` path ` — ファイルへのパスを持つバケットURL。読み取り専用モードで次のワイルドカードをサポートします：` * `、` ? `、` {abc,def} `および `{N..M}`（ここでN、Mは数値、abc、defは文字列）。詳しくは、[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* ` format ` — [形式](/interfaces/formats#formats-overview)。
* ` aws_access_key_id `、` aws_secret_access_key ` - AWSアカウントユーザーの長期的資格情報。リクエストを認証するためにこれらを使用できます。このパラメータはオプションです。資格情報が指定されていない場合、構成ファイルの値が使用されます。さらに詳しい情報は[資格情報の管理](#managing-credentials)を見てください。
* ` compression ` — 圧縮タイプ。サポートされている値：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。このパラメータはオプションです。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。
### データの読み取り {#reading-data}

以下の例では、` https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/ `バケットにある最初の10個のTSVファイルを使用して、` trips_raw `という名前のテーブルを作成します。それぞれは1M行を含みます：

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

10ファイルに制限するために `{0..9}` パターンの使用に注意してください。作成後は、このテーブルを他のテーブルと同様にクエリできます：

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

` S3 `テーブルエンジンは並列読み取りをサポートしています。テーブル定義にグロブパターンが含まれていない場合にのみ書き込みがサポートされます。したがって、上記のテーブルは書き込みをブロックします。

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

行は新しいファイルにのみ挿入できることに注意してください。マージサイクルやファイル分割操作はありません。ファイルが書き込まれると、後続の挿入は失敗します。ここには2つのオプションがあります：

* ` s3_create_new_file_on_insert=1 `という設定を指定します。これにより、各挿入で新しいファイルが作成されます。数字の接尾辞が各ファイルの末尾に追加され、挿入操作ごとに単調に増加します。上記の例では、後続の挿入は ` trips_1.bin `ファイルの作成を招くでしょう。
* ` s3_truncate_on_insert=1 `という設定を指定します。これにより、ファイルの切り捨てが行われ、新たに挿入された行のみが含まれることになります。

これらの設定はデフォルトで0に設定されており、ユーザーにどちらかを設定することを強制します。 ` s3_truncate_on_insert `が両方設定されている場合、優先されます。

` S3 `テーブルエンジンに関するいくつかの注意事項：

- 伝統的な `MergeTree `ファミリーのテーブルとは異なり、` S3 `テーブルを削除しても基礎データは削除されません。
- このテーブルタイプの完全な設定は、[こちら](/engines/table-engines/integrations/s3.md/#settings)に記載されています。
- このエンジンを使用する際の次の注意点に留意してください：
  * ALTERクエリはサポートされていません。
  * SAMPLE操作はサポートされていません。
  * インデックス、すなわちプライマリーまたはスキップの概念はありません。
## 認証情報の管理 {#managing-credentials}

前の例では、` s3 `関数や ` S3 `テーブル定義に認証情報を渡しました。これが時折の使用に許容される場合であっても、ユーザーは本番環境でのより明示的な認証メカニズムを必要とします。これに対処するために、ClickHouseは幾つかのオプションを提供しています。

* **config.xml**または **conf.d**の下の同等の構成ファイルに接続の詳細を指定します。以下は、Debianパッケージを使用してインストールした場合の例ファイルの内容です。

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

    これらの認証情報は、上記のエンドポイントがリクエストされたURLの正確なプレフィックスマッチである任意のリクエストに使用されます。また、この例で表示される承認ヘッダーをアクセスキーおよびシークレットキーの代わりに宣言することもできます。サポートされている設定の完全なリストは[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

* 上記の例は、` use_environment_credentials `という設定パラメータの可用性を強調しています。この設定パラメータは、` s3 `レベルでグローバルに設定できます：

```xml
<clickhouse>
    <s3>
    <use_environment_credentials>true</use_environment_credentials>
    </s3>
</clickhouse>
```

    この設定は、IAMロールを通じて環境からS3認証情報を取得しようとする試みをオンにします。具体的には、次のリトリーバルの順序が実行されます：

  * 環境変数 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`のルックアップ
  * **$HOME/.aws**での確認
  * AWSセキュリティトークンサービスを通じて取得した一時的な資格情報 - すなわち、[` AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) APIによるもの
  * ECS環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`または `AWS_CONTAINER_CREDENTIALS_FULL_URI`及び `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`での資格情報確認
  * [AWS EC2インスタンスメタデータ](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)を通じて資格情報の取得 - ただし、[AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED)がtrueに設定されていない場合
  * これらの設定は、特定のエンドポイントに対しても、同じプレフィックス一致ルールを使用して設定できます。
## パフォーマンスの最適化 {#s3-optimizing-performance}

S3関数での読み取りと挿入を最適化する方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。
### S3ストレージの調整 {#s3-storage-tuning}

内部では、ClickHouseのマージツリーは2つの主なストレージフォーマットを使用しています：[` Wide` と `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。現在の実装はClickHouseのデフォルト動作を使用しています（設定 `min_bytes_for_wide_part` および `min_rows_for_wide_part`を制御）。将来的なリリースでS3用に振る舞いが異なることが予想され、例えば `min_bytes_for_wide_part`のデフォルト値が大きくなり、より `Compact `形式を促進し、ファイル数を減らすことになります。ユーザーは、専らS3ストレージを使用する場合にこれらの設定を調整したい時があるかもしれません。
## S3対応MergeTree {#s3-backed-mergetree}

`s3`関数と関連するテーブルエンジンにより、ClickHouseの親しみやすい構文を使用してS3内のデータをクエリできるようになります。しかし、データ管理機能やパフォーマンスに関しては、限界があります。プライマリーインデックスのサポートはなく、キャッシュのサポートもなく、ファイル挿入はユーザーが管理する必要があります。

ClickHouseは、S3が魅力的なストレージソリューションであることを認識しています。特に「コールド」データに対するクエリパフォーマンスが重要でなく、ユーザーがストレージとコンピュートを分離しようとしている場合です。これを実現するために、S3をMergeTreeエンジンのストレージとして使用することをサポートします。これにより、ユーザーはS3のスケーラビリティとコストメリット、およびMergeTreeエンジンの挿入・クエリパフォーマンスを活用できるようになります。
### ストレージ階層 {#storage-tiers}

ClickHouseのストレージボリュームは、物理ディスクをMergeTreeテーブルエンジンから抽象化することを可能にします。単一のボリュームは、順序付けられたディスクのセットで構成できます。主にデータストレージに複数のブロックデバイスを使用できるようにする一方で、この抽象化はS3を含む他のストレージタイプも可能にします。ClickHouseのデータパーツは、ストレージポリシーに従ってボリューム間で移動および充填率に応じて調整され、ストレージ階層の概念を作成します。

ストレージ階層はホット-コールドアーキテクチャを解放し、最新のデータは通常、最もクエリされるものでもあり、高性能ストレージ（例：NVMe SSD）の小量のスペースを必要とします。データが経過するにつれて、クエリタイムのSLAが増加し、クエリ頻度が増します。この脂肪の尾のデータは、HDDやS3のようなオブジェクトストレージなど、遅くパフォーマンスが低いストレージに保存できます。
### ディスクの作成 {#creating-a-disk}

S3バケットをディスクとして使用するには、まずClickHouseの構成ファイル内でそれを宣言する必要があります。config.xmlを拡張するか、好ましくはconf.dの下に新しいファイルを提供します。以下はS3ディスク宣言の例です：

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

このディスク宣言に関連する設定の完全なリストは、[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。資格情報は、[認証情報の管理](#managing-credentials)で説明された同様のアプローチを使用してここで管理することができます。すなわち、環境設定ブロック内で ` use_environment_credentials ` をtrueに設定してIAMロールを使用します。
### ストレージポリシーの作成 {#creating-a-storage-policy}

設定後、この「ディスク」はポリシー内で宣言されたストレージボリュームに使用されます。以下の例では、s3が唯一のストレージであると仮定します。これは、TTLや充填率に基づいてデータを移動可能なより複雑なホット-コールドアーキテクチャを無視します。

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

書き込みアクセスを持つバケットを使用するようにディスクを設定したと仮定すると、以下の例のようなテーブルを作成できるはずです。簡潔さのために、NYCタクシーカラムのサブセットを使用し、データを直接S3対応テーブルにストリーミングします：

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
SETTINGS storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

ハードウェアに応じて、後者の1M行の挿入は数分かかることがあります。進行状況はsystem.processesテーブルを介して確認できます。10mの上限まで行数を調整し、一部のサンプルクエリを探ることができます。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```
### テーブルの変更 {#modifying-a-table}

時折、ユーザーは特定のテーブルのストレージポリシーを変更する必要があるかもしれません。これは可能ですが、制限があります。新しいターゲットポリシーは、以前のポリシーのすべてのディスクとボリュームを含む必要があり、すなわち、データはポリシー変更を満たすために移行されることはありません。これらの制約を検証する際、ボリュームとディスクはその名前によって特定され、違反しようとするとエラーが発生します。しかし、前の例を基にすると、次の変更は有効です。

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

ここで、私たちの新しいs3_tieredポリシーにメインボリュームを再利用し、新しいホットボリュームを導入しています。デフォルトディスクを使用しており、これは `<path>` パラメータ経由で構成された1つのディスクのみから構成されます。ボリューム名とディスクは変更されないことに注意してください。新しい挿入はデフォルトディスクに存在し、このディスクが ` move_factor * disk_size `に達するまではデータがS3に移動されません。
### レプリケーションの処理 {#handling-replication}

S3ディスクを使用したレプリケーションは、` ReplicatedMergeTree ` テーブルエンジンを使用することによって実現できます。詳細については、[2つのAWSリージョンにわたる単一シャードのレプリケーション](#s3-multi-region)ガイドを参照してください。
### 読み込みと書き込み {#read--writes}

以下のノートは、ClickHouseとのS3の相互作用の実装に関するものです。一般的に情報提供目的ですが、[パフォーマンスの最適化](#s3-optimizing-performance)の際に読者に役立つかもしれません：

* デフォルトでは、クエリ処理パイプラインの任意の段階で使用される最大クエリ処理スレッドの数は、コアの数と等しくなります。段階によっては並行処理可能なものもあるので、この値は上限を提供します。ディスクからデータがストリーミングされるため、複数のクエリ段階が同時に実行される場合があります。このため、クエリに使用される正確なスレッド数はこの値を超える可能性があります。設定を通じて[ max_threads ](/operations/settings/settings#max_threads)を修正できます。
* S3での読み取りはデフォルトで非同期です。この動作は、デフォルトで ` threadpool ` に設定された ` remote_filesystem_read_method `によって決まります。要求を提供するとき、ClickHouseはストライプでグラニュールを読み取ります。これらのストライプは、それぞれ多数のカラムを含む可能性があります。スレッドはそれぞれのグラニュールのカラムを1つずつ読み取ります。同期的に行うのではなく、データを待つ前にすべてのカラムのプリフェッチが行われます。これにより、各カラムの同期待機に比べて大幅なパフォーマンス向上が実現されます。ほとんどの場合、ユーザーはこの設定を変更する必要はありません - [パフォーマンスの最適化](#s3-optimizing-performance)を参照してください。
* 書き込みは並列で行われ、最大100の同時ファイル書き込みスレッドがサポートされています。` max_insert_delayed_streams_for_parallel_write `は、デフォルト値1000で、並行して書き込まれるS3ブロブの数を制御します。ファイルごとに書き込む際にはバッファが必要であり（約1MB）、これはINSERTのメモリ消費を実質的に制限します。サーバーメモリが少ないシナリオでは、この値を下げるのが適切かもしれません。
## ClickHouse用にS3オブジェクトストレージをディスクとして使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成するための手順を必要とする場合、**S3バケットとIAMロールの作成**を展開し、順に手順に従ってください：

<BucketDetails />
### S3バケットをディスクとして使用するようにClickHouseを構成する {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下の例は、Linux Debパッケージがサービスとしてインストールされた場合のデフォルトのClickHouseディレクトリに基づいています。

1.  ストレージ構成を保存するためにClickHouseの `config.d` ディレクトリに新しいファイルを作成します。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. ストレージ構成のために以下を追加します；以前のステップからバケットパス、アクセスキーとシークレットキーを代入します。
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
` <disks> ` タグ内のタグ ` s3_disk ` と ` s3_cache ` は任意のラベルです。これを別のものに設定できますが、参照するディスクのために ` <policies> ` タブ内の ` <disk> ` タブでも同じラベルを使用する必要があります。
タグ `<S3_main>` も任意で、ClickHouse内のリソース作成の際にストレージターゲット識別子として使用されるポリシーの名前です。

上記の構成はClickHouse version 22.8以降のものです。以前のバージョンを使用している場合は、[データの保存に関するドキュメント](/operations/storing-data.md/#using-local-cache)を参照してください。

S3の使用に関する詳細情報：
統合ガイド：[S3対応MergeTree](#s3-backed-mergetree)
:::

3. ファイルの所有者を` clickhouse ` ユーザーとグループに更新します。
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 変更を適用するためにClickHouseインスタンスを再起動します。
```bash
service clickhouse-server restart
```
### テスト {#testing}
1. ClickHouseクライアントでログインし、以下のようにします。
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. 新しいS3ストレージポリシーを指定するテーブルを作成します。
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

4. テーブルにテスト行を挿入します。
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
6. AWSコンソールでバケットに移動し、新しいバケットとフォルダーを選択します。
次のようなものが表示されるはずです：

<Image img={S3J} size="lg" border alt="ClickHouseデータファイルがS3に保存されているAWSコンソールでのS3バケットビュー" />
## S3オブジェクトストレージを使用して2つのAWSリージョンにわたる単一シャードをレプリケーションする {#s3-multi-region}

:::tip
ClickHouse Cloudではデフォルトでオブジェクトストレージが使用されるため、ClickHouse Cloudで実行している場合はこの手順に従う必要はありません。
:::
### デプロイの計画 {#plan-the-deployment}
このチュートリアルは、AWS EC2に2つのClickHouse Serverノードと3つのClickHouse Keeperノードを配置することに基づいています。ClickHouseサーバーのデータストアはS3です。各リージョンにClickHouse ServerとS3バケットを持つ2つのAWSリージョンを使用して、災害復旧をサポートします。

ClickHouseテーブルは2つのサーバー間で複製され、したがって、2つのリージョン間で複製されます。
### ソフトウェアをインストールする {#install-software}
#### ClickHouseサーバーノード {#clickhouse-server-nodes}
ClickHouseサーバーノードでデプロイメント手順を実行する際には[インストール手順](/getting-started/install/install.mdx)を参照してください。
#### ClickHouseをデプロイする {#deploy-clickhouse}

2つのホストでClickHouseをデプロイします。このサンプル構成では、これらは `chnode1`、`chnode2` と名付けられます。

` chnode1 ` を1つのAWSリージョンに、 ` chnode2 ` を別のリージョンに配置します。
#### ClickHouse Keeperをデプロイする {#deploy-clickhouse-keeper}

3つのホストでClickHouse Keeperをデプロイします。このサンプル構成では、これらは `keepernode1`、`keepernode2`、`keepernode3` と名付けられます。` keepernode1 ` は ` chnode1 ` と同じリージョンにデプロイでき、` keepernode2 ` は ` chnode2 `、` keepernode3 ` はどちらのリージョンにも配置できますが、該当するリージョン内のClickHouseノードとは異なる可用性ゾーンです。

ClickHouse Keeperノードでデプロイメント手順を実行する際には[インストール手順](/getting-started/install/install.mdx)を参照してください。
### S3バケットを作成する {#create-s3-buckets}

` chnode1 ` と ` chnode2 ` を配置したそれぞれのリージョンに1つのS3バケットを作成します。

バケットとIAMロールを作成する手順が必要な場合は、**S3バケットとIAMロールの作成**を展開し、順に手順に従ってください：

<BucketDetails />

構成ファイルは `/etc/clickhouse-server/config.d/` に配置されます。以下はひとつのバケットに対応するサンプル構成ファイルであり、他のものは3つの強調表示された行が異なるだけです：

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
このガイドの多くのステップでは、` /etc/clickhouse-server/config.d/ ` に構成ファイルを配置するように指示しています。これはLinuxシステムの構成オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置することで、ClickHouseはデフォルト構成をオーバーライドするために内容を使用します。このディレクトリにファイルを置くことで、アップグレード中に設定を失うのを避けることができます。
:::
### ClickHouse Keeperを構成する {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロン（ClickHouseサーバーから分離）で実行する場合、構成は単一のXMLファイルです。このチュートリアルでは、ファイルは `/etc/clickhouse-keeper/keeper_config.xml` です。すべてのKeeperサーバーは同じ構成を使用していますが、1つの設定が違います： `<server_id>` です。

` server_id ` は、構成ファイルが使用されるホストに割り当てられるIDを示します。以下の例では、` server_id `は `3` であり、ファイル内の `<raft_configuration>` セクションをさらに下に見ると、サーバー3のホスト名が `keepernode3` であることがわかります。これがClickHouse Keeperプロセスがリーダーを選んだり、他の活動を行う際にどの他のサーバーに接続するかを知る方法です。

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

ClickHouse Keeperの構成ファイルをコピーします（ ` <server_id> ` を設定することを忘れないでください）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### ClickHouseサーバーを構成する {#configure-clickhouse-server}
#### クラスターを定義する {#define-a-cluster}

ClickHouseのクラスターは、構成の` <remote_servers> ` セクションで定義されます。このサンプルでは、` cluster_1S_2R `という1つのクラスターが定義され、単一のシャードに2つのレプリカが含まれています。レプリカは `chnode1` と `chnode2` のホストに配置されています。

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

クラスターと作業するときは、DDLクエリのクラスタ、シャード、およびレプリカ設定を埋めるためのマクロを定義すると便利です。このサンプルでは、` shard ` と ` replica `の詳細を提供することなく、レプリケーションされたテーブルエンジンを使用することを指定できます。テーブルを作成すると、 ` system.tables `をクエリすることで、` shard ` と ` replica `のマクロがどのように使用されるかがわかります。

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
上記のマクロは `chnode1` 用であり、`chnode2` では ` replica `を ` replica_2 ` に設定します。
:::
#### ゼロコピーレプリケーションを無効にする {#disable-zero-copy-replication}

ClickHouse バージョン 22.7 およびそれ以前では、設定 `allow_remote_fs_zero_copy_replication` が S3 および HDFS ディスク用にデフォルトで `true` に設定されています。この設定は、ディザスタリカバリシナリオのために `false` に設定する必要があり、バージョン 22.8 以降ではデフォルトで `false` に設定されています。

この設定は二つの理由から `false` にする必要があります。1) この機能はプロダクション向けではありません。2) ディザスタリカバリシナリオでは、データおよびメタデータが複数のリージョンに保存される必要があります。`allow_remote_fs_zero_copy_replication` を `false` に設定してください。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper は、ClickHouse ノード間でのデータのレプリケーションを調整する責任があります。 ClickHouse に ClickHouse Keeper ノードを知らせるために、各 ClickHouse ノードに設定ファイルを追加します。

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
### ネットワーキングを設定する {#configure-networking}

セキュリティ設定を AWS で構成するときに、サーバーが相互に通信できるようにするための [ネットワークポート](../../../guides/sre/network-ports.md) 一覧を参照してください。

すべてのサーバーはネットワーク接続をリッスンする必要があるため、サーバー間および S3 との通信が可能になります。デフォルトでは、ClickHouse はループバックアドレスのみでリッスンしているため、これを変更する必要があります。これは `/etc/clickhouse-server/config.d/` で設定されます。ここに、ClickHouse と ClickHouse Keeper がすべての IP v4 インターフェースでリッスンするように設定するサンプルがあります。詳細については、ドキュメントまたはデフォルト設定ファイル `/etc/clickhouse/config.xml` を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### サーバーを起動する {#start-the-servers}
#### ClickHouse Keeper を実行する {#run-clickhouse-keeper}

各 Keeper サーバーで、オペレーティングシステム用のコマンドを実行します。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### ClickHouse Keeper のステータスを確認する {#check-clickhouse-keeper-status}

`netcat` を使用して ClickHouse Keeper にコマンドを送信します。例えば、`mntr` は ClickHouse Keeper クラスターの状態を返します。各 Keeper ノードでコマンドを実行すると、一つがリーダーであり、他の二つはフォロワーであることがわかります。

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783

# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader

# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```
#### ClickHouse サーバーを実行する {#run-clickhouse-server}

各 ClickHouse サーバーで実行します。

```bash
sudo service clickhouse-server start
```
#### ClickHouse サーバーを確認する {#verify-clickhouse-server}

[クラスター構成](#define-a-cluster)を追加したとき、二つの ClickHouse ノードで複製された単一のシャードが定義されました。この確認ステップでは、ClickHouse が起動されたときにクラスターが構築されたことを確認し、そのクラスターを使用して複製されたテーブルを作成します。
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

- `ReplicatedMergeTree` テーブルエンジンを使用してクラスター内にテーブルを作成します：
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
SETTINGS storage_policy='s3_main'
```
```response
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```
- 先に定義されたマクロの使用法を理解します

  マクロ `shard` と `replica` が [前述で定義されています](#define-a-cluster)。下の強調表示された行では、各 ClickHouse ノードで値が置き換えられる場所がわかります。さらに、値 `uuid` が使用されます。`uuid` はシステムによって生成されるため、マクロには定義されていません。
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
PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS storage_policy = 's3_main'

1 row in set. Elapsed: 0.012 sec.
```
  :::note
  上述の `'clickhouse/tables/{uuid}/{shard}` の zookeeper パスを、`default_replica_path` および `default_replica_name` を設定することでカスタマイズできます。ドキュメントは [こちら](#/operations/server-configuration-parameters/settings.md/#default_replica_path) にあります。
  :::
### テスト {#testing-1}

これらのテストは、データが二つのサーバー間で複製され、S3 バケットに保存され、ローカルディスクには保存されていないことを確認します。

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

  このクエリは、ディスク上のデータのサイズと、どのディスクが使用されているかを決定するために使用されたポリシーを示します。
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

  ローカルディスク上のデータのサイズを確認します。上記の通り、保存されている数百万行のディスク上のサイズは 36.42 MiB です。これはローカルディスクではなく、S3 にあるべきです。上記のクエリは、ローカルディスク上でデータとメタデータが保存されている場所も教えてくれます。ローカルデータを確認します：
```response
root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
536K  /var/lib/clickhouse/disks/s3_disk/store/551
```

  各 S3 バケット内の S3 データを確認します（合計は表示されませんが、挿入後には両方のバケットに約 36 MiB が保存されています）：

<Image img={Bucket1} size="lg" border alt="最初の S3 バケットにおけるデータのサイズとストレージ使用状況のメトリック" />

<Image img={Bucket2} size="lg" border alt="二番目の S3 バケットにおけるデータのサイズとストレージ使用状況のメトリック" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) は、Amazon S3 における新しい高性能、シングルアベイラビリティゾーンストレージクラスです。

この [ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) を参照すると、ClickHouse を使用して S3Express をテストした際の経験を読むことができます。

:::note
  S3Express は、単一の AZ 内でデータを保存します。これは、AZ 障害の場合、データが利用できなくなることを意味します。
:::
### S3 ディスク {#s3-disk}

S3Express バケットにバックアップされたストレージでテーブルを作成するには、次の手順を実行します：

1. `Directory` タイプのバケットを作成します。
2. S3 ユーザーに必要なすべての権限を付与する適切なバケットポリシーをインストールします（例: `"Action": "s3express:*"` で単に制限のないアクセスを許可する）。
3. ストレージポリシーを構成するときに、`region` パラメータを指定してください。

ストレージの構成は通常の S3 と同じで、例えば次のようになります：

```sql
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

そして、新しいストレージの上にテーブルを作成します：

```sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```
### S3 ストレージ {#s3-storage}

S3 ストレージもサポートされていますが、`Object URL` パスのみサポートされています。例：

```sql
SELECT * FROM s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

構成でバケットリージョンを指定することも必要です：

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### バックアップ {#backups}

上記で作成したディスクにバックアップを保存することができます：

```sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

```sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
