---
slug: /use-cases/observability/clickstack/sdks/aws_lambda
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickStack 用 AWS Lambda - ClickHouse オブザーバビリティスタック'
title: 'AWS Lambda'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'aws-lambda', 'lambda-layers']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**本ガイドで統合する対象:**

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

OpenTelemetryプロジェクトは、以下の目的で個別のLambdaレイヤーを提供しています:

1. OpenTelemetry自動計装を使用してLambda関数コードを自動的に計装する
2. 収集されたログ、メトリクス、トレースをClickStackに転送する

### 言語固有の自動計装レイヤーの追加 {#adding-language-specific-auto-instrumentation}

言語固有の自動計装Lambdaレイヤーは、特定の言語向けのOpenTelemetry自動計装パッケージを使用してLambda関数コードを自動的に計装します。

各言語およびリージョンには独自のレイヤーARNがあります。

LambdaがすでにOpenTelemetry SDKで計装されている場合は、この手順をスキップできます。

**開始するには**:

1. Layersセクションで「Add a layer」をクリックします
2. 「specify an ARN」を選択し、言語に基づいて正しいARNを選択します。`<region>`を実際のリージョン(例: `us-east-2`)に置き換えてください:

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

_レイヤーの最新リリースは[OpenTelemetry Lambda Layers GitHubリポジトリ](https://github.com/open-telemetry/opentelemetry-lambda/releases)で確認できます。_

3. Lambda関数の「Configuration」>「Environment variables」で以下の環境変数を設定します。

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

### OpenTelemetryコレクターLambdaレイヤーのインストール {#installing-the-otel-collector-layer}

コレクターLambdaレイヤーを使用すると、エクスポーターのレイテンシによる応答時間への影響なしに、Lambda関数からClickStackへログ、メトリクス、トレースを転送できます。

**コレクターレイヤーをインストールするには**:

1. Layersセクションで「Add a layer」をクリックします
2. 「specify an ARN」を選択し、アーキテクチャに基づいて正しいARNを選択します。`<region>`を実際のリージョン(例: `us-east-2`)に置き換えてください:

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

3. 以下の `collector.yaml` ファイルをプロジェクトに追加して、コレクターがClickStackへ送信するように設定します：


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

4. 以下の環境変数を追加します：

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```


## インストールの確認 {#checking-the-installation}

レイヤーをデプロイしたあと、HyperDX に Lambda 関数から収集されたトレースが自動的に表示されるようになります。`decouple` と `batching` プロセッサによってテレメトリ収集に遅延が発生する場合があるため、トレースの表示が遅れることがあります。カスタムログやメトリクスを出力するには、使用しているプログラミング言語向けの OpenTelemetry SDKs を用いてコードを計装する必要があります。



## トラブルシューティング {#troubleshoting}

### カスタムインストルメンテーションが送信されない {#custom-instrumentation-not-sending}

手動で定義したトレースやその他のテレメトリが確認できない場合は、
互換性のないバージョンの OpenTelemetry API パッケージを使用している可能性があります。
OpenTelemetry API パッケージが、AWS Lambda に含まれているバージョンと
同じかそれより低いバージョンであることを確認してください。

### SDK のデバッグログを有効化する {#enabling-sdk-debug-logs}

`OTEL_LOG_LEVEL` 環境変数を `DEBUG` に設定して、OpenTelemetry SDK からのデバッグログを有効化します。
これにより、自動インストルメンテーションレイヤーが
アプリケーションを正しくインストルメントできているかを確認しやすくなります。

### Collector のデバッグログを有効化する {#enabling-collector-debug-logs}

Collector の問題をデバッグするには、Collector の設定ファイルを変更して
`logging` エクスポーターを追加し、テレメトリのログレベルを `debug` に設定することで、
Collector の Lambda レイヤーからのより詳細なログ出力を有効化できます。



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
