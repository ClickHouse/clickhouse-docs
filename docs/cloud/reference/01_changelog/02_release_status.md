---
title: 'Release status page'
sidebar_label: 'Release status'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'Page with release status for each release channel'
slug: /cloud/release-status
doc_type: 'reference'
---

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

ClickHouse Cloud offers different release channels to cater to different user needs regarding stability, access to new features, and upgrade predictability. Each channel has a distinct upgrade schedule and is meant to address the different usecases - for users that want instant access to new releases and those that want to defer upgrades to ensure they receive the most stable version of the release.

## Release channel details {#release-channel-details}

<details>
<summary>Learn more about release channels</summary>

| Channel Name | Description | Key Considerations | Tiers Supported |
| :--- | :--- | :--- | :--- |
| **Fast (Early Release)** | Recommended for non production environments. This is the first release channel for every database version upgrade | New feature access over stability.<br/>Ability to test releases in non production environments ahead of production upgrade | Basic (default)<br/>Scale, Enterprise tiers |
| **Regular** | Default release channel for all multi replica services.<br/>Rollout on this channel typically begins two weeks after the Fast release channel starts. | Default/ fleetwide upgrades.<br/>Services are upgraded gradually over multiple weeks | Scale and Enterprise |
| **Slow (Deferred)** | Recommended for those more risk averse users that want their services to be upgraded towards the end of the release schedule.<br/>Rollout on this channel typically begins two weeks after the Regular release channel starts. | Maximum stability and predictability.<br/>Meant for those that need more testing of new releases on either the Fast/Regular channel | Enterprise |

<br/>
<br/>

:::note
All single replica services are automatically enrolled in the Fast release channel.
:::

</details>

Scheduled upgrade windows are available for all release channels for services in the Enterprise tier. This feature allows you to configure a time window on a given day of the week for upgrades.

## Release schedule {#release-schedule}

:::important Understanding release dates
The dates shown below indicate when ClickHouse **begins the rollout** to each release channel, not when your individual service will be upgraded.

- Rollouts are automated and occur gradually over multiple weeks
- Services with configured scheduled upgrade windows are upgraded during their scheduled window in the week after the channel rollout ends
- Rollout completion may be delayed due to rollout pauses (e.g., holiday freezes) or health monitoring

For advance testing before production upgrades, use the Fast or Regular channel for non-production services and the Slow channel for production services.
:::

<ReleaseSchedule releases={[
    {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.12',
     version: '25.12',
     fast_start_date: '2026-02-10',
     fast_end_date: '2026-02-11',
     regular_start_date: '2026-03-09',
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
     slow_start_date: '2026-03-16',
     slow_end_date: 'TBD',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green',
     regular_delay_note: 'Services with scheduled upgrade windows will receive 25.10 during their scheduled window in the week after rollout completes',
   },
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.8',
    version: '25.8',
    fast_start_date: 'Completed',
    fast_end_date: 'Completed',
    regular_start_date: '2025-10-29',
    regular_end_date: '2025-12-19',
    slow_start_date: '2026-01-27',
    slow_end_date: '2026-02-04',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green',
  }
]} />
