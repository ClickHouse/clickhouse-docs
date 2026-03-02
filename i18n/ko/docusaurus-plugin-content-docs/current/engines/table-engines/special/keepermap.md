---
description: '이 엔진을 사용하면 Keeper/ZooKeeper 클러스터를 선형화 가능한 쓰기(linearizable writes)와 순차적으로 일관된 읽기(sequentially consistent reads)를 제공하는 일관된 키-값(key-value) 저장소로 활용할 수 있습니다.'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap 테이블 엔진'
doc_type: 'reference'
---



# KeeperMap 테이블 엔진 \{#keepermap-table-engine\}

이 엔진을 사용하면 Keeper/ZooKeeper 클러스터를 선형화 가능한 쓰기와 순차적 일관성이 보장되는 읽기를 제공하는 일관된 키-값 저장소로 사용할 수 있습니다.

KeeperMap 스토리지 엔진을 활성화하려면 `<keeper_map_path_prefix>` 설정을 사용하여 테이블이 저장될 ZooKeeper 경로를 지정해야 합니다.

예를 들어:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

여기서 path에는 다른 임의의 유효한 ZooKeeper 경로를 사용할 수 있습니다.


## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

Engine parameters:

* `root_path` - `table_name`이 저장될 ZooKeeper 경로입니다.
  이 경로에는 `<keeper_map_path_prefix>` 설정에 정의된 접두사가 포함되면 안 되며, 접두사는 자동으로 `root_path`에 추가됩니다.
  또한 `auxiliary_zookeeper_cluster_name:/some/path` 형식도 지원되며, 여기서 `auxiliary_zookeeper_cluster`는 `<auxiliary_zookeepers>` 설정 안에 정의된 ZooKeeper 클러스터입니다.
  기본적으로 `<zookeeper>` 설정 안에 정의된 ZooKeeper 클러스터가 사용됩니다.
* `keys_limit` - 테이블에 허용되는 키의 개수입니다.
  이 한도는 소프트 리밋이므로, 일부 엣지 케이스에서는 더 많은 키가 테이블에 저장될 수 있습니다.
* `primary_key_name` – 컬럼 목록에 포함된 임의의 컬럼 이름입니다.
* `primary key`는 반드시 지정해야 하며, 기본 키로는 하나의 컬럼만 지원합니다. 기본 키는 ZooKeeper 안에서 `node name`으로 바이너리 형식으로 직렬화됩니다.
* 기본 키 이외의 컬럼들은 해당 순서대로 바이너리로 직렬화되며, 직렬화된 키로 정의되는 결과 노드의 값으로 저장됩니다.
* 키에 대한 `equals` 또는 `in` 필터링이 있는 쿼리는 `Keeper`에서 다중 키 조회로 최적화되며, 그 외에는 모든 값을 가져옵니다.

예시:

```sql
CREATE TABLE keeper_map_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = KeeperMap('/keeper_map_table', 4)
PRIMARY KEY key
```

사용하여

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

각 값은 `(v1, v2, v3)`의 바이너리 직렬화 형태이며, `Keeper` 안의 `/keeper_map_tables/keeper_map_table/data/serialized_key`에 저장됩니다.
또한 키 개수에는 4개라는 소프트 한도(soft limit)가 있습니다.

동일한 ZooKeeper 경로에 여러 테이블이 생성되면, 이를 사용하는 테이블이 최소 1개라도 존재하는 동안 값이 유지됩니다.
따라서 테이블을 생성할 때 `ON CLUSTER` 절을 사용하여 여러 ClickHouse 인스턴스 간에 데이터를 공유할 수 있습니다.
물론 서로 관련 없는 ClickHouse 인스턴스에서도 동일한 경로로 `CREATE TABLE`을 수동으로 실행하여 동일한 데이터 공유 효과를 얻을 수 있습니다.


## 지원되는 연산 \{#supported-operations\}

### Insert \{#inserts\}

새 행이 `KeeperMap`에 삽입될 때 키가 존재하지 않으면 해당 키에 대한 새 항목이 생성됩니다.
키가 존재하고 `keeper_map_strict_mode` SETTING이 `true`로 설정되어 있으면 예외가 발생합니다. 그렇지 않으면 해당 키의 값이 덮어쓰여집니다.

예시:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 삭제 \{#deletes\}

행은 `DELETE` 쿼리 또는 `TRUNCATE`를 사용하여 삭제할 수 있습니다.
키가 존재하고 `keeper_map_strict_mode` 설정이 `true`로 되어 있는 경우, 조회 및 삭제 작업은 원자적으로 실행될 수 있을 때에만 성공합니다.

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### 업데이트 \{#updates\}

값은 `ALTER TABLE` 쿼리를 사용하여 업데이트할 수 있습니다. 기본 키는 업데이트할 수 없습니다.
`keeper_map_strict_mode` 설정 값이 `true`이면, 데이터 가져오기와 업데이트는 원자적으로 실행되는 경우에만 성공합니다.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse와 Hex로 실시간 분석 애플리케이션 구축하기](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
