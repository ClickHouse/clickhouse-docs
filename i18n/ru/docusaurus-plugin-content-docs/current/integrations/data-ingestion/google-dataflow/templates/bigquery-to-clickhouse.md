---
'sidebar_label': 'BigQuery 到 ClickHouse'
'sidebar_position': 1
'slug': '/integrations/google-dataflow/templates/bigquery-to-clickhouse'
'description': '用户可以使用 Google Dataflow 模板将数据从 BigQuery 导入 ClickHouse'
'title': 'Dataflow BigQuery 到 ClickHouse 模板'
'doc_type': 'guide'
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


# Шаблон Dataflow BigQuery в ClickHouse

Шаблон BigQuery в ClickHouse представляет собой пакетный конвейер, который загружает данные из таблицы BigQuery в таблицу ClickHouse.
Шаблон может читать всю таблицу или фильтровать конкретные записи, используя предоставленный SQL-запрос.

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## Требования к конвейеру {#pipeline-requirements}

* Исходная таблица BigQuery должна существовать.
* Целевая таблица ClickHouse должна существовать.
* Хост ClickHouse должен быть доступен с машин-работников Dataflow.

## Параметры шаблона {#template-parameters}

<br/>
<br/>

| Имя параметра            | Описание параметра                                                                                                                                                                                                                                                                                                                                | Обязательно | Примечания                                                                                                                                                                                                                                                            |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`                | JDBC URL ClickHouse в формате `jdbc:clickhouse://<host>:<port>/<schema>`.                                                                                                                                                                                                                                                                        | ✅          | Не добавляйте имя пользователя и пароль в параметры JDBC. Любые другие параметры JDBC можно добавлять в конце URL JDBC. Для пользователей ClickHouse Cloud добавьте `ssl=true&sslmode=NONE` в `jdbcUrl`.                                                                  |
| `clickHouseUsername`     | Имя пользователя ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                   | ✅          |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`     | Пароль ClickHouse для аутентификации.                                                                                                                                                                                                                                                                                                           | ✅          |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`        | Целевая таблица ClickHouse, в которую будут вставлены данные.                                                                                                                                                                                                                                                                                     | ✅          |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`     | Максимальный размер блока для вставки, если мы контролируем создание блоков для вставки (параметр ClickHouseIO).                                                                                                                                                                                                                                  |             | Параметр `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `insertDistributedSync`  | Если данный параметр включен, запрос вставки в распределенной таблице будет ожидать, пока данные будут отправлены на все узлы в кластере. (параметр ClickHouseIO).                                                                                                                                                                              |             | Параметр `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `insertQuorum`           | Для запросов INSERT в реплицированной таблице ожидает записи для указанного числа реплик и линейно добавляет данные. 0 - отключено.                                                                                                                                                                                                               |             | Параметр `ClickHouseIO`. Этот параметр по умолчанию отключен в настройках сервера.                                                                                                                                                                               |
| `insertDeduplicate`      | Для запросов INSERT в реплицированной таблице указывает, что должна выполняться дедупликация вставляемых блоков.                                                                                                                                                                                                                                  |             | Параметр `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `maxRetries`             | Максимальное количество повторных попыток для каждой вставки.                                                                                                                                                                                                                                                                                     |             | Параметр `ClickHouseIO`.                                                                                                                                                                                                                                         |
| `InputTableSpec`         | Таблица BigQuery для чтения. Укажите либо `inputTableSpec`, либо `query`. Когда оба указаны, предпочтение отдается параметру `query`. Пример: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                |             | Данные читаются прямо из хранилища BigQuery с использованием [API чтения данных BigQuery](https://cloud.google.com/bigquery/docs/reference/storage). Обратите внимание на [ограничения API чтения данных](https://cloud.google.com/bigquery/docs/reference/storage#limitations). |
| `outputDeadletterTable`  | Таблица BigQuery для сообщений, которые не смогли достичь выходной таблицы. Если таблица не существует, она создается во время выполнения конвейера. Если не указано, используется `<outputTableSpec>_error_records`. Например, `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                                              |             |                                                                                                                                                                                                                                                                  |
| `query`                  | SQL-запрос для чтения данных из BigQuery. Если набор данных BigQuery находится в другом проекте, чем рабочая задача Dataflow, укажите полное имя набора данных в SQL-запросе, например: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. По умолчанию используется [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql), если `useLegacySql` не равно true.               |             | Вы должны указать либо `inputTableSpec`, либо `query`. Если вы установите оба параметра, шаблон использует параметр `query`. Пример: `SELECT * FROM sampledb.sample_table`.                                                                                        |
| `useLegacySql`           | Установите в `true`, чтобы использовать устаревший SQL. Этот параметр применяется только при использовании параметра `query`. По умолчанию `false`.                                                                                                                                                                                              |             |                                                                                                                                                                                                                                                                  |
| `queryLocation`          | Необходимо при чтении из авторизованного представления без разрешений на основную таблицу. Например, `US`.                                                                                                                                                                                                                                      |             |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`       | Укажите существующий набор данных для создания временной таблицы для хранения результатов запроса. Например, `temp_dataset`.                                                                                                                                                                                                                     |             |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`       | При чтении из BigQuery с использованием источника запроса используйте этот ключ Cloud KMS для шифрования любых временных таблиц, созданных. Например, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                 |             |                                                                                                                                                                                                                                                                  |

:::note
Значения по умолчанию для всех параметров `ClickHouseIO` можно найти в [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)
:::

## Схема исходных и целевых таблиц {#source-and-target-tables-schema}

Чтобы эффективно загрузить набор данных BigQuery в ClickHouse, конвейер выполняет процесс вывода схемы с следующими фазами:

1. Шаблоны строят объект схемы на основе целевой таблицы ClickHouse.
2. Шаблоны перебирают набор данных BigQuery и пытаются сопоставить колонки на основе их имен.

<br/>

:::important
При этом набор данных BigQuery (таблица или запрос) должен иметь точно такие же имена колонок, как ваша целевая таблица ClickHouse.
:::

## Сопоставление типов данных {#data-types-mapping}

Типы BigQuery преобразуются на основе определения вашей таблицы ClickHouse. Поэтому в приведенной выше таблице указано рекомендованное сопоставление, которое вам следует иметь в целевой таблице ClickHouse (для данной таблицы/запроса BigQuery):

| Тип BigQuery                                                                                                           | Тип ClickHouse                                                 | Примечания                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Тип массива**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                | [**Тип массива**](../../../sql-reference/data-types/array)   | Внутренний тип должен быть одним из поддерживаемых примитивных типов данных, перечисленных в этой таблице.                                                                                                                                                                                                                                                                                                            |
| [**Логический тип**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)           | [**Тип boolean**](../../../sql-reference/data-types/boolean)  |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Тип даты**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                     | [**Тип даты**](../../../sql-reference/data-types/date)       |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Тип даты и времени**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)      | [**Тип даты и времени**](../../../sql-reference/data-types/datetime) | Также работает с `Enum8`, `Enum16` и `FixedString`.                                                                                                                                                                                                                                                                                                                                                                     |
| [**Строковый тип**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)             | [**Строковый тип**](../../../sql-reference/data-types/string) | В BigQuery все типы Int (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Рекомендуется установить в ClickHouse правильный размер целого числа, так как шаблон будет конвертировать колонку на основе определенного типа колонки (`Int8`, `Int16`, `Int32`, `Int64`).                                                  |
| [**Числовые - Целочисленные типы**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Целочисленные типы**](../../../sql-reference/data-types/int-uint) | В BigQuery все типы Int (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) являются псевдонимами для `INT64`. Рекомендуется установить в ClickHouse правильный размер целого числа, так как шаблон будет конвертировать колонку на основе определенного типа колонки (`Int8`, `Int16`, `Int32`, `Int64`). Шаблон также будет конвертировать неуказанные типы Int, если они используются в таблице ClickHouse (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Числовые - Типы с плавающей точкой**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Типы с плавающей точкой**](../../../sql-reference/data-types/float)  | Поддерживаемые типы ClickHouse: `Float32` и `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## Запуск шаблона {#running-the-template}

Шаблон BigQuery в ClickHouse доступен для выполнения через Google Cloud CLI.

:::note
Обязательно ознакомьтесь с этим документом, а особенно с приведенными выше разделами, чтобы полностью понять требования к конфигурации и предварительные условия шаблона.

:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Войдите в свою Google Cloud Console и найдите DataFlow.

1. Нажмите кнопку `CREATE JOB FROM TEMPLATE`
   <Image img={dataflow_create_job_from_template_button} border alt="DataFlow console" />
2. Когда форма шаблона откроется, введите имя задания и выберите желаемый регион.
   <Image img={dataflow_template_initial_form} border alt="DataFlow template initial form" />
3. Введите в поле `DataFlow Template` `ClickHouse` или `BigQuery` и выберите шаблон `BigQuery to ClickHouse`
   <Image img={dataflow_template_clickhouse_search} border alt="Select BigQuery to ClickHouse template" />
4. После выбора форма развернется, чтобы вы могли предоставить дополнительные детали:
    * JDBC URL сервера ClickHouse в формате `jdbc:clickhouse://host:port/schema`.
    * Имя пользователя ClickHouse.
    * Имя целевой таблицы ClickHouse.

<br/>

:::note
Опция пароля ClickHouse помечена как необязательная для случаев, когда пароль не настроен.
Чтобы добавить его, прокрутите вниз до опции `Password for ClickHouse Endpoint`.
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse extended template form" />

5. Настройте и добавьте любые конфигурации, связанные с BigQuery/ClickHouseIO, как указано в разделе
   [Параметры шаблона](#template-parameters)

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### Установка и настройка `gcloud` CLI {#install--configure-gcloud-cli}

- Если еще не установлен, установите [`gcloud` CLI](https://cloud.google.com/sdk/docs/install).
- Следуйте разделу `Перед началом`
  в [данном руководстве](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) для настройки необходимых конфигураций, настроек и разрешений для выполнения шаблона DataFlow.

### Команда запуска {#run-command}

Используйте команду [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)
для запуска задания Dataflow, которое использует гибкий шаблон.

Вот пример команды:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Разбор команды {#command-breakdown}

- **Имя задания:** Текст после ключевого слова `run` - это уникальное имя задания.
- **Файл шаблона:** JSON-файл, указанный в `--template-file-gcs-location`, определяет структуру шаблона и детали принимаемых параметров. Указанный путь к файлу является публичным и готов к использованию.
- **Параметры:** Параметры разделяются запятыми. Для параметров на основе строк заключайте значения в двойные кавычки.

### Ожидаемый ответ {#expected-response}

После выполнения команды вы должны увидеть ответ, подобный следующему:

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

### Мониторинг задания {#monitor-the-job}

Перейдите на вкладку [Jobs Dataflow](https://console.cloud.google.com/dataflow/jobs) в вашей Google Cloud Console, чтобы
отслеживать состояние задания. Вы найдете детали задания, включая прогресс и любые ошибки:

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow console showing a running BigQuery to ClickHouse job" />

## Устранение неполадок {#troubleshooting}

### Превышен лимит памяти (итого) (код 241) {#code-241-dbexception-memory-limit-total-exceeded}

Эта ошибка возникает, когда ClickHouse исчерпывает память при обработке больших пакетов данных. Чтобы решить эту проблему:

* Увеличьте ресурсы экземпляра: обновите сервер ClickHouse до более крупного экземпляра с большим объемом памяти для обработки нагрузок на обработку данных.
* Уменьшите размер пакета: отрегулируйте размер пакета в конфигурации задания Dataflow, чтобы отправлять меньшие объемы данных в ClickHouse, снижая потребление памяти на пакет. Эти изменения могут помочь сбалансировать использование ресурсов во время приема данных.

## Исходный код шаблона {#template-source-code}

Исходный код шаблона доступен в форке [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) ClickHouse.
