---
'description': 'Manipulating SAMPLE BY 표현에 대한 문서'
'sidebar_label': 'SAMPLE BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/sample-by'
'title': '샘플링 키 표현 조작'
'doc_type': 'reference'
---


# SAMPLE BY 표현 조작

다음 작업이 가능합니다:

## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

이 명령은 테이블의 [샘플링 키](../../../engines/table-engines/mergetree-family/mergetree.md)를 `new_expression` (표현식 또는 표현식의 튜플)로 변경합니다. 기본 키는 새로운 샘플 키를 포함해야 합니다.

## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

이 명령은 테이블의 [샘플링 키](../../../engines/table-engines/mergetree-family/mergetree.md)를 제거합니다.

`MODIFY` 및 `REMOVE` 명령은 메타데이터만 변경하거나 파일을 제거하는 경량 작업입니다.

:::note    
이 기능은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블(포함하여 [복제된](../../../engines/table-engines/mergetree-family/replication.md) 테이블)에서만 작동합니다.
:::
