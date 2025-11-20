---
title: 'Масштабирование DB ClickPipes через OpenAPI'
description: 'Документация по масштабированию DB ClickPipes через OpenAPI'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'Масштабирование'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

:::caution Большинству пользователей этот API не потребуется
Конфигурация DB ClickPipes по умолчанию спроектирована так, чтобы из коробки обрабатывать большинство рабочих нагрузок. Если вы считаете, что вашей рабочей нагрузке требуется масштабирование, откройте [запрос в службу поддержки](https://clickhouse.com/support/program), и мы подберём оптимальные настройки под ваш сценарий.
:::

API масштабирования может быть полезен для:
- Крупных начальных загрузок (более 4 ТБ)
- Максимально быстрой миграции умеренных объёмов данных
- Поддержки более чем 8 CDC ClickPipes в рамках одного сервиса

Прежде чем пытаться увеличить масштаб, рекомендуется:
- Убедиться, что в исходной БД достаточно доступных ресурсов
- Сначала настроить [параллелизм и разбиение начальной загрузки](/integrations/clickpipes/postgres/parallel_initial_load) при создании ClickPipe
- Проверить [долго выполняющиеся транзакции](/integrations/clickpipes/postgres/sync_control#transactions) на источнике, которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально повысит вычислительные затраты ваших ClickPipes.** Если вы масштабируете только для начальных загрузок, важно уменьшить масштаб после завершения снимка, чтобы избежать неожиданных расходов. Для получения подробной информации о ценах см. раздел [Postgres CDC Pricing](/cloud/reference/billing/clickpipes).



## Предварительные требования {#prerequisites}

Перед началом работы вам потребуется:

1. [API-ключ ClickHouse](/cloud/manage/openapi) с правами администратора для целевого сервиса ClickHouse Cloud.
2. DB ClickPipe (Postgres, MySQL или MongoDB), созданный в сервисе ранее. Инфраструктура CDC создаётся вместе с первым ClickPipe, и с этого момента становятся доступны конечные точки масштабирования.


## Шаги по масштабированию DB ClickPipes {#cdc-scaling-steps}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
ORG_ID=<Идентификатор вашей организации ClickHouse>
SERVICE_ID=<Идентификатор вашего сервиса ClickHouse>
KEY_ID=<Идентификатор вашего ключа ClickHouse>
KEY_SECRET=<Секретный ключ ClickHouse>
```

Получите текущую конфигурацию масштабирования (необязательно):

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


# пример результата:

{
"result": {
"replicaCpuMillicores": 2000,
"replicaMemoryGb": 8
},
"requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
"status": 200
}

````

Задайте требуемое масштабирование. Поддерживаются конфигурации от 1 до 24 ядер CPU с объемом памяти (ГБ), равным учетверенному количеству ядер:

```bash
cat <<EOF | tee cdc_scaling.json
{
  "replicaCpuMillicores": 24000,
  "replicaMemoryGb": 96
}
EOF

curl --silent --user $KEY_ID:$KEY_SECRET \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
-d @cdc_scaling.json | jq
````

Дождитесь применения конфигурации (обычно 3-5 минут). После завершения масштабирования GET-эндпоинт будет возвращать новые значения:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


# пример результата:

{
"result": {
"replicaCpuMillicores": 24000,
"replicaMemoryGb": 96
},
"requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
"status": 200
}

```

```
