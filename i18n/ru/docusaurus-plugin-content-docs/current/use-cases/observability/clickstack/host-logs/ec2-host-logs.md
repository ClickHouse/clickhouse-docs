---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: 'Мониторинг журналов хоста EC2 с помощью ClickStack'
sidebar_label: 'Журналы хоста EC2'
pagination_prev: null
pagination_next: null
description: 'Мониторинг журналов хоста EC2 с помощью ClickStack'
doc_type: 'guide'
keywords: ['EC2', 'AWS', 'журналы хоста', 'systemd', 'syslog', 'OTel', 'ClickStack', 'мониторинг системы', 'облачные метаданные']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/host-logs/ec2/search-view.png';
import log_view from '@site/static/images/clickstack/host-logs/ec2/log-view.png';
import search_view_demo from '@site/static/images/clickstack/host-logs/ec2/search-view-demo.png';
import log_view_demo from '@site/static/images/clickstack/host-logs/ec2/log-view-demo.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Мониторинг журналов хостов EC2 с помощью ClickStack {#ec2-host-logs-clickstack}

:::note[Кратко]
Отслеживайте системные журналы EC2 с помощью ClickStack, установив OpenTelemetry Collector на ваши экземпляры. Коллектор автоматически обогащает журналы метаданными EC2 (ID экземпляра, регион, зона доступности, тип экземпляра). Вы узнаете, как:

- Установить и настроить OpenTelemetry Collector на экземплярах EC2
- Автоматически обогащать журналы метаданными EC2
- Отправлять журналы в ClickStack через OTLP
- Использовать готовую панель мониторинга для визуализации журналов хостов EC2 с облачным контекстом

Демонстрационный набор данных с примерами журналов и смоделированными метаданными EC2 доступен для тестирования.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим экземпляром EC2 {#existing-ec2}

В этом разделе рассматривается установка OpenTelemetry Collector на экземпляры EC2 для сбора системных логов и их отправки в ClickStack с автоматическим обогащением метаданными EC2. Такая распределённая архитектура готова к продакшену и масштабируется на несколько экземпляров.

:::note[Запускаете ClickStack на том же экземпляре EC2?]
Если ClickStack запущен на том же экземпляре EC2, логи которого вы хотите мониторить, вы можете использовать подход «всё-в-одном», аналогичный [руководству по логам Generic Host](/use-cases/observability/clickstack/integrations/host-logs). Смонтируйте `/var/log` в контейнер ClickStack и добавьте процессор `resourcedetection` в пользовательскую конфигурацию, чтобы автоматически собирать метаданные EC2. В этом руководстве основное внимание уделяется более распространённой распределённой архитектуре для продакшен-развертываний.
:::

Если вы хотите протестировать интеграцию логов хоста EC2 перед настройкой продакшен-экземпляра, вы можете опробовать нашу преднастроенную конфигурацию и пример данных в разделе ["Демонстрационный датасет"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack (on-premises, в Cloud или локальный)
- Запущенный экземпляр EC2 (Ubuntu, Amazon Linux или другой дистрибутив Linux)
- Сетевое подключение между экземпляром EC2 и OTLP-эндпоинтом ClickStack (порт 4318 для HTTP или 4317 для gRPC)
- Сервис метаданных экземпляра EC2 доступен (по умолчанию включён)

<VerticalStepper headerLevel="h4">
  #### Проверьте доступность метаданных EC2

  С вашего EC2-инстанса проверьте доступность сервиса метаданных:

  ```bash
# Get metadata token (IMDSv2)
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Verify instance metadata
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
```

  Вы должны увидеть идентификатор экземпляра, регион и тип экземпляра. Если эти команды завершаются ошибкой, проверьте:

  * Служба метаданных экземпляра включена
  * IMDSv2 не блокируется группами безопасности или сетевыми списками контроля доступа (network ACL)
  * Вы выполняете эти команды непосредственно на экземпляре EC2

  :::note
  Метаданные EC2 доступны по адресу `http://169.254.169.254` изнутри экземпляра. Процессор OpenTelemetry `resourcedetection` использует эту конечную точку для автоматического обогащения логов облачным контекстом.
  :::

  #### Проверьте наличие файлов syslog

  Убедитесь, что ваш инстанс EC2 записывает файлы syslog:

  ```bash
# Ubuntu instances
ls -la /var/log/syslog

# Amazon Linux / RHEL instances
ls -la /var/log/messages

# View recent entries
tail -20 /var/log/syslog
# or
tail -20 /var/log/messages
```

  #### Установка OpenTelemetry Collector

  Установите дистрибутив OpenTelemetry Collector Contrib на экземпляр EC2:

  ```bash
# Download the latest release
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.114.0/otelcol-contrib_0.114.0_linux_amd64.tar.gz

# Extract and install
tar -xvf otelcol-contrib_0.114.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/

# Verify installation
otelcol-contrib --version
```

  #### Создайте конфигурацию коллектора

  Создайте файл конфигурации для OpenTelemetry Collector по пути `/etc/otelcol-contrib/config.yaml`:

  ```bash
sudo mkdir -p /etc/otelcol-contrib
```

  Выберите конфигурацию в зависимости от вашего дистрибутива Linux:

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="Современный Linux (Ubuntu 24.04+)" default>
      ```yaml
sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
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
        value: "ec2-host-logs"

processors:
  resourcedetection:
    detectors: [ec2, system]
    timeout: 5s
    override: false
    ec2:
      tags:
        - ^Name
        - ^Environment
        - ^Team
  
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  otlphttp:
    endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
    headers:
      authorization: "${env:CLICKSTACK_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [filelog/syslog]
      processors: [resourcedetection, batch]
      exporters: [otlphttp]
EOF
```
    </TabItem>

    <TabItem value="legacy-linux" label="Устаревший Linux (Amazon Linux 2, RHEL, более старые версии Ubuntu)">
      ```yaml
sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
receivers:
  filelog/syslog:
    include:
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
        value: "ec2-host-logs"

processors:
  resourcedetection:
    detectors: [ec2, system]
    timeout: 5s
    override: false
    ec2:
      tags:
        - ^Name
        - ^Environment
        - ^Team
  
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  otlphttp:
    endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
    headers:
      authorization: "${env:CLICKSTACK_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [filelog/syslog]
      processors: [resourcedetection, batch]
      exporters: [otlphttp]
EOF
```
    </TabItem>
  </Tabs>

  <br />

  **Замените следующее в конфигурации:**

  * `YOUR_CLICKSTACK_HOST`: Имя хоста или IP-адрес, где запущен ClickStack
  * Для локального тестирования вы можете использовать SSH-туннель (см. раздел [Устранение неполадок](#troubleshooting))

  Данная конфигурация:

  * Считывает файлы системных журналов из стандартных путей (`/var/log/syslog` для Ubuntu, `/var/log/messages` для Amazon Linux/RHEL)
  * Разбирает сообщения в формате syslog для извлечения структурированных полей (timestamp, hostname, unit/service, PID, message)
  * **Автоматически обнаруживает и добавляет метаданные EC2** с помощью процессора `resourcedetection`
  * При наличии при этом дополнительно включаются теги EC2 (Name, Environment, Team)
  * Отправляет логи в ClickStack по протоколу OTLP через HTTP

  :::note[Обогащение метаданными EC2]
  Процессор `resourcedetection` автоматически добавляет эти атрибуты к каждой записи лога:

  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;ec2&quot;
  * `cloud.region`: регион AWS (например, &quot;us-east-1&quot;)
  * `cloud.availability_zone`: зона доступности (AZ), например «us-east-1a»
  * `cloud.account.id`: идентификатор учетной записи AWS
  * `host.id`: идентификатор экземпляра EC2 (например, &quot;i-1234567890abcdef0&quot;)
  * `host.type`: Тип инстанса (например, &quot;t3.medium&quot;)
  * `host.name`: Имя хоста инстанса

  #### Установите API-ключ ClickStack

  Экспортируйте API-ключ ClickStack как переменную окружения:

  ```bash
export CLICKSTACK_API_KEY="your-api-key-here"
```

  Чтобы сохранить это значение после перезагрузки, добавьте его в профиль вашей командной оболочки:

  ```bash
echo 'export CLICKSTACK_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

  #### Запуск коллектора

  Запустите OpenTelemetry Collector:

  ```bash
CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
```

  :::note[Для использования в production-среде]
  Настройте коллектор для запуска в качестве службы systemd, чтобы он автоматически запускался при загрузке системы и перезапускался при сбоях. Подробности см. в [документации OpenTelemetry Collector](https://opentelemetry.io/docs/collector/deployment/).
  :::

  #### Проверка логов в HyperDX

  После запуска коллектора войдите в HyperDX и убедитесь, что логи поступают с метаданными EC2:

  1. Перейдите на страницу поиска
  2. Выберите источник `Logs`
  3. Отфильтровать по `source:ec2-host-logs`
  4. Щёлкните запись журнала, чтобы раскрыть её
  5. Убедитесь, что в атрибутах ресурса отображаются метаданные EC2:
     * `cloud.provider`
     * `cloud.region`
     * `host.id` (ID экземпляра)
     * `host.type` (тип экземпляра)
     * `cloud.availability_zone`

  <Image img={search_view} alt="Экран поиска логов EC2" />

  <Image img={log_view} alt="Детали журнала EC2 с метаданными" />
</VerticalStepper>

## Демонстрационный датасет {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию логов хостов EC2 перед настройкой своих продакшен‑инстансов, мы предоставляем примерный датасет с сымитированными метаданными EC2.

<VerticalStepper headerLevel="h4">
  #### Загрузите образец набора данных

  Загрузите образец лог-файла:

  ```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

  Набор данных включает:

  * Последовательность загрузки системы
  * Активность входов по SSH (успешные и неуспешные попытки)
  * Инцидент безопасности (атака методом перебора с срабатыванием fail2ban)
  * Плановое обслуживание (задания cron, anacron)
  * Перезапуски службы (rsyslog)
  * Сообщения ядра и события брандмауэра
  * Сочетание штатных операций и важных событий

  #### Создайте тестовую конфигурацию коллектора

  Создайте файл `ec2-host-logs-demo.yaml` со следующей конфигурацией:

  ```yaml
cat > ec2-host-logs-demo.yaml << 'EOF'
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
        value: "ec2-demo"

processors:
  # Simulate EC2 metadata for demo (no real EC2 instance required)
  resource:
    attributes:
      - key: service.name
        value: "ec2-demo"
        action: insert
      - key: cloud.provider
        value: "aws"
        action: insert
      - key: cloud.platform
        value: "aws_ec2"
        action: insert
      - key: cloud.region
        value: "us-east-1"
        action: insert
      - key: cloud.availability_zone
        value: "us-east-1a"
        action: insert
      - key: host.id
        value: "i-0abc123def456789"
        action: insert
      - key: host.type
        value: "t3.medium"
        action: insert
      - key: host.name
        value: "prod-web-01"
        action: insert

service:
  pipelines:
    logs/ec2-demo:
      receivers: [filelog/journal]
      processors:
        - resource
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

  :::note
  В демонстрационных целях метаданные EC2 добавляются вручную с помощью процессора `resource`. В продакшене с реальными инстансами EC2 используйте процессор `resourcedetection`, который автоматически запрашивает API метаданных EC2.
  :::

  #### Запуск ClickStack с демонстрационной конфигурацией

  Запустите ClickStack с демонстрационными логами и конфигурацией:

  ```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/ec2-host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

  #### Проверка логов в HyperDX

  После запуска коллектора:

  1. Откройте [HyperDX](http://localhost:8080/) и войдите в свой аккаунт (при необходимости сначала создайте аккаунт)
  2. Перейдите на экран поиска и выберите в качестве источника `Logs`
  3. Задайте интервал времени **2025-11-10 00:00:00 - 2025-11-13 00:00:00**
  4. Отфильтруйте по значению `source:ec2-demo`
  5. Разверните запись лога, чтобы увидеть метаданные EC2 в атрибутах ресурса

  <Image img={search_view_demo} alt="экран поиска логов EC2" />

  <Image img={log_view_demo} alt="Подробная запись журнала EC2 с метаданными" />

  :::note[Отображение часового пояса]
  HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Увидев логи, вы можете сузить диапазон до 24 часов для более чёткой визуализации.
  :::

  Вы должны увидеть логи с симулированным контекстом EC2, включающие:

  * Идентификатор экземпляра: `i-0abc123def456789`
  * Регион: `us-east-1`
  * Зона доступности: `us-east-1a`
  * Тип экземпляра: `t3.medium`
</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг логов хостов EC2 с помощью ClickStack, мы предоставляем базовые визуализации с контекстом облачной инфраструктуры.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `host-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотрите дашборд {#created-dashboard}

Дашборд будет создан со всеми преднастроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд логов EC2"/>

Вы можете фильтровать визуализации дашборда по контексту EC2:
- `cloud.region:us-east-1` — показать логи из конкретного региона
- `host.type:t3.medium` — фильтрация по типу инстанса
- `host.id:i-0abc123def456` — логи с конкретного инстанса

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Метаданные EC2 не отображаются в журналах

**Проверьте, что сервис метаданных EC2 доступен:**

```bash
# Get metadata token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Test metadata endpoint
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

Если это не помогло, проверьте:

* Служба метаданных экземпляра включена
* IMDSv2 не блокируется группами безопасности
* Коллектор запущен непосредственно на экземпляре EC2

**Проверьте логи коллектора на наличие ошибок метаданных:**

```bash
# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# If running in foreground, check stdout
```

### В HyperDX не отображаются логи

**Проверьте, что файлы syslog существуют и в них ведётся запись:**

```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**Проверьте, что коллектор может читать файлы журналов:**

```bash
cat /var/log/syslog | head -20
```

**Проверьте сетевое подключение к ClickStack:**

```bash
# Test OTLP endpoint
curl -v http://YOUR_CLICKSTACK_HOST:4318/v1/logs

# Should get a response (even if error, means endpoint is reachable)
```

**Проверьте логи коллектора на наличие ошибок:**

```bash
# If running in foreground
# Look for error messages in stdout

# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "error\|failed"
```

### Некорректный разбор логов

**Проверьте формат syslog:**

Для Ubuntu 24.04+:

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

Для Amazon Linux 2 / Ubuntu 20.04:

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/messages
```

Если ваш формат отличается, в зависимости от вашей дистрибуции используйте соответствующую вкладку конфигурации в разделе [Create collector configuration](#create-config).

### Коллектор не запускается как служба systemd

**Проверьте статус службы:**

```bash
sudo systemctl status otelcol-contrib
```

**Просмотрите подробные логи:**

```bash
sudo journalctl -u otelcol-contrib -n 50
```

**Распространённые проблемы:**

* API-ключ некорректно задан в переменных окружения
* Ошибки синтаксиса в файле конфигурации
* Проблемы с правами доступа к файлам логов

## Следующие шаги {#next-steps}

После настройки мониторинга логов хоста EC2:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для ключевых системных событий (сбоев сервисов, ошибок аутентификации, предупреждений по диску)
- Фильтруйте логи по атрибутам метаданных EC2 (region, instance type, instance ID) для мониторинга конкретных ресурсов
- Коррелируйте логи хоста EC2 с логами приложений для всестороннего устранения неполадок
- Создайте пользовательские дашборды для мониторинга безопасности (попытки SSH-доступа, использование sudo, блокировки межсетевым экраном)