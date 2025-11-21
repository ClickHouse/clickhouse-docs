---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: 'ClickHouse と S3 の統合'
title: 'ClickHouse と S3 の統合'
description: 'S3 を ClickHouse と統合する方法を説明するページ'
keywords: ['Amazon S3', 'object storage', 'cloud storage', 'data lake', 'S3 integration']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# S3 と ClickHouse の統合

S3 から ClickHouse へデータを挿入できるほか、S3 をエクスポート先として利用することで、「データレイク」アーキテクチャとの連携が可能になります。さらに、S3 は「コールド」ストレージ層を提供し、ストレージとコンピュートの分離に役立ちます。以下のセクションでは、ニューヨーク市タクシーのデータセットを用いて、S3 と ClickHouse 間でデータを移動する手順を示すとともに、主要な設定パラメータを紹介し、パフォーマンス最適化のためのヒントを提供します。



## S3テーブル関数 {#s3-table-functions}

`s3`テーブル関数を使用すると、S3互換ストレージとの間でファイルの読み取りと書き込みができます。構文の概要は次のとおりです：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

各パラメータの説明：

- path — ファイルへのパスを含むバケットURL。読み取り専用モードでは次のワイルドカードに対応しています：`*`、`?`、`{abc,def}`、`{N..M}`（`N`、`M`は数値、`'abc'`、`'def'`は文字列）。詳細については、[パスでのワイルドカードの使用](/engines/table-engines/integrations/s3/#wildcards-in-path)に関するドキュメントを参照してください。
- format — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
- structure — テーブルの構造。形式は`'column1_name column1_type, column2_name column2_type, ...'`。
- compression — オプションのパラメータ。対応する値：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します。

パス式でワイルドカードを使用することで、複数のファイルを参照でき、並列処理が可能になります。

### 準備 {#preparation}

ClickHouseでテーブルを作成する前に、S3バケット内のデータを詳しく確認することをお勧めします。`DESCRIBE`ステートメントを使用してClickHouseから直接確認できます：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE`ステートメントの出力により、S3バケット内のデータをClickHouseがどのように自動推論するかを確認できます。gzip圧縮形式も自動的に認識して解凍されることに注意してください：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

```


┌─name──────────────────┬─type───────────────┐
│ trip&#95;id               │ Nullable(Int64)    │
│ vendor&#95;id             │ Nullable(Int64)    │
│ pickup&#95;date           │ Nullable(Date)     │
│ pickup&#95;datetime       │ Nullable(DateTime) │
│ dropoff&#95;date          │ Nullable(Date)     │
│ dropoff&#95;datetime      │ Nullable(DateTime) │
│ store&#95;and&#95;fwd&#95;flag    │ Nullable(Int64)    │
│ rate&#95;code&#95;id          │ Nullable(Int64)    │
│ pickup&#95;longitude      │ Nullable(Float64)  │
│ pickup&#95;latitude       │ Nullable(Float64)  │
│ dropoff&#95;longitude     │ Nullable(Float64)  │
│ dropoff&#95;latitude      │ Nullable(Float64)  │
│ passenger&#95;count       │ Nullable(Int64)    │
│ trip&#95;distance         │ Nullable(String)   │
│ fare&#95;amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta&#95;tax               │ Nullable(String)   │
│ tip&#95;amount            │ Nullable(String)   │
│ tolls&#95;amount          │ Nullable(Float64)  │
│ ehail&#95;fee             │ Nullable(Int64)    │
│ improvement&#95;surcharge │ Nullable(String)   │
│ total&#95;amount          │ Nullable(String)   │
│ payment&#95;type          │ Nullable(String)   │
│ trip&#95;type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab&#95;type              │ Nullable(String)   │
│ pickup&#95;nyct2010&#95;gid   │ Nullable(Int64)    │
│ pickup&#95;ctlabel        │ Nullable(Float64)  │
│ pickup&#95;borocode       │ Nullable(Int64)    │
│ pickup&#95;ct2010         │ Nullable(String)   │
│ pickup&#95;boroct2010     │ Nullable(String)   │
│ pickup&#95;cdeligibil     │ Nullable(String)   │
│ pickup&#95;ntacode        │ Nullable(String)   │
│ pickup&#95;ntaname        │ Nullable(String)   │
│ pickup&#95;puma           │ Nullable(Int64)    │
│ dropoff&#95;nyct2010&#95;gid  │ Nullable(Int64)    │
│ dropoff&#95;ctlabel       │ Nullable(Float64)  │
│ dropoff&#95;borocode      │ Nullable(Int64)    │
│ dropoff&#95;ct2010        │ Nullable(String)   │
│ dropoff&#95;boroct2010    │ Nullable(String)   │
│ dropoff&#95;cdeligibil    │ Nullable(String)   │
│ dropoff&#95;ntacode       │ Nullable(String)   │
│ dropoff&#95;ntaname       │ Nullable(String)   │
│ dropoff&#95;puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘

```

S3ベースのデータセットを操作するために、宛先として標準的な`MergeTree`テーブルを準備します。以下のステートメントは、デフォルトデータベースに`trips`という名前のテーブルを作成します。上記で推論されたデータ型の一部を変更することを選択しており、特に[`Nullable()`](/sql-reference/data-types/nullable)データ型修飾子を使用しないようにしています。これにより、不要なストレージの増加とパフォーマンスオーバーヘッドを回避できます:
```


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

`pickup_date`フィールドに対する[パーティショニング](/engines/table-engines/mergetree-family/custom-partitioning-key)の使用に注目してください。通常、パーティションキーはデータ管理のために使用されますが、後ほどこのキーをS3への並列書き込みに利用します。

タクシーデータセットの各エントリには、1回のタクシー乗車が含まれています。この匿名化されたデータは、S3バケット https://datasets-documentation.s3.eu-west-3.amazonaws.com/ の **nyc-taxi** フォルダ配下に圧縮された2000万件のレコードで構成されています。データはTSV形式で、1ファイルあたり約100万行が含まれています。

### S3からのデータ読み取り {#reading-data-from-s3}

ClickHouseにデータを永続化することなく、S3データをソースとしてクエリできます。以下のクエリでは、10行をサンプリングしています。バケットは公開アクセス可能であるため、認証情報は不要です。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames`形式では列名が最初の行にエンコードされているため、列を明示的にリストする必要はありません。`CSV`や`TSV`などの他の形式では、このクエリに対して`c1`、`c2`、`c3`などの自動生成された列名が返されます。

クエリは、バケットパスとファイル名に関する情報をそれぞれ提供する`_path`や`_file`などの[仮想カラム](../sql-reference/table-functions/s3#virtual-columns)もサポートしています。例:

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

このサンプルデータセットの行数を確認します。ファイル展開にワイルドカードを使用しているため、20個すべてのファイルが対象となります。このクエリは、ClickHouseインスタンスのコア数に応じて約10秒かかります:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

データのサンプリングやアドホックな探索的クエリの実行には有用ですが、S3から直接データを読み取ることは定常的に行うべきではありません。本格的に運用する際は、データをClickHouseの`MergeTree`テーブルにインポートしてください。

### clickhouse-localの使用 {#using-clickhouse-local}

`clickhouse-local`プログラムを使用すると、ClickHouseサーバーをデプロイおよび設定することなく、ローカルファイルに対して高速な処理を実行できます。`s3`テーブル関数を使用するあらゆるクエリをこのユーティリティで実行できます。例:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### S3からのデータ挿入 {#inserting-data-from-s3}

ClickHouseの全機能を活用するため、次にデータを読み取ってインスタンスに挿入します。
これを実現するために、`s3`関数とシンプルな`INSERT`文を組み合わせます。ターゲットテーブルが必要な構造を提供しているため、カラムをリストアップする必要はありません。ただし、カラムはテーブルDDL文で指定された順序で出現する必要があります。カラムは`SELECT`句内の位置に従ってマッピングされます。全1000万行の挿入は、ClickHouseインスタンスに応じて数分かかる場合があります。以下では、迅速な応答を確保するために100万行を挿入しています。必要に応じて`LIMIT`句やカラム選択を調整してサブセットをインポートしてください:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### ClickHouse Localを使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークセキュリティポリシーによってClickHouseクラスタからのアウトバウンド接続が制限されている場合、`clickhouse-local`を使用してS3データを挿入できる可能性があります。以下の例では、S3バケットから読み取り、`remote`関数を使用してClickHouseに挿入します:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
安全なSSL接続経由で実行するには、`remoteSecure`関数を使用してください。
:::

### データのエクスポート {#exporting-data}

`s3`テーブル関数を使用してS3のファイルに書き込むことができます。これには適切な権限が必要です。リクエストに必要な認証情報を渡していますが、その他のオプションについては[認証情報の管理](#managing-credentials)ページを参照してください。

以下のシンプルな例では、テーブル関数をソースではなく宛先として使用します。ここでは、`trips`テーブルから10,000行をバケットにストリーミングし、`lz4`圧縮と出力タイプ`CSV`を指定しています:

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


ここでは、ファイルの形式が拡張子から推測されることに注目してください。また、`s3`関数で列を指定する必要はありません。これは`SELECT`から推測できます。

### 大きなファイルの分割 {#splitting-large-files}

データを単一のファイルとしてエクスポートすることはほとんどないでしょう。ClickHouseを含むほとんどのツールは、並列処理が可能なため、複数のファイルへの読み書きを行う際により高いスループット性能を実現します。`INSERT`コマンドを複数回実行して、データのサブセットを対象とすることもできます。ClickHouseは`PARTITION`キーを使用してファイルを自動的に分割する手段を提供しています。

以下の例では、`rand()`関数の剰余を使用して10個のファイルを作成します。結果として得られるパーティションIDがファイル名で参照されていることに注目してください。これにより、`trips_0.csv.lz4`、`trips_1.csv.lz4`などの数値接尾辞を持つ10個のファイルが生成されます。

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

あるいは、データ内のフィールドを参照することもできます。このデータセットでは、`payment_type`がカーディナリティ5の自然なパーティショニングキーを提供します。

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

### クラスタの活用 {#utilizing-clusters}

上記の関数はすべて単一ノードでの実行に制限されています。読み取り速度は、他のリソース(通常はネットワーク)が飽和するまでCPUコア数に比例してスケールし、ユーザーは垂直スケーリングが可能です。しかし、このアプローチには限界があります。`INSERT INTO SELECT`クエリを実行する際に分散テーブルに挿入することで、ユーザーはリソースの負荷を軽減できますが、それでも単一ノードがデータの読み取り、解析、処理を行うことになります。この課題に対処し、読み取りを水平方向にスケールできるようにするために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md)関数があります。

クエリを受信するノード(イニシエータと呼ばれます)は、クラスタ内のすべてのノードへの接続を作成します。読み取る必要があるファイルを決定するglobパターンは、ファイルのセットに解決されます。イニシエータは、ワーカーとして機能するクラスタ内のノードにファイルを配布します。これらのワーカーは、読み取りが完了すると処理するファイルを要求します。このプロセスにより、読み取りを水平方向にスケールできることが保証されます。

`s3Cluster`関数は、単一ノード版と同じ形式を取りますが、ワーカーノードを示すためにターゲットクラスタが必要です。

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

- `cluster_name` — リモートサーバーおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- `source` — ファイルまたは複数のファイルへのURL。読み取り専用モードで次のワイルドカードをサポートします:`*`、`?`、`{'abc','def'}`、および`{N..M}`(N、Mは数値、abc、defは文字列)。詳細については、[パス内のワイルドカード](/engines/table-engines/integrations/s3.md/#wildcards-in-path)を参照してください。
- `access_key_id`および`secret_access_key` — 指定されたエンドポイントで使用する認証情報を指定するキー。オプション。
- `format` — ファイルの[形式](/interfaces/formats#formats-overview)。
- `structure` — テーブルの構造。形式は'column1_name column1_type, column2_name column2_type, ...'。

他の`s3`関数と同様に、バケットが安全でない場合、またはIAMロールなどの環境を通じてセキュリティを定義する場合、認証情報はオプションです。ただし、s3関数とは異なり、22.3.1以降、リクエストで構造を指定する必要があります。つまり、スキーマは推測されません。

この関数は、ほとんどの場合`INSERT INTO SELECT`の一部として使用されます。この場合、分散テーブルに挿入することが多くなります。以下に、trips_allが分散テーブルである簡単な例を示します。このテーブルはeventsクラスタを使用していますが、読み取りと書き込みに使用されるノードの一貫性は必須ではありません。


```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入処理はイニシエーターノードに対して行われます。つまり、読み取りは各ノードで行われますが、その結果得られた行は分散処理のためにイニシエーターノードへルーティングされます。高スループットのシナリオでは、これがボトルネックとなる可能性があります。これに対処するには、`s3cluster` 関数でパラメータ [parallel&#95;distributed&#95;insert&#95;select](/operations/settings/settings/#parallel_distributed_insert_select) を設定します。


## S3テーブルエンジン {#s3-table-engines}

`s3`関数を使用するとS3に保存されたデータに対してアドホッククエリを実行できますが、構文が冗長になります。`S3`テーブルエンジンを使用すると、バケットURLと認証情報を毎回指定する必要がなくなります。この問題に対処するため、ClickHouseはS3テーブルエンジンを提供しています。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

- `path` — ファイルへのパスを含むバケットURL。読み取り専用モードで以下のワイルドカードをサポートします：`*`、`?`、`{abc,def}`、`{N..M}`（N、Mは数値、'abc'、'def'は文字列）。詳細については、[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
- `format` — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
- `aws_access_key_id`、`aws_secret_access_key` - AWSアカウントユーザーの長期認証情報。リクエストの認証に使用できます。このパラメータは省略可能です。認証情報が指定されていない場合は、設定ファイルの値が使用されます。詳細については、[認証情報の管理](#managing-credentials)を参照してください。
- `compression` — 圧縮タイプ。サポートされる値：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。このパラメータは省略可能です。デフォルトでは、ファイル拡張子から圧縮形式を自動検出します。

### データの読み取り {#reading-data}

次の例では、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`バケットに配置された最初の10個のTSVファイルを使用して、`trips_raw`という名前のテーブルを作成します。各ファイルには100万行が含まれています：


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

`{0..9}` パターンを使用して最初の10個のファイルに制限している点に注意してください。作成後は、他のテーブルと同様にこのテーブルに対してクエリを実行できます:

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

`S3` テーブルエンジンは並列読み取りをサポートしています。書き込みは、テーブル定義にglobパターンが含まれていない場合にのみサポートされます。したがって、上記のテーブルでは書き込みができません。

書き込みを実演するために、書き込み可能なS3バケットを指定したテーブルを作成します:

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

行は新しいファイルにのみ挿入できる点に注意してください。マージ処理やファイル分割処理はありません。いったんファイルへの書き込みが完了すると、それ以降の挿入は失敗します。ユーザーには次の 2 つの選択肢があります。

* 設定 `s3_create_new_file_on_insert=1` を指定します。これにより、挿入ごとに新しいファイルが作成されます。各ファイルの末尾には数値のサフィックスが付与され、挿入操作のたびに単調増加します。上記の例では、後続の挿入により trips&#95;1.bin ファイルが作成されます。
* 設定 `s3_truncate_on_insert=1` を指定します。これによりファイルが切り詰められ、完了時には新たに挿入された行のみを含むようになります。

これら 2 つの設定のデフォルト値はいずれも 0 であり、ユーザーはいずれか一方を設定する必要があります。両方が設定されている場合は `s3_truncate_on_insert` が優先されます。

`S3` テーブルエンジンに関する注意点:

* 従来の `MergeTree` ファミリーのテーブルとは異なり、`S3` テーブルを DROP しても、基盤となるデータは削除されません。
* このテーブルタイプの完全な設定一覧は[こちら](/engines/table-engines/integrations/s3.md/#settings)にあります。
* このエンジンを使用する際は、次の制約事項に注意してください:
  * ALTER クエリはサポートされません
  * SAMPLE 操作はサポートされません
  * インデックスの概念はありません（プライマリキーやスキップインデックスを含む）。


## 認証情報の管理 {#managing-credentials}

前述の例では、`s3`関数または`S3`テーブル定義内で認証情報を渡していました。これは時折の使用には許容されるかもしれませんが、本番環境ではより暗黙的な認証メカニズムが必要です。これに対処するため、ClickHouseにはいくつかのオプションがあります:

- **config.xml**または**conf.d**配下の同等の設定ファイルに接続詳細を指定します。debianパッケージを使用したインストールを想定した例ファイルの内容を以下に示します。

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

  これらの認証情報は、上記のエンドポイントがリクエストされたURLの完全なプレフィックスマッチとなるすべてのリクエストに使用されます。また、この例ではアクセスキーとシークレットキーの代替として認証ヘッダーを宣言できることに注意してください。サポートされている設定の完全なリストは[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

- 上記の例は、設定パラメータ`use_environment_credentials`の利用可能性を示しています。この設定パラメータは`s3`レベルでグローバルに設定することもできます:

  ```xml
  <clickhouse>
      <s3>
      <use_environment_credentials>true</use_environment_credentials>
      </s3>
  </clickhouse>
  ```

  この設定により、環境からS3認証情報を取得する試みが有効になり、IAMロールを通じたアクセスが可能になります。具体的には、以下の順序で取得が実行されます:
  - 環境変数`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`の検索
  - **$HOME/.aws**での確認
  - AWS Security Token Serviceを介した一時的な認証情報の取得 - すなわち[`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) APIを介した取得
  - ECS環境変数`AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`または`AWS_CONTAINER_CREDENTIALS_FULL_URI`および`AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`での認証情報の確認
  - [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED)がtrueに設定されていない場合、[Amazon EC2インスタンスメタデータ](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)を介した認証情報の取得
  - これらの同じ設定は、同じプレフィックスマッチングルールを使用して、特定のエンドポイントに対しても設定できます。


## パフォーマンスの最適化 {#s3-optimizing-performance}

S3関数を使用した読み取りと挿入の最適化方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。

### S3ストレージのチューニング {#s3-storage-tuning}

内部的に、ClickHouseのマージツリーは2つの主要なストレージ形式を使用します：[`Wide`と`Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。現在の実装ではClickHouseのデフォルト動作（設定`min_bytes_for_wide_part`と`min_rows_for_wide_part`によって制御）を使用していますが、将来のリリースではS3に対する動作が変更される予定です。例えば、`min_bytes_for_wide_part`のデフォルト値が大きくなることで、より`Compact`な形式が推奨され、ファイル数が削減される可能性があります。S3ストレージを専用で使用する場合、ユーザーはこれらの設定のチューニングを検討することをお勧めします。


## S3バックエンドMergeTree {#s3-backed-mergetree}

`s3`関数および関連するテーブルエンジンを使用すると、使い慣れたClickHouse構文でS3内のデータをクエリできます。ただし、データ管理機能とパフォーマンスには制限があります。プライマリインデックスのサポートがなく、キャッシュのサポートもなく、ファイルの挿入はユーザーが管理する必要があります。

ClickHouseは、S3が魅力的なストレージソリューションであることを認識しています。特に「コールド」データに対するクエリパフォーマンスがそれほど重要でない場合や、ユーザーがストレージとコンピュートを分離したい場合に有効です。これを実現するため、S3をMergeTreeエンジンのストレージとして使用するためのサポートが提供されています。これにより、ユーザーはS3のスケーラビリティとコストメリット、およびMergeTreeエンジンの挿入とクエリパフォーマンスを活用できます。

### ストレージ階層 {#storage-tiers}

ClickHouseのストレージボリュームは、物理ディスクをMergeTreeテーブルエンジンから抽象化することを可能にします。単一のボリュームは、順序付けられたディスクのセットで構成できます。主に複数のブロックデバイスをデータストレージに使用できるようにする一方で、この抽象化はS3を含む他のストレージタイプも許可します。ClickHouseのデータパーツは、ストレージポリシーに従ってボリューム間および充填率に応じて移動でき、これによりストレージ階層の概念が実現されます。

ストレージ階層により、ホット・コールドアーキテクチャが実現されます。最新のデータは通常最も頻繁にクエリされるため、高性能ストレージ(例: NVMe SSD)上のわずかなスペースのみを必要とします。データが古くなるにつれて、クエリ時間のSLAは緩和され、クエリ頻度も低下します。このロングテールのデータは、HDDやS3などのオブジェクトストレージといった、より低速で性能の低いストレージに保存できます。

### ディスクの作成 {#creating-a-disk}

S3バケットをディスクとして利用するには、まずClickHouse設定ファイル内で宣言する必要があります。config.xmlを拡張するか、できればconf.d配下に新しいファイルを提供してください。S3ディスク宣言の例を以下に示します:

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

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。認証情報は、[認証情報の管理](#managing-credentials)で説明されているのと同じ方法で管理できます。つまり、上記の設定ブロックでuse_environment_credentialsをtrueに設定することで、IAMロールを使用できます。

### ストレージポリシーの作成 {#creating-a-storage-policy}

設定が完了すると、この「ディスク」はポリシー内で宣言されたストレージボリュームで使用できます。以下の例では、s3が唯一のストレージであると仮定しています。これは、TTLや充填率に基づいてデータを再配置できる、より複雑なホット・コールドアーキテクチャは考慮していません。

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

書き込みアクセス権を持つバケットを使用するようにディスクを設定していれば、以下の例のようなテーブルを作成できるはずです。簡潔にするため、NYCタクシーデータの列のサブセットを使用し、データをS3バックエンドテーブルに直接ストリーミングします:


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

ハードウェアによっては、この100万行の挿入には数分かかる場合があります。進行状況は`system.processes`テーブルで確認できます。行数を最大1000万行まで調整して、サンプルクエリを実行してみてください。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### テーブルの変更 {#modifying-a-table}

特定のテーブルのストレージポリシーを変更する必要がある場合があります。これは可能ですが、制限があります。新しいターゲットポリシーには、以前のポリシーのすべてのディスクとボリュームが含まれている必要があります。つまり、ポリシー変更を満たすためにデータが移行されることはありません。これらの制約を検証する際、ボリュームとディスクは名前で識別され、違反しようとするとエラーが発生します。ただし、前述の例を使用している場合、以下の変更は有効です。

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

ここでは、新しい`s3_tiered`ポリシーで`main`ボリュームを再利用し、新しい`hot`ボリュームを導入しています。これは`default`ディスクを使用しており、`<path>`パラメータで設定された単一のディスクで構成されています。ボリューム名とディスクは変更されないことに注意してください。テーブルへの新しい挿入は、`move_factor * disk_size`に達するまで`default`ディスクに保存され、その時点でデータはS3に再配置されます。

### レプリケーションの処理 {#handling-replication}

S3ディスクでのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実現できます。詳細については、[S3オブジェクトストレージを使用した2つのAWSリージョン間での単一シャードのレプリケーション](#s3-multi-region)ガイドを参照してください。

### 読み取りと書き込み {#read--writes}

以下の注記は、ClickHouseとS3の相互作用の実装について説明しています。一般的には情報提供のみですが、[パフォーマンスの最適化](#s3-optimizing-performance)を行う際に参考になる可能性があります。


* デフォルトでは、クエリ処理パイプラインの任意のステージで使用されるクエリ処理スレッドの最大数はコア数と同じです。ステージごとに並列実行しやすさが異なるため、この値は上限となります。データがディスクからストリーミングされるため、複数のクエリステージが同時に実行される場合があります。その結果、クエリで実際に使用されるスレッド数がこの値を上回ることがあります。この設定は [max_threads](/operations/settings/settings#max_threads) によって変更できます。
* S3 での読み込みはデフォルトで非同期です。この動作は `remote_filesystem_read_method` 設定によって決まり、デフォルト値は `threadpool` です。リクエストを処理する際、ClickHouse はグラニュールをストライプ単位で読み込みます。各ストライプには多数のカラムが含まれる可能性があります。1 つのスレッドが、対応するグラニュールのカラムを 1 つずつ順番に読み込みます。これを同期的に行うのではなく、データを待機する前にすべてのカラムに対して先読みを行います。これにより、各カラムで同期的に待機する場合と比較して大幅な性能向上が得られます。多くの場合、ユーザーがこの設定を変更する必要はありません。詳細は [Optimizing for Performance](#s3-optimizing-performance) を参照してください。
* 書き込みは並列に実行され、同時に実行されるファイル書き込みスレッドは最大 100 個です。`max_insert_delayed_streams_for_parallel_write` はデフォルト値 1000 を持ち、並列に書き込まれる S3 BLOB の数を制御します。書き込み中の各ファイルにはバッファ (~1MB) が必要なため、これは実質的に INSERT のメモリ消費量を制限します。サーバーのメモリが少ない環境では、この値を下げることが適切な場合があります。



## S3オブジェクトストレージをClickHouseディスクとして使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成する手順が必要な場合は、**S3バケットとIAMロールの作成**を展開して手順に従ってください:

<BucketDetails />

### S3バケットをディスクとして使用するようClickHouseを設定する {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}

以下の例は、デフォルトのClickHouseディレクトリを使用してサービスとしてインストールされたLinux Debパッケージに基づいています。

1.  ストレージ設定を保存するために、ClickHouseの`config.d`ディレクトリに新しいファイルを作成します。

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

2. ストレージ設定として以下を追加します。前の手順で取得したバケットパス、アクセスキー、シークレットキーを置き換えてください

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
`<disks>`タグ内の`s3_disk`と`s3_cache`タグは任意のラベルです。これらは別の名前に設定できますが、ディスクを参照するために`<policies>`タグ配下の`<disk>`タグで同じラベルを使用する必要があります。
`<s3_main>`タグも任意であり、ClickHouseでリソースを作成する際にストレージターゲットの識別子として使用されるポリシーの名前です。

上記の設定はClickHouseバージョン22.8以降を対象としています。それより古いバージョンを使用している場合は、[データの保存](/operations/storing-data.md/#using-local-cache)のドキュメントを参照してください。

S3の使用に関する詳細情報:
統合ガイド: [S3 Backed MergeTree](#s3-backed-mergetree)
:::

3. ファイルの所有者を`clickhouse`ユーザーとグループに更新します

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

4. 変更を有効にするためにClickHouseインスタンスを再起動します。

```bash
service clickhouse-server restart
```

### テスト {#testing}

1. 次のようにClickHouseクライアントでログインします

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 新しいS3ストレージポリシーを指定してテーブルを作成します

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

3. テーブルが正しいポリシーで作成されたことを確認します

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

4. テーブルにテスト行を挿入します

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

5. 行を表示します

```sql
SELECT * FROM s3_table1;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

```


2 行取得されました。経過時間: 0.284 秒。

```
6.  AWSコンソールでバケットに移動し、新しく作成したバケットとフォルダを選択します。
以下のような画面が表示されます。

<Image img={S3J} size="lg" border alt="S3に保存されたClickHouseデータファイルを表示するAWSコンソールのS3バケットビュー" />
```


## S3オブジェクトストレージを使用した2つのAWSリージョン間での単一シャードのレプリケーション {#s3-multi-region}

:::tip
ClickHouse Cloudではオブジェクトストレージがデフォルトで使用されるため、ClickHouse Cloudを使用している場合はこの手順に従う必要はありません。
:::

### デプロイメントの計画 {#plan-the-deployment}

このチュートリアルは、AWS EC2に2つのClickHouse Serverノードと3つのClickHouse Keeperノードをデプロイすることを前提としています。ClickHouseサーバーのデータストアはS3です。災害復旧をサポートするために、各リージョンにClickHouse ServerとS3バケットを配置した2つのAWSリージョンを使用します。

ClickHouseテーブルは2つのサーバー間、つまり2つのリージョン間でレプリケートされます。

### ソフトウェアのインストール {#install-software}

#### ClickHouseサーバーノード {#clickhouse-server-nodes}

ClickHouseサーバーノードでデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

#### ClickHouseのデプロイ {#deploy-clickhouse}

2つのホストにClickHouseをデプロイします。サンプル構成では、これらは`chnode1`、`chnode2`という名前になっています。

`chnode1`を1つのAWSリージョンに、`chnode2`を2つ目のリージョンに配置します。

#### ClickHouse Keeperのデプロイ {#deploy-clickhouse-keeper}

3つのホストにClickHouse Keeperをデプロイします。サンプル構成では、これらは`keepernode1`、`keepernode2`、`keepernode3`という名前になっています。`keepernode1`は`chnode1`と同じリージョンに、`keepernode2`は`chnode2`と同じリージョンに配置できます。`keepernode3`はいずれかのリージョンに配置できますが、そのリージョン内のClickHouseノードとは異なるアベイラビリティゾーンに配置してください。

ClickHouse Keeperノードでデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

### S3バケットの作成 {#create-s3-buckets}

2つのS3バケットを作成します。`chnode1`と`chnode2`を配置した各リージョンに1つずつ作成してください。

バケットとIAMロールを作成するための詳細な手順が必要な場合は、**S3バケットとIAMロールの作成**を展開して手順に従ってください。

<BucketDetails />

構成ファイルは`/etc/clickhouse-server/config.d/`に配置されます。以下は1つのバケット用のサンプル構成ファイルです。もう1つのバケットも同様ですが、ハイライトされた3行が異なります。

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
このガイドの多くの手順では、構成ファイルを`/etc/clickhouse-server/config.d/`に配置するよう求められます。これはLinuxシステムにおける構成オーバーライドファイルのデフォルトの場所です。これらのファイルをこのディレクトリに配置すると、ClickHouseはその内容を使用してデフォルト構成をオーバーライドします。これらのファイルをオーバーライドディレクトリに配置することで、アップグレード時に構成が失われることを回避できます。
:::

### ClickHouse Keeperの構成 {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロン(ClickHouseサーバーとは別)で実行する場合、構成は単一のXMLファイルです。このチュートリアルでは、ファイルは`/etc/clickhouse-keeper/keeper_config.xml`です。3つのKeeperサーバーはすべて同じ構成を使用しますが、1つの設定`<server_id>`のみが異なります。


`server_id`は、設定ファイルが使用されるホストに割り当てられるIDを示します。以下の例では、`server_id`が`3`に設定されており、ファイル内の`<raft_configuration>`セクションを確認すると、サーバー3のホスト名が`keepernode3`であることがわかります。これにより、ClickHouse Keeperプロセスは、リーダー選出やその他すべての処理において、接続すべき他のサーバーを認識します。

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

ClickHouse Keeperの設定ファイルを適切な場所にコピーします(`<server_id>`の設定を忘れずに):

```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### ClickHouseサーバーの設定 {#configure-clickhouse-server}

#### クラスターの定義 {#define-a-cluster}

ClickHouseクラスターは、設定の`<remote_servers>`セクションで定義されます。このサンプルでは、`cluster_1S_2R`という1つのクラスターが定義されており、2つのレプリカを持つ単一のシャードで構成されています。レプリカは`chnode1`と`chnode2`のホスト上に配置されています。

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

クラスターを操作する際には、DDLクエリにクラスター、シャード、レプリカの設定を自動的に埋め込むマクロを定義すると便利です。このサンプルでは、`shard`と`replica`の詳細を指定せずに、レプリケートされたテーブルエンジンの使用を指定できます。テーブルを作成する際、`system.tables`をクエリすることで、`shard`と`replica`のマクロがどのように使用されているかを確認できます。

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
上記のマクロは`chnode1`用です。`chnode2`では`replica`を`replica_2`に設定してください。
:::

#### ゼロコピーレプリケーションの無効化 {#disable-zero-copy-replication}


ClickHouseバージョン22.7以前では、S3およびHDFSディスクに対して`allow_remote_fs_zero_copy_replication`設定がデフォルトで`true`に設定されています。このディザスタリカバリシナリオでは、この設定を`false`に設定する必要があります。なお、バージョン22.8以降ではデフォルトで`false`に設定されています。

この設定を`false`にする理由は2つあります:1) この機能は本番環境での使用に対応していない、2) ディザスタリカバリシナリオでは、データとメタデータの両方を複数のリージョンに保存する必要がある。`allow_remote_fs_zero_copy_replication`を`false`に設定してください。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeperは、ClickHouseノード間でのデータレプリケーションの調整を担当します。ClickHouseにClickHouse Keeperノードを認識させるには、各ClickHouseノードに設定ファイルを追加します。

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

AWSでセキュリティ設定を構成する際は、サーバー間の通信およびサーバーへの接続を可能にするために、[ネットワークポート](../../../guides/sre/network-ports.md)のリストを参照してください。

3台のサーバーすべてが、サーバー間およびS3との通信を可能にするためにネットワーク接続をリッスンする必要があります。デフォルトでは、ClickHouseはループバックアドレスでのみリッスンするため、これを変更する必要があります。これは`/etc/clickhouse-server/config.d/`で設定します。以下は、ClickHouseとClickHouse KeeperをすべてのIPv4インターフェースでリッスンするように設定する例です。詳細については、ドキュメントまたはデフォルト設定ファイル`/etc/clickhouse/config.xml`を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

### サーバーの起動 {#start-the-servers}

#### ClickHouse Keeperの実行 {#run-clickhouse-keeper}

各Keeperサーバーで、オペレーティングシステムに応じたコマンドを実行します。例:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeperのステータス確認 {#check-clickhouse-keeper-status}

`netcat`を使用してClickHouse Keeperにコマンドを送信します。例えば、`mntr`はClickHouse Keeperクラスタの状態を返します。各Keeperノードでこのコマンドを実行すると、1つがリーダーで、残りの2つがフォロワーであることが確認できます:


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

#### ClickHouseサーバーの実行 {#run-clickhouse-server}

各ClickHouseサーバーで以下を実行します

```bash
sudo service clickhouse-server start
```

#### ClickHouseサーバーの検証 {#verify-clickhouse-server}

[クラスター構成](#define-a-cluster)を追加した際、2つのClickHouseノード間でレプリケートされる単一のシャードが定義されました。この検証手順では、ClickHouseの起動時にクラスターが構築されたことを確認し、そのクラスターを使用してレプリケートされたテーブルを作成します。

- クラスターが存在することを確認します:

  ```sql
  show clusters
  ```

  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- `ReplicatedMergeTree`テーブルエンジンを使用してクラスター内にテーブルを作成します:
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
- 先に定義したマクロの使用方法を理解する

  マクロ`shard`と`replica`は[先に定義](#define-a-cluster)されており、以下の強調表示された行で各ClickHouseノードにおいて値が置換される箇所を確認できます。さらに、`uuid`の値が使用されていますが、`uuid`はシステムによって生成されるため、マクロには定義されていません。

  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```

  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0
  ```


Row 1:
──────
create&#95;table&#95;query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8(&#39;UNK&#39; = 0, &#39;CSH&#39; = 1, &#39;CRE&#39; = 2, &#39;NOC&#39; = 3, &#39;DIS&#39; = 4))

# highlight-next-line

ENGINE = ReplicatedMergeTree(&#39;/clickhouse/tables/{uuid}/{shard}&#39;, &#39;{replica}&#39;)
PARTITION BY toYYYYMM(pickup&#95;date) ORDER BY pickup&#95;datetime SETTINGS storage&#95;policy = &#39;s3&#95;main&#39;

結果セット内の行数: 1。経過時間: 0.012 秒。

````
:::note
上記のzookeeperパス `'clickhouse/tables/{uuid}/{shard}` は、`default_replica_path` と `default_replica_name` を設定することでカスタマイズできます。ドキュメントは[こちら](/operations/server-configuration-parameters/settings.md/#default_replica_path)を参照してください。
:::

### テスト {#testing-1}

これらのテストでは、データが2つのサーバー間でレプリケーションされていること、およびローカルディスクではなくS3バケットに保存されていることを検証します。

- New York Cityタクシーデータセットからデータを追加します:
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
````

* データが S3 に保存されていることを確認します。

  このクエリは、ディスク上のデータサイズと、どのディスクを使用するかを決定するストレージポリシーを表示します。

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

  ローカルディスク上のデータサイズを確認します。上の出力からわかるように、保存されている数百万行分のディスク上のサイズは 36.42 MiB です。これはローカルディスクではなく S3 上に存在しているはずです。上のクエリは、ローカルディスク上のデータとメタデータがどこに保存されているかも示しています。ローカルデータを確認します:

  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  各 S3 バケット内のデータを確認します（合計値は表示されていませんが、どちらのバケットも INSERT 後におおよそ 36 MiB を保存しています）:

<Image img={Bucket1} size="lg" border alt="1 つ目の S3 バケットのデータサイズを示すストレージ使用量メトリクス" />

<Image img={Bucket2} size="lg" border alt="2 つ目の S3 バケットのデータサイズを示すストレージ使用量メトリクス" />


## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)は、Amazon S3の新しい高性能単一アベイラビリティゾーンストレージクラスです。

ClickHouseでS3Expressをテストした経験については、この[ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)を参照してください。

:::note
S3Expressは単一のAZ内にデータを保存します。つまり、AZ障害が発生した場合、データは利用できなくなります。
:::

### S3ディスク {#s3-disk}

S3Expressバケットを使用したストレージでテーブルを作成するには、以下の手順を実行します:

1. `Directory`タイプのバケットを作成します
2. S3ユーザーに必要なすべての権限を付与する適切なバケットポリシーを設定します（例: 無制限のアクセスを許可する場合は`"Action": "s3express:*"`を使用）
3. ストレージポリシーを設定する際は、`region`パラメータを指定してください

ストレージ設定は通常のS3と同じで、例えば以下のようになります:

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

次に、新しいストレージ上にテーブルを作成します:

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

### S3ストレージ {#s3-storage}

S3ストレージもサポートされていますが、`Object URL`パスのみに対応しています。例:

```sql
SELECT * FROM s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

設定ファイルでバケットのリージョンを指定する必要もあります:

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### バックアップ {#backups}

上記で作成したディスクにバックアップを保存することができます:

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
