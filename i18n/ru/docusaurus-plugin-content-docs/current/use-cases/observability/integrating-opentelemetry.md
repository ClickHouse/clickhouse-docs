---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для обеспечения наблюдаемости'
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

Любое решение для обеспечения наблюдаемости требует средства для сбора и экспорта логов и трасс. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

"OpenTelemetry - это платформа и набор инструментов для обеспечения наблюдаемости, предназначенные для создания и управления телеметрическими данными, такими как трассы, метрики и логи."

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бэкендом для обеспечения наблюдаемости и в большей степени сосредотачивается на генерации, сборе, управлении и экспорте телеметрических данных. Хотя первоначальная цель OpenTelemetry заключалась в том, чтобы позволить пользователям легко инструментировать свои приложения или системы с помощью специализированных SDK, он расширил свои функции, включив сбор логов через OpenTelemetry collector - агент или прокси, который принимает, обрабатывает и экспортирует телеметрические данные.
## Компоненты, относящиеся к ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из нескольких компонентов. Кроме предоставления спецификации данных и API, стандартизованного протокола и наименований для полей/столбцов, OTel предлагает две возможности, которые являются основополагающими для построения решения по обеспечению наблюдаемости с использованием ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) - это прокси, который принимает, обрабатывает и экспортирует телеметрические данные. Решение на основе ClickHouse использует этот компонент как для сбора логов, так и для обработки событий перед их пакетной загрузкой и вставкой.
- [Языковые SDK](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDK эффективно обеспечивают правильную запись трасс в коде приложения, создавая составные отрезки и гарантируя, что контекст передается между службами через метаданные, тем самым формируя распределенные трассы и обеспечивая корреляцию отрезков. Эти SDK дополняются экосистемой, которая автоматически реализует общие библиотеки и фреймворки, благодаря чему пользователю не требуется изменять свой код, и он получает встроенную инструментализацию "из коробки".

Решение для обеспечения наблюдаемости на основе ClickHouse использует оба этих инструмента.
## Дистрибутивы {#distributions}

OpenTelemetry collector имеет [несколько дистрибутивов](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Приемник filelog вместе с экспортером ClickHouse, необходимым для решения ClickHouse, присутствует только в [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Этот дистрибутив содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при запуске в производственной среде рекомендуется ограничить collector только теми компонентами, которые необходимы для данной среды. Некоторые причины для этого:

- Уменьшить размер collector, что сократит время развертывания
- Улучшить безопасность collector, уменьшая доступную площадь атаки

Создание [пользовательского collector](https://opentelemetry.io/docs/collector/custom-collector/) можно осуществить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).
## Прием данных с использованием OTel {#ingesting-data-with-otel}
### Роли развертывания collector {#collector-deployment-roles}

Для того чтобы собирать логи и вставлять их в ClickHouse, мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector можно развернуть в двух основных ролях:

- **Агент** - Экземпляры агента собирают данные на краю, например, на серверах или узлах Kubernetes, или получают события напрямую от приложений - инструментированных с помощью OpenTelemetry SDK. В последнем случае экземпляр агента работает вместе с приложением или на том же хосте, что и приложение (например, как сайдкар или DaemonSet). Агенты могут либо отправлять свои данные напрямую в ClickHouse, либо к экземпляру шлюза. В первом случае это называется [шаблоном развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Шлюз** - Экземпляры шлюза предоставляют автономную службу (например, развертывание в Kubernetes), обычно на кластер, центр обработки данных или регион. Они получают события от приложений (или других collectors в качестве агентов) через единую точку OTLP. Обычно развертывается набор экземпляров шлюза, с использованием готового балансировщика нагрузки для распределения нагрузки. Если все агенты и приложения отправляют свои сигналы на эту единичную точку, это часто называется [шаблоном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

В дальнейшем мы рассматриваем простой агентский collector, который отправляет свои события непосредственно в ClickHouse. См. [Масштабирование с использованием шлюзов](#scaling-with-gateways) для получения дополнительных сведений о использовании шлюзов и о том, когда они применимы.
### Сбор логов {#collecting-logs}

Основным преимуществом использования collector является то, что он позволяет вашим службам быстро разгружать данные, передавая обработку дополнительным операциям, таким как повторы, пакетирование, шифрование или даже фильтрация чувствительных данных.

Collector использует термины [приемник](https://opentelemetry.io/docs/collector/configuration/#receivers), [процессор](https://opentelemetry.io/docs/collector/configuration/#processors) и [экспортер](https://opentelemetry.io/docs/collector/configuration/#exporters) для трех основных этапов обработки. Приемники используются для сбора данных и могут быть основаны как на вытягивании, так и на отправке. Процессоры обеспечивают возможность выполнения преобразований и обогащения сообщений. Экспортеры отвечают за отправку данных в нижестоящую службу. Хотя эта служба теоретически может быть другим collector, ниже мы предполагаем, что все данные отправляются непосредственно в ClickHouse для первоначального обсуждения.

<Image img={observability_3} alt="Сбор логов" size="md"/>

Мы рекомендуем пользователям ознакомиться с полным набором приемников, процессоров и экспортеров.

Collector предоставляет два основных приемника для сбора логов:

**Через OTLP** - В этом случае логи отправляются (отправляются) непосредственно в collector из OpenTelemetry SDK через протокол OTLP. [Демонстрация OpenTelemetry](https://opentelemetry.io/docs/demo/) использует такой подход, при этом экспортёры OTLP в каждом языке предполагают локальную конечную точку collector. В этом случае collector должен быть настроен с приемником OTLP — смотрите выше [демонстрацию для конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимуществом этого подхода является то, что данные логов автоматически будут содержать идентификаторы трасс, позволяя пользователям позже идентифицировать трассы для конкретного лога и наоборот.

<Image img={observability_4} alt="Сбор логов через otlp" size="md"/>

Этот подход требует от пользователей инструментирования их кода с использованием их [соответствующего языкового SDK](https://opentelemetry.io/docs/languages/).

- **Скрейпинг через приемник Filelog** - Этот приемник отслеживает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Этот приемник обрабатывает сложные задачи, такие как определение многострочных сообщений, обработка переключений логов, контрольная запись для обеспечения устойчивости к перезапуску и извлечение структуры. Этот приемник также может отслеживать логи контейнеров Docker и Kubernetes, разворачиваемый как helm chart, [извлекая структуру из них](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями пода.

<Image img={observability_5} alt="Приемник файловых логов" size="md"/>

**Большинство развертываний будет использовать комбинацию приведенных выше приемников. Мы рекомендуем пользователям ознакомиться с [документацией collector](https://opentelemetry.io/docs/collector/) и изучить основные концепции, а также [структуру конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методы установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Подсказка: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::
## Структурированные и неструктурированные логи {#structured-vs-unstructured}

Логи могут быть структурированными или неструктурированными.

Структурированный лог будет использовать формат данных, такой как JSON, определяя метаполя, такие как код HTTP и IP-адрес источника.

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

Неструктурированные логи, хотя обычно также имеют некоторую структурированность, которую можно извлечь с помощью регулярного выражения, будут представлять лог просто как строку.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%D8%BA%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем пользователям использовать структурированное логирование и логировать в JSON (т.е. ndjson), где это возможно. Это упростит последующую обработку логов, либо перед отправкой в ClickHouse с помощью [процессоров Collector](https://opentelemetry.io/docs/collector/configuration/#processors), либо во время вставки с использованием материализованных представлений. Структурированные логи в конечном итоге сэкономят ресурсы на последующей обработке, снижая необходимую производительность CPU в вашем решении ClickHouse.
### Пример {#example}

Для примера мы предоставляем структурированный (JSON) и неструктурированный наборы логов, каждый из которых содержит примерно 10 миллионов строк, доступных по следующим ссылкам:

- [Неструктурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [Структурированный](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

Мы используем структурированный набор данных для приведенного ниже примера. Убедитесь, что этот файл загружен и извлечен, чтобы воспроизвести следующие примеры.

Ниже представлена простая конфигурация для OTel Collector, который читает эти файлы на диске, используя приемник filelog, и выводит полученные сообщения на стандартный вывод. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), так как наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите ClickHouse для парсинга
Ниже приведенный пример извлекает временную метку из лога. Это требует использования оператора `json_parser`, который преобразует всю строку лога в строку JSON, помещая результат в `LogAttributes`. Это может быть вычислительно затратным и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный неструктурированный пример, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения этой цели, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для установки collector локально. Важно, чтобы инструкции были изменены для использования [дистрибутива contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (в который входит приемник `filelog`), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователи должны загрузить `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить с помощью следующих команд:

```bash
./otelcol-contrib --config config-logs.yaml
```

При использовании структурированных логов сообщения будут иметь следующую форму на выводе:

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

Выше представлено одно сообщение лога, созданное OTel collector. Мы будем загружать эти же сообщения в ClickHouse в последующих разделах.

Полная схема сообщений логов, вместе с дополнительными столбцами, которые могут быть присутствовать при использовании других приемников, поддерживается [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключ состоит в том, что строка лога сама по себе хранится как строка в поле `Body`, но JSON был автоматически извлечен в поле Attributes благодаря `json_parser`. Этот же [оператор](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Для рекомендаций по обработке логов с OTel смотрите [Обработка](#processing---filtering-transforming-and-enriching).

:::note Операторы
Операторы - это базовая единица обработки логов. Каждый оператор выполняет единую задачу, такую как чтение строк из файла или парсинг JSON с поля. Операторы затем связываются в цепочку в конвейере для достижения желаемого результата.
:::

Вышеупомянутые сообщения не имеют полей `TraceID` или `SpanID`. Если они присутствуют, например, в случаях, когда пользователи реализуют [распределенное трассирование](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON с помощью тех же техник, показанных выше.

Для пользователей, которым нужно собирать локальные или Kubernetes файлы логов, мы рекомендуем ознакомиться с доступными опциями конфигурации для [приемника filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) и тем, как обрабатываются [сдвиги](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [парсинг многострочных логов](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).
## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем использовать [документацию Open Telemetry](https://opentelemetry.io/docs/kubernetes/). Рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) для обогащения логов и метрик метаданными подов. Это может потенциально создать динамические метаданные, такие как метки, сохраненные в столбце `ResourceAttributes`. В ClickHouse в настоящее время используется тип `Map(String, String)` для этого столбца. См. [Использование карт](/use-cases/observability/schema-design#using-maps) и [Извлечение из карт](/use-cases/observability/schema-design#extracting-from-maps) для получения дополнительных сведений о работе с этим типом и его оптимизации.
## Сбор трасс {#collecting-traces}

Для пользователей, желающих инструментировать свой код и собирать трассы, мы рекомендуем следовать [официальной документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставлять события в ClickHouse, пользователям необходимо развернуть OTel collector для получения событий трасс через протокол OTLP с помощью соответствующего приемника. Демонстрация OpenTelemetry предоставляет [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в collector. Пример соответствующей конфигурации collector, который выводит события на стандартный вывод, приведен ниже:
### Пример {#example-1}

Поскольку трассы должны быть получены через OTLP, мы используем инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трасс. Следуйте инструкциям [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для установки.

Следующая конфигурация принимает события трасс на приемнике OTLP, а затем отправляет их на стандартный вывод.

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

Отправьте события трасс в collector через `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

Это приведет к сообщениям трасс, подобным приведённому ниже примеру, выводимым на стандартный вывод:

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

Как показано в предыдущем примере с установкой временной метки для события лога, пользователи, безусловно, захотят фильтровать, преобразовывать и обогащать сообщения событий. Это можно достичь с помощью нескольких возможностей Open Telemetry:

- **Процессоры** - Процессоры берут данные, собранные [приемниками, и модифицируют или преобразовывают](https://opentelemetry.io/docs/collector/transforming-telemetry/) их перед отправкой экспортеру. Процессоры применяются в порядке, указанном в разделе `processors` конфигурации collector. Эти процессоры являются необязательными, но минимальный набор, как правило, рекомендуется [обычно](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничить процессоры:

    - Процессор [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с переполнением памяти в collector. См. [Оценка ресурсов](#estimating-resources) для рекомендаций.
    - Любой процессор, который выполняет обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматически устанавливать атрибуты ресурсов для отрезков, метрик и логов с метаданными k8s, т.е. обогащать события их идентификатором источника пода.
    - [Сэмплинг по хвостам или головам](https://opentelemetry.io/docs/concepts/sampling/) при необходимости для трасс.
    - [Базовая фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) - сбрасывание событий, которые не нужны, если это нельзя сделать через операторы (см. ниже).
    - [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - важно при работе с ClickHouse, чтобы гарантировать, что данные отправляются пакетами. См. ["Экспорт в ClickHouse"](#exporting-to-clickhouse).

- **Операторы** - [Операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) предоставляют самую базовую единицу обработки, доступную на приемнике. Поддерживается базовый парсинг, позволяющий устанавливать такие поля, как уровень и временная метка. Поддерживаются парсинг JSON и регулярных выражений, а также фильтрация событий и простые преобразования. Мы рекомендуем выполнять фильтрацию событий здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью операторов или [трансформационных процессоров](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Эти операции могут вызывать значительные затраты по памяти и CPU, особенно при парсинге JSON. Все мощения можно выполнить в ClickHouse во время вставки с помощью материализованных представлений и столбцов, за некоторыми исключениями - в частности, контекстно-осведомленного обогащения, т.е. добавления метаданных k8s. Для получения дополнительных сведений смотрите [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка ведется с помощью OTel collector, мы рекомендуем выполнять преобразования на экземплярах шлюзов и минимизировать любую работу, выполняемую на экземплярах агентов. Это гарантирует, что ресурсы, необходимые агентам на краю, работающим на серверах, будут как можно меньше. Обычно мы видим, что пользователи выполняют только фильтрацию (чтобы минимизировать ненужное использование сети), установку временной метки (через операторы) и обогащение, что требует контекста в агентах. Например, если экземпляры шлюзов находятся в другом кластере Kubernetes, необходимо будет выполнить обогащение k8s в агенте.
### Пример {#example-2}

Следующая конфигурация демонстрирует сбор неструктурированного файла логов. Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, а также на процессор для пакетирования событий и ограничения использования памяти.

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

Экспортеры отправляют данные в один или несколько бэкендов или мест назначения. Экспортеры могут быть основаны на извлечении (pull) или отправке (push). Для отправки событий в ClickHouse пользователи должны использовать экспортер на основе push - [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основной дистрибуции. Пользователи могут использовать как дистрибуцию contrib, так и [собрать собственный коллектор](https://opentelemetry.io/docs/collector/custom-collector/).
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

- **pipelines** - В приведенной выше конфигурации подчеркивается использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора приемников, процессоров и экспортеров для логов и траекторий.
- **endpoint** - Связь с ClickHouse настраивается через параметр `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` обеспечивает связь по TCP. Если пользователи предпочитают HTTP по причинам переключения трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные детали подключения, включая возможность указания имени пользователя и пароля внутри этой строки подключения, описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что приведенная выше строка подключения включает как сжатие (lz4), так и асинхронные вставки. Рекомендуется всегда включать оба параметра. См. [Batching](#batching) для получения дополнительных деталей об асинхронных вставках. Сжатие должно всегда указываться и по умолчанию не будет включено на более старых версиях экспортера.

- **ttl** - значение здесь определяет, как долго данные сохраняются. Дополнительные детали в "Управление данными". Это должно быть указано в виде единицы времени в часах, например, 72h. Мы отключаем TTL в следующем примере, так как наши данные датируются 2019 годом и будут немедленно удалены ClickHouse при вставке.
- **traces_table_name** и **logs_table_name** - определяют имя таблицы для логов и траекторий.
- **create_schema** - определяет, создаются ли таблицы с помощью схем по умолчанию при запуске. По умолчанию это установлено в true для начала работы. Пользователи должны установить его в false и определить свою собственную схему.
- **database** - целевая база данных.
- **retry_on_failure** - настройки для определения того, должны ли неудачные пакеты повторно обрабатываться.
- **batch** - процессор пакетов обеспечивает отправку событий в пакетах. Рекомендуем использовать значение около 5000 с таймаутом 5s. Любой из этих параметров, если он будет достигнут первым, запустит пакет для отправки экспортеру. Снижением этих значений будет означать более низкую задержку конвейера с доступными данными для запроса быстрее, но за счет большего количества соединений и пакетов, отправляемых в ClickHouse. Это не рекомендуется, если пользователи не используют [асинхронные вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может привести к проблемам с [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют асинхронные вставки, доступность данных для запросов также будет зависеть от настроек асинхронных вставок, хотя данные все равно будут сброшены из коннектора раньше. См. [Batching](#batching) для получения дополнительных деталей.
- **sending_queue** - управляет размером очереди отправки. Каждый элемент в очереди содержит пакет. Если эта очередь превышена, например, из-за недоступности ClickHouse, но события продолжают поступать, пакеты будут отброшены.

Предполагая, что пользователи извлекли структурированный файл логов и имеют [локальную инстанцию ClickHouse](/install), работающую (с настройками аутентификации по умолчанию), пользователи могут запустить эту конфигурацию с помощью команды:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Для отправки данных трассировки в этот коллектор выполните следующую команду, используя инструмент `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска подтвердите существование событий логов с помощью простого запроса:

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

По умолчанию экспортер ClickHouse создает целевую таблицу лога как для логов, так и для траекторий. Это можно отключить с помощью настройки `create_schema`. Более того, имена как таблицы логов, так и таблицы траекторий можно изменить от их значений по умолчанию `otel_logs` и `otel_traces` через указанные выше настройки.

:::note
В схеме ниже мы предполагаем, что TTL был включен на 72 часа.
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

Столбцы здесь соответствуют официальной спецификации OTel для логов, документированной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных заметок по этой схеме:

- По умолчанию таблица разделена по дате через `PARTITION BY toDate(Timestamp)`. Это делает эффективным удаление данных, которые истекают.
- TTL установлен через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, установленному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что только целые части удаляются, когда все содержащиеся строки истекли. Это более эффективно, чем удаление строк внутри частей, что связано с дорогими операциями удаления. Мы рекомендуем всегда устанавливать это значение. См. [Управление данными с помощью TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения дополнительных деталей.
- Таблица использует классический [`MergeTree` engine](/engines/table-engines/mergetree-family/mergetree). Это рекомендуется для логов и траекторий и не должно требовать изменения.
- Таблица упорядочена по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` - более ранние столбцы в списке будут фильтроваться быстрее, чем более поздние, например, фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Пользователи должны изменить это упорядочение в зависимости от своих ожидаемых паттернов доступа - см. [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- В приведенной схеме применяется `ZSTD(1)` к столбцам. Это обеспечивает наилучшее сжатие для логов. Пользователи могут увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшего сжатия, хотя это редко бывает полезно. Увеличение этого значения приведет к большему использованию ресурсов CPU во время вставки (в процессе сжатия), хотя декомпрессия (и, следовательно, запросы) должны оставаться сопоставимыми. Подробности см. [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). Дополнительное [delta encoding](/sql-reference/statements/create/table#delta) применяется к Timestamp с целью уменьшить его размер на диске.
- Обратите внимание, что [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются картами. Пользователи должны ознакомиться с различиями между ними. Для того чтобы узнать, как получить доступ к этим картам и оптимизировать доступ к ключам в них, смотрите [Использование карт](/use-cases/observability/integrating-opentelemetry.md).
- Большинство других типов здесь, например, `ServiceName` как LowCardinality, оптимизированы. Обратите внимание, что Body, хотя и является JSON в наших примерах логов, хранится как строка.
- Фильтры Блума применяются к ключам и значениям карт, а также к столбцу Body. Они направлены на улучшение времени выполнения запросов для доступа к этим столбцам, но обычно не требуются. См. [Вторичные/индексы для пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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

Снова, это будет коррелировать со столбцами, которые соответствуют официальной спецификации OTel для трассировок, документированным [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Схема здесь применяет многие те же настройки, что и вышеуказанная схема логов, с дополнительными колонками Link, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схемы и создать свои таблицы вручную. Это позволяет изменить первичные и вторичные ключи, а также предоставляет возможность добавить дополнительные столбцы для оптимизации производительности запросов. Для получения дополнительных деталей смотрите [Проектирование схемы](/use-cases/observability/schema-design).
## Оптимизация вставок {#optimizing-inserts}

Чтобы достичь высокой производительности вставок при обеспечении надежных гарантий согласованности, пользователи должны следовать простым правилам при вставке данных Об наблюдаемости в ClickHouse через коллектор. С правильной конфигурацией коллектора OTel следующие правила должны быть простыми для выполнения. Это также позволяет избежать [распространенных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом использовании ClickHouse.
### Пакетирование {#batching}

По умолчанию каждая вставка, отправляемая в ClickHouse, немедленно создает часть хранилища, содержащую данные из вставки вместе с другими метаданными, которые необходимо сохранить. Поэтому отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, снизит количество необходимых записей. Мы рекомендуем вставлять данные достаточно большими пакетами, содержащими не менее 1000 строк за раз. Дополнительные детали [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если идентичны. Для таблиц из семейства движков merge tree ClickHouse по умолчанию автоматически [дедуплицирует вставки](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки являются устойчивыми в случаях, подобных следующим:

- (1) Если узел, получающий данные, имеет проблемы, запрос вставки истечет (или получит более конкретную ошибку) и не получит подтверждение.
- (2) Если данные были записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых перебоев, отправитель либо получит тайм-аут, либо ошибку сети.

С точки зрения коллектора (1) и (2) могут быть трудны для различения. Однако в обоих случаях неполученная вставка может просто быть сразу повторена. Если повторенный запрос вставки содержит те же данные в том же порядке, ClickHouse автоматически проигнорирует повторенный запрос, если оригинальная вставка (неподтвержденная) прошла успешно.

Мы рекомендуем пользователям использовать [процессор пакетов](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в предыдущих конфигурациях, для удовлетворения вышеуказанных требований. Это гарантирует, что вставки отправляются как последовательные пакеты строк, удовлетворяющие вышеуказанным требованиям. Если ожидается, что коллектор будет иметь высокую пропускную способность (событий в секунду), и по крайней мере 5000 событий могут быть отправлены в каждой вставке, это обычно единственное пакетирование, необходимое в конвейере. В этом случае коллектор будет очищать пакеты, прежде чем истечет тайм-аут `timeout` процессора пакетов, что гарантирует, что задержка от начала до конца в конвейере остается низкой, а пакеты имеют последовательный размер.
### Использование асинхронных вставок {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять меньшие пакеты, когда пропускная способность коллектора низка, а данные все равно должны достичь ClickHouse в пределах минимальной задержки от начала до конца. В этом случае небольшие пакеты отправляются, когда истекает тайм-аут процессора пакетов. Это может вызвать проблемы, и в этом случае требуются асинхронные вставки. Эта ситуация обычно возникает, когда **коллекторы, играющие роль агента, настроены для отправки непосредственно в ClickHouse**. Шлюзы, выступая в качестве агрегаторов, могут облегчить эту проблему - см. [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если большие пакеты нельзя гарантировать, пользователи могут делегировать пакетирование ClickHouse с использованием [Асинхронных вставок](/cloud/bestpractices/asynchronous-inserts). При асинхронных вставках данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно соответственно.

<Image img={observability_6} alt="Async inserts" size="md"/>

С [включенными асинхронными вставками](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) в момент, когда ClickHouse ① получает запрос на вставку, данные запроса ② немедленно записываются сначала в буфер в памяти. Когда ③ происходит следующее очищение буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные не могут быть доступны для поиска запросами, пока они не будут очищены в хранилище базы данных; процесс сброса буфера [настраиваемый](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (значение по умолчанию) для получения гарантий доставки - смотрите [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получения дополнительных деталей.

Данные из асинхронной вставки вставляются после того, как буфер ClickHouse очищается. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо после [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлено в ненулевое значение, данные вставляются после `async_insert_stale_timeout_ms миллисекунд` с момента последнего запроса. Пользователи могут настроить эти параметры, чтобы контролировать задержку от начала до конца в своем конвейере. Дополнительные параметры, которые можно использовать для настройки сброса буфера, задокументированы [здесь](/operations/settings/settings#async_insert). Обычно значения по умолчанию являются подходящими.

:::note Рассмотрите адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но строгими требованиями к задержке от начала до конца, [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) могут быть полезны. Обычно они не применимы к сценариям наблюдаемости с высокой пропускной способностью, как это видно с ClickHouse.
:::

Наконец, предыдущее поведение дедупликации, связанное с синхронными вставками в ClickHouse, по умолчанию не включается при использовании асинхронных вставок. Если это необходимо, смотрите параметр [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные детали по настройке этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), с глубоким погружением [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).
## Архитектуры развертывания {#deployment-architectures}

Существует несколько архитектур развертывания, возможных при использовании коллектора OTel с ClickHouse. Мы описываем каждую из них ниже и когда она вероятно имеет применение.
### Только агенты {#agents-only}

В архитектуре только с агентами пользователи развертывают коллектор OTel в качестве агентов на краю. Эти агенты принимают трассировки от локальных приложений (например, в качестве контейнера sidecar) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные непосредственно в ClickHouse.

<Image img={observability_7} alt="Agents only" size="md"/>

Эта архитектура подходит для малых и средних развертываний. Ее основное преимущество заключается в том, что она не требует дополнительного оборудования и сохраняет общий ресурсный след решения по наблюдаемости ClickHouse на минимальном уровне, с простым соответствием между приложениями и коллекторами.

Пользователи должны рассмотреть возможность миграции на архитектуру, основанную на шлюзах, как только количество агентов превысит несколько сотен. Эта архитектура имеет несколько недостатков, которые сделают ее сложной для масштабирования:

- **Масштабирование соединений** - Каждый агент будет устанавливать соединение с ClickHouse. В то время как ClickHouse способен поддерживать сотни (если не тысячи) одновременных соединений вставки, это в конечном итоге станет ограничивающим фактором и сделает вставки менее эффективными - т.е. ClickHouse будет использовать больше ресурсов на поддержание соединений. Использование шлюзов минимизирует количество соединений и делает вставки более эффективными.
- **Обработка на краю** - Любые преобразования или обработка событий должны выполняться на краю или в ClickHouse в этой архитектуре. Кроме того, что это ограничивает, это может означать сложные материализованные представления ClickHouse или значительное вычисление на краю - где критические службы могут быть затронуты, а ресурсы ограничены.
- **Малые пакеты и задержки** - Коллекторы-агенты могут по отдельности собирать очень мало событий. Это обычно означает, что их необходимо настраивать так, чтобы очищать с установленным интервалом для удовлетворения SLA доставки. Это может привести к тому, что коллектор будет отправлять малые пакеты в ClickHouse. Хотя это является недостатком, это можно смягчить за счет асинхронных вставок - смотрите [Оптимизация вставок](#optimizing-inserts).
### Масштабирование с помощью шлюзов {#scaling-with-gateways}

OTel коллекторы могут быть развернуты в качестве экземпляров шлюза, чтобы решить вышеупомянутые ограничения. Они предоставляют отдельную службу, обычно на уровне дата-центра или региона. Эти экземпляры принимают события от приложений (или других коллекторов в роли агента) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов, и для распределения нагрузки среди них используется готовый балансировщик нагрузки.

<Image img={observability_8} alt="Масштабирование с помощью шлюзов" size="md"/>

Цель этой архитектуры — разгрузить вычислительно интенсивную обработку от агентов, тем самым минимизируя использование их ресурсов. Эти шлюзы могут выполнять трансформации, которые иначе должны были бы выполняться агентами. Кроме того, агрегируя события от многих агентов, шлюзы могут гарантировать, что большие пакеты отправляются в ClickHouse — что позволяет эффективно вставлять данные. Эти коллекторы шлюзов можно легко масштабировать по мере добавления новых агентов и увеличения пропускной способности событий. Пример конфигурации шлюза с сопутствующей конфигурацией агента, потребляющего пример структурированного файла журнала, приведен ниже. Обратите внимание на использование OTLP для общения между агентом и шлюзом.

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
      insecure: true # Установите в false, если вы используете защищенное подключение
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Изменено для 2 коллекторов, работающих на одном хосте
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

Основным недостатком этой архитектуры является сопутствующая стоимость и накладные расходы на управление набором коллекторов.

Для примера управления более крупными архитектурами на основе шлюзов с сопутствующими обучающими материалами, мы рекомендуем этот [блог-пост](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).
### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что вышеупомянутые архитектуры не используют Kafka в качестве очереди сообщений.

Использование очереди Kafka в качестве буфера сообщений является популярным шаблоном проектирования, наблюдаемым в архитектурах журналирования, и было популяризировано стеком ELK. Это дает несколько преимуществ; прежде всего, это помогает обеспечить более надежные гарантии доставки сообщений и помогает справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. В теории, кластерный экземпляр Kafka должен обеспечивать высокую пропускную способность буфера сообщений, так как ему требуется меньше вычислительных ресурсов для линейной записи данных на диск, чем для их разбора и обработки – в Elastic, например, токенизация и индексация требуют значительных ресурсов. Убирая данные от агентов, вы также снижаете риск потери сообщений в результате ротации журнала на исходном уровне. Наконец, он предлагает некоторые возможности повторной передачи сообщений и репликации между регионами, что может быть привлекательным для некоторых случаев использования.

Тем не менее, ClickHouse может быстро обрабатывать вставку данных — миллионы строк в секунду на умеренном оборудовании. Обратное давление от ClickHouse является **редким**. Часто использование очереди Kafka означает большую архитектурную сложность и затраты. Если вы можете принять принцип, что журналы не нуждаются в тех же гарантиях доставки, что и банковские транзакции или другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Однако, если вам нужны высокие гарантии доставки или возможность повторного воспроизведения данных (возможно, к нескольким источникам), Kafka может быть полезным архитектурным дополнением.

<Image img={observability_9} alt="Добавление kafka" size="md"/>

В этом случае можно настроить OTel агентов для отправки данных в Kafka через [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюзов, в свою очередь, потребляют сообщения, используя [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Мы рекомендуем ознакомиться с документацией Confluent и OTel для получения более подробной информации.
### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel коллектора будут зависеть от пропускной способности событий, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[На нашем опыте](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза с 3 ядрами и 12 ГБ ОЗУ может обрабатывать около 60k событий в секунду. Это предполагает минимальный конвейер обработки, отвечающий за переименование полей и без регулярных выражений.

Для экземпляров агентов, отвечающих за отправку событий в шлюз и только устанавливающих временную метку на событие, мы рекомендуем пользователям ориентироваться на предполагаемое количество журналов в секунду. Следующие показатели представляют собой приблизительные числа, которые пользователи могут использовать в качестве отправной точки:

| Частота журналирования | Ресурсы для коллектора агента |
|-----------------------|------------------------------|
| 1k/секунда           | 0.2 CPU, 0.2 GiB            |
| 5k/секунда           | 0.5 CPU, 0.5 GiB            |
| 10k/секунда          | 1 CPU, 1 GiB                |
