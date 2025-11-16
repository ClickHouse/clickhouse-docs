---
'description': 'USE 문에 대한 문서'
'sidebar_label': 'USE'
'sidebar_position': 53
'slug': '/sql-reference/statements/use'
'title': 'USE 문'
'doc_type': 'reference'
---


# USE 문

```sql
USE [DATABASE] db
```

세션에 대한 현재 데이터베이스를 설정할 수 있습니다.

현재 데이터베이스는 쿼리에서 테이블 이름 앞에 점이 명시적으로 정의되지 않은 경우 테이블을 검색하는 데 사용됩니다.

HTTP 프로토콜을 사용할 때는 세션 개념이 없기 때문에 이 쿼리를 실행할 수 없습니다.
