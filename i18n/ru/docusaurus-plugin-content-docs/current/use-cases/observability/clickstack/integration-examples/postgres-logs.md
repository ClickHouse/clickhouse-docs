---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'Мониторинг журналов PostgreSQL с помощью ClickStack'
sidebar_label: 'Журналы PostgreSQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг журналов PostgreSQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'журналы', 'OTel', 'ClickStack', 'мониторинг баз данных']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов PostgreSQL с помощью ClickStack {#postgres-logs-clickstack}

:::note[Кратко]
В этом руководстве показано, как настроить мониторинг PostgreSQL с помощью ClickStack, настроив OTel collector для приёма серверных логов PostgreSQL. Вы узнаете, как:

- Настроить PostgreSQL на вывод логов в формате CSV для структурированного парсинга
- Создать пользовательскую конфигурацию OTel collector для ингестии логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации данных из логов PostgreSQL (ошибки, медленные запросы, подключения)

Доступен демонстрационный набор данных с примерами логов, если вы хотите протестировать интеграцию до настройки продуктивного PostgreSQL.

Оценочное время: 10–15 минут
:::

## Интеграция с существующим PostgreSQL {#existing-postgres}

В этом разделе описывается настройка вашей существующей инсталляции PostgreSQL для отправки логов в ClickStack путём изменения конфигурации OTel collector в ClickStack.

Если вы хотите протестировать интеграцию логов PostgreSQL до настройки вашей собственной инсталляции, вы можете воспользоваться нашей преднастроенной средой и примером данных в разделе ["Demo dataset"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Установленный PostgreSQL версии 9.6 или новее
- Доступ для изменения конфигурационных файлов PostgreSQL
- Достаточный объем свободного дискового пространства для файлов журналов

<VerticalStepper headerLevel="h4">
  #### Настройка логирования PostgreSQL

  PostgreSQL поддерживает несколько форматов логов. Для структурированного парсинга с OpenTelemetry рекомендуется формат CSV, который обеспечивает согласованный и легко парсируемый вывод.

  Файл `postgresql.conf` обычно расположен по пути:

  * **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` или `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**: Конфигурация обычно задаётся через переменные окружения или примонтированный конфигурационный файл

  Добавьте или измените эти настройки в `postgresql.conf`:

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
  В данном руководстве используется формат `csvlog` PostgreSQL для надёжного структурированного парсинга. Если вы используете форматы `stderr` или `jsonlog`, необходимо соответствующим образом скорректировать конфигурацию коллектора OpenTelemetry.
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

  #### Создайте пользовательскую конфигурацию OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

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

  Данная конфигурация:

  * Считывает журналы PostgreSQL в формате CSV из стандартного расположения
  * Поддерживает многострочные записи логов (ошибки часто занимают несколько строк)
  * Разбирает формат CSV со всеми стандартными полями журналов PostgreSQL
  * Извлекает временные метки, чтобы сохранить исходное время логов
  * Добавляет атрибут `source: postgresql`, который можно использовать для фильтрации в HyperDX
  * Направляет логи в экспортёр ClickHouse через выделенный конвейер обработки

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers и pipelines
  * Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — просто ссылайтесь на них по имени
  * Оператор `csv_parser` извлекает все стандартные поля CSV‑логов PostgreSQL и преобразует их в структурированные атрибуты
  * Эта конфигурация использует `start_at: end`, чтобы избежать повторного приёма логов при перезапусках коллектора. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть предыдущие логи.
  * Настройте путь в `include` так, чтобы он соответствовал расположению каталога журналов PostgreSQL
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте файл пользовательской конфигурации в `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог логов PostgreSQL, чтобы коллектор мог их считывать

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развертывания ClickStack:

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

  Если вы используете универсальный образ с `docker run`:

  ```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/lib/postgresql:/var/lib/postgresql:ro \
  clickhouse/clickstack-all-in-one:latest
```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые права для чтения файлов журналов PostgreSQL. В production-среде используйте монтирование только для чтения (`:ro`) и следуйте принципу наименьших привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и убедитесь, что журналы поступают:

  1. Перейдите в режим поиска
  2. В поле Source выберите Logs
  3. Отфильтруйте по `source:postgresql`, чтобы увидеть специфичные для PostgreSQL логи
  4. Вы должны увидеть структурированные записи журнала с такими полями, как `user_name`, `database_name`, `error_severity`, `message`, `query` и т.д.

  <Image img={logs_search_view} alt="Страница поиска логов" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демо-набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию логов PostgreSQL до настройки производственных систем, мы предоставляем демонстрационный набор данных с заранее сгенерированными логами PostgreSQL с реалистичными паттернами.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных {#download-sample}

Загрузите пример файла лога:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### Создание тестовой конфигурации коллектора {#test-config}

Создайте файл с именем `postgres-logs-demo.yaml` со следующей конфигурацией:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # Read from beginning for demo data
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

#### Запуск ClickStack с демо-конфигурацией {#run-demo}

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

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (при необходимости сначала создайте ее)
2. Перейдите в представление Search и установите источник в значение `Logs`
3. Установите диапазон времени на **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демо-данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демо-логи независимо от вашего местоположения. После того как вы увидите логи, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

<Image img={logs_search_view} alt="Представление поиска по логам"/>

<Image img={log_view} alt="Просмотр лога"/>

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг PostgreSQL с помощью ClickStack, мы предоставляем основные визуализации для логов PostgreSQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу в меню с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `postgresql-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд логов"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** (скорректируйте с учётом вашего часового пояса). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

Убедитесь, что задана переменная окружения:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что пользовательский конфигурационный файл смонтирован и доступен для чтения:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### В HyperDX не отображаются логи

Проверьте, что в итоговую конфигурацию включён ваш приёмник `filelog`:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Проверьте наличие ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

Если вы используете демонстрационный набор данных, убедитесь, что файл журнала доступен:

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## Дальнейшие шаги {#next-steps}

После настройки мониторинга логов PostgreSQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических событий (сбоев подключения, медленных запросов, всплесков ошибок)
- Коррелируйте логи с [метриками PostgreSQL](/use-cases/observability/clickstack/integrations/postgresql-metrics) для всестороннего мониторинга базы данных
- Создавайте пользовательские дашборды для характерных для приложения шаблонов запросов
- Настройте `log_min_duration_statement` для выявления медленных запросов с учётом ваших требований к производительности

## Использование в продакшене {#going-to-production}

Это руководство опирается на встроенный в ClickStack OpenTelemetry Collector для быстрой первичной настройки. Для продакшен-развертываний мы рекомендуем запускать собственный OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для настройки продакшен-среды.