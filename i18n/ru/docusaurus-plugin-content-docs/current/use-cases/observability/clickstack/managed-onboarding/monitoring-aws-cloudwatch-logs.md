---
slug: /use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs
title: 'Мониторинг журналов AWS CloudWatch с помощью Управляемого ClickStack'
description: 'Пересылайте журналы AWS CloudWatch в Управляемый ClickStack с помощью приёмника CloudWatch OpenTelemetry'
doc_type: 'guide'
keywords: ['clickstack', 'aws', 'cloudwatch', 'журналы', 'управляемый', 'обсервабилити', 'otel']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view-clickstack.png';
import log_search_attributes_view from '@site/static/images/clickstack/cloudwatch/log-search-attributes-clickstack.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values-clickstack.png';
import import_dashboard from '@site/static/images/clickstack/clickstack-import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-clickstack-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';

В этом руководстве показано, как пересылать журналы AWS CloudWatch в Управляемый ClickStack с помощью OpenTelemetry [`awscloudwatch` приёмника](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver), а затем просматривать их в интерфейсе ClickStack.

Мы запустим отдельный коллектор, который опрашивает CloudWatch через AWS API и пересылает события в ваш коллектор ClickStack по OTLP. Держите этот коллектор в той же учётной записи AWS и том же регионе, что и группы логов, чтобы минимизировать задержки API и затраты.

В этом руководстве предполагается, что вы уже выполнили шаги из [Настройка вашего OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) и что у вас уже запущен коллектор ClickStack.

Коллектор ClickStack можно развернуть либо как **контейнер Docker** (см. [Настройка вашего OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)), либо как **релиз Helm** в Kubernetes через Helm-чарт OpenTelemetry с образом коллектора ClickStack (см. [Развёртывание коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector)). **Убедитесь, что вы сохранили его конечную точку OTLP** и `OTLP_AUTH_TOKEN`, который вы задали при развёртывании.

<VerticalStepper headerLevel="h2">
  ## Подготовьте необходимые компоненты \{#gather-prerequisites\}

  Вам потребуется:

  * **Аккаунт AWS** с одной или несколькими группами логов CloudWatch и учетными данными, которым предоставлены указанные ниже разрешения IAM.
  * Хост с установленным **Docker**, доступом к AWS API и исходящим сетевым доступом к коллектору ClickStack. Обычно это инстанс EC2 в той же учётной записи AWS и том же регионе, что и группы логов.
  * **Конечная точка OTLP** вашего коллектора ClickStack, доступная с данного хоста. Если коллектор запущен в Docker на той же машине, используйте `http://host.docker.internal:4318` (см. примечание в разделе [Настройка приёмника CloudWatch](#configure-receiver)). Для удалённого коллектора используйте его полный URL, например `https://otel.example.com:4318`.
  * Значение `OTLP_AUTH_TOKEN`, которое вы указали в коллекторе ClickStack. Если вы не настроили для него защиту, можете убрать заголовок `authorization` из приведённой ниже конфигурации.

  ## Настройка учётных данных AWS \{#configure-aws\}

  Приёмник считывает учётные данные AWS из стандартных переменных окружения. Задайте их на хосте, на котором будет запущен коллектор.

  **Для пользователей AWS SSO:**

  ```shell
  aws sso login --profile YOUR_PROFILE_NAME
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)
  aws sts get-caller-identity
  ```

  **Для пользователей IAM с долгосрочными учётными данными:**

  ```shell
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"
  aws sts get-caller-identity
  ```

  Учётным данным необходима следующая политика IAM для чтения журналов CloudWatch:

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

  Замените `YOUR_ACCOUNT_ID` на идентификатор вашей учётной записи AWS.

  :::note Учётные данные для продакшена
  Для продакшена рекомендуется использовать учётные данные, привязанные к экземпляру, вместо долгосрочных ключей: роль IAM на EC2, IRSA на EKS или роль задачи на ECS. Приведённая ниже конфигурация коллектора работает без переменных окружения с учётными данными, если приёмник может получить их из сервиса метаданных экземпляра.
  :::

  ## Настройка приёмника CloudWatch \{#configure-receiver\}

  Экспортируйте конечную точку коллектора ClickStack и токен аутентификации, затем создайте файл `otel-collector-config.yaml`.

  :::note Настройка на одном хосте
  В приведённом ниже примере предполагается, что коллектор ClickStack и данный коллектор CloudWatch работают на одном хосте, поэтому приёмник подключается к нему через `host.docker.internal` (адрес хоста Docker изнутри контейнера). Если ваш коллектор ClickStack находится в другом месте (сервис внутри кластера, публичный URL, частный IP-адрес), подставьте его адрес в `OTEL_COLLECTOR_ENDPOINT` ниже.
  :::

  ```shell
  export OTEL_COLLECTOR_ENDPOINT="http://host.docker.internal:4318"
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  ```

  <details>
    <summary>Посмотрите, какие группы логов доступны в вашей учетной записи</summary>

    Перед изменением конфигурации выведите список групп логов в вашем регионе, чтобы выбрать реальные названия (и убедиться, что регион указан правильно):

    ```shell
    aws logs describe-log-groups --region eu-central-1 \
      --query 'logGroups[].logGroupName' --output table
    ```

    Пример вывода:

    ```text
    -------------------------------
    |      DescribeLogGroups      |
    +-----------------------------+
    |  /aws-glue/jobs/error       |
    |  /aws-glue/jobs/logs-v2     |
    |  /aws-glue/jobs/output      |
    |  /aws-glue/sessions/error   |
    |  /aws-glue/sessions/output  |
    +-----------------------------+
    ```

    Используйте имена из этого списка непосредственно в блоке `groups.named` в Примере 1 ниже. Для указанного выше аккаунта раздел named-groups будет выглядеть так:

    ```yaml
    groups:
      named:
        /aws-glue/jobs/error:
        /aws-glue/jobs/logs-v2:
        /aws-glue/jobs/output:
        /aws-glue/sessions/error:
        /aws-glue/sessions/output:
    ```

    Либо, если у нужных вам групп общий префикс (здесь `/aws-glue/`), используйте Пример 2 с `prefix: /aws-glue/` вместо того, чтобы перечислять их по одной.
  </details>

  **Пример 1: Именованные группы логов (рекомендуется)**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws-glue/jobs/error:
            /aws-glue/jobs/output:
            /aws-glue/sessions/error:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  **Пример 2: Автообнаружение групп логов по префиксу**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws-glue/

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  Основные параметры для настройки:

  * `region`, чтобы он соответствовал региону, где находятся ваши группы логов.
  * `poll_interval` (по умолчанию `1m`). Меньшие значения позволяют получать журналы почти в реальном времени за счёт большего числа вызовов API AWS.
  * `groups.named` для явного списка или `groups.autodiscover.prefix`, чтобы выбрать все группы, соответствующие префиксу.

  Полный перечень параметров см. в [документации по приёмнику CloudWatch](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver).

  :::note Только актуальные журналы
  При первом запуске приёмник устанавливает контрольную точку на текущий момент времени и получает журналы только начиная с этой точки. Исторические журналы не подлежат дозагрузке.
  :::

  ## Запуск коллектора с приёмником \{#start-collector\}

  Создайте файл `docker-compose.yaml` рядом с `otel-collector-config.yaml`. Запись `extra_hosts` позволяет контейнеру обращаться к коллектору ClickStack, запущенному на том же хосте, через `host.docker.internal`; монтирование bind-тома в расширенном формате явно выдаёт ошибку при отсутствии файла конфигурации, вместо того чтобы молча создавать пустой каталог:

  ```shell
  cat > docker-compose.yaml <<'EOF'
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - type: bind
          source: ./otel-collector-config.yaml
          target: /etc/otel-config.yaml
          read_only: true
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - OTEL_COLLECTOR_ENDPOINT
        - OTLP_AUTH_TOKEN
      extra_hosts:
        - "host.docker.internal:host-gateway"
      restart: unless-stopped
  EOF
  ```

  Запустите collector:

  ```shell
  docker compose up -d
  ```

  Отслеживайте его журналы в реальном времени, чтобы убедиться, что он опрашивает CloudWatch и экспортирует данные в ваш ClickStack collector:

  ```shell
  docker compose logs -f otel-collector
  ```

  ## Подтверждение в интерфейсе ClickStack \{#confirm-in-ui\}

  Откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud) и выберите **ClickStack** в левом меню.

  <Image img={clickstack_cloud} size="lg" alt="Запустите ClickStack" border />

  В представлении **Search** переключите источник на `Logs` и задайте временной диапазон **Last 15 minutes**. События CloudWatch должны появиться через несколько интервалов опроса.

  <Image img={log_search_view} size="lg" alt="Представление Search в ClickStack с журналами CloudWatch" />

  Каждое событие содержит группу источника и поток в качестве атрибутов ресурса:

  * `ResourceAttributes['aws.region']`: регион AWS (например, `eu-central-1`)
  * `ResourceAttributes['cloudwatch.log.group.name']`: исходная группа логов
  * `ResourceAttributes['cloudwatch.log.stream']`: исходный поток логов
  * `Body`: исходная строка лога

  Измените поисковый запрос на `Timestamp, SeverityText as level, ResourceAttributes['aws.region'], ResourceAttributes['cloudwatch.log.group.name'], ResourceAttributes['cloudwatch.log.stream'], Body`, чтобы включить следующие атрибуты:

  <Image img={log_search_attributes_view} size="lg" alt="Представление Search в ClickStack с журналами CloudWatch и атрибутами" />

  Выберите запись в журнале для просмотра её метаданных:

  <Image img={error_log_column_values} size="lg" alt="Атрибуты CloudWatch в представлении сведений о логе" />

  Если ничего не отображается:

  * Выполните `aws sts get-caller-identity` на хосте коллектора, чтобы убедиться, что учётные данные действительны.
  * Следите за логами collector с помощью `docker compose logs -f otel-collector` и обращайте внимание на `AccessDeniedException` (IAM), ошибки `security token` (истекли учётные данные SSO), `ResourceNotFoundException` (опечатка в имени группы журналов или неверный регион) или `connection refused` (конечная точка collector ClickStack недоступна изнутри контейнера; см. примечание о `host.docker.internal` в разделе [Настройка приёмника CloudWatch](#configure-receiver)).
  * Убедитесь, что `OTEL_COLLECTOR_ENDPOINT` доступен изнутри контейнера: `docker compose exec otel-collector wget -qO- ${OTEL_COLLECTOR_ENDPOINT}/v1/logs -S 2>&1 | head -5`.
  * Убедитесь, что `OTLP_AUTH_TOKEN` соответствует значению, заданному в коллекторе ClickStack.

  ## Импорт панели мониторинга CloudWatch (необязательно) \{#import-dashboard\}

  Преднастроенный дашборд с объёмом логов, разбивкой по уровням серьёзности и распределением ошибок доступен для скачивания.

  <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">Скачайте `cloudwatch-logs-dashboard.json`</TrackedLink>, затем в интерфейсе ClickStack перейдите в раздел **Dashboards** и нажмите **Import**.

  <Image img={import_dashboard} size="lg" alt="Кнопка импорта панели мониторинга" />

  Загрузите JSON‑файл и нажмите **Finish Import**.

  <Image img={finish_import} size="lg" alt="Диалог завершения импорта" />

  ## Дополнительные материалы \{#further-reading\}

  * [Справочник по интеграции AWS CloudWatch Logs](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) с информацией о демо-наборе данных, подробном устранении неполадок и параметрах настройки.
  * [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) с TLS на конечной точке OTLP и пользователями ингестии с минимально необходимыми привилегиями.
  * [Обработка, фильтрация и обогащение](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) событий в коллекторе.
  * [Переход в production](/use-cases/observability/clickstack/production) — рекомендации по выводу в production.
</VerticalStepper>