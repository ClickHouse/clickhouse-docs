---
title: "Масштабирование MySQL ClickPipes через OpenAPI"
description: "Как масштабировать MySQL ClickPipes через OpenAPI"
slug: /integrations/clickpipes/mysql/scaling
sidebar_label: "Масштабирование"
doc_type: "guide"
keywords:
  ["clickpipes", "mysql", "cdc", "ингестия данных", "синхронизация в реальном времени", "масштабирование"]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution Большинству пользователей этот API не понадобится
Конфигурация DB ClickPipes по умолчанию рассчитана на то, чтобы без дополнительной настройки справляться с большинством рабочих нагрузок. Если вы считаете, что вашей рабочей нагрузке требуется масштабирование, создайте [обращение](https://clickhouse.com/support/program), и мы поможем подобрать оптимальные настройки для вашего сценария использования.
:::

API масштабирования может быть полезен в следующих случаях:

* Большие начальные загрузки (более 4 ТБ)
* Миграция умеренного объёма данных с максимально возможной скоростью
* Поддержка более 8 CDC ClickPipes в рамках одного сервиса

Прежде чем увеличивать масштаб, учтите следующее:

* Убедитесь, что у исходной БД достаточно доступных ресурсов
* Сначала настройте [параллелизм начальной загрузки и партиционирование](/integrations/clickpipes/mysql/parallel_initial_load) при создании ClickPipe
* Проверьте, нет ли в источнике [длительных транзакций](/integrations/clickpipes/mysql/sync_control#transactions), которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально повысит ваши расходы на вычислительные ресурсы ClickPipes.** Если вы масштабируете систему только ради начальных загрузок, важно уменьшить масштаб после завершения снимка, чтобы избежать неожиданных расходов. Подробнее о ценах см. в разделе [тарифы ClickPipes](/cloud/reference/billing/clickpipes).

## Предварительные требования для этого процесса \{#prerequisites\}

Прежде чем начать, вам потребуется:

1. [API-ключ ClickHouse](/cloud/manage/openapi) с правами Admin на целевом сервисе ClickHouse Cloud.
2. DB ClickPipe (Postgres, MySQL или MongoDB), ранее созданный в сервисе. Инфраструктура CDC создается при создании первого ClickPipe, и после этого становятся доступны конечные точки масштабирования.

## Как масштабировать DB ClickPipes \{#cdc-scaling-steps\}

Перед выполнением любых команд задайте следующие переменные окружения:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

При необходимости получите текущую конфигурацию масштабирования:

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

Задайте требуемый масштаб. Поддерживаются конфигурации с 1–24 ядрами CPU, при этом объём памяти (ГБ) должен в 4 раза превышать число ядер:

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

Подождите, пока изменения конфигурации распространятся (обычно 3–5 минут). После завершения масштабирования конечная точка GET отразит новые значения:

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