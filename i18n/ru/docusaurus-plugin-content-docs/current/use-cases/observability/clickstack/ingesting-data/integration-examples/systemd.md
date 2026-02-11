---
slug: /use-cases/observability/clickstack/integrations/systemd-logs
title: 'Мониторинг журналов systemd с помощью ClickStack'
sidebar_label: 'Журналы systemd/journald'
pagination_prev: null
pagination_next: null
description: 'Мониторинг журналов systemd и journald с помощью ClickStack'
doc_type: 'guide'
keywords: ['systemd', 'journald', 'journal', 'OTEL', 'ClickStack', 'system logs', 'systemctl']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/systemd/finish-import-systemd.png';
import example_dashboard from '@site/static/images/clickstack/systemd/systemd-logs-dashboard.png';
import search_view from '@site/static/images/clickstack/systemd/systemd-search-view.png';
import log_view from '@site/static/images/clickstack/systemd/systemd-log-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов systemd с помощью ClickStack \{#systemd-logs-clickstack\}

:::note[Кратко]
В этом руководстве показано, как мониторить журналы systemd с помощью ClickStack, запустив OpenTelemetry Collector с приёмником journald. Вы узнаете, как:

- Развернуть OpenTelemetry Collector для чтения записей журнала systemd
- Отправлять логи systemd в ClickStack по OTLP
- Использовать преднастроенную панель мониторинга для визуализации данных по логам systemd (состояние сервисов, ошибки, события аутентификации)

Демонстрационный набор данных с примерами логов доступен, если вы хотите протестировать интеграцию перед настройкой боевых систем.

Требуемое время: 10–15 минут
:::

## Интеграция с существующими системами \{#existing-systems\}

Отслеживайте логи journald на существующей Linux-системе, запустив OpenTelemetry Collector с приёмником journald для сбора системных логов и отправки их в ClickStack по OTLP.

Если вы хотите сначала протестировать эту интеграцию, не изменяя существующую конфигурацию, перейдите к [разделу с демонстрационным набором данных](#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Система Linux с systemd (Ubuntu 16.04+, CentOS 7+, Debian 8+)
- Docker или Docker Compose, установленные на отслеживаемой системе

<VerticalStepper headerLevel="h4">

#### Получить ClickStack API key \{#get-api-key\}

OTel collector отправляет данные в OTLP-эндпоинт ClickStack, который требует аутентификации.

1. Откройте HyperDX по вашему ClickStack URL (например, http://localhost:8080)
2. Создайте учётную запись или, при необходимости, войдите в систему
3. Перейдите в **Team Settings → API Keys**
4. Скопируйте ваш **ключ API для приёма данных API key**

<Image img={api_key} alt="ClickStack API Key"/>

5. Задайте его как переменную окружения:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Убедитесь, что systemd journal запущен \{#verify-systemd\}

Убедитесь, что ваша система использует systemd и имеет журналы:

```bash
# Проверить версию systemd
systemctl --version

# Просмотреть последние записи журнала
journalctl -n 20

# Проверить использование диска журналом
journalctl --disk-usage
```

Если хранилище журнала находится только в памяти, включите постоянное хранилище:

```bash
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald
```

#### Создайте конфигурацию OpenTelemetry Collector \{#create-otel-config\}

Создайте конфигурационный файл для OTel collector:

```yaml
cat > otel-config.yaml << 'EOF'
receivers:
  journald:
    directory: /var/log/journal
    priority: info
    units:
      - sshd
      - nginx
      - docker
      - containerd
      - systemd

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  
  resource:
    attributes:
      - key: service.name
        value: systemd-logs
        action: insert
      - key: host.name
        from_attribute: _HOSTNAME
        action: upsert
  
  attributes:
    actions:
      - key: unit
        from_attribute: _SYSTEMD_UNIT
        action: upsert
      - key: priority
        from_attribute: PRIORITY
        action: upsert

exporters:
  otlphttp:
    endpoint: ${CLICKSTACK_ENDPOINT}
    headers:
      authorization: ${CLICKSTACK_API_KEY}

service:
  pipelines:
    logs:
      receivers: [journald]
      processors: [resource, attributes, batch]
      exporters: [otlphttp]
EOF
```

#### Разверните с помощью Docker Compose \{#deploy-docker-compose\}

:::note
`journald` receiver требует бинарный файл `journalctl` для чтения файлов журнала. Официальный образ `otel/opentelemetry-collector-contrib` по умолчанию не содержит `journalctl`.

Для контейнеризованных развертываний вы можете либо установить collector напрямую на хост, либо собрать кастомный образ с утилитами systemd. Подробности см. в [разделе по устранению неполадок](#journalctl-not-found).
:::

Этот пример показывает развертывание OTel collector вместе с ClickStack:

```yaml
services:
  clickstack:
    image: clickhouse/clickstack-all-in-one:latest
    ports:
      - "8080:8080"
      - "4317:4317"
      - "4318:4318"
    networks:
      - monitoring
  
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.115.1
    depends_on:
      - clickstack
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      - CLICKSTACK_ENDPOINT=http://clickstack:4318
    volumes:
      - ./otel-config.yaml:/etc/otelcol/config.yaml:ro
      - /var/log/journal:/var/log/journal:ro
      - /run/log/journal:/run/log/journal:ro
      - /etc/machine-id:/etc/machine-id:ro
    command: ["--config=/etc/otelcol/config.yaml"]
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

Запустите сервисы:

```bash
docker compose up -d
```

#### Проверьте логи в HyperDX \{#verifying-logs\}

После настройки войдите в HyperDX и убедитесь, что логи поступают:

1. Перейдите в представление Search
2. Установите источник в значение Logs
3. Отфильтруйте по `service.name:systemd-logs`
4. Вы должны увидеть структурированные записи журнала с полями `unit`, `priority`, `MESSAGE`, `_HOSTNAME`

<Image img={search_view} alt="Представление поиска логов"/>

<Image img={log_view} alt="Представление лога"/>

</VerticalStepper>

## Демонстрационный набор данных \{#demo-dataset\}

Для пользователей, которые хотят протестировать интеграцию логов systemd перед настройкой производственных систем, мы предоставляем демонстрационный набор предварительно сгенерированных логов systemd с реалистичными шаблонами.

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных \{#download-sample\}

Загрузите пример файла логов:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/systemd/systemd-demo.log
```

#### Создайте конфигурацию коллектора для демо \{#demo-config\}

Создайте конфигурационный файл для демонстрации:

```bash
cat > systemd-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/systemd-demo/systemd-demo.log
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
        value: "systemd-demo"

service:
  pipelines:
    logs/systemd-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Запустите ClickStack с демонстрационными данными \{#run-demo\}

Запустите ClickStack с демонстрационными логами:

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/systemd-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/systemd-demo.log:/tmp/systemd-demo/systemd-demo.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
В демонстрации используется ресивер `filelog` с текстовыми логами вместо `journald`, чтобы избежать необходимости в `journalctl` в контейнере.
:::

#### Проверьте логи в HyperDX \{#verify-demo-logs\}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись
2. Перейдите в представление Search и установите источник в `Logs`
3. Установите диапазон времени **2025-11-14 00:00:00 - 2025-11-17 00:00:00**

<Image img={search_view} alt="Представление поиска по логам"/>

<Image img={log_view} alt="Представление логов"/>

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения.
:::

</VerticalStepper>

## Дашборды и визуализация \{#dashboards\}

Чтобы помочь вам начать мониторинг логов systemd с ClickStack, мы предоставляем базовые визуализации для данных журнала systemd.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/systemd-logs-dashboard.json')} download="systemd-logs-dashboard.json" eventName="docs.systemd_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \{#download\}

#### Импорт готового дашборда \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу в меню под значком с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `systemd-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Завершение импорта"/>

#### Просмотр дашборда \{#created-dashboard\}

Дашборд включает визуализации для:
- Объёма логов во времени
- Наиболее активных systemd-юнитов по количеству логов
- Событий аутентификации SSH
- Сбоев сервисов
- Частоты ошибок

<Image img={example_dashboard} alt="Пример дашборда"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** (при необходимости скорректируйте в соответствии с вашим часовым поясом).
:::

</VerticalStepper>

## Устранение неполадок \{#troubleshooting\}

### В HyperDX не отображаются логи \{#no-logs\}

Проверьте, поступают ли логи в ClickHouse:

```bash
docker exec clickstack clickhouse-client --query "
SELECT COUNT(*) as log_count
FROM otel_logs
WHERE ServiceName = 'systemd-logs'
"
```

Если результатов нет, просмотрите логи коллектора:

```bash
docker logs otel-collector | grep -i "error\|journald" | tail -20
```


### ошибка journalctl not found \{#journalctl-not-found\}

Если вы видите `exec: "journalctl": executable file not found in $PATH`:

Образ `otel/opentelemetry-collector-contrib` не включает `journalctl`. Вы можете:

1. **Установить коллектор на хосте**:

```bash
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.0/otelcol-contrib_0.115.0_linux_amd64.tar.gz
tar -xzf otelcol-contrib_0.115.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --config=otel-config.yaml
```

2. **Использовать подход с текстовым экспортом** (как в демо) с приемником `filelog`, читающим экспортированные логи journald


## Переход к эксплуатации в продакшене \{#going-to-production\}

В этом руководстве используется отдельный коллектор OpenTelemetry для чтения логов systemd и отправки их на OTLP-эндпоинт ClickStack, что является рекомендуемым паттерном для продакшена.

Для продакшн-сред с несколькими хостами рассмотрите следующие варианты:

- Развертывание коллектора как ДемонСет в Kubernetes
- Запуск коллектора как службы systemd на каждом хосте
- Использование OpenTelemetry Operator для автоматизированного развертывания

См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для получения сведений о паттернах продакшн-развертывания.