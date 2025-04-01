---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для мониторинга'
slug: /observability/integrating-opentelemetry
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
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

Любое решение для мониторинга требует средства для сбора и экспорта логов и трасс. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

"OpenTelemetry — это фреймворк и инструментарий для мониторинга, предназначенный для создания и управления телеметрическими данными, такими как трассы, метрики и логи."

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бэкендом для мониторинга и скорее сосредоточен на генерации, сборе, управлении и экспорте телеметрических данных. Хотя первоначальная цель OpenTelemetry заключалась в том, чтобы позволить пользователям легко инструментировать свои приложения или системы с использованием специфичных для языка SDK, она расширилась, чтобы включать сбор логов через коллекционер OpenTelemetry — агент или прокси, который получает, обрабатывает и экспортирует телеметрические данные.
## Компоненты, связанные с ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из нескольких компонентов. Кроме того, что он предоставляет спецификацию данных и API, стандартизированный протокол и соглашения о наименовании для полей/колонок, OTel предоставляет две возможности, которые являются основополагающими для создания решения мониторинга с ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси, который принимает, обрабатывает и экспортирует телеметрические данные. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед их пакетированием и вставкой.
- [Языковые SDK](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDK эффективно обеспечивают правильную запись трасс в коде приложения, генерируя составные промежутки и обеспечивая передачу контекста между сервисами через метаданные, тем самым формируя распределенные трассы и обеспечивая корреляцию промежутков. Эти SDK дополняются экосистемой, которая автоматически реализует общие библиотеки и фреймворки, что означает, что пользователю не требуется изменять свой код и он получает инструментирование "из коробки".

Решение для мониторинга на базе ClickHouse использует оба этих инструмента.
## Дистрибуции {#distributions}

У коллекционера OpenTelemetry есть [несколько дистрибуций](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Receiver filelog вместе с экспортёром ClickHouse, необходимым для решения на базе ClickHouse, присутствует только в [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Эта дистрибуция содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при работе в производственной среде рекомендуется ограничить коллекционер только теми компонентами, которые необходимы для окружения. Некоторые причины для этого:

- Уменьшение размера коллекционера, сокращение времени развертывания для коллекционера
- Повышение безопасности коллекционера за счет уменьшения доступной поверхности атаки

Создание [пользовательского коллекционера](https://opentelemetry.io/docs/collector/custom-collector/) можно осуществить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).
## Приём данных с помощью OTel {#ingesting-data-with-otel}
### Роли развертывания коллекционера {#collector-deployment-roles}

Для сбора логов и их вставки в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector может быть развернут в двух основных ролях:

- **Агент** - Экземпляры агента собирают данные на краю, например, на серверах или на узлах Kubernetes, или получают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента работает вместе с приложением или на том же хосте, что и приложение (например, в роли sidecar или DaemonSet). Агенты могут отправлять свои данные непосредственно в ClickHouse или на экземпляр шлюза. В первом случае это называется [шаблоном развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Шлюз** - Экземпляры шлюза предоставляют автономный сервис (например, развертывание в Kubernetes), обычно для каждого кластера, центра обработки данных или региона. Эти экземпляры принимают события от приложений (или других коллекционеров в роли агентов) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов, с готовым балансировщиком нагрузки, который используется для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую конечную точку, это часто называется [шаблоном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

Ниже предполагается простой агент-коллекционер, отправляющий свои события напрямую в ClickHouse. Смотрите [Масштабирование с помощью шлюзов](#scaling-with-gateways) для получения дополнительных деталей о использовании шлюзов и о том, когда они применимы.
### Сбор логов {#collecting-logs}

Основное преимущество использования коллекционера заключается в том, что он позволяет вашим сервисам быстро выгружать данные, оставляя коллекционеру заботу о дополнительной обработке, такой как повторные попытки, пакетирование, шифрование или даже фильтрация конфиденциальных данных.

Коллекционер использует термины [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) для своих трех основных этапов обработки. Receivers используются для сбора данных и могут быть основаны на вытягивании или отправке. Processors предоставляют возможность выполнять преобразования и обогащение сообщений. Exporters отвечают за отправку данных на вспомогательный сервис. Хотя этот сервис, теоретически, может быть другим коллекционером, мы предполагаем, что все данные отправляются напрямую в ClickHouse для первоначального обсуждения ниже.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором receivers, processors и exporters.

Коллекционер предоставляет два основных receiver для сбора логов:

**Через OTLP** - В этом случае логи отправляются (отправляются) прямо в коллекционер из OpenTelemetry SDK через протокол OTLP. [Демо OpenTelemetry](https://opentelemetry.io/docs/demo/) использует этот подход, экспортеры OTLP на каждом языке предполагают локальную конечную точку коллекционера. В этом случае коллекционер должен быть сконфигурирован с receiver OTLP — см. выше [демо для конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода заключается в том, что данные логов автоматически будут содержать Trace Id, позволяя пользователям позднее идентифицировать трассы для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через otlp" size="md"/>

Этот подход требует от пользователей инструментария своего кода с помощью [соответствующего языка SDK](https://opentelemetry.io/docs/languages/).

- **Скрейпинг через receiver Filelog** - Этот receiver отслеживает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Этот receiver обрабатывает сложные задачи, такие как обнаружение многострочных сообщений, обработка прокрутки логов, контрольные точки для устойчивости к перезапуску и извлечение структуры. Этот receiver дополнительно может отслеживать логи контейнеров Docker и Kubernetes, развертываемых в виде helm-чарта, [извлекая структуру из них](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями пода.

<Image img={observability_5} alt="Receiver file log" size="md"/>

**Большинство развертываний будут использовать комбинацию вышеуказанных receiver. Мы рекомендуем пользователям прочитать [документацию коллекционера](https://opentelemetry.io/docs/collector/) и ознакомиться с основными концепциями, а также [структурой конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методами установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::
## Структурированные и неструктурированные логи {#structured-vs-unstructured}

Логи могут быть структурированными или неструктурированными.

Структурированный лог будет использовать формат данных, такой как JSON, определяя метаданные, такие как код http и IP-адрес источника.

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

Неструктурированные логи, хотя также обычно имеют некоторую внутреннюю структуру, извлекаемую через шаблон regex, будут представлять лог просто как строку.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем пользователям использовать структурированное логирование и записывать в JSON (т.е. ndjson), где это возможно. Это упростит необходимую обработку логов позже, либо перед отправкой в ClickHouse с помощью [Processors коллекционера](https://opentelemetry.io/docs/collector/configuration/#processors), либо во время вставки, используя материализованные представления. Структурированные логи в конечном итоге сэкономят ресурсы на последующей обработке, уменьшая необходимую производительность CPU в вашем решении на базе ClickHouse.
### Пример {#example}

Для примеров мы предоставляем структурированный (JSON) и неструктурированный набор логов, каждый из которых содержит примерно 10 миллионов строк, доступных по следующим ссылкам:

- [Неструктурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [Структурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

Мы используем структурированный набор данных для примера ниже. Убедитесь, что этот файл загружен и извлечен, чтобы воспроизвести следующие примеры.

Следующее представляет собой простую конфигурацию для OTel Collector, который считывает эти файлы на диске, используя receiver filelog, и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), так как наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите возможность использования ClickHouse для разбора
Ниже приведенный пример извлекает временную метку из лога. Это требует использования оператора `json_parser`, который преобразует всю строку лога в строку JSON, помещая результат в `LogAttributes`. Это может быть ресурсоемким и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный неструктурированный пример, использующий [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения этого, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для локальной установки коллекционера. Важно убедиться, что инструкции изменены для использования [дистрибуции contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (которая содержит receiver `filelog`), т.е. вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователи должны загрузить `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Выпуски можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить следующими командами:

```bash
./otelcol-contrib --config config-logs.yaml
```

Предполагая использование структурированных логов, сообщения будут иметь следующую форму на выходе:

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

Выше представлено одно сообщение лога, созданное OTel collector. Мы будем загружать эти же сообщения в ClickHouse в следующих разделах.

Полная схема сообщений логов, вместе с дополнительными столбцами, которые могут присутствовать, если использовать другие receivers, поддерживается [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевое здесь то, что сама строка лога хранится в виде строки в поле `Body`, но JSON был автоматически извлечен в поле Attributes благодаря оператору `json_parser`. Этот же [оператор](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Для рекомендаций по обработке логов с помощью OTel см. [Обработка](#processing---filtering-transforming-and-enriching).

:::note Операторы
Операторы являются самым базовым элементом обработки логов. Каждый оператор выполняет единую ответственность, такую как чтение строк из файла или разбор JSON из поля. Операторы затем связываются в цепочку в конвейере, чтобы достичь желаемого результата.
:::

Вышеуказанные сообщения не имеют поля `TraceID` или `SpanID`. Если они присутствуют, например, в случаях, когда пользователи реализуют [распределенное трассирование](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON с помощью тех же техник, показанных выше.

Пользователям, которым необходимо собирать локальные или Kubernetes файлы логов, мы рекомендуем ознакомиться с доступными параметрами конфигурации для [receiver filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) и тем, как обрабатываются [смещения](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [разбор многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).
## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем [руководство документации Open Telemetry](https://opentelemetry.io/docs/kubernetes/). Рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) для обогащения логов и метрик метаданными подов. Это может потенциально создать динамические метаданные, т.е. метки, хранящиеся в столбце `ResourceAttributes`. Currently, ClickHouse uses the type `Map(String, String)` для этого столбца. Смотрите [Использование карт](/use-cases/observability/schema-design#using-maps) и [Извлечение из карт](/use-cases/observability/schema-design#extracting-from-maps) для получения дополнительных сведений о работе с этим типом. 
## Сбор трасс {#collecting-traces}

Для пользователей, желающих инструментировать свой код и собирать трассы, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставить события в ClickHouse, пользователи должны развернуть OTel collector для получения событий трасс по протоколу OTLP через соответствующий receiver. Демо OpenTelemetry предоставляет [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий к коллекционеру. Пример соответствующей конфигурации коллекционера, которая выводит события в stdout, представлен ниже:
### Пример {#example-1}

Поскольку трассы должны приниматься через OTLP, мы используем инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трасс. Следуйте инструкциям [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для установки.

Следующая конфигурация принимает события трасс на receiver OTLP перед их отправкой в stdout.

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

Запустите эту конфигурацию с помощью:

```bash
./otelcol-contrib --config config-traces.yaml
```

Отправьте события трасс в коллекционер через `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

Это приведет к появлению сообщений трасс, подобных примеру ниже, выводимым в stdout:

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

Выше представлено одно сообщение трассы, созданное OTel collector. Мы будем загружать эти же сообщения в ClickHouse в следующих разделах.

Полная схема сообщений трасс поддерживается [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.
## Обработка - фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как показано в предыдущем примере установки временной метки для лог-события, пользователи неизбежно захотят фильтровать, преобразовывать и обогащать сообщения событий. Это можно достичь с помощью нескольких возможностей в OpenTelemetry:

- **Processors** - Processors берут данные, собранные [receivers, и модифицируют или преобразуют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортером. Processors применяются в порядке, установленном в разделе `processors` конфигурации коллекционера. Эти процессы необязательны, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничить processors до:

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md), который используется для предотвращения ситуаций с нехваткой памяти на коллекционере. См. [Оценка ресурсов](#estimating-resources) для получения рекомендаций.
    - Любого процессора, который выполняет обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов для промежутков, метрик и логов с метаданными k8s, т.е. обогащая события их идентификатором пода источника.
    - [Выборка с хвоста или головы](https://opentelemetry.io/docs/concepts/sampling/) при необходимости для трасс.
    - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) - отбрасывание событий, которые не нужны, если это не может быть сделано с помощью оператора (см. ниже).
    - [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - необходимо при работе с ClickHouse, чтобы обеспечить отправку данных пакетами. См. ["Экспорт в ClickHouse"](#exporting-to-clickhouse).

- **Операторы** - [Операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют самую базовую единицу обработки, доступную на уровне receiver. Поддерживается базовый разбор, позволяя установить такие поля, как Severity и Timestamp. Поддерживается разбор JSON и regex, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с использованием операторов или [трансформирующих процессоров](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Это может повлечь за собой значительные затраты по памяти и вычислительным ресурсам, особенно при разборе JSON. Теоретически можно выполнить всю обработку в ClickHouse во время вставки с материализованными представлениями и столбцами, за некоторыми исключениями — в частности, обогащением, зависящим от контекста, т.е. добавлением метаданных k8s. Для получения дополнительной информации см. [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка осуществляется с использованием OTel collector, мы рекомендуем выполнять преобразования на экземплярах шлюзов и минимизировать любые работы, выполняемые на экземплярах агентов. Это обеспечит минимальные ресурсы, необходимые агентам на краю, работающим на серверах. Обычно мы заметили, что пользователи только выполняют фильтрацию (для минимизации ненужного сетевого трафика), установку временных меток (через операторы) и обогащение, что требует наличия контекста в агенте. Например, если экземпляры шлюзов находятся в другом кластере Kubernetes, обогащение k8s должно произойти на уровне агента.
### Пример {#example-2}

Следующая конфигурация демонстрирует сбор неструктурированного файла логов. Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, наряду с процессором для пакетирования событий и ограничения использования памяти.

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

Экспортеры отправляют данные на один или несколько бэкендов или мест назначения. Экспортеры могут быть основаны на извлечении (pull) или отправке (push). Для отправки событий в ClickHouse пользователям потребуется использовать основанный на отправке [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основной дистрибуции. Пользователи могут использовать либо дистрибуцию contrib, либо [создать свой собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Полный файл конфигурации представлен ниже.

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

- **pipelines** - В приведенной выше конфигурации подчеркивается использование [конвейеров](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора приемников, процессоров и экспортеров для журналов и трасс.
- **endpoint** - Связь с ClickHouse настраивается через параметр `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` обеспечивает связь по протоколу TCP. Если пользователи предпочитают HTTP по причинам переключения трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные детали подключения, с возможностью указать имя пользователя и пароль в этой строке подключения, описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что приведенная выше строка подключения включает как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба. См. [Пакетная обработка](#batching) для получения дополнительных сведений об асинхронных вставках. Сжатие всегда должно указываться и по умолчанию не будет включено в старых версиях экспортера.

- **ttl** - значение здесь определяет, как долго данные хранятся. Дополнительные сведения в разделе "Управление данными". Это следует указывать в виде временной единицы в часах, например, 72h. Мы отключаем TTL в приведенном ниже примере, так как наши данные датируются 2019 годом и будут немедленно удалены ClickHouse при вставке.
- **traces_table_name** и **logs_table_name** - определяют имя таблицы для журналов и трасс.
- **create_schema** - определяет, создаются ли таблицы с использованием схем по умолчанию при запуске. По умолчанию установлено в true для простоты начала работы. Пользователи должны установить это значение в false и определить свою собственную схему.
- **database** - целевая база данных.
- **retry_on_failure** - параметры, определяющие, следует ли пытаться выполнить повторную вставку неудачных пакетов.
- **batch** - процессор пакетов обеспечивает отправку событий в виде пакетов. Мы рекомендуем значение около 5000 с истечением времени 5s. То, что будет достигнуто раньше, запустит пакет для отправки в экспортер. Уменьшение этих значений означает более низкую задержку в конвейере с данными, доступными для запроса раньше, но это будет стоить большего количества соединений и пакетов, отправляемых в ClickHouse. Это не рекомендуется, если пользователи не используют [асинхронные вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может вызвать проблемы с [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют асинхронные вставки, доступность данных для запроса также будет зависеть от настроек асинхронной вставки - хотя данные все равно будут отправлены из соединителя раньше. См. [Пакетная обработка](#batching) для получения дополнительных сведений.
- **sending_queue** - контролирует размер очереди отправки. Каждый элемент в очереди содержит пакет. Если эта очередь заполнена, например, из-за недоступности ClickHouse, но события продолжают поступать, пакеты будут отброшены.

Предполагая, что пользователи извлекли структурированный файл журнала и имеют [локальный экземпляр ClickHouse](/install), работающий с учетом аутентификации по умолчанию, пользователи могут запустить эту конфигурацию с помощью команды:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки этому сборщику, выполните следующую команду, используя инструмент `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска подтвердите наличие событий журнала с помощью простого запроса:

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


Аналогично, для событий трассировки пользователи могут проверить таблицу `otel_traces`:

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

По умолчанию экспортер ClickHouse создает целевую таблицу журнала как для журналов, так и для трасс. Это можно отключить с помощью параметра `create_schema`. Кроме того, имена таблицы для журналов и трасс можно изменить с их значений по умолчанию `otel_logs` и `otel_traces` с помощью указанных выше настроек.

:::note
В схемах ниже мы предполагаем, что TTL был включен как 72h.
:::

Схема по умолчанию для журналов показана ниже (`otelcol-contrib v0.102.1`):

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

Столбцы здесь соответствуют официальной спецификации OTel для журналов, задокументированной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных замечаний по этой схеме:

- По умолчанию таблица разбивается на партиции по дате через `PARTITION BY toDate(Timestamp)`. Это обеспечивает эффективное удаление устаревших данных.
- TTL устанавливается через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, заданному в конфигурации сборщика. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые части, когда все содержащиеся строки истекли. Это более эффективно, чем удаление строк внутри частей, что требует дорогостоящего удаления. Мы рекомендуем всегда устанавливать это значение. См. [Управление данными с помощью TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения дополнительных сведений.
- Таблица использует классический [`движок MergeTree`](https://engines.clickhouse.com/engines/table-engines/mergetree-family/mergetree). Это рекомендуется для журналов и трасс и не должно требовать изменений.
- Таблица упорядочена по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` - более ранние столбцы в списке будут фильтроваться быстрее, чем более поздние, например фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Пользователи должны модифицировать это упорядочение в соответствии со своими ожидаемыми паттернами доступа - см. [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- Приведенная схема применяет `ZSTD(1)` к столбцам. Это обеспечивает лучшее сжатие для журналов. Пользователи могут увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшего сжатия, хотя это редко бывает выгодно. Увеличение этого значения приведет к большему использованию CPU во время вставки (при сжатии), хотя декомпрессия (и, следовательно, запросы) должны оставаться сопоставимыми. См. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для получения дополнительных сведений. Дополнительное [дельта-кодирование](/sql-reference/statements/create/table#delta) применяется к Timestamp с целью уменьшения его размера на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются картами. Пользователи должны ознакомиться с различиями между ними. Для доступа к этим картам и оптимизации доступа к ключам внутри них см. [Использование карт](/use-cases/observability/integrating-opentelemetry.md).
- Большинство других типов здесь, например, `ServiceName` как LowCardinality, оптимизированы. Обратите внимание, что Body, хотя и является JSON в наших примерах журналов, хранится как строка.
- Фильтры Блума применяются к ключам и значениям карт, а также к столбцу Body. Эти фильтры направлены на улучшение времени запроса при доступе к этим столбцам, но обычно не требуются. См. [Вторичные/индексы пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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

Снова, это будет соответствовать столбцам, соответствующим официальной спецификации OTel для трасс, задокументированной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Схема здесь использует многие из тех же настроек, что и вышеуказанная схема журналов, с дополнительными столбцами Link, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схемы и создать свои таблицы вручную. Это позволяет модифицировать первичные и вторичные ключи, а также предоставляет возможность ввести дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительных сведений см. [Дизайн схемы](/use-cases/observability/schema-design).
## Оптимизация вставок {#optimizing-inserts}

Для достижения высокой производительности вставки при получении сильных гарантий согласованности пользователи должны следовать простым правилам при вставке данных наблюдаемости в ClickHouse через сборщик. С правильной конфигурацией сборщика OTel следование следующим правилам должно быть простым. Это также позволяет избежать [распространенных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом использовании ClickHouse.
### Пакетная обработка {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, вызывает немедленное создание части хранилища, содержащей данные из вставки вместе с другой метаинформацией, которую необходимо сохранить. Следовательно, отправка меньшего количества вставок с большим количеством данных по сравнению с отправкой большего количества вставок с меньшим количеством данных сократит количество необходимых записей. Мы рекомендуем вставлять данные достаточно большими пакетами, минимум по 1000 строк одновременно. Дополнительные сведения [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если идентичны. Для таблиц из семейства движков MergeTree ClickHouse по умолчанию автоматически [удаляет дубликаты вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки допускают такие случаи, как следующие:

- (1) Если узел, получающий данные, испытывает проблемы, запрос вставки истечет (или получит более конкретную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых сбоев, отправитель либо получит истечение времени, либо сетевую ошибку.

С точки зрения сборщика, (1) и (2) могут быть трудными для различия. Однако в обоих случаях неподтвержденная вставка может быть немедленно повторена. Если повторный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически игнорирует повторный запрос вставки, если (неподтвержденная) исходная вставка прошла успешно.

Мы рекомендуем пользователям использовать [процессор пакетов](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), указанный в предыдущих конфигурациях, чтобы удовлетворять вышеуказанным требованиям. Это обеспечивает отправку вставок как последовательных пакетов строк, удовлетворяющих вышеприведенным требованиям. Если ожидается, что сборщик будет иметь высокую пропускную способность (событий в секунду), и по крайней мере 5000 событий могут быть отправлены в каждой вставке, это обычно единственная пакетная обработка, необходимая в конвейере. В этом случае сборщик будет сбрасывать пакеты до достижения `timeout` процесса пакетной обработки, что обеспечивает низкую задержку по всему конвейеру и постоянный размер пакетов.
### Используйте асинхронные вставки {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять более мелкие пакеты, когда пропускная способность сборщика низкая, но все равно ожидают, что данные достигнут ClickHouse в пределах минимальной задержки от начала до конца. В этом случае небольшие пакеты отправляются, когда истекает `timeout` процессора пакетов. Это может вызвать проблемы, и тогда требуются асинхронные вставки. Эта ситуация обычно возникает, когда **сборщики в роли агента настроены на прямую отправку в ClickHouse**. Шлюзы, действуя как агрегаторы, могут облегчить эту проблему - см. [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если нельзя гарантировать большие пакеты, пользователи могут делегировать пакетирование ClickHouse, используя [Асинхронные вставки](/cloud/bestpractices/asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно.

<Image img={observability_6} alt="Асинхронные вставки" size="md"/>

При [включенных асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) ситуации, когда ClickHouse ① получает запрос на вставку, данные запроса ② немедленно записываются сначала в буфер в памяти. Когда ③ происходит следующий сброс буфера, данные буфера упорядочиваются [/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns] и записываются как часть в хранилище базы данных. Обратите внимание, что данные не подлежат поиску через запросы до тех пор, пока они не будут сброшены в хранилище базы данных; сброс буфера [/optimize/asynchronous-inserts] может быть [настраиваемым](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

Чтобы включить асинхронные вставки для сборщика, добавьте `async_insert=1` к строке подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (по умолчанию) для получения гарантий доставки - см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дополнительных сведений.

Данные из асинхронной вставки вставляются после сброса буфера ClickHouse. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлено в ненулевое значение, данные вставляются после истечения времени `async_insert_stale_timeout_ms миллисекунд` с момента последнего запроса. Пользователи могут настроить эти параметры для контроля задержки от начала до конца их конвейера. Дополнительные настройки, которые могут быть использованы для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). В целом, значения по умолчанию являются подходящими.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется низкое количество агентов с низкой пропускной способностью, но строгими требованиями к задержке от начала до конца, [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) могут быть полезны. В общем, они не применимы к случаям наблюдаемости с высокой пропускной способностью, как это видно с ClickHouse.
:::

Наконец, поведение удаления дубликатов, связанное с синхронными вставками в ClickHouse, по умолчанию не включается при использовании асинхронных вставок. Если это необходимо, см. настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные сведения о конфигурировании этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), с глубоким погружением [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).
## Архитектуры развертывания {#deployment-architectures}

Существует несколько архитектур развертывания, возможных при использовании сборщика OTel с ClickHouse. Мы описываем каждую из них ниже и когда она, вероятно, будет актуальна.
### Только агенты {#agents-only}

В архитектуре только с агентами пользователи развертывают сборщик OTel в качестве агентов на краю сети. Эти агенты получают трассы от локальных приложений (например, в качестве контейнера sidecar) и собирают журналы с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные непосредственно в ClickHouse.

<Image img={observability_7} alt="Только агенты" size="md"/>

Эта архитектура подходит для небольших и средних развертываний. Ее основное преимущество заключается в том, что не требуется дополнительное оборудование, что позволяет минимизировать общий ресурсный след решения по наблюдаемости ClickHouse с простым сопоставлением между приложениями и сборщиками.

Пользователи должны рассмотреть возможность перехода на архитектуру, основанную на шлюзах, как только число агентов превысит несколько сотен. Эта архитектура имеет несколько недостатков, что делает ее сложной для масштабирования:

- **Масштабирование соединений** - Каждый агент устанавливает соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных соединений для вставки, это в конечном итоге станет ограничивающим фактором и сделает вставки менее эффективными - то есть ClickHouse будет использовать больше ресурсов для поддержания соединений. Использование шлюзов минимизирует количество соединений и делает вставки более эффективными.
- **Обработка на краю** - Любые преобразования или обработка событий должны производиться на краю или в ClickHouse в этой архитектуре. Это не только ограничивает, но и может означать сложные материализованные представления ClickHouse или перемещение значительных вычислений на край, где критические службы могут быть затронуты, а ресурсы ограничены.
- **Малые пакеты и задержки** - Агентские сборщики могут индивидуально собирать очень немного событий. Это обычно означает, что их необходимо настраивать на сброс с установленным интервалом для удовлетворения SLA по доставке. Это может привести к отправке небольших пакетов в ClickHouse сборщиком. Хотя это и недостаток, это может быть смягчено с помощью асинхронных вставок - см. [Оптимизация вставок](#optimizing-inserts).
### Масштабирование с помощью шлюзов {#scaling-with-gateways}

Коллекторы OTel могут быть развернуты в качестве экземпляров шлюзов для устранения вышеперечисленных ограничений. Они обеспечивают автономный сервис, обычно для каждого дата-центра или региона. Эти шлюзы принимают события от приложений (или других коллекторов в агентской роли) через единую конечную точку OTLP. Обычно разворачивается набор экземпляров шлюзов, с балансировщиком нагрузки, который используется для распределения нагрузки между ними.

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

Цель этой архитектуры — разгрузить вычислительно интенсивную обработку от агентов, тем самым минимизируя их использование ресурсов. Эти шлюзы могут выполнять задачи преобразования, которые иначе должны были бы выполняться агентами. Более того, агрегируя события от многих агентов, шлюзы могут гарантировать, что большие пакеты отправляются в ClickHouse, позволяя эффективную вставку. Эти коллекторы шлюзов можно легко масштабировать по мере добавления большего количества агентов и увеличения пропускной способности событий. Пример конфигурации шлюза, с ассоциированной конфигурацией агента, потребляющего пример файла структурированного журнала, показан ниже. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

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
      insecure: true # Установите в false, если вы используете защищенное соединение
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено для двух коллекторов, работающих на одном хосте
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

Основной недостаток этой архитектуры заключается в связанных затратах и накладных расходах на управление набором коллекторов.

Для примера управления более крупными архитектурами на основе шлюзов с соответствующими уроками, мы рекомендуем эту [статью в блоге](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).
### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что вышеприведенные архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka в качестве буфера сообщений является популярным шаблоном проектирования, который встречается в архитектурах журналирования и был популяризирован стеком ELK. Это предоставляет несколько преимуществ; в первую очередь, это помогает обеспечить более сильные гарантии доставки сообщений и помогает справляться с обратным нажимом. Сообщения отправляются от агентов сбора данных в Kafka и записываются на диск. Теоретически кластеризированный экземпляр Kafka должен обеспечивать высокую пропускную способность буфера сообщений, поскольку для записи данных линейно на диск потребляется меньше вычислительных ресурсов, чем для разбора и обработки сообщения — например, в Elastic токенизация и индексация требуют значительных накладных расходов. Перемещая данные от агентов, вы также снижаете риск потери сообщений в результате ротации журналов на источнике. Наконец, это предлагает некоторые возможности повторной отправки сообщений и репликации между регионами, что может быть привлекательно для некоторых случаев использования.

Тем не менее, ClickHouse может обрабатывать вставку данных очень быстро — миллионы строк в секунду на умеренном оборудовании. Обратный нажим от ClickHouse **редок**. Часто внедрение очереди Kafka означает большую архитектурную сложность и затраты. Если вы можете принять принцип, что журналы не нуждаются в тех же гарантиях доставки, что и банковские транзакции и другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Однако, если вам нужны высокие гарантии доставки или возможность повторной отправки данных (возможно, на несколько источников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Adding kafka" size="md"/>

В этом случае агенты OTel могут быть настроены на отправку данных в Kafka через [экспортер Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюзов, в свою очередь, обрабатывают сообщения, используя [приемник Kafka](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Мы рекомендуем руководство Confluent и OTel для получения дополнительных сведений.
### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для коллектора OTel будут зависеть от пропускной способности событий, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[На нашем опыте](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview) экземпляр шлюза с 3 ядрами и 12 ГБ ОЗУ может обрабатывать около 60k событий в секунду. Это предполагает минимальный конвейер обработки, ответственный за переименование полей и отсутствие регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий в шлюз и только устанавливающих временную метку на событии, мы рекомендуем пользователям ориентироваться на предполагаемое количество журналов в секунду. Следующие представляют собой приблизительные числа, которые пользователи могут использовать в качестве отправной точки:

| Скорость журналирования | Ресурсы для коллектора агента |
|-------------------------|-------------------------------|
| 1k/секунда             | 0.2CPU, 0.2GiB               |
| 5k/секунда             | 0.5 CPU, 0.5GiB              |
| 10k/секунда            | 1 CPU, 1GiB                  |
