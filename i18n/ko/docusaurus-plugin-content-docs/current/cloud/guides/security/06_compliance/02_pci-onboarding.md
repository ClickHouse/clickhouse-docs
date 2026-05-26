---
sidebar_label: 'PCI 온보딩'
slug: /cloud/security/compliance/pci-onboarding
title: 'PCI 온보딩'
description: 'PCI 규정을 준수하는 서비스에 온보딩하는 방법에 대해 알아봅니다'
doc_type: 'guide'
keywords: ['pci', '규정 준수', '결제 보안', '데이터 보호', '보안']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import pci1 from '@site/static/images/cloud/security/compliance/pci_1.png';
import pci2 from '@site/static/images/cloud/security/compliance/pci_2.png';
import pci3 from '@site/static/images/cloud/security/compliance/pci_3.png';

<EnterprisePlanFeatureBadge feature="PCI 규정 준수" />

ClickHouse는 Payment Card Industry Data Security Standard(PCI-DSS)를 준수하는 서비스를 제공하며, Level 1 서비스 제공자 요건에 따라 감사를 받습니다. 고객은 이 기능을 활성화하고 규정 준수 리전에 서비스를 배포하여 해당 서비스 내에서 주 계정 번호(PAN)를 처리할 수 있습니다.

ClickHouse의 규정 준수 프로그램과 제3자 감사 보고서 제공 여부에 대한 자세한 내용은 [규정 준수 개요](/cloud/security/compliance-overview)를 참조하십시오. PCI 공동 책임 문서 사본을 보려면 [Trust Center](https://trust.clickhouse.com)를 방문하십시오. 또한 워크로드에 적합한 보안 통제를 선택하고 구현하기 위해 [보안 기능](/cloud/security) 페이지를 검토하는 것이 좋습니다.

이 페이지에서는 ClickHouse Cloud에서 PCI 규정을 준수하는 서비스를 배포할 수 있도록 설정하는 절차를 설명합니다.

<VerticalStepper headerLevel="h3">
  ### Enterprise 서비스에 가입

  1. 콘솔 왼쪽 하단에서 조직 이름을 선택합니다.
  2. **Billing**을 클릭합니다.
  3. 왼쪽 상단에서 **Plan**을 확인합니다.
  4. **Plan**이 **Enterprise**이면 다음 섹션으로 이동합니다. 그렇지 않다면 **Change plan**을 클릭합니다.
  5. **Switch to Enterprise**를 선택합니다.

  ### 조직에 대해 PCI 활성화

  1. 콘솔 왼쪽 하단에서 조직 이름을 선택합니다.
  2. **Organization details**를 클릭합니다.
  3. **Enable PCI**를 켭니다.

  <br />

  <Image img={pci1} size="md" alt="PCI 활성화" background="black" />

  <br />

  4. 활성화되면 조직 내에서 PCI 서비스가 배포될 수 있습니다.

  <br />

  <Image img={pci2} size="md" alt="PCI가 활성화된 상태" background="black" />

  <br />

  ### PCI 규정을 준수하는 리전으로 서비스 배포

  1. 콘솔 홈 화면 왼쪽 상단에서 **New service**를 선택합니다.
  2. **Region type**을 **HIPAA compliant**로 변경합니다.

  <br />

  <Image img={pci3} size="md" alt="PCI 리전에 배포" background="black" />

  <br />

  3. 서비스 이름을 입력하고 나머지 정보를 입력합니다.

  PCI 규정을 준수하는 클라우드 제공자 및 서비스의 전체 목록은 [지원되는 클라우드 리전](/cloud/reference/supported-regions) 페이지를 참고하십시오.
</VerticalStepper>


## 기존 서비스 마이그레이션 {#migrate-to-hipaa}

고객은 필요한 경우 규정 준수 환경에 서비스를 배포하는 것이 강력히 권장됩니다. 표준 리전에서 PCI 준수 리전으로 서비스를 마이그레이션하는 과정에는 백업에서 복원하는 작업이 포함되며, 약간의 다운타임이 필요할 수 있습니다.

표준 리전에서 PCI 준수 리전으로의 마이그레이션이 필요한 경우, 다음 단계를 따라 셀프 서비스 마이그레이션을 수행하십시오:

1. 마이그레이션할 서비스를 선택합니다.
2. 왼쪽에서 **Backups**를 클릭합니다.
3. 복원할 백업의 왼쪽에 있는 점 세 개 아이콘을 선택합니다.
4. **Region type**에서 백업을 복원할 PCI 준수 리전을 선택합니다.
5. 복원이 완료되면, 스키마와 레코드 개수가 예상대로인지 확인하기 위해 몇 개의 쿼리를 실행합니다.
6. 기존 서비스를 삭제합니다.

:::info 제한 사항
서비스는 동일한 클라우드 제공업체와 동일한 지리적 리전에 유지되어야 합니다. 이 절차는 동일한 클라우드 제공업체와 리전 내에서 규정 준수 환경으로 서비스를 마이그레이션합니다.
:::
