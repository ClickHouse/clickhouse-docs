---
'description': 'EXISTS 문서화'
'sidebar_label': 'EXISTS'
'sidebar_position': 45
'slug': '/sql-reference/statements/exists'
'title': 'EXISTS 문'
'doc_type': 'reference'
---


# EXISTS 문

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

지정된 데이터베이스에 테이블이 존재하지 않으면 단일 값 `0`이 포함된 단일 `UInt8` 형 컬럼을 반환하고, 테이블이 존재하면 `1`을 반환합니다.
