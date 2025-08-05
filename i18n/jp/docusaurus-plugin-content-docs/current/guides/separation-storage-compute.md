---
sidebar_position: 1
sidebar_label: 'ストレージとコンピューティングの分離'
slug: '/guides/separation-storage-compute'
title: 'Separation of Storage and Compute'
description: 'このガイドでは、ClickHouseとS3を使用して、ストレージとコンピューティングを分離したアーキテクチャを実装する方法について探ります。'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# ストレージとコンピュートの分離

## 概要 {#overview}

このガイドでは、ClickHouseとS3を使用してストレージとコンピュートを分離したアーキテクチャの実装方法を探ります。

ストレージとコンピュートの分離は、計算リソースとストレージリソースが独立して管理されることを意味します。ClickHouseでは、これによりスケーラビリティ、コスト効率、および柔軟性が向上します。必要に応じてストレージとコンピュートリソースを別々にスケールさせることができ、パフォーマンスとコストを最適化できます。

S3をバックエンドとして使用するClickHouseは、「コールド」データに対するクエリパフォーマンスがそれほど重要でないユースケースに特に有用です。ClickHouseは、`MergeTree`エンジンに対してS3をストレージとして使用するためのサポートを提供し、`S3BackedMergeTree`を使用します。このテーブルエンジンを使用することで、ユーザーはS3のスケーラビリティとコストメリットを享受しながら、`MergeTree`エンジンの挿入およびクエリパフォーマンスを維持できます。

ストレージとコンピュートアーキテクチャを実装および管理することは、標準的なClickHouseデプロイメントと比較してより複雑であることに注意してください。セルフマネージドのClickHouseでは、このガイドで説明したようにストレージとコンピュートの分離が可能ですが、設定なしでこのアーキテクチャでClickHouseを使用できる[ClickHouse Cloud](https://clickhouse.com/cloud)の利用をお勧めします。このサービスでは、[`SharedMergeTree`テーブルエンジン](/cloud/reference/shared-merge-tree)を使用します。

*このガイドは、ClickHouseのバージョン22.8以上を使用していることを前提としています。*

:::warning
AWS/GCSのライフサイクルポリシーを構成しないでください。これはサポートされておらず、テーブルが壊れる可能性があります。
:::

## 1. ClickHouseディスクとしてS3を使用する {#1-use-s3-as-a-clickhouse-disk}

### ディスクの作成 {#creating-a-disk}

ClickHouseの`config.d`ディレクトリに新しいファイルを作成して、ストレージ構成を保存します：

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

新しく作成したファイルに以下のXMLをコピーし、`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`をデータを保存したいAWSバケットの詳細に置き換えます：

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

S3ディスクの設定をさらに指定する必要がある場合、たとえば`region`を指定したりカスタムHTTP`header`を送信したりする場合は、関連する設定のリストを[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で見つけることができます。

次のように`access_key_id`と`secret_access_key`を置き換えることもでき、環境変数やAmazon EC2メタデータから認証情報を取得しようとします：

```bash
<use_environment_credentials>true</use_environment_credentials>
```

構成ファイルを作成した後、ファイルの所有者をclickhouseユーザーとグループに更新する必要があります：

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

これで、ClickHouseサーバーを再起動して変更を適用します：

```bash
service clickhouse-server restart
```

## 2. S3によるバックアップテーブルの作成 {#2-create-a-table-backed-by-s3}

S3ディスクが正しく構成されたかをテストするために、テーブルの作成とクエリを試みることができます。

新しいS3ストレージポリシーを指定してテーブルを作成します：

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

`S3BackedMergeTree`としてエンジンを指定する必要がなかったことに注意してください。ClickHouseは、テーブルがS3をストレージとして使用していることを検出すると、エンジンタイプを内部的に自動的に変換します。

テーブルが正しいポリシーで作成されたことを示します：

```sql
SHOW CREATE TABLE my_s3_table;
```

次の結果が表示されるはずです：

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

次に、新しいテーブルにいくつかの行を挿入します：

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

行が挿入されたことを確認しましょう：

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

AWSコンソールで、データがS3に正常に挿入された場合、ClickHouseが指定したバケットに新しいファイルを作成したことが確認できるはずです。

すべてが正常に機能した場合、ClickHouseを使用してストレージとコンピュートを分離した状態になっています！

<Image img={s3_bucket_example} size="md" alt="ストレージとコンピュートの分離使用に関するS3バケットの例" border/>

## 3. フォールトトレランスのためのレプリケーションの実装 (オプション) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCSのライフサイクルポリシーを構成しないでください。これはサポートされておらず、テーブルが壊れる可能性があります。
:::

フォールトトレランスを実現するために、複数のAWSリージョンに分散された複数のClickHouseサーバーノードを使用し、各ノードにS3バケットを持つことができます。

S3ディスクを使用したレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用することで実現できます。詳細については、次のガイドを参照してください：
- [S3オブジェクトストレージを使用して2つのAWSリージョンにまたがる単一シャードのレプリケーション](/integrations/s3#s3-multi-region).

## さらなる情報 {#further-reading}

- [SharedMergeTreeテーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree発表ブログ](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
