---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'Мониторинг логов хоста с помощью ClickStack'
sidebar_label: 'Общие логи хоста'
pagination_prev: null
pagination_next: null
description: 'Мониторинг общих логов хоста с помощью ClickStack'
doc_type: 'guide'
keywords: ['логи хоста', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'мониторинг системы', 'логи сервера']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/host-logs/log-view.png';
import search_view from '@site/static/images/clickstack/host-logs/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Мониторинг логов хостов с помощью ClickStack \{#host-logs-clickstack\}

:::note[Кратко]
В этом руководстве показано, как отслеживать системные логи хостов с помощью ClickStack, настроив OTel collector для сбора логов из systemd, ядра, SSH, cron и других системных сервисов. Вы узнаете, как:

- Настроить OTel collector для чтения файлов системных логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать преднастроенную панель мониторинга для визуализации данных по логам хоста (ошибки, предупреждения, активность сервисов)

Демонстрационный набор данных с примерами логов доступен, если вы хотите протестировать интеграцию до настройки боевых хостов.

Требуемое время: 5–10 минут
:::

## Интеграция с существующими хостами \{#existing-hosts\}

В этом разделе описывается настройка ваших существующих хостов для отправки системных логов в ClickStack путём изменения конфигурации OTel collector в ClickStack так, чтобы он читал все файлы системных журналов (syslog, auth, kernel, daemon и журналы приложений).

Если вы хотите протестировать интеграцию с логами хостов до настройки собственной существующей среды, вы можете воспользоваться нашей предварительно настроенной конфигурацией и примером данных в разделе ["Демонстрационный набор данных"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Развернутый экземпляр ClickStack
- Система с логами syslog
- Доступ для изменения файлов конфигурации ClickStack

<VerticalStepper headerLevel="h4">
  #### Проверка наличия файлов syslog

  Сначала проверьте, что система записывает файлы syslog:

  ```bash
  # Check if syslog files exist (Linux)
  ls -la /var/log/syslog /var/log/messages

  # Or on macOS
  ls -la /var/log/system.log

  # View recent entries
  tail -20 /var/log/syslog
  ```

  Типичные расположения syslog:

  * **Ubuntu/Debian**: `/var/log/syslog`
  * **RHEL/CentOS/Fedora**: `/var/log/messages`
  * **macOS**: `/var/log/system.log`

  #### Создание пользовательской конфигурации OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, смонтировав пользовательский файл конфигурации и задав переменную окружения.

  Создайте файл `host-logs-monitoring.yaml` с конфигурацией для вашей системы:

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="Современный Linux (Ubuntu 24.04+)" default>
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout_type: gotime
              layout: '2006-01-02T15:04:05.999999-07:00'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>

    <TabItem value="legacy-linux" label="Старые версии Linux (Ubuntu 20.04, RHEL, CentOS)">
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/messages
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>

    <TabItem value="macos" label="macOS">
      ```yaml
      receivers:
        filelog/syslog:
          include:
            - /var/log/system.log
            - /host/private/var/log/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "host-logs"
            
            - type: add
              field: resource["service.name"]
              value: "host-production"

      service:
        pipelines:
          logs/host:
            receivers: [filelog/syslog]
            processors:
              - memory_limiter
              - transform
              - batch
            exporters:
              - clickhouse
      ```
    </TabItem>
  </Tabs>

  <br />

  Все конфигурации:

  * Считывать файлы syslog из их стандартных расположений
  * Разобрать формат syslog для извлечения структурированных полей (timestamp, hostname, unit/service, PID, message)
  * Сохраняйте исходные временные метки логов
  * Добавьте атрибут `source: host-logs` для последующей фильтрации в HyperDX
  * Направьте логи в экспортёр ClickHouse через выделенный конвейер

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers и pipelines
  * Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — их достаточно указать по имени
  * Парсер регулярных выражений извлекает имена юнитов systemd, идентификаторы PID и другие метаданные из сообщений в формате syslog
  * Эта конфигурация использует `start_at: end`, чтобы избежать повторного приёма логов при перезапуске коллектора. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть логи за прошлый период.
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Для включения пользовательской конфигурации коллектора в существующем развертывании ClickStack необходимо:

  1. Смонтируйте пользовательский файл конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
  2. Задайте переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог с журналами syslog, чтобы коллектор мог их читать

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
        - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log:/var/log:ro
        # ... other volumes ...
  ```

  ##### Вариант 2: Docker Run (образ «всё в одном»)

  Если вы используете универсальный образ с помощью docker run:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/var/log:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые разрешения для чтения файлов syslog. В производственной среде используйте монтирование только для чтения (`:ro`) и следуйте принципу наименьших привилегий.
  :::

  #### Проверка журналов в HyperDX

  После настройки войдите в HyperDX и проверьте, что логи поступают:

  1. Перейдите в режим поиска
  2. В качестве источника укажите Logs
  3. Отфильтруйте по `source:host-logs`, чтобы увидеть логи конкретных хостов
  4. Вы должны увидеть структурированные записи журнала с такими полями, как `unit`, `hostname`, `pid`, `message` и т. д.

  <Image img={search_view} alt="Страница поиска" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию с журналами хоста до настройки рабочих систем, мы предоставляем пример набора заранее сгенерированных системных журналов с реалистичными шаблонами.

<VerticalStepper headerLevel="h4">

#### Загрузка примерного набора данных \{#download-sample\}

Загрузите примерный файл журнала:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

Набор данных включает:
- Последовательность загрузки системы
- Активность входа по SSH (успешные и неуспешные попытки)
- Инцидент безопасности (атака перебором с реакцией fail2ban)
- Плановое обслуживание (задания cron, anacron)
- Перезапуски сервисов (rsyslog)
- Сообщения ядра и активность межсетевого экрана
- Сочетание нормальной работы и заметных событий

#### Создание тестовой конфигурации коллектора \{#test-config\}

Создайте файл с именем `host-logs-demo.yaml` со следующей конфигурацией:

```yaml
cat > host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      
      - type: add
        field: attributes.source
        value: "host-demo"
      
      - type: add
        field: resource["service.name"]
        value: "host-demo"

service:
  pipelines:
    logs/host-demo:
      receivers: [filelog/journal]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Запуск ClickStack с демонстрационной конфигурацией {#run-demo}

Запустите ClickStack с демонстрационными журналами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
**Файл журнала монтируется напрямую в контейнер. Это сделано в целях тестирования со статическими демонстрационными данными.**
:::

#### Проверка журналов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (при необходимости сначала создайте ее)
2. Перейдите в представление Search и установите источник `Logs`
3. Установите диапазон времени на **2025-11-10 00:00:00 - 2025-11-13 00:00:00**

<Image img={search_view} alt="Представление поиска"/>
<Image img={log_view} alt="Представление журналов"/>

:::note[Отображение часового пояса]
HyperDX показывает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демонстрационные журналы независимо от вашего местоположения. После того как вы увидите журналы, вы можете сузить диапазон до 24 часов для более наглядных визуализаций.
:::

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг журналов хостов с помощью ClickStack, мы предоставляем базовые визуализации для системных логов.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с тремя точками

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `host-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотр дашборда \{#created-dashboard\}

Дашборд будет создан со всеми заранее настроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд логов"/>

Ключевые визуализации включают:
- Объём логов во времени по уровню критичности
- Топ systemd-юнитов, генерирующих логи
- Активность SSH-входов (успешные и неуспешные)
- Активность фаервола (заблокированные и разрешённые соединения)
- События безопасности (неуспешные входы, баны, блокировки)
- Активность перезапуска сервисов

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (откорректируйте с учётом вашего часового пояса). В импортированном дашборде диапазон времени по умолчанию не задан.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не применяется

Убедитесь, что задана переменная окружения:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Убедитесь, что файл пользовательской конфигурации смонтирован и доступен для чтения:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### В HyperDX не отображаются логи

**Убедитесь, что файлы syslog существуют и в них идёт запись:**

```bash
# Check if syslog exists
ls -la /var/log/syslog /var/log/messages

# Verify logs are being written
tail -f /var/log/syslog
```

**Убедитесь, что коллектор может читать логи:**

```bash
docker exec <container> cat /var/log/syslog | head -20
```

**Убедитесь, что в результирующей конфигурации присутствует ваш ресивер `filelog`:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**Проверьте журналы коллектора на наличие ошибок:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**Если вы используете демонстрационный набор данных, проверьте, что файл журнала доступен:**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```


### Логи разбираются некорректно

**Убедитесь, что формат syslog совпадает с выбранной конфигурацией:**

Для современных дистрибутивов Linux (Ubuntu 24.04+):

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

Для старых версий Linux или macOS:

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/syslog
# or
tail -5 /var/log/system.log
```

Если ваш формат отличается, выберите соответствующую вкладку конфигурации в разделе [Создание пользовательской конфигурации OTel collector](#custom-otel).


## Следующие шаги {#next-steps}

После настройки мониторинга логов хоста:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических системных событий (отказы сервисов, ошибки аутентификации, предупреждения о диске)
- Фильтруйте по конкретным юнитам для мониторинга отдельных сервисов
- Коррелируйте логи хоста с логами приложений для комплексного поиска и устранения неполадок
- Создавайте пользовательские дашборды для мониторинга безопасности (попытки SSH-доступа, использование sudo, блокировки межсетевым экраном)

## Переход в продакшн {#going-to-production}

В этом руководстве используется встроенный в ClickStack OpenTelemetry Collector для быстрой начальной настройки. Для продакшн-развертываний мы рекомендуем запускать собственный OTel Collector и отправлять данные в OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации продакшна.