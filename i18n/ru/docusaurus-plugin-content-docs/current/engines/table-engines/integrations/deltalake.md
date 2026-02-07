---
description: 'Этот движок предоставляет доступ только для чтения к существующим таблицам Delta Lake в Amazon S3.'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'Движок таблиц DeltaLake'
doc_type: 'reference'
---

# Табличный движок DeltaLake \{#deltalake-table-engine\}

Этот табличный движок обеспечивает интеграцию с существующими таблицами [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 и поддерживает как чтение, так и запись (начиная с v25.10).

## Создание таблицы \{#create-table\}

Учтите, что таблица Delta Lake уже должна существовать в S3: эта команда не принимает параметры DDL для создания новой таблицы.

```sql
CREATE TABLE deltalake
ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

* `url` — URL-адрес бакета с путём к существующей таблице Delta Lake.
* `aws_access_key_id`, `aws_secret_access_key` — долгосрочные учетные данные пользователя аккаунта [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации своих запросов. Параметр является необязательным. Если учетные данные не указаны, используются данные из конфигурационного файла.

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


### Кэш данных \{#data-cache\}

Движок таблиц `DeltaLake` и табличная функция поддерживают кэширование данных так же, как хранилища `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## Вставка данных \{#insert-data\}

После того как вы создали таблицу с использованием табличного движка DeltaLake, вы можете вставить в неё данные следующим образом:

```sql
SET allow_experimental_delta_lake_writes = 1;

INSERT INTO deltalake(id, firstname, lastname, gender, age)
VALUES (1, 'John', 'Smith', 'M', 32);
```


## См. также \{#see-also\}

- [табличная функция deltaLake](../../../sql-reference/table-functions/deltalake.md)