---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about Kafka ClickPipes'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka ClickPipes FAQ'
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
ClickPipes is a separate cloud service that runs independently of the ClickHouse Service, it connects to Kafka (or other data sources) and pushes events to an associated ClickHouse Cloud service. This decoupled architecture allows for superior operational flexibility, clear separation of concerns, scalable ingestion, graceful failure management, extensibility and more.
</details>

<details>
<summary>What are the requirements for using ClickPipes for Kafka?</summary>
In order to use ClickPipes for Kafka, you will need a running Kafka broker and a ClickHouse Cloud service with ClickPipes enabled. You will also need to ensure that ClickHouse Cloud can access your Kafka broker. This can be achieved by allowing remote connection on the Kafka side, whitelisting [ClickHouse Cloud Egress IP addresses](/manage/security/cloud-endpoints-api) in your Kafka setup. Alternatively, you can use [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) to connect ClickPipes for Kafka to your Kafka brokers.
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

### Upstash {#upstash}

<details>
<summary>Does ClickPipes support Upstash?</summary>
Yes. The Upstash Kafka product entered into a deprecation period on 11th September 2024 for 6 months. Existing customers can continue to use ClickPipes with their existing Upstash Kafka brokers using the generic Kafka tile on the ClickPipes user interface. Existing Upstash Kafka ClickPipes are unaffected before the deprecation notice. When the the deprecation period is up the ClickPipe will stop functioning.
</details>

<details>
<summary>Does ClickPipes support Upstash schema registry?</summary>
No. ClickPipes is not Upstash Kafka schema registry compatible.
</details>

<details>
<summary>Does ClickPipes support the Upstash QStash Workflow?</summary>
No. Unless a Kafka compatible surface is introduced in QStash Workflow it will not work with Kafka ClickPipes.
</details>

### Azure EventHubs {#azure-eventhubs}

<details>
<summary>Does the Azure Event Hubs ClickPipe work without the Kafka surface?</summary>
No. ClickPipes requires the Azure Event Hubs to have the Kafka surface enabled. The Kafka protocol is supported for their Standard, Premium and Dedicated SKU only pricing tiers.
</details>

<details>
<summary>Does Azure schema registry work with ClickPipes</summary>
No. ClickPipes is not currently Event Hubs Schema Registry compatible.
</details>

<details>
<summary>What permissions does my policy need to consume from Azure Event Hubs?</summary>
To list topics and consume event, the shared access policy that is given to ClickPipes will at minimum require a 'Listen' claim.
</details>

<details>
<summary>Why is my Event Hubs not returning any data?</summary>
If your ClickHouse instance is in a different region or continent from your Event Hubs deployment, you may experience timeouts when onboarding your ClickPipes, and higher-latency when consuming data from the Event Hub. It is considered a best practice to locate your ClickHouse Cloud deployment and Azure Event Hubs deployment in cloud regions located close to each other to avoid adverse performance.
</details>

<details>
<summary>Should I include the port number for Azure Event Hubs?</summary>
Yes. ClickPipes expects you to include your port number for the Kafka surface, which should be `:9093`.
</details>

<details>
<summary>Are the ClickPipes IPs still relevant for Azure Event Hubs?</summary>
Yes. If you restrict traffic to your Event Hubs instance please add the [documented static NAT IPs](../
/index.md#list-of-static-ips).
</details>

<details>
<summary>Is the connection string for the Event Hub, or is it for the Event Hub namespace?</summary>
Both will work, however, we recommend using a shared access policy at the namespace level to retrieve samples from multiple Event Hubs.
</details>
