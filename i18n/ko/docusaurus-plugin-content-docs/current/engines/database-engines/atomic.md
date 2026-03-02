---
description: '`Atomic` 엔진은 논블로킹(non-blocking) `DROP TABLE` 및 `RENAME TABLE` 쿼리와 원자적(atomic) `EXCHANGE TABLES` 쿼리를 지원합니다. 기본적으로 `Atomic` 데이터베이스 엔진이 사용됩니다.'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
doc_type: 'reference'
---



# Atomic  \{#atomic\}

`Atomic` 엔진은 블로킹이 발생하지 않는 [`DROP TABLE`](#drop-detach-table) 및 [`RENAME TABLE`](#rename-table) 쿼리와 원자적인 [`EXCHANGE TABLES`](#exchange-tables) 쿼리를 지원합니다. `Atomic` 데이터베이스 엔진은 오픈 소스 ClickHouse에서 기본값으로 사용됩니다. 

:::note
ClickHouse Cloud에서는 [`Shared` 데이터베이스 엔진](/cloud/reference/shared-catalog#shared-database-engine)이 기본값으로 사용되며, 위에서 언급한 연산도 지원합니다.
:::



## 데이터베이스 생성 \{#creating-a-database\}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```


## 세부 사항 및 권장 사항 \{#specifics-and-recommendations\}

### 테이블 UUID \{#table-uuid\}

`Atomic` 데이터베이스의 각 테이블에는 영구적인 [UUID](../../sql-reference/data-types/uuid.md)가 있으며, 데이터는 다음 디렉터리에 저장됩니다:

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

여기서 `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`는 테이블의 UUID입니다.

기본적으로 UUID는 자동으로 생성됩니다. 그러나 테이블을 생성할 때 UUID를 직접 지정할 수도 있으나, 이는 권장되지 않습니다.

예를 들어:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
`SHOW CREATE` 쿼리에서 UUID를 표시하려면 [`show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil`](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 설정을 사용할 수 있습니다.
:::

### RENAME TABLE \{#rename-table\}

[`RENAME`](../../sql-reference/statements/rename.md) 쿼리는 UUID를 변경하거나 테이블 데이터를 이동하지 않습니다. 이 쿼리는 즉시 실행되며, 테이블을 사용 중인 다른 쿼리가 완료될 때까지 기다리지 않습니다.

### DROP/DETACH TABLE \{#drop-detach-table\}

`DROP TABLE`을 사용할 때는 즉시 데이터가 제거되지 않습니다. `Atomic` 엔진은 메타데이터를 `/clickhouse_path/metadata_dropped/`로 이동하여 테이블이 삭제된 것으로 표시하고 백그라운드 스레드에 알립니다. 최종적으로 테이블 데이터가 삭제되기까지의 지연 시간은 [`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 설정으로 지정됩니다.
`SYNC` 수정자를 사용하여 동기식 모드를 지정할 수 있습니다. 이를 위해 [`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 설정을 사용하십시오. 이 경우 `DROP`은 테이블을 사용 중인 실행 중인 `SELECT`, `INSERT` 및 기타 쿼리가 완료될 때까지 기다립니다. 테이블은 사용 중이 아닐 때 제거됩니다.

### EXCHANGE TABLES/DICTIONARIES \{#exchange-tables\}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) 쿼리는 테이블 또는 딕셔너리를 원자적으로 교환합니다. 예를 들어, 다음과 같은 비원자적 연산 대신:

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```

Atomic 엔진을 사용할 수 있습니다:

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### atomic 데이터베이스에서 ReplicatedMergeTree 사용 \{#replicatedmergetree-in-atomic-database\}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 테이블에서는 ZooKeeper 경로와 레플리카 이름에 대한 엔진 매개변수를 지정하지 않는 것이 좋습니다. 이 경우 구성 매개변수 [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) 및 [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)이 사용됩니다. 엔진 매개변수를 명시적으로 지정하려면 `{uuid}` 매크로를 사용하는 것이 좋습니다. 이렇게 하면 ZooKeeper에서 각 테이블마다 고유한 경로가 자동으로 생성됩니다.

### 메타데이터 디스크 \{#metadata-disk\}

`SETTINGS`에서 `disk`를 지정하면, 해당 디스크가 테이블 메타데이터 파일을 저장하는 데 사용됩니다.
예를 들면 다음과 같습니다:

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```

지정하지 않으면 `database_disk.disk`에 정의된 디스크가 기본적으로 사용됩니다.


## 참고 \{#see-also\}

- [system.databases](../../operations/system-tables/databases.md) 시스템 테이블
