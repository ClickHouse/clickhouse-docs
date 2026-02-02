---
sidebar_label: 'Обзор'
description: 'Как экспортировать данные из BigQuery в ClickHouse Cloud с помощью ClickPipes.'
slug: /integrations/clickpipes/bigquery/overview
sidebar_position: 1
title: 'Интеграция BigQuery с ClickHouse Cloud'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_iam.png';
import Image from '@theme/IdealImage';

<IntroClickPipe />


## Возможности \{#features\}

### Первоначальная загрузка \{#initial-load\}

BigQuery ClickPipe загрузит выбранные таблицы в [датасете](https://docs.cloud.google.com/bigquery/docs/datasets-intro) BigQuery в целевые таблицы ClickHouse в рамках одной пакетной операции. После завершения задачи ингестии ClickPipe останавливается автоматически. Для процесса первоначальной ингестии требуется предоставленный пользователем бакет Google Cloud Storage (GCS) для промежуточного хранения. В будущем промежуточный бакет будет предоставляться и управляться ClickPipes.

:::note
ClickPipes использует пакетные задания выгрузки для переноса данных из BigQuery в промежуточный бакет GCS. Эти операции **не приводят к начислению платы за обработку** в BigQuery.
:::

### CDC (фиксация изменений данных) \{#cdc\}

CDC в Private Preview **не поддерживается**, но поддержка появится в будущем. До тех пор мы рекомендуем использовать [Google Cloud Storage ClickPipe](../object-storage/google-cloud-storage/01_overview.md) для непрерывной синхронизации экспортируемых из BigQuery данных в ClickHouse Cloud после выполнения начальной загрузки.

## Сопоставление типов данных \{#data-type-mapping\}

[Типы данных BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types).

| Тип данных BigQuery | Тип данных ClickHouse | Подробности                                                        |
|---------------------|-----------------------|--------------------------------------------------------------------|
| `BOOL`              | `Bool`                |                                                                    |
| `INT64`             | `Int64`               |                                                                    |
| `FLOAT64`           | `Float64`             |                                                                    |
| `NUMERIC`           | `Decimal(P, S)`       | Точность до 38 знаков, масштаб до 9. Точность и масштаб сохраняются. |
| `BIGNUMERIC`        | `Decimal(P, S)`       | Точность до 76 знаков, масштаб до 38. Точность и масштаб сохраняются. |
| `STRING`            | `String`              |                                                                    |
| `BYTES`             | `String`              |                                                                    |
| `JSON`              | `String` (JSON)       |                                                                    |
| `DATE`              | `Date`                |                                                                    |
| `TIME`              | `String`              | Микросекундная точность.                                           |
| `DATETIME`          | `DateTime`            | Микросекундная точность.                                           |
| `TIMESTAMP`         | `DateTime64(6)`       | Микросекундная точность.                                           |
| `GEOGRAPHY`         | `String`              |                                                                    |
| `GEOMETRY`          | `String`              |                                                                    |
| `UUID`              | `String`              |                                                                    |
| `ARRAY<T>`          | `Array(T)`            |                                                                    |
| `ARRAY<DATE>`       | `Array(Date)`         |                                                                    |
| `STRUCT` (RECORD)   | `String`              |                                                                    |

## Управление доступом \{#access-control\}

### Аутентификация \{#authentication\}

#### Учетные данные сервисного аккаунта \{#service-account-credentials\}

ClickPipes выполняет аутентификацию в вашем проекте Google Cloud с использованием [ключа сервисного аккаунта](https://docs.cloud.google.com/iam/docs/keys-create-delete). Мы рекомендуем создать отдельный сервисный аккаунт с минимально необходимым набором [прав доступа](#permissions), чтобы ClickPipes мог экспортировать данные из BigQuery, загружать их в промежуточный GCS‑бакет и считывать их в ClickHouse.

<Image img={cp_iam} alt="Создание ключа сервисного аккаунта с правами доступа к BigQuery и Cloud Storage" size="lg" border/>

### Разрешения \{#permissions\}

#### BigQuery \{#bigquery\}

У учётной записи службы должны быть следующие роли BigQuery:

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

Чтобы дополнительно сузить доступ, мы рекомендуем использовать [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions), чтобы ограничить ресурсы, к которым имеет доступ эта роль. Например, вы можете ограничить роль `dataViewer` конкретным набором данных, содержащим таблицы, которые вы хотите синхронизировать:

```bash
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```


#### Cloud Storage \{#cloud-storage\}

Сервисный аккаунт должен иметь следующие роли Cloud Storage:

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

Для более точного разграничения прав доступа рекомендуется использовать [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions), чтобы ограничить ресурсы, к которым у роли есть доступ. Например, вы можете ограничить действие ролей `objectAdmin` и `bucketViewer` рамками выделенного bucket&#39;а, созданного для синхронизации ClickPipes.

```bash
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```
