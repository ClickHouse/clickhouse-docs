---
'slug': '/use-cases/observability/clickstack/sdks/ruby-on-rails'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'Ruby on Rails SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'Ruby on Rails'
'doc_type': 'guide'
---
Этот гид интегрирует:

<table>
  <tbody>
    <tr>
      <td className="pe-2">✖️ Логи</td>
      <td className="pe-2">✖️ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>

_Чтобы отправить логи в ClickStack, пожалуйста, отправляйте логи через [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)._

## Начало работы {#getting-started}

### Установка пакетов OpenTelemetry {#install-otel-packages}

Используйте следующую команду для установки пакета OpenTelemetry.

```shell
bundle add opentelemetry-sdk opentelemetry-instrumentation-all opentelemetry-exporter-otlp
```

### Настройка OpenTelemetry + форматировщика логов {#configure-otel-logger-formatter}

Далее вам нужно инициализировать инструментирование трассировки OpenTelemetry и настроить форматировщик сообщений логов для логгера Rails, чтобы логи могли быть автоматически связаны с трейсам. Без пользовательского форматировщика логи не будут автоматически коррелироваться друг с другом в ClickStack.

В папке `config/initializers` создайте файл с именем `hyperdx.rb` и добавьте в него следующее:

```ruby

# config/initializers/hyperdx.rb

require 'opentelemetry-exporter-otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/sdk'

OpenTelemetry::SDK.configure do |c|
  c.use_all() # enables all trace instrumentation!
end

Rails.application.configure do
  Rails.logger = Logger.new(STDOUT)
  # Rails.logger.log_level = Logger::INFO # default is DEBUG, but you might want INFO or above in production
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

  Rails.logger.info "Logger initialized !! 🐱"
end
```

### Настройка переменных окружения {#configure-environment-variables}

После этого вам нужно будет настроить следующие переменные окружения в вашей оболочке для отправки телеметрии в ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX, она может иметь любое имя, которое вы хотите._

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит ключ API, доступный через приложение HyperDX в `Настройки команды → Ключи API`.