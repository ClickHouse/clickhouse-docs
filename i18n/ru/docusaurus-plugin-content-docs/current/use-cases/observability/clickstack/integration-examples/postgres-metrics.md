---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: 'Мониторинг метрик PostgreSQL с помощью ClickStack'
sidebar_label: 'Метрики PostgreSQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик PostgreSQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'метрики', 'OTel', 'ClickStack', 'мониторинг баз данных']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг метрик PostgreSQL с помощью ClickStack {#postgres-metrics-clickstack}

:::note[Кратко]
В этом руководстве показано, как отслеживать метрики производительности PostgreSQL с помощью ClickStack, настроив PostgreSQL receiver в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик PostgreSQL
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации производительности PostgreSQL (транзакции, соединения, размер базы данных, коэффициенты попаданий в кэш)

Доступен демонстрационный набор данных с примерными метриками, если вы хотите протестировать интеграцию перед настройкой вашей продакшн-базы данных PostgreSQL.

Требуемое время: 10–15 минут
:::



## Интеграция с существующим PostgreSQL {#existing-postgres}

В этом разделе описывается настройка вашей существующей установки PostgreSQL для отправки метрик в ClickStack путем настройки OTel collector ClickStack с использованием приемника PostgreSQL (PostgreSQL receiver).

Если вы хотите протестировать интеграцию метрик PostgreSQL до настройки собственной установки, вы можете использовать наш предварительно сконфигурированный демонстрационный датасет в [следующем разделе](#demo-dataset).

##### Предварительные требования {#prerequisites}
- Запущенный экземпляр ClickStack
- Существующая установка PostgreSQL (версии 9.6 или новее)
- Сетевой доступ от ClickStack к PostgreSQL (порт по умолчанию 5432)
- Пользователь для мониторинга PostgreSQL с соответствующими правами

<VerticalStepper headerLevel="h4">

#### Убедитесь, что пользователь мониторинга имеет необходимые права {#monitoring-permissions}

PostgreSQL receiver требует пользователя с правами на чтение статистических представлений. Назначьте роль `pg_monitor` вашему пользователю мониторинга:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### Создайте пользовательскую конфигурацию OTel collector {#create-custom-config}

ClickStack позволяет расширять базовую конфигурацию OpenTelemetry collector путем монтирования пользовательского конфигурационного файла и задания переменной среды.

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
Настройка `tls: insecure: true` отключает проверку SSL для разработки и тестирования. Для продакшн-среды PostgreSQL с включенным SSL удалите эту строку или настройте корректные сертификаты.
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

1. Перейдите в раздел Metrics explorer
2. Найдите метрики, начинающиеся с postgresql. (например, postgresql.backends, postgresql.commits)
3. Вы должны увидеть точки данных метрик, появляющиеся с заданным вами интервалом сбора

После того как метрики начинают поступать, перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать преднастроенный дашборд.

</VerticalStepper>



## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик PostgreSQL перед настройкой производственных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными паттернами метрик PostgreSQL.

:::note[Только метрики уровня базы данных]
Этот демонстрационный набор данных включает только метрики уровня базы данных, чтобы сохранить компактность примера данных. Метрики таблиц и индексов собираются автоматически при мониторинге реальной базы данных PostgreSQL.
:::

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных метрик {#download-sample}

Загрузите предварительно сгенерированные файлы метрик (24 часа метрик PostgreSQL с реалистичными паттернами):


```bash
# Загрузите метрики типа gauge (соединения, размер базы данных)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv
```


# Скачать суммарные метрики (коммиты, откаты, операции)

curl -O [https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv](https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv)

````

Набор данных включает реалистичные паттерны:
- **Утренний всплеск подключений (08:00)** — пик входов в систему
- **Проблема производительности кэша (11:00)** — всплеск Blocks_read
- **Ошибка приложения (14:00-14:30)** — частота откатов возрастает до 15%
- **Инциденты взаимоблокировок (14:15, 16:30)** — редкие взаимоблокировки

#### Запуск ClickStack                    

Запустите экземпляр ClickStack:

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

Подождите примерно 30 секунд, чтобы ClickStack полностью запустился.

#### Загрузка метрик в ClickStack

Загрузите метрики непосредственно в ClickHouse:


```bash
# Загрузка метрик gauge
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# Загрузка суммарных метрик

cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### Проверка метрик в HyperDX {#verify-metrics-demo}

После загрузки самый быстрый способ просмотреть метрики — воспользоваться готовой панелью мониторинга.

Перейдите к разделу [Панели мониторинга и визуализация](#dashboards), чтобы импортировать панель и просмотреть множество метрик PostgreSQL одновременно.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Установите временной диапазон **2025-11-09 00:00:00 - 2025-11-12 00:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. Увидев метрики, вы можете сузить диапазон до 24-часового периода для более четкой визуализации.
:::

</VerticalStepper>
```


## Дашборды и визуализация {#dashboards}

Чтобы начать мониторинг PostgreSQL с помощью ClickStack, мы предоставляем базовые визуализации для метрик PostgreSQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу в меню с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `postgres-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотрите дашборд {#created-dashboard}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд метрик PostgreSQL"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** (откорректируйте в соответствии с вашим часовым поясом). У импортированного дашборда по умолчанию не будет задан диапазон времени.
:::

</VerticalStepper>



## Поиск и устранение неполадок

### Пользовательская конфигурация не загружается

Убедитесь, что установлена переменная среды:

```bash
docker exec <имя-контейнера> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Проверьте, что пользовательский конфигурационный файл смонтирован:

```bash
docker exec <имя-контейнера> cat /etc/otelcol-contrib/custom.config.yaml
```

### Метрики не отображаются в HyperDX

Проверьте, что PostgreSQL доступен:

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

Проверьте логи OTel collector:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### Ошибки аутентификации

Убедитесь, что пароль указан корректно:

```bash
docker exec <clickstack-контейнер> printenv POSTGRES_PASSWORD
```

Проверьте учетные данные непосредственно:

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## Дальнейшие шаги {#next-steps}

После настройки мониторинга метрик PostgreSQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических пороговых значений (ограничения по количеству подключений, высокая доля откатов транзакций, низкий коэффициент попаданий в кэш)
- Включите мониторинг запросов с помощью расширения `pg_stat_statements`
- Отслеживайте несколько экземпляров PostgreSQL, дублируя конфигурацию receiver с разными endpoint и именами сервисов



## Переход в продакшен {#going-to-production}

В этом руководстве используется встроенный в ClickStack OpenTelemetry Collector для быстрой настройки. Для продакшен-развертываний мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации продакшен-среды.
