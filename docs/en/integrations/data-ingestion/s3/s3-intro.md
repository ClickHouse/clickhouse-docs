---
sidebar_label: Introduction
sidebar_position: 1
slug: /en/integrations/s3/s3-intro
description: Users can insert S3 based data into ClickHouse and use S3 as an export destination
---


# Connnecting S3

:::note
S3 table functions are supported in ClickHouse Cloud. The rest of the S3 options are applicable to self-managed ClickHouse deployments.
:::

Amazon S3 or Amazon Simple Storage Service is a service offered by Amazon Web Services (AWS) that provides object storage through a web service interface. Users can insert S3 based data into ClickHouse and use S3 as an export destination, thus allowing interaction with “Data Lake” architectures. Furthermore, s3 can provide “cold” storage tiers and assist with separating storage and compute. In the following articles, we outline the approach for these use cases: identifying key configuration parameters and any current limitations and providing hints on optimizing performance.

We utilize a subset of the New York taxi public dataset for read-orientated examples. We assume you have s3 buckets available for insert examples into which data can be written.
