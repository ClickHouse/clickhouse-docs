---
title: 'オープンテーブル形式を直接クエリする'
sidebar_label: '直接クエリ'
slug: /use-cases/data-lake/getting-started/querying-directly
sidebar_position: 1
pagination_prev: use-cases/data_lake/getting-started
pagination_next: use-cases/data_lake/guides/connecting-catalogs
description: '事前設定なしで、ClickHouse のテーブル関数を使用してオブジェクトストレージ上の Iceberg、Delta Lake、Hudi、Paimon テーブルを読み取ります。'
toc_max_heading_level: 2
keywords: ['データレイク', 'レイクハウス', 'Iceberg', 'Delta Lake', 'Hudi', 'Paimon', 'テーブル関数']
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouse には、オブジェクトストレージ内のオープンテーブル形式で保存されたデータを直接クエリするためのテーブル関数が用意されています。外部カタログに接続する必要はなく、AWS Athena が S3 からデータを読み取るのと同様に、その場でデータをクエリします。

関数呼び出しでストレージパスと認証情報を直接指定すれば、残りの処理は ClickHouse が担います。ClickHouse のすべての SQL 構文と関数を利用でき、クエリでは ClickHouse の並列実行と[効率的なネイティブ Parquet リーダー](/blog/clickhouse-and-parquet-a-foundation-for-fast-lakehouse-analytics)の利点を活用できます。

:::note サーバー、local、または chDB
このガイドの手順は、既存の ClickHouse サーバー環境を使用して実行できます。アドホックなクエリには、代わりに [clickhouse-local](/operations/utilities/clickhouse-local) を使用し、サーバーを起動せずに同じワークフローを実行することもできます。少し調整すれば、ClickHouse のインプロセス実装である [chDB](/chdb) を使用して同じ処理を行うことも可能です。
:::

以下の例では、各レイクハウス形式で S3 に保存された [hits](/getting-started/example-datasets/star-schema) データセットを使用します。各レイク形式について、オブジェクトストアプロバイダーごとの専用関数が用意されています。

<Tabs groupId="lake-format">
  <TabItem value="iceberg" label="Apache Iceberg" default>
    [`iceberg`](/sql-reference/table-functions/iceberg) テーブル関数 (`icebergS3` のエイリアス) は、オブジェクトストレージから直接 Iceberg テーブルを読み取ります。各ストレージバックエンドに対応するバリアントとして、`icebergS3`、`icebergAzure`、`icebergHDFS`、`icebergLocal` があります。

    **構文例：**

    ```sql
    icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    icebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note GCSのサポート
    関数のS3バリアントは、Google Cloud Storage (GCS) に対しても使用できます。
    :::

    **例：**

    ```sql
    SELECT
        url,
        count() AS cnt
    FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5

    ┌─url────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │ -- 3.29 million
    │ http://kinopoisk.ru                                │ 1625250 │ -- 1.63 million
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.375 sec. Processed 100.00 million rows, 9.98 GB (29.63 million rows/s., 2.96 GB/s.)
    Peak memory usage: 10.48 GiB.
    ```

    ### クラスターバリアント \{#iceberg-cluster-variant\}

    [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster) 関数は、ClickHouse クラスター内の複数のノードに読み取り処理を分散します。イニシエーターノードはすべてのノードへの接続を確立し、データファイルを動的に割り当てます。各ワーカーノードは、すべてのファイルが読み取られるまでタスクを要求して処理します。`icebergCluster` は `icebergS3Cluster` のエイリアスです。Azure ([`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster)) および HDFS ([`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster)) 向けのバリアントも存在します。

    **構文例：**

    ```sql
    icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
    -- icebergCluster is an alias for icebergS3Cluster

    icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    **例 (ClickHouse Cloud):**

    ```sql
    SELECT
        url,
        count() AS cnt
    FROM icebergS3Cluster(
        'default',
        'https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/'
    )
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5
    ```

    ### テーブルエンジン \{#iceberg-table-engine\}

    すべてのクエリでテーブル関数を使用する代わりに、[`Iceberg` テーブルエンジン](/engines/table-engines/integrations/iceberg)を使用して永続テーブルを作成することができます。データは引き続きオブジェクトストレージに保存され、必要に応じて読み込まれます。ClickHouse にデータがコピーされることはありません。テーブル定義が ClickHouse に保存されるため、各ユーザーがストレージパスや認証情報を個別に指定することなく、ユーザーやセッションをまたいで共有できる点が利点です。ストレージバックエンドごとにエンジンのバリアントが用意されています：`IcebergS3` (または `Iceberg` エイリアス) 、`IcebergAzure`、`IcebergHDFS`、`IcebergLocal`。

    テーブルエンジンとテーブル関数はいずれも[データキャッシュ](/engines/table-engines/integrations/iceberg#data-cache)をサポートしており、S3、AzureBlobStorage、およびHDFSストレージエンジンと同じキャッシュ機構を使用します。また、[メタデータキャッシュ](/engines/table-engines/integrations/iceberg#metadata-cache)はマニフェストファイルの情報をメモリに保存することで、Icebergメタデータの繰り返し読み取りを削減します。このキャッシュは`use_iceberg_metadata_files_cache`設定によってデフォルトで有効化されています。

    **構文例：**

    テーブルエンジン `Iceberg` は `IcebergS3` のエイリアスです。

    ```sql
    CREATE TABLE iceberg_table
        ENGINE = IcebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])

    CREATE TABLE iceberg_table
        ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

    CREATE TABLE iceberg_table
        ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
    ```

    :::note GCS サポート
    テーブルエンジンのS3バリアントは、Google Cloud Storage (GCS) でも使用できます。
    :::

    **例：**

    ```sql
    CREATE TABLE hits_iceberg
        ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')

    SELECT
        url,
        count() AS cnt
    FROM hits_iceberg
    GROUP BY url
    ORDER BY cnt DESC
    LIMIT 5

    ┌─url────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │
    │ http://kinopoisk.ru                                │ 1625250 │
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 2.737 sec. Processed 100.00 million rows, 9.98 GB (36.53 million rows/s., 3.64 GB/s.)
    Peak memory usage: 10.53 GiB.
    ```

    パーティションプルーニング、スキーマ進化、タイムトラベル、キャッシングなど、サポートされている機能については、[サポートマトリックス](/use-cases/data-lake/support-matrix#format-support)を参照してください。完全なリファレンスについては、[`iceberg` テーブル関数](/sql-reference/table-functions/iceberg)および[`Iceberg` テーブルエンジン](/engines/table-engines/integrations/iceberg)のドキュメントを参照してください。
  </TabItem>

  <TabItem value="デルタ" label="Delta Lake">
    [`deltaLake`](/sql-reference/table-functions/deltalake) テーブル関数 (`deltaLakeS3` のエイリアス) は、オブジェクトストレージから Delta Lake テーブルを読み取ります。他のバックエンド向けのバリアントとして、`deltaLakeAzure` および `deltaLakeLocal` があります。

    **構文例：**

    ```sql
    deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

    deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    deltaLakeLocal(path, [,format])
    ```

    :::note GCS サポート
    関数のS3バリアントは、Google Cloud Storage (GCS) でも使用できます。
    :::

    **例：**

    ```sql
    SELECT
        URL,
        count() AS cnt
    FROM deltaLake('https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/')
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5

    ┌─URL────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │ -- 3.29 million
    │ http://kinopoisk.ru                                │ 1625250 │ -- 1.63 million
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.878 sec. Processed 100.00 million rows, 14.82 GB (25.78 million rows/s., 3.82 GB/s.)
    Peak memory usage: 9.16 GiB.
    ```

    ### クラスターバリアント \{#delta-cluster-variant\}

    [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster) 関数は、ClickHouse クラスター内の複数のノードに読み取り処理を分散します。イニシエーターノードはデータファイルをワーカーノードへ動的にディスパッチし、並列処理を実現します。`deltaLakeS3Cluster` は `deltaLakeCluster` のエイリアスです。Azure 向けのバリアント ([`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster)) も利用可能です。

    **構文例：**

    ```sql
    deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    -- deltaLakeS3Cluster is an alias for deltaLakeCluster

    deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
    ```

    :::note GCSサポート
    関数のS3バリアントは、Google Cloud Storage (GCS) に対しても使用できます。
    :::

    **例 (ClickHouse Cloud):**

    ```sql
    SELECT
        URL,
        count() AS cnt
    FROM deltaLakeCluster(
        'default',
        'https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/'
    )
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5
    ```

    ### テーブルエンジン \{#delta-table-engine\}

    すべてのクエリでテーブル関数を使用する代わりに、S3互換ストレージを使用している場合は、[`DeltaLake`テーブルエンジン](/engines/table-engines/integrations/deltalake)を使用して永続テーブルを作成できます。データは引き続きオブジェクトストレージに保存され、必要に応じて読み取られます。ClickHouseにデータがコピーされることはありません。テーブル定義はClickHouseに保存されるため、各ユーザーがストレージパスや認証情報を個別に指定することなく、ユーザーおよびセッション間で共有できるという利点があります。

    テーブルエンジンとテーブル関数はどちらも、S3、AzureBlobStorage、HDFSストレージエンジンと同じキャッシュ機構を使用した[データキャッシュ](/engines/table-engines/integrations/deltalake#data-cache)をサポートしています。

    **構文例：**

    ```sql
    CREATE TABLE delta_table
        ENGINE = DeltaLake(url [,aws_access_key_id, aws_secret_access_key])
    ```

    :::note GCSのサポート
    このテーブルエンジンはGoogle Cloud Storage (GCS) で使用できます。
    :::

    **例：**

    ```sql
    CREATE TABLE hits_delta
        ENGINE = DeltaLake('https://datasets-documentation.s3.amazonaws.com/lake_formats/delta_lake/')

    SELECT
        URL,
        count() AS cnt
    FROM hits_delta
    GROUP BY URL
    ORDER BY cnt DESC
    LIMIT 5

    ┌─URL────────────────────────────────────────────────┬─────cnt─┐
    │ http://liver.ru/belgorod/page/1006.jки/доп_приборы │ 3288173 │
    │ http://kinopoisk.ru                                │ 1625250 │
    │ http://bdsm_po_yers=0&with_video                   │  791465 │
    │ http://video.yandex                                │  582400 │
    │ http://smeshariki.ru/region                        │  514984 │
    └────────────────────────────────────────────────────┴─────────┘

    5 rows in set. Elapsed: 3.608 sec. Processed 100.00 million rows, 14.82 GB (27.72 million rows/s., 4.11 GB/s.)
    Peak memory usage: 9.27 GiB.
    ```

    ストレージバックエンド、キャッシュなどのサポート対象機能については、[サポートマトリックス](/use-cases/data-lake/support-matrix#format-support)を参照してください。完全なリファレンスについては、[`deltaLake` テーブル関数](/sql-reference/table-functions/deltalake)および[`DeltaLake` テーブルエンジン](/engines/table-engines/integrations/deltalake)のドキュメントを参照してください。
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    [`hudi`](/sql-reference/table-functions/hudi) テーブル関数は、S3上のHudiテーブルを読み取ります。

    **構文:**

    ```sql
    hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### クラスター版 \{#hudi-cluster-variant\}

    [`hudiCluster`](/sql-reference/table-functions/hudiCluster) 関数は、ClickHouse クラスター内の複数のノードに読み取りを分散します。イニシエーターノードは、並列処理のためにデータファイルをワーカーノードへ動的に振り分けます。

    ```sql
    hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
    ```

    ### テーブルエンジン \{#hudi-table-engine\}

    すべてのクエリで table function を使用する代わりに、[`Hudi` テーブルエンジン](/engines/table-engines/integrations/hudi)を使用して永続テーブルを作成できます。データは引き続きオブジェクトストレージに保存されたままで、必要になった時点で読み込まれます。ClickHouse にデータがコピーされることはありません。利点は、テーブル定義が ClickHouse に保存されるため、各ユーザーがストレージパスや認証情報を個別に指定しなくても、ユーザーやセッションをまたいで共有できることです。

    **構文:**

    ```sql
    CREATE TABLE hudi_table
        ENGINE = Hudi(url [,aws_access_key_id, aws_secret_access_key])
    ```

    ストレージバックエンドなどの対応機能については、[サポートマトリックス](/use-cases/data-lake/support-matrix#format-support)を参照してください。完全なリファレンスについては、[`hudi` テーブル関数](/sql-reference/table-functions/hudi)および[`Hudi` テーブルエンジン](/engines/table-engines/integrations/hudi)のドキュメントを参照してください。
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    <ExperimentalBadge />

    [`paimon`](/sql-reference/table-functions/paimon) テーブル関数 (`paimonS3` のエイリアス) は、オブジェクトストレージから Paimon テーブルを読み込みます。ストレージバックエンドごとに、`paimonS3`、`paimonAzure`、`paimonHDFS`、`paimonLocal` の各バリアントが用意されています。

    **構文:**

    ```sql
    paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

    paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFS(path_to_table, [,format] [,compression_method])

    paimonLocal(path_to_table, [,format] [,compression_method])
    ```

    ### クラスターバリアント \{#paimon-cluster-variant\}

    [`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster) 関数は、ClickHouse クラスタ内の複数ノードに読み取りを分散します。イニシエータノードは、並列処理のためにデータファイルをワーカーノードへ動的に振り分けます。`paimonCluster` は `paimonS3Cluster` のエイリアスです。Azure 向け ([`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster)) および HDFS 向け ([`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster)) のバリアントもあります。

    ```sql
    paimonS3Cluster(cluster_name, url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])
    -- paimonCluster is an alias for paimonS3Cluster

    paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

    paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
    ```

    ### テーブルエンジン \{#paimon-table-engine\}

    現在、ClickHouse には Paimon 専用のテーブルエンジンはありません。Paimon テーブルをクエリするには、上記のテーブル関数を使用してください。

    ストレージバックエンドを含むサポート対象の機能などについては、[サポートマトリックス](/use-cases/data-lake/support-matrix#format-support)を参照してください。完全なリファレンスについては、[`paimon` テーブル関数](/sql-reference/table-functions/paimon)のドキュメントを参照してください。
  </TabItem>
</Tabs>