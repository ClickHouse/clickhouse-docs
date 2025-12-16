---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для обеспечения наблюдаемости'
slug: /observability/integrating-opentelemetry
keywords: ['Наблюдаемость', 'OpenTelemetry']
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

Любому решению в области наблюдаемости необходим механизм сбора и экспорта логов и трассировок. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

«OpenTelemetry — это фреймворк и набор инструментов для наблюдаемости, предназначенный для создания и управления телеметрическими данными, такими как трассировки, метрики и логи».

В отличие от ClickHouse или Prometheus, OpenTelemetry не является серверным хранилищем (backend) для наблюдаемости, а сосредоточен на генерации, сборе, управлении и экспорте телеметрических данных. Хотя изначальной целью OpenTelemetry было упростить вам инструментирование ваших приложений или систем с помощью специализированных для конкретных языков SDKS, его функциональность была расширена и теперь включает сбор логов через OpenTelemetry Collector — агент или прокси, который принимает, обрабатывает и экспортирует телеметрические данные.

## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из ряда компонентов. Помимо предоставления спецификации данных и API, стандартизированного протокола и соглашений об именовании полей/столбцов, OTel предоставляет две возможности, которые являются фундаментальными для построения решения по наблюдаемости на базе ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси-сервер, который принимает, обрабатывает и экспортирует телеметрию. Решение на базе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед формированием пакетов и вставкой данных.
- [Language SDKs](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDKS фактически обеспечивают корректную запись трассировок в коде приложения, генерируя составляющие спаны и гарантируя распространение контекста между сервисами через метаданные — тем самым формируя распределённые трассировки и обеспечивая возможность коррелировать спаны. Эти SDKS дополняются экосистемой, которая автоматически интегрирует распространённые библиотеки и фреймворки, благодаря чему пользователю не требуется изменять свой код и он получает инструментализацию «из коробки».

Решение по наблюдаемости на базе ClickHouse использует оба этих инструмента.

## Дистрибутивы {#distributions}

Коллектор OpenTelemetry имеет [ряд дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Ресивер `filelog` вместе с ClickHouse-экспортером, необходимыми для решения на базе ClickHouse, присутствуют только в [дистрибутиве OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет вам экспериментировать с различными конфигурациями. Однако при работе в продакшене рекомендуется ограничить коллектор только компонентами, необходимыми для конкретного окружения. Некоторые причины для этого:

- Уменьшить размер коллектора, сократив время его развертывания
- Повысить безопасность коллектора за счет сокращения доступной поверхности атаки

Собрать [кастомный коллектор](https://opentelemetry.io/docs/collector/custom-collector/) можно с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).

## Приём данных с использованием OTel {#ingesting-data-with-otel}

### Роли развертывания коллектора {#collector-deployment-roles}

Для сбора логов и их записи в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector может быть развернут в двух основных ролях:

- **Agent** – экземпляры агента собирают данные на периферии (edge), например, на серверах или на узлах Kubernetes, либо получают события напрямую от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента запускается вместе с приложением или на том же хосте, что и приложение (например, в виде сайдкара или ДемонСета). Агенты могут либо отправлять свои данные напрямую в ClickHouse, либо на экземпляр шлюза. В первом случае это называется [паттерном развертывания Agent](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Gateway** – экземпляры шлюза предоставляют автономный сервис (например, «Deployment» в Kubernetes), как правило, на кластер, дата-центр или регион. Они получают события от приложений (или других коллекторов, работающих как агенты) через единый OTLP-эндпоинт. Как правило, разворачивается набор экземпляров шлюза, при этом для распределения нагрузки между ними используется готовый балансировщик нагрузки. Если все агенты и приложения отправляют свои сигналы на этот единый эндпоинт, это часто называют [паттерном развертывания Gateway](https://opentelemetry.io/docs/collector/deployment/gateway/).

Далее мы предполагаем использование простого коллектора в роли агента, который отправляет свои события напрямую в ClickHouse. См. раздел [Масштабирование с помощью шлюзов](#scaling-with-gateways) для получения дополнительных сведений об использовании шлюзов и случаях, когда они применимы.

### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора заключается в том, что он позволяет вашим сервисам быстро передавать данные, перекладывая на него дополнительную обработку, такую как повторные попытки, пакетирование, шифрование или даже фильтрацию конфиденциальных данных.

Коллектор использует термины [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) для трех основных этапов обработки. Ресиверы используются для сбора данных и могут работать как по pull-, так и по push-модели. Процессоры позволяют выполнять преобразование и обогащение сообщений. Экспортеры отвечают за отправку данных в нижележащий сервис. Хотя теоретически этим сервисом может быть другой коллектор, в последующем базовом рассмотрении мы предполагаем, что все данные отправляются напрямую в ClickHouse.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором ресиверов, процессоров и экспортеров.

Коллектор предоставляет два основных ресивера для сбора логов:

**Через OTLP** — в этом случае логи отправляются (push) напрямую в коллектор из OpenTelemetry SDKS по протоколу OTLP. [OpenTelemetry demo](https://opentelemetry.io/docs/demo/) использует этот подход, при котором OTLP-экспортеры для каждого языка ожидают локальную конечную точку коллектора. В этом случае коллектор должен быть настроен с OTLP-ресивером — см. [пример конфигурации в демо](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода в том, что данные логов автоматически будут содержать идентификаторы трассировок (Trace Ids), что позволит пользователям впоследствии находить трейсы для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через OTLP" size="md"/>

Этот подход требует от пользователей инструментировать свой код с помощью [SDK для соответствующего языка](https://opentelemetry.io/docs/languages/).

- **Сбор логов через ресивер Filelog** — этот ресивер непрерывно читает файлы на диске (tail) и формирует сообщения логов, отправляя их в ClickHouse. Он обрабатывает сложные задачи, такие как обнаружение многострочных сообщений, обработка ротации логов, ведение контрольных точек для устойчивости к перезапускам и извлечение структуры. Дополнительно этот ресивер может считывать логи контейнеров Docker и Kubernetes, будучи развернутым как Helm-чарт, [извлекая структуру из этих логов](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их сведениями о поде.

<Image img={observability_5} alt="Ресивер Filelog" size="md"/>

**В большинстве развертываний используется комбинация приведенных выше ресиверов. Мы рекомендуем пользователям ознакомиться с [документацией по коллектору](https://opentelemetry.io/docs/collector/) и базовыми концепциями, а также со [структурой конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методами установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::

## Структурированные и неструктурированные {#structured-vs-unstructured}

Логи могут быть как структурированными, так и неструктурированными.

Структурированный лог использует формат данных, например JSON, и определяет поля метаданных, такие как HTTP-код и исходный IP-адрес.

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

Неструктурированные логи, хотя обычно и обладают некоторой внутренней структурой, которую можно извлечь с помощью шаблона регулярного выражения, представляют сам лог исключительно в виде строки.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем использовать структурированное логирование и по возможности записывать логи в формате JSON (например, ndjson). Это упростит необходимую последующую обработку логов — либо до отправки в ClickHouse с помощью [Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors), либо на этапе вставки с использованием материализованных представлений. Структурированные логи в конечном итоге сократят объем последующей обработки и снизят требуемое потребление CPU в вашем решении на базе ClickHouse.

### Пример {#example}

В качестве примера мы предоставляем наборы данных с логами в структурированном (JSON) и неструктурированном виде, каждый примерно по 10 млн строк, доступные по следующим ссылкам:

* [Неструктурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Структурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

В примере ниже используется набор данных со структурированными логами. Убедитесь, что этот файл скачан и распакован, чтобы воспроизвести следующие примеры.

Ниже приведена простая конфигурация для OTel collector, который читает эти файлы с диска, используя ресивер `filelog`, и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), так как наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите использование ClickHouse для парсинга
Приведённый ниже пример извлекает временную метку из лога. Для этого требуется использовать оператор `json_parser`, который конвертирует всю строку лога в JSON, помещая результат в `LogAttributes`. Это может быть вычислительно затратным и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) — см. [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный пример для неструктурированных логов, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения того же эффекта, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут воспользоваться [официальными инструкциями](https://opentelemetry.io/docs/collector/installation/) для локальной установки коллектора. Важно при этом скорректировать инструкции так, чтобы использовать [contrib-дистрибутив](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (в который входит `filelog` receiver), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователям следует скачать `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить следующими командами:

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

Вышеприведённый пример представляет собой одно сообщение лога, сформированное OTel collector. В последующих разделах мы будем осуществлять приём этих же сообщений в ClickHouse.

Полная схема сообщений логов, вместе с дополнительными столбцами, которые могут присутствовать при использовании других receivers, представлена [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевой момент здесь в том, что сама строка лога хранится как строка в поле `Body`, а JSON был автоматически разобран и вынесен в поле `Attributes` благодаря `json_parser`. Тот же [operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Рекомендации по обработке логов с помощью OTel см. в разделе [Processing](#processing---filtering-transforming-and-enriching).

:::note Operators
Операторы — это базовая единица обработки логов. Каждый оператор выполняет одну задачу, например, чтение строк из файла или разбор JSON из поля. Далее операторы объединяются в цепочку (pipeline), чтобы получить требуемый результат.
:::

В приведённых выше сообщениях нет полей `TraceID` или `SpanID`. Если они присутствуют, например, в случаях, когда пользователи реализуют [распределённое трассирование](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON, используя те же приёмы, которые показаны выше.

Пользователям, которым необходимо собирать локальные файлы логов или логи Kubernetes, мы рекомендуем ознакомиться с параметрами конфигурации, доступными для [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration), а также с тем, как реализованы [отслеживание смещений (offsets)](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [обработка многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).

## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем [руководство по Kubernetes в документации OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). Для обогащения логов и метрик метаданными подов рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor). Это может приводить к появлению динамических метаданных, например меток, которые хранятся в столбце `ResourceAttributes`. В настоящее время ClickHouse использует тип `Map(String, String)` для этого столбца. Дополнительные сведения по обработке и оптимизации этого типа см. в разделах [Использование Map](/use-cases/observability/schema-design#using-maps) и [Извлечение из Map](/use-cases/observability/schema-design#extracting-from-maps).

## Сбор трассировок {#collecting-traces}

Пользователям, которые хотят инструментировать свой код и собирать трассировки, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставлять события в ClickHouse, вам необходимо развернуть OTel collector для приёма событий трассировки по протоколу OTLP через соответствующий receiver. В демо OpenTelemetry приведен [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в collector. Ниже приведен пример конфигурации collector, который выводит события в stdout:

### Пример {#example-1}

Поскольку трассировки должны поступать через OTLP, мы используем инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трассировок. Следуйте инструкциям по установке, приведённым [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen).

Следующая конфигурация принимает события трассировок с помощью OTLP‑приёмника и затем отправляет их в stdout.

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

В результате в stdout будут выводиться сообщения трассировки, похожие на приведённый ниже пример:

```response
Спан #86
        ID трассировки  : 1bb5cdd2c9df5f0da320ca22045c60d9
        ID родителя     : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Имя             : okey-dokey-0
        Тип             : Сервер
        Время начала    : 2024-06-19 18:03:41.603868 +0000 UTC
        Время окончания : 2024-06-19 18:03:41.603991 +0000 UTC
        Код статуса     : Не установлен
        Сообщение статуса :
Атрибуты:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

Приведённый выше пример представляет собой одно сообщение трассировки, сгенерированное OTel collector. Приём этих же сообщений в ClickHouse мы рассматриваем в следующих разделах.

Полная схема сообщений трассировки представлена [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Настоятельно рекомендуем ознакомиться с этой схемой.

## Обработка — фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как было показано в предыдущем примере с установкой временной метки для события лога, вам, как правило, потребуется фильтровать, преобразовывать и обогащать сообщения о событиях. Это можно сделать с помощью ряда возможностей в OpenTelemetry:

- **Процессоры (Processors)** — процессоры принимают данные, собранные [получателями, и изменяют или преобразуют](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортёрам. Процессоры применяются в том порядке, который указан в секции `processors` конфигурации коллектора. Они являются необязательными, но [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors) минимальный набор. При использовании OTel collector с ClickHouse мы рекомендуем ограничиться следующими процессорами:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с исчерпанием памяти на коллекторе. Рекомендации см. в разделе [Estimating Resources](#estimating-resources).
  - Любой процессор, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически задавать ресурсные атрибуты спанов, метрик и логов k8s-метаданными, т.е. обогащать события идентификатором исходного пода.
  - [Выборка по хвосту или голове (tail/head sampling)](https://opentelemetry.io/docs/concepts/sampling/), если это требуется для трейсов.
  - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание ненужных событий, если это нельзя сделать через операторы (см. ниже).
  - [Пакетирование (batching)](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — критично при работе с ClickHouse, чтобы данные отправлялись пакетами. См. ["Exporting to ClickHouse"](#exporting-to-clickhouse).

- **Операторы (Operators)** — [operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют наиболее базовую единицу обработки на уровне получателя. Поддерживается базовый парсинг, позволяющий устанавливать такие поля, как Severity и Timestamp. Здесь поддерживаются JSON- и regex-парсинг, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий на этом уровне.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с использованием операторов или [процессоров transform](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут приводить к значительным накладным расходам по памяти и CPU, особенно при JSON-парсинге. Весь процессинг можно выполнять в ClickHouse на этапе вставки с помощью материализованных представлений и столбцов, с некоторыми исключениями — а именно, для обогащения, зависящего от контекста, например добавления k8s-метаданных. Более подробную информацию см. в разделе [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять преобразования на экземплярах шлюза (gateway) и минимизировать любую работу на экземплярах-агентах. Это обеспечит минимальные требования к ресурсам агентов на периферии, работающих на серверах. Обычно мы наблюдаем, что пользователи выполняют только фильтрацию (для минимизации лишнего сетевого трафика), установку временных меток (через operators) и обогащение, которое требует контекста, на агентах. Например, если экземпляры шлюза размещены в другом кластере Kubernetes, обогащение k8s потребуется выполнять на агенте.

### Пример {#example-2}

Следующая конфигурация показывает сбор неструктурированного журнала из файла. Обратите внимание на использование операторов для извлечения структуры из строк журнала (`regex_parser`) и фильтрации событий, а также процессора для объединения событий в пакеты и ограничения использования памяти.

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

Экспортеры отправляют данные в один или несколько бэкендов или целевых назначений. Экспортеры могут работать по pull- или push-модели. Чтобы отправлять события в ClickHouse, вам потребуется использовать push-экспортер [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основного дистрибутива. Вы можете либо использовать contrib-дистрибутив, либо [собрать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
:::

Полный файл конфигурации приведён ниже.

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

Обратите внимание на следующие важные настройки:


* **pipelines** - Конфигурация выше демонстрирует использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора receivers, processors и exporters, с отдельным конвейером для логов (logs) и трассировок (traces).
* **endpoint** - Взаимодействие с ClickHouse настраивается с помощью параметра `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` обеспечивает обмен по протоколу TCP. Если вы предпочитаете HTTP по причинам, связанным с маршрутизацией трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные детали подключения, включая возможность указать имя пользователя и пароль в этой строке подключения, описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что приведённая выше строка подключения включает как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба параметра. Подробности по асинхронным вставкам см. в разделе [Batching](#batching). Сжатие всегда должно быть явно указано, так как по умолчанию оно не будет включено в старых версиях экспортера.

* **ttl** - значение определяет, как долго данные хранятся. Дополнительные сведения см. в разделе «Managing data». Значение должно задаваться как единица времени в часах, например 72h. В примере ниже мы отключаем TTL, так как наши данные относятся к 2019 году и будут немедленно удалены ClickHouse при вставке.
* **traces&#95;table&#95;name** и **logs&#95;table&#95;name** - определяют имена таблиц для логов и трассировок.
* **create&#95;schema** - определяет, будут ли таблицы созданы с использованием схем по умолчанию при старте. По умолчанию установлено значение true для начального запуска. Вам следует установить false и определить собственную схему.
* **database** - целевая база данных.
* **retry&#95;on&#95;failure** - параметры, определяющие, нужно ли повторно отправлять неуспешные batch.
* **batch** - batch-процессор гарантирует, что события отправляются пакетами. Мы рекомендуем значение около 5000 с таймаутом 5s. То, что наступит раньше, инициирует формирование batch для отправки в exporter. Уменьшение этих значений приведёт к конвейеру с более низкой задержкой и более ранней доступностью данных для запросов, но за счёт увеличения числа соединений и batch, отправляемых в ClickHouse. Это не рекомендуется, если вы не используете [asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может вызвать проблемы со [слишком большим числом частей (too many parts)](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если вы используете asynchronous inserts, доступность данных для запросов также будет зависеть от настроек асинхронных вставок, хотя данные всё равно будут отправляться экспортером раньше. Дополнительные сведения см. в разделе [Batching](#batching).
* **sending&#95;queue** - контролирует размер очереди отправки. Каждый элемент в очереди содержит один batch. Если очередь переполнится, например из-за недоступности ClickHouse при продолжающемся поступлении событий, batch будут отбрасываться.

Предполагая, что пользователи извлекли структурированный файл логов и запустили [локальный экземпляр ClickHouse](/install) (с аутентификацией по умолчанию), вы можете выполнить эту конфигурацию командой:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки в этот коллектор, выполните следующую команду с помощью утилиты `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска убедитесь, что в журнале появились записи логов, выполнив простой запрос:


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


## Базовая схема {#out-of-the-box-schema}

По умолчанию экспортер ClickHouse создаёт целевую таблицу для журналов, которая используется как для логов, так и для трейсов. Это можно отключить с помощью параметра `create_schema`. Кроме того, имена таблиц для логов и трейсов, по умолчанию `otel_logs` и `otel_traces`, можно изменить через указанные выше настройки.

:::note
В приведённых ниже схемах мы предполагаем, что TTL включён и равен 72 часам.
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

Столбцы здесь соответствуют официальной спецификации OTel по логам, описанной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных замечаний по этой схеме:

- По умолчанию таблица разбивается на партиции по дате с помощью `PARTITION BY toDate(Timestamp)`. Это делает удаление устаревших данных эффективным.
- `TTL` задаётся через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, заданному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые части, когда все строки в них устарели. Это эффективнее, чем удаление строк внутри частей, которое приводит к дорогостоящей операции удаления. Мы рекомендуем всегда устанавливать этот параметр. См. раздел [Управление данными с помощью TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения дополнительной информации.
- Таблица использует классический движок [`MergeTree`](/engines/table-engines/mergetree-family/mergetree). Он рекомендован для логов и трейсов и, как правило, не требует изменения.
- Таблица упорядочена с помощью `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` — более ранние столбцы в списке будут отфильтровываться быстрее, чем более поздние, например фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Вам следует изменять этот порядок в соответствии с ожидаемыми паттернами доступа — см. [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- В приведённой выше схеме к столбцам применяется `ZSTD(1)`. Это обеспечивает наилучшее сжатие для логов. Вы можете повысить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшей компрессии, хотя это редко даёт существенную выгоду. Увеличение этого значения приведёт к большему использованию ресурсов CPU во время вставки (во время сжатия), хотя распаковка (и, следовательно, выполнение запросов) должна оставаться сопоставимой. См. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) дополнительные детали. Дополнительное [дельта-кодирование](/sql-reference/statements/create/table#delta) применяется к полю `Timestamp` с целью уменьшить его размер на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются ассоциативными массивами (map). Важно понимать различия между ними. Информацию о том, как обращаться к этим структурам и оптимизировать доступ к ключам внутри них, см. в разделе ["Использование карт"](/use-cases/observability/schema-design#using-maps).
- Большинство других типов здесь, например `ServiceName` как LowCardinality, уже оптимизированы. Обратите внимание, что `Body`, который является JSON в наших примерных логах, хранится как String.
- Ключам и значениям карт, а также столбцу `Body` применяются фильтры Блума. Они нацелены на улучшение времени выполнения запросов, обращающихся к этим столбцам, но обычно не являются обязательными. См. [Вторичные индексы/индексы пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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

Как и ранее, это будет коррелировать со столбцами, соответствующими официальной спецификации OTel для трейсов, описанной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Здесь схема использует многие из тех же настроек, что и приведённая выше схема логов, с дополнительными столбцами `Link`, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схемы и создавать таблицы вручную. Это позволяет изменять первичные и вторичные ключи, а также даёт возможность добавлять дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительной информации см. раздел [Schema design](/use-cases/observability/schema-design).

## Оптимизация вставок {#optimizing-inserts}

Чтобы обеспечить высокую производительность вставки при сохранении строгих гарантий согласованности, вам следует придерживаться простых правил при вставке данных Observability в ClickHouse через коллектор. При корректной конфигурации OTel collector соблюдение следующих правил не должно вызывать затруднений. Это также позволяет избежать [типичных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждый запрос `INSERT`, отправленный в ClickHouse, приводит к тому, что ClickHouse немедленно создает часть хранилища, содержащую данные из этого `INSERT` вместе с другими метаданными, которые необходимо сохранить. Поэтому выгоднее отправлять меньшее количество `INSERT`-запросов, каждый из которых содержит больше данных, чем большее количество `INSERT`-запросов с меньшим объемом данных: так сокращается число необходимых операций записи. Мы рекомендуем вставлять данные достаточно крупными пакетами — как минимум по 1 000 строк за один раз. Дополнительные подробности — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию `INSERT`-запросы в ClickHouse выполняются синхронно и являются идемпотентными, если они идентичны. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически [удаляет дубликаты при вставке](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что `INSERT`-запросы устойчивы к ошибкам в следующих случаях:

- (1) Если у узла, принимающего данные, возникают проблемы, запрос `INSERT` завершится по тайм-ауту (или с более специфической ошибкой) и не получит подтверждения.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых перебоев, отправитель получит тайм-аут или сетевую ошибку.

С точки зрения коллектора различить (1) и (2) может быть сложно. Однако в обоих случаях неподтвержденный `INSERT` можно сразу же повторить. Пока повторный запрос `INSERT` содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторный `INSERT`, если исходный (неподтвержденный) `INSERT` был успешно выполнен.

Мы рекомендуем использовать [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, чтобы удовлетворить указанным выше требованиям. Это гарантирует, что `INSERT`-запросы отправляются как устойчивые по составу батчи строк, удовлетворяющие этим условиям. Если от коллектора ожидается высокая пропускная способность (событий в секунду) и в каждом `INSERT` можно отправлять по крайней мере 5000 событий, этого обычно достаточно как единственного пакетирования в конвейере. В этом случае коллектор будет сбрасывать батчи до того, как будет достигнут `timeout` у `batch processor`, обеспечивая низкую сквозную задержку конвейера и стабильный размер батчей.

### Используйте асинхронные вставки {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять более мелкие пакеты, когда пропускная способность коллектора низкая, при этом они по-прежнему ожидают, что данные попадут в ClickHouse с минимальной сквозной задержкой. В таком случае небольшие пакеты отправляются, когда истекает `timeout` процессора пакетирования. Это может вызвать проблемы и является ситуацией, когда требуются асинхронные вставки. Такая ситуация обычно возникает, когда **коллекторы в роли агента настроены на отправку данных напрямую в ClickHouse**. Использование шлюзов как агрегаторов может уменьшить эту проблему — см. раздел [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если невозможно гарантировать крупные пакеты, вы можете делегировать пакетирование ClickHouse, используя [асинхронные вставки](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются во временный буфер, а затем записываются в хранилище базы данных позже, то есть асинхронно.

<Image img={observability_6} alt="Асинхронные вставки" size="md"/>

При [включенных асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос на вставку, данные запроса ② сразу записываются сначала в буфер в оперативной памяти. Когда ③ выполняется следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные недоступны для запросов до их сброса в хранилище базы данных; параметры сброса буфера [настраиваются](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем использовать `wait_for_async_insert=1` (значение по умолчанию), чтобы получить гарантии доставки — дополнительные сведения см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

Данные из асинхронной вставки записываются после сброса буфера ClickHouse. Это происходит либо после превышения значения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если параметр `async_insert_stale_timeout_ms` установлен в ненулевое значение, данные вставляются по истечении `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Вы можете настраивать эти параметры для управления сквозной задержкой своего конвейера обработки данных. Дополнительные настройки, которые можно использовать для тонкой настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию являются подходящими.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но жесткими требованиями к сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). Как правило, они неприменимы к сценариям обсервабилити с высокой пропускной способностью, характерным для ClickHouse.
:::

Наконец, предыдущее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полная информация по настройке этой функции приведена [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), детальный разбор — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Архитектуры развертывания {#deployment-architectures}

При использовании OTel collector с ClickHouse возможны несколько архитектур развертывания. Ниже мы описываем каждую из них и указываем, когда она наиболее уместна.

### Только агенты {#agents-only}

В архитектуре только с агентами пользователи разворачивают OTel collector в качестве агентов на границе инфраструктуры. Они получают трейсы от локальных приложений (например, как sidecar-контейнер) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные напрямую в ClickHouse.

<Image img={observability_7} alt="Agents only" size="md"/>

Такая архитектура подходит для развертываний малого и среднего размера. Ее основное преимущество в том, что она не требует дополнительного оборудования и позволяет сохранить совокупное ресурсное потребление решения наблюдаемости на ClickHouse минимальным, обеспечивая простое соответствие между приложениями и коллекторами.

Вам следует рассмотреть переход на архитектуру с Gateway, когда число агентов превышает несколько сотен. У этой архитектуры есть несколько недостатков, которые затрудняют масштабирование:

- **Масштабирование подключений** — Каждый агент устанавливает подключение к ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных подключений для вставки, в конечном итоге это становится ограничивающим фактором и делает вставки менее эффективными — то есть больше ресурсов ClickHouse будет тратить на поддержание подключений. Использование шлюзов (Gateway) минимизирует число подключений и делает вставки более эффективными.
- **Обработка на периферии** — Любые преобразования или обработка событий в этой архитектуре должны выполняться либо на периферии, либо в ClickHouse. Помимо ограничений, это может означать либо сложные материализованные представления в ClickHouse, либо перенос значительных вычислений на периферию — где могут пострадать критически важные сервисы и ресурсы ограничены.
- **Малые партии и задержки** — Коллекторы-агенты могут по отдельности собирать очень мало событий. Обычно это означает, что их нужно настраивать на сброс данных через заданный интервал для соблюдения SLA по доставке. В результате коллектор может отправлять в ClickHouse небольшие партии. Несмотря на то что это недостаток, его можно смягчить с помощью асинхронных вставок — см. [Оптимизация вставок](#optimizing-inserts).

### Масштабирование с использованием шлюзов {#scaling-with-gateways}

Коллекторы OTel могут быть развернуты в виде экземпляров шлюзов (Gateway), чтобы устранить вышеуказанные ограничения. Они представляют собой автономный сервис, как правило, по одному на каждый дата-центр или регион. Они принимают события от приложений (или других коллекторов в роли агентов) через единый endpoint OTLP. Обычно разворачивается набор экземпляров шлюзов, при этом для распределения нагрузки между ними используется готовый балансировщик нагрузки.

<Image img={observability_8} alt="Scaling with gateways" size="md" />

Цель этой архитектуры — разгрузить агентов от вычислительно затратной обработки, тем самым минимизируя потребление ресурсов агентами. Эти шлюзы могут выполнять задачи трансформации, которые иначе пришлось бы выполнять агентам. Кроме того, агрегируя события от множества агентов, шлюзы могут обеспечивать отправку в ClickHouse крупных пакетов данных, что позволяет эффективно вставлять данные. Эти шлюзовые коллекторы можно легко масштабировать по мере добавления новых агентов и роста пропускной способности событий. Пример конфигурации шлюза с соответствующей конфигурацией агента, считывающего пример структурированного файла журнала, приведен ниже. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

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
      insecure: true # Установите false при использовании защищённого соединения
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено, так как на одном хосте запущено 2 коллектора
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

Эти конфигурации можно использовать, выполнив следующие команды.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

Основной недостаток этой архитектуры — связанные с ней затраты и накладные расходы на управление набором коллекторов.

В качестве примера управления более крупными архитектурами на основе шлюзов и связанных с этим уроков мы рекомендуем этот [блог‑пост](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).

### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что приведённые выше архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka как буфера сообщений — популярный шаблон проектирования, применяемый в архитектурах логирования и ставший широко известным благодаря стеку ELK. Он даёт ряд преимуществ; в первую очередь, помогает обеспечивать более строгие гарантии доставки сообщений и упрощает работу с обратным давлением (backpressure). Сообщения отправляются от агентов сбора в Kafka и записываются на диск. В теории кластер Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку последовательная запись данных на диск требует меньших вычислительных затрат, чем разбор и обработка сообщения — в Elastic, например, токенизация и индексация вносят значительные накладные расходы. Перенося данные с агентов, вы также снижаете риск потери сообщений из‑за ротации логов на источнике. Наконец, Kafka предоставляет возможности повторного воспроизведения сообщений и кросс-региональной репликации, что может быть привлекательно для некоторых сценариев использования.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на оборудовании средней мощности. Обратное давление со стороны ClickHouse встречается **редко**. Часто использование очереди Kafka приводит к увеличению архитектурной сложности и затрат. Если вы можете принять принцип, что логи не нуждаются в тех же гарантиях доставки, что банковские транзакции и другие бизнес-критичные данные, мы рекомендуем избегать усложнения архитектуры за счёт Kafka.

Тем не менее, если вам требуются высокие гарантии доставки или возможность повторного воспроизведения данных (потенциально в несколько приёмников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Добавление Kafka" size="md"/>

В этом случае агенты OTel можно настроить на отправку данных в Kafka с помощью [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). В свою очередь, инстансы Gateway потребляют сообщения с использованием [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). За дополнительными подробностями мы рекомендуем обратиться к документации Confluent и OTel.

### Оценка требований к ресурсам {#estimating-resources}

Требования к ресурсам для OTel collector зависят от пропускной способности по событиям, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry предоставляет [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которыми пользователи могут воспользоваться для оценки потребностей в ресурсах.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview) экземпляр шлюза с 3 ядрами и 12 ГБ ОЗУ может обрабатывать около 60 тыс. событий в секунду. Это предполагает минимальный конвейер обработки, отвечающий за переименование полей, и отсутствие регулярных выражений.

Для экземпляров агента, отвечающих за отправку событий на шлюз и только установку временной метки на событии, мы рекомендуем подбирать ресурсы, исходя из ожидаемого количества логов в секунду. Ниже приведены приблизительные значения, которые можно использовать как отправную точку:

| Скорость поступления логов | Ресурсы для collector-агента |
|----------------------------|------------------------------|
| 1k/секунда                 | 0,2 CPU, 0,2 GiB             |
| 5k/секунда                 | 0,5 CPU, 0,5 GiB             |
| 10k/секунда                | 1 CPU, 1 GiB                 |