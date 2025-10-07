---
'title': 'Масштабирование DB ClickPipes через OpenAPI'
'description': 'Документация по масштабированию DB ClickPipes через OpenAPI'
'slug': '/integrations/clickpipes/postgres/scaling'
'sidebar_label': 'Масштабирование'
'doc_type': 'guide'
---
:::caution Большинство пользователей не нуждаются в этом API
Настройки по умолчанию для DB ClickPipes предназначены для обработки большинства рабочих нагрузок «из коробки». Если вы считаете, что ваша рабочая нагрузка требует масштабирования, откройте [техподдержку](https://clickhouse.com/support/program), и мы поможем вам настроить оптимальные параметры для вашего случая использования.
:::

API масштабирования может быть полезен для:
- Больших первоначальных загрузок (более 4 ТБ)
- Быстрой миграции умеренного объема данных
- Поддержки более 8 CDC ClickPipes на одной службе

Перед попыткой масштабирования учтите:
- Убедитесь, что исходная БД имеет достаточную доступную емкость
- Сначала отрегулируйте [параллелизм и партиционирование первоначальной загрузки](/integrations/clickpipes/postgres/parallel_initial_load) при создании ClickPipe
- Проверьте наличие [долговременных транзакций](/integrations/clickpipes/postgres/sync_control#transactions) на источнике, которые могут вызывать задержки CDC

**Увеличение масштаба пропорционально увеличит ваши вычислительные расходы на ClickPipes.** Если вы масштабируете только для первоначальных загрузок, важно уменьшить масштаб после завершения снимка, чтобы избежать неожиданных расходов. Для получения дополнительной информации о ценах смотрите [Цены на Postgres CDC](/cloud/reference/billing/clickpipes).

## Предварительные условия для этого процесса {#prerequisites}

Перед началом вам потребуется:

1. [Ключ API ClickHouse](/cloud/manage/openapi) с правами администратора на целевой службе ClickHouse Cloud.
2. DB ClickPipe (Postgres, MySQL или MongoDB), созданный в службе в какой-то момент времени. Инфраструктура CDC создается вместе с первым ClickPipe, и конечные точки масштабирования становятся доступными с этого момента.

## Шаги для масштабирования DB ClickPipes {#cdc-scaling-steps}

Установите следующие переменные окружения перед выполнением любых команд:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

Получите текущую конфигурацию масштабирования (по желанию):

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

Установите желаемое масштабирование. Поддерживаемые конфигурации включают 1-24 ядра CPU с памятью (ГБ), установленной на уровне 4× числа ядер:

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

Подождите, пока конфигурация распространится (обычно 3-5 минут). После завершения масштабирования конечная точка GET отразит новые значения:

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