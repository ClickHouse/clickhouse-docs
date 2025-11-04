---
'slug': '/use-cases/observability/clickstack/sdks/aws_lambda'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 6
'description': 'AWS Lambda for ClickStack - ClickHouse 可观察性堆栈'
'title': 'AWS Lambda'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**このガイドは統合します:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✅ メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>

## OpenTelemetry Lambdaレイヤーのインストール {#installing-the-otel-lambda-layers}

OpenTelemetryプロジェクトは、以下の目的で別々のLambdaレイヤーを提供します：

1. OpenTelemetryの自動計測を使用して、Lambda関数のコードを自動的に計測します。
2. 収集したログ、メトリクス、トレースをClickStackに転送します。

### 言語固有の自動計測レイヤーの追加 {#adding-language-specific-auto-instrumentation}

言語固有の自動計測Lambdaレイヤーは、特定の言語用のOpenTelemetry自動計測パッケージを使用して、Lambda関数のコードを自動的に計測します。

各言語とリージョンごとに独自のレイヤーARNがあります。

LambdaがすでにOpenTelemetry SDKで計測されている場合は、このステップをスキップできます。

**始めるには**：

1. Layersセクションで「Add a layer」をクリックします。
2. ARNを指定し、言語に基づいて正しいARNを選択し、`<region>`を自分のリージョン（例：`us-east-2`）に置き換えてください：

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

_レイヤーの最新リリースは、[OpenTelemetry Lambda Layers GitHubリポジトリ](https://github.com/open-telemetry/opentelemetry-lambda/releases)で見つけることができます。_

3. Lambda関数の「Configuration」>「Environment variables」で次の環境変数を設定します。

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

### OpenTelemetryコレクタLambdaレイヤーのインストール {#installing-the-otel-collector-layer}

コレクタLambdaレイヤーを使用すると、Lambda関数からClickStackにログ、メトリクス、トレースを転送でき、エクスポータの遅延による応答時間への影響を最小限に抑えることができます。

**コレクタレイヤーをインストールするには**：

1. Layersセクションで「Add a layer」をクリックします。
2. ARNを指定し、アーキテクチャに基づいて正しいARNを選択し、`<region>`を自分のリージョン（例：`us-east-2`）に置き換えてください：

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

3. コレクタをClickStackに送信するように設定するために、プロジェクトに次の`collector.yaml`ファイルを追加します：

```yaml

# collector.yaml
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

4. 次の環境変数を追加します：

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```

## インストールの確認 {#checking-the-installation}

レイヤーをデプロイした後、Lambda関数から自動的に収集されたトレースがHyperDXに表示されるはずです。`decouple`および`batching`プロセッサはテレメトリコレクションに遅延を引き起こす可能性があるため、トレースが表示されるまでに時間がかかる場合があります。カスタムログやメトリクスを生成するには、言語固有のOpenTelemetry SDKを使用してコードを計測する必要があります。

## トラブルシューティング {#troubleshoting}

### カスタム計測が送信されない {#custom-instrumentation-not-sending}

手動で定義したトレースやその他のテレメトリが表示されない場合、OpenTelemetry APIパッケージの互換性のないバージョンを使用している可能性があります。OpenTelemetry APIパッケージがAWS Lambdaに含まれるバージョンと同じか、それよりも古いバージョンであることを確認してください。

### SDKデバッグログの有効化 {#enabling-sdk-debug-logs}

`OTEL_LOG_LEVEL`環境変数を`DEBUG`に設定して、OpenTelemetry SDKからのデバッグログを有効にします。これにより、自動計測レイヤーがアプリケーションを正しく計測していることを確認できます。

### コレクタデバッグログの有効化 {#enabling-collector-debug-logs}

コレクタの問題をデバッグするには、コレクタの設定ファイルを変更して`logging`エクスポータを追加し、テレメトリログレベルを`debug`に設定して、コレクタLambdaレイヤーからの詳細なログを有効にします。

```yaml

# collector.yaml
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
