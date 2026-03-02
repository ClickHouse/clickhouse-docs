---
alias: []
description: 'MySQLDump 포맷에 대한 문서'
input_format: true
keywords: ['MySQLDump']
output_format: false
slug: /interfaces/formats/MySQLDump
title: 'MySQLDump'
doc_type: 'reference'
---

| 입력 | 출력  | 별칭 |
|-------|---------|-------|
| ✔     | ✗       |       |



## 설명 \{#description\}

ClickHouse는 MySQL [덤프](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)를 읽는 기능을 지원합니다.

덤프에서 하나의 테이블에 속한 `INSERT` 쿼리의 모든 데이터를 읽습니다. 
테이블이 둘 이상인 경우 기본적으로 첫 번째 테이블의 데이터만 읽습니다.

:::note
이 형식은 스키마 추론을 지원합니다. 덤프에 지정된 테이블에 대한 `CREATE` 쿼리가 포함되어 있으면 해당 쿼리에서 구조를 추론하고, 그렇지 않으면 `INSERT` 쿼리의 데이터에서 스키마를 추론합니다.
:::



## 사용 예시 \{#example-usage\}

다음 SQL 덤프 파일이 있다고 가정합니다:

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

다음 쿼리를 실행합니다.

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


## 포맷 설정 \{#format-settings\}

[`input_format_mysql_dump_table_name`](/operations/settings/settings-formats.md/#input_format_mysql_dump_table_name) 설정을 사용하여 데이터를 읽을 테이블 이름을 지정할 수 있습니다.
`input_format_mysql_dump_map_columns` 설정이 `1`로 되어 있고, 덤프에 지정된 테이블에 대한 `CREATE` 쿼리나 `INSERT` 쿼리 내 컬럼 이름에 대한 `CREATE` 쿼리가 포함되어 있는 경우, 입력 데이터의 컬럼은 이름을 기준으로 테이블의 컬럼에 매핑됩니다.
컬럼 이름을 알 수 없는 경우 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 되어 있으면 해당 컬럼은 건너뜁니다.