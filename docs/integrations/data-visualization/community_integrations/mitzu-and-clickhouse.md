---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu is a no-code warehouse-native product analytics application.'
title: 'Connecting Mitzu to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import mitzu_01 from '@site/static/images/integrations/data-visualization/mitzu_01.png';
import mitzu_02 from '@site/static/images/integrations/data-visualization/mitzu_02.png';
import mitzu_03 from '@site/static/images/integrations/data-visualization/mitzu_03.png';
import mitzu_04 from '@site/static/images/integrations/data-visualization/mitzu_04.png';
import mitzu_05 from '@site/static/images/integrations/data-visualization/mitzu_05.png';
import mitzu_06 from '@site/static/images/integrations/data-visualization/mitzu_06.png';
import mitzu_07 from '@site/static/images/integrations/data-visualization/mitzu_07.png';
import mitzu_08 from '@site/static/images/integrations/data-visualization/mitzu_08.png';
import mitzu_09 from '@site/static/images/integrations/data-visualization/mitzu_09.png';
import mitzu_10 from '@site/static/images/integrations/data-visualization/mitzu_10.png';
import mitzu_11 from '@site/static/images/integrations/data-visualization/mitzu_11.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting Mitzu to ClickHouse

<CommunityMaintainedBadge/>

Mitzu is a no-code, warehouse-native product analytics application. Similar to tools like Amplitude, Mixpanel, and PostHog, Mitzu empowers users to analyze product usage data without requiring SQL or Python expertise.

However, unlike these platforms, Mitzu does not duplicate the company's product usage data. Instead, it generates native SQL queries directly on the company's existing data warehouse or lake.

## Goal {#goal}

In this guide, we are going to cover the following:

- Warehouse-native product analytics
- How to integrate Mitzu to ClickHouse

:::tip Example datasets
If you do not have a data set to use for Mitzu, you can work with NYC Taxi Data.
This dataset is available in ClickHouse Cloud or [can be loaded with these instructions](/getting-started/example-datasets/nyc-taxi).
:::

This guide is just a brief overview of how to use Mitzu. You can find more detailed information in the [Mitzu documentation](https://docs.mitzu.io/).

## 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Sign in or sign up to Mitzu {#2-sign-in-or-sign-up-to-mitzu}

As a first step, head to [https://app.mitzu.io](https://app.mitzu.io) to sign up.

<Image size="lg" img={mitzu_01} alt="Mitzu sign-in page with email and password fields" border />

## 3. Configure your workspace {#3-configure-your-workspace}

After creating an organization, follow the `Set up your workspace` onboarding guide in the left sidebar. Then, click on the `Connect Mitzu with your data warehouse` link.

<Image size="lg" img={mitzu_02} alt="Mitzu workspace setup page showing onboarding steps" border />

## 4. Connect Mitzu to ClickHouse {#4-connect-mitzu-to-clickhouse}

First, select ClickHouse as the connection type and set the connection details. Then, click the `Test connection & Save` button to save the settings.

<Image size="lg" img={mitzu_03} alt="Mitzu connection setup page for ClickHouse with configuration form" border />

## 5. Configure event tables {#5-configure-event-tables}

Once the connection is saved, select the `Event tables` tab and click the `Add table` button. In the modal, select your database and the tables you want to add to Mitzu.

Use the checkboxes to select at least one table and click on the `Configure table` button. This will open a modal window where you can set the key columns for each table.

<Image size="lg" img={mitzu_04} alt="Mitzu table selection interface showing database tables" border />
<br/>

> To run product analytics on your ClickHouse setup, you need to > specify a few key columns from your table.
>
> These are the following:
>
> - **User id** - the column for the unique identifier for the users.
> - **Event time** - the timestamp column of your events.
> - Optional[**Event name**] - This column segments the events if the table contains multiple event types.

<Image size="lg" img={mitzu_05} alt="Mitzu event catalog configuration showing column mapping options" border />
<br/>
Once all tables are configured, click on the `Save & update event catalog` button, and  Mitzu will find all events and their properties from the above-defined table. This step may take up to a few minutes, depending on the size of your dataset.

## 4. Run segmentation queries {#4-run-segmentation-queries}

User segmentation in Mitzu is as easy as in Amplitude, Mixpanel, or PostHog.

The Explore page has a left-hand selection area for events, while the top section allows you to configure the time horizon.

<Image size="lg" img={mitzu_06} alt="Mitzu segmentation query interface with event selection and time configuration" border />

<br/>

:::tip Filters and Breakdown
Filtering is done as you would expect: pick a property (ClickHouse column) and select the values from the dropdown that you want to filter.
You can choose any event or user property for breakdowns (see below for how to integrate user properties).
:::

## 5. Run funnel queries {#5-run-funnel-queries}

Select up to 9 steps for a funnel. Choose the time window within which your users can complete the funnel.
Get immediate conversion rate insights without writing a single line of SQL code.

<Image size="lg" img={mitzu_07} alt="Mitzu funnel analysis view showing conversion rates between steps" border />

<br/>

:::tip Visualize trends
Pick `Funnel trends` to visualize funnel trends over time.
:::

## 6. Run retention queries {#6-run-retention-queries}

Select up to 2 steps for a retention rate calculation. Choose the retention window for the recurring window for
Get immediate conversion rate insights without writing a single line of SQL code.

<Image size="lg" img={mitzu_08} alt="Mitzu retention analysis showing cohort retention rates" border />

<br/>

:::tip Cohort retention
Pick `Weekly cohort retention` to visualize how your retention rates change over time.
:::

## 7. Run journey queries {#7-run-journey-queries}
Select up to 9 steps for a funnel. Choose the time window within which your users can finish the journey. The Mitzu journey chart gives you a visual map of every path users take through the selected events.

<Image size="lg" img={mitzu_09} alt="Mitzu journey visualization showing user path flow between events" border />
<br/>

:::tip Break down steps
You can select a property for the segment `Break down` to distinguish users within the same step.
:::

<br/>

## 8. Run revenue queries {#8-run-revenue-queries}
If revenue settings are configured, Mitzu can calculate the total MRR and subscription count based on your payment events.

<Image size="lg" img={mitzu_10} alt="Mitzu revenue analysis dashboard showing MRR metrics" border />

## 9. SQL native {#9-sql-native}

Mitzu is SQL Native, which means it generates native SQL code from your chosen configuration on the Explore page.

<Image size="lg" img={mitzu_11} alt="Mitzu SQL code generation view showing native ClickHouse query" border />

<br/>

:::tip Continue your work in a BI tool
If you encounter a limitation with Mitzu UI, copy the SQL code and continue your work in a BI tool.
:::

## Mitzu support {#mitzu-support}

If you are lost, feel free to contact us at [support@mitzu.io](email://support@mitzu.io)

Or you our Slack community [here](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## Learn more {#learn-more}

Find more information about Mitzu at [mitzu.io](https://mitzu.io)

Visit our documentation page at [docs.mitzu.io](https://docs.mitzu.io)
