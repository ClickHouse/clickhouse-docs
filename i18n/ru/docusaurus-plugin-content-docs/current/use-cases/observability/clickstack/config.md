---
slug: /use-cases/observability/clickstack/config
title: 'Параметры конфигурации'
pagination_prev: null
pagination_next: null
description: 'Параметры конфигурации ClickStack — обсервабилити-стека на базе ClickHouse'
keywords: ['конфигурация ClickStack', 'конфигурация обсервабилити', 'параметры HyperDX', 'конфигурация коллектора', 'переменные окружения']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';
import highlighted_attributes_config from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-config.png';
import highlighted_attributes from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes.png';
import highlighted_attributes_search from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-search.png';

Доступны следующие параметры конфигурации для каждого компонента ClickStack:


## Настройки для дистрибутивов с открытым исходным кодом \{#modifying-settings\}

### Docker \{#docker\}

Если вы используете [All in One](/use-cases/observability/clickstack/deployment/all-in-one), [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) или [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only), просто передайте нужный параметр через переменную окружения, например:

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```


### Docker Compose \{#docker-compose\}

Если вы используете руководство по развертыванию [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose), файл [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) можно использовать для изменения настроек.

Или явно переопределите настройки в файле [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml), например:

Пример:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... other settings
```


### Helm \{#helm\}

#### Настройка значений (необязательно) \{#customizing-values\}

При желании вы можете настраивать параметры с помощью флагов `--set`, например:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 \
  --set replicaCount=2 \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.requests.memory=256Mi \
  --set ingress.enabled=true \
  --set ingress.annotations."kubernetes\.io/ingress\.class"=nginx \
  --set ingress.hosts[0].host=hyperdx.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=ImplementationSpecific \
  --set env[0].name=CLICKHOUSE_USER \
  --set env[0].value=abc
```

Также можно отредактировать `values.yaml`. Чтобы вывести значения по умолчанию:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

Пример конфигурации:

```yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: hyperdx.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  env:
    - name: CLICKHOUSE_USER
      value: abc
```


## Приложение ClickStack UI (HyperDX) \{#hyperdx\}

### Настройки источника данных \{#datasource-settings\}

В интерфейсе ClickStack пользователь должен задать источник для каждого из типов/столпов данных обсервабилити:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

Эта конфигурация выполняется внутри приложения в разделе `Team Settings -> Sources`, как показано ниже для логов:

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

Каждый из этих источников требует как минимум одну таблицу, указанную при создании, и набор столбцов, которые позволяют HyperDX выполнять запросы к данным.

Если используется [стандартная схема OpenTelemetry (OTel)](/observability/integrating-opentelemetry#out-of-the-box-schema), поставляемая с ClickStack, эти столбцы могут быть автоматически определены для каждого из источников. При [изменении схемы](#clickhouse) или использовании пользовательской схемы пользователи должны указывать и обновлять эти соответствия.

:::note
Стандартная схема для ClickHouse, поставляемая с ClickStack, — это схема, создаваемая [ClickHouse exporter для OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). Эти имена столбцов коррелируют с официальной спецификацией OTel, задокументированной [здесь](https://opentelemetry.io/docs/specs/otel/logs/data-model/).
:::

Для каждого источника доступны следующие настройки:

#### Логи \{#logs\}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | Имя источника.                                                                                                          | Yes      | No                          | –                                                   |
| `Server Connection`           | Имя серверного подключения.                                                                                             | Yes      | No                          | `Default`                                           |
| `Database`                    | Имя базы данных ClickHouse.                                                                                             | Yes      | Yes                         | `default`                                           |
| `Table`                       | Имя целевой таблицы. Укажите `otel_logs`, если используется схема по умолчанию.                                        | Yes      | No                          |                                                     |
| `Timestamp Column`            | Столбец или выражение типа DateTime, входящее в состав первичного ключа.                                               | Yes      | Yes                         | `TimestampTime`                                     |
| `Default Select`              | Столбцы, отображаемые в результатах поиска по умолчанию.                                                                | Yes      | Yes                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body` |
| `Service Name Expression`     | Выражение или столбец для имени сервиса.                                                                                | Yes      | Yes                         | `ServiceName`                                       |
| `Log Level Expression`        | Выражение или столбец для уровня логов.                                                                                 | Yes      | Yes                         | `SeverityText`                                      |
| `Body Expression`             | Выражение или столбец для текста сообщения лога.                                                                        | Yes      | Yes                         | `Body`                                              |
| `Log Attributes Expression`   | Выражение или столбец для пользовательских атрибутов логов.                                                             | Yes      | Yes                         | `LogAttributes`                                     |
| `Resource Attributes Expression` | Выражение или столбец для атрибутов на уровне ресурса.                                                               | Yes      | Yes                         | `ResourceAttributes`                                |
| `Displayed Timestamp Column`  | Столбец отметки времени, используемый для отображения в интерфейсе.                                                     | Yes      | Yes                         | `ResourceAttributes`                                |
| `Correlated Metric Source`    | Коррелированный источник метрик (например, метрики HyperDX).                                                            | No       | No                          | –                                                   |
| `Correlated Trace Source`     | Коррелированный источник трейсов (например, трейсы HyperDX).                                                            | No       | No                          | –                                                   |
| `Trace Id Expression`         | Выражение или столбец, используемые для извлечения идентификатора трейса.                                               | Yes      | Yes                         | `TraceId`                                           |
| `Span Id Expression`          | Выражение или столбец, используемые для извлечения идентификатора спана.                                                | Yes      | Yes                         | `SpanId`                                            |
| `Implicit Column Expression`  | Столбец, используемый для полнотекстового поиска, если поле не указано (в стиле Lucene). Обычно это текст лога.        | Yes      | Yes                         | `Body`                                              |
| `Highlighted Attributes`      | Выражения или столбцы, отображаемые при открытии подробностей лога. Выражения, возвращающие URL, будут отображаться как ссылки. | No        | No                          | –                                                   |
| `Highlighted Trace Attributes` | Выражения или столбцы, извлекаемые из каждого лога в трейсе и отображаемые над «водопадом» трейса. Выражения, возвращающие URL, будут отображаться как ссылки. | No  | No   | –                                                  |

#### Трейсы \{#traces\}

| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | Имя источника.                                                                                                         | Yes      | No                          | –                      |
| `Server Connection`              | Имя подключения к серверу.                                                                                             | Yes      | No                          | `Default`              |
| `Database`                       | Имя базы данных ClickHouse.                                                                                            | Yes      | Yes                         | `default`                |
| `Table`                          | Имя целевой таблицы. Укажите `otel_traces`, если используется схема по умолчанию.                                      | Yes      | Yes                         | –                      |
| `Timestamp Column`               | Столбец или выражение типа DateTime, входящее в состав вашего первичного ключа.                                        | Yes      | Yes                         | `Timestamp`              |
| `Timestamp`                      | Псевдоним для `Timestamp Column`.                                                                                      | Yes      | Yes                         | `Timestamp`              |
| `Default Select`                 | Столбцы, отображаемые в результатах поиска по умолчанию.                                                               | Yes      | Yes                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`            | Выражение для вычисления длительности спана.                                                                           | Yes      | Yes                         | `Duration`               |
| `Duration Precision`             | Точность выражения длительности (например, наносекунды, микросекунды).                                                 | Yes      | Yes                         | ns                     |
| `Trace Id Expression`            | Выражение или столбец для идентификаторов трейсов.                                                                     | Yes      | Yes                         | `TraceId`                |
| `Span Id Expression`             | Выражение или столбец для идентификаторов спанов.                                                                      | Yes      | Yes                         | `SpanId`                 |
| `Parent Span Id Expression`      | Выражение или столбец для идентификаторов родительских спанов.                                                         | Yes      | Yes                         | `ParentSpanId`           |
| `Span Name Expression`           | Выражение или столбец для имён спанов.                                                                                 | Yes      | Yes                         | `SpanName`               |
| `Span Kind Expression`           | Выражение или столбец для типа спана (например, client, server).                                                       | Yes      | Yes                         | `SpanKind`               |
| `Correlated Log Source`          | Необязательный параметр. Связанный источник логов (например, логи HyperDX).                                            | No       | No                          | –                      |
| `Correlated Session Source`      | Необязательный параметр. Связанный источник сессий.                                                                    | No       | No                          | –                      |
| `Correlated Metric Source`       | Необязательный параметр. Связанный источник метрик (например, метрики HyperDX).                                        | No       | No                          | –                      |
| `Status Code Expression`         | Выражение для кода статуса спана.                                                                                      | Yes      | Yes                         | `StatusCode`             |
| `Status Message Expression`      | Выражение для сообщения статуса спана.                                                                                 | Yes      | Yes                         | `StatusMessage`          |
| `Service Name Expression`        | Выражение или столбец для имени сервиса.                                                                               | Yes      | Yes                         | `ServiceName`            |
| `Resource Attributes Expression` | Выражение или столбец для атрибутов на уровне ресурса.                                                                 | Yes      | Yes                         | `ResourceAttributes`     |
| `Event Attributes Expression`    | Выражение или столбец для атрибутов событий.                                                                           | Yes      | Yes                         | `SpanAttributes`         |
| `Span Events Expression`         | Выражение для извлечения событий спана. Обычно это столбец типа `Nested`. Это позволяет отображать стек вызовов исключений для поддерживаемых языковых SDKS. | Yes      | Yes                         | `Events`                 |
| `Implicit Column Expression`     | Столбец, используемый для полнотекстового поиска, если поле не указано (в стиле Lucene). Обычно это тело лога.        | Yes      | Yes                         | `SpanName`|
| `Highlighted Attributes`         | Выражения или столбцы, отображаемые при открытии деталей спана. Выражения, возвращающие URL, будут показаны как ссылки. | No       | No                          |  –                       |
| `Highlighted Trace Attributes`   | Выражения или столбцы, извлекаемые из каждого спана в трейсе и отображаемые над водопадной диаграммой трейса. Выражения, возвращающие URL, будут показаны как ссылки. | No  | No   |  –                       |

#### Метрики \{#metrics\}

| Setting               | Description                                                                                   | Required | Inferred in Default Schema | Inferred Value              |
|------------------------|-----------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`                 | Имя источника.                                                                                | Yes      | No                          | –                           |
| `Server Connection`    | Имя подключения к серверу.                                                                    | Yes      | No                          | `Default`                   |
| `Database`             | Имя базы данных ClickHouse.                                                                   | Yes      | Yes                         | `default`                   |
| `Gauge Table`          | Таблица для хранения метрик типа gauge.                                                       | Yes      | No                          | `otel_metrics_gauge`        |
| `Histogram Table`      | Таблица для хранения метрик типа histogram.                                                   | Yes      | No                          | `otel_metrics_histogram`    |
| `Sum Table`            | Таблица для хранения метрик типа sum (counter).                                               | Yes      | No                          | `otel_metrics_sum`          |
| `Correlated Log Source`| Необязательное поле. Связанный источник логов (например, логи HyperDX).                      | No       | No                          | –                           |

#### Сессии \{#settings\}

| Setting                        | Description                                                                                         | Required | Inferred in Default Schema | Inferred Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                        | Имя источника.                                                                                      | Yes      | No                          | –                      |
| `Server Connection`           | Имя подключения к серверу.                                                                          | Yes      | No                          | `Default`              |
| `Database`                    | Имя базы данных ClickHouse.                                                                         | Yes      | Yes                         | `default`              |
| `Table`                       | Целевая таблица для данных сессий. Имя целевой таблицы. Установите `hyperdx_sessions`, если используете схему по умолчанию. | Yes      | Yes                         | -                      |
| `Timestamp Column`            | Столбец или выражение с типом DateTime, которое является частью вашего первичного ключа.            | Yes      | Yes                         | `TimestampTime`        |
| `Log Attributes Expression`   | Выражение для извлечения атрибутов уровня логов из данных сессий.                                  | Yes      | Yes                         | `LogAttributes`        |
| `LogAttributes`               | Псевдоним или ссылка на поле, используемые для хранения атрибутов логов.                           | Yes      | Yes                         | `LogAttributes`        |
| `Resource Attributes Expression` | Выражение для извлечения метаданных на уровне ресурса.                                          | Yes      | Yes                         | `ResourceAttributes`   |
| `Correlated Trace Source`     | Необязательно. Связанный источник трассировок для корреляции сессий.                               | No       | No                          | –                      |
| `Implicit Column Expression`  | Столбец, используемый для полнотекстового поиска, когда поле не указано (например, при разборе запросов в стиле Lucene). | Yes      | Yes                         | `Body` |

#### Выделенные атрибуты \{#highlighted-attributes\}

Выделенные атрибуты и выделенные атрибуты трейсов могут быть настроены для источников данных логов и трейсов.

- Выделенные атрибуты — это столбцы или выражения, которые отображаются для каждого лога или спана при просмотре деталей лога или спана.
- Выделенные атрибуты трейсов — это столбцы или выражения, которые выбираются для каждого лога или спана в трейсе и отображаются над «водопадом» трейса (trace waterfall).

Эти атрибуты определяются в конфигурации источника и могут быть произвольными SQL-выражениями. Если SQL-выражение возвращает значение в формате URL, атрибут будет отображён как ссылка. Пустые значения не отображаются.

Например, этот источник трейсов был настроен с выделенным атрибутом и выделенным атрибутом трейса:

<Image img={highlighted_attributes_config} alt="Конфигурация выделенных атрибутов" size="md"/>

Эти атрибуты отображаются в боковой панели после щелчка по логу или спану:

<Image img={highlighted_attributes} alt="Выделенные атрибуты" size="md"/>

При щелчке по атрибуту отображаются варианты использования атрибута в качестве значения поиска. Если в конфигурации атрибута указано необязательное выражение Lucene, то для поиска будет использовано выражение Lucene вместо SQL-выражения.

<Image img={highlighted_attributes_search} alt="Поиск по выделенным атрибутам" size="md"/>

### Коррелированные источники \{#correlated-sources\}

Чтобы включить полную межисточниковую корреляцию в ClickStack, необходимо настроить коррелированные источники для логов, трейсов, метрик и сессий. Это позволяет HyperDX соотносить взаимосвязанные данные и предоставлять расширенный контекст при отображении событий.

- `Logs`: Можно коррелировать с трейсами и метриками.
- `Traces`: Можно коррелировать с логами, сессиями и метриками.
- `Metrics`: Можно коррелировать с логами.
- `Sessions`: Можно коррелировать с трейсами.

Настройка этих корреляций активирует несколько возможностей. Например, HyperDX может отображать соответствующие логи рядом с трейсом или показывать аномалии метрик, связанные с сессией.

Ниже, например, показан источник Logs, настроенный с коррелированными источниками:

<Image img={hyperdx_26} alt="Коррелированный источник HyperDX" size="md"/>

### Параметры конфигурации приложения \{#application-configuration-settings\}

:::note HyperDX in ClickHouse Cloud
Эти параметры нельзя изменять, если HyperDX управляется в ClickHouse Cloud.
:::

* `HYPERDX_API_KEY`
  * **По умолчанию:** отсутствует (обязательный параметр)
  * **Описание:** Ключ аутентификации для HyperDX API.
  * **Рекомендации:**
  * Обязателен для телеметрии и логов
  * В локальной среде разработки значение может быть любым, но непустым
  * В производственной среде используйте безопасный, уникальный ключ
  * Можно получить на странице настроек команды после создания аккаунта

* `HYPERDX_LOG_LEVEL`
  * **По умолчанию:** `info`
  * **Описание:** Устанавливает уровень детализации логирования.
  * **Варианты:** `debug`, `info`, `warn`, `error`
  * **Рекомендации:**
  * Используйте `debug` для детальной диагностики
  * Используйте `info` для штатной работы
  * Используйте `warn` или `error` в продуктивной среде, чтобы уменьшить объём логов

* `HYPERDX_API_PORT`
  * **По умолчанию:** `8000`
  * **Описание:** Порт API-сервера HyperDX.
  * **Рекомендации:**
  * Убедитесь, что этот порт доступен на вашем хосте.
  * Измените его, если возникает конфликт портов.
  * Он должен совпадать с портом в конфигурациях вашего API‑клиента.

* `HYPERDX_APP_PORT`
  * **По умолчанию:** `8000`
  * **Описание:** Порт фронтенд-приложения HyperDX.
  * **Рекомендации:**
  * Убедитесь, что этот порт доступен на вашем хосте
  * Измените его, если этот порт уже используется (конфликт портов)
  * Он должен быть доступен из вашего браузера

* `HYPERDX_APP_URL`
  * **По умолчанию:** `http://localhost`
  * **Описание:** Базовый URL-адрес фронтенд-приложения.
  * **Рекомендации:**
  * Укажите свой домен в продакшене
  * Обязательно укажите протокол (http/https)
  * Не добавляйте завершающий слэш

* `MONGO_URI`
  * **По умолчанию:** `mongodb://db:27017/hyperdx`
  * **Описание:** Строка подключения к MongoDB.
  * **Рекомендации:**
  * Используйте значение по умолчанию для локальной разработки с Docker
  * В производственной среде используйте безопасную строку подключения
  * Включите аутентификацию, если требуется
  * Пример: `mongodb://user:pass@host:port/db`

* `MINER_API_URL`
  * **По умолчанию:** `http://miner:5123`
  * **Описание:** URL службы поиска шаблонов в логах.
  * **Рекомендации:**
  * Используйте значение по умолчанию для локальной разработки в Docker
  * Укажите URL вашей службы miner в продакшене
  * Должен быть доступен из службы API

* `FRONTEND_URL`
  * **По умолчанию:** `http://localhost:3000`
  * **Описание:** URL фронтенд-приложения.
  * **Рекомендации:**
  * Используйте значение по умолчанию для локальной разработки
  * В рабочей (production) среде укажите ваш домен
  * Должен быть доступен сервису API

* `OTEL_SERVICE_NAME`
  * **По умолчанию:** `hdx-oss-api`
  * **Описание:** Имя сервиса для инструментирования OpenTelemetry.
  * **Рекомендации:**
  * Используйте информативное имя для сервиса HyperDX. Применимо, если HyperDX инструментирует сам себя.
  * Помогает идентифицировать сервис HyperDX в телеметрических данных

* `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  * **По умолчанию:** `http://localhost:4318`
  * **Описание:** endpoint коллектора OpenTelemetry.
  * **Рекомендации:**
  * Применяется при самоинструментировании HyperDX.
  * Используйте значение по умолчанию для локальной разработки.
  * В продакшене укажите URL вашего коллектора.
  * Должен быть доступен для вашего сервиса HyperDX.

* `USAGE_STATS_ENABLED`
  * **По умолчанию:** `true`
  * **Описание:** Включает или отключает сбор статистики использования.
  * **Рекомендации:**
  * Установите `false`, чтобы отключить сбор статистики использования
  * Полезно для развертываний с повышенными требованиями к конфиденциальности
  * Значение по умолчанию — `true`, чтобы улучшать продукт

* `IS_OSS`
  * **По умолчанию:** `true`
  * **Описание:** Указывает, работает ли в режиме OSS.
  * **Рекомендации:**
  * Оставьте `true` для open-source-развертываний
  * Установите `false` для enterprise-развертываний
  * Влияет на доступность возможностей

* `IS_LOCAL_MODE`
  * **По умолчанию:** `false`
  * **Описание:** Определяет, работает ли приложение в локальном режиме.
  * **Рекомендации:**
  * Установите значение `true` для локальной разработки
  * Отключает некоторые функции продакшена
  * Полезен для тестирования и разработки

* `EXPRESS_SESSION_SECRET`
  * **По умолчанию:** `hyperdx is cool 👋`
  * **Описание:** Секретный ключ для управления сессиями Express.
  * **Рекомендации:**
  * Обязательно измените в продакшене
  * Используйте длинную, случайную строку
  * Храните секретный ключ в надёжно защищённом месте

* `ENABLE_SWAGGER`
  * **По умолчанию:** `false`
  * **Описание:** Включает или отключает документацию Swagger API.
  * **Рекомендации:**
  * Установите в `true`, чтобы включить документацию API
  * Полезно для разработки и тестирования
  * Следует отключить в продакшене

* `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  * **По умолчанию:** `false`
  * **Описание:** Включает бета-поддержку типа JSON в HyperDX. См. также [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) для включения поддержки JSON в OTel collector.
  * **Рекомендации:**
    * Включает **бета-функцию**. `schema` с типом JSON **не рекомендуются** для типичных рабочих нагрузок обсервабилити. См. [Map vs JSON type](/use-cases/observability/clickstack/ingesting-data/schema/map-vs-json), чтобы ознакомиться со сравнением и понять, в каких случаях подходит каждый из вариантов.
    * Установите значение `true`, чтобы включить поддержку JSON в ClickStack.

## OpenTelemetry collector \{#otel-collector\}

См. раздел [&quot;ClickStack OpenTelemetry Collector&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector) для получения дополнительных сведений.

* `CLICKHOUSE_ENDPOINT`
  * **По умолчанию:** *Нет (обязательно)* для автономного образа. Для дистрибутивов All-in-one или Docker Compose это значение указывает на встроенный экземпляр ClickHouse.
  * **Описание:** HTTPS URL экземпляра ClickHouse, в который экспортируются телеметрические данные.
  * **Рекомендации:**
    * Должен быть полным HTTPS-эндпоинтом, включая порт (например, `https://clickhouse.example.com:8443`)
    * Необходим для того, чтобы коллектор мог отправлять данные в ClickHouse

* `CLICKHOUSE_USER`
  * **По умолчанию:** `default`
  * **Описание:** Имя пользователя, используемое для аутентификации в экземпляре ClickHouse.
  * **Рекомендации:**
    * Убедитесь, что у пользователя есть привилегии `INSERT` и `CREATE TABLE`
    * Рекомендуется создать выделенного пользователя для ингестии

* `CLICKHOUSE_PASSWORD`
  * **По умолчанию:** *Нет (обязательно, если аутентификация включена)*
  * **Описание:** Пароль указанного пользователя ClickHouse.
  * **Рекомендации:**
    * Обязателен, если для учётной записи пользователя задан пароль
    * В продакшн-средах храните пароль безопасно через secrets

* `HYPERDX_LOG_LEVEL`
  * **По умолчанию:** `info`
  * **Описание:** Уровень подробности логирования для коллектора.
  * **Рекомендации:**
    * Принимает значения, такие как `debug`, `info`, `warn`, `error`
    * Используйте `debug` при устранении неполадок

* `OPAMP_SERVER_URL`
  * **По умолчанию:** *Нет (обязательно)* для автономного образа. Для дистрибутивов All-in-one или Docker Compose это значение указывает на развернутый экземпляр HyperDX.
  * **Описание:** URL сервера OpAMP, используемого для управления коллектором (например, экземпляром HyperDX). По умолчанию используется порт `4320`.
  * **Рекомендации:**
    * Должен указывать на ваш экземпляр HyperDX
    * Включает динамическую конфигурацию и безопасную ингестию
    * Если не указан, безопасная ингестия отключена, если только не задано значение `OTLP_AUTH_TOKEN`.

* `OTLP_AUTH_TOKEN`
  * **По умолчанию:** *Нет*. Используется только для автономного образа.
  * **Описание:** Позволяет задать токен аутентификации OTLP. Если задан, всё взаимодействие требует этот bearer-токен.
  * **Рекомендации:**
    * Рекомендуется при использовании автономного образа коллектора в продакшене.

* `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  * **По умолчанию:** `default`
  * **Описание:** База данных ClickHouse, в которую коллектор записывает телеметрические данные.
  * **Рекомендации:**
    * Установите, если используется нестандартное имя базы данных
    * Убедитесь, что указанный пользователь имеет доступ к этой базе данных

* `OTEL_AGENT_FEATURE_GATE_ARG`
  * **По умолчанию:** `<empty string>`
  * **Описание:** Включает флаг возможностей в коллекторе. Если задано значение `--feature-gates=clickhouse.json`, включает бета-поддержку типа JSON в коллекторе, обеспечивая создание схем с этим типом. См. также [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) для включения поддержки JSON в HyperDX.
  * **Рекомендации:**
    * Включает **бета-функцию**. Схемы с типом JSON **не рекомендуются** для типичных рабочих нагрузок обсервабилити. Сравнение и рекомендации по выбору см. в разделе [Map vs JSON type](/use-cases/observability/clickstack/ingesting-data/schema/map-vs-json).
    * Установите `--feature-gates=clickhouse.json`, чтобы создавать новые таблицы с использованием типа JSON.

## ClickHouse \{#clickhouse\}

ClickStack Open Source поставляется с конфигурацией ClickHouse по умолчанию, рассчитанной на многотерабайтный масштаб, но пользователи могут свободно изменять и оптимизировать её в соответствии со своей нагрузкой.

Чтобы эффективно настраивать ClickHouse, важно понимать ключевые концепции хранения данных, такие как [parts](/parts), [partitions](/partitions), [shards and replicas](/shards) и то, как выполняются [merges](/merges) при вставке данных. Мы рекомендуем ознакомиться с основами [primary indices](/primary-indexes), [sparse secondary indices](/optimize/skipping-indexes) и индексов пропуска данных (data skipping), а также с техниками [managing data lifecycle](/observability/managing-data), например использованием TTL для управления жизненным циклом данных.

ClickStack поддерживает [schema customization](/use-cases/observability/schema-design) — вы можете изменять типы столбцов, извлекать новые поля (например, из логов), применять кодеки и словари и ускорять запросы с помощью проекций (projections).

Дополнительно, materialized views можно использовать для [transform or filter data during ingestion](/use-cases/observability/schema-design#materialized-columns) — трансформации или фильтрации данных в процессе ингестии — при условии, что данные записываются в исходную таблицу представления, а приложение читает из целевой таблицы. Materialized views также можно использовать для [accelerate queries natively](/use-cases/observability/clickstack/materialized_views) — нативного ускорения запросов — в ClickStack.

Для получения более подробной информации обратитесь к документации ClickHouse по проектированию схем, стратегиям индексирования и лучшим практикам управления данными — большинство из них напрямую применимы к развертываниям ClickStack.