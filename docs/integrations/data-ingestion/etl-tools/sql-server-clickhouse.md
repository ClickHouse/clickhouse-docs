---
sidebar_label: 'Sql Server Clickhouse'
sidebar_position: 13
keywords: ['clickhouse', 'sql server', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/data-ingestion/etl-tools/sql-server-clickhouse
description: 'Streaming Data from SQL Server to ClickHouse for Fast Analytics'
title: 'Streaming Data from SQL Server to ClickHouse for Fast Analytics'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import image1 from '@site/static/images/integrations/data-ingestion/etl-tools/image1.png';
import image2 from '@site/static/images/integrations/data-ingestion/etl-tools/image2.png';
import image3 from '@site/static/images/integrations/data-ingestion/etl-tools/image3.png';

# Streaming Data from SQL Server to ClickHouse for Fast Analytics: Step-by-Step Guide

In this article, we are breaking down a tutorial that shows you how to stream data from SQL Server to ClickHouse. ClickHouse is ideal if you want super fast analytics for reporting internal or customer-facing dashboards. We’ll walk step-by-step through getting both databases set up, how to connect them, and finally, how to use [Streamkap](https://streamkap.com) to stream your data. If SQL Server handles your day-to-day operations but you need the speed and smarts of ClickHouse for analytics, you’re in the right spot.

## Why Stream Data from SQL Server to ClickHouse? {#why-stream-data-from-sql-server-to-clickhouse}

If you’re here, you probably feel the pain: SQL Server is rock-solid for transactions, but simply isn’t designed to run heavy, real-time analytical queries.

That’s where ClickHouse shines. ClickHouse is built for analytics with super-fast aggregation and reporting, even on huge datasets. So, setting up a streaming CDC pipeline to push your transactional data into ClickHouse means you can run blazing-fast reports—perfect for operations, product teams, or customer dashboards.

Typical Use Cases:

- Internal reporting that doesn’t slow down production apps
- Customer-facing dashboards that need to be speedy and always up-to-date
- Event streaming, like keeping user activity logs fresh for analytics

## What You’ll Need to Get Started {#what-youll-need-to-get-started}

Before we get into the weeds, here’s what you should have ready:

### Prerequisites {#prerequisites}

- A running SQL Server instance  

- For this tutorial, we’re using AWS RDS for SQL Server, but any modern SQL Server instance works.[Setup AWS SQL Server from Scratch.](https://streamkap.com/blog/how-to-stream-data-from-rds-sql-server-to-clickhouse-cloud-using-streamkap%23setting-up-a-new-rds-sql-server-from-scratch)
- A ClickHouse instance  

- Self-hosted or cloud.[Setup ClickHouse from Scratch.](https://streamkap.com/blog/how-to-stream-data-from-rds-sql-server-to-clickhouse-cloud-using-streamkap%23creating-a-new-clickhouse-account)
- Streamkap  

- This tool will be the backbone of your data streaming pipeline.

### Connection Info {#connection-info}

Make sure you have:

- SQL Server server address, port, username, and password. It's recommended to create a separate user and role for Streamkap to access your SQL Server database.[Check out our docs for the configuration.](https://www.google.com/url?q=https://docs.streamkap.com/docs/sql-server&sa=D&source=editors&ust=1760992472358213&usg=AOvVaw3jfocCF1VSijgsq1OCpZPj)
- ClickHouse server address, port, username, and password. IP access lists in ClickHouse determine what services can connect to your ClickHouse database.[Follow the instructions here.](https://www.google.com/url?q=https://docs.streamkap.com/docs/clickhouse&sa=D&source=editors&ust=1760992472359060&usg=AOvVaw3H1XqqwvqAso_TQPNBKEhD)
- The table(s) you want to stream—start with one for now

## Setting Up SQL Server as a Source {#setting-up-sql-server-as-a-source}

Let’s get into it!

### Step 1: Creating a SQL Server Source in Streamkap {#step-1-creating-a-sql-server-source-in-streamkap}

We’ll start by setting up the source connection. This is how Streamkap knows where to fetch changes from.

Here’s how you do it:

1. Open Streamkap and go to the sources section.
2. Create a new source.
- Give it a recognizable name (e.g., sqlserver-demo-source).
3. Fill in your SQL Server connection details:
- Host (e.g., your-db-instance.rds.amazonaws.com)
- Port (default for SQL Server is 3306)
- Username and Password
- Database name

<Image img={image3} size="lg" />

#### What’s Happening Behind the Scenes {#whats-happening-behind-the-scenes}

<Image img={image1} size="lg" />

When you set this up, Streamkap will connect to your SQL Server and detect tables. For this demo, we’ll pick a table with some data already streaming in, like events or transactions.

## Creating a ClickHouse Destination {#creating-a-clickhouse-destination}

Now let’s wire up the destination where we’ll send all this data.

### Step 2: Add a ClickHouse Destination in Streamkap {#step-2-add-a-clickhouse-destination-in-streamkap}

Similar to the source, we’ll create a destination using our ClickHouse connection details.

#### Steps: {#steps}

1. Go to the destinations section in Streamkap.
2. Add a new destination—choose ClickHouse as the destination type.
3. Enter your ClickHouse info:
- Host
- Port (default is 9000)
- Username and Password
- Database name

Example screenshot: Adding a new ClickHouse destination in the Streamkap dashboard.

### Upsert Mode: What Is That? {#upsert-mode-what-is-that}

This is an important step: we want to use ClickHouse’s “upsert” mode—which (under the hood) uses the ReplacingMergeTree engine in ClickHouse. This lets us merge incoming records efficiently and handle updates after ingest, using what ClickHouse calls “part merging.”

- This makes sure your destination table doesn’t fill up with duplicates when things change on the SQL Server side.

### Handling Schema Evolution {#handling-schema-evolution}

ClickHouse and SQL Server sometimes don’t have the same columns—especially when your app is live and devs keep adding columns on the fly.

- Good news: Streamkap can handle basic schema evolution. That means if you add a new column on SQL Server, it’ll show up on the ClickHouse side too.

Just select “schema evolution” in your destination settings. You can always tweak this later as needed.

## Building the Streaming Pipeline {#building-the-streaming-pipeline}

With the source and destination set, it’s time for the fun part—streaming your data!

### Step 3: Set up the Pipeline in Streamkap {#step-3-set-up-the-pipeline-in-streamkap}

#### Pipeline Setup {#pipeline-setup}

1. Go to the Pipelines tab in Streamkap.  

2. Create a new pipeline.  

3. Select your SQL Server source (sqlserver-demo-source).  

4. Select your ClickHouse destination (clickhouse-tutorial-destination).  

5. Choose the table you want to stream—let’s say it’s events.  

6. Configure for Change Data Capture (CDC).  

- For this run, we’ll stream new data (feel free to skip backfilling at first and focus on CDC events).

Screenshot of pipeline settings—picking source, destination, and table.

#### Should You Backfill? {#should-you-backfill}

<Image img={image2} size="lg" />

You might ask: Should I backfill old data?

For a lot of analytics cases, you might just want to start with streaming changes from now on, but you can always go back and load older data too.

Just pick “don’t backfill” for now unless you have a specific need.

## Streaming in Action: What to Expect  {#streaming-in-action-what-to-expect}

Now your pipeline is set up and active!

### Step 4: Watch the Data Stream {#step-4-watch-the-data-stream}

Here’s what happens:

- As new data hits the source table on SQL Server, the Streamkap pipeline captures the change and sends it to ClickHouse.
- ClickHouse (thanks to ReplacingMergeTree and part merging) ingests these rows and merges updates.
- Schema keeps up—add columns in SQL Server and they’ll show in ClickHouse too.

Live dashboard or logs showing row counts growing in ClickHouse and SQL Server in real-time.

You can literally see rows in ClickHouse ramping up as SQL Server gets data.

```sql
-- Example: Checking rows in ClickHouse 
SELECT COUNT(*) FROM analytics.events; |
```

Expect some lag in heavy-load scenarios, but most use cases see near-real-time streaming.

## Under the Hood: What’s Streamkap Actually Doing? {#under-the-hood-whats-streamkap-actually-doing}

To give you a little insight:

- Streamkap watches SQL Server’s binary log (the same log used for replication).
- As soon as a row is inserted, updated, or deleted in your table, Streamkap catches the event.
- It turns the event into something ClickHouse understands and ships it over—applying changes instantly in your analytics DB.

This isn’t just ETL—it’s full change data capture (CDC), streamed in real time.

## Advanced Options {#advanced-options}

### Upsert vs. Insert Modes {#upsert-vs-insert-modes}

What is the difference between just inserting every row (Insert Mode) and making sure updates and deletes are mirrored too (Upsert Mode)?

- Insert Mode: Every new row is added—even if it’s an update, you get duplicates.
- Upsert Mode: Updates to existing rows overwrite what’s there—way better for keeping analytics fresh and clean.

### Handling Schema Changes {#handling-schema-changes}

Apps change, and so do your schemas. With this pipeline:

- Add a new column to your operational table?  
 Streamkap will pick it up and add it on the ClickHouse side too.
- Remove a column?  
 Depending on settings, you might need a migration—but most adds are smooth.

## Real-World Monitoring: Keeping Tabs on the Pipeline {#real-world-monitoring-keeping-tabs-on-the-pipeline}

### Checking Pipeline Health {#checking-pipeline-health}

Streamkap provides a dashboard where you can:

- See pipeline lag (how fresh is your data?)
- Monitor row counts and throughput
- Get alerted if anything is off

Dashboard example: Latency graph, row counts, health indicators.

### Common Metrics to Watch {#common-metrics-to-watch}

- Lag: How far is ClickHouse behind SQL Server?
- Throughput: Rows per second
- Error Rate: Should be near zero

## Going Live: Querying ClickHouse {#going-live-querying-clickhouse}

With your data now in ClickHouse, you can query it using all those fast analytics tools. Here’s a basic example:

```sql
-- See top 10 active users in the last hour
SELECT user\_id, COUNT(*) AS actionsFROM analytics.eventsWHERE event\_time >= now() - INTERVAL 1 HOURGROUP BY user\_idORDER BY actions DESCLIMIT 10;
```

Combine ClickHouse with dashboards tools like Grafana, Superset, or Redash for full-featured reporting.

## Next Steps and Deep Dives {#next-steps-and-deep-dives}

This walkthrough just scratches the surface of what you can do. With the basics down, here’s what you can explore next:

- Setting up filtered streams (only sync some tables/columns)
- Streaming multiple sources into one analytical DB
- Combining this with S3/data lakes for cold storage
- Automating schema migrations when you change tables
- Securing your pipeline with SSL and firewall rules

Keep an eye on the[Streamkap blog](https://streamkap.com/blog) for more in-depth guides.

## FAQ and Troubleshooting {#faq-and-troubleshooting}

Q: Does this work with cloud databases?  
A: Yes! We used AWS RDS in this example. Just make sure you open the right ports.

Q: What about performance?  
A: ClickHouse is fast. The bottleneck is usually the network or the source DB’s binlog speed, but for most cases, you’ll see less than a second lag.

Q: Can you handle deletes, too?  
A: Absolutely. In upsert mode, deletes get flagged and handled in ClickHouse as well.

## Wrapping up {#wrapping-up}

There you have it—a full overview of streaming your SQL Server data into ClickHouse using Streamkap. It’s fast, flexible, and perfect for teams who need up-to-the-minute analytics without crushing their production databases.

Ready to try it?  
Head to the [Sign up page](https://app.streamkap.com/account/sign-up) and let us know if you want us to cover topics like:

- Upsert vs. Insert and the nitty-gritty of both
- End-to-end latency: how fast can you get your final analytic view?
- Performance tuning and throughput
- Real-world dashboards on top of this stack

Thanks for reading! Happy streaming.
