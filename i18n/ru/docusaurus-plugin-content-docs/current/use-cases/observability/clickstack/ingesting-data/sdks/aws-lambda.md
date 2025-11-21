---
slug: /use-cases/observability/clickstack/sdks/aws_lambda
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'AWS Lambda для ClickStack — стек наблюдаемости ClickHouse'
title: 'AWS Lambda'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'aws-lambda', 'lambda-layers']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**В этом руководстве рассматривается интеграция со следующим:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>


## Установка слоев Lambda для OpenTelemetry {#installing-the-otel-lambda-layers}

Проект OpenTelemetry предоставляет отдельные слои Lambda для:

1. Автоматического инструментирования кода функции Lambda с помощью автоинструментирования OpenTelemetry.
2. Пересылки собранных журналов, метрик и трассировок в ClickStack.

### Добавление слоя автоинструментирования для конкретного языка {#adding-language-specific-auto-instrumentation}

Слои Lambda для автоинструментирования конкретного языка автоматически инструментируют код функции Lambda с помощью пакета автоинструментирования OpenTelemetry для соответствующего языка.

Каждый язык и регион имеет собственный ARN слоя.

Если функция Lambda уже инструментирована с помощью SDK OpenTelemetry, этот шаг можно пропустить.

**Для начала работы**:

1. В разделе Layers нажмите «Add a layer»
2. Выберите specify an ARN и укажите правильный ARN в зависимости от языка, заменив `<region>` на ваш регион (например, `us-east-2`):

<Tabs groupId="install-language-options">
<TabItem value="javascript" label="Javascript" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-nodejs-0_7_0:1
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-python-0_7_0:1
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-javaagent-0_6_0:1
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-ruby-0_1_0:1
```

</TabItem>

</Tabs>

_Последние версии слоев можно найти в [репозитории GitHub OpenTelemetry Lambda Layers](https://github.com/open-telemetry/opentelemetry-lambda/releases)._

3. Настройте следующие переменные окружения в функции Lambda в разделе «Configuration» > «Environment variables».

<Tabs groupId="install-language-env">
<TabItem value="javascript" label="Javascript" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

</Tabs>

### Установка слоя Lambda для коллектора OpenTelemetry {#installing-the-otel-collector-layer}

Слой Lambda для коллектора позволяет пересылать журналы, метрики и трассировки из функции Lambda в ClickStack без влияния на время отклика из-за задержки экспортера.

**Для установки слоя коллектора**:

1. В разделе Layers нажмите «Add a layer»
2. Выберите specify an ARN и укажите правильный ARN в зависимости от архитектуры, заменив `<region>` на ваш регион (например, `us-east-2`):

<Tabs groupId="install-language-layer">

<TabItem value="x86_64" label="x86_64" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-amd64-0_8_0:1
```

</TabItem>

<TabItem value="arm64" label="arm64" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-arm64-0_8_0:1
```


</TabItem>

</Tabs>

3. Добавьте в проект следующий файл `collector.yaml` для настройки коллектора на отправку данных в ClickStack:


```yaml
# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

processors:
  batch:
  decouple:

exporters:
  otlphttp:
    endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
```

4. Добавьте следующую переменную окружения:

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```


## Проверка установки {#checking-the-installation}

После развертывания слоев трассировки из вашей Lambda-функции должны автоматически собираться в HyperDX. Процессоры `decouple` и `batching` могут вносить задержку в сбор телеметрии, поэтому трассировки могут отображаться с задержкой. Для отправки пользовательских логов или метрик необходимо инструментировать код с помощью OpenTelemetry SDK для соответствующего языка программирования.


## Устранение неполадок {#troubleshoting}

### Пользовательская инструментация не отправляется {#custom-instrumentation-not-sending}

Если вы не видите вручную определённые трассировки или другие данные телеметрии, возможно,
вы используете несовместимую версию пакета OpenTelemetry API. Убедитесь, что версия вашего
пакета OpenTelemetry API не превышает версию, включённую в AWS Lambda.

### Включение отладочных логов SDK {#enabling-sdk-debug-logs}

Установите переменную окружения `OTEL_LOG_LEVEL` в значение `DEBUG`, чтобы включить отладочные логи
OpenTelemetry SDK. Это поможет убедиться, что слой автоматической инструментации
корректно инструментирует ваше приложение.

### Включение отладочных логов коллектора {#enabling-collector-debug-logs}

Для отладки проблем коллектора можно включить отладочные логи, изменив файл
конфигурации коллектора: добавьте экспортер `logging` и установите уровень логирования
телеметрии в `debug`, чтобы включить более подробное логирование из слоя Lambda коллектора.


```yaml
# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
    verbosity: detailed
  otlphttp:
    endpoint: "https://in-otel.hyperdx.io"
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  telemetry:
    logs:
      level: "debug"
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
```
