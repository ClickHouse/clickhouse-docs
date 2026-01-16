---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'подключение', 'интеграция', 'etl', 'интеграция данных']
description: 'Загрузка данных в ClickHouse с помощью dlt'
title: 'Подключение dlt к ClickHouse'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
doc_type: 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# Подключение dlt к ClickHouse \\{#connect-dlt-to-clickhouse\\}

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> — это библиотека с открытым исходным кодом, которую можно добавить в Python-скрипты, чтобы загружать данные из различных, часто «грязных» источников в хорошо структурированные, постоянно обновляемые наборы данных.

## Установка dlt с ClickHouse \\{#install-dlt-with-clickhouse\\}

### Установите библиотеку `dlt` с зависимостями для ClickHouse: \\{#to-install-the-dlt-library-with-clickhouse-dependencies\\}

```bash
pip install "dlt[clickhouse]"
```

## Руководство по настройке \\{#setup-guide\\}

<VerticalStepper headerLevel="h3">

### Инициализация проекта dlt \\{#1-initialize-the-dlt-project\\}

Начните с инициализации нового проекта `dlt` следующим образом:

```bash
dlt init chess clickhouse
```

:::note
Эта команда инициализирует ваш конвейер с chess в качестве источника и ClickHouse в качестве назначения.
:::

Приведённая выше команда создаёт несколько файлов и каталогов, включая `.dlt/secrets.toml` и файл требований для ClickHouse. Вы можете установить необходимые зависимости, указанные в файле требований, выполнив следующую команду:

```bash
pip install -r requirements.txt
```

или с помощью `pip install dlt[clickhouse]`, что устанавливает библиотеку `dlt` и необходимые зависимости для работы с ClickHouse в качестве назначения.

### Настройка базы данных ClickHouse \\{#2-setup-clickhouse-database\\}

Для загрузки данных в ClickHouse необходимо создать базу данных ClickHouse. Ниже приведён общий план действий:

1. Вы можете использовать существующую базу данных ClickHouse или создать новую.

2. Для создания новой базы данных подключитесь к серверу ClickHouse с помощью инструмента командной строки `clickhouse-client` или SQL-клиента по вашему выбору.

3. Выполните следующие SQL-команды для создания новой базы данных, пользователя и предоставления необходимых разрешений:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### Добавление учётных данных \\{#3-add-credentials\\}

Далее настройте учётные данные ClickHouse в файле `.dlt/secrets.toml`, как показано ниже:

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

:::note HTTP_PORT
Параметр `http_port` указывает номер порта, используемый при подключении к HTTP-интерфейсу сервера ClickHouse. Это отличается от порта по умолчанию 9000, который используется для нативного протокола TCP.

Вы должны установить `http_port`, если не используете внешнее промежуточное хранилище (т. е. не устанавливаете параметр staging в вашем конвейере). Это связано с тем, что встроенное промежуточное хранилище ClickHouse использует библиотеку <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse-connect</a>, которая взаимодействует с ClickHouse по HTTP.

Убедитесь, что ваш сервер ClickHouse настроен на приём HTTP-соединений на порту, указанном в `http_port`. Например, если вы установили `http_port = 8443`, то ClickHouse должен прослушивать HTTP-запросы на порту 8443. Если вы используете внешнее промежуточное хранилище, вы можете опустить параметр `http_port`, поскольку clickhouse-connect не будет использоваться в этом случае.
:::

Вы можете передать строку подключения к базе данных, аналогичную той, что используется библиотекой `clickhouse-driver`. Приведённые выше учётные данные будут выглядеть следующим образом:

```bash
# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>

## Режим записи \\{#write-disposition\\}

Поддерживаются все [режимы записи](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition).

Режимы записи в библиотеке dlt определяют, как следует записывать данные в целевое хранилище. Существует три типа режимов записи:

**Replace**: Этот режим заменяет данные в целевом хранилище данными из ресурса. Он удаляет все классы и объекты схемы и заново создаёт схему перед загрузкой данных. Подробнее об этом можно узнать <a href="https://dlthub.com/docs/general-usage/full-loading">здесь</a>.

**Merge**: Этот режим записи объединяет данные из ресурса с данными в целевом хранилище. Для режима `merge` необходимо указать `primary_key` для ресурса. Подробнее об этом можно узнать <a href="https://dlthub.com/docs/general-usage/incremental-loading">здесь</a>.

**Append**: Это режим по умолчанию. Он добавляет данные к существующим данным в целевом хранилище, игнорируя поле `primary_key`.

## Загрузка данных \\{#data-loading\\}
Данные загружаются в ClickHouse с использованием наиболее эффективного метода в зависимости от источника данных:

- Для локальных файлов используется библиотека `clickhouse-connect` для непосредственной загрузки файлов в таблицы ClickHouse с помощью команды `INSERT`.
- Для файлов в удалённом хранилище, таком как `S3`, `Google Cloud Storage` или `Azure Blob Storage`, используются табличные функции ClickHouse, такие как s3, gcs и azureBlobStorage, для чтения файлов и загрузки данных в таблицы.

## Наборы данных \\{#datasets\\}

`Clickhouse` не поддерживает несколько наборов данных в одной базе данных, тогда как `dlt` по ряду причин основывается на концепции наборов данных. Чтобы `Clickhouse` корректно работал с `dlt`, имена таблиц, создаваемых `dlt` в вашей базе данных `Clickhouse`, будут начинаться с имени набора данных, разделённого настраиваемым `dataset_table_separator`. Кроме того, будет создана специальная сигнальная таблица, которая не содержит никаких данных и позволяет `dlt` распознавать, какие виртуальные наборы данных уже существуют в пункте назначения `Clickhouse`.

## Поддерживаемые форматы файлов \\{#supported-file-formats\\}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> — предпочтительный формат как для прямой загрузки, так и для промежуточного хранения (staging).
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> поддерживается как для прямой загрузки, так и для промежуточного хранения (staging).

Назначение (destination) `clickhouse` имеет несколько специфических отличий от стандартных SQL-назначений:

1. В `ClickHouse` есть экспериментальный тип данных `object`, но на практике он ведёт себя несколько непредсказуемо, поэтому назначение dlt clickhouse будет загружать сложный тип данных в текстовый столбец. Если вам нужна эта возможность, присоединяйтесь к нашему сообществу в Slack, и мы рассмотрим её добавление.
2. `ClickHouse` не поддерживает тип данных `time`. Значения времени будут загружаться в столбец типа `text`.
3. `ClickHouse` не поддерживает тип данных `binary`. Вместо этого двоичные данные будут загружаться в столбец типа `text`. При загрузке из `jsonl` двоичные данные будут представлять собой строку в формате base64, а при загрузке из parquet объект `binary` будет преобразован в `text`.
5. `ClickHouse` позволяет добавлять в уже заполненную таблицу столбцы с ограничением `NOT NULL`.
6. `ClickHouse` при определённых условиях может давать ошибки округления при использовании типов данных float или double. Если для вас недопустимы ошибки округления, обязательно используйте тип данных decimal. Например, загрузка значения 12.7001 в столбец типа double при формате файлов загрузчика, установленном в `jsonl`, предсказуемо приведёт к ошибке округления.

## Поддерживаемые подсказки для столбцов \\{#supported-column-hints\\}
ClickHouse поддерживает следующие <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">подсказки для столбцов</a>:

- `primary_key` — помечает столбец как часть первичного ключа. Для создания составного первичного ключа этой подсказкой можно пометить несколько столбцов.

## Табличный движок \\{#table-engine\\}

По умолчанию таблицы создаются с использованием табличного движка `ReplicatedMergeTree` в ClickHouse. Вы можете указать другой табличный движок с помощью параметра `table_engine_type` в адаптере ClickHouse:

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

Поддерживаемые значения:

* `merge_tree` — создаёт таблицы с использованием движка `MergeTree`
* `replicated_merge_tree` (по умолчанию) — создаёт таблицы с использованием движка `ReplicatedMergeTree`

## Поддержка промежуточного хранилища \\{#staging-support\\}

ClickHouse поддерживает Amazon S3, Google Cloud Storage и Azure Blob Storage в качестве целевых промежуточных хранилищ файлов.

`dlt` будет выгружать файлы Parquet или jsonl в промежуточное хранилище и использовать табличные функции ClickHouse для загрузки данных непосредственно из этих файлов.

Обратитесь к документации по файловой системе, чтобы узнать, как настроить учетные данные для промежуточных хранилищ:

* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

Чтобы запустить конвейер с включённым промежуточным хранилищем:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### Использование Google Cloud Storage как промежуточного хранилища \\{#using-google-cloud-storage-as-a-staging-area\\}

dlt поддерживает использование Google Cloud Storage (GCS) в качестве промежуточного хранилища при загрузке данных в ClickHouse. Это выполняется автоматически с помощью <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">табличной функции GCS</a> ClickHouse, которую dlt использует под капотом.

Табличная функция GCS ClickHouse поддерживает аутентификацию только с использованием ключей Hash-based Message Authentication Code (HMAC). Для этого GCS предоставляет режим совместимости с S3, эмулирующий API Amazon S3. ClickHouse использует это, чтобы получать доступ к бакетам GCS через свою интеграцию с S3.

Чтобы настроить промежуточное хранилище GCS с аутентификацией HMAC в dlt:

1. Создайте HMAC-ключи для вашего сервисного аккаунта GCS, следуя <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">руководству Google Cloud</a>.

2. Укажите HMAC-ключи, а также `client_email`, `project_id` и `private_key` для вашего сервисного аккаунта в настройках назначения ClickHouse вашего проекта dlt в файле `config.toml`:

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

Примечание: В дополнение к HMAC‑ключам `bashgcp_access_key_id` и `gcp_secret_access_key` теперь нужно указать `client_email`, `project_id` и `private_key` для вашей учетной записи службы (service account) в секции `[destination.filesystem.credentials]`. Это связано с тем, что поддержка промежуточного размещения (staging) в GCS сейчас реализована как временное обходное решение и пока не оптимизирована.

dlt передаст эти учетные данные в ClickHouse, который будет отвечать за аутентификацию и доступ к GCS.

Ведётся активная работа по упрощению и улучшению настройки промежуточного размещения в GCS для назначения (destination) ClickHouse dlt в будущем. Полноценная поддержка GCS staging отслеживается в следующих задачах GitHub:

* Обеспечить работу файлового назначения <a href="https://github.com/dlt-hub/dlt/issues/1272">с GCS</a> в режиме совместимости с S3
* <a href="https://github.com/dlt-hub/dlt/issues/1181">Поддержка области промежуточного размещения Google Cloud Storage</a>

### Поддержка dbt \\{#dbt-support\\}

Интеграция с <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> в целом поддерживается через dbt-clickhouse.

### Синхронизация состояния `dlt` \\{#syncing-of-dlt-state\\}

Это назначение полностью поддерживает синхронизацию состояния <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a>.
