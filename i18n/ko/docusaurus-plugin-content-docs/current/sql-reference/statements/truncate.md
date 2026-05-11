---
description: 'TRUNCATE SQL 문에 대한 문서'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'TRUNCATE SQL 문'
doc_type: 'reference'
---

# TRUNCATE SQL 문 \{#truncate-statements\}

ClickHouse에서 `TRUNCATE` SQL 문은 테이블이나 데이터베이스의 구조는 유지한 채 모든 데이터를 빠르게 제거하는 데 사용됩니다.

## TRUNCATE TABLE \{#truncate-table\}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| Parameter            | Description                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `IF EXISTS`          | 테이블이 존재하지 않는 경우 오류가 발생하지 않도록 합니다. 생략하면 쿼리는 오류를 반환합니다.                                                |
| `db.name`            | 선택적 데이터베이스 이름입니다.                                                                                    |
| `ON CLUSTER cluster` | 지정된 클러스터 전체에서 명령을 실행합니다.                                                                             |
| `SYNC`               | 복제된 테이블을 사용할 때 레플리카 전반에서 TRUNCATE 작업(truncation)을 동기적으로 수행합니다. 생략하면 기본적으로 비동기적으로 TRUNCATE 작업이 수행됩니다. |

[alter&#95;sync](/operations/settings/settings#alter_sync) 설정을 사용하여 레플리카에서 작업이 실행될 때까지 대기하도록 설정할 수 있습니다.

비활성 레플리카가 `TRUNCATE` 쿼리를 실행할 때까지(초 단위로) 얼마나 오래 대기할지 [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 설정으로 지정할 수 있습니다.

:::note
`alter_sync`가 `2`로 설정되어 있고 일부 레플리카가 `replication_wait_for_inactive_replica_timeout` 설정에 지정된 시간보다 오래 비활성 상태이면 `UNFINISHED` 예외가 발생합니다.
:::

`TRUNCATE TABLE` 쿼리는 다음 테이블 엔진에 대해 **지원되지 않습니다**:

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)

## 모든 테이블 비우기 \{#truncate-all-tables\}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Parameter                               | Description                         |
| --------------------------------------- | ----------------------------------- |
| `ALL`                                   | 데이터베이스의 모든 테이블에서 데이터를 삭제합니다.        |
| `IF EXISTS`                             | 데이터베이스가 존재하지 않을 때 오류가 발생하지 않도록 합니다. |
| `db`                                    | 데이터베이스 이름입니다.                       |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | 패턴으로 테이블을 필터링합니다.                   |
| `ON CLUSTER cluster`                    | 클러스터 전체에서 명령을 실행합니다.                |

데이터베이스의 모든 테이블에서 모든 데이터를 삭제합니다.

## TRUNCATE DATABASE 문 \{#truncate-database\}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />

| Parameter            | Description                        |
| -------------------- | ---------------------------------- |
| `IF EXISTS`          | 데이터베이스가 존재하지 않더라도 오류가 발생하지 않게 합니다. |
| `db`                 | 데이터베이스 이름입니다.                      |
| `ON CLUSTER cluster` | 지정한 클러스터 전체에서 명령을 실행합니다.           |

해당 데이터베이스의 모든 테이블을 삭제하되, 데이터베이스 자체는 유지합니다. `IF EXISTS` 절을 생략하면 데이터베이스가 존재하지 않을 때 쿼리가 오류를 반환합니다.

:::note
`TRUNCATE DATABASE`는 `Replicated` 데이터베이스에서는 지원되지 않습니다. 대신 데이터베이스를 `DROP`한 후 다시 `CREATE`하십시오.
:::
