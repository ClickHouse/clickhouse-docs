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


# Мониторинг метрик JVM с ClickStack \\{#jvm-clickstack\\}

:::note[Итоги вкратце]
В этом руководстве описано, как отслеживать метрики JVM‑приложений с помощью ClickStack, используя Java‑агент OpenTelemetry для их сбора. Вы узнаете, как:

- Подключить Java‑агент OpenTelemetry к JVM‑приложению
- Настроить агент на отправку метрик в ClickStack через OTLP
- Использовать готовый дашборд для визуализации кучи памяти, сборки мусора, потоков и ЦП

Демонстрационный набор данных с примерами метрик доступен, если вы хотите протестировать интеграцию до инструментирования продакшен‑приложений.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим JVM-приложением \\{#existing-jvm\\}

В этом разделе описывается настройка существующего JVM-приложения для отправки метрик в ClickStack с помощью Java-агента OpenTelemetry.

Если вы хотите протестировать интеграцию перед настройкой боевой среды, вы можете использовать наш демонстрационный набор данных из [раздела демо-набора данных](#demo-dataset).

##### Предварительные требования \\{#prerequisites\\}

- Запущенный экземпляр ClickStack
- Существующее Java-приложение (Java 8+)
- Доступ для изменения аргументов запуска JVM

<VerticalStepper headerLevel="h4">

#### Получение ClickStack API key \\{#get-api-key\\}

Агент OpenTelemetry Java отправляет данные на OTLP-эндпоинт ClickStack, который требует аутентификации.

1. Откройте HyperDX по вашему адресу ClickStack (например, http://localhost:8080)
2. Создайте аккаунт или при необходимости войдите в систему
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

#### Загрузка агента OpenTelemetry Java \\{#download-agent\\}

Скачайте JAR-файл агента OpenTelemetry Java:

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

Файл будет загружен в ваш текущий каталог. Вы можете разместить его там, где это имеет смысл для вашего развертывания (например, в `/opt/opentelemetry/` или рядом с JAR-файлом вашего приложения).

#### Настройка аргументов запуска JVM \\{#configure-jvm\\}

Добавьте Java-агент в команду запуска JVM. Агент автоматически собирает метрики JVM и отправляет их в ClickStack.

##### Вариант 1: Флаги командной строки \\{#command-line-flags\\}

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

**Замените следующие значения:**
- `opentelemetry-javaagent.jar` → Полный путь к JAR-файлу агента (например, `/opt/opentelemetry/opentelemetry-javaagent.jar`)
- `my-java-app` → Осмысленное имя вашего сервиса (например, `payment-service`, `user-api`)
- `YOUR_API_KEY` → Ваш ClickStack API key из шага выше
- `my-application.jar` → Имя JAR-файла вашего приложения
- `http://localhost:4318` → Ваш эндпоинт ClickStack (используйте `localhost:4318`, если ClickStack запущен на той же машине, иначе используйте `http://your-clickstack-host:4318`)

##### Вариант 2: Переменные окружения \\{#env-vars\\}

Или используйте переменные окружения:

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

**Замените следующие значения:**
- `opentelemetry-javaagent.jar` → Полный путь к JAR-файлу агента
- `my-java-app` → Имя вашего сервиса
- `YOUR_API_KEY` → Ваш ClickStack API key
- `http://localhost:4318` → Ваш эндпоинт ClickStack
- `my-application.jar` → Имя JAR-файла вашего приложения

:::tip
Агент OpenTelemetry Java автоматически собирает следующие метрики JVM:
- **Память**: `jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **Сборка мусора**: `jvm.gc.duration`
- **Потоки**: `jvm.thread.count`
- **Классы**: `jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**: `jvm.cpu.time`, `jvm.cpu.count`
:::

#### Проверка метрик в HyperDX \\{#verifying-metrics\\}

После запуска приложения с агентом убедитесь, что метрики поступают в ClickStack:

1. Откройте HyperDX по адресу http://localhost:8080 (или по вашему адресу ClickStack)
2. Перейдите в **Chart Explorer**
3. Найдите метрики, начинающиеся с `jvm.` (например, `jvm.memory.used`, `jvm.gc.duration`, `jvm.thread.count`)
</VerticalStepper>

## Демонстрационный набор данных \\{#demo-dataset\\}

Для пользователей, которые хотят протестировать интеграцию метрик JVM перед инструментированием своих приложений, мы предоставляем пример набора данных с предварительно сгенерированными метриками, отражающими реалистичное поведение JVM для микросервиса среднего размера со стабильным умеренным трафиком.

<VerticalStepper headerLevel="h4">

#### Загрузите пример набора данных \\{#download-sample\\}

```bash
# Загрузить gauge-метрики (память, потоки, CPU, классы)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-gauge.jsonl

# Загрузить sum-метрики (GC-события)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-sum.jsonl
```

Набор данных включает 24 часа метрик JVM, показывающих:
- Рост памяти кучи (heap) с периодическими событиями сборки мусора (garbage collection)
- Изменения количества потоков
- Реалистичное время пауз GC
- Активность загрузки классов
- Характер использования CPU

#### Запустите ClickStack \\{#start-clickstack\\}

Если у вас еще не запущен ClickStack:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите немного, чтобы ClickStack полностью запустился.

#### Импортируйте демонстрационный набор данных \\{#import-demo-data\\}

```bash
# Импортировать gauge-метрики (память, потоки, CPU, классы)
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_gauge FORMAT JSONEachRow
" < jvm-metrics-gauge.jsonl

# Импортировать sum-метрики (GC-события)
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics-sum.jsonl
```

Метрики будут импортированы напрямую в таблицы метрик ClickStack.

#### Проверьте демонстрационные данные \\{#verify-demo-metrics\\}

После импорта:

1. Откройте HyperDX по адресу http://localhost:8080 и войдите в систему (при необходимости создайте аккаунт)
2. Перейдите в представление Search и установите источник **Metrics**
3. Установите диапазон времени на **2025-12-06 14:00:00 - 2025-12-09 14:00:00**
4. Выполните поиск по `jvm.memory.used` или `jvm.gc.duration`

Вы должны увидеть метрики для демонстрационного сервиса.

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**. Установите диапазон времени на **2025-12-06 14:00:00 - 2025-12-09 14:00:00**, чтобы гарантированно увидеть демонстрационные метрики независимо от вашего местоположения. Как только вы увидите метрики, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация \\{#dashboards\\}

Чтобы помочь вам в мониторинге JVM-приложений с помощью ClickStack, мы предоставляем готовый дашборд с ключевыми визуализациями метрик JVM.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/jvm-metrics-dashboard.json')} download="jvm-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \\{#download\\}

#### Импортируйте преднастроенный дашборд \\{#import-dashboard\\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу в меню под многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `jvm-metrics-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотрите дашборд \\{#created-dashboard\\}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд метрик Kafka"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**. При необходимости скорректируйте его в соответствии с вашим часовым поясом.
:::

</VerticalStepper>

## Устранение неполадок \\{#troubleshooting\\}

### Агент не запускается \{#troubleshooting-not-loading\}

**Убедитесь, что JAR-файл агента присутствует:**

```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**Проверьте, что используется совместимая версия Java (требуется Java 8+):**

```bash
java -version
```

**Проверьте журналы на наличие сообщения о запуске агента:**
При запуске приложения вы должны увидеть:

```text
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```


### Метрики не отображаются в HyperDX \{#no-metrics\}

**Убедитесь, что ClickStack запущен и доступен:**

```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**Проверьте, что экспортёр метрик настроен:**

```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**Проверьте логи приложения на ошибки OpenTelemetry:**
Найдите в логах вашего приложения сообщения об ошибках, связанных с OpenTelemetry или ошибками экспорта OTLP.

**Проверьте сетевое подключение:**
Если ClickStack находится на удалённом хосте, убедитесь, что порт 4318 доступен с сервера вашего приложения.

**Проверьте версию агента:**
Убедитесь, что вы используете последнюю стабильную версию агента (в настоящее время 2.22.0), так как новые версии часто содержат улучшения производительности.


## Следующие шаги \\{#next-steps\\}

Теперь, когда метрики JVM поступают в ClickStack, рассмотрите возможность:

- Настроить [alerts](/use-cases/observability/clickstack/alerts) для критически важных метрик, таких как высокий расход heap, частые паузы GC или исчерпание потоков
- Изучить [другие интеграции ClickStack](/use-cases/observability/clickstack/integration-guides) для унификации данных обсервабилити

## Переход в продакшен \\{#going-to-production\\}

В этом руководстве показана настройка Java-агента OpenTelemetry для локального тестирования. Для продакшен-развертываний включайте JAR-агента в образы контейнеров и настраивайте его через переменные окружения для упрощения управления. Для более крупных сред с большим количеством экземпляров JVM разверните централизованный OpenTelemetry Collector, чтобы группировать в пакеты и пересылать метрики от нескольких приложений вместо отправки их напрямую в ClickStack.

См. раздел [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для типовых схем продакшен-развертывания и примеров конфигурации коллектора.