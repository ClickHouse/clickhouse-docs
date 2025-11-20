---
'description': 'Manipulating Key Expressions에 대한 문서'
'sidebar_label': 'ORDER BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/order-by'
'title': '키 표현 조작'
'doc_type': 'reference'
---


# 키 표현 조작

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

이 명령은 테이블의 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md)를 `new_expression`(표현식 또는 표현식의 튜플)으로 변경합니다. 기본 키는 동일하게 유지됩니다.

이 명령은 메타데이터만 변경하므로 경량입니다. 데이터 파트 행이 정렬 키 표현식에 의해 정렬되도록 하기 위해 기존 컬럼을 포함하는 표현식을 정렬 키에 추가할 수 없으며(`ALTER` 쿼리에서 `ADD COLUMN` 명령으로 추가된 컬럼만 가능하고 기본 컬럼 값은 없어야 합니다).

:::note    
이것은 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블( [복제된](../../../engines/table-engines/mergetree-family/replication.md) 테이블 포함)에만 작동합니다.
:::
