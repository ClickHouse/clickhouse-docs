---
'slug': '/use-cases/observability/clickstack/sdks/golang'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 2
'description': 'Golang SDK 用于 ClickStack - ClickHouse 观测栈'
'title': 'Golang'
---

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和追踪）。追踪是通过自动仪表化自动生成的，因此不需要手动仪表化即可从追踪中获取价值。

**本指南整合了：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✅ 度量</td>
      <td className="pe-2">✅ 追踪</td>
    </tr>
  </tbody>
</table>

## 开始使用 {#getting-started}

### 安装 OpenTelemetry 仪表化包 {#install-opentelemetry}

要安装 OpenTelemetry 和 HyperDX Go 包，请使用下面的命令。建议查看[当前的仪表化包](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages)并安装必要的包，以确保追踪信息正确附加。

```bash
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```

### 原生 HTTP 服务器示例 (net/http) {#native-http-server-example}

在此示例中，我们将使用 `net/http/otelhttp`。

```sh
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

请参考注释部分了解如何对您的 Go 应用程序进行仪表化。

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


### Gin 应用程序示例 {#gin-application-example}

在此示例中，我们将使用 `gin-gonic/gin`。

```sh
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

请参考注释部分了解如何对您的 Go 应用程序进行仪表化。

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


### 配置环境变量 {#configure-environment-variables}

之后，您需要在您的 shell 中配置以下环境变量，以便将遥测数据发送到 ClickStack：

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含可通过 HyperDX 应用在 `团队设置 → API 密钥` 中获得的 API 密钥。
