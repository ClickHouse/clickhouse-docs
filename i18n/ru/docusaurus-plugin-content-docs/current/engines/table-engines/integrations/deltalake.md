---
description: 'Этот движок обеспечивает доступ только для чтения к существующим таблицам Delta Lake в Amazon S3.'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'Табличный движок DeltaLake'
doc_type: 'reference'
---



# Табличный движок DeltaLake

Этот движок обеспечивает интеграцию с существующими таблицами [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 в режиме только чтения.



## Создание таблицы {#create-table}

Обратите внимание, что таблица Delta Lake должна уже существовать в S3. Эта команда не принимает DDL-параметры для создания новой таблицы.

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

- `url` — URL бакета с путём к существующей таблице Delta Lake.
- `aws_access_key_id`, `aws_secret_access_key` — Долгосрочные учётные данные пользователя аккаунта [AWS](https://aws.amazon.com/). Используются для аутентификации запросов. Параметр необязательный. Если учётные данные не указаны, они берутся из файла конфигурации.

Параметры движка можно указать с помощью [именованных коллекций](/operations/named-collections.md).

**Пример**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
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
CREATE TABLE deltalake ENGINE=DeltaLake(deltalake_conf, filename = 'test_table')
```

### Кэш данных {#data-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование данных так же, как хранилища `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).


## См. также {#see-also}

- [Табличная функция deltaLake](../../../sql-reference/table-functions/deltalake.md)
