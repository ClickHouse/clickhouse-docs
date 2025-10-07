---
'slug': '/use-cases/observability/clickstack/sdks/aws_lambda'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 6
'description': 'AWS Lambda для ClickStack - Стек мониторинга ClickHouse'
'title': 'AWS Lambda'
'doc_type': 'guide'
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**Этот руководство интегрирует:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>

## Установка слоев OpenTelemetry Lambda {#installing-the-otel-lambda-layers}

Проект OpenTelemetry предоставляет отдельные слои lambda для:

1. Автоматического инструментирования кода вашей Lambda функции с помощью авто-инструментирования OpenTelemetry.
2. Пересылки собранных логов, метрик и трейсов в ClickStack.

### Добавление слоя авто-инструментирования для конкретного языка {#adding-language-specific-auto-instrumentation}

Слои авто-инструментирования для конкретного языка автоматически инструментируют код вашей Lambda функции с помощью пакета авто-инструментирования OpenTelemetry для вашего конкретного языка.

Каждый язык и регион имеют свой собственный ARN слоя.

Если ваша Lambda уже инструментирована с использованием SDK OpenTelemetry, вы можете пропустить этот шаг.

**Чтобы начать**:

1. В разделе Слои нажмите "Добавить слой"
2. Выберите указать ARN и выберите правильный ARN в зависимости от языка, убедитесь, что вы заменили `<region>` на ваш регион (например, `us-east-2`):

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

_Последние версии слоев можно найти в [репозитории OpenTelemetry Lambda Layers на GitHub](https://github.com/open-telemetry/opentelemetry-lambda/releases)._

3. Настройте следующие переменные окружения в вашей Lambda функции в разделе "Конфигурация" > "Переменные окружения".

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

### Установка слоя коллектора OpenTelemetry Lambda {#installing-the-otel-collector-layer}

Слой коллектора Lambda позволяет пересылать логи, метрики и трейсы из вашей Lambda функции в ClickStack без воздействия на время отклика из-за задержки экспортера.

**Чтобы установить слой коллектора**:

1. В разделе Слои нажмите "Добавить слой"
2. Выберите указать ARN и выберите правильный ARN в зависимости от архитектуры, убедитесь, что вы заменили `<region>` на ваш регион (например, `us-east-2`):

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

3. Добавьте следующий файл `collector.yaml` в ваш проект, чтобы настроить коллектор для отправки в ClickStack:

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

После развертывания слоев вы должны увидеть трейс, автоматически собранный из вашей Lambda функции в HyperDX. Процессоры `decouple` и `batching` могут вводить задержку в сбор телеметрии, поэтому трейсы могут отображаться с задержкой. Чтобы эмитировать пользовательские логи или метрики, вам нужно инструментировать ваш код с помощью специфичных для языка SDK OpenTelemetry.

## Устранение неполадок {#troubleshoting}

### Пользовательское инструментирование не отправляется {#custom-instrumentation-not-sending}

Если вы не видите ваши вручную определенные трейсы или другие телеметрические данные, возможно, вы используете несовместимую версию пакета OpenTelemetry API. Убедитесь, что ваш пакет OpenTelemetry API не выше версии, включенной в AWS lambda.

### Включение отладочных логов SDK {#enabling-sdk-debug-logs}

Установите переменную окружения `OTEL_LOG_LEVEL` в `DEBUG`, чтобы включить отладочные логи из SDK OpenTelemetry. Это поможет убедиться, что слой авто-инструментирования правильно инструментирует ваше приложение.

### Включение отладочных логов коллектора {#enabling-collector-debug-logs}

Для отладки проблем с коллектором вы можете включить отладочные логи, изменив файл конфигурации вашего коллектора, добавив экспортёр `logging` и установив уровень логирования телеметрии на `debug`, чтобы включить более подробную запись логов из слоя коллектора lambda.

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