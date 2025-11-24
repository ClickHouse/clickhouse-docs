---
'slug': '/cloud/billing/marketplace/gcp-marketplace-committed-contract'
'title': 'GCP Marketplace 약정 계약'
'description': 'GCP Marketplace를 통해 ClickHouse Cloud에 구독하세요 (약정 계약)'
'keywords':
- 'gcp'
- 'google'
- 'marketplace'
- 'billing'
- 'committed'
- 'committed contract'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import gcp_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-1.png';
import gcp_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-2.png';
import gcp_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-3.png';
import gcp_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-4.png';
import gcp_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-5.png';
import gcp_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-6.png';
import gcp_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-committed-7.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';

ClickHouse Cloud를 [GCP Marketplace](https://console.cloud.google.com/marketplace)에서 커미트 계약을 통해 시작하세요. 커미트 계약은 또한 개인 제안으로 알려져 있으며, 고객이 특정 기간 동안 ClickHouse Cloud에 대해 일정 금액을 지출하는 것에 동의할 수 있도록 합니다.

## 전제 조건 {#prerequisites}

- 특정 계약 조건에 따른 ClickHouse의 개인 제안.

## 가입 단계 {#steps-to-sign-up}

1. 개인 제안을 검토하고 수락할 수 있는 링크가 포함된 이메일을 받으셨을 것입니다.

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="GCP Marketplace private offer email" border />

<br />

2. 이메일의 **제안 검토** 링크를 클릭하세요. 그러면 개인 제안 세부정보가 포함된 GCP Marketplace 페이지로 이동됩니다.

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="GCP Marketplace offer summary" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="GCP Marketplace pricing summary" border/>

<br />

3. 개인 제안 세부정보를 검토하고 모든 것이 올바르면 **수락**을 클릭하세요.

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="GCP Marketplace accept page" border/>

<br />

4. **제품 페이지로 이동**을 클릭하세요.

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="GCP Marketplace acceptance confirmation" border/>

<br />

5. **제공업체에서 관리**를 클릭하세요.

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="GCP Marketplace ClickHouse Cloud page" border/>

<br />

이 시점에서 ClickHouse Cloud로 리디렉션되고 가입 또는 로그인을 해야 합니다. 이 단계를 완료하지 않으면 GCP Marketplace 구독을 ClickHouse Cloud에 연결할 수 없습니다.

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="GCP Marketplace leaving website confirmation modal" border/>

<br />

6. ClickHouse Cloud로 리디렉션되면 기존 계정으로 로그인하거나 새 계정으로 등록할 수 있습니다.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

새로운 ClickHouse Cloud 사용자라면 페이지 하단의 **등록**을 클릭하세요. 새 사용자를 생성하고 이메일을 확인하라는 메시지가 표시됩니다. 이메일을 확인한 후 ClickHouse Cloud 로그인 페이지를 떠나 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)에서 새 사용자 이름으로 로그인할 수 있습니다.

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

새 사용자라면 비즈니스에 대한 기본 정보를 제공해야 한다는 점에 유의하세요. 아래 스크린샷을 참조하세요.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

기존 ClickHouse Cloud 사용자라면 자격 증명을 사용하여 로그인하면 됩니다.

7. 로그인에 성공하면 새로운 ClickHouse Cloud 조직이 생성됩니다. 이 조직은 귀하의 GCP 청구 계정에 연결되며 모든 사용량은 귀하의 GCP 계정을 통해 청구됩니다.

8. 로그인 후, 귀하의 청구가 실제로 GCP Marketplace에 연결되어 있는지 확인하고 ClickHouse Cloud 리소스를 설정하기 시작할 수 있습니다.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

9. 가입 확인 이메일을 받아야 합니다:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace confirmation email" border/>

<br />

<br />

문제가 발생하면 주저하지 말고 [지원 팀에 문의](https://clickhouse.com/support/program)하세요.
