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


# Мониторинг метрик Redis с помощью ClickStack {#redis-metrics-clickstack}

:::note[TL;DR]
В этом руководстве показано, как отслеживать метрики производительности Redis с помощью ClickStack, настроив Redis receiver в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик Redis
- Развернуть ClickStack с вашей собственной конфигурацией
- Использовать готовый дашборд для визуализации производительности Redis (команды/с, использование памяти, подключенные клиенты, эффективность кэша)

Демо-набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию перед настройкой вашего боевого Redis.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим Redis {#existing-redis}

В этом разделе описывается, как настроить вашу существующую установку Redis для отправки метрик в ClickStack путём настройки ClickStack OTel collector с приёмником Redis.

Если вы хотите протестировать интеграцию метрик Redis, прежде чем настраивать собственную инфраструктуру, вы можете использовать наш предварительно настроенный демонстрационный набор данных в [следующем разделе](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Установка Redis версии 3.0 или новее
- Сетевой доступ от ClickStack к Redis (порт по умолчанию 6379)
- Пароль Redis, если включена аутентификация

<VerticalStepper headerLevel="h4">
  #### Проверка подключения к Redis

  Сначала проверьте, что вы можете подключиться к Redis и что команда INFO работает:

  ```bash
  # Проверка подключения
  redis-cli ping
  # Ожидаемый вывод: PONG

  # Проверка команды INFO (используется сборщиком метрик)
  redis-cli INFO server
  # Должна вывести информацию о сервере Redis
  ```

  Если для Redis требуется аутентификация:

  ```bash
  redis-cli -a <your-password> ping
  ```

  **Общие конечные точки Redis:**

  * **Локальный экземпляр**: `localhost:6379`
  * **Docker**: используйте имя контейнера или имя службы (например, `Redis:6379`)
  * **Удалённый сервер**: `<redis-host>:6379`

  #### Создайте пользовательскую конфигурацию OTel collector

  ClickStack позволяет расширить базовую конфигурацию коллектора OpenTelemetry путём монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

  Создайте файл `redis-metrics.yaml` со следующей конфигурацией:

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # Раскомментируйте, если для Redis требуется аутентификация
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

  Эта конфигурация:

  * Подключается к Redis на `localhost:6379` (измените endpoint в соответствии с вашей конфигурацией)
  * Собирает метрики каждые 10 секунд
  * Собирает ключевые метрики производительности (команды, клиенты, память, статистика по пространству ключей)
  * **Устанавливает обязательный атрибут ресурса `service.name`** согласно [семантическим соглашениям OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/resource/#service)
  * Маршрутизирует метрики в экспортёр ClickHouse через отдельный конвейер

  **Собираемые ключевые метрики:**

  * `redis.commands.processed` - Число обработанных команд в секунду
  * `redis.clients.connected` - Количество подключенных клиентов
  * `redis.clients.blocked` - Клиенты, заблокированные из-за блокирующих вызовов
  * `redis.memory.used` - используемая Redis память в байтах
  * `redis.memory.peak` - Пиковое потребление памяти
  * `redis.keyspace.hits` - Успешные обращения к ключам
  * `redis.keyspace.misses` - Неуспешные обращения к ключам (для расчёта коэффициента попаданий в кэш)
  * `redis.keys.expired` - Истекшие ключи
  * `redis.keys.evicted` - Ключи, удалённые при нехватке памяти
  * `redis.connections.received` - Общее число принятых подключений
  * `redis.connections.rejected` - Отклонённые подключения

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers, processors и pipelines
  * Процессоры `memory_limiter` и `batch`, а также экспортер `clickhouse` уже определены в базовой конфигурации ClickStack — достаточно сослаться на них по имени
  * Процессор `resource` задаёт необходимый атрибут `service.name` в соответствии с семантическими соглашениями OpenTelemetry
  * В production-среде с аутентификацией храните пароль в переменной окружения: `${env:REDIS_PASSWORD}`
  * Настройте `collection_interval` в соответствии с вашими потребностями (по умолчанию — 10s; меньшие значения увеличивают объем собираемых данных)
  * Для нескольких инстансов Redis задайте `service.name`, чтобы отличать их (например, `"redis-cache"`, `"redis-sessions"`)
  :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте пользовательский конфигурационный файл в `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Убедитесь, что между ClickStack и Redis есть сетевое соединение

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развёртывания ClickStack:

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
      # Опционально: включение аутентификации
      # command: redis-server --requirepass ваш-пароль-redis
  ```

  ##### Вариант 2: Запуск через Docker (универсальный образ)

  При использовании универсального образа с `docker run`:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  **Важно:** Если Redis запущен в другом контейнере, используйте сеть Docker:

  ```bash
  # Создайте сеть
  docker network create monitoring

  # Запустите Redis в сети
  docker run -d --name redis --network monitoring redis:7-alpine

  # Запустите ClickStack в той же сети (укажите endpoint "redis:6379" в конфигурации)
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  #### Проверка метрик в HyperDX

  После настройки войдите в HyperDX и убедитесь, что метрики поступают:

  1. Перейдите в раздел «Metrics Explorer»
  2. Найдите метрики, начинающиеся с `redis.` (например, `redis.commands.processed`, `redis.memory.used`)
  3. Вы должны увидеть, как точки метрик появляются с настроенным интервалом сбора

  {/* <Image img={metrics_view} alt="Экран с метриками Redis"/> */ }
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик Redis перед настройкой своих производственных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными паттернами метрик Redis.

<VerticalStepper headerLevel="h4">

#### Загрузка примерного набора метрик {#download-sample}

Скачайте предварительно сгенерированные файлы метрик (24 часа метрик Redis с реалистичными паттернами):
```bash
# Скачать метрики типа gauge (память, коэффициент фрагментации)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# Скачать метрики типа sum (команды, подключения, статистика по keyspace)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

Набор данных включает реалистичные паттерны:
- **Событие прогрева кэша (06:00)** — доля попаданий растет с 30% до 80%
- **Пик трафика (14:30–14:45)** — 5-кратный скачок трафика с ростом нагрузки на подключения
- **Дефицит памяти (20:00)** — удаление ключей и деградация производительности кэша
- **Ежедневные паттерны трафика** — пики в рабочие часы, спад вечером, случайные небольшие всплески

#### Запуск ClickStack {#start-clickstack}

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

Подождите примерно 30 секунд, пока ClickStack полностью не запустится.

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

После загрузки самый быстрый способ просмотреть метрики — использовать предварительно созданную панель.

Перейдите к разделу [Панели и визуализация](#dashboards), чтобы импортировать панель и просмотреть все метрики Redis сразу.

:::note
Диапазон времени демонстрационного набора данных: с 2025-10-20 00:00:00 по 2025-10-21 05:00:00. Убедитесь, что диапазон времени в HyperDX соответствует этому окну.

Обратите внимание на следующие интересные паттерны:
- **06:00** — прогрев кэша (низкая доля попаданий постепенно растет)
- **14:30–14:45** — пик трафика (высокое количество клиентских подключений, некоторые отказы)
- **20:00** — дефицит памяти (начинается удаление ключей)
:::

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем основные визуализации для метрик Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `redis-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда {#created-dashboard}

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
# Из контейнера ClickStack
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
# Проверьте наличие ошибок подключения или сбоев аутентификации
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