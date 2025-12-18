---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для обсервабилити'
slug: /observability/integrating-opentelemetry
keywords: ['Обсервабилити', 'OpenTelemetry']
show_related_blogs: true
doc_type: 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';


# Интеграция OpenTelemetry для сбора данных {#integrating-opentelemetry-for-data-collection}

Любому решению для обсервабилити требуется средство для сбора и экспорта логов и трейсов. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

«OpenTelemetry — это фреймворк и набор инструментов для обсервабилити, предназначенный для создания и управления телеметрическими данными, такими как трейсы, метрики и логи».

В отличие от ClickHouse или Prometheus, OpenTelemetry не является backend-системой для обсервабилити, а фокусируется на генерации, сборе, управлении и экспорте телеметрических данных. Хотя изначальной целью OpenTelemetry было обеспечить простую инструментацию ваших приложений или систем с использованием языковых SDKs, его возможности были расширены и теперь включают сбор логов с помощью OpenTelemetry collector — агента или прокси, который принимает, обрабатывает и экспортирует телеметрические данные.

## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из ряда компонентов. Помимо спецификации данных и API, стандартизированного протокола и соглашений об именовании полей/столбцов, OTel предоставляет две ключевые возможности, которые критически важны для построения решения для обсервабилити с ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси, который принимает, обрабатывает и экспортирует телеметрические данные. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед их группировкой в батчи и вставкой.
- [Language SDKs](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDKs фактически обеспечивают корректную запись трейсов в коде приложения, создавая составляющие их спаны и гарантируя распространение контекста между сервисами через метаданные — таким образом формируя распределённые трейсы и обеспечивая возможность коррелировать спаны. Эти SDKs дополняются экосистемой, которая автоматически интегрирует распространённые библиотеки и фреймворки, благодаря чему пользователю не требуется изменять свой код, и он получает инструментирование «из коробки».

Решение для обсервабилити на базе ClickHouse использует оба этих инструмента.

## Дистрибутивы {#distributions}

Коллектор OpenTelemetry имеет [несколько дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). `filelog` receiver вместе с ClickHouse exporter, необходимыми для решения на базе ClickHouse, присутствуют только в [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет экспериментировать с различными конфигурациями. Однако при работе в продакшене рекомендуется ограничить коллектор только теми компонентами, которые необходимы для конкретной среды. Некоторые причины для этого:

- Уменьшить размер коллектора, сократив время его развертывания
- Повысить безопасность коллектора за счет уменьшения поверхности атаки

Сборку [пользовательского коллектора](https://opentelemetry.io/docs/collector/custom-collector/) можно выполнить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).

## Приём данных с помощью OTel {#ingesting-data-with-otel}

### Роли развертывания коллекторов {#collector-deployment-roles}

Для сбора логов и записи их в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector может быть развернут в двух основных ролях:

- **Agent** — экземпляры агента собирают данные «на краю», например на серверах или узлах Kubernetes, либо получают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента запускается вместе с приложением или на том же хосте, что и приложение (например, как sidecar или ДемонСет). Агенты могут либо отправлять свои данные напрямую в ClickHouse, либо на экземпляр шлюза. В первом случае это называется [паттерном развертывания Agent](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Gateway** — экземпляры шлюза предоставляют автономный сервис (например, Развертывание в Kubernetes), как правило, на кластер, дата-центр или регион. Они получают события от приложений (или других коллекторов, работающих как агенты) через единый OTLP-эндпоинт. Обычно разворачивается набор экземпляров шлюза, при этом для распределения нагрузки между ними используется готовый балансировщик нагрузки. Если все агенты и приложения отправляют свои сигналы на этот единый эндпоинт, это часто называется [паттерном развертывания Gateway](https://opentelemetry.io/docs/collector/deployment/gateway/).

Далее мы исходим из использования простого коллектора-агента, который отправляет свои события напрямую в ClickHouse. Дополнительные сведения об использовании шлюзов и о случаях, когда они применимы, см. в разделе [Scaling with Gateways](#scaling-with-gateways).

### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора заключается в том, что он позволяет вашим сервисам быстро выгружать данные, перекладывая на себя дополнительную обработку — повторные попытки, пакетирование, шифрование или даже фильтрацию конфиденциальных данных.

Collector использует термины [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) для описания трех основных стадий обработки. Receivers используются для сбора данных и могут работать по pull- или push-модели. Processors обеспечивают возможность выполнять преобразования и обогащение сообщений. Exporters отвечают за отправку данных в нижестоящий сервис. Хотя теоретически этим сервисом может быть другой collector, в рамках обсуждения ниже мы предполагаем, что все данные отправляются непосредственно в ClickHouse.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором receivers, processors и exporters.

Collector предоставляет два основных receiver для сбора логов:

**Через OTLP** — в этом случае логи отправляются (push) напрямую в collector из OpenTelemetry SDKs по протоколу OTLP. [OpenTelemetry demo](https://opentelemetry.io/docs/demo/) использует этот подход: OTLP exporters для каждого языка предполагают локальный endpoint коллектора. В этом случае collector должен быть сконфигурирован с OTLP receiver — см. [конфигурацию демо](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода в том, что данные логов автоматически будут содержать Trace IDs, что позволит пользователям впоследствии находить трейсы для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через otlp" size="md"/>

Этот подход требует, чтобы пользователи инструментировали свой код с помощью [соответствующего SDK для языка](https://opentelemetry.io/docs/languages/).

- **Сбор через Filelog receiver** — этот receiver последовательно читает (tailing) файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Он решает сложные задачи, такие как обнаружение многострочных сообщений, обработка ротации логов, ведение контрольных точек для устойчивости к перезапускам и извлечение структуры. Дополнительно этот receiver может читать логи контейнеров Docker и Kubernetes, будучи развернутым как helm-чарт, [извлекая из них структуру](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их данными о поде.

<Image img={observability_5} alt="File log receiver" size="md"/>

**Большинство развертываний будут использовать комбинацию вышеперечисленных receivers. Мы рекомендуем пользователям прочитать [документацию по collector](https://opentelemetry.io/docs/collector/) и ознакомиться с базовыми концепциями, а также [структурой конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методами установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Tip: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::

## Структурированные и неструктурированные {#structured-vs-unstructured}

Логи могут быть либо структурированными, либо неструктурированными.

Структурированный лог использует формат данных, например JSON, в котором определены поля метаданных, такие как HTTP-код и исходный IP-адрес.

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

Неструктурированные логи, хотя обычно и обладают некоторой внутренней структурой, которую можно извлечь с помощью регулярного выражения, фактически представляют каждую запись лога просто как строку.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем по возможности использовать структурированное логирование и записывать логи в формате JSON (например, ndjson). Это упростит необходимую последующую обработку логов — либо перед отправкой в ClickHouse с помощью [процессоров Collector](https://opentelemetry.io/docs/collector/configuration/#processors), либо на этапе вставки с использованием materialized views. Структурированные логи в конечном итоге сократят объём последующей обработки и снизят требуемое потребление CPU в вашем решении на базе ClickHouse.


### Пример {#example}

В качестве примера мы предоставляем наборы данных логов в структурированном (JSON) и неструктурированном виде, каждый примерно на 10 млн строк, доступные по следующим ссылкам:

* [Неструктурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Структурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

В примере ниже мы используем структурированный набор данных. Убедитесь, что этот файл загружен и распакован, чтобы вы могли воспроизвести приведённые далее примеры.

Ниже приведена простая конфигурация для OTel collector, который считывает эти файлы с диска с помощью `filelog` receiver и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), поскольку наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите использование ClickHouse для парсинга
Пример ниже извлекает временную метку из лога. Для этого требуется использовать оператор `json_parser`, который конвертирует всю строку лога в JSON-строку, помещая результат в `LogAttributes`. Это может быть вычислительно затратно и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) — [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный пример для неструктурированных логов, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения этого же результата, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Вы можете следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для локальной установки collector. Важно убедиться, что инструкции скорректированы таким образом, чтобы использовать [contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (которая содержит `filelog` receiver), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователям следует скачивать `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel collector можно запустить следующими командами:

```bash
./otelcol-contrib --config config-logs.yaml
```

При использовании структурированных логов сообщения на выходе будут выглядеть следующим образом:


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

Выше показано одно лог-сообщение, сформированное OTel collector. Эти же сообщения мы будем отправлять на приём в ClickHouse в следующих разделах.

Полная схема лог-сообщений, вместе с дополнительными столбцами, которые могут присутствовать при использовании других receivers, поддерживается [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевой момент здесь в том, что сама строка лога хранится как строка в поле `Body`, а JSON был автоматически извлечён в поле `Attributes` благодаря `json_parser`. Тот же [operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Рекомендации по обработке логов с помощью OTel см. в разделе [Processing](#processing---filtering-transforming-and-enriching).

:::note Operators
Operators — это базовая единица обработки логов. Каждый operator выполняет одну задачу, такую как чтение строк из файла или разбор JSON из поля. Затем operators объединяются в конвейер (pipeline), чтобы получить требуемый результат.
:::

В приведённых выше сообщениях нет полей `TraceID` или `SpanID`. Если они присутствуют, например в случаях, когда пользователи реализуют [distributed tracing](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON, используя те же приёмы, что и выше.

Пользователям, которым необходимо собирать локальные логи или логи Kubernetes, мы рекомендуем ознакомиться с параметрами конфигурации, доступными для [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration), а также с тем, как обрабатываются [offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [многострочные логи](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).


## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем воспользоваться [руководством в документации OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). Для обогащения логов и метрик метаданными подов рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor). Это может динамически добавлять метаданные, например метки, которые сохраняются в столбце `ResourceAttributes`. В настоящее время ClickHouse использует тип `Map(String, String)` для этого столбца. Дополнительные сведения по работе с этим типом и его оптимизации см. в разделах [Using Maps](/use-cases/observability/schema-design#using-maps) и [Extracting from maps](/use-cases/observability/schema-design#extracting-from-maps).

## Сбор трейсов {#collecting-traces}

Пользователям, которые хотят инструментировать свой код и собирать трейсы, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Для передачи событий в ClickHouse вам необходимо развернуть коллектор OTel, который будет принимать трейсы по протоколу OTLP через соответствующий приёмник (receiver). Демонстрационный проект OpenTelemetry предоставляет [пример инструментирования для каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в коллектор. Пример соответствующей конфигурации коллектора, который выводит события в stdout, показан ниже:

### Пример {#example-1}

Поскольку трейсы должны приниматься по OTLP, мы используем утилиту [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трассировки. Следуйте инструкциям по установке [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen).

Следующая конфигурация принимает события трассировки на приёмнике OTLP, а затем отправляет их в stdout.

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

Запустите эту конфигурацию командой:

```bash
./otelcol-contrib --config config-traces.yaml
```

Отправьте события трассировки в коллектор с помощью `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

В результате в стандартный поток вывода (stdout) будут выводиться сообщения трассировки, аналогичные приведённому ниже примеру:

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

Выше приведено одно сообщение трассировки, сгенерированное OTel collector. Приём этих же сообщений в ClickHouse мы рассмотрим в последующих разделах.

Полная схема сообщений трассировки доступна и поддерживается в актуальном состоянии [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.


## Обработка — фильтрация, трансформация и обогащение {#processing---filtering-transforming-and-enriching}

Как показано в предыдущем примере установки временной метки для события лога, вам, как правило, потребуется фильтровать, трансформировать и обогащать сообщения событий. Это можно сделать с помощью ряда возможностей OpenTelemetry:

- **Processors** — Processors берут данные, собранные [receivers, и модифицируют или трансформируют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортёрам. Processors применяются в том порядке, в котором они заданы в секции `processors` конфигурации collector. Они являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничить processors следующим:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций «out of memory» на collector. См. рекомендации в разделе [Estimating Resources](#estimating-resources).
  - Любой processor, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически задавать ресурсные атрибуты spans, metrics и logs с использованием k8s-метаданных, т. е. обогащать события идентификатором исходного пода.
  - [Tail или head sampling](https://opentelemetry.io/docs/concepts/sampling/), если это требуется для трассировок.
  - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание нерелевантных событий, если это нельзя сделать с помощью operators (см. ниже).
  - [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — критично при работе с ClickHouse, чтобы гарантировать отправку данных пакетами. См. ["Exporting to ClickHouse"](#exporting-to-clickhouse).

- **Operators** — [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют наиболее базовую единицу обработки, доступную на уровне receiver. Поддерживается базовый парсинг, позволяющий задавать такие поля, как Severity и Timestamp. Здесь доступны JSON- и regex-парсинг, а также фильтрация событий и базовые трансформации. Мы рекомендуем выполнять фильтрацию событий именно здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью operators или [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут приводить к значительным накладным расходам по памяти и CPU, особенно при JSON-парсинге. Весь объём обработки можно выполнять в ClickHouse на этапе вставки данных с помощью materialized views и столбцов, за некоторыми исключениями — в частности, обогащения, зависящего от контекста, т. е. добавления k8s-метаданных. Подробнее см. [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять трансформации на gateway-инстансах и минимизировать работу на agent-инстансах. Это позволит свести к минимуму требования к ресурсам агентов на периферии, работающих на серверах. Как правило, мы наблюдаем, что пользователи выполняют в агентах только фильтрацию (для минимизации ненужного сетевого трафика), установку временной метки (через operators) и обогащение, требующее контекста. Например, если gateway-инстансы находятся в другом Kubernetes-кластере, k8s-обогащение придётся выполнять в агенте.

### Пример {#example-2}

Следующая конфигурация демонстрирует сбор данных из неструктурированного файла логов. Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, а также процессора для пакетной обработки событий и ограничения потребления памяти.

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

Экспортеры отправляют данные в один или несколько бэкендов или целевых систем. Экспортеры могут использовать pull- или push-модель. Чтобы отправлять события в ClickHouse, необходимо использовать push-ориентированный [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основного дистрибутива. Вы можете либо использовать дистрибутив contrib, либо [собрать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Ниже приведён полный конфигурационный файл.

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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


* **pipelines** - приведённая выше конфигурация подчёркивает использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора receivers, processors и exporters, с отдельными конвейерами для логов и трейсов.
* **endpoint** - взаимодействие с ClickHouse настраивается с помощью параметра `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` задаёт использование TCP. Если вы предпочитаете HTTP по причинам, связанным с маршрутизацией трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные сведения о подключении, включая возможность указать имя пользователя и пароль в этой строке подключения, описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** обратите внимание, что приведённая выше строка подключения включает как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба этих механизма. См. раздел [Batching](#batching) для получения дополнительных сведений об асинхронных вставках. Сжатие всегда должно быть указано явно и по умолчанию не будет включено в старых версиях экспортера.

* **ttl** - это значение определяет, как долго данные хранятся. Дополнительные сведения см. в разделе «Managing data». Значение должно задаваться как временной интервал в часах, например 72h. В примере ниже мы отключаем TTL, так как наши данные относятся к 2019 году и будут немедленно удалены ClickHouse при вставке.
* **traces&#95;table&#95;name** и **logs&#95;table&#95;name** - определяют имена таблиц для логов и трейсов.
* **create&#95;schema** - определяет, создаются ли таблицы со стандартными схемами при запуске. По умолчанию равно true для упрощения начала работы. В дальнейшем вам следует установить значение false и задать собственные схемы.
* **database** - целевая база данных.
* **retry&#95;on&#95;failure** - настройки, определяющие, должны ли повторно отправляться неудачные пакеты.
* **batch** - пакетный процессор (batch processor) обеспечивает отправку событий пакетами. Мы рекомендуем значение около 5000 с тайм-аутом 5s. То, что будет достигнуто первым, инициирует сброс пакета в exporter. Уменьшение этих значений приведёт к конвейеру с меньшей задержкой и более ранней доступностью данных для запросов, ценой увеличения количества соединений и пакетов, отправляемых в ClickHouse. Это не рекомендуется, если вы не используете [asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может вызвать проблемы со [слишком большим числом частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если вы используете асинхронные вставки, доступность данных для запросов также будет зависеть от настроек асинхронных вставок, хотя данные всё равно будут раньше сбрасываться из коннектора. См. раздел [Batching](#batching) для получения дополнительных сведений.
* **sending&#95;queue** - управляет размером очереди отправки. Каждый элемент в очереди содержит один пакет. Если размер очереди будет превышен, например, из‑за недоступности ClickHouse при продолжающемся поступлении событий, пакеты будут отброшены.

Предполагая, что пользователи извлекли структурированный файл логов и у них запущен [локальный экземпляр ClickHouse](/install) (с аутентификацией по умолчанию), вы можете запустить эту конфигурацию командой:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки в этот коллектор, выполните следующую команду с помощью утилиты `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска убедитесь, что появились записи журналов, выполнив простой запрос:


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

Likewise, for trace events, you can check the `otel_traces` table:

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

По умолчанию экспортер ClickHouse создает целевые таблицы для логов и трейсов. Это можно отключить с помощью настройки `create_schema`. Кроме того, имена таблиц логов и трейсов можно изменить с их значений по умолчанию — `otel_logs` и `otel_traces` — с помощью настроек, указанных выше.

:::note
В приведенных ниже схемах мы предполагаем, что TTL включен и равен 72 ч.
:::

Схема по умолчанию для логов приведена ниже (`otelcol-contrib v0.102.1`):

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

Здесь столбцы соответствуют официальной спецификации OTel для логов, описанной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных замечаний по этой схеме:


- По умолчанию таблица разбивается на партиции по дате с помощью `PARTITION BY toDate(Timestamp)`. Это делает удаление устаревших данных более эффективным.
- TTL задаётся через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, указанному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые части, когда все содержащиеся в них строки устарели. Это более эффективно, чем удаление строк внутри частей, так как такая операция дорогостоящая. Мы рекомендуем всегда устанавливать этот параметр. Подробности см. в разделе [Data management with TTL](/observability/managing-data#data-management-with-ttl-time-to-live).
- Таблица использует классический движок [`MergeTree`](/engines/table-engines/mergetree-family/mergetree). Он рекомендован для логов и трейсов и, как правило, не требует изменений.
- Таблица отсортирована по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId`: более ранние столбцы в списке будут фильтроваться быстрее, чем последующие, например фильтрация по `ServiceName` будет значительно быстрее, чем по `TraceId`. Следует изменить этот порядок в соответствии с ожидаемыми сценариями доступа — см. [Choosing a primary key](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- Указанная выше схема применяет `ZSTD(1)` к столбцам. Это обеспечивает наилучшее сжатие для логов. Вы можете увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшего сжатия, хотя это редко бывает полезно. Увеличение этого значения приведёт к большему использованию CPU во время вставки (во время сжатия), хотя распаковка (и, следовательно, запросы) должна оставаться сопоставимой по производительности. Дополнительные подробности см. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Дополнительно [delta encoding](/sql-reference/statements/create/table#delta) применяется к Timestamp с целью уменьшения его размера на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) — это типы Map. Важно понимать различия между ними. См. раздел ["Using maps"](/use-cases/observability/schema-design#using-maps) о том, как получать доступ к этим Map и оптимизировать доступ к ключам в них.
- Большинство других типов здесь, например `ServiceName` с типом LowCardinality, уже оптимизированы. Обратите внимание, что `Body`, который является JSON в наших примерных логах, хранится как String.
- Bloom-фильтры применяются к ключам и значениям Map, а также к столбцу `Body`. Они нацелены на улучшение времени выполнения запросов, обращающихся к этим столбцам, но обычно не являются обязательными. См. [Secondary/Data skipping indices](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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

Как и ранее, это будет коррелировать со столбцами, соответствующими официальной спецификации OTel для трейсов, описанной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Эта схема использует многие из тех же настроек, что и приведённая выше схема логов, с дополнительными столбцами Link, специфичными для спанов.

Рекомендуем отключить автоматическое создание схемы и создавать таблицы вручную. Это позволяет изменять первичные и вторичные ключи, а также даёт возможность добавлять дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительных сведений см. раздел [Schema design](/use-cases/observability/schema-design).


## Оптимизация вставок {#optimizing-inserts}

Чтобы добиться высокой производительности вставок при сохранении строгих гарантий согласованности, следует придерживаться простых правил при вставке данных обсервабилити в ClickHouse через коллектор. При корректной конфигурации OTel collector соблюдение следующих правил не должно представлять сложности. Это также позволяет избежать [типичных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждый INSERT, отправленный в ClickHouse, приводит к немедленному созданию части хранилища (part), которая содержит данные из этого INSERT вместе с другими метаданными, которые необходимо записать. Поэтому отправка меньшего количества INSERT‑запросов, каждый из которых содержит больше данных, по сравнению с отправкой большего количества INSERT‑запросов с меньшим объемом данных, уменьшит число необходимых операций записи. Мы рекомендуем вставлять данные достаточно крупными пакетами — как минимум по 1&nbsp;000 строк за раз. Дополнительные подробности приведены [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными при совпадении данных. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически [дедуплицирует вставки](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы к ошибкам в следующих случаях:

- (1) Если у узла, принимающего данные, возникают проблемы, запрос INSERT завершится по тайм-ауту (или вернет более специфичную ошибку) и не получит подтверждения.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из‑за сетевых сбоев, отправитель получит либо тайм-аут, либо сетевую ошибку.

С точки зрения коллектора случаи (1) и (2) может быть сложно различить. Однако в обоих случаях неподтвержденную вставку можно немедленно повторить. Пока повторный INSERT‑запрос содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если (неподтвержденный) исходный INSERT завершился успешно.

Мы рекомендуем использовать [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, чтобы выполнить описанные выше требования. Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие указанным условиям. Если от коллектора ожидается высокая пропускная способность (событий в секунду) и как минимум 5000 событий могут быть отправлены в каждой вставке, это, как правило, единственное необходимое пакетирование в конвейере. В этом случае коллектор будет сбрасывать пакеты до того, как будет достигнут `timeout` batch processor, обеспечивая низкую сквозную задержку конвейера и стабильный размер пакетов.

### Используйте асинхронные вставки {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять более мелкие батчи, когда пропускная способность коллектора низкая, при этом они по‑прежнему ожидают, что данные будут попадать в ClickHouse с минимальной сквозной задержкой. В этом случае небольшие батчи отправляются, когда истекает `timeout` batch‑процессора. Это может вызывать проблемы и является ситуацией, когда требуются асинхронные вставки. Такая ситуация обычно возникает, когда **коллекторы в роли агента настроены на отправку напрямую в ClickHouse**. Шлюзы, выступая в роли агрегаторов, могут смягчить эту проблему — см. раздел [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если невозможно гарантировать большие батчи, вы можете делегировать формирование батчей ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже, асинхронно.

<Image img={observability_6} alt="Async inserts" size="md"/>

При [включённых асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) когда ClickHouse ① получает запрос на вставку, данные из запроса ② сразу записываются сначала в оперативную память, в буфер. Когда ③ происходит следующий сброс буфера (flush), данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как part в хранилище базы данных. Обратите внимание, что данные недоступны для поиска запросами до их сброса в хранилище базы данных; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (значение по умолчанию), чтобы получить гарантии доставки — дополнительные сведения см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

Данные из асинхронной вставки записываются после сброса буфера ClickHouse. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` имеет ненулевое значение, данные вставляются по истечении `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Вы можете настроить эти параметры, чтобы управлять сквозной задержкой конвейера. Дополнительные параметры, с помощью которых можно настроить сброс буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию подходят.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но жёсткими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). Как правило, они неприменимы к сценариям обсервабилити с высокой пропускной способностью, характерным для ClickHouse.
:::

Наконец, прежнее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные сведения о настройке этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), а подробный разбор — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Архитектуры развертывания {#deployment-architectures}

При использовании OTel collector с ClickHouse возможно несколько вариантов архитектуры развертывания. Ниже мы описываем каждый из них и случаи, в которых он наиболее применим.

### Только агенты {#agents-only}

В архитектуре только с агентами пользователи разворачивают OTel collector в роли агентов на периферии. Они получают трейсы от локальных приложений (например, как sidecar-контейнеры) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные напрямую в ClickHouse.

<Image img={observability_7} alt="Только агенты" size="md"/>

Эта архитектура подходит для небольших и средних развертываний. Ее основное преимущество — отсутствие требований к дополнительному оборудованию и минимальный совокупный ресурсный след решения ClickHouse для обсервабилити при простой схеме соответствия между приложениями и коллекторами.

Следует рассмотреть миграцию на архитектуру с Gateway, как только количество агентов превысит несколько сотен. У этой архитектуры есть несколько недостатков, которые осложняют масштабирование:

- **Масштабирование подключений** — каждый агент устанавливает соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных подключений для вставки, в конечном итоге это становится ограничивающим фактором и снижает эффективность вставок — то есть больше ресурсов ClickHouse тратится на поддержание подключений. Использование шлюзов минимизирует количество подключений и делает вставки более эффективными.
- **Обработка на периферии** — любые трансформации или обработка событий в этой архитектуре должны выполняться либо на периферии, либо в ClickHouse. Помимо ограниченности, это может означать либо сложные materialized view в ClickHouse, либо перенос значительных вычислений на периферию — где критичные сервисы могут пострадать, а ресурсы ограничены.
- **Небольшие батчи и задержки** — агентские коллекторы могут по отдельности собирать очень небольшое количество событий. Обычно это означает, что их необходимо настроить на сброс данных через заданные интервалы, чтобы удовлетворить SLA по доставке. Это может привести к тому, что коллектор будет отправлять в ClickHouse небольшие батчи. Несмотря на то, что это недостаток, его можно смягчить с помощью асинхронных вставок — см. [Optimizing inserts](#optimizing-inserts).

### Масштабирование с помощью шлюзов {#scaling-with-gateways}

OTel collector могут быть развернуты в виде экземпляров Gateway для устранения указанных выше ограничений. Они предоставляют отдельный сервис, как правило, на каждый дата-центр или регион. Эти экземпляры получают события от приложений (или других коллекторов в роли агента) через единый OTLP‑эндпоинт. Обычно разворачивается набор экземпляров шлюзов, а для распределения нагрузки между ними используется стандартный балансировщик нагрузки.

<Image img={observability_8} alt="Масштабирование с помощью шлюзов" size="md" />

Цель этой архитектуры — снять ресурсоемкую обработку с агентов, тем самым минимизируя их потребление ресурсов. Эти шлюзы могут выполнять задачи преобразования, которые в противном случае пришлось бы выполнять агентам. Кроме того, агрегируя события от множества агентов, шлюзы могут обеспечивать отправку крупных пакетов данных в ClickHouse, что позволяет эффективно производить вставку. Эти коллекторы‑шлюзы можно легко масштабировать по мере добавления новых агентов и роста объема событий. Пример конфигурации шлюза с соответствующей конфигурацией агента, который читает пример структурированного файла логов, приведен ниже. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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


[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E\&distro=otelcol-contrib%7E\&distroVersion=v0.103.1%7E)

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

Эти конфигурации можно применить с помощью следующих команд.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

Основной недостаток такой архитектуры — стоимость и накладные расходы, связанные с управлением набором коллекторов.

В качестве примера управления более крупными архитектурами с центральным шлюзом и связанных с этим уроков мы рекомендуем эту [статью в блоге](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).


### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что приведённые выше архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka как буфера сообщений — популярный архитектурный паттерн, встречающийся в архитектурах логирования и получивший широкое распространение благодаря стеку ELK. Он даёт несколько преимуществ: в первую очередь, помогает обеспечить более строгие гарантии доставки сообщений и упростить работу с backpressure. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластер Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку линейная запись данных на диск требует меньше вычислительных ресурсов, чем разбор и обработка сообщений — в Elastic, например, токенизация и индексация создают значительные накладные расходы. Вынося данные за пределы агентов, вы также снижаете риск потери сообщений в результате ротации логов на источнике. Наконец, Kafka предлагает некоторые возможности повторной доставки сообщений и межрегиональной репликации, что может быть привлекательно для ряда сценариев.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на среднем аппаратном обеспечении. Backpressure со стороны ClickHouse возникает **редко**. Часто использование очереди Kafka приводит к повышенной архитектурной сложности и затратам. Если вы можете исходить из принципа, что логи не требуют тех же гарантий доставки, что банковские транзакции и другие критически важные данные, мы рекомендуем избегать усложнения архитектуры за счёт Kafka.

Тем не менее, если вам требуются высокие гарантии доставки или возможность повторного воспроизведения данных (потенциально в несколько источников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Adding kafka" size="md"/>

В этом случае агенты OTel можно настроить на отправку данных в Kafka через [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). В свою очередь, экземпляры gateway потребляют сообщения, используя [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). За дополнительной информацией мы рекомендуем обратиться к документации Confluent и OTel.

### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel collector зависят от пропускной способности потока событий, размера сообщений и объёма выполняемой обработки. Проект OpenTelemetry ведёт [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки потребностей в ресурсах.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр gateway с 3 ядрами и 12&nbsp;ГБ ОЗУ может обрабатывать около 60&nbsp;тыс. событий в секунду. Это предполагает минимальный конвейер обработки, отвечающий только за переименование полей, и отсутствие регулярных выражений.

Для экземпляров agent, отвечающих за отправку событий на gateway и только за установку метки времени на событии, мы рекомендуем подбирать ресурсы, исходя из ожидаемого числа логов в секунду. Ниже приведены примерные значения, которые можно использовать как отправную точку:

| Скорость поступления логов | Ресурсы для collector agent |
|----------------------------|-----------------------------|
| 1k/секунда                 | 0,2 CPU, 0,2 GiB            |
| 5k/секунда                 | 0,5 CPU, 0,5 GiB            |
| 10k/секунда                | 1 CPU, 1 GiB                |