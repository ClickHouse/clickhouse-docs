---
slug: /use-cases/observability/clickstack/integrations/temporal-metrics
title: 'Мониторинг Temporal Cloud с помощью ClickStack'
sidebar_label: 'Метрики Temporal Cloud'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик Temporal Cloud с помощью ClickStack'
doc_type: 'guide'
keywords: ['Temporal', 'метрики', 'OTel', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import temporal_metrics from '@site/static/images/clickstack/temporal/temporal-metrics.png';
import finish_import from '@site/static/images/clickstack/temporal/import-temporal-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/temporal/temporal-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

:::note Предупреждение
Поддержка OpenMetrics в платформе Temporal находится на стадии [Public Preview](https://docs.temporal.io/evaluate/development-production-features/release-stages#public-preview). Дополнительную информацию см. в [их документации](https://docs.temporal.io/cloud/metrics/openmetrics).
:::

Temporal предоставляет абстракцию для разработки как простых, так и сложных и отказоустойчивых приложений.


# Мониторинг метрик Temporal Cloud с помощью ClickStack \{#temporal-metrics-clickstack\}

:::note[Кратко]
В этом руководстве показано, как осуществлять мониторинг Temporal Cloud с помощью ClickStack, настроив Prometheus receiver в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик Temporal Cloud
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации производительности Temporal Cloud (открытые рабочие процессы, действий в секунду, активные пространства имен, очереди задач)

Оценка времени: 5–10 минут
:::

## Интеграция с существующим Temporal Cloud \{#existing-temporal\}

В этом разделе рассматривается настройка ClickStack путём конфигурирования OTel collector в ClickStack с приёмником Prometheus.

## Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Существующая учетная запись Temporal Cloud
- Сетевой HTTP-доступ из ClickStack к вашему Temporal Cloud

<VerticalStepper headerLevel="h4">
  #### Создание ключа Temporal Cloud

  Убедитесь, что у вас есть API-ключ Temporal Cloud. Его можно создать, следуя инструкциям в [руководстве по аутентификации](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/api-reference#authentication) в документации Temporal.

  :::important Файл ключа
  Убедитесь, что учетные данные сохранены в файле `temporal.key` в том же каталоге, что и создаваемый ниже файл конфигурации. Ключ должен храниться в виде обычного текста без пробелов в начале и в конце.
  :::

  #### Создание пользовательской конфигурации OTel collector

  ClickStack позволяет расширить базовую конфигурацию коллектора OpenTelemetry, смонтировав пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

  Создайте файл `temporal-metrics.yaml` со следующей конфигурацией:

  ```yaml title="temporal-metrics.yaml"
  receivers:
    prometheus/temporal:
      config:
        scrape_configs:
        - job_name: 'temporal-cloud'
          scrape_interval: 60s
          scrape_timeout: 30s
          honor_timestamps: true
          scheme: https
          authorization:
            type: Bearer
            credentials_file: /etc/otelcol-contrib/temporal.key
          static_configs:
            - targets: ['metrics.temporal.io']
          metrics_path: '/v1/metrics'

  processors:
    resource:
      attributes:
        - key: service.name
          value: "temporal"
          action: upsert

  service:
    pipelines:
      metrics/temporal:
        receivers: [prometheus/temporal]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  Эта конфигурация:

  * Подключается к Temporal Cloud по адресу `metrics.temporal.io`
  * Собирает метрики раз в 60 секунд
  * Собирает [ключевые показатели производительности](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/metrics-reference)
  * **Устанавливает требуемый атрибут ресурса `service.name`** в соответствии с [семантическими соглашениями OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/resource/#service)
  * Направляет метрики в экспортёр ClickHouse по выделенному конвейеру

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers, processors и pipelines
  * Процессоры `memory_limiter` и `batch`, а также экспортер `clickhouse` уже определены в базовой конфигурации ClickStack — достаточно лишь ссылаться на них по имени
  * Процессор `resource` настраивает требуемый атрибут `service.name` в соответствии с семантическими конвенциями OpenTelemetry
  * Для нескольких аккаунтов Temporal Cloud настройте `service.name`, чтобы различать их между собой (например, `"temporal-prod"`, `"temporal-dev"`)
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развёртывании ClickStack, необходимо:

  1. Смонтируйте пользовательский конфигурационный файл по пути `/etc/otelcol-contrib/custom.config.yaml`
  2. Задайте переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте файл `temporal.key` по пути `/etc/otelcol-contrib/temporal.key`
  4. Убедитесь, что между ClickStack и Temporal обеспечена сетевая связность

  Все команды предполагают выполнение из каталога с примерами, в котором хранятся файлы `temporal-metrics.yaml` и `temporal.key`.

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развёртывания ClickStack:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      volumes:
        - ./temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - ./temporal.key:/etc/otelcol-contrib/temporal.key:ro
        # ... other volumes ...
  ```

  ##### Вариант 2: Запуск Docker (универсальный образ)

  При использовании образа all-in-one с `docker run`:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/temporal.key:/etc/otelcol-contrib/temporal.key:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### Проверьте метрики в HyperDX

  После настройки войдите в HyperDX и проверьте поступление метрик:

  1. Перейдите в раздел Metrics Explorer
  2. Найдите метрики, имена которых начинаются с `temporal` (например, `temporal_cloud_v1_workflow_success_count`, `temporal_cloud_v1_poll_timeout_count`)
  3. Вы должны увидеть, что точки метрик появляются с указанным вами интервалом сбора

  <Image img={temporal_metrics} alt="Метрики Temporal" size="md" />
</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы вы могли начать мониторинг Temporal Cloud с помощью ClickStack, мы предоставляем несколько примеров визуализаций для метрик Temporal.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/temporal-metrics-dashboard.json')} download="temporal-metrics-dashboard.json" eventName="docs.temporal_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \{#download\}

#### Импорт готового дашборда \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `temporal-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд Temporal Metrics"/>

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Настраиваемая конфигурация не загружается

Убедитесь, что переменная среды `CUSTOM_OTELCOL_CONFIG_FILE` задана корректно:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что файл пользовательской конфигурации смонтирован по пути `/etc/otelcol-contrib/custom.config.yaml`:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack ls -lh /etc/otelcol-contrib/custom.config.yaml
```

Просмотрите содержимое пользовательского конфига, чтобы убедиться, что его можно прочитать:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack cat /etc/otelcol-contrib/custom.config.yaml
```

Убедитесь, что файл `temporal.key` смонтирован в контейнер:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/temporal.key
# usually, docker exec clickstack cat /etc/otelcol-contrib/temporal.key
# This should output your temporal.key
```


### Метрики не отображаются в HyperDX

Убедитесь, что Temporal Cloud доступен из коллектора:

```bash
# From the ClickStack container
docker exec <container-name> curl -H "Authorization: Bearer <API_KEY>" https://metrics.temporal.io/v1/metrics
```

В выводе должна появиться серия метрик Prometheus, например:

```text
temporal_cloud_v1_workflow_success_count{operation="CompletionStats",region="aws-us-east-2",temporal_account="l2c4n",temporal_namespace="clickpipes-aws-prd-apps-us-east-2.l2c4n",temporal_task_queue="clickpipes-svc-dc118d12-b397-4975-a33e-c2888ac12ac4-peer-flow-task-queue",temporal_workflow_type="QRepPartitionWorkflow"} 0.067 1765894320
```

Убедитесь, что в фактической конфигурации присутствует ваш приёмник Prometheus:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "Prometheus:"
## usually, docker exec clickstack cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "prometheus:"
```

Проверьте журналы агента коллектора на наличие ошибок:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
# Look for connection errors or authentication failures
# docker exec clickstack cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
```

Проверьте логи коллектора:

```bash
docker exec <container> cat /var/log/otel-collector.log | grep -i error
# Look for config parsing errors - early supervisor.opamp-client can be ignored 
# docker exec clickstack cat /var/log/otel-collector.log | grep -i error
```


### Ошибки аутентификации {#auth-errors}

Если вы видите ошибки аутентификации в журналах, проверьте свой API-ключ.

### Проблемы с сетевым подключением {#network-issues}

Если ClickStack не может подключиться к Temporal Cloud, убедитесь, что ваш файл Docker Compose или команды `docker run` обеспечивают [доступ во внешнюю сеть](https://docs.docker.com/engine/network/#drivers).

## Дальнейшие шаги {#next-steps}

Если вы хотите разобраться глубже, ниже представлены следующие шаги для экспериментов с мониторингом:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических метрик (пороги использования памяти, лимиты подключений, снижение hit rate кеша)
- Создайте дополнительные дашборды для конкретных сценариев использования (лаг репликации, производительность подсистемы хранения)
- Отслеживайте несколько аккаунтов Temporal Cloud, дублируя конфигурацию приёмника с разными конечными точками (endpoints) и именами сервисов