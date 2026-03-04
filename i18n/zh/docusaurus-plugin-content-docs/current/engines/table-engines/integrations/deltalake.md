---
description: '此引擎为 Amazon S3 中现有的 Delta Lake 表提供只读集成。'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'DeltaLake 表引擎'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delta Lake 表引擎 \{#deltalake-table-engine\}

此引擎与 S3、GCP 和 Azure 存储中现有的 [Delta Lake](https://github.com/delta-io/delta) 表进行集成，并支持读写（自 v25.10 起）。

## 创建 DeltaLake 表 \{#create-table\}

要创建 DeltaLake 表，目标表必须已预先存在于 S3、GCP 或 Azure 存储中。下面的命令不支持通过 DDL 参数创建新表。

<Tabs>
  <TabItem value="S3" label="S3" default>
    **语法**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
    ```

    **引擎参数**

    * `url` — 指向已有 Delta Lake 表的存储桶 URL（包含路径）。
    * `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) 账户用户的长期凭证。可使用这些参数对请求进行身份验证。该参数为可选项。如果未指定凭证，将使用配置文件中的凭证。

    可以使用[命名集合](/operations/named-collections.md)来指定引擎参数。

    **示例**

    ```sql
    CREATE TABLE deltalake
    ENGINE = DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
    ```

    使用命名集合：

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
    **语法**

    ```sql
    -- 推荐使用 HTTPS URL
    CREATE TABLE table_name
    ENGINE = DeltaLake('https://storage.googleapis.com/<bucket>/<path>/', '<access_key_id>', '<secret_access_key>')
    ```

    :::note[不支持的 gsutil URI]
    不支持 `gs://clickhouse-docs-example-bucket` 这类 gsutil URI，请使用以 `https://storage.googleapis.com` 开头的 URL。
    :::

    **参数**

    * `url` — 指向 Delta Lake 表的 GCS bucket URL。必须使用 `https://storage.googleapis.com/<bucket>/<path>/`
      格式（GCS XML API 端点），或者使用会被自动转换的 `gs://<bucket>/<path>/`。
    * `access_key_id` — GCS Access Key。可通过 Google Cloud Console → Cloud Storage → Settings → Interoperability 创建。
    * `secret_access_key` — GCS 密钥。

    **命名集合**

    也可以使用命名集合。
    例如：

    ```sql
    CREATE NAMED COLLECTION gcs_creds AS
    access_key_id = '<access_key>',
    secret_access_key = '<secret>';

    CREATE TABLE gcpDeltaLake
    ENGINE = DeltaLake(gcs_creds, url = 'https://storage.googleapis.com/<bucket>/<path>')
    ```
  </TabItem>

  <TabItem value="Azure" label="Azure" default>
    **语法**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    ```

    **参数**

    * `connection_string` — Azure 连接字符串
    * `storage_account_url` — Azure 存储账户 URL（例如：https://account.blob.core.windows.net）
    * `container_name` — Azure 容器名称
    * `blobpath` — 容器内 Delta Lake 表的路径
    * `account_name` — Azure 存储账户名称
    * `account_key` — Azure 存储账户密钥
  </TabItem>
</Tabs>

## 使用 DeltaLake 表写入数据 \{#insert-data\}

使用 DeltaLake 表引擎创建表之后，就可以使用以下语句插入数据：

```sql
SET allow_experimental_delta_lake_writes = 1;

INSERT INTO deltalake(id, firstname, lastname, gender, age)
VALUES (1, 'John', 'Smith', 'M', 32);
```

:::note
通过表引擎进行写入仅支持通过 delta kernel。
目前尚不支持写入 Azure，但已支持写入 S3 和 GCS。
:::

### 数据缓存 \{#data-cache\}

`DeltaLake` 表引擎和表函数支持与 `S3`、`AzureBlobStorage`、`HDFS` 存储相同的数据缓存机制。有关更多详细信息，请参阅[“S3 表引擎”](../../../engines/table-engines/integrations/s3.md#data-cache)。

## 另请参阅 \{#see-also\}

* [DeltaLake 表函数](../../../sql-reference/table-functions/deltalake.md)