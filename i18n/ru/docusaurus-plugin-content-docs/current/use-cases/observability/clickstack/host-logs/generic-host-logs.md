---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'Мониторинг журналов хоста с помощью ClickStack'
sidebar_label: 'Универсальные журналы хоста'
pagination_prev: null
pagination_next: null
description: 'Мониторинг универсальных журналов хоста с помощью ClickStack'
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


# Мониторинг журналов хоста с помощью ClickStack {#host-logs-clickstack}

:::note[Краткое содержание]
В этом руководстве описывается, как настроить мониторинг системных журналов хоста с помощью ClickStack путём настройки сборщика OpenTelemetry для сбора журналов из systemd, ядра, SSH, cron и других системных служб. Вы узнаете, как:

- Настроить сборщик OTel для чтения системных файлов журналов
- Развернуть ClickStack с пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации данных из журналов хоста (ошибки, предупреждения, активность служб)

Демонстрационный набор данных с примерами журналов доступен для тестирования интеграции перед настройкой продуктивных хостов.

Требуемое время: 5–10 минут
:::


## Интеграция с существующими хостами {#existing-hosts}

В этом разделе описывается настройка существующих хостов для отправки системных журналов в ClickStack путём изменения конфигурации OTel-коллектора ClickStack для чтения всех файлов системных журналов (syslog, auth, kernel, daemon и журналов приложений).

Если вы хотите протестировать интеграцию журналов хоста перед настройкой собственной системы, вы можете воспользоваться нашей предварительно настроенной конфигурацией и тестовыми данными в разделе ["Демонстрационный набор данных"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Система с файлами syslog
- Доступ к изменению конфигурационных файлов ClickStack

<VerticalStepper headerLevel="h4">

#### Проверка наличия файлов syslog {#verify-syslog}

Сначала убедитесь, что ваша система записывает файлы syslog:


```bash
# Проверка наличия файлов syslog (Linux)
ls -la /var/log/syslog /var/log/messages
```


# Или на macOS
ls -la /var/log/system.log



# Просмотр последних записей

tail -20 /var/log/syslog

````

Стандартные расположения syslog:
- **Ubuntu/Debian**: `/var/log/syslog`
- **RHEL/CentOS/Fedora**: `/var/log/messages`
- **macOS**: `/var/log/system.log`

#### Создание пользовательской конфигурации коллектора OTel {#custom-otel}

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского файла конфигурации и установки переменной окружения.

Создайте файл с именем `host-logs-monitoring.yaml` с конфигурацией для вашей системы:

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
- Парсят формат syslog для извлечения структурированных полей (временная метка, имя хоста, модуль/служба, PID, сообщение)
- Сохраняют исходные временные метки логов
- Добавляют атрибут `source: host-logs` для фильтрации в HyperDX
- Направляют логи в экспортер ClickHouse через выделенный конвейер


:::note

- В пользовательской конфигурации вы определяете только новые приёмники и конвейеры
- Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
- Парсер регулярных выражений извлекает имена юнитов systemd, PID и другие метаданные из формата syslog
- Эта конфигурация использует `start_at: end`, чтобы избежать повторного приёма логов при перезапуске сборщика. Для тестирования измените на `start_at: beginning`, чтобы сразу увидеть исторические логи.
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации {#load-custom}

Чтобы включить пользовательскую конфигурацию сборщика в существующем развёртывании ClickStack, необходимо:

1. Смонтировать файл пользовательской конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
2. Установить переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Смонтировать каталог syslog, чтобы сборщик мог читать логи

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

##### Вариант 2: Docker Run (универсальный образ) {#all-in-one}

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
Убедитесь, что сборщик ClickStack имеет соответствующие разрешения для чтения файлов syslog. В продакшене используйте монтирование только для чтения (`:ro`) и следуйте принципу минимальных привилегий.
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


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию журналов хоста перед настройкой производственных систем, мы предоставляем демонстрационный набор данных с предварительно сгенерированными системными журналами, содержащими реалистичные шаблоны.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных {#download-sample}

Загрузите демонстрационный файл журнала:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

Набор данных включает:

- Последовательность загрузки системы
- Активность входа по SSH (успешные и неудачные попытки)
- Инцидент безопасности (атака методом перебора с реакцией fail2ban)
- Плановое обслуживание (задания cron, anacron)
- Перезапуски служб (rsyslog)
- Сообщения ядра и активность межсетевого экрана
- Сочетание обычных операций и значимых событий

#### Создание тестовой конфигурации сборщика {#test-config}

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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**Файл журнала монтируется непосредственно в контейнер. Это выполняется для целей тестирования со статическими демонстрационными данными.**
:::

#### Проверка журналов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (возможно, сначала потребуется создать учетную запись)
2. Перейдите в представление поиска и установите источник `Logs`
3. Установите временной диапазон **2025-11-10 00:00:00 - 2025-11-13 00:00:00**

<Image img={search_view} alt='Представление поиска' />
<Image img={log_view} alt='Представление журнала' />

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные журналы независимо от вашего местоположения. После того как вы увидите журналы, можно сузить диапазон до 24-часового периода для более четкой визуализации.
:::

</VerticalStepper>


## Панели мониторинга и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг логов хоста с помощью ClickStack, мы предоставляем основные визуализации для системных логов.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию панели мониторинга {#download}

#### Импортируйте готовую панель мониторинга {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком многоточия

<Image img={import_dashboard} alt='Кнопка импорта панели мониторинга' />

3. Загрузите файл `host-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt='Завершение импорта' />

#### Просмотр панели мониторинга {#created-dashboard}

Панель мониторинга будет создана со всеми предварительно настроенными визуализациями:

<Image img={logs_dashboard} alt='Панель мониторинга логов' />

Основные визуализации включают:

- Объем логов во времени по степени важности
- Топ systemd-юнитов, генерирующих логи
- Активность SSH-входов (успешные и неудачные)
- Активность межсетевого экрана (заблокированные и разрешенные)
- События безопасности (неудачные попытки входа, блокировки, запреты)
- Активность перезапуска сервисов

:::note
Для демонстрационного набора данных установите временной диапазон **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированная панель мониторинга по умолчанию не будет иметь указанного временного диапазона.
:::

</VerticalStepper>


## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается {#troubleshooting-not-loading}

Убедитесь, что переменная окружения установлена:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Проверьте, что пользовательский файл конфигурации смонтирован и доступен для чтения:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### Логи не отображаются в HyperDX {#no-logs}


**Убедитесь, что файлы syslog существуют и в них ведётся запись:**

```bash
# Проверка наличия syslog
ls -la /var/log/syslog /var/log/messages
```


# Проверка записи логов

tail -f /var/log/syslog

````

**Проверьте, что коллектор может читать логи:**
```bash
docker exec <container> cat /var/log/syslog | head -20
````

**Проверьте, что действующая конфигурация включает ваш приёмник filelog:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**Проверьте наличие ошибок в логах коллектора:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**Если используется демонстрационный набор данных, проверьте доступность файла логов:**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```

### Логи не обрабатываются корректно {#logs-not-parsing}

**Убедитесь, что формат syslog соответствует выбранной конфигурации:**


Для современных версий Linux (Ubuntu 24.04+):

```bash
# Должен отображать формат ISO8601: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```


Для устаревших версий Linux или macOS:

```bash
# Должен отображаться традиционный формат: Nov 17 14:16:16
tail -5 /var/log/syslog
# или
tail -5 /var/log/system.log
```

Если ваш формат отличается, выберите соответствующую вкладку конфигурации в разделе [Create custom OTel collector configuration](#custom-otel).


## Следующие шаги {#next-steps}

После настройки мониторинга журналов хоста:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических системных событий (сбои служб, ошибки аутентификации, предупреждения о состоянии дисков)
- Фильтруйте по конкретным юнитам для мониторинга отдельных служб
- Сопоставляйте журналы хоста с журналами приложений для комплексной диагностики проблем
- Создавайте пользовательские дашборды для мониторинга безопасности (попытки SSH-подключений, использование sudo, блокировки межсетевым экраном)


## Переход в промышленную эксплуатацию {#going-to-production}

Данное руководство расширяет встроенный в ClickStack сборщик OpenTelemetry Collector для быстрой настройки. Для промышленных развертываний рекомендуется запускать собственный OTel Collector и отправлять данные на OTLP-эндпоинт ClickStack. Конфигурацию для промышленной эксплуатации см. в разделе [Отправка данных OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).
