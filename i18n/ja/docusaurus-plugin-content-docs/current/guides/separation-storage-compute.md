---
sidebar_position: 1
sidebar_label: ストレージとコンピュートの分離
slug: /guides/separation-storage-compute
---
import BucketDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';

# ストレージとコンピュートの分離

## 概要 {#overview}

このガイドでは、ClickHouseとS3を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法について説明します。

ストレージとコンピュートの分離とは、コンピューティングリソースとストレージリソースが独立して管理されることを意味します。ClickHouseでは、これによりスケーラビリティ、コスト効率、柔軟性が向上します。必要に応じてストレージとコンピュートリソースを別々にスケールアップでき、パフォーマンスとコストを最適化できます。

ClickHouseをS3でバックアップすることは、「コールド」データに対するクエリパフォーマンスがそれほど重要でないユースケースに特に有用です。ClickHouseは、`MergeTree`エンジン用のストレージとしてS3を使用するための`S3BackedMergeTree`をサポートしています。このテーブルエンジンにより、ユーザーはS3のスケーラビリティとコストの利点を活用しながら、`MergeTree`エンジンの挿入およびクエリパフォーマンスを維持できます。

ストレージとコンピュートの分離アーキテクチャを実装および管理することは、標準的なClickHouseデプロイメントよりも複雑であることに注意してください。このガイドで説明したように、セルフマネージドのClickHouseはストレージとコンピュートの分離を可能にしますが、設定なしにこのアーキテクチャでClickHouseを使用できる[ClickHouse Cloud](https://clickhouse.com/cloud)の利用をお勧めします。これには[`SharedMergeTree`テーブルエンジン](/cloud/reference/shared-merge-tree)を使用します。

*このガイドでは、ClickHouseバージョン22.8以上を使用していることを前提としています。*

:::warning
AWS/GCSライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる原因となる可能性があります。
:::

## 1. S3をClickHouseディスクとして使用する {#1-use-s3-as-a-clickhouse-disk}

### ディスクの作成 {#creating-a-disk}

ClickHouseの`config.d`ディレクトリ内に、新しいストレージ設定を格納するためのファイルを作成します。

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

新しく作成したファイルに以下のXMLをコピーし、`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`をデータを格納したいAWSバケットの詳細に置き換えます。

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

S3ディスクの設定をさらに指定する必要がある場合（たとえば、`region`を指定する、またはカスタムHTTP`header`を送信する場合）、関連設定のリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で見つけることができます。

以下のように`access_key_id`と`secret_access_key`を置き換えることもでき、環境変数やAmazon EC2メタデータから資格情報を取得しようとします。

```bash
<use_environment_credentials>true</use_environment_credentials>
```

設定ファイルを作成したら、ファイルの所有者をclickhouseユーザーおよびグループに更新する必要があります。

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

変更を有効にするために、ClickHouseサーバーを再起動できます。

```bash
service clickhouse-server restart
```

## 2. S3にバックアップされたテーブルの作成 {#2-create-a-table-backed-by-s3}

S3ディスクが正しく設定されていることを確認するために、テーブルを作成してクエリを実行してみます。

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

エンジンとして`S3BackedMergeTree`を指定する必要はありません。ClickHouseは、テーブルがS3をストレージとして使用していると検出した場合、エンジンタイプを内部で自動的に変換します。

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

新しいテーブルに行を挿入してみましょう。

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

行が挿入されたことを確認します。

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

AWSコンソールで、データがS3に正常に挿入された場合、ClickHouseが指定されたバケットに新しいファイルを作成したことがわかります。

すべてが正常に動作した場合、ストレージとコンピュートを分離したClickHouseを使用していることになります！

![ストレージとコンピュートの分離を使用したS3バケットの例](./images/s3_bucket_example.png)

## 3. 障害耐性のためのレプリケーションの実装（オプション） {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCSライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる原因となる可能性があります。
:::

障害耐性を持たせるために、複数のAWSリージョンに分散された複数のClickHouseサーバーノードを使用し、各ノードにS3バケットを用意できます。

S3ディスクでのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実現できます。詳細については、以下のガイドをご覧ください：
- [S3オブジェクトストレージを使用して二つのAWSリージョン間で単一シャードをレプリケートする](/integrations/s3#s3-multi-region).

## さらに読む {#further-reading}

- [SharedMergeTreeテーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree発表ブログ](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
