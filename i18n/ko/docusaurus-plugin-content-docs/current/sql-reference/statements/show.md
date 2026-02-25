---
description: 'SHOW에 대한 문서'
sidebar_label: 'SHOW'
sidebar_position: 37
slug: /sql-reference/statements/show
title: 'SHOW SQL 문'
doc_type: 'reference'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)`는 다음 설정이 활성화되어 있지 않으면 비밀 정보를 숨깁니다:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (서버 설정)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (형식 설정)  

또한 사용자에게는 [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 권한이 있어야 합니다.
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE \{#show-create-table--dictionary--view--database\}

이 SQL 문들은 지정된 객체를 생성할 때 사용된 `CREATE` 쿼리가 포함된 String 타입의 단일 컬럼을 반환합니다.

### 구문 \{#syntax\}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
이 구문으로 system 테이블의 `CREATE` 쿼리를 조회하면,
테이블 구조만 선언하고 실제 테이블을 생성하는 데에는 사용할 수 없는
*가짜* 쿼리가 반환됩니다.
:::


## SHOW DATABASES \{#show-databases\}

이 문은 모든 데이터베이스 목록을 출력합니다.

### 구문 \{#syntax-1\}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

다음 쿼리와 동일합니다:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```


### 예시 \{#examples\}

이 예시에서는 이름에 문자열 &#39;de&#39;가 포함된 데이터베이스 이름을 조회하기 위해 `SHOW`를 사용합니다:

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

대소문자를 구분하지 않고도 수행할 수 있습니다:

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

또는 이름에 &#39;de&#39;가 포함되지 않은 데이터베이스 이름을 조회합니다:

```sql title="Query"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

마지막으로, 처음 두 개의 데이터베이스 이름만 가져올 수 있습니다.

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```


### 함께 보기 \{#see-also\}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES \{#show-tables\}

`SHOW TABLES` 문은 테이블 목록을 표시합니다.

### 구문 \{#syntax-2\}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 절을 지정하지 않으면 쿼리는 현재 데이터베이스의 테이블 목록을 반환합니다.

이 구문은 다음 쿼리와 동일합니다.

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```


### 예시 \{#examples-1\}

이 예제에서는 `SHOW TABLES` 문을 사용하여 이름에 &#39;user&#39;가 포함된 모든 테이블을 찾습니다.

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

대소문자를 구분하지 않는 방식으로도 할 수 있습니다:

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

또는 이름에 문자 &#39;s&#39;가 들어 있지 않은 테이블을 찾으려면:

```sql title="Query"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="Response"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

마지막으로 처음 두 개 테이블의 이름만 조회합니다.

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```


### 관련 항목 \{#see-also-1\}

- [`테이블 생성`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS \{#show_columns\}

`SHOW COLUMNS` 문은 컬럼 목록을 표시합니다.

### 구문 \{#syntax-3\}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

데이터베이스와 테이블 이름은 `<db>.<table>`과 같이 축약된 형식으로 지정할 수 있으며,
이는 `FROM tab FROM db`와 `FROM db.tab`이 동일하다는 의미입니다.
데이터베이스가 지정되지 않은 경우, 쿼리는 현재 데이터베이스의 컬럼 목록을 반환합니다.

또한 `EXTENDED`와 `FULL` 두 개의 선택적 키워드가 있습니다. `EXTENDED` 키워드는 현재 아무 효과도 없으며,
MySQL 호환성을 위해 존재합니다. `FULL` 키워드는 출력에 정렬 규칙(collation), 주석(comment) 및 권한(privilege) 컬럼을 포함하도록 합니다.

`SHOW COLUMNS` 문은 다음과 같은 구조의 결과 테이블을 생성합니다:

| Column      | Description                                                                                 | Type               |
| ----------- | ------------------------------------------------------------------------------------------- | ------------------ |
| `field`     | 컬럼의 이름                                                                                      | `String`           |
| `type`      | 컬럼 데이터 타입입니다. 쿼리가 MySQL wire protocol(와이어 프로토콜)을 통해 수행된 경우, MySQL에서의 동등한 타입 이름이 표시됩니다.      | `String`           |
| `null`      | 컬럼 데이터 타입이 널 허용이면 `YES`, 그렇지 않으면 `NO`                                                       | `String`           |
| `key`       | 컬럼이 기본 키의 일부이면 `PRI`, 정렬 키의 일부이면 `SOR`, 그 외의 경우 비어 있음                                       | `String`           |
| `default`   | 컬럼이 `ALIAS`, `DEFAULT`, 또는 `MATERIALIZED` 타입인 경우 컬럼의 기본 표현식, 그렇지 않으면 `NULL`                 | `Nullable(String)` |
| `extra`     | 추가 정보로, 현재는 사용되지 않습니다                                                                       | `String`           |
| `collation` | (`FULL` 키워드가 지정된 경우에만) 컬럼의 정렬 규칙(collation)으로, ClickHouse는 컬럼 단위 정렬 규칙을 지원하지 않으므로 항상 `NULL` | `Nullable(String)` |
| `comment`   | (`FULL` 키워드가 지정된 경우에만) 컬럼에 대한 주석                                                            | `String`           |
| `privilege` | (`FULL` 키워드가 지정된 경우에만) 해당 컬럼에 대해 보유한 권한으로, 현재는 표시되지 않습니다                                    | `String`           |


### 예시 \{#examples-2\}

이 예제에서는 `SHOW COLUMNS` 구문을 사용하여 &#39;orders&#39; 테이블의 모든 컬럼 정보를, 이름이 &#39;delivery&#95;&#39;로 시작하는 컬럼부터 가져옵니다:

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```


### 참고 \{#see-also-2\}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES \{#show-dictionaries\}

`SHOW DICTIONARIES` 문은 [Dictionaries](./create/dictionary/index.md) 목록을 표시합니다.

### 구문 \{#syntax-4\}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 절을 지정하지 않으면 쿼리는 현재 데이터베이스의 딕셔너리 목록을 반환합니다.

다음과 같은 방식으로 `SHOW DICTIONARIES` 쿼리와 동일한 결과를 얻을 수 있습니다:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```


### 예시 \{#examples-3\}

다음 쿼리는 이름에 `reg`가 포함된 `system` 데이터베이스의 테이블 목록 중에서 처음 두 개의 행을 선택합니다.

```sql title="Query"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Response"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```


## SHOW INDEX \{#show-index\}

테이블의 프라이머리 키와 데이터 스키핑 인덱스 목록을 표시합니다.

이 구문은 주로 MySQL과의 호환성을 위해 제공됩니다. 시스템 테이블 [`system.tables`](../../operations/system-tables/tables.md) (프라이머리 키용)과 [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (데이터 스키핑 인덱스용)은 동일한 정보를 제공하지만, ClickHouse에 보다 자연스러운 방식으로 제공합니다.

### 구문 \{#syntax-5\}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

데이터베이스와 테이블 이름은 `<db>.<table>` 형식으로 축약하여 지정할 수 있습니다. 즉, `FROM tab FROM db`와 `FROM db.tab`은
동일합니다. 데이터베이스를 지정하지 않으면 쿼리는 현재 데이터베이스를 사용한다고 가정합니다.

선택적 키워드 `EXTENDED`는 현재 아무 효과도 없으며, MySQL 호환성을 위해 존재합니다.

이 구문은 다음과 같은 구조를 가진 결과 테이블을 생성합니다:

| Column          | Description                                                                       | Type               |
| --------------- | --------------------------------------------------------------------------------- | ------------------ |
| `table`         | 테이블 이름입니다.                                                                        | `String`           |
| `non_unique`    | ClickHouse는 고유성 제약 조건을 지원하지 않으므로 항상 `1`입니다.                                       | `UInt8`            |
| `key_name`      | 인덱스 이름입니다. 인덱스가 기본 키 인덱스인 경우 `PRIMARY`입니다.                                        | `String`           |
| `seq_in_index`  | 기본 키 인덱스의 경우, 컬럼의 위치(1부터 시작)입니다. 데이터 스키핑 인덱스의 경우에는 항상 `1`입니다.                     | `UInt8`            |
| `column_name`   | 기본 키 인덱스의 경우, 컬럼 이름입니다. 데이터 스키핑 인덱스의 경우에는 `''`(빈 문자열)이며, 「expression」 필드를 참조하십시오. | `String`           |
| `collation`     | 인덱스에서 컬럼의 정렬 순서입니다. 오름차순이면 `A`, 내림차순이면 `D`, 정렬되지 않은 경우 `NULL`입니다.                 | `Nullable(String)` |
| `cardinality`   | 인덱스 카디널리티(인덱스 내 고유 값의 개수)에 대한 추정치입니다. 현재는 항상 0입니다.                                | `UInt64`           |
| `sub_part`      | ClickHouse는 MySQL과 같은 인덱스 프리픽스를 지원하지 않으므로 항상 `NULL`입니다.                           | `Nullable(String)` |
| `packed`        | ClickHouse는 MySQL과 같은 packed 인덱스를 지원하지 않으므로 항상 `NULL`입니다.                         | `Nullable(String)` |
| `null`          | 현재 사용되지 않습니다.                                                                     |                    |
| `index_type`    | 인덱스 유형입니다. 예를 들어 `PRIMARY`, `MINMAX`, `BLOOM_FILTER` 등입니다.                        | `String`           |
| `comment`       | 인덱스에 대한 추가 정보입니다. 현재는 항상 `''`(빈 문자열)입니다.                                          | `String`           |
| `index_comment` | ClickHouse의 인덱스는 MySQL처럼 `COMMENT` 필드를 가질 수 없으므로 `''`(빈 문자열)입니다.                  | `String`           |
| `visible`       | 인덱스가 옵티마이저에 보이는 경우, 항상 `YES`입니다.                                                  | `String`           |
| `expression`    | 데이터 스키핑 인덱스의 경우, 인덱스 표현식입니다. 기본 키 인덱스의 경우에는 `''`(빈 문자열)입니다.                       | `String`           |


### 예제 \{#examples-4\}

이 예제에서는 `SHOW INDEX` 구문을 사용하여 테이블 &#39;tbl&#39;의 모든 인덱스에 대한 정보를 얻습니다.

```sql title="Query"
SHOW INDEX FROM 'tbl'
```

```text title="Response"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
│ tbl   │          1 │ mm1_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ a, c, d    │
│ tbl   │          1 │ mm2_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ c, d, e    │
│ tbl   │          1 │ PRIMARY  │ 1            │ c           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ PRIMARY  │ 2            │ a           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ set_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ SET          │         │               │ YES     │ e          │
└───────┴────────────┴──────────┴──────────────┴─────────────┴───────────┴─────────────┴──────────┴────────┴──────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
```


### 참고 항목 \{#see-also-3\}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST \{#show-processlist\}

현재 처리 중인 쿼리 목록을 포함하는 [`system.processes`](/operations/system-tables/processes) 테이블의 내용을 출력합니다. `SHOW PROCESSLIST` 쿼리는 제외됩니다.

### 구문 \{#syntax-6\}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` 쿼리는 현재 실행 중인 모든 쿼리에 대한 데이터를 반환합니다.

:::tip
콘솔에서 실행하십시오:

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```

:::


## SHOW GRANTS \{#show-grants\}

`SHOW GRANTS` 문은 사용자의 권한을 표시합니다.

### 구문 \{#syntax-7\}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

사용자가 명시되지 않은 경우, 쿼리는 현재 사용자에 대한 권한을 반환합니다.

`WITH IMPLICIT` 수정자는 암시적으로 부여된 권한(예: `GRANT SELECT ON system.one`)을 표시합니다.

`FINAL` 수정자는 사용자와 해당 사용자에게 부여된 역할(상속 포함)에서 나온 모든 권한을 병합합니다.


## SHOW CREATE USER \{#show-create-user\}

`SHOW CREATE USER` SQL 문은 [사용자 생성](../../sql-reference/statements/create/user.md)에 사용된 매개변수를 보여줍니다.

### 구문 \{#syntax-8\}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```


## SHOW CREATE ROLE \{#show-create-role\}

`SHOW CREATE ROLE` SQL 문은 [역할(role) 생성](../../sql-reference/statements/create/role.md)에 사용된 매개변수를 표시합니다.

### 구문 \{#syntax-9\}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```


## SHOW CREATE ROW POLICY \{#show-create-row-policy\}

`SHOW CREATE ROW POLICY` SQL 문은 [ROW POLICY 생성](../../sql-reference/statements/create/row-policy.md) 시 사용된 매개변수를 출력합니다.

### 구문 \{#syntax-10\}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```


## SHOW CREATE QUOTA \{#show-create-quota\}

`SHOW CREATE QUOTA` SQL 문은 [QUOTA를 생성할 때](../../sql-reference/statements/create/quota.md) 사용된 매개변수를 표시합니다.

### 구문 \{#syntax-11\}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```


## SHOW CREATE SETTINGS PROFILE \{#show-create-settings-profile\}

`SHOW CREATE SETTINGS PROFILE` SQL 문은 [SETTINGS PROFILE 생성](../../sql-reference/statements/create/settings-profile.md) 시 사용된 매개변수를 보여줍니다.

### 구문 \{#syntax-12\}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```


## SHOW USERS \{#show-users\}

`SHOW USERS` 구문은 [사용자 계정](../../guides/sre/user-management/index.md#user-account-management) 이름 목록을 반환합니다. 
사용자 계정의 매개변수를 확인하려면 시스템 테이블 [`system.users`](/operations/system-tables/users)를 참조하십시오.

### 구문 \{#syntax-13\}

```sql title="Syntax"
SHOW USERS
```


## SHOW ROLES \{#show-roles\}

`SHOW ROLES` 구문은 [roles](../../guides/sre/user-management/index.md#role-management) 목록을 반환합니다. 
추가 매개변수를 확인하려면 
시스템 테이블 [`system.roles`](/operations/system-tables/roles) 및 [`system.role_grants`](/operations/system-tables/role_grants)를 참조하십시오.

### 구문 \{#syntax-14\}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```


## SHOW PROFILES \{#show-profiles\}

`SHOW PROFILES` 문은 [설정 프로필(setting profiles)](../../guides/sre/user-management/index.md#settings-profiles-management) 목록을 반환합니다. 
사용자 계정 매개변수를 확인하려면 시스템 테이블 [`settings_profiles`](/operations/system-tables/settings_profiles)를 참조하십시오.

### 구문 \{#syntax-15\}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```


## SHOW POLICIES \{#show-policies\}

`SHOW POLICIES` 문은 지정된 테이블에 대한 [row 정책(행 정책)](../../guides/sre/user-management/index.md#row-policy-management) 목록을 반환합니다.  
사용자 계정 매개변수를 확인하려면 시스템 테이블 [`system.row_policies`](/operations/system-tables/row_policies)를 조회하십시오.

### 구문 \{#syntax-16\}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```


## SHOW QUOTAS \{#show-quotas\}

`SHOW QUOTAS` 구문은 [quotas](../../guides/sre/user-management/index.md#quotas-management) 목록을 반환합니다. 
quotas의 매개변수를 확인하려면 시스템 테이블 [`system.quotas`](/operations/system-tables/quotas)를 참조하십시오.

### 구문 \{#syntax-17\}

```sql title="Syntax"
SHOW QUOTAS
```


## SHOW QUOTA \{#show-quota\}

`SHOW QUOTA` 문은 모든 사용자 또는 현재 사용자에 대한 [quota](../../operations/quotas.md) 사용량을 반환합니다.  
다른 매개변수를 확인하려면 시스템 테이블 [`system.quotas_usage`](/operations/system-tables/quotas_usage)와 [`system.quota_usage`](/operations/system-tables/quota_usage)를 참조하십시오.

### 구문 \{#syntax-18\}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```


## SHOW ACCESS \{#show-access\}

`SHOW ACCESS` SQL 문은 모든 [사용자](../../guides/sre/user-management/index.md#user-account-management), [역할](../../guides/sre/user-management/index.md#role-management), [프로필](../../guides/sre/user-management/index.md#settings-profiles-management) 등과 이들에 대한 모든 [권한 부여(grant)](../../sql-reference/statements/grant.md#privileges)를 보여줍니다.

### 문법 \{#syntax-19\}

```sql title="Syntax"
SHOW ACCESS
```


## SHOW CLUSTER(S) \{#show-clusters\}

`SHOW CLUSTER(S)` 문은 클러스터 목록을 반환합니다. 
사용 가능한 모든 클러스터는 [`system.clusters`](../../operations/system-tables/clusters.md) 테이블에 나열됩니다.

:::note
`SHOW CLUSTER name` 쿼리는 지정한 클러스터 이름에 대해 `system.clusters` 테이블의 `cluster`, `shard_num`, `replica_num`, `host_name`, `host_address`, `port` 열을 표시합니다.
:::

### 구문 \{#syntax-20\}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```


### 예제 \{#examples-5\}

```sql title="Query"
SHOW CLUSTERS;
```

```text title="Response"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="Query"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="Response"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="Query"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="Response"
Row 1:
──────
cluster:                 test_shard_localhost
shard_num:               1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
```


## SHOW SETTINGS \{#show-settings\}

`SHOW SETTINGS` 구문은 시스템 설정 목록과 각 설정 값들을 반환합니다. 
해당 구문은 [`system.settings`](../../operations/system-tables/settings.md) 테이블에서 데이터를 조회합니다.

### 구문 \{#syntax-21\}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```


### 절 \{#clauses\}

`LIKE|ILIKE`는 설정 이름과 일치하는 패턴을 지정할 수 있게 합니다. 이 패턴에는 `%` 또는 `_` 같은 와일드카드를 포함할 수 있습니다. `LIKE` 절은 대소문자를 구분하고, `ILIKE` 절은 대소문자를 구분하지 않습니다.

`CHANGED` 절을 사용하면 쿼리는 기본값에서 변경된 설정만 반환합니다.

### 예제 \{#examples-6\}

`LIKE` 절을 사용하는 쿼리:

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE` 절을 사용한 쿼리:

```sql title="Query"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="Response"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

`CHANGED` 절을 사용한 쿼리:

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```


## SHOW SETTING \{#show-setting\}

`SHOW SETTING` 문은 지정된 설정 이름에 대한 값을 출력합니다.

### 문법 \{#syntax-22\}

```sql title="Syntax"
SHOW SETTING <name>
```


### 관련 항목 \{#see-also-4\}

- [`system.settings`](../../operations/system-tables/settings.md) 테이블

## 파일시스템 캐시 조회(SHOW FILESYSTEM CACHES) \{#show-filesystem-caches\}

### 예제 \{#examples-7\}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```


### 함께 보기 \{#see-also-5\}

- [`system.settings`](../../operations/system-tables/settings.md) 테이블

## SHOW ENGINES \{#show-engines\}

`SHOW ENGINES` 구문은 서버가 지원하는 테이블 엔진과 해당 기능 지원 정보를 설명하는 [`system.table_engines`](../../operations/system-tables/table_engines.md) 테이블의 내용을 출력합니다.

### 구문 \{#syntax-23\}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```


### 참고 \{#see-also-6\}

- [system.table_engines](../../operations/system-tables/table_engines.md) 테이블

## SHOW FUNCTIONS \{#show-functions\}

`SHOW FUNCTIONS` 문은 [`system.functions`](../../operations/system-tables/functions.md) 테이블의 내용을 표시합니다.

### 구문 \{#syntax-24\}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` 또는 `ILIKE` 절을 지정하면, 쿼리는 이름이 지정한 `<pattern>`과 일치하는 시스템 함수 목록을 반환합니다.


### 참고 자료 \{#see-also-7\}

- [`system.functions`](../../operations/system-tables/functions.md) 테이블

## SHOW MERGES \{#show-merges\}

`SHOW MERGES` 구문은 머지 목록을 반환합니다.  
모든 머지는 [`system.merges`](../../operations/system-tables/merges.md) 테이블에 나열됩니다:

| 컬럼                | 설명                                                               |
|---------------------|--------------------------------------------------------------------|
| `table`             | 테이블 이름.                                                      |
| `database`          | 테이블이 속한 데이터베이스 이름.                                 |
| `estimate_complete` | 완료까지의 예상 시간(초 단위).                                   |
| `elapsed`           | 머지가 시작된 이후 경과 시간(초 단위).                           |
| `progress`          | 완료된 작업 비율(0–100 퍼센트).                                  |
| `is_mutation`       | 이 프로세스가 파트 뮤테이션이면 1.                               |
| `size_compressed`   | 머지된 파트의 압축된 데이터 전체 크기.                           |
| `memory_usage`      | 머지 프로세스의 메모리 사용량.                                   |

### 구문 \{#syntax-25\}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```


### 예제 \{#examples-8\}

```sql title="Query"
SHOW MERGES;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="Query"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```


## SHOW CREATE MASKING POLICY \{#show-create-masking-policy\}

`SHOW CREATE MASKING POLICY` SQL 문은 [마스킹 정책 생성](../../sql-reference/statements/create/masking-policy.md)에 사용된 매개변수를 보여줍니다.

### 구문 \{#syntax-26\}

```sql title="Syntax"
SHOW CREATE MASKING POLICY name ON [database.]table
```
