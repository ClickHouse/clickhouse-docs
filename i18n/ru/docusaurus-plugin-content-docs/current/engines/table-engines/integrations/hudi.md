---
description: 'Этот движок предоставляет интеграцию только для чтения с существующими таблицами Apache Hudi в Amazon S3.'
sidebar_label: 'Hudi'
sidebar_position: 86
slug: /engines/table-engines/integrations/hudi
title: 'Движок таблиц Hudi'
---


# Движок таблиц Hudi

Этот движок предоставляет интеграцию только для чтения с существующими таблицами Apache [Hudi](https://hudi.apache.org/) в Amazon S3.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Hudi должна уже существовать в S3, эта команда не принимает параметры DDL для создания новой таблицы.

```sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

- `url` — URL ведра с путем к существующей таблице Hudi.
- `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя учетной записи [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации своих запросов. Параметр является необязательным. Если учетные данные не указаны, они используются из файла конфигурации.

Параметры движка можно указать с помощью [Именованных коллекций](/operations/named-collections.md).

**Пример**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

Используя именованные коллекции:

```xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## Смотрите также {#see-also}

- [табличная функция hudi](/sql-reference/table-functions/hudi.md)
