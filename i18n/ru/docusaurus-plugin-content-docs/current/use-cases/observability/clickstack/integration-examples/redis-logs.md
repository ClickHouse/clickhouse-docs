---
slug: /use-cases/observability/clickstack/integrations/redis
title: 'Мониторинг журналов Redis с помощью ClickStack'
sidebar_label: 'Журналы Redis'
pagination_prev: null
pagination_next: null
description: 'Мониторинг журналов Redis с помощью ClickStack'
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

:::note[Краткое содержание]
В этом руководстве описывается, как настроить мониторинг Redis с помощью ClickStack, сконфигурировав коллектор OpenTelemetry для сбора логов сервера Redis. Вы узнаете, как:

- Настроить коллектор OTel для разбора формата логов Redis
- Развернуть ClickStack с пользовательской конфигурацией
- Использовать готовую панель мониторинга для визуализации метрик Redis (подключения, команды, память, ошибки)

Доступен демонстрационный набор данных с примерами логов, если вы хотите протестировать интеграцию перед настройкой продакшн-окружения Redis.

Требуемое время: 5–10 минут
:::


## Интеграция с существующим Redis {#existing-redis}

В этом разделе описывается настройка существующей установки Redis для отправки логов в ClickStack путём изменения конфигурации OTel-коллектора ClickStack.
Если вы хотите протестировать интеграцию с Redis перед настройкой собственной установки, вы можете воспользоваться нашей преднастроенной конфигурацией и демонстрационными данными в разделе [«Демонстрационный набор данных»](/use-cases/observability/clickstack/integrations/redis#demo-dataset).

### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack
- Существующая установка Redis (версия 3.0 или новее)
- Доступ к файлам логов Redis

<VerticalStepper headerLevel="h4">

#### Проверка конфигурации логирования Redis {#verify-redis}

Сначала проверьте конфигурацию логирования Redis. Подключитесь к Redis и проверьте расположение файла логов:

```bash
redis-cli CONFIG GET logfile
```

Типичные расположения логов Redis:

- **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
- **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
- **Docker**: Обычно логи выводятся в stdout, но можно настроить запись в `/data/redis.log`

Если Redis выводит логи в stdout, настройте запись в файл, обновив `redis.conf`:


```bash
# Запись логов в файл вместо stdout
logfile /var/log/redis/redis-server.log
```


# Установить уровень логирования (варианты: debug, verbose, notice, warning)

loglevel notice

```

После изменения конфигурации перезапустите Redis:
```


```bash
# Для systemd
sudo systemctl restart redis
```


# Для Docker

docker restart <redis-container>

````

#### Создание пользовательской конфигурации коллектора OTel {#custom-otel}

ClickStack позволяет расширить базовую конфигурацию OpenTelemetry Collector путём монтирования пользовательского файла конфигурации и установки переменной окружения. Пользовательская конфигурация объединяется с базовой конфигурацией, управляемой HyperDX через OpAMP.

Создайте файл с именем `redis-monitoring.yaml` со следующей конфигурацией:
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
````

Эта конфигурация:

- Читает логи Redis из стандартного расположения
- Парсит формат логов Redis с помощью регулярных выражений для извлечения структурированных полей (`pid`, `role`, `timestamp`, `log_level`, `message`)
- Добавляет атрибут `source: redis` для фильтрации в HyperDX
- Направляет логи в экспортер ClickHouse через выделенный конвейер

:::note

- В пользовательской конфигурации вы определяете только новые приёмники и конвейеры
- Процессоры (`memory_limiter`, `transform`, `batch`) и экспортеры (`clickhouse`) уже определены в базовой конфигурации ClickStack — вы просто ссылаетесь на них по имени
- Оператор `time_parser` извлекает временные метки из логов Redis для сохранения исходного времени логирования
- Эта конфигурация использует `start_at: beginning` для чтения всех существующих логов при запуске коллектора, что позволяет сразу увидеть логи. Для production-развёртываний, где вы хотите избежать повторного приёма логов при перезапуске коллектора, измените на `start_at: end`.
  :::

#### Настройка ClickStack для загрузки пользовательской конфигурации {#load-custom}

Чтобы включить пользовательскую конфигурацию коллектора в существующем развёртывании ClickStack, необходимо:

1. Смонтировать пользовательский файл конфигурации по пути `/etc/otelcol-contrib/custom.config.yaml`
2. Установить переменную окружения `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Смонтировать каталог логов Redis, чтобы коллектор мог их читать

##### Вариант 1: Docker Compose {#docker-compose}

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

##### Вариант 2: Docker Run (образ «всё в одном») {#all-in-one}

Если вы используете образ «всё в одном» с docker, выполните:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/redis:/var/log/redis:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
Убедитесь, что коллектор ClickStack имеет соответствующие разрешения для чтения файлов логов Redis. В production-среде используйте монтирование только для чтения (`:ro`) и следуйте принципу минимальных привилегий.
:::

#### Проверка логов в HyperDX {#verifying-logs}

После настройки войдите в HyperDX и убедитесь, что логи поступают:

<Image img={log_view} alt='Log view' />

<Image img={log} alt='Log' />

</VerticalStepper>


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию с Redis перед настройкой производственных систем, мы предоставляем демонстрационный набор данных с предварительно сгенерированными логами Redis с реалистичными паттернами.

<VerticalStepper headerLevel="h4">

#### Загрузка демонстрационного набора данных {#download-sample}

Загрузите демонстрационный файл логов:

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
    start_at: beginning  # Чтение с начала для демонстрационных данных
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
**Файл логов монтируется непосредственно в контейнер. Это выполняется для целей тестирования со статическими демонстрационными данными.**
:::


## Проверка логов в HyperDX {#verify-demo-logs}

После запуска ClickStack:

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (возможно, сначала потребуется создать учетную запись)
2. Перейдите в представление Search и установите источник `Logs`
3. Установите временной диапазон **2025-10-26 10:00:00 - 2025-10-29 10:00:00**

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные логи независимо от вашего местоположения. Увидев логи, вы можете сузить диапазон до 24-часового периода для более четкой визуализации.
:::

<Image img={log_view} alt='Представление логов' />

<Image img={log} alt='Лог' />

</VerticalStepper>


## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг Redis с помощью ClickStack, мы предоставляем необходимые визуализации для логов Redis.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию дашборда {#download}

#### Импорт готового дашборда {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите «Import Dashboard» в правом верхнем углу под многоточием.

<Image img={import_dashboard} alt='Импорт дашборда' />

3. Загрузите файл redis-logs-dashboard.json и нажмите «finish import».

<Image img={finish_import} alt='Завершение импорта' />

#### Дашборд будет создан со всеми предварительно настроенными визуализациями {#created-dashboard}

:::note
Для демонстрационного набора данных установите временной диапазон **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). По умолчанию импортированный дашборд не будет иметь указанного временного диапазона.
:::

<Image img={example_dashboard} alt='Пример дашборда' />

</VerticalStepper>


## Устранение неполадок {#troubleshooting}

### Пользовательская конфигурация не загружается {#troubleshooting-not-loading}


**Убедитесь, что переменная окружения установлена правильно:**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# Ожидаемый результат: /etc/otelcol-contrib/custom.config.yaml
```


**Убедитесь, что пользовательский файл конфигурации примонтирован:**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# Ожидаемый результат: Должен отобразить размер файла и права доступа
```


**Просмотрите содержимое пользовательской конфигурации:**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# Должно отобразиться содержимое вашего файла redis-monitoring.yaml
```


**Проверьте, что действующая конфигурация включает ваш filelog-приёмник:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# Должна отобразиться конфигурация вашего filelog/redis-приёмника
```

### Логи не отображаются в HyperDX {#no-logs}


**Убедитесь, что Redis записывает логи в файл:**

```bash
redis-cli CONFIG GET logfile
# Ожидаемый результат: Должен отобразиться путь к файлу, а не пустая строка
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
# Должен вывести записи журнала Redis
```


**Проверьте наличие ошибок в журналах коллектора:**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# Проверьте наличие сообщений об ошибках, связанных с filelog или Redis
```


**При использовании docker-compose проверьте общие тома:**

```bash
# Проверьте, что оба контейнера используют один и тот же том
docker volume inspect <volume-name>
# Убедитесь, что том подключен к обоим контейнерам
```

### Логи не разбираются корректно {#logs-not-parsing}


**Проверьте, что формат логов Redis соответствует ожидаемому шаблону:**

```bash
# Логи Redis должны выглядеть следующим образом:
# 12345:M 28 Oct 2024 14:23:45.123 * Сервер запущен
tail -5 /var/log/redis/redis-server.log
```

Если ваши логи Redis имеют другой формат, возможно, вам потребуется скорректировать шаблон регулярного выражения в операторе `regex_parser`. Стандартный формат:

* `pid:role timestamp level message`
* Пример: `12345:M 28 Oct 2024 14:23:45.123 * Server started`


## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько следующих шагов для экспериментов с вашим дашбордом

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических метрик (частота ошибок, пороговые значения задержки)
- Создайте дополнительные [дашборды](/use-cases/observability/clickstack/dashboards) для конкретных сценариев использования (мониторинг API, события безопасности)
