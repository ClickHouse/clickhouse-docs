---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'Мониторинг метрик Kafka с помощью ClickStack'
sidebar_label: 'Метрики Kafka'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик Kafka с помощью ClickStack'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTel', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Мониторинг метрик Kafka с помощью ClickStack {#kafka-metrics-clickstack}

:::note[TL;DR]
В этом руководстве показано, как отслеживать метрики производительности Apache Kafka с помощью ClickStack, используя OpenTelemetry JMX Metric Gatherer. Вы узнаете, как:

- Включить JMX на брокерах Kafka и настроить JMX Metric Gatherer
- Отправлять метрики Kafka в ClickStack через OTLP
- Использовать готовую панель мониторинга для визуализации производительности Kafka (пропускная способность брокеров, отставание потребителей, состояние партиций, задержка запросов)

Доступен демонстрационный набор данных с примерами метрик, если вы хотите протестировать интеграцию перед настройкой боевого кластера Kafka.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим развертыванием Kafka {#existing-kafka}

Мониторьте существующее развертывание Kafka, запустив контейнер OpenTelemetry JMX Metric Gatherer для сбора метрик и их отправки в ClickStack по OTLP.

Если вы хотите сначала протестировать эту интеграцию, не изменяя существующее развертывание, перейдите к [разделу с демонстрационным набором данных](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Развернутая Kafka версии 2.0 или новее с включенным JMX
- Сетевой доступ между ClickStack и Kafka (порт JMX 9999, порт Kafka 9092)
- JAR-файл OpenTelemetry JMX Metric Gatherer (инструкции по скачиванию см. ниже)

<VerticalStepper headerLevel="h4">
  #### Получите API-ключ ClickStack

  JMX Metric Gatherer отправляет данные на OTLP-эндпоинт ClickStack, который требует аутентификации.

  1. Откройте HyperDX по URL-адресу ClickStack (например, [http://localhost:8080](http://localhost:8080))
  2. Создайте учетную запись или, при необходимости, войдите в систему
  3. Перейдите в раздел **Team Settings → API Keys**
  4. Скопируйте **ключ API для приёма данных**

  <Image img={api_key} alt="API-ключ ClickStack" />

  5. Задайте его в переменной окружения:

  ```bash
  export CLICKSTACK_API_KEY=your-api-key-here
  ```

  #### Загрузите сборщик метрик JMX для OpenTelemetry

  Скачайте JAR-файл JMX Metric Gatherer:

  ```bash
  curl -L -o opentelemetry-jmx-metrics.jar \
    https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
  ```

  #### Проверьте, что JMX включен для Kafka

  Убедитесь, что JMX включен на брокерах Kafka. Для развертываний Docker:

  ```yaml
  services:
    kafka:
      image: confluentinc/cp-kafka:latest
      environment:
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        # ... другие настройки Kafka
      ports:
        - "9092:9092"
        - "9999:9999"
  ```

  Для развертываний без Docker задайте эти параметры при запуске Kafka:

  ```bash
  export JMX_PORT=9999
  ```

  Проверьте доступность JMX:

  ```bash
  netstat -an | grep 9999
  ```

  #### Развертывание сборщика метрик JMX с помощью Docker Compose

  Этот пример демонстрирует полную настройку с Kafka, JMX Metric Gatherer и ClickStack. Укажите имена сервисов и конечные точки в соответствии с вашим существующим развертыванием:

  ```yaml
  services:
    clickstack:
      image: docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
      ports:
        - "8080:8080"
        - "4317:4317"
        - "4318:4318"
      networks:
        - monitoring

    kafka:
      image: confluentinc/cp-kafka:latest
      hostname: kafka
      container_name: kafka
      environment:
        KAFKA_NODE_ID: 1
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:9092'
        KAFKA_PROCESS_ROLES: 'broker,controller'
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:29093'
        KAFKA_LISTENERS: 'PLAINTEXT://kafka:9092,CONTROLLER://kafka:29093'
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
        KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
        CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        KAFKA_JMX_OPTS: '-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9999'
      ports:
        - "9092:9092"
        - "9999:9999"
      networks:
        - monitoring

    kafka-jmx-exporter:
      image: eclipse-temurin:11-jre
      depends_on:
        - kafka
        - clickstack
      environment:
        - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      volumes:
        - ./opentelemetry-jmx-metrics.jar:/app/opentelemetry-jmx-metrics.jar
      command: >
        sh -c "java
        -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi
        -Dotel.jmx.target.system=kafka
        -Dotel.metrics.exporter=otlp
        -Dotel.exporter.otlp.protocol=http/protobuf
        -Dotel.exporter.otlp.endpoint=http://clickstack:4318
        -Dotel.exporter.otlp.headers=authorization=\${CLICKSTACK_API_KEY}
        -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0
        -Dotel.jmx.interval.milliseconds=10000
        -jar /app/opentelemetry-jmx-metrics.jar"
      networks:
        - monitoring

  networks:
    monitoring:
      driver: bridge
  ```

  **Ключевые параметры конфигурации:**

  * `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - URL подключения JMX (используйте имя хоста вашего кластера Kafka)
  * `otel.jmx.target.system=kafka` - Включает метрики Kafka
  * `http://clickstack:4318` — HTTP-эндпоинт OTLP (используйте имя хоста ClickStack)
  * `authorization=\${CLICKSTACK_API_KEY}` — ключ API для аутентификации (обязателен)
  * `service.name=kafka,kafka.broker.id=broker-0` - атрибуты ресурса, используемые для фильтрации
  * `10000` - Интервал сбора данных в миллисекундах (10 секунд)

  #### Проверка метрик в HyperDX

  Войдите в HyperDX и убедитесь, что метрики поступают:

  1. Перейдите в раздел Chart Explorer
  2. Найдите `kafka.message.count` или `kafka.partition.count`
  3. Метрики должны появляться каждые 10 секунд

  **Ключевые метрики для проверки:**

  * `kafka.message.count` - Общее количество обработанных сообщений
  * `kafka.partition.count` - Общее количество партиций
  * `kafka.partition.under_replicated` - в здоровом кластере это значение должно быть равно 0
  * `kafka.network.io` - Пропускная способность сети
  * `kafka.request.time.*` - Процентили времени обработки запросов

  Чтобы создать активность и получить больше метрик:

  ```bash
  # Создание тестового топика
  docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

  # Отправка тестовых сообщений
  echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
  ```

  :::note
  При запуске клиентских команд Kafka (kafka-topics, kafka-console-producer и т. д.) внутри контейнера Kafka используйте префикс `unset JMX_PORT &&`, чтобы избежать конфликтов портов JMX.
  :::
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик Kafka перед настройкой продуктивных систем, мы предоставляем заранее сгенерированный набор данных с реалистичными паттернами метрик Kafka.

<VerticalStepper headerLevel="h4">

#### Загрузите пример набора метрик {#download-sample}

Скачайте заранее сгенерированные файлы метрик (29 часов метрик Kafka с реалистичными паттернами):
```bash
# Загрузка gauge-метрик (количество партиций, размеры очередей, задержки, лаг потребителя)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# Загрузка sum-метрик (скорость сообщений, скорость по байтам, количество запросов)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

Набор данных включает реалистичные паттерны для e-commerce кластера Kafka с одним брокером:
- **06:00-08:00: Утренний всплеск** — резкий рост трафика относительно ночного базового уровня
- **10:00-10:15: Молниеносная распродажа** — резкий всплеск до 3.5× обычного трафика
- **11:30: Событие развертывания** — 12× всплеск лага потребителя с недореплицированными партициями
- **14:00-15:30: Пиковый период покупок** — устойчиво высокий трафик на уровне 2.8× от базового
- **17:00-17:30: После работы** — вторичный пик трафика
- **18:45: Перебалансировка потребителей** — 6× всплеск лага во время перебалансировки
- **20:00-22:00: Вечернее снижение** — резкое снижение до ночного уровня

#### Запуск ClickStack {#start-clickstack}

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Загрузка метрик в ClickStack {#load-metrics}

Загрузите метрики напрямую в ClickHouse:
```bash
# Загрузка gauge-метрик (количество партиций, размеры очередей, задержки, лаг потребителя) {#send-test-messages}
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Загрузка sum-метрик (скорость сообщений, скорость по байтам, количество запросов)
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Проверка метрик в HyperDX {#verify-demo-metrics}

После загрузки самый быстрый способ просмотреть метрики — использовать преднастроенный дашборд.

Перейдите к разделу [Дашборды и визуализация](#dashboards), чтобы импортировать дашборд и просмотреть все метрики Kafka одновременно.

:::note[Отображение часового пояса]
HyperDX отображает отметки времени в часовом поясе, настроенном в браузере. Демонстрационные данные охватывают период **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**. Установите диапазон времени на **2025-11-04 16:00:00 - 2025-11-07 16:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. После того как вы увидите метрики, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Панели и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Kafka с помощью ClickStack, мы предоставляем основные визуализации для метрик Kafka.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию панели {#download}

#### Импорт готовой панели {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта панели"/>

3. Загрузите файл `kafka-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалоговое окно завершения импорта"/>

#### Просмотр панели {#created-dashboard}

Панель будет создана со всеми предварительно настроенными визуализациями:

<Image img={example_dashboard} alt="Панель метрик Kafka"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** (при необходимости скорректируйте его в соответствии с вашим часовым поясом). В импортируемой панели по умолчанию не задан диапазон времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

#### Метрики не отображаются в HyperDX

**Убедитесь, что API-ключ задан и передаётся в контейнер:**

```bash
# Проверка переменной окружения
echo $CLICKSTACK_API_KEY

# Проверка наличия переменной в контейнере
docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY
```

Если параметр не задан, задайте его и перезапустите:

```bash
export CLICKSTACK_API_KEY=ваш-api-ключ
docker compose up -d kafka-jmx-exporter
```

**Проверьте, доходят ли метрики до ClickHouse:**

```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName 
FROM otel_metrics_sum 
WHERE ServiceName = 'kafka' 
LIMIT 10
"
```

Если вы не видите результатов, проверьте логи экспортера JMX:

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**Сгенерируйте активность в Kafka, чтобы заполнить метрики:**

```bash
# Создание тестового топика
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

# Отправка тестовых сообщений
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```

#### Ошибки авторизации {#created-dashboard}

Если вы видите `Authorization failed` или `401 Unauthorized`:

1. Проверьте ключ API в интерфейсе HyperDX (Settings → API Keys → Ingestion API Key (ключ API для приёма данных))
2. Повторно выполните экспорт и перезапустите:

```bash
export CLICKSTACK_API_KEY=ваш-корректный-api-ключ
docker compose down
docker compose up -d
```

#### Конфликты портов при выполнении команд клиента Kafka

При выполнении команд клиента Kafka внутри контейнера Kafka вы можете увидеть:

```bash
Ошибка: порт уже используется: 9999
```

Добавьте к каждой команде префикс `unset JMX_PORT &&`:

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```

#### Проблемы с сетевым подключением {#no-metrics}

Если в логах экспортера JMX появляется сообщение `Connection refused`:

Убедитесь, что все контейнеры находятся в одной сети Docker:

```bash
docker compose ps
docker network inspect <имя-сети>
```

Проверка подключения:

```bash
# Из JMX-экспортера в ClickStack {#check-environment-variable}
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```

## Переход в продакшн {#going-to-production}

В этом руководстве метрики отправляются напрямую из JMX Metric Gatherer в OTLP-эндпоинт ClickStack, что хорошо подходит для тестирования и небольших развертываний. 

Для продакшн-сред разверните собственный OpenTelemetry Collector в режиме агента для получения метрик от JMX Exporter и их пересылки в ClickStack. Это обеспечивает пакетную обработку, устойчивость и централизованное управление конфигурацией.

См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для ознакомления с паттернами продакшн-развертывания и примерами конфигурации коллектора.