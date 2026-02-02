---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'Мониторинг метрик Kafka с помощью ClickStack'
sidebar_label: 'Метрики Kafka'
pagination_prev: null
pagination_next: null
description: 'Мониторинг метрик Kafka с помощью ClickStack'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTEL', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг метрик Kafka с помощью ClickStack \{#kafka-metrics-clickstack\}

:::note[TL;DR]
В этом руководстве показано, как отслеживать метрики производительности Apache Kafka с помощью ClickStack, используя OpenTelemetry JMX Metric Gatherer. Вы узнаете, как:

- Включить JMX на брокерах Kafka и настроить JMX Metric Gatherer
- Отправлять метрики Kafka в ClickStack по OTLP
- Использовать готовую панель для визуализации производительности Kafka (пропускная способность брокеров, лаг потребителей, состояние партиций, задержка запросов)

Если вы хотите протестировать интеграцию до настройки вашего production‑кластера Kafka, доступен демонстрационный набор данных с примерными метриками.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим развертыванием Kafka \{#existing-kafka\}

Мониторьте существующее развертывание Kafka, запустив контейнер OpenTelemetry JMX Metric Gatherer для сбора метрик и их отправки в ClickStack по протоколу OTLP.

Если вы хотите сначала опробовать эту интеграцию, не изменяя текущую конфигурацию, перейдите к [разделу с демонстрационным датасетом](#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Существующее развёртывание Kafka (версии 2.0 или новее) с включённым JMX
- Сетевой доступ между ClickStack и Kafka (порт JMX 9999, порт Kafka 9092)
- JAR-файл OpenTelemetry JMX Metric Gatherer (инструкции по скачиванию ниже)

<VerticalStepper headerLevel="h4">
  #### Получите API-ключ ClickStack

  JMX Metric Gatherer отправляет данные на OTLP-эндпоинт ClickStack, для которого требуется аутентификация.

  1. Откройте HyperDX по URL-адресу вашего ClickStack (например, http://localhost:8080)
  2. При необходимости создайте учетную запись или войдите в систему
  3. Перейдите в раздел **Team Settings → API Keys**
  4. Скопируйте свой **ключ API для приёма данных API key**

  <Image img={api_key} alt="API-ключ ClickStack" />

  5. Установите её в качестве переменной окружения:

  ```bash
  export CLICKSTACK_API_KEY=your-api-key-here
  ```

  #### Скачайте OpenTelemetry JMX Metric Gatherer

  Скачайте JAR-файл JMX Metric Gatherer:

  ```bash
  curl -L -o opentelemetry-jmx-metrics.jar \
    https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
  ```

  #### Убедитесь, что JMX для Kafka включен

  Убедитесь, что JMX включен на брокерах Kafka. Для развертываний Docker:

  ```yaml
  services:
    kafka:
      image: confluentinc/cp-kafka:latest
      environment:
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        # ... other Kafka configuration
      ports:
        - "9092:9092"
        - "9999:9999"
  ```

  Для развертываний без использования Docker задайте эти параметры при запуске Kafka:

  ```bash
  export JMX_PORT=9999
  ```

  Проверьте доступность JMX:

  ```bash
  netstat -an | grep 9999
  ```

  #### Развертывание сборщика метрик JMX с Docker Compose

  Этот пример демонстрирует полную конфигурацию с Kafka, JMX Metric Gatherer и ClickStack. Настройте имена сервисов и конечные точки в соответствии с вашим текущим развертыванием:

  ```yaml
  services:
    clickstack:
      image: clickhouse/clickstack-all-in-one:latest
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

  **Основные параметры конфигурации:**

  * `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - URL подключения по JMX (используйте имя хоста вашего Kafka)
  * `otel.jmx.target.system=kafka` - включает метрики Kafka
  * `http://clickstack:4318` - HTTP-эндпоинт OTLP (используйте имя хоста вашего ClickStack)
  * `authorization=\${CLICKSTACK_API_KEY}` - ключ API для аутентификации (обязательный параметр)
  * `service.name=kafka,kafka.broker.id=broker-0` - Атрибуты ресурса для фильтрации
  * `10000` - интервал сбора в миллисекундах (10 секунд)

  #### Проверьте метрики в HyperDX

  Войдите в HyperDX и убедитесь в поступлении метрик:

  1. Откройте Chart Explorer
  2. Найдите метрику `kafka.message.count` или `kafka.partition.count`
  3. Метрики должны поступать с интервалом 10 секунд

  **Ключевые метрики для проверки:**

  * `kafka.message.count` - Всего обработанных сообщений
  * `kafka.partition.count` - Общее число партиций
  * `kafka.partition.under_replicated` - В исправном кластере значение должно быть 0
  * `kafka.network.io` - Сетевой трафик
  * `kafka.request.time.*` - Перцентили времени отклика запросов

  Чтобы сгенерировать активность и получить больше метрик:

  ```bash
  # Create a test topic
  docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

  # Send test messages
  echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
  ```

  :::note
  При запуске клиентских команд Kafka (kafka-topics, kafka-console-producer и т. д.) внутри контейнера Kafka используйте префикс `unset JMX_PORT &&`, чтобы избежать конфликтов портов JMX.
  :::
</VerticalStepper>

## Демонстрационный датасет {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию метрик Kafka перед настройкой продуктивных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными профилями метрик Kafka.

<VerticalStepper headerLevel="h4">

#### Загрузка примерного датасета метрик \{#download-sample\}

Скачайте предварительно сгенерированные файлы метрик (29 часов метрик Kafka с реалистичными профилями):
```bash
# Загрузка gauge-метрик (количество партиций, размеры очередей, задержки, лаг потребителей)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# Загрузка sum-метрик (скорости сообщений, скорости по байтам, количество запросов)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

Датасет включает реалистичные профили для одноброкерного кластера Kafka для e-commerce:
- **06:00-08:00: Утренний всплеск** — резкий рост трафика от ночного базового уровня
- **10:00-10:15: Флеш-распродажа** — резкий всплеск до 3,5× от нормального трафика
- **11:30: Событие развертывания** — 12× всплеск лага потребителей с недореплицированными партициями
- **14:00-15:30: Пиковые покупки** — устойчивый высокий трафик на уровне 2,8× базового
- **17:00-17:30: Вечерний всплеск после работы** — вторичный пик трафика
- **18:45: Перебалансировка потребителей** — 6× всплеск лага во время перебалансировки
- **20:00-22:00: Вечернее падение** — резкое снижение до ночных уровней

#### Запуск ClickStack \{#start-clickstack\}

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

#### Загрузка метрик в ClickStack \{#load-metrics\}

Загрузите метрики напрямую в ClickHouse:
```bash
# Загрузка gauge-метрик (количество партиций, размеры очередей, задержки, лаг потребителей)
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Загрузка sum-метрик (скорости сообщений, скорости по байтам, количество запросов)
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Проверка метрик в HyperDX \{#verify-demo-metrics\}

После загрузки самый быстрый способ просмотреть метрики — использовать преднастроенный дашборд.

Перейдите к разделу [Dashboards and visualization](#dashboards), чтобы импортировать дашборд и просмотреть все метрики Kafka одновременно.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демо-данные охватывают период **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**. Установите диапазон времени на **2025-11-04 16:00:00 - 2025-11-07 16:00:00**, чтобы гарантировать отображение демо-метрик независимо от вашего местоположения. После того как вы увидите метрики, вы можете сузить диапазон до 24 часов для более наглядного отображения.
:::

</VerticalStepper>

## Дашборды и визуализация \{#dashboards\}

Чтобы помочь вам приступить к мониторингу Kafka с помощью ClickStack, мы предоставляем основные визуализации для метрик Kafka.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда \{#download\}

#### Импортируйте готовый дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком многоточия

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `kafka-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотрите дашборд \{#created-dashboard\}

Дашборд будет создан со всеми заранее сконфигурированными визуализациями:

<Image img={example_dashboard} alt="Дашборд Kafka Metrics"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортируемый дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

#### Метрики не отображаются в HyperDX

**Убедитесь, что API-ключ настроен и передаётся в контейнер:**

```bash
# Check environment variable
echo $CLICKSTACK_API_KEY

# Verify it's in the container
docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY
```

Если он не задан, укажите его и перезапустите:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
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

**Сгенерируйте трафик в Kafka, чтобы заполнились метрики:**

```bash
# Create a test topic
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

# Send test messages
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```


#### Ошибки аутентификации \{#download\}

Если вы видите `Authorization failed` или `401 Unauthorized`:

1. Убедитесь, что используете корректный ключ API для приёма данных в интерфейсе HyperDX (Settings → API Keys → Ingestion API Key)
2. Повторно выполните экспорт и перезапустите:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
```


#### Конфликты портов при выполнении клиентских команд Kafka \{#import-dashboard\}

При выполнении клиентских команд Kafka из контейнера Kafka вы можете увидеть:

```bash
Error: Port already in use: 9999
```

Выполняйте команды с префиксом `unset JMX_PORT &&`:

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```


#### Проблемы с сетевым подключением \{#created-dashboard\}

Если в логах JMX exporter появляется `Connection refused`:

Убедитесь, что все контейнеры подключены к одной и той же сети Docker:

```bash
docker compose ps
docker network inspect <network-name>
```

Проверьте подключение:

```bash
# From JMX exporter to ClickStack
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```


## Переход в продакшен \{#going-to-production\}

В этом руководстве метрики отправляются напрямую из JMX Metric Gatherer в OTLP-эндпоинт ClickStack, что хорошо подходит для тестирования и небольших развертываний. 

Для продуктивных сред разверните собственный OpenTelemetry Collector в режиме агента, чтобы получать метрики от JMX Exporter и пересылать их в ClickStack. Это обеспечивает формирование батчей, устойчивость и централизованное управление конфигурацией.

См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для ознакомления с вариантами продакшен-развертываний и примерами конфигурации коллектора.