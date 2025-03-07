---
title: 'Интеграция OpenTelemetry'
description: 'Интеграция OpenTelemetry и ClickHouse для обеспеченности'
slug: /observability/integrating-opentelemetry
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
---
```

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';

# Интеграция OpenTelemetry для сбора данных

Любое решение по обеспечению требует средства для сбора и экспорта логов и трасс. Для этой цели ClickHouse рекомендует [проект OpenTelemetry (OTel)](https://opentelemetry.io/).

"OpenTelemetry — это фреймворк и набор инструментов для обеспечения, созданный для создания и управления телеметрическими данными, такими как трассы, метрики и логи."

В отличие от ClickHouse или Prometheus, OpenTelemetry не является бэкендом для обеспечения, а сосредоточен на создании, сборе, управлении и экспорте телеметрических данных. Хотя начальной целью OpenTelemetry было позволить пользователям легко инструментировать свои приложения или системы, используя конкретные языковые SDK, он расширился, чтобы включать сбор логов через коллектор OpenTelemetry — агент или прокси, который принимает, обрабатывает и экспортирует телеметрические данные.
## Важные компоненты ClickHouse {#clickhouse-relevant-components}

OpenTelemetry состоит из ряда компонентов. Кроме предоставления спецификации данных и API, стандартизированного протокола и наименований полей/колонок, OTel предоставляет две возможности, которые являются фундаментальными для создания решения по обеспечению с ClickHouse:

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) — это прокси, который принимает, обрабатывает и экспортирует телеметрические данные. Решение, основанное на ClickHouse, использует этот компонент как для сбора логов, так и для обработки событий перед пакетированием и вставкой.
- [Языковые SDK](https://opentelemetry.io/docs/languages/), которые реализуют спецификацию, API и экспорт телеметрических данных. Эти SDK эффективно обеспечивают правильную запись трасс в коде приложения, генерируя составные охваты и обеспечивая распространение контекста через метаданные — таким образом формируя распределенные трассы и обеспечивая связь охватов. Эти SDK дополняются экосистемой, которая автоматически реализует общие библиотеки и фреймворки, таким образом пользователь не обязан изменять свой код и получает готовую инструментовку.

Решение по обеспечению на базе ClickHouse использует оба этих инструмента.
## Дистрибуции {#distributions}

OpenTelemetry collector имеет [несколько дистрибуций](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file). Получатель filelog вместе с экспортёром ClickHouse, необходимый для решения ClickHouse, присутствует только в [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib).

Эта дистрибуция содержит множество компонентов и позволяет пользователям экспериментировать с различными конфигурациями. Однако при запуске в продакшене рекомендуется ограничить коллектор только теми компонентами, которые необходимы для окружающей среды. Некоторые причины для этого:

- Уменьшить размер коллектора, сокращая время развертывания.
- Улучшить безопасность коллектора, уменьшая доступную площадь атаки.

Создание [пользовательского коллектора](https://opentelemetry.io/docs/collector/custom-collector/) можно осуществить с помощью [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder).
## Сбор данных с OTel {#ingesting-data-with-otel}
### Роли развертывания коллектора {#collector-deployment-roles}

Для сбора логов и вставки их в ClickHouse мы рекомендуем использовать OpenTelemetry Collector. OpenTelemetry Collector может быть развернут в двух основных ролях:

- **Агент** — экземпляры агента собирают данные на краю, например, на серверах или на узлах Kubernetes, или получают события непосредственно от приложений — инструментированных с помощьюSDK OpenTelemetry. В последнем случае экземпляр агента работает с приложением или на том же хосте, что и приложение (например, как сайдкар или DaemonSet). Агенты могут отправлять свои данные напрямую в ClickHouse или на экземпляр шлюза. В первом случае это называется [шаблон развертывания агента](https://opentelemetry.io/docs/collector/deployment/agent/).
- **Шлюз** — экземпляры шлюзов обеспечивают независимый сервис (например, развертывание в Kubernetes), обычно по кластеру, по центру обработки данных или по региону. Эти экземпляры получают события от приложений (или других коллекторов как агенты) через одну конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов, с готовым балансировщиком нагрузки для распределения нагрузки между ними. Если все агенты и приложения отправляют свои сигналы на эту единую конечную точку, это часто называется [шаблоном развертывания шлюза](https://opentelemetry.io/docs/collector/deployment/gateway/).

Ниже мы предполагаем простой агент-коллектор, отправляющий свои события напрямую в ClickHouse. См. [Масштабирование с помощью шлюзов](#scaling-with-gateways) для получения дополнительных сведений о использовании шлюзов и когда они применимы.
### Сбор логов {#collecting-logs}

Основное преимущество использования коллектора заключается в том, что он позволяет вашим сервисам быстро разгружать данные, оставляя коллектору заботиться о дополнительной обработке, такой как повторные попытки, пакетирование, шифрование или даже фильтрация чувствительных данных.

Коллектор использует термины [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers), [processor](https://opentelemetry.io/docs/collector/configuration/#processors) и [exporter](https://opentelemetry.io/docs/collector/configuration/#exporters) для своих трех основных этапов обработки. Приемники используются для сбора данных и могут быть реализованы как по принципу Pull, так и Push. Процессоры предоставляют возможность выполнять преобразования и обогащение сообщений. Экспортёры отвечают за отправку данных в downstream-сервис. Хотя этот сервис теоретически может быть другим коллектором, мы предполагаем, что все данные отправляются напрямую в ClickHouse для первоначального обсуждения ниже.

<img src={observability_3}    
  class="image"
  alt="НУЖНО ALT"
  style={{width: '800px'}} />

<br />

Мы рекомендуем пользователям ознакомиться с полным набором приемников, процессоров и экспортёров.

Коллектор предоставляет два основных приемника для сбора логов:

**Через OTLP** — В этом случае логи отправляются (передаются) непосредственно к коллектору из OpenTelemetry SDK через протокол OTLP. [Демо OpenTelemetry](https://opentelemetry.io/docs/demo/) использует этот подход, при этом экспортёры OTLP для каждого языка предполагают конечную точку локального коллектора. Коллектор в этом случае должен быть настроен с приемником OTLP — смотрите выше [демо для конфигурации](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12). Преимущество этого подхода заключается в том, что данные логов будут автоматически содержать идентификаторы трасс, позволяя пользователям позже идентифицировать трассы для конкретного лога и наоборот.

<img src={observability_4}    
  class="image"
  alt="НУЖНО ALT"
  style={{width: '800px'}} />

<br />

Этот подход требует от пользователей инструментирования их кода с использованием [соответствующего языкового SDK](https://opentelemetry.io/docs/languages/).

- **Сканирование через приемник filelog** — Этот приемник отслеживает файлы на диске и формирует сообщения логов, отправляя их в ClickHouse. Этот приемник обрабатывает сложные задачи, такие как обнаружение многострочных сообщений, управление прокруткой логов, создание контрольных точек для надежности при перезапуске и извлечение структуры. Этот приемник также способен отслеживать логи контейнеров Docker и Kubernetes, развертываемый в качестве хелм-диаграммы, [извлекая структуру из них](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/) и обогащая их деталями пода.

<img src={observability_5}    
  class="image"
  alt="НУЖНО ALT"
  style={{width: '800px'}} />

<br />

**Большинство развертываний будут использовать комбинацию вышеуказанных приемников. Мы рекомендуем пользователям ознакомиться с [документацией коллектора](https://opentelemetry.io/docs/collector/) и ознакомиться с основными концепциями, наряду с [структурой конфигурации](https://opentelemetry.io/docs/collector/configuration/) и [методами установки](https://opentelemetry.io/docs/collector/installation/).**

:::note Совет: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/) полезен для проверки и визуализации конфигураций.
:::
## Структурированные против неструктурированных {#structured-vs-unstructured}

Логи могут быть структурированными или неструктурированными.

Структурированный лог будет использовать формат данных, такой как JSON, определяющий метаданные, такие как код http и адрес источника IP.

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

Неструктурированные логи, хотя и обычно имеющие некоторую внутреннюю структуру, извлекаемую через регулярные выражения, будут представлены в виде обычной строки.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

Мы рекомендуем пользователям использовать структурированное логирование и логировать в формате JSON (т.е. ndjson), когда это возможно. Это упростит требуемую обработку логов позже, либо перед отправкой в ClickHouse с помощью [процессоров Collector](https://opentelemetry.io/docs/collector/configuration/#processors), либо в момент вставки с использованием материальных представлений. Структурированные логи в конечном итоге сэкономят ресурсы на последующей обработке, уменьшая необходимую загрузку процессора в вашем решении ClickHouse.
### Пример {#example}

Для примера мы предоставляем набор данных с структурированным (JSON) и неструктурированным логированием, каждый из которых содержит примерно 10 млн строк, доступных по следующим ссылкам:

- [Неструктурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [Структурированные](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

Мы используем структурированный набор данных для примера ниже. Убедитесь, что этот файл загружен и извлечен, чтобы воспроизвести следующие примеры.

Следующее представляет собой простую конфигурацию для OTel Collector, который читает эти файлы на диске, используя приемник filelog, и выводит полученные сообщения в stdout. Мы используем оператор [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md), так как наши логи структурированы. Измените путь к файлу access-structured.log.

:::note Рассмотрите ClickHouse для разбора
Ниже приведенный пример извлекает временную метку из лога. Это требует использования оператора `json_parser`, который конвертирует всю строку лога в строку JSON, помещая результат в `LogAttributes`. Это может быть вычислительно затратным и [может быть выполнено более эффективно в ClickHouse](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql). Эквивалентный неструктурированный пример, который использует [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md) для достижения этого, можно найти [здесь](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==).
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

Пользователи могут следовать [официальным инструкциям](https://opentelemetry.io/docs/collector/installation/) для установки коллектора локально. Важно, чтобы инструкции были изменены для использования [дистрибуции contrib](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib) (которая содержит приемник `filelog`), например, вместо `otelcol_0.102.1_darwin_arm64.tar.gz` пользователи должны загрузить `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`. Релизы можно найти [здесь](https://github.com/open-telemetry/opentelemetry-collector-releases/releases).

После установки OTel Collector можно запустить с помощью следующих команд:

```bash
./otelcol-contrib --config config-logs.yaml
```

Предполагая использование структурированных логов, сообщения примут следующую форму на выводе:

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

Выше представлено одно сообщение лога, сгенерированное OTel collector. Мы импортируем эти же сообщения в ClickHouse в следующих разделах.

Полная схема сообщений логов, наряду с дополнительными колонками, которые могут присутствовать при использовании других приемников, поддерживается [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/). **Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.**

Ключевым моментом здесь является то, что сама строка лога хранится как строка внутри поля `Body`, но JSON был автоматически извлечен в поле Attributes благодаря `json_parser`. Тот же [оператор](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available) использовался для извлечения временной метки в соответствующий столбец `Timestamp`. Для рекомендаций по обработке логов с OTel смотрите [Обработка](#processing---filtering-transforming-and-enriching).

:::note Операторы
Операторы являются самой базовой единицей обработки логов. Каждый оператор выполняет одну функцию, такую как чтение строк из файла или парсинг JSON из поля. Операторы затем связываются вместе в конвейере для достижения желаемого результата.
:::

Вышеупомянутые сообщения не имеют поля `TraceID` или `SpanID`. Если они присутствуют, например в случаях, когда пользователи реализуют [распределенное трассирование](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces), их можно извлечь из JSON с использованием тех же техник, что и показано выше.

Для пользователей, которым необходимо собирать локальные или Kubernetes лог-файлы, мы рекомендуем ознакомиться с параметрами конфигурации, доступными для [приемника filelog](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration) и как [offsets](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) и [разбор многострочных логов обрабатывается](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing).
## Сбор логов Kubernetes {#collecting-kubernetes-logs}

Для сбора логов Kubernetes мы рекомендуем руководствоваться [документацией Open Telemetry](https://opentelemetry.io/docs/kubernetes/). Рекомендуется использовать [Kubernetes Attributes Processor](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor) для обогащения логов и метрик метаданными пода. Это может потенциально производить динамические метаданные, например, метки, хранящиеся в колонке `ResourceAttributes`. ClickHouse в настоящее время использует тип `Map(String, String)` для этой колонки. См. [Использование карт](/use-cases/observability/schema-design#using-maps) и [Извлечение из карт](/use-cases/observability/schema-design#extracting-from-maps) для получения дополнительных сведений об обработке и оптимизации этого типа.
## Сбор трасс {#collecting-traces}

Для пользователей, желающих инструментировать свой код и собирать трассы, мы рекомендуем следовать официальной [документации OTel](https://opentelemetry.io/docs/languages/).

Чтобы доставить события в ClickHouse, пользователям потребуется развернуть OTel collector для приема событий трассы по протоколу OTLP через соответствующий приемник. Демонстрация OpenTelemetry предоставляет [пример инструментирования каждого поддерживаемого языка](https://opentelemetry.io/docs/demo/) и отправки событий в коллектор. Пример соответствующей конфигурации коллектора, который выводит события в stdout, показан ниже:
### Пример {#example-1}

Поскольку трассы должны быть получены через OTLP, мы используем инструмент [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для генерации данных трасс. Следуйте инструкциям [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) для установки.

Следующая конфигурация получает события трассы на приемнике OTLP перед отправкой их в stdout.

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

Отправьте события трассы на коллектор через `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

Это приведет к получению сообщений трасс, подобных следующему примеру, на выводе:

```response
Span #86
	Trace ID   	: 1bb5cdd2c9df5f0da320ca22045c60d9
	Parent ID  	: ce129e5c2dd51378
	ID         	: fbb14077b5e149a0
	Name       	: okey-dokey-0
	Kind       	: Server
	Start time 	: 2024-06-19 18:03:41.603868 +0000 UTC
	End time   	: 2024-06-19 18:03:41.603991 +0000 UTC
	Status code	: Unset
	Status message :
Attributes:
 	-> net.peer.ip: Str(1.2.3.4)
 	-> peer.service: Str(telemetrygen-client)
```

Выше представлено одно сообщение трассы, сгенерированное OTel collector. Мы импортируем эти же сообщения в ClickHouse в следующих разделах.

Полная схема сообщений трасс поддерживается [здесь](https://opentelemetry.io/docs/concepts/signals/traces/). Мы настоятельно рекомендуем пользователям ознакомиться с этой схемой.
## Обработка - фильтрация, преобразование и обогащение {#processing---filtering-transforming-and-enriching}

Как показано в более раннем примере установки временной метки для события лога, пользователи в конечном счете захотят фильтровать, преобразовывать и обогащать сообщения событий. Это можно сделать с помощью ряда возможностей в Open Telemetry:

- **Процессоры** — Процессоры принимают данные, собранные [приемниками и модифицируют или преобразовывают](https://opentelemetry.io/docs/collector/transforming-telemetry/) их, прежде чем отправить их экспортёрам. Процессоры применяются в порядке, установленном в разделе `processors` конфигурации коллектора. Эти процессоры необязательны, но рекомендуется минимальный набор [обычно](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). При использовании OTel collector с ClickHouse мы рекомендуем ограничить процессоры:

    - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) используется для предотвращения ситуаций с недостатком памяти на коллекторе. См. [Оценка ресурсов](#estimating-resources) для рекомендаций.
    - Любой процессор, который выполняет обогащение на основе контекста. Например, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) позволяет автоматическую установку атрибутов ресурсов для охватов, метрик и логов с метаданными k8s, например, обогащение событий их идентификатором пода источника.
    - [Выборка с хвоста или головы](https://opentelemetry.io/docs/concepts/sampling/) при необходимости для трасс.
    - [Основная фильтрация](https://opentelemetry.io/docs/collector/transforming-telemetry/) — исчезновение событий, которые не требуются, если это нельзя сделать через оператор (см. ниже).
    - [Пакетирование](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) — необходимо при работе с ClickHouse, чтобы гарантировать, что данные отправляются пакетами. См. ["Экспорт в ClickHouse"](#exporting-to-clickhouse).

- **Операторы** — [Операторы](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) представляют собой самую базовую единицу обработки, доступную на приемнике. Поддерживается базовый парсинг, позволяя устанавливать такие поля, как Степень и Временная метка. Здесь поддерживается парсинг JSON и регулярных выражений, а также фильтрация событий и базовые преобразования. Мы рекомендуем выполнять фильтрацию событий здесь.

Мы рекомендуем пользователям избегать чрезмерной обработки событий с помощью операторов или [преобразовательных процессоров](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). Эти операции могут приводить к значительным затратам по памяти и загрузке процессора, особенно при парсинге JSON. Возможна вся обработка в ClickHouse в момент вставки с использованием материальных представлений и колонок с некоторыми исключениями — особенно, обогащение, требующее контекста, например, добавление метаданных k8s. Для получения более подробной информации смотрите [Извлечение структуры с помощью SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

Если обработка выполняется с помощью OTel collector, мы рекомендуем выполнять преобразования на экземплярах шлюзов и минимизировать любые работы на экземплярах агентов. Это обеспечит минимальные ресурсы, необходимые агентам на краю, работающим на серверах. Обычно мы видим, что пользователи выполняют только фильтрацию (для минимизации ненужного сетевого трафика), установку временной метки (через операторов) и обогащение, требующее контекста, на агентах. Например, если экземпляры шлюзов находятся в другом кластере Kubernetes, обогащение k8s должно происходить в агенте.
### Пример {#example-2}

Следующая конфигурация показывает сбор неструктурированного лог-файла. Обратите внимание на использование операторов для извлечения структуры из строк логов (`regex_parser`) и фильтрации событий, вместе с процессором для пакетирования событий и ограничения использования памяти.

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

Экспортеры отправляют данные в один или несколько бэкендов или назначений. Экспортеры могут быть основаны на методах "pull" или "push". Для отправки событий в ClickHouse пользователи должны использовать основанный на методе push [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md).

:::note Используйте OpenTelemetry Collector Contrib
Экспортер ClickHouse является частью [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main), а не основной дистрибуции. Пользователи могут либо использовать дистрибуцию contrib, либо [собрать свой собственный collector](https://opentelemetry.io/docs/collector/custom-collector/).
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

- **pipelines** - Вышеприведенная конфигурация подчеркивает использование [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines), состоящих из набора получателей, обработчиков и экспортеров для логов и трассировок.
- **endpoint** - Связь с ClickHouse настраивается с помощью параметра `endpoint`. Строка подключения `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1` создает соединение через TCP. Если пользователи предпочитают HTTP по причинам переключения трафика, измените эту строку подключения, как описано [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options). Полные детали соединения, с возможностью указания имени пользователя и пароля в этой строке подключения, описаны [здесь](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options).

**Важно:** Обратите внимание, что указанная выше строка подключения позволяет включить как сжатие (lz4), так и асинхронные вставки. Мы рекомендуем всегда включать оба. Смотрите [Batching](#batching) для получения дополнительной информации об асинхронных вставках. Сжатие всегда должно быть указано и не будет включено по умолчанию в более старых версиях экспортера.

- **ttl** - значение здесь определяет, как долго данные сохраняются. Дополнительные детали приведены в "Управление данными". Это должно быть указано в виде единицы времени в часах, например, 72h. В примере ниже мы отключаем TTL, поскольку наши данные из 2019 года будут немедленно удалены ClickHouse, если будут вставлены. 
- **traces_table_name** и **logs_table_name** - определяют имя таблицы логов и трассировок.
- **create_schema** - определяет, создаются ли таблицы с использованием схем по умолчанию при запуске. По умолчанию установлено значение true для удобства начала работы. Пользователи должны установить это значение в false и определить свою собственную схему.
- **database** - целевая база данных.
- **retry_on_failure** - настройки для определения, должны ли неудачные партии повторяться.
- **batch** - обработчик пакетов гарантирует, что события отправляются пакетами. Мы рекомендуем значение около 5000 с тайм-аутом 5s. То, что будет достигнуто первым, инициирует сброс пакета в экспортер. Понижение этих значений приведет к меньшей задержке в конвейере, с данными, доступными для запросов быстрее, за счет большего количества соединений и пакетов, отправленных в ClickHouse. Это не рекомендуется, если пользователи не используют [асинхронные вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), так как это может вызвать проблемы с [слишком большим количеством частей](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) в ClickHouse. Напротив, если пользователи используют асинхронные вставки, доступность данных для запросов также будет зависеть от настроек асинхронной вставки - хотя данные все равно будут сброшены из коннектора быстрее. Смотрите [Batching](#batching) для получения дополнительной информации.
- **sending_queue** - контролирует размер очереди отправки. Каждый элемент в очереди содержит пакет. Если эта очередь превышается, например, из-за недоступности ClickHouse, но события продолжают приходить, пакеты будут отброшены. 

Предполагая, что пользователи извлекли структурированный лог-файл и у них есть [локальный экземпляр ClickHouse](/install), запущенный (с аутентификацией по умолчанию), пользователи могут запустить эту конфигурацию с помощью команды:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

Чтобы отправить трассировочные данные в этот коллектор, выполните следующую команду, используя инструмент `telemetrygen`:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

После запуска подтвердите наличие событий в логах с помощью простого запроса:

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:     	0
SeverityText:
SeverityNumber: 	0
ServiceName:
Body:           	{"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:	{}
LogAttributes:  	{'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.


Аналогично, для событий трассировок пользователи могут проверить таблицу `otel_traces`:

```sql
SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:      	2024-06-20 11:36:41.181398000
TraceId:        	00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:         	beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:       	lets-go
SpanKind:       	SPAN_KIND_CLIENT
ServiceName:    	telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:      	telemetrygen
ScopeVersion:
SpanAttributes: 	{'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:       	123000
StatusCode:     	STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:    	[]
Events.Attributes:  []
Links.TraceId:  	[]
Links.SpanId:   	[]
Links.TraceState:   []
Links.Attributes:   []
```
## Схема по умолчанию {#out-of-the-box-schema}

По умолчанию экспортер ClickHouse создает целевую таблицу логов как для логов, так и для трассировок. Это можно отключить с помощью настройки `create_schema`. Кроме того, имена для таблиц логов и трассировок можно изменить с их значений по умолчанию `otel_logs` и `otel_traces` с помощью вышеупомянутых настроек.

:::note 
В следующих схемах мы предполагаем, что TTL включен на уровне 72h.
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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

Колонки здесь соответствуют официальной спецификации OTel для логов, документированной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).

Несколько важных заметок о данной схеме:

- По умолчанию таблица разделена по дате через `PARTITION BY toDate(Timestamp)`. Это делает эффективным удаление данных, которые истекли.
- TTL устанавливается через `TTL toDateTime(Timestamp) + toIntervalDay(3)` и соответствует значению, установленному в конфигурации коллектора. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) означает, что только целые части удаляются, когда все содержащиеся строки истекли. Это более эффективно, чем удаление строк внутри частей, что влечет за собой дорогую операцию удаления. Мы рекомендуем всегда устанавливать это значение. Смотрите [Управление данными с TTL](/observability/managing-data#data-management-with-ttl-time-to-live) для получения дополнительной информации.
- Таблица использует классический [`MergeTree` engine](/engines/table-engines/mergetree-family/mergetree). Это рекомендуется для логов и трассировок и, вероятно, не потребует изменений.
- Таблица упорядочена по `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`. Это означает, что запросы будут оптимизированы для фильтров по `ServiceName`, `SeverityText`, `Timestamp` и `TraceId` - более ранние столбцы в списке будут фильтроваться быстрее, чем более поздние, например, фильтрация по `ServiceName` будет значительно быстрее, чем фильтрация по `TraceId`. Пользователи должны изменить этот порядок в соответствии с ожидаемыми шаблонами доступа - смотрите [Выбор первичного ключа](/use-cases/observability/schema-design#choosing-a-primary-ordering-key).
- Указанная выше схема применяет `ZSTD(1)` к колонкам. Это предлагает лучшее сжатие для логов. Пользователи могут увеличить уровень сжатия ZSTD (выше значения по умолчанию 1) для лучшего сжатия, хотя это редко бывает выгодно. Увеличение этого значения приведет к большей нагрузке на процессор во время вставки (при сжатии), хотя время декомпрессии (а значит, и запросов) должно оставаться сопоставимым. Смотрите [здесь](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для получения дополнительных сведений. Кроме того, к временной метке применяется [delta encoding](/sql-reference/statements/create/table#delta) с целью уменьшить ее размер на диске.
- Обратите внимание, как [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes) и [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope) являются картами. Пользователи должны ознакомиться с разницей между этими типами. Для получения информации о том, как получить доступ к этим картам и оптимизировать доступ к ключам внутри них, смотрите [Использование карт](/use-cases/observability/integrating-opentelemetry.md). 
- Большинство других типов, таких как `ServiceName` как LowCardinality, оптимизированы. Обратите внимание, что тело, хотя и является JSON в наших примерах логов, хранится как строка.
- Фильтры Блума применяются к ключам и значениям карт, а также к колонке Body. Они направлены на улучшение времени запросов к этим колонкам, но обычно не являются обязательными. Смотрите [Вторичные/Индексы для пропуска данных](/use-cases/observability/schema-design#secondarydata-skipping-indices).

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

Вновь эта схема будет соответствовать колонкам, соответствующим официальной спецификации OTel для трассировок, документированной [здесь](https://opentelemetry.io/docs/specs/otel/trace/api/). Схема содержит многие из тех же настроек, что и вышеописанная схема для логов, с дополнительными колонками Links, специфичными для спанов.

Мы рекомендуем пользователям отключить автоматическое создание схемы и создать свои таблицы вручную. Это позволяет изменить первичные и вторичные ключи, а также предоставляет возможность ввести дополнительные колонки для оптимизации производительности запросов. Для получения дополнительной информации смотрите [Дизайн схемы](/use-cases/observability/schema-design).
## Оптимизация вставок {#optimizing-inserts}

Для достижения высокой производительности вставок при получении строгих гарантий согласованности пользователи должны придерживаться простых правил при вставке данных наблюдаемости в ClickHouse через коллектор. С правильной конфигурацией OTel collector следующие правила обычно легко соблюсти. Это также позволяет избежать [распространенных проблем](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), с которыми пользователи сталкиваются при первом использовании ClickHouse.
### Пакетирование {#batching}

По умолчанию каждая вставка, отправленная в ClickHouse, заставляет ClickHouse немедленно создавать часть хранилища, содержащую данные вставки вместе с другой метаданными, которые необходимо сохранить. Поэтому отправка меньшего количества вставок, каждая из которых содержит больше данных, по сравнению с отправкой большего количества вставок, каждая из которых содержит меньше данных, уменьшит количество необходимых записей. Мы рекомендуем вставлять данные в достаточно большие пакеты по крайней мере по 1000 строк за раз. Дополнительные сведения [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance). 

По умолчанию вставки в ClickHouse являются синхронными и идемпотентными, если идентичны. Для таблиц семейства движков merge tree ClickHouse по умолчанию автоматически [удаляет дубликаты вставок](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). Это означает, что вставки допускаются в случаях, подобных следующим:

- (1) Если узел, получающий данные, имеет проблемы, запрос на вставку истечет (или получит более конкретную ошибку) и не получит подтверждения.
- (2) Если данные записаны узлом, но подтверждение не может быть возвращено отправителю запроса из-за сетевых нарушений, отправитель либо получит тайм-аут, либо сетевую ошибку. 
  
С точки зрения коллектора, (1) и (2) могут быть трудно различимы. Однако в обоих случаях неподтвержденную вставку можно немедленно повторить. При условии, что повторяемый запрос на вставку содержит одни и те же данные в том же порядке, ClickHouse автоматически проигнорирует повторяемую вставку, если (неподтвержденная) оригинальная вставка была успешной.

Мы рекомендуем пользователям использовать [обработчик пакетов](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md), показанный в ранее упомянутых конфигурациях, чтобы удовлетворить вышеупомянутое. Это гарантирует, что вставки отправляются как последовательные пакеты строк, удовлетворяющие данным требованиям. Если ожидается, что коллектор будет иметь высокую пропускную способность (событий в секунду), и по меньшей мере 5000 событий могут быть отправлены в каждой вставке, это обычно единственное пакетирование, необходимое в конвейере. В этом случае коллектор будет сбрасывать пакеты до того, как истечет `timeout` обработчика пакетов, обеспечивая низкую задержку конца в конце конвейера и согласованный размер пакетов.
### Используйте асинхронные вставки {#use-asynchronous-inserts}

Обычно пользователи вынуждены отправлять меньшие партии, когда пропускная способность коллектора низкая, и все же ожидают, что данные достигнут ClickHouse в пределах минимальной задержки. В этом случае отправляются небольшие пакеты, когда истекает `timeout` обработчика пакетов. Это может вызвать проблемы, и именно тогда требуются асинхронные вставки. Этот случай обычно возникает, когда **коллекторы в роли агента настраиваются для отправки напрямую в ClickHouse**. Шлюзы, действуя как агрегаторы, могут смягчить эту проблему - смотрите [Масштабирование с помощью шлюзов](#scaling-with-gateways).

Если большие пакеты не могут быть гарантированы, пользователи могут делегировать пакетирование ClickHouse с использованием [Асинхронных вставок](/cloud/bestpractices/asynchronous-inserts). С асинхронными вставками данные сначала вставляются в буфер, а затем записываются в хранилище базы данных позже или асинхронно соответственно.

<img src={observability_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

При [включенных асинхронных вставках](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), когда ClickHouse ① получает запрос на вставку, данные запроса ② немедленно записываются в буфер в памяти. Когда ③ происходит следующий сброс буфера, данные буфера [сортируются](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) и записываются как часть в хранилище базы данных. Обратите внимание, что данные не могут быть доступны для запросов до того, как они будут сброшены в хранилище базы данных; сброс буфера [конфигурируется](/optimize/asynchronous-inserts).

Чтобы включить асинхронные вставки для коллектора, добавьте `async_insert=1` в строку подключения. Мы рекомендуем пользователям использовать `wait_for_async_insert=1` (по умолчанию) для гарантии доставки - смотрите [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) для получении дополнительных сведений.

Данные из асинхронной вставки вставляются, как только буфер ClickHouse сброшен. Это происходит либо после превышения [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size), либо после [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) миллисекунд с момента первого запроса INSERT. Если `async_insert_stale_timeout_ms` установлен на значение, отличное от нуля, данные вставляются после `async_insert_stale_timeout_ms milliseconds` с момента последнего запроса. Пользователи могут настроить эти параметры для контроля задержки конца в конце своего конвейера. Дополнительные параметры, которые можно использовать для настройки сброса буфера, документированы [здесь](/operations/settings/settings#async_insert). Как правило, значения по умолчанию подходят.

:::note Учитывайте адаптивные асинхронные вставки
В случаях, когда используется небольшое количество агентов с низкой пропускной способностью, но строгими требованиями к задержке конца в конце, [адаптивные асинхронные вставки](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) могут быть полезны. Обычно они не применимы к случаям наблюдаемости с высокой пропускной способностью, как это видно с ClickHouse.
:::

Наконец, предыдущее поведение удаления дубликатов, связанное с синхронными вставками в ClickHouse, по умолчанию не включается при использовании асинхронных вставок. Если это требуется, смотрите настройку [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Полные детали по настройке этой функции можно найти [здесь](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), с углубленным изучением [здесь](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).
## Архитектуры развертывания {#deployment-architectures}

Существует несколько возможных архитектур развертывания при использовании OTel коллектора с ClickHouse. Мы описываем каждую из них ниже и когда они могут быть применены.
### Только агенты {#agents-only}

В архитектуре только агентов пользователи развертывают OTel collector в качестве агентов на краю. Эти агенты получают трассировки от локальных приложений (например, в качестве контейнера sidecar) и собирают логи с серверов и узлов Kubernetes. В этом режиме агенты отправляют свои данные напрямую в ClickHouse.

<img src={observability_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

Эта архитектура подходит для малых и средних развертываний. Ее основное преимущество заключается в том, что она не требует дополнительных аппаратных средств и удерживает общий ресурсный след решения наблюдаемости ClickHouse на минимальном уровне, с простым соответствием между приложениями и коллекторами. 

Пользователи должны рассмотреть возможность перехода на архитектуру на основе шлюзов, как только количество агентов превысит несколько сотен. Эта архитектура имеет несколько недостатков, которые затрудняют масштабирование:

- **Масштабирование подключений** - Каждый агент будет устанавливать соединение с ClickHouse. Хотя ClickHouse способен поддерживать сотни (если не тысячи) одновременных подключений для вставки, это в конечном итоге станет ограничивающим фактором и снизит эффективность вставок - то есть ClickHouse будет использовать больше ресурсов на поддержание соединений. Использование шлюзов минимизирует количество соединений и делает вставки более эффективными.
- **Обработка на краю** - Любые преобразования или обработка событий должны выполняться на краю или в ClickHouse в этой архитектуре. Это, наряду с тем, что это ограничительно, может означать сложные материализованные представления ClickHouse или перенесение значительных вычислений на край - где критические службы могут пострадать, а ресурсы могут быть ограничены.
- **Малые пакеты и задержки** - Коллекторы-агенты могут собирать очень немного событий. Обычно это означает, что их необходимо настраивать для сброса с установленным интервалом, чтобы удовлетворять SLA доставки. Это может привести к тому, что коллектор будет отправлять небольшие пакеты в ClickHouse. Хотя это является недостатком, это можно смягчить с помощью асинхронных вставок - смотрите [Оптимизация вставок](#optimizing-inserts).
### Масштабирование с помощью шлюзов {#scaling-with-gateways}

OTel collectors могут быть развернуты в качестве экземпляров шлюзов для решения вышеупомянутых ограничений. Они предоставляют автономный сервис, обычно для каждого дата-центра или региона. Эти экземпляры принимают события от приложений (или других коллекторов в роли агента) через единую конечную точку OTLP. Обычно развертывается набор экземпляров шлюзов, с предустановленным балансировщиком нагрузки, используемым для распределения нагрузки между ними.

<img src={observability_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Цель данной архитектуры состоит в том, чтобы разгрузить ресурсоемкие вычисления от агентов, тем самым минимизируя их использование ресурсов. Эти шлюзы могут выполнять задачи преобразования, которые иначе имели бы место выполняться агентами. Более того, агрегируя события от многих агентов, шлюзы могут гарантировать, что крупные партии будут отправлены в ClickHouse, что позволяет эффективно вставлять данные. Эти коллекторы шлюза могут легко масштабироваться по мере добавления новых агентов и увеличения пропускной способности событий. Пример конфигурации шлюза с ассоциированной конфигурацией агента, обрабатывающего пример структурированного лог-файла, показан ниже. Обратите внимание на использование OTLP для связи между агентом и шлюзом.

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
      address: 0.0.0.0:9888 # Изменено, так как 2 коллектора работают на одном хосте
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

Основным недостатком этой архитектуры является связанная с ней стоимость и накладные расходы на управление набором коллекторов. 

Для примера управления более крупными архитектурами, основанными на шлюзах, вместе с получением связанных знаний, мы рекомендуем этот [блог](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog).
### Добавление Kafka {#adding-kafka}

Читатели могут заметить, что вышеупомянутые архитектуры не используют Kafka в качестве очереди сообщений. 

Использование очереди Kafka в качестве буфера сообщений является популярным шаблоном проектирования, наблюдаемым в архитектурах логирования, и был популяризирован стеком ELK. Он предоставляет несколько преимуществ; в первую очередь, он помогает обеспечить более сильные гарантии доставки сообщений и помогает справляться с обратным давлением. Сообщения отправляются от агентов сбора в Kafka и записываются на диск. Теоретически кластерный экземпляр Kafka должен обеспечивать высокую пропускную способность буфера сообщений, поскольку он требует меньше вычислительных ресурсов для записи данных линейно на диск, чем для разбора и обработки сообщения – в Elastic, например, токенизация и индексация требуют значительных ресурсов. Перемещая данные от агентов, вы также снижаете риск потери сообщений в результате ротации логов на источнике. Наконец, это предоставляет некоторые возможности для повторной доставки сообщений и репликации между регионами, что может быть привлекательно для некоторых случаев использования.

Однако ClickHouse может быстро обрабатывать вставку данных – миллионы строк в секунду на умеренном оборудовании. Обратное давление от ClickHouse – **редкость**. Часто использование очереди Kafka означает большую архитектурную сложность и затраты. Если вы можете принять принцип, что логи не нуждаются в таких же гарантиях доставки, как банковские транзакции и другие критически важные данные, мы рекомендуем избегать сложности Kafka.

Однако, если вам требуются высокие гарантии доставки или возможность воспроизведения данных (возможно, на несколько источников), Kafka может быть полезным архитектурным дополнением.

<img src={observability_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

В этом случае агенты OTel могут быть настроены на отправку данных в Kafka через [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Экземпляры шлюзов, в свою очередь, обрабатывают сообщения с помощью [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). Мы рекомендуем обратиться к документации Confluent и OTel для получения дополнительных деталей.
### Оценка ресурсов {#estimating-resources}

Требования к ресурсам для OTel collector будут зависеть от пропускной способности событий, размера сообщений и объема выполняемой обработки. Проект OpenTelemetry поддерживает [бенчмарки](https://opentelemetry.io/docs/collector/benchmarks/), которые пользователи могут использовать для оценки требований к ресурсам.

[По нашему опыту](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), экземпляр шлюза с 3 ядрами и 12 ГБ оперативной памяти может обрабатывать около 60 000 событий в секунду. Это предполагает минимальный процессинговый конвейер, ответственный за переименование полей, и отсутствие регулярных выражений. 

Для экземпляров агентов, отвечающих за отправку событий в шлюз и устанавливающих только временную метку события, мы рекомендуем пользователям рассчитывать ресурсы на основе предполагаемого количества логов в секунду. Следующие представляют собой приблизительные числа, которые пользователи могут использовать как отправную точку:

Скорость логирования
Ресурсы для коллектора агента	
1k/секунда
0.2CPU, 0.2GiB	
5k/секунда
0.5 CPU, 0.5GiB	
10k/секунда
1 CPU, 1GiB	

| Скорость логирования | Ресурсы для коллектора агента |
|--------------|------------------------------|
| 1k/секунда    | 0.2CPU, 0.2GiB              |
| 5k/секунда    | 0.5 CPU, 0.5GiB             |
| 10k/секунда   | 1 CPU, 1GiB                 |
