---
sidebar_label: Migration Options
sidebar_position: 1
slug: /en/integrations/redshift/migrate-redshift-to-clickhouse
description: Migrating Data from Redshift to ClickHouse
---

# Migrating Data from Redshift to ClickHouse

[Amazon Redshift](https://aws.amazon.com/redshift/) is a popular cloud data warehousing solution that is part of the Amazon Web Services offerings. This guide presents different approaches to migrating data from a Redshift instance to ClickHouse. We will cover three options:

<img src={require('./images/redshift-to-clickhouse.png').default} class="image" alt="Redshit to ClickHouse Migration Options"/>

From the ClickHouse instance standpoint, you can either:

1. **[PUSH](./redshift-push-to-clickhouse.md)** data to ClickHouse using a third party ETL/ELT tool or service

2. **[PULL](./redshift-pull-to-clickhouse.md)** data from Redshift leveraging the ClickHouse JDBC Bridge

3. **[PIVOT](./redshift-pivot-to-clickhouse.md)** using S3 object storage using an “Unload then load” logic

:::note
We used Redshift as a data source in this tutorial. However, the migration approaches presented here are not exclusive to Redshift, and similar steps can be derived for any compatible data source.
:::
