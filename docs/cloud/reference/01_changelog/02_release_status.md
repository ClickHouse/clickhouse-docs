---
title: 'Release status page'
sidebar_label: 'Release status'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'Page with release status for each release channel'
slug: /cloud/release-status
doc_type: 'reference'
---

ClickHouse Cloud offers different release channels to cater to different user needs regarding stability, access to new features, and upgrade predictability. Each channel has a distinct upgrade schedule and is meant to address the different usecases - for users that want instant access to new releases and those that want to defer upgrades to ensure they receive the most stable version of the release.

## Release channel details {#release-channel-details}

<details>
<summary>Learn more about release channels</summary>

| Channel Name | Description | Key Considerations | Tiers Supported |
| :--- | :--- | :--- | :--- |
| **Fast (Early Release)** | Recommended for non production environments. This is the first release channel for every database version upgrade | New feature access over stability.<br/>Ability to test releases in non production environments ahead of production upgrade | Basic (default)<br/>Scale, Enterprise tiers |
| **Regular** | Default release channel for all multi replica services.<br/>Updates on this channel typically happen two weeks post the Fast release channel. | Default/ fleetwide upgrades.<br/>Upgrades on this channel are usually done two weeks post the Fast release channel upgrade | Scale and Enterprise |
| **Slow (Deferred)** | Recommended for those more risk averse users that want their services to be upgraded towards the end of the release schedule.<br/>Updates on this channel typically happen two weeks post the Regular release channel. | Maximum stability and predictability.<br/>Meant for users that need more testing of new releases on either the Fast/Regular channel | Enterprise |

<br/>
<br/>

:::note
All single replica services are automatically enrolled in the Fast release channel.
:::

</details>

Scheduled upgrades are available for all release channels for services in the Enterprise tier. This feature allows users to configure a time window on given day of the week for upgrades.

## Release schedule {#release-schedule}

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

<ReleaseSchedule releases={[
   {
    version: '24.10',
    changelog_link: 'https://clickhouse.com/docs/en/whats-new/changelog/2024#2410',
    fast_date: '2025-10-15',
    regular_date: '2025-10-29',
    slow_date: '2025-11-12',
    fast_progress: 'red',
    fast_delay_note: 'Critical bug found in beta',
    regular_progress: 'orange',
    regular_delay_note: 'Dependent on Fast channel fix',
    slow_progress: 'green'
  },
  {
    version: '24.9',
    changelog_link: 'https://clickhouse.com/docs/en/whats-new/changelog/2024#249',
    fast_date: '2025-09-15',
    regular_date: '2025-09-29',
    slow_date: '2025-10-13',
    fast_progress: 'green',
    regular_progress: 'orange',
    regular_delay_note: 'Slight delay due to additional testing',
    slow_progress: 'green'
  },
  {
    version: '24.8',
    changelog_link: 'https://clickhouse.com/docs/en/whats-new/changelog/2024#248',
    fast_date: '2025-08-15',
    regular_date: '2025-08-29',
    slow_date: '2025-09-12',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green'
  }
]} />
