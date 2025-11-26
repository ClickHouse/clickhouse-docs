---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: 'Мониторинг логов PostgreSQL с помощью ClickStack'
sidebar_label: 'Логи PostgreSQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов PostgreSQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'логи', 'OTEL', 'ClickStack', 'мониторинг баз данных']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг журналов PostgreSQL с помощью ClickStack {#postgres-logs-clickstack}

:::note[Кратко]
В этом руководстве показано, как мониторить PostgreSQL с помощью ClickStack, настроив OTel collector для ингестии журналов сервера PostgreSQL. Вы узнаете, как:

- Настроить PostgreSQL на вывод журналов в формате CSV для структурированного разбора
- Создать пользовательскую конфигурацию OTel collector для ингестии журналов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации данных из журналов PostgreSQL (ошибки, медленные запросы, соединения)

Демонстрационный набор данных с примерами журналов доступен, если вы хотите протестировать интеграцию до настройки боевого PostgreSQL.

Требуемое время: 10–15 минут
:::



## Интеграция с существующей PostgreSQL {#existing-postgres}

В этом разделе описывается настройка существующей установки PostgreSQL для отправки логов в ClickStack путём изменения конфигурации ClickStack OTel collector.

Если вы хотите протестировать интеграцию логов PostgreSQL перед настройкой собственной установки, вы можете воспользоваться нашей предварительно настроенной конфигурацией и примерами данных в разделе [«Демонстрационный набор данных»](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка PostgreSQL (версия 9.6 или новее)
- Доступ для изменения конфигурационных файлов PostgreSQL
- Достаточное дисковое пространство для файлов логов

<VerticalStepper headerLevel="h4">

#### Настройка логирования PostgreSQL {#configure-postgres}

PostgreSQL поддерживает несколько форматов логов. Для структурированного разбора с помощью OpenTelemetry рекомендуется использовать формат CSV, который обеспечивает согласованный и легко разбираемый вывод.

Файл `postgresql.conf` обычно находится по адресу:

- **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
- **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` или `/opt/homebrew/var/postgres/postgresql.conf`
- **Docker**: конфигурация обычно задаётся через переменные окружения или смонтированный конфигурационный файл

Добавьте или измените следующие параметры в `postgresql.conf`:


```conf
# Требуется для логирования в формате CSV
logging_collector = on
log_destination = 'csvlog'
```


# Рекомендуется включить журналирование подключений
log_connections = on
log_disconnections = on



# Необязательно: настройте в соответствии с потребностями мониторинга

#log&#95;min&#95;duration&#95;statement = 1000  # Логировать запросы, выполняющиеся дольше 1 секунды
#log&#95;statement = &#39;ddl&#39;               # Логировать DDL-операции (CREATE, ALTER, DROP)
#log&#95;checkpoints = on                # Логировать активность контрольных точек
#log&#95;lock&#95;waits = on                 # Логировать ожидания блокировок

```

:::note
В данном руководстве используется формат `csvlog` PostgreSQL для надёжного структурированного разбора. Если вы используете форматы `stderr` или `jsonlog`, необходимо соответствующим образом настроить конфигурацию коллектора OpenTelemetry.
:::

После внесения изменений перезапустите PostgreSQL:
```


```bash
# Для systemd
sudo systemctl restart postgresql
```


# Для Docker

docker restart

```

Убедитесь, что логи записываются:
```


```bash
# Расположение логов по умолчанию в Linux
tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log
```


# macOS Homebrew

tail -f /usr/local/var/postgres/log/postgresql-*.log

````

#### Создание пользовательской конфигурации OTel collector               

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского файла конфигурации и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

Создайте файл с именем `postgres-logs-monitoring.yaml` со следующей конфигурацией:

```yaml
receivers:
  filelog/postgres:
    include:
      - /var/lib/postgresql/*/main/log/postgresql-*.csv # Настройте в соответствии с вашей установкой PostgreSQL
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
````

Эта конфигурация:

* Читает CSV-логи PostgreSQL из стандартного расположения
* Обрабатывает многострочные записи логов (ошибки часто занимают несколько строк)
* Разбирает формат CSV со всеми стандартными полями логов PostgreSQL
* Извлекает временные метки для сохранения исходного времени логов
* Добавляет атрибут `source: postgresql` для фильтрации в HyperDX
* Маршрутизирует логи к экспортеру ClickHouse через отдельный конвейер

:::note

* В пользовательской конфигурации вы определяете только новые приёмники (receivers) и конвейеры (pipelines)
* Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
* Оператор `csv_parser` извлекает все стандартные поля CSV-логов PostgreSQL в структурированные атрибуты
* В этой конфигурации используется `start_at: end`, чтобы избежать повторного приёма логов при перезапуске коллектора. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть исторические записи логов.
* Настройте путь `include` в соответствии с расположением каталога логов PostgreSQL
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации

Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

1. Смонтировать пользовательский файл конфигурации в `/etc/otelcol-contrib/custom.config.yaml`
2. Установить переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Смонтировать каталог логов PostgreSQL, чтобы коллектор мог их читать

##### Вариант 1: Docker Compose

Обновите конфигурацию развертывания ClickStack:

```yaml
services:
  clickstack:
    # ... существующая конфигурация ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... другие переменные окружения ...
    volumes:
      - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/lib/postgresql:/var/lib/postgresql:ro
      # ... другие тома ...
```

##### Вариант 2: docker run (универсальный образ «всё-в-одном»)

Если вы используете универсальный образ «всё-в-одном» с помощью команды docker run:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/lib/postgresql:/var/lib/postgresql:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Убедитесь, что сборщик ClickStack имеет необходимые разрешения для чтения файлов журналов PostgreSQL. В продукционной среде используйте примонтирование в режиме только чтения (`:ro`) и придерживайтесь принципа наименьших привилегий.
:::

#### Проверка логов в HyperDX


После настройки войдите в HyperDX и убедитесь, что логи поступают:

1. Перейдите в представление поиска
2. Установите источник на Logs
3. Отфильтруйте по `source:postgresql`, чтобы просмотреть логи, специфичные для PostgreSQL
4. Вы должны увидеть структурированные записи логов с такими полями, как `user_name`, `database_name`, `error_severity`, `message`, `query` и т. д.

<Image img={logs_search_view} alt='Представление поиска логов' />

<Image img={log_view} alt='Представление лога' />

</VerticalStepper>


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию логов PostgreSQL перед настройкой рабочих систем, мы предоставляем образец набора данных с заранее сгенерированными логами PostgreSQL, имитирующими реальные шаблоны.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных {#download-sample}

Скачайте пример файла логов:

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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Проверка логов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (при необходимости сначала создайте её)
2. Перейдите в представление Search и выберите источник `Logs`
3. Установите диапазон времени на **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. После того как вы увидите логи, вы можете сузить диапазон до 24 часов для более наглядных визуализаций.
:::

<Image img={logs_search_view} alt="Представление поиска логов"/>

<Image img={log_view} alt="Просмотр лога"/>

</VerticalStepper>



## Дашборды и визуализация {#dashboards}

Чтобы упростить запуск мониторинга PostgreSQL с помощью ClickStack, мы предоставляем базовые визуализации логов PostgreSQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком многоточия

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `postgresql-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотрите дашборд {#created-dashboard}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд логов"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)** (при необходимости скорректируйте его в соответствии с вашим часовым поясом). В импортированном дашборде по умолчанию не задан диапазон времени.
:::

</VerticalStepper>



## Устранение неполадок

### Пользовательская конфигурация не загружается

Убедитесь, что задана переменная окружения:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Проверьте, что пользовательский файл конфигурации смонтирован и доступен для чтения:

```bash
docker exec <имя-контейнера> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### Логи не отображаются в HyperDX

Убедитесь, что в эффективную конфигурацию включён ваш приёмник `filelog`:

```bash
docker exec <контейнер> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Проверьте, нет ли ошибок в журналах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

Если вы используете демонстрационный набор данных, убедитесь, что файл журнала доступен:

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## Следующие шаги {#next-steps}

После настройки мониторинга логов PostgreSQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных событий (сбои подключения, медленные запросы, всплески ошибок)
- Коррелируйте логи с [метриками PostgreSQL](/use-cases/observability/clickstack/integrations/postgresql-metrics) для всестороннего мониторинга базы данных
- Создайте пользовательские дашборды для шаблонов запросов, специфичных для вашего приложения
- Настройте `log_min_duration_statement` для выявления медленных запросов с учётом ваших требований к производительности



## Переход в продакшн {#going-to-production}

В этом руководстве используется встроенный в ClickStack OTel collector для быстрого запуска. Для продакшн-сред мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. Конфигурацию для продакшна см. в разделе [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).
