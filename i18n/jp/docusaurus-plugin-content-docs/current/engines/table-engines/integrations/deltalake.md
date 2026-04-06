---
description: 'このエンジンは、Amazon S3 上にある既存の Delta Lake テーブルへの読み取り専用統合を提供します。'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'DeltaLake テーブルエンジン'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# DeltaLake テーブルエンジン \{#deltalake-table-engine\}

このエンジンは、S3、GCP および Azure のストレージ上に存在する既存の [Delta Lake](https://github.com/delta-io/delta) テーブルとの連携を提供し、読み取りと書き込みの両方をサポートします（v25.10 から）。

## DeltaLake テーブルを作成する \{#create-table\}

DeltaLake テーブルを作成するには、事前に S3、GCP、または Azure ストレージ上にテーブルが存在している必要があります。このコマンドでは新しいテーブルを作成するための DDL パラメータは指定できません。

<Tabs>
  <TabItem value="S3" label="S3" default>
    **構文**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,] [extra_credentials])
    ```

    **エンジンパラメータ**

    * `url` — 既存の Delta Lake テーブルへのパスを含むバケットの URL。
    * `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) アカウントユーザーの長期的に有効な認証情報。リクエストの認証に使用できます。パラメータは省略可能です。認証情報が指定されていない場合は、設定ファイルで指定されたものが使用されます。
    * `extra_credentials` - 省略可能。ClickHouse Cloud でロールベースのアクセスに使用する `role_arn` を渡すために使用します。設定手順については [Secure S3](/cloud/data-sources/secure-s3) を参照してください。

    エンジンパラメータは [Named Collections](/operations/named-collections.md) を使用して指定できます。

    **例**

    ```sql
    CREATE TABLE deltalake
    ENGINE = DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
    ```

    名前付きコレクションの使用:

    ```xml
    <clickhouse>
        <named_collections>
            <deltalake_conf>
                <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
                <access_key_id>ABC123<access_key_id>
                <secret_access_key>Abc+123</secret_access_key>
            </deltalake_conf>
        </named_collections>
    </clickhouse>
    ```

    ```sql
    CREATE TABLE deltalake
    ENGINE = DeltaLake(deltalake_conf, filename = 'test_table')
    ```
  </TabItem>

  <TabItem value="GCP" label="GCP" default>
    **構文**

    ```sql
    -- HTTPS URL を使用する（推奨）
    CREATE TABLE table_name
    ENGINE = DeltaLake('https://storage.googleapis.com/<bucket>/<path>/', '<access_key_id>', '<secret_access_key>')
    ```

    :::note[サポートされない gsutil URI]
    `gs://clickhouse-docs-example-bucket` のような gsutil URI はサポートされません。`https://storage.googleapis.com` で始まる URL を使用してください。
    :::

    **引数**

    * `url` — Delta Lake テーブルへの GCS バケット URL。`https://storage.googleapis.com/<bucket>/<path>/`
      形式 (GCS XML API エンドポイント) を使用する必要があります。または `gs://<bucket>/<path>/` を指定すると自動変換されます。
    * `access_key_id` — GCS Access Key。Google Cloud Console → Cloud Storage → Settings → Interoperability から作成します。
    * `secret_access_key` — GCS のシークレット。

    **名前付きコレクション**

    名前付きコレクションを使用することもできます。
    例:

    ```sql
    CREATE NAMED COLLECTION gcs_creds AS
    access_key_id = '<access_key>',
    secret_access_key = '<secret>';

    CREATE TABLE gcpDeltaLake
    ENGINE = DeltaLake(gcs_creds, url = 'https://storage.googleapis.com/<bucket>/<path>')
    ```
  </TabItem>

  <TabItem value="Azure" label="Azure" default>
    **構文**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    ```

    **引数**

    * `connection_string` — Azure 接続文字列
    * `storage_account_url` — Azure ストレージアカウントの URL (例: https://account.blob.core.windows.net) 
    * `container_name` — Azure コンテナー名
    * `blobpath` — コンテナー内の Delta Lake テーブルへのパス
    * `account_name` — Azure ストレージアカウント名
    * `account_key` — Azure ストレージアカウントキー
  </TabItem>
</Tabs>

## DeltaLake テーブルを使用したデータ書き込み \{#insert-data\}

DeltaLake テーブルエンジンを使用してテーブルを作成したら、次の方法でデータを挿入できます。

```sql
SET allow_experimental_delta_lake_writes = 1;

INSERT INTO deltalake(id, firstname, lastname, gender, age)
VALUES (1, 'John', 'Smith', 'M', 32);
```

:::note
テーブルエンジンを使用した書き込みは、delta kernel を経由する場合にのみサポートされています。
Azure への書き込みはまだサポートされていませんが、S3 および GCS への書き込みはサポートされています。
:::


### データキャッシュ \{#data-cache\}

`DeltaLake` テーブルエンジンおよびテーブル関数は、`S3`、`AzureBlobStorage`、`HDFS` ストレージと同様に、データキャッシュをサポートします。詳細は「[S3 table engine](../../../engines/table-engines/integrations/s3.md#data-cache)」を参照してください。

## 関連項目 \{#see-also\}

- [deltaLake テーブル関数](../../../sql-reference/table-functions/deltalake.md)