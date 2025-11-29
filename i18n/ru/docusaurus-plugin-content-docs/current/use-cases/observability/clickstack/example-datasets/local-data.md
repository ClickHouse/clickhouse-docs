---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: 'Локальные логи и метрики'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Знакомство с локальными и системными данными и метриками ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'пример данных', 'пример набора данных', 'логи', 'наблюдаемость']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';

Это вводное руководство позволяет собирать локальные логи и метрики с вашей системы и отправлять их в ClickStack для визуализации и анализа.

**Этот пример работает только в системах OSX и Linux**

:::note HyperDX in ClickHouse Cloud
Этот пример набора данных также может использоваться с HyperDX в ClickHouse Cloud, с лишь незначительными изменениями конвейера, указанными в тексте. При использовании HyperDX в ClickHouse Cloud пользователям потребуется локально запущенный коллектор OpenTelemetry, как описано в [руководстве по началу работы для этой модели развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>
  ## Создание пользовательской конфигурации OpenTelemetry {#create-otel-configuration}

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

  Данная конфигурация собирает системные журналы и метрики для систем OSX и Linux и отправляет результаты в ClickStack. Конфигурация расширяет коллектор ClickStack, добавляя новые приёмники и конвейеры — при этом используются существующий экспортёр `clickhouse` и процессоры (`memory_limiter`, `batch`), уже настроенные в базовом коллекторе ClickStack.

  :::note Временные метки при ингестии
  Данная конфигурация корректирует временные метки в процессе приёма данных, присваивая каждому событию обновлённое значение времени. Пользователям рекомендуется [предварительно обрабатывать или парсить временные метки](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) с помощью процессоров или операторов OTel в своих лог-файлах, чтобы сохранить точное время события.

  При такой настройке, если приёмник или процессор файлов настроен на чтение с начала файла, всем существующим записям журнала будет присвоена одна и та же скорректированная временная метка — время обработки, а не исходное время события. Любые новые события, добавляемые в файл, получат временные метки, приблизительно соответствующие фактическому времени их создания.

  Чтобы избежать такого поведения, установите начальную позицию в значение `end` в конфигурации приёмника. Это обеспечит приём только новых записей с временными метками, соответствующими фактическому времени их поступления.
  :::

  Подробнее о структуре конфигурации OpenTelemetry (OTel) см. в [официальном руководстве](https://opentelemetry.io/docs/collector/configuration/).

  ## Запуск ClickStack с пользовательской конфигурацией {#start-clickstack}

  Выполните следующую команду docker для запуска универсального контейнера с вашей конфигурацией:

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
  Мы запускаем коллектор от имени пользователя root для доступа ко всем системным журналам — это необходимо для сбора журналов из защищённых путей в системах на базе Linux. Однако такой подход не рекомендуется для production-окружения. В production-средах OpenTelemetry Collector следует развёртывать как локальный агент только с минимальными правами, необходимыми для доступа к целевым источникам журналов.

  Обратите внимание, что мы монтируем `/var/log` хоста в `/host/var/log` внутри контейнера, чтобы избежать конфликтов с собственными лог-файлами контейнера.
  :::

  При использовании HyperDX в ClickHouse Cloud с автономным коллектором используйте эту команду:

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

  Коллектор сразу начнет собирать локальные системные журналы и метрики.

  ## Переход к интерфейсу HyperDX {#navigate-to-the-hyperdx-ui}

  Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX при локальном развёртывании. При использовании HyperDX в ClickHouse Cloud выберите ваш сервис и пункт `HyperDX` в меню слева.

  ## Изучение системных журналов {#explore-system-logs}

  В интерфейсе поиска должны отобразиться локальные системные журналы. Разверните фильтры и выберите `system.log`:

  <Image img={hyperdx_20} alt="Локальные логи HyperDX" size="lg" />

  ## Изучение системных метрик {#explore-system-metrics}

  Метрики можно изучать с помощью графиков.

  Перейдите в Chart Explorer через левое меню. Выберите источник `Metrics` и тип агрегации `Maximum`.

  В меню `Select a Metric` введите `memory`, а затем выберите `system.memory.utilization (Gauge)`.

  Нажмите кнопку запуска, чтобы визуализировать использование памяти за период времени.

  <Image img={hyperdx_21} alt="Динамика использования памяти" size="lg" />

  Обратите внимание, что число возвращается как число с плавающей точкой `%`. Для более четкого отображения выберите `Set number format`.

  <Image img={hyperdx_22} alt="Числовой формат" size="lg" />

  В открывшемся меню выберите `Percentage` из выпадающего списка `Output format` и нажмите `Apply`.

  <Image img={hyperdx_23} alt="Память, % времени" size="lg" />
</VerticalStepper>