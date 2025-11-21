---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Java SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java SDK наблюдаемости', 'Интеграция ClickStack с Java', 'Мониторинг Java-приложений']
---

ClickStack использует стандарт OpenTelemetry для сбора данных телеметрии (логов и
трейсов). Трейсы генерируются автоматически с помощью автоматической инструментации, поэтому ручная
инструментация не требуется, чтобы получить ценность от трассировки.

**В этом руководстве описывается интеграция:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>



## Начало работы {#getting-started}

:::note
В настоящее время интеграция совместима только с **Java 8+**
:::

### Загрузка агента OpenTelemetry Java {#download-opentelemtry-java-agent}

Загрузите [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
и поместите JAR-файл в выбранный каталог. JAR-файл содержит агент
и библиотеки инструментирования. Также можно использовать следующую команду для
загрузки агента:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### Настройка переменных окружения {#configure-environment-variables}

После этого необходимо настроить следующие переменные окружения в вашей оболочке для отправки телеметрии в ClickStack:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX. Можно указать любое имя._

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит ключ API, доступный в приложении HyperDX в разделе `Team Settings → API Keys`.

### Запуск приложения с агентом OpenTelemetry Java {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />
Подробнее об инструментировании Java OpenTelemetry:
[https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
