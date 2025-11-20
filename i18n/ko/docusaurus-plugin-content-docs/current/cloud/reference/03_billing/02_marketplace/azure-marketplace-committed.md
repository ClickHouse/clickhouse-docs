---
'slug': '/cloud/billing/marketplace/azure-marketplace-committed-contract'
'title': 'Azure Marketplace 의무 계약'
'description': 'Azure Marketplace (의무 계약)를 통해 ClickHouse Cloud에 가입하세요.'
'keywords':
- 'Microsoft'
- 'Azure'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
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

Get started with ClickHouse Cloud on the [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) via a committed contract. A committed contract, also known as a a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.

## Prerequisites {#prerequisites}

- 특정 계약 조건을 기반으로 ClickHouse에서 제공하는 Private Offer.

## Steps to sign up {#steps-to-sign-up}

1. 개인 제안을 검토하고 수락하는 링크가 포함된 이메일을 받았어야 합니다.

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace private offer email" border/>

<br />

2. 이메일의 **Review Private Offer** 링크를 클릭하십시오. 이렇게 하면 개인 제안 세부 정보가 포함된 Azure Marketplace 페이지로 이동합니다.

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace private offer details" border/>

<br />

3. 제안을 수락하면 **Private Offer Management** 화면으로 이동합니다. Azure는 구매를 위한 제안을 준비하는 데 시간이 걸릴 수 있습니다.

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace Private Offer Management page" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace Private Offer Management page loading" border/>

<br />

4. 몇 분 후 페이지를 새로 고치십시오. 제안이 **Purchase**에 대해 준비되어 있어야 합니다.

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace Private Offer Management page purchase enabled" border/>

<br />

5. **Purchase**를 클릭하십시오. 플라이아웃이 열리게 됩니다. 다음을 완료하십시오:

<br />

- 구독 및 리소스 그룹 
- SaaS 구독에 대한 이름 제공
- 개인 제안에 대한 청구 계획 선택. 개인 제안이 생성된 기간(예: 1년)만 금액이 나타납니다. 다른 청구 기간 옵션은 $0 금액이 표시됩니다.
- 반복 청구 여부 선택. 반복 청구가 선택되지 않으면 계약이 청구 기간 종료 시 종료되며 리소스가 비활성화됩니다.
- **Review + subscribe**를 클릭하십시오.

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace subscription form" border/>

<br />

6. 다음 화면에서 모든 세부 정보를 검토하고 **Subscribe**를 클릭하십시오.

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace subscription confirmation" border/>

<br />

7. 다음 화면에서 **Your SaaS subscription in progress**를 확인할 수 있습니다.

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace subscription submitting page" border/>

<br />

8. 준비가 되면 **Configure account now**를 클릭할 수 있습니다. 이는 Azure 구독을 ClickHouse Cloud 조직에 연결하는 중요한 단계입니다. 이 단계를 수행하지 않으면 마켓플레이스 구독이 완료되지 않습니다.

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace configure account now button" border/>

<br />

9. ClickHouse Cloud 가입 또는 로그인 페이지로 리디렉션됩니다. 새 계정을 사용하여 가입하거나 기존 계정으로 로그인할 수 있습니다. 로그인하면 사용 및 Azure Marketplace를 통해 청구할 준비가 된 새로운 조직이 생성됩니다.

10. 진행하기 전에 몇 가지 질문(주소 및 회사 세부정보)에 답변해야 합니다.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

11. **Complete sign up**를 클릭하면 ClickHouse Cloud 내의 조직으로 이동하여 Azure Marketplace를 통해 청구되는지 확인할 수 있는 청구 화면을 볼 수 있으며, 서비스를 생성할 수 있습니다.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

문제가 발생하면 주저하지 말고 [우리 지원 팀](https://clickhouse.com/support/program) 에 문의하십시오.
