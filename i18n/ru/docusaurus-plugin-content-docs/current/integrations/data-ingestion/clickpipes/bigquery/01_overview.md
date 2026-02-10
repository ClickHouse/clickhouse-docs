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

### Начальная загрузка \{#initial-load\}

BigQuery ClickPipe выполнит загрузку выбранных таблиц из [набора данных](https://docs.cloud.google.com/bigquery/docs/datasets-intro) BigQuery в целевые таблицы ClickHouse в рамках одной пакетной операции. После завершения задачи ингестии ClickPipe останавливается автоматически. Для процесса ингестии при первоначальной загрузке требуется предоставленный пользователем bucket Google Cloud Storage (GCS) для промежуточного хранения (staging). В будущем промежуточный bucket будет предоставляться и управляться ClickPipes.

:::note
ClickPipes использует пакетные задания извлечения для выборки данных из BigQuery во временный bucket GCS. Эти операции **не приводят к начислению платы за обработку** в BigQuery.
:::

### CDC (фиксация изменений данных) \{#cdc\}

CDC **не поддерживается** на этапе Private Preview, но будет поддерживаться в будущем. А пока мы рекомендуем использовать [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) для непрерывной синхронизации экспортов данных BigQuery в ClickHouse Cloud после выполнения первоначальной загрузки.

## Сопоставление типов данных \{#data-type-mapping\}

[Типы данных BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types).

| Тип данных BigQuery | Тип данных ClickHouse | Подробности                                                      |
|---------------------|-----------------------|------------------------------------------------------------------|
| `BOOL`              | `Bool`                |                                                                  |
| `INT64`             | `Int64`               |                                                                  |
| `FLOAT64`           | `Float64`             |                                                                  |
| `NUMERIC`           | `Decimal(P, S)`       | Точность до 38, масштаб до 9. Точность и масштаб сохраняются.   |
| `BIGNUMERIC`        | `Decimal(P, S)`       | Точность до 76, масштаб до 38. Точность и масштаб сохраняются.  |
| `STRING`            | `String`              |                                                                  |
| `BYTES`             | `String`              |                                                                  |
| `JSON`             | `String` (JSON)       |                                                                  |
| `DATE`              | `Date`                |                                                                  |
| `TIME`              | `String`              | Микросекундная точность.                                        |
| `DATETIME`          | `DateTime`            | Микросекундная точность.                                        |
| `TIMESTAMP`         | `DateTime64(6)`       | Микросекундная точность.                                        |
| `GEOGRAPHY`         | `String`              |                                                                  |
| `GEOMETRY`          | `String`              |                                                                  |
| `UUID`              | `String`              |                                                                  |
| `ARRAY<T>`          | `Array(T)`            |                                                                  |
| `ARRAY<DATE>`       | `Array(Date)`         |                                                                  |
| `STRUCT` (RECORD)   | `String`              |                                                                  |

## Управление доступом \{#access-control\}

### Аутентификация \{#authentication\}

#### Учетные данные сервисного аккаунта \{#service-account-credentials\}

ClickPipes аутентифицируется в вашем проекте Google Cloud с использованием [ключа сервисного аккаунта](https://docs.cloud.google.com/iam/docs/keys-create-delete). Рекомендуем создать отдельный сервисный аккаунт с минимально необходимым набором [прав доступа](#permissions), чтобы ClickPipes мог экспортировать данные из BigQuery, загружать их во временный (staging) бакет в GCS и затем загружать их в ClickHouse.

<Image img={cp_iam} alt="Создание ключа сервисного аккаунта с правами доступа BigQuery и Cloud Storage" size="lg" border/>

### Разрешения \{#permissions\}

#### BigQuery \{#bigquery\}

Сервисная учётная запись должна иметь следующие роли BigQuery:

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

Чтобы точнее ограничить доступ, рекомендуется использовать [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) для сужения перечня ресурсов, к которым имеет доступ роль. Например, вы можете ограничить роль `dataViewer` конкретным датасетом, который содержит таблицы для синхронизации:

```bash
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```


#### Cloud Storage \{#cloud-storage\}

У учетной записи службы должны быть следующие роли Cloud Storage:

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

Чтобы еще более точно ограничить доступ, рекомендуется использовать [условия IAM](https://docs.cloud.google.com/bigquery/docs/conditions) для ограничения ресурсов, к которым имеет доступ роль. Например, вы можете ограничить действие ролей `objectAdmin` и `bucketViewer` только выделенным бакетом, созданным для синхронизаций ClickPipes.

```bash
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```
