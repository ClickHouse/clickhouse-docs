---
sidebar_label: 'Spend alerts'
slug: /cloud/manage/billing/spend-alerts
title: 'Configure organization spend alerts'
description: 'Configure spend alerts to monitor ClickHouse Cloud usage against thresholds within a billing period.'
keywords: ['billing', 'spend alerts', 'usage thresholds', 'notifications', 'cost monitoring', 'organization billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import spend_alerts_actions from '@site/static/images/cloud/reference/billing/spend-alerts-actions.png';
import spend_alerts_config from '@site/static/images/cloud/reference/billing/spend-alerts-config.png';

Spend alerts notify you when your organization's usage reaches configured thresholds within a billing period, so you can avoid unexpected charges. They send notifications only; for thresholds that trigger automatic invoicing, see [Payment thresholds](/cloud/billing/payment-thresholds).

## Prerequisites {#prerequisites}

- You must have an **Organization Admin** or **Billing Admin** role to configure and view spend alerts.

## How spend alerts work {#how-spend-alerts-work}

- Alerts are based on gross usage within a billing period and reset at the start of each new cycle.
- Alerts fire every hour, based on the gross usage calculated at that time, so an alert fires after a threshold is exceeded.

:::note Spend alerts don't cap usage
Reaching 100% of your spend alert doesn't restrict or cap your usage — spending continues to accumulate beyond the 100% threshold.
:::

## Set up a spend alert {#set-up-spend-alert}

<VerticalStepper headerLevel="h3">

### Open the spend alerts dialog {#open-spend-alerts-dialog}

1. Navigate to **Organization > Billing** in the ClickHouse Cloud console.
2. Click **Actions > Add spend alerts**.

<Image img={spend_alerts_actions} alt="Billing page with the Actions menu open and Add spend alerts highlighted" size="lg"/>

### Configure and save the alert {#configure-and-save}

1. Enter a spend alert amount in dollars or credits per billing period.
2. Select your notification channels: **Email**, **UI**, and/or **Slack**.
3. Click **Save**.

<Image img={spend_alerts_config} alt="Organization spend alerts dialog with spend limit, automatic threshold alerts, and notification channels" size="md"/>

</VerticalStepper>

## Automatic threshold alerts {#threshold-alerts}

Four alerts are automatically created and triggered based on your configured spend alert amount:

| Threshold | Trigger                          | Example ($10 alert) |
|-----------|----------------------------------|---------------------|
| **50%**   | Half of spend reached            | $5                  |
| **75%**   | Three-quarters of spend reached  | $8                  |
| **90%**   | Ninety percent of spend reached  | $9                  |
| **100%**  | Full spend reached               | $10                 |

## Notification channels {#notification-channels}

| Channel   | Description                                                                                |
|-----------|--------------------------------------------------------------------------------------------|
| **Email** | Sends alerts to the configured email address. Click the edit icon to change the recipient. |
| **UI**    | Displays alerts in the ClickHouse Cloud console.                                           |
| **Slack** | Sends alerts to a Slack channel. Click the edit icon to configure.                         |
