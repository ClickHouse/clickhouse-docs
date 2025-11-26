---
slug: /use-cases/observability/clickstack/sdks/aws_lambda
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickStack 用 AWS Lambda - ClickHouse オブザーバビリティ スタック'
title: 'AWS Lambda'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'aws-lambda', 'lambda-layers']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**このガイドで統合するデータ:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✅ メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>


## OpenTelemetry Lambda レイヤーのインストール {#installing-the-otel-lambda-layers}

OpenTelemetry プロジェクトは、次の目的で個別の Lambda レイヤーを提供しています：

1. OpenTelemetry の自動インストルメンテーションを使用して、Lambda 関数のコードを自動的にインストルメントする。
2. 収集したログ、メトリクス、トレースを ClickStack に転送する。

### 言語別の自動インストゥルメンテーションレイヤーの追加 {#adding-language-specific-auto-instrumentation}

言語別の自動インストゥルメンテーション Lambda レイヤーは、対象言語向けの OpenTelemetry の自動インストゥルメンテーション用パッケージを利用して、Lambda 関数コードを自動的にインストゥルメントします。

各言語およびリージョンごとに専用のレイヤー ARN が用意されています。

すでに Lambda 関数が OpenTelemetry SDK でインストゥルメントされている場合は、この手順はスキップできます。

**設定を開始するには**:

1. 「Layers」セクションで「Add a layer」をクリックします。
2. 「Specify an ARN」を選択し、言語に応じて正しい ARN を選択します。`<region>` を自身のリージョンに置き換えてください（例: `us-east-2`）:

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

_レイヤーの最新リリースは、[OpenTelemetry Lambda Layers の GitHub リポジトリ](https://github.com/open-telemetry/opentelemetry-lambda/releases)で確認できます。_

3. Lambda 関数の「Configuration」>「Environment variables」で、次の環境変数を設定します。

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

### OpenTelemetry collector Lambda レイヤーのインストール

collector Lambda レイヤーを使用すると、エクスポーターのレイテンシによる応答時間への影響を抑えつつ、Lambda 関数から ClickStack へログ、メトリクス、トレースを転送できます。

**collector レイヤーをインストールするには**:

1. Layers セクションで「Add a layer」をクリックします。
2. 「Specify an ARN」を選択し、アーキテクチャに応じて正しい ARN を選択します。必ず `<region>` を自身のリージョン（例: `us-east-2`）に置き換えてください:

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

3. 次の `collector.yaml` ファイルをプロジェクトに追加し、collector が ClickStack へ送信するように構成します:

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

レイヤーをデプロイした後、Lambda 関数からのトレースが自動的に収集され、HyperDX 上で確認できるようになっているはずです。`decouple` と `batching` プロセッサによってテレメトリ収集に遅延が生じる場合があるため、トレースの表示が遅れることがあります。カスタムログやメトリクスを出力するには、利用しているプログラミング言語向けの OpenTelemetry SDKS を使用してコードをインストルメントする必要があります。

## トラブルシューティング {#troubleshoting}

### カスタムインストルメンテーションからデータが送信されない {#custom-instrumentation-not-sending}

手動で定義したトレースやその他のテレメトリが表示されない場合、
使用している OpenTelemetry API パッケージのバージョンに互換性の問題がある可能性があります。使用している
OpenTelemetry API パッケージのバージョンが、AWS Lambda に含まれている
バージョンと同じか、それ以下であることを確認してください。

### SDK のデバッグログを有効化する {#enabling-sdk-debug-logs}

OpenTelemetry SDK からのデバッグログを有効にするには、環境変数 `OTEL_LOG_LEVEL` を `DEBUG` に設定します。これにより、自動インスツルメンテーションレイヤーがアプリケーションを正しく計測できているかを確認しやすくなります。

### コレクターのデバッグログを有効化する

コレクターの問題をデバッグするには、コレクターの設定ファイルを変更し、`logging` エクスポーターを追加してテレメトリのログレベルを `debug` に設定します。これにより、コレクターの Lambda レイヤーからのより詳細なログ出力が有効になります。

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
