---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для мониторинга'
slug: /observability/integrating-opentelemetry
keywords: ['мониторинг', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';

# Интеграция OpenTelemetry для сбора данных

Любое решение для мониторинга требует средства для сбора и экспорта логов и трейсов. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

"OpenTelemetry — это фреймворк и инструментарий для мониторинга, предназначенный для создания и управления телеметрическими данными, такими как трейсы, метрики и логи."

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бэкендом для мониторинга, а в основном сосредоточен на генерации, сборе, управлении и экспорте телеметрических данных. Хотя изначальная цель OpenTelemetry заключалась в том, чтобы упростить пользователям инструментирование своих приложений или систем с использованием SDK, специализированных для конкретного языка, он расширился для включения сбора логов через сборщик OpenTelemetry — агента или прокси, который получает, обрабатывает и экспортирует телеметрические данные.
## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из ряда компонентов. Кроме предоставления спецификации данных и API, стандартизированного протокола и соглашений о наименовании для полей/колонок, OTel предоставляет две возможности, которые являются фундаментальными для создания решения для мониторинга с ClickHouse:

- [Сборщик OpenTelemetry](https://opentelemetry.io/docs/collector/) — это прокси, который получает, обрабатывает и экспортирует телеметрические данные. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед пакетированием и вставкой.
- [Языковые SDK](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDK эффективно обеспечивают корректную запись трейсов в коде приложения, создавая составные спаны и обеспечивая дальнейшую передачу контекста между сервисами через метаданные — таким образом формируя распределённые трейсы и обеспечивая корреляцию спанов. Эти SDK дополняются экосистемой, которая автоматически реализует общие библиотеки и фреймворки, что означает, что пользователю не нужно изменять свой код, и он получает инструментирование из коробки.

Решение для мониторинга на базе ClickHouse использует оба этих инструмента.
## Распространения {#distributions}

Сборщик OpenTelemetry имеет [ряд распространений](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Получатель filelog вместе с экспортером ClickHouse, необходимым для решения на базе ClickHouse, присутствует только в [распространении OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Это распространение содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при запуске в производственной среде рекомендуется ограничить сборщик только теми компонентами, которые необходимы для данной среды. Некоторые причины для этого:

- Уменьшение размера сборщика, что уменьшает время развертывания сборщика.
- Повышение безопасности сборщика за счёт уменьшения доступной поверхности атаки.

Создание [индивидуального сборщика](https://opentelemetry.io/docs/collector/custom-collector/) можно осуществить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).
## Приём данных с OTel {#ingesting-data-with-otel}
### Роли развертывания сборщика {#collector-deployment-roles}

Для сбора логов и вставки их в ClickHouse мы рекомендуем использовать сборщик OpenTelemetry. Сборщик OpenTelemetry может быть развернут в двух основных ролях:

- **Агент** — экземпляры агента собирают данные на краю, например, на серверах или на узлах Kubernetes, или получают события непосредственно от приложений — инструментированных с помощью SDK OpenTelemetry. В последнем случае экземпляр агента работает с приложением или на том же хосте, что и приложение (например, в качестве sidecar или DaemonSet). Агенты могут либо отправлять свои данные непосредственно в ClickHouse, либо в экземпляр шлюза. В первом случае это называется [паттерном развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Шлюз** — экземпляры шлюза предоставляют автономный сервис (например, развертывание в Kubernetes), как правило, на кластер, Центр обработки данных или регион. Эти экземпляры получают события от приложений (или других сборщиков как агенты) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов с использованием готового балансировщика нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую конечную точку, это часто называется [паттерном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

Ниже мы предполагаем простой сборщик-агент, отправляющий свои события напрямую в ClickHouse. Смотрите [Масштабирование с помощью шлюзов](#scaling-with-gateways) для получения дополнительных сведений о использовании шлюзов и когда они применимы.
### Сбор логов {#collecting-logs}

Основное преимущество использования сборщика заключается в том, что он позволяет вашим сервисам быстро разгружать данные, оставляя сборщику заботу о дополнительной обработке, такой как повторы, пакетирование, шифрование или даже фильтрация конфиденциальных данных.

Сборщик использует термины [получатель](https://opentelemetry.io/docs/collector/configuration/#receivers), [процессор](https://opentelemetry.io/docs/collector/configuration/#processors) и [экспортер](https://opentelemetry.io/docs/collector/configuration/#exporters) для своих трех основных этапов обработки. Получатели используются для сбора данных и могут быть основаны на дополнительной или вытягиваемой модели. Процессоры предоставляют возможность выполнять преобразования и обогащение сообщений. Экспортеры отвечают за отправку данных в нижестоящий сервис. Хотя этот сервис может, теоретически, быть другим сборщиком, мы предполагаем, что все данные отправляются напрямую в ClickHouse для начального обсуждения ниже.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором получателей, процессоров и экспортеров.

Сборщик предоставляет два основных получателя для сбора логов:

**Через OTLP** — в этом случае логи отправляются (выталкиваются) напрямую в сборщик из SDK OpenTelemetry через протокол OTLP. [Демо OpenTelemetry](https://opentelemetry.io/docs/demo/) применяет этот подход, при этом экспортеры OTLP на каждом языке предполагают конечную точку локального сборщика. Сборщик должен быть настроен с получателем OTLP в этом случае — см. выше [демонстрацию для конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода в том, что данные логов будут автоматически содержать Trace Id, позволяя пользователям впоследствии идентифицировать трейсы для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через otlp" size="md"/>

Этот подход требует, чтобы пользователи инструментировали свой код с помощью [подходящего SDK языка](https://opentelemetry.io/docs/languages/).

- **Скрейпинг через получатель filelog** — этот получатель отслеживает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Этот получатель справляется со сложными задачами, такими как обнаружение многострочных сообщений, обработка смены логов, контрольные точки для повышения надежности перезапуска и извлечение структуры. Этот получатель также способен отслеживать логи контейнеров Docker и Kubernetes, развертываемые в качестве helm chart, [извлекая структуру из них](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями пода.

<Image img={observability_5} alt="Получатель файловых логов" size="md"/>

**Большинство развертываний будут использовать комбинацию вышеперечисленных получателей. Мы рекомендуем пользователям ознакомиться с [документацией сборщика](https://opentelemetry.io/docs/collector/) и изучить основные концепции, а также [структуру конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методы установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::
## Структурированные и неструктурированные логи {#structured-vs-unstructured}

Логи могут быть как структурированными, так и неструктурированными.

Структурированный лог будет использовать такой формат данных, как JSON, определяя поля метаданных, такие как http код и IP-адрес источника.

```json
{
    "remote_addr":"54.36.149.41",
    "remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET",
    "request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1",
    "status":"200",
    "size":"30577",
    "referer":"-",
    "user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

Неструктурированные логи, хотя обычно и имеют некоторую внутреннюю структуру, извлекаемую через шаблон regex, будут представлять лог исключительно как строку.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем пользователям использовать структурированное ведение логов и записывать в JSON (т.е. ndjson), когда это возможно. Это упростит необходимую обработку логов позже, либо перед отправкой в ClickHouse с помощью [процессоров сборщика](https://opentelemetry.io/docs/collector/configuration/#processors), либо во время вставки с использованием материализованных представлений. Структурированные логи в конечном счёте сэкономят ресурсы на последующей обработке, уменьшая необходимую производительность CPU в вашем решении ClickHouse.
### Пример {#example}

В качестве примера мы предоставляем структурированный (JSON) и неструктурированный набор данных логов, каждый из которых содержит примерно 10 млн строк, доступных по следующим ссылкам:

- [Неструктурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [Структурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

Мы используем структурированный набор данных для примера ниже. Убедитесь, что этот файл загружен и извлечён, чтобы воспроизвести следующие примеры.

Следующая конфигурация представляет собой простую настройку для OTel Collector, который считывает эти файлы на диске, используя получатель filelog, и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), так как наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите ClickHouse для парсинга
Приведённый ниже пример извлекает временную метку из лога. Это требует использования оператора `json_parser`, который преобразует всю строку лога в строку JSON, помещая результат в `LogAttributes`. Это может быть вычислительно затратным, и [это можно сделать более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный неструктурированный пример, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md), чтобы достичь этого, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
:::

**[config-structured-logs.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_1*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Blogging%5D%7E)**

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [logging]
```

Пользователи могут следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для локальной установки сборщика. Важно убедиться, что инструкции модифицированы для использования [распространения contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (которое содержит получатель `filelog`), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователи должны загрузить `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Выпуски можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки сборщик OTel можно запустить с помощью следующих команд:

```bash
./otelcol-contrib --config config-logs.yaml
```

При использовании структурированных логов сообщения будут иметь следующий вид на выходе:

```response
LogRecord #98
ObservedTimestamp: 2024-06-19 13:21:16.414259 +0000 UTC
Timestamp: 2019-01-22 01:12:53 +0000 UTC
SeverityText:
SeverityNumber: Unspecified(0)
Body: Str({"remote_addr":"66.249.66.195","remote_user":"-","run_time":"0","time_local":"2019-01-22 01:12:53.000","request_type":"GET","request_path":"\/product\/7564","request_protocol":"HTTP\/1.1","status":"301","size":"178","referer":"-","user_agent":"Mozilla\/5.0 (Linux; Android 6.0.1; Nexus 5X Build\/MMB29P) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/41.0.2272.96 Mobile Safari\/537.36 (compatible; Googlebot\/2.1; +http:\/\/www.google.com\/bot.html)"})
Attributes:
        -> remote_user: Str(-)
        -> request_protocol: Str(HTTP/1.1)
        -> time_local: Str(2019-01-22 01:12:53.000)
        -> user_agent: Str(Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html))
        -> log.file.name: Str(access.log)
        -> status: Str(301)
        -> size: Str(178)
        -> referer: Str(-)
        -> remote_addr: Str(66.249.66.195)
        -> request_type: Str(GET)
        -> request_path: Str(/product/7564)
        -> run_time: Str(0)
Trace ID:
Span ID:
Flags: 0
```

Выше приведено одно сообщение лога, созданное сборщиком OTel. Эти же сообщения мы будем внедрять в ClickHouse в последующих разделах.

Полная схема сообщений логов, вместе с дополнительными колонками, которые могут присутствовать при использовании других получателей, поддерживается [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевым моментом здесь является то, что строка лога сама хранится как строка в поле `Body`, но JSON автоматически извлекается в поле Attributes благодаря `json_parser`. Этот же [оператор](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующую колонку `Timestamp`. Для рекомендаций по обработке логов с OTel см. [Обработка](#processing---filtering-transforming-and-enriching).

:::note Операторы
Операторы — это самая базовая единица обработки логов. Каждый оператор выполняет одну задачу, такую как чтение строк из файла или парсинг JSON из поля. Операторы затем объединяются в конвейере, чтобы достичь желаемого результата.
:::

У вышеприведённых сообщений отсутствуют поля `TraceID` и `SpanID`. Если такие поля присутствуют, например, в случаях, когда пользователи реализуют [распределённое отслеживание](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON с использованием тех же техник, что и выше.

Для пользователей, которым необходимо собирать локальные или Kubernetes файлы логов, мы рекомендуем ознакомиться с доступными параметрами конфигурации для [получателя filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) и тем, как обрабатываются [смещения](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [парсинг многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).
## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем руководство [документации OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). Рекомендуется использовать [Обработчик атрибутов Kubernetes](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) для обогащения логов и метрик метаданными пода. Это может потенциально создавать динамические метаданные, такие как метки, хранящиеся в колонке `ResourceAttributes`. ClickHouse в настоящее время использует тип `Map(String, String)` для этой колонки. Смотрите [Использование карт](/use-cases/observability/schema-design#using-maps) и [Извлечение из карт](/use-cases/observability/schema-design#extracting-from-maps) для получения дополнительных сведений о работе с этим типом и его оптимизации.
## Сбор трейсов {#collecting-traces}

Для пользователей, которые хотят инструментировать свой код и собирать трейсы, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставлять события в ClickHouse, пользователям необходимо развернуть сборщик OTel для получения событий трейсов по протоколу OTLP через соответствующий получатель. Демонстрация OpenTelemetry предоставляет [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в сборщик. Пример соответствующей конфигурации сборщика, который выводит события в stdout, показан ниже:
### Пример {#example-1}

Поскольку трейсы должны приниматься через OTLP, мы используем инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трейсов. Следуйте инструкциям [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для установки.

Следующая конфигурация принимает события трейсов на получателе OTLP, прежде чем отправить их в stdout.

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 1s
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

Запустите эту конфигурацию через:

```bash
./otelcol-contrib --config config-traces.yaml
```

Отправьте события трейсов в сборщик через `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

Это приведёт к тому, что сообщения трейсов, подобные следующему примеру, будут выводиться в stdout:

```response
Span #86
        Trace ID        : 1bb5cdd2c9df5f0da320ca22045c60d9
        Parent ID       : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Name            : okey-dokey-0
        Kind            : Server
        Start time      : 2024-06-19 18:03:41.603868 +0000 UTC
        End time        : 2024-06-19 18:03:41.603991 +0000 UTC
        Status code     : Unset
        Status message :
Attributes:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

Выше представлено одно сообщение трейса, созданное сборщиком OTel. Эти же сообщения мы будем внедрять в ClickHouse в последующих разделах.

Полная схема трейсов поддерживается [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.
## Обработка - фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как было продемонстрировано в предыдущем примере установки временной метки для события лога, пользователи неизбежно захотят фильтровать, преобразовывать и обогащать сообщения событий. Это можно достичь с помощью нескольких возможностей в OpenTelemetry:

- **Процессоры** — Процессоры берут данные, собранные [получателями, и модифицируют или преобразуют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортерам. Процессоры применяются в порядке, заданном в разделе `processors` конфигурации сборщика. Эти операции являются необязательными, но минимальный набор обычно рекомендуется [здесь](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании сборщика OTel с ClickHouse мы рекомендуем ограничить процессоры следующими:

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с нехваткой памяти на сборщике. См. [Оценка ресурсов](#estimating-resources) для рекомендаций.
    - Любой процессор, который выполняет обогащение на основе контекста. Например, [Обработчик атрибутов Kubernetes](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов спанов, метрик и логов с метаданными k8s, например обогащая события идентификатором источника пода.
    - [Выборка по хвосту или голове](https://opentelemetry.io/docs/concepts/sampling/) при необходимости для трейсов.
    - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) - Удаление событий, которые не требуются, если это нельзя сделать с помощью оператора (см. ниже).
    - [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - обязательно при работе с ClickHouse для обеспечения отправки данных пакетами. См. ["Экспорт в ClickHouse"](#exporting-to-clickhouse).

- **Операторы** - [Операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) обеспечивают самую базовую единицу обработки, доступную на получателе. Поддерживается базовый парсинг, позволяющий устанавливать такие поля, как Уровень серьёзности и Временная метка. Поддерживается парсинг JSON и regex, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью операторов или [трансформационных процессоров](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Эти операции могут привести к значительным затратам на память и CPU, особенно при парсинге JSON. Все обработки возможно выполнить в ClickHouse во время вставки с помощью материализованных представлений и колонок с некоторыми исключениями - в частности, обогащение с учётом контекста, например добавление метаданных k8s. Дополнительные сведения см. в [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с использованием сборщика OTel, мы рекомендуем производить преобразования на экземплярах шлюзов и минимизировать любую работу, выполняемую на экземплярах агентов. Это обеспечит минимальные ресурсы, необходимые агентам на краю, работающим на серверах. Обычно мы наблюдаем, что пользователи выполняют только фильтрацию (для минимизации ненужного сетевого использования), установку временной метки (с помощью операторов) и обогащение, которое требует контекста у агентов. Например, если экземпляры шлюзов находятся в другом кластере Kubernetes, обогащение k8s необходимо будет выполнять на агенте.
### Пример {#example-2}

Следующая конфигурация показывает сбор неструктурированного файла логов. Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, вместе с процессором для пакетирования событий и ограничения использования памяти.

[config-unstructured-logs-with-processor.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-unstructured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_regex*_parser*N_______regex%3A_*%22%5E*C*QP*Lip*G%5B*Bd.%5D*P*D*Bs*P-*Bs*P-*Bs*P*B%5B*C*QP*Ltimestamp*G%5B%5E*B%5D%5D*P*D*B%5D*Bs*P%22*C*QP*Lmethod*G%5BA-Z%5D*P*D*Bs*P*C*QP*Lurl*G%5B%5E*Bs%5D*P*D*Bs*PHTTP%2F%5B%5E*Bs%5D*P%22*Bs*P*C*QP*Lstatus*G*Bd*P*D*Bs*P*C*QP*Lsize*G*Bd*P*D*Bs*P%22*C*QP*Lreferrer*G%5B%5E%22%5D***D%22*Bs*P%22*C*QP*Luser*_agent*G%5B%5E%22%5D***D%22*%22*N_______timestamp%3A*N_________parse*_from%3A_attributes.timestamp*N_________layout%3A_*%22*.d%2F*.b%2F*.Y%3A*.H%3A*.M%3A*.S_*.z*%22*N_________*H22%2FJan%2F2019%3A03%3A56%3A14_*P0330*N*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_1s*N___send*_batch*_size%3A_100*N_memory*_limiter%3A*N___check*_interval%3A_1s*N___limit*_mib%3A_2048*N___spike*_limit*_mib%3A_256*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%2C_memory*_limiter%5D*N_____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch, memory_limiter]
      exporters: [logging]
```

```bash
./otelcol-contrib --config config-unstructured-logs-with-processor.yaml
```
## Экспорт в ClickHouse {#exporting-to-clickhouse}

Экспортеры отправляют данные в один или несколько бэкэндов или назначений. Экспортеры могут быть на основе pull или push. Чтобы отправлять события в ClickHouse, пользователям необходимо использовать экспортер на основе push - [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основной дистрибуции. Пользователи могут использовать дистрибуцию contrib или [создать собственный collector](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Ниже показан полный файл конфигурации.

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 5000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    # ttl: 72h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 5s
    database: default
    sending_queue:
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s


service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [clickhouse]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

Обратите внимание на следующие ключевые настройки:

- **pipelines** - В приведенной конфигурации подчеркивается использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора приемников, процессоров и экспортеров для логов и трассировок.
- **endpoint** - Связь с ClickHouse настраивается с помощью параметра `endpoint`. Строка соединения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` обеспечивает связь по TCP. Если пользователи предпочитают HTTP по причинам переключения трафика, измените эту строку соединения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные детали подключения, включая возможность указания имени пользователя и пароля в этой строке соединения, описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что вышеупомянутая строка соединения позволяет как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба варианта. Смотрите [Batching](#batching) для получения дополнительной информации об асинхронных вставках. Сжатие должно быть указано всегда и по умолчанию не будет включено в старых версиях экпортеров.

- **ttl** - значение здесь определяет, как долго данные будут храниться. Дополнительные детали в "Управление данными". Это должно быть указано в виде единицы времени в часах, например, 72h. В примере ниже мы отключаем TTL, поскольку наши данные с 2019 года и будут удалены ClickHouse немедленно, если будут вставлены.
- **traces_table_name** и **logs_table_name** - определяют название таблиц для логов и трассировок.
- **create_schema** - определяет, будут ли таблицы созданы с использованием схем по умолчанию при запуске. По умолчанию это true для начала. Пользователи должны установить значение на false и определить свою собственную схему.
- **database** - целевая база данных.
- **retry_on_failure** - настройки для определения, следует ли повторять неудачные пакеты.
- **batch** - пакетный процессор гарантирует, что события будут отправлены пакетами. Мы рекомендуем значение около 5000 с тайм-аутом 5s. Какое из этих значений будет достигнуто первым, инициирует сброс пакета к экспортеру. Снижение этих значений приведет к более низкой задержке конвейера с доступными данными для запросов быстрее, за счет большего числа соединений и пакетов, отправленных в ClickHouse. Это не рекомендуется, если пользователи не используют [асинхронные вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), поскольку это может вызвать проблемы с [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют асинхронные вставки, доступность данных для запросов также будет зависеть от настроек асинхронных вставок - хотя данные все равно будут сброшены из коннектора раньше. Смотрите [Batching](#batching) для получения более подробной информации.
- **sending_queue** - управляет размером очереди отправки. Каждый элемент в очереди содержит пакет. Если эта очередь будет превышена, например, из-за того, что ClickHouse недоступен, но события продолжают поступать, пакеты будут отброшены.

Предполагая, что пользователи извлекли структурированный лог-файл и у них запущен [локальный экземпляр ClickHouse](/install) (с настройками по умолчанию), пользователи могут запустить эту конфигурацию с помощью команды:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки этому коллектору, выполните следующую команду, используя инструмент `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска подтвердите, что события логов присутствуют с помощью простого запроса:

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:             0
SeverityText:
SeverityNumber:         0
ServiceName:
Body:                   {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:        {}
LogAttributes:          {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.
 
Аналогичным образом, для событий трассировки пользователи могут проверить таблицу `otel_traces`:

```sql
SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2024-06-20 11:36:41.181398000
TraceId:                00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:                 beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:               lets-go
SpanKind:               SPAN_KIND_CLIENT
ServiceName:            telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:              telemetrygen
ScopeVersion:
SpanAttributes:         {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:               123000
StatusCode:             STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:            []
Events.Attributes:  []
Links.TraceId:          []
Links.SpanId:           []
Links.TraceState:   []
Links.Attributes:   []
```

## Схема по умолчанию {#out-of-the-box-schema}

По умолчанию экспортер ClickHouse создает целевую таблицу логов как для логов, так и для трассировок. Это можно отключить с помощью настройки `create_schema`. Более того, имена таблиц для логов и трассировок можно изменить с их значений по умолчанию `otel_logs` и `otel_traces` согласно вышеуказанным настройкам.

:::note
В приведенных ниже схемах мы предполагаем, что TTL был включен на 72h.
:::

Схема по умолчанию для логов показана ниже (`otelcol-contrib v0.102.1`):

```sql
CREATE TABLE default.otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

Столбцы здесь коррелируют с официальной спецификацией OTel для логов, описанной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных примечаний по этой схеме:

- По умолчанию таблица разбита на партиции по дате с помощью `PARTITION BY toDate(Timestamp)`. Это делает удаление истекших данных эффективным.
- TTL устанавливается с помощью `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, установленному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что только целые части удаляются, когда все находящиеся в них строки истекли. Это более эффективно, чем удаление строк внутри частей, что приводит к дорогому удалению. Мы рекомендуем всегда устанавливать эту опцию. Смотрите [Управление данными с помощью TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения дополнительной информации.
- Таблица использует классический [`MergeTree` движок](/engines/table-engines/mergetree-family/mergetree). Это рекомендуется для логов и трассировок и не должно изменяться.
- Таблица упорядочена по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это значит, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` - более ранние столбцы в списке будут фильтровать быстрее, чем более поздние, например, фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Пользователи должны изменять эту сортировку в соответствии с ожидаемыми паттернами доступа - смотрите [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- В приведенной схеме применяется `ZSTD(1)` к столбцам. Это обеспечивает лучшее сжатие для логов. Пользователи могут увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для достижения лучшего сжатия, хотя это редко бывает полезным. Увеличение этого значения приведет к большему использованию CPU в момент вставки (при сжатии), хотя декомпрессия (и, следовательно, запросы) должны оставаться сопоставимыми. Смотрите [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для получения дополнительной информации. Дополнительное [дельта-кодирование](/sql-reference/statements/create/table#delta) применяется к Timestamp с целью уменьшения его размера на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются картами. Пользователи должны познакомиться с различиями между ними. Для того чтобы получить доступ к этим картам и оптимизировать доступ к ключам внутри них, смотрите [Использование карт](/use-cases/observability/integrating-opentelemetry.md).
- Большинство других типов, таких как `ServiceName` с LowCardinality, оптимизированы. Обратите внимание, что Body, хотя в наших примерах логов является JSON, хранится как String.
- Фильтры Блума применяются к ключам и значениям карт, а также к столбцу Body. Они предназначены для улучшения времени выполнения запросов при доступе к этим столбцам, но обычно не требуются. Смотрите [Вторичные/индексы для пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).

```sql
CREATE TABLE default.otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

Схема здесь также будет соответствовать столбцам, соответствующим официальной спецификации OTel для трассировок, указанной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Схема здесь использует многие из тех же настроек, что и вышеуказанная схема логов, с дополнительными столбцами Links, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схемы и создавать свои таблицы вручную. Это позволяет модифицировать первичные и вторичные ключи, а также предоставляет возможность добавления дополнительных столбцов для оптимизации производительности запросов. Для получения дополнительной информации смотрите [Проектирование схем](/use-cases/observability/schema-design).
## Оптимизация вставок {#optimizing-inserts}

Чтобы достичь высокой производительности вставки при получении сильных гарантий согласованности, пользователи должны следовать простым правилам при вставке данных наблюдаемости в ClickHouse через коллектор. При правильной настройке OTel коллектора следование приведенным ниже правилам должно быть простым. Это также позволяет избежать [распространенных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми сталкиваются пользователи при первом использовании ClickHouse.
### Пакетирование {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, заставляет ClickHouse немедленно создавать часть хранения, содержащую данные из вставки вместе с другими метаданными, которые нужно хранить. Поэтому отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, снизит количество необходимых записей. Мы рекомендуем вставлять данные довольно крупными пакетами, по крайней мере по 1000 строк за раз. Дополнительные детали [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если идентичны. Для таблиц семейства движка MergeTree, ClickHouse по умолчанию автоматически [удаляет дубликаты вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это значит, что вставки терпимы в таких случаях, как следующие:

- (1) Если узел, получающий данные, имеет проблемы, запрос вставки истечет (или получит более конкретную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за перебоев в сети, отправитель либо получит тайм-аут, либо сетевую ошибку.

С точки зрения коллектора (1) и (2) могут быть трудно различимы. Однако в обоих случаях неподтвержденную вставку можно сразу же повторить. Пока повторяемый запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если оригинальная вставка (неподтвержденная) прошла успешно.

Мы рекомендуем пользователям использовать [пакетный процессор](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, чтобы удовлетворить вышеприведенные требования. Это гарантирует, что вставки будут отправляться в виде согласованных пакетов строк, удовлетворяющих этим требованиям. Если от коллектора ожидается высокая пропускная способность (события в секунду), и по крайней мере 5000 событий могут быть отправлены в каждой вставке, это обычно единственное пакетирование, необходимое в конвейере. В этом случае коллектор будет сбрасывать пакеты, прежде чем будет достигнут `timeout` пакетного процессора, гарантируя, что задержка от конца до конца конвейера остается низкой, а пакеты имеют постоянный размер.
### Используйте асинхронные вставки {#use-asynchronous-inserts}

Как правило, пользователей заставляют отправлять меньшие пакеты, когда пропускная способность коллектора низка, и при этом они все равно рассчитывают на то, что данные достигнут ClickHouse с минимальной задержкой от конца до конца. В этом случае небольшие пакеты отправляются, когда истекает `timeout` пакетного процессора. Это может вызвать проблемы и тогда требуются асинхронные вставки. Эта ситуация обычно возникает, когда **коллекторы в роли агента настроены для отправки непосредственно в ClickHouse**. Шлюзы, действуя в качестве агрегаторов, могут облегчить эту проблему - смотрите [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если крупные пакеты не могут быть гарантированы, пользователи могут делегировать пакетирование ClickHouse с помощью [асинхронных вставок](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются на хранилище базы данных позже или асинхронно соответственно.

<Image img={observability_6} alt="Async inserts" size="md"/>

С [включенными асинхронными вставками](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос на вставку, данные запроса ② немедленно записываются сначала в буфер в памяти. Когда ③ происходит следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные не могут быть истребованы с помощью запросов до того, как они будут сброшены в хранилище базы данных; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку соединения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (по умолчанию) для получения гарантий доставки - смотрите [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дополнительных деталей.

Данные из асинхронной вставки вставляются, как только буфер ClickHouse сбрасывается. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо через [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если значение `async_insert_stale_timeout_ms` установлено на ненулевое значение, данные вставляются после `async_insert_stale_timeout_ms миллисекунд` с момента последнего запроса. Пользователи могут настроить эти настройки, чтобы контролировать задержку от конца до конца в своем конвейере. Дополнительные настройки, которые могут быть использованы для настройки сброса буфера, документированы [здесь](/operations/settings/settings#async_insert). Обычно значения по умолчанию являются подходящими.

:::note Рассмотрите возможность использования адаптивных асинхронных вставок
В случаях, когда используется небольшое количество агентов, с низкой пропускной способностью, но строгими требованиями к задержке от конца до конца, [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) могут быть полезны. Обычно они не применимы к случаям наблюдаемости с высокой пропускной способностью, как это видно с ClickHouse.
:::

Наконец, поведенческая дубликация, связанная с синхронными вставками в ClickHouse, не включена по умолчанию при использовании асинхронных вставок. Если это необходимо, смотрите настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные детали по настройке этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), а углубленное изучение [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).
## Архитектуры развертывания {#deployment-architectures}

Несколько архитектур развертывания возможны при использовании OTel коллектора с Clickhouse. Мы описываем каждую из них ниже и когда они, вероятно, применимы.
### Только агенты {#agents-only}

В архитектуре только агентов пользователи развертывают OTel коллектора как агентов на краю. Они получают трассировки от локальных приложений (например, как контейнер sidecar) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные непосредственно в ClickHouse.

<Image img={observability_7} alt="Agents only" size="md"/>

Эта архитектура подходит для небольших и средних развертываний. Ее основное преимущество в том, что она не требует дополнительного оборудования и сохраняет общий ресурсный след решения наблюдаемости ClickHouse минимальным, с простым сопоставлением между приложениями и коллекторами.

Пользователи должны рассмотреть возможность перехода к архитектуре на основе шлюза, как только количество агентов превысит несколько сотен. Эта архитектура имеет несколько недостатков, которые усложняют масштабирование:

- **Масштабирование соединений** - Каждый агент устанавливает соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) параллельных соединений вставки, это в конечном итоге станет ограничивающим фактором и сделает вставки менее эффективными - т.е. больше ресурсов будет использовано ClickHouse для поддержания соединений. Использование шлюзов минимизирует количество соединений и делает вставки более эффективными.
- **Обработка на краю** - Любые преобразования или обработка событий должны выполняться на краю или в ClickHouse в этой архитектуре. Помимо ограничений, это может означать либо сложные материализованные представления ClickHouse, либо выполнение значительных вычислений на краю - где критические сервисы могут пострадать, а ресурсы могут быть дефицитом.
- **Малые пакеты и задержки** - Коллекторы-агенты могут собирать очень малое количество событий. Это обычно означает, что их нужно настраивать для сброса через определенные интервалы, чтобы удовлетворить SLA доставки. Это может привести к тому, что коллектор будет отправлять небольшие пакеты в ClickHouse. Хотя это недостаток, его можно смягчить с помощью асинхронных вставок - смотрите [Оптимизация вставок](#optimizing-inserts).
### Масштабирование с помощью шлюзов {#scaling-with-gateways}

Сборщики OTel могут быть развернуты в качестве экземпляров шлюза для решения вышеупомянутых ограничений. Они предоставляют самостоятельный сервис, обычно для каждого центра обработки данных или региона. Эти шлюзы принимают события от приложений (или других сборщиков в роли агента) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов, при этом используется готовый балансировщик нагрузки для распределения нагрузки между ними.

<Image img={observability_8} alt="Масштабирование с помощью шлюзов" size="md"/>

Целью этой архитектуры является разгрузка вычислительно интенсивной обработки от агентов, тем самым минимизируя их использование ресурсов. Эти шлюзы могут выполнять преобразовательные задачи, которые в противном случае должны выполнять агенты. Кроме того, агрегируя события от многих агентов, шлюзы могут гарантировать отправку больших партий в ClickHouse, что позволяет эффективно выполнять вставку. Эти сборщики шлюзов могут быть легко масштабированы по мере добавления новых агентов и увеличения пропускной способности событий. Пример конфигурации шлюза, с соответствующей конфигурацией агента, потребляющего пример файла структурированного журнала, показан ниже. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # Установите в false, если вы используете безопасное соединение
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено, так как 2 сборщика работают на одном хосте
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```

[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  otlp:
    protocols:
    grpc:
    endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 10000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4
    ttl: 96h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 10s
    database: default
    sending_queue:
      queue_size: 10000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

Эти конфигурации можно запустить с помощью следующих команд.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

Основной недостаток этой архитектуры заключается в связанных затратах и накладных расходах на управление набором сборщиков.

Для примера управления более крупными архитектурами на основе шлюзов с сопутствующим обучением, мы рекомендуем эту [статью в блоге](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).
### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что вышеуказанные архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka в качестве буфера сообщений является популярным шаблоном проектирования в архитектурах логирования, который был популяризирован стеком ELK. Это предоставляет несколько преимуществ; в первую очередь, это помогает обеспечить более надежную доставку сообщений и справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. В теории, кластерный экземпляр Kafka должен обеспечивать высокую пропускную способность сообщения, поскольку накладные расходы на запись данных линейно на диск меньше, чем на парсинг и обработку сообщения; в случае Elastic, например, токенизация и индексирование влекут за собой значительные накладные расходы. Перемещая данные от агентов, вы также снижаете риски потери сообщений в результате ротации журналов на источнике. Наконец, это предлагает некоторые возможности повторной отправки сообщений и репликации между регионами, что может быть привлекательно для некоторых случаев использования.

Однако ClickHouse может обрабатывать вставку данных очень быстро - миллионы строк в секунду на среднем оборудовании. Обратное давление от ClickHouse является **редким**. Часто использование очереди Kafka означает добавление архитектурной сложности и затрат. Если вы можете принять принцип, что журналы не требуют таких же гарантий доставки, как банковские транзакции и другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Тем не менее, если вам требуются высокие гарантии доставки или возможность воспроизведения данных (возможно, для нескольких источников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Добавление kafka" size="md"/>

В этом случае агенты OTel могут быть настроены для отправки данных в Kafka через [экспортер Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюза, в свою очередь, обрабатывают сообщения с помощью [приемника Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Мы рекомендуем ознакомление с документацией Confluent и OTel для получения дополнительных сведений.
### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для сборщика OTel будут зависеть от пропускной способности событий, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[На нашем опыте](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза с 3 ядрами и 12 ГБ оперативной памяти может обрабатывать около 60 000 событий в секунду. Это предполагает минимальный конвейер обработки, ответственный за переименование полей и отсутствие регулярных выражений.

Для экземпляров агентов, отвечающих за транспортировку событий в шлюз и устанавливающих временную метку на событие, мы рекомендуем пользователям оценивать размеры на основе предполагаемого объема журналов в секунду. Следующие значения представляют собой приблизительные цифры, которые пользователи могут использовать в качестве отправной точки:

| Скорость логирования | Ресурсы для агента сборки |
|----------------------|----------------------------|
| 1k/секунда           | 0.2CPU, 0.2GiB            |
| 5k/секунда           | 0.5 CPU, 0.5GiB           |
| 10k/секунда          | 1 CPU, 1GiB               |
