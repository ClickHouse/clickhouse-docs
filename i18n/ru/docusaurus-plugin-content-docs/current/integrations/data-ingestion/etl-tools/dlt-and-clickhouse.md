---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: 'Загрузка данных в ClickHouse с использованием интеграции dlt'
---


# Подключение dlt к ClickHouse

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> — это библиотека с открытым исходным кодом, которую вы можете добавить в свои Python-скрипты для загрузки данных из различных и часто неаккуратных источников данных в хорошо структурированные, живые наборы данных.

## Установка dlt с зависимостями ClickHouse {#install-dlt-with-clickhouse}

### Чтобы установить библиотеку `dlt` с зависимостями для ClickHouse: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]" 
```

## Руководство по настройке {#setup-guide}

### 1. Инициализация проекта dlt {#1-initialize-the-dlt-project}

Начните с инициализации нового проекта `dlt` следующим образом:
```bash
dlt init chess clickhouse
```


:::note
Эта команда инициализирует ваш конвейер с шахматами в качестве источника и ClickHouse в качестве назначения.
:::

Вышеуказанная команда генерирует несколько файлов и директорий, включая `.dlt/secrets.toml` и файл требований для ClickHouse. Вы можете установить необходимые зависимости, указанные в файле требований, выполнив следующую команду:
```bash
pip install -r requirements.txt
```

или с помощью команды `pip install dlt[clickhouse]`, которая установит библиотеку `dlt` и необходимые зависимости для работы с ClickHouse в качестве назначения.

### 2. Настройка базы данных ClickHouse {#2-setup-clickhouse-database}

Чтобы загрузить данные в ClickHouse, вам нужно создать базу данных ClickHouse. Вот общий план действий:

1. Вы можете использовать существующую базу данных ClickHouse или создать новую.

2. Чтобы создать новую базу данных, подключитесь к вашему серверу ClickHouse с помощью командной строки `clickhouse-client` или SQL-клиента на ваш выбор.

3. Выполните следующие SQL-команды для создания новой базы данных, пользователя и предоставления необходимых прав:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```


### 3. Добавление учетных данных {#3-add-credentials}

Затем настройте учетные данные ClickHouse в файле `.dlt/secrets.toml`, как показано ниже:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # Название базы данных, которую вы создали
username = "dlt"                         # Имя пользователя ClickHouse, по умолчанию обычно "default"
password = "Dlt*12345789234567"          # Пароль ClickHouse, если есть
host = "localhost"                       # Хост сервера ClickHouse
port = 9000                              # HTTP-порт ClickHouse, по умолчанию 9000
http_port = 8443                         # HTTP-порт для подключения к HTTP-интерфейсу сервера ClickHouse. По умолчанию 8443.
secure = 1                               # Установите в 1, если используете HTTPS, иначе 0.
dataset_table_separator = "___"          # Разделитель для имен таблиц набора данных.
```


:::note
HTTP_PORT
Параметр `http_port` указывает номер порта, который будет использоваться при подключении к HTTP-интерфейсу сервера ClickHouse. Это отличается от стандартного порта 9000, который используется для протокола TCP.

Вы должны установить `http_port`, если не используете внешнее хранение (т.е. вы не устанавливаете параметр staging в вашем конвейере). Это связано с тем, что встроенное локальное хранилище ClickHouse использует библиотеку <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>, которая общается с ClickHouse по HTTP.

Убедитесь, что ваш сервер ClickHouse настроен для приема HTTP-подключений на порту, указанном в `http_port`. Например, если вы установите `http_port = 8443`, то ClickHouse должен слушать HTTP-запросы на порту 8443. Если вы используете внешнее хранение, вы можете опустить параметр `http_port`, поскольку clickhouse-connect не будет использоваться в этом случае.
:::

Вы можете передать строку подключения к базе данных, аналогичную той, что используется библиотекой `clickhouse-driver`. Учётные данные выше будут выглядеть так:

```bash

# оставьте вверху вашего toml-файла, перед тем как начнется любой раздел.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```


## Диспозиция записи {#write-disposition}

Все [диспозиции записи](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)
поддерживаются.

Диспозиции записи в библиотеке dlt определяют, как данные должны быть записаны в назначение. Существует три типа диспозиций записи:

**Заменить**: Эта диспозиция заменяет данные в назначении данными из ресурса. Она удаляет все классы и объекты и воссоздает схему перед загрузкой данных. Вы можете узнать больше об этом <a href="https://dlthub.com/docs/general-usage/full-loading">здесь</a>.

**Слить**: Эта диспозиция записи сливает данные из ресурса с данными в назначении. Для диспозиции `merge` вам нужно будет указать `primary_key` для ресурса. Вы можете узнать больше об этом <a href="https://dlthub.com/docs/general-usage/incremental-loading">здесь</a>.

**Добавить**: Это диспозиция по умолчанию. Она добавляет данные к существующим данным в назначении, игнорируя поле `primary_key`.

## Загрузка данных {#data-loading}
Данные загружаются в ClickHouse с использованием наиболее эффективного метода в зависимости от источника данных:

- Для локальных файлов библиотека `clickhouse-connect` используется для прямой загрузки файлов в таблицы ClickHouse с помощью команды `INSERT`. 
- Для файлов в удаленном хранилище, таких как `S3`, `Google Cloud Storage` или `Azure Blob Storage`, используются функции таблиц ClickHouse, такие как s3, gcs и azureBlobStorage, для чтения файлов и вставки данных в таблицы.

## Наборы данных {#datasets}

`Clickhouse` не поддерживает несколько наборов данных в одной базе данных, в то время как `dlt` зависит от наборов данных по нескольким причинам. Для того чтобы `Clickhouse` работал с `dlt`, таблицы, сгенерированные `dlt` в вашей базе данных `Clickhouse`, будут иметь имена, предваренные именем набора данных, разделенного настраиваемым `dataset_table_separator`. Кроме того, будет создана специальная таблица-сигнал, которая не содержит никаких данных, позволяя `dlt` распознавать, какие виртуальные наборы данных уже существуют в назначении `Clickhouse`.

## Поддерживаемые форматы файлов {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> является предпочтительным форматом как для прямой загрузки, так и для хранения.
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> поддерживается как для прямой загрузки, так и для хранения.

Назначение `clickhouse` имеет несколько специфических отклонений от стандартных SQL-назначений:

1. `Clickhouse` имеет экспериментальный тип данных `object`, но мы обнаружили его немного непредсказуемым, поэтому назначение dlt clickhouse будет загружать сложные типы данных в текстовую колонку. Если вам нужна эта функция, свяжитесь с нашим сообществом в Slack, и мы рассмотрим возможность её добавления.
2. `Clickhouse` не поддерживает тип данных `time`. Время будет загружено в текстовую колонку.
3. `Clickhouse` не поддерживает тип данных `binary`. Вместо этого двоичные данные будут загружены в текстовую колонку. При загрузке из `jsonl` двоичные данные будут строкой base64, а при загрузке из parquet объект `binary` будет преобразован в `text`.
5. `Clickhouse` позволяет добавлять колонки в заполнилиенную таблицу, которые не являются нулевыми.
6. `Clickhouse` может вызывать ошибки округления в определенных условиях при использовании типов данных float или double. Если вы не можете позволить себе округления, убедитесь, что используете тип данных decimal. Например, загрузка значения 12.7001 в колонку double с установленным форматом файла загрузки `jsonl` предсказуемо вызовет ошибку округления.

## Поддерживаемые подсказки для колонок {#supported-column-hints}
ClickHouse поддерживает следующие <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">подсказки для колонок</a>:

- `primary_key` - отмечает колонку как часть первичного ключа. Несколько колонок могут иметь эту подсказку для создания составного первичного ключа.

## Двигатель таблицы {#table-engine}
По умолчанию таблицы создаются с использованием движка таблиц `ReplicatedMergeTree` в ClickHouse. Вы можете указать альтернативный движок таблицы, используя `table_engine_type` с адаптером clickhouse:

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

Поддерживаемые значения:

- `merge_tree` - создаёт таблицы с использованием движка `MergeTree`
- `replicated_merge_tree` (по умолчанию) - создаёт таблицы с использованием движка `ReplicatedMergeTree`

## Поддержка хранения {#staging-support}

ClickHouse поддерживает Amazon S3, Google Cloud Storage и Azure Blob Storage в качестве мест назначения для хранения файлов.

`dlt` загружает файлы Parquet или jsonl в место хранения и использует функции таблиц ClickHouse для загрузки данных напрямую из сохранённых файлов.

Пожалуйста, обратитесь к документации по файловым системам, чтобы узнать, как настроить учетные данные для мест хранения:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

Чтобы запустить конвейер с включенным хранением:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # добавьте это для активации хранения
  dataset_name='chess_data'
)
```

### Использование Google Cloud Storage в качестве площадки для хранения {#using-google-cloud-storage-as-a-staging-area}
dlt поддерживает использование Google Cloud Storage (GCS) в качестве площадки для хранения при загрузке данных в ClickHouse. Это обрабатывается автоматически ключевыми функциями ClickHouse <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS таблиц</a>, которые dlt использует под капотом.

Функция таблицы GCS ClickHouse поддерживает только аутентификацию с использованием ключей Hash-based Message Authentication Code (HMAC). Для этого GCS предоставляет режим совместимости с S3, который эмулирует API Amazon S3. ClickHouse использует это, чтобы разрешить доступ к корзинам GCS через свою интеграцию S3.

Чтобы настроить GCS-охранитель с аутентификацией HMAC в dlt:

1. Создайте HMAC-ключи для вашей учетной записи службы GCS, следуя <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">руководству Google Cloud</a>.

2. Настройте HMAC-ключи, а также `client_email`, `project_id` и `private_key` для вашей учетной записи службы в настройках назначения ClickHouse вашего проекта dlt в `config.toml`:

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

Примечание: В дополнение к HMAC-ключам `gcp_access_key_id` и `gcp_secret_access_key` вам теперь также необходимо предоставить `client_email`, `project_id` и `private_key` для вашей учетной записи службы в разделе `[destination.filesystem.credentials]`. Это связано с тем, что поддержка GCS-охранителей теперь реализована как временное решение и все еще не оптимизирована.

dlt передаст эти учетные данные ClickHouse, который обрабатывает аутентификацию и доступ к GCS.

В настоящее время идет активная работа по упрощению и улучшению настройки GCS хранилища для назначения dlt ClickHouse в будущем. Правильная поддержка GCS-охранителей отслеживается в следующих вопросах GitHub:

- Сделать файловое назначение <a href="https://github.com/dlt-hub/dlt/issues/1272">работать</a> с gcs в режиме совместимости s3
- Поддержка площадки хранения Google Cloud Storage<a href="https://github.com/dlt-hub/dlt/issues/1181"> поддержка</a>

### Поддержка dbt {#dbt-support}
Интеграция с <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> в общем поддерживается через dbt-clickhouse.

### Синхронизация состояния `dlt` {#syncing-of-dlt-state}
Это назначение полностью поддерживает <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">синхронизацию состояния dlt</a>.
