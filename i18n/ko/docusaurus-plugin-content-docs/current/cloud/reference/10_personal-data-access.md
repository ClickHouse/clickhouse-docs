---
'sidebar_label': '개인 데이터 접근'
'slug': '/cloud/manage/personal-data-access'
'title': '개인 데이터 접근'
'description': '등록된 사용자로서, ClickHouse는 연락처 정보를 포함한 개인 계정 데이터를 보고 관리할 수 있도록 허용합니다.'
'doc_type': 'reference'
'keywords':
- 'ClickHouse Cloud'
- 'personal data'
- 'DSAR'
- 'data subject access request'
- 'privacy policy'
- 'GDPR'
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## Intro {#intro}

등록된 사용자로서, ClickHouse는 연락처 정보를 포함한 개인 계정 데이터를 보고 관리할 수 있도록 허용합니다. 귀하의 역할에 따라, 이는 귀하 조직의 다른 사용자의 연락처 정보, API 키 세부정보 및 기타 관련 정보에 대한 접근을 포함할 수 있습니다. 이러한 세부정보는 ClickHouse 콘솔을 통해 자가 서비스 방식으로 직접 관리할 수 있습니다.

**데이터 주체 접근 요청 (DSAR)이란 무엇인가요?**

귀하가 위치한 곳에 따라, 해당 법률은 ClickHouse가 귀하에 대해 보유하고 있는 개인 데이터에 대한 추가 권리를 제공할 수 있습니다 (데이터 주체 권리), 이는 ClickHouse 개인정보 보호 정책에 설명되어 있습니다. 데이터 주체 권리를 행사하는 과정은 데이터 주체 접근 요청 (DSAR)으로 알려져 있습니다.

**개인 데이터의 범위**

ClickHouse가 수집하는 개인 데이터와 이를 어떻게 사용할 수 있는지에 대한 자세한 내용은 ClickHouse 개인정보 보호 정책을 검토하시기 바랍니다.

## Self service {#self-service}

기본적으로, ClickHouse는 사용자가 ClickHouse 콘솔에서 직접 자신의 개인 데이터를 볼 수 있도록 권한을 부여합니다.

아래는 ClickHouse가 계정 설정 및 서비스 사용 중 수집하는 데이터 요약과 ClickHouse 콘솔에서 특정 개인 데이터를 볼 수 있는 위치에 대한 정보입니다.

| Location/URL | Description | Personal Data |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | 계정 등록 | 이메일, 비밀번호 |
| https://console.clickhouse.cloud/profile | 일반 사용자 프로필 세부정보 | 이름, 이메일 |
| https://console.clickhouse.cloud/organizations/OrgID/members | 조직의 사용자 목록 | 이름, 이메일 |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API 키 목록과 누가 생성했는지 | 이메일 |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 개별 사용자의 작업을 나열하는 활동 로그 | 이메일 |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 청구 정보 및 송장 | 청구 주소, 이메일 |
| https://console.clickhouse.cloud/support | ClickHouse 지원과의 상호작용 | 이름, 이메일 |

참고: `OrgID`가 포함된 URL은 귀하의 특정 계정에 대한 `OrgID`를 반영하도록 업데이트해야 합니다.

### Current customers {#current-customers}

계정이 있는 경우, 자가 서비스 옵션으로 개인 데이터 문제가 해결되지 않으면 개인정보 보호 정책에 따라 데이터 주체 접근 요청을 제출할 수 있습니다. 그렇게 하려면 ClickHouse 계정에 로그인하고 [지원 사례](https://console.clickhouse.cloud/support)를 열어 주세요. 이는 귀하의 신원을 확인하고 요청을 처리하는 과정을 간소화하는 데 도움이 됩니다.

지원 사례에 다음 세부정보를 포함하는 것을 잊지 마세요:

| Field | Text to include in your request |
|-------------|---------------------------------------------------|
| Subject     | 데이터 주체 접근 요청 (DSAR)                    |
| Description | ClickHouse가 찾고, 수집하고, 제공할 정보를 자세히 설명하는 내용입니다. |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloud의 지원 사례 양식" border />

### Individuals without an account {#individuals-without-an-account}

계정이 없고, 위의 자가 서비스 옵션으로 개인 데이터 문제가 해결되지 않았으며, 개인정보 보호 정책에 따라 데이터 주체 접근 요청을 하고 싶다면, [privacy@clickhouse.com](mailto:privacy@clickhouse.com)으로 이메일을 통해 이러한 요청을 제출할 수 있습니다.

## Identity verification {#identity-verification}

이메일을 통해 데이터 주체 접근 요청을 제출할 경우, 귀하의 신원을 확인하고 요청을 처리하는 데 필요한 특정 정보를 요청할 수 있습니다. 해당 법률은 귀하의 요청을 거절할 수 있게 요구하거나 허용할 수 있습니다. 요청을 거절할 경우, 법적 제한에 따라 그 이유를 알려드릴 것입니다.

더 많은 정보는 [ClickHouse 개인정보 보호 정책](https://clickhouse.com/legal/privacy-policy)을 검토하시기 바랍니다.
