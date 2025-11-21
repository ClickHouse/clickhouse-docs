---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'Мониторинг логов Nginx с помощью ClickStack'
sidebar_label: 'Логи Nginx'
pagination_prev: null
pagination_next: null
description: 'Мониторинг Nginx с помощью ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-logs-import.png';
import example_dashboard from '@site/static/images/clickstack/nginx-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';
import search_view from '@site/static/images/clickstack/nginx-logs-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов Nginx с помощью ClickStack {#nginx-clickstack}

:::note[Краткое содержание]
Это руководство показывает, как настроить мониторинг Nginx с помощью ClickStack, сконфигурировав коллектор OpenTelemetry для приёма логов доступа Nginx. Вы узнаете, как:

- Настроить Nginx для вывода логов в формате JSON
- Создать пользовательскую конфигурацию коллектора OTel для приёма логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации метрик Nginx

Демонстрационный набор данных с примерами логов доступен, если вы хотите протестировать интеграцию перед настройкой вашего production-окружения Nginx.

Требуемое время: 5–10 минут
:::


## Интеграция с существующим Nginx {#existing-nginx}

В этом разделе описывается настройка существующей установки Nginx для отправки логов в ClickStack путём изменения конфигурации сборщика OTel в ClickStack.
Если вы хотите протестировать интеграцию перед настройкой собственной установки, можете воспользоваться нашей предварительно настроенной конфигурацией и примерами данных в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка Nginx
- Доступ к изменению конфигурационных файлов Nginx

<VerticalStepper headerLevel="h4">

#### Настройка формата логов Nginx {#configure-nginx}

Сначала настройте Nginx для вывода логов в формате JSON, чтобы упростить их парсинг. Добавьте определение формата логов в ваш nginx.conf:

Файл `nginx.conf` обычно находится по адресу:

- **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
- **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` или `/opt/homebrew/etc/nginx/nginx.conf`
- **Docker**: конфигурация обычно монтируется как том

Добавьте определение формата логов в блок `http`:

```nginx
http {
    log_format json_combined escape=json
    '{'
      '"time_local":"$time_local",'
      '"remote_addr":"$remote_addr",'
      '"request_method":"$request_method",'
      '"request_uri":"$request_uri",'
      '"status":$status,'
      '"body_bytes_sent":$body_bytes_sent,'
      '"request_time":$request_time,'
      '"upstream_response_time":"$upstream_response_time",'
      '"http_referer":"$http_referer",'
      '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;
    error_log /var/log/nginx/error.log warn;
}
```

После внесения изменений перезагрузите Nginx.

#### Создание пользовательской конфигурации сборщика OTel {#custom-otel}

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

Создайте файл с именем nginx-monitoring.yaml со следующей конфигурацией:

```yaml
receivers:
  filelog:
    include:
      - /var/log/nginx/access.log
      - /var/log/nginx/error.log
    start_at: end
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: "%d/%b/%Y:%H:%M:%S %z"
      - type: add
        field: attributes.source
        value: "nginx"

service:
  pipelines:
    logs/nginx:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

Эта конфигурация:

- Читает логи Nginx из стандартных расположений
- Парсит записи логов в формате JSON
- Извлекает и сохраняет исходные временные метки логов
- Добавляет атрибут source: Nginx для фильтрации в HyperDX
- Направляет логи в экспортер ClickHouse через выделенный конвейер

:::note

- В пользовательской конфигурации вы определяете только новые приёмники и конвейеры
- Процессоры (memory_limiter, transform, batch) и экспортеры (clickhouse) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
- Оператор time_parser извлекает временные метки из поля time_local Nginx для сохранения исходного времени логов
- Конвейеры направляют данные от ваших приёмников к экспортеру ClickHouse через существующие процессоры
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации {#load-custom}

Чтобы включить пользовательскую конфигурацию сборщика в существующем развёртывании ClickStack, необходимо:

1. Смонтировать пользовательский конфигурационный файл по пути /etc/otelcol-contrib/custom.config.yaml
2. Установить переменную окружения CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
3. Смонтировать каталоги логов Nginx, чтобы сборщик мог их читать

##### Вариант 1: Docker Compose {#docker-compose}

Обновите конфигурацию развёртывания ClickStack:

```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/nginx:/var/log/nginx:ro
      # ... other volumes ...
```


##### Вариант 2: Docker Run (универсальный образ) {#all-in-one}

При использовании универсального образа с docker run:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Убедитесь, что коллектор ClickStack имеет необходимые права для чтения файлов журналов nginx. В производственной среде используйте монтирование только для чтения (:ro) и следуйте принципу минимальных привилегий.
:::

#### Проверка журналов в HyperDX {#verifying-logs}

После настройки войдите в HyperDX и убедитесь, что журналы поступают:

1. Перейдите в представление поиска
2. Установите источник на Logs и убедитесь, что отображаются записи журнала с полями request, request_time, upstream_response_time и т. д.

Пример того, что вы должны увидеть:

<Image img={search_view} alt='Представление журнала' />

<Image img={log_view} alt='Представление журнала' />

</VerticalStepper>


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию nginx перед настройкой производственных систем, мы предоставляем демонстрационный набор данных с предварительно сгенерированными журналами доступа nginx и реалистичными паттернами трафика.

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных {#download-sample}


```bash
# Download the logs
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

Набор данных включает:

- Записи логов с реалистичными паттернами трафика
- Различные конечные точки и HTTP-методы
- Сочетание успешных запросов и ошибок
- Реалистичное время отклика и количество байтов

#### Создание тестовой конфигурации коллектора {#test-config}

Создайте файл с именем `nginx-demo.yaml` со следующей конфигурацией:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # Чтение с начала для демонстрационных данных
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx-demo"

service:
  pipelines:
    logs/nginx-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Запуск ClickStack с демонстрационной конфигурацией {#run-demo}

Запустите ClickStack с демонстрационными логами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Проверка логов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (возможно, сначала потребуется создать учетную запись)
2. Перейдите в представление Search и установите источник `Logs`
3. Установите временной диапазон **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

Вот что вы должны увидеть в представлении поиска:

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. После того как вы увидите логи, можно сузить диапазон до 24-часового периода для более четкой визуализации.
:::

<Image img={search_view} alt='Представление логов' />

<Image img={log_view} alt='Представление логов' />

</VerticalStepper>


## Панели мониторинга и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг nginx с помощью ClickStack, мы предоставляем необходимые визуализации для журналов Nginx.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию панели мониторинга {#download}

#### Импортируйте готовую панель мониторинга {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите «Import Dashboard» в правом верхнем углу под многоточием.

<Image img={import_dashboard} alt='Импорт панели мониторинга' />

3. Загрузите файл nginx-logs-dashboard.json и нажмите «finish import».

<Image img={finish_import} alt='Завершить импорт' />

#### Панель мониторинга будет создана со всеми предварительно настроенными визуализациями {#created-dashboard}

:::note
Для демонстрационного набора данных установите временной диапазон **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированная панель мониторинга по умолчанию не будет иметь указанного временного диапазона.
:::

<Image img={example_dashboard} alt='Пример панели мониторинга' />

</VerticalStepper>


## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается {#troubleshooting-not-loading}

- Убедитесь, что переменная окружения CUSTOM_OTELCOL_CONFIG_FILE установлена правильно

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

- Проверьте, что файл пользовательской конфигурации смонтирован по пути /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

- Просмотрите содержимое пользовательской конфигурации, чтобы убедиться в его доступности для чтения

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### Логи не отображаются в HyperDX {#no-logs}

- Убедитесь, что nginx записывает логи в формате JSON

```bash
tail -f /var/log/nginx/access.log
```

- Проверьте, что коллектор может читать логи

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

- Убедитесь, что действующая конфигурация включает ваш приёмник filelog

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

- Проверьте наличие ошибок в логах коллектора

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько следующих шагов для экспериментов с вашим дашбордом

- Настройте оповещения для критических метрик (частота ошибок, пороговые значения задержки)
- Создайте дополнительные дашборды для конкретных сценариев использования (мониторинг API, события безопасности)
