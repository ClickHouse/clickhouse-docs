---
sidebar_label: 'BigQuery в ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'Пользователи могут загружать данные из BigQuery в ClickHouse, используя шаблон Google Dataflow'
title: 'Шаблон Dataflow BigQuery в ClickHouse'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Шаблон Dataflow BigQuery в ClickHouse

Шаблон BigQuery в ClickHouse представляет собой пакетный конвейер, который загружает данные из таблицы BigQuery в таблицу ClickHouse. Шаблон может либо читать всю таблицу, либо читать конкретные записи с помощью предоставленного запроса.

<TOCInline toc={toc}></TOCInline>

## Требования к конвейеру {#pipeline-requirements}

* Исходная таблица BigQuery должна существовать.
* Целевая таблица ClickHouse должна существовать.
* Хост ClickHouse должен быть доступен с машин-работников Dataflow.

## Параметры шаблона {#template-parameters}

<br/>
<br/>

| Название параметра      | Описание параметра                                                                                                                                                                                                                                                                                                                              | Обязательно | Примечания                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | JDBC URL ClickHouse в формате `jdbc:clickhouse://<host>:<port>/<schema>`.                                                                                                                                                                                                                                                                  | ✅        | Не добавляйте имя пользователя и пароль в качестве опций JDBC. Любая другая опция JDBC может быть добавлена в конце URL JDBC. Для пользователей ClickHouse Cloud добавьте `ssl=true&sslmode=NONE` к `jdbcUrl`.                                                                  |
| `clickHouseUsername`    | Имя пользователя ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | Пароль ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | Имя целевой таблицы ClickHouse, в которую будут вставлены данные.                                                                                                                                                                                                                                                                                            | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | Максимальный размер блока для вставки, если мы контролируем создание блоков для вставки (опция ClickHouseIO).                                                                                                                                                                                                                                    |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `insertDistributedSync` | Если параметр включен, запрос вставки в распределенную таблицу ждет, пока данные будут отправлены на все узлы в кластере. (опция ClickHouseIO).                                                                                                                                                                                                                 |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `insertQuorum`          | Для запросов INSERT в реплицированной таблице ожидает записи для указанного числа реплик и линейно добавляет данные. 0 - отключено.                                                                                                                                                                                                |          | Опция `ClickHouseIO`. Это значение отключено в настройках сервера по умолчанию.                                                                                                                                                                                    |
| `insertDeduplicate`     | Для запросов INSERT в реплицированной таблице указывает, что должна выполняться дедупликация вставляемых блоков.                                                                                                                                                                                                                                  |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `maxRetries`            | Максимальное количество попыток вставки.                                                                                                                                                                                                                                                                                                              |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `InputTableSpec`        | Таблица BigQuery для чтения. Укажите либо `inputTableSpec`, либо `query`. Когда оба указаны, параметр `query` имеет приоритет. Пример: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                |          | Данные читаются напрямую из хранилища BigQuery с использованием [API чтения хранилища BigQuery](https://cloud.google.com/bigquery/docs/reference/storage). Обратите внимание на [ограничения API чтения хранилища](https://cloud.google.com/bigquery/docs/reference/storage#limitations). |
| `outputDeadletterTable` | Таблица BigQuery для сообщений, которые не удалось отправить в выходную таблицу. Если таблица не существует, она создается во время выполнения конвейера. Если не указана, используется `<outputTableSpec>_error_records`. Например, `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                                              |          |                                                                                                                                                                                                                                                                  |
| `query`                 | SQL-запрос для чтения данных из BigQuery. Если набор данных BigQuery находится в другом проекте, чем работа Dataflow, укажите полное имя набора данных в SQL-запросе, например: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. По умолчанию используется [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql), если `useLegacySql` не равно true. |          | Вы должны указать либо `inputTableSpec`, либо `query`. Если вы установите оба параметра, шаблон будет использовать параметр `query`. Пример: `SELECT * FROM sampledb.sample_table`.                                                                                        |
| `useLegacySql`          | Установите значение `true` для использования устаревшего SQL. Этот параметр применяется только при использовании параметра `query`. По умолчанию `false`.                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | Потребуется при чтении из авторизованного представления без разрешений на основную таблицу. Например, `US`.                                                                                                                                                                                                                                          |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | Установите существующий набор данных для создания временной таблицы для хранения результатов запроса. Например, `temp_dataset`.                                                                                                                                                                                                                              |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | Если вы читаете из BigQuery, используя источник запроса, используйте этот ключ Cloud KMS для шифрования любых создаваемых временных таблиц. Например, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                                                  |          |                                                                                                                                                                                                                                                                  |


:::note
Все значения по умолчанию параметров `ClickHouseIO` можно найти в [Коннекторе Apache Beam `ClickHouseIO`](/integrations/apache-beam#clickhouseiowrite-parameters)
:::

## Схема исходных и целевых таблиц {#source-and-target-tables-schema}

Для эффективной загрузки набора данных BigQuery в ClickHouse выполняется процесс колоночной инвазии с
следующими фазами:

1. Шаблоны строят объект схемы на основе целевой таблицы ClickHouse.
2. Шаблоны проходят по набору данных BigQuery и пытаются сопоставить колонки по их именам.

<br/>

:::important
Сказав это, ваш набор данных BigQuery (либо таблица, либо запрос) должен иметь точно такие же имена колонок, как и ваша целевая таблица ClickHouse.
:::

## Сопоставление типов данных {#data-types-mapping}

Типы BigQuery конвертируются на основе определения вашей таблицы ClickHouse. Поэтому вышеуказанная таблица перечисляет
рекомендуемое сопоставление, которое вы должны иметь в своей целевой таблице ClickHouse (для данной таблицы/запроса BigQuery):

| Тип BigQuery                                                                                                         | Тип ClickHouse                                                 | Примечания                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | Внутренний тип должен быть одним из поддерживаемых примитивных типов данных, перечисленных в этой таблице.                                                                                                                                                                                                                                                                                                                                 |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | Также работает с `Enum8`, `Enum16` и `FixedString`.                                                                                                                                                                                                                                                                                                                                                                |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | В BigQuery все целочисленные типы (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Мы рекомендуем вам установить правильный размер целого числа в ClickHouse, так как шаблон будет конвертировать столбец на основе определенного типа столбца (`Int8`, `Int16`, `Int32`, `Int64`).                                                                                                                          |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | В BigQuery все целочисленные типы (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Мы рекомендуем вам установить правильный размер целого числа в ClickHouse, так как шаблон будет конвертировать столбец на основе определенного типа столбца (`Int8`, `Int16`, `Int32`, `Int64`). Шаблон также преобразует неуказанные целочисленные типы, если они используются в таблице ClickHouse (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | Поддерживаемые типы ClickHouse: `Float32` и `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## Запуск шаблона {#running-the-template}

Шаблон BigQuery в ClickHouse доступен для выполнения через Google Cloud CLI.

:::note
Обязательно ознакомьтесь с этим документом, а также с вышеупомянутыми разделами, чтобы полностью понять требования и предварительные условия конфигурации шаблона.

:::

### Установка и настройка `gcloud` CLI {#install--configure-gcloud-cli}

- Если еще не установлен, установите [`gcloud` CLI](https://cloud.google.com/sdk/docs/install).
- Следуйте разделу `Перед тем как начать` в [этом руководстве](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin), чтобы настроить необходимые конфигурации, настройки и разрешения для запуска шаблона DataFlow.

### Команда запуска {#run-command}

Используйте команду [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) для запуска задания Dataflow, использующего гибкий шаблон.

Ниже приведен пример команды:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Разбор команды {#command-breakdown}

- **Имя задания:** Текст после ключевого слова `run` - это уникальное имя задания.
- **Файл шаблона:** JSON-файл, указанный с помощью `--template-file-gcs-location`, определяет структуру шаблона и детали обAccepted parameters. Указанный путь файла является открытым и готовым к использованию.
- **Параметры:** Параметры разделяются запятыми. Для параметров строкового типа значения следует заключать в двойные кавычки.

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

Перейдите на вкладку [Jobs Dataflow](https://console.cloud.google.com/dataflow/jobs) в вашей Google Cloud Console, чтобы мониторить статус задания. Вы найдете детали задания, включая прогресс и любые ошибки:

<Image img={dataflow_inqueue_job} size="lg" border alt="Консоль DataFlow, показывающая выполняющееся задание BigQuery в ClickHouse" />

## Устранение неполадок {#troubleshooting}

### Код: 241. DB::Exception: Превышен лимит памяти (всего) {#code-241-dbexception-memory-limit-total-exceeded}

Эта ошибка возникает, когда ClickHouse исчерпывает память во время обработки больших пакетов данных. Чтобы решить эту проблему:

* Увеличьте ресурсы экземпляра: обновите сервер ClickHouse до более крупного экземпляра с большим объемом памяти, чтобы обработать нагрузку обработки данных.
* Уменьшите размер пакета: отрегулируйте размер пакета в конфигурации задания Dataflow, чтобы отправлять меньшие порции данных в ClickHouse, что снизит потребление памяти на пакет.
Эти изменения могут помочь сбалансировать использование ресурсов во время приема данных.

## Исходный код шаблона {#template-source-code}

Исходный код шаблона доступен в форке [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) ClickHouse.
