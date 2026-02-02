---
slug: /use-cases/observability/clickstack/integrations/mysql-logs
title: 'Мониторинг логов MySQL с помощью ClickStack'
sidebar_label: 'Логи MySQL'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов MySQL с помощью ClickStack'
doc_type: 'guide'
keywords: ['MySQL', 'логи', 'OTEL', 'ClickStack', 'мониторинг баз данных', 'медленные запросы']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/mysql/search-view.png';
import log_view from '@site/static/images/clickstack/mysql/log-view.png';
import finish_import from '@site/static/images/clickstack/mysql/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mysql/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов MySQL с помощью ClickStack \{#mysql-logs-clickstack\}

:::note[Кратко]
В этом руководстве показано, как мониторить MySQL с помощью ClickStack, настроив OTel collector для приёма логов сервера MySQL. Вы узнаете, как:

- Настроить MySQL для вывода логов ошибок и медленных запросов
- Создать пользовательскую конфигурацию OTel collector для ингестии логов
- Развернуть ClickStack с пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации данных из логов MySQL (ошибки, медленные запросы, подключения)

Доступен демонстрационный датасет с примерами логов, если вы хотите протестировать интеграцию до настройки вашей production-среды MySQL.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим MySQL \{#existing-mysql\}

В этом разделе рассказывается, как настроить вашу существующую установку MySQL для отправки логов в ClickStack путем изменения конфигурации ClickStack OTel collector.

Если вы хотите протестировать интеграцию логов MySQL до настройки собственной среды, вы можете воспользоваться нашей предварительно настроенной конфигурацией и примером данных в разделе ["Демонстрационный набор данных"](/use-cases/observability/clickstack/integrations/mysql-logs#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный инстанс ClickStack
- Установленный MySQL (версия 5.7 или новее)
- Доступ к изменению конфигурационных файлов MySQL
- Достаточно места на диске для файлов журналов

<VerticalStepper headerLevel="h4">
  #### Настройка логирования MySQL

  MySQL поддерживает несколько типов журналов. Для комплексного мониторинга с OpenTelemetry рекомендуется включить журнал ошибок и журнал медленных запросов.

  Файл конфигурации `my.cnf` или `my.ini` обычно расположен по адресу:

  * **Linux (apt/yum)**: `/etc/mysql/my.cnf` или `/etc/my.cnf`
  * **macOS (Homebrew)**: `/usr/local/etc/my.cnf` или `/opt/homebrew/etc/my.cnf`
  * **Docker**: Конфигурация обычно задаётся через переменные окружения или с помощью примонтированного конфигурационного файла

  Добавьте или измените следующие настройки в разделе `[mysqld]`:

  ```ini
  [mysqld]
  # Error log configuration
  log_error = /var/log/mysql/error.log

  # Slow query log configuration
  slow_query_log = ON
  slow_query_log_file = /var/log/mysql/mysql-slow.log
  long_query_time = 1
  log_queries_not_using_indexes = ON

  # Optional: General query log (verbose, use with caution in production)
  # general_log = ON
  # general_log_file = /var/log/mysql/mysql-general.log
  ```

  :::note
  Журнал медленных запросов фиксирует запросы, выполнение которых занимает более `long_query_time` секунд. Настройте этот порог в соответствии с требованиями к производительности вашего приложения. Слишком низкое значение приведёт к избыточному количеству логов.
  :::

  После внесения этих изменений перезапустите MySQL:

  ```bash
  # For systemd
  sudo systemctl restart mysql

  # For Docker
  docker restart <mysql-container>
  ```

  Проверьте, что логи записываются:

  ```bash
  # Check error log
  tail -f /var/log/mysql/error.log

  # Check slow query log
  tail -f /var/log/mysql/mysql-slow.log
  ```

  #### Создание пользовательской конфигурации OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, смонтировав пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

  Создайте файл `mysql-logs-monitoring.yaml` со следующей конфигурацией:

  ```yaml
  receivers:
    filelog/mysql_error:
      include:
        - /var/log/mysql/error.log
      start_at: end
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
          
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-error"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

    filelog/mysql_slow:
      include:
        - /var/log/mysql/mysql-slow.log
      start_at: end
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-slow"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

  service:
    pipelines:
      logs/mysql:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  Эта конфигурация:

  * Считывает журналы ошибок MySQL и журналы медленных запросов из их стандартных мест размещения
  * Обрабатывает многострочные записи журнала (медленные запросы могут занимать несколько строк)
  * Анализирует оба формата логов для извлечения структурированных полей (level, error&#95;code, query&#95;time, rows&#95;examined)
  * Сохраняет исходные временные метки логов
  * Добавляет атрибуты `source: mysql-error` и `source: mysql-slow` для фильтрации в HyperDX
  * Направляет логи в экспортёр ClickHouse через отдельный конвейер обработки

  :::note
  Требуются два приемника, поскольку журналы ошибок MySQL и журналы медленных запросов имеют совершенно разные форматы. `time_parser` использует разметку `gotime` для обработки временных меток MySQL в формате ISO8601 с указанием часовых поясов.
  :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развёртывании ClickStack, смонтируйте файл пользовательской конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml` и задайте переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`.

  Обновите конфигурацию развёртывания ClickStack:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./mysql-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/mysql:/var/log/mysql:ro
        # ... other volumes ...
  ```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые разрешения для чтения файлов журналов MySQL. Используйте монтирование в режиме только для чтения (`:ro`) и следуйте принципу наименьших привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и проверьте, что логи поступают:

  1. Перейдите на страницу поиска
  2. В качестве источника выберите Logs
  3. Отфильтруйте логи по `source:mysql-error` или `source:mysql-slow`, чтобы просмотреть логи MySQL
  4. Вы должны увидеть структурированные записи журналов с такими полями, как `level`, `error_code`, `message` (для журналов ошибок) и `query_time`, `rows_examined`, `query` (для журналов медленных запросов)

  <Image img={search_view} alt="Страница поиска" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию логов MySQL до настройки своих production-систем, мы предоставляем пример набора предварительно сгенерированных логов MySQL с реалистичными паттернами.

<VerticalStepper headerLevel="h4">
  #### Загрузите пример набора данных

  Загрузите примеры файлов логов:

  ```bash
  # Download error log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/error.log

  # Download slow query log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/mysql-slow.log
  ```

  Набор данных включает:

  * Записи журнала ошибок (сообщения при запуске, предупреждения, ошибки подключения, сообщения InnoDB)
  * Медленные запросы с характеристиками производительности, близкими к реальным
  * События жизненного цикла соединений
  * Последовательности запуска и завершения работы сервера базы данных

  #### Создание тестовой конфигурации коллектора

  Создайте файл `mysql-logs-demo.yaml` со следующей конфигурацией:

  ```yaml
  cat > mysql-logs-demo.yaml << 'EOF'
  receivers:
    filelog/mysql_error:
      include:
        - /tmp/mysql-demo/error.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-error"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

    filelog/mysql_slow:
      include:
        - /tmp/mysql-demo/mysql-slow.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-slow"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

  service:
    pipelines:
      logs/mysql-demo:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### Запуск ClickStack с демонстрационной конфигурацией

  Запустите ClickStack с демонстрационными логами и конфигурацией:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/mysql-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/error.log:/tmp/mysql-demo/error.log:ro" \
    -v "$(pwd)/mysql-slow.log:/tmp/mysql-demo/mysql-slow.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### Проверьте логи в HyperDX

  После запуска ClickStack:

  1. Подождите некоторое время, пока ClickStack полностью запустится (обычно 30–60 секунд)
  2. Откройте [HyperDX](http://localhost:8080/) и войдите в свой аккаунт (при необходимости сначала создайте его).
  3. Перейдите на вкладку Search и в качестве источника выберите `Logs`
  4. Установите временной диапазон на **2025-11-13 00:00:00 - 2025-11-16 00:00:00**
  5. Вы должны увидеть всего 40 записей логов (30 ошибок с `source:mysql-demo-error` + 10 медленных запросов с `source:mysql-demo-slow`)

  :::note
  Если вы не видите все 40 записей журнала сразу, подождите около минуты, пока коллектор завершит обработку. Если записи журнала так и не появились, выполните команду `docker restart clickstack-demo` и проверьте снова через минуту. Это известная проблема приемника filelog в OpenTelemetry при массовой загрузке существующих файлов с параметром `start_at: beginning`. Производственные развертывания с параметром `start_at: end` обрабатывают записи журнала по мере их записи в режиме реального времени и не сталкиваются с этой проблемой.
  :::

  <Image img={search_view} alt="Страница поиска" />

  <Image img={log_view} alt="Просмотр логов" />

  :::note[Отображение часового пояса]
  HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Увидев логи, вы можете сузить диапазон до 24-часового периода для более чёткой визуализации.
  :::
</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы упростить начало мониторинга MySQL с помощью ClickStack, мы предоставляем базовые визуализации для логов MySQL.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/mysql-logs-dashboard.json')} download="mysql-logs-dashboard.json" eventName="docs.mysql_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда \{#download\}

#### Импортируйте готовый дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `mysql-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотрите дашборд {#created-dashboard}

Дашборд будет создан со всеми предварительно настроенными визуализациями.

<Image img={example_dashboard} alt="Пример дашборда"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)** (откорректируйте в соответствии с вашим часовым поясом). В импортированном дашборде по умолчанию не будет задан диапазон времени.
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

Проверьте, что в фактической конфигурации включён ваш ресивер `filelog`:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Проверьте наличие ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i mysql
```

Если вы используете демонстрационный набор данных, убедитесь, что файлы логов доступны:

```bash
docker exec <container> cat /tmp/mysql-demo/error.log | wc -l
docker exec <container> cat /tmp/mysql-demo/mysql-slow.log | wc -l
```


### Журналы медленных запросов не отображаются

Убедитесь, что в MySQL включён журнал медленных запросов:

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

Проверьте, логирует ли MySQL медленные запросы:

```bash
tail -f /var/log/mysql/mysql-slow.log
```

Создайте тестовый медленный запрос:

```sql
SELECT SLEEP(2);
```


### Логи разбираются неправильно

Убедитесь, что формат логов MySQL соответствует ожидаемому формату. Регулярные выражения в этом руководстве рассчитаны на стандартные форматы MySQL 5.7+ и 8.0+.

Проверьте несколько строк из журнала ошибок:

```bash
head -5 /var/log/mysql/error.log
```

Ожидаемый формат:

```text
2025-11-14T10:23:45.123456+00:00 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.35) starting as process 1
```

Если ваш формат значительно отличается, скорректируйте шаблоны регулярных выражений в конфигурации.


## Следующие шаги {#next-steps}

После настройки мониторинга логов MySQL:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических событий (сбоев подключения, медленных запросов, превышающих заданные пороги, всплесков ошибок)
- Создайте пользовательские панели мониторинга для анализа медленных запросов по их шаблонам
- Настройте `long_query_time` на основе наблюдаемых закономерностей производительности запросов

## Переход в продакшн {#going-to-production}

В этом руководстве используется встроенный в ClickStack OpenTelemetry Collector для быстрой первоначальной настройки. Для продакшн-развертываний мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации продакшн-среды.