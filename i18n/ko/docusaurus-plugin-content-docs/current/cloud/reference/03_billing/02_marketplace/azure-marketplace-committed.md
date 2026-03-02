---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace 약정형 계약'
description: 'Azure Marketplace의 약정형 계약을 통해 ClickHouse Cloud를 구독합니다'
keywords: ['Microsoft', 'Azure', '마켓플레이스', '청구', '약정', '약정형 계약']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

약정 계약을 통해 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)에서 ClickHouse Cloud 사용을 시작할 수 있습니다. 약정 계약(일명 Private Offer)은 고객이 일정 기간 동안 ClickHouse Cloud에 일정 금액을 지출하기로 약정하는 계약입니다.


## 사전 요구 사항 \{#prerequisites\}

- 특정 계약 조건에 따라 제공되는 ClickHouse Private Offer.

## 가입 단계 \{#steps-to-sign-up\}

1. 비공개 오퍼를 검토하고 수락할 수 있는 링크가 포함된 이메일을 이미 수신했어야 합니다.

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace 비공개 오퍼 이메일" border/>

<br />

2. 이메일에서 **Review Private Offer** 링크를 클릭합니다. Azure Marketplace 페이지로 이동하며, 비공개 오퍼 세부 정보가 표시됩니다.

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace 비공개 오퍼 세부 정보" border/>

<br />

3. 오퍼를 수락하면 **Private Offer Management** 화면으로 이동합니다. Azure에서 구매를 위해 오퍼를 준비하는 데 다소 시간이 걸릴 수 있습니다.

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace Private Offer Management 페이지" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace Private Offer Management 페이지 로딩 중" border/>

<br />

4. 몇 분 후 페이지를 새로 고칩니다. 오퍼가 **Purchase** 가능한 상태가 되어 있어야 합니다.

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace Private Offer Management 페이지에서 구매 가능 상태" border/>

<br />

5. **Purchase**를 클릭하면 플라이아웃이 열립니다. 다음 항목을 완료합니다.

<br />

- Subscription 및 resource group
- SaaS 구독 이름을 지정합니다.
- 비공개 오퍼가 적용된 billing plan을 선택합니다. 비공개 오퍼가 생성된 기간(예: 1년)에만 금액이 표시됩니다. 다른 billing term 옵션은 $0 금액으로 표시됩니다.
- 반복 결제를 사용할지 여부를 선택합니다. 반복 결제를 선택하지 않으면 청구 기간 종료 시 계약이 종료되며 리소스는 decommissioned 상태로 설정됩니다.
- **Review + subscribe**를 클릭합니다.

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace 구독 폼" border/>

<br />

6. 다음 화면에서 모든 세부 정보를 검토한 후 **Subscribe**를 클릭합니다.

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace 구독 확인" border/>

<br />

7. 다음 화면에서 **Your SaaS subscription in progress** 메시지가 표시됩니다.

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace 구독 제출 중 페이지" border/>

<br />

8. 준비가 완료되면 **Configure account now**를 클릭할 수 있습니다. 이 단계는 Azure 구독을 계정의 ClickHouse Cloud 조직에 바인딩하는 매우 중요한 단계입니다. 이 단계를 수행하지 않으면 Marketplace 구독이 완료되지 않습니다.

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace Configure account now 버튼" border/>

<br />

9. ClickHouse Cloud 가입 또는 로그인 페이지로 리디렉션됩니다. 새 계정으로 가입하거나 기존 계정으로 로그인할 수 있습니다. 로그인하면 Azure Marketplace를 통해 사용 및 과금이 가능한 새 조직이 생성됩니다.

10. 계속 진행하기 전에 주소 및 회사 정보와 관련된 몇 가지 질문에 응답해야 합니다.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 가입 정보 입력 폼" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 가입 정보 입력 폼 2" border/>

<br />

11. **Complete sign up**을 클릭하면 ClickHouse Cloud 내의 조직 화면으로 이동하며, 여기에서 청구 화면을 확인하여 Azure Marketplace를 통해 과금되고 있는지 확인하고 서비스를 생성할 수 있습니다.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud 가입 정보 입력 폼" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 가입 정보 입력 폼" border/>

<br />

문제가 발생하는 경우 [지원팀](https://clickhouse.com/support/program)에 문의하시기 바랍니다.