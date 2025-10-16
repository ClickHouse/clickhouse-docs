---
slug: '/interfaces/formats/MySQLDump'
description: 'Документация для формата MySQLDump'
title: MySQLDump
keywords: ['MySQLDump']
doc_type: reference
input_format: true
output_format: false
---
| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## Описание {#description}

ClickHouse поддерживает чтение MySQL [дампов](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html).

Он считывает все данные из запросов `INSERT`, принадлежащих одной таблице в дампе. 
Если имеется более одной таблицы, по умолчанию данные считываются из первой.

:::note
Этот формат поддерживает вывод схемы: если дамп содержит запрос `CREATE` для указанной таблицы, структура выводится из него, в противном случае схема выводится из данных запросов `INSERT`.
:::

## Пример использования {#example-usage}

Данный SQL дамп файл:

```sql title="dump.sql"
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `x` int DEFAULT NULL,
  `y` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `test` VALUES (1,NULL),(2,NULL),(3,NULL),(3,NULL),(4,NULL),(5,NULL),(6,7);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test 3` (
  `y` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `test 3` VALUES (1);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test2` (
  `x` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `test2` VALUES (1),(2),(3);
```

Мы можем выполнить следующие запросы:

```sql title="Query"
DESCRIBE TABLE file(dump.sql, MySQLDump) 
SETTINGS input_format_mysql_dump_table_name = 'test2'
```

```response title="Response"
┌─name─┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ x    │ Nullable(Int32) │              │                    │         │                  │                │
└──────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql title="Query"
SELECT *
FROM file(dump.sql, MySQLDump)
SETTINGS input_format_mysql_dump_table_name = 'test2'
```

```response title="Response"
┌─x─┐
│ 1 │
│ 2 │
│ 3 │
└───┘
```

## Настройки формата {#format-settings}

Вы можете указать имя таблицы, из которой следует читать данные, с помощью настройки [`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name).
Если настройка `input_format_mysql_dump_map_columns` установлена в `1`, и дамп содержит запрос `CREATE` для указанной таблицы или имена колонок в запросе `INSERT`, колонки из входных данных будут сопоставлены с колонками таблицы по имени.
Колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.