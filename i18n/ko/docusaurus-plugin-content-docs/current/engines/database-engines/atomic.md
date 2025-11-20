---
'description': '`Atomic` 엔진은 비차단 `DROP TABLE` 및 `RENAME TABLE` 쿼리, 그리고 원자 `EXCHANGE
  TABLES` 쿼리를 지원합니다. 기본적으로 `Atomic` 데이터베이스 엔진이 사용됩니다.'
'sidebar_label': '원자'
'sidebar_position': 10
'slug': '/engines/database-engines/atomic'
'title': '원자'
'doc_type': 'reference'
---


# Atomic 

`Atomic` 엔진은 비차단 [`DROP TABLE`](#drop-detach-table) 및 [`RENAME TABLE`](#rename-table) 쿼리와 원자적 [`EXCHANGE TABLES`](#exchange-tables) 쿼리를 지원합니다. `Atomic` 데이터베이스 엔진은 기본적으로 오픈 소스 ClickHouse에서 사용됩니다.

:::note
ClickHouse Cloud에서는 기본적으로 [`Shared` 데이터베이스 엔진](/cloud/reference/shared-catalog#shared-database-engine)이 사용되며, 위에서 언급한 작업도 지원합니다.
:::

## 데이터베이스 생성 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```

## 세부 사항 및 권장 사항 {#specifics-and-recommendations}

### 테이블 UUID {#table-uuid}

`Atomic` 데이터베이스의 각 테이블은 지속적인 [UUID](../../sql-reference/data-types/uuid.md)를 가지며, 다음 디렉토리에 데이터를 저장합니다:

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

여기서 `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`는 테이블의 UUID입니다.

기본적으로 UUID는 자동으로 생성됩니다. 그러나 사용자는 테이블을 생성할 때 UUID를 명시적으로 지정할 수 있지만, 이는 권장되지 않습니다.

예를 들어:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
`SHOW CREATE` 쿼리와 함께 UUID를 표시하려면 [show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 설정을 사용할 수 있습니다.
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) 쿼리는 UUID를 수정하거나 테이블 데이터를 이동하지 않습니다. 이러한 쿼리는 즉시 실행되며, 테이블을 사용하는 다른 쿼리가 완료되기를 기다리지 않습니다.

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE`을 사용할 때, 데이터가 제거되지 않습니다. `Atomic` 엔진은 테이블을 `/clickhouse_path/metadata_dropped/`로 메타데이터를 이동시켜 삭제된 것으로 표시하고 백그라운드 스레드에 알립니다. 최종 테이블 데이터 삭제까지의 지연 시간은 [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 설정에 의해 지정됩니다.
`synchronous` 모드를 사용하려면 `SYNC` 수정자를 지정할 수 있습니다. 이를 위해 [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 설정을 사용하세요. 이 경우 `DROP`은 테이블을 사용하는 실행 중인 `SELECT`, `INSERT` 및 기타 쿼리가 완료될 때까지 기다립니다. 테이블이 사용 중이지 않을 때 삭제됩니다.

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) 쿼리는 테이블이나 딕셔너리를 원자적으로 교환합니다. 예를 들어, 다음과 같은 비원자적 작업 대신:

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
원자적 작업을 사용할 수 있습니다:

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### ReplicatedMergeTree in atomic database {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 테이블의 경우, ZooKeeper의 경로와 복제본 이름에 대한 엔진 매개변수를 명시하지 않는 것이 좋습니다. 이 경우, 설정 매개변수 [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path)와 [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)이 사용됩니다. 엔진 매개변수를 명시적으로 지정하려면 `{uuid}` 매크로를 사용하는 것이 좋습니다. 이것은 ZooKeeper에서 각 테이블에 대해 고유한 경로가 자동으로 생성되도록 보장합니다.

### 메타데이터 디스크 {#metadata-disk}
`SETTINGS`에서 `disk`가 지정되면, 해당 디스크가 테이블 메타데이터 파일을 저장하는 데 사용됩니다.
예를 들어:

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```
지정되지 않은 경우, 기본적으로 `database_disk.disk`에 정의된 디스크가 사용됩니다.

## 추가 정보 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) 시스템 테이블
