---
'sidebar_label': 'PCI 온보딩'
'slug': '/cloud/security/compliance/pci-onboarding'
'title': 'PCI 온보딩'
'description': 'PCI 규정을 준수하는 서비스에 온보딩하는 방법에 대해 자세히 알아보세요.'
'doc_type': 'guide'
'keywords':
- 'pci'
- 'compliance'
- 'payment security'
- 'data protection'
- 'security'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';
import Image from '@theme/IdealImage';
import pci1 from '@site/static/images/cloud/security/compliance/pci_1.png';
import pci2 from '@site/static/images/cloud/security/compliance/pci_2.png';
import pci3 from '@site/static/images/cloud/security/compliance/pci_3.png';

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

ClickHouse는 결제 카드 산업 데이터 보안 표준(PCI-DSS)을 준수하는 서비스를 제공하며, Level 1 서비스 제공업체 요구 사항에 따라 감사되었습니다. 고객은 이 기능을 활성화하고 준수하는 지역에 서비스 배포를 통해 이러한 서비스 내에서 기본 계좌 번호(PAN)를 처리할 수 있습니다.

ClickHouse의 준수 프로그램 및 타사 감사 보고서 이용 가능성에 대한 자세한 내용은 [준수 개요](/cloud/security/compliance-overview)를 검토하십시오. 우리의 PCI 공유 책임 문서 사본은 [신뢰 센터](https://trust.clickhouse.com)에서 확인할 수 있습니다. 또한 고객은 적절한 보안 통제를 선택하고 구현하기 위해 [보안 기능](/cloud/security) 페이지를 검토해야 합니다.

이 페이지에서는 ClickHouse Cloud에서 PCI 준수 서비스 배포를 활성화하는 절차를 설명합니다.

<VerticalStepper headerLevel="h3">

### 기업 서비스 가입하기 {#sign-up-for-enterprise}

1. 콘솔의 왼쪽 하단에서 조직 이름을 선택합니다.
2. **청구**를 클릭합니다.
3. 왼쪽 상단의 **플랜**을 검토합니다.
4. **플랜**이 **Enterprise**인 경우 다음 섹션으로 이동합니다. 그렇지 않으면 **플랜 변경**을 클릭합니다.
5. **Enterprise로 전환**을 선택합니다.

### 조직에 PCI 활성화하기 {#enable-hipaa}

1. 콘솔의 왼쪽 하단에서 조직 이름을 선택합니다.
2. **조직 세부정보**를 클릭합니다.
3. **PCI 활성화**를 켭니다.

<br />

<Image img={pci1} size="md" alt="PCI 활성화" background='black'/>

<br />

4. 활성화되면 PCI 서비스를 조직 내에서 배포할 수 있습니다.

<br />

<Image img={pci2} size="md" alt="PCI가 활성화됨" background='black'/>

<br />

### PCI 준수 지역에 서비스 배포하기 {#deploy-pci-regions}

1. 콘솔의 홈 화면 왼쪽 상단에서 **새 서비스**를 선택합니다.
2. **지역 유형**을 **HIPAA 준수**로 변경합니다.

<br />

<Image img={pci3} size="md" alt="PCI 지역에 배포" background='black'/>

<br />

3. 서비스 이름을 입력하고 나머지 정보를 입력합니다.

PCI 준수 클라우드 제공업체 및 서비스의 전체 목록은 [지원되는 클라우드 지역](/cloud/reference/supported-regions) 페이지를 검토하십시오.

</VerticalStepper>

## 기존 서비스 마이그레이션 {#migrate-to-hipaa}

고객은 필요에 따라 준수 환경에 서비스를 배포하는 것이 강력히 권장됩니다. 표준 지역에서 PCI 준수 지역으로 서비스를 마이그레이션하는 과정은 백업에서 복원하는 것이며, 일부 다운타임이 필요할 수 있습니다.

표준 지역에서 PCI 준수 지역으로의 마이그레이션이 필요한 경우, 다음 단계를 따라 자체 서비스 마이그레이션을 수행하십시오:

1. 마이그레이션할 서비스를 선택합니다.
2. 왼쪽에서 **백업**을 클릭합니다.
3. 복원할 백업 왼쪽에 있는 세 개의 점을 선택합니다.
4. 백업을 PCI 준수 지역으로 복원할 **지역 유형**을 선택합니다.
5. 복원이 완료되면 몇 개의 쿼리를 실행하여 스키마와 레코드 수가 예상대로인지 확인합니다.
6. 이전 서비스를 삭제합니다.

:::info 제한 사항
서비스는 동일한 클라우드 제공업체 및 지리적 지역에 남아 있어야 합니다. 이 프로세스는 동일한 클라우드 제공업체 및 지역 내에서 준수 환경으로 서비스를 마이그레이션합니다.
:::
