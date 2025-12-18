---
slug: /use-cases/observability/clickstack/alerts
title: 'Search with ClickStack'
sidebar_label: 'Alerts'
pagination_prev: null
pagination_next: null
description: 'Alerts with ClickStack'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'alerts', 'search-alerts', 'notifications', 'thresholds', 'slack', 'email', 'pagerduty', 'error-monitoring', 'performance-monitoring', 'user-events']
---

import Image from '@theme/IdealImage';
import search_alert from '@site/static/images/use-cases/observability/search_alert.png';
import edit_chart_alert from '@site/static/images/use-cases/observability/edit_chart_alert.png';
import add_chart_alert from '@site/static/images/use-cases/observability/add_chart_alert.png';
import create_chart_alert from '@site/static/images/use-cases/observability/create_chart_alert.png';
import alerts_search_view from '@site/static/images/use-cases/observability/alerts_search_view.png';
import add_new_webhook from '@site/static/images/use-cases/observability/add_new_webhook.png';
import add_webhook_dialog from '@site/static/images/use-cases/observability/add_webhook_dialog.png';
import manage_alerts from '@site/static/images/use-cases/observability/manage_alerts.png';
import alerts_view from '@site/static/images/use-cases/observability/alerts_view.png';
import multiple_search_alerts from '@site/static/images/use-cases/observability/multiple_search_alerts.png';
import remove_chart_alert from '@site/static/images/use-cases/observability/remove_chart_alert.png';

## Alerting in ClickStack {#alerting-in-clickstack}

ClickStack includes built-in support for alerting, enabling teams to detect and respond to issues in real time across logs, metrics, and traces.

Alerts can be created directly in the HyperDX interface and integrate with popular notification systems like Slack and PagerDuty.

Alerting works seamlessly across your ClickStack data, helping you track system health, catch performance regressions, and monitor key business events.

## Types of alerts {#types-of-alerts}

ClickStack supports two complementary ways to create alerts: **Search alerts** and **Dashboard chart alerts**. Once the alert is created, it is attached to either the search or the chart.

### 1. Search alerts {#search-alerts}

Search alerts allow you to trigger notifications based on the results of a saved search. They help you detect when specific events or patterns occur more (or less) frequently than expected.

An alert is triggered when the count of matching results within a defined time window either exceeds or falls below a specified threshold.

To create a search alert:

<VerticalStepper headerLevel="h4">

For an alert to be created for a search, the search must be saved. You can either create the alert for an existing saved search or save the search during the alert creation process. In the example below, we assume the search is not saved.

#### Open alert creation dialog {#open-dialog}

Start by entering a [search](/use-cases/observability/clickstack/search) and clicking the `Alerts` button in the top-right corner of the `Search` page.

<Image img={alerts_search_view} alt="Alerts search view" size="lg"/>

#### Create the alert {#create-the-alert}

From the alert creation panel, you can:

- Assign a name to the saved search associated with the alert.
- Set a threshold and specify how many times it must be reached within a given period. Thresholds can also be used as upper or lower bounds. The period here will also dictate how often the alert is triggered.
- Specify a `grouped by` value. This allows the search to be subject to an aggregation, e.g., `ServiceName`, thus allowing multiple alerts to be triggered off the same search.
- Choose a webhook destination for notifications. You can add a new webhook directly from this view. See [Adding a webhook](#add-webhook) for details.

Before saving, ClickStack visualizes the threshold condition so you can confirm it will behave as expected.

<Image img={search_alert} alt="Search alerts" size="lg"/>

</VerticalStepper>

Note that multiple alerts can be added to a search. If the above process is repeated, you will see the current alerts as tabs at the top of the edit alert dialog, with each alert assigned a number.

<Image img={multiple_search_alerts} alt="Multiple alerts" size="md"/>

### 2. Dashboard chart alerts {#dashboard-alerts}

Dashboard alerts extend alerting to charts.

You can create a chart-based alert directly from a saved dashboard, powered by full SQL aggregations and ClickHouse functions for advanced calculations.

When a metric crosses a defined threshold, an alert triggers automatically, allowing you to monitor KPIs, latencies, or other key metrics over time.

:::note
For an alert to be created for a visualization on a dashboard, the dashboard must be saved.
:::

To add a dashboard alert:

<VerticalStepper headerLevel="h4">

Alerts can be created during the chart creation process, when adding a chart to a dashboard, or added to existing charts. In the example below, we assume the chart already exists on the dashboard.

#### Open the chart edit dialog {#open-chart-dialog}

Open the chart's configuration menu and select the alert button. This will show the chart edit dialog.

<Image img={edit_chart_alert} alt="Edit chart alert" size="lg"/>

#### Add the alert {#add-chart-alert}

Select **Add Alert**.

<Image img={add_chart_alert} alt="Add alert to chart" size="lg"/>

#### Define the alert conditions {#define-alert-conditions}

Define the condition (`>=`, `<`), threshold, duration, and webhook. The duration here will also dictate how often the alert is triggered.

<Image img={create_chart_alert} alt="Create alert for chart" size="lg"/>

You can add a new webhook directly from this view. See [Adding a webhook](#add-webhook) for details.

</VerticalStepper>

## Adding a webhook {#add-webhook}

During alert creation, you can either use an existing webhook or create one. Once created, the webhook will be available for reuse across other alerts.

A webhook can be created for different service types, including Slack and PagerDuty, as well as generic targets.

For example, consider the alert creation for a chart below. Before specifying the webhook, the user can select `Add New Webhook`.

<Image img={add_new_webhook} alt="Add new webhook" size="lg"/>

This opens the webhook creation dialog, where you can create a new webhook:

<Image img={add_webhook_dialog} alt="Webhook creation" size="md"/>

A webhook name is required, while descriptions are optional. Other settings that must be completed depend on the service type.

Note that different service types are available between ClickStack Open Source and ClickStack Cloud. See [Service type integrations](#integrations).

### Service type integrations {#integrations}

ClickStack alerts integrate out of the box with the following service types:

- **Slack**: send notifications directly to a channel via either a webhook or API.
- **PagerDuty**: route incidents for on-call teams via the PagerDuty API.
- **Webhook**: connect alerts to any custom system or workflow via a generic webhook.

:::note ClickHouse Cloud only integrations
The Slack API and PagerDuty integrations are only supported in ClickHouse Cloud.
:::

Depending on the service type, you will need to provide different details. Specifically:

**Slack (Webhook URL)**

- Webhook URL. For example: `https://hooks.slack.com/services/<unique_path>`. See the [Slack documentation](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) for further details.

**Slack (API)**

- Slack bot token. See the [Slack documentation](https://docs.slack.dev/authentication/tokens/#bot/) for further details.

**PagerDuty API**

- PagerDuty integration key. See the [PagerDuty documentation](https://support.pagerduty.com/main/docs/api-access-keys) for further details.

**Generic**

- Webhook URL
- Webhook headers (optional)
- Webhook body (optional). The body currently supports the template variables `{{title}}`, `{{body}}`, and `{{link}}`.

## Managing alerts {#managing-alerts}

Alerts can be centrally managed through the alerts panel on the left-hand side of HyperDX.

<Image img={manage_alerts} alt="Manage alerts" size="lg"/>

From this view, you can see all alerts that have been created and are currently running in ClickStack.

<Image img={alerts_view} alt="Alerts view" size="lg"/>

This view also displays the alert evaluation history. Alerts are evaluated on a recurring time interval (defined by the period/duration set during alert creation). During each evaluation, HyperDX queries your data to check whether the alert condition is met:

- **Red bar**: The threshold condition was met during this evaluation and the alert fired (notification sent)
- **Green bar**: The alert was evaluated but the threshold condition was not met (no notification sent)

Each evaluation is independent - the alert checks the data for that time window and fires only if the condition is true at that moment.

In the example above, the first alert has fired on every evaluation, indicating a persistent issue. The second alert shows a resolved issue - it fired twice initially (red bars), then on subsequent evaluations the threshold condition was no longer met (green bars).

Clicking an alert takes you to the chart or search the alert is attached to.

### Deleting an alert {#deleting-alerts}

To remove an alert, open the edit dialog for the associated search or chart, then select **Remove Alert**.
In the example below, the `Remove Alert` button will remove the alert from the chart.

<Image img={remove_chart_alert} alt="Remove chart alert" size="lg"/>

## Common alert scenarios {#common-alert-scenarios}

Here are a few common alert scenarios you can use HyperDX for:

**Errors:** We recommend setting up alerts for the default
`All Error Events` and `HTTP Status >= 400` saved searches to be notified when
excess errors occur.

**Slow Operations:** You can set up a search for slow operations (e.g.,
`duration:>5000`) and then alert when there are too many slow operations
occurring.

**User Events:** You can also set up alerts for customer-facing teams to be
notified when new users sign up or a critical user action is performed.
