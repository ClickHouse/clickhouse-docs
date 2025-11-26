---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Java SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Java'
doc_type: 'guide'
keywords: ['Java SDK ClickStack', 'Java OpenTelemetry ClickStack', 'Java SDK для наблюдаемости', 'интеграция ClickStack с Java', 'мониторинг Java-приложений']
---

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (логов и
трейсов). Трейсы генерируются автоматически с помощью автоматической
инструментации, поэтому ручная инструментация не требуется, чтобы получать ценность от трассировки.

**В этом руководстве интегрируются:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трейсы</td>
    </tr>
  </tbody>
</table>



## Начало работы

:::note
В настоящее время интеграция совместима только с **Java 8+**
:::

### Скачивание Java-агента OpenTelemetry

Скачайте [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
и поместите JAR-файл в выбранный вами каталог. Этот JAR-файл содержит агент
и библиотеки инструментирования. Вы также можете использовать следующую команду,
чтобы скачать агент:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### Настройка переменных окружения

Далее вам нужно будет настроить в своей оболочке следующие переменные окружения для отправки телеметрии в ClickStack:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:ПУТЬ/К/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<ВАШ_API_КЛЮЧ_ИНГЕСТИИ>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<НАЗВАНИЕ_ВАШЕГО_ПРИЛОЖЕНИЯ_ИЛИ_СЕРВИСА>'
```

*Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX; можно задать любое удобное вам имя.*

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит ключ API, доступный в приложении HyperDX в разделе `Team Settings → API Keys`.

### Запуск приложения с Java-агентом OpenTelemetry

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

Подробнее об инструментировании Java в OpenTelemetry см.: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
