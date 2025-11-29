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

**В этом руководстве настраивается интеграция:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>


## Установка Lambda-слоёв OpenTelemetry {#installing-the-otel-lambda-layers}

Проект OpenTelemetry предоставляет отдельные Lambda-слои для следующего:

1. Автоматической инструментализации кода вашей Lambda-функции с помощью автоинструментирования OpenTelemetry.
2. Пересылки собранных логов, метрик и трейсов в ClickStack.

### Добавление языкового слоя автоинструментации {#adding-language-specific-auto-instrumentation}

Специализированные для конкретного языка слои Lambda для автоинструментации автоматически инструментируют код вашей функции Lambda с помощью пакета автоинструментации OpenTelemetry для выбранного языка. 

Для каждого языка и региона используется собственный ARN слоя.

Если ваша функция Lambda уже инструментирована с помощью OpenTelemetry SDK, вы можете пропустить этот шаг.

**Для начала выполните следующее**:

1. В разделе Layers нажмите «Add a layer».
2. Выберите вариант «Specify an ARN» и укажите корректный ARN в зависимости от языка, при этом замените `<region>` на ваш регион (например, `us-east-2`):

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

3. Настройте следующие переменные окружения в вашей функции Lambda в разделе «Configuration» > «Environment variables».

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

### Установка Lambda-слоя коллектора OpenTelemetry {#installing-the-otel-collector-layer}

Lambda-слой коллектора позволяет пересылать логи, метрики и трейсы из вашей Lambda-функции в ClickStack без влияния на время отклика из-за задержек экспортера.

**Чтобы установить слой коллектора**:

1. В разделе Layers нажмите «Add a layer».
2. Выберите вариант Specify an ARN и укажите правильный ARN в зависимости от архитектуры, не забудьте заменить `<region>` на ваш регион (например, `us-east-2`):

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

3. Добавьте следующий файл `collector.yaml` в ваш проект, чтобы настроить коллектор на отправку данных в ClickStack:

```yaml
# collector.yaml {#collectoryaml}
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

4. Добавьте следующую переменную среды:

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```


## Проверка установки {#checking-the-installation}

После развертывания слоёв вы должны увидеть трассировки, автоматически
собираемые из вашей Lambda-функции в HyperDX. Процессоры `decouple` и `batching` 
могут вносить задержку в сбор телеметрии, поэтому появление трассировок 
в интерфейсе может происходить с задержкой. Чтобы отправлять пользовательские логи или метрики, вам нужно инструментировать ваш код с помощью языковых SDKS OpenTelemetry.

## Диагностика и устранение неполадок {#troubleshoting}

### Пользовательское инструментирование не отправляет данные {#custom-instrumentation-not-sending}

Если вы не видите свои вручную определённые трассировки или другую телеметрию,
возможно, вы используете несовместимую версию пакета OpenTelemetry API. Убедитесь,
что версия вашего пакета OpenTelemetry API совпадает с версией, включённой
в AWS Lambda, или ниже неё.

### Включение отладочных логов SDK {#enabling-sdk-debug-logs}

Установите переменную окружения `OTEL_LOG_LEVEL` в значение `DEBUG`, чтобы включить отладочное логирование
SDK OpenTelemetry. Это поможет убедиться, что слой автоинструментирования
корректно выполняет инструментирование вашего приложения.

### Включение отладочных логов коллектора {#enabling-collector-debug-logs}

Чтобы отладить проблемы с коллектором, вы можете включить отладочные логи, изменив конфигурационный файл коллектора, добавив экспортер `logging` и установив уровень логирования телеметрии в `debug`, чтобы включить более подробное логирование в Lambda-слое коллектора.

```yaml
# collector.yaml {#collectoryaml}
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
