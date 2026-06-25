---
slug: /integrations/clickpipes/pubsub/auth
sidebar_label: 'Разрешения IAM для Pub/Sub'
title: 'Разрешения IAM для Pub/Sub'
description: 'В этой статье описаны разрешения GCP IAM, необходимые ClickPipes для аутентификации в Google Cloud Pub/Sub и чтения данных из ваших топиков.'
doc_type: 'guide'
keywords: ['Google Cloud Pub/Sub', 'GCP IAM', 'сервисный аккаунт']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

:::note
Вы можете записаться в лист ожидания закрытой предварительной версии [здесь](https://clickhouse.com/cloud/clickpipes#pubsub-private-preview).
:::

В этой статье описаны разрешения GCP IAM, необходимые ClickPipes для аутентификации в Google Cloud Pub/Sub и чтения данных из ваших топиков, а также порядок настройки сервисного аккаунта с предоставлением именно этих разрешений.

## Предварительные требования \{#prerequisite\}

Чтобы выполнить это руководство, вам потребуется:

* Активный сервис ClickHouse Cloud
* Проект GCP, содержащий топик Pub/Sub, из которого вы хотите принимать данные
* Разрешения IAM в этом проекте для создания сервисных аккаунтов и назначения ролей

## Модель аутентификации \{#authentication-model\}

ClickPipes for Pub/Sub аутентифицируется в GCP с помощью [JSON-ключа сервисного аккаунта](https://cloud.google.com/iam/docs/keys-create-delete). При создании пайпа вы загружаете файл ключа; ClickPipes шифрует его при хранении и использует во время выполнения для следующих задач:

* перечисление и чтение топиков в вашем проекте;
* создание и удаление [управляемой подписки](/integrations/clickpipes/pubsub#managed-subscriptions), которую ClickPipes использует для получения сообщений;
* получение сообщений из этой подписки;
* (необязательно) чтение нативных схем Pub/Sub из реестра схем.

Поддержка workload identity и возможность вставить учётные данные напрямую отсутствуют — на данный момент JSON-ключ сервисного аккаунта остаётся единственным поддерживаемым методом аутентификации.

## Требуемые разрешения \{#required-permissions\}

ClickPipes требуются следующие разрешения IAM в проекте GCP, которому принадлежит топик. Они охватывают полный жизненный цикл пайпа: обнаружение (получение списка топиков, проверка, отбор образцов), управление подписками, ингестию в штатном режиме и очистку.

### Доступ к топикам (обнаружение и проверка) \{#topic-access\}

| Permission                         | Purpose                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `pubsub.topics.list`               | Просмотр списка доступных топиков в проекте в ходе обнаружения |
| `pubsub.topics.get`                | Проверка существования топика и получение настроек схемы       |
| `pubsub.topics.attachSubscription` | Требуется для **топика** при создании для него подписки        |

### Жизненный цикл подписки (обнаружение и ингестия) \{#subscription-lifecycle\}

| Permission                     | Purpose                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `pubsub.subscriptions.create`  | Создание управляемой подписки (`clickpipes-{pipeID}`) и эфемерных подписок для обнаружения |
| `pubsub.subscriptions.get`     | Проверки состояния (каждые 60 с), опрос follower, проверка подписки                        |
| `pubsub.subscriptions.delete`  | Удаление эфемерных подписок для обнаружения и управляемой подписки при удалении пайпа      |
| `pubsub.subscriptions.consume` | Операции `Receive()`, `Ack()`, `Nack()` и seek-to-timestamp                                |

### Доступ к схемам (необязательно — только для нативных топиков Avro/Protobuf) \{#schema-access\}

| Разрешение           | Назначение                                                  |
| -------------------- | ----------------------------------------------------------- |
| `pubsub.schemas.get` | Получение определений нативных схем из реестра схем Pub/Sub |

## Предопределённые роли \{#predefined-roles\}

| Роль                                                                                                 | Достаточно? | Примечания                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`roles/pubsub.editor`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.editor)         | Да          | Включает все необходимые разрешения. Наиболее широкий вариант.                                                                                      |
| [`roles/pubsub.subscriber`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.subscriber) | **Нет**     | Отсутствуют `topics.list`, `topics.attachSubscription`, `subscriptions.create`, `subscriptions.delete` и `schemas.get`.                             |
| [`roles/pubsub.viewer`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.viewer)         | **Нет**     | Только для чтения — без управления подписками и получения сообщений.                                                                                |
| Пользовательская роль *(рекомендуется)*                                                              | Да          | Используйте семь основных разрешений, перечисленных выше (плюс необязательное `schemas.get`), чтобы предоставить минимально необходимые привилегии. |

## Настройка \{#setup\}

<VerticalStepper headerLevel="h3" />

### Создайте пользовательскую роль (рекомендуется) \{#create-custom-role\}

Чтобы предоставить доступ по принципу наименьших привилегий, создайте пользовательскую роль только с теми разрешениями, которые нужны ClickPipes.

Это можно сделать с помощью CLI `gcloud`:

```bash
gcloud iam roles create clickpipes.pubsub.ingestion \
  --project=YOUR_PROJECT_ID \
  --title="ClickPipes Pub/Sub Ingestion" \
  --description="Permissions required by ClickHouse ClickPipes to ingest from Pub/Sub" \
  --permissions=pubsub.topics.list,pubsub.topics.get,pubsub.topics.attachSubscription,pubsub.subscriptions.create,pubsub.subscriptions.get,pubsub.subscriptions.delete,pubsub.subscriptions.consume \
  --stage=GA
```

Или в консоли GCP перейдите в **IAM &amp; Admin → Roles → Create role** и добавьте разрешения, перечисленные в разделе [Обязательные разрешения](#required-permissions).

:::note Необязательные разрешения
Добавьте `pubsub.schemas.get` в список `--permissions`, если у вас настроен приём из топиков, использующих собственные схемы Pub/Sub Avro или Protobuf. В противном случае не добавляйте его, чтобы роль оставалась минимальной.
:::

Если вы не хотите создавать пользовательскую роль, вместо неё можно выдать `roles/pubsub.editor`.

### Создайте сервисный аккаунт \{#create-service-account\}

Создайте отдельный сервисный аккаунт для ClickPipe:

```bash
gcloud iam service-accounts create clickpipes-pubsub \
  --project=YOUR_PROJECT_ID \
  --display-name="ClickPipes Pub/Sub Ingestion"
```

### Назначьте роль сервисному аккаунту \{#grant-role\}

Назначьте роль, которую вы создали (или `roles/pubsub.editor`), сервисному аккаунту на уровне проекта:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="projects/YOUR_PROJECT_ID/roles/clickpipes.pubsub.ingestion"
```

### Создайте и скачайте ключ сервисного аккаунта \{#create-key\}

Создайте JSON-ключ для сервисного аккаунта и скачайте его локально:

```bash
gcloud iam service-accounts keys create clickpipes-pubsub-key.json \
  --iam-account=clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Загрузите файл `clickpipes-pubsub-key.json` в интерфейсе ClickPipes при создании пайпа.

:::note Обращайтесь с ключом как с секретом
Ключи сервисного аккаунта предоставляют доступ к вашему проекту GCP. Храните этот файл в безопасном месте, не добавляйте его в систему контроля версий и регулярно обновляйте его. После загрузки ClickPipes шифрует ключ при хранении.
:::

## Примечания \{#notes\}

* `pubsub.topics.attachSubscription` требуется для **ресурса топика**, а не подписки. Этот момент часто упускают, когда выдают права только на уровне подписки.
* Если ваш топик не использует нативную схему Pub/Sub (Avro или Protobuf), разрешение `pubsub.schemas.get` не требуется.
* Управляемые подписки именуются как `clickpipes-{pipeID}` и имеют тайм-аут подтверждения 60 с, срок хранения сообщений 7 дней и включенное упорядочивание сообщений.
* Эфемерные подписки для обнаружения именуются как `clickpipes-discovery-{uuid}` и имеют тайм-аут подтверждения 10 с, срок хранения 10 минут и TTL автоматического истечения 24 часа.
* ClickPipes рассматривает ошибки `PermissionDenied` и `Unauthenticated` как не подлежащие повторной попытке — если какого-либо разрешения не хватает, пайп сразу завершается вместо того, чтобы бесконечно повторять попытки.