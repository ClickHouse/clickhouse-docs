---
slug: /use-cases/observability/clickstack/integrations/aws-cloudwatch-logs
title: 'Мониторинг логов AWS CloudWatch с помощью ClickStack'
sidebar_label: 'AWS CloudWatch Logs'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов AWS CloudWatch с помощью ClickStack'
doc_type: 'guide'
keywords: ['AWS', 'CloudWatch', 'OTEL', 'ClickStack', 'logs']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view.png';
import demo_search_view from '@site/static/images/clickstack/cloudwatch/demo-search-view.png';
import error_log_overview from '@site/static/images/clickstack/cloudwatch/error-log-overview.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг логов AWS CloudWatch с ClickStack \\{#cloudwatch-clickstack\\}

:::note[TL;DR]
В этом руководстве показано, как пересылать логи AWS CloudWatch в ClickStack с помощью приёмника AWS CloudWatch в OpenTelemetry Collector. Вы узнаете, как:

- Настроить OpenTelemetry Collector для получения логов из CloudWatch
- Настроить учётные данные AWS и права IAM
- Отправлять логи CloudWatch в ClickStack через OTLP
- Фильтровать и автоматически обнаруживать группы логов
- Использовать готовый дашборд для визуализации паттернов логов CloudWatch

Демонстрационный набор данных с примерами логов доступен, если вы хотите протестировать интеграцию до настройки вашего боевого окружения AWS.

Требуемое время: 10–15 минут
:::

## Обзор \\{#overview\\}

AWS CloudWatch — это сервис мониторинга ресурсов и приложений AWS. Хотя CloudWatch предоставляет сбор и агрегацию логов, пересылка логов в ClickStack позволяет:

- Анализировать логи вместе с метриками и трейсами на единой платформе
- Выполнять запросы к логам с использованием SQL-интерфейса ClickHouse
- Сокращать расходы за счет архивирования логов или уменьшения периода хранения в CloudWatch

В этом руководстве описано, как пересылать логи CloudWatch в ClickStack с помощью OpenTelemetry Collector.

## Интеграция с существующими группами журналов CloudWatch \\{#existing-cloudwatch\\}

В этом разделе описана настройка OpenTelemetry Collector для считывания журналов из существующих групп журналов CloudWatch и их пересылки в ClickStack.

Если вы хотите протестировать интеграцию до настройки продакшен-окружения, вы можете воспользоваться нашим демонстрационным набором данных в [разделе демонстрационного набора данных](#demo-dataset).

### Предварительные требования \\{#prerequisites\\}

- Запущенный экземпляр ClickStack
- Учётная запись AWS с группами журналов CloudWatch
- Учётные данные AWS с соответствующими правами доступа IAM

:::note
В отличие от интеграций на основе файлов журналов (nginx, Redis), CloudWatch требует запуска отдельного коллектора OpenTelemetry, который опрашивает CloudWatch API. Этот коллектор не может выполняться внутри образа ClickStack «всё в одном», так как ему необходимы учётные данные AWS и доступ к API.
:::

<VerticalStepper headerLevel="h4">
  #### Получите API-ключ ClickStack

  Коллектор OpenTelemetry отправляет данные на OTLP-эндпоинт ClickStack, для которого требуется аутентификация.

  1. Откройте HyperDX по URL-адресу вашего ClickStack (например, [http://localhost:8080](http://localhost:8080))
  2. При необходимости создайте аккаунт или войдите в систему
  3. Перейдите в раздел **Team Settings → API Keys**
  4. Скопируйте свой **ключ API для приёма данных**

  <Image img={api_key} alt="API-ключ ClickStack" />

  Сохраните это значение в переменной окружения:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  #### Настройте учетные данные AWS

  Экспортируйте учетные данные AWS как переменные окружения. Способ зависит от типа аутентификации:

  **Для пользователей AWS SSO (рекомендуется для большинства организаций):**

  ```bash
  # Login to SSO
  aws sso login --profile YOUR_PROFILE_NAME

  # Export credentials to environment variables
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

  # Verify credentials work
  aws sts get-caller-identity
  ```

  Замените `YOUR_PROFILE_NAME` на название вашего профиля AWS SSO (например, `AccountAdministrators-123456789`).

  **Для пользователей IAM с долгосрочными учётными данными:**

  ```bash
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"

  # Verify credentials work
  aws sts get-caller-identity
  ```

  **Требуемые разрешения IAM:**

  Для учетной записи AWS, связанной с этими учетными данными, необходима следующая политика IAM для чтения логов CloudWatch:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CloudWatchLogsRead",
        "Effect": "Allow",
        "Action": [
          "logs:DescribeLogGroups",
          "logs:FilterLogEvents"
        ],
        "Resource": "arn:aws:logs:*:YOUR_ACCOUNT_ID:log-group:*"
      }
    ]
  }
  ```

  Замените `YOUR_ACCOUNT_ID` на идентификатор вашей учетной записи AWS.

  #### Настройте приёмник CloudWatch

  Создайте файл `otel-collector-config.yaml` с конфигурацией ресивера CloudWatch.

  **Пример 1: Именованные группы логов (рекомендуется)**

  Данная конфигурация собирает логи из конкретных именованных групп логов:

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws/lambda/my-function:
            /aws/ecs/my-service:
            /aws/eks/my-cluster/cluster:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **Пример 2: Автообнаружение групп логов с префиксом**

  Данная конфигурация автоматически обнаруживает и собирает логи из максимум 100 групп логов, начинающихся с префикса `/aws/lambda`:

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws/lambda

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **Параметры конфигурации:**

  * `region`: регион AWS, в котором находятся ваши группы журналов
  * `poll_interval`: Как часто выполнять проверку на наличие новых логов (например, `1m`, `5m`)
  * `max_events_per_request`: Максимальное количество событий логов, извлекаемых за один запрос
  * `groups.autodiscover.limit`: Максимальное число групп логов, которые будут автоматически обнаружены
  * `groups.autodiscover.prefix`: Фильтрация групп журналов по префиксу
  * `groups.named`: явный список имен групп журналов, которые нужно собирать

  Дополнительные параметры конфигурации см. в [документации по приёмнику CloudWatch](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver).

  **Замените следующие значения:**

  * `${CLICKSTACK_API_KEY}` → Использует переменную окружения, которую вы установили ранее
  * `http://localhost:4318` → Ваша конечная точка ClickStack (используйте хост ClickStack, если ClickStack развернут удалённо)
  * `us-east-1` → ваш регион AWS
  * Имена/префиксы групп логов → соответствующие группы логов CloudWatch

  :::note
  Приемник CloudWatch извлекает логи только из недавних временных окон (на основе `poll_interval`). При первом запуске он начинает работу с текущего времени. Исторические логи по умолчанию не извлекаются.
  :::

  #### Запуск коллектора

  Создайте файл `docker-compose.yaml`:

  ```yaml
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - ./otel-collector-config.yaml:/etc/otel-config.yaml
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - CLICKSTACK_API_KEY
      restart: unless-stopped
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```

  Затем запустите коллектор:

  ```bash
  docker compose up -d
  ```

  Просмотр логов коллектора:

  ```bash
  docker compose logs -f otel-collector
  ```

  #### Проверьте логи в HyperDX

  После запуска коллектора:

  1. Откройте HyperDX по адресу [http://localhost:8080](http://localhost:8080) (или по URL-адресу вашего ClickStack)
  2. Перейдите к разделу **Logs**
  3. Подождите 1–2 минуты, пока не появятся логи (с учётом заданного интервала опроса)
  4. Поиск логов в группах журналов CloudWatch

  <Image img={log_search_view} alt="Экран поиска логов" />

  Найдите следующие ключевые атрибуты в логах:

  * `ResourceAttributes['aws.region']`: регион AWS (например, &quot;us-east-1&quot;)
  * `ResourceAttributes['cloudwatch.log.group.name']`: имя группы журналов CloudWatch
  * `ResourceAttributes['cloudwatch.log.stream']`: Имя потока журналов
  * `Body`: основное содержание сообщения журнала

  <Image img={error_log_column_values} alt="Значения столбцов журнала ошибок" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию CloudWatch Logs до настройки продакшн‑окружения AWS, мы предоставляем демонстрационный набор данных с предварительно сгенерированными логами, отражающими реалистичные шаблоны работы нескольких сервисов AWS.

<VerticalStepper headerLevel="h4">

#### Загрузите демонстрационный набор данных \\{#download-sample\\}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/aws/cloudwatch/cloudwatch-logs.jsonl
```

Набор данных содержит 24 часа логов CloudWatch от нескольких сервисов:
- **Lambda-функции**: обработка платежей, управление заказами, аутентификация
- **Сервисы ECS**: шлюз API с ограничением частоты запросов и тайм‑аутами
- **Фоновые задания**: пакетная обработка с шаблонами повторных попыток

#### Запустите ClickStack \\{#start-clickstack\\}

Если у вас ещё не запущен ClickStack:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите несколько минут, чтобы ClickStack полностью запустился.

#### Импортируйте демонстрационный набор данных \\{#import-demo-data\\}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_logs FORMAT JSONEachRow
" < cloudwatch-logs.jsonl
```

Это импортирует логи напрямую в таблицу логов ClickStack.

#### Проверьте демонстрационные данные \\{#verify-demo-logs\\}

После импорта:

1. Откройте HyperDX по адресу http://localhost:8080 и войдите в систему (при необходимости создайте аккаунт)
2. Перейдите в раздел **Logs**
3. Установите диапазон времени **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**
4. Выполните поиск по `cloudwatch-demo` или отфильтруйте по `LogAttributes['source'] = 'cloudwatch-demo'`

Вы должны увидеть логи из нескольких групп логов CloudWatch.

<Image img={demo_search_view} alt="Окно поиска демо‑данных"/>

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**. Установите диапазон времени **2025-12-06 00:00:00 - 2025-12-09 00:00:00**, чтобы гарантированно увидеть демо‑логи независимо от вашего местоположения. После того как появятся логи, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация \\{#dashboards\\}

Чтобы упростить мониторинг логов CloudWatch с помощью ClickStack, мы предоставляем готовый дашборд с основными визуализациями.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \\{#download\\}

#### Импортируйте дашборд \\{#import-dashboard\\}

1. Откройте HyperDX и перейдите в раздел **Dashboards**
2. Нажмите **Import Dashboard** в правом верхнем углу под значком с тремя точками

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `cloudwatch-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотр дашборда \\{#created-dashboard\\}

Дашборд будет создан со всеми заранее настроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд CloudWatch Logs"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** (при необходимости скорректируйте с учётом вашего часового пояса). У импортированного дашборда по умолчанию не задан диапазон времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### Логи не отображаются в HyperDX

**Убедитесь, что учетные данные AWS настроены корректно:**

```bash
aws sts get-caller-identity
```

Если это не срабатывает, ваши учётные данные недействительны или срок их действия истёк.

**Проверьте права доступа IAM:**
Убедитесь, что вашим учётным данным AWS выданы необходимые права доступа `logs:DescribeLogGroups` и `logs:FilterLogEvents`.

**Проверьте логи коллектора на наличие ошибок:**

```bash
# If using Docker directly, logs appear in stdout
# If using Docker Compose:
docker compose logs otel-collector
```

Распространённые ошибки:

* `The security token included in the request is invalid`: учётные данные недействительны или истёк срок их действия. Для временных учётных данных (SSO) убедитесь, что задан `AWS_SESSION_TOKEN`.
* `operation error CloudWatch Logs: FilterLogEvents, AccessDeniedException`: недостаточно прав IAM
* `failed to refresh cached credentials, no EC2 IMDS role found`: не заданы переменные окружения с учётными данными AWS
* `connection refused`: конечная точка ClickStack недоступна

**Проверьте, что группы логов CloudWatch существуют и содержат недавние записи:**

```bash
# List your log groups
aws logs describe-log-groups --region us-east-1

# Check if a specific log group has recent logs (last hour)
aws logs filter-log-events \
  --log-group-name /aws/lambda/my-function \
  --region us-east-1 \
  --start-time $(date -u -v-1H +%s)000 \
  --max-items 5
```


### Отображаются только старые логи или отсутствуют последние логи

**По умолчанию CloudWatch receiver начинает с «текущего момента»:**

Когда коллектор запускается впервые, он создаёт контрольную точку на текущий момент времени и получает только те логи, которые появляются после этого. Исторические логи не считываются.

**Чтобы собрать логи за недавний период из истории:**

Остановите коллектор, удалите его контрольную точку, затем перезапустите:

```bash
# Stop the collector
docker stop <container-id>

# Restart fresh (checkpoints are stored in container, so removing it resets)
docker run --rm ...
```

Приёмник создаст новую контрольную точку и будет получать логи, начиная с текущего момента.


### Недействительный токен безопасности / истёк срок действия учётных данных

Если вы используете временные учётные данные (AWS SSO, роль, полученная через AssumeRole), срок их действия истекает через определённое время.

**Повторно экспортируйте обновлённые учётные данные:**

```bash
# For SSO users:
aws sso login --profile YOUR_PROFILE_NAME
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

# For IAM users:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Restart the collector
docker restart <container-id>
```


### Высокая задержка или отсутствие свежих логов

**Уменьшите интервал опроса:**
Значение `poll_interval` по умолчанию — 1 минута. Для почти реального времени получения логов уменьшите его:

```yaml
logs:
  poll_interval: 30s  # Poll every 30 seconds
```

**Примечание:** меньший интервал опроса увеличивает число запросов к AWS API и может привести к более высоким расходам на API CloudWatch.


### Коллектор потребляет слишком много памяти

**Уменьшите размер пакета или увеличьте тайм-аут:**

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 100
```

**Ограничить автообнаружение:**

```yaml
groups:
  autodiscover:
    limit: 50  # Reduce from 100 to 50
```


## Следующие шаги {#next-steps}

Теперь, когда журналы CloudWatch поступают в ClickStack:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических событий (сбоев подключений, всплесков ошибок)
- Сократите затраты на CloudWatch, настроив периоды хранения или архивацию в S3, теперь, когда журналы уже есть в ClickStack
- Отфильтруйте шумные группы логов, удалив их из конфигурации коллектора, чтобы уменьшить объём принимаемых данных

## Переход в продакшн {#going-to-production}

В этом руководстве показан запуск OpenTelemetry Collector локально с помощью Docker Compose для тестирования. Для продакшн-развертываний запускайте коллектор на инфраструктуре с доступом к AWS (EC2 с IAM-ролями, EKS с IRSA или ECS с ролями задач), чтобы не нужно было управлять ключами доступа. Разворачивайте коллекторы в том же регионе AWS, что и ваши группы логов CloudWatch, чтобы снизить задержки и затраты.

См. раздел [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для ознакомления с шаблонами продакшн-развертываний и примерами конфигурации коллектора.