---
sidebar_label: "Terraform"
description: "使用 ClickHouse Terraform 提供商以程序化方式管理 ClickPipes 的参考。"
slug: /integrations/clickpipes/programmatic-access/terraform
sidebar_position: 2
title: "ClickPipes Terraform 参考"
doc_type: "reference"
keywords: ["clickpipes", "terraform", "基础设施即代码", "iac", "程序化"]
---

所有类型的 ClickPipes 都可以使用 [ClickHouse Terraform 提供商](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs/resources/clickpipe)中的 `clickhouse_clickpipe` 资源进行创建和管理。本页面介绍提供商的设置，以及每种受支持的 ClickPipe 类型的配置示例。

## 提供商设置 \{#provider-setup\}

:::note
从提供商 **v3.14.0** 版本开始，ClickPipes 支持已正式可用。
如果您使用的是更早的版本，则需要使用 alpha 版本——详情请参阅
[提供商更新日志](https://github.com/ClickHouse/terraform-provider-clickhouse/releases)。
:::

将 ClickHouse 提供商添加到 Terraform 配置中：

```hcl
terraform {
  required_providers {
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = ">= 3.14.0"
    }
  }
}

provider "clickhouse" {
  organization_id = var.organization_id
  token_key       = var.token_key
  token_secret    = var.token_secret
}
```

有关创建供该提供商使用的 API 密钥的说明，请参阅[管理 API 密钥](/cloud/manage/openapi)。

## 资源概览 \{#resource-overview\}

`clickhouse_clickpipe` 资源具有以下顶层参数：

| 参数               | 必需 | 描述                                           |
| ---------------- | -- | -------------------------------------------- |
| `name`           | 是  | ClickPipe 的名称。                               |
| `service_id`     | 是  | ClickHouse Cloud 服务的 ID。                     |
| `source`         | 是  | 源配置 (每个 ClickPipe 仅支持一个 source 块) 。          |
| `destination`    | 是  | 目标端配置。                                       |
| `scaling`        | 否  | 副本数和规格。默认值为 1 个副本。                           |
| `field_mappings` | 否  | 源列与目标端列之间的自定义字段映射。                           |
| `settings`       | 否  | 进阶 ClickPipe 设置。                             |
| `stopped`        | 否  | 设置为 `true` 可在停止状态下创建 ClickPipe。默认值为 `false`。 |

`id` 和 `state` 属性为只读，由 ClickHouse Cloud 在创建后填入。

## 目标端 \{#destination\}

`destination` 块适用于所有数据源类型：

```hcl
destination {
  database      = "default"           # Target database. Defaults to "default".
  table         = "my_table"          # Target table name. Required for all sources except CDC.
  managed_table = true                # Let ClickPipes create and manage the table. Defaults to true.

  table_definition {
    engine {
      type      = "MergeTree"         # MergeTree, ReplacingMergeTree, SummingMergeTree, or Null.
    }
    sorting_key   = ["id", "ts"]      # Optional.
    partition_by  = "toYYYYMM(ts)"    # Optional.
  }

  columns {
    name = "id"
    type = "UInt64"
  }

  columns {
    name = "message"
    type = "String"
  }
}
```

对于 CDC 源 (Postgres、MySQL、MongoDB、BigQuery) ，系统会根据源 schema 自动创建目标表——通常只需提供 `database`。

## 按 ClickPipe 类型分类的示例 \{#examples\}

### Kafka \{#kafka\}

支持的 `type` 取值：`kafka`、`confluent`、`msk`、`azureeventhub`、`redpanda`、`warpstream`。

```hcl
resource "clickhouse_clickpipe" "kafka_clickpipe" {
  name       = "My Kafka ClickPipe"
  service_id = var.service_id

  scaling {
    replicas               = 2
    replica_cpu_millicores = 250
    replica_memory_gb      = 1.0
  }

  source {
    kafka {
      type           = "confluent"
      format         = "JSONEachRow"
      brokers        = "broker.example.com:9092"
      topics         = "my_topic"
      consumer_group = "clickpipes-consumer-group"
      authentication = "PLAIN"

      credentials {
        username = "my_user"
        password = var.kafka_password
      }

      offset {
        strategy = "from_latest"
      }
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }

    columns {
      name = "timestamp"
      type = "DateTime"
    }
  }
}
```

#### 带有 schema 注册表的 Kafka \{#kafka-schema-registry\}

```hcl
resource "clickhouse_clickpipe" "kafka_avro_clickpipe" {
  name       = "My Kafka Avro ClickPipe"
  service_id = var.service_id

  source {
    kafka {
      type   = "confluent"
      format = "AvroConfluent"
      brokers = "broker.example.com:9092"
      topics  = "my_avro_topic"

      credentials {
        username = "my_user"
        password = var.kafka_password
      }

      schema_registry {
        url            = "https://schema-registry.example.com"
        authentication = "PLAIN"

        credentials {
          username = "sr_user"
          password = var.schema_registry_password
        }
      }
    }
  }

  destination {
    table         = "my_avro_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "event"
      type = "String"
    }
  }
}
```

### Amazon Kinesis \{#kinesis\}

```hcl
resource "clickhouse_clickpipe" "kinesis_clickpipe" {
  name       = "My Kinesis ClickPipe"
  service_id = var.service_id

  source {
    kinesis {
      format         = "JSONEachRow"
      stream_name    = "my-stream"
      region         = "us-east-1"
      iterator_type  = "TRIM_HORIZON"
      authentication = "IAM_USER"

      access_key {
        access_key_id = var.aws_access_key_id
        secret_key    = var.aws_secret_key
      }
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }
  }
}
```

#### 使用 IAM role 的 Kinesis \{#kinesis-iam-role\}

IAM role 身份验证需要在 AWS 上运行的 ClickHouse 服务。

```hcl
resource "clickhouse_clickpipe" "kinesis_iam_role_clickpipe" {
  name       = "My Kinesis ClickPipe (IAM Role)"
  service_id = var.service_id

  source {
    kinesis {
      format         = "JSONEachRow"
      stream_name    = "my-stream"
      region         = "us-east-1"
      iterator_type  = "LATEST"
      authentication = "IAM_ROLE"
      iam_role       = "arn:aws:iam::123456789012:role/my-kinesis-role"
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }
  }
}
```

### 亚马逊 S3 \{#s3\}

```hcl
resource "clickhouse_clickpipe" "s3_clickpipe" {
  name       = "My S3 ClickPipe"
  service_id = var.service_id

  source {
    object_storage {
      type           = "s3"
      url            = "https://my-bucket.s3.amazonaws.com/data/*.json"
      format         = "JSONEachRow"
      authentication = "IAM_USER"

      access_key {
        access_key_id = var.aws_access_key_id
        secret_key    = var.aws_secret_key
      }
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }
  }
}
```

#### 通过 SQS 对 S3 进行持续摄取 \{#s3-continuous\}

如需使用 SQS 队列 (无序模式) 进行持续摄取，请参见[配置无序模式](/integrations/clickpipes/object-storage/s3/unordered-mode)了解设置说明。

```hcl
resource "clickhouse_clickpipe" "s3_continuous_clickpipe" {
  name       = "My S3 Continuous ClickPipe"
  service_id = var.service_id

  source {
    object_storage {
      type           = "s3"
      url            = "https://my-bucket.s3.amazonaws.com/data/*.json"
      format         = "JSONEachRow"
      is_continuous  = true
      queue_url      = "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue"
      authentication = "IAM_USER"

      access_key {
        access_key_id = var.aws_access_key_id
        secret_key    = var.aws_secret_key
      }
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }
  }
}
```

### Google Cloud Storage \{#gcs\}

`service_account_key` 必须为经过 Base64 编码的 GCP 服务账户 JSON 密钥文件内容。

```hcl
resource "clickhouse_clickpipe" "gcs_clickpipe" {
  name       = "My GCS ClickPipe"
  service_id = var.service_id

  source {
    object_storage {
      type                = "gcs"
      url                 = "gs://my-bucket/data/*.json"
      format              = "JSONEachRow"
      authentication      = "SERVICE_ACCOUNT"
      service_account_key = var.gcs_service_account_key
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }
  }
}
```

### Azure Blob Storage \{#abs\}

```hcl
resource "clickhouse_clickpipe" "abs_clickpipe" {
  name       = "My Azure Blob ClickPipe"
  service_id = var.service_id

  source {
    object_storage {
      type                 = "azureblobstorage"
      azure_container_name = "my-container"
      path                 = "data/*.json"
      format               = "JSONEachRow"
      authentication       = "CONNECTION_STRING"
      connection_string    = var.azure_connection_string
    }
  }

  destination {
    table         = "my_table"
    managed_table = true

    table_definition {
      engine {
        type = "MergeTree"
      }
    }

    columns {
      name = "id"
      type = "UInt64"
    }

    columns {
      name = "message"
      type = "String"
    }
  }
}
```

### Postgres CDC \{#postgres\}

```hcl
resource "clickhouse_clickpipe" "postgres_cdc_clickpipe" {
  name       = "My Postgres CDC ClickPipe"
  service_id = var.service_id

  source {
    postgres {
      host     = "postgres.example.com"
      port     = 5432
      database = "mydb"

      credentials {
        username = "postgres_user"
        password = var.postgres_password
      }

      settings {
        replication_mode = "cdc"

        # Optional settings
        sync_interval_seconds              = 60
        pull_batch_size                    = 100000
        allow_nullable_columns             = true
        initial_load_parallelism           = 4
        snapshot_num_rows_per_partition    = 100000
        snapshot_number_of_parallel_tables = 1
      }

      table_mappings {
        source_schema_name = "public"
        source_table       = "users"
        target_table       = "public_users"
      }

      table_mappings {
        source_schema_name = "public"
        source_table       = "orders"
        target_table       = "public_orders"

        # Optional
        excluded_columns       = ["internal_notes"]
        use_custom_sorting_key = true
        sorting_keys           = ["id", "created_at"]
        table_engine           = "ReplacingMergeTree"
      }
    }
  }

  destination {
    database = "default"
  }
}
```

#### 使用 IAM role 的 Postgres \{#postgres-iam-role\}

要使用 IAM role 身份验证，需要有一个运行在 AWS 上的 ClickHouse 服务。

```hcl
resource "clickhouse_clickpipe" "postgres_iam_role_clickpipe" {
  name       = "My Postgres CDC ClickPipe (IAM Role)"
  service_id = var.service_id

  source {
    postgres {
      host           = "mydb.cluster.us-east-1.rds.amazonaws.com"
      port           = 5432
      database       = "mydb"
      type           = "rdspostgres"
      authentication = "iam_role"
      iam_role       = "arn:aws:iam::123456789012:role/my-rds-role"

      credentials {
        username = "postgres_user"
      }

      settings {
        replication_mode = "cdc"
      }

      table_mappings {
        source_schema_name = "public"
        source_table       = "orders"
        target_table       = "public_orders"
      }
    }
  }

  destination {
    database = "default"
  }
}
```

### MySQL CDC \{#mysql\}

```hcl
resource "clickhouse_clickpipe" "mysql_cdc_clickpipe" {
  name       = "My MySQL CDC ClickPipe"
  service_id = var.service_id

  source {
    mysql {
      host = "mysql.example.com"
      port = 3306
      type = "mysql"

      credentials {
        username = "mysql_user"
        password = var.mysql_password
      }

      settings {
        replication_mode = "cdc"

        # Optional settings
        sync_interval_seconds              = 30
        pull_batch_size                    = 10000
        allow_nullable_columns             = true
        initial_load_parallelism           = 4
        snapshot_num_rows_per_partition    = 100000
        snapshot_number_of_parallel_tables = 2
      }

      table_mappings {
        source_schema_name = "mydb"
        source_table       = "orders"
        target_table       = "mydb_orders"
      }

      table_mappings {
        source_schema_name = "mydb"
        source_table       = "customers"
        target_table       = "mydb_customers"

        # Optional
        excluded_columns       = ["password_hash"]
        use_custom_sorting_key = true
        sorting_keys           = ["id"]
        table_engine           = "ReplacingMergeTree"
      }
    }
  }

  destination {
    database = "default"
  }
}
```

### MongoDB CDC \{#mongodb\}

```hcl
resource "clickhouse_clickpipe" "mongodb_cdc_clickpipe" {
  name       = "My MongoDB CDC ClickPipe"
  service_id = var.service_id

  source {
    mongodb {
      uri             = "mongodb+srv://cluster0.example.mongodb.net"
      read_preference = "secondaryPreferred"

      credentials {
        username = "mongo_user"
        password = var.mongodb_password
      }

      settings {
        replication_mode = "cdc"

        # Optional settings
        sync_interval_seconds              = 30
        pull_batch_size                    = 500
        snapshot_num_rows_per_partition    = 100000
        snapshot_number_of_parallel_tables = 2
      }

      table_mappings {
        source_database_name = "mydb"
        source_collection    = "users"
        target_table         = "mydb_users"
      }

      table_mappings {
        source_database_name = "mydb"
        source_collection    = "orders"
        target_table         = "mydb_orders"
        table_engine         = "ReplacingMergeTree"
      }
    }
  }

  destination {
    database = "default"
  }
}
```

### BigQuery \{#bigquery\}

`service_account_file` 必须为经过 Base64 编码的 GCP 服务账户 JSON 密钥文件内容。

```hcl
resource "clickhouse_clickpipe" "bigquery_snapshot_clickpipe" {
  name       = "My BigQuery ClickPipe"
  service_id = var.service_id

  source {
    bigquery {
      snapshot_staging_path = "gs://my-staging-bucket/staging/"

      credentials {
        service_account_file = var.gcp_service_account_key
      }

      settings {
        replication_mode = "snapshot"

        # Optional settings
        initial_load_parallelism           = 4
        snapshot_num_rows_per_partition    = 100000
        snapshot_number_of_parallel_tables = 2
        allow_nullable_columns             = true
      }

      table_mappings {
        source_dataset_name = "my_dataset"
        source_table        = "my_table"
        target_table        = "my_bigquery_table"
      }

      table_mappings {
        source_dataset_name    = "my_dataset"
        source_table           = "another_table"
        target_table           = "another_bigquery_table"
        table_engine           = "ReplacingMergeTree"
        use_custom_sorting_key = true
        sorting_keys           = ["id"]
        excluded_columns       = ["internal_col"]
      }
    }
  }

  destination {
    database = "default"
  }
}
```

## 扩缩容 \{#scaling\}

所有 ClickPipe 类型都支持通过 `scaling` 块配置副本数量及其资源分配：

```hcl
scaling {
  replicas               = 2     # Default: 1. Maximum: 10.
  replica_cpu_millicores = 500   # Between 125 and 2000.
  replica_memory_gb      = 2.0   # Between 0.5 and 8.0.
}
```

## 导入现有 ClickPipes \{#import\}

现有的 ClickPipes 可使用 service ID 和 ClickPipe ID 导入到 Terraform state 中：

```bash
terraform import clickhouse_clickpipe.example <service_id>:<clickpipe_id>
```