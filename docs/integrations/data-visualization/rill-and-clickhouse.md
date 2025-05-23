---
title: 'Connect your ClickHouse Database and Create an Exploratary Dashboard.'
sidebar_label: 'Rill Data'
slug: /integrations/rill
description: 'Rill Data and Clickhouse integration, building fast dashboards on top of ClickHouse'
keywords: ['clickhouse', 'Rill', 'connect', 'visualization', 'dashboard']

---
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import rill_01 from '@site/static/images/integrations/data-visualization/rill/rill_06.gif.png';
import rill_02 from '@site/static/images/integrations/data-visualization/rill/rill_02.png';
import rill_03 from '@site/static/images/integrations/data-visualization/rill/rill_03.png';
import rill_04 from '@site/static/images/integrations/data-visualization/rill/rill_04.png';
import rill_05 from '@site/static/images/integrations/data-visualization/rill/rill_05.png';
import rill_06 from '@site/static/images/integrations/data-visualization/rill/rill_06.gif.png';


<CommunityMaintainedBadge/>

In this guide, you will install Rill locally and build an exploratory dashboard. 
<Image size="md" img={rill_01} alt="Rocket BI dashboard showing sales metrics with charts and KPIs" border />
<br/>

## Install Rill {#install-rill}

You can install `rill` using our installation script on both macOS and Linux:

```bash
curl https://rill.sh | sh
```



Once installed, you can start Rill by running the following in the CLI, this will automatically open your browser to `localhost:9009`. 

```bash
rill start
```

## Connect to your ClickHouse Instance {#connect-to-clickhouse}

After starting an empty project, select `+Add`, `Data` and select the ClickHouse Icon. Depending on where your ClickHouse database lives, select the following the dropdown: 

### ClickHouse Cloud {#connect-to-clickhouse-cloud}

You'll need to [grab your credential from ClickHouse Cloud](/docs/cloud/get-started/cloud-quick-start#connect-with-your-app) and use this information to connect to Rill! 

<br/>
<Image img={rill_02} alt="Connecting to ClickHouse Cloud"  size="md" border background="" />
<br/>
:::note Requirements from ClickHouse Cloud
In order to connect to ClickHouse Cloud, you'll need to check the SSL checkbox. 
:::

### Self hosted ClickHouse  {#connect-to-clickhouse-self}

We can also conenct to your self-hosted ClickHouse instance. Fill in the parameters as seen below and click `Connect` to access your ClickHouse database.
<br/>
<Image img={rill_02} alt="Connecting to ClickHouse Cloud"  size="md" border background="" />
<br/>

### Locally running ClickHouse Server {#connect-to-clickhouse-local}
If you're running ClickHouse locally on your machine and want to connect Rill to this, you can fill out the same form using `localhost`. If you haven't made any changes to the defaults, the user should be `default` with no password. 

<br/>
<Image img={rill_02} alt="Connecting to ClickHouse Cloud"  size="md" border background="" />
<br/>

If you've got any further questions, please refer to our documentation, [here](https://docs.rilldata.com/reference/olap-engines/clickhouse). (Note: you are leaving ClickHouse Docs!)

## Create a Metrics View and Explore Dashboard {#create-explore-dashboard}
Once you've successfully connected ClickHouse and Rill, you'll see all of the tables listed under your ClickHouse connector in the UI. You can browse the tables and create a metrics view/dashboard.

<br/>
<Image img={rill_05} alt="Connecting to ClickHouse Cloud"  size="md" border background="" />
<br/>

### Via AI {#create-explore-dashboard-AI}

Select the "..." from a table that you are intested and select `Generate Explore Dashboard with AI`. This will generate a `metrics/your_table_metrics.yaml`, and `dashboards/your_table_metrics_explore.yaml`. The dashboard created is our explore dashboard, which is our fast exploratory, slice-and-dice dashboard that Rill is known for. Just with a few clicks, you may find some insights into your data that you never though of before!

<br/>
<Image img={rill_06} alt="Connecting to ClickHouse Cloud"  size="md" border background="" />
<br/>