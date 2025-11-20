---
'description': '이 엔진은 Keeper/ZooKeeper 클러스터를 일관된 키-값 저장소로 사용할 수 있게 하며, 선형적으로 일관된 쓰기
  및 순차적으로 일관된 읽기를 제공합니다.'
'sidebar_label': 'KeeperMap'
'sidebar_position': 150
'slug': '/engines/table-engines/special/keeper-map'
'title': 'KeeperMap 테이블 엔진'
'doc_type': 'reference'
---


# KeeperMap 테이블 엔진

이 엔진은 Keeper/ZooKeeper 클러스터를 사용하여 선형적으로 일관된 쓰기 및 순차적으로 일관된 읽기를 제공하는 일관된 키-값 저장소로 사용할 수 있습니다.

KeeperMap 저장 엔진을 사용하려면, `<keeper_map_path_prefix>` 구성에서 테이블이 저장될 ZooKeeper 경로를 정의해야 합니다.

예를 들어:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

여기서 경로는 다른 유효한 ZooKeeper 경로일 수 있습니다.

## 테이블 생성하기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

엔진 매개변수:

- `root_path` - `table_name`이 저장될 ZooKeeper 경로.  
이 경로는 `<keeper_map_path_prefix>` 구성에 의해 정의된 접두사를 포함해서는 안 됩니다. 접두사는 자동으로 `root_path`에 추가됩니다.  
또한, 형식 `auxiliary_zookeeper_cluster_name:/some/path`도 지원되며, 여기서 `auxiliary_zookeeper_cluster`는 `<auxiliary_zookeepers>` 구성에서 정의된 ZooKeeper 클러스터입니다.  
기본적으로 `<zookeeper>` 구성에서 정의된 ZooKeeper 클러스터가 사용됩니다.
- `keys_limit` - 테이블 내에서 허용되는 키의 수.  
이 제한은 소프트 제한이며, 일부 예외 상황에서는 더 많은 키가 테이블에 포함될 수 있습니다.
- `primary_key_name` – 컬럼 목록의 임의의 컬럼 이름.
- `primary key`는 반드시 지정해야 하며, 기본 키에 대한 컬럼은 하나만 지원합니다. 기본 키는 ZooKeeper 내에서 `node name`으로서 이진(serialized) 형태로 직렬화됩니다. 
- 기본 키 외의 컬럼은 해당 순서로 이진 형태로 직렬화되어 직렬화된 키로 정의된 결과 노드의 값으로 저장됩니다.
- 키가 `equals` 또는 `in` 필터링으로 쿼리되는 경우, `Keeper`에서 다중 키 조회용으로 최적화됩니다. 그렇지 않으면 모든 값이 검색됩니다.

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

와 함께

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

각 값은 `(v1, v2, v3)`의 이진 직렬화가 `/keeper_map_tables/keeper_map_table/data/serialized_key` 내의 `Keeper`에 저장됩니다.
추가적으로, 키의 수는 4로 소프트 제한이 있습니다.

같은 ZooKeeper 경로에 여러 테이블이 생성되면, 값은 최소한 하나의 테이블이 이를 사용하는 동안 유지됩니다.  
결과적으로, 테이블을 생성할 때 `ON CLUSTER` 절을 사용하고 여러 ClickHouse 인스턴스에서 데이터를 공유할 수 있습니다.  
물론 관련 없는 ClickHouse 인스턴스에서 동일한 경로로 `CREATE TABLE`을 수동으로 실행하여 동일한 데이터 공유 효과를 얻는 것도 가능합니다.

## 지원되는 작업 {#supported-operations}

### 삽입 {#inserts}

`KeeperMap`에 새 행이 삽입될 때, 키가 존재하지 않으면 키에 대한 새 항목이 생성됩니다.  
키가 존재하고 `keeper_map_strict_mode`가 `true`로 설정되어 있으면 예외가 발생하며, 그렇지 않으면 키에 대한 값이 덮어씌워집니다.

예시:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 삭제 {#deletes}

행은 `DELETE` 쿼리나 `TRUNCATE`를 사용하여 삭제할 수 있습니다.  
키가 존재하고 `keeper_map_strict_mode`가 `true`로 설정되어 있으면, 데이터를 가져오고 삭제하는 것은 원자성(atomic)을 만족해야만 성공합니다.

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### 업데이트 {#updates}

값은 `ALTER TABLE` 쿼리를 사용하여 업데이트할 수 있습니다. 기본 키는 업데이트할 수 없습니다.  
`keeper_map_strict_mode`가 `true`로 설정되어 있으면, 데이터를 가져오고 업데이트하는 것은 원자성(atomic)을 만족해야만 성공합니다.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 관련 내용 {#related-content}

- 블로그: [ClickHouse 및 Hex로 실시간 분석 앱 구축하기](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
