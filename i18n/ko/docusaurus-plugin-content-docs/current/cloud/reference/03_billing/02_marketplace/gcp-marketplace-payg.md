---
'slug': '/cloud/billing/marketplace/gcp-marketplace-payg'
'title': 'GCP Marketplace PAYG'
'description': 'GCP Marketplace (PAYG)를 통해 ClickHouse Cloud에 구독하십시오.'
'keywords':
- 'gcp'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';
import Image from '@theme/IdealImage';

Get started with ClickHouse Cloud on the [GCP Marketplace](https://console.cloud.google.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- 구매 권한이 있는 청구 관리자에 의해 활성화된 GCP 프로젝트.
- GCP Marketplace에서 ClickHouse Cloud에 가입하기 위해서는 구매 권한이 있는 계정으로 로그인하고 적절한 프로젝트를 선택해야 합니다.

## Steps to sign up {#steps-to-sign-up}

1. [GCP Marketplace](https://cloud.google.com/marketplace)로 이동하여 ClickHouse Cloud를 검색합니다. 올바른 프로젝트가 선택되었는지 확인하세요.

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace home page" border/>

2. [리스트](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)를 클릭한 다음 **구독**을 클릭합니다.

<Image img={gcp_marketplace_payg_2} size="md" alt="ClickHouse Cloud in GCP Marketplace" border/>

3. 다음 화면에서 구독을 구성합니다:

- 요금제는 기본적으로 "ClickHouse Cloud"로 설정됩니다.
- 구독 기간은 "월간"입니다.
- 적절한 청구 계정을 선택합니다.
- 약관에 동의하고 **구독**을 클릭합니다.

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="Configure subscription in GCP Marketplace" border/>

<br />

4. **구독**을 클릭하면 **ClickHouse에 가입** 모달이 표시됩니다.

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace sign up modal" border/>

<br />

5. 이 시점에서 설정이 아직 완료되지 않았음을 유의하세요. **계정을 설정**을 클릭하여 ClickHouse Cloud로 리디렉션하고 ClickHouse Cloud에 가입해야 합니다.

6. ClickHouse Cloud로 리디렉션된 후, 기존 계정으로 로그인하거나 새 계정으로 등록할 수 있습니다. 이 단계는 ClickHouse Cloud 조직을 GCP Marketplace 청구와 연결하기 위해 매우 중요합니다.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

신규 ClickHouse Cloud 사용자라면 페이지 하단에서 **등록**을 클릭합니다. 새 사용자를 생성하고 이메일을 확인하라는 메시지가 표시됩니다. 이메일을 확인한 후 ClickHouse Cloud 로그인 페이지를 종료하고 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)에서 새 사용자 이름으로 로그인할 수 있습니다.

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

신규 사용자라면 비즈니스에 대한 기본 정보를 제공해야 함을 유의하세요. 아래 스크린샷을 참조하세요.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

기존 ClickHouse Cloud 사용자라면 자격 증명을 사용하여 간단히 로그인하면 됩니다.

7. 로그인에 성공하면 새로운 ClickHouse Cloud 조직이 생성됩니다. 이 조직은 귀하의 GCP 청구 계정에 연결되어 모든 사용량이 귀하의 GCP 계정을 통해 청구됩니다.

8. 로그인 후 청구가 실제로 GCP Marketplace에 연결되어 있는지 확인하고 ClickHouse Cloud 리소스를 설정하기 시작할 수 있습니다.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

9. 가입 확인 이메일을 받게 됩니다:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace confirmation email" border/>

<br />

<br />

문제가 발생하면 주저하지 말고 [저희 지원팀](https://clickhouse.com/support/program)에 문의하세요.
