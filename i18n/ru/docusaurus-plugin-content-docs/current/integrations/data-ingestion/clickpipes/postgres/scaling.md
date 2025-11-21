---
title: 'Масштабирование DB ClickPipes через OpenAPI'
description: 'Документация по масштабированию DB ClickPipes через OpenAPI'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'Масштабирование'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

:::caution Большинству пользователей этот API не потребуется
Конфигурация DB ClickPipes по умолчанию рассчитана на обработку большинства рабочих нагрузок «из коробки». Если вы считаете, что вашей нагрузке требуется масштабирование, откройте [запрос в поддержку](https://clickhouse.com/support/program), и мы поможем подобрать оптимальные настройки под ваш сценарий.
:::

API масштабирования может быть полезен для:
- Крупных начальных загрузок (более 4 ТБ)
- Максимально быстрой миграции умеренного объёма данных
- Поддержки более чем 8 CDC ClickPipes в рамках одного сервиса

Прежде чем масштабировать, убедитесь в следующем:
- У исходной БД достаточно доступных ресурсов
- При создании ClickPipe предварительно настроен [параллелизм и разбиение начальной загрузки](/integrations/clickpipes/postgres/parallel_initial_load)
- На источнике нет [длительно выполняющихся транзакций](/integrations/clickpipes/postgres/sync_control#transactions), которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально увеличит ваши затраты на вычислительные ресурсы ClickPipes.** Если вы масштабируете только для начальных загрузок, важно уменьшить масштаб после завершения создания снимка, чтобы избежать неожиданных расходов. Подробности о ценах см. в разделе [Цены на Postgres CDC](/cloud/reference/billing/clickpipes).



## Предварительные требования {#prerequisites}

Перед началом работы вам потребуется:

1. [API-ключ ClickHouse](/cloud/manage/openapi) с правами администратора для целевого сервиса ClickHouse Cloud.
2. DB ClickPipe (Postgres, MySQL или MongoDB), развернутый в сервисе. Инфраструктура CDC создается вместе с первым ClickPipe, после чего становятся доступны конечные точки масштабирования.


## Шаги для масштабирования DB ClickPipes {#cdc-scaling-steps}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

Получите текущую конфигурацию масштабирования (опционально):

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

Задайте требуемое масштабирование. Поддерживаются конфигурации от 1 до 24 ядер CPU с объемом памяти (ГБ), равным 4× количеству ядер:

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

Дождитесь применения конфигурации (обычно 3-5 минут). После завершения масштабирования конечная точка GET будет возвращать новые значения:

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
