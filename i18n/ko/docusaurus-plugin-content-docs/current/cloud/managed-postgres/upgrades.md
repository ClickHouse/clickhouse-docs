---
slug: /cloud/managed-postgres/upgrades
sidebar_label: '업그레이드'
title: '업그레이드'
description: 'ClickHouse Managed Postgres에서 PostgreSQL 버전 업그레이드가 어떻게 동작하는지 설명합니다'
keywords: ['Managed Postgres 업그레이드', 'Postgres 버전', '마이너 업그레이드', '메이저 업그레이드', '유지 관리 시간대(maintenance window)']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="upgrades" />

Managed Postgres는 PostgreSQL 버전 업그레이드를 자동으로 처리하여 인스턴스를 안전하고 최신 상태로 유지합니다. 마이너 버전과 메이저 버전 업그레이드를 모두 지원하며, 서비스 중단을 최소화합니다.


## 마이너 버전 업그레이드 \{#minor-version-upgrades\}

마이너 버전 업그레이드(예: 16.4에서 16.5로)는 버그 수정 및 보안 패치를 포함합니다. 이러한 업그레이드는 페일오버를 통해 수행되며, 일반적으로 연결이 잠시 끊기더라도 몇 초에 불과한 매우 짧은 시간만 영향을 줍니다.

[대기 인스턴스(standby)](/cloud/managed-postgres/high-availability)가 활성화된 인스턴스에는 업그레이드를 먼저 대기 인스턴스에 적용한 후, 다운타임을 최소화하기 위해 페일오버를 수행합니다.

## 메이저 버전 업그레이드 \{#major-version-upgrades\}

메이저 버전 업그레이드(예: 16.x에서 17.x로)도 장애 조치(failover) 기반의 유사한 방식으로 수행되며, 다운타임은 몇 초에 불과합니다.

## 유지 관리 기간 \{#maintenance-windows\}

Managed Postgres는 유지 관리 기간을 지원하여 업그레이드 및 기타 유지 관리 작업을 워크로드에 미치는 영향을 최소화할 수 있는 시간에 예약할 수 있도록 합니다. 유지 관리 기간을 구성하기 위한 UI는 곧 제공될 예정입니다. 그동안에는 인스턴스의 유지 관리 기간을 설정하려면 [지원팀](https://clickhouse.com/support/program)에 문의하십시오.