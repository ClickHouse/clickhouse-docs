---
sidebar_label: 'BigQuery в ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'Пользователи могут загружать данные из BigQuery в ClickHouse с помощью шаблона Google Dataflow'
title: 'Шаблон Dataflow BigQuery в ClickHouse'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Шаблон Dataflow BigQuery в ClickHouse

Шаблон BigQuery в ClickHouse представляет собой пакетный конвейер, который загружает данные из таблицы BigQuery в таблицу ClickHouse. Шаблон может читать либо всю таблицу, либо конкретные записи с использованием заданного запроса.

<TOCInline toc={toc}></TOCInline>

## Требования к конвейеру {#pipeline-requirements}

* Исходная таблица BigQuery должна существовать.
* Целевая таблица ClickHouse должна существовать.
* Хост ClickHouse должен быть доступен с машин рабочего процесса Dataflow.

## Параметры шаблона {#template-parameters}

<br/>
<br/>

| Название параметра        | Описание параметра                                                                                                                                                                                                                                                                                                                             | Обязательно | Заметки                                                                                                                                                                                                                                                           |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`                 | JDBC URL ClickHouse в формате `jdbc:clickhouse://<host>:<port>/<schema>`.                                                                                                                                                                                                                                                                       | ✅           | Не добавляйте имя пользователя и пароль в качестве параметров JDBC. Любой другой параметр JDBC можно добавить в конце URL JDBC. Для пользователей ClickHouse Cloud добавьте `ssl=true&sslmode=NONE` к `jdbcUrl`.                                                                  |
| `clickHouseUsername`      | Имя пользователя ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                 | ✅           |                                                                                                                                                                                                                                                                   |
| `clickHousePassword`      | Пароль ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                         | ✅           |                                                                                                                                                                                                                                                                   |
| `clickHouseTable`         | Название целевой таблицы ClickHouse, в которую будут вставляться данные.                                                                                                                                                                                                                                                                         | ✅           |                                                                                                                                                                                                                                                                   |
| `maxInsertBlockSize`      | Максимальный размер блока для вставки, если мы контролируем создание блоков для вставки (опция ClickHouseIO).                                                                                                                                                                                                                                   |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                           |
| `insertDistributedSync`   | Если параметр включен, запрос вставки в распределенной таблице ожидает, пока данные будут отправлены на все узлы в кластере (опция ClickHouseIO).                                                                                                                                                                                                  |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                           |
| `insertQuorum`            | Для запросов INSERT в реплицированной таблице ожидает записи для указанного числа реплик и линейно добавляет данные. 0 - отключено.                                                                                                                                                                                                             |             | Опция `ClickHouseIO`. Этот параметр отключен в настройках сервера по умолчанию.                                                                                                                                                                                 |
| `insertDeduplicate`       | Для запросов INSERT в реплицированной таблице указывает, что должна быть выполнена дедупликация вставляемых блоков.                                                                                                                                                                                                                            |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                           |
| `maxRetries`              | Максимальное количество попыток для каждой вставки.                                                                                                                                                                                                                                                                                               |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                           |
| `InputTableSpec`          | Таблица BigQuery для чтения. Укажите либо `inputTableSpec`, либо `query`. Когда оба установлены, параметр `query` имеет приоритет. Пример: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                    |             | Читает данные напрямую из хранилища BigQuery, используя [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage). Обратите внимание на [ограничения API чтения хранилища](https://cloud.google.com/bigquery/docs/reference/storage#limitations). |
| `outputDeadletterTable`   | Таблица BigQuery для сообщений, которые не смогли достичь выходной таблицы. Если таблица не существует, она создается во время выполнения конвейера. Если не указано, используется `<outputTableSpec>_error_records`. Например, `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                               |             |                                                                                                                                                                                                                                                                   |
| `query`                   | SQL запрос для чтения данных из BigQuery. Если набор данных BigQuery находится в другом проекте, чем задание Dataflow, укажите полное имя набора данных в SQL запросе, например: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. По умолчанию используется [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql), если `useLegacySql` не истинно.                        |             | Необходимо указать либо `inputTableSpec`, либо `query`. Если установить оба параметра, шаблон использует параметр `query`. Пример: `SELECT * FROM sampledb.sample_table`.                                                                                        |
| `useLegacySql`            | Установите в `true`, чтобы использовать устаревший SQL. Этот параметр применяется только при использовании параметра `query`. По умолчанию `false`.                                                                                                                                                                                              |             |                                                                                                                                                                                                                                                                   |
| `queryLocation`           | Необходимо при чтении из авторизованного представления без разрешения на доступ к базовой таблице. Например, `US`.                                                                                                                                                                                                                              |             |                                                                                                                                                                                                                                                                   |
| `queryTempDataset`        | Укажите существующий набор данных для создания временной таблицы для сохранения результатов запроса. Например, `temp_dataset`.                                                                                                                                                                                                                    |             |                                                                                                                                                                                                                                                                   |
| `KMSEncryptionKey`        | Если чтение из BigQuery осуществляется с использованием источника запроса, используйте этот ключ Cloud KMS для шифрования любых временных таблиц, созданных в процессе. Например, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                 |             |                                                                                                                                                                                                                                                                   |


:::note
Все значения по умолчанию для параметров `ClickHouseIO` можно найти в [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)
:::

## Схема исходных и целевых таблиц {#source-and-target-tables-schema}

Для эффективной загрузки набора данных BigQuery в ClickHouse проводятся процесс инфестации колонок с
следующими фазами:

1. Шаблоны создают объект схемы на основе целевой таблицы ClickHouse.
2. Шаблоны проходят по набору данных BigQuery и пытаются сопоставить колонки на основе их имен.

<br/>

:::important
При этом ваш набор данных BigQuery (либо таблица, либо запрос) должен иметь точно такие же имена колонок, как и ваша
целевой таблицы ClickHouse.
:::

## Привязка типов данных {#data-types-mapping}

Типы BigQuery преобразуются на основе определения вашей таблицы ClickHouse. Следовательно, приведенная выше таблица перечисляет
рекомендуемую привязку, которую вы должны иметь в вашей целевой таблице ClickHouse (для данной таблицы/запроса BigQuery):

| Тип BigQuery                                                                                                          | Тип ClickHouse                                                 | Заметки                                                                                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Массив**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                  | [**Массив**](../../../sql-reference/data-types/array)       | Внутренний тип должен быть одним из поддерживаемых примитивных типов данных, перечисленных в этой таблице.                                                                                                                                                                                                                                                                                                                                        |
| [**Булевый тип**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)            | [**Булевый тип**](../../../sql-reference/data-types/boolean) |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Дата**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                    | [**Дата**](../../../sql-reference/data-types/date)          |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Дата и время**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)         | [**Дата и время**](../../../sql-reference/data-types/datetime) | Работает также с `Enum8`, `Enum16` и `FixedString`.                                                                                                                                                                                                                                                                                                                                                                |
| [**Строка**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)                  | [**Строка**](../../../sql-reference/data-types/string)      | В BigQuery все целые типы (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Рекомендуем установить в ClickHouse правильный размер целого числа, так как шаблон будет преобразовывать колонку на основе определенного типа колонки (`Int8`, `Int16`, `Int32`, `Int64`).                                                                                                 |
| [**Целочисленные типы**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)     | [**Целочисленные типы**](../../../sql-reference/data-types/int-uint) | В BigQuery все целые типы (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Рекомендуем установить в ClickHouse правильный размер целого числа, так как шаблон будет преобразовывать колонку на основе определенного типа колонки (`Int8`, `Int16`, `Int32`, `Int64`). Шаблон также будет преобразовывать необозначенные целые типы, если они используются в таблице ClickHouse (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Типы с плавающей запятой**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Типы с плавающей запятой**](../../../sql-reference/data-types/float) | Поддерживаемые типы ClickHouse: `Float32` и `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## Запуск шаблона {#running-the-template}

Шаблон BigQuery в ClickHouse доступен для выполнения через Google Cloud CLI.

:::note
Обязательно ознакомьтесь с этим документом, а особенно с вышеупомянутыми разделами, чтобы полностью понять требования к конфигурации и предварительные условия шаблона.

:::

### Установка и настройка `gcloud` CLI {#install--configure-gcloud-cli}

- Если еще не установлено, установите [`gcloud` CLI](https://cloud.google.com/sdk/docs/install).
- Следуйте разделу `Перед тем как начать`
  в [этом руководстве](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin), чтобы настроить необходимые конфигурации, настройки и разрешения для запуска шаблона DataFlow.

### Команда запуска {#run-command}

Используйте команду [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) для запуска задания Dataflow, использующего гибкий шаблон.

Ниже приведен пример команды:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<id таблицы bigquery>",jdbcUrl="jdbc:clickhouse://<хост clickhouse>:<порт clickhouse>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<имя пользователя>",clickHousePassword="<пароль>",clickHouseTable="<целевая таблица clickhouse>"
```

### Разбор команды {#command-breakdown}

- **Имя задания:** Текст, следующий за ключевым словом `run`, является уникальным именем задания.
- **Файл шаблона:** JSON-файл, указанный с помощью `--template-file-gcs-location`, определяет структуру шаблона и детали о принимаемых параметрах. Указанный путь к файлу является публичным и готовым к использованию.
- **Параметры:** Параметры разделяются запятыми. Для параметров на основе строк значения оборачиваются в двойные кавычки.

### Ожидаемый ответ {#expected-response}

После выполнения команды вы должны увидеть ответ, похожий на следующий:

```bash
job:
  createTime: '2025-01-26T14:34:04.608442Z'
  currentStateTime: '1970-01-01T00:00:00Z'
  id: 2025-01-26_06_34_03-13881126003586053150
  location: us-central1
  name: bigquery-clickhouse-dataflow-20250126-153400
  projectId: ch-integrations
  startTime: '2025-01-26T14:34:04.608442Z'
```

### Мониторинг задания {#monitor-the-job}

Перейдите на вкладку [Jobs в Dataflow](https://console.cloud.google.com/dataflow/jobs) в вашей консоли Google Cloud, чтобы контролировать статус задания. Вы найдете детали задания, включая прогресс и любые ошибки:

<Image img={dataflow_inqueue_job} size="lg" border alt="Консоль DataFlow, показывающая запущенное задание BigQuery в ClickHouse" />

## Устранение неполадок {#troubleshooting}

### Код: 241. DB::Exception: Превышен лимит памяти (всего) {#code-241-dbexception-memory-limit-total-exceeded}

Эта ошибка возникает, когда ClickHouse исчерпывает память при обработке больших партий данных. Чтобы устранить эту проблему:

* Увеличьте ресурсы экземпляра: обновите сервер ClickHouse до более крупного экземпляра с большим объемом памяти, чтобы справиться с нагрузкой обработки данных.
* Уменьшите размер партии: отрегулируйте размер партии в конфигурации задания Dataflow, чтобы отправлять меньшие объемы данных в ClickHouse, уменьшая потребление памяти на партию.
Эти изменения могут помочь сбалансировать использование ресурсов во время приема данных.

## Исходный код шаблона {#template-source-code}

Исходный код шаблона доступен в форке ClickHouse [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates)
