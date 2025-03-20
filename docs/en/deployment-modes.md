---
sidebar_label: Deployment modes
description: "ClickHouse offers four deployment options that all use the same powerful database engine, just packaged differently to suit your specific needs."
title: Deployment modes
---

ClickHouse is a versatile database system that can be deployed in several different ways depending on your needs. At its core, all deployment options **use the same powerful ClickHouse database engine** – what differs is how you interact with it and where it runs.

Whether you're running large-scale analytics in production, doing local data analysis, or building applications, there's a deployment option designed for your use case. The consistency of the underlying engine means you get the same high performance and SQL compatibility across all deployment modes.
This guide explores the four main ways to deploy and use ClickHouse:

* ClickHouse Server for traditional client/server deployments
* ClickHouse Cloud for fully managed database operations
* clickhouse-local for command-line data processing
* chDB for embedding ClickHouse directly in applications

Each deployment mode has its own strengths and ideal use cases, which we'll explore in detail below. 

<iframe width="560" height="315" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server

ClickHouse Server represents the traditional client/server architecture and is ideal for production deployments. This deployment mode provides the full OLAP database capabilities with high throughput and low latency queries that ClickHouse is known for.

<img src={require('./images/deployment-modes/ch-server.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>

When it comes to deployment flexibility, ClickHouse Server can be installed on your local machine for development or testing, deployed to major cloud providers like AWS, GCP, or Azure for cloud-based operations, or set up on your own on-premises hardware. For larger scale operations, it can be configured as a distributed cluster to handle increased load and provide high availability.

This deployment mode is the go-to choice for production environments where reliability, performance, and full feature access are crucial. 

## ClickHouse Cloud 

[ClickHouse Cloud](/docs/en/cloud/overview) is a fully managed version of ClickHouse that removes the operational overhead of running your own deployment. While it maintains all the core capabilities of ClickHouse Server, it enhances the experience with additional features designed to streamline development and operations.

<img src={require('./images/deployment-modes/ch-cloud.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>


A key advantage of ClickHouse Cloud is its integrated tooling. [ClickPipes](/docs/en/cloud/get-started/cloud-quick-start#clickpipes) provides a robust data ingestion framework, allowing you to easily connect and stream data from various sources without managing complex ETL pipelines. The platform also offers a dedicated [querying API](/docs/en/cloud/get-started/query-endpoints), making it significantly easier to build applications.

The SQL Console in ClickHouse Cloud includes a powerful [dashboarding](/docs/en/cloud/manage/dashboards) feature that lets you transform your queries into interactive visualizations. You can create and share dashboards built from your saved queries, with the ability to add interactive elements through query parameters. These dashboards can be made dynamic using global filters, allowing users to explore data through customizable views – though it's important to note that users will need at least read access to the underlying saved queries to view the visualizations.

For monitoring and optimization, ClickHouse Cloud includes built-in charts and [query insights](/docs/en/cloud/get-started/query-insights). These tools provide deep visibility into your cluster's performance, helping you understand query patterns, resource utilization, and potential optimization opportunities. This level of observability is particularly valuable for teams that need to maintain high-performance analytics operations without dedicating resources to infrastructure management.

The managed nature of the service means you don't need to worry about updates, backups, scaling, or security patches – these are all handled automatically. This makes it an ideal choice for organizations that want to focus on their data and applications rather than database administration.

## clickhouse-local

[clickhouse-local](/docs/en/operations/utilities/clickhouse-local) is a powerful command-line tool that provides the complete functionality of ClickHouse in a standalone executable. It's essentially the same database as ClickHouse Server, but packaged in a way that lets you harness all of ClickHouse's capabilities directly from the command line without running a server instance.

<img src={require('./images/deployment-modes/ch-local.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>

This tool excels at ad-hoc data analysis, particularly when working with local files or data stored in cloud storage services. You can directly query files in various formats (CSV, JSON, Parquet, etc.) using ClickHouse's SQL dialect, making it an excellent choice for quick data exploration or one-off analysis tasks.

Since clickhouse-local includes all of ClickHouse's functionality, you can use it for data transformations, format conversions, or any other database operations you'd normally do with ClickHouse Server. While primarily used for temporary operations, it can also persist data using the same storage engine as ClickHouse Server when needed.

The combination of remote table functions and access to the local file system makes clickhouse-local particularly useful for scenarios where you need to join data between a ClickHouse Server and files on your local machine. This is especially valuable when working with sensitive or temporary local data that you don't want to upload to a server.

## chDB

[chDB](/docs/en/chdb) is ClickHouse embedded as an in-process database engine,, with Python being the primary implementation, though it's also available for Go, Rust, NodeJS, and Bun. This deployment option brings ClickHouse's powerful OLAP capabilities directly into your application's process, eliminating the need for a separate database installation.

<img src={require('./images/deployment-modes/chdb.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>


chDB provides seamless integration with your application's ecosystem. In Python, for example, it's optimized to work efficiently with common data science tools like Pandas and Arrow, minimizing data copying overhead through Python memoryview. This makes it particularly valuable for data scientists and analysts who want to leverage ClickHouse's query performance within their existing workflows.

chDB's can also connect to databases created with clickhouse-local, providing flexibility in how you work with your data. This means you can seamlessly transition between local development, data exploration in Python, and more permanent storage solutions without changing your data access patterns.
