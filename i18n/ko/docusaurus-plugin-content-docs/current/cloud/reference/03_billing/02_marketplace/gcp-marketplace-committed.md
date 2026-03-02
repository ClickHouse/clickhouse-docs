---
slug: /cloud/billing/marketplace/gcp-marketplace-committed-contract
title: 'GCP Marketplace 약정 계약'
description: 'GCP Marketplace 약정 계약을 통해 ClickHouse Cloud를 구독합니다'
keywords: ['gcp', 'google', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
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

[Google Cloud Marketplace](https://console.cloud.google.com/marketplace)에서 약정 계약을 통해 ClickHouse Cloud 사용을 시작할 수 있습니다. 약정 계약(Private Offer)은 고객이 일정 기간 동안 ClickHouse Cloud에 일정 금액을 지출하기로 약정할 수 있도록 해 줍니다.


## 선행 조건 \{#prerequisites\}

- 특정 계약 조건에 따라 제공되는 ClickHouse Private Offer.

## 가입 단계 \{#steps-to-sign-up\}

1. 비공개 오퍼를 검토하고 수락할 수 있는 링크가 포함된 이메일을 받았을 것입니다.

<br />

<Image img={gcp_marketplace_committed_1} size="md" alt="GCP Marketplace 비공개 오퍼 이메일" border />

<br />

2. 이메일의 **Review Offer** 링크를 클릭합니다. 그러면 비공개 오퍼 상세 정보가 포함된 GCP Marketplace 페이지로 이동합니다.

<br />

<Image img={gcp_marketplace_committed_2} size="md" alt="GCP Marketplace 오퍼 요약" border/>

<br />

<Image img={gcp_marketplace_committed_3} size="md" alt="GCP Marketplace 가격 요약" border/>

<br />

3. 비공개 오퍼 세부 정보를 검토한 후 모든 내용이 올바르면 **Accept**를 클릭합니다.

<br />

<Image img={gcp_marketplace_committed_4} size="md" alt="GCP Marketplace 수락 페이지" border/>

<br />

4. **Go to product page**를 클릭합니다.

<br />

<Image img={gcp_marketplace_committed_5} size="md" alt="GCP Marketplace 수락 완료 확인" border/>

<br />

5. **Manage on provider**를 클릭합니다.

<br />

<Image img={gcp_marketplace_committed_6} size="md" alt="GCP Marketplace ClickHouse Cloud 페이지" border/>

<br />

이 시점에서 ClickHouse Cloud로 리다이렉트되어 가입 또는 로그인을 완료하는 것이 매우 중요합니다. 이 단계를 완료하지 않으면 GCP Marketplace 구독을 ClickHouse Cloud와 연결할 수 없습니다.

<br />

<Image img={gcp_marketplace_committed_7} size="md" alt="GCP Marketplace 웹사이트 이탈 확인 모달" border/>

<br />

6. ClickHouse Cloud로 리다이렉트되면, 기존 계정으로 로그인하거나 새 계정을 등록할 수 있습니다. 

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud 로그인 페이지" border/>

<br />

새로운 ClickHouse Cloud 사용자라면 페이지 하단의 **Register**를 클릭합니다. 새 사용자를 생성하고 이메일을 인증하라는 메시지가 표시됩니다. 이메일 인증을 완료한 후에는 ClickHouse Cloud 로그인 페이지를 닫고 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)에서 새 사용자 이름으로 로그인하면 됩니다.

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud 회원가입 페이지" border/>

<br />

신규 사용자인 경우 비즈니스와 관련된 기본 정보를 추가로 제공해야 합니다. 아래 스크린샷을 참고하십시오.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud 회원가입 정보 입력 폼" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud 회원가입 정보 입력 폼 2" border/>

<br />

기존 ClickHouse Cloud 사용자라면 보유 중인 자격 증명으로 로그인하면 됩니다.

7. 로그인에 성공하면 새로운 ClickHouse Cloud 조직이 생성됩니다. 이 조직은 GCP 결제 계정과 연결되며, 모든 사용량은 GCP 계정을 통해 청구됩니다.

8. 로그인하면 청구가 실제로 GCP Marketplace와 연결되어 있는지 확인하고 ClickHouse Cloud 리소스 구성을 시작할 수 있습니다.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud 로그인 페이지" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud 신규 서비스 페이지" border/>

<br />

9. 가입이 완료되었음을 확인하는 이메일을 수신하게 됩니다.

<br />

<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace 확인 이메일" border/>

<br />

<br />

문제가 발생하면 [지원 팀](https://clickhouse.com/support/program)에 언제든지 문의해 주십시오.