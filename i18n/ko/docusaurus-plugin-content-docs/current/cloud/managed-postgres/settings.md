---
slug: /cloud/managed-postgres/settings
sidebar_label: '설정'
title: '설정'
description: 'PostgreSQL 및 PgBouncer 매개변수를 구성하고 Managed Postgres 인스턴스 설정을 관리합니다'
keywords: ['PostgreSQL 구성', 'PostgreSQL 설정', 'PgBouncer']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.settings-beta" />

사이드바에 있는 **설정** 탭에서 Managed Postgres 인스턴스의 구성 매개변수를 변경하고 인스턴스 설정을 관리할 수 있습니다.

## 서비스 작업 및 스케일링 \{#service-actions\}

<Image img={serviceActions} alt="Service actions and scaling" size="md" border />

**서비스 작업** 도구 모음에서는 Managed Postgres 인스턴스를 관리하기 위한 제어 기능을 제공합니다:

* **Reset password**: 슈퍼유저 비밀번호를 업데이트합니다(인스턴스가 `Running` 상태일 때만 가능).
* **Restart**: 데이터베이스 인스턴스를 재시작합니다(인스턴스가 `Running` 상태일 때만 가능).
* **Delete**: 인스턴스를 삭제합니다.

**스케일링** 섹션에서는 기본(primary) 인스턴스와 대기(standby) 인스턴스의 인스턴스 타입을 변경하여 컴퓨팅 리소스와 스토리지 용량을 늘리거나 줄일 수 있습니다.
자세한 내용은 [scaling page](/cloud/managed-postgres/scaling)를 참조하십시오.

## 구성 매개변수 변경 \{#changing-configuration\}

<Image img={postgresParameters} alt="Postgres 매개변수 구성" size="md" border />

매개변수를 수정하려면 **Edit parameters** 버튼을 선택합니다. 수정이 필요한 매개변수를 선택한 다음 해당 값을 적절히 변경합니다. 변경 내용을 검토한 후 **Save Changes** 버튼을 누릅니다.

구성 매개변수에 대한 모든 변경 사항은 일반적으로 1분 이내에 인스턴스에 영구적으로 반영됩니다. 일부 매개변수는 적용을 위해 데이터베이스를 다시 시작해야 합니다. 이러한 변경 사항은 다음 재시작 이후에 적용되며, **서비스 작업** 도구 모음에서 수동으로 재시작을 실행할 수 있습니다.

구성 매개변수에 대한 자세한 내용은 공식 [documentation](https://www.postgresql.org/docs/current/runtime-config.html)을 참조하십시오. 설정 가능한 매개변수 목록은 곧 확대될 예정입니다. 그전까지는 현재 지원되지 않는 매개변수를 요청하려면 [support](https://clickhouse.com/support/program)에 문의하십시오.