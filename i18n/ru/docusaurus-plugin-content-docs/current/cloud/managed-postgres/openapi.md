---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'OpenAPI'
description: 'Управляйте сервисами Managed Postgres с помощью нашего OpenAPI'
keywords: ['managed postgres', 'openapi', 'api', 'curl', 'руководство', 'командная строка']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# OpenAPI для Managed Postgres \{#managed-postgres-openapi\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="openapi" />

Используйте [ClickHouse OpenAPI](/cloud/manage/cloud-api), чтобы программно
управлять сервисами Managed Postgres так же, как сервисами ClickHouse. Уже
знакомы с [OpenAPI]? Получите [ключи API] и сразу переходите к
[справочнику по API Managed
Postgres][pg-openapi]. Если нет, ниже приведён краткий обзор.

## Ключи API \{#api-keys\}

Для использования ClickHouse OpenAPI требуется аутентификация; о том, как
создать ключи, см. в разделе [Ключи API]. Затем используйте их в учетных данных Basic Auth следующим образом:

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret

curl -s --user "$KEY_ID:$KEY_SECRET" https://api.clickhouse.cloud/v1/organizations | jq
```

## Идентификатор организации \{#organization-id\}

Далее вам понадобится идентификатор организации.

1. Выберите название организации в левом нижнем углу консоли.
2. Выберите **Сведения об организации**.
3. Нажмите значок копирования справа от **Идентификатор организации**, чтобы сразу скопировать его
   в буфер обмена.

{/*

  TODO: Раскомментируйте и вставьте корректный пример вывода, когда API станет доступен.

  Теперь его можно использовать в запросах, например так:

  ```bash
  ORG_ID=myorgid

  curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" | jq
  ```

  Итак, вы выполнили свой первый запрос к Postgres API: [list API] выше выводит список всех
  серверов Postgres в вашей организации. Вывод должен выглядеть
  примерно так:

  ```json
  {
  "result": [
    {
      "id": "c0d0b15d-5e8b-431d-8943-51b6e233e0b1",
      "name": "Customer's Organization",
      "createdAt": "2026-03-24T14:21:31Z",
      "privateEndpoints": [],
      "enableCoreDumps": true
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
  }
  ```

  */ }

## CRUD \{#crud\}

Рассмотрим жизненный цикл сервиса Postgres.

### Создание \{#create\}

Сначала создайте новый экземпляр
с помощью [create API]. Для этого в JSON-теле
запроса должны быть указаны следующие свойства:

* `name`: Имя нового сервиса Postgres
* `provider`: Имя облачного провайдера
* `region`: Регион в инфраструктуре провайдера, где будет развернут
  сервис
* `size`: Размер VM
* `storageSize`: Размер хранилища для VM

В документации по [create API] приведены возможные значения этих свойств. Кроме
того, укажем Postgres 18 вместо версии по умолчанию — 17:

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118
}'
```

Теперь используйте эти данные, чтобы создать новый экземпляр; обратите внимание, что для этого требуется заголовок
Content-Type:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" \
    -d "$create_data" | jq
```

В случае успеха будет создан новый экземпляр и возвращена информация о нём,
включая данные для подключения:

```json
{
  "result": {
    "id": "pg7myrd1j06p3gx4zrm2ze8qz6",
    "name": "my postgres",
    "provider": "aws",
    "region": "us-west-2",
    "postgresVersion": "18",
    "size": "r8gd.large",
    "storageSize": 118,
    "haType": "none",
    "tags": [],
    "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
    "username": "postgres",
    "password": "vV6cfEr2p_-TzkCDrZOx",
    "hostname": "my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com",
    "isPrimary": true,
    "state": "creating"
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

### Получение \{#read\}

Используйте `id` из ответа, чтобы повторно получить сервис:

```bash
PG_ID=pg7myrd1j06p3gx4zrm2ze8qz6
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

Вывод будет похож на JSON, возвращаемый при создании, но следите
за `state`; когда его значение изменится на `running`, сервер будет готов к работе:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq .result.state
```

```json
"running"
```

Теперь вы можете использовать свойство `connectionString` для подключения, например, через
[psql]:

```bash
$ psql "$(
    curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq -r .result.connectionString
)"

psql (18.3)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

postgres=# 
```

Введите `\q`, чтобы выйти из [psql].

### Обновление \{#update\}

[patch API] поддерживает обновление части свойств сервиса Managed
Postgres с помощью JSON Merge Patch по [RFC 7396]. Теги могут быть
особенно полезны при сложных развертываниях; просто отправьте в запросе
только их:

```bash
curl -sX PATCH --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    -d '{"tags": [{"key": "Environment", "value": "production"}]}' \
    | jq .result
```

Возвращённые данные должны содержать новые теги:

```json
{
  "id": "$PG_ID",
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118,
  "haType": "none",
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    }
  ],
  "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
  "username": "postgres",
  "password": "vV6cfEr2p_-TzkCDrZOx",
  "hostname": "my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com",
  "isPrimary": true,
  "state": "running"
}
```

{/*

  TODO: Дополнить после реализации.

  OpenAPI предоставляет дополнительные конечные точки для обновления свойств, не поддерживаемых
  в [patch API]. Например, чтобы обновить [конфигурацию Postgres],
  используйте [config API]:

  ```bash
  curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"max_connections": "42"}'
  ```

  В выводе будет показана обновлённая конфигурация:

  ```json
  {"max_connections": "42"}
  ```

  Дополнительные API для обновления включают:

  * Сброс пароля суперпользователя
  * Переименование сервиса Postgres (при этом изменяется имя хоста)
  * Обновление до следующей основной версии Postgres

  */ }

### Удаление \{#delete\}

Используйте [API удаления], чтобы удалить сервис Postgres.

:::warning
Удаление сервиса Postgres полностью удаляет сам сервис и все его
данные. Перед удалением сервиса убедитесь, что у вас есть резервная копия
или что вы предварительно повысили реплику до основной.
:::

```bash
curl -sX DELETE --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

В случае успеха в ответе будет указан код состояния 200, например:

```json
{
  "requestId": "ac9bbffa-e370-410c-8bdd-bd24bf3d7f82",
  "status": 200
}
```

[ClickHouse OpenAPI]: /cloud/manage/cloud-api "Cloud API"

[OpenAPI]: https://www.openapis.org "Инициатива OpenAPI"

[API keys]: /cloud/manage/openapi "Управление API-ключами"

[pg-openapi]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres "Спецификация OpenAPI для ClickHouse Cloud: Postgres"

[list API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceGetList "Получить список сервисов Postgres в организации"

[create API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceCreate "Создать новый сервис Postgres"

[psql]: https://www.postgresql.org/docs/current/app-psql.html "Документация PostgreSQL: psql — интерактивный терминал PostgreSQL"

[patch API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServicePatch "Обновить сервис PostgreSQL"

[RFC 7396]: https://www.rfc-editor.org/rfc/rfc7396 "RFC 7396: JSON Merge Patch"

[Postgres configuration]: https://www.postgresql.org/docs/18/runtime-config.html "Документация PostgreSQL: конфигурация сервера"

[config API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceSetConfig "Обновить конфигурацию сервиса Postgres"

[delete API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceDelete "Удалить сервис PostgreSQL"
