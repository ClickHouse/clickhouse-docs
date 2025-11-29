---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'Мониторинг логов Redis с помощью ClickStack'
sidebar_label: 'Логи Redis'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов Redis с помощью ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/redis-import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/redis/redis-log-view.png';
import log from '@site/static/images/clickstack/redis/redis-log.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов Redis с помощью ClickStack {#redis-clickstack}

:::note[Кратко]
В этом руководстве показано, как мониторить Redis с помощью ClickStack, настроив OTel collector для приёма серверных логов Redis. Вы узнаете, как:

- Настроить OTel collector для разбора формата логов Redis
- Развернуть ClickStack с вашей пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации метрик Redis (соединения, команды, память, ошибки)

Демонстрационный набор данных с примерами логов доступен, если вы хотите протестировать интеграцию до настройки вашего боевого Redis.

Требуемое время: 5–10 минут
:::

## Интеграция с существующим Redis {#existing-redis}

В этом разделе описывается настройка вашей существующей установки Redis для отправки логов в ClickStack путём изменения конфигурации OTel collector в ClickStack.
Если вы хотите протестировать интеграцию с Redis прежде чем настраивать собственную среду, вы можете воспользоваться нашей предварительно настроенной средой и демонстрационным набором данных в разделе ["Demo dataset"](/use-cases/observability/clickstack/integrations/redis#demo-dataset).

### Предварительные требования {#prerequisites}

- Развернутый экземпляр ClickStack
- Установленный Redis версии 3.0 или новее
- Доступ к файлам журналов Redis

<VerticalStepper headerLevel="h4">
  #### Проверка конфигурации логирования Redis

  Сначала проверьте конфигурацию логирования Redis. Подключитесь к Redis и проверьте расположение лог-файла:

  ```bash
  redis-cli CONFIG GET logfile
  ```

  Стандартные расположения журналов Redis:

  * **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
  * **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
  * **Docker**: Обычно пишет логи в stdout, но может быть настроен на запись логов в `/data/redis.log`

  Если Redis выполняет логирование в stdout, настройте его на запись в файл, обновив `redis.conf`:

  ```bash
  # Записывать логи в файл вместо stdout
  logfile /var/log/redis/redis-server.log

  # Задать уровень логирования (варианты: debug, verbose, notice, warning)
  loglevel notice
  ```

  После изменения конфигурации перезапустите Redis:

  ```bash
  # Для systemd
  sudo systemctl restart redis

  # Для Docker
  docker restart <redis-container>
  ```

  #### Создайте пользовательскую конфигурацию OTel collector

  ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского конфигурационного файла и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, которой управляет HyperDX через OpAMP.

  Создайте файл `redis-monitoring.yaml` со следующей конфигурацией:

  ```yaml
  receivers:
    filelog/redis:
      include:
        - /var/log/redis/redis-server.log
      start_at: beginning
      operators:
        - type: regex_parser
          regex: '^(?P\d+):(?P\w+) (?P\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P[.\-*#]) (?P.*)$'
          parse_from: body
          parse_to: attributes
        
        - type: time_parser
          parse_from: attributes.timestamp
          layout: '%d %b %Y %H:%M:%S'
        
        - type: add
          field: attributes.source
          value: "redis"
        
        - type: add
          field: resource["service.name"]
          value: "redis-production"

  service:
    pipelines:
      logs/redis:
        receivers: [filelog/redis]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  Эта конфигурация:

  * Считывает логи Redis из стандартного расположения
  * Разбирает формат логов Redis с помощью регулярных выражений для извлечения структурированных полей (`pid`, `role`, `timestamp`, `log_level`, `message`)
  * Добавляет атрибут `source: redis`, который можно использовать для фильтрации в HyperDX
  * Передаёт логи в экспортёр ClickHouse через отдельный конвейер

  :::note

  * В пользовательской конфигурации вы определяете только новые приёмники и конвейеры
  * Процессоры (`memory_limiter`, `transform`, `batch`) и экспортёры (`clickhouse`) уже определены в базовой конфигурации ClickStack — достаточно просто ссылаться на них по имени
  * Оператор `time_parser` извлекает временные метки из журналов Redis, чтобы сохранить исходное время записей журнала
  * Эта конфигурация использует `start_at: beginning`, чтобы при запуске коллектора прочитать все уже имеющиеся логи, поэтому вы сможете увидеть их сразу. В продакшн-среде, где важно избежать повторного приёма логов при перезапуске коллектора, измените значение на `start_at: end`.
    :::

  #### Настройте ClickStack для загрузки пользовательской конфигурации

  Чтобы включить пользовательскую конфигурацию коллектора в существующем развертывании ClickStack, необходимо:

  1. Смонтируйте файл пользовательской конфигурации в `/etc/otelcol-contrib/custom.config.yaml`
  2. Установите для переменной окружения `CUSTOM_OTELCOL_CONFIG_FILE` значение `/etc/otelcol-contrib/custom.config.yaml`
  3. Смонтируйте каталог логов Redis, чтобы коллектор мог их читать

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
        - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/redis:/var/log/redis:ro
        # ... other volumes ...
  ```

  ##### Вариант 2: Docker Run (образ «всё в одном»)

  Если вы используете универсальный образ с Docker, выполните:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/redis:/var/log/redis:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  Убедитесь, что у коллектора ClickStack есть необходимые права для чтения файлов журналов Redis. В продакшене используйте монтирование только для чтения (`:ro`) и следуйте принципу минимальных привилегий.
  :::

  #### Проверка логов в HyperDX

  После настройки войдите в HyperDX и убедитесь, что журналы поступают:

  <Image img={log_view} alt="Просмотр логов" />

  <Image img={log} alt="Лог" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию с Redis перед настройкой продуктивных систем, мы предоставляем пример набора данных из предварительно сгенерированных логов Redis с реалистичными шаблонами.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных {#download-sample}

Скачайте пример файла лога:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### Создание тестовой конфигурации коллектора {#test-config}

Создайте файл с именем `redis-demo.yaml` со следующей конфигурацией:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # Читать с начала для демонстрационных данных
    operators:
      - type: regex_parser
        regex: '^(?P<pid>\d+):(?P<role>\w+) (?P<timestamp>\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P<log_level>[.\-*#]) (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'
      
      - type: add
        field: attributes.source
        value: "redis-demo"
      
      - type: add
        field: resource["service.name"]
        value: "redis-demo"

service:
  pipelines:
    logs/redis-demo:
      receivers: [filelog/redis]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Запуск ClickStack с демонстрационной конфигурацией {#run-demo}

Запустите ClickStack с демонстрационными логами и конфигурацией:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**Эта команда напрямую монтирует файл лога в контейнер. Это делается для целей тестирования со статическими демонстрационными данными.**
:::

## Проверка логов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (при необходимости сначала создайте учётную запись)
2. Перейдите в представление Search и установите источник `Logs`
3. Установите диапазон времени **2025-10-26 10:00:00 - 2025-10-29 10:00:00**

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**. Расширенный диапазон времени гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. После того как вы увидите логи, вы можете сузить диапазон до 24 часов для более наглядных визуализаций.
:::

<Image img={log_view} alt="Представление логов"/>

<Image img={log} alt="Лог"/>

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем основные визуализации для логов Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите «Import Dashboard» в правом верхнем углу под значком с многоточием.

<Image img={import_dashboard} alt="Импорт дашборда"/>

3. Загрузите файл redis-logs-dashboard.json и нажмите «Finish Import».

<Image img={finish_import} alt="Завершение импорта"/>

#### Дашборд будет создан со всеми заранее настроенными визуализациями {#created-dashboard}

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). У импортированного дашборда по умолчанию не будет задан диапазон времени.
:::

<Image img={example_dashboard} alt="Пример дашборда"/>

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается

**Убедитесь, что переменная окружения задана корректно:**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# Ожидаемый результат: /etc/otelcol-contrib/custom.config.yaml
```

**Проверьте, что пользовательский конфигурационный файл примонтирован:**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# Ожидаемый результат: должен показать размер файла и права доступа
```

**Просмотрите содержимое пользовательской конфигурации:**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# Должно отобразиться содержимое вашего файла redis-monitoring.yaml
```

**Убедитесь, что в эффективной конфигурации указан ваш приёмник `filelog`:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# Должна отобразиться конфигурация вашего приёмника filelog/Redis
```


### В HyperDX не отображаются логи

**Убедитесь, что Redis записывает логи в файл:**

```bash
redis-cli CONFIG GET logfile
# Ожидаемый результат: должен отобразиться путь к файлу, а не пустая строка
# Пример: 1) "logfile" 2) "/var/log/redis/redis-server.log"
```

**Проверьте, что Redis активно ведёт логирование:**

```bash
tail -f /var/log/redis/redis-server.log
# Должны отобразиться последние записи журнала в формате Redis
```

**Убедитесь, что коллектор может читать логи:**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# Должны отобразиться записи лога Redis
```

**Проверьте наличие ошибок в логах коллектора:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# Проверьте наличие сообщений об ошибках, связанных с filelog или Redis
```

**Если используете docker-compose, проверьте общие тома:**

```bash
# Проверьте, что оба контейнера используют один и тот же том {#expected-output-etcotelcol-contribcustomconfigyaml}
docker volume inspect <volume-name>
# Убедитесь, что том подключен к обоим контейнерам {#expected-output-should-show-file-size-and-permissions}
```


### Логи разбираются некорректно

**Убедитесь, что формат логов Redis соответствует ожидаемому формату:**

```bash
# Логи Redis должны выглядеть так: {#should-show-your-filelogredis-receiver-configuration}
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

Если формат логов Redis отличается, возможно, потребуется скорректировать шаблон регулярного выражения в операторе `regex_parser`. Стандартный формат следующий:

* `pid:role timestamp level message`
* Пример: `12345:M 28 Oct 2024 14:23:45.123 * Server started`


## Дальнейшие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько идей для экспериментов с вашей панелью мониторинга:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критически важных метрик (уровни ошибок, пороги задержки)
- Создайте дополнительные [дашборды](/use-cases/observability/clickstack/dashboards) для конкретных сценариев (мониторинг API, события безопасности)