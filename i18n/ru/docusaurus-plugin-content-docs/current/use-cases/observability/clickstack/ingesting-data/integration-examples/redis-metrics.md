---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'Мониторинг метрик Redis с помощью ClickStack'
sidebar_label: 'Метрики Redis'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик Redis с помощью ClickStack'
doc_type: 'guide'
keywords: ['Redis', 'метрики', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг метрик Redis с помощью ClickStack \{#redis-metrics-clickstack\}

:::note[Кратко]
В этом руководстве показано, как отслеживать метрики производительности Redis с помощью ClickStack, настроив Redis receiver в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик Redis
- Развернуть ClickStack с вашей собственной конфигурацией
- Использовать готовый дашборд для визуализации производительности Redis (команды в секунду, использование памяти, количество подключенных клиентов, эффективность кэша)

Демонстрационный набор данных с примерными метриками доступен, если вы хотите протестировать интеграцию до настройки вашего боевого кластера Redis.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим Redis \{#existing-redis\}

В этом разделе описывается настройка вашей существующей установки Redis для отправки метрик в ClickStack путём настройки ClickStack OTel collector с ресивером Redis.

Если вы хотите протестировать интеграцию метрик Redis до настройки собственной установки, вы можете воспользоваться нашим предварительно настроенным демонстрационным набором данных в [следующем разделе](#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Установленный Redis версии 3.0 или новее
- Сетевой доступ от ClickStack к Redis (порт 6379 по умолчанию)
- Пароль Redis, если включена аутентификация

<VerticalStepper headerLevel="h4">
  #### Проверьте подключение к Redis

  Сначала проверьте, что вы можете подключиться к Redis и что команда INFO работает:

  ```bash
  # Test connection
  redis-cli ping
  # Expected output: PONG

  # Test INFO command (used by metrics collector)
  redis-cli INFO server
  # Should display Redis server information
  ```

  Если для Redis требуется аутентификация:

  ```bash
  redis-cli -a <your-password> ping
  ```

  **Типичные конечные точки Redis:**

  * **Локальный экземпляр**: `localhost:6379`
  * **Docker**: используйте имя контейнера или имя службы (например, `Redis:6379`)
  * **Удалённый хост**: `<redis-host>:6379`

  #### Создание пользовательской конфигурации OTel collector

  ClickStack позволяет расширить базовую конфигурацию коллектора OpenTelemetry, подключив пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

  Создайте файл `redis-metrics.yaml` со следующей конфигурацией:

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # Uncomment if Redis requires authentication
      # password: ${env:REDIS_PASSWORD}
      
      # Configure which metrics to collect
      metrics:
        redis.commands.processed:
          enabled: true
        redis.clients.connected:
          enabled: true
        redis.memory.used:
          enabled: true
        redis.keyspace.hits:
          enabled: true
        redis.keyspace.misses:
          enabled: true
        redis.keys.evicted:
          enabled: true
        redis.keys.expired:
          enabled: true

  processors:
    resource:
      attributes:
        - key: service.name
          value: "redis"
          action: upsert

  service:
    pipelines:
      metrics/redis:
        receivers: [redis]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  Эта конфигурация:

  * Подключается к Redis на `localhost:6379` (при необходимости измените endpoint под вашу среду)
  * Собирает метрики каждые 10 секунд
  * Собирает основные метрики производительности (команды, клиенты, память, статистика пространства ключей)
  * **Устанавливает обязательный атрибут ресурса `service.name`** в соответствии с [семантическими соглашениями OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/resource/#service)
  * Направляет метрики в экспортер ClickHouse по выделенному конвейеру

  **Собираемые ключевые метрики:**

  * `redis.commands.processed` - число обрабатываемых команд в секунду
  * `redis.clients.connected` - Количество подключенных клиентов
  * `redis.clients.blocked` - Клиенты, заблокированные из-за блокирующих вызовов
  * `redis.memory.used` - Объём памяти, используемой Redis, в байтах
  * `redis.memory.peak` - Максимальное использование памяти
  * `redis.keyspace.hits` - Успешные попадания при поиске ключей
  * `redis.keyspace.misses` - Промахи при обращении к ключам (для расчёта коэффициента попаданий в кэш)
  * `redis.keys.expired` - Истекшие ключи
  * `redis.keys.evicted` - Ключи, удалённые из памяти из-за нехватки памяти
  * `redis.connections.received` - Общее число принятых подключений
  * `redis.connections.rejected` - Отклонённые соединения

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers, processors и pipelines
  * Процессоры `memory_limiter` и `batch`, а также экспортёр `clickhouse` уже определены в базовой конфигурации ClickStack — нужно лишь сослаться на них по имени
  * Процессор `resource` устанавливает требуемый атрибут `service.name` в соответствии с семантическими конвенциями OpenTelemetry
  * В рабочей среде (production) с аутентификацией сохраните пароль в переменной окружения: `${env:REDIS_PASSWORD}`
  * При необходимости настройте `collection_interval` (значение по умолчанию — 10s; более низкие значения увеличивают объём собираемых данных)
  * Для нескольких экземпляров Redis настройте `service.name`, чтобы различать их между собой (например, `"redis-cache"`, `"redis-sessions"`)
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Для включения пользовательской конфигурации сборщика в существующем развертывании ClickStack необходимо:

  1. Смонтируйте файл пользовательской конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Убедитесь, что между ClickStack и Redis обеспечена сетевая доступность

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развёртывания ClickStack:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # Optional: If Redis requires authentication
        # - REDIS_PASSWORD=your-redis-password
        # ... other environment variables ...
      volumes:
        - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        # ... other volumes ...
      # If Redis is in the same compose file:
      depends_on:
        - redis

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      # Optional: Enable authentication
      # command: redis-server --requirepass your-redis-password
  ```

  ##### Вариант 2: Запуск через Docker (универсальный образ)

  Если используется универсальный образ с `docker run`:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  **Важно:** Если Redis запущен в другом контейнере, используйте сеть Docker:

  ```bash
  # Create a network
  docker network create monitoring

  # Run Redis on the network
  docker run -d --name redis --network monitoring redis:7-alpine

  # Run ClickStack on the same network (update endpoint to "redis:6379" in config)
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### Проверьте метрики в HyperDX

  После настройки войдите в HyperDX и проверьте, что метрики поступают:

  1. Перейдите в раздел Metrics Explorer
  2. Найдите метрики, имена которых начинаются с `redis.` (например, `redis.commands.processed`, `redis.memory.used`)
  3. Вы должны увидеть появление точек метрик с заданным интервалом сбора

  {/* <Image img={metrics_view} alt="Экран метрик Redis"/> */ }
</VerticalStepper>

## Демонстрационный датасет {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию Redis Metrics до настройки производственных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными паттернами Redis Metrics.

<VerticalStepper headerLevel="h4">

#### Загрузка примерного датасета метрик \{#download-sample\}

Загрузите предварительно сгенерированные файлы метрик (24 часа Redis Metrics с реалистичными паттернами):
```bash
# Загрузить метрики типа gauge (память, коэффициент фрагментации)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# Загрузить метрики типа sum (команды, подключения, статистика keyspace)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

Датасет включает реалистичные паттерны:
- **Событие прогрева кэша (06:00)** — доля попаданий в кэш растет с 30% до 80%
- **Всплеск трафика (14:30–14:45)** — пятикратный рост трафика с повышенной нагрузкой на подключения
- **Давление на память (20:00)** — удаления ключей и деградация производительности кэша
- **Ежедневные паттерны трафика** — пики в рабочие часы, падения вечером, случайные микро-всплески

#### Запуск ClickStack \{#start-clickstack\}

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите примерно 30 секунд, чтобы ClickStack полностью запустился.

#### Загрузка метрик в ClickStack {#load-metrics}

Загрузите метрики напрямую в ClickHouse:
```bash
# Загрузить метрики типа gauge (память, фрагментация)
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Загрузить метрики типа sum (команды, подключения, keyspace)
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Проверка метрик в HyperDX {#verify-metrics}

После загрузки самый быстрый способ просмотреть метрики — использовать преднастроенный дашборд.

Перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать дашборд и просмотреть все Redis Metrics одновременно.

:::note
Диапазон времени демонстрационного датасета — с 2025-10-20 00:00:00 по 2025-10-21 05:00:00. Убедитесь, что указанный вами диапазон времени в HyperDX соответствует этому интервалу.

Обратите внимание на следующие интересные паттерны:
- **06:00** — прогрев кэша (низкий коэффициент попаданий, затем рост)
- **14:30–14:45** — всплеск трафика (высокое число клиентских подключений, часть подключений отклоняется)
- **20:00** — давление на память (начинаются удаления ключей)
:::

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем основные визуализации для метрик Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу в меню с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `redis-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотрите дашборд \{#created-dashboard\}

Дашборд будет создан со всеми заранее настроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд метрик Redis"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** (при необходимости скорректируйте относительно вашего часового пояса). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Поиск и устранение неисправностей {#troubleshooting}

### Пользовательская конфигурация не загружается

Убедитесь, что переменная окружения `CUSTOM_OTELCOL_CONFIG_FILE` установлена корректно:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что файл пользовательской конфигурации смонтирован по пути `/etc/otelcol-contrib/custom.config.yaml`:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

Просмотрите содержимое пользовательской конфигурации, чтобы убедиться, что его можно прочитать:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### Метрики не отображаются в HyperDX

Проверьте, что Redis доступен из коллектора:

```bash
# From the ClickStack container
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Expected output: PONG
```

Убедитесь, что команда INFO в Redis выполняется:

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Should display Redis statistics
```

Убедитесь, что в фактическую конфигурацию включён ваш ресивер Redis:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

Проверьте, нет ли ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Look for connection errors or authentication failures
```


### Ошибки аутентификации

Если вы видите ошибки аутентификации в журналах:

```bash
# Verify Redis requires authentication
redis-cli CONFIG GET requirepass

# Test authentication
redis-cli -a <password> ping

# Ensure password is set in ClickStack environment
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

Обновите конфигурацию для использования пароля:

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```


### Проблемы с сетевой связью

Если ClickStack не удаётся подключиться к Redis:

```bash
# Check if both containers are on the same network
docker network inspect <network-name>

# Test connectivity
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

Убедитесь, что ваш файл Docker Compose или команды `docker run` подключают оба контейнера к одной сети.


## Дальнейшие шаги {#next-steps}

Если вы хотите углубиться дальше, ниже приведены возможные следующие шаги для экспериментов с мониторингом:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик (пороги использования памяти, лимиты подключений, падение уровня попаданий в кэш)
- Создайте дополнительные дашборды для конкретных сценариев использования (лаг репликации, производительность персистентного хранения)
- Отслеживайте несколько экземпляров Redis, дублируя конфигурацию `receiver` с разными endpoint-ами и именами сервисов