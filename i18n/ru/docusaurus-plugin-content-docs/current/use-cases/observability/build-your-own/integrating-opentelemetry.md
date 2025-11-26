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


# Интеграция OpenTelemetry для сбора данных

Любому решению для Observability требуется механизм сбора и экспорта логов и трейсов. Для этих целей ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

«OpenTelemetry — это фреймворк и набор инструментов для Observability, предназначенный для создания и управления телеметрическими данными, такими как трейсы, метрики и логи».

В отличие от ClickHouse или Prometheus, OpenTelemetry не является backend-решением для Observability, а фокусируется на генерации, сборе, управлении и экспорте телеметрических данных. Хотя изначальной целью OpenTelemetry было дать пользователям возможность легко инструментировать свои приложения или системы с использованием языковых SDKs, он был расширен и теперь включает сбор логов через OpenTelemetry collector — агент или прокси, который получает, обрабатывает и экспортирует телеметрические данные.



## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из ряда компонентов. Помимо спецификации данных и API, стандартизированного протокола и соглашений по именованию полей/колонок, OTel предоставляет две ключевые возможности, которые являются фундаментальными для построения решения для наблюдаемости с ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси, который получает, обрабатывает и экспортирует телеметрию. Решение на базе ClickHouse использует этот компонент и для сбора логов, и для обработки событий перед их пакетированием и вставкой.
- [Language SDKs](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDKs обеспечивают корректную запись трейсов в коде приложения, генерируя составляющие их спаны и гарантируя распространение контекста между сервисами через метаданные — таким образом формируя распределённые трейсы и позволяя коррелировать спаны. Эти SDKs дополняются экосистемой, которая автоматически интегрирует распространённые библиотеки и фреймворки, избавляя пользователя от необходимости изменять свой код и обеспечивая инструментирование «из коробки».

Решение для наблюдаемости на базе ClickHouse использует оба этих инструмента.



## Дистрибутивы {#distributions}

Существует [несколько дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file) коллектора OpenTelemetry. Приемник `filelog` вместе с экспортером ClickHouse, необходимыми для решения на базе ClickHouse, присутствуют только в дистрибутиве [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при работе в продуктивной среде рекомендуется ограничить коллектор только теми компонентами, которые необходимы для конкретного окружения. Некоторые причины для этого:

- Уменьшить размер коллектора, сократив время его развертывания
- Повысить безопасность коллектора за счет уменьшения доступной площади атаки

Сборку [пользовательского коллектора](https://opentelemetry.io/docs/collector/custom-collector/) можно выполнить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).



## Приём данных с помощью OTel {#ingesting-data-with-otel}

### Роли развертывания коллектора {#collector-deployment-roles}

Чтобы собирать логи и загружать их в ClickHouse, мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector может быть развернут в двух основных ролях:

- **Agent** — экземпляры агента собирают данные на краю инфраструктуры, например на серверах или на узлах Kubernetes, либо принимают события непосредственно от приложений, инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента запускается вместе с приложением или на том же хосте, что и приложение (например, в виде sidecar-контейнера или ДемонСета). Агенты могут либо отправлять свои данные напрямую в ClickHouse, либо на экземпляр шлюза. В первом случае это называется [шаблоном развертывания Agent](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Gateway** — экземпляры шлюза предоставляют автономный сервис (например, Развертывание в Kubernetes), обычно по одному на кластер, дата-центр или регион. Они принимают события от приложений (или других коллекторов, работающих как агенты) через единый OTLP-эндпоинт. Как правило, разворачивается набор экземпляров шлюза, при этом используется готовый балансировщик нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на этот единый эндпоинт, это часто называют [шаблоном развертывания Gateway](https://opentelemetry.io/docs/collector/deployment/gateway/).

Далее мы предполагаем простой коллектор в роли агента, отправляющий свои события напрямую в ClickHouse. См. раздел [Масштабирование с помощью Gateways](#scaling-with-gateways) для получения дополнительной информации об использовании шлюзов и случаях их применения.

### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора состоит в том, что он позволяет вашим сервисам быстро выгружать данные, а сам коллектор берет на себя дополнительную обработку, такую как повторные попытки, пакетирование, шифрование или даже фильтрацию конфиденциальных данных.

Коллектор использует термины [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) для своих трех основных стадий обработки. Receivers используются для сбора данных и могут быть как pull-, так и push-ориентированными. Processors позволяют выполнять преобразование и обогащение сообщений. Exporters отвечают за отправку данных в целевой сервис. Хотя таким сервисом теоретически может быть другой коллектор, для первоначального обсуждения ниже мы предполагаем, что все данные отправляются непосредственно в ClickHouse.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором receivers, processors и exporters.

Коллектор предоставляет два основных receiver для сбора логов:

**Через OTLP** — в этом случае логи отправляются (push) непосредственно в коллектор из OpenTelemetry SDK через протокол OTLP. [OpenTelemetry demo](https://opentelemetry.io/docs/demo/) использует этот подход: экспортёры OTLP в каждом языке исходят из локального эндпоинта коллектора. В этом случае коллектор должен быть сконфигурирован с приёмником OTLP — см. приведенную выше [демонстрацию для примера конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода заключается в том, что данные логов автоматически будут содержать идентификаторы трасс (Trace ID), что позволит пользователям впоследствии определять трейсы для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через OTLP" size="md"/>

Этот подход требует, чтобы пользователи инструментировали свой код [соответствующим SDK для выбранного языка](https://opentelemetry.io/docs/languages/).

- **Сбор через Filelog receiver** — этот receiver последовательно дочитывает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Он обрабатывает сложные задачи, такие как определение многострочных сообщений, обработка ротации логов, ведение контрольных точек для устойчивости к перезапуску и извлечение структуры. Дополнительно этот receiver может читать логи контейнеров Docker и Kubernetes, будучи развернутым как Helm-чарт, [извлекая из них структуру](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их сведениями о поде.

<Image img={observability_5} alt="Filelog receiver" size="md"/>

**В большинстве развертываний используется комбинация указанных выше receivers. Мы рекомендуем пользователям ознакомиться с [документацией по коллектору](https://opentelemetry.io/docs/collector/) и базовыми понятиями, а также с [структурой конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методами установки](https://opentelemetry.io/docs/collector/installation/).**



:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::



## Структурированные и неструктурированные логи

Логи могут быть структурированными или неструктурированными.

Структурированный лог использует формат данных, например JSON, в котором задаются поля метаданных, такие как HTTP-код и исходный IP-адрес.

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

Неструктурированные логи, хотя обычно и содержат некоторую внутреннюю структуру, которую можно извлечь с помощью регулярного выражения, представляют запись лога исключительно в виде строки.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем использовать структурированное логирование и по возможности вести логи в формате JSON (например, ndjson). Это упростит последующую обработку логов — либо до отправки в ClickHouse с помощью [Collector processors](https://opentelemetry.io/docs/collector/configuration/#processors), либо на этапе вставки с использованием материализованных представлений. Структурированные логи в конечном итоге позволят сэкономить ресурсы дальнейшей обработки, снизив требуемую нагрузку на CPU в вашем решении на базе ClickHouse.

### Пример

В качестве примера мы предоставляем наборы данных со структурированным (JSON) и неструктурированным логированием, каждый примерно с 10 млн строк, доступные по следующим ссылкам:

* [Unstructured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
* [Structured](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

В примере ниже используется структурированный набор данных. Убедитесь, что вы скачали и распаковали этот файл, чтобы воспроизвести приведённые далее примеры.

Ниже представлена простая конфигурация для OTel collector, который считывает эти файлы с диска с помощью приёмника `filelog` и выводит полученные сообщения в `stdout`. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), так как наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите использование ClickHouse для парсинга
Приведённый ниже пример извлекает временную метку из лога. Для этого требуется использование оператора `json_parser`, который преобразует всю строку лога в JSON-строку, помещая результат в `LogAttributes`. Это может быть вычислительно затратно и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) — см. [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный пример для неструктурированных логов, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения того же результата, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут следовать [официальной инструкции](https://opentelemetry.io/docs/collector/installation/) для локальной установки коллектора. Важно скорректировать эти инструкции так, чтобы использовать [contrib-дистрибутив](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (который содержит приёмник `filelog`), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователям нужно скачать `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel collector можно запустить следующими командами:

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

Выше приведено отдельное лог-сообщение, сгенерированное OTel collector. Эти же сообщения мы отправляем на приём в ClickHouse в последующих разделах.

Полная схема лог-сообщений, включая дополнительные столбцы, которые могут присутствовать при использовании других receivers, приведена [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевой момент в том, что сама строка лога хранится как строка в поле `Body`, но JSON был автоматически извлечён в поле `Attributes` благодаря `json_parser`. Тот же [operator](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Рекомендации по обработке логов с помощью OTel см. в разделе [Processing](#processing---filtering-transforming-and-enriching).

:::note Operators
Operators — это базовая единица обработки логов. Каждый operator выполняет одну функцию, например чтение строк из файла или парсинг JSON из поля. Затем operators объединяются в конвейер (pipeline), чтобы получить желаемый результат.
:::

Приведённые выше сообщения не содержат полей `TraceID` или `SpanID`. Если они присутствуют, например в случаях, когда пользователи реализуют [распределённое трассирование](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON, используя те же приёмы, что показаны выше.

Пользователям, которым необходимо собирать локальные или Kubernetes лог-файлы, мы рекомендуем ознакомиться с параметрами конфигурации, доступными для [filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration), а также с тем, как обрабатываются [offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [парсинг многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).


## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем воспользоваться [руководством по Kubernetes в документации OpenTelemetry](https://opentelemetry.io/docs/kubernetes/). [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) рекомендуется для обогащения логов и метрик метаданными подов. Это может приводить к появлению динамических метаданных, например меток, хранящихся в столбце `ResourceAttributes`. В настоящее время ClickHouse использует тип `Map(String, String)` для этого столбца. Дополнительные сведения о работе с этим типом и его оптимизации см. в разделах [Using Maps](/use-cases/observability/schema-design#using-maps) и [Extracting from maps](/use-cases/observability/schema-design#extracting-from-maps).



## Сбор трассировок

Пользователям, которые хотят инструментировать свой код и собирать трассировки, рекомендуется следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставлять события в ClickHouse, необходимо развернуть OTel collector для приёма событий трассировок по протоколу OTLP с помощью соответствующего receiver. В демонстрации OpenTelemetry приведён [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в collector. Ниже показан пример конфигурации collector, который выводит события в stdout:

### Пример

Поскольку трассировки должны приниматься по OTLP, мы используем утилиту [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трассировок. Следуйте инструкциям по установке, приведённым [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen).

Следующая конфигурация принимает события трассировок на OTLP receiver и затем отправляет их в stdout.

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

В результате в stdout будут выводиться сообщения трассировки, аналогичные приведённому ниже примеру:

```response
Спан №86
        ID трассировки : 1bb5cdd2c9df5f0da320ca22045c60d9
        ID родителя    : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Имя            : okey-dokey-0
        Тип            : Server
        Время начала   : 2024-06-19 18:03:41.603868 +0000 UTC
        Время окончания: 2024-06-19 18:03:41.603991 +0000 UTC
        Код состояния  : Не установлен
        Сообщение состояния :
Атрибуты:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

Выше приведено одно сообщение трассировки, сгенерированное OTel collector. Эти же сообщения мы принимаем в ClickHouse в последующих разделах.

Полная схема сообщений трассировки приведена [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем ознакомиться с этой схемой.


## Обработка — фильтрация, трансформация и обогащение {#processing---filtering-transforming-and-enriching}

Как было показано в предыдущем примере с установкой временной метки для события журнала, пользователи, как правило, хотят фильтровать, преобразовывать и обогащать сообщения о событиях. Это можно сделать с помощью ряда возможностей в OpenTelemetry:

- **Processors (процессоры)** — процессоры принимают данные, собранные [приёмниками, и изменяют или преобразуют их](https://opentelemetry.io/docs/collector/transforming-telemetry/) перед отправкой экспортёрам. Процессоры применяются в том порядке, который задан в секции `processors` конфигурации коллектора. Они являются необязательными, но минимальный набор [обычно рекомендуется](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничиться следующими процессорами:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с исчерпанием памяти на коллекторе. См. раздел [Estimating Resources](#estimating-resources) для рекомендаций.
  - Любой процессор, выполняющий обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически задавать ресурсные атрибуты спанов, метрик и логов с k8s-метаданными, т. е. обогащать события идентификатором исходного пода и т. п.
  - [Хвостовая или головная выборка (tail or head sampling)](https://opentelemetry.io/docs/concepts/sampling/), если требуется для трейсов.
  - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — отбрасывание ненужных событий, если это нельзя сделать с помощью операторов (см. ниже).
  - [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — обязателен при работе с ClickHouse, чтобы гарантировать отправку данных пакетами. См. раздел ["Exporting to ClickHouse"](#exporting-to-clickhouse).

- **Operators (операторы)** — [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) представляют собой наиболее базовую единицу обработки, доступную на уровне приёмника. Поддерживается базовый парсинг, позволяющий задавать такие поля, как Severity и Timestamp. Здесь поддерживается JSON- и regex-парсинг, а также фильтрация событий и базовые трансформации. Мы рекомендуем выполнять фильтрацию событий именно здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью операторов или [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Они могут приводить к значительным накладным расходам по памяти и CPU, особенно при JSON-парсинге. Всю обработку можно выполнять в ClickHouse на этапе вставки с помощью материализованных представлений и столбцов, за некоторыми исключениями — в частности, контекстно-зависимого обогащения, например добавления k8s-метаданных. Для получения более подробной информации см. раздел [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с использованием OTel collector, мы рекомендуем выполнять трансформации на экземплярах-шлюзах (gateway instances) и минимизировать работу на экземплярах-агентах (agent instances). Это обеспечит минимально возможные требования к ресурсам агентов на периферии, работающих на серверах. Как правило, мы видим, что пользователи выполняют на агентах только фильтрацию (для минимизации ненужного сетевого трафика), установку временной метки (через операторы) и обогащение, которое требует контекста. Например, если экземпляры-шлюзы находятся в другом Kubernetes-кластере, обогащение k8s должно происходить на агенте.

### Пример {#example-2}

Следующая конфигурация демонстрирует сбор неструктурированного файла логов. Обратите внимание на использование операторов для извлечения структуры из строк журнала (`regex_parser`) и фильтрации событий, а также процессора для пакетирования событий и ограничения использования памяти.



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


## Экспорт в ClickHouse

Экспортёры отправляют данные в один или несколько бэкендов или целевых систем. Экспортёры могут работать по pull- или push-модели. Чтобы отправлять события в ClickHouse, необходимо использовать push-ориентированный [экспортёр ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортёр ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не базовой дистрибуции. Можно либо использовать contrib-дистрибутив, либо [собрать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
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

Обратите внимание на следующие ключевые параметры:


* **pipelines** - В приведённой выше конфигурации используется [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящие из набора receivers, processors и exporters, с отдельными конвейерами для логов и трейсов.
* **endpoint** - Взаимодействие с ClickHouse настраивается через параметр `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` задаёт обмен данными по TCP. Если пользователи предпочитают HTTP по причинам, связанным с переключением трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные сведения о параметрах подключения, включая возможность указать имя пользователя и пароль в строке подключения, приведены [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что указанная выше строка подключения включает и сжатие (lz4), и асинхронные вставки. Мы рекомендуем всегда включать оба параметра. Дополнительные сведения об асинхронных вставках см. в разделе [Batching](#batching). Сжатие всегда следует задавать явно, так как по умолчанию оно не будет включено в более старых версиях экспортера.

* **ttl** - значение определяет, как долго будут храниться данные. Дополнительные сведения см. в разделе «Managing data». Это значение следует указывать как интервал времени в часах, например 72h. В примере ниже мы отключаем TTL, поскольку наши данные относятся к 2019 году и будут немедленно удалены ClickHouse при вставке.
* **traces&#95;table&#95;name** и **logs&#95;table&#95;name** - определяют имена таблиц для логов и трейсов.
* **create&#95;schema** - определяет, создаются ли таблицы с типовыми схемами при запуске. По умолчанию имеет значение true для быстрого старта. Пользователям рекомендуется установить значение false и определить собственную схему.
* **database** - целевая база данных.
* **retry&#95;on&#95;failure** - настройки, определяющие, следует ли повторно отправлять неуспешные пакеты.
* **batch** - обработчик batch гарантирует отправку событий пакетами. Мы рекомендуем размер порядка 5000 и таймаут 5s. То, что будет достигнуто раньше, инициирует формирование пакета для сброса данных в exporter. Уменьшение этих значений приведёт к снижению задержки в pipeline, и данные станут доступны для запросов быстрее, но за счёт увеличения количества соединений и пакетов, отправляемых в ClickHouse. Это не рекомендуется, если пользователи не используют [asynchronous inserts](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может привести к проблемам с [too many parts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют asynchronous inserts, доступность данных для запросов также будет зависеть от настроек асинхронных вставок — хотя данные всё равно будут сбрасываться из коннектора раньше. См. раздел [Batching](#batching) для получения дополнительных сведений.
* **sending&#95;queue** - управляет размером очереди отправки. Каждый элемент в очереди содержит один пакет. Если очередь переполнена, например, из-за того что ClickHouse недоступен, но события продолжают поступать, пакеты будут отбрасываться.

Предполагая, что пользователи извлекли структурированный log-файл и у них запущен [локальный экземпляр ClickHouse](/install) (с аутентификацией по умолчанию), они могут запустить эту конфигурацию командой:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить данные трассировки в этот коллектор, выполните следующую команду с помощью утилиты `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска убедитесь, что журнальные события появились, выполнив простой запрос:

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


## Стандартная схема

По умолчанию экспортер ClickHouse создает целевую таблицу, используемую как для логов, так и для трейсов. Это можно отключить с помощью настройки `create_schema`. Кроме того, имена таблиц логов и трейсов можно изменить с их значений по умолчанию `otel_logs` и `otel_traces` с помощью настроек, указанных выше.

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


- По умолчанию таблица секционируется по дате с помощью `PARTITION BY toDate(Timestamp)`. Это позволяет эффективно удалять данные с истёкшим сроком хранения.
- TTL задаётся через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, указанному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что удаляются только целые парты, когда все строки в них устарели. Это более эффективно, чем удаление строк внутри партов, которое приводит к дорогостоящей операции delete. Мы рекомендуем всегда включать этот параметр. Дополнительные сведения см. в разделе [Управление данными с помощью TTL](/observability/managing-data#data-management-with-ttl-time-to-live).
- Таблица использует классический [движок `MergeTree`](/engines/table-engines/mergetree-family/mergetree). Он рекомендуется для логов и трейсов и, как правило, не требует изменений.
- Таблица упорядочена с помощью `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` — более ранние столбцы в списке будут фильтроваться быстрее, чем более поздние, например фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Пользователи должны модифицировать этот порядок в соответствии с ожидаемыми паттернами доступа — см. [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- В приведённой выше схеме к столбцам применяется `ZSTD(1)`. Это обеспечивает наилучшее сжатие для логов. Пользователи могут повысить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшего сжатия, хотя это редко даёт существенную пользу. Увеличение этого значения приведёт к большему потреблению CPU во время вставки (при сжатии), однако декомпрессия (и, следовательно, выполнение запросов) должна оставаться сопоставимой по производительности. Дополнительные сведения см. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Дополнительно к `Timestamp` применяется [дельта-кодирование](/sql-reference/statements/create/table#delta) с целью уменьшить его размер на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) имеют тип Map. Пользователям следует ознакомиться с различиями между ними. О том, как обращаться к таким Map-типам и оптимизировать доступ к ключам внутри них, см. раздел [Использование map-типов](/use-cases/observability/schema-design#using-maps).
- Большинство остальных типов здесь, например `ServiceName` с типом LowCardinality, уже оптимизированы. Обратите внимание, что `Body`, который в наших примерных логах представлен в формате JSON, хранится как String.
- Bloom-фильтры применяются к ключам и значениям Map-типов, а также к столбцу `Body`. Они нацелены на улучшение времени выполнения запросов, обращающихся к этим столбцам, но, как правило, не являются обязательными. См. [Вторичные индексы/индексы пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).



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

Как и выше, это будет коррелировать со столбцами, соответствующими официальной спецификации OTel для трассировок, описанной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Здесь схема использует многие из тех же настроек, что и приведённая выше схема логов, с дополнительными столбцами Link, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схемы и создавать таблицы вручную. Это позволяет изменять первичные и вторичные ключи, а также даёт возможность добавлять дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительной информации см. раздел [Schema design](/use-cases/observability/schema-design).


## Оптимизация вставок {#optimizing-inserts}

Чтобы добиться высокой производительности вставки при одновременном обеспечении сильных гарантий согласованности, пользователям следует придерживаться нескольких простых правил при вставке Observability‑данных в ClickHouse через коллектор. При корректной конфигурации OTel collector соблюдение этих правил не представляет сложности. Это также позволяет избежать [распространённых проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми сталкиваются пользователи при первом использовании ClickHouse.

### Пакетирование {#batching}

По умолчанию каждая вставка, отправляемая в ClickHouse, приводит к немедленному созданию части (part) в хранилище, которая содержит данные этой вставки вместе с другими метаданными, которые необходимо сохранить. Поэтому отправка меньшего числа вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего числа вставок с меньшим объёмом данных, уменьшит количество необходимых операций записи. Мы рекомендуем вставлять данные достаточно крупными пакетами — как минимум по 1 000 строк за один раз. Дополнительные подробности [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными при идентичном содержимом. Для таблиц семейства движков MergeTree ClickHouse по умолчанию автоматически [удаляет дубликаты вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки устойчивы к ошибкам в следующих случаях:

- (1) Если узел, принимающий данные, испытывает проблемы, запрос вставки завершится по таймауту (или выдаст более специфичную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из‑за сетевых сбоев, отправитель получит либо таймаут, либо сетевую ошибку.

С точки зрения коллектора, (1) и (2) может быть сложно различить. Однако в обоих случаях неподтверждённую вставку можно сразу же повторить. Пока повторный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторную вставку, если (неподтверждённая) исходная вставка успешно завершилась.

Мы рекомендуем пользователям использовать [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, чтобы удовлетворить вышеперечисленные условия. Это гарантирует, что вставки отправляются как согласованные пакеты строк, удовлетворяющие указанным требованиям. Если от коллектора ожидается высокая пропускная способность (events per second) и в каждую вставку можно отправлять как минимум 5000 событий, этого пакетирования обычно достаточно для всего конвейера. В этом случае коллектор будет сбрасывать пакеты до того, как будет достигнут `timeout` batch processor, что обеспечивает низкую сквозную задержку конвейера и стабильный размер пакетов.

### Использование асинхронных вставок {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять более мелкие пакеты, когда пропускная способность коллектора низкая, но при этом они ожидают, что данные достигнут ClickHouse с минимальной сквозной задержкой. В таком случае небольшие пакеты отправляются при истечении `timeout` batch processor. Это может привести к проблемам, и как раз в таких сценариях требуются асинхронные вставки. Такая ситуация обычно возникает, когда **коллектор в роли агента настроен на прямую отправку в ClickHouse**. Gateways, выступая в роли агрегаторов, могут ослабить эту проблему — см. [Масштабирование с помощью Gateways](#scaling-with-gateways).

Если нельзя гарантировать крупные пакеты, пользователи могут делегировать пакетирование ClickHouse, используя [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже, асинхронно.

<Image img={observability_6} alt="Асинхронные вставки" size="md"/>

При [включённых асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос на вставку, данные запроса ② немедленно записываются сначала в находящийся в памяти буфер. Когда ③ происходит следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть (part) в хранилище базы данных. Обратите внимание, что данные недоступны для поиска запросами до их сброса в хранилище базы данных; параметры сброса буфера [настраиваются](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (значение по умолчанию) для получения гарантий доставки — см. [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) дополнительные подробности.



Данные, отправленные асинхронной вставкой, записываются после сброса буфера ClickHouse. Это происходит либо после превышения значения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо по истечении [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если для `async_insert_stale_timeout_ms` задано ненулевое значение, данные вставляются по истечении `async_insert_stale_timeout_ms` миллисекунд с момента последнего запроса. Пользователи могут настраивать эти параметры для управления сквозной задержкой в своем конвейере. Дополнительные параметры, которые можно использовать для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию подходят.

:::note Рассмотрите использование адаптивных асинхронных вставок
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но жесткими требованиями по сквозной задержке, могут быть полезны [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts). В целом, они неприменимы к сценариям наблюдаемости с высокой пропускной способностью, характерным для ClickHouse.
:::

Наконец, предыдущее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включено при использовании асинхронных вставок. При необходимости см. параметр [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полную информацию по настройке этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), а подробный разбор — [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).



## Архитектуры развертывания {#deployment-architectures}

При использовании OTel collector с ClickHouse возможно несколько архитектур развертывания. Ниже мы описываем каждую из них и случаи, когда она может применяться.

### Только агенты {#agents-only}

В архитектуре только с агентами пользователи разворачивают OTel collector в роли агентов на периферии. Они получают трейсы от локальных приложений (например, как sidecar-контейнер) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные напрямую в ClickHouse.

<Image img={observability_7} alt="Только агенты" size="md"/>

Эта архитектура подходит для развертываний малого и среднего размера. Ее основное преимущество в том, что она не требует дополнительного оборудования и минимизирует общий ресурсный след решения наблюдаемости на ClickHouse, обеспечивая простое сопоставление между приложениями и коллекторами.

Пользователям следует рассмотреть миграцию на архитектуру на основе gateway, когда количество агентов превышает несколько сотен. У этой архитектуры есть несколько недостатков, которые затрудняют масштабирование:

- **Масштабирование подключений** — каждый агент устанавливает подключение к ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных подключений для вставки, в итоге это станет ограничивающим фактором и сделает операции вставки менее эффективными — то есть больше ресурсов ClickHouse будет тратиться на поддержание подключений. Использование gateway-экземпляров минимизирует количество подключений и делает вставки более эффективными.
- **Обработка на периферии** — любые трансформации или обработка событий в этой архитектуре должны выполняться либо на периферии, либо в ClickHouse. Помимо того что это ограничивает гибкость, это может означать либо сложные материализованные представления в ClickHouse, либо перенос значительных вычислений на периферию — где могут быть задействованы критичные сервисы и ограничены ресурсы.
- **Малые батчи и задержки** — агентные коллекторы могут по отдельности собирать очень небольшое количество событий. Обычно это означает, что их необходимо настраивать на сброс данных с заданным интервалом, чтобы удовлетворить SLA по доставке. В результате коллектор может отправлять в ClickHouse небольшие пакеты. Несмотря на то что это недостаток, его можно смягчить с помощью асинхронных вставок — см. [Оптимизация вставок](#optimizing-inserts).

### Масштабирование с использованием gateway {#scaling-with-gateways}

OTel collectors могут быть развернуты как экземпляры gateway для устранения указанных выше ограничений. Они предоставляют автономный сервис, обычно на каждый дата-центр или регион. Они принимают события от приложений (или других коллекторов в роли агентов) через единый OTLP endpoint. Как правило, разворачивается набор экземпляров gateway, а готовый балансировщик нагрузки используется для распределения нагрузки между ними.

<Image img={observability_8} alt="Масштабирование с использованием gateway" size="md"/>

Цель этой архитектуры — снять ресурсоемкую обработку с агентов, тем самым минимизируя их использование ресурсов. Эти экземпляры gateway могут выполнять задачи трансформации, которые в противном случае пришлось бы выполнять агентам. Более того, агрегируя события от большого количества агентов, экземпляры gateway могут гарантировать отправку в ClickHouse крупных пакетов, что позволяет эффективно выполнять вставки. Эти gateway-collectors легко масштабировать по мере добавления новых агентов и роста пропускной способности по событиям. Пример конфигурации gateway с соответствующей конфигурацией агента, потребляющего пример структурированного файла логов, приведен ниже. Обратите внимание на использование OTLP для связи между агентом и gateway.

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
      insecure: true # Установите значение false при использовании защищённого соединения
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено, поскольку на одном хосте запущено 2 коллектора
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

Основной недостаток этой архитектуры заключается в затратах и накладных расходах на управление набором коллекторов.

В качестве примера управления более крупными архитектурами, основанными на шлюзах, и связанных с этим уроков, мы рекомендуем этот [пост в блоге](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).

### Добавление Kafka

Читатели могут заметить, что приведённые выше архитектуры не используют Kafka в качестве очереди сообщений.


Использование очереди Kafka в качестве буфера сообщений — популярный шаблон проектирования, встречающийся в архитектурах логирования и получивший широкое распространение благодаря стеку ELK. Он обеспечивает несколько преимуществ; в первую очередь помогает предоставлять более строгие гарантии доставки сообщений и справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластер Kafka должен обеспечивать высокопроизводительный буфер сообщений, поскольку запись данных линейно на диск требует меньших вычислительных затрат, чем разбор и обработка сообщения — в Elastic, например, токенизация и индексация приводят к значительным накладным расходам. Вынося хранение данных за пределы агентов, вы также снижаете риск потери сообщений в результате ротации логов на источнике. Наконец, Kafka предлагает возможности повторной отправки сообщений и межрегиональной репликации, что может быть привлекательно для некоторых сценариев использования.

Однако ClickHouse способен очень быстро вставлять данные — миллионы строк в секунду на умеренном оборудовании. Обратное давление со стороны ClickHouse возникает **редко**. Часто использование очереди Kafka означает большую архитектурную сложность и дополнительные затраты. Если вы готовы исходить из принципа, что логи не нуждаются в тех же гарантиях доставки, что банковские транзакции и другие критически важные данные, мы рекомендуем избегать усложнения архитектуры за счет Kafka.

Однако если вам требуются высокие гарантии доставки или возможность повторного воспроизведения данных (потенциально в несколько источников), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Добавление Kafka" size="md"/>

В этом случае агенты OTel можно настроить на отправку данных в Kafka с помощью [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). В свою очередь, экземпляры шлюза потребляют сообщения, используя [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Для получения дополнительных сведений мы рекомендуем документацию Confluent и OTel.

### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel collector будут зависеть от пропускной способности по событиям, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза с 3 ядрами и 12 ГБ ОЗУ может обрабатывать около 60k событий в секунду. При этом предполагается минимальный конвейер обработки, отвечающий за переименование полей, и отсутствие регулярных выражений.

Для экземпляров агента, отвечающих за доставку событий в шлюз и только установку временной метки на событии, мы рекомендуем подбирать ресурсы на основе ожидаемого количества логов в секунду. Ниже приведены приблизительные значения, которые пользователи могут использовать в качестве отправной точки:

| Скорость логирования | Ресурсы для агента collector |
|----------------------|------------------------------|
| 1k/second            | 0,2 CPU, 0,2 GiB             |
| 5k/second            | 0,5 CPU, 0,5 GiB             |
| 10k/second           | 1 CPU, 1 GiB                 |
