---
sidebar_label: '업그레이드'
slug: /manage/updates
title: '업그레이드'
description: 'ClickHouse Cloud를 사용하면 패치와 업그레이드를 신경 쓸 필요가 없습니다. 수정 사항, 신규 기능, 성능 향상이 포함된 업그레이드를 주기적으로 적용합니다.'
doc_type: 'guide'
keywords: ['업그레이드', '버전 관리', 'Cloud 기능', '유지 관리', '업데이트']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 업그레이드 \{#upgrades\}

ClickHouse Cloud를 사용하면 패치와 업그레이드를 직접 관리할 필요가 없습니다. 수정 사항, 새로운 기능, 성능 향상이 포함된 업그레이드를 정기적으로 배포합니다. ClickHouse에 어떤 새로운 기능이 추가되었는지에 대한 전체 목록은 [Cloud 변경 로그](/whats-new/cloud)를 참고하십시오.

:::note
「make before break」(또는 MBB)라고 부르는 새로운 업그레이드 메커니즘을 도입하고 있습니다. 이 새로운 방식에서는 업그레이드 작업 중 기존 레플리카를 제거하기 전에 먼저 업데이트된 레플리카를 추가합니다. 이를 통해 실행 중인 워크로드에 지장을 최소화하면서 보다 원활한 업그레이드를 수행할 수 있습니다.

이 변경의 일환으로, 업그레이드 이벤트와 관련된 과거 시스템 테이블 데이터는 최대 30일 동안 보존됩니다. 또한 AWS 또는 GCP에서 실행 중인 서비스의 경우 2024년 12월 19일 이전의 시스템 테이블 데이터, Azure에서 실행 중인 서비스의 경우 2025년 1월 14일 이전의 시스템 테이블 데이터는 새로운 조직 티어로의 마이그레이션 과정에서 보존되지 않습니다.
:::

## 버전 호환성 \{#version-compatibility\}

서비스를 생성하면, 서비스가 최초로 프로비저닝되는 시점에 ClickHouse Cloud에서 제공되는 가장 최신 ClickHouse 버전에 맞춰 [`compatibility`](/operations/settings/settings#compatibility) 설정이 지정됩니다.

`compatibility` 설정을 사용하면 이전 버전의 설정 기본값을 계속 사용할 수 있습니다. 서비스가 새 버전으로 업그레이드되어도 `compatibility` 설정에 지정된 버전은 변경되지 않습니다. 이는 서비스를 처음 생성할 때 존재하던 설정들의 기본값이 변경되지 않음을 의미합니다(이미 해당 기본값을 재정의한 경우, 업그레이드 이후에도 재정의된 값이 그대로 유지됩니다).

서비스 기본 `compatibility` 설정은 직접 관리할 수 없습니다. 서비스의 기본 `compatibility` 설정에 지정된 버전을 변경하려면 [지원팀에 문의](https://clickhouse.com/support/program)해야 합니다. 그러나 표준 ClickHouse 설정 메커니즘을 사용해 사용자, 역할, 프로필, 쿼리, 세션 수준에서 `compatibility` 설정을 재정의할 수 있습니다. 예를 들어, 세션에서 `SET compatibility = '22.3'`를 사용하거나 쿼리에서 `SETTINGS compatibility = '22.3'`를 사용할 수 있습니다.

## 유지 관리 모드 \{#maintenance-mode\}

때때로 서비스 업데이트가 필요할 수 있으며, 이 과정에서 스케일링이나 유휴 상태 전환(idling)과 같은 특정 기능을 비활성화해야 할 수도 있습니다. 드물게는 문제를 겪고 있는 서비스에 조치를 취해 정상 상태로 복구해야 하는 경우도 있습니다. 이러한 유지 관리가 진행되는 동안에는 서비스 페이지에 _「Maintenance in progress」_라는 배너가 표시됩니다. 이 시간 동안에도 쿼리용으로 서비스를 계속 사용할 수 있는 경우도 있습니다.

서비스가 유지 관리 중인 시간에 대해서는 과금되지 않습니다. _유지 관리 모드_는 매우 드문 경우이며, 정기적인 서비스 업그레이드와 혼동해서는 안 됩니다.

## 릴리스 채널(업그레이드 일정) \{#release-channels-upgrade-schedule\}

사용자는 특정 릴리스 채널을 구독하여 ClickHouse Cloud 서비스의 업그레이드 일정을 지정할 수 있습니다. 세 가지 릴리스 채널이 있으며, **예약 업그레이드** 기능을 사용하여 업그레이드가 적용될 요일과 시간을 설정할 수 있습니다.

세 가지 릴리스 채널은 다음과 같습니다:

- 업그레이드를 빠르게 미리 사용할 수 있는 [**fast release channel**](#fast-release-channel-early-upgrades)입니다.
- 기본값인 [**regular release channel**](#regular-release-channel)은 fast release channel 업그레이드 이후 2주 뒤에 업그레이드를 시작합니다. Scale 및 Enterprise 티어에서 서비스에 릴리스 채널이 설정되어 있지 않은 경우, 기본적으로 regular release channel이 사용됩니다.
- 지연된 릴리스를 위한 [**slow release channel**](#slow-release-channel-deferred-upgrades)로, 이 채널의 업그레이드는 regular release channel 업그레이드 이후 2주 뒤에 수행됩니다.

:::note
Basic 티어 서비스는 fast release channel에 자동으로 등록됩니다.
:::

### 빠른 릴리스 채널(조기 업그레이드) \{#fast-release-channel-early-upgrades\}

<ScalePlanFeatureBadge feature="The fast release channel"/>

일반 업그레이드 일정 외에도 서비스가 정기 릴리스 일정보다 더 빠르게 업데이트를 받을 수 있도록 하는 **빠른 릴리스(Fast release)** 채널을 제공합니다.

구체적으로, 서비스는 다음과 같이 동작합니다.

- 최신 ClickHouse 릴리스를 가장 먼저 수신합니다.
- 새 릴리스가 테스트되는 대로 더 자주 업그레이드됩니다.

아래와 같이 Cloud 콘솔에서 서비스의 릴리스 일정을 변경할 수 있습니다.

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="플랜 선택" border/>
</div>

<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="플랜 선택" border/>
</div>

<br/>

이 **빠른 릴리스(Fast release)** 채널은 중요도가 낮은 환경에서 신규 기능을 테스트하는 데 적합합니다. **엄격한 가용성과 안정성이 요구되는 프로덕션 워크로드에는 권장되지 않습니다.**

### 정기 릴리스 채널 \{#regular-release-channel\}

릴리스 채널이나 업그레이드 일정이 설정되어 있지 않은 모든 Scale 및 Enterprise 티어 서비스는 정기 릴리스 채널 배포의 일부로 업그레이드됩니다. 운영 환경에서는 이 방식을 권장합니다.

정기 릴리스 채널로의 업그레이드는 일반적으로 **Fast 릴리스 채널** 이후 약 2주 후에 수행됩니다.

:::note
Basic 티어 서비스는 Fast 릴리스 채널 이후 곧 업그레이드됩니다.
:::

### 느린 릴리스 채널(지연 업그레이드) \{#slow-release-channel-deferred-upgrades\}

<EnterprisePlanFeatureBadge feature="The slow release channel"/>

정기 릴리스 일정 이후에 업그레이드를 받도록 서비스를 설정하고자 하는 경우 **느린 릴리스(Slow release)** 채널을 제공합니다.

구체적으로, 서비스는 다음과 같이 동작합니다:

- 빠른(Fast) 및 일반(Regular) 릴리스 채널 롤아웃이 완료된 이후에 업그레이드됩니다.
- 정기 릴리스 이후 약 2주 뒤에 ClickHouse 릴리스를 받습니다.
- 운영 환경을 업그레이드하기 전에 비운영 환경에서 ClickHouse 릴리스를 테스트하기 위해 추가 시간이 필요한 고객을 위한 채널입니다. 비운영 환경은 테스트 및 검증을 위해 빠른(Fast) 또는 일반(Regular) 릴리스 채널 중 하나로 업그레이드를 받을 수 있습니다.

:::note
릴리스 채널은 언제든지 변경할 수 있습니다. 다만, 일부 경우에는 변경 사항이 향후 릴리스부터 적용됩니다. 

- 더 빠른 채널로 이동하면 서비스가 즉시 업그레이드됩니다. 예: Slow → Regular, Regular → Fast
- 더 느린 채널로 이동해도 서비스가 다운그레이드되지는 않으며, 해당 채널에서 더 새로운 버전이 제공될 때까지 현재 버전으로 유지됩니다. 예: Regular → Slow, Fast → Regular 또는 Slow
:::

## 예약된 업그레이드 \{#scheduled-upgrades\}

<EnterprisePlanFeatureBadge feature="Scheduled upgrades" linking_verb_are="true"/>

Enterprise 티어에 속한 서비스에 대해 업그레이드 시간대를 구성할 수 있습니다.

업그레이드를 예약하려는 서비스를 선택한 후, 왼쪽 메뉴에서 `Settings`를 선택하십시오. 아래로 스크롤하여 `Scheduled upgrades`를 찾습니다.

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="예약된 업그레이드" border/>
</div>

<br/>

이 옵션을 선택하면 데이터베이스 및 Cloud 업그레이드를 위한 요일과 시간대를 선택할 수 있습니다.

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="예약된 업그레이드 시간대" border/>
</div>

<br/>

:::note
예약된 업그레이드는 정의된 일정에 따라 진행되지만, 중요한 보안 패치 및 취약점 수정에는 예외가 적용됩니다. 긴급한 보안 문제가 발견된 경우, 예약된 시간대 외에 업그레이드가 수행될 수 있습니다. 이러한 예외가 발생하는 경우 필요에 따라 고객에게 별도로 안내됩니다.
:::