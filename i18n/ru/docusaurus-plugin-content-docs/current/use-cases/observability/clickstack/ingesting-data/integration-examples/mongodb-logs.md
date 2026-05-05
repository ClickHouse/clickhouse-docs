---
slug: /use-cases/observability/clickstack/integrations/mongodb-logs
title: 'Мониторинг логов MongoDB с ClickStack'
sidebar_label: 'Логи MongoDB'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов MongoDB с ClickStack'
doc_type: 'guide'
keywords: ['MongoDB', 'логи', 'OTEL', 'ClickStack', 'мониторинг баз данных', 'медленный запрос']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import log_view from '@site/static/images/clickstack/mongodb/log-view.png';
import search_view from '@site/static/images/clickstack/mongodb/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/mongodb/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mongodb/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов MongoDB с ClickStack \{#mongodb-logs-clickstack\}

:::note[Вкратце]
Собирайте и визуализируйте логи сервера MongoDB (JSON-формат 4.4+) в ClickStack с помощью OTel-приёмника `filelog`. Включает демо-набор данных и готовую панель мониторинга.
:::

## Интеграция с существующей MongoDB \{#existing-mongodb\}

В этом разделе описано, как настроить существующую установку MongoDB для отправки логов в ClickStack, изменив конфигурацию OTel collector ClickStack.
Если вы хотите протестировать интеграцию MongoDB перед настройкой собственной среды, воспользуйтесь нашей предварительно настроенной конфигурацией и образцами данных в разделе [&quot;Демо-набор данных&quot;](/use-cases/observability/clickstack/integrations/mongodb-logs#demo-dataset).

### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Существующая самоуправляемая установка MongoDB (версии 4.4 или новее)
- Доступ к файлам логов MongoDB

<VerticalStepper headerLevel="h4">
  #### Проверка конфигурации логирования MongoDB

  MongoDB 4.4+ по умолчанию выводит структурированные JSON-логи. Проверьте расположение лог-файла:

  ```bash
  cat /etc/mongod.conf | grep -A 5 systemLog
  ```

  Стандартные расположения журналов MongoDB:

  * **Linux (apt/yum)**: `/var/log/mongodb/mongod.log`
  * **macOS (Homebrew)**: `/usr/local/var/log/mongodb/mongo.log`
  * **Docker**: Логи часто выводятся в stdout, но можно настроить запись в `/var/log/mongodb/mongod.log`

  Если MongoDB выводит журналы в stdout, настройте запись в файл, обновив `mongod.conf`:

  ```yaml
  systemLog:
    destination: file
    path: /var/log/mongodb/mongod.log
    logAppend: true
  ```

  После изменения конфигурации перезапустите MongoDB:

  ```bash
  # For systemd
  sudo systemctl restart mongod

  # For Docker
  docker restart <mongodb-container>
  ```

  #### Создание пользовательской конфигурации OTel collector для MongoDB

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, подключив пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

  Создайте файл с именем `mongodb-monitoring.yaml` со следующей конфигурацией:

  ```yaml
  receivers:
    filelog/mongodb:
      include:
        - /var/log/mongodb/mongod.log
      start_at: beginning
      operators:
        - type: json_parser
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.t.$$date
            layout: '2006-01-02T15:04:05.000-07:00'
            layout_type: gotime
          severity:
            parse_from: attributes.s
            overwrite_text: true
            mapping:
              fatal: F
              error: E
              warn: W
              info: I
              debug:
                - D1
                - D2
                - D3
                - D4
                - D5

        - type: move
          from: attributes.msg
          to: body

        - type: add
          field: attributes.source
          value: "mongodb"

        - type: add
          field: resource["service.name"]
          value: "mongodb-production"

  service:
    pipelines:
      logs/mongodb:
        receivers: [filelog/mongodb]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  :::note

  * В пользовательской конфигурации вы определяете только новые получатели и конвейеры. Процессоры (`memory_limiter`, `transform`, `batch`) и экспортеры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вам нужно лишь ссылаться на них по имени.
  * Эта конфигурация использует `start_at: beginning`, чтобы считывать все существующие логи при запуске коллектора. Для рабочих развертываний измените значение на `start_at: end`, чтобы избежать повторного приёма логов при перезапуске коллектора.
    :::

  #### Настройка ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте пользовательский файл конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
  2. Задайте переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог логов MongoDB, чтобы коллектор мог их читать

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
            - ./mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
            - /var/log/mongodb:/var/log/mongodb:ro
            # ... другие тома ...
      ```
    </TabItem>

    <TabItem value="docker-run" label="Docker Run (образ all-in-one)">
      Если вы используете образ all-in-one с Docker, выполните:

      ```bash
      docker run --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/mongodb-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log/mongodb:/var/log/mongodb:ro \
        clickhouse/clickstack-all-in-one:latest
      ```
    </TabItem>
  </Tabs>

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые права доступа для чтения файлов журналов MongoDB. В производственной среде используйте монтирование в режиме только для чтения (`:ro`) и соблюдайте принцип минимальных привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и убедитесь, что логи поступают:

  <Image img={search_view} alt="Представление поиска по журналам MongoDB" />

  <Image img={log_view} alt="Подробное представление логов MongoDB" />
</VerticalStepper>

## Демо-набор данных

Протестируйте интеграцию MongoDB на предварительно подготовленном демонстрационном наборе данных, прежде чем настраивать продуктивные системы.

<VerticalStepper headerLevel="h4">
  #### Загрузите демонстрационный набор данных

  Загрузите пример файла логов:

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mongodb/mongod.log
  ```

  #### Создайте тестовую конфигурацию коллектора

  Создайте файл `mongodb-demo.yaml` со следующей конфигурацией:

  ```yaml
  cat > mongodb-demo.yaml << 'EOF'
  receivers:
    filelog/mongodb:
      include:
        - /tmp/mongodb-demo/mongod.log
      start_at: beginning
      operators:
        - type: json_parser
          parse_from: body
          parse_to: attributes
          timestamp:
            parse_from: attributes.t.$$date
            layout: '2006-01-02T15:04:05.000-07:00'
            layout_type: gotime
          severity:
            parse_from: attributes.s
            overwrite_text: true
            mapping:
              fatal: F
              error: E
              warn: W
              info: I
              debug:
                - D1
                - D2
                - D3
                - D4
                - D5

        - type: move
          from: attributes.msg
          to: body

        - type: add
          field: attributes.source
          value: "mongodb-demo"

        - type: add
          field: resource["service.name"]
          value: "mongodb-demo"

  service:
    pipelines:
      logs/mongodb-demo:
        receivers: [filelog/mongodb]
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
    -v "$(pwd)/mongodb-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/mongod.log:/tmp/mongodb-demo/mongod.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  ## Проверьте логи в HyperDX

  После запуска ClickStack:

  1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (при необходимости сначала создайте ее)
  2. Перейдите в представление Search и выберите источник `Logs`
  3. Установите временной диапазон, включающий **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**

  <Image img={search_view} alt="Представление поиска логов MongoDB" />

  <Image img={log_view} alt="Представление сведений о логе MongoDB" />
</VerticalStepper>

## Панели мониторинга и визуализации

<VerticalStepper headerLevel="h4">
  #### <TrackedLink href={useBaseUrl('/examples/mongodb-logs-dashboard.json')} download="mongodb-logs-dashboard.json" eventName="docs.mongodb_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию панели мониторинга

  #### Импорт готовой панели мониторинга

  1. Откройте HyperDX и перейдите в раздел Dashboards.
  2. В правом верхнем углу откройте меню с многоточием и нажмите &quot;Import Dashboard&quot;.

  <Image img={import_dashboard} alt="Import Dashboard" />

  3. Загрузите файл mongodb-logs-dashboard.json и нажмите Finish import.

  <Image img={finish_import} alt="Завершение импорта панели мониторинга логов MongoDB" />

  #### Панель мониторинга будет создана со всеми заранее настроенными визуализациями

  Для демо-набора данных установите временной диапазон, включающий **2026-03-09 00:00:00 - 2026-03-10 00:00:00 (UTC)**.

  <Image img={example_dashboard} alt="Панель мониторинга логов MongoDB" />
</VerticalStepper>

## Устранение неполадок

### В HyperDX не отображаются логи

Убедитесь, что в итоговую конфигурацию включён ваш приёмник filelog:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

Проверьте наличие ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
```


### Логи обрабатываются некорректно

Убедитесь, что MongoDB выводит логи в формате JSON (4.4+):

```bash
tail -1 /var/log/mongodb/mongod.log | python3 -m json.tool
```

Если вывод не является корректным JSON, возможно, в вашей версии MongoDB используется устаревший текстовый формат лога (до 4.4). Вам нужно заменить оператор `json_parser` на `regex_parser` или обновить MongoDB до версии 4.4+.


## Следующие шаги {#next-steps}

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических событий (всплески ошибок, пороговые значения для медленных запросов)
- Создайте дополнительные [панели мониторинга](/use-cases/observability/clickstack/dashboards) для конкретных сценариев использования (мониторинг набора реплик, отслеживание соединений)

## Переход к промышленной эксплуатации {#going-to-production}

В этом руководстве для быстрой настройки используется встроенный в ClickStack OpenTelemetry Collector. Для развертываний в промышленной эксплуатации мы рекомендуем запускать собственный OTel Collector и отправлять данные в OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) с конфигурацией для промышленной эксплуатации.