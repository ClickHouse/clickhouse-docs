---
slug: /use-cases/observability/clickstack/integrations/jvm-metrics
title: 'Мониторинг метрик JVM в ClickStack'
sidebar_label: 'Метрики JVM'
pagination_prev: null
pagination_next: null
description: 'Мониторинг JVM в ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/jvm/jvm-metrics-import.png';
import example_dashboard from '@site/static/images/clickstack/jvm/jvm-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг JVM‑метрик с помощью ClickStack \{#jvm-clickstack\}

:::note[Кратко]
В этом руководстве показано, как мониторить JVM‑приложения с помощью ClickStack, используя Java‑агент OpenTelemetry для сбора метрик. Вы узнаете, как:

- Подключить Java‑агент OpenTelemetry к вашему JVM‑приложению
- Настроить агент на отправку метрик в ClickStack через OTLP
- Использовать готовую панель для визуализации кучи памяти, сборки мусора, потоков и ЦП

Демонстрационный набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию, прежде чем инструментировать ваши продуктивные приложения.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим JVM‑приложением \{#existing-jvm\}

В этом разделе описывается, как настроить ваше существующее JVM‑приложение для отправки метрик в ClickStack с помощью Java‑агента OpenTelemetry.

Если вы хотите протестировать интеграцию до настройки промышленных/продуктивных систем, вы можете воспользоваться нашим демонстрационным датасетом из [раздела демонстрационного датасета](#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Уже развернутое Java‑приложение (Java 8+)
- Доступ к изменению аргументов запуска JVM

<VerticalStepper headerLevel="h4">

#### Получение ключа API ClickStack \{#get-api-key\}

Агент OpenTelemetry для Java отправляет данные в OTLP-эндпоинт ClickStack, который требует аутентификации.

1. Откройте HyperDX по вашему адресу ClickStack (например, http://localhost:8080)
2. Создайте учётную запись или при необходимости войдите в систему
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных**

<Image img={api_key} alt="Ключ API ClickStack"/>

#### Загрузка агента OpenTelemetry для Java \{#download-agent\}

Загрузите JAR-файл агента OpenTelemetry для Java:

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

Этот файл будет загружен в ваш текущий каталог. Вы можете разместить его там, где это имеет смысл для вашего развёртывания (например, в `/opt/opentelemetry/` или рядом с JAR-файлом приложения).

#### Настройка аргументов запуска JVM \{#configure-jvm\}

Добавьте Java-агент к команде запуска JVM. Агент автоматически собирает метрики JVM и отправляет их в ClickStack.

##### Вариант 1: Флаги командной строки \{#command-line-flags\}

```bash
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=my-java-app \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -Dotel.exporter.otlp.protocol=http/protobuf \
  -Dotel.exporter.otlp.headers="authorization=YOUR_API_KEY" \
  -Dotel.metrics.exporter=otlp \
  -Dotel.logs.exporter=none \
  -Dotel.traces.exporter=none \
  -jar my-application.jar
```

**Замените следующее:**
- `opentelemetry-javaagent.jar` → Полный путь к JAR-файлу агента (например, `/opt/opentelemetry/opentelemetry-javaagent.jar`)
- `my-java-app` → Понятное имя вашего сервиса (например, `payment-service`, `user-api`)
- `YOUR_API_KEY` → Ваш ключ API ClickStack, полученный выше
- `my-application.jar` → Имя JAR-файла вашего приложения
- `http://localhost:4318` → Ваш эндпоинт ClickStack (используйте `localhost:4318`, если ClickStack запущен на той же машине, в противном случае используйте `http://your-clickstack-host:4318`)

##### Вариант 2: Переменные окружения \{#env-vars\}

В качестве альтернативы используйте переменные окружения:

```bash
export JAVA_TOOL_OPTIONS="-javaagent:opentelemetry-javaagent.jar"
export OTEL_SERVICE_NAME="my-java-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_HEADERS="authorization=YOUR_API_KEY"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="none"
export OTEL_TRACES_EXPORTER="none"

java -jar my-application.jar
```

**Замените следующее:**
- `opentelemetry-javaagent.jar` → Полный путь к JAR-файлу агента
- `my-java-app` → Имя вашего сервиса
- `YOUR_API_KEY` → Ваш ключ API ClickStack
- `http://localhost:4318` → Ваш эндпоинт ClickStack
- `my-application.jar` → Имя JAR-файла вашего приложения

:::tip
Агент OpenTelemetry для Java автоматически собирает следующие метрики JVM:

- **Память**: `jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **Сборка мусора**: `jvm.gc.duration`
- **Потоки**: `jvm.thread.count`
- **Классы**: `jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**: `jvm.cpu.time`, `jvm.cpu.count`
:::

#### Проверка метрик в HyperDX \{#verifying-metrics\}

После запуска приложения с агентом убедитесь, что метрики поступают в ClickStack:

1. Откройте HyperDX по адресу http://localhost:8080 (или по вашему адресу ClickStack)
2. Перейдите в **Chart Explorer**
3. Найдите метрики, начинающиеся с `jvm.` (например, `jvm.memory.used`, `jvm.gc.duration`, `jvm.thread.count`)

</VerticalStepper>

## Демонстрационный набор данных \{#demo-dataset\}

Для пользователей, которые хотят протестировать интеграцию метрик JVM, прежде чем инструментировать свои приложения, мы предоставляем демонстрационный набор данных с заранее сгенерированными метриками, отражающими реалистичное поведение JVM для микросервиса среднего размера со стабильным умеренным трафиком.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных \{#download-sample\}

```bash
# Скачать метрики типа gauge (память, потоки, CPU, классы)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-gauge.jsonl

# Скачать метрики типа sum (события GC)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-sum.jsonl
```

Набор данных включает 24 часа метрик JVM, показывающих:
- Рост кучи памяти с периодическими событиями сборки мусора
- Изменения количества потоков
- Реалистичные паузы GC
- Активность загрузки классов
- Характер нагрузки на CPU

#### Запуск ClickStack \{#start-clickstack\}

Если у вас ещё не запущен ClickStack:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите некоторое время, чтобы ClickStack полностью запустился.

#### Импорт демонстрационного набора данных \{#import-demo-data\}

```bash
# Импорт метрик типа gauge (память, потоки, CPU, классы)
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_gauge FORMAT JSONEachRow
" < jvm-metrics-gauge.jsonl

# Импорт метрик типа sum (события GC)
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics-sum.jsonl
```

Это импортирует метрики напрямую в таблицы метрик ClickStack.

#### Проверка демонстрационных данных \{#verify-demo-metrics\}

После импорта:

1. Откройте HyperDX по адресу http://localhost:8080 и выполните вход (создайте учётную запись, если нужно)
2. Перейдите в представление **Search** и установите источник — **Metrics**
3. Установите диапазон времени на **2025-12-06 14:00:00 - 2025-12-09 14:00:00**
4. Выполните поиск по `jvm.memory.used` или `jvm.gc.duration`

Вы должны увидеть метрики для демонстрационного сервиса.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**. Установите диапазон времени на **2025-12-06 14:00:00 - 2025-12-09 14:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. После того как вы увидите метрики, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация \{#dashboards\}

Чтобы помочь вам мониторить JVM-приложения с помощью ClickStack, мы предоставляем преднастроенный дашборд с основными визуализациями метрик JVM.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/jvm-metrics-dashboard.json')} download="jvm-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \{#download\}

#### Импортируйте преднастроенный дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под иконкой с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `jvm-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотр дашборда \{#created-dashboard\}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд метрик Kafka"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**. При необходимости скорректируйте его в соответствии с вашим часовым поясом.
:::

</VerticalStepper>

## Устранение неполадок \{#troubleshooting\}

### Агент не запускается \{#troubleshooting-not-loading\}

**Убедитесь, что JAR‑файл агента присутствует:**

```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**Проверьте совместимость используемой версии Java (требуется Java 8+):**

```bash
java -version
```

**Проверьте сообщение о запуске агента в логах:**
При запуске приложения вы должны увидеть:

```text
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```


### Метрики не отображаются в HyperDX \{#no-metrics\}

**Проверьте, что ClickStack запущен и доступен:**

```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**Убедитесь, что экспортер метрик настроен:**

```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**Проверьте журналы приложения на ошибки OpenTelemetry:**
Ищите в журналах приложения сообщения об ошибках, связанных с OpenTelemetry или сбоями экспорта OTLP.

**Проверьте сетевую доступность:**
Если ClickStack находится на удалённом хосте, убедитесь, что порт 4318 доступен с сервера вашего приложения.

**Проверьте версию агента:**
Убедитесь, что вы используете последнюю стабильную версию агента (в настоящее время 2.22.0), так как новые версии часто содержат улучшения производительности.


## Следующие шаги \{#next-steps\}

Теперь, когда метрики JVM поступают в ClickStack, рекомендуется:

- Настроить [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик, таких как высокое использование heap, частые паузы GC или исчерпание потоков
- Изучить [другие интеграции ClickStack](/use-cases/observability/clickstack/integration-guides), чтобы объединить данные вашей обсервабилити

## Переход в продакшен \{#going-to-production\}

В этом руководстве показана настройка Java-агента OpenTelemetry для локального тестирования. Для продакшен-развертываний включайте JAR-файл агента в образы контейнеров и настраивайте его через переменные окружения для упрощения управления. Для крупных сред с большим количеством экземпляров JVM разверните централизованный OpenTelemetry Collector, чтобы агрегировать и пересылать метрики от нескольких приложений вместо отправки их напрямую в ClickStack.

См. раздел [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для ознакомления со сценариями продакшен-развертывания и примерами конфигурации OpenTelemetry Collector.