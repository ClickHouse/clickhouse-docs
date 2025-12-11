---
slug: /use-cases/observability/clickstack/sdks/golang
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Golang SDK для ClickStack — ClickHouse Observability Stack'
title: 'Golang'
doc_type: 'guide'
keywords: ['Golang ClickStack SDK', 'интеграция Go с OpenTelemetry', 'наблюдаемость в Golang', 'инструментирование трассировки в Go', 'ClickStack Go SDK']
---

ClickStack использует стандарт OpenTelemetry для сбора телеметрии (логов и
трейсов). Трейсы автоматически генерируются с помощью автоматического инструментирования, поэтому
ручное инструментирование не требуется, чтобы извлекать пользу из трассировки.

**Это руководство охватывает интеграцию:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>

## Первые шаги {#getting-started}

### Установите пакеты инструментации OpenTelemetry {#install-opentelemetry}

Чтобы установить пакеты OpenTelemetry и HyperDX для Go, используйте следующую команду. Рекомендуется ознакомиться с [актуальными пакетами инструментации](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages) и установить необходимые пакеты, чтобы обеспечить корректную привязку информации о трассировках.

```shell
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```

### Пример HTTP-сервера на базе стандартной библиотеки (net/http) {#native-http-server-example}

В этом примере используется `net/http/otelhttp`.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

См. закомментированные фрагменты, чтобы узнать, как инструментировать ваше Go-приложение.

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

// привязка идентификатора трассировки к логу
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
  // Инициализация конфигурации OTel и её использование во всём приложении
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("ошибка настройки OTel SDK - %e", err)
  }
  defer otelShutdown()

  ctx := context.Background()

  // настройка провайдера логгера OpenTelemetry
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )
  // корректное завершение работы логгера для сброса накопленных сигналов перед завершением программы
  defer loggerProvider.Shutdown(ctx)

  // создание нового логгера с ядром OpenTelemetry zap и его глобальная установка
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)
  logger.Warn("hello world", zap.String("foo", "bar"))

  http.Handle("/", otelhttp.NewHandler(wrapHandler(logger, ExampleHandler), "example-service"))

  port := os.Getenv("PORT")
  if port == "" {
    port = "7777"
  }

  logger.Info("** Сервис запущен на порту " + port + " **")
  if err := http.ListenAndServe(":"+port, nil); err != nil {
    logger.Fatal(err.Error())
  }
}

// Используйте для обёртки всех обработчиков с целью добавления метаданных трассировки к логгеру
func wrapHandler(logger *zap.Logger, handler http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    logger := WithTraceMetadata(r.Context(), logger)
    logger.Info("запрос получен", zap.String("url", r.URL.Path), zap.String("method", r.Method))
    handler(w, r)
    logger.Info("запрос завершён", zap.String("path", r.URL.Path), zap.String("method", r.Method))
  }
}

func ExampleHandler(w http.ResponseWriter, r *http.Request) {
  w.Header().Add("Content-Type", "application/json")
  io.WriteString(w, `{"status":"ok"}`)
}
```

### Пример приложения на Gin {#gin-application-example}

В этом примере используется `gin-gonic/gin`.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

Обратитесь к разделам с комментариями, чтобы узнать, как инструментировать Go‑приложение.

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

// привязать trace id к логу
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
  // Инициализировать конфигурацию OTel и использовать её во всём приложении
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("ошибка настройки OTel SDK - %e", err)
  }

  defer otelShutdown()

  ctx := context.Background()

  // настроить провайдер логгера OpenTelemetry
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )

  // корректно завершить работу логгера для сброса накопленных сигналов перед завершением программы
  defer loggerProvider.Shutdown(ctx)

  // создать новый логгер с ядром OpenTelemetry zap и установить его глобально
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

Далее необходимо задать в оболочке следующие переменные окружения, чтобы отправлять телеметрию в ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` должна содержать API-ключ, который можно получить в приложении HyperDX в разделе `Team Settings → API Keys`.
