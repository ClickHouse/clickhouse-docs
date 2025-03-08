---
slug: /engines/table-engines/integrations/hudi
sidebar_position: 86
sidebar_label: Hudi
title: "Hudi Engine таблиц"
description: "Этот движок предоставляет только для чтения интеграцию с существующими таблицами Apache Hudi в Amazon S3."
---


# Hudi Engine таблиц

Этот движок предоставляет только для чтения интеграцию с существующими таблицами Apache [Hudi](https://hudi.apache.org/) в Amazon S3.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Hudi должна уже существовать в S3, эта команда не принимает параметры DDL для создания новой таблицы.

``` sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**Параметры движка**

- `url` — URL ведра с путем к существующей таблице Hudi.
- `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные пользователя аккаунта [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации ваших запросов. Параметр является необязательным. Если учетные данные не указаны, они используются из конфигурационного файла.

Параметры движка могут быть указаны с использованием [Named Collections](/operations/named-collections.md).

**Пример**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

Использование именованных коллекций:

``` xml
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

- [hudi функция таблицы](/sql-reference/table-functions/hudi.md)
