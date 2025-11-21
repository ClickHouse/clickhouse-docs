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


# Мониторинг метрик Redis с помощью ClickStack {#redis-metrics-clickstack}

:::note[Краткое содержание]
В этом руководстве описывается, как отслеживать метрики производительности Redis с помощью ClickStack, настроив приемник Redis в коллекторе OpenTelemetry. Вы узнаете, как:

- Настроить коллектор OTel для сбора метрик Redis
- Развернуть ClickStack с пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации производительности Redis (команды/сек, использование памяти, подключенные клиенты, производительность кэша)

Демонстрационный набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию перед настройкой production-окружения Redis.

Требуемое время: 5–10 минут
:::


## Интеграция с существующим Redis {#existing-redis}

В этом разделе описывается настройка существующей установки Redis для отправки метрик в ClickStack путём настройки коллектора ClickStack OTel с приёмником Redis.

Если вы хотите протестировать интеграцию Redis Metrics перед настройкой собственной установки, вы можете использовать наш предварительно настроенный демонстрационный набор данных в [следующем разделе](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка Redis (версия 3.0 или новее)
- Сетевой доступ от ClickStack к Redis (порт по умолчанию 6379)
- Пароль Redis, если включена аутентификация

<VerticalStepper headerLevel="h4">

#### Проверка подключения к Redis {#verify-redis}


Сначала убедитесь, что вы можете подключиться к Redis и что команда INFO выполняется:

```bash
# Проверка подключения
redis-cli ping
# Ожидаемый результат: PONG
```


# Тестирование команды INFO (используется сборщиком метрик)

redis-cli INFO server

# Должна отобразить информацию о сервере Redis

````

Если Redis требует аутентификации:
```bash
redis-cli -a <your-password> ping
````

**Типичные конечные точки Redis:**

- **Локальная установка**: `localhost:6379`
- **Docker**: Используйте имя контейнера или имя сервиса (например, `redis:6379`)
- **Удалённый сервер**: `<redis-host>:6379`

#### Создание пользовательской конфигурации сборщика OTel {#custom-otel}

ClickStack позволяет расширить базовую конфигурацию сборщика OpenTelemetry путём монтирования пользовательского файла конфигурации и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

Создайте файл с именем `redis-metrics.yaml` со следующей конфигурацией:

```yaml title="redis-metrics.yaml"
receivers:
  redis:
    endpoint: "localhost:6379"
    collection_interval: 10s
    # Раскомментируйте, если Redis требует аутентификации
    # password: ${env:REDIS_PASSWORD}

    # Настройте, какие метрики собирать
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

- Подключается к Redis на `localhost:6379` (настройте конечную точку для вашей установки)
- Собирает метрики каждые 10 секунд
- Собирает ключевые метрики производительности (команды, клиенты, память, статистика keyspace)
- **Устанавливает обязательный атрибут ресурса `service.name`** в соответствии с [семантическими соглашениями OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/resource/#service)
- Направляет метрики в экспортёр ClickHouse через выделенный конвейер

**Собираемые ключевые метрики:**

- `redis.commands.processed` — команд обработано в секунду
- `redis.clients.connected` — количество подключённых клиентов
- `redis.clients.blocked` — клиенты, заблокированные на блокирующих вызовах
- `redis.memory.used` — память, используемая Redis, в байтах
- `redis.memory.peak` — пиковое использование памяти
- `redis.keyspace.hits` — успешные поиски ключей
- `redis.keyspace.misses` — неудачные поиски ключей (для расчёта коэффициента попаданий в кэш)
- `redis.keys.expired` — истёкшие ключи
- `redis.keys.evicted` — ключи, вытесненные из-за нехватки памяти
- `redis.connections.received` — всего получено подключений
- `redis.connections.rejected` — отклонённые подключения

:::note

- В пользовательской конфигурации вы определяете только новые приёмники, процессоры и конвейеры
- Процессоры `memory_limiter` и `batch`, а также экспортёр `clickhouse` уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
- Процессор `resource` устанавливает обязательный атрибут `service.name` в соответствии с семантическими соглашениями OpenTelemetry
- Для продакшена с аутентификацией храните пароль в переменной окружения: `${env:REDIS_PASSWORD}`
- Настройте `collection_interval` в соответствии с вашими потребностями (по умолчанию 10 секунд; меньшие значения увеличивают объём данных)
- Для нескольких экземпляров Redis настройте `service.name`, чтобы различать их (например, `"redis-cache"`, `"redis-sessions"`)
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации {#load-custom}

Чтобы включить пользовательскую конфигурацию сборщика в существующем развёртывании ClickStack, необходимо:

1. Смонтировать пользовательский файл конфигурации в `/etc/otelcol-contrib/custom.config.yaml`
2. Установить переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Обеспечить сетевое соединение между ClickStack и Redis

##### Вариант 1: Docker Compose {#docker-compose}

Обновите конфигурацию развёртывания ClickStack:

```yaml
services:
  clickstack:
    # ... существующая конфигурация ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # Опционально: Если Redis требует аутентификации
      # - REDIS_PASSWORD=your-redis-password
      # ... другие переменные окружения ...
    volumes:
      - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      # ... другие тома ...
    # Если Redis находится в том же compose-файле:
    depends_on:
      - redis
```


redis:
image: redis:7-alpine
ports:

* &quot;6379:6379&quot;

# Необязательно: включите аутентификацию

# Команда: redis-server --requirepass your-redis-password

````

##### Вариант 2: Docker run (образ «всё в одном») {#all-in-one}

При использовании образа «всё в одном» с `docker run`:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````


**Важно:** Если Redis запущен в другом контейнере, используйте сеть Docker:

```bash
# Создание сети
docker network create monitoring
```


# Запустите Redis в сети Docker
docker run -d --name redis --network monitoring redis:7-alpine



# Запуск ClickStack в той же сети (обновите endpoint на &quot;redis:6379&quot; в конфигурации)

docker run --name clickstack \
--network monitoring \
-p 8080:8080 -p 4317:4317 -p 4318:4318 \
-e CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE=/etc/otelcol-contrib/custom.config.yaml \
-v &quot;$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro&quot; \
docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest

```

#### Проверка метрик в HyperDX {#verifying-metrics}

После настройки войдите в HyperDX и убедитесь, что метрики поступают:

1. Перейдите в обозреватель метрик (Metrics explorer)
2. Найдите метрики, начинающиеся с `redis.` (например, `redis.commands.processed`, `redis.memory.used`)
3. Вы должны увидеть точки данных метрик, появляющиеся с заданным интервалом сбора

<!-- <Image img={metrics_view} alt="Redis Metrics view"/> -->

</VerticalStepper>
```


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию Redis Metrics перед настройкой своих production-систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными паттернами метрик Redis.

<VerticalStepper headerLevel="h4">

#### Скачайте демонстрационный набор данных метрик {#download-sample}


Скачайте заранее сгенерированные файлы метрик (24 часа метрик Redis с реалистичными шаблонами):

```bash
# Загрузите метрики типа gauge (память, коэффициент фрагментации)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv
```


# Загрузка суммарных метрик (команды, соединения, статистика keyspace)

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv

````

Набор данных включает реалистичные шаблоны:
- **Событие прогрева кэша (06:00)** - Процент попаданий увеличивается с 30% до 80%
- **Всплеск трафика (14:30-14:45)** - Пятикратное увеличение трафика с нагрузкой на соединения
- **Нагрузка на память (20:00)** - Вытеснение ключей и снижение производительности кэша
- **Суточные шаблоны трафика** - Пики в рабочие часы, спады вечером, случайные микровсплески

#### Запуск ClickStack {#start-clickstack}

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

Подождите примерно 30 секунд до полного запуска ClickStack.

#### Загрузка метрик в ClickStack {#load-metrics}


Загрузите метрики напрямую в ClickHouse:

```bash
# Загрузка метрик gauge (память, фрагментация)
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# Загрузка суммарных метрик (команды, подключения, keyspace)

cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### Проверка метрик в HyperDX {#verify-metrics}

После загрузки самый быстрый способ просмотреть метрики — использовать готовую панель мониторинга.

Перейдите к разделу [Панели мониторинга и визуализация](#dashboards), чтобы импортировать панель и просмотреть все метрики Redis.

:::note
Временной диапазон демонстрационного набора данных: с 2025-10-20 00:00:00 по 2025-10-21 05:00:00. Убедитесь, что временной диапазон в HyperDX соответствует этому периоду.

Обратите внимание на следующие характерные паттерны:
- **06:00** — Прогрев кеша (низкий процент попаданий постепенно растёт)
- **14:30-14:45** — Всплеск трафика (высокое количество клиентских подключений, частичные отклонения)
- **20:00** — Нагрузка на память (начинается вытеснение ключей)
:::

</VerticalStepper>
```


## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем необходимые визуализации для метрик Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком многоточия

<Image img={import_dashboard} alt='Кнопка импорта дашборда' />

3. Загрузите файл `redis-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt='Диалог завершения импорта' />

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми предварительно настроенными визуализациями:

<Image img={example_dashboard} alt='Дашборд метрик Redis' />

:::note
Для демонстрационного набора данных установите временной диапазон **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). По умолчанию импортированный дашборд не имеет указанного временного диапазона.
:::

</VerticalStepper>


## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается {#troubleshooting-not-loading}

Проверьте, что переменная окружения `CUSTOM_OTELCOL_CONFIG_FILE` установлена правильно:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что файл пользовательской конфигурации смонтирован по пути `/etc/otelcol-contrib/custom.config.yaml`:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

Просмотрите содержимое пользовательской конфигурации, чтобы убедиться, что файл доступен для чтения:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### Метрики не отображаются в HyperDX {#no-metrics}


Убедитесь, что к Redis есть доступ с узла коллектора:

```bash
# Из контейнера ClickStack
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Ожидаемый результат: PONG
```


Проверьте, что команда Redis INFO работает:

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Должна отобразить статистику Redis
```

Убедитесь, что фактическая конфигурация содержит ваш приёмник Redis:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```


Проверьте наличие ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Ищите ошибки подключения или ошибки аутентификации
```

### Ошибки аутентификации {#auth-errors}


Если вы видите ошибки аутентификации в логах:

```bash
# Проверка требования аутентификации в Redis
redis-cli CONFIG GET requirepass
```


# Проверка аутентификации

redis-cli -a <password> ping


# Убедитесь, что пароль задан в окружении ClickStack

docker exec <clickstack-container> printenv REDIS_PASSWORD

````

Обновите конфигурацию, чтобы использовать пароль:
```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
````

### Проблемы с сетевым соединением {#network-issues}


Если ClickStack не удаётся подключиться к Redis:

```bash
# Проверьте, находятся ли оба контейнера в одной сети
docker network inspect <network-name>
```


# Проверка подключения

docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379

```

Убедитесь, что в вашем файле Docker Compose или в командах `docker run` оба контейнера находятся в одной сети.

```


## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько следующих шагов для экспериментов с мониторингом:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических метрик (пороговые значения использования памяти, лимиты подключений, снижение процента попаданий в кэш)
- Создайте дополнительные дашборды для конкретных сценариев использования (задержка репликации, производительность сохранения данных)
- Отслеживайте несколько экземпляров Redis, дублируя конфигурацию приёмника с различными конечными точками и именами сервисов
