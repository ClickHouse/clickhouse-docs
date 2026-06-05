---
slug: /cloud/managed-postgres/rbac
sidebar_label: 'RBAC'
title: 'Managed Postgres RBAC'
description: 'ClickHouse Managed Postgres의 역할 기반 접근 제어(RBAC)를 알아보세요'
keywords: ['Managed Postgres RBAC', '접근 제어', '역할', '권한', '사용 권한']
doc_type: '참고'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import usersAndRoles from '@site/static/images/managed-postgres/rbac/usersandroles.png';
import postgresEntity from '@site/static/images/managed-postgres/rbac/postgresentity.png';
import newPostgresPerms from '@site/static/images/managed-postgres/rbac/newpostgresperms.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.rbac-beta" />

ClickHouse Cloud는 Managed Postgres 서비스에 역할 기반 접근 제어(RBAC)를 지원합니다. 특정 권한을 가진 사용자 지정 역할을 생성하고 이를 조직 구성원에게 할당하여, Postgres 서비스를 조회하거나 관리할 수 있는 사용자를 제어할 수 있습니다.

## 사용 가능한 권한 \{#available-permissions\}

현재 Managed Postgres에서는 두 가지 권한을 지원합니다.

| Permission          | Description                              |
| ------------------- | ---------------------------------------- |
| **Postgres 서비스 보기** | 사용자가 Postgres 서비스와 해당 세부 정보를 확인할 수 있습니다. |
| **Postgres 서비스 관리** | 사용자가 Postgres 서비스를 수정, 확장 및 구성할 수 있습니다.  |

새로운 Postgres 서비스를 생성하려면 기존의 **Organization manage** 권한이 필요합니다. 위 권한은 기존 서비스에만 적용됩니다.

:::note
더 세분화된 권한은 향후 릴리스에서 제공될 예정입니다.
:::

## 사용자 지정 역할 만들기 \{#creating-a-custom-role\}

1. 왼쪽 사이드바에서 조직 이름을 클릭한 다음 **Users and roles**를 선택합니다.

<Image img={usersAndRoles} alt="Users and roles 메뉴" size="md" border />

2. **Roles** 탭으로 이동한 다음 **Create role**을 클릭합니다.
3. 역할 이름을 입력한 다음 **+ Allow**를 클릭하고 엔터티 목록에서 **Postgres Service**를 선택합니다.

<Image img={postgresEntity} alt="Postgres Service 엔터티 선택" size="md" border />

4. 역할 범위를 적용할 Postgres 서비스를 선택한 다음 부여할 권한을 선택합니다.

<Image img={newPostgresPerms} alt="역할의 Postgres 권한 구성" size="md" border />

5. 저장하려면 **Create role**을 클릭합니다.

## 역할 할당 \{#assigning-a-role\}

역할이 생성되면 동일한 **Users and roles** 페이지의 **Users** 탭에서 사용자에게 해당 역할을 할당하십시오. 사용자는 여러 역할을 가질 수 있으며, 역할을 조합해 필요한 액세스 프로필을 정확하게 구성할 수 있습니다.