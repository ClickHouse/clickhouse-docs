---
sidebar_label: Introduction 
sidebar_position: 1
description: Migrating data from Redshift to ClickHouse
---


# Migrating data from Redshift to ClickHouse

[Amazon Redshift](https://aws.amazon.com/redshift/) (referred as Redshift in following) is a popular cloud data warehousing solution part of the Amazon Web Services offerings. In the following we will present different approaches to migrate data from a Redshift instance to ClickHouse. The following picture summarizes the proposed approaches:

<img src={require('./images/redshift-to-clickhouse.png').default} class="image" alt="Redshit to ClickHouse Migration Options"/>


From the ClickHouse instance standpoint, we propose to either:

1. **[PUSH](./redshift-push)** data to ClickHouse: Using a third party ETL/ELT tool or service.

2. **[PULL](redshift-pull)** data from ClickHouse: Leveraging the ClickHouse JDBC Bridge.

3. **[PIVOT](redshift-pivot)** using S3 object storage: In an “Unload then load” logic.

:::note
We used Redshift as a data source in this tutorial. However, the migration approaches presented are not exclusive to Redshift and similar steps can be derived for any compatible data source.
:::