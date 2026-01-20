---
sidebar_label: 'BigQuery в ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'Вы можете осуществлять приём данных из BigQuery в ClickHouse с помощью шаблона Google Dataflow'
title: 'Шаблон Dataflow: BigQuery в ClickHouse'
doc_type: 'guide'
keywords: ['Dataflow', 'BigQuery']
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'
import dataflow_create_job_from_template_button from '@site/static/images/integrations/data-ingestion/google-dataflow/create_job_from_template_button.png'
import dataflow_template_clickhouse_search from '@site/static/images/integrations/data-ingestion/google-dataflow/template_clickhouse_search.png'
import dataflow_template_initial_form from '@site/static/images/integrations/data-ingestion/google-dataflow/template_initial_form.png'
import dataflow_extended_template_form from '@site/static/images/integrations/data-ingestion/google-dataflow/extended_template_form.png'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Шаблон Dataflow BigQuery to ClickHouse \{#dataflow-bigquery-to-clickhouse-template\}

Шаблон BigQuery to ClickHouse представляет собой пакетный конвейер обработки данных, который выполняет приём данных из таблицы BigQuery в таблицу ClickHouse.
Шаблон может считывать всю таблицу или фильтровать определённые записи с помощью заданного SQL-запроса.

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## Требования к конвейеру \{#pipeline-requirements\}

* Исходная таблица BigQuery должна существовать.
* Целевая таблица ClickHouse должна существовать.
* Хост ClickHouse должен быть доступен с рабочих машин Dataflow.

## Параметры шаблона \{#template-parameters\}

<br/>
<br/>

| Parameter Name          | Parameter Description                                                                                                                                                                                                                                                                                                                              | Required | Notes                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | JDBC-URL ClickHouse в формате `jdbc:clickhouse://<host>:<port>/<schema>`.                                                                                                                                                                                                                                                                          | ✅        | Не добавляйте имя пользователя и пароль в виде JDBC-опций. Любую другую JDBC-опцию можно добавить в конец `jdbcUrl`. Для пользователей ClickHouse Cloud добавьте `ssl=true&sslmode=NONE` к `jdbcUrl`.                                                           |
| `clickHouseUsername`    | Имя пользователя ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                    | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | Пароль ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                              | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | Целевая таблица ClickHouse, в которую будут вставляться данные.                                                                                                                                                                                                                                                                                    | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | Максимальный размер блока для вставки, если мы управляем созданием блоков для вставки (опция ClickHouseIO).                                                                                                                                                                                                                                       |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                            |
| `insertDistributedSync` | Если настройка включена, запрос INSERT в распределённую таблицу ожидает, пока данные не будут отправлены на все узлы кластера (опция ClickHouseIO).                                                                                                                                                                                                |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                            |
| `insertQuorum`          | Для запросов INSERT в реплицируемую таблицу ожидает записи указанного числа реплик и линеаризует добавление данных. Значение 0 — отключено.                                                                                                                                                                                                       |          | Опция `ClickHouseIO`. Эта настройка отключена в настройках сервера по умолчанию.                                                                                                                                                                                |
| `insertDeduplicate`     | Для запросов INSERT в реплицируемую таблицу указывает, что должна выполняться дедупликация вставляемых блоков.                                                                                                                                                                                                                                     |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                            |
| `maxRetries`            | Максимальное количество повторных попыток для одной вставки.                                                                                                                                                                                                                                                                                       |          | Опция `ClickHouseIO`.                                                                                                                                                                                                                                            |
| `InputTableSpec`        | Таблица BigQuery, из которой будет выполняться чтение. Укажите либо `inputTableSpec`, либо `query`. Если заданы оба параметра, приоритет имеет параметр `query`. Пример: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                         |          | Считывает данные напрямую из хранилища BigQuery с использованием [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage). Обратите внимание на [ограничения Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage#limitations).                    |
| `outputDeadletterTable` | Таблица BigQuery для сообщений, которые не удалось записать в выходную таблицу. Если таблица не существует, она будет создана во время выполнения конвейера. Если параметр не указан, используется `<outputTableSpec>_error_records`. Например, `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                |          |                                                                                                                                                                                                                                                                  |
| `query`                 | SQL-запрос, используемый для чтения данных из BigQuery. Если набор данных BigQuery находится в другом проекте, чем задание Dataflow, укажите полное имя набора данных в SQL-запросе, например: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. По умолчанию используется [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql), если `useLegacySql` не имеет значения `true`. |          | Необходимо указать либо `inputTableSpec`, либо `query`. Если заданы оба параметра, шаблон использует параметр `query`. Пример: `SELECT * FROM sampledb.sample_table`.                                                                                            |
| `useLegacySql`          | Установите значение `true`, чтобы использовать устаревший SQL. Этот параметр применяется только при использовании параметра `query`. По умолчанию имеет значение `false`.                                                                                                                                                                         |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | Требуется при чтении из авторизованного представления без прав на исходную таблицу. Например, `US`.                                                                                                                                                                                                                                               |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | Укажите существующий набор данных, в котором будет создана временная таблица для хранения результатов запроса. Например, `temp_dataset`.                                                                                                                                                                                                          |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | При чтении из BigQuery с использованием источника-запроса используйте этот ключ Cloud KMS для шифрования всех создаваемых временных таблиц. Например, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                         |          |                                                                                                                                                                                                                                                                  |

:::note
Значения по умолчанию для всех параметров `ClickHouseIO` можно найти в [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)
:::

## Схема исходных и целевых таблиц \{#source-and-target-tables-schema\}

Чтобы эффективно загрузить набор данных BigQuery в ClickHouse, конвейер выполняет процесс вывода схемы столбцов, состоящий из следующих этапов:

1. Шаблоны строят объект схемы на основе целевой таблицы ClickHouse.
2. Шаблоны последовательно обходят набор данных BigQuery и пытаются сопоставить столбцы по их именам.

<br/>

:::important
При этом ваш набор данных BigQuery (таблица или результат запроса) должен иметь точно такие же имена столбцов, как и целевая таблица ClickHouse.
:::

## Отображение типов данных \{#data-types-mapping\}

Типы BigQuery преобразуются на основе определения вашей таблицы ClickHouse. Поэтому в приведённой выше таблице перечислено
рекомендуемое отображение, которое следует использовать в целевой таблице ClickHouse (для заданной таблицы/запроса BigQuery):

| Тип BigQuery                                                                                                          | Тип ClickHouse                                                  | Примечания                                                                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | Внутренний тип должен быть одним из поддерживаемых примитивных типов данных, перечисленных в этой таблице.                                                                                                                                                                                                                                                                                                             |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | Также работает с `Enum8`, `Enum16` и `FixedString`.                                                                                                                                                                                                                                                                                                                                                                    |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | В BigQuery все типы Int (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются синонимами типа `INT64`. Рекомендуется задать в ClickHouse корректный размер целочисленного типа, так как шаблон будет преобразовывать столбец на основе заданного типа столбца (`Int8`, `Int16`, `Int32`, `Int64`).                                                                                                      |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | В BigQuery все типы Int (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются синонимами типа `INT64`. Рекомендуется задать в ClickHouse корректный размер целочисленного типа, так как шаблон будет преобразовывать столбец на основе заданного типа столбца (`Int8`, `Int16`, `Int32`, `Int64`). Шаблон также будет преобразовывать беззнаковые целочисленные типы, если они используются в таблице ClickHouse (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | Поддерживаемые типы ClickHouse: `Float32` и `Float64`.                                                                                                                                                                                                                                                                                                                                                                 |

## Запуск шаблона \{#running-the-template\}

Шаблон BigQuery to ClickHouse доступен для выполнения через Google Cloud CLI.

:::note
Обязательно изучите этот документ, особенно разделы выше, чтобы полностью понять требования к конфигурации
и предварительные требования для использования шаблона.
:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Войдите в Google Cloud Console и найдите службу Dataflow.

1. Нажмите кнопку `CREATE JOB FROM TEMPLATE`
   <Image img={dataflow_create_job_from_template_button} border alt="Консоль Dataflow" />
2. После открытия формы шаблона введите имя задания и выберите нужный регион.
   <Image img={dataflow_template_initial_form} border alt="Начальная форма шаблона Dataflow" />
3. В поле `DataFlow Template` введите `ClickHouse` или  `BigQuery` и выберите шаблон `BigQuery to ClickHouse`
   <Image img={dataflow_template_clickhouse_search} border alt="Выбор шаблона BigQuery to ClickHouse" />
4. После выбора форма будет расширена, чтобы вы могли указать дополнительные параметры:
    * JDBC URL сервера ClickHouse в формате `jdbc:clickhouse://host:port/schema`.
    * Имя пользователя ClickHouse.
    * Имя целевой таблицы ClickHouse.

<br/>

:::note
Параметр пароля ClickHouse помечен как необязательный — для случаев, когда пароль не настроен.
Чтобы добавить его, прокрутите вниз до параметра `Password for ClickHouse Endpoint`.
:::

<Image img={dataflow_extended_template_form} border alt="Расширенная форма шаблона BigQuery to ClickHouse" />

5. Настройте и добавьте любые параметры, связанные с BigQuery/ClickHouseIO, как описано
   в разделе [Template Parameters](#template-parameters)

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### Установка и настройка `gcloud` CLI \{#install--configure-gcloud-cli\}

- Если `gcloud` CLI еще не установлен, установите его, следуя [этой инструкции](https://cloud.google.com/sdk/docs/install).
- Выполните шаги из раздела `Before you begin`
  в [данном руководстве](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin), чтобы настроить необходимые конфигурации, параметры и разрешения для запуска шаблона Dataflow.

### Запуск команды \{#run-command\}

Используйте команду [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)
для запуска задания Dataflow, использующего Flex Template.

Ниже приведен пример команды:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Разбор команды \{#command-breakdown\}

- **Job Name:** Текст, идущий после ключевого слова `run`, является уникальным именем задания.
- **Template File:** JSON-файл, задаваемый параметром `--template-file-gcs-location`, определяет структуру шаблона и
  сведения о допустимых параметрах. Указанный путь к файлу является общедоступным и готов к использованию.
- **Parameters:** Параметры разделяются запятыми. Для строковых параметров заключайте значения в двойные кавычки.

### Ожидаемый ответ \{#expected-response\}

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

  </TabItem>
</Tabs>

### Мониторинг задания \{#monitor-the-job\}

Перейдите на вкладку [Dataflow Jobs](https://console.cloud.google.com/dataflow/jobs) в Google Cloud Console,
чтобы отслеживать статус задания. Там вы найдете подробную информацию о задании, включая прогресс и возможные ошибки:

<Image img={dataflow_inqueue_job} size="lg" border alt="Консоль Dataflow с выполняющимся заданием BigQuery to ClickHouse" />

## Устранение неполадок \{#troubleshooting\}

### Ошибка Memory limit (total) exceeded (code 241) \{#code-241-dbexception-memory-limit-total-exceeded\}

Эта ошибка возникает, когда ClickHouse исчерпывает доступную память при обработке крупных пакетов данных. Чтобы устранить проблему:

* Увеличьте ресурсы экземпляра: обновите сервер ClickHouse до более мощного экземпляра с большим объёмом памяти, чтобы справляться с нагрузкой на обработку данных.
* Уменьшите размер пакета: настройте размер пакета в конфигурации задания Dataflow так, чтобы отправлять меньшие порции данных в ClickHouse, снижая потребление памяти на пакет. Эти изменения помогают сбалансировать использование ресурсов во время ингестии данных.

## Исходный код шаблона \{#template-source-code\}

Исходный код шаблона доступен в форке репозитория [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) от ClickHouse.