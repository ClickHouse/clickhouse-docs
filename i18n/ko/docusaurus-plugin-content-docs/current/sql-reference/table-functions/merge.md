---
'description': '임시 Merge 테이블을 생성합니다. 구조는 그들의 컬럼의 유니온을 사용하여 기반 테이블에서 파생되고 공통 타입을 추출함으로써
  유도됩니다.'
'sidebar_label': 'merge'
'sidebar_position': 130
'slug': '/sql-reference/table-functions/merge'
'title': 'merge'
'doc_type': 'reference'
---


# merge Table Function

임시 [Merge](../../engines/table-engines/special/merge.md) 테이블을 생성합니다.  
테이블 스키마는 기본 테이블에서 컬럼의 유니온을 사용하고 공통 타입을 파생시켜 유도됩니다.  
동일한 가상 컬럼이 [Merge](../../engines/table-engines/special/merge.md) 테이블 엔진과 동일하게 사용 가능합니다.

## Syntax {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```  
## Arguments {#arguments}

| Argument        | Description                                                                                                                                                                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db_name`       | 가능한 값 (선택 사항, 기본값은 `currentDatabase()`):<br/>    - 데이터베이스 이름,<br/>    - 예를 들어 `currentDatabase()`와 같이 데이터베이스 이름이 포함된 문자열을 반환하는 상수 표현식,<br/>    - `REGEXP(expression)`로, 여기서 `expression`은 DB 이름과 일치하는 정규 표현식입니다. |
| `tables_regexp` | 지정된 DB 또는 DB에서 테이블 이름과 일치하는 정규 표현식입니다.                                                                                                                                                                                                                       |

## Related {#related}

- [Merge](../../engines/table-engines/special/merge.md) 테이블 엔진
