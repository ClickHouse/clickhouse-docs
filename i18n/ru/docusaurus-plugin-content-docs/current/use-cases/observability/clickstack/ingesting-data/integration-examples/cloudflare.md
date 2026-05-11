---
slug: /use-cases/observability/clickstack/integrations/cloudflare-logs
title: 'Мониторинг логов Cloudflare с помощью ClickStack'
sidebar_label: 'Логи Cloudflare'
pagination_prev: null
pagination_next: null
description: 'Передавайте данные Cloudflare Logpush в ClickStack с помощью ClickPipes для непрерывной ингестии логов из S3'
doc_type: 'guide'
keywords: ['Cloudflare', 'logs', 'ClickStack', 'ClickPipes', 'S3', 'HTTP', 'Logpush']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clickpipe_s3 from '@site/static/images/clickstack/cloudflare/clickpipe-s3.png';
import continuous_ingestion from '@site/static/images/clickstack/cloudflare/continuous-ingestion.png';
import parse_information from '@site/static/images/clickstack/cloudflare/parse-information.png';
import add_source from '@site/static/images/clickstack/cloudflare/add-source.png';
import configure_optional from '@site/static/images/clickstack/cloudflare/configure-optional-fields.png';
import save_source from '@site/static/images/clickstack/cloudflare/save-source.png';
import search_view from '@site/static/images/clickstack/cloudflare/search-view.png';
import log_view from '@site/static/images/clickstack/cloudflare/log-view.png';
import import_dashboard from '@site/static/images/clickstack/cloudflare/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudflare/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudflare/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Мониторинг логов Cloudflare с ClickStack \{#cloudflare-clickstack\}

:::note[Кратко]
В этом руководстве показано, как настроить приём логов Cloudflare в ClickStack с помощью ClickPipes. Cloudflare Logpush записывает логи в S3, а ClickPipes непрерывно загружает новые файлы в ClickHouse. В отличие от большинства руководств по интеграции ClickStack, где используется OpenTelemetry Collector, в этом руководстве [ClickPipes](/integrations/clickpipes) используется для прямого получения данных из S3.

Если вы хотите изучить панели мониторинга до настройки приёма данных в рабочей среде, доступен демонстрационный набор данных.
:::

## Обзор \{#overview\}

Cloudflare [Logpush](https://developers.cloudflare.com/logs/about/) экспортирует журналы HTTP-запросов в такие целевые системы, как Amazon S3. Перенаправление этих логов в ClickStack позволяет:

* Анализировать трафик на edge-узлах, производительность кэша и события безопасности вместе с другими данными обсервабилити
* Выполнять запросы к логам с помощью ClickHouse SQL
* Хранить логи дольше стандартного срока хранения в Cloudflare

В этом руководстве [ClickPipes](/integrations/clickpipes) используются для непрерывной ингестии файлов журналов Cloudflare из S3 в ClickHouse. S3 выступает как надёжный буфер между Cloudflare и ClickHouse, обеспечивая семантику exactly-once и возможность повторной обработки.

:::note[Альтернатива: прямая ингестия по HTTP]
Cloudflare Logpush также поддерживает прямую отправку логов в [HTTP-эндпоинты](https://developers.cloudflare.com/logs/get-started/enable-destinations/http/). Поскольку Cloudflare экспортирует логи в формате JSON с разделением по строкам (NDJSON), а ClickHouse изначально поддерживает этот формат через `JSONEachRow`, вы можете направить Logpush напрямую на HTTP-интерфейс ClickHouse Cloud, используя следующий формат URL эндпоинта:

```text
https://YOUR_CLICKHOUSE_HOST:8443/?query=INSERT+INTO+cloudflare_http_logs+FORMAT+JSONEachRow&header_Authorization=Basic+BASE64_CREDENTIALS
```

Замените `YOUR_CLICKHOUSE_HOST` на имя хоста ClickHouse Cloud, а `BASE64_CREDENTIALS` — на ваши учетные данные, закодированные в Base64 (`echo -n 'default:YOUR_PASSWORD' | base64`).

Этот вариант проще в настройке (не требуется настраивать S3, SQS или IAM), но Cloudflare Logpush [не может восстановить исторические данные](https://developers.cloudflare.com/logs/logpush/) в случае сбоя доставки — поэтому, если ClickHouse недоступен во время отправки, эти логи будут потеряны безвозвратно.
:::


## Интеграция с существующим Cloudflare Logpush \{#existing-cloudflare\}

В этом разделе предполагается, что Cloudflare Logpush уже настроен для экспорта логов в S3. Если нет, сначала воспользуйтесь [руководством Cloudflare по настройке AWS S3](https://developers.cloudflare.com/logs/get-started/enable-destinations/aws-s3/).

### Предварительные требования \{#prerequisites\}

* **Сервис ClickHouse Cloud** запущен (ClickPipes — функция только для Cloud и недоступна в ClickStack OSS)
* Cloudflare Logpush активно записывает логи в S3 бакет
* Имя S3 бакета и регион, в который Cloudflare записывает логи

<VerticalStepper headerLevel="h4">
  #### Настройка аутентификации S3

  ClickPipes требует разрешения на чтение из вашего S3 бакета. Следуйте руководству [Безопасный доступ к данным S3](/docs/cloud/data-sources/secure-s3), чтобы настроить доступ на основе роли IAM или доступ на основе учётных данных.

  Полные сведения об аутентификации и разрешениях ClickPipes S3 см. в [справочной документации по S3 ClickPipes](/docs/integrations/clickpipes/object-storage/s3/overview#access-control).

  #### Создание задания ClickPipes

  1. Консоль ClickHouse Cloud → **Источники данных** → **Создать ClickPipe**
  2. **Источник**: Amazon S3

  <Image img={clickpipe_s3} alt="ClickPipe S3" />

  **Подключение:**

  * **Путь к файлу S3**: Путь к бакету журналов Cloudflare с шаблоном подстановки для выбора файлов. Если вы включили в Logpush ежедневные вложенные папки, используйте `**`, чтобы охватить файлы во всех подкаталогах:
    * Без подпапок: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/*`
    * Подпапки по дням: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/**/*`
  * **Аутентификация**: выберите метод аутентификации и укажите учетные данные или ARN роли IAM

  **Настройки ингестии:**

  Нажмите **Incoming data**, затем настройте:

  * Включите **непрерывную ингестию**
  * **Сортировка**: Лексикографический порядок

  <Image img={continuous_ingestion} alt="Непрерывная ингестия" />

  Cloudflare Logpush записывает файлы с именами на основе даты (например, `20250127/...`), что обеспечивает естественный лексикографический порядок. ClickPipes проверяет наличие новых файлов каждые 30 секунд и принимает любой файл, имя которого лексикографически больше имени последнего обработанного файла.

  **Сопоставление схемы:**

  Нажмите **Parse information**. ClickPipes выполняет выборку из файлов журналов и автоматически определяет схему. Проверьте сопоставленные столбцы и при необходимости скорректируйте типы данных. Задайте **ключ сортировки** для целевой таблицы — для журналов Cloudflare хорошим вариантом будет `(EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)`.

  <Image img={parse_information} alt="Сведения о разборе" />

  Нажмите **Complete Setup**.

  :::note
  При первом создании ClickPipes выполняет начальную загрузку **всех существующих файлов** по указанному пути, после чего переключается в режим непрерывного опроса. Если ваш бакет содержит большой накопленный объём логов Cloudflare, начальная загрузка может занять некоторое время.
  :::

  #### Настройка источника данных HyperDX

  ClickPipes осуществляет приём логов Cloudflare в плоскую таблицу с нативными именами полей Cloudflare. Чтобы просматривать эти логи в HyperDX, настройте пользовательский источник данных, который сопоставляет столбцы Cloudflare с представлением логов HyperDX.

  1. Откройте HyperDX → **Настройки команды** → **Источники**

  <Image img={add_source} alt="Добавьте источник" />

  2. Нажмите **Add source** и задайте следующие параметры. Нажмите **Configure Optional Fields**, чтобы получить доступ ко всем полям:

  <Image img={configure_optional} alt="Необязательная настройка" />

  | Параметр                             | Значение                                                                                                                                                                                                                                                                                                          |
  | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Название**                         | `Cloudflare Logs`                                                                                                                                                                                                                                                                                                 |
  | **Тип исходных данных**              | Лог                                                                                                                                                                                                                                                                                                               |
  | **База данных**                      | `default`                                                                                                                                                                                                                                                                                                         |
  | **Таблица**                          | `cloudflare_http_logs`                                                                                                                                                                                                                                                                                            |
  | **Столбец с временной меткой**       | `toDateTime(EdgeStartTimestamp / 1000000000)`                                                                                                                                                                                                                                                                     |
  | **SELECT по умолчанию**              | `EdgeStartTimestamp, ClientRequestMethod, ClientRequestURI, EdgeResponseStatus, ClientCountry`                                                                                                                                                                                                                    |
  | **Выражение для имени сервиса**      | `'cloudflare'`                                                                                                                                                                                                                                                                                                    |
  | **Выражение для уровня логирования** | `multiIf(EdgeResponseStatus >= 500, 'ERROR', EdgeResponseStatus >= 400, 'WARN', 'INFO')`                                                                                                                                                                                                                          |
  | **Выражение для тела**               | `concat(ClientRequestMethod, ' ', ClientRequestURI, ' ', toString(EdgeResponseStatus))`                                                                                                                                                                                                                           |
  | **Выражение для атрибутов логов**    | `map('http.method', ClientRequestMethod, 'http.status_code', toString(EdgeResponseStatus), 'http.url', ClientRequestURI, 'client.country', ClientCountry, 'client.ip', ClientIP, 'cache.status', CacheCacheStatus, 'bot.score', toString(BotScore), 'cloudflare.ray_id', RayID, 'cloudflare.colo', EdgeColoCode)` |
  | **Выражение для атрибутов ресурса**  | `map('cloudflare.zone', ClientRequestHost)`                                                                                                                                                                                                                                                                       |
  | **Неявное выражение для столбца**    | `concat(ClientRequestMethod, ' ', ClientRequestURI)`                                                                                                                                                                                                                                                              |

  3. Нажмите **Save Source**

  <Image img={save_source} alt="Сохранить источник" />

  Это позволяет напрямую сопоставлять нативные столбцы Cloudflare с просмотрщиком журналов HyperDX без какого-либо преобразования или дублирования данных. В поле **Body** отображается сводка запроса, например `GET /api/v1/users 200`, а все поля Cloudflare доступны как атрибуты для поиска.

  #### Проверка данных в HyperDX

  Перейдите в представление **Search** и выберите источник **Cloudflare Logs**. Задайте временной диапазон, охватывающий ваши данные. Вы должны увидеть записи логов с:

  * Сводки запросов в столбце Body (например, `GET /api/v1/users 200`)
  * Уровни серьёзности с цветовой индикацией в зависимости от HTTP-статуса (INFO для 2xx, WARN для 4xx, ERROR для 5xx)
  * Атрибуты для поиска, такие как `http.status_code`, `client.country`, `cache.status` и `bot.score`

  <Image img={search_view} alt="Окно поиска" />

  <Image img={log_view} alt="Просмотр логов" />
</VerticalStepper>

## Демонстрационный набор данных

Для пользователей, которые хотят протестировать интеграцию перед настройкой рабочего Cloudflare Logpush, мы предоставляем пример набора данных с реалистичными журналами HTTP-запросов.

<VerticalStepper headerLevel="h4">
  #### Запустите ClickPipes с демонстрационным набором данных

  1. Консоль ClickHouse Cloud → **Data Sources** → **Create ClickPipe**
  2. **Источник**: Amazon S3
  3. **Аутентификация**: Public
  4. **Путь к файлу S3**: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/cloudflare/cloudflare-http-logs.json`
  5. Нажмите **Incoming data**
  6. Выберите **JSON** в качестве формата
  7. Нажмите **Parse information** и проверьте обнаруженную схему
  8. Укажите **Table name**: `cloudflare_http_logs`
  9. Нажмите **Complete Setup**

  Набор данных включает 5 000 записей журналов HTTP-запросов за 24 часа с реалистичными паттернами, включая трафик из нескольких стран, попадания и промахи кэша, запросы к API и статическим ресурсам, ответы с ошибками и события безопасности.

  #### Настройте источник данных HyperDX

  Следуйте [шагам настройки источника данных](#configure-source), чтобы создать источник HyperDX, указывающий на таблицу `cloudflare_http_logs`. Если вы уже настроили источник в разделе интеграции для production, этот шаг не требуется.

  #### Проверьте демонстрационные данные

  ```sql
  SELECT count() FROM cloudflare_http_logs;
  -- Должно вернуть 5000
  ```

  Перейдите в представление **Search** в HyperDX, выберите источник **Cloudflare Logs** и задайте временной диапазон **2026-02-23 00:00:00 - 2026-02-26 00:00:00**.

  Вы должны увидеть записи журналов со сводками по запросам, доступными для поиска атрибутами Cloudflare и уровнями серьёзности на основе кодов состояния HTTP.

  <Image img={search_view} alt="Представление Search" />

  <Image img={log_view} alt="Представление Log" />

  :::note[Отображение часового пояса]
  HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают диапазон **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные журналы независимо от вашего местоположения. После этого вы можете сузить диапазон до 24 часов для более наглядной визуализации.
  :::
</VerticalStepper>

## Панели мониторинга и визуализация

<VerticalStepper headerLevel="h4">
  #### <TrackedLink href={useBaseUrl('/examples/cloudflare-logs-dashboard.json')} download="cloudflare-logs-dashboard.json" eventName="docs.cloudflare_logs_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию панели мониторинга

  #### Импорт панели мониторинга

  1. HyperDX → **Dashboards** → **Import Dashboard**

  <Image img={import_dashboard} alt="Импорт панели мониторинга" />

  2. Загрузите `cloudflare-logs-dashboard.json` → **Finish Import**

  <Image img={finish_import} alt="Импорт панели мониторинга" />

  #### Просмотр панели мониторинга

  <Image img={example_dashboard} alt="Пример панели мониторинга" />

  :::note
  Для демонстрационного набора данных задайте временной диапазон **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)** (с поправкой на ваш местный часовой пояс). В импортированной панели мониторинга временной диапазон по умолчанию не задан.
  :::
</VerticalStepper>

## Устранение неполадок

### Данные не появляются в ClickHouse

Проверьте, что таблица создана и содержит данные:

```sql
SHOW TABLES FROM default LIKE 'cloudflare_http_logs';
SELECT count() FROM cloudflare_http_logs;
```

Если таблица существует, но пуста, проверьте наличие ошибок в ClickPipes: ClickHouse Cloud Console → **Data Sources** → ваш ClickPipe → **Logs**. Если возникают проблемы с аутентификацией при доступе к приватным бакетам, см. [документацию по управлению доступом для S3 ClickPipes](/docs/integrations/clickpipes/object-storage/s3/overview#access-control).


### Журналы не отображаются в HyperDX

Если данные есть в ClickHouse, но не видны в HyperDX, проверьте конфигурацию источника данных:

* Убедитесь, что для `cloudflare_http_logs` в HyperDX → **Team Settings** → **Sources** создан источник
* Убедитесь, что в поле **Timestamp Column** указано значение `toDateTime(EdgeStartTimestamp / 1000000000)` — временные метки Cloudflare заданы в наносекундах и должны быть преобразованы
* Убедитесь, что выбранный в HyperDX временной диапазон охватывает эти данные. Для демонстрационного набора данных используйте **2026-02-23 00:00:00 - 2026-02-26 00:00:00**

## Следующие шаги {#next-steps}

- Настройте [оповещения](/use-cases/observability/clickstack/alerts) для событий безопасности (блокировки WAF, всплески бот-трафика, пороговые значения уровня ошибок)
- Оптимизируйте [политики хранения](/use-cases/observability/clickstack/ttl) с учетом объема данных
- Создайте дополнительные панели мониторинга для конкретных сценариев использования (производительность API, оптимизация кэша, анализ географии трафика)

## Переход к production

В этом руководстве показано, как выполнять приём журналов Cloudflare с использованием общедоступного демонстрационного набора данных. Для production-развертываний настройте Cloudflare Logpush на запись в собственный S3 бакет и настройте ClickPipes с [аутентификацией на основе IAM-ролей](/docs/cloud/data-sources/secure-s3) для безопасного доступа. Выбирайте только те [поля Logpush](https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/zone/http_requests/), которые вам нужны, чтобы снизить затраты на хранение и объём ингестии. Включите в Logpush ежедневные подпапки для более удобной организации файлов и используйте `**/*` в шаблоне пути ClickPipes, чтобы сопоставлять файлы во всех подкаталогах.

Дополнительные параметры конфигурации, включая [неупорядоченную ингестию на основе SQS](/docs/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-any-order) для обработки дозагрузки исторических данных и файлов, поступающих не по порядку, см. в [документации по S3 ClickPipes](/docs/integrations/clickpipes/object-storage/s3/overview).