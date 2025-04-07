---
description: 'Этот движок обеспечивает интеграцию только для чтения с существующими таблицами 
  Delta Lake в Amazon S3.'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'Движок таблиц DeltaLake'
---


# Движок таблиц DeltaLake

Этот движок обеспечивает интеграцию только для чтения с существующими [Delta Lake](https://github.com/delta-io/delta) таблицами в Amazon S3.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Delta Lake должна уже существовать в S3, эта команда не принимает DDL параметры для создания новой таблицы.

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

- `url` — URL корзины с путём к существующей таблице Delta Lake.
- `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя учетной записи [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации ваших запросов. Параметр является необязательным. Если учетные данные не указаны, они будут использованы из файла конфигурации.

Параметры движка можно указать с помощью [Именованных Коллекций](/operations/named-collections.md).

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

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование данных так же, как и `S3`, `AzureBlobStorage`, `HDFS` хранилища. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## См. также {#see-also}

- [табличная функция deltaLake](../../../sql-reference/table-functions/deltalake.md)
