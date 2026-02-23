---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace PAYG'
description: 'Azure Marketplace (PAYG)를 통해 ClickHouse Cloud를 구독합니다.'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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

[Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)에서 제공되는 PAYG(Pay-as-you-go) Public Offer를 통해 ClickHouse Cloud 사용을 시작하십시오.


## Prerequisites \{#prerequisites\}

- 결제 관리자에 의해 구매 권한이 활성화된 Azure 프로젝트가 있어야 합니다.
- Azure Marketplace에서 ClickHouse Cloud를 구독하려면, 구매 권한이 있는 계정으로 로그인한 상태여야 하며 적절한 프로젝트를 선택해야 합니다.

1. [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps)에 접속하여 ClickHouse Cloud를 검색합니다. 마켓플레이스에서 상품을 구매할 수 있도록 로그인되어 있는지 확인합니다.

<br />

<Image img={azure_marketplace_payg_1} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

2. 제품 목록 페이지에서 **Get It Now**를 클릭합니다.

<br />

<Image img={azure_marketplace_payg_2} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

3. 다음 화면에서 이름, 이메일, 위치 정보를 입력해야 합니다.

<br />

<Image img={azure_marketplace_payg_3} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

4. 다음 화면에서 **Subscribe**를 클릭합니다.

<br />

<Image img={azure_marketplace_payg_4} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

5. 다음 화면에서 구독, 리소스 그룹, 리소스 그룹 위치를 선택합니다. 리소스 그룹 위치는 ClickHouse Cloud에서 서비스를 실행하려는 위치와 동일할 필요는 없습니다.

<br />

<Image img={azure_marketplace_payg_5} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

6. 구독 이름을 지정하고, 제공된 옵션 중에서 청구 기간을 선택합니다. **Recurring billing**을 켜거나 끌 수 있습니다. 이를 "off"로 설정하면 청구 기간이 종료된 후 계약이 종료되고 리소스가 해제됩니다.

<br />

<Image img={azure_marketplace_payg_6} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

7. **"Review + subscribe"**를 클릭합니다.

8. 다음 화면에서 모든 설정이 올바른지 확인한 후 **Subscribe**를 클릭합니다.

<br />

<Image img={azure_marketplace_payg_7} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

9. 이 시점에서 Azure에서 ClickHouse Cloud 구독은 완료되었지만, 아직 ClickHouse Cloud 계정을 설정한 것은 아닙니다. 이후 단계는 ClickHouse Cloud가 Azure 구독과 연결되어 Azure Marketplace를 통해 청구가 올바르게 처리되도록 하기 위해 필수적입니다.

<br />

<Image img={azure_marketplace_payg_8} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

10. Azure 설정이 완료되면 **Configure account now** 버튼이 활성화됩니다.

<br />

<Image img={azure_marketplace_payg_9} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

11. **Configure account now**를 클릭합니다.

<br />

아래와 같이 계정 구성을 위한 상세 정보가 포함된 이메일을 받게 됩니다.

<br />

<Image img={azure_marketplace_payg_10} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

12. ClickHouse Cloud 가입 또는 로그인 페이지로 리디렉션됩니다. ClickHouse Cloud로 리디렉션된 후에는 기존 계정으로 로그인하거나 새 계정을 등록할 수 있습니다. 이 단계는 ClickHouse Cloud 조직을 Azure Marketplace 청구에 연결하기 위해 매우 중요합니다.

13. 신규 사용자인 경우 비즈니스에 대한 기본 정보도 제공해야 합니다. 아래 스크린샷을 참고하십시오.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 가입 정보 양식 2" border/>

<br />

**Complete sign up**을 클릭하면 ClickHouse Cloud 내 조직 페이지로 이동하며, 여기에서 청구 화면을 확인하여 Azure Marketplace를 통해 청구가 이루어지는지 검증하고 서비스를 생성할 수 있습니다.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud 가입 정보 양식" border/>

<br />

14. 문제가 발생하는 경우 [지원 팀](https://clickhouse.com/support/program)에 언제든지 문의하십시오.