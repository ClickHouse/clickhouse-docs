---
description: 'ClickHouse Cloud에서 사용할 수 있는 `Shared` 데이터베이스 엔진을 설명하는 페이지'
sidebar_label: 'Shared'
sidebar_position: 10
slug: /engines/database-engines/shared
title: 'Shared'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />


# Shared database engine \{#shared-database-engine\}

`Shared` 데이터베이스 엔진은 Shared Catalog와 함께 동작하여 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)와 같은 무상태(stateless) 테이블 엔진을 사용하는 데이터베이스를 관리합니다.
이러한 테이블 엔진은 디스크에 영구 상태를 기록하지 않으며, 동적 컴퓨팅 환경과 호환됩니다.

Cloud의 `Shared` 데이터베이스 엔진은 로컬 디스크에 대한 의존성을 제거합니다.
CPU와 메모리만 요구하는 순수 인메모리 엔진입니다.



## 어떻게 동작합니까? \{#how-it-works\}

`Shared` 데이터베이스 엔진은 모든 데이터베이스와 테이블 정의를 Keeper 기반의 중앙 Shared Catalog에 저장합니다. 로컬 디스크에 기록하는 대신, 모든 컴퓨트 노드가 공유하는 단일 버전 관리 전역 상태를 유지합니다.

각 노드는 마지막으로 적용된 버전만 추적하며, 시작할 때 로컬 파일이나 수동 설정 없이 최신 상태를 가져옵니다.



## 구문 \{#syntax\}

최종 사용자는 Shared Catalog와 Shared database engine을 사용할 때 추가적인 설정이 필요하지 않습니다. 데이터베이스는 평소와 동일한 방식으로 생성합니다.

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud는 데이터베이스에 Shared database engine을 자동으로 할당합니다. 이러한 데이터베이스 내에서 stateless 엔진을 사용해 생성된 모든 테이블은 Shared Catalog의 복제 및 조정 기능을 자동으로 활용합니다.

:::tip
Shared Catalog와 그 이점에 대한 자세한 내용은 Cloud 참조 섹션의 [&quot;Shared catalog and shared database engine&quot;](/cloud/reference/shared-catalog)을 참조하십시오.
:::
