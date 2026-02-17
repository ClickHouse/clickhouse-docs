---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: 'AWS Marketplace 약정 계약'
description: 'AWS Marketplace(약정 계약)을 통해 ClickHouse Cloud를 구독합니다'
keywords: ['aws', 'amazon', 'marketplace', '청구', '약정', '약정 계약']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mp_committed_spend_1 from '@site/static/images/cloud/reference/mp_committed_spend_1.png'
import mp_committed_spend_2 from '@site/static/images/cloud/reference/mp_committed_spend_2.png'
import mp_committed_spend_3 from '@site/static/images/cloud/reference/mp_committed_spend_3.png'
import mp_committed_spend_4 from '@site/static/images/cloud/reference/mp_committed_spend_4.png'
import mp_committed_spend_5 from '@site/static/images/cloud/reference/mp_committed_spend_5.png'
import mp_committed_spend_6 from '@site/static/images/cloud/reference/mp_committed_spend_6.png'
import mp_committed_spend_7 from '@site/static/images/cloud/reference/mp_committed_spend_7.png'

[AWS Marketplace](https://aws.amazon.com/marketplace)에서 약정 계약을 통해 ClickHouse Cloud 사용을 시작할 수 있습니다.
약정 계약(Private Offer라고도 함)은 사용자가 일정 기간 동안 ClickHouse Cloud에 일정 금액 이상을 지출하기로 미리 약정하는 방식입니다.


## 선행 조건 \{#prerequisites\}

- 특정 계약 조건을 기반으로 한 ClickHouse Private Offer.
- ClickHouse 조직을 약정 사용량(Committed Spend) 오퍼에 연결하려면 해당 조직의 관리자여야 합니다.

:::note
하나의 AWS 계정은 하나의 「ClickHouse Cloud - Committed Contract」 Private Offer만 구독할 수 있으며, 이 오퍼는 하나의 ClickHouse 조직에만 연결할 수 있습니다.
:::

AWS에서 약정 계약을 조회하고 수락하기 위해 필요한 권한:

- AWS 관리형 정책을 사용하는 경우 다음 권한이 필요합니다.
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - 또는 `AWSMarketplaceFullAccess`
- AWS 관리형 정책을 사용하지 않는 경우 다음 권한이 필요합니다.
  - IAM 동작 `aws-marketplace:ListPrivateListings` 및 `aws-marketplace:ViewSubscriptions`

## 가입 단계 \{#steps-to-sign-up\}

<VerticalStepper headerLevel="h3">

### 프라이빗 오퍼 수락 \{#private-offer-accept\}

프라이빗 오퍼를 검토하고 수락할 수 있는 링크가 포함된 이메일을 받았을 것입니다.

<Image img={mp_committed_spend_1} size="md" alt="AWS Marketplace 프라이빗 오퍼 이메일"/>

### 오퍼 링크 검토 \{#review-offer-link\}

이메일에서 "Review Offer" 링크를 클릭합니다.
그러면 프라이빗 오퍼 세부 정보가 포함된 AWS Marketplace 페이지로 이동합니다.

### 계정 설정 \{#setup-your-account\}

AWS 포털에서 구독 단계를 완료한 후 **"Set up your account"**를 클릭합니다.
이 단계에서 ClickHouse Cloud로 리디렉션되어 새 계정을 등록하거나 기존 계정으로 로그인하는 것이 매우 중요합니다.
이 단계를 완료하지 않으면 AWS Marketplace 계약을 ClickHouse Cloud에 연결할 수 없습니다.

<Image img={mp_committed_spend_2} size="md" alt="AWS Marketplace 프라이빗 오퍼 이메일"/>

### Cloud에 로그인 \{#login-cloud\}

ClickHouse Cloud로 리디렉션되면 기존 계정으로 로그인하거나 새 계정을 등록할 수 있습니다.
이 단계는 ClickHouse Cloud 조직을 AWS Marketplace 청구와 연결하기 위해 필요합니다.

<Image img={mp_committed_spend_3} size="md" alt="AWS Marketplace 프라이빗 오퍼 이메일"/>

### 신규인 경우 등록 \{#register\}

새로운 ClickHouse Cloud 사용자라면, 페이지 하단의 "Register"를 클릭합니다.
새 사용자를 생성하고 이메일을 확인하라는 안내를 받게 됩니다.
이메일을 확인한 후에는 ClickHouse Cloud 로그인 페이지를 닫고 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)에서 새 사용자 이름으로 로그인할 수 있습니다.

신규 사용자라면 비즈니스에 대한 기본 정보를 제공해야 한다는 점에 유의하십시오.
아래 스크린샷을 참고하십시오.

<Image img={mp_committed_spend_4} size="md" alt="비즈니스 정보 제공"/>

<Image img={mp_committed_spend_5} size="md" alt="비즈니스 정보 제공"/>

기존 ClickHouse Cloud 사용자라면 보유 중인 로그인 정보로 로그인하면 됩니다.

### 청구에 사용할 조직 생성 또는 선택 \{#create-select-org-to-bill\}

성공적으로 로그인한 후, 이 Marketplace 계약에 대해 청구에 사용할 새 조직을 생성할지, 아니면 이 계약에 대해 청구할 기존 조직을 선택할지 결정할 수 있습니다.

<Image img={mp_committed_spend_6} size="md" alt="이 구독에 청구할 조직 생성 또는 선택"/>

이 단계를 완료하면 조직이 AWS 약정 지출 계약에 연결되고 모든 사용량은 AWS 계정을 통해 청구됩니다.
ClickHouse UI에서 조직의 청구 페이지를 확인하여 청구가 실제로 AWS Marketplace에 연결되었는지 검증할 수 있습니다.

<Image img={mp_committed_spend_7} size="md" alt="설정 완료 확인"/>

문제가 발생하면 언제든지 [지원팀](https://clickhouse.com/support/program)에 문의해 주십시오.

</VerticalStepper>