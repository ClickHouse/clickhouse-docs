---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'ClickStack 向け Java SDK - ClickHouse Observability スタック'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java オブザーバビリティ SDK', 'ClickStack Java 連携', 'Java アプリケーション監視']
---

ClickStack は、テレメトリデータ（ログとトレース）を収集するために OpenTelemetry の標準を使用します。トレースは自動インストルメンテーションによって自動生成されるため、手動でインストルメンテーションを行わなくてもトレーシングの効果を得られます。

**このガイドで統合される対象:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✅ メトリクス</td>
      <td className="pe-2">✅ トレース</td>
    </tr>
  </tbody>
</table>



## はじめに

:::note
現時点では、このインテグレーションは **Java 8 以降** のみに対応しています。
:::

### OpenTelemetry Java エージェントのダウンロード

[`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
をダウンロードし、任意のディレクトリに配置します。JAR ファイルにはエージェントと
インストルメンテーションライブラリが含まれています。次のコマンドを使用して
エージェントをダウンロードすることもできます。

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 環境変数を設定する

次に、ClickStack にテレメトリを送信するため、シェルで次の環境変数を設定する必要があります。

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<インジェストAPIキー>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<アプリまたはサービスの名前>'
```

*`OTEL_SERVICE_NAME` 環境変数は HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を設定できます。*

`OTEL_EXPORTER_OTLP_HEADERS` 環境変数には、HyperDX アプリの `Team Settings → API Keys` から取得できる APIキー を設定します。

### OpenTelemetry Java エージェントを使用してアプリケーションを実行する

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

Java 向け OpenTelemetry 計装の詳細については、こちらをご覧ください: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
