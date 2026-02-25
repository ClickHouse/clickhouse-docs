---
title: 'Postgres 생성 컬럼: 주의할 점과 모범 사례'
slug: /integrations/clickpipes/postgres/generated_columns
description: '복제 중인 테이블에서 PostgreSQL 생성 컬럼을 사용할 때 유의해야 할 중요한 사항을 설명하는 페이지입니다.'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

PostgreSQL의 생성 컬럼을 복제되는 테이블에서 사용할 때에는 몇 가지 중요한 사항을 유의해야 합니다. 이러한 사항들은 복제 프로세스와 대상 시스템의 데이터 일관성에 영향을 줄 수 있습니다.

## 생성 컬럼의 문제점 \{#the-problem-with-generated-columns\}

1. **`pgoutput`를 통해 게시되지 않음:** 생성 컬럼은 `pgoutput` 논리적 복제 플러그인을 통해 게시되지 않습니다. 이는 PostgreSQL에서 다른 시스템으로 데이터를 복제할 때 생성 컬럼의 값이 복제 스트림에 포함되지 않는다는 뜻입니다.

2. **기본 키 관련 문제:** 생성 컬럼이 기본 키의 일부인 경우, 대상 측에서 중복 제거 문제가 발생할 수 있습니다. 생성 컬럼 값이 복제되지 않기 때문에 대상 시스템은 행을 올바르게 식별하고 중복 제거하는 데 필요한 정보를 갖지 못하게 됩니다.

3. **스키마 변경 관련 문제:** 이미 복제가 진행 중인 테이블에 생성 컬럼을 추가하는 경우, Postgres가 새 컬럼에 대한 `RelationMessage`를 제공하지 않기 때문에 대상에서는 새 컬럼 값이 채워지지 않습니다. 이후 동일한 테이블에 새 비-생성(non-generated) 컬럼을 추가하면, ClickPipe가 스키마를 동기화하려 할 때 대상에서 해당 생성 컬럼을 찾지 못하게 되고, 이로 인해 복제 과정이 실패하게 됩니다.

## 모범 사례 \{#best-practices\}

이러한 제한 사항을 해결하기 위해 다음 모범 사례를 고려하십시오.

1. **대상에서 Generated Column 재생성:** 복제 과정에서 Generated Column을 처리하도록 맡기기보다는, dbt(data build tool)와 같은 도구나 기타 데이터 변환 메커니즘을 사용하여 대상 측에서 해당 컬럼을 재생성하는 것이 좋습니다.

2. **기본 키에 Generated Column 사용 자제:** 복제될 테이블을 설계할 때는 Generated Column을 기본 키의 일부로 포함하지 않는 것이 가장 좋습니다.

## UI 향후 개선 사항 \{#upcoming-improvements-to-ui\}

향후 버전에서는 다음 작업을 지원하는 UI를 추가할 계획입니다.

1. **Generated Column이 있는 테이블 식별:** UI에 Generated Column을 포함한 테이블을 식별하는 기능이 추가됩니다. 이를 통해 어떤 테이블이 이 문제의 영향을 받는지 쉽게 파악할 수 있습니다.

2. **문서 및 모범 사례:** UI에는 레플리카 테이블(Replicated Table)에서 Generated Column을 사용할 때의 모범 사례와, 자주 발생하는 오류를 피하는 방법에 대한 안내가 포함될 예정입니다.