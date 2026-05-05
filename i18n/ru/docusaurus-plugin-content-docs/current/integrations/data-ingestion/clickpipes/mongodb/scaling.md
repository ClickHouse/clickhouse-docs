---
title: "Масштабирование ClickPipes для MongoDB через OpenAPI"
description: "Как масштабировать ClickPipes для MongoDB через OpenAPI"
slug: /integrations/clickpipes/mongodb/scaling
sidebar_label: "Масштабирование"
doc_type: "guide"
keywords:
  [
    "clickpipes",
    "mongodb",
    "cdc",
    "ингестия данных",
    "синхронизация в реальном времени",
    "масштабирование"
  ]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution Большинству пользователей этот API не понадобится
Конфигурация ClickPipes для БД по умолчанию рассчитана на обработку большинства рабочих нагрузок без дополнительной настройки. Если вы считаете, что вашей рабочей нагрузке требуется масштабирование, откройте [обращение](https://clickhouse.com/support/program), и мы поможем подобрать оптимальные настройки для вашего сценария использования.
:::

API масштабирования может быть полезен в следующих случаях:

* Крупные начальные загрузки (свыше 4 ТБ)
* Как можно более быстрая миграция умеренного объёма данных
* Поддержка более 8 CDC ClickPipes в рамках одного сервиса

Прежде чем увеличивать масштаб, учтите следующее:

* Убедитесь, что у исходной БД достаточно доступных ресурсов
* Проверьте [настройки интервала синхронизации и размера батча извлечения](/integrations/clickpipes/mongodb/sync_control), которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально повысит ваши затраты на вычислительные ресурсы ClickPipes.** Если вы увеличиваете масштаб только для начальных загрузок, важно уменьшить его после завершения снимка, чтобы избежать неожиданных расходов. Подробнее о ценах см. в разделе [тарифы ClickPipes](/cloud/reference/billing/clickpipes).

## Предварительные требования для этого процесса \{#prerequisites\}

Перед началом вам потребуется:

1. [API-ключ ClickHouse](/cloud/manage/openapi) с правами Admin для целевого сервиса ClickHouse Cloud.
2. DB ClickPipe (Postgres, MySQL или MongoDB), ранее созданный в сервисе. Инфраструктура CDC создается вместе с первым ClickPipe, и с этого момента становятся доступны конечные точки для масштабирования.

## Как масштабировать ClickPipes для БД \{#cdc-scaling-steps\}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

Получите текущую конфигурацию масштабирования (необязательно):

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

Задайте нужный масштаб. Поддерживаются конфигурации с 1–24 ядрами CPU, при этом объем памяти (ГБ) должен составлять 4× от числа ядер:

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

Подождите, пока изменения конфигурации распространятся (обычно 3–5 минут). После завершения масштабирования конечная точка GET будет отражать новые значения:

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