---
description: '설정 개요 페이지'
sidebar_position: 1
slug: /operations/settings/overview
title: '설정 개요'
doc_type: 'reference'
---

# 설정 개요 \{#settings-overview\}

## 개요 \{#overview\}

:::note
XML 기반 Settings Profiles와 [설정 파일](/operations/configuration-files)은 현재 ClickHouse Cloud에서 
지원되지 않습니다. ClickHouse Cloud 서비스의 설정을 지정하려면 
[SQL 기반 Settings Profiles](/operations/access-rights#settings-profiles-management)을 사용해야 합니다.
:::

ClickHouse 설정은 다음과 같은 주요 그룹으로 나눌 수 있습니다:

- 전역 서버 설정
- 세션 설정
- 쿼리 설정
- 백그라운드 작업 설정

전역 설정은 이후 단계에서 재정의되지 않는 한 기본값으로 적용됩니다. 세션 설정은 프로필, 사용자 구성 및 SET 명령을 통해 지정할 수 있습니다. 쿼리 설정은 SETTINGS 절을 통해 제공할 수 있으며 개별 쿼리에 적용됩니다. 백그라운드 작업 설정은 뮤테이션(Mutations), 머지(Merges) 및 잠재적으로 기타 작업에 적용되며, 백그라운드에서 비동기적으로 실행됩니다.

## 기본값이 아닌 설정 보기 \{#see-non-default-settings\}

기본값에서 변경된 설정을 확인하려면 `system.settings` 테이블을 쿼리하면 됩니다:

```sql
SELECT name, value FROM system.settings WHERE changed
```

설정을 기본값에서 변경하지 않았다면 ClickHouse는 아무것도 반환하지 않습니다.

특정 설정의 값을 확인하려면 쿼리에서 해당 설정의 `name`을 지정할 수 있습니다:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

다음과 같은 결과를 반환합니다:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```


## 추가 자료 \{#further-reading\}

- ClickHouse 서버를 전역 서버 수준에서 구성하는 방법은 [전역 서버 설정](/operations/server-configuration-parameters/settings.md)을 참조하십시오.
- ClickHouse 서버를 세션 수준에서 구성하는 방법은 [세션 설정](/operations/settings/settings-query-level.md)을 참조하십시오.
- ClickHouse에서 구성 처리 방식에 대해 자세히 알아보려면 [컨텍스트 계층 구조](/development/architecture.md#context)를 참조하십시오.