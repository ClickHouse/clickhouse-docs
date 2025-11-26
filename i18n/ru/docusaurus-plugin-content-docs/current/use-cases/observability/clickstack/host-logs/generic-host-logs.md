---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'Мониторинг логов хоста с помощью ClickStack'
sidebar_label: 'Общие логи хоста'
pagination_prev: null
pagination_next: null
description: 'Мониторинг общих логов хоста с помощью ClickStack'
doc_type: 'guide'
keywords: ['логи хоста', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'мониторинг системы', 'серверные логи']
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


# Мониторинг журналов хоста с помощью ClickStack {#host-logs-clickstack}

:::note[Кратко]
В этом руководстве показано, как отслеживать журналы хост-системы с помощью ClickStack, настроив OTel collector для сбора логов от systemd, ядра, SSH, cron и других системных сервисов. Вы узнаете, как:

- Настроить OTel collector для чтения файлов системных логов
- Развернуть ClickStack с вашей собственной конфигурацией
- Использовать готовую панель мониторинга для визуализации данных по журналам хоста (ошибки, предупреждения, активность сервисов)

Демонстрационный набор данных с примерами логов доступен, если вы хотите протестировать интеграцию до настройки боевых хостов.

Требуемое время: 5–10 минут
:::

## Интеграция с существующими хостами {#existing-hosts}

В этом разделе описывается настройка ваших существующих хостов для отправки системных логов в ClickStack путем изменения конфигурации ClickStack OTel collector так, чтобы он считывал все файлы системных логов (syslog, auth, kernel, daemon и журналы приложений).

Если вы хотите протестировать интеграцию с журналами хоста до настройки собственной среды, вы можете воспользоваться нашей предварительно настроенной конфигурацией и примеровыми данными в разделе ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset).

##### Требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Система, на которой имеются файлы syslog
- Доступ к изменению файлов конфигурации ClickStack

<VerticalStepper headerLevel="h4">
  #### Проверьте наличие файлов syslog

  Сначала убедитесь, что ваша система записывает файлы syslog:

  ```bash
  # Проверка наличия файлов syslog (Linux)
  ls -la /var/log/syslog /var/log/messages

  # Или на macOS
  ls -la /var/log/system.log

  # Просмотр последних записей
  tail -20 /var/log/syslog
  ```

  Типичные расположения syslog:

  * **Ubuntu/Debian**: `/var/log/syslog`
  * **RHEL/CentOS/Fedora**: `/var/log/messages`
  * **macOS**: `/var/log/system.log`

  #### Создайте пользовательскую конфигурацию OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского конфигурационного файла и установки переменной окружения.

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

  * Чтение файлов syslog из стандартных расположений
  * Разберите сообщения в формате syslog, чтобы извлечь структурированные поля (timestamp, hostname, unit/service, PID, message)
  * Сохранение исходных временных меток логов
  * Добавьте атрибут `source: host-logs` для фильтрации данных в HyperDX
  * Маршрутизируйте логи в экспортёр ClickHouse через отдельный конвейер обработки

  :::note

  * В пользовательской конфигурации вы задаёте только новые receivers и pipelines
  * Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — достаточно просто сослаться на них по имени
  * Парсер на основе регулярных выражений извлекает имена юнитов systemd, PID и другие метаданные из сообщений в формате syslog
  * Эта конфигурация использует `start_at: end`, чтобы избежать повторного приёма логов при перезапусках коллектора. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть логи за прошедшее время.
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте пользовательский файл конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог с файлами syslog, чтобы коллектор мог их читать

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

  Если вы используете универсальный образ с docker run:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/var/log:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  Убедитесь, что коллектор ClickStack имеет необходимые права для чтения файлов syslog. В production-среде используйте монтирование только для чтения (`:ro`) и следуйте принципу наименьших привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и убедитесь, что журналы поступают:

  1. Перейдите в режим поиска
  2. В поле Source выберите значение Logs
  3. Отфильтруйте по `source:host-logs`, чтобы просмотреть логи конкретных хостов
  4. Вы должны увидеть структурированные записи логов с полями, такими как `unit`, `hostname`, `pid`, `message` и т.д.

  <Image img={search_view} alt="Экран поиска" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию журналов хоста перед настройкой боевых систем, мы предоставляем пример набора данных с предварительно сгенерированными системными журналами с реалистичными сценариями.

<VerticalStepper headerLevel="h4">

#### Загрузка примера набора данных {#download-sample}

Загрузите пример файла журнала:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

Набор данных включает:
- Последовательность загрузки системы
- Активность входа по SSH (успешные и неуспешные попытки)
- Инцидент безопасности (атака перебором паролей с реакцией fail2ban)
- Плановое обслуживание (задания cron, anacron)
- Перезапуски сервисов (rsyslog)
- Сообщения ядра и активность межсетевого экрана (firewall)
- Сочетание нормальной работы и примечательных событий

#### Создание тестовой конфигурации коллектора {#test-config}

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

Запустите ClickStack с демо-журналами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**Это монтирует файл журнала непосредственно в контейнер. Это делается для тестирования со статическими демо-данными.**
:::

#### Проверка журналов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (при необходимости сначала создайте учетную запись)
2. Перейдите в раздел Search и установите источник `Logs`
3. Установите диапазон времени **2025-11-10 00:00:00 - 2025-11-13 00:00:00**

<Image img={search_view} alt="Представление поиска"/>
<Image img={log_view} alt="Представление журналов"/>

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демо-данные охватывают период **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демо-журналы независимо от вашего местоположения. После того как вы увидите журналы, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы вы могли начать мониторинг логов хоста с помощью ClickStack, мы предоставляем основные визуализации для системных логов.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `host-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотр дашборда {#created-dashboard}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд логов"/>

Ключевые визуализации включают:
- Объём логов во времени по уровням важности
- Топ юнитов systemd, генерирующих логи
- Активность SSH-подключений (успешные vs неудачные)
- Активность межсетевого экрана (заблокировано vs разрешено)
- События безопасности (неудачные входы, блокировки, баны)
- Активность перезапуска сервисов

:::note
Для демонстрационного датасета установите диапазон времени **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). По умолчанию у импортированного дашборда диапазон времени не задан.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

Убедитесь, что задана переменная среды:

```bash
docker exec <имя-контейнера> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Проверьте, что пользовательский конфигурационный файл смонтирован и доступен для чтения:

```bash
docker exec <имя-контейнера> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### В HyperDX не отображаются логи

**Проверьте, что файлы syslog существуют и в них ведётся запись:**

```bash
# Проверить наличие syslog
ls -la /var/log/syslog /var/log/messages

# Убедиться, что логи записываются
tail -f /var/log/syslog
```

**Убедитесь, что коллектор может читать логи:**

```bash
docker exec <container> cat /var/log/syslog | head -20
```

**Убедитесь, что в итоговой конфигурации указан ваш приёмник `filelog`:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**Проверьте наличие ошибок в логах коллектора:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**Если используете демонстрационный набор данных, убедитесь, что файл журнала доступен:**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```


### Логи разбираются некорректно

**Убедитесь, что формат сообщений syslog соответствует выбранной конфигурации:**

Для современных версий Linux (Ubuntu 24.04+):

```bash
# Должен отображать формат ISO8601: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

Для старых версий Linux или macOS:

```bash
# Должен отображаться традиционный формат: Nov 17 14:16:16
tail -5 /var/log/syslog
# или
tail -5 /var/log/system.log
```

Если ваш формат отличается, выберите соответствующую вкладку конфигурации в разделе [Создание пользовательской конфигурации OTel collector](#custom-otel).


## Дальнейшие шаги {#next-steps}

После настройки мониторинга логов хоста:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических системных событий (сбоев сервисов, ошибок аутентификации, предупреждений о диске)
- Фильтруйте по отдельным unit-ам для мониторинга конкретных сервисов
- Коррелируйте логи хоста с логами приложений для комплексного устранения неполадок
- Создавайте пользовательские дашборды для мониторинга безопасности (попытки SSH-доступа, использование sudo, блокировки межсетевым экраном)

## Переход в продакшн {#going-to-production}

В этом руководстве используется встроенный в ClickStack OTel collector для быстрой начальной настройки. Для продакшн-сред мы рекомендуем развернуть собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для конфигурации продакшн-среды.