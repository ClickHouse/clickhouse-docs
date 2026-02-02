---
slug: /use-cases/observability/clickstack/getting-started/local-data
title: 'Локальные логи и метрики'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Введение в работу с локальными и системными данными и метриками в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'пример данных', 'пример набора данных', 'логи', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import select_service from '@site/static/images/clickstack/select_service.png';

Это руководство по началу работы позволяет собирать локальные логи и метрики с вашей системы и отправлять их в ClickStack для визуализации и анализа.

**Этот пример работает только на системах OSX и Linux**

<Tabs groupId="sample-logs">
  <TabItem value="управляемый ClickStack" label="Управляемый ClickStack" default>
    Данное руководство предполагает, что вы завершили [Руководство по началу работы с управляемым ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud) и [записали учётные данные для подключения](/use-cases/observability/clickstack/getting-started/managed#next-steps).

    <VerticalStepper>
      ## Создайте пользовательскую конфигурацию OpenTelemetry \{#create-otel-configuration\}

      Создайте файл `custom-local-config.yaml` со следующим содержимым:

      ```yaml
      receivers:
        filelog:
          include:
            - /host/var/log/**/*.log        # Linux logs from host
            - /host/var/log/syslog
            - /host/var/log/messages
            - /host/private/var/log/*.log   # macOS logs from host
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

      Данная конфигурация собирает системные журналы и метрики для систем OSX и Linux, отправляя результаты в ClickStack. Конфигурация расширяет коллектор ClickStack путём добавления новых получателей и конвейеров — вы ссылаетесь на существующий экспортёр `clickhouse` и процессоры (`memory_limiter`, `batch`), которые уже настроены в базовом коллекторе ClickStack.

      :::note Временные метки при ингестии
      Эта конфигурация корректирует временные метки при приёме данных, присваивая каждому событию обновлённое значение времени. Рекомендуется [предварительно обрабатывать или парсить временные метки](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) с помощью процессоров или операторов OTel в файлах логов, чтобы сохранить точное время события.

      При такой конфигурации, если приёмник или файловый процессор настроен на чтение с начала файла, всем существующим записям журнала будет присвоена одна и та же скорректированная временная метка — время обработки, а не исходное время события. Любые новые события, добавленные в файл, получат временные метки, приблизительно соответствующие времени их фактического создания.

      Чтобы избежать такого поведения, можно установить начальную позицию в значение `end` в конфигурации приёмника. Это гарантирует, что будут приниматься только новые записи с временными метками, близкими к фактическому времени их поступления.
      :::

      Для получения более подробной информации о структуре конфигурации OpenTelemetry (OTel) рекомендуем ознакомиться с [официальным руководством](https://opentelemetry.io/docs/collector/configuration/).

      ## Запуск коллектора OpenTelemetry \{#start-the-otel-collector\}

      Выполните следующую команду для запуска автономного коллектора:

      ```shell
      docker run -d \
        -p 4317:4317 -p 4318:4318 \
        --user 0:0 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
        -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
        -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
        -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log:/host/var/log:ro \
        -v /private/var/log:/host/private/var/log:ro \
        clickhouse/clickstack-otel-collector:latest
      ```

      Коллектор немедленно начнет сбор локальных системных журналов и метрик.

      ## Выберите сервис \{#select-your-service\}

      Выберите сервис с Managed ClickStack на главной странице ClickHouse Cloud.

      <Image img={select_service} alt="Выберите сервис" size="lg" />

      ## Исследование системных логов \{#navigate-to-the-hyperdx-ui\}

      Выберите `ClickStack` в левом меню для перехода в интерфейс ClickStack, где вы будете автоматически аутентифицированы.

      В интерфейсе поиска должны отображаться локальные системные логи. Разверните фильтры и выберите `system.log`:

      <Image img={hyperdx_20} alt="Локальные логи HyperDX" size="lg" />

      ## Исследование системных метрик \{#explore-system-metrics\}

      Метрики можно исследовать с помощью графиков.

      Перейдите в Chart Explorer через левое меню. Выберите источник `Metrics` и тип агрегации `Maximum`.

      В меню `Select a Metric` введите `memory`, а затем выберите `system.memory.utilization (Gauge)`.

      Нажмите кнопку запуска, чтобы визуализировать использование памяти во времени.

      <Image img={hyperdx_21} alt="Использование памяти во времени" size="lg" />

      Обратите внимание, что число возвращается в виде числа с плавающей точкой `%`. Для более чёткого отображения выберите `Set number format`.

      <Image img={hyperdx_22} alt="Формат чисел" size="lg" />

      В открывшемся меню выберите `Percentage` из выпадающего списка `Output format`, после чего нажмите `Apply`.

      <Image img={hyperdx_23} alt="Память, % во времени" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом">
    <VerticalStepper>
      ## Создайте пользовательскую конфигурацию OpenTelemetry \{#create-otel-configuration-oss\}

      Создайте файл `custom-local-config.yaml` со следующим содержимым:

      ```yaml
      receivers:
        filelog:
          include:
            - /host/var/log/**/*.log        # Linux logs from host
            - /host/var/log/syslog
            - /host/var/log/messages
            - /host/private/var/log/*.log   # macOS logs from host
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

      Данная конфигурация собирает системные журналы и метрики для систем OSX и Linux, отправляя результаты в ClickStack. Конфигурация расширяет коллектор ClickStack путём добавления новых получателей и конвейеров — вы ссылаетесь на существующий экспортёр `clickhouse` и процессоры (`memory_limiter`, `batch`), которые уже настроены в базовом коллекторе ClickStack.

      :::note Временные метки при ингестии
      Эта конфигурация корректирует временные метки при приёме данных, присваивая каждому событию обновлённое значение времени. Рекомендуется [предварительно обрабатывать или парсить временные метки](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) с помощью процессоров или операторов OTel в файлах логов, чтобы сохранить точное время события.

      При такой конфигурации, если приёмник или файловый процессор настроен на чтение с начала файла, всем существующим записям журнала будет присвоена одна и та же скорректированная временная метка — время обработки, а не исходное время события. Любые новые события, добавленные в файл, получат временные метки, приблизительно соответствующие времени их фактического создания.

      Чтобы избежать такого поведения, можно установить начальную позицию в значение `end` в конфигурации приёмника. Это гарантирует, что будут приниматься только новые записи с временными метками, близкими к фактическому времени их поступления.
      :::

      Для получения более подробной информации о структуре конфигурации OpenTelemetry (OTel) рекомендуем ознакомиться с [официальным руководством](https://opentelemetry.io/docs/collector/configuration/).

      ## Запуск ClickStack с настраиваемой конфигурацией \{#start-clickstack\}

      Выполните следующую команду docker для запуска контейнера all-in-one с вашей конфигурацией:

      ```shell
      docker run -d --name clickstack \
        -p 8080:8080 -p 4317:4317 -p 4318:4318 \
        --user 0:0 \
        -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
        -v "$(pwd)/custom-local-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
        -v /var/log:/host/var/log:ro \
        -v /private/var/log:/host/private/var/log:ro \
        clickhouse/clickstack-all-in-one:latest
      ```

      :::note Пользователь root
      Мы запускаем коллектор от имени пользователя root для доступа ко всем системным журналам — это необходимо для сбора журналов из защищённых путей в системах на базе Linux. Однако такой подход не рекомендуется для production-окружений. В production-средах OpenTelemetry Collector следует развёртывать как локальный агент только с минимальными правами, необходимыми для доступа к целевым источникам журналов.

      Обратите внимание, что мы монтируем `/var/log` хоста в `/host/var/log` внутри контейнера во избежание конфликтов с собственными лог-файлами контейнера.
      :::

      ## Исследование системных логов \{#navigate-to-the-hyperdx-ui-oss\}

      Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу ClickStack при локальном развёртывании.

      Источники данных должны быть предварительно созданы для вас. В интерфейсе поиска должны отображаться локальные системные логи. Разверните фильтры и выберите `system.log`:

      <Image img={hyperdx_20} alt="Локальные логи HyperDX" size="lg" />

      ## Исследование системных метрик \{#explore-system-metrics-oss\}

      Метрики можно исследовать с помощью графиков.

      Перейдите в Chart Explorer через левое меню. Выберите источник `Metrics` и тип агрегации `Maximum`.

      В меню `Select a Metric` введите `memory`, а затем выберите `system.memory.utilization (Gauge)`.

      Нажмите кнопку запуска, чтобы визуализировать использование памяти во времени.

      <Image img={hyperdx_21} alt="Динамика использования памяти" size="lg" />

      Обратите внимание, что число возвращается в виде числа с плавающей точкой `%`. Для более чёткого отображения выберите `Set number format`.

      <Image img={hyperdx_22} alt="Формат чисел" size="lg" />

      В открывшемся меню выберите `Percentage` из выпадающего списка `Output format`, после чего нажмите `Apply`.

      <Image img={hyperdx_23} alt="Использование памяти, %" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>