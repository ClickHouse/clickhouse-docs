---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Java SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java observability SDK', 'ClickStack Java integration', 'Java application monitoring']
---

ClickStack использует стандарт OpenTelemetry для сбора данных телеметрии (логов и
трейсов). Трейсы автоматически создаются с помощью автоматического инструментиования, поэтому
ручное инструментиование не требуется, чтобы извлекать пользу из трассировки.

**Это руководство охватывает интеграцию:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>

## Начало работы \\{#getting-started\\}

:::note
В настоящее время интеграция поддерживает только **Java 8+**.
:::

### Загрузка Java-агента OpenTelemetry \\{#download-opentelemtry-java-agent\\}

Скачайте [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
и поместите JAR-файл в выбранный каталог. JAR-файл содержит агент
и библиотеки инструментирования. Вы также можете использовать следующую команду,
чтобы скачать агент:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### Настройте переменные окружения \\{#configure-environment-variables\\}

Далее необходимо настроить в оболочке следующие переменные окружения для отправки телеметрии в ClickStack:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

*Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации сервиса в приложении HyperDX. Можно указать любое удобное имя.*

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит ключ API, доступный в приложении HyperDX в разделе `Team Settings → API Keys`.

### Запустите приложение с Java-агентом OpenTelemetry \\{#run-the-application-with-otel-java-agent\\}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

Подробнее об инструментировании Java с помощью OpenTelemetry читайте здесь: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
