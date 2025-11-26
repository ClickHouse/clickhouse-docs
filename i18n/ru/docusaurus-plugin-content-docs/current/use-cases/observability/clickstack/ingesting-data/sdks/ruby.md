---
slug: /use-cases/observability/clickstack/sdks/ruby-on-rails
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Ruby on Rails SDK для ClickStack — ClickHouse Observability Stack'
title: 'Ruby on Rails'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

В этом руководстве рассматривается интеграция:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ Логи</td>
      <td className="pe-2">✖️ ️️Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>

_Чтобы отправлять логи в ClickStack, используйте [коллектор OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/otel-collector)._



## Начало работы

### Установка пакетов OpenTelemetry

Используйте следующую команду для установки пакета OpenTelemetry.

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### Настройка OpenTelemetry и форматтера логгера

Далее необходимо инициализировать инструментацию трассировки OpenTelemetry
и настроить форматтер сообщений логов для логгера Rails, чтобы логи могли
автоматически привязываться к трейсам. Без пользовательского форматтера логи не
будут автоматически коррелироваться между собой в ClickStack.

В папке `config/initializers` создайте файл с именем `hyperdx.rb` и добавьте в
него следующее:


```ruby
# config/initializers/hyperdx.rb

require 'opentelemetry-exporter-otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/sdk'

OpenTelemetry::SDK.configure do |c|
  c.use_all() # включает всю инструментацию трассировки
end

Rails.application.configure do
  Rails.logger = Logger.new(STDOUT)
  # Rails.logger.log_level = Logger::INFO # по умолчанию DEBUG, но в production может потребоваться INFO или выше
  Rails.logger.formatter = proc do |severity, time, progname, msg|
    span_id = OpenTelemetry::Trace.current_span.context.hex_span_id
    trace_id = OpenTelemetry::Trace.current_span.context.hex_trace_id
    if defined? OpenTelemetry::Trace.current_span.name
      operation = OpenTelemetry::Trace.current_span.name
    else
      operation = 'undefined'
    end

    { "time" => time, "level" => severity, "message" => msg, "trace_id" => trace_id, "span_id" => span_id,
      "operation" => operation }.to_json + "\n"
  end

  Rails.logger.info "Логгер инициализирован!! 🐱"
end
```

### Настройте переменные окружения

После этого потребуется настроить в своей оболочке следующие переменные окружения, чтобы отправлять телеметрию в ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

*Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса
в приложении HyperDX и может быть любым удобным вам именем.*

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит ключ API, доступный в приложении HyperDX в разделе `Team Settings → API Keys`.
