---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'ClickStack 向け Java SDK - ClickHouse Observability Stack'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java observability SDK', 'ClickStack Java integration', 'Java application monitoring']
---

ClickStack は、テレメトリデータ（ログとトレース）を収集するために OpenTelemetry 標準を使用します。トレースは自動インスツルメンテーションによって自動生成されるため、トレースを活用するために手動でインスツルメンテーションを行う必要はありません。

**このガイドで扱う統合対象:**

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

:::note
現在、この統合は **Java 8以降** のみに対応しています
:::

### OpenTelemetry Javaエージェントのダウンロード {#download-opentelemtry-java-agent}

[`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)をダウンロードし、任意のディレクトリに配置してください。このJARファイルには、エージェントと計装ライブラリが含まれています。以下のコマンドでエージェントをダウンロードすることもできます:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 環境変数の設定 {#configure-environment-variables}

次に、テレメトリをClickStackに送信するために、シェルで以下の環境変数を設定する必要があります:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリ内でサービスを識別するために使用されます。任意の名前を指定できます。_

`OTEL_EXPORTER_OTLP_HEADERS`環境変数には、HyperDXアプリの`Team Settings → API Keys`から取得できるAPIキーを設定します。

### OpenTelemetry Javaエージェントを使用したアプリケーションの実行 {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />
Java OpenTelemetry計装の詳細については、以下を参照してください:
[https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
