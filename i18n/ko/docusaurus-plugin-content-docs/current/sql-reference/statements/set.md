---
'description': 'SET 语句的文档'
'sidebar_label': 'SET'
'sidebar_position': 50
'slug': '/sql-reference/statements/set'
'title': 'SET 语句'
'doc_type': 'reference'
---


# SET 문

```sql
SET param = value
```

`param` [설정](/operations/settings/overview)에 `value`를 현재 세션에 할당합니다. 이 방법으로 [서버 설정](../../operations/server-configuration-parameters/settings.md)을 변경할 수 없습니다.

지정된 설정 프로파일의 모든 값을 단일 쿼리로 설정할 수도 있습니다.

```sql
SET profile = 'profile-name-from-the-settings-file'
```

true로 설정된 부울 설정의 경우 값 할당을 생략하여 간편한 구문을 사용할 수 있습니다. 설정 이름만 지정하면 자동으로 `1`(true)로 설정됩니다.

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```

자세한 내용은 [설정](../../operations/settings/settings.md)을 참조하세요.
