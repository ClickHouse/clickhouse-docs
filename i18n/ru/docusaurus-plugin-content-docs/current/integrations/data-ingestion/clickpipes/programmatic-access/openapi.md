---
sidebar_label: "OpenAPI"
description: "Справочник по программному управлению ClickPipes с помощью ClickHouse Cloud OpenAPI."
slug: /integrations/clickpipes/programmatic-access/openapi
sidebar_position: 1
title: "Справочник по OpenAPI ClickPipes"
doc_type: "reference"
keywords: ["clickpipes", "openapi", "api", "programmatic", "rest", "curl"]
---

Все типы ClickPipes можно создавать, обновлять и удалять программно с помощью [ClickHouse Cloud OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes). На этой странице описаны аутентификация и доступные конечные точки ClickPipes, а также приведены примеры `curl`-запросов для каждого типа ClickPipe.

## Аутентификация \{#authentication\}

API ClickHouse Cloud использует базовую HTTP-аутентификацию. Вам потребуется API-ключ (ID ключа + секрет ключа) с правами доступа к целевому сервису. Инструкции по его созданию см. в разделе [Управление API-ключами](/cloud/manage/openapi).

Перед запуском любого из приведённых ниже примеров настройте следующие переменные окружения:

```bash
export KEY_ID=<your_key_id>
export KEY_SECRET=<your_key_secret>
export ORG_ID=<your_organization_id>
export SERVICE_ID=<your_service_id>
```

## Базовый URL \{#base-url\}

```bash
https://api.clickhouse.cloud/v1
```

## Конечные точки \{#endpoints\}

Все конечные точки ClickPipes привязаны к сервису ClickHouse Cloud:

| Method   | Path                                                                                     | Description                               |
| -------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| `GET`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes`                        | Получить список всех ClickPipes           |
| `POST`   | `/organizations/{organizationId}/services/{serviceId}/clickpipes`                        | Создать ClickPipe                         |
| `GET`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}`          | Получить ClickPipe                        |
| `PATCH`  | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}`          | Обновить ClickPipe                        |
| `DELETE` | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}`          | Удалить ClickPipe                         |
| `GET`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/settings` | Получить настройки ClickPipe              |
| `PUT`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/settings` | Обновить настройки ClickPipe              |
| `PATCH`  | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/scaling`  | Обновить масштабирование ClickPipe        |
| `PATCH`  | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/state`    | Обновить состояние ClickPipe (start/stop) |

Для CDC ClickPipes (Postgres, MySQL, MongoDB) также доступны дополнительные конечные точки на уровне организации для масштабирования общей инфраструктуры CDC:

| Method  | Path                                                    | Description                                       |
| ------- | ------------------------------------------------------- | ------------------------------------------------- |
| `GET`   | `/organizations/{organizationId}/clickpipes/cdcScaling` | Получить параметры масштабирования CDC ClickPipes |
| `PATCH` | `/organizations/{organizationId}/clickpipes/cdcScaling` | Обновить параметры масштабирования CDC ClickPipes |

Полные schema запросов и ответов для каждой конечной точки см. в [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes).

## Примеры \{#examples\}

### Получить список ClickPipes \{#list-clickpipes\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### Получите ClickPipe \{#get-clickpipe\}

```bash
CLICKPIPE_ID=<your_clickpipe_id>

curl -u "$KEY_ID:$KEY_SECRET" \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes/$CLICKPIPE_ID"
```

### Остановка и запуск ClickPipe \{#stop-start-clickpipe\}

```bash
# Stop
curl -u "$KEY_ID:$KEY_SECRET" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes/$CLICKPIPE_ID/state"

# Start
curl -u "$KEY_ID:$KEY_SECRET" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes/$CLICKPIPE_ID/state"
```

### Удалить ClickPipe \{#delete-clickpipe\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X DELETE \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes/$CLICKPIPE_ID"
```

## Создание ClickPipes \{#creating-clickpipes\}

Тело запроса `POST /clickpipes` зависит от типа источника. В примерах ниже показана структура для каждого поддерживаемого типа ClickPipe. Актуальные JSON-схемы см. в [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes).

### Kafka \{#create-kafka\}

Поддерживаемые источники, совместимые с Kafka: `kafka`, `confluent`, `msk`, `azureeventhub`, `redpanda`, `warpstream`.

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Kafka ClickPipe",
    "source": {
      "kafka": {
        "type": "confluent",
        "format": "JSONEachRow",
        "brokers": "broker.example.com:9092",
        "topics": "my_topic",
        "consumerGroup": "clickpipes-consumer-group",
        "authentication": "PLAIN",
        "credentials": {
          "username": "my_user",
          "password": "my_password"
        }
      }
    },
    "destination": {
      "table": "my_table",
      "managedTable": true,
      "tableDefinition": {
        "engine": { "type": "MergeTree" }
      },
      "columns": [
        { "name": "id", "type": "UInt64" },
        { "name": "message", "type": "String" },
        { "name": "timestamp", "type": "DateTime" }
      ]
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### Amazon Kinesis \{#create-kinesis\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Kinesis ClickPipe",
    "source": {
      "kinesis": {
        "format": "JSONEachRow",
        "streamName": "my-stream",
        "region": "us-east-1",
        "iteratorType": "TRIM_HORIZON",
        "authentication": "IAM_USER",
        "accessKey": {
          "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
          "secretKey": "<secret_key>"
        }
      }
    },
    "destination": {
      "table": "my_table",
      "managedTable": true,
      "tableDefinition": {
        "engine": { "type": "MergeTree" }
      },
      "columns": [
        { "name": "id", "type": "UInt64" },
        { "name": "message", "type": "String" }
      ]
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### Amazon S3 \{#create-s3\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My S3 ClickPipe",
    "source": {
      "objectStorage": {
        "type": "s3",
        "url": "https://my-bucket.s3.amazonaws.com/data/*.json",
        "format": "JSONEachRow",
        "authentication": "IAM_USER",
        "accessKey": {
          "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
          "secretKey": "<secret_key>"
        }
      }
    },
    "destination": {
      "table": "my_table",
      "managedTable": true,
      "tableDefinition": {
        "engine": { "type": "MergeTree" }
      },
      "columns": [
        { "name": "id", "type": "UInt64" },
        { "name": "message", "type": "String" }
      ]
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### Google Cloud Storage \{#create-gcs\}

`serviceAccountKey` должен содержать содержимое JSON-файла ключа сервисного аккаунта GCP в кодировке base64.

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My GCS ClickPipe",
    "source": {
      "objectStorage": {
        "type": "gcs",
        "url": "gs://my-bucket/data/*.json",
        "format": "JSONEachRow",
        "authentication": "SERVICE_ACCOUNT",
        "serviceAccountKey": "<base64_encoded_service_account_json>"
      }
    },
    "destination": {
      "table": "my_table",
      "managedTable": true,
      "tableDefinition": {
        "engine": { "type": "MergeTree" }
      },
      "columns": [
        { "name": "id", "type": "UInt64" },
        { "name": "message", "type": "String" }
      ]
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### Azure Blob Storage \{#create-abs\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Azure Blob ClickPipe",
    "source": {
      "objectStorage": {
        "type": "azureblobstorage",
        "azureContainerName": "my-container",
        "path": "data/*.json",
        "format": "JSONEachRow",
        "authentication": "CONNECTION_STRING",
        "connectionString": "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey;EndpointSuffix=core.windows.net"
      }
    },
    "destination": {
      "table": "my_table",
      "managedTable": true,
      "tableDefinition": {
        "engine": { "type": "MergeTree" }
      },
      "columns": [
        { "name": "id", "type": "UInt64" },
        { "name": "message", "type": "String" }
      ]
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### CDC для Postgres \{#create-postgres\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Postgres CDC ClickPipe",
    "source": {
      "postgres": {
        "host": "postgres.example.com",
        "port": 5432,
        "database": "mydb",
        "credentials": {
          "username": "postgres_user",
          "password": "<password>"
        },
        "settings": {
          "replicationMode": "cdc"
        },
        "tableMappings": [
          {
            "sourceSchemaName": "public",
            "sourceTable": "users",
            "targetTable": "public_users"
          }
        ]
      }
    },
    "destination": {
      "database": "default"
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### CDC для MySQL \{#create-mysql\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My MySQL CDC ClickPipe",
    "source": {
      "mysql": {
        "host": "mysql.example.com",
        "port": 3306,
        "credentials": {
          "username": "mysql_user",
          "password": "<password>"
        },
        "settings": {
          "replicationMode": "cdc"
        },
        "tableMappings": [
          {
            "sourceSchemaName": "mydb",
            "sourceTable": "orders",
            "targetTable": "mydb_orders"
          }
        ]
      }
    },
    "destination": {
      "database": "default"
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### CDC для MongoDB \{#create-mongodb\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My MongoDB CDC ClickPipe",
    "source": {
      "mongodb": {
        "uri": "mongodb+srv://cluster0.example.mongodb.net",
        "readPreference": "secondaryPreferred",
        "credentials": {
          "username": "mongo_user",
          "password": "<password>"
        },
        "settings": {
          "replicationMode": "cdc"
        },
        "tableMappings": [
          {
            "sourceDatabaseName": "mydb",
            "sourceCollection": "users",
            "targetTable": "mydb_users"
          }
        ]
      }
    },
    "destination": {
      "database": "default"
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### BigQuery \{#create-bigquery\}

`serviceAccountFile` должен содержать содержимое JSON-файла ключа сервисного аккаунта GCP, закодированное в base64.

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My BigQuery ClickPipe",
    "source": {
      "bigquery": {
        "snapshotStagingPath": "gs://my-staging-bucket/staging/",
        "credentials": {
          "serviceAccountFile": "<base64_encoded_service_account_json>"
        },
        "settings": {
          "replicationMode": "snapshot"
        },
        "tableMappings": [
          {
            "sourceDatasetName": "my_dataset",
            "sourceTable": "my_table",
            "targetTable": "my_bigquery_table"
          }
        ]
      }
    },
    "destination": {
      "database": "default"
    }
  }' \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```