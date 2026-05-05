---
title: "Масштабирование DB ClickPipes с помощью OpenAPI"
description: "Как масштабировать Postgres ClickPipes с помощью OpenAPI"
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: "Масштабирование"
doc_type: "guide"
keywords:
  ["clickpipes", "postgresql", "cdc", "ингестия данных", "синхронизация в реальном времени"]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution Большинству пользователей этот API не потребуется
Конфигурация DB ClickPipes по умолчанию рассчитана на то, чтобы сразу справляться с большинством рабочих нагрузок. Если вы считаете, что вашей рабочей нагрузке требуется масштабирование, создайте [обращение](https://clickhouse.com/support/program), и мы подскажем оптимальные настройки для вашего сценария использования.
:::

API масштабирования может быть полезен в следующих случаях:

* Большие начальные загрузки (более 4 ТБ)
* Перенос умеренного объёма данных в максимально короткие сроки
* Поддержка более 8 CDC ClickPipes в одном сервисе

Прежде чем выполнять масштабирование, учтите следующее:

* Убедитесь, что у исходной БД достаточно доступных ресурсов
* Сначала настройте [параллелизм начальной загрузки и партиционирование](/integrations/clickpipes/postgres/parallel_initial_load) при создании ClickPipe
* Проверьте, нет ли в источнике [долгих транзакций](/integrations/clickpipes/postgres/sync_control#transactions), которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально повысит ваши расходы на вычислительные ресурсы ClickPipes.** Если вы увеличиваете масштаб только для начальных загрузок, важно уменьшить его после завершения снимка, чтобы избежать неожиданных расходов. Подробнее о ценах см. в разделе [Postgres CDC Pricing](/cloud/reference/billing/clickpipes).

## Требования для этого процесса \{#prerequisites\}

Прежде чем начать, вам потребуется:

1. [API-ключ ClickHouse](/cloud/manage/openapi) с правами Admin для целевого сервиса ClickHouse Cloud.
2. Ранее созданный в сервисе DB ClickPipe (Postgres, MySQL или MongoDB). Инфраструктура CDC создается вместе с первым ClickPipe, и с этого момента становятся доступны конечные точки для масштабирования.

## Как масштабировать DB ClickPipes \{#cdc-scaling-steps\}

Перед выполнением команд задайте следующие переменные окружения:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

Получите текущие настройки масштабирования (необязательно):

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

Задайте нужные параметры масштабирования. Поддерживаются конфигурации с 1–24 ядрами CPU, при этом объём памяти (ГБ) должен в 4 раза превышать число ядер:

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

Подождите, пока изменения конфигурации применятся (обычно 3–5 минут). После завершения масштабирования конечная точка GET отобразит новые значения:

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