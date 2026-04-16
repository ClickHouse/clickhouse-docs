---
sidebar_label: "OpenAPI"
description: "ClickHouse Cloud OpenAPI를 사용해 ClickPipes를 프로그래밍 방식으로 관리하는 방법에 대한 참조 문서입니다."
slug: /integrations/clickpipes/programmatic-access/openapi
sidebar_position: 1
title: "ClickPipes OpenAPI 참조"
doc_type: "참조"
keywords: ["clickpipes", "openapi", "api", "programmatic", "rest", "curl"]
---

모든 ClickPipes 타입은 [ClickHouse Cloud OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes)를 사용해 프로그래밍 방식으로 생성, 업데이트, 삭제할 수 있습니다. 이 페이지에서는 인증과 사용 가능한 ClickPipes 엔드포인트를 설명하고, 각 ClickPipe 타입별 `curl` 요청 예시를 제공합니다.

## 인증 \{#authentication\}

ClickHouse Cloud API는 HTTP Basic 인증을 사용합니다. 대상 서비스에 대한 권한이 부여된 API 키(키 ID + 키 시크릿)가 필요합니다. 생성 방법은 [API 키 관리](/cloud/manage/openapi)를 참조하십시오.

아래 예시를 실행하기 전에 다음 환경 변수를 설정하십시오:

```bash
export KEY_ID=<your_key_id>
export KEY_SECRET=<your_key_secret>
export ORG_ID=<your_organization_id>
export SERVICE_ID=<your_service_id>
```

## 기본 URL \{#base-url\}

```bash
https://api.clickhouse.cloud/v1
```

## 엔드포인트 \{#endpoints\}

모든 ClickPipes 엔드포인트는 ClickHouse Cloud 서비스 범위에 속합니다:

| Method   | Path                                                                                     | Description              |
| -------- | ---------------------------------------------------------------------------------------- | ------------------------ |
| `GET`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes`                        | 모든 ClickPipes 조회         |
| `POST`   | `/organizations/{organizationId}/services/{serviceId}/clickpipes`                        | ClickPipe 생성             |
| `GET`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}`          | ClickPipe 조회             |
| `PATCH`  | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}`          | ClickPipe 업데이트           |
| `DELETE` | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}`          | ClickPipe 삭제             |
| `GET`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/settings` | ClickPipe 설정 조회          |
| `PUT`    | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/settings` | ClickPipe 설정 업데이트        |
| `PATCH`  | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/scaling`  | ClickPipe 스케일링 업데이트      |
| `PATCH`  | `/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/state`    | ClickPipe 상태 업데이트(시작/중지) |

CDC ClickPipes(Postgres, MySQL, MongoDB)의 경우, 공유 CDC 인프라 스케일링을 위한 추가 조직 수준 엔드포인트가 있습니다:

| Method  | Path                                                    | Description              |
| ------- | ------------------------------------------------------- | ------------------------ |
| `GET`   | `/organizations/{organizationId}/clickpipes/cdcScaling` | CDC ClickPipes 스케일링 조회   |
| `PATCH` | `/organizations/{organizationId}/clickpipes/cdcScaling` | CDC ClickPipes 스케일링 업데이트 |

각 엔드포인트의 전체 요청 및 응답 schema는 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes)를 참조하십시오.

## 예시 \{#examples\}

### ClickPipes 목록 보기 \{#list-clickpipes\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes"
```

### ClickPipe 정보 조회 \{#get-clickpipe\}

```bash
CLICKPIPE_ID=<your_clickpipe_id>

curl -u "$KEY_ID:$KEY_SECRET" \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes/$CLICKPIPE_ID"
```

### ClickPipe 중지 또는 시작하기 \{#stop-start-clickpipe\}

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

### ClickPipe 삭제하기 \{#delete-clickpipe\}

```bash
curl -u "$KEY_ID:$KEY_SECRET" \
  -X DELETE \
  "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipes/$CLICKPIPE_ID"
```

## ClickPipes 생성 \{#creating-clickpipes\}

`POST /clickpipes` 요청 본문은 소스 유형에 따라 달라집니다. 아래 예시는 지원되는 각 ClickPipe 유형별 구조를 보여줍니다. 권위 있는 JSON schema는 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes)를 참조하십시오.

### Kafka \{#create-kafka\}

지원되는 Kafka 호환 소스는 다음과 같습니다: `kafka`, `confluent`, `msk`, `azureeventhub`, `redpanda`, `warpstream`.

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

`serviceAccountKey`는 GCP 서비스 계정 JSON 키 파일 내용을 base64로 인코딩한 값이어야 합니다.

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

### Postgres CDC \{#create-postgres\}

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

### MySQL CDC \{#create-mysql\}

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

### MongoDB CDC \{#create-mongodb\}

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

`serviceAccountFile`은 GCP 서비스 계정 JSON 키 파일 내용을 base64로 인코딩한 값이어야 합니다.

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