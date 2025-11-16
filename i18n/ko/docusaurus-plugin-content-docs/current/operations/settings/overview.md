---
'description': '설정에 대한 개요 페이지.'
'sidebar_position': 1
'slug': '/operations/settings/overview'
'title': '설정 개요'
'doc_type': 'reference'
---


# 설정 개요

## 개요 {#overview}

:::note
XML 기반 설정 프로파일과 [구성 파일](/operations/configuration-files)은 현재 ClickHouse Cloud에서 
지원되지 않습니다. ClickHouse Cloud 서비스의 설정을 지정하려면 [SQL 기반 설정 프로파일](/operations/access-rights#settings-profiles-management)을 사용해야 합니다.
:::

ClickHouse 설정은 두 가지 주요 그룹으로 나눌 수 있습니다:

- 글로벌 서버 설정
- 세션 설정

두 설정의 주요 차이점은 글로벌 서버 설정은 ClickHouse 서버 전체에 적용되는 반면, 세션 설정은 사용자 세션이나 개별 쿼리에 적용된다는 것입니다.

## 기본값이 아닌 설정 보기 {#see-non-default-settings}

기본값에서 변경된 설정을 보려면 `system.settings` 테이블을 쿼리할 수 있습니다:

```sql
SELECT name, value FROM system.settings WHERE changed
```

기본값에서 변경된 설정이 없으면 ClickHouse는 아무런 결과도 반환하지 않습니다.

특정 설정의 값을 확인하려면 쿼리에 설정의 `name`을 지정할 수 있습니다:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

그 결과는 다음과 같은 형태로 반환됩니다:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## 추가 참고 {#further-reading}

- [글로벌 서버 설정](/operations/server-configuration-parameters/settings.md)을 참조하여 ClickHouse 서버를 
  글로벌 서버 수준에서 구성하는 방법에 대해 자세히 알아보십시오.
- [세션 설정](/operations/settings/settings-query-level.md)을 참조하여 ClickHouse 
  서버를 세션 수준에서 구성하는 방법에 대해 자세히 알아보십시오.
