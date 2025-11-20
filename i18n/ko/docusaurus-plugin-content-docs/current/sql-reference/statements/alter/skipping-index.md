---
'description': 'Manipulating Data Skipping Indices에 대한 문서'
'sidebar_label': 'INDEX'
'sidebar_position': 42
'slug': '/sql-reference/statements/alter/skipping-index'
'title': '데이터 스킵 인덱스 조작하기'
'toc_hidden_folder': true
'doc_type': 'reference'
---


# 데이터 스킵 인덱스 조작

다음의 작업이 가능합니다:

## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 테이블 메타데이터에 인덱스 설명을 추가합니다.

## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 테이블 메타데이터에서 인덱스 설명을 제거하고 디스크에서 인덱스 파일을 삭제합니다. 이는 [변경]( /sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 지정된 `partition_name`에 대해 보조 인덱스 `name`을 재구축합니다. 이는 [변경]( /sql-reference/statements/alter/index.md#mutations)으로 구현됩니다. `IN PARTITION` 부분이 생략되면 전체 테이블 데이터에 대해 인덱스를 재구축합니다.

## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 설명을 제거하지 않고 디스크에서 보조 인덱스 파일을 삭제합니다. 이는 [변경]( /sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

`ADD`, `DROP`, 및 `CLEAR` 명령은 메타데이터를 변경하거나 파일을 제거하는 데에만 가벼운 의미를 가집니다. 또한, ClickHouse Keeper 또는 ZooKeeper를 통해 인덱스 메타데이터를 동기화하면서 복제됩니다.

:::note    
인덱스 조작은 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 엔진(모든 [복제된](/engines/table-engines/mergetree-family/replication.md) 변형 포함)에 대해서만 지원됩니다.
:::
