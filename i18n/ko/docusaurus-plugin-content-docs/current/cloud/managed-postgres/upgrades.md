---
slug: /cloud/managed-postgres/upgrades
sidebar_label: '업그레이드'
title: '업그레이드'
description: 'ClickHouse Managed Postgres에서 PostgreSQL 버전 업그레이드가 어떻게 동작하는지 설명합니다'
keywords: ['Managed Postgres 업그레이드', 'Postgres 버전', '마이너 업그레이드', '메이저 업그레이드', '유지 관리 기간(maintenance window)']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.upgrades-beta" />

Managed Postgres는 PostgreSQL 버전 업그레이드를 자동으로 처리하여 인스턴스를 안전하고 최신 상태로 유지합니다. 마이너 버전과 메이저 버전 업그레이드를 모두 지원하며, 서비스 중단을 최소화합니다.

## 유지 관리 업데이트 \{#maintenance-updates\}

PostgreSQL 인스턴스의 정기 유지 관리에는 다음이 포함됩니다.

* 마이너 버전 업그레이드(예: 17.4에서 17.5로)는 버그 수정 및 PostgreSQL 엔진 보안 패치를 포함합니다.
* Managed Service 기능. 네이티브 CDC, 관측성, pg&#95;clickhouse 및 기타 확장 기능 개선이 포함됩니다.
* 운영 체제 및 시스템 구성 요소 패치. 보안 수정, 효율성 향상 및 기타 개선 사항을 포함합니다.

이러한 업그레이드는 페일오버를 통해 수행되며, 일반적으로 연결이 잠시 끊기더라도 몇 초에 불과한 매우 짧은 시간만 영향을 줍니다.

[대기 인스턴스(standby)](/cloud/managed-postgres/high-availability)가 활성화된 인스턴스에는 업그레이드를 먼저 대기 인스턴스에 적용한 후, 다운타임을 최소화하기 위해 페일오버를 수행합니다.

## 유지 관리 기간 \{#maintenance-windows\}

기본 유지 관리 기간은 일요일 14:00~16:00 UTC입니다.
해당 기간 내 예상 다운타임은 1분 미만입니다.

Enterprise Tier 조직의 경우, Managed Postgres는 유지 관리 기간을 지원하여 업그레이드 및 기타 유지 관리 작업을 워크로드에 미치는 영향을 최소화할 수 있는 시간에 예약할 수 있도록 합니다. 유지 관리 기간을 구성하기 위한 UI 및 API 지원은 곧 제공될 예정입니다. 그동안에는 인스턴스의 유지 관리 기간을 설정하려면 [지원팀](https://clickhouse.com/support/program)에 문의하십시오.

## 주요 버전 업그레이드 \{#major-version-upgrades\}

UI와 API를 통한 주요 버전 업그레이드(예: 17.x에서 18.x로)는 곧 제공될 예정입니다.
그동안에는 Managed Postgres 인스턴스를 업그레이드하려면 [지원팀](https://clickhouse.com/support/program)에 문의하십시오.