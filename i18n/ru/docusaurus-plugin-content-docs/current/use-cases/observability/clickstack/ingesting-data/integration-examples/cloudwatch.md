---
slug: /use-cases/observability/clickstack/integrations/aws-cloudwatch-logs
title: 'Мониторинг логов AWS CloudWatch с помощью ClickStack'
sidebar_label: 'Логи AWS CloudWatch'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов AWS CloudWatch с помощью ClickStack'
doc_type: 'guide'
keywords: ['AWS', 'CloudWatch', 'OTEL', 'ClickStack', 'логи']
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


# Мониторинг журналов AWS CloudWatch с ClickStack \{#cloudwatch-clickstack\}

:::note[Кратко]
В этом руководстве показано, как перенаправлять журналы AWS CloudWatch в ClickStack с помощью ресивера AWS CloudWatch в OpenTelemetry Collector. Вы узнаете, как:

- Настроить OpenTelemetry Collector для чтения журналов из CloudWatch
- Настроить учётные данные AWS и разрешения IAM
- Отправлять журналы CloudWatch в ClickStack через OTLP
- Фильтровать и автоматически обнаруживать группы журналов
- Использовать готовый дашборд для визуализации шаблонов журналов CloudWatch

Демо-набор данных с примерами журналов доступен, если вы хотите протестировать интеграцию до настройки вашей production-среды AWS.

Требуемое время: 10–15 минут
:::

## Обзор \{#overview\}

AWS CloudWatch — это служба мониторинга ресурсов и приложений AWS. Хотя CloudWatch предоставляет агрегацию логов, отправка логов в ClickStack позволяет вам:

- Анализировать логи вместе с метриками и трассировками на единой платформе
- Выполнять запросы к логам с использованием SQL-интерфейса ClickHouse
- Сократить затраты за счёт архивирования логов или уменьшения срока их хранения в CloudWatch

В этом руководстве описано, как отправлять логи CloudWatch в ClickStack с помощью OpenTelemetry Collector.

## Интеграция с существующими группами журналов CloudWatch \{#existing-cloudwatch\}

В этом разделе описывается настройка OpenTelemetry Collector для получения логов из ваших существующих групп журналов CloudWatch и их перенаправления в ClickStack.

Если вы хотите протестировать интеграцию до настройки продуктивной среды, вы можете использовать наш демонстрационный набор данных в [разделе с демонстрационным набором данных](#demo-dataset).

### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Учетная запись AWS с группами журналов CloudWatch
- Учетные данные AWS с соответствующими разрешениями IAM

:::note
В отличие от интеграций, работающих с файлами журналов (nginx, Redis), CloudWatch требует запуска отдельного экземпляра OpenTelemetry Collector, который опрашивает CloudWatch API. Этот коллектор не может работать внутри образа ClickStack «всё в одном», так как ему необходимы учетные данные AWS и доступ к API.
:::

<VerticalStepper headerLevel="h4">
  #### Получите API-ключ ClickStack

  Коллектор OpenTelemetry отправляет данные на OTLP-эндпоинт ClickStack, для которого требуется аутентификация.

  1. Откройте HyperDX по URL-адресу вашего ClickStack (например, http://localhost:8080).
  2. Создайте аккаунт или войдите в существующий
  3. Перейдите в раздел **Team Settings → API Keys**
  4. Скопируйте свой **ключ API для приёма данных**

  <Image img={api_key} alt="API-ключ ClickStack" />

  Сохраните это в переменной окружения:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  #### Настройка учетных данных AWS

  Экспортируйте учётные данные AWS как переменные окружения. Способ зависит от типа аутентификации:

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

  Учетной записи AWS, связанной с этими учетными данными, необходима следующая политика IAM для чтения журналов CloudWatch:

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

  #### Настройте получатель CloudWatch

  Создайте файл `otel-collector-config.yaml` с конфигурацией ресивера CloudWatch.

  **Пример 1: Именованные группы логов (рекомендуется)**

  Эта конфигурация собирает логи из конкретных именованных групп логов:

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

  **Пример 2: Автообнаружение групп журналов с префиксом**

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

  * `region`: регион AWS, в котором находятся ваши группы логов
  * `poll_interval`: Как часто проверять наличие новых логов (например, `1m`, `5m`)
  * `max_events_per_request`: Максимальное количество записей журнала, извлекаемых за один запрос
  * `groups.autodiscover.limit`: Максимальное количество групп журналов для автоматического обнаружения
  * `groups.autodiscover.prefix`: Фильтрует группы логов по префиксу
  * `groups.named`: Явно укажите имена групп журналов, которые нужно собирать

  Дополнительные параметры конфигурации см. в [документации по приёмнику CloudWatch](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver).

  **Замените следующие значения:**

  * `${CLICKSTACK_API_KEY}` → Использует переменную окружения, которую вы настроили ранее
  * `http://localhost:4318` → конечная точка ClickStack (используйте хост ClickStack при удалённом развёртывании)
  * `us-east-1` → Ваш регион в AWS
  * Имена/префиксы групп журналов → ваши конкретные группы журналов CloudWatch

  :::note
  Приёмник CloudWatch извлекает логи только из недавних временных окон (на основе `poll_interval`). При первом запуске он начинает работу с текущего времени. Исторические логи по умолчанию не извлекаются.
  :::

  #### Запустите коллектор

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

  1. Откройте HyperDX по адресу http://localhost:8080 (или по URL-адресу ClickStack)
  2. Перейдите к представлению **Logs**
  3. Подождите 1–2 минуты, пока не появятся логи (задержка зависит от интервала опроса)
  4. Поиск логов в ваших группах журналов CloudWatch

  <Image img={log_search_view} alt="Режим поиска логов" />

  Найдите в логах следующие ключевые атрибуты:

  * `ResourceAttributes['aws.region']`: Ваш регион AWS (например, &quot;us-east-1&quot;)
  * `ResourceAttributes['cloudwatch.log.group.name']`: Название группы журналов CloudWatch
  * `ResourceAttributes['cloudwatch.log.stream']`: имя потока логов
  * `Body`: Непосредственное содержимое сообщения лога

  <Image img={error_log_column_values} alt="Значения столбцов журнала ошибок" />
</VerticalStepper>

## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию с CloudWatch logs до настройки своей продуктивной AWS-среды, мы предоставляем демонстрационный набор данных с предварительно сгенерированными логами, отражающими реалистичные паттерны работы нескольких сервисов AWS.

<VerticalStepper headerLevel="h4">

#### Скачайте демонстрационный набор данных \{#download-sample\}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/aws/cloudwatch/cloudwatch-logs.jsonl
```

Набор данных включает 24 часа логов CloudWatch от нескольких сервисов:
- **Lambda-функции**: обработка платежей, управление заказами, аутентификация
- **Сервисы ECS**: шлюз API с ограничением частоты запросов и тайм-аутами
- **Фоновые задания**: пакетная обработка с шаблонами повторных попыток

#### Запуск ClickStack \{#start-clickstack\}

Если ClickStack у вас еще не запущен:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Дождитесь полного запуска ClickStack.

#### Импорт демонстрационного набора данных \{#import-demo-data\}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_logs FORMAT JSONEachRow
" < cloudwatch-logs.jsonl
```

Эта команда импортирует логи непосредственно в таблицу логов ClickStack.

#### Проверка демонстрационных данных \{#verify-demo-logs\}

После импорта:

1. Откройте HyperDX по адресу http://localhost:8080 и войдите в систему (при необходимости создайте учетную запись)
2. Перейдите в представление **Logs**
3. Установите диапазон времени **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**
4. Выполните поиск по `cloudwatch-demo` или отфильтруйте по `LogAttributes['source'] = 'cloudwatch-demo'`

Вы должны увидеть логи из нескольких групп логов CloudWatch.

<Image img={demo_search_view} alt="Результаты поиска в демонстрационном примере"/>

:::note[Отображение часового пояса]
HyperDX отображает метки времени в часовом поясе, настроенном в вашем браузере. Демонстрационные данные охватывают период **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**. Установите диапазон времени **2025-12-06 00:00:00 - 2025-12-09 00:00:00**, чтобы гарантированно увидеть демонстрационные логи независимо от вашего местоположения. После того как вы увидите логи, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

</VerticalStepper>

## Дашборды и визуализация \{#dashboards\}

Чтобы помочь вам отслеживать логи CloudWatch с помощью ClickStack, мы предоставляем преднастроенный дашборд с основными визуализациями.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда \{#download\}

#### Импортируйте дашборд \{#import-dashboard\}

1. Откройте HyperDX и перейдите в раздел Dashboards
2. Нажмите **Import Dashboard** в правом верхнем углу под иконкой с многоточием

<Image img={import_dashboard} alt="Кнопка импорта дашборда"/>

3. Загрузите файл `cloudwatch-logs-dashboard.json` и нажмите **Finish Import**

<Image img={finish_import} alt="Диалог завершения импорта"/>

#### Просмотрите дашборд \{#created-dashboard\}

Дашборд будет создан со всеми предварительно настроенными визуализациями:

<Image img={example_dashboard} alt="Дашборд CloudWatch Logs"/>

:::note
Для демонстрационного набора данных установите диапазон времени **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** (при необходимости скорректируйте в соответствии с вашим часовым поясом). В импортированном дашборде по умолчанию не будет задан диапазон времени.
:::

</VerticalStepper>

## Устранение неполадок {#troubleshooting}

### В HyperDX не отображаются логи

**Убедитесь, что учетные данные AWS настроены:**

```bash
aws sts get-caller-identity
```

Если это не выполняется, ваши учётные данные недействительны или истекли.

**Проверьте разрешения IAM:**
Убедитесь, что ваши учётные данные AWS имеют необходимые разрешения `logs:DescribeLogGroups` и `logs:FilterLogEvents`.

**Проверьте логи коллектора на наличие ошибок:**

```bash
# If using Docker directly, logs appear in stdout
# If using Docker Compose:
docker compose logs otel-collector
```

Распространённые ошибки:

* `The security token included in the request is invalid`: учётные данные недействительны или истекли. Для временных учётных данных (SSO) убедитесь, что задан `AWS_SESSION_TOKEN`.
* `operation error CloudWatch Logs: FilterLogEvents, AccessDeniedException`: недостаточно прав IAM
* `failed to refresh cached credentials, no EC2 IMDS role found`: переменные окружения с учётными данными AWS не заданы
* `connection refused`: конечная точка ClickStack недоступна

**Проверьте, что группы журналов CloudWatch существуют и содержат недавние записи:**

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

**По умолчанию приёмник CloudWatch начинает с «текущего момента»:**

Когда коллектор запускается впервые, он создаёт контрольную точку на текущем моменте времени и получает только логи, появившиеся после этого. Исторические логи не извлекаются.

**Чтобы собрать недавние исторические логи:**

Остановите коллектор, удалите его контрольную точку, затем запустите его снова:

```bash
# Stop the collector
docker stop <container-id>

# Restart fresh (checkpoints are stored in container, so removing it resets)
docker run --rm ...
```

Приёмник создаст новую контрольную точку и начнёт считывать логи с текущего момента.


### Недействительный токен безопасности / срок действия учетных данных истёк

Если вы используете временные учетные данные (AWS SSO, назначенная роль), они перестают быть действительными через определённое время.

**Снова экспортируйте новые учетные данные:**

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


### Высокая задержка или отсутствие последних логов

**Уменьшите интервал опроса:**
Значение `poll_interval` по умолчанию — 1 минута. Для более оперативного получения логов уменьшите это значение:

```yaml
logs:
  poll_interval: 30s  # Poll every 30 seconds
```

**Примечание:** уменьшение интервалов опроса увеличивает количество вызовов AWS API и может привести к более высоким расходам на CloudWatch API.


### Сборщик потребляет слишком много памяти

**Уменьшите размер пакета или увеличьте таймаут:**

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 100
```

**Ограничьте автообнаружение:**

```yaml
groups:
  autodiscover:
    limit: 50  # Reduce from 100 to 50
```


## Следующие шаги {#next-steps}

Теперь, когда журналы CloudWatch поступают в ClickStack:

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для критических событий (сбоев подключений, всплесков ошибок)
- Снизьте затраты на CloudWatch, скорректировав периоды хранения или настроив архивирование в S3, раз вы уже получаете журналы в ClickStack
- Отфильтруйте «шумные» группы журналов, исключив их из конфигурации коллектора, чтобы сократить объём ингестии

## Переход в продакшн {#going-to-production}

В этом руководстве показано, как запустить OpenTelemetry Collector локально с помощью Docker Compose для тестирования. Для продакшн-развертываний запускайте коллектор на инфраструктуре с доступом к AWS (EC2 с IAM-ролями, EKS с IRSA или ECS с ролями задач), чтобы исключить необходимость управления ключами доступа. Разворачивайте коллекторы в том же регионе AWS, что и ваши группы логов CloudWatch, чтобы снизить задержки и затраты.

См. раздел [Приём данных с помощью OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) для примеров продакшн-паттернов развертывания и конфигурации коллектора.