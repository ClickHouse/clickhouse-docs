---
description: 'Data Skipping 인덱스 조작에 대한 문서'
sidebar_label: 'INDEX'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'Data Skipping 인덱스 조작'
toc_hidden_folder: true
doc_type: 'reference'
---



# Data Skipping 인덱스 다루기 \{#manipulating-data-skipping-indices\}

다음 작업을 수행할 수 있습니다.



## ADD INDEX \{#add-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 테이블 메타데이터에 인덱스 정의를 추가합니다.



## DROP INDEX \{#drop-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 테이블 메타데이터에서 인덱스 정의를 제거하고 디스크에서 인덱스 파일을 삭제합니다. [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.



## MATERIALIZE INDEX \{#materialize-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 지정된 `partition_name`에 대한 보조 인덱스 `name`을 재구성합니다. [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다. `IN PARTITION` 부분을 생략하면 테이블의 전체 데이터에 대해 인덱스를 재구성합니다.



## CLEAR INDEX \{#clear-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 보조 인덱스 파일을 디스크에서 삭제하지만 인덱스 정의는 제거하지 않습니다. [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

`ADD`, `DROP`, `CLEAR` 명령은 메타데이터만 변경하거나 파일만 제거하므로 가벼운 작업입니다.
또한 이 명령은 복제되며, 인덱스 메타데이터를 ClickHouse Keeper 또는 ZooKeeper를 통해 동기화합니다.

:::note    
인덱스 조작은 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 엔진( [복제](/engines/table-engines/mergetree-family/replication.md) 변형 포함)을 사용하는 테이블에서만 지원됩니다.
:::
