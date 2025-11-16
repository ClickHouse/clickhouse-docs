---
'description': 'TRUNCATE 문서'
'sidebar_label': 'TRUNCATE'
'sidebar_position': 52
'slug': '/sql-reference/statements/truncate'
'title': 'TRUNCATE 문'
'doc_type': 'reference'
---


# TRUNCATE Statements

ClickHouse의 `TRUNCATE` 문은 테이블 또는 데이터베이스의 모든 데이터를 빠르게 제거하면서 구조는 유지하는 데 사용됩니다.

## TRUNCATE TABLE {#truncate-table}
```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```
<br/>
| 매개변수              | 설명                                                                                            |
|-----------------------|--------------------------------------------------------------------------------------------------|
| `IF EXISTS`           | 테이블이 존재하지 않을 경우 오류를 방지합니다. 생략할 경우 쿼리는 오류를 반환합니다.               |
| `db.name`             | 선택적 데이터베이스 이름입니다.                                                                  |
| `ON CLUSTER cluster`  | 지정된 클러스터에서 명령을 실행합니다.                                                          |
| `SYNC`                | 복제된 테이블을 사용할 때 복제본에서 트렁케이션을 동기적으로 수행합니다. 생략할 경우 기본적으로 비동기적으로 트렁케이션이 수행됩니다. |

[alter_sync](/operations/settings/settings#alter_sync) 설정을 사용하여 복제본에서 실행될 작업을 기다리도록 설정할 수 있습니다.

[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 설정을 사용하여 비활성 복제본이 `TRUNCATE` 쿼리를 실행하기 위해 기다릴 시간을 초 단위로 지정할 수 있습니다.

:::note    
`alter_sync`가 `2`로 설정되고 일부 복제본이 `replication_wait_for_inactive_replica_timeout` 설정에 의해 지정된 시간 이상으로 비활성 상태일 경우, `UNFINISHED` 예외가 발생합니다.
:::

`TRUNCATE TABLE` 쿼리는 다음의 테이블 엔진에 대해 **지원되지 않습니다**:

- [`View`](../../engines/table-engines/special/view.md)
- [`File`](../../engines/table-engines/special/file.md)
- [`URL`](../../engines/table-engines/special/url.md)
- [`Buffer`](../../engines/table-engines/special/buffer.md)
- [`Null`](../../engines/table-engines/special/null.md)

## TRUNCATE ALL TABLES {#truncate-all-tables}
```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```
<br/>
| 매개변수                       | 설명                                         |
|-------------------------------|----------------------------------------------|
| `ALL`                         | 데이터베이스의 모든 테이블에서 데이터를 제거합니다.   |
| `IF EXISTS`                   | 데이터베이스가 존재하지 않을 경우 오류를 방지합니다.  |
| `db`                          | 데이터베이스 이름입니다.                       |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | 패턴에 따라 테이블을 필터링합니다.                  |
| `ON CLUSTER cluster`          | 클러스터 전역에서 명령을 실행합니다.             |

데이터베이스의 모든 테이블에서 모든 데이터를 제거합니다.

## TRUNCATE DATABASE {#truncate-database}
```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```
<br/>
| 매개변수              | 설명                                         |
|-----------------------|---------------------------------------------|
| `IF EXISTS`           | 데이터베이스가 존재하지 않을 경우 오류를 방지합니다. |
| `db`                  | 데이터베이스 이름입니다.                       |
| `ON CLUSTER cluster`  | 지정된 클러스터에서 명령을 실행합니다.         |

데이터베이스의 모든 테이블을 제거하지만 데이터베이스 자체는 유지합니다. `IF EXISTS` 절이 생략되면 데이터베이스가 존재하지 않을 경우 쿼리는 오류를 반환합니다.

:::note
`TRUNCATE DATABASE`는 `Replicated` 데이터베이스에 대해 지원되지 않습니다. 대신, 데이터베이스를 `DROP`하고 `CREATE`하십시오.
:::
