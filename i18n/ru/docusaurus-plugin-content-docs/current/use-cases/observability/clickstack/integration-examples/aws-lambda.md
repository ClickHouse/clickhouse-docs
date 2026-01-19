---
slug: /use-cases/observability/clickstack/integrations/aws-lambda
title: 'Мониторинг логов AWS Lambda в ClickStack с использованием Rotel'
sidebar_label: 'Логи AWS Lambda'
pagination_prev: null
pagination_next: null
description: 'Мониторинг логов AWS Lambda в ClickStack с использованием Rotel'
doc_type: 'guide'
keywords: ['AWS', 'Lambda', 'OTEL', 'ClickStack', 'logs', 'CloudWatch']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/lambda/lambda-log-view.png';
import log from '@site/static/images/clickstack/lambda/lambda-log.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Мониторинг логов AWS Lambda с ClickStack с использованием Rotel \{#lambda-clickstack\}

<CommunityMaintainedBadge/>

:::note[TL;DR]
В этом руководстве показано, как отслеживать функции AWS Lambda с помощью ClickStack, используя Rotel Lambda Extension для сбора и пересылки логов функций, логов расширения и данных OpenTelemetry напрямую в ClickHouse. Вы узнаете, как:

- Развернуть слой Rotel Lambda Extension для ваших функций Lambda
- Настроить расширение для экспорта логов и трейсов в ClickStack
- При необходимости отключить CloudWatch Logs для снижения затрат

Этот подход может значительно снизить ваши расходы на обсервабилити Lambda за счёт полного отказа от CloudWatch Logs.

Необходимое время: 5–10 минут
:::

## Интеграция с существующими функциями Lambda \{#existing-lambda\}

В этом разделе описывается настройка ваших существующих функций AWS Lambda для отправки логов и трассировок в ClickStack с помощью расширения Rotel Lambda Extension.

### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack
- Функции AWS Lambda для мониторинга
- AWS CLI, настроенный с соответствующими правами доступа
- Роль выполнения Lambda с правами на добавление слоёв

<VerticalStepper headerLevel="h4">
  #### Выберите подходящий слой расширения Rotel Lambda Extension

  [Расширение Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension) доступно в виде предварительно собранного слоя AWS Lambda. Выберите ARN слоя, который соответствует архитектуре вашей Lambda-функции:

  | Архитектура  | Шаблон ARN                                                                         | Актуальная версия                                                                                                                                                                    |
  | ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | x86-64/amd64 | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-amd64-alpha:{version}` | ![Последняя версия](https://img.shields.io/github/v/release/streamfold/rotel-lambda-extension?filter=*alpha\&label=version\&labelColor=%2338BDF8\&color=%23312E81\&cacheSeconds=600) |
  | arm64        | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-arm64-alpha:{version}` | ![Последняя версия](https://img.shields.io/github/v/release/streamfold/rotel-lambda-extension?filter=*alpha\&label=version\&labelColor=%2338BDF8\&color=%23312E81\&cacheSeconds=600) |

  **Доступные регионы:**

  * us-east-{1, 2}, us-west-{1, 2}
  * eu-central-1, eu-north-1, eu-west-{1, 2, 3}
  * ca-central-1
  * ap-southeast-{1, 2}, ap-northeast-{1, 2}
  * ap-south-1
  * sa-east-1

  #### Добавьте слой Rotel в вашу Lambda-функцию

  *В этих примерах замените `{arch}`, `{region}` и `{version}` соответствующими значениями, указанными выше.*

  ##### Вариант 1: Консоль AWS

  1. Откройте консоль Lambda в AWS
  2. Откройте свою функцию Lambda
  3. Прокрутите страницу до раздела **Layers** и нажмите **Add a layer**
  4. Выберите **Specify an ARN**
  5. Введите ARN слоя Rotel:
     ```text
     arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
     ```
  6. Нажмите **Add**

  ##### Вариант 2: AWS CLI

  ```bash
  aws lambda update-function-configuration \
    --function-name my-function \
    --layers arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
  ```

  ##### Вариант 3: AWS SAM

  ```yaml
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function
      Properties:
        # ... other configuration ...
        Layers:
          - arn:aws:lambda:{version}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
  ```

  #### Настройте расширение для экспорта данных в ClickStack

  Расширение Rotel Lambda настраивается с помощью переменных окружения. Необходимо настроить конечную точку экспортера OTLP так, чтобы она указывала на ваш экземпляр ClickStack. В примерах предполагается, что ваша функция AWS Lambda имеет доступ к экземпляру ClickStack.

  ##### Базовая конфигурация (переменные среды)

  Добавьте следующие переменные окружения в вашу Lambda-функцию:

  ```bash
  # Required: ClickStack OTLP endpoint
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317

  # Optional: Authentication headers
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"

  # Optional: Service name (defaults to Lambda function name)
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,service.version=1.0.0"
  ```

  ##### Расширенная конфигурация (через файл .env)

  Для более сложных конфигураций создайте файл `rotel.env` в пакете Lambda-функции:

  **rotel.env:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,deployment.environment=production"
  ```

  Затем задайте переменную окружения, указывающую на этот файл:

  ```bash
  ROTEL_ENV_FILE=/var/task/rotel.env
  ```

  ##### Использование AWS Secrets Manager или AWS Systems Manager Parameter Store

  Для производственных развертываний храните конфиденциальные данные, такие как API-ключи, в AWS Secrets Manager или Parameter Store:

  **Пример использования AWS Secrets Manager:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-abc123}"
  ```

  **Пример хранилища параметров AWS (AWS Parameter Store):**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key}"
  ```

  **Требуемые разрешения IAM:**

  Добавьте эти разрешения в роль выполнения Lambda:

  Для Secrets Manager:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue",
          "secretsmanager:BatchGetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-*"
      }
    ]
  }
  ```

  Для Parameter Store:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ssm:GetParameters"
        ],
        "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key"
      }
    ]
  }
  ```

  :::note
  Вызовы AWS API для получения секретов добавляют 100-150 мс к задержке холодного старта. Секреты извлекаются пакетами (до 10) и только при инициализации, поэтому последующие вызовы не подвержены влиянию.
  :::

  #### Тестирование интеграции

  Вызовите Lambda-функцию, чтобы убедиться, что логи отправляются в ClickStack:

  ```bash
  aws lambda invoke \
    --function-name my-function \
    --payload '{"test": "data"}' \
    response.json
  ```

  Проверьте журналы Lambda на наличие ошибок:

  ```bash
  aws logs tail /aws/lambda/my-function --follow
  ```

  #### Проверьте логи в HyperDX

  После настройки войдите в HyperDX (UI ClickStack) и убедитесь, что логи поступают:

  <Image img={log_view} alt="Просмотр журналов Lambda" />

  <Image img={log} alt="Подробная информация о журнале Lambda" />

  Найдите следующие ключевые атрибуты в логах:

  * `service.name`: имя вашей функции Lambda
  * `faas.name`: имя функции AWS Lambda
  * `faas.invocation_id`: Уникальный идентификатор вызова функции
  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;lambda&quot;
</VerticalStepper>

## Отключение CloudWatch Logs (оптимизация затрат) {#disable-cloudwatch}

По умолчанию AWS Lambda отправляет все логи в CloudWatch Logs, что может быть дорого при масштабном использовании. После того как вы проверили, что логи поступают в ClickStack, вы можете отключить логирование в CloudWatch, чтобы снизить затраты.

<VerticalStepper headerLevel="h4">

#### Удаление прав CloudWatch из роли выполнения \{#remove-permissions\}

1. Откройте AWS Console и перейдите в **AWS Lambda**
2. Перейдите к своей функции Lambda
3. Выберите **Configuration** → **Permissions**
4. Нажмите на имя роли выполнения, чтобы открыть консоль IAM
5. Отредактируйте роль и удалите все действия `logs:*`:
   - Если используется пользовательская политика, отредактируйте её, чтобы удалить `logs:CreateLogGroup`, `logs:CreateLogStream` и `logs:PutLogEvents`
   - Если используется управляемая политика AWS `AWSLambdaBasicExecutionRole`, удалите её из роли
6. Сохраните роль

#### Проверка отключения логирования в CloudWatch {#verify-disabled}

Вызовите функцию ещё раз и убедитесь, что:
1. Новые потоки логов CloudWatch не создаются
2. Логи продолжают отображаться в ClickStack/HyperDX

```bash
# После изменения политики здесь не должно появляться новых потоков логов
aws logs describe-log-streams \
  --log-group-name /aws/lambda/my-function \
  --order-by LastEventTime \
  --descending \
  --max-items 5
```

</VerticalStepper>

## Добавление автоинструментирования OpenTelemetry {#auto-instrumentation}

Расширение Rotel Lambda Extension без дополнительной настройки работает со слоями автоинструментирования OpenTelemetry для сбора распределённых трейсов и метрик в дополнение к логам.

<VerticalStepper headerLevel="h4">

#### Выберите слой автоинструментирования для вашего языка {#choose-instrumentation}

AWS предоставляет слои автоинструментирования OpenTelemetry для нескольких языков:

| Язык | Шаблон ARN слоя |
|----------|-------------------|
| Node.js  | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-{version}` |
| Python   | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-python-{arch}-ver-{version}` |
| Java     | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-java-agent-{arch}-ver-{version}` |

Найдите последние версии в [репозитории AWS OpenTelemetry Lambda](https://github.com/aws-observability/aws-otel-lambda).

#### Добавьте оба слоя в вашу функцию \{#add-both-layers\}

Добавьте **оба** слоя: слой расширения Rotel и слой автоинструментирования:

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers \
    arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version} \
    arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-1-30-2:1
```

#### Настройте автоинструментирование {#configure-instrumentation}

Установите переменную окружения `AWS_LAMBDA_EXEC_WRAPPER`, чтобы включить автоинструментирование:

**Для Node.js:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

**Для Python:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
```

**Для Java:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

#### Проверьте трейсы в HyperDX {#verify-traces}

После вызова вашей функции:

1. Перейдите в раздел **Traces** в HyperDX
2. Вы должны увидеть трейсы со спанами из вашей функции Lambda
3. Трейсы будут скоррелированы с логами через атрибуты `trace_id` и `span_id`

</VerticalStepper>

## Примеры приложений {#examples}

Ознакомьтесь с примером приложения на Python, демонстрирующим Rotel Lambda Extension:

- **[Python + ClickHouse](https://github.com/streamfold/python-aws-lambda-clickhouse-example)**: приложение на Python с ручной инструментировкой OpenTelemetry, которое отправляет трейсы и логи напрямую в ClickHouse

## Присоединяйтесь к сообществу Rotel {#join-rotel-community}

Если у вас есть вопросы о Rotel, присоединяйтесь к [серверу Rotel в Discord](https://rotel.dev) и делитесь своими отзывами или вопросами. Ознакомьтесь с [Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension), чтобы предложить улучшения.

## Дополнительные ресурсы {#resources}

- **[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)**: Исходный код и подробная документация
- **[Rotel Core](https://github.com/streamfold/rotel)**: Легковесная плоскость данных OTel, лежащая в основе расширения