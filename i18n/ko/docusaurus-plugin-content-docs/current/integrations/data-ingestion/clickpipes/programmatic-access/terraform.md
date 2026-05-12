---
sidebar_label: "Terraform"
description: "ClickHouse Terraform 프로바이더를 사용하여 ClickPipes를 프로그래밍 방식으로 관리하기 위한 참조 문서입니다."
slug: /integrations/clickpipes/programmatic-access/terraform
sidebar_position: 2
title: "ClickPipes Terraform 참조"
doc_type: "reference"
keywords: ["clickpipes", "terraform", "infrastructure as code", "iac", "programmatic"]
---

모든 ClickPipes 타입은 [ClickHouse Terraform 프로바이더](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs/resources/clickpipe)의 `clickhouse_clickpipe` 리소스를 사용하여 생성하고 관리할 수 있습니다. 이 페이지에서는 지원되는 각 ClickPipe 타입별 프로바이더 설정과 구성 예시를 설명합니다.

## 프로바이더 설정 \{#provider-setup\}

:::note
ClickPipes 지원은 프로바이더 버전 **v3.14.0**부터 일반 제공됩니다.
이보다 이전 버전을 사용하는 경우 alpha 릴리스가 필요합니다. 자세한 내용은
[프로바이더 changelog](https://github.com/ClickHouse/terraform-provider-clickhouse/releases)를
확인하십시오.
:::

Terraform 설정에 ClickHouse 프로바이더를 추가하십시오:

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

프로바이더에서 사용할 API 키를 생성하는 방법은 [API 키 관리](/cloud/manage/openapi)를 참조하십시오.

## 리소스 개요 \{#resource-overview\}

`clickhouse_clickpipe` 리소스에는 다음과 같은 최상위 인수가 있습니다:

| 인수               | 필수  | 설명                                                       |
| ---------------- | --- | -------------------------------------------------------- |
| `name`           | Yes | ClickPipe의 이름입니다.                                        |
| `service_id`     | Yes | ClickHouse Cloud 서비스의 ID입니다.                             |
| `source`         | Yes | 소스 설정입니다(ClickPipe당 소스 블록 1개).                           |
| `destination`    | Yes | 대상 설정입니다.                                                |
| `scaling`        | No  | 레플리카 수와 크기입니다. 기본값은 레플리카 1개입니다.                          |
| `field_mappings` | No  | 소스 컬럼과 대상 컬럼 간의 사용자 지정 필드 대응입니다.                         |
| `settings`       | No  | ClickPipe의 고급 설정입니다.                                     |
| `stopped`        | No  | ClickPipe를 중지된 상태로 생성하려면 `true`로 설정합니다. 기본값은 `false`입니다. |

`id` 및 `state` 속성은 읽기 전용이며, 생성 후 ClickHouse Cloud에서 채워집니다.

## 대상 \{#destination\}

`destination` 블록은 모든 소스 타입에 공통으로 적용됩니다:

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

CDC 소스(Postgres, MySQL, MongoDB, BigQuery)에서는 소스 schema를 기반으로 대상 테이블이 자동으로 생성되므로 일반적으로 `database`만 지정하면 됩니다.

## ClickPipe 타입별 예시 \{#examples\}

### Kafka \{#kafka\}

지원되는 `type` 값은 다음과 같습니다: `kafka`, `confluent`, `msk`, `azureeventhub`, `redpanda`, `warpstream`.

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

#### schema registry를 사용하는 Kafka \{#kafka-schema-registry\}

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

#### IAM role을 사용한 Kinesis \{#kinesis-iam-role\}

IAM role 인증을 사용하려면 AWS에서 실행 중인 ClickHouse 서비스가 필요합니다.

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

### Amazon S3 \{#s3\}

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

#### SQS를 사용한 S3 연속 수집 \{#s3-continuous\}

SQS 큐(순서 비보장 모드)를 사용한 연속 수집입니다. 설정 방법은 [순서 비보장 모드 구성](/integrations/clickpipes/object-storage/s3/unordered-mode)을 참조하십시오.

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

`service_account_key`는 GCP 서비스 계정 JSON 키 파일 내용을 base64로 인코딩한 값이어야 합니다.

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

#### IAM role을 사용하는 Postgres \{#postgres-iam-role\}

IAM role 인증에는 AWS에서 실행되는 ClickHouse 서비스가 필요합니다.

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

`service_account_file`은 base64로 인코딩된 GCP 서비스 계정 JSON 키 파일의 내용이어야 합니다.

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

## 스케일링 \{#scaling\}

모든 ClickPipe 타입은 레플리카 수와 각 레플리카의 리소스 할당을 구성할 수 있는 `scaling` 블록을 지원합니다:

```hcl
scaling {
  replicas               = 2     # Default: 1. Maximum: 10.
  replica_cpu_millicores = 500   # Between 125 and 2000.
  replica_memory_gb      = 2.0   # Between 0.5 and 8.0.
}
```

## 기존 ClickPipes 가져오기 \{#import\}

기존 ClickPipes는 서비스 ID와 ClickPipe ID를 사용하여 Terraform state에 가져올 수 있습니다:

```bash
terraform import clickhouse_clickpipe.example <service_id>:<clickpipe_id>
```