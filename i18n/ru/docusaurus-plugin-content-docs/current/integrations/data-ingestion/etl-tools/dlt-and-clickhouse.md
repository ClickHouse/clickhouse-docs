---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: 'Загрузка данных в ClickHouse с помощью интеграции dlt'
title: 'Подключение dlt к ClickHouse'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение dlt к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> — это библиотека с открытым исходным кодом, которую вы можете добавить в свои скрипты на Python для загрузки данных из различных, часто неструктурированных источников данных в хорошо структурированные, актуальные наборы данных.

## Установка dlt с ClickHouse {#install-dlt-with-clickhouse}

### Чтобы установить библиотеку `dlt` с зависимостями для ClickHouse: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## Руководство по настройке {#setup-guide}

### 1. Инициализируйте проект dlt {#1-initialize-the-dlt-project}

Начните с инициализации нового проекта `dlt` следующим образом:
```bash
dlt init chess clickhouse
```

:::note
Эта команда инициализирует ваш конвейер с шахматами в качестве источника и ClickHouse в качестве назначения.
:::

Указанная выше команда создает несколько файлов и директорий, включая `.dlt/secrets.toml` и файл зависимостей для ClickHouse. Вы можете установить необходимые зависимости, указанные в файле зависимостей, выполнив следующую команду:
```bash
pip install -r requirements.txt
```

или с помощью `pip install dlt[clickhouse]`, что устанавливает библиотеку `dlt` и необходимые зависимости для работы с ClickHouse в качестве назначения.

### 2. Настройка базы данных ClickHouse {#2-setup-clickhouse-database}

Чтобы загрузить данные в ClickHouse, вам необходимо создать базу данных ClickHouse. Вот общий план того, что вам нужно сделать:

1. Вы можете использовать существующую базу данных ClickHouse или создать новую.

2. Чтобы создать новую базу данных, подключитесь к вашему серверу ClickHouse, используя командный инструмент `clickhouse-client` или SQL-клиент по вашему выбору.

3. Выполните следующие SQL-команды, чтобы создать новую базу данных, пользователя и предоставить необходимые разрешения:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 3. Добавление учетных данных {#3-add-credentials}

Далее настройте учетные данные ClickHouse в файле `.dlt/secrets.toml`, как показано ниже:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # Имя базы данных, которую вы создали
username = "dlt"                         # Имя пользователя ClickHouse, по умолчанию "default"
password = "Dlt*12345789234567"          # Пароль ClickHouse, если есть
host = "localhost"                       # Хост сервера ClickHouse
port = 9000                              # HTTP порт ClickHouse, по умолчанию 9000
http_port = 8443                         # Порт HTTP для подключения к HTTP интерфейсу сервера ClickHouse. По умолчанию 8443.
secure = 1                               # Установите 1, если используете HTTPS, иначе 0.
dataset_table_separator = "___"          # Разделитель для имен таблиц наборов данных.
```

:::note
HTTP_PORT
Параметр `http_port` определяет номер порта, который будет использоваться при подключении к HTTP интерфейсу сервера ClickHouse. Это отличается от порта по умолчанию 9000, который используется для нативного протокола TCP.

Вы должны установить `http_port`, если не используете внешнее временное хранилище (т.е. вы не указываете параметр staging в вашем конвейере). Это связано с тем, что встроенное локальное хранилище ClickHouse использует библиотеку <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>, которая взаимодействует с ClickHouse через HTTP.

Убедитесь, что ваш сервер ClickHouse настроен на прием HTTP соединений на порту, указанном в `http_port`. Например, если вы установили `http_port = 8443`, тогда ClickHouse должен прослушивать HTTP запросы на порту 8443. Если вы используете внешнее временное хранилище, вы можете опустить параметр `http_port`, так как clickhouse-connect использоваться не будет.
:::

Вы можете передать строку подключения к базе данных, аналогичную той, что используется библиотекой `clickhouse-driver`. Учетные данные выше будут выглядеть следующим образом:

```bash

# оставьте это в начале вашего toml файла, перед началом любого раздела.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

## Режим записи {#write-disposition}

Все [режимы записи](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)
 поддерживаются.

Режимы записи в библиотеке dlt определяют, как данные должны быть записаны в назначение. Существует три типа режимов записи:

**Замена**: Этот режим заменяет данные в назначении данными из ресурса. Он удаляет все классы и объекты и воссоздает схему перед загрузкой данных. Вы можете узнать больше об этом <a href="https://dlthub.com/docs/general-usage/full-loading">здесь</a>.

**Слияние**: Этот режим записи сливает данные из ресурса с данными в назначении. Для режима `merge` необходимо указать `primary_key` для ресурса. Вы можете узнать больше об этом <a href="https://dlthub.com/docs/general-usage/incremental-loading">здесь</a>.

**Дополнение**: Это режим по умолчанию. Он добавляет данные к существующим данным в назначении, игнорируя поле `primary_key`.

## Загрузка данных {#data-loading}
Данные загружаются в ClickHouse самым эффективным способом, в зависимости от источника данных:

- Для локальных файлов используется библиотека `clickhouse-connect` для прямой загрузки файлов в таблицы ClickHouse с помощью команды `INSERT`.
- Для файлов в удаленном хранилище, таких как `S3`, `Google Cloud Storage` или `Azure Blob Storage`, используются функции таблиц ClickHouse, такие как s3, gcs и azureBlobStorage для чтения файлов и вставки данных в таблицы.

## Наборы данных {#datasets}

`Clickhouse` не поддерживает несколько наборов данных в одной базе данных, тогда как `dlt` полагается на наборы данных по нескольким причинам. Чтобы сделать `Clickhouse` совместимым с `dlt`, таблицы, созданные `dlt` в вашей базе данных `Clickhouse`, будут иметь свои имена с префиксом имени набора данных, разделенным настраиваемым `dataset_table_separator`. Кроме того, будет создана специальная таблица-сигнал, которая не содержит никаких данных, позволяя `dlt` распознавать, какие виртуальные наборы данных уже существуют в назначении `Clickhouse`.

## Поддерживаемые форматы файлов {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> является предпочтительным форматом как для прямой загрузки, так и для временного хранилища.
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> поддерживается как для прямой загрузки, так и для временного хранилища.

Назначение `clickhouse` имеет несколько специфических отклонений от стандартных SQL назначений:

1. `Clickhouse` имеет экспериментальный тип данных `object`, но мы обнаружили, что он немного непредсказуем, поэтому назначение dlt clickhouse будет загружать сложный тип данных в текстовый столбец. Если вам нужна эта функция, свяжитесь с нашим сообществом в Slack, и мы рассмотрим возможность ее добавления.
2. `Clickhouse` не поддерживает тип данных `time`. Время будет загружено в текстовый столбец.
3.  `Clickhouse` не поддерживает тип данных `binary`. Вместо этого, двоичные данные будут загружены в текстовый столбец. При загрузке из `jsonl` двоичные данные будут строкой base64, а при загрузке из parquet объект `binary` будет преобразован в `text`.
5. `Clickhouse` принимает добавление в таблицу с данными столбцов, которые не равны null.
6. `Clickhouse` может вызывать ошибки округления в определенных условиях при использовании типов данных float или double. Если вы не можете допустить ошибки округления, обязательно используйте тип данных decimal. Например, загрузка значения 12.7001 в столбец типа double с установленным форматом загрузчика на `jsonl` предсказуемо приведет к ошибке округления.

## Поддерживаемые подсказки столбцов {#supported-column-hints}
ClickHouse поддерживает следующие <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">подсказки столбцов</a>:

- `primary_key` - указывает, что столбец является частью первичного ключа. Несколько столбцов могут иметь эту подсказку для создания составного первичного ключа.

## Двигатель таблицы {#table-engine}
По умолчанию, таблицы создаются с использованием движка таблиц `ReplicatedMergeTree` в ClickHouse. Вы можете указать альтернативный движок таблицы, используя `table_engine_type` с адаптером clickhouse:

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

## Поддержка временного хранилища {#staging-support}

ClickHouse поддерживает Amazon S3, Google Cloud Storage и Azure Blob Storage в качестве назначения для временного хранилища файлов.

`dlt` будет загружать файлы Parquet или jsonl в указанное временное хранилище и использовать функции таблиц ClickHouse для загрузки данных непосредственно из временно сохраненных файлов.

Пожалуйста, обратитесь к документации файловой системы, чтобы узнать, как настроить учетные данные для назначений временного хранилища:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

Чтобы запустить конвейер с включенным временным хранилищем:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # добавьте это, чтобы активировать временное хранилище
  dataset_name='chess_data'
)
```

### Использование Google Cloud Storage в качестве временного хранилища {#using-google-cloud-storage-as-a-staging-area}
dlt поддерживает использование Google Cloud Storage (GCS) в качестве временного хранилища при загрузке данных в ClickHouse. Это обрабатывается автоматически с помощью <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">функции таблицы GCS</a> ClickHouse, которую dlt использует под капотом.

Функция таблицы clickhouse GCS поддерживает аутентификацию только с использованием ключей HMAC (Hash-based Message Authentication Code). Чтобы включить это, GCS предоставляет режим совместимости с S3, который эмулирует API Amazon S3. ClickHouse использует это для доступа к ведрам GCS через свою интеграцию S3.

Чтобы настроить временное хранилище GCS с аутентификацией HMAC в dlt:

1. Создайте ключи HMAC для вашей учетной записи службы GCS, следуя <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">руководству Google Cloud</a>.

2. Настройте ключи HMAC, а также `client_email`, `project_id` и `private_key` для вашей учетной записи службы в настройках ClickHouse назначения вашего проекта dlt в `config.toml`:

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

Примечание: В дополнение к ключам HMAC `bashgcp_access_key_id` и `gcp_secret_access_key`, теперь вам нужно предоставить `client_email`, `project_id` и `private_key` для вашей учетной записи службы в разделе `[destination.filesystem.credentials]`. Это связано с тем, что поддержка временного хранилища GCS в настоящее время реализована как временное решение и все еще не оптимизирована.

dlt передаст эти учетные данные ClickHouse, который будет обрабатывать аутентификацию и доступ к GCS.

В настоящее время ведется активная работа по упрощению и улучшению настройки временного хранилища GCS для назначения dlt в ClickHouse в будущем. Подробная поддержка временного хранилища GCS отслеживается в следующих вопросах на GitHub:

- Сделать назначение файловой системы <a href="https://github.com/dlt-hub/dlt/issues/1272">работающим</a> с gcs в режиме совместимости s3
- Поддержка временного хранилища Google Cloud Storage<a href="https://github.com/dlt-hub/dlt/issues/1181"></a>

### Поддержка dbt {#dbt-support}
Интеграция с <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> в целом поддерживается через dbt-clickhouse.

### Синхронизация состояния `dlt` {#syncing-of-dlt-state}
Это назначение полностью поддерживает <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">синхронизацию состояния dlt</a>.
