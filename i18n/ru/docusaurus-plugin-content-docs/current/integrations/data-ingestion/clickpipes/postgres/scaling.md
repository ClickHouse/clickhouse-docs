---
title: 'Масштабирование DB ClickPipes через OpenAPI'
description: 'Документация по масштабированию DB ClickPipes через OpenAPI'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'Масштабирование'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

:::caution Большинству пользователей этот API не понадобится
Базовая конфигурация DB ClickPipes рассчитана на то, чтобы «из коробки» обрабатывать большинство нагрузок. Если вы считаете, что вашей нагрузке требуется масштабирование, откройте [запрос в поддержку](https://clickhouse.com/support/program), и мы поможем вам подобрать оптимальные настройки для вашего сценария.
:::

API масштабирования может быть полезен для:

- Крупных начальных загрузок (свыше 4 ТБ)
- Максимально быстрой миграции умеренных объёмов данных
- Поддержки более 8 CDC ClickPipes в рамках одного сервиса

Прежде чем увеличивать масштаб, учтите следующее:

- Убедитесь, что в исходной БД достаточно доступных ресурсов
- Сначала настройте [параллелизм и разбиение начальной загрузки](/integrations/clickpipes/postgres/parallel_initial_load) при создании ClickPipe
- Проверьте наличие [долго выполняющихся транзакций](/integrations/clickpipes/postgres/sync_control#transactions) в источнике, которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально увеличит ваши расходы на вычислительные ресурсы ClickPipes.** Если вы масштабируете сервис только для начальных загрузок, важно уменьшить масштаб после завершения снимка, чтобы избежать непредвиденных затрат. Дополнительные сведения о ценах см. в разделе [Тарифы на Postgres CDC](/cloud/reference/billing/clickpipes).

## Предварительные требования для этого процесса {#prerequisites}

Прежде чем начать, вам потребуется:

1. [API-ключ ClickHouse](/cloud/manage/openapi) с правами Admin для целевого сервиса ClickHouse Cloud.
2. Конвейер ClickPipe для БД (Postgres, MySQL или MongoDB), уже созданный в сервисе. Инфраструктура CDC создаётся вместе с первым ClickPipe, и с этого момента становятся доступны API-эндпоинты масштабирования.

## Порядок масштабирования DB ClickPipes {#cdc-scaling-steps}

Перед выполнением команд задайте следующие переменные окружения:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

Получите текущую конфигурацию масштабирования (при необходимости):

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 2000,
    "replicaMemoryGb": 8
  },
  "requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
  "status": 200
}
```

Укажите требуемый уровень масштабирования. Поддерживаются конфигурации с 1–24 ядрами CPU и объёмом памяти (ГБ), равным 4× числу ядер:

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
```

Дождитесь применения конфигурации (обычно это занимает 3–5 минут). После завершения масштабирования GET-эндпоинт отобразит новые значения:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 24000,
    "replicaMemoryGb": 96
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```
