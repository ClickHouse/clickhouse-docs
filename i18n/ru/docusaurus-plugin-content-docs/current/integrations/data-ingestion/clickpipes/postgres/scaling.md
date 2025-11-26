---
title: 'Масштабирование DB ClickPipes через OpenAPI'
description: 'Документация по масштабированию DB ClickPipes через OpenAPI'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'Масштабирование'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

:::caution Большинству пользователей этот API не понадобится
Стандартная конфигурация DB ClickPipes разработана так, чтобы обрабатывать большинство нагрузок «из коробки». Если вы считаете, что вашей нагрузке требуется масштабирование, откройте [заявку в поддержку](https://clickhouse.com/support/program), и мы подберём оптимальные параметры для вашего сценария.
:::

API масштабирования может быть полезен для:
- Крупных начальных загрузок (более 4 ТБ)
- Максимально быстрой миграции умеренного объёма данных
- Поддержки более 8 CDC ClickPipes в рамках одного сервиса

Прежде чем масштабировать, учтите следующее:
- Убедитесь, что исходная БД располагает достаточной свободной мощностью
- Сначала настройте [параллелизм и разбиение начальной загрузки](/integrations/clickpipes/postgres/parallel_initial_load) при создании ClickPipe
- Проверьте наличие [долго выполняющихся транзакций](/integrations/clickpipes/postgres/sync_control#transactions) на источнике, которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально увеличит ваши затраты на вычислительные ресурсы ClickPipes.** Если вы масштабируете только для начальных загрузок, важно уменьшить масштаб после завершения снимка, чтобы избежать неожиданных расходов. Подробности о ценообразовании см. в разделе [Тарифы Postgres CDC](/cloud/reference/billing/clickpipes).



## Предварительные требования для этого процесса {#prerequisites}

Прежде чем начать, вам потребуется:

1. [Ключ API ClickHouse](/cloud/manage/openapi) с правами Admin на целевом сервисе ClickHouse Cloud.
2. ClickPipe для БД (Postgres, MySQL или MongoDB), который уже был создан в сервисе. Инфраструктура CDC создаётся вместе с первым ClickPipe, и с этого момента становятся доступны эндпоинты масштабирования.



## Порядок масштабирования ClickPipes для БД

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
ORG_ID=<ID организации ClickHouse>
SERVICE_ID=<ID сервиса ClickHouse>
KEY_ID=<ID ключа ClickHouse>
KEY_SECRET=<Секретный ключ ClickHouse>
```

Получите текущую конфигурацию масштабирования (при необходимости):

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

Задайте требуемое масштабирование. Поддерживаются конфигурации от 1 до 24 ядер CPU с объёмом памяти (ГБ), в 4 раза превышающим количество ядер:

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

Дождитесь применения конфигурации (обычно 3–5 минут). После завершения масштабирования конечная точка GET вернёт новые значения:

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
