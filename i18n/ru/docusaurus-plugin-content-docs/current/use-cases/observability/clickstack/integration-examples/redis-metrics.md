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

:::note[Кратко]
В этом руководстве показано, как отслеживать метрики производительности Redis с помощью ClickStack, настроив ресивер Redis в OTel collector. Вы узнаете, как:

- Настроить OTel collector для сбора метрик Redis
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовый дашборд для визуализации производительности Redis (команды/сек, использование памяти, подключенные клиенты, эффективность кэша)

Демо-набор данных с примерными метриками доступен, если вы хотите протестировать интеграцию до настройки вашего боевого Redis.

Требуемое время: 5–10 минут
:::



## Интеграция с существующим Redis {#existing-redis}

В этом разделе описывается настройка существующей установки Redis для отправки метрик в ClickStack путём конфигурирования OTel collector ClickStack с приёмником Redis.

Если вы хотите протестировать интеграцию метрик Redis перед настройкой собственной установки, можете воспользоваться нашим предварительно настроенным демонстрационным набором данных в [следующем разделе](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка Redis (версия 3.0 или новее)
- Сетевой доступ от ClickStack к Redis (порт по умолчанию 6379)
- Пароль Redis, если включена аутентификация

<VerticalStepper headerLevel="h4">

#### Проверка подключения к Redis {#verify-redis}


Сначала убедитесь, что вы можете подключиться к Redis и что команда INFO выполняется успешно:

```bash
# Проверка подключения
redis-cli ping
# Ожидаемый вывод: PONG
```


# Проверка команды INFO (используется сборщиком метрик)

redis-cli INFO server

# Должна отобразиться информация о сервере Redis

````

Если для Redis требуется аутентификация:
```bash
redis-cli -a <ваш-пароль> ping
````

**Распространённые Redis-эндпоинты:**

* **Локальная установка**: `localhost:6379`
* **Docker**: используйте имя контейнера или сервиса (например, `redis:6379`)
* **Удалённый хост**: `<redis-host>:6379`

#### Создание пользовательской конфигурации OTel collector

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry collector, смонтировав пользовательский конфигурационный файл и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

Создайте файл с именем `redis-metrics.yaml` со следующей конфигурацией:

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

* Подключается к Redis на `localhost:6379` (скорректируйте endpoint под вашу среду)
* Собирает метрики каждые 10 секунд
* Собирает ключевые метрики производительности (команды, клиенты, память, статистику по пространству ключей)
* **Устанавливает обязательный ресурсный атрибут `service.name`** в соответствии с [семантическими соглашениями OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/resource/#service)
* Направляет метрики в экспортер ClickHouse через выделенный конвейер

**Собираемые ключевые метрики:**

* `redis.commands.processed` - количество обработанных команд в секунду
* `redis.clients.connected` - число подключенных клиентов
* `redis.clients.blocked` - клиенты, заблокированные на блокирующих вызовах
* `redis.memory.used` - объем памяти, используемой Redis, в байтах
* `redis.memory.peak` - пиковое использование памяти
* `redis.keyspace.hits` - успешные обращения к ключам
* `redis.keyspace.misses` - неуспешные обращения к ключам (для расчета коэффициента попаданий в кэш)
* `redis.keys.expired` - истекшие ключи
* `redis.keys.evicted` - ключи, вытесненные из-за нехватки памяти
* `redis.connections.received` - общее число установленных подключений
* `redis.connections.rejected` - отклоненные подключения

:::note

* В пользовательской конфигурации вы определяете только новые receivers, processors и pipelines
* Процессоры `memory_limiter` и `batch` и экспортер `clickhouse` уже определены в базовой конфигурации ClickStack — вы лишь ссылаетесь на них по имени
* Процессор `resource` устанавливает обязательный атрибут `service.name` в соответствии с семантическими соглашениями OpenTelemetry
* В продуктивной среде с аутентификацией храните пароль в переменной окружения: `${env:REDIS_PASSWORD}`
* Настройте `collection_interval` в соответствии с вашими требованиями (по умолчанию 10s; меньшие значения увеличивают объем данных)
* Для нескольких экземпляров Redis настройте `service.name`, чтобы различать их (например, `"redis-cache"`, `"redis-sessions"`)
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации

Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

1. Смонтировать пользовательский конфигурационный файл в `/etc/otelcol-contrib/custom.config.yaml`
2. Установить переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Обеспечить сетевую доступность между ClickStack и Redis

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
```


redis:
image: redis:7-alpine
ports:

* &quot;6379:6379&quot;

# Необязательный шаг: включите аутентификацию

# command: redis-server --requirepass your-redis-password

````

##### Вариант 2: Docker run (образ all-in-one) {#all-in-one}

При использовании образа all-in-one с `docker run`:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````


**Важно:** если Redis запущен в отдельном контейнере, используйте сетевые возможности Docker:

```bash
# Создайте сеть
docker network create monitoring
```


# Запуск Redis в сети
docker run -d --name redis --network monitoring redis:7-alpine



# Запуск ClickStack в той же сети (обновите конечную точку на &quot;redis:6379&quot; в конфигурации)

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

<!-- <Image img={metrics_view} alt="Представление метрик Redis"/> -->

</VerticalStepper>
```


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию Redis Metrics перед настройкой продуктивных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными паттернами метрик Redis.

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных метрик {#download-sample}


Скачайте заранее сгенерированные файлы метрик (24 часа метрик Redis с реалистичными шаблонами):

```bash
# Скачайте метрики типа gauge (память, коэффициент фрагментации)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv
```


# Скачать суммарные метрики (команды, подключения, статистика по пространству ключей keyspace)

curl -O [https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv](https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv)

````

Набор данных включает реалистичные сценарии:
- **Событие прогрева кэша (06:00)** — коэффициент попаданий возрастает с 30% до 80%
- **Всплеск трафика (14:30-14:45)** — пятикратный рост трафика с нагрузкой на соединения
- **Нагрузка на память (20:00)** — вытеснение ключей и снижение производительности кэша
- **Суточные паттерны трафика** — пики в рабочие часы, спады вечером, случайные микровсплески

#### Запуск ClickStack                    

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

Подождите около 30 секунд, пока ClickStack полностью запустится.

#### Загрузите метрики в ClickStack


Загрузите метрики непосредственно в ClickHouse:

```bash
# Загрузка метрик gauge (память, фрагментация)
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# Загрузка суммарных метрик (команды, подключения, пространство ключей)

cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### Проверка метрик в HyperDX {#verify-metrics}

После загрузки самый быстрый способ просмотреть метрики — воспользоваться готовой панелью мониторинга.

Перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать панель мониторинга и просмотреть все метрики Redis.

:::note
Временной диапазон демонстрационного набора данных: с 2025-10-20 00:00:00 по 2025-10-21 05:00:00. Убедитесь, что временной диапазон в HyperDX соответствует этому интервалу.

Обратите внимание на следующие характерные паттерны:
- **06:00** — Прогрев кеша (низкий процент попаданий с последующим ростом)
- **14:30-14:45** — Всплеск трафика (высокое количество клиентских подключений, некоторые отклонения)
- **20:00** — Нагрузка на память (начинается вытеснение ключей)
:::

</VerticalStepper>
```


## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем основные визуализации для метрик Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под иконкой с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `redis-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми предварительно настроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд Redis Metrics"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)** (откорректируйте с учетом вашего часового пояса). Импортируемый дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>



## Устранение неполадок

### Пользовательская конфигурация не загружается

Убедитесь, что переменная окружения `CUSTOM_OTELCOL_CONFIG_FILE` установлена корректно:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что пользовательский конфигурационный файл смонтирован по пути `/etc/otelcol-contrib/custom.config.yaml`:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

Просмотрите содержимое пользовательской конфигурации и убедитесь, что его можно прочитать:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### Метрики не отображаются в HyperDX


Убедитесь, что к Redis есть доступ из коллектора:

```bash
# Из контейнера ClickStack
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Ожидаемый результат: PONG
```


Проверьте, работает ли команда INFO в Redis:

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Должна отобразиться статистика Redis
```

Убедитесь, что в итоговой конфигурации присутствует ваш приёмник Redis:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```


Проверьте наличие ошибок в логах коллектора:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Ищите ошибки подключения или ошибки аутентификации
```

### Ошибки аутентификации


Если в логах есть ошибки аутентификации:

```bash
# Проверьте, требует ли Redis аутентификации
redis-cli CONFIG GET requirepass
```


# Проверка аутентификации

redis-cli -a <password> ping


# Убедитесь, что пароль установлен в окружении ClickStack

docker exec <clickstack-container> printenv REDIS_PASSWORD

````

Обновите конфигурацию для использования пароля:
```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
````

### Проблемы с сетевым подключением {#network-issues}


Если ClickStack не удаётся подключиться к Redis:

```bash
# Проверьте, находятся ли оба контейнера в одной сети
docker network inspect <network-name>
```


# Проверка подключения

docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379

```

Убедитесь, что файл Docker Compose или команды `docker run` размещают оба контейнера в одной сети.

```


## Дальнейшие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько идей для экспериментов с мониторингом:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик (порогов использования памяти, лимитов соединений, снижения коэффициента попаданий в кэш)
- Создайте дополнительные панели мониторинга для конкретных сценариев (задержка репликации, производительность подсистемы хранения данных)
- Отслеживайте несколько экземпляров Redis, дублируя конфигурацию `receiver` с разными конечными точками и именами сервисов