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

Любому решению в области обсервабилити необходим механизм для сбора и экспорта логов и трейсов. Для этих целей ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

«OpenTelemetry — это фреймворк и набор инструментов для обсервабилити, предназначенный для создания и управления телеметрическими данными, такими как трейсы, метрики и логи».

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бэкендом обсервабилити, а фокусируется на генерации, сборе, управлении и экспорте телеметрических данных. Хотя изначальной целью OpenTelemetry было предоставить возможность легко инструментировать ваши приложения или системы с помощью языковых SDK, проект был расширен и теперь включает сбор логов через OpenTelemetry collector — агент или прокси, который принимает, обрабатывает и экспортирует телеметрические данные.

## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из нескольких компонентов. Помимо спецификации данных и API, стандартизированного протокола и соглашений об именовании полей/столбцов, OTel предоставляет две возможности, которые являются фундаментальными для построения решения по обсервабилити с ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси, который принимает, обрабатывает и экспортирует телеметрические данные. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед их пакетированием и вставкой.
- [Language SDKs](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDKs обеспечивают корректную регистрацию трейсов в коде приложения, генерируют отдельные спаны и гарантируют распространение контекста между сервисами через метаданные — тем самым формируя распределённые трейсы и обеспечивая возможность коррелировать спаны. Эти SDKs дополняются экосистемой, которая автоматически интегрируется с распространёнными библиотеками и фреймворками, благодаря чему пользователю не требуется менять свой код и он получает инструментацию «из коробки».

Решение по обсервабилити на базе ClickHouse использует оба этих инструмента.

## Дистрибутивы {#distributions}

Коллектор OpenTelemetry имеет [несколько дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Приемник `filelog` вместе с экспортёром ClickHouse, необходимыми для решения на базе ClickHouse, присутствуют только в [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет экспериментировать с различными конфигурациями. Однако при использовании в production рекомендуется ограничить состав коллектора только компонентами, необходимыми для конкретной среды. Некоторые причины для этого:

- уменьшить размер коллектора, сократив время его развертывания;
- повысить безопасность коллектора за счёт уменьшения доступной поверхности атаки.

Сборку [пользовательского коллектора](https://opentelemetry.io/docs/collector/custom-collector/) можно выполнить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).

## Приём данных с помощью OTel {#ingesting-data-with-otel}

### Роли развертывания коллекторов {#collector-deployment-roles}

Для сбора логов и записи их в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector можно развернуть в двух основных ролях:

- **Agent** — экземпляры агента собирают данные на границе системы, например на серверах или узлах Kubernetes, либо получают события напрямую от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента запускается вместе с приложением или на том же хосте, что и приложение (например, в виде сайдкара или ДемонСета). Агенты могут либо отправлять свои данные напрямую в ClickHouse, либо на экземпляр шлюза. В первом случае это называется [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Gateway** — экземпляры шлюза предоставляют автономный сервис (например, Развертывание в Kubernetes), как правило, на кластер, дата-центр или регион. Они принимают события от приложений (или других коллекторов, работающих как агенты) через единую конечную точку OTLP. Обычно разворачивается набор экземпляров шлюза, а для распределения нагрузки между ними используется стандартный балансировщик нагрузки. Если все агенты и приложения отправляют свои сигналы на эту единую конечную точку, это часто называют [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/).

Ниже мы подразумеваем использование простого коллектора-агента, отправляющего свои события напрямую в ClickHouse. Дополнительные сведения об использовании шлюзов и случаях, когда они применимы, см. в разделе [Scaling with Gateways](#scaling-with-gateways).

### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора заключается в том, что он позволяет вашим сервисам быстро выгружать данные, передавая Коллектору последующую обработку: повторные попытки отправки, формирование батчей, шифрование и даже фильтрацию конфиденциальных данных.

Collector использует термины [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) для своих трех основных стадий обработки. Receivers используются для сбора данных и могут работать как по pull-, так и по push-модели. Processors позволяют выполнять трансформацию и обогащение сообщений. Exporters отвечают за отправку данных в downstream-сервис. Хотя этим сервисом теоретически может быть другой коллектор, в исходном обсуждении ниже мы предполагаем, что все данные отправляются напрямую в ClickHouse.

<Image img={observability_3} alt="Collecting logs" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором receivers, processors и exporters.

Collector предоставляет два основных receiver для сбора логов:

**Через OTLP** — в этом случае логи отправляются (push) напрямую в коллектор из OpenTelemetry SDKs по протоколу OTLP. [OpenTelemetry demo](https://opentelemetry.io/docs/demo/) использует этот подход, при котором OTLP-exporters для каждого языка предполагают локальный endpoint коллектора. В этом случае коллектор должен быть сконфигурирован с OTLP-receiver — см. [демо для примера конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода заключается в том, что данные логов автоматически будут содержать Trace Ids, что позволит пользователям в дальнейшем находить трейсы для конкретного лога и наоборот.

<Image img={observability_4} alt="Collecting logs via otlp" size="md"/>

Этот подход требует, чтобы пользователи проинструментировали свой код с помощью [SDK для соответствующего языка](https://opentelemetry.io/docs/languages/).

- **Скрапинг через Filelog receiver** — этот receiver читает (tail) файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Он обрабатывает сложные задачи, такие как определение многострочных сообщений, обработка ротации логов, ведение контрольных точек для устойчивости к перезапускам и извлечение структуры. Кроме того, этот receiver способен читать логи контейнеров Docker и Kubernetes, разворачиваясь как Helm-чарт, [извлекая структуру из этих логов](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями пода.

<Image img={observability_5} alt="File log receiver" size="md"/>

**В большинстве случаев развертывания будут использовать комбинацию перечисленных выше receivers. Мы рекомендуем пользователям прочитать [документацию по collector](https://opentelemetry.io/docs/collector/) и ознакомиться с базовыми концепциями, а также со [структурой конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методами установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Tip: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::

## Структурированные и неструктурированные {#structured-vs-unstructured}

Логи могут быть либо структурированными, либо неструктурированными.

Структурированный лог использует формат данных, например JSON, с определёнными полями метаданных, такими как HTTP-код и IP-адрес источника.

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

Неструктурированные логи, хотя обычно и обладают некоторой внутренней структурой, которую можно извлечь с помощью регулярного выражения, представляют лог лишь в виде строки.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем пользователям использовать структурированные логи и, где это возможно, вести их в формате JSON (например, ndjson). Это упростит последующую обработку логов — либо до отправки в ClickHouse с помощью [Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors), либо на этапе вставки с использованием materialized views. Структурированные логи в конечном счёте позволят сократить затраты на последующую обработку и уменьшить требуемое потребление CPU в вашем решении на базе ClickHouse.


### Пример {#example}

В качестве примера мы предоставляем наборы данных с логами в структурированном (JSON) и неструктурированном виде, каждый примерно по 10 млн строк, доступные по следующим ссылкам:

* [Unstructured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Structured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

В примере ниже мы используем структурированный набор данных. Чтобы воспроизвести следующие примеры, убедитесь, что этот файл загружен и распакован.

Ниже приведена простая конфигурация для OTel collector, который читает эти файлы с диска с помощью `filelog` receiver и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), поскольку наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите использование ClickHouse для парсинга
Пример ниже извлекает метку времени из лога. Для этого требуется использовать оператор `json_parser`, который конвертирует всю строку лога в JSON-строку, помещая результат в `LogAttributes`. Это может быть вычислительно затратно и [может быть выполнено эффективнее в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) — [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный пример для неструктурированных логов, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения того же результата, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Вы можете следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для локальной установки коллектора. Важно скорректировать их так, чтобы использовать [contrib-дистрибутив](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (который содержит `filelog` receiver), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователям следует скачивать `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы доступны [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить следующими командами:

```bash
./otelcol-contrib --config config-logs.yaml
```

При использовании структурированных логов сообщения на выходе будут иметь следующий вид:


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

Приведённый выше пример представляет собой одно сообщение лога, сформированное OTel collector. Эти же сообщения мы будем принимать в ClickHouse в последующих разделах.

Полная схема сообщений логов вместе с дополнительными столбцами, которые могут присутствовать при использовании других ресиверов (receivers), описана [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевой момент здесь в том, что сама строка лога хранится как строка в поле `Body`, а JSON автоматически извлекается в поле Attributes благодаря `json_parser`. Тот же [operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) используется для извлечения отметки времени в соответствующий столбец `Timestamp`. Рекомендации по обработке логов с помощью OTel см. в разделе [Processing](#processing---filtering-transforming-and-enriching).

:::note Operators
Operators — это базовые единицы обработки логов. Каждый operator выполняет одну задачу, например чтение строк из файла или разбор JSON из поля. Затем operators объединяются в конвейер (pipeline), чтобы получить нужный результат.
:::

В приведённых выше сообщениях отсутствуют поля `TraceID` или `SpanID`. Если они присутствуют, например в случаях, когда пользователи реализуют [distributed tracing](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON, используя те же подходы, что показаны выше.

Пользователям, которым необходимо собирать локальные файлы логов или логи Kubernetes, мы рекомендуем ознакомиться с параметрами конфигурации, доступными для [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration), а также с тем, как обрабатываются [offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и как выполняется [разбор многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).


## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем [руководство в документации OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). Для обогащения логов и метрик метаданными подов рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor). Это может приводить к появлению динамических метаданных, например меток, которые хранятся в столбце `ResourceAttributes`. В настоящее время ClickHouse использует тип `Map(String, String)` для этого столбца. Дополнительные сведения о работе с этим типом и его оптимизации см. в разделах [Using Maps](/use-cases/observability/schema-design#using-maps) и [Extracting from maps](/use-cases/observability/schema-design#extracting-from-maps).

## Сбор трассировок {#collecting-traces}

Пользователям, которые хотят инструментировать свой код и собирать трассировки, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставлять события в ClickHouse, необходимо развернуть OTel collector для приёма событий трассировок по протоколу OTLP через соответствующий receiver (приёмник). Демонстрационный проект OpenTelemetry предоставляет [пример инструментирования для каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в OTel collector. Ниже приведён пример конфигурации подходящего OTel collector, который выводит события в stdout:

### Пример {#example-1}

Поскольку трассировки должны приниматься по протоколу OTLP, мы используем утилиту [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трассировок. Для установки следуйте инструкциям [по этой ссылке](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen).

Следующая конфигурация принимает события трассировок на приёмнике OTLP, а затем отправляет их в stdout.

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

Отправьте события трассировки в коллектор через `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

В результате в stdout будут выводиться трассировочные сообщения, похожие на приведённый ниже пример:

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

Приведённый выше пример представляет собой отдельное сообщение трассировки, сформированное OTel collector. Эти же сообщения мы передаём на приём в ClickHouse в последующих разделах.

Полная схема сообщений трассировки описана [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем ознакомиться с этой схемой.


## Обработка — фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как было показано в предыдущем примере установки временной метки для события лога, вам, как правило, потребуется фильтровать, преобразовывать и обогащать сообщения событий. Это можно реализовать с помощью ряда возможностей в OpenTelemetry:

- **Processors** — Processors принимают данные, собираемые [receivers, и модифицируют или преобразуют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортерам. Processors применяются в порядке, указанном в разделе `processors` конфигурации collector. Они необязательны, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничиться следующими processors:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с исчерпанием памяти на collector. См. рекомендации в разделе [Estimating Resources](#estimating-resources).
  - Любой processor, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически задавать resource-атрибуты spans, metrics и logs с k8s-метаданными, например, обогащать события идентификатором исходного пода.
  - [Tail или head sampling](https://opentelemetry.io/docs/concepts/sampling/), если это требуется для traces.
  - [Basic filtering](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание ненужных событий, если это нельзя сделать через operators (см. ниже).
  - [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — критично при работе с ClickHouse, чтобы данные отправлялись батчами. См. ["Exporting to ClickHouse"](#exporting-to-clickhouse).

- **Operators** — [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) представляют собой самый базовый блок обработки на уровне receiver. Поддерживается базовый парсинг, позволяющий задавать такие поля, как Severity и Timestamp. Здесь поддерживаются JSON- и regex-парсинг, а также фильтрация событий и базовые трансформации. Мы рекомендуем выполнять фильтрацию событий именно здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью operators или [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут приводить к существенным накладным расходам по памяти и CPU, особенно при JSON-парсинге. Практически всю обработку можно выполнить в ClickHouse на этапе вставки с помощью materialized view и столбцов, за некоторыми исключениями — в частности, обогащение, зависящее от контекста, например добавление k8s-метаданных. Подробнее см. [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять трансформации на экземплярах gateway и минимизировать работу на экземплярах agent. Это гарантирует, что ресурсы, требуемые агентам на периферии, работающим на серверах, будут минимальными. Обычно мы видим, что пользователи выполняют только фильтрацию (для минимизации лишнего сетевого трафика), установку временной метки (через operators) и обогащение, которое требует контекста, на уровне agents. Например, если экземпляры gateway находятся в другом кластере Kubernetes, обогащение k8s потребуется выполнять на уровне agent.

### Пример {#example-2}

Следующая конфигурация показывает сбор неструктурированных логов из файла. Обратите внимание на использование операторов для извлечения структуры из строк журнала (`regex_parser`) и фильтрации событий, а также процессора для пакетной обработки событий и ограничения использования памяти.

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

Экспортеры отправляют данные в один или несколько бэкендов или конечных получателей. Экспортеры могут работать по модели pull или push. Чтобы отправлять события в ClickHouse, необходимо использовать экспортер с push-моделью — [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основной дистрибуции. Вы можете либо использовать contrib-дистрибуцию, либо [собрать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Ниже приведён полный файл конфигурации.

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

Обратите внимание на следующие важные параметры:


* **pipelines** - Конфигурация выше демонстрирует использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора receivers, processors и exporters, с отдельными конвейерами для logs и traces.
* **endpoint** - Взаимодействие с ClickHouse настраивается через параметр `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` задаёт взаимодействие по TCP. Если вы предпочитаете HTTP по причинам, связанным с переключением/маршрутизацией трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные сведения о подключении, включая возможность указать имя пользователя и пароль в этой строке подключения, приведены [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что приведённая выше строка подключения включает как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба параметра. Дополнительные сведения об асинхронных вставках см. в разделе [Batching](#batching). Сжатие всегда должно быть явно указано и по умолчанию не будет включено в более старых версиях экспортера.

* **ttl** - значение здесь определяет, как долго хранятся данные. Дополнительные сведения см. в разделе «Managing data». Это значение следует указывать как величину времени в часах, например 72h. В примере ниже мы отключаем TTL, поскольку наши данные относятся к 2019 году и будут немедленно удалены ClickHouse при вставке.
* **traces&#95;table&#95;name** и **logs&#95;table&#95;name** - определяют имена таблиц для logs и traces.
* **create&#95;schema** - определяет, создаются ли таблицы с использованием схем по умолчанию при запуске. По умолчанию равно true для упрощения начала работы. В дальнейшем следует установить это значение в false и определить собственную схему.
* **database** - целевая база данных.
* **retry&#95;on&#95;failure** - настройки, определяющие, следует ли повторно пытаться отправить неуспешные пакеты.
* **batch** - batch-процессор гарантирует, что события отправляются пакетами. Мы рекомендуем значение около 5000 с таймаутом 5s. То условие, которое будет достигнуто первым, инициирует сброс пакета в экспортер. Уменьшение этих значений приведёт к меньшей задержке конвейера и более ранней доступности данных для выполнения запросов, но за счёт увеличения количества соединений и пакетов, отправляемых в ClickHouse. Это не рекомендуется, если вы не используете [asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может привести к проблемам со [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если вы используете asynchronous inserts, доступность данных для запросов также будет зависеть от настроек асинхронных вставок — хотя данные всё равно будут сбрасываться из коннектора раньше. Подробнее см. в разделе [Batching](#batching).
* **sending&#95;queue** - управляет размером очереди отправки. Каждый элемент очереди содержит пакет. Если размер этой очереди будет превышен, например из-за недоступности ClickHouse, но события продолжают поступать, пакеты будут отбрасываться.

Предполагая, что пользователи извлекли структурированный файл логов и у них запущен [локальный экземпляр ClickHouse](/install) (с аутентификацией по умолчанию), вы можете запустить эту конфигурацию командой:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки этому коллектору, выполните следующую команду с помощью утилиты `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска убедитесь, что появились события журналов, выполнив простой запрос:


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

По умолчанию экспортёр ClickHouse создаёт целевую таблицу в ClickHouse как для логов, так и для трейсов. Это можно отключить с помощью настройки `create_schema`. Кроме того, имена таблиц для логов и трейсов можно изменить относительно значений по умолчанию `otel_logs` и `otel_traces` с помощью настроек, указанных выше.

:::note
В схемах ниже мы предполагаем, что TTL включён и установлен в 72h.
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

Несколько важных замечаний об этой схеме:


- По умолчанию таблица разбивается на партиции по дате с помощью `PARTITION BY toDate(Timestamp)`. Это делает удаление устаревших данных эффективным.
- TTL задаётся через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, указанному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые части, когда все содержащиеся в них строки устарели. Это эффективнее, чем удаление строк внутри частей, которое приводит к дорогостоящей операции delete. Рекомендуем всегда устанавливать этот параметр. Более подробную информацию см. в разделе [Data management with TTL](/observability/managing-data#data-management-with-ttl-time-to-live).
- Таблица использует классический [`MergeTree` engine](/engines/table-engines/mergetree-family/mergetree). Он рекомендуется для логов и трейсинга и обычно не требует изменений.
- Таблица упорядочена по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтрации по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId`: более ранние столбцы в списке будут отфильтровываться быстрее, чем последующие, например фильтрация по `ServiceName` будет значительно быстрее фильтрации по `TraceId`. Вам следует изменять этот порядок в соответствии с ожидаемыми паттернами доступа — см. [Choosing a primary key](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- В приведённой выше схеме к столбцам применяется `ZSTD(1)`. Это обеспечивает наилучшее сжатие для логов. Вы можете увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшей компрессии, хотя это редко бывает полезно. Увеличение этого значения приведёт к большему потреблению CPU во время вставки (при сжатии), хотя декомпрессия (и, следовательно, выполнение запросов) должна оставаться сопоставимой. Более подробную информацию см. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Дополнительное [delta encoding](/sql-reference/statements/create/table#delta) применяется к Timestamp, чтобы уменьшить его размер на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются структурами типа Map. Важно понимать различия между ними. См. раздел ["Using maps"](/use-cases/observability/schema-design#using-maps) о том, как работать с этими Map-ами и оптимизировать доступ к ключам внутри них.
- Большинство других типов здесь, например `ServiceName` как LowCardinality, уже оптимизированы. Обратите внимание, что `Body`, который в наших примерных логах представлен в формате JSON, хранится как String.
- Bloom-фильтры применяются к ключам и значениям Map-ов, а также к столбцу `Body`. Они призваны улучшить время выполнения запросов, обращающихся к этим столбцам, но обычно не являются необходимыми. См. [Secondary/Data skipping indices](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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

Как и ранее, это будет коррелировать со столбцами, соответствующими официальной спецификации OTel по трассировкам, описанной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Эта схема использует многие из тех же настроек, что и приведённая выше схема логов, с дополнительными столбцами Link, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схем и создавать таблицы вручную. Это позволяет изменять первичные и вторичные ключи, а также даёт возможность добавлять дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительной информации см. [Проектирование схемы](/use-cases/observability/schema-design).


## Оптимизация вставок {#optimizing-inserts}

Чтобы добиться высокой производительности вставок при одновременном обеспечении строгих гарантий согласованности, следует придерживаться простых правил при вставке данных обсервабилити в ClickHouse через коллектор. При правильно настроенном OTel collector соблюдение следующих правил не должно вызвать затруднений. Это также поможет избежать [распространённых проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом знакомстве с ClickHouse.

### Пакетирование {#batching}

По умолчанию каждый INSERT, отправленный в ClickHouse, приводит к тому, что ClickHouse немедленно создает part хранилища, содержащую данные из вставки вместе с другими метаданными, которые требуется сохранить. Поэтому отправка меньшего количества INSERT-запросов, каждый из которых содержит больше данных, по сравнению с отправкой большего количества INSERT-запросов с меньшим объемом данных, уменьшит число необходимых операций записи. Мы рекомендуем вставлять данные достаточно крупными пакетами — по крайней мере по 1 000 строк за раз. Дополнительные подробности — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными при идентичном содержимом. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически выполняет [дедупликацию вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы к сбоям в следующих случаях:

- (1) Если узел, принимающий данные, испытывает проблемы, запрос на вставку завершится по тайм-ауту (или вернет более специфичную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых сбоев, отправитель получит либо тайм-аут, либо сетевую ошибку.

С точки зрения collector отличить (1) и (2) может быть сложно. Однако в обоих случаях неподтвержденную вставку можно просто немедленно повторить. Пока повторный запрос на вставку содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если исходная (неподтвержденная) вставка завершилась успешно.

Мы рекомендуем пользователям использовать [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в приведенных ранее конфигурациях, чтобы удовлетворить описанным выше требованиям. Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие этим требованиям. Если от collector ожидается высокая пропускная способность (событий в секунду) и в каждом INSERT можно отправлять как минимум 5 000 событий, это обычно единственное пакетирование, необходимое в pipeline. В этом случае collector будет сбрасывать пакеты до того, как будет достигнут `timeout` batch processor, что гарантирует, что сквозная задержка pipeline останется низкой, а пакеты будут иметь стабильный размер.

### Используйте асинхронные вставки {#use-asynchronous-inserts}

Обычно пользователям приходится отправлять меньшие пакеты, когда пропускная способность коллектора низкая, при этом они всё равно ожидают, что данные дойдут до ClickHouse с минимальной сквозной задержкой. В таком случае небольшие пакеты отправляются, когда истекает `timeout` процессора пакетной обработки. Это может вызывать проблемы и является случаем, когда требуются асинхронные вставки. Такая ситуация обычно возникает, когда **коллекторы в роли агента настроены на отправку данных напрямую в ClickHouse**. Шлюзы, выступая в роли агрегаторов, могут смягчить эту проблему — см. раздел [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если невозможно гарантировать большие пакеты, вы можете делегировать пакетирование ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже, то есть асинхронно.

<Image img={observability_6} alt="Асинхронные вставки" size="md"/>

При [включённых асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос на вставку, данные запроса ② сразу же записываются сначала в оперативный буфер в памяти. Когда ③ происходит очередной сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются в хранилище базы данных в виде part. Обратите внимание, что данные недоступны для запросов до тех пор, пока не будут сброшены в хранилище базы данных; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем использовать `wait_for_async_insert=1` (значение по умолчанию), чтобы получить гарантии доставки данных — подробности см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

Данные из асинхронной вставки вставляются после сброса буфера ClickHouse. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлено в ненулевое значение, данные вставляются по истечении `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Вы можете настраивать эти параметры, чтобы контролировать сквозную задержку вашего конвейера. Дополнительные параметры, которые можно использовать для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Обычно значений по умолчанию достаточно.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но жёсткими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). Как правило, они не применимы к сценариям обсервабилити с высокой пропускной способностью, как это наблюдается с ClickHouse.
:::

Наконец, прежнее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. параметр [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полная информация по настройке этой функции приведена [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), подробный разбор — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Архитектуры развертывания {#deployment-architectures}

При использовании OTel collector с ClickHouse возможно несколько архитектур развертывания. Ниже мы описываем каждую из них и случаи, когда она наиболее применима.

### Только агенты {#agents-only}

В архитектуре только с агентами пользователи разворачивают OTel collector в роли агентов на периферии. Они получают трейсы от локальных приложений (например, как sidecar-контейнер) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные напрямую в ClickHouse.

<Image img={observability_7} alt="Agents only" size="md"/>

Такая архитектура подходит для развертываний малого и среднего масштаба. Ее основное преимущество в том, что она не требует дополнительного оборудования и сохраняет общее ресурсное потребление решения ClickHouse для обсервабилити минимальным, обеспечивая простое соответствие между приложениями и коллекторами.

Следует рассмотреть переход на архитектуру на базе шлюзов (Gateway), как только количество агентов превысит несколько сотен. У этой архитектуры есть несколько недостатков, которые затрудняют масштабирование:

- **Масштабирование подключений** - Каждый агент устанавливает соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных соединений для вставки, в конечном итоге это станет ограничивающим фактором и сделает вставки менее эффективными — т.е. больше ресурсов ClickHouse будет тратиться на поддержание соединений. Использование шлюзов минимизирует количество соединений и делает вставки более эффективными.
- **Обработка на периферии** - В этой архитектуре любые трансформации или обработка событий должны выполняться на периферии или в ClickHouse. Помимо ограничений, это может означать либо сложные ClickHouse materialized views, либо перенос значительных вычислений на периферию — где критичные сервисы могут пострадать, а ресурсы ограничены.
- **Небольшие партии и задержки** - Коллекторы-агенты могут по отдельности собирать очень мало событий. Как правило, это означает, что их нужно настраивать на сброс (flush) с заданным интервалом, чтобы удовлетворять SLA по доставке. В результате коллектор может отправлять в ClickHouse небольшие партии данных. Несмотря на то, что это недостаток, его можно смягчить с помощью асинхронных вставок — см. [Оптимизация вставок](#optimizing-inserts).

### Масштабирование с помощью шлюзов {#scaling-with-gateways}

OTel collectors могут быть развернуты как экземпляры gateway для устранения перечисленных выше ограничений. Они представляют собой отдельный сервис, как правило, на каждый дата‑центр или регион. Они принимают события от приложений (или других коллекторов, работающих в роли агента) через единый OTLP endpoint. Обычно разворачивается набор экземпляров gateway, а стандартный балансировщик нагрузки используется для распределения нагрузки между ними.

<Image img={observability_8} alt="Масштабирование с помощью шлюзов" size="md" />

Цель этой архитектуры — разгрузить агентов от ресурсоёмкой обработки, тем самым минимизируя их потребление ресурсов. Эти шлюзы могут выполнять задачи трансформации, которые в противном случае должны были бы выполняться агентами. Кроме того, агрегируя события от множества агентов, шлюзы могут обеспечивать отправку в ClickHouse крупных пакетов данных, что позволяет эффективно вставлять данные. Эти gateway‑коллекторы легко масштабируются по мере добавления новых агентов и роста объёма событий. Ниже приведён пример конфигурации gateway вместе с соответствующей конфигурацией агента, который потребляет пример структурированного файла логов. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

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

Эти конфигурации можно развернуть с помощью следующих команд.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

Основной недостаток этой архитектуры — связанные с ней затраты и накладные расходы на управление набором коллекторов.

В качестве примера управления более крупными шлюзовыми архитектурами и связанных с этим уроков мы рекомендуем эту [публикацию в блоге](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).


### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что приведённые выше архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka как буфера сообщений — популярный шаблон проектирования, применяемый в архитектурах логирования и получивший широкое распространение благодаря стеку ELK. Он предоставляет несколько преимуществ; главным образом, помогает обеспечить более строгие гарантии доставки сообщений и упростить работу с backpressure. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. В теории кластер Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку для линейной записи данных на диск требуется меньший вычислительный ресурс, чем для парсинга и обработки сообщения — например, в Elastic токенизация и индексирование требуют значительных ресурсов. Убирая буферизацию данных с агентов, вы также снижаете риск потери сообщений из‑за ротации логов на стороне источника. Наконец, Kafka предоставляет некоторые возможности по повторной отправке сообщений и кросс-региональной репликации, что может быть полезно для отдельных сценариев.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на среднем аппаратном обеспечении. Backpressure со стороны ClickHouse **редок**. Часто использование очереди Kafka приводит к усложнению архитектуры и росту затрат. Если вы можете принять принцип, что логи не нуждаются в тех же гарантиях доставки, что банковские транзакции и другие критически важные данные, мы рекомендуем избегать дополнительной сложности, связанной с Kafka.

Тем не менее, если вам необходимы высокие гарантии доставки или возможность повторного воспроизведения данных (потенциально в несколько целевых систем), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Adding Kafka" size="md"/>

В этом случае агенты OTel можно настроить на отправку данных в Kafka с помощью [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). В свою очередь, экземпляры gateway-подов потребляют сообщения, используя [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Для получения дополнительной информации мы рекомендуем документацию Confluent и OTel.

### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel collector зависят от пропускной способности по событиям, размера сообщений и объёма выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр gateway с 3 ядрами и 12GB RAM может обрабатывать около 60k событий в секунду. Предполагается минимальный конвейер обработки, отвечающий только за переименование полей и не использующий регулярные выражения.

Для экземпляров агентa, отвечающих за доставку событий в gateway и лишь за установку временной метки события, мы рекомендуем подбирать размеры экземпляров исходя из ожидаемого числа логов в секунду. Ниже приведены ориентировочные значения, которые можно использовать в качестве отправной точки:

| Скорость логирования | Ресурсы для collector agent |
|----------------------|-----------------------------|
| 1k/second            | 0.2CPU, 0.2GiB             |
| 5k/second            | 0.5 CPU, 0.5GiB            |
| 10k/second           | 1 CPU, 1GiB                |