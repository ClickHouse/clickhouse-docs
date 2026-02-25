---
sidebar_label: 'IP 필터 설정'
slug: /cloud/security/setting-ip-filters
title: 'IP 필터 설정'
description: '이 페이지에서는 ClickHouse Cloud에서 ClickHouse 서비스에 대한 액세스를 제어하기 위해 IP 필터를 설정하는 방법을 설명합니다.'
doc_type: 'guide'
keywords: ['IP 필터', 'IP 액세스 목록']
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';


## IP 필터 설정 \{#setting-ip-filters\}

IP 액세스 목록은 어떤 소스 주소에서의 연결을 허용할지 지정하여 ClickHouse 서비스 또는 API 키로 향하는 트래픽을 필터링합니다. 이 목록은 각 서비스와 각 API 키별로 설정할 수 있습니다. 목록은 서비스 또는 API 키를 생성할 때뿐만 아니라 생성 후에도 구성할 수 있습니다.

:::warning[서비스의 IP 액세스 목록을 구성하십시오]
ClickHouse Cloud 서비스를 생성하면 IP 허용 목록의 기본 설정은 `Allow from anywhere`입니다. 가능한 한 빨리 특정 IP 주소 또는 범위로 액세스를 제한할 것을 강력히 권장합니다. 서비스를 `Allow from anywhere`로 설정하면, 공개 IP를 검색하는 인터넷 크롤러와 스캐너에 의해 유휴 상태의 서비스가 주기적으로 활성 상태로 전환될 수 있으며, 그 결과 예상치 못한 비용이 발생할 수 있습니다.
:::

## 준비 \{#prepare\}

시작하기 전에 액세스 목록에 추가해야 하는 IP 주소 또는 주소 범위를 미리 정리합니다. 재택 근무자, 온콜 근무 위치, VPN 등도 함께 고려합니다. IP 액세스 목록 사용자 인터페이스는 개별 주소와 CIDR 표기법을 모두 지원합니다.

Classless Inter-domain Routing(CIDR) 표기법을 사용하면 기존 Class A, B, C(8, 6, 24) 서브넷 마스크 크기보다 더 작은 IP 주소 범위를 지정할 수 있습니다. 필요한 경우 [ARIN](https://account.arin.net/public/cidrCalculator)을 포함한 여러 기관에서 CIDR 계산기를 제공합니다. CIDR 표기법에 대한 보다 자세한 내용은 [Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC를 참조하십시오.

## IP 액세스 목록 생성 또는 수정 \{#create-or-modify-an-ip-access-list\}

:::note PrivateLink 외부 연결에만 적용됨
IP 액세스 목록은 [PrivateLink](/cloud/security/connectivity/private-networking) 외부, 공용 인터넷에서의 연결에만 적용됩니다.
트래픽을 PrivateLink에서만 받으려면 IP Allow list에서 `DenyAll`을 설정합니다.
:::

<details>
  <summary>ClickHouse 서비스용 IP 액세스 목록</summary>

  ClickHouse 서비스를 생성할 때 IP Allow list의 기본 설정은 「Allow from anywhere.」입니다. 
  
  ClickHouse Cloud 서비스 목록에서 서비스를 선택한 다음 **Settings**를 선택합니다. **Security** 섹션에서 IP 액세스 목록을 확인할 수 있습니다. 여기서 Add IPs 버튼을 클릭합니다.
  
  그러면 다음과 같은 항목을 구성할 수 있는 사이드바가 표시됩니다.
  
- 서비스로 들어오는 트래픽을 모든 위치에서 허용
- 특정 위치에서만 서비스에 대한 액세스 허용
- 서비스에 대한 모든 액세스 거부
  
</details>

<details>
  <summary>API 키용 IP 액세스 목록</summary>

  API 키를 생성할 때 IP Allow list의 기본 설정은 「Allow from anywhere.」입니다.
  
  API 키 목록에서 **Actions** 컬럼의 API 키 옆에 있는 점 세 개 아이콘을 클릭하고 **Edit**을 선택합니다. 화면 하단에서 IP 액세스 목록과 다음과 같은 구성 옵션을 확인할 수 있습니다.

- 서비스로 들어오는 트래픽을 모든 위치에서 허용
- 특정 위치에서만 서비스에 대한 액세스 허용
- 서비스에 대한 모든 액세스 거부
  
</details>

다음 스크린샷은 「NY Office range」로 설명된 IP 주소 범위에서의 트래픽을 허용하는 액세스 목록을 보여줍니다.

<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloud의 기존 액세스 목록" border/>

### 가능한 작업 \{#possible-actions\}

1. 항목을 추가하려면 **+ Add new IP**를 클릭합니다.

다음 예시는 `London server`라는 설명과 함께 단일 IP 주소를 추가하는 경우입니다:

<Image img={ip_filter_add_single_ip} size="md" alt="ClickHouse Cloud의 액세스 목록에 단일 IP를 추가하는 화면" border/>

2. 기존 항목 삭제

X(교차) 아이콘을 클릭하면 항목을 삭제할 수 있습니다.

3. 기존 항목 편집

항목을 직접 수정합니다.

4. **Anywhere**에서의 액세스로 전환

권장되는 방식은 아니지만 허용되기는 합니다. ClickHouse 위에 구축된 애플리케이션만 퍼블릭으로 노출하고, 백엔드 ClickHouse Cloud 서비스에 대한 액세스는 제한하는 구성을 권장합니다.

변경 사항을 적용하려면 **Save**를 클릭해야 합니다.

## 검증 \{#verification\}

필터를 생성한 후 허용된 범위 내에서 서비스에 연결이 가능한지, 그리고 허용 범위 밖에서의 연결이 차단되는지 각각 확인합니다. 간단한 `curl` 명령을 사용하여 이를 검증할 수 있습니다:

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


## 제한 사항 \{#limitations\}

- 현재 IP 액세스 목록은 IPv4만을 지원합니다