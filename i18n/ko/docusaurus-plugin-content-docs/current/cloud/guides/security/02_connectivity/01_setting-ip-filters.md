---
'sidebar_label': 'IP 필터 설정'
'slug': '/cloud/security/setting-ip-filters'
'title': 'IP 필터 설정'
'description': '이 페이지는 ClickHouse Cloud에서 ClickHouse 서비스에 대한 접근을 제어하기 위해 IP 필터를 설정하는
  방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'IP filters'
- 'IP access list'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## Setting IP filters {#setting-ip-filters}

IP 접근 목록은 어떤 출발지 주소가 연결을 허용하는지 지정함으로써 ClickHouse 서비스 또는 API 키에 대한 트래픽을 필터링합니다. 이러한 목록은 각 서비스 및 각 API 키에 대해 구성할 수 있습니다. 목록은 서비스 또는 API 키 생성 중 또는 이후에 구성할 수 있습니다.

:::important
ClickHouse Cloud 서비스에 대한 IP 접근 목록 생성을 건너뛰면 해당 서비스에 대한 트래픽이 허용되지 않습니다. ClickHouse 서비스의 IP 접근 목록이 `Allow from anywhere`로 설정된 경우, 공개 IP를 찾는 인터넷 크롤러와 스캐너에 의해 서비스가 주기적으로 유휴 상태에서 활성 상태로 이동될 수 있으며, 이로 인해 예상치 못한 비용이 발생할 수 있습니다.
:::

## Prepare {#prepare}

시작하기 전에 접근 목록에 추가해야 할 IP 주소 또는 범위를 수집하십시오. 원격 작업자, 대기 위치, VPN 등을 고려하십시오. IP 접근 목록 사용자 인터페이스는 개별 주소와 CIDR 표기법을 수용합니다.

클래스리스 인터도메인 라우팅(CIDR) 표기법을 사용하면 전통적인 클래스 A, B 또는 C (8, 6, 또는 24) 서브넷 마스크 크기보다 작은 IP 주소 범위를 지정할 수 있습니다. [ARIN](https://account.arin.net/public/cidrCalculator) 및 여러 다른 조직에서 CIDR 계산기가 필요하면 제공하며, CIDR 표기법에 대한 추가 정보는 [클래스리스 인터도메인 라우팅(CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC를 참조하십시오.

## Create or modify an IP access list {#create-or-modify-an-ip-access-list}

:::note Applicable only to connections outside of PrivateLink
IP 접근 목록은 [PrivateLink](/cloud/security/connectivity/private-networking) 밖의 공용 인터넷에서의 연결에만 적용됩니다.
만약 PrivateLink에서의 트래픽만 원할 경우, IP 허용 목록에 `DenyAll`을 설정하십시오.
:::

<details>
  <summary>ClickHouse 서비스에 대한 IP 접근 목록</summary>

  ClickHouse 서비스를 생성할 때 IP 허용 목록의 기본 설정은 'Allow from nowhere.'입니다.
  
  ClickHouse Cloud 서비스 목록에서 서비스를 선택한 후 **Settings**를 선택하십시오. **Security** 섹션 아래에서 IP 접근 목록을 찾을 수 있습니다. Add IPs 버튼을 클릭하십시오.
  
  사이드바가 나타나며 다음과 같은 구성 옵션이 제공됩니다:
  
- 서비스에 대한 모든 곳에서의 수신 트래픽 허용
- 특정 위치에서 서비스에 대한 접근 허용
- 서비스에 대한 모든 접근 거부
  
</details>
<details>
  <summary>API 키에 대한 IP 접근 목록</summary>

  API 키를 생성할 때 IP 허용 목록의 기본 설정은 'Allow from anywhere.'입니다.
  
  API 키 목록에서 **Actions** 열의 API 키 옆에 있는 세 개의 점을 클릭하고 **Edit**를 선택하십시오. 화면 하단에서 IP 접근 목록과 구성 옵션을 찾을 수 있습니다:

- 서비스에 대한 모든 곳에서의 수신 트래픽 허용
- 특정 위치에서 서비스에 대한 접근 허용
- 서비스에 대한 모든 접근 거부
  
</details>

이 스크린샷은 "NY Office range"로 설명된 IP 주소 범위에서 트래픽을 허용하는 접근 목록을 보여줍니다:
  
<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloud의 기존 접근 목록" border/>

### Possible actions {#possible-actions}

1. 추가 항목을 추가하려면 **+ Add new IP**를 사용할 수 있습니다.

  이 예는 `London server`라는 설명이 있는 단일 IP 주소를 추가합니다:

<Image img={ip_filter_add_single_ip} size="md" alt="ClickHouse Cloud의 접근 목록에 단일 IP 추가" border/>

2. 기존 항목 삭제

  크로스(x)를 클릭하면 항목이 삭제됩니다.

3. 기존 항목 수정

  항목을 직접 수정합니다.

4. **Anywhere**에서의 접근 허용으로 전환

  이는 권장되지 않지만 허용됩니다. ClickHouse 위에 구축된 애플리케이션을 공개하고 백엔드 ClickHouse Cloud 서비스에 대한 접근을 제한하는 것이 좋습니다.

변경 사항을 적용하려면 **Save**를 클릭해야 합니다.

## Verification {#verification}

필터를 생성한 후, 허용된 범위 내에서 서비스에 대한 연결을 확인하고, 허용된 범위를 벗어난 외부에서의 연결이 거부되는지 확인하십시오. 간단한 `curl` 명령을 사용하여 확인할 수 있습니다:
```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
또는
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="Attempt permitted from inside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## Limitations {#limitations}

- 현재 IP 접근 목록은 IPv4만 지원합니다.
