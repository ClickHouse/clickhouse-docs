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

:::note[Кратко]
В этом руководстве показано, как мониторить метрики производительности Apache Kafka с помощью ClickStack, используя сборщик метрик OpenTelemetry JMX Metric Gatherer. Вы узнаете, как:

- Включить JMX на брокерах Kafka и настроить JMX Metric Gatherer
- Отправлять метрики Kafka в ClickStack по протоколу OTLP
- Использовать готовый дашборд для визуализации производительности Kafka (пропускная способность брокеров, отставание потребителей, состояние партиций, задержка запросов)

Доступен демонстрационный набор данных с примерными метриками, если вы хотите протестировать интеграцию до настройки вашего продукционного кластера Kafka.

Требуемое время: 10–15 минут
:::



## Интеграция с существующим развёртыванием Kafka {#existing-kafka}

Мониторьте существующее развёртывание Kafka, запустив контейнер OpenTelemetry JMX Metric Gatherer для сбора метрик и их отправки в ClickStack через OTLP.

Если вы хотите сначала протестировать эту интеграцию без изменения существующей настройки, перейдите к [разделу с демонстрационным набором данных](#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка Kafka (версия 2.0 или новее) с включённым JMX
- Сетевой доступ между ClickStack и Kafka (порт JMX 9999, порт Kafka 9092)
- JAR-файл OpenTelemetry JMX Metric Gatherer (инструкции по загрузке приведены ниже)

<VerticalStepper headerLevel="h4">

#### Получение ключа API ClickStack {#get-api-key}

JMX Metric Gatherer отправляет данные в конечную точку OTLP ClickStack, для которой требуется аутентификация.

1. Откройте HyperDX по URL вашего ClickStack (например, http://localhost:8080)
2. Создайте учётную запись или войдите в систему при необходимости
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **Ingestion API Key**

<Image img={api_key} alt='ClickStack API Key' />

5. Установите его как переменную окружения:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Загрузка OpenTelemetry JMX Metric Gatherer {#download-jmx}

Загрузите JAR-файл JMX Metric Gatherer:

```bash
curl -L -o opentelemetry-jmx-metrics.jar \
  https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
```

#### Проверка включения JMX в Kafka {#verify-jmx}

Убедитесь, что JMX включён на ваших брокерах Kafka. Для развёртываний Docker:

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

Для развёртываний без Docker установите эти параметры при запуске Kafka:

```bash
export JMX_PORT=9999
```

Проверьте доступность JMX:

```bash
netstat -an | grep 9999
```

#### Развёртывание JMX Metric Gatherer с помощью Docker Compose {#deploy-jmx}

Этот пример демонстрирует полную настройку с Kafka, JMX Metric Gatherer и ClickStack. Настройте имена сервисов и конечные точки в соответствии с вашим существующим развёртыванием:

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
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092"
      KAFKA_PROCESS_ROLES: "broker,controller"
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:29093"
      KAFKA_LISTENERS: "PLAINTEXT://kafka:9092,CONTROLLER://kafka:29093"
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_LOG_DIRS: "/tmp/kraft-combined-logs"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDM2Qk"
      JMX_PORT: 9999
      KAFKA_JMX_HOSTNAME: kafka
      KAFKA_JMX_OPTS: "-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9999"
    ports:
      - "9092:9092"
      - "9999:9999"
    networks:
      - monitoring
```


kafka-jmx-exporter:
image: eclipse-temurin:11-jre
depends&#95;on:

* kafka
* clickstack
  environment:
* CLICKSTACK&#95;API&#95;KEY=${CLICKSTACK_API_KEY}
  volumes:
* ./opentelemetry-jmx-metrics.jar:/app/opentelemetry-jmx-metrics.jar
  command: &gt;
  sh -c &quot;java
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi
  -Dotel.jmx.target.system=kafka
  -Dotel.metrics.exporter=otlp
  -Dotel.exporter.otlp.protocol=http/protobuf
  -Dotel.exporter.otlp.endpoint=[http://clickstack:4318](http://clickstack:4318)
  -Dotel.exporter.otlp.headers=authorization=${CLICKSTACK_API_KEY}
  -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0
  -Dotel.jmx.interval.milliseconds=10000
  -jar /app/opentelemetry-jmx-metrics.jar&quot;
  networks:
* monitoring

networks:
monitoring:
driver: bridge

```

**Ключевые параметры конфигурации:**

- `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - URL подключения JMX (укажите имя хоста вашего Kafka)
- `otel.jmx.target.system=kafka` - Включает метрики для Kafka
- `http://clickstack:4318` - Конечная точка OTLP HTTP (укажите имя хоста вашего ClickStack)
- `authorization=\${CLICKSTACK_API_KEY}` - API-ключ для аутентификации (обязательный параметр)
- `service.name=kafka,kafka.broker.id=broker-0` - Атрибуты ресурса для фильтрации
- `10000` - Интервал сбора в миллисекундах (10 секунд)

#### Проверка метрик в HyperDX {#verify-metrics}

Войдите в HyperDX и убедитесь, что метрики поступают:

1. Перейдите в Chart Explorer
2. Найдите `kafka.message.count` или `kafka.partition.count`
3. Метрики должны появляться с интервалом 10 секунд

**Ключевые метрики для проверки:**
- `kafka.message.count` - Общее количество обработанных сообщений
- `kafka.partition.count` - Общее количество партиций
- `kafka.partition.under_replicated` - Должно быть 0 в исправном кластере
- `kafka.network.io` - Пропускная способность сети
- `kafka.request.time.*` - Процентили задержки запросов
```


Чтобы сгенерировать нагрузку и получить больше метрик:

```bash
# Создание тестового топика
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"
```


# Отправьте тестовые сообщения

echo -e &quot;Message 1\nMessage 2\nMessage 3&quot; | docker exec -i kafka bash -c &quot;unset JMX&#95;PORT &amp;&amp; kafka-console-producer --topic test-topic --bootstrap-server kafka:9092&quot;

```

:::note
При выполнении клиентских команд Kafka (kafka-topics, kafka-console-producer и т. д.) внутри контейнера Kafka используйте префикс `unset JMX_PORT &&`, чтобы избежать конфликтов портов JMX.
:::

</VerticalStepper>
```


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, желающих протестировать интеграцию метрик Kafka перед настройкой производственных систем, мы предоставляем предварительно сгенерированный набор данных с реалистичными шаблонами метрик Kafka.

<VerticalStepper headerLevel="h4">

#### Скачать образец набора метрик {#download-sample}


Скачайте предварительно сгенерированные файлы метрик (29 часов метрик Kafka с реалистичными шаблонами):

```bash
# Загрузите метрики типа gauge (количество разделов, размеры очередей, задержки, отставание потребителей)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv
```


# Скачайте суммарные метрики (скорости сообщений, скорости передачи байт, число запросов)

curl -O [https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv](https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv)

````

Набор данных включает реалистичные паттерны для одноброкерного кластера Kafka электронной коммерции:
- **06:00-08:00: Утренний всплеск** - Резкое увеличение трафика от ночного базового уровня
- **10:00-10:15: Флеш-распродажа** - Резкий скачок до 3,5x от нормального трафика
- **11:30: Событие развертывания** - Скачок задержки потребителя в 12x с недореплицированными партициями
- **14:00-15:30: Пик покупок** - Устойчивый высокий трафик на уровне 2,8x от базового
- **17:00-17:30: Послерабочий всплеск** - Вторичный пик трафика
- **18:45: Ребалансировка потребителя** - Скачок задержки в 6x во время ребалансировки
- **20:00-22:00: Вечерний спад** - Резкое снижение до ночных уровней

#### Запуск ClickStack                    

Запустите экземпляр ClickStack:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

#### Загрузка метрик в ClickStack


Загрузите метрики непосредственно в ClickHouse:

```bash
# Загрузка метрик gauge (количество партиций, размеры очередей, задержки, отставание потребителей)
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# Загрузите суммарные метрики (частоту сообщений, скорость передачи байт, количество запросов)

cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### Проверьте метрики в HyperDX {#verify-demo-metrics}

После загрузки самый быстрый способ просмотреть метрики — воспользоваться готовой панелью мониторинга.

Перейдите в раздел [Панели и визуализация](#dashboards), чтобы импортировать панель мониторинга и просмотреть все метрики Kafka одновременно.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**. Установите интервал времени **2025-11-04 16:00:00 - 2025-11-07 16:00:00**, чтобы видеть демо-метрики независимо от вашего местоположения. После того как вы увидите метрики, можно сузить интервал до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>
```


## Дашборды и визуализация {#dashboards}

Чтобы помочь вам приступить к мониторингу Kafka с помощью ClickStack, мы предоставляем базовые визуализации метрик Kafka.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с тремя точками

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `kafka-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми предварительно настроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд метрик Kafka"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** (откорректируйте его в соответствии с вашим часовым поясом). Импортируемый дашборд по умолчанию не имеет заданного диапазона времени.
:::

</VerticalStepper>



## Устранение неполадок {#troubleshooting}

#### Метрики не отображаются в HyperDX {#no-metrics}

**Убедитесь, что API-ключ установлен и передаётся в контейнер:**



```bash
# Проверка переменной окружения
echo $CLICKSTACK_API_KEY
```


# Проверьте наличие переменной в контейнере

docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY

````

Если переменная отсутствует, установите её и перезапустите:
```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d kafka-jmx-exporter
````

**Проверьте, поступают ли метрики в ClickHouse:**

```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName
FROM otel_metrics_sum
WHERE ServiceName = 'kafka'
LIMIT 10
"
```

Если результаты отсутствуют, проверьте логи JMX exporter:

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**Сгенерируйте активность Kafka для заполнения метрик:**


```bash
# Создание тестового топика
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"
```


# Отправьте тестовые сообщения

echo -e &quot;Message 1\nMessage 2\nMessage 3&quot; | docker exec -i kafka bash -c &quot;unset JMX&#95;PORT &amp;&amp; kafka-console-producer --topic test-topic --bootstrap-server kafka:9092&quot;

````

#### Ошибки аутентификации               

Если вы видите `Authorization failed` или `401 Unauthorized`:

1. Проверьте ключ API для приёма данных в интерфейсе HyperDX (Settings → API Keys → Ingestion API Key)
2. Повторно экспортируйте и перезапустите:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
````

#### Конфликты портов при выполнении клиентских команд Kafka

При выполнении команд Kafka из контейнера Kafka вы можете столкнуться со следующим:

```bash
Ошибка: порт уже используется: 9999
```

Добавьте ко всем командам префикс `unset JMX_PORT &&`:

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```

#### Проблемы с сетевым подключением

Если в журналах экспортера JMX отображается `Connection refused`:

Убедитесь, что все контейнеры находятся в одной сети Docker:

```bash
docker compose ps
docker network inspect <network-name>
```


Проверьте подключение:

```bash
# От экспортера JMX к ClickStack
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```


## Переход в продакшн {#going-to-production}

В этом руководстве метрики отправляются напрямую из JMX Metric Gatherer в OTLP-эндпоинт ClickStack, что хорошо подходит для тестирования и небольших развертываний. 

Для продакшн-сред разверните собственный OpenTelemetry Collector в роли агента, который будет получать метрики от JMX Exporter и пересылать их в ClickStack. Это обеспечивает пакетную отправку, устойчивость и централизованное управление конфигурацией.

См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для ознакомления с типовыми вариантами продакшн-развертываний и примерами конфигурации коллектора.
