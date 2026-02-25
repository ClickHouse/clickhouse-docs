---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace PAYG'
description: 'GCP Marketplace(PAYG)를 통해 ClickHouse Cloud를 구독하는 방법을 설명합니다.'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
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

PAYG(Pay-as-you-go) Public Offer를 통해 [GCP Marketplace](https://console.cloud.google.com/marketplace)에서 ClickHouse Cloud 사용을 시작하십시오.


## 사전 준비 사항 \{#prerequisites\}

- 결제 관리자가 구매 권한을 부여한 GCP 프로젝트
- GCP Marketplace에서 ClickHouse Cloud를 구독하려면 구매 권한이 있는 계정으로 로그인한 후, 해당 프로젝트를 선택해야 합니다.

## 가입 단계 \{#steps-to-sign-up\}

1. [GCP Marketplace](https://cloud.google.com/marketplace)에 접속한 후 ClickHouse Cloud를 검색합니다. 올바른 프로젝트가 선택되어 있는지 확인합니다.

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace 홈 페이지" border/>

2. 해당 [상품 페이지](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)를 클릭한 다음 **Subscribe**를 클릭합니다.

<Image img={gcp_marketplace_payg_2} size="md" alt="GCP Marketplace의 ClickHouse Cloud" border/>

3. 다음 화면에서 구독을 설정합니다:

- 플랜은 기본값으로 "ClickHouse Cloud"가 선택되어 있습니다.
- 구독 기간은 "Monthly"입니다.
- 적절한 결제 계정을 선택합니다.
- 약관에 동의한 후 **Subscribe**를 클릭합니다.

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="GCP Marketplace에서 구독 구성" border/>

<br />

4. **Subscribe**를 클릭하면 **Sign up with ClickHouse** 모달 창이 표시됩니다.

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace 가입 모달" border/>

<br />

5. 이 시점에서는 아직 설정이 완료되지 않았습니다. **Set up your account**를 클릭하여 ClickHouse Cloud로 이동한 후, ClickHouse Cloud에서 가입을 완료해야 합니다.

6. ClickHouse Cloud로 이동하면 기존 계정으로 로그인하거나 새 계정을 등록할 수 있습니다. 이 단계는 ClickHouse Cloud 조직을 GCP Marketplace 결제와 연결하기 위해 매우 중요합니다.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 로그인 페이지" border/>

<br />

새로운 ClickHouse Cloud 사용자라면, 페이지 하단의 **Register**를 클릭합니다. 새 사용자를 생성하고 이메일을 인증하라는 안내가 표시됩니다. 이메일 인증을 완료한 후에는 ClickHouse Cloud 로그인 페이지를 닫고 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)에서 새 사용자 이름으로 로그인하면 됩니다.

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 가입 페이지" border/>

<br />

새로운 사용자라면 비즈니스에 대한 기본 정보를 추가로 제공해야 합니다. 아래 스크린샷을 참고하십시오.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 가입 정보 입력 양식" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 가입 정보 입력 양식 2" border/>

<br />

기존 ClickHouse Cloud 사용자라면 보유 중인 자격 증명으로 로그인하면 됩니다.

7. 로그인에 성공하면 새로운 ClickHouse Cloud 조직이 생성됩니다. 이 조직은 GCP 결제 계정에 연결되며, 모든 사용량은 GCP 계정을 통해 청구됩니다.

8. 로그인한 후 결제가 실제로 GCP Marketplace에 연결되어 있는지 확인한 다음, ClickHouse Cloud 리소스 구성을 시작할 수 있습니다.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud 로그인 페이지" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 신규 서비스 페이지" border/>

<br />

9. 가입 완료를 확인하는 이메일을 수신하게 됩니다.

<br />

<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 확인 이메일" border/>

<br />

<br />

문제가 발생하면 [지원팀](https://clickhouse.com/support/program)에 언제든지 문의하십시오.