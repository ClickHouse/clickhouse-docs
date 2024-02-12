---
sidebar_label: Mitzu
sidebar_position: 133
slug: /en/integrations/mitzu
keywords: [clickhouse, mitzu, connect, integrate, ui]
description: Mitzu is a no-code warehouse-native product analytics application.
---

import ConnectionDetails from '@site/docs/en/\_snippets/\_gather_your_details_http.mdx';

# Connecting Mitzu to ClickHouse

Mitzu is a no-code warehouse-native product analytics application. Just like Amplitude, Mixpanel or Posthog, Mitzu enables it's users to
query the product usage data without any SQL or Python knowledge. Mitzu instead copy the company's product usage data, it generates native SQL
queries over the company's data warehouse or lake.

## Goal

In this guide we are going to cover:

- Warehouse-native product analytics
- How to integrate Mitzu to Clickhouse

:::tip Example datasets
If you do not have a data set to use for Mitzu, you can work with NYC Taxi Data.
This dataset is available in Clickhouse Cloud.
:::

## 1. Gather your connection details

<ConnectionDetails />

## 2. Sign in or sign up to Mitzu

As a first step head to [https://app.mitzu.io](https://app.mitzu.io) for sign up.

<img src={require('./images/mitzu_01.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Sign in" />

## 3. Create your workspace

After creating an organization, you will be prompted to create your first workspace.

<img src={require('./images/mitzu_02.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Create workspace" ></img>

## 4. Connect Mitzu to ClickHouse

Once your workspace is created, you need to manually set the connection details.

<img src={require('./images/mitzu_03.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}}alt="Setup connection details" ></img>

In the guided onboarding Mitzu enables to integrate with a single table.

> In order to run product analytics on your clickhouse setup, you need to > specify a few key columns from your table.
>
> These are the following:
>
> - **User id** - the column for the unique identifier for the users.
> - **Event time** - the timestamp column of your events.
> - Optional[**Event name**] - in case the table contains multiple event types, this column segments the events.

<img src={require('./images/mitzu_04.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Setup table connection"></img>

<br/>

:::tip Adding more tables
Adding more tables is possible once the initial guided setup is done.
See below.
:::

## 5. Create an event catalog

The final step of the onboarding is the `Event catalog` creation.

<img src={require('./images/mitzu_05.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Create event catalog" ></img>

This step finds all events and its properties from the above defined table.
This step may take up to a few minutes, depending on the size of your dataset.

If everything went well, you will ready to explore your events.
<img src={require('./images/mitzu_06.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Explore" width="300px"></img>

## 4. Run segmentation queries

User segmentation in Mitzu is just as easy as in Amplitude, Mixpanel or Posthog.

You can select the events on the left side of the explore page, while configuring the time horizont is on the top part.

<img src={require('./images/mitzu_07.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Segmentation" ></img>

<br/>

:::tip Filters and Breakdown
Filtering is done like you would expect, pick a property (clickhouse column) and select the values from the dropdown that you want to filter.
For breakdowns you choose any event or user property (see below how to integrate user properties).
:::

## 5. Run funnel queries

Select up to 9 steps for a funnel. Choose the time window for within the funnel can be finished by your users.
Get immediate conversion rate insights, without writing a single line of SQL code.

<img src={require('./images/mitzu_08.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Funnel" ></img>

<br/>

:::tip Visualize trends
Pick `Funnel trends` to visualize funnels trends over time.
:::

## 6. Run retention queries

Select up to 2 steps for a retention rate calculation. Choose the retention window for selecting the recurring window for
Get immediate conversion rate insights, without writing a single line of SQL code.

<img src={require('./images/mitzu_09.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Retention" ></img>

<br/>

:::tip Cohort retention
Pick `Weekly cohort retention` to visualize how your retention rates are changing over time.
:::

## 7. SQL native

Mitzu is SQL Native, this means it generates native SQL code from the configuration that you have chosen on the Explore page.

<img src={require('./images/mitzu_10.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="SQL Native" ></img>

<br/>

:::tip Continue your work in a BI tool
If you run into a limitation with Mitzu UI, simple copy the SQL code and continue your work in a BI tool.
:::

## 8. Adding more event tables

If you store your product usage events in multiple tables, you can add those as well to your event catalog.
Go to the workspace settings page (gear icon at the top of the page), select the event tables tab.

Add the remaining event tables from your Clickhouse warehouse.

<img src={require('./images/mitzu_11.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Extra tables" ></img>

<br/>

Once you added all other event tables to your workspace. You need to configure those as well.
Configure the **user id**, **event time** and optionally the **event name** columns.

<img src={require('./images/mitzu_12.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Configure tables" ></img>

Click the configure tables button and set these columns in a bulk.
You can add up to 5000 tables to Mitzu.

Last but not least don't forget to **Save and update event catalog**.

## Mitzu support

If you are lost feel free to contact us at [support@mitzu.io](email://support@mitzu.io)
Or you our Slack community [here](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## Learn more

Find more information about Mitzu by at [mitzu.io](https://mitzu.io)

Visit our documentations page at [docs.mitzu.io](https://docs.mitzu.io)
