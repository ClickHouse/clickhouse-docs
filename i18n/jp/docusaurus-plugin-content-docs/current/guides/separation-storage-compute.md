---
sidebar_position: 1
sidebar_label: 'ストレージとコンピュートの分離'
slug: /guides/separation-storage-compute
title: 'ストレージとコンピュートの分離'
description: 'このガイドでは、ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャをどのように実装できるかを解説します。'
doc_type: 'guide'
keywords: ['storage', 'compute', 'architecture', 'scalability', 'cloud']
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# ストレージとコンピュートの分離



## 概要 {#overview}

本ガイドでは、ClickHouseとS3を使用してストレージとコンピュートを分離したアーキテクチャを実装する方法について説明します。

ストレージとコンピュートの分離とは、コンピューティングリソースとストレージリソースを独立して管理することを意味します。ClickHouseでは、これによりスケーラビリティ、コスト効率、柔軟性が向上します。必要に応じてストレージとコンピュートリソースを個別にスケールし、パフォーマンスとコストを最適化できます。

S3をバックエンドとするClickHouseの使用は、「コールド」データに対するクエリパフォーマンスがそれほど重要でないユースケースで特に有用です。ClickHouseは、`S3BackedMergeTree`を使用して`MergeTree`エンジンのストレージとしてS3を使用することをサポートしています。このテーブルエンジンにより、ユーザーは`MergeTree`エンジンの挿入およびクエリパフォーマンスを維持しながら、S3のスケーラビリティとコストメリットを活用できます。

ストレージとコンピュートを分離したアーキテクチャの実装と管理は、標準的なClickHouseデプロイメントと比較してより複雑であることに注意してください。セルフマネージドのClickHouseでは本ガイドで説明するようにストレージとコンピュートの分離が可能ですが、[ClickHouse Cloud](https://clickhouse.com/cloud)の使用を推奨します。ClickHouse Cloudでは、[`SharedMergeTree`テーブルエンジン](/cloud/reference/shared-merge-tree)を使用することで、設定なしでこのアーキテクチャでClickHouseを利用できます。

_本ガイドは、ClickHouseバージョン22.8以降を使用していることを前提としています。_

:::warning
AWS/GCSのライフサイクルポリシーは設定しないでください。これはサポートされておらず、テーブルの破損につながる可能性があります。
:::


## 1. S3をClickHouseディスクとして使用する {#1-use-s3-as-a-clickhouse-disk}

### ディスクの作成 {#creating-a-disk}

ストレージ設定を保存するために、ClickHouseの`config.d`ディレクトリに新しいファイルを作成します:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

以下のXMLを新しく作成したファイルにコピーし、`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`をデータを保存するAWSバケットの詳細情報に置き換えます:

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

S3ディスクの設定をさらに指定する必要がある場合(例えば`region`の指定やカスタムHTTP `header`の送信など)、関連する設定のリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。

また、`access_key_id`と`secret_access_key`を以下の設定に置き換えることもできます。これにより、環境変数とAmazon EC2メタデータから認証情報の取得を試みます:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

設定ファイルを作成した後、ファイルの所有者をclickhouseユーザーとグループに変更する必要があります:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

変更を有効にするために、ClickHouseサーバーを再起動します:

```bash
service clickhouse-server restart
```


## 2. S3をバックエンドとするテーブルの作成 {#2-create-a-table-backed-by-s3}

S3ディスクが正しく設定されているかを確認するため、テーブルを作成してクエリを実行してみます。

新しいS3ストレージポリシーを指定してテーブルを作成します:

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

エンジンを`S3BackedMergeTree`として指定する必要はありません。ClickHouseは、テーブルがストレージにS3を使用していることを検出すると、内部的にエンジンタイプを自動変換します。

テーブルが正しいポリシーで作成されたことを確認します:

```sql
SHOW CREATE TABLE my_s3_table;
```

次の結果が表示されます:

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

それでは、新しいテーブルにいくつかの行を挿入してみましょう:

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

行が挿入されたことを確認しましょう:

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

AWSコンソールで、データがS3に正常に挿入された場合、ClickHouseが指定したバケット内に新しいファイルを作成したことを確認できます。

すべてが正常に動作した場合、ストレージとコンピュートを分離したClickHouseの使用が完了しました!

<Image
  img={s3_bucket_example}
  size='md'
  alt='コンピュートとストレージの分離を使用したS3バケットの例'
  border
/>


## 3. フォールトトレランスのためのレプリケーションの実装(オプション) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCSのライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが破損する可能性があります。
:::

フォールトトレランスを実現するには、複数のAWSリージョンに分散配置された複数のClickHouseサーバーノードを使用し、各ノードにS3バケットを割り当てます。

S3ディスクを使用したレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実現できます。詳細については、以下のガイドを参照してください:

- [S3オブジェクトストレージを使用した2つのAWSリージョン間での単一シャードのレプリケーション](/integrations/s3#s3-multi-region)


## 関連資料 {#further-reading}

- [SharedMergeTreeテーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree発表ブログ](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
