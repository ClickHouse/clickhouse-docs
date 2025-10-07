---
'title': 'Интеграция OpenTelemetry'
'description': 'Интеграция OpenTelemetry и ClickHouse для мониторинга'
'slug': '/observability/integrating-opentelemetry'
'keywords':
- 'Observability'
- 'OpenTelemetry'
'show_related_blogs': true
'doc_type': 'guide'
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

Любое решение по мониторингу требует средства для сбора и экспорта логов и трассировок. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

"OpenTelemetry - это фреймворк и набор инструментов для мониторинга, предназначенный для создания и управления телеметрическими данными, такими как трассировки, метрики и логи."

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бэкендом для мониторинга, а сосредоточен на генерации, сборе, управлении и экспорте телеметрических данных. Хотя первоначальной целью OpenTelemetry было облегчить пользователям инструментирование своих приложений или систем с использованием специфичных для языка SDK, проект расширился, чтобы включать сбор логов через OpenTelemetry Collector - агент или прокси, который получает, обрабатывает и экспортирует телеметрические данные.

## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из множества компонентов. Помимо предоставления спецификации данных и API, стандартизированного протокола и соглашений о наименованиях для полей/столбцов, OTel предлагает две возможности, которые являются фундаментальными для построения решения по мониторингу с ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) - это прокси, который получает, обрабатывает и экспортирует телеметрические данные. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед пакетной вставкой.
- [Языковые SDK](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDK эффективно гарантируют, что трассировки записываются корректно в коде приложения, генерируя составные спаны и обеспечивая распространение контекста по сервисам через метаданные - таким образом формируя распределенные трассировки и обеспечивая корреляцию спанов. Эти SDK дополняются экосистемой, которая автоматически внедряет общие библиотеки и фреймворки, что означает, что пользователю не требуется изменять свой код, и он получает инструментирование "из коробки".

Решение по мониторингу на базе ClickHouse использует оба этих инструмента.

## Дистрибутивы {#distributions}

OpenTelemetry collector имеет [несколько дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Приемник filelog вместе с экспортером ClickHouse, необходимым для решения на базе ClickHouse, присутствует только в [дистрибутиве OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при развертывании в производственной среде рекомендуется ограничить коллектор только теми компонентами, которые необходимы для данной среды. Вот некоторые причины для этого:

- Уменьшение размера коллектора, что сокращает время развертывания коллектора.
- Повышение безопасности коллектора путем уменьшения доступной площади атаки.

Создание [индивидуального коллектора](https://opentelemetry.io/docs/collector/custom-collector/) можно осуществить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).

## Прием данных с OTel {#ingesting-data-with-otel}

### Роли развертывания коллектора {#collector-deployment-roles}

Для сбора логов и вставки их в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector можно развернуть в двух основных ролях:

- **Агент** - экземплары агента собирают данные на краю сети, например, на серверах или на узлах Kubernetes, или получают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента работает вместе с приложением или на том же хосте, что и приложение (например, в качестве sidecar или DaemonSet). Агенты могут отправлять свои данные непосредственно в ClickHouse или на экземпляр шлюза. В первом случае это называется [шаблон развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Шлюз** - Экземпляры шлюза предоставляют отдельную службу (например, развертывание в Kubernetes), обычно на кластер, дата-центр или регион. Они получают события от приложений (или других коллекторов в качестве агентов) через единую точку доступа OTLP. Обычно развертывается набор экземпляров шлюза, с использованием готового балансировщика нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую точку доступа, это часто называется [шаблоном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

Далее мы предполагаем простой коллектор-агент, который отправляет свои события непосредственно в ClickHouse. См. [Масштабирование с использованием шлюзов](#scaling-with-gateways) для получения дополнительных сведений об использовании шлюзов и о том, когда они применимы.

### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора заключается в том, что он позволяет вашим сервисам быстро выгружать данные, оставляя Collectoru заботиться о дополнительной обработке, такой как повторные попытки, пакетирование, шифрование или даже фильтрация конфиденциальных данных.

Коллектор использует термины [приемник](https://opentelemetry.io/docs/collector/configuration/#receivers), [процессор](https://opentelemetry.io/docs/collector/configuration/#processors) и [экспортер](https://opentelemetry.io/docs/collector/configuration/#exporters) для своих трех основных этапов обработки. Приемники используются для сбора данных и могут быть как pull, так и push-ориентированными. Процессоры предоставляют возможность выполнения преобразований и обогащения сообщений. Экспортеры отвечают за отправку данных в прикладную службу. Хотя эта служба может теоретически быть другим коллектором, мы предполагаем, что все данные отправляются непосредственно в ClickHouse для первоначального обсуждения ниже.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором приемников, процессоров и экспортеров.

Коллектор предоставляет два основных приемника для сбора логов:

**Через OTLP** - В этом случае логи отправляются (пушатся) непосредственно в коллектор из OpenTelemetry SDK через протокол OTLP. [Демо OpenTelemetry](https://opentelemetry.io/docs/demo/) использует этот подход, при этом экспортеры OTLP для каждого языка предполагают локальную точку доступа коллектора. Коллектор в этом случае должен быть настроен с приемником OTLP — смотрите выше [демо для конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода заключается в том, что данные лога автоматически будут содержать Trace Ids, позволяя пользователям позже идентифицировать трассировки для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через otlp" size="md"/>

Этот подход требует от пользователей инструментировать свой код с помощью [соответствующего языка SDK](https://opentelemetry.io/docs/languages/).

- **Скрейпинг через приемник Filelog** - Этот приемник отслеживает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Этот приемник обрабатывает сложные задачи, такие как обнаружение мультилитейных сообщений, обработка ротации логов, контрольная точка для обеспечения надежности перезапуска и извлечение структуры. Этот приемник также может отслеживать логи контейнеров Docker и Kubernetes, которые можно развернуть как helm chart, [извлекая структуру из этих логов](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями пода.

<Image img={observability_5} alt="Приемник файла логов" size="md"/>

**Большинство развертываний будет использовать комбинацию вышеуказанных приемников. Мы рекомендуем пользователям ознакомиться с [документацией коллектора](https://opentelemetry.io/docs/collector/) и понять основные концепции, а также [структуру конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методы установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::
## Структурированные против неструктурированных {#structured-vs-unstructured}

Логи могут быть как структурированными, так и неструктурированными.

Структурированный лог будет использовать формат данных, такой как JSON, определяя метаданные, такие как http код и IP-адрес источника.

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

Неструктурированные логи, хотя также имеющие некоторую внутреннюю структуру, извлекаемую через регулярное выражение, будут представлять лог исключительно как строку.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем пользователям использовать структурированное логирование и логировать в JSON (т.е. ndjson), где это возможно. Это упростит последующую обработку логов, либо перед отправкой в ClickHouse с помощью [процессоров коллектора](https://opentelemetry.io/docs/collector/configuration/#processors), либо во время вставки с использованием материализованных представлений. Структурированные логи в конечном итоге сэкономят ресурсы для последующей обработки, снижающей необходимую производительность CPU в вашем решении на основе ClickHouse.

### Пример {#example}

Для примера мы предоставляем структурированный (JSON) и неструктурированный набор данных логов, каждый примерно с 10 млн строк, доступных по следующим ссылкам:

- [Неструктурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [Структурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

Мы используем структурированный набор данных для примера ниже. Убедитесь, что этот файл загружен и распакован, чтобы воспроизвести приведенные ниже примеры.

Ниже представлена простая конфигурация для OTel Collector, которая считывает эти файлы на диске, используя приемник filelog, и выводит полученные сообщения на stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), поскольку наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите ClickHouse для парсинга
Приведенный ниже пример извлекает временную метку из лога. Для этого требуется использование оператора `json_parser`, который преобразует всю строку лога в строку JSON, помещая результат в поле `LogAttributes`. Это может быть вычислительно затратным и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный неструктурированный пример, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения этого, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для локальной установки коллектора. Важно убедиться, что инструкции изменены для использования [дистрибуции contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (которая содержит приемник `filelog`), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователи должны загрузить `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить с помощью следующих команд:

```bash
./otelcol-contrib --config config-logs.yaml
```

Предполагая использование структурированных логов, сообщения будут иметь следующий вид на выходе:

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

Выше представлено одно сообщение лога, созданное OTel collector. Мы будем импортировать эти же сообщения в ClickHouse в следующих разделах.

Полная схема логов, наряду с дополнительными колонками, которые могут быть присутствовать при использовании других приемников, хранится [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевым моментом здесь является то, что сама строка лога хранится как строка в поле `Body`, но JSON был автоматически извлечен в поле Attributes благодаря оператору `json_parser`. Этот же [оператор](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) был использован для извлечения временной метки в соответствующий столбец `Timestamp`. Для рекомендаций по обработке логов с OTel см. [Обработка](#processing---filtering-transforming-and-enriching).

:::note Операторы
Операторы - это самая базовая единица обработки логов. Каждый оператор выполняет одну конкретную задачу, такую как чтение строк из файла или парсинг JSON из поля. Операторы затем связываются вместе в конвейере для достижения желаемого результата.
:::

Приведенные выше сообщения не имеют полей `TraceID` или `SpanID`. Если они присутствуют, например, в случаях, когда пользователи реализуют [распределенную трассировку](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), они могут быть извлечены из JSON с использованием тех же методов, показанных выше.

Для пользователей, которым нужно собирать локальные или Kubernetes файлы логов, мы рекомендуем ознакомиться с доступными параметрами конфигурации для [приемника filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) и как обрабатываются [смещения](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [парсинг многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).

## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем [документальное руководство OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). Рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) для обогащения логов и метрик метаданными пода. Это может потенциально создать динамические метаданные, например, метки, хранящиеся в колонке `ResourceAttributes`. ClickHouse в настоящее время использует тип `Map(String, String)` для этой колонки. Смотрите [Использование Maps](/use-cases/observability/schema-design#using-maps) и [Извлечение из maps](/use-cases/observability/schema-design#extracting-from-maps) для получения дополнительных сведений о работе с этим типом и оптимизации.

## Сбор трассировок {#collecting-traces}

Для пользователей, желающих инструментировать свой код и собирать трассировки, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Для передачи событий в ClickHouse пользователям необходимо развернуть OTel collector для получения событий трассировки через протокол OTLP с помощью соответствующего приемника. Демонстрация OpenTelemetry предоставляет [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий на коллектор. Пример соответствующей конфигурации коллектора, который выводит события на stdout, представлен ниже:

### Пример {#example-1}

Так как трассировки должны быть получены через OTLP, мы используем инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трассировки. Следуйте инструкциям [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для установки.

Следующая конфигурация получает события трассировки на приемнике OTLP, прежде чем отправить их на stdout.

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

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

Отправьте события трассировки на коллектор через `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

Это приведет к выводимым сообщениям трассировки, похожим на приведенный ниже пример, на stdout:

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

Выше представлено одно сообщение трассировки, созданное OTel collector. Мы будем импортировать эти же сообщения в ClickHouse в следующих разделах.

Полная схема сообщений трассировки хранится [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.

## Обработка - фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как было показано в предыдущем примере установки временной метки для события лога, пользователи неизбежно захотят фильтровать, преобразовывать и обогащать сообщения событий. Это можно сделать с помощью нескольких возможностей OpenTelemetry:

- **Процессоры** - Процессоры берут данные, собранные [приемниками, и модифицируют или трансформируют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой их экспортеру. Процессоры применяются в заданном порядке, как настроено в секции `processors` конфигурации коллектора. Эти процессоры являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничить число процессоров:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций, связанных с нехваткой памяти у коллектора. Смотрите [Оценка ресурсов](#estimating-resources) для рекомендаций.
  - Любой процессор, который делает обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов для спанов, метрик и логов с метаданными k8s, например, обогащая события идентификатором их источника пода.
  - [Tail или head sampling](https://opentelemetry.io/docs/concepts/sampling/), если требуется для трассировок.
  - [Основная фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) - исключение событий, которые не нужны, если это нельзя сделать с помощью оператора (см. ниже).
  - [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - необходимо при работе с ClickHouse, чтобы гарантировать, что данные отправляются пакетами. См. ["Экспорт в ClickHouse"](#exporting-to-clickhouse).

- **Операторы** - [Операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют самую базовую единицу обработки, доступную на приемнике. Поддерживается базовый парсинг, позволяющий устанавливать такие поля, как severity и timestamp. Поддерживается парсинг JSON и regex, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий именно здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с использованием операторов или [процессоров трансформации](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Это может привести к значительным накладным расходам на память и CPU, особенно при парсинге JSON. Возможность выполнить всю обработку в ClickHouse во время вставки с использованием материализованных представлений и столбцов, за некоторыми исключениями, - в частности, контекстное обогащение, например, добавление метаданных k8s. Для получения дополнительных сведений см. [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять преобразования на экземплярах шлюза и минимизировать любые действия на экземплярах агентов. Это обеспечит минимальную нагрузку на ресурсы, необходимую агентам на границе, работающим на серверах. Обычно мы видим, что пользователи выполняют только фильтрацию (чтобы минимизировать ненужное использование сети), установку временной метки (через операторов) и обогащение, которое требует контекста в агенте. Например, если экземпляры шлюза находятся в другом кластере Kubernetes, то обогащение k8s должно произойти в агенте.

### Пример {#example-2}

Следующая конфигурация показывает сбор неструктурированного файла логов. Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, наряду с процессором для пакетирования событий и ограничения потребления памяти.

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

Экспортеры отправляют данные в один или несколько бэкендов или пунктов назначения. Экспортеры могут быть pull или push-ориентированными. Для отправки событий в ClickHouse пользователям необходимо использовать push-ориентированный [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основной дистрибуции. Пользователи могут либо использовать дистрибуцию contrib, либо [создать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Полный файл конфигурации показан ниже.

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

- **pipelines** - В приведенной выше конфигурации подчеркивается использование [конвейеров](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора приемников, процессоров и экспортеров, по одному для логов и трассировок.
- **endpoint** - Связь с ClickHouse настраивается через параметр `endpoint`. Строка соединения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` обеспечивает связь по TCP. Если пользователи предпочитают HTTP по причинам переключения трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные детали соединения с возможностью указания имени пользователя и пароля в этой строке соединения описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что приведенная выше строка подключения включает как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба. Смотрите [Пакетирование](#batching) для получения дополнительных сведений об асинхронных вставках. Сжатие всегда должно быть указано и по умолчанию не будет активировано на более старых версиях экспортера.

- **ttl** - значение здесь определяет, как долго данные будут храниться. Дополнительные сведения смотрите в разделе "Управление данными". Это должно быть указано как единица времени в часах, например, 72h. Мы отключаем TTL в примере ниже, так как наши данные датированы 2019 годом и будут сразу удалены ClickHouse при вставке.
- **traces_table_name** и **logs_table_name** - определяет имя таблицы логов и трассировок.
- **create_schema** - определяет, создаются ли таблицы со схемами по умолчанию при запуске. По умолчанию true для начала работы. Пользователи должны установить его в false и определить свою собственную схему.
- **database** - целевая база данных.
- **retry_on_failure** - параметры для определения того, следует ли повторять неудачные пакеты.
- **batch** - процессор пакетирования обеспечивает отправку событий пакетами. Мы рекомендуем значение около 5000 с таймаутом в 5 секунд. То, что из этих значений достигнет первого, инициирует пакет, который будет сброшен экспортёру. Уменьшение этих значений приведет к меньшей задержке в конвейере с данными, доступными для запроса быстрее, за счет большего количества соединений и пакетов, отправленных в ClickHouse. Это не рекомендуется, если пользователи не используют [асинхронные вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может вызвать проблемы с [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют асинхронные вставки, доступность данных для запроса также будет зависеть от настроек асинхронного вставки - хотя данные по-прежнему будут сбрасываться из соединителя быстрее. Смотрите [Пакетирование](#batching) для получения дополнительных сведений.
- **sending_queue** - контролирует размер очереди отправки. Каждый элемент в очереди содержит пакет. Если эта очередь превышена, например, из-за недоступности ClickHouse, но события продолжают поступать, пакеты будут отброшены.

Предполагая, что пользователи распаковали структурированный файл лога и имеют [локальный экземпляр ClickHouse](/install), работающий (с подачей доступа по умолчанию), пользователи могут запустить эту конфигурацию с помощью команды:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки в этот коллектор, выполните следующую команду с использованием инструмента `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска подтвердите наличие событий журнала простым запросом:

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

Likewise, for trace events, users can check the `otel_traces` table:

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
## Схема 'из коробки' {#out-of-the-box-schema}

По умолчанию экспортер ClickHouse создает целевую таблицу логов для как логов, так и трассировок. Это можно отключить через настройку `create_schema`. Более того, имена как таблицы логов, так и трассировок могут быть изменены с их значений по умолчанию `otel_logs` и `otel_traces` через вышеуказанные настройки.

:::note
В нижеприведенных схемах мы предполагаем, что TTL был включен как 72 часа.
:::

Схема по умолчанию для логов представлена ниже (`otelcol-contrib v0.102.1`):

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

Столбцы здесь соответствуют официальной спецификации OTel для логов, задокументированной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных заметок по этой схеме:

- По умолчанию таблица разбита по дате с помощью `PARTITION BY toDate(Timestamp)`. Это делает эффективным удаление данных, которые истекли.
- TTL устанавливается с помощью `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, установленному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые части, когда все содержащиеся строки истекли. Это более эффективно, чем удаление строк внутри частей, что связано с дорогим удалением. Мы рекомендуем всегда устанавливать это значение. См. [Управление данными с TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения более подробной информации.
- Таблица использует классический [`MergeTree` движок](/engines/table-engines/mergetree-family/mergetree). Это рекомендуется для логов и трассировок и не должно требовать изменений.
- Таблица отсортирована по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` - более ранние столбцы в списке будут фильтроваться быстрее, чем более поздние. Например, фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Пользователи должны изменить эту сортировку в соответствии с ожидаемыми паттернами доступа - см. [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- Вышеприведенная схема применяет `ZSTD(1)` к столбцам. Это обеспечивает наилучшее сжатие для логов. Пользователи могут увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для улучшения сжатия, хотя это редко бывает полезно. Увеличение этого значения приведет к большему накладному времени CPU во время вставки (во время сжатия), хотя декомпрессия (и, таким образом, запросы) должны оставаться сопоставимыми. См. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для получения дальнейших деталей. Дополнительное [дельта-кодирование](/sql-reference/statements/create/table#delta) применяется к Timestamp с целью уменьшения его размера на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются ассоциативными массивами. Пользователи должны ознакомиться с различиями между ними. Для получения информации о том, как получить доступ к этим ассоциативным массивам и оптимизировать доступ к ключам внутри них, см. [Использование ассоциативных массивов](/use-cases/observability/schema-design#using-maps).
- Большинство других типов здесь, например, `ServiceName` как LowCardinality, оптимизированы. Обратите внимание, что `Body`, который является JSON в наших примерах логов, хранится как строка.
- Фильтры Блума применяются к ключам и значениям ассоциативных массивов, а также к столбцу `Body`. Это направлено на улучшение времени выполнения запросов для запросов, обращающихся к этим столбцам, но обычно не требуется. См. [Вторичные/индексы пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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

Снова, это будет коррелировать со столбцами, соответствующими официальной спецификации OTel для трассировок, задокументированной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Схема здесь применяет многие из тех же настроек, что и вышеуказанная схема логов с дополнительными столбцами Link, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схем и создать свои таблицы вручную. Это позволяет изменить первичные и вторичные ключи, а также дать возможность вводить дополнительные столбцы для оптимизации производительности запросов. Для получения дальнейших деталей см. [Проектирование схем](/use-cases/observability/schema-design).
## Оптимизация вставок {#optimizing-inserts}

Для достижения высокой производительности вставки при получении строгих гарантий консистентности пользователи должны следовать простым правилам при вставке данных наблюдаемости в ClickHouse через коллектор. При правильной конфигурации коллектора OTel следующие правила должны быть простыми в исполнении. Это также помогает избежать [распространенных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми сталкиваются пользователи в первый раз, используя ClickHouse.
### Пакетирование {#batching}

По умолчанию каждая вставка, отправляемая в ClickHouse, приводит к немедленному созданию части хранения, содержащей данные из вставки вместе с другой метаинформацией, которую необходимо хранить. Таким образом, отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, сократит необходимое число записей. Мы рекомендуем вставлять данные в довольно больших пакетах, как минимум по 1000 строк за раз. Подробнее [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если идентичны. Для таблиц семейства движков merge tree ClickHouse по умолчанию автоматически [удаляет дубликаты вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки являются устойчивыми к таким случаям:

- (1) Если узел, получающий данные, имеет проблемы, запрос вставки истечет по времени (или получит более конкретную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых перебоев, отправитель либо получит тайм-аут, либо сетевую ошибку.

С точки зрения коллектора (1) и (2) могут быть трудны для различения. Однако в обоих случаях неподтвержденная вставка может немедленно быть повторена. При условии, что повторно отправляемый запрос вставки содержит одни и те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если (неподтвержденная) оригинальная вставка прошла успешно.

Мы рекомендуем пользователям использовать [пакетный процессор](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, чтобы удовлетворить вышеуказанные требования. Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие вышеуказанным требованиям. Если ожидается, что коллектор будет иметь высокую пропускную способность (события в секунду), и как минимум 5000 событий могут быть отправлены в каждой вставке, это обычно единственное пакетирование, требуемое в конвейере. В этом случае коллектор будет сбрасывать пакеты перед истечением времени ожидания пакетного процессора `timeout`, гарантируя, что задержка от конца до конца конвейера остается низкой, а пакеты имеют согласованный размер.
### Используйте асинхронные вставки {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять меньшие пакеты, когда пропускная способность коллектора низка, но при этом они все еще ожидают, что данные прибудут в ClickHouse с минимальной задержкой от начала до конца. В этом случае небольшие пакеты отправляются, когда истекает время ожидания пакетного процессора. Это может вызывать проблемы, и именно тогда требуются асинхронные вставки. Этот случай обычно возникает, когда **коллекторы в роли агента настроены на отправку данных непосредственно в ClickHouse**. Шлюзы, действуя как агрегаторы, могут облегчить эту проблему - см. [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если большие пакеты не могут быть гарантированы, пользователи могут делегировать пакетирование ClickHouse с использованием [Асинхронных вставок](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). С асинхронными вставками данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно соответственно.

<Image img={observability_6} alt="Async inserts" size="md"/>

С [включенными асинхронными вставками](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос вставки, данные запроса ② немедленно записываются в буфер внутри памяти. Когда ③ происходит следующий сброс буфера, данные буфера сортируются и записываются как часть в хранилище базы данных. Обратите внимание, что данные не могут быть доступны для запросов до тех пор, пока они не будут сброшены в хранилище базы данных; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (по умолчанию) для получения гарантий доставки - см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дальнейших деталей.

Данные из асинхронной вставки вставляются после того, как буфер ClickHouse сброшен. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо после [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлено в ненулевое значение, данные вставляются после `async_insert_stale_timeout_ms миллисекунд` с момента последнего запроса. Пользователи могут настроить эти параметры для управления задержкой от начала до конца своего конвейера. Дополнительные настройки, которые могут быть использованы для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Обычно значения по умолчанию подходят.

:::note Рассмотрите возможность адаптивных асинхронных вставок
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но строгими требованиями к задержке от начала до конца, [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) могут быть полезны. Обычно они не применимы к случаям использования наблюдаемости с высокой пропускной способностью, как это видно с ClickHouse.
:::

Наконец, предыдущее поведение удаления дубликатов, связанное с синхронными вставками в ClickHouse, не включено по умолчанию при использовании асинхронных вставок. Если это необходимо, смотрите настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные детали по настройке этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), с более глубоким погружением [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).
## Архитектуры развертывания {#deployment-architectures}

При использовании коллектора OTel с ClickHouse возможно несколько архитектур развертывания. Ниже мы описываем каждую из них и когда она может быть применима.
### Только агенты {#agents-only}

В архитектуре только с агентами пользователи развертывают коллектор OTel как агентов на краю. Эти агенты получают трассировки от локальных приложений (например, как контейнер sidecar) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные непосредственно в ClickHouse.

<Image img={observability_7} alt="Agents only" size="md"/>

Эта архитектура подходит для развертываний малого и среднего размера. Ее основное преимущество заключается в том, что она не требует дополнительного оборудования и сохраняет общий ресурсный след решения по наблюдаемости ClickHouse минимальным, с простым сопоставлением между приложениями и коллекторами.

Пользователи должны рассмотреть возможность миграции на архитектуру на основе шлюзов, как только количество агентов превысит несколько сотен. Эта архитектура имеет несколько недостатков, которые делают ее сложной для масштабирования:

- **Масштабируемость соединений** - Каждый агент устанавливает соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) параллельных соединений для вставок, в конечном итоге это станет ограничивающим фактором и сделает вставки менее эффективными - т.е. больше ресурсов будет использовано ClickHouse для поддержания соединений. Использование шлюзов минимизирует количество соединений и делает вставки более эффективными.
- **Обработка на краю** - Любые преобразования или обработка событий должны осуществляться на краю или в ClickHouse в этой архитектуре. Кроме того, что это ограничительно, это может означать сложные материализованные представления ClickHouse или перенос значительных вычислений на край - где критически важные сервисы могут пострадать, а ресурсы будут дефицитом.
- **Малые пакеты и задержки** - Коллекторы-агенты могут отдельно собирать очень мало событий. Это, как правило, означает, что они должны быть настроены на сброс через заданный интервал, чтобы удовлетворить SLA доставки. Это может привести к тому, что коллектор отправляет небольшие пакеты в ClickHouse. Хотя это и является недостатком, это можно смягчить с помощью асинхронных вставок - см. [Оптимизация вставок](#optimizing-inserts).
### Масштабирование с помощью шлюзов {#scaling-with-gateways}

Коллекторы OTel могут быть развернуты в виде экземпляров шлюза для устранения вышеуказанных ограничений. Эти экземпляры предоставляют автономный сервис, как правило, по центру обработки данных или региону. Эти экземпляры получают события от приложений (или других сборщиков в роли агента) через одну конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов, к которым используется встроенный балансировщик нагрузки для распределения нагрузки между ними.

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

Цель этой архитектуры - разгрузить вычислительно интенсивную обработку от агентов, тем самым минимизируя их использование ресурсов. Эти шлюзы могут выполнять задачи преобразования, которые иначе пришлось бы выполнять агентам. Более того, агрегируя события от множества агентов, шлюзы могут гарантировать, что большие пакеты отправляются в ClickHouse, что позволяет выполнять эффективные вставки. Эти сборщики шлюзов можно легко масштабировать по мере добавления новых агентов и увеличения пропускной способности событий. Пример конфигурации шлюза с соответствующей конфигурацией агента, обрабатывающего пример структурированного лог-файла, показан ниже. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

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
      insecure: true # Set to false if you are using a secure connection
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
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

Эти конфигурации могут быть запущены с помощью следующих команд.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

Основной недостаток этой архитектуры заключается в связанных затратах и накладных расходах на управление набором коллектора.

Для примера управления более крупными архитектурами на основе шлюзов с соответствующим обучением мы рекомендуем этот [блог](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).
### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что вышеуказанные архитектуры не используют Kafka как очередь сообщений.

Использование очереди Kafka в качестве буфера сообщений является популярным шаблоном проектирования в архитектурах журналирования и было популяризировано стеком ELK. Это предоставляет несколько преимуществ; в первую очередь, это помогает обеспечить более строгие гарантии доставки сообщений и помогает справиться с обратным давлением. Сообщения отправляются от агентов сбора данных в Kafka и записываются на диск. В теории кластерированная экземпляр Kafka должен обеспечивать высокопропускной буфер сообщений, так как в нем возникает меньше вычислительных накладных расходов на линейную запись данных на диск, чем на парсинг и обработку сообщения - в Elastic, например, токенизация и индексирование вызывают значительные накладные расходы. Перемещая данные от агентов, вы также подвергаетесь меньшему риску потери сообщений в результате ротации журналов на источнике. Наконец, это предоставляет некоторые возможности для ответа сообщений и межрегиональной репликации, что может быть привлекательно для некоторых случаев использования.

Тем не менее, ClickHouse может обрабатывать вставку данных очень быстро - миллионы строк в секунду на умеренном оборудовании. Обратное давление от ClickHouse - это **редкость**. Часто использование очереди Kafka означает больше архитектурной сложности и затрат. Если вы можете принять принцип, что логи не требуют тех же гарантий доставки, что и банковские транзакции и другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Однако, если вам требуются высокие гарантии доставки или возможность воспроизводить данные (возможно, на несколько источников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Adding kafka" size="md"/>

В этом случае агенты OTel могут быть настроены на отправку данных в Kafka через [экспортер Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюза, в свою очередь, обрабатывают сообщения с помощью [приемника Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Мы рекомендуем документацию Confluent и OTel для получения дальнейших деталей.
### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для коллектора OTel будут зависеть от пропускной способности событий, размера сообщений и объема проводимой обработки. Проект OpenTelemetry поддерживает [бенчмарки, которые пользователи](https://opentelemetry.io/docs/collector/benchmarks/) могут использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза с 3 ядрами и 12 ГБ ОЗУ может обрабатывать около 60 000 событий в секунду. Это предполагает минимальную обработку, отвечающую за переименование полей и без регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий в шлюз и устанавливающих только метку времени события, мы рекомендуем пользователям рассчитывать размеры на основе предполагаемых логов в секунду. Следующие представляют собой приблизительные цифры, которые пользователи могут использовать в качестве отправной точки:

| Скорость логирования | Ресурсы для коллектора-агента |
|----------------------|-------------------------------|
| 1k/секунда           | 0.2 CPU, 0.2 GiB              |
| 5k/секунда           | 0.5 CPU, 0.5 GiB              |
| 10k/секунда          | 1 CPU, 1 GiB                  |
