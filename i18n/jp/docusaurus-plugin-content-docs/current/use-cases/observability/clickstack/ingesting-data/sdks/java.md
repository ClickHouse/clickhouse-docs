---
'slug': '/use-cases/observability/clickstack/sdks/java'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Java SDK for ClickStack - ClickHouse 可观察性栈'
'title': 'Java'
'doc_type': 'guide'
---

ClickStackは、テレメトリデータ（ログとトレース）を収集するためにOpenTelemetry標準を使用しています。トレースは自動計測により自動生成されるため、トレースから価値を得るために手動計測は必要ありません。

**このガイドは次のものを統合します：**

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
現在、この統合は**Java 8+**と専ら互換性があります。
:::

### OpenTelemetry Javaエージェントをダウンロードする {#download-opentelemtry-java-agent}

[`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)をダウンロードし、お好みのディレクトリにJARファイルを配置します。JARファイルにはエージェントと計測ライブラリが含まれています。また、次のコマンドを使用してエージェントをダウンロードすることもできます：

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 環境変数を設定する {#configure-environment-variables}

その後、テレメトリをClickStackに送信するために、シェルで以下の環境変数を設定する必要があります：

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリ内でサービスを識別するために使用されます。任意の名前を使用できます。_

`OTEL_EXPORTER_OTLP_HEADERS`環境変数には、`Team Settings → API Keys`のHyperDXアプリで入手可能なAPIキーが含まれています。

### OpenTelemetry Javaエージェントを使用してアプリケーションを実行する {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```
<br/>
Java OpenTelemetryの計測についての詳細は、こちらをお読みください: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
