---
slug: /engines/table-engines/integrations/deltalake
sidebar_position: 40
sidebar_label: DeltaLake
title: "Движок таблицы DeltaLake"
description: "Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Delta Lake в Amazon S3."
---


# Движок таблицы DeltaLake

Этот движок обеспечивает интеграцию только для чтения с существующими [Delta Lake](https://github.com/delta-io/delta) таблицами в Amazon S3.

## Создать таблицу {#create-table}

Обратите внимание, что таблица Delta Lake должна уже существовать в S3, эта команда не принимает DDL параметры для создания новой таблицы.

``` sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

- `url` — URL корзины с путем к существующей таблице Delta Lake.
- `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя аккаунта [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации ваших запросов. Параметр является необязательным. Если учетные данные не указаны, они будут взяты из конфигурационного файла.

Параметры движка можно указать, используя [Именованные коллекции](/operations/named-collections.md).

**Пример**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

Использование именованных коллекций:

``` xml
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

Движок таблицы `Iceberg` и функция таблицы поддерживают кэширование данных так же, как и хранилища `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## См. также {#see-also}

- [функция таблицы deltaLake](../../../sql-reference/table-functions/deltalake.md)
