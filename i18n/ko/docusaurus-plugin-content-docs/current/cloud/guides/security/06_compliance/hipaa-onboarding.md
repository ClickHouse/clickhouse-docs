---
'sidebar_label': 'HIPAA 온보딩'
'slug': '/cloud/security/compliance/hipaa-onboarding'
'title': 'HIPAA 온보딩'
'description': 'HIPAA 준수 서비스에 온보딩하는 방법에 대해 자세히 알아보세요.'
'doc_type': 'guide'
'keywords':
- 'hipaa'
- 'compliance'
- 'healthcare'
- 'security'
- 'data protection'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';
import Image from '@theme/IdealImage';
import hipaa1 from '@site/static/images/cloud/security/compliance/hipaa_1.png';
import hipaa2 from '@site/static/images/cloud/security/compliance/hipaa_2.png';
import hipaa3 from '@site/static/images/cloud/security/compliance/hipaa_3.png';
import hipaa4 from '@site/static/images/cloud/security/compliance/hipaa_4.png';

<EnterprisePlanFeatureBadge feature="HIPAA"/>

ClickHouse는 1996년의 건강 정보 이동성 및 책임 법안(HIPAA)의 보안 규칙을 준수하는 서비스를 제공합니다. 고객은 비즈니스 파트너 계약(BAA)에 서명하고 서비스를 준수하는 지역에 배포한 후 이러한 서비스 내에서 보호된 건강 정보(PHI)를 처리할 수 있습니다.

ClickHouse의 준수 프로그램 및 제3자 감사 보고서 가용성에 대한 자세한 내용은 [준수 개요](/cloud/security/compliance-overview) 및 [신뢰 센터](https://trust.clickhouse.com)를 참조하십시오. 또한 고객은 [보안 기능](/cloud/security) 페이지를 검토하여 작업 부하에 대해 적절한 보안 제어를 선택하고 구현해야 합니다.

이 페이지는 ClickHouse Cloud에서 HIPAA 준수 서비스 배포를 활성화하는 프로세스를 설명합니다.

## HIPAA 준수 서비스 활성화 및 배포 {#enable-hipaa-compliant-services}

<VerticalStepper headerLevel="h3">

### 엔터프라이즈 서비스 등록 {#sign-up-for-enterprise}

1. 콘솔의 왼쪽 하단 모서리에서 조직 이름을 선택합니다.
2. **청구**를 클릭합니다.
3. 왼쪽 상단 모서리에서 **요금제**를 검토합니다.
4. **요금제**가 **엔터프라이즈**인 경우, 다음 섹션으로 이동합니다. 그렇지 않은 경우 **요금제 변경**을 클릭합니다.
5. **엔터프라이즈로 전환**을 선택합니다.

### 조직에 대한 HIPAA 활성화 {#enable-hipaa}

1. 콘솔의 왼쪽 하단 모서리에서 조직 이름을 선택합니다.
2. **조직 세부 정보**를 클릭합니다.
3. **HIPAA 활성화**를 켭니다.

<br />

<Image img={hipaa1} size="md" alt="HIPAA 활성화 요청" background='black'/>

<br />

4. 화면의 지시에 따라 BAA 완료 요청을 제출합니다.

<br />

<Image img={hipaa2} size="md" alt="BAA 요청 제출" background='black'/>

<br />

5. BAA가 완료되면 조직에 대해 HIPAA가 활성화됩니다.

<br />

<Image img={hipaa3} size="md" alt="HIPAA가 활성화됨" background='black'/>

<br />

### HIPAA 준수 지역에 서비스 배포 {#deploy-hippa-services}

1. 콘솔의 홈 화면 왼쪽 상단에서 **새 서비스**를 선택합니다.
2. **지역 유형**을 **HIPAA 준수**로 변경합니다.

<br />

<Image img={hipaa4} size="md" alt="HIPAA 지역에 배포" background='black'/>

<br />

3. 서비스 이름을 입력하고 나머지 정보를 입력합니다.

HIPAA 준수 클라우드 공급자 및 서비스의 전체 목록은 [지원되는 클라우드 지역](/cloud/reference/supported-regions) 페이지를 참조하십시오.

</VerticalStepper>

## 기존 서비스 마이그레이션 {#migrate-to-hipaa}

고객은 필요한 경우 준수 환경에 서비스를 배포할 것을 강력히 권장합니다. 표준 지역에서 HIPAA 준수 지역으로 서비스 마이그레이션하는 과정은 백업에서 복원하는 것을 포함하며 약간의 다운타임이 필요할 수 있습니다.

표준 지역에서 HIPAA 준수 지역으로의 마이그레이션이 필요한 경우, 다음 단계를 따라 자가 서비스 마이그레이션을 수행하십시오:

1. 마이그레이션할 서비스를 선택합니다.
2. 왼쪽에서 **백업**을 클릭합니다.
3. 복원할 백업 왼쪽에 있는 세 개의 점을 선택합니다.
4. 백업을 HIPAA 준수 지역으로 복원할 **지역 유형**을 선택합니다.
5. 복원이 완료되면 스키마 및 레코드 수가 예상과 일치하는지 확인하기 위해 몇 가지 쿼리를 실행합니다.
6. 이전 서비스를 삭제합니다.

:::info 제한 사항
서비스는 동일한 클라우드 공급자 및 지리적 지역에 남아 있어야 합니다. 이 프로세스는 동일한 클라우드 공급자 및 지역 내에서 서비스를 준수 환경으로 마이그레이션합니다.
:::
