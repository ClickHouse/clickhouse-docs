---
sidebar_label: "Terraform"
description: "Справочник по программному управлению ClickPipes с помощью Terraform-провайдера ClickHouse."
slug: /integrations/clickpipes/programmatic-access/terraform
sidebar_position: 2
title: "Справочник по Terraform для ClickPipes"
doc_type: "reference"
keywords: ["clickpipes", "terraform", "инфраструктура как код", "iac", "программное управление"]
---

Все типы ClickPipes можно создавать и настраивать с помощью ресурса `clickhouse_clickpipe` в [Terraform-провайдере ClickHouse](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs/resources/clickpipe). На этой странице описаны настройка провайдера и примеры конфигурации для каждого поддерживаемого типа ClickPipe.

## Настройка провайдера \{#provider-setup\}

:::note
Поддержка ClickPipes доступна для общего использования начиная с версии провайдера **v3.14.0**.
Если вы используете более раннюю версию, потребуется alpha-релиз — подробности см. в
[журнале изменений провайдера](https://github.com/ClickHouse/terraform-provider-clickhouse/releases).
:::

Добавьте провайдер ClickHouse в конфигурацию Terraform:

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

См. [Управление API-ключами](/cloud/manage/openapi): там описано, как создать API-ключ для работы с провайдером.

## Обзор ресурса \{#resource-overview\}

Ресурс `clickhouse_clickpipe` имеет следующие аргументы верхнего уровня:

| Аргумент         | Обязательный | Описание                                                                                      |
| ---------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `name`           | Да           | Имя ClickPipe.                                                                                |
| `service_id`     | Да           | Идентификатор сервиса ClickHouse Cloud.                                                       |
| `source`         | Да           | Конфигурация источника (один блок источника на каждый ClickPipe).                             |
| `destination`    | Да           | Конфигурация пункта назначения.                                                               |
| `scaling`        | No           | Количество и размер реплик. По умолчанию используется 1 реплика.                              |
| `field_mappings` | No           | Пользовательские соответствия полей между столбцами источника и пункта назначения.            |
| `settings`       | No           | Дополнительные настройки ClickPipe.                                                           |
| `stopped`        | No           | Установите `true`, чтобы создать ClickPipe в остановленном состоянии. По умолчанию — `false`. |

Атрибуты `id` и `state` доступны только для чтения и заполняются ClickHouse Cloud после создания.

## Пункт назначения \{#destination\}

Блок `destination` используется для всех типов источников:

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

Для источников CDC (Postgres, MySQL, MongoDB, BigQuery) целевые таблицы создаются автоматически на основе schema источника — обычно достаточно только `database`.

## Примеры для разных типов ClickPipe \{#examples\}

### Kafka \{#kafka\}

Поддерживаемые значения параметра `type`: `kafka`, `confluent`, `msk`, `azureeventhub`, `redpanda`, `warpstream`.

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

#### Kafka с реестром schema \{#kafka-schema-registry\}

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

#### Kinesis с ролью IAM \{#kinesis-iam-role\}

Для аутентификации с использованием роли IAM требуется сервис ClickHouse, работающий в AWS.

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

#### Непрерывная ингестия из S3 через SQS \{#s3-continuous\}

Для непрерывной ингестии с использованием очереди SQS (неупорядоченный режим). Инструкции по настройке см. в разделе [Настройка неупорядоченного режима](/integrations/clickpipes/object-storage/s3/unordered-mode).

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

`service_account_key` должен содержать закодированное в base64 содержимое JSON-файла с ключом сервисного аккаунта GCP.

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

#### Postgres с ролью IAM \{#postgres-iam-role\}

Аутентификация с помощью роли IAM требует наличия сервиса ClickHouse, работающего в AWS.

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

### CDC для MySQL \{#mysql\}

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

`service_account_file` должен содержать содержимое JSON-файла ключа сервисного аккаунта GCP в кодировке Base64.

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

## Масштабирование \{#scaling\}

Все типы ClickPipe поддерживают блок `scaling` для настройки количества реплик и объёма выделяемых им ресурсов:

```hcl
scaling {
  replicas               = 2     # Default: 1. Maximum: 10.
  replica_cpu_millicores = 500   # Between 125 and 2000.
  replica_memory_gb      = 2.0   # Between 0.5 and 8.0.
}
```

## Импорт существующих ClickPipes \{#import\}

Существующие ClickPipes можно импортировать в файл состояния Terraform, используя как ID сервиса, так и ID ClickPipe:

```bash
terraform import clickhouse_clickpipe.example <service_id>:<clickpipe_id>
```