---
'alias': []
'description': 'MySQLDump 형식에 대한 문서'
'input_format': true
'keywords':
- 'MySQLDump'
'output_format': false
'slug': '/interfaces/formats/MySQLDump'
'title': 'MySQLDump'
'doc_type': 'reference'
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 설명 {#description}

ClickHouse는 MySQL [덤프](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) 읽기를 지원합니다.

덤프에서 단일 테이블에 속하는 `INSERT` 쿼리의 모든 데이터를 읽습니다. 
테이블이 여러 개인 경우, 기본적으로 첫 번째 테이블의 데이터를 읽습니다.

:::note
이 형식은 스키마 추론을 지원합니다: 덤프에 지정된 테이블에 대한 `CREATE` 쿼리가 포함되어 있으면 구조가 그에 따라 유추되고, 그렇지 않은 경우 `INSERT` 쿼리의 데이터로부터 스키마가 유추됩니다.
:::

## 예제 사용법 {#example-usage}

다음 SQL 덤프 파일이 주어졌습니다:

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

다음 쿼리를 실행할 수 있습니다:

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

## 형식 설정 {#format-settings}

[`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name) 설정을 사용하여 데이터를 읽을 테이블의 이름을 지정할 수 있습니다.
`input_format_mysql_dump_map_columns` 설정이 `1`로 설정되고 덤프에 지정된 테이블 또는 컬럼 이름에 대한 `CREATE` 쿼리가 포함되면, 입력 데이터의 컬럼은 이름에 따라 테이블의 컬럼에 매핑됩니다.
알려지지 않은 이름의 컬럼은 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 설정된 경우 건너뜁니다.
