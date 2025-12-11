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
| **Regular** | Default release channel for all multi replica services.<br/>Updates on this channel typically happen two weeks post the Fast release channel. | Default/ fleetwide upgrades.<br/>Upgrades on this channel are usually done two weeks post the Fast release channel upgrade | Scale and Enterprise |
| **Slow (Deferred)** | Recommended for those more risk averse users that want their services to be upgraded towards the end of the release schedule.<br/>Updates on this channel typically happen two weeks post the Regular release channel. | Maximum stability and predictability.<br/>Meant for users that need more testing of new releases on either the Fast/Regular channel | Enterprise |

<br/>
<br/>

:::note
All single replica services are automatically enrolled in the Fast release channel.
:::

</details>

Scheduled upgrades are available for all release channels for services in the Enterprise tier. This feature allows users to configure a time window on a given day of the week for upgrades.

## Release schedule {#release-schedule}

The release dates given below are an estimate and may be subject to change.

<ReleaseSchedule releases={[
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.10',
    version: '25.10',
    fast_date: '2025-12-11',
    regular_date: '2026-01-05',
    slow_date: 'TBD',
    fast_progress: 'orange',
    regular_progress: 'green',
    slow_progress: 'green',
    fast_delay_note: 'Delayed to resolve issues found in internal testing.',
  }
]} />
