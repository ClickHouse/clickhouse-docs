---
'description': '마지막 접근 후 테이블을 `expiration_time_in_seconds` 초 동안만 RAM에 유지합니다. Log 유형
  테이블에서만 사용할 수 있습니다.'
'sidebar_label': '게으른'
'sidebar_position': 20
'slug': '/engines/database-engines/lazy'
'title': '게으른'
'doc_type': 'reference'
---


# Lazy

마지막 접근 후 `expiration_time_in_seconds` 초 동안 테이블을 RAM에만 유지합니다. \*Log 테이블에 대해서만 사용할 수 있습니다.

많은 작은 \*Log 테이블을 저장하는 데 최적화되어 있으며, 접근 사이에 긴 시간 간격이 있습니다.

## Creating a database {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
