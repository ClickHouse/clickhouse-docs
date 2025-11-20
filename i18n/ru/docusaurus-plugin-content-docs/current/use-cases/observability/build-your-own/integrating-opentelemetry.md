---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для наблюдаемости'
slug: /observability/integrating-opentelemetry
keywords: ['Observability', 'OpenTelemetry']
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


# Интеграция OpenTelemetry для сбора данных

Любому решению для наблюдаемости требуется средство для сбора и экспорта логов и трассировок. Для этих целей ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

«OpenTelemetry — это фреймворк и набор инструментов для наблюдаемости, предназначенный для создания и управления данными телеметрии, такими как трассировки, метрики и логи».

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бекендом для наблюдаемости, а сосредоточен на генерации, сборе, управлении и экспорте данных телеметрии. Хотя изначальной целью OpenTelemetry было упростить для пользователей инструментирование своих приложений и систем с помощью SDK для разных языков, его возможности были расширены, и теперь он включает сбор логов через OpenTelemetry Collector — агент или прокси, который получает, обрабатывает и экспортирует данные телеметрии.



## Релевантные компоненты ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из нескольких компонентов. Помимо предоставления спецификации данных и API, стандартизированного протокола и соглашений об именовании полей/столбцов, OTel предоставляет две возможности, которые являются фундаментальными для построения решения Observability на базе ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси-сервер, который принимает, обрабатывает и экспортирует телеметрические данные. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед их пакетированием и вставкой.
- [SDK для языков программирования](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDK обеспечивают корректную запись трассировок в коде приложения, генерируя составные спаны и обеспечивая передачу контекста между сервисами через метаданные — таким образом формируя распределённые трассировки и обеспечивая возможность корреляции спанов. Эти SDK дополняются экосистемой, которая автоматически реализует поддержку распространённых библиотек и фреймворков, что означает, что пользователю не требуется изменять свой код — инструментирование доступно из коробки.

Решение Observability на базе ClickHouse использует оба этих инструмента.


## Дистрибутивы {#distributions}

Коллектор OpenTelemetry имеет [несколько дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Приёмник filelog вместе с экспортером ClickHouse, необходимые для решения на базе ClickHouse, присутствуют только в [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при работе в production-окружении рекомендуется ограничить коллектор только теми компонентами, которые необходимы для конкретной среды. Основные причины:

- Уменьшение размера коллектора, что сокращает время развёртывания
- Повышение безопасности коллектора за счёт сокращения поверхности атаки

Сборка [пользовательского коллектора](https://opentelemetry.io/docs/collector/custom-collector/) выполняется с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).


## Прием данных с помощью OTel {#ingesting-data-with-otel}

### Роли развертывания коллектора {#collector-deployment-roles}

Для сбора логов и их загрузки в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector может быть развернут в двух основных ролях:

- **Agent (Агент)** - Экземпляры агента собирают данные на периферии, например, на серверах или узлах Kubernetes, либо получают события напрямую от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента работает вместе с приложением или на том же хосте (например, в виде sidecar или DaemonSet). Агенты могут отправлять данные либо напрямую в ClickHouse, либо в экземпляр шлюза. В первом случае это называется [паттерном развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Gateway (Шлюз)** - Экземпляры шлюза предоставляют автономный сервис (например, развертывание в Kubernetes), обычно на уровне кластера, центра обработки данных или региона. Они получают события от приложений (или других коллекторов в роли агентов) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюза с готовым балансировщиком нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую конечную точку, это часто называется [паттерном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

Далее мы рассматриваем простой коллектор-агент, отправляющий события напрямую в ClickHouse. Подробнее об использовании шлюзов и сценариях их применения см. в разделе [Масштабирование с помощью шлюзов](#scaling-with-gateways).

### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора заключается в том, что он позволяет вашим сервисам быстро выгружать данные, оставляя коллектору заботу о дополнительной обработке, такой как повторные попытки отправки, пакетирование, шифрование или даже фильтрация конфиденциальных данных.

Коллектор использует термины [receiver (приемник)](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor (процессор)](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter (экспортер)](https://opentelemetry.io/docs/collector/configuration/#exporters) для обозначения трех основных этапов обработки. Приемники используются для сбора данных и могут работать по принципу pull или push. Процессоры предоставляют возможность выполнять преобразования и обогащение сообщений. Экспортеры отвечают за отправку данных в нижестоящий сервис. Хотя теоретически этим сервисом может быть другой коллектор, в первоначальном обсуждении ниже мы предполагаем, что все данные отправляются напрямую в ClickHouse.

<Image img={observability_3} alt='Collecting logs' size='md' />

Мы рекомендуем пользователям ознакомиться с полным набором приемников, процессоров и экспортеров.

Коллектор предоставляет два основных приемника для сбора логов:

**Через OTLP** - В этом случае логи отправляются (push) напрямую в коллектор из OpenTelemetry SDK через протокол OTLP. [Демонстрация OpenTelemetry](https://opentelemetry.io/docs/demo/) использует этот подход, при этом экспортеры OTLP на каждом языке предполагают локальную конечную точку коллектора. В этом случае коллектор должен быть настроен с приемником OTLP — см. [пример конфигурации в демонстрации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода заключается в том, что данные логов будут автоматически содержать идентификаторы трассировки (Trace ID), что позволяет пользователям впоследствии идентифицировать трассировки для конкретного лога и наоборот.

<Image img={observability_4} alt='Collecting logs via otlp' size='md' />

Этот подход требует от пользователей инструментирования своего кода с помощью [соответствующего языкового SDK](https://opentelemetry.io/docs/languages/).

- **Сбор через приемник Filelog** - Этот приемник отслеживает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Этот приемник обрабатывает сложные задачи, такие как обнаружение многострочных сообщений, обработка ротации логов, создание контрольных точек для устойчивости к перезапуску и извлечение структуры. Этот приемник также способен отслеживать логи контейнеров Docker и Kubernetes, развертываемый в виде helm chart, [извлекая из них структуру](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями pod.

<Image img={observability_5} alt='File log receiver' size='md' />

**В большинстве развертываний используется комбинация вышеуказанных приемников. Мы рекомендуем пользователям ознакомиться с [документацией коллектора](https://opentelemetry.io/docs/collector/) и изучить базовые концепции, а также [структуру конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методы установки](https://opentelemetry.io/docs/collector/installation/).**


:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::



## Структурированные и неструктурированные логи {#structured-vs-unstructured}

Логи могут быть структурированными или неструктурированными.

Структурированный лог использует формат данных, такой как JSON, определяя поля метаданных, например, HTTP-код и исходный IP-адрес.

```json
{
  "remote_addr": "54.36.149.41",
  "remote_user": "-",
  "run_time": "0",
  "time_local": "2019-01-22 00:26:14.000",
  "request_type": "GET",
  "request_path": "\/filter\/27|13 ,27|  5 ,p53",
  "request_protocol": "HTTP\/1.1",
  "status": "200",
  "size": "30577",
  "referer": "-",
  "user_agent": "Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

Неструктурированные логи, хотя обычно и имеют некоторую внутреннюю структуру, извлекаемую с помощью регулярных выражений, представляют лог исключительно в виде строки.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем использовать структурированное логирование и записывать логи в формате JSON (т. е. ndjson), где это возможно. Это упростит последующую обработку логов — либо перед отправкой в ClickHouse с помощью [процессоров Collector](https://opentelemetry.io/docs/collector/configuration/#processors), либо во время вставки с использованием материализованных представлений. Структурированные логи в конечном итоге сэкономят ресурсы на последующую обработку, снижая требуемую нагрузку на CPU в вашем решении на базе ClickHouse.

### Пример {#example}

В качестве примера мы предоставляем наборы данных структурированных (JSON) и неструктурированных логов, каждый из которых содержит примерно 10 миллионов строк, доступные по следующим ссылкам:

- [Неструктурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [Структурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

Мы используем структурированный набор данных для примера ниже. Убедитесь, что этот файл загружен и распакован, чтобы воспроизвести следующие примеры.

Ниже представлена простая конфигурация для OTel Collector, которая читает эти файлы с диска, используя приёмник filelog, и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), поскольку наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите использование ClickHouse для парсинга
Приведённый ниже пример извлекает временную метку из лога. Это требует использования оператора `json_parser`, который преобразует всю строку лога в JSON-строку, помещая результат в `LogAttributes`. Это может быть вычислительно затратным и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) — [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный пример для неструктурированных логов, использующий [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения этой цели, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для локальной установки коллектора. Важно внести изменения в инструкции, чтобы использовать [contrib-дистрибутив](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (который содержит приёмник `filelog`), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователям следует скачать `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить следующими командами:

```bash
./otelcol-contrib --config config-logs.yaml
```

При использовании структурированных логов сообщения на выходе будут иметь следующий формат:


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

Выше показано одно сообщение лога, сформированное OTel collector. Эти же сообщения мы будем загружать в ClickHouse в следующих разделах.

Полная схема сообщений логов, а также дополнительные столбцы, которые могут присутствовать при использовании других receivers, поддерживается [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевой момент в том, что сама строка лога хранится в виде строки в поле `Body`, но JSON был автоматически извлечён в поле `Attributes` благодаря `json_parser`. Тот же [operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Рекомендации по обработке логов с помощью OTel см. в разделе [Processing](#processing---filtering-transforming-and-enriching).

:::note Operators
Operators — это базовые единицы обработки логов. Каждый operator выполняет одну отдельную задачу, например чтение строк из файла или разбор JSON из поля. Затем operators объединяются в конвейер для достижения нужного результата.
:::

Приведённые выше сообщения не содержат полей `TraceID` или `SpanID`. Если они присутствуют, например в случаях, когда пользователи реализуют [distributed tracing](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON с помощью тех же приёмов, что показаны выше.

Пользователям, которым нужно собирать локальные или Kubernetes лог-файлы, мы рекомендуем ознакомиться с параметрами конфигурации, доступными для [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration), а также с тем, как обрабатываются [offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [multiline log parsing](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).


## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes рекомендуется использовать [руководство из документации OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). Для обогащения логов и метрик метаданными подов рекомендуется применять [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor). Это позволяет создавать динамические метаданные, например метки, которые сохраняются в столбце `ResourceAttributes`. В настоящее время ClickHouse использует для этого столбца тип `Map(String, String)`. Подробнее об обработке и оптимизации этого типа см. в разделах [Использование Map](/use-cases/observability/schema-design#using-maps) и [Извлечение данных из Map](/use-cases/observability/schema-design#extracting-from-maps).


## Сбор трассировок {#collecting-traces}

Пользователям, желающим инструментировать свой код и собирать трассировки, рекомендуется следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Для передачи событий в ClickHouse необходимо развернуть коллектор OTel, который будет принимать события трассировки по протоколу OTLP через соответствующий приёмник. Демонстрационное приложение OpenTelemetry содержит [примеры инструментирования для каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в коллектор. Ниже приведён пример конфигурации коллектора, выводящей события в stdout:

### Пример {#example-1}

Поскольку трассировки должны приниматься через OTLP, для генерации данных трассировки используется инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen). Инструкции по установке доступны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen).

Следующая конфигурация принимает события трассировки через приёмник OTLP и отправляет их в stdout.

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

Запустите конфигурацию командой:

```bash
./otelcol-contrib --config config-traces.yaml
```

Отправьте события трассировки в коллектор с помощью `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

В результате в stdout будут выведены сообщения трассировки, аналогичные приведённому ниже примеру:

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

Приведённый выше пример представляет собой одно сообщение трассировки, сгенерированное коллектором OTel. В последующих разделах мы загрузим эти сообщения в ClickHouse.

Полная схема сообщений трассировки доступна [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Настоятельно рекомендуется ознакомиться с этой схемой.


## Обработка — фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как показано в предыдущем примере установки временной метки для события журнала, пользователям неизбежно потребуется фильтровать, преобразовывать и обогащать сообщения о событиях. Это можно реализовать с помощью ряда возможностей OpenTelemetry:

- **Процессоры** — процессоры принимают данные, собранные [приёмниками, и изменяют или преобразуют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортёрам. Процессоры применяются в порядке, указанном в секции `processors` конфигурации коллектора. Они являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании коллектора OTel с ClickHouse мы рекомендуем ограничиться следующими процессорами:
  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций нехватки памяти на коллекторе. Рекомендации см. в разделе [Оценка ресурсов](#estimating-resources).
  - Любой процессор, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов для трассировок, метрик и журналов с метаданными k8s, например обогащать события идентификатором исходного пода.
  - [Выборка по хвосту или по началу](https://opentelemetry.io/docs/concepts/sampling/), если требуется для трассировок.
  - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание ненужных событий, если это невозможно сделать через оператор (см. ниже).
  - [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — необходимо при работе с ClickHouse для обеспечения отправки данных пакетами. См. раздел [«Экспорт в ClickHouse»](#exporting-to-clickhouse).

- **Операторы** — [операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют базовую единицу обработки, доступную на уровне приёмника. Поддерживается базовый парсинг, позволяющий устанавливать такие поля, как Severity и Timestamp. Здесь поддерживаются парсинг JSON и регулярных выражений, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий именно здесь.

Мы рекомендуем пользователям избегать избыточной обработки событий с помощью операторов или [процессоров преобразования](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут создавать значительную нагрузку на память и процессор, особенно при парсинге JSON. Всю обработку можно выполнять в ClickHouse во время вставки с помощью материализованных представлений и столбцов, за некоторыми исключениями — в частности, обогащение с учётом контекста, например добавление метаданных k8s. Подробнее см. раздел [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с помощью коллектора OTel, мы рекомендуем выполнять преобразования на экземплярах шлюза и минимизировать любую работу на экземплярах агентов. Это обеспечит минимальные требования к ресурсам для агентов на периферии, работающих на серверах. Обычно пользователи выполняют на агентах только фильтрацию (для минимизации ненужного использования сети), установку временных меток (через операторы) и обогащение, требующее контекста. Например, если экземпляры шлюза находятся в другом кластере Kubernetes, обогащение k8s должно происходить в агенте.

### Пример {#example-2}

Следующая конфигурация демонстрирует сбор неструктурированного файла журнала. Обратите внимание на использование операторов для извлечения структуры из строк журнала (`regex_parser`) и фильтрации событий, а также процессора для пакетирования событий и ограничения использования памяти.


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

Экспортеры отправляют данные в один или несколько бэкендов или целевых систем. Экспортеры могут работать по модели pull или push. Для отправки событий в ClickHouse используйте [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md), работающий по модели push.

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse входит в состав [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основного дистрибутива. Можно использовать contrib-дистрибутив или [собрать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Ниже приведен полный конфигурационный файл.

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
          layout: "%Y-%m-%d %H:%M:%S"
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


* **pipelines** - Конфигурация выше демонстрирует использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора receivers, processors и exporters, с отдельными конвейерами для логов и трейсов.
* **endpoint** - Взаимодействие с ClickHouse настраивается с помощью параметра `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` приводит к использованию TCP. Если пользователи предпочитают HTTP по причинам, связанным с переключением трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полное описание параметров подключения, включая возможность указать имя пользователя и пароль в этой строке, приведено [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что указанная выше строка подключения включает и сжатие (lz4), и асинхронные вставки. Мы рекомендуем всегда включать обе опции. Подробности об асинхронных вставках см. в разделе [Batching](#batching). Сжатие всегда следует указывать явно, так как в более старых версиях экспортера оно по умолчанию не включено.

* **ttl** - значение определяет, как долго будут храниться данные. Дополнительные сведения см. в разделе «Managing data». Это значение следует указывать как интервал времени в часах, например 72h. В примере ниже мы отключаем TTL, поскольку наши данные относятся к 2019 году и будут немедленно удалены ClickHouse при вставке.
* **traces&#95;table&#95;name** и **logs&#95;table&#95;name** - определяют имена таблиц для логов и трейсов.
* **create&#95;schema** - определяет, создаются ли таблицы с типовыми схемами при запуске. По умолчанию установлено значение true, чтобы упростить начальный запуск. В дальнейшем пользователям рекомендуется установить false и определить собственную схему.
* **database** - целевая база данных.
* **retry&#95;on&#95;failure** - настройки, определяющие, следует ли повторно отправлять неудавшиеся батчи.
* **batch** - batch-процессор гарантирует отправку событий пакетами. Мы рекомендуем значение порядка 5000 и таймаут 5s. Как только будет достигнуто одно из этих условий, формируется батч, который сбрасывается в экспортер. Уменьшение этих значений приведёт к меньшей задержке в конвейере и более ранней доступности данных для запросов, но за счёт большего числа подключений и пакетов, отправляемых в ClickHouse. Это не рекомендуется, если пользователи не используют [asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может привести к проблемам со [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют асинхронные вставки, доступность данных для запросов также будет зависеть от настроек асинхронных вставок, хотя данные всё равно будут сбрасываться из коннектора раньше. Дополнительные сведения см. в разделе [Batching](#batching).
* **sending&#95;queue** - определяет размер очереди отправки. Каждый элемент очереди содержит батч. Если эта очередь будет превышена, например из‑за недоступности ClickHouse при продолжающемся поступлении событий, батчи будут отбрасываться.

Если пользователи извлекли структурированный файл логов и запустили [локальный экземпляр ClickHouse](/install) (с аутентификацией по умолчанию), они могут выполнить эту конфигурацию командой:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки этому коллектору, выполните следующую команду с помощью инструмента `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска выполните простой запрос, чтобы убедиться, что события журнала записываются:

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical
```


Row 1:
──────
Timestamp: 2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags: 0
SeverityText:
SeverityNumber: 0
ServiceName:
Body: {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes: {}
LogAttributes: {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.

Аналогично, для событий трассировки пользователи могут проверить таблицу `otel_traces`:

SELECT \*
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp: 2024-06-20 11:36:41.181398000
TraceId: 00bba81fbd38a242ebb0c81a8ab85d8f
SpanId: beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName: lets-go
SpanKind: SPAN_KIND_CLIENT
ServiceName: telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName: telemetrygen
ScopeVersion:
SpanAttributes: {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration: 123000
StatusCode: STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp: []
Events.Name: []
Events.Attributes: []
Links.TraceId: []
Links.SpanId: []
Links.TraceState: []
Links.Attributes: []

```

```


## Готовая схема {#out-of-the-box-schema}

По умолчанию экспортер ClickHouse создает целевую таблицу для логов и трассировок. Это можно отключить с помощью настройки `create_schema`. Кроме того, имена таблиц для логов и трассировок можно изменить с их значений по умолчанию `otel_logs` и `otel_traces`, используя настройки, указанные выше.

:::note
В приведенных ниже схемах предполагается, что TTL установлен на 72 часа.
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

Столбцы здесь соответствуют официальной спецификации OTel для логов, задокументированной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных замечаний относительно этой схемы:


- По умолчанию таблица секционируется по дате с помощью `PARTITION BY toDate(Timestamp)`. Это позволяет эффективно удалять устаревшие данные.
- TTL задаётся через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, указанному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые парты, когда все строки внутри них истекли. Это эффективнее, чем удаление строк внутри партов, так как последнее требует дорогостоящей операции delete. Мы рекомендуем всегда устанавливать это значение. См. [Управление данными с помощью TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения дополнительных сведений.
- Таблица использует классический движок [`MergeTree`](/engines/table-engines/mergetree-family/mergetree). Это рекомендуется для логов и трейсов и, как правило, не требует изменений.
- Таблица упорядочена с помощью `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы под фильтры по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId`: более ранние столбцы в списке будут отфильтровываться быстрее, чем более поздние, например фильтрация по `ServiceName` будет значительно быстрее, чем по `TraceId`. Пользователи должны изменять это упорядочивание в соответствии с ожидаемыми паттернами доступа — см. [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- В приведённой выше схеме к столбцам применяется `ZSTD(1)`. Это обеспечивает наилучшее сжатие для логов. Пользователи могут увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшего сжатия, хотя это редко даёт заметную выгоду. Увеличение этого значения приведёт к большему расходу CPU во время вставки (на этапе сжатия), хотя декомпрессия (и, следовательно, выполнение запросов) должна остаться сопоставимой. Дополнительные подробности см. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Дополнительно к Timestamp применяется [дельта-кодирование](/sql-reference/statements/create/table#delta) с целью уменьшения его размера на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются отображениями (map). Пользователям следует ознакомиться с различиями между ними. Информацию о том, как обращаться к этим картам и оптимизировать доступ к их ключам, см. в разделе [Использование карт](/use-cases/observability/schema-design#using-maps).
- Большинство других типов здесь, например `ServiceName` с типом LowCardinality, оптимизированы. Обратите внимание, что `Body`, который в наших примерных логах содержит JSON, хранится как String.
- Ключам и значениям карт, а также столбцу `Body` применяются bloom-фильтры. Они призваны улучшить время выполнения запросов, обращающихся к этим столбцам, но, как правило, не являются необходимыми. См. [Вторичные индексы/индексы пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).



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

И снова это будет коррелировать со столбцами, соответствующими официальной спецификации OTel для трасс, описанной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Эта схема использует многие из тех же настроек, что и приведённая выше схема логов, с дополнительными столбцами Link, специфичными для спанов.

Мы рекомендуем отключить автоматическое создание схемы и создавать таблицы вручную. Это позволяет изменять первичные и вторичные ключи, а также даёт возможность добавлять дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительных сведений см. раздел [Проектирование схемы](/use-cases/observability/schema-design).


## Оптимизация вставок {#optimizing-inserts}

Для достижения высокой производительности вставок при сохранении строгих гарантий согласованности пользователям следует придерживаться простых правил при вставке данных наблюдаемости в ClickHouse через коллектор. При правильной конфигурации коллектора OTel следовать этим правилам будет несложно. Это также позволяет избежать [распространённых проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми сталкиваются пользователи при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, приводит к немедленному созданию части хранилища, содержащей данные из вставки вместе с другими метаданными, которые необходимо сохранить. Поэтому отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, сократит количество необходимых операций записи. Мы рекомендуем вставлять данные достаточно большими пакетами, содержащими не менее 1000 строк за раз. Подробнее [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными при идентичности. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически [дедуплицирует вставки](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы в таких случаях, как:

- (1) Если узел, получающий данные, испытывает проблемы, запрос вставки завершится по таймауту (или получит более конкретную ошибку) и не получит подтверждения.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых прерываний, отправитель получит либо таймаут, либо сетевую ошибку.

С точки зрения коллектора случаи (1) и (2) может быть сложно различить. Однако в обоих случаях неподтверждённую вставку можно просто немедленно повторить. Пока повторный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если (неподтверждённая) исходная вставка была успешной.

Мы рекомендуем пользователям использовать [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, для выполнения вышеуказанных требований. Это гарантирует, что вставки отправляются согласованными пакетами строк, удовлетворяющими указанным требованиям. Если ожидается, что коллектор будет иметь высокую пропускную способность (событий в секунду), и в каждой вставке можно отправлять не менее 5000 событий, обычно это единственное пакетирование, необходимое в конвейере. В этом случае коллектор будет сбрасывать пакеты до достижения `timeout` процессора пакетов, обеспечивая низкую сквозную задержку конвейера и согласованный размер пакетов.

### Использование асинхронных вставок {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять меньшие пакеты, когда пропускная способность коллектора низкая, но при этом они всё ещё ожидают, что данные достигнут ClickHouse с минимальной сквозной задержкой. В этом случае небольшие пакеты отправляются при истечении `timeout` процессора пакетов. Это может вызвать проблемы, и именно тогда требуются асинхронные вставки. Этот случай обычно возникает, когда **коллекторы в роли агента настроены на прямую отправку в ClickHouse**. Шлюзы, выступая в роли агрегаторов, могут смягчить эту проблему — см. [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если большие пакеты не могут быть гарантированы, пользователи могут делегировать пакетирование ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно соответственно.

<Image img={observability_6} alt='Асинхронные вставки' size='md' />

При [включённых асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос вставки, данные запроса ② сначала немедленно записываются в буфер в памяти. Когда ③ происходит следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные недоступны для поиска запросами до сброса в хранилище базы данных; сброс буфера [настраивается](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (значение по умолчанию) для получения гарантий доставки — подробнее см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).


Данные из асинхронной вставки попадают в таблицу после сброса буфера ClickHouse. Это происходит либо после превышения значения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если для `async_insert_stale_timeout_ms` задано ненулевое значение, данные вставляются по истечении `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Пользователи могут настраивать эти параметры, чтобы управлять сквозной задержкой своего конвейера. Дополнительные параметры, которые можно использовать для тонкой настройки сброса буфера, описаны [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию являются достаточно подходящими.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое число агентов, с низкой пропускной способностью, но жесткими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). Как правило, они неприменимы к сценариям Observability с высокой пропускной способностью, характерным для ClickHouse.
:::

Наконец, прежнее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Подробное описание настройки этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), а углублённый разбор — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).



## Архитектуры развертывания {#deployment-architectures}

При использовании коллектора OTel с ClickHouse возможны несколько архитектур развертывания. Ниже описана каждая из них и случаи их применения.

### Только агенты {#agents-only}

В архитектуре с использованием только агентов пользователи развертывают коллектор OTel в качестве агентов на периферии. Они получают трассировки от локальных приложений (например, в виде sidecar-контейнера) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют данные напрямую в ClickHouse.

<Image img={observability_7} alt='Только агенты' size='md' />

Эта архитектура подходит для развертываний малого и среднего масштаба. Её основное преимущество заключается в том, что она не требует дополнительного оборудования и сохраняет общий объем потребляемых ресурсов решения для наблюдаемости ClickHouse минимальным, обеспечивая простое соответствие между приложениями и коллекторами.

Пользователям следует рассмотреть переход на архитектуру на основе шлюзов, когда количество агентов превысит несколько сотен. Эта архитектура имеет несколько недостатков, которые затрудняют масштабирование:

- **Масштабирование соединений** — каждый агент устанавливает соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных соединений для вставки данных, в конечном итоге это станет ограничивающим фактором и снизит эффективность вставок — то есть ClickHouse будет расходовать больше ресурсов на поддержание соединений. Использование шлюзов минимизирует количество соединений и повышает эффективность вставок.
- **Обработка на периферии** — в этой архитектуре любые преобразования или обработка событий должны выполняться на периферии или в ClickHouse. Помимо ограничительного характера, это может означать либо сложные материализованные представления ClickHouse, либо перенос значительных вычислений на периферию — где могут пострадать критически важные сервисы и ресурсы ограничены.
- **Малые пакеты и задержки** — коллекторы-агенты могут индивидуально собирать очень мало событий. Обычно это означает, что их необходимо настроить на сброс данных через заданный интервал для соблюдения SLA доставки. Это может привести к тому, что коллектор будет отправлять небольшие пакеты в ClickHouse. Хотя это недостаток, его можно смягчить с помощью асинхронных вставок — см. [Оптимизация вставок](#optimizing-inserts).

### Масштабирование со шлюзами {#scaling-with-gateways}

Коллекторы OTel могут быть развернуты в качестве экземпляров шлюзов для устранения вышеуказанных ограничений. Они предоставляют автономный сервис, обычно на центр обработки данных или регион. Они получают события от приложений (или других коллекторов в роли агентов) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов с готовым балансировщиком нагрузки для распределения нагрузки между ними.

<Image img={observability_8} alt='Масштабирование со шлюзами' size='md' />

Цель этой архитектуры — разгрузить агенты от вычислительно интенсивной обработки, тем самым минимизируя потребление ими ресурсов. Эти шлюзы могут выполнять задачи преобразования, которые в противном случае должны были бы выполняться агентами. Кроме того, агрегируя события от многих агентов, шлюзы могут обеспечить отправку больших пакетов в ClickHouse, что позволяет выполнять эффективную вставку данных. Эти коллекторы-шлюзы можно легко масштабировать по мере добавления новых агентов и увеличения пропускной способности событий. Ниже показан пример конфигурации шлюза с соответствующей конфигурацией агента, обрабатывающего пример файла структурированного лога. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

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
          layout: "%Y-%m-%d %H:%M:%S"
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

Эти конфигурации можно запустить с помощью следующих команд.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

Основным недостатком этой архитектуры являются связанные с ней затраты и накладные расходы на управление набором коллекторов.

Пример управления более крупными архитектурами на основе шлюзов с практическими рекомендациями можно найти в этой [статье блога](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).

### Добавление Kafka {#adding-kafka}

Можно заметить, что описанные выше архитектуры не используют Kafka в качестве очереди сообщений.


Использование очереди Kafka в качестве буфера сообщений — это популярный паттерн проектирования в архитектурах логирования, получивший широкое распространение благодаря стеку ELK. Он предоставляет несколько преимуществ: в первую очередь, помогает обеспечить более надёжные гарантии доставки сообщений и справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластеризованный экземпляр Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку последовательная запись данных на диск требует меньше вычислительных ресурсов, чем разбор и обработка сообщения — например, в Elastic токенизация и индексирование создают значительную нагрузку. Перемещая данные от агентов, вы также снижаете риск потери сообщений в результате ротации логов в источнике. Наконец, Kafka предлагает возможности повторного воспроизведения сообщений и межрегиональной репликации, что может быть привлекательно для некоторых сценариев использования.

Однако ClickHouse способен обрабатывать вставку данных очень быстро — миллионы строк в секунду на оборудовании средней мощности. Обратное давление со стороны ClickHouse возникает **редко**. Часто использование очереди Kafka означает дополнительную архитектурную сложность и затраты. Если вы можете принять принцип, что логи не требуют таких же гарантий доставки, как банковские транзакции и другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Однако если вам требуются высокие гарантии доставки или возможность повторного воспроизведения данных (потенциально в несколько приёмников), Kafka может стать полезным архитектурным дополнением.

<Image img={observability_9} alt='Добавление Kafka' size='md' />

В этом случае агенты OTel можно настроить на отправку данных в Kafka через [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюзов, в свою очередь, потребляют сообщения с помощью [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Для получения дополнительной информации рекомендуем обратиться к документации Confluent и OTel.

### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для коллектора OTel зависят от пропускной способности событий, размера сообщений и объёма выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза с 3 ядрами и 12 ГБ оперативной памяти может обрабатывать около 60 тысяч событий в секунду. Это предполагает минимальный конвейер обработки, отвечающий за переименование полей, без использования регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий на шлюз и только устанавливающих временную метку события, мы рекомендуем пользователям определять размер на основе ожидаемого количества логов в секунду. Ниже приведены приблизительные значения, которые пользователи могут использовать в качестве отправной точки:

| Частота логирования | Ресурсы для агента коллектора |
| ------------------- | ----------------------------- |
| 1 тыс./сек          | 0,2 CPU, 0,2 ГиБ              |
| 5 тыс./сек          | 0,5 CPU, 0,5 ГиБ              |
| 10 тыс./сек         | 1 CPU, 1 ГиБ                  |
