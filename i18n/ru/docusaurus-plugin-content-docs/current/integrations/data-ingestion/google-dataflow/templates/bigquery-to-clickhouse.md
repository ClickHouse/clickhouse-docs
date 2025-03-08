---
sidebar_label: BigQuery в ClickHouse
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: Пользователи могут загружать данные из BigQuery в ClickHouse, используя шаблон Google Dataflow
---

import TOCInline from '@theme/TOCInline';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Шаблон Dataflow BigQuery в ClickHouse

Шаблон BigQuery в ClickHouse — это пакетный конвейер, который загружает данные из таблицы BigQuery в таблицу ClickHouse. Шаблон может прочитать либо всю таблицу, либо конкретные записи с использованием предоставленного запроса.

<TOCInline toc={toc}></TOCInline>

## Требования к конвейеру {#pipeline-requirements}

* Исходная таблица BigQuery должна существовать.
* Целевая таблица ClickHouse должна существовать.
* Хост ClickHouse должен быть доступен из машин рабочего процесса Dataflow.

## Параметры шаблона {#template-parameters}

<br/>
<br/>

| Название параметра          | Описание параметра                                                                                                                                                                                                                                                                                                                              | Обязательно | Примечания                                                                                                                                                                                                                                                            |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`                   | JDBC URL ClickHouse в формате `jdbc:clickhouse://<host>:<port>/<schema>`.                                                                                                                                                                                                                                                                  | ✅           | Не добавляйте имя пользователя и пароль в качестве параметров JDBC. Другие параметры JDBC можно добавить в конце JDBC URL. Для пользователей ClickHouse Cloud добавьте `ssl=true&sslmode=NONE` к `jdbcUrl`.                                                                  |
| `clickHouseUsername`        | Имя пользователя ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                      | ✅           |                                                                                                                                                                                                                                                                          |
| `clickHousePassword`        | Пароль ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                      | ✅           |                                                                                                                                                                                                                                                                          |
| `clickHouseTable`           | Имя целевой таблицы ClickHouse для вставки данных.                                                                                                                                                                                                                                                                                            | ✅           |                                                                                                                                                                                                                                                                          |
| `maxInsertBlockSize`        | Максимальный размер блока для вставки, если мы контролируем создание блоков для вставки (опция ClickHouseIO).                                                                                                                                                                                                                                    |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                                 |
| `insertDistributedSync`     | Если настройка включена, запрос на вставку в распределенную таблицу ожидает, пока данные будут отправлены на все узлы кластера. (опция ClickHouseIO).                                                                                                                                                                                                                 |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                                 |
| `insertQuorum`              | Для запросов INSERT в реплицированной таблице дождитесь записи для заданного количества реплик и линейзируйте добавление данных. 0 - отключено.                                                                                                                                                                                                |             | Опция `ClickHouseIO`. Эта настройка выключена в настройках сервера по умолчанию.                                                                                                                                                                                    |
| `insertDeduplicate`         | Для запросов INSERT в реплицированной таблице указывает, что необходимо выполнить дедупликацию вставляемых блоков.                                                                                                                                                                                                                                  |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                                 |
| `maxRetries`                | Максимальное количество повторных попыток для каждой вставки.                                                                                                                                                                                                                                                                                                              |             | Опция `ClickHouseIO`.                                                                                                                                                                                                                                                 |
| `InputTableSpec`            | Таблица BigQuery для чтения. Укажите либо `inputTableSpec`, либо `query`. Если заданы оба, приоритет имеет параметр `query`. Пример: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                |             | Читает данные напрямую из хранилища BigQuery, используя [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage). Обратите внимание на [ограничения Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage#limitations). |
| `outputDeadletterTable`     | Таблица BigQuery для сообщений, которые не смогли достичь выходной таблицы. Если таблица не существует, она создается во время выполнения конвейера. Если не указано, используется `<outputTableSpec>_error_records`. Например, `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                                              |             |                                                                                                                                                                                                                                                                          |
| `query`                     | SQL запрос для чтения данных из BigQuery. Если набор данных BigQuery находится в другом проекте, чем работа Dataflow, укажите полное имя набора данных в SQL запросе, например: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. По умолчанию используется [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql), если `useLegacySql` не истинно. |             | Вы должны указать либо `inputTableSpec`, либо `query`. Если заданы оба параметра, шаблон использует параметр `query`. Пример: `SELECT * FROM sampledb.sample_table`.                                                                                        |
| `useLegacySql`              | Установите в `true`, чтобы использовать устаревший SQL. Этот параметр применяется только при использовании параметра `query`. По умолчанию `false`.                                                                                                                                                                                                                                |             |                                                                                                                                                                                                                                                                          |
| `queryLocation`             | Необходимо при чтении из авторизованного представления без разрешения на доступ к исходной таблице. Например, `US`.                                                                                                                                                                                                                                          |             |                                                                                                                                                                                                                                                                          |
| `queryTempDataset`          | Установите существующий набор данных для создания временной таблицы для хранения результатов запроса. Например, `temp_dataset`.                                                                                                                                                                                                                              |             |                                                                                                                                                                                                                                                                          |
| `KMSEncryptionKey`          | Если чтение из BigQuery с использованием источника запроса, используйте этот ключ Cloud KMS для шифрования любых временных таблиц, созданных. Например, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                                                  |             |                                                                                                                                                                                                                                                                          |


:::note
Все параметры `ClickHouseIO` по умолчанию можно найти в [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)
:::

## Схема исходных и целевых таблиц {#source-and-target-tables-schema}

Для эффективной загрузки набора данных BigQuery в ClickHouse проводится процесс заражения колонок, состоящий из следующих этапов:

1. Шаблоны создают объект схемы на основе целевой таблицы ClickHouse.
2. Шаблоны перебирают набор данных BigQuery и пытаются сопоставить колонки по их именам.

<br/>

:::important
При этом ваш набор данных BigQuery (либо таблица, либо запрос) должен иметь точно такие же имена колонок, как ваша целевая таблица ClickHouse.
:::

## Сопоставление типов данных {#data-types-mapping}

Типы BigQuery преобразуются в соответствии с определением вашей таблицы ClickHouse. Поэтому вышеуказанная таблица перечисляет рекомендуемое сопоставление, которое должно быть в вашей целевой таблице ClickHouse (для заданной таблицы/запроса BigQuery):

| Тип BigQuery                                                                                                           | Тип ClickHouse                                               | Примечания                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Тип массива**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Тип массива**](../../../sql-reference/data-types/array)  | Внутренний тип должен быть одним из поддерживаемых примитивных типов данных, перечисленных в этой таблице.                                                                                                                                                                                                                                                                                                                 |
| [**Логический тип**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)            | [**Тип Bool**](../../../sql-reference/data-types/boolean)   |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Тип даты**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                     | [**Тип даты**](../../../sql-reference/data-types/date)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Тип даты и времени**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)       | [**Тип даты и времени**](../../../sql-reference/data-types/datetime) | Работает также с `Enum8`, `Enum16` и `FixedString`.                                                                                                                                                                                                                                                                                                                                                                    |
| [**Строковый тип**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**Строковый тип**](../../../sql-reference/data-types/string) | В BigQuery все целочисленные типы (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Рекомендуем установить в ClickHouse правильный размер целого числа, так как шаблон будет преобразовывать колонку в зависимости от определенного типа колонки (`Int8`, `Int16`, `Int32`, `Int64`).                                                                                              |
| [**Цифровые - целочисленные типы**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Целочисленные типы**](../../../sql-reference/data-types/int-uint) | В BigQuery все целочисленные типы (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Рекомендуем установить в ClickHouse правильный размер целого числа, так как шаблон будет преобразовывать колонку в зависимости от определенного типа колонки (`Int8`, `Int16`, `Int32`, `Int64`). Шаблон также преобразует не назначенные типы Int, если они используются в таблице ClickHouse (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Цифровые - вещественные типы**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Вещественные типы**](../../../sql-reference/data-types/float)  | Поддерживаемые типы ClickHouse: `Float32` и `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## Запуск шаблона {#running-the-template}

Шаблон BigQuery в ClickHouse доступен для выполнения через Google Cloud CLI.

:::note
Убедитесь, что вы ознакомились с данным документом, и особенно с вышеуказанными разделами, чтобы полностью понять требования к конфигурации шаблона и его предварительные условия.

:::

### Установка и настройка `gcloud` CLI {#install--configure-gcloud-cli}

- Если он еще не установлен, установите [`gcloud` CLI](https://cloud.google.com/sdk/docs/install).
- Следуйте разделу `Перед началом` в [этом руководстве](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) для настройки необходимых конфигураций, настроек и разрешений для выполнения шаблона DataFlow.

### Запустить команду {#run-command}

Используйте команду [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) для выполнения задания Dataflow, которое использует гибкий шаблон.

Ниже приведен пример команды:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Разбор команды {#command-breakdown}

- **Имя задания:** Текст после ключевого слова `run` — это уникальное имя задания.
- **Файл шаблона:** JSON файл, указанный параметром `--template-file-gcs-location`, определяет структуру шаблона и детали о принимаемых параметрах. Указанный путь к файлу является общедоступным и готов к использованию.
- **Параметры:** Параметры разделяются запятыми. Для параметров строкового типа заключите значения в двойные кавычки.

### Ожидаемый ответ {#expected-response}

После выполнения команды вы должны увидеть ответ, аналогичный следующему:

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

Перейдите на вкладку [Jobs в Dataflow](https://console.cloud.google.com/dataflow/jobs) в вашей консоли Google Cloud для мониторинга статуса задания. Вы найдете детали задания, включая его прогресс и любые ошибки:

<img src={dataflow_inqueue_job} class="image" alt="Работа DataFlow" style={{width: '100%', 'background-color': 'transparent'}}/>

## Устранение неполадок {#troubleshooting}

### Код: 241. DB::Exception: Превышен лимит памяти (всего) {#code-241-dbexception-memory-limit-total-exceeded}

Эта ошибка возникает, когда ClickHouse исчерпывает память при обработке больших пакетов данных. Чтобы решить эту проблему:

* Увеличьте ресурсы экземпляра: обновите свой сервер ClickHouse на более крупный экземпляр с большим объемом памяти для обработки нагрузки обработки данных.
* Уменьшите размер пакета: отрегулируйте размер пакета в конфигурации вашей работы Dataflow, чтобы отправлять меньшие объемы данных в ClickHouse, уменьшая потребление памяти на пакет.
Эти изменения могут помочь сбалансировать использование ресурсов во время загрузки данных.

## Исходный код шаблона {#template-source-code}

Исходный код шаблона доступен в форке [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) на GitHub.
