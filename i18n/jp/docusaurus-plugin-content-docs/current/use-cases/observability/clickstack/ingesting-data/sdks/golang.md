---
slug: /use-cases/observability/clickstack/sdks/golang
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'ClickStack 用 Golang SDK - ClickHouse オブザーバビリティスタック'
title: 'Golang'
doc_type: 'guide'
keywords: ['Golang ClickStack SDK', 'Go OpenTelemetry 連携', 'Golang オブザーバビリティ', 'Go トレース計装', 'ClickStack Go SDK']
---

ClickStack は、テレメトリデータ（ログおよびトレース）を収集するために OpenTelemetry の標準を使用します。トレースは自動計装によって自動生成されるため、トレースの活用価値を得るために手動で計装する必要はありません。

**このガイドで統合するもの:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✅ メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>

## はじめに {#getting-started}

### OpenTelemetry インストルメンテーションパッケージをインストールする {#install-opentelemetry}

OpenTelemetry と HyperDX の Go パッケージをインストールするには、以下のコマンドを使用してください。[現在のインストルメンテーションパッケージ](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.4.0/instrumentation#instrumentation-packages)を確認し、必要なパッケージをインストールして、トレース情報が正しく紐付けられるようにすることを推奨します。

```shell
go get -u go.opentelemetry.io/otel
go get -u github.com/hyperdxio/otel-config-go
go get -u github.com/hyperdxio/opentelemetry-go
go get -u github.com/hyperdxio/opentelemetry-logs-go
```


### ネイティブ HTTP サーバーの例 (net/http) {#native-http-server-example}

ここでは、`net/http/otelhttp` を使用します。

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```

コメントアウトされたセクションを参照して、Go アプリケーションを計装（インストルメンテーション）する方法を確認してください。

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

// すべてのログに共通の属性を設定
func newResource() *resource.Resource {
  hostName, _ := os.Hostname()
  return resource.NewWithAttributes(
    semconv.SchemaURL,
    semconv.ServiceVersion("1.0.0"),
    semconv.HostName(hostName),
  )
}

// ログにトレースIDを付加
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctxに有効なスパンが含まれていません。
    // 追加するトレースメタデータがありません。
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // OTel設定を初期化し、アプリケーション全体で使用
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("OTel SDKのセットアップエラー - %e", err)
  }
  defer otelShutdown()

  ctx := context.Background()

  // OpenTelemetryロガープロバイダーを設定
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )
  // プログラム終了前に蓄積されたシグナルをフラッシュするため、ロガーを正常にシャットダウン
  defer loggerProvider.Shutdown(ctx)

  // OpenTelemetry zapコアで新しいロガーを作成し、グローバルに設定
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)
  logger.Warn("hello world", zap.String("foo", "bar"))

  http.Handle("/", otelhttp.NewHandler(wrapHandler(logger, ExampleHandler), "example-service"))

  port := os.Getenv("PORT")
  if port == "" {
    port = "7777"
  }

  logger.Info("** サービスがポート " + port + " で起動しました **")
  if err := http.ListenAndServe(":"+port, nil); err != nil {
    logger.Fatal(err.Error())
  }
}

// すべてのハンドラーをラップしてロガーにトレースメタデータを追加する際に使用
func wrapHandler(logger *zap.Logger, handler http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    logger := WithTraceMetadata(r.Context(), logger)
    logger.Info("リクエストを受信しました", zap.String("url", r.URL.Path), zap.String("method", r.Method))
    handler(w, r)
    logger.Info("リクエストが完了しました", zap.String("path", r.URL.Path), zap.String("method", r.Method))
  }
}

func ExampleHandler(w http.ResponseWriter, r *http.Request) {
  w.Header().Add("Content-Type", "application/json")
  io.WriteString(w, `{"status":"ok"}`)
}
```


### Gin アプリケーションの例 {#gin-application-example}

この例では、`gin-gonic/gin` を使用します。

```shell
go get -u go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

コメント付きセクションを参照して、Go アプリケーションの計装方法を確認してください。

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

// ログにトレースIDを付与する
func WithTraceMetadata(ctx context.Context, logger *zap.Logger) *zap.Logger {
  spanContext := trace.SpanContextFromContext(ctx)
  if !spanContext.IsValid() {
    // ctxに有効なスパンが含まれていない
    // 追加するトレースメタデータが存在しない
    return logger
  }
  return logger.With(
    zap.String("trace_id", spanContext.TraceID().String()),
    zap.String("span_id", spanContext.SpanID().String()),
  )
}

func main() {
  // OTel設定を初期化し、アプリケーション全体で使用する
  otelShutdown, err := otelconfig.ConfigureOpenTelemetry()
  if err != nil {
    log.Fatalf("OTel SDKのセットアップエラー - %e", err)
  }

  defer otelShutdown()

  ctx := context.Background()

  // OpenTelemetryロガープロバイダーを設定する
  logExporter, _ := otlplogs.NewExporter(ctx)
  loggerProvider := sdk.NewLoggerProvider(
    sdk.WithBatcher(logExporter),
  )

  // プログラム終了前に蓄積されたシグナルをフラッシュするため、ロガーを正常終了する
  defer loggerProvider.Shutdown(ctx)

  // OpenTelemetry zapコアで新しいロガーを作成し、グローバルに設定する
  logger := zap.New(otelzap.NewOtelCore(loggerProvider))
  zap.ReplaceGlobals(logger)

  // 新しいGinルーターを作成する
  router := gin.Default()

  router.Use(otelgin.Middleware("service-name"))

  // ルートURLへのGETリクエストに応答するルートを定義する
  router.GET("/", func(c *gin.Context) {
    _logger := WithTraceMetadata(c.Request.Context(), logger)
    _logger.Info("Hello World!")
    c.String(http.StatusOK, "Hello World!")
  })

  // ポート7777でサーバーを起動する
  router.Run(":7777")
}
```


### 環境変数を設定する {#configure-environment-variables}

続いて、ClickStack にテレメトリを送信するために、シェルに次の環境変数を設定する必要があります。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

`OTEL_EXPORTER_OTLP_HEADERS` 環境変数には、HyperDX アプリの `Team Settings → API Keys` で取得できる API キーを設定します。
