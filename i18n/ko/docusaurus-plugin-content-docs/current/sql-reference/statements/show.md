---
'description': 'SHOW에 대한 문서'
'sidebar_label': 'SHOW'
'sidebar_position': 37
'slug': '/sql-reference/statements/show'
'title': 'SHOW 문'
'doc_type': 'reference'
---


:::note

`SHOW CREATE (TABLE|DATABASE|USER)`는 다음 설정이 켜져 있지 않으면 비밀을 숨깁니다:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (서버 설정)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (형식 설정)

추가로, 사용자는 [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 권한을 가져야 합니다.
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

이 명령어는 지정된 객체를 만들기 위해 사용된 `CREATE` 쿼리를 포함하는 String 형식의 단일 컬럼을 반환합니다.

### Syntax {#syntax}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
이 명령어를 사용하여 시스템 테이블의 `CREATE` 쿼리를 얻으면, 테이블 구조만 선언하는 *가짜* 쿼리를 얻게 되며, 실제로 테이블을 생성하는 데 사용할 수 없습니다.
:::

## SHOW DATABASES {#show-databases}

이 명령어는 모든 데이터베이스의 목록을 출력합니다.

### Syntax {#syntax-1}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

이는 다음 쿼리와 동일합니다:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### Examples {#examples}

이 예제에서는 `SHOW`를 사용하여 이름에 'de'라는 기호 시퀀스를 포함하는 데이터베이스 이름을 얻습니다:

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

또는 이름에 'de'를 포함하지 않는 데이터베이스 이름을 가져올 수도 있습니다:

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

마지막으로, 첫 두 데이터베이스의 이름만 가져올 수 있습니다:

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### See also {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` 명령어는 테이블 목록을 표시합니다.

### Syntax {#syntax-2}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 절이 지정되지 않은 경우, 쿼리는 현재 데이터베이스의 테이블 목록을 반환합니다.

이 명령어는 다음 쿼리와 동일합니다:

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Examples {#examples-1}

이 예제에서는 `SHOW TABLES` 명령어를 사용하여 이름에 'user'를 포함하는 모든 테이블을 찾습니다:

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

대소문자를 구분하지 않고도 할 수 있습니다:

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

또는 이름에 's'가 포함되지 않은 테이블을 찾을 수 있습니다:

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

마지막으로, 첫 두 테이블의 이름만 가져올 수 있습니다:

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### See also {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` 명령어는 컬럼 목록을 표시합니다.

### Syntax {#syntax-3}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

데이터베이스와 테이블 이름은 `<db>.<table>`의 축약형으로 지정할 수 있으며, 이는 `FROM tab FROM db`와 `FROM db.tab`가 동등함을 의미합니다. 데이터베이스가 지정되지 않으면 쿼리는 현재 데이터베이스의 컬럼 목록을 반환합니다.

두 개의 선택적 키워드도 있습니다: `EXTENDED`와 `FULL`. `EXTENDED` 키워드는 현재 효과가 없으며, MySQL 호환성을 위해 존재합니다. `FULL` 키워드는 출력에 정렬, 주석 및 권한 컬럼을 포함하게 합니다.

`SHOW COLUMNS` 명령어는 다음 구조를 가진 결과 테이블을 생성합니다:

| Column      | Description                                                                                                                   | Type               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | 컬럼 이름                                                                                                                     | `String`           |
| `type`      | 컬럼 데이터 형식. 쿼리가 MySQL 와이어 프로토콜을 통해 이루어졌다면, MySQL에서의 동등한 형식 이름이 표시됩니다.                      | `String`           |
| `null`      | 컬럼 데이터 형식이 Nullable일 경우 `YES`, 그렇지 않으면 `NO`                                                                | `String`           |
| `key`       | 컬럼이 기본 키의 일부일 경우 `PRI`, 정렬 키의 일부일 경우 `SOR`, 그렇지 않으면 비어 있습니다.                                  | `String`           |
| `default`   | 컬럼의 기본 표현식이 `ALIAS`, `DEFAULT`, 또는 `MATERIALIZED` 형식인 경우, 그렇지 않으면 `NULL`입니다.                           | `Nullable(String)` |
| `extra`     | 추가 정보, 현재는 사용되지 않습니다.                                                                                          | `String`           |
| `collation` | (오직 `FULL` 키워드가 지정된 경우) 컬럼의 정렬 방식, ClickHouse는 컬럼별 정렬을 지원하지 않으므로 항상 `NULL`입니다.               | `Nullable(String)` |
| `comment`   | (오직 `FULL` 키워드가 지정된 경우) 컬럼에 대한 주석                                                                               | `String`           |
| `privilege` | (오직 `FULL` 키워드가 지정된 경우) 해당 컬럼에 대한 권한, 현재는 사용 불가능                                                      | `String`           |

### Examples {#examples-2}

이 예제에서는 `SHOW COLUMNS` 명령어를 사용하여 'orders' 테이블의 모든 컬럼에 대한 정보를 가져옵니다. 'delivery_'로 시작하는 컬럼들:

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### See also {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES` 명령어는 [딕셔너리](../../sql-reference/dictionaries/index.md) 목록을 표시합니다.

### Syntax {#syntax-4}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 절이 지정되지 않은 경우, 쿼리는 현재 데이터베이스의 딕셔너리 목록을 반환합니다.

다음 방법으로 `SHOW DICTIONARIES` 쿼리와 동일한 결과를 얻을 수 있습니다:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Examples {#examples-3}

다음 쿼리는 `system` 데이터베이스 내에서 `reg`가 포함된 이름을 가진 테이블 목록에서 처음 두 행을 선택합니다.

```sql title="Query"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Response"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

테이블의 기본 및 데이터 스킵 인덱스 목록을 표시합니다.

이 명령어는 주로 MySQL과의 호환성을 위해 존재합니다. 시스템 테이블 [`system.tables`](../../operations/system-tables/tables.md) (기본 키용) 및 [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (데이터 스킵 인덱스용)는 ClickHouse에 보다 네이티브한 방식으로 동등한 정보를 제공합니다.

### Syntax {#syntax-5}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

데이터베이스와 테이블 이름은 `<db>.<table>`의 축약형으로 지정할 수 있으며, 즉 `FROM tab FROM db`와 `FROM db.tab`는 동등합니다. 데이터베이스가 지정되지 않으면 쿼리는 현재 데이터베이스를 데이터베이스로 가정합니다.

선택적 키워드 `EXTENDED`는 현재 효과가 없으며, MySQL 호환성을 위해 존재합니다.

명령어는 다음 구조를 가진 결과 테이블을 생성합니다:

| Column          | Description                                                                                                              | Type               |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | 테이블 이름.                                                                                                          | `String`           |
| `non_unique`    | ClickHouse는 고유 제약 조건을 지원하지 않으므로 항상 `1`입니다.                                                       | `UInt8`            |
| `key_name`      | 인덱스의 이름, 인덱스가 기본 키 인덱스일 경우 `PRIMARY`.                                                                | `String`           |
| `seq_in_index`  | 기본 키 인덱스의 경우, `1`부터 시작하는 컬럼의 위치입니다. 데이터 스킵 인덱스의 경우: 항상 `1`.                        | `UInt8`            |
| `column_name`   | 기본 키 인덱스의 경우, 컬럼 이름입니다. 데이터 스킵 인덱스의 경우: `''` (빈 문자열), "표현식" 필드 참조.             | `String`           |
| `collation`     | 인덱스에서 컬럼의 정렬: 오름차순일 경우 `A`, 내림차순일 경우 `D`, 정렬되지 않은 경우 `NULL`.                             | `Nullable(String)` |
| `cardinality`   | 인덱스의 카디널리티 추정값(인덱스 내 고유 값의 수). 현재 항상 0입니다.                                                  | `UInt64`           |
| `sub_part`      | ClickHouse는 MySQL과 같은 인덱스 접두사를 지원하지 않으므로 항상 `NULL`입니다.                                       | `Nullable(String)` |
| `packed`        | ClickHouse는 포장된 인덱스를 지원하지 않으므로 항상 `NULL`입니다.                                                      | `Nullable(String)` |
| `null`          | 현재는 사용되지 않음                                                                                                   |                    |
| `index_type`    | 인덱스 유형, 예: `PRIMARY`, `MINMAX`, `BLOOM_FILTER` 등                                                              | `String`           |
| `comment`       | 인덱스에 대한 추가 정보, 현재 항상 `''` (빈 문자열).                                                                  | `String`           |
| `index_comment` | ClickHouse의 인덱스에는 `COMMENT` 필드가 없으므로 `''` (빈 문자열)입니다.                                              | `String`           |
| `visible`       | 인덱스가 최적화 프로그램에 노출되는 경우, 항상 `YES`.                                                                | `String`           |
| `expression`    | 데이터 스킵 인덱스의 경우 인덱스 표현식입니다. 기본 키 인덱스의 경우: `''` (빈 문자열)입니다.                          | `String`           |

### Examples {#examples-4}

이 예제에서는 `SHOW INDEX` 명령어를 사용하여 'tbl' 테이블의 모든 인덱스에 대한 정보를 얻습니다.

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

### See also {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST {#show-processlist}

[`system.processes`](/operations/system-tables/processes) 테이블의 내용을 출력하여 현재 처리 중인 쿼리 목록을 표시하되, `SHOW PROCESSLIST` 쿼리는 제외합니다.

### Syntax {#syntax-6}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` 쿼리는 현재 쿼리에 대한 데이터를 반환합니다.

:::tip
콘솔에서 실행하세요:

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` 명령어는 사용자에 대한 권한을 표시합니다.

### Syntax {#syntax-7}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

사용자가 지정되지 않으면, 쿼리는 현재 사용자에 대한 권한을 반환합니다.

`WITH IMPLICIT` 수정자는 암시적 권한을 표시할 수 있게 합니다(예: `GRANT SELECT ON system.one`).

`FINAL` 수정자는 사용자와 그에 부여된 역할로부터 모든 권한을 병합합니다(상속 포함).

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` 명령어는 [사용자 생성](../../sql-reference/statements/create/user.md) 시 사용된 매개 변수를 표시합니다.

### Syntax {#syntax-8}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` 명령어는 [역할 생성](../../sql-reference/statements/create/role.md) 시 사용된 매개 변수를 표시합니다.

### Syntax {#syntax-9}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` 명령어는 [행 정책 생성](../../sql-reference/statements/create/row-policy.md) 시 사용된 매개 변수를 표시합니다.

### Syntax {#syntax-10}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` 명령어는 [할당량 생성](../../sql-reference/statements/create/quota.md) 시 사용된 매개 변수를 표시합니다.

### Syntax {#syntax-11}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` 명령어는 [설정 프로파일 생성](../../sql-reference/statements/create/settings-profile.md) 시 사용된 매개 변수를 표시합니다.

### Syntax {#syntax-12}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` 명령어는 [사용자 계정](../../guides/sre/user-management/index.md#user-account-management) 이름 목록을 반환합니다. 
사용자 계정 매개 변수를 보려면 시스템 테이블 [`system.users`](/operations/system-tables/users)를 확인하세요.

### Syntax {#syntax-13}

```sql title="Syntax"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` 명령어는 [역할 목록](../../guides/sre/user-management/index.md#role-management)을 반환합니다. 
다른 매개 변수를 보려면, 
시스템 테이블 [`system.roles`](/operations/system-tables/roles)와 [`system.role_grants`](/operations/system-tables/role_grants)를 확인하세요.

### Syntax {#syntax-14}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` 명령어는 [설정 프로파일 목록](../../guides/sre/user-management/index.md#settings-profiles-management)을 반환합니다. 
사용자 계정 매개 변수를 보려면 시스템 테이블 [`settings_profiles`](/operations/system-tables/settings_profiles)를 확인하세요.

### Syntax {#syntax-15}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` 명령어는 지정된 테이블에 대한 [행 정책 목록](../../guides/sre/user-management/index.md#row-policy-management)을 반환합니다. 
사용자 계정 매개 변수를 보려면 시스템 테이블 [`system.row_policies`](/operations/system-tables/row_policies)를 확인하세요.

### Syntax {#syntax-16}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` 명령어는 [할당량 목록](../../guides/sre/user-management/index.md#quotas-management)을 반환합니다. 
할당량 매개 변수를 보려면 시스템 테이블 [`system.quotas`](/operations/system-tables/quotas)를 확인하세요.

### Syntax {#syntax-17}

```sql title="Syntax"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` 명령어는 모든 사용자 또는 현재 사용자의 [할당량](../../operations/quotas.md) 소비를 반환합니다. 
다른 매개 변수를 보려면 시스템 테이블 [`system.quotas_usage`](/operations/system-tables/quotas_usage)와 [`system.quota_usage`](/operations/system-tables/quota_usage)를 확인하세요.

### Syntax {#syntax-18}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

`SHOW ACCESS` 명령어는 모든 [사용자](../../guides/sre/user-management/index.md#user-account-management), [역할](../../guides/sre/user-management/index.md#role-management), [프로파일](../../guides/sre/user-management/index.md#settings-profiles-management) 등을 보여주며, 그들의 모든 [부여](../../sql-reference/statements/grant.md#privileges)도 포함됩니다.

### Syntax {#syntax-19}

```sql title="Syntax"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` 명령어는 클러스터 목록을 반환합니다. 
사용 가능한 모든 클러스터는 [`system.clusters`](../../operations/system-tables/clusters.md) 테이블에 나열되어 있습니다.

:::note
`SHOW CLUSTER name` 쿼리는 지정된 클러스터 이름에 대해 `system.clusters` 테이블의 `cluster`, `shard_num`, `replica_num`, `host_name`, `host_address`, 및 `port`를 표시합니다.
:::

### Syntax {#syntax-20}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### Examples {#examples-5}

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

## SHOW SETTINGS {#show-settings}

`SHOW SETTINGS` 명령어는 시스템 설정 및 해당 값의 목록을 반환합니다. 
이 쿼리는 [`system.settings`](../../operations/system-tables/settings.md) 테이블에서 데이터를 선택합니다.

### Syntax {#syntax-21}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### Clauses {#clauses}

`LIKE|ILIKE`는 설정 이름의 일치 패턴을 지정할 수 있게 합니다. '%'나 '_'와 같은 글로브를 포함할 수 있습니다. `LIKE` 절은 대소문자 구분, `ILIKE`는 대소문자 무시입니다.

`CHANGED` 절이 사용될 경우, 쿼리는 기본값에서 변경된 설정만 반환합니다.

### Examples {#examples-6}

`LIKE` 절이 있는 쿼리:

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE` 절이 있는 쿼리:

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

`CHANGED` 절이 있는 쿼리:

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING` 명령어는 지정된 설정 이름에 대한 설정 값을 출력합니다.

### Syntax {#syntax-22}

```sql title="Syntax"
SHOW SETTING <name>
```

### See also {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) 테이블

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### Examples {#examples-7}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### See also {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) 테이블

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` 명령어는 [`system.table_engines`](../../operations/system-tables/table_engines.md) 테이블의 내용을 출력합니다. 
이 테이블은 서버에서 지원하는 테이블 엔진 및 기능 지원 정보의 설명을 포함합니다.

### Syntax {#syntax-23}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### See also {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) 테이블

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` 명령어는 [`system.functions`](../../operations/system-tables/functions.md) 테이블의 내용을 출력합니다.

### Syntax {#syntax-24}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` 또는 `ILIKE` 절이 지정되면, 쿼리는 제공된 `<pattern>`과 일치하는 시스템 함수 목록을 반환합니다.

### See Also {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) 테이블

## SHOW MERGES {#show-merges}

`SHOW MERGES` 명령어는 병합 목록을 반환합니다. 
모든 병합은 [`system.merges`](../../operations/system-tables/merges.md) 테이블에 나열됩니다:

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| `table`             | 테이블 이름.                                              |
| `database`          | 테이블이 있는 데이터베이스의 이름입니다.                  |
| `estimate_complete` | 완료까지 예상되는 시간(초 단위).                         |
| `elapsed`           | 병합이 시작된 이후 경과 시간(초 단위).                     |
| `progress`          | 완료된 작업의 백분율(0-100%).                             |
| `is_mutation`       | 해당 프로세스가 부분 변형인 경우 1.                        |
| `size_compressed`   | 병합된 데이터의 총 압축된 크기.                           |
| `memory_usage`      | 병합 프로세스의 메모리 소비량.                            |

### Syntax {#syntax-25}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### Examples {#examples-8}

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
