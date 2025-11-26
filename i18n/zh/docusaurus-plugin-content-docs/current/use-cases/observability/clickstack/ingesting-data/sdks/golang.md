---
slug: /use-cases/observability/clickstack/sdks/golang
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'ClickStack 的 Golang SDK - ClickHouse 可观测性栈'
title: 'Golang'
doc_type: 'guide'
keywords: ['Golang ClickStack SDK', 'Go OpenTelemetry 集成', 'Golang 可观测性', 'Go tracing 插桩', 'ClickStack Go SDK']
---

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和
链路追踪）。链路追踪通过自动插桩生成，因此无需手动
插桩也能从追踪中获益。

**本指南集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志（Logs）</td>
      <td className="pe-2">✅ 指标（Metrics）</td>
      <td className="pe-2">✅ 链路追踪（Traces）</td>
    </tr>
  </tbody>
</table>



## 入门

### 安装 OpenTelemetry 仪表化包

要安装 OpenTelemetry 和 HyperDX 的 Go 包，请使用下面的命令。建议查看[当前的仪表化包](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages)，并安装所需的包，以确保链路追踪信息能够被正确附带。

```shell
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```

### 原生 HTTP 服务器示例（net/http）

在本示例中，我们将使用 `net/http/otelhttp`。

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

请参考带注释的部分，了解如何为您的 Go 应用程序进行埋点。

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

// 为所有日志配置通用属性
func newResource() *resource.Resource {
  hostName, _ := os.Hostname()
  return resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceVersion("1.0.0"),
    semconv.HostName(hostName),
  )
}

// 将 trace ID 附加到日志
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctx 不包含有效的 span。
    // 没有 trace 元数据可添加。
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // 初始化 OTel 配置并在整个应用中使用
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("设置 OTel SDK 时出错 - %e", err)
  }
  defer otelShutdown()

  ctx := context.Background()

  // 配置 OpenTelemetry logger provider
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )
  // 优雅关闭 logger 以在程序结束前刷新累积的信号
  defer loggerProvider.Shutdown(ctx)

  // 使用 OpenTelemetry zap core 创建新 logger 并全局设置
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)
  logger.Warn("hello world", zap.String("foo", "bar"))

  http.Handle("/", otelhttp.NewHandler(wrapHandler(logger, ExampleHandler), "example-service"))

  port := os.Getenv("PORT")
  if port == "" {
    port = "7777"
  }

  logger.Info("** 服务已在端口 " + port + " 启动 **")
  if err := http.ListenAndServe(":"+port, nil); err != nil {
    logger.Fatal(err.Error())
  }
}

// 使用此函数包装所有 handler 以将 trace 元数据添加到 logger
func wrapHandler(logger *zap.Logger, handler http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    logger := WithTraceMetadata(r.Context(), logger)
    logger.Info("收到请求", zap.String("url", r.URL.Path), zap.String("method", r.Method))
    handler(w, r)
    logger.Info("请求已完成", zap.String("path", r.URL.Path), zap.String("method", r.Method))
  }
}
```


func ExampleHandler(w http.ResponseWriter, r \*http.Request) {
w.Header().Add("Content-Type", "application/json")
io.WriteString(w, `{"status":"ok"}`)
}

````

### Gin 应用示例 {#gin-application-example}

在此示例中,我们将使用 `gin-gonic/gin`。

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
````

请参考注释部分了解如何对您的 Go 应用程序进行插桩。

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

// 将 trace id 附加到日志
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctx 不包含有效的 span。
    // 没有可添加的追踪元数据。
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // 初始化 OTel 配置并在整个应用中使用
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("设置 OTel SDK 时出错 - %e", err)
  }

  defer otelShutdown()

  ctx := context.Background()

  // 配置 OpenTelemetry 日志记录器提供程序
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )

  // 优雅地关闭日志记录器以在程序结束前刷新累积的信号
  defer loggerProvider.Shutdown(ctx)

  // 使用 OpenTelemetry zap 核心创建新的日志记录器并全局设置
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)

  // 创建新的 Gin 路由器
  router := gin.Default()

  router.Use(otelgin.Middleware("service-name"))

  // 定义一个响应根 URL 上 GET 请求的路由
  router.GET("/", func(c *gin.Context) {
    _logger := WithTraceMetadata(c.Request.Context(), logger)
    _logger.Info("Hello World!")
    c.String(http.StatusOK, "Hello World!")
  })

  // 在端口 7777 上运行服务器
  router.Run(":7777")
}
```

### 配置环境变量 {#configure-environment-variables}

之后,您需要在 shell 中配置以下环境变量以将遥测数据发送到 ClickStack:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

`OTEL_EXPORTER_OTLP_HEADERS` 环境变量包含可通过 HyperDX 应用在 `团队设置 → API 密钥` 中获取的 API 密钥。
