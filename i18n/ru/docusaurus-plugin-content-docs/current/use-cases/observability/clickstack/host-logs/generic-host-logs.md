---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'Мониторинг журналов хоста в ClickStack'
sidebar_label: 'Общие журналы хоста'
pagination_prev: null
pagination_next: null
description: 'Мониторинг общих журналов хоста в ClickStack'
doc_type: 'guide'
keywords: ['журналы хоста', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'мониторинг системы', 'журналы сервера']
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


# Мониторинг логов хоста с помощью ClickStack {#host-logs-clickstack}

:::note[Кратко]
В этом руководстве показано, как отслеживать системные логи хоста с помощью ClickStack, настроив OTel collector для сбора логов из systemd, ядра, SSH, cron и других системных сервисов. Вы узнаете, как:

- Настроить OTel collector для чтения файлов системных логов
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации данных по логам хоста (ошибки, предупреждения, активность служб)

Доступен демонстрационный набор данных с примерами логов, если вы хотите протестировать интеграцию до настройки боевых хостов.

Требуемое время: 5–10 минут
:::



## Интеграция с существующими хостами {#existing-hosts}

В этом разделе описывается настройка существующих хостов для отправки системных журналов в ClickStack путём изменения конфигурации OTel collector ClickStack для чтения всех файлов системных журналов (syslog, auth, kernel, daemon и журналов приложений).

Если вы хотите протестировать интеграцию журналов хоста перед настройкой собственной конфигурации, вы можете использовать нашу предварительно настроенную конфигурацию и демонстрационные данные в разделе [«Демонстрационный набор данных»](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Система с файлами syslog
- Доступ к изменению конфигурационных файлов ClickStack

<VerticalStepper headerLevel="h4">

#### Проверьте наличие файлов syslog {#verify-syslog}

Сначала убедитесь, что ваша система записывает файлы syslog:


```bash
# Проверьте наличие файлов syslog (Linux)
ls -la /var/log/syslog /var/log/messages
```


# А на macOS
ls -la /var/log/system.log



# Просмотр последних записей

tail -20 /var/log/syslog

````

Стандартные расположения syslog:
- **Ubuntu/Debian**: `/var/log/syslog`
- **RHEL/CentOS/Fedora**: `/var/log/messages`
- **macOS**: `/var/log/system.log`

#### Создание пользовательской конфигурации OTel collector {#custom-otel}

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector, подключив пользовательский файл конфигурации и задав переменную окружения.

Создайте файл `host-logs-monitoring.yaml` с конфигурацией для вашей системы:

<Tabs groupId="os-type">
<TabItem value="modern-linux" label="Современные версии Linux (Ubuntu 24.04+)" default>

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
````

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
        layout: "%b %d %H:%M:%S"

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
        layout: "%b %d %H:%M:%S"

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
<br/>
Все конфигурации:
- Читают файлы syslog из стандартных расположений
- Разбирают формат syslog для извлечения структурированных полей (временная метка, имя хоста, модуль/служба, PID, сообщение)
- Сохраняют исходные временные метки логов
- Добавляют атрибут `source: host-logs` для фильтрации в HyperDX
- Направляют логи в экспортер ClickHouse через выделенный конвейер


:::note

- В пользовательской конфигурации вы определяете только новые приёмники и конвейеры
- Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
- Парсер регулярных выражений извлекает имена юнитов systemd, PID и другие метаданные из формата syslog
- Эта конфигурация использует `start_at: end`, чтобы избежать повторного приёма логов при перезапуске коллектора. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть исторические логи.
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации {#load-custom}

Чтобы включить пользовательскую конфигурацию коллектора в существующем развёртывании ClickStack, необходимо:

1. Смонтировать файл пользовательской конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
2. Установить переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Смонтировать каталог syslog, чтобы коллектор мог читать логи

##### Вариант 1: Docker Compose {#docker-compose}

Обновите конфигурацию развёртывания ClickStack:

```yaml
services:
  clickstack:
    # ... существующая конфигурация ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... другие переменные окружения ...
    volumes:
      - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log:/var/log:ro
      # ... другие тома ...
```

##### Вариант 2: Docker Run (образ «всё в одном») {#all-in-one}

Если вы используете образ «всё в одном» с docker run:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Убедитесь, что коллектор ClickStack имеет соответствующие разрешения для чтения файлов syslog. В продакшене используйте монтирование только для чтения (`:ro`) и следуйте принципу минимальных привилегий.
:::

#### Проверка логов в HyperDX {#verifying-logs}

После настройки войдите в HyperDX и убедитесь, что логи поступают:

1. Перейдите в представление поиска
2. Установите источник на Logs
3. Отфильтруйте по `source:host-logs`, чтобы увидеть логи хоста
4. Вы должны увидеть структурированные записи логов с полями `unit`, `hostname`, `pid`, `message` и т. д.

<Image img={search_view} alt='Представление поиска' />
<Image img={log_view} alt='Представление логов' />

</VerticalStepper>


## Демонстрационный датасет {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию логов хоста перед настройкой своих продуктивных систем, мы предоставляем демонстрационный датасет из заранее сгенерированных системных логов с реалистичными паттернами.

<VerticalStepper headerLevel="h4">

#### Скачать пример датасета {#download-sample}

Скачайте пример файла логов:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

Датасет включает:
- Последовательность загрузки системы
- Активность SSH-входов (успешные и неуспешные попытки)
- Инцидент безопасности (brute force-атака с реакцией fail2ban)
- Плановое обслуживание (cron-задания, anacron)
- Перезапуски сервисов (rsyslog)
- Сообщения ядра и активность межсетевого экрана (firewall)
- Смесь штатной работы и заметных событий

#### Создайте тестовую конфигурацию коллектора {#test-config}

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

#### Запустить ClickStack с демонстрационной конфигурацией {#run-demo}

Запустите ClickStack с демонстрационными логами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**При этом файл логов монтируется непосредственно в контейнер. Это делается для целей тестирования со статическими демонстрационными данными.**
:::

#### Проверить логи в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (возможно, сначала потребуется её создать)
2. Перейдите в представление Search и установите источник в значение `Logs`
3. Установите диапазон времени на **2025-11-10 00:00:00 - 2025-11-13 00:00:00**

<Image img={search_view} alt="Представление поиска"/>
<Image img={log_view} alt="Представление логов"/>

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Как только вы увидите логи, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>



## Панели и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг журналов хостов с помощью ClickStack, мы предоставляем основные визуализации для системных журналов.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию панели {#download}

#### Импортируйте готовую панель {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта панели"/>

3. Загрузите файл `host-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотрите панель {#created-dashboard}

Панель будет создана со всеми предварительно настроенными визуализациями:

<Image img={logs_dashboard} alt="Панель журналов"/>

Ключевые визуализации включают:
- Объём журналов по времени и уровню важности
- Основные юниты systemd, создающие журналы
- Активность SSH-входов (успешных и неуспешных)
- Активность межсетевого экрана (заблокированные и разрешённые операции)
- События безопасности (неудачные входы, баны, блокировки)
- Активность перезапуска сервисов

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (при необходимости скорректируйте в соответствии с вашим часовым поясом). У импортированной панели по умолчанию не будет задан диапазон времени.
:::

</VerticalStepper>



## Устранение неполадок

### Пользовательская конфигурация не загружается

Убедитесь, что переменная окружения установлена:

```bash
docker exec <имя-контейнера> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Проверьте, что файл конфигурации пользователя смонтирован и доступен для чтения:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### Логи не отображаются в HyperDX


**Проверьте, что файлы syslog существуют и что в них ведётся запись:**

```bash
# Проверка наличия syslog
ls -la /var/log/syslog /var/log/messages
```


# Убедитесь, что логи записываются

tail -f /var/log/syslog

````

**Проверьте, что сборщик может читать логи:**
```bash
docker exec <container> cat /var/log/syslog | head -20
````

**Убедитесь, что в итоговой конфигурации присутствует ваш приёмник filelog:**

```bash
docker exec <контейнер> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**Проверьте наличие ошибок в логах коллектора:**

```bash
docker exec <контейнер> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**Если вы используете демонстрационный датасет, убедитесь, что файл логов доступен:**

```bash
docker exec <контейнер> cat /tmp/host-demo/journal.log | wc -l
```

### Логи разбираются неправильно

**Убедитесь, что формат ваших сообщений syslog соответствует выбранной конфигурации:**


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

Если ваш формат отличается от приведённого, выберите соответствующую вкладку конфигурации в разделе [Создание пользовательской конфигурации OTel collector](#custom-otel).


## Дальнейшие шаги {#next-steps}

После настройки мониторинга логов хоста:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных системных событий (сбои сервисов, ошибки аутентификации, предупреждения о диске)
- Фильтруйте по отдельным юнитам для мониторинга конкретных сервисов
- Коррелируйте логи хоста с логами приложений для комплексного устранения неполадок
- Создайте пользовательские дашборды для мониторинга безопасности (попытки SSH-доступа, использование sudo, блокировки межсетевого экрана)



## Переход в продакшн {#going-to-production}

В этом руководстве используется встроенный в ClickStack OpenTelemetry Collector для быстрой настройки. Для продакшн-развертываний мы рекомендуем запускать собственный OTel collector и отправлять данные на OTLP-эндпоинт ClickStack. См. раздел [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для настроек продакшена.
