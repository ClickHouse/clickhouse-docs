---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'AWS Marketplace (PAYG)를 통해 ClickHouse Cloud를 구독합니다.'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import aws_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-1.png';
import aws_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-2.png';
import aws_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-3.png';
import aws_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-4.png';
import aws_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-5.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import Image from '@theme/IdealImage';

[AWS Marketplace](https://aws.amazon.com/marketplace)에 제공되는 PAYG(Pay-as-you-go) Public Offer를 통해 ClickHouse Cloud 사용을 시작하십시오.


## 사전 준비 사항 \{#prerequisites\}

- 결제 관리자가 구매 권한을 부여한 AWS 계정이 있어야 합니다.
- 구매하려면 이 계정으로 AWS Marketplace에 로그인해야 합니다.
- 구독에 ClickHouse 조직을 연결하려면 해당 조직의 관리자여야 합니다.

:::note
하나의 AWS 계정은 하나의 「ClickHouse Cloud - Pay As You Go」 구독에만 가입할 수 있으며, 이 구독은 하나의 ClickHouse 조직에만 연결할 수 있습니다.
:::

## 가입 단계 \{#steps-to-sign-up\}

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud - Pay As You Go 검색 \{#search-payg\}

[AWS Marketplace](https://aws.amazon.com/marketplace)로 이동하여 「ClickHouse Cloud - Pay As You Go」를 검색합니다.

<Image img={aws_marketplace_payg_1} alt="ClickHouse를 검색하는 AWS Marketplace" border/>

### 구매 옵션 보기 \{#purchase-options\}

[상품 페이지](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu)를 연 다음 **View purchase options**를 클릭합니다.

<Image img={aws_marketplace_payg_2} alt="구매 옵션을 표시하는 AWS Marketplace" border/>

### 구독 \{#subscribe\}

다음 화면에서 **Subscribe**를 클릭합니다.

:::note
**구매 주문(PO, Purchase Order) 번호**는 선택 사항이므로 입력하지 않아도 됩니다.  
**이 상품에는 두 가지 상품 옵션이 제공됩니다.** "ClickHouse Cloud - Pay As You Go Free Trial" 옵션을 선택하면 30일 동안 AWS에서 관리하는 무료 체험판을 구독하게 됩니다. 단, 30일이 지나면 해당 상품 구독이 종료되며, ClickHouse Pay As You Go를 계속 사용하려면 이 상품의 다른 "ClickHouse Cloud - Pay As You Go" 옵션으로 다시 구독해야 합니다.
:::

<Image img={aws_marketplace_payg_3} alt="AWS Marketplace 구독" border/>

### 계정 설정 \{#set-up-your-account\}

이 시점에서는 설정이 완료되지 않았으며 ClickHouse Cloud 조직이 아직 Marketplace를 통해 청구되지 않습니다. Marketplace 구독 화면에서 **Set up your account**를 클릭하여 ClickHouse Cloud로 이동한 뒤, 나머지 설정을 완료해야 합니다.

<Image img={aws_marketplace_payg_4} alt="계정 설정" border/>

ClickHouse Cloud로 리디렉션되면 기존 계정으로 로그인하거나 새 계정을 등록할 수 있습니다. 이 단계는 ClickHouse Cloud 조직을 AWS Marketplace 청구에 연결하기 위해 매우 중요합니다.

:::note[신규 ClickHouse Cloud 사용자]
신규 ClickHouse Cloud 사용자인 경우 아래 단계를 따르십시오.
:::

<details>
<summary><strong>신규 사용자용 단계</strong></summary>

신규 ClickHouse Cloud 사용자인 경우 페이지 하단의 **Register**를 클릭합니다. 새 사용자를 생성하고 이메일을 확인하라는 메시지가 표시됩니다. 이메일을 확인한 후에는 ClickHouse Cloud 로그인 페이지를 닫고, https://console.clickhouse.cloud 에서 새 사용자 이름으로 로그인하면 됩니다.

<Image img={aws_marketplace_payg_5} size="md" alt="ClickHouse Cloud 가입"/>

:::note[신규 사용자]
비즈니스에 대한 기본 정보를 추가로 제공해야 합니다. 아래 스크린샷을 참고하십시오.
:::

<Image img={aws_marketplace_payg_6} size="md" alt="시작하기 전에"/>

<Image img={aws_marketplace_payg_7} size="md" alt="시작하기 전 단계 계속"/>

</details>

기존 ClickHouse Cloud 사용자라면 보유 중인 자격 증명으로 로그인하면 됩니다.

### 조직에 Marketplace Subscription 추가 \{#add-marketplace-subscription\}

성공적으로 로그인한 후, 이 Marketplace 구독으로 청구할 새 조직을 생성할지, 아니면 이 구독에 청구를 연결할 기존 조직을 선택할지 결정합니다. 

<Image img={aws_marketplace_payg_8} size="md" alt="Marketplace subscription 추가" border/>

이 단계를 완료하면 조직이 해당 AWS 구독에 연결되며, 모든 사용량은 AWS 계정을 통해 청구됩니다.

ClickHouse UI의 조직 청구 페이지에서 청구가 AWS Marketplace와 연결되었는지 확인할 수 있습니다.

<Image img={aws_marketplace_payg_9} size="lg" alt="청구 페이지 확인" border/>

</VerticalStepper>

## 지원 \{#support\}

문제가 발생하면 언제든지 [지원팀](https://clickhouse.com/support/program)에 문의해 주십시오.