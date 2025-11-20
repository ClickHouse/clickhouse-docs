---
'title': '복제본 인식 라우팅'
'slug': '/manage/replica-aware-routing'
'description': '복제본 인식 라우팅을 사용하여 캐시 재사용을 증가시키는 방법'
'keywords':
- 'cloud'
- 'sticky endpoints'
- 'sticky'
- 'endpoints'
- 'sticky routing'
- 'routing'
- 'replica aware routing'
'doc_type': 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 복제본 인식 라우팅

<PrivatePreviewBadge/>

복제본 인식 라우팅(스티키 세션, 스티키 라우팅 또는 세션 친화성으로도 알려짐)은 [Envoy 프록시의 링 해시 로드 밸런싱](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)을 활용합니다. 복제본 인식 라우팅의 주요 목적은 캐시 재사용 가능성을 높이는 것입니다. 격리는 보장하지 않습니다.

서비스에 대해 복제본 인식 라우팅을 활성화하면 서비스 호스트 이름 위에 와일드카드 하위 도메인을 허용합니다. 호스트 이름이 `abcxyz123.us-west-2.aws.clickhouse.cloud`인 서비스의 경우, `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`와 일치하는 모든 호스트 이름을 사용하여 서비스에 방문할 수 있습니다:

|예시 호스트 이름|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoy가 이러한 패턴과 일치하는 호스트 이름을 받으면, 호스트 이름을 기반으로 라우팅 해시를 계산하고 계산된 해시를 기반으로 해시 링에서 해당 ClickHouse 서버를 찾습니다. 서비스에 대한 진행 중인 변경 사항이 없다고 가정할 때(예: 서버 재시작, 확장), Envoy는 항상 연결할 동일한 ClickHouse 서버를 선택합니다.

원래 호스트 이름은 기본 라우팅 알고리즘인 `LEAST_CONNECTION` 로드 밸런싱을 여전히 사용한다는 점에 유의하십시오.

## 복제본 인식 라우팅의 한계 {#limitations-of-replica-aware-routing}

### 복제본 인식 라우팅은 격리를 보장하지 않습니다 {#replica-aware-routing-does-not-guarantee-isolation}

서비스에 대한 중단이 발생할 경우(예: 서버 파드 재시작(버전 업그레이드, 충돌, 수직 확장 등으로 인한 이유)이나 서버 확장/축소 등) 라우팅 해시 링에 중단이 발생하게 됩니다. 이로 인해 동일한 호스트 이름으로 연결된 경우 다른 서버 파드에 연결될 수 있습니다.

### 복제본 인식 라우팅은 프라이빗 링크와 기본적으로 작동하지 않습니다 {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

고객은 새 호스트 이름 패턴에 대한 이름 해결을 가능하게 하려면 DNS 항목을 수동으로 추가해야 합니다. 고객이 이를 잘못 사용할 경우 서버 부하 불균형을 초래할 수 있습니다.

## 복제본 인식 라우팅 구성하기 {#configuring-replica-aware-routing}

복제본 인식 라우팅을 활성화하려면 [지원 팀에 문의하십시오](https://clickhouse.com/support/program).
