---
'slug': '/use-cases/observability/clickstack/sdks/golang'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 2
'description': 'Golang SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'Golang'
'doc_type': 'guide'
---
ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (журналов и трасс). Трассировки автоматически генерируются с помощью автоматической инструментализации, поэтому ручная инструментализация не требуется для получения информации из трассировок.

**Этот Гид Интегрирует:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Журналы</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трассировки</td>
    </tr>
  </tbody>
</table>

## Начало работы {#getting-started}

### Установите пакеты инструментализации OpenTelemetry {#install-opentelemetry}

Чтобы установить пакеты OpenTelemetry и HyperDX для Go, используйте команду ниже. Рекомендуется ознакомиться с [текущими пакетами инструментализации](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages) и установить необходимые пакеты, чтобы убедиться, что информация о трассировке прикреплена правильно.

```shell
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```

### Пример нативного HTTP сервера (net/http) {#native-http-server-example}

В этом примере мы будем использовать `net/http/otelhttp`.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

Обратитесь к комментируемым разделам, чтобы узнать, как инструментировать ваше приложение на Go.

```go

package main

import (
  "context"
  "io"
  "log"
  "net/http"
  "os"

  "github.com/hyperdxio/opentelemetry-go/otelzap"
  "github.com/hyperdxio/opentelemetry-logs-go/exporters/otlp/otlplogs"
  "github.com/hyperdxio/otel-config-go/otelconfig"
  "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
  "go.opentelemetry.io/otel/trace"
  "go.uber.org/zap"
  sdk "github.com/hyperdxio/opentelemetry-logs-go/sdk/logs"
  semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
  "go.opentelemetry.io/otel/sdk/resource"
)

// configure common attributes for all logs
func newResource() *resource.Resource {
  hostName, _ := os.Hostname()
  return resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceVersion("1.0.0"),
    semconv.HostName(hostName),
  )
}

// attach trace id to the log
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctx does not contain a valid span.
    // There is no trace metadata to add.
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // Initialize otel config and use it across the entire app
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("error setting up OTel SDK - %e", err)
  }
  defer otelShutdown()

  ctx := context.Background()

  // configure opentelemetry logger provider
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )
  // gracefully shutdown logger to flush accumulated signals before program finish
  defer loggerProvider.Shutdown(ctx)

  // create new logger with opentelemetry zap core and set it globally
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)
  logger.Warn("hello world", zap.String("foo", "bar"))

  http.Handle("/", otelhttp.NewHandler(wrapHandler(logger, ExampleHandler), "example-service"))

  port := os.Getenv("PORT")
  if port == "" {
    port = "7777"
  }

  logger.Info("** Service Started on Port " + port + " **")
  if err := http.ListenAndServe(":"+port, nil); err != nil {
    logger.Fatal(err.Error())
  }
}

// Use this to wrap all handlers to add trace metadata to the logger
func wrapHandler(logger *zap.Logger, handler http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    logger := WithTraceMetadata(r.Context(), logger)
    logger.Info("request received", zap.String("url", r.URL.Path), zap.String("method", r.Method))
    handler(w, r)
    logger.Info("request completed", zap.String("path", r.URL.Path), zap.String("method", r.Method))
  }
}

func ExampleHandler(w http.ResponseWriter, r *http.Request) {
  w.Header().Add("Content-Type", "application/json")
  io.WriteString(w, `{"status":"ok"}`)
}
```

### Пример приложения Gin {#gin-application-example}

В этом примере мы будем использовать `gin-gonic/gin`.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

Обратитесь к комментируемым разделам, чтобы узнать, как инструментировать ваше приложение на Go.

```go

package main

import (
  "context"
  "log"
  "net/http"

  "github.com/gin-gonic/gin"
  "github.com/hyperdxio/opentelemetry-go/otelzap"
  "github.com/hyperdxio/opentelemetry-logs-go/exporters/otlp/otlplogs"
  sdk "github.com/hyperdxio/opentelemetry-logs-go/sdk/logs"
  "github.com/hyperdxio/otel-config-go/otelconfig"
  "go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
  "go.opentelemetry.io/otel/trace"
  "go.uber.org/zap"
)

// attach trace id to the log
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctx does not contain a valid span.
    // There is no trace metadata to add.
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // Initialize otel config and use it across the entire app
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("error setting up OTel SDK - %e", err)
  }

  defer otelShutdown()

  ctx := context.Background()

  // configure opentelemetry logger provider
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )

  // gracefully shutdown logger to flush accumulated signals before program finish
  defer loggerProvider.Shutdown(ctx)

  // create new logger with opentelemetry zap core and set it globally
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)

  // Create a new Gin router
  router := gin.Default()

  router.Use(otelgin.Middleware("service-name"))

  // Define a route that responds to GET requests on the root URL
  router.GET("/", func(c *gin.Context) {
    _logger := WithTraceMetadata(c.Request.Context(), logger)
    _logger.Info("Hello World!")
    c.String(http.StatusOK, "Hello World!")
  })

  // Run the server on port 7777
  router.Run(":7777")
}
```

### Настройка переменных окружения {#configure-environment-variables}

После этого вам нужно будет настроить следующие переменные окружения в вашем терминале для отправки телеметрии в ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит API-ключ, доступный через приложение HyperDX в `Настройки команды → API-ключи`.