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


# Мониторинг логов Nginx с помощью ClickStack \{#nginx-clickstack\}

:::note[Кратко]
В этом руководстве показано, как мониторить Nginx с помощью ClickStack, настроив OTel collector для приёма access-логов Nginx. Вы узнаете, как:

- Настроить Nginx на вывод логов в формате JSON
- Создать пользовательскую конфигурацию OTel collector для ингестии логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации метрик Nginx

Доступен демонстрационный набор данных с примерами логов, который можно использовать, если вы хотите протестировать интеграцию до настройки вашего продуктивного Nginx.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим Nginx \{#existing-nginx\}

В этом разделе описывается настройка имеющейся у вас установки Nginx для отправки логов в ClickStack путем изменения конфигурации ClickStack OTel collector.
Если вы хотите протестировать интеграцию до настройки собственной среды, вы можете воспользоваться нашим заранее настроенным окружением и примером данных в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Развернутый экземпляр ClickStack
- Уже установленный Nginx
- Права на изменение конфигурационных файлов Nginx

<VerticalStepper headerLevel="h4">
  #### Настройте формат логов Nginx

  Сначала настройте Nginx для вывода логов в формате JSON, чтобы упростить их парсинг. Добавьте это определение формата логов в ваш nginx.conf:

  Файл `nginx.conf` обычно расположен по пути:

  * **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
  * **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` или `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**: конфигурация обычно монтируется в виде тома

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

  #### Создание пользовательской конфигурации OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, смонтировав пользовательский файл конфигурации и задав переменную окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

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

  Эта конфигурация:

  * Читает логи Nginx из стандартных путей
  * Разбирает JSON-записи журнала
  * Извлекает и сохраняет исходные временные метки логов
  * Добавляет атрибут source: Nginx для последующей фильтрации в HyperDX
  * Направляет логи в экспортёр ClickHouse через отдельный конвейер

  :::note

  * В пользовательском конфигурационном файле вы задаёте только новые receivers и pipelines
  * Процессоры (memory&#95;limiter, transform, batch) и экспортеры (clickhouse) уже заданы в базовой конфигурации ClickStack — достаточно просто ссылаться на них по имени
  * Оператор time&#95;parser извлекает временные метки из поля time&#95;local Nginx, чтобы сохранить исходное время записей журнала
  * Конвейеры направляют данные от ваших приёмников к экспортёру ClickHouse через существующие процессоры
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте файл пользовательской конфигурации по пути /etc/otelcol-contrib/custom.config.yaml
  2. Задайте переменную окружения CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE=/etc/otelcol-contrib/custom.config.yaml
  3. Смонтируйте каталоги с логами Nginx, чтобы коллектор мог их читать

  ##### Вариант 1: Docker Compose

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

  ##### Вариант 2: Docker Run (образ «всё в одном»)

  При использовании универсального образа с `docker run`:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые разрешения для чтения файлов журналов nginx. В производственной среде используйте монтирование только для чтения (:ro) и следуйте принципу наименьших привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и проверьте, что логи поступают:

  1. Перейдите в режим поиска
  2. В поле Source выберите Logs и убедитесь, что вы видите записи логов с полями вроде request, request&#95;time, upstream&#95;response&#95;time и т. д.

  Ниже приведён пример ожидаемого результата:

  <Image img={search_view} alt="Просмотр логов" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию с nginx до настройки своих продуктивных систем, мы предоставляем демонстрационный набор данных с заранее сгенерированными access‑логами nginx с реалистичными паттернами трафика.

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных \{#download-sample\}

```bash
# Загрузить логи
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

Набор данных включает:
- Записи логов с реалистичными паттернами трафика
- Различные эндпоинты и HTTP‑методы
- Сочетание успешных запросов и ошибок
- Реалистичное время отклика и объёмы переданных данных (в байтах)

#### Создайте тестовую конфигурацию коллектора \{#test-config\}

Создайте файл с именем `nginx-demo.yaml` со следующей конфигурацией:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # Читать с начала для демонстрационных данных
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

#### Запустите ClickStack с демонстрационной конфигурацией {#run-demo}

Запустите ClickStack с демонстрационными логами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### Проверьте логи в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (возможно, сначала потребуется создать учётную запись)
2. Перейдите в представление Search и установите источник в значение `Logs`
3. Установите временной диапазон **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

В представлении поиска вы должны увидеть следующее:

:::note[Отображение часового пояса]
HyperDX показывает временные метки в часовом поясе вашего браузера. Демонстрационные данные охватывают период 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Когда логи отобразятся, вы можете сузить диапазон до 24 часов для более наглядных визуализаций.
:::

<Image img={search_view} alt="Просмотр логов"/>

<Image img={log_view} alt="Просмотр логов"/>

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы вы могли начать мониторинг nginx с помощью ClickStack, мы предоставляем основные визуализации для логов Nginx.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда \{#import-dashboard\}
1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите "Import Dashboard" в правом верхнем углу в меню с иконкой многоточия.

<Image img={import_dashboard} alt="Импорт дашборда"/>

3. Загрузите файл nginx-logs-dashboard.json и нажмите "Finish import".

<Image img={finish_import} alt="Завершение импорта"/>

#### Дашборд будет создан со всеми заранее настроенными визуализациями \{#created-dashboard\}

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** (при необходимости скорректируйте под ваш часовой пояс). Импортируемый дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

<Image img={example_dashboard} alt="Пример дашборда"/>

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

* Убедитесь, что переменная среды CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE установлена корректно

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* Убедитесь, что пользовательский файл конфигурации смонтирован по пути /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* Просмотрите содержимое пользовательской конфигурации и убедитесь, что его можно прочитать

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
docker exec `<container>` cat /var/log/nginx/access.log
```

* Убедитесь, что результирующая конфигурация включает ваш ресивер `filelog`

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* Проверьте наличие ошибок в журналах коллектора

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## Дальнейшие шаги {#next-steps}

Если вы хотите пойти дальше, попробуйте следующее с вашим дашбордом:

- Настройте оповещения для критически важных метрик (уровень ошибок, пороговые значения задержки)
- Создайте дополнительные дашборды для конкретных сценариев использования (мониторинг API, события безопасности)