---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'Мониторинг метрик PostgreSQL с помощью ClickStack'
sidebar_label: 'Метрики PostgreSQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик PostgreSQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'метрики', 'OTEL', 'ClickStack', 'мониторинг баз данных']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг метрик PostgreSQL с помощью ClickStack {#postgres-metrics-clickstack}

:::note[Краткое содержание]
Это руководство показывает, как отслеживать метрики производительности PostgreSQL с помощью ClickStack, настроив приемник PostgreSQL в коллекторе OpenTelemetry. Вы узнаете, как:

- Настроить коллектор OTel для сбора метрик PostgreSQL
- Развернуть ClickStack с вашей конфигурацией
- Использовать готовую панель мониторинга для визуализации производительности PostgreSQL (транзакции, подключения, размер базы данных, коэффициенты попаданий в кеш)

Демонстрационный набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию перед настройкой вашей production-базы данных PostgreSQL.

Требуемое время: 10–15 минут
:::


## Интеграция с существующей PostgreSQL {#existing-postgres}

В этом разделе описывается настройка существующей установки PostgreSQL для отправки метрик в ClickStack путём настройки коллектора OTel в ClickStack с приёмником PostgreSQL.

Если вы хотите протестировать интеграцию метрик PostgreSQL перед настройкой собственной установки, вы можете использовать наш предварительно настроенный демонстрационный набор данных в [следующем разделе](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка PostgreSQL (версия 9.6 или новее)
- Сетевой доступ от ClickStack к PostgreSQL (порт по умолчанию 5432)
- Пользователь мониторинга PostgreSQL с соответствующими правами доступа

<VerticalStepper headerLevel="h4">

#### Убедитесь, что пользователь мониторинга имеет необходимые права доступа {#monitoring-permissions}

Приёмнику PostgreSQL требуется пользователь с правами чтения представлений статистики. Предоставьте роль `pg_monitor` вашему пользователю мониторинга:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### Создайте пользовательскую конфигурацию коллектора OTel {#create-custom-config}

ClickStack позволяет расширить базовую конфигурацию коллектора OpenTelemetry путём монтирования пользовательского файла конфигурации и установки переменной окружения.

Создайте файл `postgres-metrics.yaml`:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # Замените на фактические имена ваших баз данных
    collection_interval: 30s
    tls:
      insecure: true

processors:
  resourcedetection:
    detectors: [env, system, docker]
    timeout: 5s
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  clickhouse:
    endpoint: tcp://localhost:9000
    database: default
    ttl: 96h

service:
  pipelines:
    metrics/postgres:
      receivers: [postgresql]
      processors: [resourcedetection, batch]
      exporters: [clickhouse]
```

:::note
Параметр `tls: insecure: true` отключает проверку SSL для разработки и тестирования. Для производственной PostgreSQL с включённым SSL удалите эту строку или настройте соответствующие сертификаты.
:::

#### Разверните ClickStack с пользовательской конфигурацией {#deploy-clickstack}

Смонтируйте вашу пользовательскую конфигурацию:

```bash
docker run -d \
  --name clickstack-postgres \
  -p 8123:8123 -p 9000:9000 -p 4317:4317 -p 4318:4318 \
  -e HYPERDX_API_KEY=your-api-key \
  -e CLICKHOUSE_PASSWORD=your-clickhouse-password \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack:latest
```

#### Проверьте сбор метрик {#verify-metrics}

После настройки войдите в HyperDX и убедитесь, что метрики поступают:

1. Перейдите в обозреватель метрик (Metrics explorer)
2. Найдите метрики, начинающиеся с postgresql. (например, postgresql.backends, postgresql.commits)
3. Вы должны увидеть точки данных метрик, появляющиеся с настроенным интервалом сбора

После того как метрики начнут поступать, перейдите к разделу [Дашборды и визуализация](#dashboards) для импорта предварительно созданного дашборда.

</VerticalStepper>


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик PostgreSQL перед настройкой производственных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными паттернами метрик PostgreSQL.

:::note[Только метрики на уровне базы данных]
Этот демонстрационный набор данных включает только метрики на уровне базы данных, чтобы сохранить компактность примера. Метрики таблиц и индексов собираются автоматически при мониторинге реальной базы данных PostgreSQL.
:::

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных метрик {#download-sample}

Загрузите предварительно сгенерированные файлы метрик (24 часа метрик PostgreSQL с реалистичными паттернами):


```bash
# Скачать метрики типа gauge (соединения, размер базы данных)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv
```


# Загрузка суммарных метрик (коммиты, откаты, операции)

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv

````

Набор данных включает реалистичные паттерны:
- **Утренний всплеск подключений (08:00)** — Пик входов в систему
- **Проблема производительности кэша (11:00)** — Всплеск blocks_read
- **Ошибка приложения (14:00-14:30)** — Частота откатов возрастает до 15%
- **Инциденты взаимоблокировок (14:15, 16:30)** — Редкие взаимоблокировки

#### Запуск ClickStack {#start-clickstack}

Запустите экземпляр ClickStack:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

Подождите примерно 30 секунд для полного запуска ClickStack.

#### Загрузка метрик в ClickStack {#load-metrics}

Загрузите метрики напрямую в ClickHouse:


```bash
# Загрузка метрик gauge
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# Загрузка метрик типа Sum

cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### Проверка метрик в HyperDX {#verify-metrics-demo}

После загрузки самый быстрый способ просмотреть метрики — воспользоваться готовой панелью мониторинга.

Перейдите к разделу [Панели мониторинга и визуализация](#dashboards), чтобы импортировать панель и просмотреть множество метрик PostgreSQL одновременно.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Установите временной диапазон **2025-11-09 00:00:00 - 2025-11-12 00:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. После того как вы увидите метрики, можно сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>
```


## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг PostgreSQL с помощью ClickStack, мы предоставляем необходимые визуализации для метрик PostgreSQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком многоточия

<Image img={import_dashboard} alt='Кнопка импорта дашборда' />

3. Загрузите файл `postgres-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt='Диалоговое окно завершения импорта' />

#### Просмотрите дашборд {#created-dashboard}

Дашборд будет создан со всеми предварительно настроенными визуализациями:

<Image img={example_dashboard} alt='Дашборд метрик PostgreSQL' />

:::note
Для демонстрационного набора данных установите временной диапазон **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). По умолчанию импортированный дашборд не имеет указанного временного диапазона.
:::

</VerticalStepper>


## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается {#troubleshooting-not-loading}

Убедитесь, что переменная окружения установлена:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что пользовательский файл конфигурации смонтирован:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### Метрики не отображаются в HyperDX {#no-metrics}

Убедитесь, что PostgreSQL доступен:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

Проверьте логи сборщика OTel:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### Ошибки аутентификации {#auth-errors}

Убедитесь, что пароль установлен корректно:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

Проверьте учетные данные напрямую:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## Следующие шаги {#next-steps}

После настройки мониторинга метрик PostgreSQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических пороговых значений (лимиты подключений, высокий процент откатов транзакций, низкий процент попаданий в кэш)
- Включите мониторинг на уровне запросов с помощью расширения `pg_stat_statements`
- Настройте мониторинг нескольких экземпляров PostgreSQL путем дублирования конфигурации приемника с различными конечными точками и именами сервисов


## Переход к промышленной эксплуатации {#going-to-production}

Данное руководство расширяет встроенный в ClickStack сборщик OpenTelemetry Collector для быстрой настройки. Для промышленных развёртываний рекомендуется запускать собственный OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. Конфигурацию для промышленной среды см. в разделе [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).
