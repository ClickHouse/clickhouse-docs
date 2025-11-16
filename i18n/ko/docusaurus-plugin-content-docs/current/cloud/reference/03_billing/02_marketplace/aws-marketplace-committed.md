---
'slug': '/cloud/billing/marketplace/aws-marketplace-committed-contract'
'title': 'AWS Marketplace Committed Contract'
'description': 'AWS Marketplace (Committed Contract)을 통해 ClickHouse Cloud에 가입하기'
'keywords':
- 'aws'
- 'amazon'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import mp_committed_spend_1 from '@site/static/images/cloud/reference/mp_committed_spend_1.png'
import mp_committed_spend_2 from '@site/static/images/cloud/reference/mp_committed_spend_2.png'
import mp_committed_spend_3 from '@site/static/images/cloud/reference/mp_committed_spend_3.png'
import mp_committed_spend_4 from '@site/static/images/cloud/reference/mp_committed_spend_4.png'
import mp_committed_spend_5 from '@site/static/images/cloud/reference/mp_committed_spend_5.png'
import mp_committed_spend_6 from '@site/static/images/cloud/reference/mp_committed_spend_6.png'
import mp_committed_spend_7 from '@site/static/images/cloud/reference/mp_committed_spend_7.png'

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a committed contract.
A committed contract, also known as a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.

## Prerequisites {#prerequisites}

- ClickHouse의 특정 계약 조건에 따른 Private Offer.
- ClickHouse 조직을 귀하의 약정 지출 오퍼에 연결하려면 해당 조직의 관리자여야 합니다.

:::note
하나의 AWS 계정은 단 한 개의 “ClickHouse Cloud - Committed Contract” 개인 오퍼에만 구독할 수 있으며, 이는 하나의 ClickHouse 조직에만 연결될 수 있습니다.
:::

AWS에서 약정 계약을 보고 수락하는 데 필요한 권한:

- AWS 관리 정책을 사용하는 경우, 다음 권한이 필요합니다:
  - `AWSMarketplaceRead-only`, `AWSMarketplaceManageSubscriptions`
  - 또는 `AWSMarketplaceFullAccess`
- AWS 관리 정책을 사용하지 않는 경우, 다음 권한이 필요합니다:
  - IAM 작업 `aws-marketplace:ListPrivateListings` 및 `aws-marketplace:ViewSubscriptions`

## Steps to sign up {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Accept your private offer {#private-offer-accept}

귀하는 개인 오퍼를 검토하고 수락할 수 있는 링크가 포함된 이메일을 받았어야 합니다.

<Image img={mp_committed_spend_1} size="md" alt="AWS Marketplace private offer email"/>

### Review offer link {#review-offer-link}

이메일의 Review Offer 링크를 클릭하세요.
이 링크는 귀하의 AWS Marketplace 페이지로 이동하게 하며, 개인 오퍼 세부정보가 표시됩니다.

### Set up your account {#setup-your-account}

AWS 포털에서 구독하는 단계를 완료하고 **"Set up your account"**를 클릭하세요.
이 시점에서 ClickHouse Cloud로 리다이렉트되어야 하며, 새 계정을 등록하거나 기존 계정으로 로그인해야 합니다.
이 단계를 완료하지 않으면 AWS Marketplace 계약을 ClickHouse Cloud에 연결할 수 없습니다.

<Image img={mp_committed_spend_2} size="md" alt="AWS Marketplace private offer email"/>

### Login to Cloud {#login-cloud}

ClickHouse Cloud로 리다이렉트된 후, 기존 계정으로 로그인하거나 새 계정으로 등록할 수 있습니다.
이 단계는 ClickHouse Cloud 조직을 AWS Marketplace 청구에 바인딩하기 위해 필요합니다.

<Image img={mp_committed_spend_3} size="md" alt="AWS Marketplace private offer email"/>

### Register if new {#register}

새로운 ClickHouse Cloud 사용자라면, 페이지 하단의 "Register"를 클릭하세요.
새 사용자 정보를 생성하고 이메일을 확인하라는 메시지가 표시됩니다.
이메일을 확인한 후 ClickHouse Cloud 로그인 페이지를 떠나 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)에서 새 사용자 이름으로 로그인할 수 있습니다.

새 사용자일 경우, 비즈니스에 대한 기본 정보를 제공해야 한다는 점에 유의하세요.
아래 스크린샷을 참고하세요.

<Image img={mp_committed_spend_4} size="md" alt="Provide business information"/>

<Image img={mp_committed_spend_5} size="md" alt="Provide business information"/>

기존 ClickHouse Cloud 사용자라면, 자격 증명을 사용하여 로그인하면 됩니다.

### Create or select organization to bill {#create-select-org-to-bill}

로그인에 성공한 후, 이 마켓플레이스 계약에 청구할 새 조직을 생성할지 또는 이 계약에 청구할 기존 조직을 선택할지를 결정할 수 있습니다.

<Image img={mp_committed_spend_6} size="md" alt="Create or select an organization to bill to this subscription"/>

이 단계를 완료하면 귀하의 조직이 AWS 약정 지출 계약에 연결되며 모든 사용량이 귀하의 AWS 계정을 통해 청구됩니다.
ClickHouse UI의 조직 청구 페이지에서 청구가 실제로 AWS 마켓플레이스에 연결되었음을 확인할 수 있습니다.

<Image img={mp_committed_spend_7} size="md" alt="Confirm set up is complete"/>

문제가 발생하면 주저하지 말고 [support team](https://clickhouse.com/support/program)에게 문의해 주십시오.

</VerticalStepper>
