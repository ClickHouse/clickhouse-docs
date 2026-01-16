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


# Мониторинг логов Nginx с помощью ClickStack \\{#nginx-clickstack\\}

:::note[Кратко]
В этом руководстве показано, как настроить мониторинг Nginx с помощью ClickStack, настроив OTel collector для приёма access-логов Nginx. Вы узнаете, как:

- Настроить Nginx на вывод логов в формате JSON
- Создать пользовательскую конфигурацию OTel collector для ингестии логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовый дашборд для визуализации метрик Nginx

Доступен демонстрационный набор данных с примерами логов, если вы хотите протестировать интеграцию до настройки Nginx в продакшене.

Необходимое время: 5–10 минут
:::

## Интеграция с существующим Nginx \\{#existing-nginx\\}

В этом разделе описывается, как настроить ваш существующий Nginx для отправки логов в ClickStack путём изменения конфигурации OTel collector в ClickStack.
Если вы хотите протестировать интеграцию до настройки собственной среды, вы можете воспользоваться нашей предварительно настроенной конфигурацией и тестовыми данными в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx#demo-dataset).

##### Предварительные условия \\{#prerequisites\\}

- Развёрнутый экземпляр ClickStack
- Установленный Nginx
- Доступ к изменению файлов конфигурации Nginx

<VerticalStepper headerLevel="h4">
  #### Настройка формата логов Nginx

  Сначала настройте Nginx для вывода логов в формате JSON, чтобы упростить их обработку. Добавьте следующее определение формата логов в файл nginx.conf:

  Файл `nginx.conf` обычно расположен по пути:

  * **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
  * **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` или `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**: конфигурация обычно монтируется как том

  Добавьте это определение формата журнала в блок `http`:

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

  После внесения этого изменения перезапустите Nginx.

  #### Создайте пользовательскую конфигурацию OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

  Создайте файл nginx-monitoring.yaml со следующей конфигурацией:

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
          layout: '%d/%b/%Y:%H:%M:%S %z'
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

  Данная конфигурация:

  * Считывает логи Nginx из стандартных путей
  * Разбирает JSON-записи журнала
  * Извлекает и сохраняет исходные временные метки логов
  * Добавляет атрибут source: Nginx для последующей фильтрации в HyperDX
  * Направляет логи в экспортёр ClickHouse через отдельный конвейер

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers и pipelines
  * Процессоры (memory&#95;limiter, transform, batch) и экспортёры (clickhouse) уже определены в базовой конфигурации ClickStack — достаточно сослаться на них по имени
  * Оператор time&#95;parser извлекает временные метки из поля time&#95;local Nginx, чтобы сохранить исходные временные метки журналов
  * Конвейеры маршрутизируют данные от ваших receivers к экспортеру ClickHouse через существующие processors
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте файл пользовательской конфигурации по пути /etc/otelcol-contrib/custom.config.yaml
  2. Установите переменную окружения CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE=/etc/otelcol-contrib/custom.config.yaml
  3. Смонтируйте каталоги с логами Nginx, чтобы коллектор мог их читать

  ##### Вариант 1: Docker Compose

  Обновите конфигурацию развертывания ClickStack:

  ```yaml
  services:
    clickstack:
      # ... существующая конфигурация ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... другие переменные окружения ...
      volumes:
        - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/nginx:/var/log/nginx:ro
        # ... другие тома ...
  ```

  ##### Вариант 2: Docker Run (образ «всё в одном»)

  При использовании универсального образа с docker run:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые права для чтения файлов журналов nginx. В продакшене используйте монтирование только для чтения (:ro) и следуйте принципу минимальных привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и убедитесь, что журналы поступают:

  1. Откройте представление поиска
  2. Выберите Logs в качестве источника и убедитесь, что вы видите записи логов с полями request, request&#95;time, upstream&#95;response&#95;time и т.д.

  Вот пример того, что вы должны увидеть:

  <Image img={search_view} alt="Просмотр логов" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный датасет {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию с nginx до настройки production-систем, мы предоставляем пример датасета с предварительно сгенерированными access‑логами nginx с реалистичными паттернами трафика.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного датасета \\{#download-sample\\}

```bash
# Скачать логи
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

Датасет включает:
- Записи логов с реалистичными паттернами трафика
- Различные endpoints и HTTP-методы
- Смесь успешных запросов и ошибок
- Реалистичное время отклика и объем переданных байт

#### Создание тестовой конфигурации коллектора \\{#test-config\\}

Создайте файл с именем `nginx-demo.yaml` со следующей конфигурацией:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # Read from beginning for demo data
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

Запустите ClickStack с демо-логами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### Проверка логов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (при необходимости сначала создайте учетную запись)
2. Перейдите в представление Search и установите источник на `Logs`
3. Установите диапазон времени на **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

Вот что вы должны увидеть в представлении поиска:

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демо-данные охватывают период 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC. Широкий временной диапазон гарантирует, что вы увидите демо-логи независимо от вашего местоположения. После того как вы увидите логи, вы можете сузить интервал до 24 часов для более наглядных визуализаций.
:::

<Image img={search_view} alt="Просмотр логов"/>

<Image img={log_view} alt="Просмотр логов"/>

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг nginx с помощью ClickStack, мы предоставляем основные визуализации для Nginx Logs.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд \\{#import-dashboard\\}
1. Откройте HyperDX и перейдите в раздел "Dashboards".
2. Нажмите "Import Dashboard" в правом верхнем углу под значком с многоточием.

<Image img={import_dashboard} alt="Импортировать дашборд"/>

3. Загрузите файл nginx-logs-dashboard.json и нажмите "Завершить импорт".

<Image img={finish_import} alt="Завершить импорт"/>

#### Дашборд будет создан со всеми предварительно настроенными визуализациями \\{#created-dashboard\\}

:::note
Для демонстрационного набора данных задайте диапазон времени **2025-10-20 11:00:00 – 2025-10-21 11:00:00 (UTC)** (при необходимости скорректируйте под ваш часовой пояс). У импортированного дашборда по умолчанию не будет задан диапазон времени.
:::

<Image img={example_dashboard} alt="Пример дашборда"/>

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

* Убедитесь, что переменная окружения CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE установлена корректно

```bash
docker exec <имя-контейнера> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* Проверьте, что пользовательский конфигурационный файл смонтирован по пути /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <имя-контейнера> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* Просмотрите содержимое пользовательской конфигурации, чтобы убедиться, что его можно прочитать

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### В HyperDX не отображаются логи

* Убедитесь, что nginx пишет логи в формате JSON

```bash
tail -f /var/log/nginx/access.log
```

* Убедитесь, что коллектор может читать логи

```bash
docker exec `<контейнер>` cat /var/log/nginx/access.log
```

* Убедитесь, что в фактической конфигурации присутствует ваш приёмник `filelog`

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* Проверьте журналы коллектора на наличие ошибок

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько следующих шагов для экспериментов с вашим дашбордом:

- Настройте оповещения для критически важных метрик (уровень ошибок, пороги задержки)
- Создайте дополнительные дашборды для конкретных сценариев использования (мониторинг API, события безопасности)