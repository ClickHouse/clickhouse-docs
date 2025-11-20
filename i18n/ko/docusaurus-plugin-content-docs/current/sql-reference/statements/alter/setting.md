---
'description': '테이블 설정 조작에 대한 문서'
'sidebar_label': 'SETTING'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/setting'
'title': '테이블 설정 조작'
'doc_type': 'reference'
---


# 테이블 설정 조작

테이블 설정을 변경하는 쿼리 세트가 있습니다. 설정을 수정하거나 기본값으로 재설정할 수 있습니다. 단일 쿼리로 여러 설정을 한 번에 변경할 수 있습니다.
지정한 이름의 설정이 존재하지 않는 경우, 쿼리는 예외를 발생시킵니다.

**구문**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note    
이 쿼리는 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 테이블에만 적용할 수 있습니다.
:::

## MODIFY SETTING {#modify-setting}

테이블 설정을 변경합니다.

**구문**

```sql
MODIFY SETTING setting_name=value [, ...]
```

**예시**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id;

ALTER TABLE example_table MODIFY SETTING max_part_loading_threads=8, max_parts_in_total=50000;
```

## RESET SETTING {#reset-setting}

테이블 설정을 기본값으로 재설정합니다. 설정이 기본 상태인 경우, 아무런 작업이 수행되지 않습니다.

**구문**

```sql
RESET SETTING setting_name [, ...]
```

**예시**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id
    SETTINGS max_part_loading_threads=8;

ALTER TABLE example_table RESET SETTING max_part_loading_threads;
```

**참조**

- [MergeTree 설정](../../../operations/settings/merge-tree-settings.md)
