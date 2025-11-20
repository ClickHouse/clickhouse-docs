---
'sidebar_label': '업그레이드'
'slug': '/manage/updates'
'title': '업그레이드'
'description': 'ClickHouse Cloud를 사용하면 패치 및 업그레이드에 대해 걱정할 필요가 없습니다. 우리는 정기적으로 수정 사항,
  새로운 기능 및 성능 개선을 포함한 업그레이드를 배포합니다.'
'doc_type': 'guide'
'keywords':
- 'upgrades'
- 'version management'
- 'cloud features'
- 'maintenance'
- 'updates'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 업그레이드

ClickHouse Cloud를 사용하면 패치 및 업그레이드에 대해 걱정할 필요가 없습니다. 우리는 정기적으로 수정 사항, 새로운 기능 및 성능 개선 사항을 포함하는 업그레이드를 롤아웃합니다. ClickHouse의 새로운 내용에 대한 전체 목록은 [Cloud changelog](/whats-new/cloud)를 참조하십시오.

:::note
우리는 "make before break"(또는 MBB)라고 부르는 새로운 업그레이드 메커니즘을 도입하고 있습니다. 이 새로운 접근 방식에서는 업그레이드 작업 중에 이전의 복제본을 제거하기 전에 업데이트된 복제본을 추가합니다. 이로 인해 실행 중인 작업 부하에 전 disruptive한 더 원활한 업그레이드가 가능합니다.

이 변경의 일환으로, 역사적 시스템 테이블 데이터는 업그레이드 이벤트의 일환으로 최대 30일 동안 유지됩니다. 또한, AWS 또는 GCP의 서비스에 대해서는 2024년 12월 19일 이전의 시스템 테이블 데이터가, Azure의 서비스에 대해서는 2025년 1월 14일 이전의 시스템 테이블 데이터는 새로운 조직 계층으로의 마이그레이션의 일환으로 유지되지 않습니다.
:::

## 버전 호환성 {#version-compatibility}

서비스를 생성할 때 [`compatibility`](/operations/settings/settings#compatibility) 설정은 서비스가 처음 프로비저닝될 때 ClickHouse Cloud에서 제공하는 최신 ClickHouse 버전으로 설정됩니다.

`compatibility` 설정은 이전 버전의 설정에서 기본값을 사용할 수 있게 해줍니다. 서비스가 새로운 버전으로 업그레이드되면 `compatibility` 설정을 위한 버전은 변경되지 않습니다. 이는 서비스 최초 생성 시 존재했던 설정의 기본값이 변경되지 않음을 의미합니다(기본값을 이미 덮어쓴 경우에는 업그레이드 후에도 유지됩니다).

서비스에 대한 서비스 수준 기본 `compatibility` 설정을 관리할 수 없습니다. 서비스의 기본 `compatibility` 설정에 설정된 버전을 변경하려면 [지원팀에 문의](https://clickhouse.com/support/program)해야 합니다. 그러나 사용자, 역할, 프로필, 쿼리 또는 세션 수준에서 `SET compatibility = '22.3'`와 같은 표준 ClickHouse 설정 메커니즘을 사용하여 `compatibility` 설정을 덮어쓸 수 있습니다.

## 유지보수 모드 {#maintenance-mode}

때때로 서비스 업데이트가 필요할 수 있으며, 이로 인해 확장 또는 유휴와 같은 특정 기능을 비활성화해야 할 수 있습니다. 드물게, 문제가 발생한 서비스에 대해 조치를 취하고 건강한 상태로 되돌려야 할 수도 있습니다. 그러한 유지보수 중에는 "유지보수 진행 중"이라는 배너가 서비스 페이지에 표시됩니다. 이 시간을 동안 쿼리에 대해 서비스를 여전히 사용할 수 있을 수 있습니다.

유지보수 중인 시간에 대해서는 요금이 청구되지 않습니다. _유지보수 모드_는 드문 경우이며 일반 서비스 업그레이드와 혼동해서는 안됩니다.

## 릴리스 채널 (업그레이드 일정) {#release-channels-upgrade-schedule}

사용자는 특정 릴리스 채널을 구독하여 ClickHouse Cloud 서비스의 업그레이드 일정을 지정할 수 있습니다. 세 가지 릴리스 채널이 있으며, 사용자는 **예정된 업그레이드** 기능을 사용하여 업그레이드를 위한 요일과 시간을 구성할 수 있습니다.

세 가지 릴리스 채널은 다음과 같습니다:
- [**패스트 릴리스 채널**](#fast-release-channel-early-upgrades): 업그레이드에 대한 조기 액세스 제공.
- [**정기 릴리스 채널**](#regular-release-channel): 기본값이며, 이 채널의 업그레이드는 패스트 릴리스 채널 업그레이드 후 2주 후에 시작됩니다. Scale 및 Enterprise 등급의 서비스에 릴리스 채널이 설정되지 않은 경우 기본적으로 정기 릴리스 채널에 속합니다.
- [**슬로우 릴리스 채널**](#slow-release-channel-deferred-upgrades): 연기된 릴리스를 위한 것입니다. 이 채널의 업그레이드는 정기 릴리스 채널 업그레이드 후 2주 후에 발생합니다.

:::note
기본 등급 서비스는 자동으로 패스트 릴리스 채널에 등록됩니다.
:::

### 패스트 릴리스 채널 (조기 업그레이드) {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="The fast release channel"/>

정기적인 업그레이드 일정 외에도, 서비스가 정기 릴리스 일정보다 먼저 업데이트를 받기를 원하는 경우 **패스트 릴리스** 채널을 제공합니다.

구체적으로, 서비스는:

- 최신 ClickHouse 릴리스를 수신합니다.
- 새로운 릴리스가 테스트됨에 따라 더 빈번한 업그레이드를 진행합니다.

서비스의 릴리스 일정을 Cloud 콘솔에서 아래와 같이 수정할 수 있습니다:

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="Select Plan" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="Select Plan" border/>
</div>
<br/>

이 **패스트 릴리스** 채널은 비핵심 환경에서 새로운 기능을 테스트하는 데 적합합니다. **엄격한 가동 시간 및 신뢰성 요구사항이 있는 생산 작업 부하에는 권장되지 않습니다.**

### 정기 릴리스 채널 {#regular-release-channel}

릴리스 채널이나 업그레이드 일정이 구성되지 않은 모든 Scale 및 Enterprise 등급 서비스는 정기 채널 릴리스의 일부로 업그레이드가 수행됩니다. 이는 생산 환경에서 권장됩니다.

정기 릴리스 채널로의 업그레이드는 일반적으로 **패스트 릴리스 채널** 이후 2주 후에 수행됩니다.

:::note
기본 등급 서비스는 패스트 릴리스 채널 직후 업그레이드됩니다.
:::

### 슬로우 릴리스 채널 (연기된 업그레이드) {#slow-release-channel-deferred-upgrades}

<EnterprisePlanFeatureBadge feature="The slow release channel"/>

서비스가 정기 릴리스 일정 후에 업그레이드를 받을 수 있도록 **슬로우 릴리스** 채널을 제공합니다.

구체적으로, 서비스는:

- 패스트 및 정기 릴리스 채널 롤아웃이 완료된 후 업그레이드됩니다.
- 정기 릴리스 후 약 2주 후에 ClickHouse 릴리스를 수신합니다.
- 고객이 생산 업그레이드 전에 비생산 환경에서 ClickHouse 릴리스를 테스트할 추가 시간을 원할 경우를 위한 것입니다. 비생산 환경은 테스트 및 검증을 위해 패스트 또는 정기 릴리스 채널에서 업그레이드를 받을 수 있습니다.

:::note
릴리스 채널은 언제든지 변경할 수 있습니다. 그러나 특정 경우에는 변경이 향후 릴리스에만 적용됩니다. 
- 더 빠른 채널로 이동하면 즉시 서비스 업그레이드가 이루어집니다. 즉, 슬로우에서 정기로, 정기에서 패스트로 이동하는 경우
- 더 느린 채널로 이동하면 서비스가 다운그레이드되지 않으며, 해당 채널에서 더 새로운 버전이 제공될 때까지 현재 버전으로 유지됩니다. 즉, 정기에서 슬로우로, 패스트에서 정기 또는 슬로우로 이동하는 경우
:::

## 예정된 업그레이드 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="Scheduled upgrades" linking_verb_are="true"/>

사용자는 Enterprise 등급 서비스의 업그레이드 창을 구성할 수 있습니다.

업그레이드를 예정하려는 서비스를 선택한 후 왼쪽 메뉴에서 `설정`을 클릭합니다. `예정된 업그레이드`로 스크롤하십시오.

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="Scheduled upgrades" border/>
</div>
<br/>

이 옵션을 선택하면 사용자는 데이터베이스 및 클라우드 업그레이드를 위한 요일/시간대를 선택할 수 있습니다.

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="Scheduled upgrade window" border/>
</div>
<br/>
:::note
예정된 업그레이드는 정의된 일정에 따르지만, 중요한 보안 패치 및 취약성 수정에 대한 예외가 적용됩니다. 긴급 보안 문제가 식별된 경우, 예정된 시간 외에 업그레이드가 수행될 수 있습니다. 고객은 필요한 경우 이러한 예외를 통보받게 됩니다.
:::
