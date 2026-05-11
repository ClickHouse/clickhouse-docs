---
slug: /use-cases/observability/clickstack/integrations/kafka-logs
title: 'Мониторинг логов Kafka с помощью ClickStack'
sidebar_label: 'Логи Kafka'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов Kafka с помощью ClickStack'
doc_type: 'guide'
keywords: ['Kafka', 'лог', 'OTEL', 'ClickStack', 'мониторинг брокера', 'Log4j']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/kafka/logs/log-view.png';
import search_view from '@site/static/images/clickstack/kafka/logs/search-view.png';
import finish_import from '@site/static/images/clickstack/kafka/logs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/kafka/logs/example-dashboard.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов Kafka с помощью ClickStack \{#kafka-logs-clickstack\}

:::note[Кратко]
Собирайте и визуализируйте логи брокера Kafka (в формате Log4j) в ClickStack с помощью приёмника OTel `filelog`. Включает демо-набор данных и готовую панель мониторинга.
:::

## Интеграция с существующей Kafka \{#existing-kafka\}

В этом разделе описано, как настроить существующую установку Kafka для отправки логов брокера в ClickStack, изменив конфигурацию OTel collector ClickStack.
Если вы хотите протестировать интеграцию логов Kafka перед настройкой собственной среды, воспользуйтесь нашей предварительно настроенной средой и примерами данных в разделе [&quot;демо-набор данных&quot;](/use-cases/observability/clickstack/integrations/kafka-logs#demo-dataset).

### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Существующая установка Kafka (версия 2.0 или новее)
- Доступ к файлам логов Kafka (`server.log`, `controller.log` и т. д.)

<VerticalStepper headerLevel="h4">
  #### Проверка конфигурации логирования Kafka

  Kafka использует Log4j и записывает логи в каталог, указанный системным свойством `kafka.logs.dir` или переменной среды `LOG_DIR`. Проверьте расположение файла лога:

  ```bash
  # Default locations
  ls $KAFKA_HOME/logs/      # Standard Apache Kafka (defaults to <install-dir>/logs/)
  ls /var/log/kafka/        # RPM/DEB package installations
  ```

  Основные лог-файлы Kafka:

  * **`server.log`**: Общие логи брокера (запуск, подключения, репликация, ошибки)
  * **`controller.log`**: События, связанные с контроллером (выбор лидера, переназначение партиций)
  * **`state-change.log`**: Изменения состояния партиции и реплики

  Стандартный шаблон Log4j в Kafka генерирует строки следующего вида:

  ```text
  [2026-03-09 14:23:45,123] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
  ```

  :::note
  Для развёртываний Kafka на основе Docker (например, `confluentinc/cp-kafka`) конфигурация Log4j по умолчанию включает только консольный appender — файловый appender отсутствует, поэтому логи записываются только в stdout. Чтобы использовать приёмник `filelog`, необходимо перенаправить логи в файл: добавив файловый appender в `log4j.properties` или перенаправив stdout через pipe (например, `| tee /var/log/kafka/server.log`).
  :::

  #### Создание пользовательской конфигурации OTel collector для Kafka

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, подключив пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

  Создайте файл с именем `kafka-logs-monitoring.yaml` со следующей конфигурацией:

  ```yaml
  receivers:
    filelog/kafka:
      include:
        - /var/log/kafka/server.log
        - /var/log/kafka/controller.log  # optional, only exists if log4j is configured with separate file appenders
        - /var/log/kafka/state-change.log  # optional, same as above
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka"

        - type: add
          field: resource["service.name"]
          value: "kafka-production"

  service:
    pipelines:
      logs/kafka:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * В пользовательской конфигурации вы определяете только новые приёмники и пайплайны. Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени.
  * Конфигурация `multiline` гарантирует, что stack trace захватывается как одна запись лога.
  * Эта конфигурация использует `start_at: beginning`, чтобы при запуске коллектора читать все существующие логи. Для развертываний в режиме промышленной эксплуатации измените значение на `start_at: end`, чтобы избежать повторного приёма логов при перезапусках коллектора.
    :::

  #### Настройка ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте файл пользовательской конфигурации в `/etc/otelcol-contrib/custom.config.yaml`
  2. Задайте переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог логов Kafka, чтобы коллектор мог их читать

  <Tabs groupId="deployMethod">
    <TabItem value="docker-compose" label="Docker Compose" default>
      Обновите конфигурацию развертывания ClickStack:

      ```yaml
      services:
        clickstack:
          # ... существующая конфигурация ...
          environment:
            - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
            # ... другие переменные окружения ...
          volumes:
            - ./kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/kafka:/var/log/kafka:ro
            # ... другие тома ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run (All-in-One Image)">
      Если вы используете all-in-one image с Docker, выполните команду:

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/kafka-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/kafka:/var/log/kafka:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые права доступа для чтения лог-файлов Kafka. В промышленной эксплуатации используйте монтирование только для чтения (`:ro`) и соблюдайте принцип минимальных привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и убедитесь, что логи поступают:

  <Image img={search_view} alt="Режим поиска" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демо-набор данных

Проверьте интеграцию логов Kafka на заранее подготовленном тестовом датасете, прежде чем настраивать системы для промышленной эксплуатации.

<VerticalStepper headerLevel="h4">
  #### Загрузите образец датасета

  Загрузите образец файла логов:

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/server.log
  ```

  #### Создайте тестовую конфигурацию коллектора

  Создайте файл с именем `kafka-logs-demo.yaml` со следующей конфигурацией:

  ```yaml
  cat > kafka-logs-demo.yaml << 'EOF'
  receivers:
    filelog/kafka:
      include:
        - /tmp/kafka-demo/server.log
      start_at: beginning
      multiline:
        line_start_pattern: '^\[\d{4}-\d{2}-\d{2}'
      operators:
        - type: regex_parser
          regex: '^\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\] (?P<severity>\w+) (?P<message>.*)'
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.timestamp
            layout: '%Y-%m-%d %H:%M:%S,%L'
          severity:
            parse_from: attributes.severity

        - type: move
          from: attributes.message
          to: body

        - type: add
          field: attributes.source
          value: "kafka-demo"

        - type: add
          field: resource["service.name"]
          value: "kafka-demo"

  service:
    pipelines:
      logs/kafka-demo:
        receivers: [filelog/kafka]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### Запустите ClickStack с демо-конфигурацией

  Запустите ClickStack с демо-логами и этой конфигурацией:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/kafka-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/server.log:/tmp/kafka-demo/server.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## Проверьте логи в HyperDX

  После запуска ClickStack:

  1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (при необходимости сначала создайте её)
  2. Перейдите в представление Search и установите источник `Logs`
  3. Установите временной диапазон, включающий **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**

  <Image img={search_view} alt="Представление Search" />

  <Image img={log_view} alt="Представление логов" />
</VerticalStepper>

## Панели мониторинга и визуализация {#dashboards}

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-logs-dashboard.json')} download="kafka-logs-dashboard.json" eventName="docs.kafka_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию панели мониторинга \{#download\}

#### Импортируйте готовую панель мониторинга \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите "Import Dashboard" в правом верхнем углу в меню с многоточием.

<Image img={import_dashboard} alt="Импорт панели мониторинга"/>

3. Загрузите файл kafka-logs-dashboard.json и нажмите finish import.

<Image img={finish_import} alt="Завершение импорта панели мониторинга логов Kafka"/>

#### Панель мониторинга будет создана со всеми заранее настроенными визуализациями {#created-dashboard}

Для демо-набора данных установите временной диапазон, включающий **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**.

<Image img={example_dashboard} alt="Пример панели мониторинга логов Kafka"/>

</VerticalStepper>

## Устранение неполадок

**Убедитесь, что в итоговой конфигурации присутствует ваш приёмник filelog:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**Проверьте коллектор на наличие ошибок:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```

**Проверьте, что формат логов Kafka соответствует ожидаемому шаблону:**

```bash
tail -1 /var/log/kafka/server.log
```

Если в вашей установке Kafka используется пользовательский шаблон Log4j, соответствующим образом скорректируйте регулярное выражение в `regex_parser`.


## Следующие шаги

* Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных событий (сбоев брокера, ошибок репликации, проблем с группами потребителей)
* Используйте в сочетании с [метриками Kafka](/use-cases/observability/clickstack/integrations/kafka-metrics) для всестороннего мониторинга Kafka
* Создайте дополнительные [панели мониторинга](/use-cases/observability/clickstack/dashboards) для конкретных сценариев использования (события контроллера, переназначение партиций)

## Переход к промышленной эксплуатации

В этом руководстве для быстрой настройки используется встроенный OpenTelemetry Collector ClickStack. Для развертываний в промышленной эксплуатации мы рекомендуем запускать собственный OTel Collector и отправлять данные в конечную точку OTLP ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для настройки промышленной эксплуатации.