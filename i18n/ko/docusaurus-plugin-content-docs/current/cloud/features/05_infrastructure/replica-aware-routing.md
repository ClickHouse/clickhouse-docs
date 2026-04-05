---
title: '레플리카 인식 라우팅'
slug: /manage/replica-aware-routing
description: '캐시 재사용을 늘리기 위해 Replica-aware routing을 사용하는 방법'
keywords: ['Cloud', '스티키 엔드포인트', '스티키', '엔드포인트', '스티키 라우팅', '라우팅', 'Replica-aware routing']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 레플리카 인지 라우팅(Replica-aware routing) \{#replica-aware-routing\}

<PrivatePreviewBadge/>

레플리카 인지 라우팅(Replica-aware routing, sticky sessions, sticky routing, session affinity라고도 함)은 [Envoy proxy의 ring hash load balancing](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)을 사용합니다. 레플리카 인지 라우팅의 주요 목적은 캐시 재사용 가능성을 높이는 것입니다. 격리를 보장하지는 않습니다.

서비스에 대해 레플리카 인지 라우팅을 활성화하면, 서비스 호스트 이름 앞에 와일드카드 서브도메인을 허용합니다. 호스트 이름이 `abcxyz123.us-west-2.aws.clickhouse.cloud`인 서비스의 경우, `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`와 일치하는 임의의 호스트 이름을 사용하여 서비스에 접속할 수 있습니다:

|예시 호스트 이름|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoy가 이러한 패턴과 일치하는 호스트 이름을 수신하면, 해당 호스트 이름을 기반으로 라우팅 해시를 계산하고, 계산된 해시에 따라 해시 링에서 해당하는 ClickHouse 서버를 찾습니다. 서비스에 대한 변경 사항(예: 서버 재시작, 스케일 아웃/인)이 진행 중이 아니라고 가정하면 Envoy는 항상 동일한 ClickHouse 서버를 선택하여 연결합니다.

원래 호스트 이름은 기본 라우팅 알고리즘인 `LEAST_CONNECTION` 로드 밸런싱을 계속 사용한다는 점에 유의하십시오.

## Replica-aware routing의 한계 \{#limitations-of-replica-aware-routing\}

### Replica-aware routing은 격리를 보장하지 않습니다 \{#replica-aware-routing-does-not-guarantee-isolation\}

서비스에 변경이나 장애가 발생하면, 예를 들어 서버 파드가 어떤 이유에서든(버전 업그레이드, 크래시, 수직 확장 등) 재시작되거나 서버가 스케일 아웃/인되면 라우팅 해시 링이 변경됩니다. 이로 인해 동일한 호스트 이름을 사용하는 연결이 다른 서버 파드로 라우팅될 수 있습니다.

### 프라이빗 링크에서는 레플리카 인식 라우팅이 기본적으로 지원되지 않습니다 \{#replica-aware-routing-does-not-work-out-of-the-box-with-private-link\}

사용자는 새로운 호스트 이름 패턴에 대한 이름 확인이 가능하도록 DNS 레코드를 수동으로 추가해야 합니다. 이 기능을 잘못 구성하거나 사용할 경우 서버 간 부하가 불균형해질 수 있습니다.

## Replica-aware 라우팅 구성 \{#configuring-replica-aware-routing\}

Replica-aware 라우팅을 활성화하려면 [지원팀](https://clickhouse.com/support/program)에 문의하십시오.