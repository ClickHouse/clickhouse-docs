---
'slug': '/cloud/billing/marketplace/azure-marketplace-payg'
'title': 'Azure Marketplace PAYG'
'description': 'Azure Marketplace (PAYG)을 통해 ClickHouse Cloud에 구독하세요.'
'keywords':
- 'azure'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Get started with ClickHouse Cloud on the [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- 귀하의 청구 관리자에 의해 구매 권한이 활성화된 Azure 프로젝트.
- Azure Marketplace에서 ClickHouse Cloud를 구독하려면 구매 권한이 있는 계정으로 로그인하고 적절한 프로젝트를 선택해야 합니다.

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)로 이동하여 ClickHouse Cloud를 검색합니다. 마켓플레이스에서 제공을 구매할 수 있도록 로그인되어 있는지 확인하십시오.

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

2. 제품 목록 페이지에서 **지금 받기**를 클릭합니다.

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

3. 다음 화면에서 이름, 이메일 및 위치 정보를 제공해야 합니다.

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

4. 다음 화면에서 **구독**을 클릭합니다.

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

5. 다음 화면에서 구독, 리소스 그룹 및 리소스 그룹 위치를 선택합니다. 리소스 그룹 위치는 ClickHouse Cloud에서 서비스 시작하려는 위치와 동일할 필요는 없습니다.

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

6. 구독 이름을 제공하고 사용 가능한 옵션에서 청구 조건을 선택해야 합니다. **정기 청구**를 켜거나 끌 수 있습니다. "끄기"로 설정하면 청구 기간이 끝난 후 계약이 종료되고 리소스가 사용 중지됩니다.

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

7. **"검토 + 구독"**을 클릭합니다.

8. 다음 화면에서 모든 항목이 올바른지 확인하고 **구독**을 클릭합니다.

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

9. 이 시점에서 ClickHouse Cloud의 Azure 구독에 가입했지만 ClickHouse Cloud에서 계정을 설정하지 않았음을 유의하십시오. 다음 단계는 ClickHouse Cloud가 Azure 구독에 연결할 수 있도록 하는 데 필요하며, Azure 마켓플레이스를 통해 청구가 올바르게 이루어지도록 합니다.

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

10. Azure 설정이 완료되면 **지금 계정 구성** 버튼이 활성화됩니다.

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

11. **지금 계정 구성**을 클릭합니다.

<br />

계정 구성에 대한 세부정보와 함께 아래와 같은 이메일을 받게 됩니다:

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

12. ClickHouse Cloud 가입 또는 로그인 페이지로 리디렉션됩니다. ClickHouse Cloud로 리디렉션되면 기존 계정으로 로그인하거나 새 계정으로 등록할 수 있습니다. 이 단계는 ClickHouse Cloud 조직을 Azure Marketplace 청구에 묶는 데 매우 중요합니다.

13. 새로운 사용자라면 비즈니스에 대한 기본 정보를 제공해야 합니다. 아래 스크린샷을 참조하십시오.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

**가입 완료**를 클릭하면 ClickHouse Cloud 내에서 조직으로 이동하게 되며, Azure Marketplace를 통해 청구가 이루어지는지 확인하고 서비스를 생성할 수 있는 청구 화면을 볼 수 있습니다.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

14. 문제가 발생하면 주저하지 말고 [지원 팀에 문의하십시오](https://clickhouse.com/support/program).
