---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: 'Мониторинг журналов хоста EC2 с помощью ClickStack'
sidebar_label: 'Журналы хоста EC2'
pagination_prev: null
pagination_next: null
description: 'Мониторинг журналов хоста EC2 с помощью ClickStack'
doc_type: 'guide'
keywords: ['EC2', 'AWS', 'журналы хоста', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'мониторинг системы', 'облачные метаданные']
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


# Мониторинг журналов хоста EC2 с помощью ClickStack \{#ec2-host-logs-clickstack\}

:::note[TL;DR]
Отслеживайте системные журналы EC2 с помощью ClickStack, установив OpenTelemetry Collector на ваши экземпляры. Коллектор автоматически обогащает журналы метаданными EC2 (ID экземпляра, регион, зона доступности, тип экземпляра). Вы узнаете, как:

- Установить и настроить OpenTelemetry Collector на экземплярах EC2
- Автоматически обогащать журналы метаданными EC2
- Отправлять журналы в ClickStack через OTLP
- Использовать готовую панель мониторинга для визуализации журналов хостов EC2 с облачным контекстом

Демонстрационный набор данных с примерами журналов и сымитированными метаданными EC2 доступен для тестирования.

Требуемое время: 10–15 минут
:::

## Интеграция с существующим экземпляром EC2 \{#existing-ec2\}

В этом разделе описывается установка OpenTelemetry Collector на ваши экземпляры EC2 для сбора системных логов и отправки их в ClickStack с автоматическим обогащением метаданными EC2. Эта распределенная архитектура готова к использованию в продакшене и масштабируется для работы с множеством экземпляров.

:::note[Запускаете ClickStack на том же экземпляре EC2?]
Если ClickStack запущен на том же экземпляре EC2, логи которого вы хотите мониторить, вы можете использовать подход «всё в одном», аналогичный руководству [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs). Смонтируйте `/var/log` в контейнер ClickStack и добавьте процессор `resourcedetection` в вашу пользовательскую конфигурацию, чтобы автоматически собирать метаданные EC2. Это руководство сосредоточено на более распространенной распределенной архитектуре для продакшен-развертываний.
:::

Если вы хотите протестировать интеграцию логов хоста EC2 до настройки вашего продакшен-экземпляра, вы можете воспользоваться нашей преднастроенной конфигурацией и тестовыми данными в разделе ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный инстанс ClickStack (on-premises, в Cloud или локальный)
- Запущенный инстанс EC2 (Ubuntu, Amazon Linux или другой дистрибутив Linux)
- Сетевое подключение от инстанса EC2 к OTLP-эндпоинту ClickStack (порт 4318 для HTTP или 4317 для gRPC)
- Доступность службы метаданных инстанса EC2 (включена по умолчанию)

<VerticalStepper headerLevel="h4">
  #### Проверьте доступность метаданных EC2

  Из вашего экземпляра EC2 проверьте доступность службы метаданных:

  ```bash
  # Get metadata token (IMDSv2)
  TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

  # Verify instance metadata
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
  ```

  Вы должны увидеть идентификатор экземпляра, регион и тип экземпляра. Если команды завершаются с ошибкой, проверьте:

  * Включена служба метаданных экземпляра
  * IMDSv2 не блокируется группами безопасности или сетевыми ACL
  * Вы выполняете эти команды непосредственно на самом инстансе EC2.

  :::note
  Метаданные EC2 доступны по адресу `http://169.254.169.254` изнутри инстанса. Процессор OpenTelemetry `resourcedetection` использует эту конечную точку для автоматического обогащения логов контекстом облачной среды.
  :::

  #### Проверка наличия файлов syslog

  Убедитесь, что экземпляр EC2 записывает файлы syslog:

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

  #### Установите OpenTelemetry Collector

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

  Создайте конфигурационный файл для OpenTelemetry Collector в `/etc/otelcol-contrib/config.yaml`:

  ```bash
  sudo mkdir -p /etc/otelcol-contrib
  ```

  Выберите конфигурацию в соответствии с вашим дистрибутивом Linux:

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

    <TabItem value="legacy-linux" label="Старые версии Linux (Amazon Linux 2, RHEL, старые версии Ubuntu)">
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

  **Замените в конфигурации следующее:**

  * `YOUR_CLICKSTACK_HOST`: Имя хоста или IP-адрес, на котором работает ClickStack
  * Для локального тестирования можно использовать SSH-туннель (см. раздел [Устранение неполадок](#troubleshooting))

  Эта конфигурация:

  * Считывает файлы системных журналов из стандартных путей (`/var/log/syslog` для Ubuntu, `/var/log/messages` для Amazon Linux/RHEL)
  * Разбирает формат syslog для извлечения структурированных полей (timestamp, hostname, unit/service, PID, message)
  * **Автоматически определяет и добавляет метаданные EC2** с помощью процессора `resourcedetection`
  * При наличии может дополнительно включать теги EC2 (Name, Environment, Team)
  * Отправляет логи в ClickStack по протоколу OTLP через HTTP

  :::note[Обогащение метаданными EC2]
  Процессор `resourcedetection` автоматически добавляет эти атрибуты к каждому логу:

  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;ec2&quot;
  * `cloud.region`: регион в AWS (например, &quot;us-east-1&quot;)
  * `cloud.availability_zone`: зона доступности (AZ) (например, &quot;us-east-1a&quot;)
  * `cloud.account.id`: ID учетной записи AWS
  * `host.id`: идентификатор экземпляра EC2 (например, &quot;i-1234567890abcdef0&quot;)
  * `host.type`: Тип экземпляра (например, &quot;t3.medium&quot;)
  * `host.name`: имя хоста экземпляра

  #### Задайте API-ключ ClickStack

  Экспортируйте API-ключ ClickStack как переменную окружения:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  Чтобы сделать это изменение постоянным (сохраняющимся после перезагрузки), добавьте его в профиль вашей оболочки:

  ```bash
  echo 'export CLICKSTACK_API_KEY="your-api-key-here"' >> ~/.bashrc
  source ~/.bashrc
  ```

  #### Запустите коллектор

  Запустите коллектор OpenTelemetry:

  ```bash
  CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
  ```

  :::note[Для использования в production]
  Настройте коллектор для запуска в качестве службы systemd, чтобы он автоматически запускался при загрузке и перезапускался при сбое. Подробности см. в [документации OpenTelemetry Collector](https://opentelemetry.io/docs/collector/deployment/).
  :::

  #### Проверка журналов в HyperDX

  После запуска коллектора войдите в HyperDX и убедитесь, что логи поступают с метаданными EC2:

  1. Перейдите к поиску
  2. В качестве источника выберите `Logs`
  3. Установите фильтр `source:ec2-host-logs`
  4. Нажмите на запись лога, чтобы раскрыть её
  5. Убедитесь, что в атрибутах ресурса отображаются метаданные EC2:
     * `cloud.provider`
     * `cloud.region`
     * `host.id` (идентификатор экземпляра)
     * `host.type` (тип экземпляра)
     * `cloud.availability_zone`

  <Image img={search_view} alt="Представление для поиска логов EC2" />

  <Image img={log_view} alt="Подробный журнал EC2 с отображением метаданных" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, желающих протестировать интеграцию логов хостов EC2 перед настройкой боевых инстансов, мы предоставляем демонстрационный набор данных со смоделированными метаданными EC2.

<VerticalStepper headerLevel="h4">
  #### Загрузите пример набора данных

  Скачайте образец файла журнала:

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
  ```

  Набор данных включает:

  * Последовательность загрузки системы
  * Активность входов по SSH (успешные и неуспешные попытки)
  * Инцидент безопасности (атака методом перебора паролей с ответом от fail2ban)
  * Плановое обслуживание (задания cron, anacron)
  * Перезапуски службы (rsyslog)
  * Сообщения ядра и активность межсетевого экрана
  * Сочетание штатных операций и важных событий

  #### Создание тестовой конфигурации коллектора

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

  #### Проверьте логи в HyperDX

  После запуска коллектора:

  1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (при необходимости предварительно создайте её)
  2. Перейдите в представление поиска и в качестве источника выберите `Logs`
  3. Задайте временной диапазон **2025-11-10 00:00:00 - 2025-11-13 00:00:00**
  4. Отфильтруйте по значению `source:ec2-demo`
  5. Разверните запись журнала, чтобы просмотреть метаданные EC2 в атрибутах ресурса

  <Image img={search_view_demo} alt="Интерфейс поиска логов EC2" />

  <Image img={log_view_demo} alt="Детализация лога EC2 с метаданными" />

  :::note[Отображение часового пояса]
  HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Увидев логи, вы можете сузить диапазон до 24-часового периода для более чёткой визуализации.
  :::

  Вы увидите логи с симулированным контекстом EC2, включающие:

  * ID экземпляра: `i-0abc123def456789`
  * Регион: `us-east-1`
  * Зона доступности: `us-east-1a`
  * Тип экземпляра: `t3.medium`
</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг логов хостов EC2 с помощью ClickStack, мы предоставляем базовые визуализации с облачным контекстом.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \{#download\}

#### Импорт готового дашборда \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `host-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотр дашборда \{#created-dashboard\}

Дашборд будет создан со всеми заранее настроенными визуализациями:

<Image img={logs_dashboard} alt="Дашборд логов EC2"/>

Вы можете фильтровать визуализации дашборда по контексту EC2:
- `cloud.region:us-east-1` — показывать логи из определённого региона
- `host.type:t3.medium` — фильтровать по типу инстанса
- `host.id:i-0abc123def456` — логи с конкретного инстанса

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Метаданные EC2 не отображаются в логах

**Убедитесь, что служба метаданных EC2 доступна:**

```bash
# Get metadata token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Test metadata endpoint
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

Если это не помогает, проверьте:

* Служба метаданных инстанса включена
* IMDSv2 не блокируется групповыми правилами безопасности
* Коллектор запущен непосредственно на самом EC2-инстансе

**Проверьте логи коллектора на наличие ошибок, связанных с метаданными:**

```bash
# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# If running in foreground, check stdout
```


### В HyperDX не отображаются логи

**Убедитесь, что файлы syslog существуют и в них идёт запись:**

```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**Убедитесь, что коллектор может читать файлы логов:**

```bash
cat /var/log/syslog | head -20
```

**Проверьте сетевую доступность ClickStack:**

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


### Логи разбираются некорректно

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

Если ваш формат не совпадает, используйте соответствующую вкладку конфигурации в разделе [Create collector configuration](#create-config), учитывая ваш дистрибутив.


### Коллектор не запускается как служба systemd

**Проверьте состояние службы:**

```bash
sudo systemctl status otelcol-contrib
```

**Просмотрите подробные логи:**

```bash
sudo journalctl -u otelcol-contrib -n 50
```

**Распространённые проблемы:**

* API-ключ некорректно задан в окружении
* Синтаксические ошибки в файле конфигурации
* Ошибки прав доступа при чтении лог-файлов


## Дальнейшие шаги {#next-steps}

После настройки мониторинга логов хоста EC2:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных системных событий (сбои сервисов, ошибки аутентификации, предупреждения о диске)
- Фильтруйте по атрибутам метаданных EC2 (регион, тип экземпляра, идентификатор экземпляра), чтобы мониторить конкретные ресурсы
- Коррелируйте логи хоста EC2 с логами приложений для комплексного анализа и устранения неполадок
- Создавайте пользовательские дашборды для мониторинга безопасности (попытки SSH-доступа, использование sudo, блокировки межсетевым экраном)