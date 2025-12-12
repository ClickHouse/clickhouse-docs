---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'ClickStack 用 Java SDK - ClickHouse オブザーバビリティスタック'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java 観測可能性 SDK', 'ClickStack Java 連携', 'Java アプリケーション監視']
---

ClickStack はテレメトリデータ（ログおよびトレース）を収集するために、OpenTelemetry の標準仕様を使用します。トレースは自動インストルメンテーションによって自動生成されるため、トレーシングから価値を得るために手動でインストルメンテーションを行う必要はありません。

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

:::note
現時点では、このインテグレーションは **Java 8 以降** にのみ対応しています。
:::

### OpenTelemetry Java エージェントをダウンロードする {#download-opentelemtry-java-agent}

[`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
をダウンロードし、任意のディレクトリに配置します。この JAR ファイルには、エージェント本体とインストゥルメンテーション ライブラリが含まれています。次のコマンドでエージェントをダウンロードすることもできます：

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 環境変数を設定する {#configure-environment-variables}

次に、ClickStack にテレメトリデータを送信するため、シェル環境で次の環境変数を設定する必要があります。

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

*`OTEL_SERVICE_NAME` 環境変数は、HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を指定できます。*

`OTEL_EXPORTER_OTLP_HEADERS` 環境変数には、HyperDX アプリの `Team Settings → API Keys` から取得できる API キーを設定します。

### OpenTelemetry Java エージェントを使ってアプリケーションを実行する {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

Java 向け OpenTelemetry インストルメンテーションの詳細については、こちらを参照してください: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
