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

:::note[Кратко]
В этом руководстве показано, как настроить мониторинг Nginx с помощью ClickStack, сконфигурировав OTel collector для приёма access-логов Nginx. Вы узнаете, как:

- Настроить Nginx на вывод логов в формате JSON
- Создать пользовательскую конфигурацию OTel collector для ингестии логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации метрик Nginx

Если вы хотите протестировать интеграцию до настройки вашего production Nginx, доступен демонстрационный набор данных с примером логов.

Требуемое время: 5–10 минут
:::



## Интеграция с существующим Nginx {#existing-nginx}

В этом разделе описывается настройка существующей установки Nginx для отправки логов в ClickStack путем изменения конфигурации OTel collector в ClickStack.
Если вы хотите протестировать интеграцию перед настройкой собственной установки, можете воспользоваться нашей предварительно настроенной конфигурацией и примерами данных в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка Nginx
- Доступ к изменению конфигурационных файлов Nginx

<VerticalStepper headerLevel="h4">

#### Настройка формата логов Nginx {#configure-nginx}

Сначала настройте Nginx для вывода логов в формате JSON для упрощения парсинга. Добавьте это определение формата логов в ваш nginx.conf:

Файл `nginx.conf` обычно находится по адресу:

- **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
- **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` или `/opt/homebrew/etc/nginx/nginx.conf`
- **Docker**: конфигурация обычно монтируется как том

Добавьте это определение формата логов в блок `http`:

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

После внесения этого изменения перезагрузите Nginx.

#### Создание пользовательской конфигурации OTel collector {#custom-otel}

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путем монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

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

- Читает логи Nginx из их стандартных расположений
- Парсит записи логов в формате JSON
- Извлекает и сохраняет исходные временные метки логов
- Добавляет атрибут source: Nginx для фильтрации в HyperDX
- Направляет логи в экспортер ClickHouse через выделенный конвейер

:::note

- В пользовательской конфигурации вы определяете только новые приемники и конвейеры
- Процессоры (memory_limiter, transform, batch) и экспортеры (clickhouse) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
- Оператор time_parser извлекает временные метки из поля time_local Nginx для сохранения исходного времени логов
- Конвейеры направляют данные от ваших приемников к экспортеру ClickHouse через существующие процессоры
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации {#load-custom}

Чтобы включить пользовательскую конфигурацию collector в существующем развертывании ClickStack, необходимо:

1. Смонтировать пользовательский конфигурационный файл по пути /etc/otelcol-contrib/custom.config.yaml
2. Установить переменную окружения CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
3. Смонтировать каталоги логов Nginx, чтобы collector мог их читать

##### Вариант 1: Docker Compose {#docker-compose}

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


##### Вариант 2: Docker Run (образ «всё в одном») {#all-in-one}

При использовании образа «всё в одном» с docker run:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Убедитесь, что коллектор ClickStack имеет необходимые разрешения для чтения файлов журналов nginx. В производственной среде используйте монтирование только для чтения (:ro) и следуйте принципу минимальных привилегий.
:::

#### Проверка журналов в HyperDX {#verifying-logs}

После настройки войдите в HyperDX и убедитесь, что журналы поступают:

1. Перейдите в представление поиска
2. Установите источник на Logs и убедитесь, что видите записи журнала с полями request, request_time, upstream_response_time и т. д.

Вот пример того, что вы должны увидеть:

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
- Различные эндпоинты и HTTP-методы
- Сочетание успешных запросов и ошибок
- Реалистичное время отклика и объём данных в байтах

#### Создайте тестовую конфигурацию коллектора {#test-config}

Создайте файл `nginx-demo.yaml` со следующей конфигурацией:

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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Проверьте логи в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в учётную запись (при необходимости сначала создайте учётную запись)
2. Перейдите в представление Search и установите источник `Logs`
3. Установите временной диапазон **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

Вот что вы должны увидеть в представлении поиска:

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. После того как вы увидите логи, можно сузить диапазон до 24 часов для более чёткой визуализации.
:::

<Image img={search_view} alt='Представление логов' />

<Image img={log_view} alt='Представление логов' />

</VerticalStepper>


## Панели и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг nginx с помощью ClickStack, мы предоставляем базовые визуализации для Nginx Logs.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию панели {#download}

#### Импортируйте готовую панель {#import-dashboard}
1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите «Import Dashboard» в правом верхнем углу под значком с многоточием.

<Image img={import_dashboard} alt="Импорт панели"/>

3. Загрузите файл nginx-logs-dashboard.json и нажмите «Finish import».

<Image img={finish_import} alt="Завершение импорта"/>

#### Панель будет создана со всеми преднастроенными визуализациями {#created-dashboard}

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортируемая панель по умолчанию не имеет заданного диапазона времени.
:::

<Image img={example_dashboard} alt="Пример панели"/>

</VerticalStepper>



## Устранение неполадок

### Пользовательский файл конфигурации не загружается

* Убедитесь, что переменная среды CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE установлена корректно

```bash
docker exec <имя-контейнера> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* Проверьте, что настраиваемый файл конфигурации смонтирован в /etc/otelcol-contrib/custom.config.yaml

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

* Убедитесь, что итоговая конфигурация включает ваш ресивер filelog

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* Проверьте, нет ли ошибок в логах коллектора

```bash
docker exec `<контейнер>` cat /etc/otel/supervisor-data/agent.log
```


## Дальнейшие шаги {#next-steps}
Если вы хотите продолжить изучение, ниже приведены возможные дальнейшие шаги для экспериментов с вашей панелью мониторинга:

- Настройте оповещения для критически важных метрик (уровень ошибок, пороговые значения задержки)
- Создайте дополнительные панели мониторинга для конкретных сценариев (мониторинг API, события безопасности)
