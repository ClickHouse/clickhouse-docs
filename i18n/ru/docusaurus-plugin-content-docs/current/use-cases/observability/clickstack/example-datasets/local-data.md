---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: "Локальные логи и метрики"
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: "Начало работы с локальными и системными данными и метриками ClickStack"
doc_type: "руководство"
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
Этот тестовый набор данных также можно использовать с HyperDX в ClickHouse Cloud с незначительными изменениями в процессе, как указано ниже. При использовании HyperDX в ClickHouse Cloud потребуется локально запущенный сборщик OpenTelemetry, как описано в [руководстве по началу работы для данной модели развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>


## Создание пользовательской конфигурации OpenTelemetry {#create-otel-configuration}

Создайте файл `custom-local-config.yaml` со следующим содержимым:

```yaml
receivers:
  filelog:
    include:
      - /host/var/log/**/*.log # Логи Linux с хоста
      - /host/var/log/syslog
      - /host/var/log/messages
      - /host/private/var/log/*.log # Логи macOS с хоста
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

Данная конфигурация собирает системные логи и метрики для систем macOS и Linux, отправляя результаты в ClickStack. Конфигурация расширяет коллектор ClickStack путем добавления новых приемников и конвейеров — используется существующий экспортер `clickhouse` и процессоры (`memory_limiter`, `batch`), которые уже настроены в базовом коллекторе ClickStack.

:::note Временные метки при приеме данных
Данная конфигурация корректирует временные метки при приеме данных, присваивая каждому событию обновленное значение времени. Рекомендуется [предварительно обрабатывать или парсить временные метки](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) с помощью процессоров или операторов OTel в лог-файлах, чтобы сохранить точное время события.

При такой настройке, если приемник или процессор файлов настроен на чтение с начала файла, всем существующим записям логов будет присвоена одна и та же скорректированная временная метка — время обработки, а не исходное время события. Любые новые события, добавленные в файл, получат временные метки, приближенные к их фактическому времени генерации.

Чтобы избежать такого поведения, можно установить начальную позицию в значение `end` в конфигурации приемника. Это гарантирует, что будут приниматься только новые записи с временными метками, близкими к их фактическому времени поступления.
:::

Для получения более подробной информации о структуре конфигурации OpenTelemetry (OTel) рекомендуем обратиться к [официальному руководству](https://opentelemetry.io/docs/collector/configuration/).


## Запуск ClickStack с пользовательской конфигурацией {#start-clickstack}

Выполните следующую команду docker для запуска универсального контейнера с вашей пользовательской конфигурацией:

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
Коллектор запускается от имени пользователя root для доступа ко всем системным логам — это необходимо для сбора логов из защищённых путей в системах на базе Linux. Однако такой подход не рекомендуется для production-окружений. В production OpenTelemetry Collector следует развёртывать как локальный агент с минимальными правами, необходимыми для доступа к целевым источникам логов.

Обратите внимание, что `/var/log` хоста монтируется в `/host/var/log` внутри контейнера, чтобы избежать конфликтов с собственными лог-файлами контейнера.
:::

Если вы используете HyperDX в ClickHouse Cloud с автономным коллектором, используйте вместо этого следующую команду:

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

Коллектор немедленно начнёт сбор локальных системных логов и метрик.


## Переход к интерфейсу HyperDX {#navigate-to-the-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX при локальном развертывании. Если вы используете HyperDX в ClickHouse Cloud, выберите ваш сервис и пункт `HyperDX` в меню слева.


## Изучение системных журналов {#explore-system-logs}

В интерфейсе поиска должны отображаться локальные системные журналы. Разверните фильтры и выберите `system.log`:

<Image img={hyperdx_20} alt='Локальные журналы HyperDX' size='lg' />


## Исследование системных метрик {#explore-system-metrics}

Метрики можно исследовать с помощью графиков.

Перейдите в Chart Explorer через меню слева. Выберите источник `Metrics` и тип агрегации `Maximum`.

В меню `Select a Metric` введите `memory` и выберите `system.memory.utilization (Gauge)`.

Нажмите кнопку запуска для визуализации использования памяти во времени.

<Image img={hyperdx_21} alt='Память во времени' size='lg' />

Обратите внимание, что значение возвращается в виде числа с плавающей точкой `%`. Для более наглядного отображения выберите `Set number format`.

<Image img={hyperdx_22} alt='Формат числа' size='lg' />

В открывшемся меню выберите `Percentage` из выпадающего списка `Output format` и нажмите `Apply`.

<Image img={hyperdx_23} alt='Память в % от времени' size='lg' />

</VerticalStepper>
