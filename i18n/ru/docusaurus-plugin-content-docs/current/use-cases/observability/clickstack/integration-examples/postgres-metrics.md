---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'Мониторинг метрик PostgreSQL с помощью ClickStack'
sidebar_label: 'Метрики PostgreSQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик PostgreSQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'metrics', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг метрик PostgreSQL с помощью ClickStack {#postgres-metrics-clickstack}

:::note[Краткое содержание]
Это руководство показывает, как отслеживать метрики производительности PostgreSQL с помощью ClickStack, настроив приёмник PostgreSQL в коллекторе OpenTelemetry. Вы узнаете:

- Как настроить коллектор OTel для сбора метрик PostgreSQL
- Как развернуть ClickStack с вашей конфигурацией
- Как использовать готовую панель мониторинга для визуализации производительности PostgreSQL (транзакции, соединения, размер базы данных, процент попаданий в кеш)

Доступен демонстрационный набор данных с примерами метрик, если вы хотите протестировать интеграцию перед настройкой вашей production-базы данных PostgreSQL.

Требуемое время: 10–15 минут
:::


## Интеграция с существующим PostgreSQL {#existing-postgres}

В этом разделе описывается настройка вашей существующей инсталляции PostgreSQL для отправки метрик в ClickStack с помощью коллектора ClickStack OTel с приёмником PostgreSQL.

Если вы хотите протестировать интеграцию метрик PostgreSQL до настройки собственной существующей инсталляции, вы можете воспользоваться нашим предварительно настроенным демонстрационным набором данных в [следующем разделе](#demo-dataset).

##### Предварительные условия {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая инсталляция PostgreSQL (версии 9.6 или новее)
- Сетевой доступ от ClickStack к PostgreSQL (порт по умолчанию 5432)
- Пользователь мониторинга PostgreSQL с соответствующими правами

<VerticalStepper headerLevel="h4">

#### Убедитесь, что пользователь мониторинга имеет необходимые права {#monitoring-permissions}

Приёмнику PostgreSQL требуется пользователь с правами чтения представлений статистики. Назначьте роль `pg_monitor` вашему пользователю мониторинга:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### Создайте пользовательскую конфигурацию коллектора OTel {#create-custom-config}

ClickStack позволяет расширять базовую конфигурацию коллектора OpenTelemetry путём подключения пользовательского файла конфигурации и задания переменной окружения.

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
      - your_application_db # Замените на реальные имена ваших баз данных
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
Параметр `tls: insecure: true` отключает проверку SSL для среды разработки/тестирования. Для продуктивного PostgreSQL с включённым SSL удалите эту строку или настройте корректные сертификаты.
:::

#### Разверните ClickStack с пользовательской конфигурацией {#deploy-clickstack}

Подключите вашу пользовательскую конфигурацию:

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

После завершения настройки войдите в HyperDX и убедитесь, что метрики поступают:

1. Перейдите в раздел Metrics explorer
2. Найдите метрики, имена которых начинаются с postgresql (например, postgresql.backends, postgresql.commits).
3. Вы должны увидеть точки данных метрик, появляющиеся с настроенным вами интервалом сбора

Когда метрики начинают поступать, перейдите к разделу [Панели и визуализация](#dashboards), чтобы импортировать готовую панель.

</VerticalStepper>


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик PostgreSQL перед настройкой производственных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными шаблонами метрик PostgreSQL.

:::note[Только метрики уровня базы данных]
Этот демонстрационный набор данных включает только метрики уровня базы данных для уменьшения размера примера. Метрики таблиц и индексов собираются автоматически при мониторинге реальной базы данных PostgreSQL.
:::

<VerticalStepper headerLevel="h4">

#### Скачайте демонстрационный набор данных метрик {#download-sample}

Скачайте предварительно сгенерированные файлы метрик (24 часа метрик PostgreSQL с реалистичными шаблонами):


```bash
# Загрузка метрик gauge (соединения, размер базы данных)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv
```


# Загрузка суммарных метрик (коммиты, откаты, операции)

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv

````

Набор данных включает реалистичные сценарии:
- **Утренний всплеск подключений (08:00)** - Пик входов в систему
- **Проблема производительности кэша (11:00)** - Всплеск blocks_read
- **Ошибка приложения (14:00-14:30)** - Доля откатов возрастает до 15%
- **Инциденты взаимоблокировок (14:15, 16:30)** - Редкие взаимоблокировки

#### Запуск ClickStack {#start-clickstack}

Запустите экземпляр ClickStack:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

Подождите примерно 30 секунд, пока ClickStack полностью запустится.

#### Загрузка метрик в ClickStack {#load-metrics}

Загрузите метрики напрямую в ClickHouse:


```bash
# Загрузка метрик gauge
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# Загрузка метрик суммы

cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### Проверка метрик в HyperDX {#verify-metrics-demo}

После загрузки самый быстрый способ просмотреть метрики — воспользоваться готовым дашбордом.

Перейдите к разделу [Дашборды и визуализация](#dashboards), чтобы импортировать дашборд и просмотреть множество метрик PostgreSQL одновременно.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Установите временной диапазон **2025-11-09 00:00:00 - 2025-11-12 00:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. После того как вы увидите метрики, можно сузить диапазон до 24 часов для более четкой визуализации.
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

<Image img={finish_import} alt='Диалог завершения импорта' />

#### Просмотр дашборда {#created-dashboard}

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

Проверьте логи коллектора OTel:

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

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических пороговых значений (лимиты подключений, высокая частота откатов, низкий процент попаданий в кэш)
- Включите мониторинг на уровне запросов с помощью расширения `pg_stat_statements`
- Настройте мониторинг нескольких экземпляров PostgreSQL, дублируя конфигурацию приёмника с разными конечными точками и именами сервисов


## Переход к промышленной эксплуатации {#going-to-production}

Данное руководство расширяет возможности встроенного в ClickStack сборщика OpenTelemetry Collector для быстрой настройки. Для промышленных развертываний рекомендуется использовать собственный экземпляр OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. Конфигурацию для промышленной эксплуатации см. в разделе [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).
