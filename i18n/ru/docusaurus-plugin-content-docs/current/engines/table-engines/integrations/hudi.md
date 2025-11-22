---
description: 'Этот движок обеспечивает доступ только для чтения к существующим таблицам Apache Hudi в Amazon S3.'
sidebar_label: 'Hudi'
sidebar_position: 86
slug: /engines/table-engines/integrations/hudi
title: 'Табличный движок Hudi'
doc_type: 'reference'
---



# Табличный движок Hudi

Этот движок предоставляет доступ только для чтения к существующим таблицам Apache [Hudi](https://hudi.apache.org/), размещённым в Amazon S3.



## Создание таблицы {#create-table}

Обратите внимание, что таблица Hudi должна уже существовать в S3, данная команда не принимает DDL-параметры для создания новой таблицы.

```sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

- `url` — URL бакета с путём к существующей таблице Hudi.
- `aws_access_key_id`, `aws_secret_access_key` — Долгосрочные учётные данные пользователя аккаунта [AWS](https://aws.amazon.com/). Используются для аутентификации запросов. Параметр необязательный. Если учётные данные не указаны, они берутся из файла конфигурации.

Параметры движка можно указать с помощью [именованных коллекций](/operations/named-collections.md).

**Пример**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

Использование именованных коллекций:

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


## См. также {#see-also}

- [Табличная функция hudi](/sql-reference/table-functions/hudi.md)
