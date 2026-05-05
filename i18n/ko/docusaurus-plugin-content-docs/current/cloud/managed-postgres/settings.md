---
slug: /cloud/managed-postgres/settings
sidebar_label: '설정'
title: '설정'
description: 'PostgreSQL 및 PgBouncer 매개변수를 구성하고 Managed Postgres 인스턴스 설정을 관리합니다'
keywords: ['PostgreSQL 구성', 'PostgreSQL 설정', 'PgBouncer', 'IP 필터']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="settings" />

사이드바에 있는 **Settings** 탭에서 Managed Postgres 인스턴스의 구성 매개변수를 변경하고 인스턴스 설정을 관리할 수 있습니다.


## 구성 매개변수 변경 \{#changing-configuration\}

<Image img={postgresParameters} alt="Postgres 매개변수 구성" size="md" border/>

매개변수를 수정하려면 **Edit parameters** 버튼을 선택합니다. 수정이 필요한 매개변수를 선택한 다음 해당 값을 적절히 변경합니다. 변경 내용을 검토한 후 **Save Changes** 버튼을 누릅니다.

구성 매개변수에 대한 모든 변경 사항은 일반적으로 1분 이내에 인스턴스에 영구적으로 반영됩니다. 일부 매개변수는 적용을 위해 데이터베이스를 다시 시작해야 합니다. 이러한 변경 사항은 다음 재시작 이후에 적용되며, **Service actions** 도구 모음에서 수동으로 재시작을 실행할 수 있습니다.

## 서비스 작업 및 스케일링 \{#service-actions\}

<Image img={serviceActions} alt="Service actions and scaling" size="md" border/>

**Service actions** 도구 모음에서는 Managed Postgres 인스턴스를 관리하기 위한 제어 기능을 제공합니다:

- **Reset password**: 슈퍼유저 비밀번호를 업데이트합니다(인스턴스가 `Running` 상태일 때만 가능).
- **Restart**: 데이터베이스 인스턴스를 재시작합니다(인스턴스가 `Running` 상태일 때만 가능).
- **Delete**: 인스턴스를 삭제합니다.

**Scaling** 섹션에서는 기본(primary) 인스턴스와 대기(standby) 인스턴스의 인스턴스 타입을 변경하여 컴퓨팅 리소스와 스토리지 용량을 늘리거나 줄일 수 있습니다. 내부적으로는 새로운 인스턴스가 프로비저닝된 후, 현재 기본 인스턴스를 따라잡으면 해당 인스턴스가 기본 역할을 인계받습니다. 장애 조치(failover) 과정에서 모든 현재 연결이 끊기며 짧은 다운타임이 발생합니다.

:::tip
안전상의 이유로, 현재 사용 중인 스토리지 용량에 가까운 스토리지 용량을 가진 인스턴스 타입으로는 전환하지 못할 수 있습니다. 문제를 방지하려면 항상 현재 사용 중인 용량보다 충분한 여유 공간이 있는 인스턴스 타입을 선택하십시오.
:::

## IP filters \{#ip-filters\}

IP 필터는 어떤 원본 IP 주소가 Managed Postgres 인스턴스에 연결할 수 있는지 제어합니다.

<Image img={ipFilters} alt="IP Access List 구성" size="md" border/>

IP 필터를 구성하려면:

1. **Settings** 탭으로 이동합니다.
2. **IP Filters** 아래에서 **Edit**을 클릭합니다.
3. 연결을 허용할 IP 주소 또는 CIDR 범위를 추가합니다.
4. 변경 사항을 적용하려면 **Save**를 클릭합니다.

개별 IP 주소를 지정하거나, IP 범위를 위해 CIDR 표기법(예: `192.168.1.0/24`)을 사용할 수 있습니다. 인스턴스를 외부에 완전히 개방하거나 완전히 차단하기 위한 빠른 설정으로 **Anywhere** 또는 **Nowhere**를 선택할 수도 있습니다.

:::note
IP 필터가 구성되어 있지 않으면 모든 IP 주소에서의 연결이 허용됩니다. 프로덕션 환경에서는 알려진 IP 주소로만 액세스를 제한할 것을 권장합니다.
:::