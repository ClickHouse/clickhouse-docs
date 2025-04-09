---
sidebar_position: 1
sidebar_label: ストレージとコンピュートの分離
slug: /guides/separation-storage-compute
---
import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# ストレージとコンピュートの分離

## 概要 {#overview}

このガイドでは、ClickHouseとS3を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法を探ります。

ストレージとコンピュートの分離とは、計算リソースとストレージリソースを独立して管理することを意味します。ClickHouseでは、これによりスケーラビリティ、コスト効率、柔軟性が向上します。ストレージとコンピュートリソースを必要に応じて個別にスケールさせ、パフォーマンスとコストの最適化を図ることができます。

ClickHouseをS3でバックアップすることは、「コールド」データに対するクエリパフォーマンスがそれほど重要でないユースケースに特に有用です。ClickHouseは、`MergeTree`エンジン用のストレージとしてS3を使用するための`S3BackedMergeTree`をサポートしています。このテーブルエンジンにより、ユーザーはS3のスケーラビリティとコストの利点を享受しながら、`MergeTree`エンジンの挿入およびクエリパフォーマンスを維持できます。

ストレージとコンピュートの分離アーキテクチャを実装および管理することは、標準的なClickHouseデプロイよりも複雑であることに注意してください。セルフマネージドのClickHouseでは、本ガイドで説明されているストレージとコンピュートの分離が可能ですが、設定なしでこのアーキテクチャでClickHouseを使用できる[ClickHouse Cloud](https://clickhouse.com/cloud)の使用をお勧めします。これにより、[`SharedMergeTree`テーブルエンジン](/cloud/reference/shared-merge-tree)を使用することができます。

*このガイドでは、ClickHouseのバージョン22.8以上を使用していることを前提としています。*

:::warning
AWS/GCSライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる可能性があります。
:::

## 1. S3をClickHouseディスクとして使用する {#1-use-s3-as-a-clickhouse-disk}

### ディスクの作成 {#creating-a-disk}

ストレージ設定を保存するために、ClickHouseの`config.d`ディレクトリに新しいファイルを作成します:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

新しく作成したファイルに以下のXMLをコピーし、データを保存したいAWSバケットの詳細情報で`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`を置き換えます:

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

S3ディスクに関してさらなる設定（例えば`region`を指定したり、カスタムHTTP`header`を送信するための設定）が必要な場合、関連する設定のリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。

また、`access_key_id`と`secret_access_key`を以下のように置き換えることもでき、これにより環境変数とAmazon EC2メタデータから資格情報を取得しようとします:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

設定ファイルを作成したら、ファイルのオーナーをclickhouseユーザーとグループに更新する必要があります:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

変更を有効にするために、ClickHouseサーバーを再起動できます:

```bash
service clickhouse-server restart
```

## 2. S3バックアップのテーブルを作成する {#2-create-a-table-backed-by-s3}

S3ディスクが正しく設定されたかどうかを確認するために、テーブルを作成してクエリを試してみましょう。

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

エンジンを`S3BackedMergeTree`として指定する必要はありません。ClickHouseは、テーブルがS3をストレージとして使用していると検出すると、エンジンタイプを内部的に自動変換します。

正しいポリシーでテーブルが作成されたことを確認します:

```sql
SHOW CREATE TABLE my_s3_table;
```

次のような結果が表示されるはずです:

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

次に、新しいテーブルにいくつかの行を挿入しましょう:

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

AWSコンソールで、データがS3に正常に挿入されていれば、ClickHouseが指定したバケットに新しいファイルを作成しているのが見えるはずです。

すべてが成功した場合、あなたは今、ストレージとコンピュートを分離したClickHouseを使用しています！

<img src={s3_bucket_example}
    alt="ストレージとコンピュートの分離を使用したS3バケットの例"
    class="image"
/>

## 3. 障害耐性のためのレプリケーションの実装 (オプション) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCSライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる可能性があります。
:::

障害耐性のために、複数のAWSリージョンに分散された複数のClickHouseサーバーノードを使用し、各ノードにS3バケットを持つことができます。

S3ディスクによるレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用することで実現できます。詳細については、以下のガイドを参照してください:
- [S3オブジェクトストレージを使用して2つのAWSリージョンに単一のシャードをレプリケートする](/integrations/s3#s3-multi-region).

## さらなる読み物 {#further-reading}

- [SharedMergeTreeテーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree発表ブログ](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
