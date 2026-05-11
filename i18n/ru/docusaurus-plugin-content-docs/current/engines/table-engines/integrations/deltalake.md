---
description: 'Этот движок предоставляет доступ только для чтения к существующим таблицам Delta Lake в Amazon S3.'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'Движок таблиц DeltaLake'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Табличный движок DeltaLake \{#deltalake-table-engine\}

Этот табличный движок обеспечивает интеграцию с существующими таблицами [Delta Lake](https://github.com/delta-io/delta) в хранилищах S3, GCP и Azure и поддерживает как чтение, так и запись (начиная с v25.10).

## Создание таблицы DeltaLake \{#create-table\}

Чтобы создать таблицу DeltaLake, она уже должна существовать в хранилище S3, GCP или Azure. Команды ниже не принимают параметры DDL для создания новой таблицы.

<Tabs>
  <TabItem value="S3" label="S3" default>
    **Синтаксис**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,] [extra_credentials])
    ```

    **Параметры движка**

    * `url` — URL-адрес бакета с путём к существующей таблице Delta Lake.
    * `aws_access_key_id`, `aws_secret_access_key` - долгосрочные учетные данные пользователя аккаунта [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации своих запросов. Параметр является необязательным. Если учетные данные не указаны, используются данные из конфигурационного файла.
    * `extra_credentials` - Необязательно. Используется для передачи `role_arn` для доступа на основе ролей в ClickHouse Cloud. См. [Secure S3](/cloud/data-sources/secure-s3) для шагов настройки.

    Параметры движка могут быть заданы с использованием [именованных коллекций](/operations/named-collections.md).

    **Пример**

    ```sql
    CREATE TABLE deltalake
    ENGINE = DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
    ```

    Использование именованных коллекций:

    ```xml
    <clickhouse>
        <named_collections>
            <deltalake_conf>
                <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
                <access_key_id>ABC123<access_key_id>
                <secret_access_key>Abc+123</secret_access_key>
            </deltalake_conf>
        </named_collections>
    </clickhouse>
    ```

    ```sql
    CREATE TABLE deltalake
    ENGINE = DeltaLake(deltalake_conf, filename = 'test_table')
    ```
  </TabItem>

  <TabItem value="GCP" label="GCP" default>
    **Синтаксис**

    ```sql
    -- Использование HTTPS URL (рекомендуется)
    CREATE TABLE table_name
    ENGINE = DeltaLake('https://storage.googleapis.com/<bucket>/<path>/', '<access_key_id>', '<secret_access_key>')
    ```

    :::note[Неподдерживаемый gsutil URI]
    URI gsutil вида `gs://clickhouse-docs-example-bucket` не поддерживаются, пожалуйста, используйте URL, начинающийся с `https://storage.googleapis.com`.
    :::

    **Аргументы**

    * `url` — URL бакета GCS с путём к таблице Delta Lake. Должен использовать формат `https://storage.googleapis.com/<bucket>/<path>/`
      (конечная точка GCS XML API) или `gs://<bucket>/<path>/`, который автоматически конвертируется.
    * `access_key_id` — ключ доступа GCS. Создаётся через Google Cloud Console → Cloud Storage → Settings → Interoperability.
    * `secret_access_key` — секретный ключ GCS.

    **Именованные коллекции**

    Также можно использовать именованные коллекции.
    Например:

    ```sql
    CREATE NAMED COLLECTION gcs_creds AS
    access_key_id = '<access_key>',
    secret_access_key = '<secret>';

    CREATE TABLE gcpDeltaLake
    ENGINE = DeltaLake(gcs_creds, url = 'https://storage.googleapis.com/<bucket>/<path>')
    ```
  </TabItem>

  <TabItem value="Azure" label="Azure" default>
    **Синтаксис**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    ```

    **Аргументы**

    * `connection_string` — строка подключения Azure.
    * `storage_account_url` — URL учётной записи хранилища Azure (например, https://account.blob.core.windows.net).
    * `container_name` — имя контейнера Azure.
    * `blobpath` — путь к таблице Delta Lake внутри контейнера.
    * `account_name` — имя учётной записи хранилища Azure.
    * `account_key` — ключ учётной записи хранилища Azure.
  </TabItem>
</Tabs>

## Запись данных с использованием таблицы DeltaLake \{#insert-data\}

После того как вы создали таблицу с использованием табличного движка DeltaLake, вы можете вставить в неё данные следующим образом:

```sql
SET allow_experimental_delta_lake_writes = 1;

INSERT INTO deltalake(id, firstname, lastname, gender, age)
VALUES (1, 'John', 'Smith', 'M', 32);
```

:::note
Запись с использованием табличного движка поддерживается только через delta kernel.
Запись в Azure пока не поддерживается, но работает запись в S3 и GCS.
:::


### Кэш данных \{#data-cache\}

Движок таблиц `DeltaLake` и табличная функция поддерживают кэширование данных так же, как хранилища `S3`, `AzureBlobStorage`, `HDFS`. См. раздел ["Движок таблиц S3"](../../../engines/table-engines/integrations/s3.md#data-cache) для более подробной информации.

## См. также \{#see-also\}

- [табличная функция deltaLake](../../../sql-reference/table-functions/deltalake.md)