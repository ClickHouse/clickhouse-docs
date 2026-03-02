---
sidebar_label: '개인 데이터 접근'
slug: /cloud/manage/personal-data-access
title: '개인 데이터 접근'
description: '등록된 사용자는 ClickHouse에서 연락처 정보를 포함한 개인 계정 데이터를 조회하고 관리할 수 있습니다.'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'personal data', 'DSAR', 'data subject access request', 'privacy policy', 'GDPR']
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';


## 소개 \{#intro\}

등록된 사용자라면 ClickHouse에서 연락처 정보를 포함한 개인 계정 정보를 조회하고 관리할 수 있습니다. 역할에 따라 조직 내 다른 사용자의 연락처 정보, API 키 세부 정보 및 기타 관련 정보에 대한 액세스 권한도 포함될 수 있습니다. 이러한 정보는 ClickHouse 콘솔을 통해 셀프 서비스 방식으로 직접 관리할 수 있습니다.

**데이터 주체 열람 요청(Data Subject Access Request, DSAR)이란**

거주 지역에 따라, 관련 법률에서 ClickHouse가 보유한 개인정보에 대해 ClickHouse 개인정보 보호정책에 설명된 바와 같이 추가적인 권리(데이터 주체 권리)를 부여하는 경우가 있습니다. 데이터 주체 권리를 행사하는 절차를 「데이터 주체 열람 요청(Data Subject Access Request, DSAR)」이라고 합니다.

**개인정보의 범위**

ClickHouse가 어떤 개인정보를 수집하고 이를 어떻게 사용할 수 있는지에 대한 자세한 내용은 ClickHouse의 개인정보 보호정책을 참조하십시오.

## 셀프 서비스 \{#self-service\}

기본적으로 ClickHouse는 사용자가 ClickHouse 콘솔에서 자신의 개인정보를 직접 조회할 수 있도록 합니다.

아래는 계정 설정 및 서비스 사용 중 ClickHouse가 수집하는 데이터에 대한 요약과, 특정 개인정보를 ClickHouse 콘솔에서 어디에서 조회할 수 있는지에 대한 정보입니다.

| Location/URL | 설명 | 개인정보 |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | 계정 등록 | email, password |
| https://console.clickhouse.cloud/profile | 일반 사용자 프로필 정보 |  name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 조직 내 사용자 목록 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API 키 목록 및 생성자 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 개별 사용자의 작업이 기록된 활동 로그 | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 결제 정보 및 청구서 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouse Support와의 상호작용 | name, email |

참고: `OrgID`가 포함된 URL은 해당 계정의 실제 `OrgID`로 변경해야 합니다.

### 기존 고객 \{#current-customers\}

이미 계정을 보유하고 있으며 셀프서비스 옵션으로 개인 데이터 관련 문제가 해결되지 않은 경우, Privacy Policy(개인정보 처리방침)에 따른 Data Subject Access Request를 제출할 수 있습니다. 이를 위해 ClickHouse 계정에 로그인한 후 [support case](https://console.clickhouse.cloud/support)를 생성하십시오. 이렇게 하면 본인 인증에 도움이 되며, 요청을 처리하는 절차를 보다 효율적으로 진행할 수 있습니다.

다음 정보를 support case에 반드시 포함하십시오:

| Field | 요청에 포함해야 할 텍스트 |
|-------------|---------------------------------------------------|
| Subject     | Data Subject Access Request (DSAR)                |
| Description | ClickHouse가 찾아보고, 수집하고, 제공하기를 원하는 정보에 대한 상세한 설명을 작성하십시오. |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloud에서 Support Case를 생성하는 양식" border />

### 계정이 없는 개인 \{#individuals-without-an-account\}

당사에 계정이 없고 위의 셀프 서비스 옵션으로도 개인정보 관련 문제가 해결되지 않았으며, 개인정보 보호정책에 따라 데이터 주체 접근 요청(Data Subject Access Request)을 하고자 하는 경우에는 [privacy@clickhouse.com](mailto:privacy@clickhouse.com)으로 이메일을 보내 이러한 요청을 제출할 수 있습니다.

## 신원 확인 \{#identity-verification\}

이메일로 데이터 주체 접근 요청(Data Subject Access Request)을 제출하는 경우, 당사는 신원을 확인하고 요청을 처리하기 위해 특정 정보를 추가로 요청할 수 있습니다. 관련 법령에 따라 당사는 요청을 거부해야 하거나 거부할 수 있습니다. 요청을 거부하는 경우, 법적 제한이 허용하는 범위에서 그 사유를 알려드립니다.

자세한 내용은 [ClickHouse 개인정보 처리방침](https://clickhouse.com/legal/privacy-policy)을 참고하십시오.