---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: "Локальные логи и метрики"
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: "Начало работы с локальными и системными данными и метриками ClickStack"
doc_type: "guide"
keywords:
  ["clickstack", "примеры данных", "тестовый набор данных", "логи", "наблюдаемость"]
---

import Image from "@theme/IdealImage"
import hyperdx_20 from "@site/static/images/use-cases/observability/hyperdx-20.png"
import hyperdx_21 from "@site/static/images/use-cases/observability/hyperdx-21.png"
import hyperdx_22 from "@site/static/images/use-cases/observability/hyperdx-22.png"
import hyperdx_23 from "@site/static/images/use-cases/observability/hyperdx-23.png"

Данное руководство позволяет собирать локальные логи и метрики из вашей системы и отправлять их в ClickStack для визуализации и анализа.

**Этот пример работает только в системах OSX и Linux**

:::note HyperDX в ClickHouse Cloud
Этот тестовый набор данных также можно использовать с HyperDX в ClickHouse Cloud с незначительными изменениями в процессе, как указано ниже. При использовании HyperDX в ClickHouse Cloud потребуется локально запущенный коллектор OpenTelemetry, как описано в [руководстве по началу работы для данной модели развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>


## Создайте пользовательскую конфигурацию OpenTelemetry

Создайте файл `custom-local-config.yaml` со следующим содержимым:

```yaml
receivers:
  filelog:
    include:
      - /host/var/log/**/*.log        # Логи Linux с хоста
      - /host/var/log/syslog
      - /host/var/log/messages
      - /host/private/var/log/*.log   # Логи macOS с хоста
    start_at: beginning
    resource:
      service.name: "system-logs"

  hostmetrics:
    collection_interval: 1s
    scrapers:
      cpu:
        metrics:
          system.cpu.time:
            enabled: true
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.usage:
            enabled: true
          system.memory.utilization:
            enabled: true
      filesystem:
        metrics:
          system.filesystem.usage:
            enabled: true
          system.filesystem.utilization:
            enabled: true
      paging:
        metrics:
          system.paging.usage:
            enabled: true
          system.paging.utilization:
            enabled: true
          system.paging.faults:
            enabled: true
      disk:
      load:
      network:
      processes:

service:
  pipelines:
    logs/local:
      receivers: [filelog]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

Эта конфигурация собирает системные логи и метрики для систем macOS и Linux и отправляет результаты в ClickStack. Конфигурация расширяет коллектор ClickStack, добавляя новые receivers и pipelines — при этом используются уже существующий exporter `clickhouse` и processors (`memory_limiter`, `batch`), которые настроены в базовом коллекторе ClickStack.

:::note Метки времени ингестии
Эта конфигурация корректирует метки времени на этапе ингестии, назначая обновлённое значение времени каждому событию. В идеале пользователям следует [предварительно обрабатывать или парсить метки времени](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) с помощью процессоров или операторов OTel в своих файлах логов, чтобы обеспечить сохранение точного времени события.

В этом примерe, если receiver или file processor настроен на чтение с начала файла, всем существующим записям журнала будет назначена одна и та же скорректированная метка времени — время обработки, а не исходное время события. Любые новые события, добавленные в файл, получат метки времени, приблизительно соответствующие времени их фактического появления.

Чтобы избежать такого поведения, вы можете задать позицию старта `end` в конфигурации receiver. Это гарантирует, что только новые записи будут приниматься (ингестироваться) и получать метки времени, близкие к моменту их фактического поступления.
:::

Для получения более детальной информации о структуре конфигурации OpenTelemetry (OTel) мы рекомендуем [официальное руководство](https://opentelemetry.io/docs/collector/configuration/).


## Запуск ClickStack с пользовательской конфигурацией

Выполните следующую команду docker, чтобы запустить контейнер «всё-в-одном» с вашей пользовательской конфигурацией:

```shell
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note Пользователь root
Мы запускаем коллектор от имени пользователя root, чтобы получить доступ ко всем системным логам — это необходимо для сбора логов из защищённых путей в системах на базе Linux. Однако такой подход не рекомендуется для продакшена. В продакшн-средах OpenTelemetry Collector следует развёртывать как локальный агент с минимально необходимыми правами доступа только к целевым источникам логов.

Обратите внимание, что мы монтируем `/var/log` хоста в `/host/var/log` внутри контейнера, чтобы избежать конфликтов с собственными файлами логов контейнера.
:::

Если вы используете HyperDX в ClickHouse Cloud с отдельно развёрнутым коллектором, используйте вместо этого следующую команду:

```shell
docker run -d \
  -p 4317:4317 -p 4318:4318 \
  --user 0:0 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/host/var/log:ro \
  -v /private/var/log:/host/private/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

Коллектор сразу начнёт собирать локальные системные логи и метрики.


## Перейдите в интерфейс HyperDX {#navigate-to-the-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX, если вы развернули систему локально. Если вы используете HyperDX в ClickHouse Cloud, выберите свой сервис и `HyperDX` в левом меню.



## Просмотр системных логов {#explore-system-logs}

В интерфейсе поиска должны отобразиться локальные системные логи. Разверните фильтры и выберите `system.log`:

<Image img={hyperdx_20} alt="HyperDX Local logs" size="lg"/>



## Изучение системных метрик {#explore-system-metrics}

Метрики можно изучать с помощью графиков.

Перейдите в Chart Explorer через меню слева. Выберите источник `Metrics` и тип агрегации `Maximum`.

В меню `Select a Metric` введите `memory`, затем выберите `system.memory.utilization (Gauge)`.

Нажмите кнопку запуска, чтобы визуализировать использование памяти во времени.

<Image img={hyperdx_21} alt='Использование памяти во времени' size='lg' />

Обратите внимание, что значение возвращается в виде числа с плавающей точкой в процентах (`%`). Для более наглядного отображения выберите `Set number format`.

<Image img={hyperdx_22} alt='Формат числа' size='lg' />

В открывшемся меню выберите `Percentage` из выпадающего списка `Output format`, затем нажмите `Apply`.

<Image img={hyperdx_23} alt='Использование памяти в процентах во времени' size='lg' />

</VerticalStepper>
