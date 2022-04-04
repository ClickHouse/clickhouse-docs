---
sidebar_label: Introduction 
sidebar_position: 1
description: Introduction to ClickHouse and s3
---


# Connnecting S3

Amazon S3 or Amazon Simple Storage Service is a service offered by Amazon Web Services (AWS) that provides object storage through a web service interface. Users can insert s3 based data into ClickHouse and use s3 as an export destination, thus allowing interaction with “Data Lake” architectures. Furthermore, s3 can provide “cold” storage tiers and assist with separating storage and compute. Below we outline the approach for these use cases: identifying key configuration parameters and any current limitations and providing hints on optimizing performance.

We utilize a subset of the new york taxi public dataset for read-orientated examples. We assume you have s3 buckets available for insert examples into which data can be written.