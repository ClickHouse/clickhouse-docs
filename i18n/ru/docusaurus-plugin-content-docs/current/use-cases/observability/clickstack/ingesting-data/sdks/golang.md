---
slug: /use-cases/observability/clickstack/sdks/golang
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Golang SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Golang'
doc_type: 'guide'
keywords: ['Golang ClickStack SDK', 'Go OpenTelemetry integration', 'Golang observability', 'Go tracing instrumentation', 'ClickStack Go SDK']
---

ClickStack использует стандарт OpenTelemetry для сбора телеметрии (логов и трейсов). Трейсы генерируются автоматически с помощью автоматической инструментации, поэтому ручная инструментация не требуется, чтобы извлекать пользу из трейсов.

**В это руководство входят:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>



## Начало работы {#getting-started}

### Установка пакетов инструментирования OpenTelemetry {#install-opentelemetry}

Для установки пакетов OpenTelemetry и HyperDX Go используйте приведенную ниже команду. Рекомендуется ознакомиться с [актуальными пакетами инструментирования](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages) и установить необходимые пакеты для корректного добавления информации трассировки.

```shell
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```

### Пример встроенного HTTP-сервера (net/http) {#native-http-server-example}

В этом примере используется `net/http/otelhttp`.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

Обратитесь к закомментированным разделам, чтобы узнать, как инструментировать ваше Go-приложение.

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

// настройка общих атрибутов для всех логов
func newResource() *resource.Resource {
  hostName, _ := os.Hostname()
  return resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceVersion("1.0.0"),
    semconv.HostName(hostName),
  )
}

// добавление идентификатора трассировки к логу
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctx не содержит валидного span.
    // Нет метаданных трассировки для добавления.
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // Инициализация конфигурации otel и её использование во всем приложении
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("error setting up OTel SDK - %e", err)
  }
  defer otelShutdown()

  ctx := context.Background()

  // настройка провайдера логгера opentelemetry
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )
  // корректное завершение работы логгера для сброса накопленных сигналов перед завершением программы
  defer loggerProvider.Shutdown(ctx)

  // создание нового логгера с ядром opentelemetry zap и его глобальная установка
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

// Используйте это для обертывания всех обработчиков с целью добавления метаданных трассировки в логгер
func wrapHandler(logger *zap.Logger, handler http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    logger := WithTraceMetadata(r.Context(), logger)
    logger.Info("request received", zap.String("url", r.URL.Path), zap.String("method", r.Method))
    handler(w, r)
    logger.Info("request completed", zap.String("path", r.URL.Path), zap.String("method", r.Method))
  }
}

```


func ExampleHandler(w http.ResponseWriter, r \*http.Request) {
w.Header().Add("Content-Type", "application/json")
io.WriteString(w, `{"status":"ok"}`)
}

````

### Пример приложения Gin {#gin-application-example}

В этом примере используется `gin-gonic/gin`.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
````

Обратитесь к комментариям в коде, чтобы узнать, как инструментировать ваше Go-приложение.

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

// добавить trace id в лог
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctx не содержит валидный span.
    // Метаданные трассировки отсутствуют.
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // Инициализировать конфигурацию otel и использовать её во всём приложении
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("error setting up OTel SDK - %e", err)
  }

  defer otelShutdown()

  ctx := context.Background()

  // настроить провайдер логгера opentelemetry
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )

  // корректно завершить работу логгера для сброса накопленных сигналов перед завершением программы
  defer loggerProvider.Shutdown(ctx)

  // создать новый логгер с ядром opentelemetry zap и установить его глобально
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)

  // Создать новый маршрутизатор Gin
  router := gin.Default()

  router.Use(otelgin.Middleware("service-name"))

  // Определить маршрут, который отвечает на GET-запросы по корневому URL
  router.GET("/", func(c *gin.Context) {
    _logger := WithTraceMetadata(c.Request.Context(), logger)
    _logger.Info("Hello World!")
    c.String(http.StatusOK, "Hello World!")
  })

  // Запустить сервер на порту 7777
  router.Run(":7777")
}
```

### Настройка переменных окружения {#configure-environment-variables}

Затем необходимо настроить следующие переменные окружения в вашей оболочке для отправки телеметрии в ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит API-ключ, доступный в приложении HyperDX в разделе `Team Settings → API Keys`.
