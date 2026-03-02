---
sidebar_label: '常见问题解答'
description: '关于 ClickPipes for Kafka 的常见问题解答'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka ClickPipes 常见问题解答'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

## Kafka ClickPipes 常见问题解答 \{#faq\}

### 常规 \{#general\}

<details>

<summary>ClickPipes for Kafka 是如何工作的？</summary>

ClickPipes 使用一套专用架构运行 Kafka Consumer API，从指定的 topic 读取数据，然后将数据插入到特定 ClickHouse Cloud 服务上的 ClickHouse 表中。
</details>

<details>

<summary>ClickPipes 与 ClickHouse Kafka Table Engine 有什么区别？</summary>

Kafka Table Engine 是 ClickHouse 的核心功能，实现了一种“拉取模型（pull model）”，即 ClickHouse 服务器自身连接到 Kafka，拉取事件然后在本地写入。

ClickPipes 是一项独立于 ClickHouse 服务运行的云服务。它连接到 Kafka（或其他数据源），并将事件推送到关联的 ClickHouse Cloud 服务。这种解耦的架构提供了更高的运维灵活性、清晰的关注点分离、可扩展的摄取能力、优雅的故障管理、良好的可扩展性等优势。
</details>

<details>

<summary>使用 ClickPipes for Kafka 有哪些前提条件？</summary>

要使用 ClickPipes for Kafka，您需要一个正在运行的 Kafka broker，以及已启用 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka broker。这可以通过在 Kafka 端允许远程连接，并在您的 Kafka 配置中将 [ClickHouse Cloud Egress IP addresses](/manage/data-sources/cloud-endpoints-api) 加入白名单来实现。或者，您可以使用 [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) 将 ClickPipes for Kafka 连接到您的 Kafka brokers。
</details>

<details>

<summary>ClickPipes for Kafka 是否支持 AWS PrivateLink？</summary>

支持 AWS PrivateLink。有关如何进行设置的更多信息，请参阅[文档](/integrations/clickpipes/aws-privatelink)。
</details>

<details>

<summary>我可以使用 ClickPipes for Kafka 向 Kafka topic 写入数据吗？</summary>

不可以，ClickPipes for Kafka 设计用于从 Kafka topics 读取数据，而不是向其写入数据。要向 Kafka topic 写入数据，您需要使用专门的 Kafka producer。
</details>

<details>

<summary>ClickPipes 是否支持多个 brokers？</summary>

支持，如果这些 brokers 属于同一个 quorum，则可以一起配置，之间使用 `,` 分隔。
</details>

<details>

<summary>ClickPipes 副本可以扩展吗？</summary>

可以，用于流式处理的 ClickPipes 既可以横向扩展，也可以纵向扩展。
横向扩展通过增加副本数量来提高吞吐量，而纵向扩展则通过为每个副本分配更多资源（CPU 和 RAM）来处理更高强度的工作负载。
这可以在创建 ClickPipe 时进行配置，或之后在 **Settings** -> **Advanced Settings** -> **Scaling** 中随时调整。
</details>

### Azure Event Hubs \{#azure-eventhubs\}

<details>

<summary>Azure Event Hubs ClickPipe 可以在没有 Kafka 接口的情况下工作吗？</summary>

不可以。ClickPipes 要求 Event Hubs 命名空间启用 Kafka 接口层。该功能仅在高于 **basic** 的层级中提供。更多信息请参阅 [Azure Event Hubs 文档](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)。
</details>

<details>

<summary>Azure Schema Registry 可以与 ClickPipes 一起使用吗？</summary>

不可以。ClickPipes 仅支持与 Confluent Schema Registry API 兼容的模式注册表，而 Azure Schema Registry 不满足这一条件。如果您需要对此模式注册表的支持，请[联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。
</details>

<details>

<summary>我的策略需要哪些权限才能从 Azure Event Hubs 进行消费？</summary>

为了列出主题并消费事件，授予 ClickPipes 的共享访问策略至少需要具有一个 `Listen` 声明。
</details>

<details>

<summary>为什么我的 Event Hubs 不返回任何数据？</summary>

如果您的 ClickHouse 实例所在的区域或洲与 Event Hubs 部署位置不同，那么在接入 ClickPipes 时，您可能会遇到超时，并且从 Event Hub 消费数据时会有更高的延迟。我们建议将 ClickHouse Cloud 和 Azure Event Hubs 部署在同一云区域，或部署在彼此相近的区域，以避免性能开销。
</details>

<details>

<summary>我是否应该为 Azure Event Hubs 包含端口号？</summary>

是的。ClickPipes 期望您为 Kafka 接口包含端口号，该端口应为 `:9093`。
</details>

<details>

<summary>ClickPipes 的 IP 在 Azure Event Hubs 中仍然相关吗？</summary>

是的。要限制到您的 Event Hubs 实例的流量，请将[文档中列出的静态 NAT IP](../
/index.md#list-of-static-ips) 添加到相应配置中。

</details>

<details>
<summary>连接字符串是用于 Event Hub，还是用于 Event Hub 命名空间？</summary>

两者都可以。我们强烈建议在**命名空间级别**使用共享访问策略，以便从多个 Event Hubs 中获取数据样本。
</details>