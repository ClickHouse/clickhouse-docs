---
sidebar_position: 1
sidebar_label: 'ストレージとコンピュートの分離'
slug: /guides/separation-storage-compute
title: 'ストレージとコンピュートの分離'
description: 'このガイドでは、ClickHouseとS3を使用してストレージとコンピュートが分離されたアーキテクチャを実装する方法を探ります。'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# ストレージとコンピュートの分離

## 概要 {#overview}

このガイドでは、ClickHouseとS3を使用してストレージとコンピュートが分離されたアーキテクチャを実装する方法を探ります。

ストレージとコンピュートの分離とは、計算リソースとストレージリソースを独立して管理することを意味します。ClickHouseでは、これによりスケーラビリティ、コスト効率、柔軟性が向上します。必要に応じてストレージとコンピュートリソースを個別にスケールでき、パフォーマンスとコストを最適化できます。

ClickHouseをS3にバックアップして使用することは、「コールド」データに対するクエリパフォーマンスがそれほど重要でないユースケースに特に役立ちます。ClickHouseは、`MergeTree`エンジン用にS3をストレージとして使用するためのサポートを提供する`S3BackedMergeTree`を使用しています。このテーブルエンジンは、ユーザーがS3のスケーラビリティとコストの利点を活用しながら、`MergeTree`エンジンの挿入とクエリのパフォーマンスを維持することを可能にします。

ストレージとコンピュートの分離アーキテクチャを実装および管理することは、標準的なClickHouseデプロイメントと比べて複雑であることに注意してください。セルフマネージドのClickHouseでは、このガイドで説明されているようにストレージとコンピュートの分離が可能ですが、設定なしでこのアーキテクチャでClickHouseを使用できる[ClickHouse Cloud](https://clickhouse.com/cloud)の使用をお勧めします。これは、[`SharedMergeTree` テーブルエンジン](/cloud/reference/shared-merge-tree)を使用します。

*このガイドでは、ClickHouseバージョン22.8以上を使用していることを前提としています。*

:::warning
AWS/GCSライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる可能性があります。
:::

## 1. S3をClickHouseディスクとして使用する {#1-use-s3-as-a-clickhouse-disk}

### ディスクの作成 {#creating-a-disk}

ClickHouseの`config.d`ディレクトリに新しいファイルを作成してストレージ構成を保存します。

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

新しく作成したファイルに以下のXMLをコピーし、`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`をデータを保存したいAWSバケットの詳細に置き換えます。

```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>$BUCKET</endpoint>
        <access_key_id>$ACCESS_KEY_ID</access_key_id>
        <secret_access_key>$SECRET_ACCESS_KEY</secret_access_key>
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

S3ディスクの設定をさらに指定する必要がある場合（たとえば、`region`を指定するかカスタムHTTP`header`を送信する場合）、関連設定のリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。

また、次のようにして`access_key_id`と`secret_access_key`を環境変数およびAmazon EC2メタデータから取得しようとすることもできます。

```bash
<use_environment_credentials>true</use_environment_credentials>
```

構成ファイルを作成したら、ファイルの所有者をclickhouseユーザーおよびグループに更新する必要があります。

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

変更を反映させるために、ClickHouseサーバーを再起動できます。

```bash
service clickhouse-server restart
```

## 2. S3にバックアップされたテーブルを作成する {#2-create-a-table-backed-by-s3}

S3ディスクが正しく構成されているか確認するために、テーブルを作成してクエリを試みます。

新しいS3ストレージポリシーを指定してテーブルを作成します。

```sql
CREATE TABLE my_s3_table
  (
    `id` UInt64,
    `column1` String
  )
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main';
```

エンジンとして`S3BackedMergeTree`を指定する必要がなかったことに注意してください。ClickHouseは、テーブルがS3をストレージとして使用していることを検出すると、内部的にエンジンタイプを自動的に変換します。

正しいポリシーでテーブルが作成されたことを示します。

```sql
SHOW CREATE TABLE my_s3_table;
```

次の結果が表示されるはずです。

```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.my_s3_table
(
  `id` UInt64,
  `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

新しいテーブルにいくつかの行を挿入してみましょう。

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

行が挿入されたことを確認しましょう。

```sql
SELECT * FROM my_s3_table;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

AWSコンソールで、データがS3に正常に挿入されていれば、ClickHouseが指定したバケットに新しいファイルを作成したことが確認できるはずです。

すべてが正常に機能すれば、これでストレージとコンピュートが分離されたClickHouseを使用していることになります！

<Image img={s3_bucket_example} size="md" alt="ストレージとコンピュートの分離を使用したS3バケットの例" border/>

## 3. 障害耐性のためのレプリケーションの実装（オプション） {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCSライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる可能性があります。
:::

障害耐性のために、複数のAWSリージョンに分散された複数のClickHouseサーバーノードを使用し、各ノード用にS3バケットを用意することができます。

S3ディスクでのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実行できます。詳細については以下のガイドを参照してください：
- [S3オブジェクトストレージを使用して2つのAWSリージョンにわたる単一シャードのレプリケーション](/integrations/s3#s3-multi-region)。

## さらなる読書 {#further-reading}

- [SharedMergeTreeテーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree発表ブログ](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
