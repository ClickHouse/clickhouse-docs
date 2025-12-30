---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about ClickPipes for Kafka'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka ClickPipes FAQ'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

## Kafka ClickPipes FAQ {#faq}

### General {#general}

<details>

<summary>How does ClickPipes for Kafka work?</summary>

ClickPipes uses a dedicated architecture running the Kafka Consumer API to read data from a specified topic and then inserts the data into a ClickHouse table on a specific ClickHouse Cloud service.
</details>

<details>

<summary>What's the difference between ClickPipes and the ClickHouse Kafka Table Engine?</summary>

The Kafka Table engine is a ClickHouse core capability that implements a "pull model" where the ClickHouse server itself connects to Kafka, pulls events then writes them locally.

ClickPipes is a separate cloud service that runs independently of the ClickHouse service. It connects to Kafka (or other data sources) and pushes events to an associated ClickHouse Cloud service. This decoupled architecture allows for superior operational flexibility, clear separation of concerns, scalable ingestion, graceful failure management, extensibility, and more.
</details>

<details>

<summary>What are the requirements for using ClickPipes for Kafka?</summary>

In order to use ClickPipes for Kafka, you will need a running Kafka broker and a ClickHouse Cloud service with ClickPipes enabled. You will also need to ensure that ClickHouse Cloud can access your Kafka broker. This can be achieved by allowing remote connection on the Kafka side, whitelisting [ClickHouse Cloud Egress IP addresses](/manage/data-sources/cloud-endpoints-api) in your Kafka setup. Alternatively, you can use [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) to connect ClickPipes for Kafka to your Kafka brokers.
</details>

<details>

<summary>Does ClickPipes for Kafka support AWS PrivateLink?</summary>

AWS PrivateLink is supported. See [the documentation](/integrations/clickpipes/aws-privatelink) for more information on how to set it up.
</details>

<details>

<summary>Can I use ClickPipes for Kafka to write data to a Kafka topic?</summary>

No, the ClickPipes for Kafka is designed for reading data from Kafka topics, not writing data to them. To write data to a Kafka topic, you will need to use a dedicated Kafka producer.
</details>

<details>

<summary>Does ClickPipes support multiple brokers?</summary>

Yes, if the brokers are part of the same quorum they can be configured together delimited with `,`.
</details>

<details>

<summary>Can ClickPipes replicas be scaled?</summary>

Yes, ClickPipes for streaming can be scaled both horizontally and vertically.
Horizontal scaling adds more replicas to increase throughput, while vertical scaling increases the resources (CPU and RAM) allocated to each replica to handle more intensive workloads.
This can be configured during ClickPipe creation, or at any other point under **Settings** -> **Advanced Settings** -> **Scaling**.
</details>

### Azure Event Hubs {#azure-eventhubs}

<details>

<summary>Does the Azure Event Hubs ClickPipe work without the Kafka surface?</summary>

No. ClickPipes requires the Event Hubs namespace to have the Kafka surface enabled. This is only available in tiers above **basic**. See the [Azure Event Hubs documentation](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace) for more information.
</details>

<details>

<summary>Does Azure Schema Registry work with ClickPipes?</summary>

No. ClickPipes only supports schema registries that are API-compatible with the Confluent Schema Registry, which is not the case for Azure Schema Registry. If you require support for this schema registry, [reach out to our team](https://clickhouse.com/company/contact?loc=clickpipes).
</details>

<details>

<summary>What permissions does my policy need to consume from Azure Event Hubs?</summary>

To list topics and consume events, the shared access policy that is given to ClickPipes requires, at minimum, a 'Listen' claim.
</details>

<details>

<summary>Why is my Event Hubs not returning any data?</summary>

If your ClickHouse instance is in a different region or continent from your Event Hubs deployment, you may experience timeouts when onboarding your ClickPipes, and higher-latency when consuming data from the Event Hub. We recommend deploying ClickHouse Cloud and Azure Event Hubs in the same cloud region, or regions located close to each other, to avoid performance overhead.
</details>

<details>

<summary>Should I include the port number for Azure Event Hubs?</summary>

Yes. ClickPipes expects you to include the port number for the Kafka surface, which should be `:9093`.
</details>

<details>

<summary>Are ClickPipes IPs still relevant for Azure Event Hubs?</summary>

Yes. To restrict traffic to your Event Hubs instance, please add the [documented static NAT IPs](../
/index.md#list-of-static-ips) to .

</details>

<details>
<summary>Is the connection string for the Event Hub, or is it for the Event Hub namespace?</summary>

Both work. We strongly recommend using a shared access policy at the **namespace level** to retrieve samples from multiple Event Hubs.
</details>
