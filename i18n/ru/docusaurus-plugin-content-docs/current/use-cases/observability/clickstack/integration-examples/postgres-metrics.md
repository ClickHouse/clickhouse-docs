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

:::note[Кратко]
В этом руководстве показано, как отслеживать метрики производительности PostgreSQL с помощью ClickStack, настроив ресивер PostgreSQL в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик PostgreSQL
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовый дашборд для визуализации производительности PostgreSQL (транзакции, подключения, размер базы данных, коэффициенты попаданий в кэш)

Демонстрационный набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию до настройки вашей продакшн-базы данных PostgreSQL.

Необходимое время: 10–15 минут
:::

## Интеграция с существующим PostgreSQL {#existing-postgres}

В этом разделе описывается настройка вашей существующей установки PostgreSQL для отправки метрик в ClickStack путем настройки OTel collector из состава ClickStack с приемником PostgreSQL.

Если вы хотите протестировать интеграцию метрик PostgreSQL до настройки собственной установки, вы можете воспользоваться нашим предварительно настроенным демонстрационным набором данных в [следующем разделе](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Установленный PostgreSQL (версии 9.6 или новее)
- Сетевой доступ от ClickStack к PostgreSQL (порт по умолчанию 5432)
- Пользователь PostgreSQL для мониторинга с соответствующими правами

<VerticalStepper headerLevel="h4">

#### Убедитесь, что пользователь мониторинга имеет необходимые права {#monitoring-permissions}

Приёмнику PostgreSQL требуется пользователь с правами чтения статистических представлений. Назначьте роль `pg_monitor` пользователю мониторинга:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### Создайте пользовательскую конфигурацию OTel collector {#create-custom-config}

ClickStack позволяет расширять базовую конфигурацию OpenTelemetry collector, монтируя пользовательский конфигурационный файл и устанавливая переменную окружения.

Создайте `postgres-metrics.yaml`:

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
Параметр `tls: insecure: true` отключает проверку SSL при разработке и тестировании. Для продуктивной среды PostgreSQL с включённым SSL удалите эту строку или настройте корректные сертификаты.
:::

#### Разверните ClickStack с пользовательской конфигурацией {#deploy-clickstack}

Смонтируйте пользовательскую конфигурацию:

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

1. Перейдите в раздел Metrics explorer
2. Найдите метрики, начинающиеся с postgresql. (например, postgresql.backends, postgresql.commits)
3. Вы должны увидеть точки данных метрик, появляющиеся с заданным вами интервалом сбора

После того как метрики начнут поступать, перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать преднастроенный дашборд.

</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик PostgreSQL перед настройкой своих производственных систем, мы предоставляем заранее сгенерированный набор данных с реалистичными паттернами метрик PostgreSQL.

:::note[Только метрики на уровне базы данных]
Этот демонстрационный набор данных включает только метрики на уровне базы данных, чтобы сделать пример данных компактным. Метрики таблиц и индексов собираются автоматически при мониторинге реальной базы данных PostgreSQL.
:::

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора метрик {#download-sample}

Загрузите заранее сгенерированные файлы метрик (24 часа метрик PostgreSQL с реалистичными паттернами):

```bash
# Загрузка gauge-метрик (подключения, размер базы данных)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# Загрузка sum-метрик (коммиты, откаты, операции)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

В набор данных заложены реалистичные сценарии:
- **Утренний всплеск подключений (08:00)** — массовые логины
- **Проблема с производительностью кеша (11:00)** — всплеск Blocks_read
- **Ошибка приложения (14:00-14:30)** — доля откатов возрастает до 15%
- **Инциденты дедлоков (14:15, 16:30)** — редкие дедлоки

#### Запуск ClickStack {#start-clickstack}

Запустите экземпляр ClickStack:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите примерно 30 секунд, чтобы ClickStack полностью запустился.

#### Загрузка метрик в ClickStack {#load-metrics}

Загрузите метрики напрямую в ClickHouse:

```bash
# Загрузка gauge-метрик
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Загрузка sum-метрик
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Проверка метрик в HyperDX {#verify-metrics-demo}

После загрузки самый быстрый способ просмотреть метрики — использовать преднастроенный дашборд.

Перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать дашборд и просмотреть множество метрик PostgreSQL одновременно.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Установите диапазон времени на **2025-11-09 00:00:00 - 2025-11-12 00:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. После того как вы увидите метрики, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы начать мониторинг PostgreSQL с помощью ClickStack, мы предоставляем базовые визуализации для метрик PostgreSQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под иконкой с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `postgres-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми предустановленными визуализациями:

<Image img={example_dashboard} alt="Дашборд метрик PostgreSQL"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** (при необходимости скорректируйте под ваш часовой пояс). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается {#troubleshooting-not-loading}

Убедитесь, что задана переменная окружения:

```bash
docker exec <имя-контейнера> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что файл пользовательской конфигурации смонтирован:

```bash
docker exec <имя-контейнера> cat /etc/otelcol-contrib/custom.config.yaml
```

### Метрики не отображаются в HyperDX {#no-metrics}

Убедитесь, что есть доступ к PostgreSQL:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

Проверьте логи коллектора OTel:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### Ошибки аутентификации {#auth-errors}

Убедитесь, что пароль указан верно:

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

Проверьте учетные данные непосредственно:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```

## Дальнейшие шаги {#next-steps}

После настройки мониторинга метрик PostgreSQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических порогов (ограничения на количество подключений, высокая доля откатов транзакций, низкий коэффициент попаданий в кеш)
- Включите мониторинг на уровне запросов с помощью расширения `pg_stat_statements`
- Отслеживайте несколько экземпляров PostgreSQL, дублируя конфигурацию `receiver` с разными конечными точками и именами сервисов

## Переход в production {#going-to-production}

В этом руководстве для быстрой первоначальной настройки используется встроенный в ClickStack OTel collector. Для production-развертываний мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации production-среды.