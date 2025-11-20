---
'description': '페이지는 ClickHouse Cloud에서 사용할 수 있는 `Shared` 데이터베이스 엔진을 설명합니다.'
'sidebar_label': '공유'
'sidebar_position': 10
'slug': '/engines/database-engines/shared'
'title': '공유'
'doc_type': 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge/>


# 공유 데이터베이스 엔진

`Shared` 데이터베이스 엔진은 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)와 같은 상태 비저장 테이블 엔진을 사용하는 데이터베이스의 테이블을 관리하기 위해 Shared Catalog와 함께 작동합니다. 이러한 테이블 엔진은 디스크에 지속적인 상태를 기록하지 않으며 동적 컴퓨팅 환경과 호환됩니다.

Cloud에서의 `Shared` 데이터베이스 엔진은 로컬 디스크에 대한 의존성을 제거합니다. 이것은 순전히 인메모리 엔진으로, CPU와 메모리만 필요로 합니다.

## 작동 방식은? {#how-it-works}

`Shared` 데이터베이스 엔진은 모든 데이터베이스 및 테이블 정의를 Keeper에 의해 지원되는 중앙 Shared Catalog에 저장합니다. 로컬 디스크에 기록하는 대신, 모든 컴퓨팅 노드 간에 공유되는 단일 버전화된 글로벌 상태를 유지합니다.

각 노드는 마지막으로 적용된 버전만 추적하며, 시작 시 로컬 파일이나 수동 설정 없이 최신 상태를 가져옵니다.

## 문법 {#syntax}

최종 사용자는 Shared Catalog와 Shared 데이터베이스 엔진을 사용하기 위해 추가 구성이 필요하지 않습니다. 데이터베이스 생성은 항상 동일합니다:

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud는 자동으로 Shared 데이터베이스 엔진을 데이터베이스에 할당합니다. 상태 비저장 엔진을 사용하여 이러한 데이터베이스 내에 생성된 모든 테이블은 자동으로 Shared Catalog의 복제 및 조정 기능의 혜택을 받습니다.

:::tip
Shared Catalog 및 그 이점에 대한 추가 정보는 Cloud 참조 섹션의 ["공유 카탈로그 및 공유 데이터베이스 엔진"](/cloud/reference/shared-catalog)를 참조하세요.
:::
