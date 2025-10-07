---
'sidebar_label': 'dlt'
'keywords':
- 'clickhouse'
- 'dlt'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'description': 'Загрузить данные в ClickHouse с использованием интеграции dlt'
'title': 'Подключить dlt к ClickHouse'
'slug': '/integrations/data-ingestion/etl-tools/dlt-and-clickhouse'
'doc_type': 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение dlt к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> — это библиотека с открытым исходным кодом, которую вы можете добавить в свои Python-скрипты для загрузки данных из различных и часто неструктурированных источников данных в хорошо организованные, актуальные наборы данных.

## Установка dlt с зависимостями ClickHouse {#install-dlt-with-clickhouse}

### Установка библиотеки `dlt` с зависимостями ClickHouse: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## Руководство по настройке {#setup-guide}

### 1. Инициализация проекта dlt {#1-initialize-the-dlt-project}

Начните с инициализации нового проекта `dlt`, как показано ниже:
```bash
dlt init chess clickhouse
```

:::note
Эта команда инициализирует ваш конвейер с шахматами в качестве источника и ClickHouse в качестве места назначения.
:::

Вышеуказанная команда генерирует несколько файлов и директорий, включая `.dlt/secrets.toml` и файл требований для ClickHouse. Вы можете установить необходимые зависимости, указанные в файле требований, выполнив его следующим образом:
```bash
pip install -r requirements.txt
```

или с помощью `pip install dlt[clickhouse]`, который устанавливает библиотеку `dlt` и необходимые зависимости для работы с ClickHouse в качестве места назначения.

### 2. Настройка базы данных ClickHouse {#2-setup-clickhouse-database}

Чтобы загрузить данные в ClickHouse, вам нужно создать базу данных ClickHouse. Вот общая схема действий:

1. Вы можете использовать существующую базу данных ClickHouse или создать новую.

2. Чтобы создать новую базу данных, подключитесь к вашему серверу ClickHouse с помощью инструмента командной строки `clickhouse-client` или SQL-клиента на ваш выбор.

3. Выполните следующие SQL-команды для создания новой базы данных, пользователя и предоставления необходимых разрешений:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 3. Добавление учетных данных {#3-add-credentials}

Следующим шагом настройте учетные данные ClickHouse в файле `.dlt/secrets.toml`, как показано ниже:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # The database name you created
username = "dlt"                         # ClickHouse username, default is usually "default"
password = "Dlt*12345789234567"          # ClickHouse password if any
host = "localhost"                       # ClickHouse server host
port = 9000                              # ClickHouse HTTP port, default is 9000
http_port = 8443                         # HTTP Port to connect to ClickHouse server's HTTP interface. Defaults to 8443.
secure = 1                               # Set to 1 if using HTTPS, else 0.

[destination.clickhouse]
dataset_table_separator = "___"          # Separator for dataset table names from dataset.
```

:::note
HTTP_PORT
Параметр `http_port` определяет номер порта, который будет использоваться при подключении к HTTP-интерфейсу сервера ClickHouse. Это отличается от стандартного порта 9000, который используется для нативного TCP-протокола.

Вы должны установить `http_port`, если вы не используете внешнее промежуточное хранилище (т.е. вы не задаете параметр промежуточного хранилища в вашем конвейере). Это связано с тем, что встроенное промежуточное хранилище ClickHouse использует библиотеку <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>, которая взаимодействует с ClickHouse по HTTP.

Убедитесь, что ваш сервер ClickHouse настроен для приема HTTP-соединений на порту, указанном в `http_port`. Например, если вы установите `http_port = 8443`, то ClickHouse должен ожидать HTTP-запросы на порту 8443. Если вы используете внешнее промежуточное хранилище, вы можете пропустить параметр `http_port`, так как в этом случае clickhouse-connect не будет использоваться.
:::

Вы можете передать строку подключения к базе данных, аналогичную той, которая используется библиотекой `clickhouse-driver`. Учетные данные выше будут выглядеть следующим образом:

```bash

# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

## Диспозиция записи {#write-disposition}

Поддерживаются все [диспозиции записи](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition).

Диспозиции записи в библиотеке dlt определяют, как данные должны быть записаны в место назначения. Существует три типа диспозиций записи:

**Заменить**: Эта диспозиция заменяет данные в целевом месте данными из ресурса. Она удаляет все классы и объекты и воссоздает схему перед загрузкой данных. Вы можете узнать больше об этом <a href="https://dlthub.com/docs/general-usage/full-loading">здесь</a>.

**Объединить**: Эта диспозиция записи объединяет данные из ресурса с данными в месте назначения. Для диспозиции `merge` вам нужно будет указать `primary_key` для ресурса. Вы можете узнать больше об этом <a href="https://dlthub.com/docs/general-usage/incremental-loading">здесь</a>.

**Добавить**: Это диспозиция по умолчанию. Она добавит данные к существующим данным в месте назначения, игнорируя поле `primary_key`.

## Загрузка данных {#data-loading}
Данные загружаются в ClickHouse с использованием наиболее эффективного метода в зависимости от источника данных:

- Для локальных файлов используется библиотека `clickhouse-connect` для прямой загрузки файлов в таблицы ClickHouse с помощью команды `INSERT`.
- Для файлов в удаленном хранилище, таких как `S3`, `Google Cloud Storage` или `Azure Blob Storage`, используются табличные функции ClickHouse, такие как s3, gcs и azureBlobStorage, для чтения файлов и вставки данных в таблицы.

## Наборы данных {#datasets}

`Clickhouse` не поддерживает несколько наборов данных в одной базе данных, тогда как `dlt` основывается на наборах данных по нескольким причинам. Чтобы сделать `Clickhouse` совместимым с `dlt`, таблицы, сгенерированные `dlt` в вашей базе данных `Clickhouse`, будут иметь имена, предваряемые названием набора данных, разделенными настраиваемым `dataset_table_separator`. Кроме того, будет создана специальная вспомогательная таблица, которая не содержит данных, позволяющая `dlt` распознавать, какие виртуальные наборы данных уже существуют в месте назначения `Clickhouse`.

## Поддерживаемые форматы файлов {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> является предпочтительным форматом как для прямой загрузки, так и для промежуточного хранилища.
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> поддерживается как для прямой загрузки, так и для промежуточного хранилища.

Назначение `clickhouse` имеет несколько специфических отклонений от стандартных SQL-назначений:

1. `Clickhouse` имеет экспериментальный тип данных `object`, но мы обнаружили, что он может быть немного непредсказуемым, поэтому назначение dlt clickhouse будет загружать сложный тип данных в текстовую колонку. Если вам нужна эта функция, свяжитесь с нашим сообществом в Slack, и мы рассмотрим возможность её добавления.
2. `Clickhouse` не поддерживает тип данных `time`. Время будет загружено в текстовую колонку.
3. `Clickhouse` не поддерживает тип данных `binary`. Вместо этого двоичные данные будут загружены в текстовую колонку. При загрузке из `jsonl` двоичные данные будут представлять собой строку base64, а при загрузке из parquet объект `binary` будет преобразован в `text`.
4. `Clickhouse` принимает добавление колонок в заполненную таблицу, которые не являются null.
5. `Clickhouse` может вызывать ошибки округления при определенных условиях при использовании типа данных float или double. Если вы не можете позволить себе ошибки округления, убедитесь, что используете тип данных decimal. Например, загрузка значения 12.7001 в колонку double с установленным форматом файла загрузки в `jsonl` предсказуемо приведет к ошибке округления.

## Поддерживаемые подсказки колонок {#supported-column-hints}
ClickHouse поддерживает следующие <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">подсказки колонок</a>:

- `primary_key` - помечает колонку как часть первичного ключа. Несколько колонок могут иметь эту подсказку для создания составного первичного ключа.

## Движок таблицы {#table-engine}
По умолчанию таблицы создаются с использованием движка таблиц `ReplicatedMergeTree` в ClickHouse. Вы можете указать альтернативный движок таблиц, используя `table_engine_type` с адаптером clickhouse:

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

Поддерживаемые значения:

- `merge_tree` - создает таблицы с использованием движка `MergeTree`
- `replicated_merge_tree` (по умолчанию) - создает таблицы с использованием движка `ReplicatedMergeTree`

## Поддержка промежуточного хранилища {#staging-support}

ClickHouse поддерживает Amazon S3, Google Cloud Storage и Azure Blob Storage в качестве мест назначения для промежуточного хранилища файлов.

`dlt` загружает файлы Parquet или jsonl в промежуточное местоположение и использует табличные функции ClickHouse для загрузки данных непосредственно из промежуточных файлов.

Пожалуйста, обратитесь к документации файловой системы, чтобы узнать, как настроить учетные данные для мест назначения промежуточного хранилища:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

Чтобы запустить конвейер с включенным промежуточным хранилищем:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### Использование Google Cloud Storage в качестве промежуточной области {#using-google-cloud-storage-as-a-staging-area}
dlt поддерживает использование Google Cloud Storage (GCS) в качестве промежуточной области при загрузке данных в ClickHouse. Это обрабатывается автоматически с помощью <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">табличной функции GCS</a> ClickHouse, которую dlt использует "под капотом".

Табличная функция clickhouse GCS поддерживает только аутентификацию с использованием ключей HMAC (Hash-based Message Authentication Code). Чтобы включить эту функцию, GCS предоставляет режим совместимости с S3, который эмулирует API Amazon S3. ClickHouse использует это для доступа к корзинам GCS через свою интеграцию S3.

Чтобы настроить промежуточное хранилище GCS с аутентификацией HMAC в dlt:

1. Создайте ключи HMAC для вашей учетной записи службы GCS, следуя <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">руководству Google Cloud</a>.

2. Настройте ключи HMAC, а также `client_email`, `project_id` и `private_key` для вашей учетной записи службы в настройках размещения ClickHouse вашего проекта dlt в `config.toml`:

```bash
[destination.filesystem]
bucket_url = "gs://dlt-ci"

[destination.filesystem.credentials]
project_id = "a-cool-project"
client_email = "my-service-account@a-cool-project.iam.gserviceaccount.com"
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkaslkdjflasjnkdcopauihj...wEiEx7y+mx\nNffxQBqVVej2n/D93xY99pM=\n-----END PRIVATE KEY-----\n"

[destination.clickhouse.credentials]
database = "dlt"
username = "dlt"
password = "Dlt*12345789234567"
host = "localhost"
port = 9440
secure = 1
gcp_access_key_id = "JFJ$$*f2058024835jFffsadf"
gcp_secret_access_key = "DFJdwslf2hf57)%$02jaflsedjfasoi"
```

Примечание: Кроме ключей HMAC `bashgcp_access_key_id` и `gcp_secret_access_key`, теперь вам нужно предоставить `client_email`, `project_id` и `private_key` для вашей учетной записи службы под `[destination.filesystem.credentials]`. Это потому, что поддержка промежуточного хранилища GCS сейчас реализована как временное решение и все еще не оптимизирована.

dlt передаст эти учетные данные ClickHouse, который обработает аутентификацию и доступ к GCS.

В настоящее время ведется активная работа над упрощением и улучшением настройки промежуточного хранилища GCS для назначения dlt ClickHouse в будущем. Корректная поддержка промежуточного хранилища GCS отслеживается в этих запросах GitHub:

- Сделать местоположение файловой системы <a href="https://github.com/dlt-hub/dlt/issues/1272">работающим</a> с gcs в режиме совместимости s3
- Поддержка промежуточной области Google Cloud Storage <a href="https://github.com/dlt-hub/dlt/issues/1181">требуется</a>

### Поддержка dbt {#dbt-support}
Интеграция с <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> в целом поддерживается через dbt-clickhouse.

### Синхронизация состояния `dlt` {#syncing-of-dlt-state}
Это назначение полностью поддерживает <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">синхронизацию состояния dlt</a>.
