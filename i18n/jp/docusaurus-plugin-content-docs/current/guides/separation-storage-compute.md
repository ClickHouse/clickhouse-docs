---
sidebar_position: 1
sidebar_label: 'ストレージとコンピュートの分離'
slug: /guides/separation-storage-compute
title: 'ストレージとコンピュートの分離'
description: 'このガイドでは、ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法について説明します。'
doc_type: 'guide'
keywords: ['ストレージ', 'コンピュート', 'アーキテクチャ', 'スケーラビリティ', 'クラウド']
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# ストレージとコンピュートの分離 \{#separation-of-storage-and-compute\}

## 概要 \{#overview\}

このガイドでは、ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法を説明します。

ストレージとコンピュートの分離とは、コンピュートリソースとストレージリソースをそれぞれ独立して管理することを意味します。ClickHouse においては、これによりスケーラビリティ、コスト効率、および柔軟性が向上します。必要に応じてストレージとコンピュートのリソースを個別にスケールできるため、パフォーマンスとコストを最適化できます。

S3 をストレージとして利用する ClickHouse 構成は、「コールド」データに対するクエリ性能がそれほど重要でないユースケースで特に有用です。ClickHouse は、`S3BackedMergeTree` を使用することで、`MergeTree` エンジンのストレージとして S3 を利用することをサポートしています。このテーブルエンジンにより、ユーザーは `MergeTree` エンジンの挿入およびクエリ性能を維持しつつ、S3 のスケーラビリティとコスト面での利点を活用できます。

なお、ストレージとコンピュートを分離したアーキテクチャの実装と運用は、標準的な ClickHouse デプロイメントと比較してより複雑になります。セルフマネージドな ClickHouse では、本ガイドで説明するようにストレージとコンピュートの分離が可能ですが、設定なしでこのアーキテクチャにおける ClickHouse の利用を可能にする [`SharedMergeTree` テーブルエンジン](/cloud/reference/shared-merge-tree) を備えた [ClickHouse Cloud](https://clickhouse.com/cloud) の利用を推奨します。

*このガイドでは、ClickHouse バージョン 22.8 以降を利用していることを前提とします。*

:::warning
AWS/GCS のライフサイクルポリシーは設定しないでください。これはサポートされておらず、テーブル破損の原因となる可能性があります。
:::

## 1. ClickHouse のディスクとして S3 を使用する \{#1-use-s3-as-a-clickhouse-disk\}

### ディスクの作成 \{#creating-a-disk\}

ストレージ構成を定義するために、ClickHouse の `config.d` ディレクトリに新しいファイルを作成します。

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

次のXMLを新しく作成したファイルにコピーし、`BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY` を、データを保存したい AWS バケットの情報に置き換えてください。

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

S3 ディスクの設定をさらに詳細に指定する必要がある場合、たとえば `region` を指定したりカスタム HTTP `header` を送信したりするには、関連する設定の一覧を[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。

また、`access_key_id` と `secret_access_key` を次の設定に置き換えることもでき、この場合は環境変数および Amazon EC2 メタデータから認証情報の取得が試行されます。

```bash
<use_environment_credentials>true</use_environment_credentials>
```

設定ファイルを作成したら、そのファイルの所有者を clickhouse ユーザーおよびグループに変更する必要があります：

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

これで、変更を反映させるために ClickHouse サーバーを再起動できます。

```bash
service clickhouse-server restart
```


## 2. S3 をバックエンドにしたテーブルを作成する \{#2-create-a-table-backed-by-s3\}

S3 ディスクが正しく構成されていることを確認するため、テーブルを作成してクエリを実行してみます。

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

エンジンを `S3BackedMergeTree` と明示的に指定する必要はないことに注意してください。テーブルがストレージとして S3 を使用していると検出すると、ClickHouse は内部的にエンジンタイプを自動的に変換します。

テーブルが正しいポリシーで作成されたことを確認します。

```sql
SHOW CREATE TABLE my_s3_table;
```

次のような結果が表示されます。

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

それでは、新しいテーブルにいくつか行を挿入してみましょう。

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

挿入された行を確認します：

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

AWS コンソールで、データが正常に S3 に書き込まれていれば、指定したバケット内に ClickHouse によって新しいファイルが作成されていることを確認できます。

すべてが正常に動作していれば、これでストレージとコンピュートを分離した構成で ClickHouse を利用できている状態です。

<Image img={s3_bucket_example} size="md" alt="コンピュートとストレージの分離を利用した S3 バケットの例" border />


## 3. フォールトトレランスのためのレプリケーションの実装（オプション） \{#3-implementing-replication-for-fault-tolerance-optional\}

:::warning
AWS/GCS のライフサイクルポリシーは設定しないでください。サポートされておらず、テーブル破損の原因となる可能性があります。
:::

フォールトトレランスを実現するには、複数の AWS リージョンに分散した複数の ClickHouse サーバーノードを使用し、各ノードごとに 1 つの S3 バケットを用意できます。

S3 ディスクを使ったレプリケーションは、`ReplicatedMergeTree` テーブルエンジンを使用することで実現できます。詳細は次のガイドを参照してください。

- [S3 オブジェクトストレージを使用して単一シャードを 2 つの AWS リージョン間でレプリケーションする](/integrations/s3#s3-multi-region)。

## 参考資料 \{#further-reading\}

- [SharedMergeTree テーブルエンジン](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 発表ブログ記事](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)