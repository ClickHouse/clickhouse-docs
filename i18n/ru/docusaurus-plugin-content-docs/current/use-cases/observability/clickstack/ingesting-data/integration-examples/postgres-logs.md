---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'Мониторинг логов PostgreSQL с помощью ClickStack'
sidebar_label: 'Логи PostgreSQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов PostgreSQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'логи', 'OTel', 'ClickStack', 'мониторинг баз данных']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг журналов PostgreSQL с помощью ClickStack \{#postgres-logs-clickstack\}

:::note[Кратко]
В этом руководстве показано, как настроить мониторинг PostgreSQL с помощью ClickStack, сконфигурировав OTel collector для приёма журналов сервера PostgreSQL. Вы узнаете, как:

- Настроить PostgreSQL на вывод журналов в формате CSV для структурированного парсинга
- Создать пользовательскую конфигурацию OTel collector для ингестии журналов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации данных журналов PostgreSQL (ошибки, медленные запросы, подключения)

Демонстрационный набор данных с примерами журналов доступен, если вы хотите протестировать интеграцию до настройки вашего production-кластера PostgreSQL.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим PostgreSQL \{#existing-postgres\}

В этом разделе рассматривается настройка вашей существующей установки PostgreSQL для отправки логов в ClickStack путём изменения конфигурации ClickStack OTel collector.

Если вы хотите протестировать интеграцию логов PostgreSQL до настройки собственной имеющейся среды, вы можете воспользоваться нашей преднастроенной конфигурацией и примером данных в разделе ["Демонстрационный набор данных"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Установленный PostgreSQL версии 9.6 или новее
- Доступ к изменению конфигурационных файлов PostgreSQL
- Достаточный объем дискового пространства для файлов журналов

<VerticalStepper headerLevel="h4">
  #### Настройте логирование PostgreSQL

  PostgreSQL поддерживает несколько форматов журналов. Для структурированного парсинга с OpenTelemetry рекомендуется использовать формат CSV, который обеспечивает согласованный и легко парсируемый вывод.

  Файл `postgresql.conf` обычно расположен по пути:

  * **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` или `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**: Конфигурация обычно задаётся с помощью переменных окружения или монтируемого конфигурационного файла

  Добавьте или измените следующие параметры в `postgresql.conf`:

  ```conf
  # Required for CSV logging
  logging_collector = on
  log_destination = 'csvlog'

  # Recommended: Connection logging
  log_connections = on
  log_disconnections = on

  # Optional: Tune based on your monitoring needs
  #log_min_duration_statement = 1000  # Log queries taking more than 1 second
  #log_statement = 'ddl'               # Log DDL statements (CREATE, ALTER, DROP)
  #log_checkpoints = on                # Log checkpoint activity
  #log_lock_waits = on                 # Log lock contention
  ```

  :::note
  В данном руководстве используется формат `csvlog` PostgreSQL для надёжного структурированного разбора. Если вы используете форматы `stderr` или `jsonlog`, необходимо соответствующим образом скорректировать конфигурацию коллектора OpenTelemetry.
  :::

  После внесения этих изменений перезапустите PostgreSQL:

  ```bash
  # For systemd
  sudo systemctl restart postgresql

  # For Docker
  docker restart 
  ```

  Проверьте, что логи записываются:

  ```bash
  # Default log location on Linux
  tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log

  # macOS Homebrew
  tail -f /usr/local/var/postgres/log/postgresql-*.log
  ```

  #### Создание пользовательской конфигурации OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, смонтировав пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

  Создайте файл `postgres-logs-monitoring.yaml` со следующей конфигурацией:

  ```yaml
  receivers:
    filelog/postgres:
      include:
        - /var/lib/postgresql/*/main/log/postgresql-*.csv # Adjust to match your PostgreSQL installation
      start_at: end
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
      operators:
        - type: csv_parser
          parse_from: body
          parse_to: attributes
          header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
          lazy_quotes: true
          
        - type: time_parser
          parse_from: attributes.log_time
          layout: '%Y-%m-%d %H:%M:%S.%L %Z'
        
        - type: add
          field: attributes.source
          value: "postgresql"
        
        - type: add
          field: resource["service.name"]
          value: "postgresql-production"

  service:
    pipelines:
      logs/postgres:
        receivers: [filelog/postgres]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  Эта конфигурация:

  * Считывает CSV‑журналы PostgreSQL из стандартного расположения
  * Обрабатывает многострочные записи журнала (ошибки часто выводятся на нескольких строках)
  * Разбирает CSV со всеми стандартными полями журналов PostgreSQL
  * Извлекает временные метки для сохранения исходного времени записей журнала
  * Добавляет атрибут `source: postgresql` для последующей фильтрации в HyperDX
  * Маршрутизирует логи в экспортёр ClickHouse через отдельный конвейер

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers и pipelines
  * Процессоры (`memory_limiter`, `transform`, `batch`) и экспортеры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вам достаточно ссылаться на них по имени
  * Оператор `csv_parser` извлекает все стандартные поля CSV‑логов PostgreSQL в виде структурированных атрибутов
  * Эта конфигурация использует `start_at: end`, чтобы избежать повторного приёма логов при перезапуске коллектора. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть логи за прошедший период.
  * Измените путь в `include` так, чтобы он соответствовал пути к каталогу журналов PostgreSQL
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Для включения пользовательской конфигурации сборщика в существующем развертывании ClickStack необходимо:

  1. Смонтируйте пользовательский конфигурационный файл в `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог логов PostgreSQL, чтобы коллектор мог их считывать

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развёртывания ClickStack:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/lib/postgresql:/var/lib/postgresql:ro
        # ... other volumes ...
  ```

  ##### Вариант 2: Docker Run (образ «всё в одном»)

  Если вы используете образ all-in-one с docker run:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/lib/postgresql:/var/lib/postgresql:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые разрешения для чтения файлов журналов PostgreSQL. В производственной среде используйте монтирование только для чтения (`:ro`) и следуйте принципу наименьших привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и проверьте, что логи поступают:

  1. Перейдите в режим поиска
  2. Установите для параметра Source значение Logs
  3. Отфильтруйте логи по `source:postgresql`, чтобы увидеть только логи PostgreSQL
  4. Вы должны увидеть структурированные записи журнала с такими полями, как `user_name`, `database_name`, `error_severity`, `message`, `query` и т. д.

  <Image img={logs_search_view} alt="Страница поиска логов" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию логов PostgreSQL до настройки продуктивных систем, мы предоставляем пример набора данных с заранее сгенерированными логами PostgreSQL с реалистичными паттернами.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных \{#download-sample\}

Скачайте пример файла логов:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### Создание тестовой конфигурации коллектора \{#test-config\}

Создайте файл с именем `postgres-logs-demo.yaml` со следующей конфигурацией:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # Читать с начала для демонстрационных данных
    multiline:
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    operators:
      - type: csv_parser
        parse_from: body
        parse_to: attributes
        header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
        lazy_quotes: true
        
      - type: time_parser
        parse_from: attributes.log_time
        layout: '%Y-%m-%d %H:%M:%S.%L %Z'
      
      - type: add
        field: attributes.source
        value: "postgresql-demo"
      
      - type: add
        field: resource["service.name"]
        value: "postgresql-demo"

service:
  pipelines:
    logs/postgres-demo:
      receivers: [filelog/postgres]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Запуск ClickStack с демонстрационной конфигурацией {#run-demo}

Запустите ClickStack с демонстрационными логами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### Проверка логов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (при необходимости предварительно создайте её)
2. Перейдите в раздел Search и установите источник `Logs`
3. Установите диапазон времени **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Когда логи отобразятся, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

<Image img={logs_search_view} alt="Представление поиска по логам"/>

<Image img={log_view} alt="Просмотр лога"/>

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы вы могли начать мониторинг PostgreSQL с помощью ClickStack, мы предоставляем базовые визуализации для логов PostgreSQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `postgresql-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотрите дашборд \{#created-dashboard\}

Дашборд будет создан со всеми предварительно настроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд с логами"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** (при необходимости скорректируйте его под ваш часовой пояс). Импортированный дашборд по умолчанию не будет содержать заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

Проверьте, что переменная окружения задана:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что пользовательский конфигурационный файл смонтирован и доступен для чтения:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### Логи не появляются в HyperDX

Убедитесь, что в фактической конфигурации присутствует ваш `filelog`-ресивер:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Проверьте, нет ли ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

Если используете демонстрационный набор данных, убедитесь, что файл журнала доступен:

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## Следующие шаги {#next-steps}

После настройки мониторинга логов PostgreSQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) о критических событиях (сбои подключений, медленные запросы, всплески ошибок)
- Коррелируйте логи с [метриками PostgreSQL](/use-cases/observability/clickstack/integrations/postgresql-metrics) для комплексного мониторинга базы данных
- Создайте пользовательские дашборды для характерных для приложения шаблонов запросов
- Настройте `log_min_duration_statement` для выявления медленных запросов с учётом ваших требований к производительности

## Переход в продакшен {#going-to-production}

В этом руководстве используется встроенный в ClickStack OTel collector для быстрой настройки. Для продакшен-развертываний мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP endpoint ClickStack. См. раздел [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации в продакшене.