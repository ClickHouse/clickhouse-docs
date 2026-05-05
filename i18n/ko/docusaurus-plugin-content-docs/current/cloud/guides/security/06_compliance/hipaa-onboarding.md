---
sidebar_label: 'HIPAA 온보딩'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'HIPAA 온보딩'
description: 'HIPAA 준수 서비스에 온보딩하는 방법에 대해 알아봅니다'
doc_type: 'guide'
keywords: ['hipaa', 'compliance', '의료', '보안', '데이터 보호']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import hipaa1 from '@site/static/images/cloud/security/compliance/hipaa_1.png';
import hipaa2 from '@site/static/images/cloud/security/compliance/hipaa_2.png';
import hipaa3 from '@site/static/images/cloud/security/compliance/hipaa_3.png';
import hipaa4 from '@site/static/images/cloud/security/compliance/hipaa_4.png';

<EnterprisePlanFeatureBadge feature="HIPAA" />

ClickHouse는 1996년 제정된 「Health Insurance Portability and Accountability Act(HIPAA)」의 Security Rule을 준수하는 서비스를 제공합니다. 고객은 Business Associate Agreement(BAA)를 체결하고 해당 규정을 준수하는 리전에 서비스를 배포한 후, 이러한 서비스 내에서 PHI(protected health information, 보호 대상 건강 정보)를 처리할 수 있습니다.

ClickHouse의 컴플라이언스 프로그램과 제3자 감사 보고서 이용 가능 여부에 대한 자세한 내용은 [컴플라이언스 개요](/cloud/security/compliance-overview) 및 [Trust Center](https://trust.clickhouse.com)를 참조하십시오. 또한 각 워크로드에 적합한 보안 통제를 선택하고 구현하기 위해 [보안 기능](/cloud/security) 페이지를 검토하는 것이 좋습니다.

이 페이지에서는 ClickHouse Cloud에서 HIPAA를 준수하는 서비스를 사용할 수 있도록 설정하고 배포하는 절차를 설명합니다.


## HIPAA 규정 준수 서비스를 활성화하고 배포하기 \{#enable-hipaa-compliant-services\}

<VerticalStepper headerLevel="h3">

### Enterprise 서비스에 가입하기 \{#sign-up-for-enterprise\}

1. 콘솔 왼쪽 아래에서 조직 이름을 선택합니다.
2. **Billing**을 클릭합니다.
3. 왼쪽 위에서 **Plan**을 확인합니다.
4. **Plan**이 **Enterprise**이면 다음 섹션으로 이동합니다. 그렇지 않으면 **Change plan**을 클릭합니다.
5. **Switch to Enterprise**를 선택합니다.

### 조직에 대해 HIPAA 활성화하기 \{#enable-hipaa\}

1. 콘솔 왼쪽 아래에서 조직 이름을 선택합니다.
2. **Organization details**를 클릭합니다.
3. **Enable HIPAA** 토글을 켭니다.

<br />

<Image img={hipaa1} size="md" alt="HIPAA 활성화 요청" background='black'/>

<br />

4. 화면의 안내에 따라 BAA 작성을 완료하기 위한 요청을 제출합니다.

<br />

<Image img={hipaa2} size="md" alt="BAA 요청 제출" background='black'/>

<br />

5. BAA가 완료되면 조직에 대해 HIPAA가 활성화됩니다.

<br />

<Image img={hipaa3} size="md" alt="HIPAA 활성화 완료" background='black'/>

<br />

### HIPAA 규정 준수 리전에 서비스 배포하기 \{#deploy-hipaa-services\}

1. 콘솔 홈 화면 왼쪽 위에서 **New service**를 선택합니다.
2. **Region type**을 **HIPAA compliant**로 변경합니다.

<br />

<Image img={hipaa4} size="md" alt="HIPAA 리전에 배포" background='black'/>

<br />

3. 서비스 이름을 입력하고 나머지 정보를 입력합니다.

HIPAA 규정 준수 클라우드 제공자와 서비스의 전체 목록은 [Supported cloud regions](/cloud/reference/supported-regions) 페이지에서 확인하십시오.

</VerticalStepper>

## 기존 서비스 마이그레이션 \{#migrate-to-hipaa\}

고객은 필요한 경우 규정 준수 환경에 서비스를 배포하는 것이 강력히 권장됩니다. 표준 리전에서 HIPAA 규정 준수 리전으로 서비스를 마이그레이션하는 과정에는 백업에서의 복원이 포함되며, 일부 다운타임이 필요할 수 있습니다.

표준 리전에서 HIPAA 규정 준수 리전으로 마이그레이션해야 하는 경우, 다음 단계를 따라 자가 마이그레이션을 수행합니다.

1. 마이그레이션할 서비스를 선택합니다.
2. 왼쪽에서 **Backups**를 클릭합니다.
3. 복원할 백업의 왼쪽에 있는 세 점 아이콘을 선택합니다.
4. **Region type**을 선택하여 백업을 HIPAA 규정 준수 리전에 복원합니다.
5. 복원이 완료되면, 몇 개의 쿼리를 실행하여 스키마와 레코드 수가 예상과 일치하는지 확인합니다.
6. 기존 서비스를 삭제합니다.

:::info Restrictions
서비스는 동일한 Cloud 제공자와 동일한 지리적 리전에 유지되어야 합니다. 이 프로세스는 동일한 Cloud 제공자와 리전 내에서 규정 준수 환경으로 서비스를 마이그레이션합니다.
:::