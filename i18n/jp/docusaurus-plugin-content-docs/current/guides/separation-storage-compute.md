---
'sidebar_position': 1
'sidebar_label': 'ストレージとコンピュートの分離'
'slug': '/guides/separation-storage-compute'
'title': 'ストレージとコンピュートの分離'
'description': 'このガイドでは、ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法を探ります。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# ストレージとコンピュートの分離

## 概要 {#overview}

このガイドでは、ClickHouse と S3 を使用して、ストレージとコンピュートが分離されたアーキテクチャを実装する方法を探ります。

ストレージとコンピュートの分離とは、計算リソースとストレージリソースが独立して管理されることを意味します。ClickHouse では、これによりスケーラビリティ、コスト効率、および柔軟性が向上します。必要に応じてストレージとコンピュートリソースを個別にスケールし、パフォーマンスとコストの最適化が可能です。

ClickHouse を S3 バックに使用することは、特に「コールド」データに対するクエリパフォーマンスがそれほど重要でないユースケースにおいて有用です。ClickHouse は、`MergeTree` エンジン用のストレージとして S3 を使用する `S3BackedMergeTree` をサポートしています。このテーブルエンジンにより、ユーザーは S3 のスケーラビリティとコストの利点を活用しながら、`MergeTree` エンジンの挿入およびクエリパフォーマンスを維持できます。

ストレージとコンピュートの分離アーキテクチャの実装と管理は、標準的な ClickHouse のデプロイメントと比べて複雑であることに注意してください。セルフマネージドの ClickHouse は、このガイドで説明するようにストレージとコンピュートの分離を可能にしますが、設定なしでこのアーキテクチャを使用するために [ClickHouse Cloud](https://clickhouse.com/cloud) の利用をお勧めします。このサービスでは、[`SharedMergeTree` テーブルエンジン](/cloud/reference/shared-merge-tree) を使用できます。

*このガイドは、ClickHouse バージョン 22.8 以上を使用していることを前提としています。*

:::warning
AWS/GCS ライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる原因となる可能性があります。
:::

## 1. ClickHouse ディスクとして S3 を使用する {#1-use-s3-as-a-clickhouse-disk}

### ディスクの作成 {#creating-a-disk}

ClickHouse の `config.d` ディレクトリに新しいファイルを作成して、ストレージ構成を保存します：

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

新しく作成したファイルに以下の XML をコピーし、`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY` を、データを保存したい AWS バケットの詳細に置き換えます：

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

S3 ディスクの設定をさらに指定する必要がある場合（たとえば、`region` を指定するか、カスタム HTTP `header` を送信する場合など）、該当する設定のリストは [こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) で見つけることができます。

また、`access_key_id` および `secret_access_key` を以下のように置き換えることができ、環境変数および Amazon EC2 メタデータから資格情報を取得しようとします：

```bash
<use_environment_credentials>true</use_environment_credentials>
```

構成ファイルを作成したら、そのファイルの所有者を clickhouse ユーザーおよびグループに更新する必要があります：

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

ClickHouse サーバーを再起動して、変更を反映させることができます：

```bash
service clickhouse-server restart
```

## 2. S3 バックのテーブルを作成する {#2-create-a-table-backed-by-s3}

S3 ディスクを正しく構成したかどうかをテストするために、テーブルを作成し、クエリを実行してみましょう。

新しい S3 ストレージポリシーを指定してテーブルを作成します：

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

エンジンを `S3BackedMergeTree` と指定する必要はありませんでした。ClickHouse は、ストレージで S3 を使用している場合、自動的にエンジンタイプを内部で変換します。

正しいポリシーでテーブルが作成されたことを示します：

```sql
SHOW CREATE TABLE my_s3_table;
```

以下の結果が表示されるはずです：

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

新しいテーブルにいくつかの行を挿入しましょう：

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

行が挿入されたかどうかを確認しましょう：

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

AWS コンソールで、データが S3 に正常に挿入された場合、指定されたバケットに ClickHouse が新しいファイルを作成したことがわかります。

すべてが正常に動作した場合、これで ClickHouse を使用してストレージとコンピュートが分離された状態になっています！

<Image img={s3_bucket_example} size="md" alt="ストレージとコンピュートの分離を使用した S3 バケットの例" border/>

## 3. フォールトトレランスのためのレプリケーションの実装（オプション） {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
AWS/GCS ライフサイクルポリシーを設定しないでください。これはサポートされておらず、テーブルが壊れる原因となる可能性があります。
:::

フォールトトレランスのために、複数の AWS リージョンに分散された複数の ClickHouse サーバーノードを使用し、各ノードに S3 バケットを用意することができます。

S3 ディスクを使用したレプリケーションは、`ReplicatedMergeTree` テーブルエンジンを使用することで実現可能です。詳細については、以下のガイドを参照してください：
- [S3 オブジェクトストレージを使用して 2 つの AWS リージョンにまたがる単一シャードをレプリケーションする](/integrations/s3#s3-multi-region).

## さらなる読むべきこと {#further-reading}

- [SharedMergeTree テーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 発表ブログ](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
