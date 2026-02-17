---
title: '릴리스 상태 페이지'
sidebar_label: '릴리스 상태'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: '각 릴리스 채널의 상태를 보여주는 페이지'
slug: /cloud/release-status
doc_type: 'reference'
---

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

ClickHouse Cloud는 안정성, 새로운 기능에 대한 접근성, 업그레이드 시점의 예측 가능성에 관한 다양한 사용자 요구를 충족하기 위해 여러 릴리스 채널을 제공합니다. 각 채널은 서로 다른 업그레이드 일정을 가지며, 새 릴리스를 즉시 사용하려는 사용자와 업그레이드를 미뤄 가장 안정적인 릴리스 버전을 사용하려는 등 서로 다른 사용 사례를 지원하도록 설계되었습니다.


## 릴리스 채널 세부 정보 \{#release-channel-details\}

<details>
<summary>릴리스 채널에 대해 자세히 알아보기</summary>

| Channel Name | Description | Key Considerations | Tiers Supported |
| :--- | :--- | :--- | :--- |
| **Fast (Early Release)** | 프로덕션 환경이 아닌 환경에 권장됩니다. 모든 데이터베이스 버전 업그레이드에서 가장 먼저 사용되는 릴리스 채널입니다 | 안정성보다 새로운 기능 이용 가능성을 우선합니다.<br/>프로덕션 업그레이드 전에 비프로덕션 환경에서 릴리스를 미리 테스트할 수 있습니다 | Basic (기본값)<br/>Scale, Enterprise 등급 |
| **Regular** | 모든 다중 레플리카 서비스의 기본 릴리스 채널입니다.<br/>이 채널의 롤아웃은 일반적으로 Fast 릴리스 채널이 시작된 후 2주 뒤에 시작됩니다. | 기본/전체 플릿 업그레이드에 사용됩니다.<br/>서비스는 수 주에 걸쳐 점진적으로 업그레이드됩니다 | Scale 및 Enterprise |
| **Slow (Deferred)** | 릴리스 일정의 후반부에 서비스 업그레이드를 받고자 하는, 위험에 더 민감한 사용자에게 권장됩니다.<br/>이 채널의 롤아웃은 일반적으로 Regular 릴리스 채널이 시작된 후 2주 뒤에 시작됩니다. | 최대한의 안정성과 예측 가능성을 제공합니다.<br/>Fast/Regular 채널에서 새 릴리스를 더 많이 테스트해야 하는 사용자를 대상으로 합니다 | Enterprise |

<br/>
<br/>

:::note
모든 단일 레플리카 서비스는 Fast 릴리스 채널에 자동으로 등록됩니다.
:::

</details>

Enterprise 등급 서비스에는 모든 릴리스 채널에 대해 예약 업그레이드 시간대가 제공됩니다. 이 기능을 사용하여 특정 요일에 업그레이드가 수행될 시간대를 구성할 수 있습니다.

## 릴리스 일정 \{#release-schedule\}

:::important 릴리스 날짜 이해하기
아래에 표시된 날짜는 각 릴리스 채널에 대해 ClickHouse가 해당 릴리스를 **배포(rollout)하기 시작하는 시점**을 의미하며, 개별 서비스가 실제로 업그레이드되는 시점을 의미하지 않습니다.

- 배포는 자동으로 이루어지며, 여러 주에 걸쳐 점진적으로 진행됩니다.
- 예약된 업그레이드 윈도우가 설정된 서비스는 채널 배포가 종료된 이후 첫 번째 주에, 예약된 업그레이드 윈도우 동안 업그레이드됩니다.
- 휴일 기간 배포 중단(예: holiday freeze) 또는 헬스 모니터링에 따라 배포 완료가 지연될 수 있습니다.

프로덕션 업그레이드 전에 사전 테스트를 수행하려면 비프로덕션 서비스에는 Fast 또는 Regular 채널을, 프로덕션 서비스에는 Slow 채널을 사용하십시오.
:::

<ReleaseSchedule releases={[
    {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.12',
     version: '25.12',
     fast_start_date: '2026-02-10',
     fast_end_date: '2026-02-11',
     regular_start_date: 'TBD',
     regular_end_date: 'TBD',
     slow_start_date: 'TBD',
     slow_end_date: 'TBD',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green'
   },
   {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.10',
     version: '25.10',
     fast_start_date: '2025-12-11',
     fast_end_date: '2025-12-15',
     regular_start_date: '2026-01-23',
     regular_end_date: 'TBD',
     slow_start_date: 'TBD',
     slow_end_date: 'TBD',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green',
     regular_delay_note: '예약된 업그레이드 윈도우가 있는 서비스는 배포가 완료된 이후 주의 예약된 윈도우 동안 25.10 업그레이드를 받게 됩니다',
   },
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.8',
    version: '25.8',
    fast_start_date: '완료됨',
    fast_end_date: '완료됨',
    regular_start_date: '2025-10-29',
    regular_end_date: '2025-12-19',
    slow_start_date: '2026-01-27',
    slow_end_date: '2026-02-04',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green',
  }
]} />