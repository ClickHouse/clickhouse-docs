---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: 'Мониторинг метрик Redis с помощью ClickStack'
sidebar_label: 'Метрики Redis'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик Redis с помощью ClickStack'
doc_type: 'guide'
keywords: ['Redis', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Мониторинг метрик Redis с помощью ClickStack \\{#redis-metrics-clickstack\\}

:::note[TL;DR]
В этом руководстве показано, как отслеживать метрики производительности Redis с помощью ClickStack, настроив Redis receiver в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик Redis
- Развернуть ClickStack с вашей собственной конфигурацией
- Использовать готовый дашборд для визуализации производительности Redis (команды/с, использование памяти, подключенные клиенты, эффективность кэша)

Демо-набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию перед настройкой вашего боевого Redis.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим Redis \\{#existing-redis\\}

В этом разделе описывается, как настроить вашу существующую установку Redis для отправки метрик в ClickStack путём настройки ClickStack OTel collector с приёмником Redis.

Если вы хотите протестировать интеграцию метрик Redis, прежде чем настраивать собственную инфраструктуру, вы можете использовать наш предварительно настроенный демонстрационный набор данных в [следующем разделе](#demo-dataset).

##### Предварительные требования \\{#prerequisites\\}

- Запущенный экземпляр ClickStack
- Установка Redis версии 3.0 или новее
- Сетевой доступ от ClickStack к Redis (порт по умолчанию 6379)
- Пароль Redis, если включена аутентификация

<VerticalStepper headerLevel="h4">
  #### Проверка подключения к Redis

  Сначала убедитесь, что вы можете подключиться к Redis и что команда INFO работает:

  ```bash
  # Проверка подключения
  redis-cli ping
  # Ожидаемый результат: PONG

  # Проверка команды INFO (используется сборщиком метрик)
  redis-cli INFO server
  # Должна отобразиться информация о сервере Redis
  ```

  Если Redis требует аутентификацию:

  ```bash
  redis-cli -a <your-password> ping
  ```

  **Общие конечные точки Redis:**

  * **Локальный экземпляр**: `localhost:6379`
  * **Docker**: Используйте имя контейнера или имя сервиса (например, `redis:6379`)
  * **Удалённый хост**: `<redis-host>:6379`

  #### Создайте пользовательскую конфигурацию OTel collector

  ClickStack позволяет расширить базовую конфигурацию коллектора OpenTelemetry путём монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

  Создайте файл `redis-metrics.yaml` со следующей конфигурацией:

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # Раскомментируйте, если Redis требует аутентификацию
      # password: ${env:REDIS_PASSWORD}
      
      # Настройте, какие метрики необходимо собирать
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

  Данная конфигурация:

  * Подключается к Redis на `localhost:6379` (при необходимости измените endpoint в соответствии с вашей конфигурацией)
  * Собирает метрики каждые 10 секунд
  * Собирает ключевые метрики производительности (команды, клиенты, память, статистика по пространству ключей)
  * **Устанавливает обязательный атрибут ресурса `service.name`** в соответствии с [семантическими соглашениями OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/resource/#service)
  * Направляет метрики к экспортёру ClickHouse через отдельный конвейер обработки

  **Собираемые ключевые метрики:**

  * `redis.commands.processed` - Число обработанных команд в секунду
  * `redis.clients.connected` - Количество подключенных клиентов
  * `redis.clients.blocked` - Клиенты, заблокированные из-за блокирующих вызовов
  * `redis.memory.used` - Объём используемой Redis памяти (в байтах)
  * `redis.memory.peak` - Пиковое потребление памяти
  * `redis.keyspace.hits` - Успешные обращения к ключам
  * `redis.keyspace.misses` - Промахи при обращении к ключам (для расчета коэффициента попаданий в кэш)
  * `redis.keys.expired` - Истекшие ключи
  * `redis.keys.evicted` - Ключи, удалённые из-за ограничений по памяти
  * `redis.connections.received` - Общее количество полученных подключений
  * `redis.connections.rejected` - Отклонённые подключения

  :::note

  * В пользовательском конфигурационном файле вы указываете только новые receivers, processors и pipelines
  * Процессоры `memory_limiter` и `batch`, а также экспортёр `clickhouse` уже определены в базовой конфигурации ClickStack — достаточно просто сослаться на них по имени
  * Процессор `resource` задаёт требуемый атрибут `service.name` в соответствии с семантическими соглашениями OpenTelemetry.
  * Для продакшн-среды с аутентификацией сохраните пароль в переменной окружения `${env:REDIS_PASSWORD}`.
  * Настройте `collection_interval` под ваши нужды (по умолчанию — 10s; уменьшение значения увеличивает объём данных)
  * Для нескольких экземпляров Redis настройте параметр `service.name`, чтобы различать их между собой (например, `"redis-cache"`, `"redis-sessions"`)
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте пользовательский файл конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Обеспечьте сетевую связность между ClickStack и Redis

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развертывания ClickStack:

  ```yaml
  services:
    clickstack:
      # ... существующая конфигурация ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # Опционально: если Redis требует аутентификации
        # - REDIS_PASSWORD=ваш-пароль-redis
        # ... другие переменные окружения ...
      volumes:
        - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        # ... другие тома ...
      # Если Redis находится в том же compose-файле:
      depends_on:
        - redis

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      # Опционально: включить аутентификацию
      # command: redis-server --requirepass ваш-пароль-redis
  ```

  ##### Вариант 2: Запуск через Docker (универсальный образ)

  При использовании универсального образа с `docker run`:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  **Важно:** Если Redis запущен в другом контейнере, используйте сеть Docker:

  ```bash
  # Создайте сеть
  docker network create monitoring

  # Запустите Redis в сети
  docker run -d --name redis --network monitoring redis:7-alpine

  # Запустите ClickStack в той же сети (обновите endpoint на "redis:6379" в конфигурации)
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### Проверка метрик в HyperDX

  После настройки войдите в HyperDX и проверьте поступление метрик:

  1. Перейдите в обозреватель метрик
  2. Найдите метрики, начинающиеся с `redis.` (например, `redis.commands.processed`, `redis.memory.used`)
  3. Вы должны увидеть точки данных метрик, которые появляются с заданным интервалом сбора

  {/* <Image img={metrics_view} alt="Экран метрик Redis"/> */ }
</VerticalStepper>

## Демо‑датасет {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию Redis Metrics перед настройкой продуктивных систем, мы предоставляем заранее сгенерированный датасет с реалистичными профилями метрик Redis.

<VerticalStepper headerLevel="h4">

#### Загрузите пример датасета метрик \\{#download-sample\\}

Скачайте заранее сгенерированные файлы метрик (24 часа Redis Metrics с реалистичными профилями):
```bash
# Загрузить метрики gauge (память, коэффициент фрагментации)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# Загрузить метрики sum (команды, подключения, статистика пространства ключей)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

Датасет включает реалистичные профили:
- **Событие прогрева кэша (06:00)** — показатель hit rate растёт с 30% до 80%
- **Сплеск трафика (14:30–14:45)** — пятикратный рост трафика с повышенной нагрузкой на подключения
- **Дефицит памяти (20:00)** — вытеснение ключей и деградация производительности кэша
- **Ежедневные профили трафика** — пики в рабочие часы, падения вечером, случайные короткие всплески

#### Запустите ClickStack \\{#start-clickstack\\}

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите примерно 30 секунд, чтобы ClickStack полностью запустился.

#### Загрузите метрики в ClickStack {#load-metrics}

Загрузите метрики напрямую в ClickHouse:
```bash
# Загрузить метрики gauge (память, фрагментация)
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Загрузить метрики sum (команды, подключения, пространство ключей)
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Проверьте метрики в HyperDX {#verify-metrics}

После загрузки самый быстрый способ просмотреть метрики — воспользоваться преднастроенной панелью.

Перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать дашборд и просмотреть все Redis Metrics одновременно.

:::note
Диапазон времени демо‑датасета — с 2025-10-20 00:00:00 по 2025-10-21 05:00:00. Убедитесь, что диапазон времени в HyperDX попадает в этот интервал.

Обратите внимание на следующие характерные профили:
- **06:00** — прогрев кэша (hit rate растёт с низких значений)
- **14:30–14:45** — сплеск трафика (большое число клиентских подключений, есть отказы)
- **20:00** — дефицит памяти (начинается вытеснение ключей)
:::

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем основные визуализации для метрик Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда \\{#import-dashboard\\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `redis-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда \\{#created-dashboard\\}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд Redis Metrics"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** (при необходимости скорректируйте под ваш часовой пояс). По умолчанию у импортированного дашборда не будет задан диапазон времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

Убедитесь, что переменная окружения `CUSTOM_OTELCOL_CONFIG_FILE` установлена корректно:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что пользовательский файл конфигурации смонтирован в `/etc/otelcol-contrib/custom.config.yaml`:

```bash
docker exec <имя-контейнера> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

Просмотрите содержимое пользовательской конфигурации и убедитесь, что его можно прочитать:

```bash
docker exec <имя-контейнера> cat /etc/otelcol-contrib/custom.config.yaml
```

### Метрики не отображаются в HyperDX

Убедитесь, что Redis доступен из коллектора:

```bash
# Из контейнера ClickStack {#download-sum-metrics-commands-connections-keyspace-stats}
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Ожидаемый результат: PONG
```

Проверьте, работает ли команда INFO в Redis:

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Должна отобразить статистику Redis
```

Убедитесь, что эффективная конфигурация включает ваш ресивер Redis:

```bash
docker exec <контейнер> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

Проверьте журналы коллектора на наличие ошибок:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Проверьте наличие ошибок подключения или сбоев аутентификации {#load-gauge-metrics-memory-fragmentation}
```

### Ошибки аутентификации

Если вы видите ошибки аутентификации в журналах:

```bash
# Проверка требования аутентификации Redis
redis-cli CONFIG GET requirepass

# Тестирование аутентификации
redis-cli -a <password> ping

# Проверка установки пароля в окружении ClickStack
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

Обновите конфигурацию, чтобы использовать пароль:

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```

### Проблемы с сетевой связью

Если ClickStack не может подключиться к Redis:

```bash
# Проверьте, находятся ли оба контейнера в одной сети
docker network inspect <network-name>

# Проверьте соединение
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

Убедитесь, что в вашем файле Docker Compose или командах `docker run` оба контейнера подключены к одной сети.

## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько следующих шагов для экспериментов с мониторингом:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик (пороги использования памяти, лимиты подключений, падение коэффициента попаданий в кэш)
- Создайте дополнительные дашборды для конкретных сценариев использования (лаг репликации, производительность персистентного хранилища)
- Мониторьте несколько экземпляров Redis, дублируя конфигурацию receiver с разными endpoint и именами сервисов