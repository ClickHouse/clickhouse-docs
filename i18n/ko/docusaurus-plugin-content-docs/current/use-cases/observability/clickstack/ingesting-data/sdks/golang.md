---
slug: /use-cases/observability/clickstack/sdks/golang
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'ClickStack용 Golang SDK - ClickHouse 관측성 스택'
title: 'Golang'
doc_type: 'guide'
keywords: ['Golang ClickStack SDK', 'Go OpenTelemetry 통합', 'Golang 관측성', 'Go 트레이싱 계측', 'ClickStack Go SDK']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack는 텔레메트리 데이터(로그와 트레이스)를 수집하기 위해 OpenTelemetry 표준을 사용합니다. 트레이스는 자동 계측으로 자동 생성되므로, 트레이싱을 활용하는 데 수동 계측이 필요하지 않습니다.

**이 가이드에서 통합하는 항목:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그</td>
      <td className="pe-2">✅ 메트릭</td>
      <td className="pe-2">✅ 트레이스</td>
    </tr>
  </tbody>
</table>


## 시작하기 \{#getting-started\}

### OpenTelemetry 계측 패키지 설치 \{#install-opentelemetry\}

OpenTelemetry 및 HyperDX Go 패키지를 설치하려면 아래 명령을 실행하십시오. [현재 계측 패키지](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages)를 확인하고 필요한 패키지를 설치하여 트레이스 정보가 올바르게 연결되도록 하는 것이 좋습니다.

```shell
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```


### 네이티브 HTTP 서버 예제 (net/http) \{#native-http-server-example\}

이 예제에서는 `net/http/otelhttp` 패키지를 사용합니다.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

주석이 달린 부분을 참고하여 Go 애플리케이션을 계측하는 방법을 알아보십시오.

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


### Gin 애플리케이션 예제 \{#gin-application-example\}

이 예제에서는 `gin-gonic/gin`을 사용합니다.

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

주석 처리된 섹션을 참고하여 Go 애플리케이션을 계측하는 방법을 확인하십시오.

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


### 환경 변수 구성 \{#configure-environment-variables\}

다음으로 OpenTelemetry collector를 통해 ClickStack으로 텔레메트리 데이터를 전송하려면 셸에 다음 환경 변수를 설정해야 합니다:

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스" >

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

</TabItem>
</Tabs>

`OTEL_EXPORTER_OTLP_HEADERS` 환경 변수에는 HyperDX 앱의 `Team Settings → API Keys`에서 확인할 수 있는 API 키가 포함됩니다.