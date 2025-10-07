---
'slug': '/use-cases/observability/clickstack/sdks/java'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Java SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'Java'
'doc_type': 'guide'
---

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (логов и трассировок). Трассировки создаются автоматически с помощью автоматической инструментализации, поэтому ручная инструментализация не требуется для получения ценности от трассировки.

**В этом руководстве интегрируются:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✅ Метрики</td>
      <td className="pe-2">✅ Трассировки</td>
    </tr>
  </tbody>
</table>

## Начало работы {#getting-started}

:::note
В настоящее время интеграция совместима исключительно с **Java 8+**
:::

### Скачивание агента OpenTelemetry Java {#download-opentelemtry-java-agent}

Скачайте [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar) и разместите JAR в предпочтительной директории. JAR-файл содержит агент и библиотеки инструментализации. Вы также можете использовать следующую команду для скачивания агента:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### Настройка переменных окружения {#configure-environment-variables}

После этого вам нужно будет настроить следующие переменные окружения в вашей оболочке для отправки телеметрии в ClickStack:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX, она может иметь любое имя по вашему выбору._

Переменная окружения `OTEL_EXPORTER_OTLP_HEADERS` содержит ключ API, доступный через приложение HyperDX в `Настройки команды → Ключи API`.

### Запуск приложения с агентом OpenTelemetry Java {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```
<br/>
Читать больше о инструментализации Java OpenTelemetry можно здесь: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
