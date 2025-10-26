---
'sidebar_label': 'FAQ'
'description': '关于 Kafka 的 ClickPipes 的常见问题'
'slug': '/integrations/clickpipes/kafka/faq'
'sidebar_position': 1
'title': 'Kafka ClickPipes 常见问题'
'doc_type': 'guide'
---

## Kafka ClickPipes 常见问题 {#faq}

### 一般 {#general}

<details>

<summary>ClickPipes for Kafka 是如何工作的？</summary>

ClickPipes 使用专门的架构，通过 Kafka Consumer API 从指定主题读取数据，然后将数据插入到特定的 ClickHouse Cloud 服务中的 ClickHouse 表中。
</details>

<details>

<summary>ClickPipes 和 ClickHouse Kafka 表引擎有什么区别？</summary>

Kafka 表引擎是 ClickHouse 的核心功能，采用“拉取模型”，由 ClickHouse 服务器自身连接到 Kafka，拉取事件并将其本地写入。

ClickPipes 是一个独立的云服务，与 ClickHouse 服务独立运行。它连接到 Kafka（或其他数据源）并将事件推送到关联的 ClickHouse Cloud 服务。这种解耦架构提供了卓越的操作灵活性、明确的关注点分离、可扩展的数据摄取、优雅的故障管理、可扩展性等。
</details>

<details>

<summary>使用 ClickPipes for Kafka 有哪些要求？</summary>

要使用 ClickPipes for Kafka，您需要一个正在运行的 Kafka broker 和一个启用了 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka broker。这可以通过允许 Kafka 端的远程连接来实现，并在 Kafka 设置中将 [ClickHouse Cloud 出口 IP 地址](/manage/security/cloud-endpoints-api) 列入白名单。或者，您可以使用 [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) 将 ClickPipes for Kafka 连接到您的 Kafka brokers。
</details>

<details>

<summary>ClickPipes for Kafka 支持 AWS PrivateLink 吗？</summary>

支持 AWS PrivateLink。有关设置的更多信息，请参阅 [文档](/integrations/clickpipes/aws-privatelink)。
</details>

<details>

<summary>我可以使用 ClickPipes for Kafka 写入数据到 Kafka 主题吗？</summary>

不可以，ClickPipes for Kafka 旨在从 Kafka 主题读取数据，而不是将数据写入它们。要向 Kafka 主题写入数据，您需要使用专门的 Kafka producer。
</details>

<details>

<summary>ClickPipes 支持多个 brokers 吗？</summary>

是的，如果 brokers 是同一法定人数的一部分，您可以将它们一起配置，用 `,` 分隔。
</details>

<details>

<summary>ClickPipes 副本可以扩展吗？</summary>

是的，ClickPipes for streaming 可以进行横向和纵向扩展。
横向扩展通过添加更多副本来增加吞吐量，而纵向扩展则增加分配给每个副本的资源（CPU 和 RAM），以处理更高负载的工作负载。
这可以在创建 ClickPipe 时或在 **设置** -> **高级设置** -> **扩展** 中的任何其他时刻配置。
</details>

### Azure 事件中心 {#azure-eventhubs}

<details>

<summary>Azure 事件中心 ClickPipe 可以在没有 Kafka 表面的情况下工作吗？</summary>

不可以。ClickPipes 需要事件中心命名空间启用 Kafka 表面。此功能仅在 **基础** 以上的服务层级中可用。有关更多信息，请参阅 [Azure 事件中心文档](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)。
</details>

<details>

<summary>Azure Schema Registry 与 ClickPipes 兼容吗？</summary>

不兼容。ClickPipes 仅支持与 Confluent Schema Registry API 兼容的模式注册，而 Azure Schema Registry 并不符合此要求。如果您需要支持此模式注册，请 [联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。
</details>

<details>

<summary>我的策略需要什么权限才能从 Azure 事件中心消费？</summary>

要列出主题和消费事件，赋予 ClickPipes 的共享访问策略至少需要一个“监听”声明。
</details>

<details>

<summary>为什么我的事件中心没有返回任何数据？</summary>

如果您的 ClickHouse 实例与您的事件中心部署位于不同的区域或大陆，您在启动 ClickPipes 时可能会遇到超时，并在从事件中心消费数据时遇到更高的延迟。我们建议将 ClickHouse Cloud 和 Azure 事件中心部署在同一云区域，或彼此靠近的区域，以避免性能开销。
</details>

<details>

<summary>我应该为 Azure 事件中心包括端口号吗？</summary>

是的。ClickPipes 希望您为 Kafka 表面包含端口号，应该是 `:9093`。
</details>

<details>

<summary>ClickPipes 的 IP 地址对于 Azure 事件中心仍然相关吗？</summary>

是的。要限制流量到您的事件中心实例，请添加 [文档中的静态 NAT IP 地址](../index.md#list-of-static-ips)。
</details>

<details>
<summary>这是事件中心的连接字符串，还是事件中心命名空间的连接字符串？</summary>

两者都可以工作。我们强烈建议在 **命名空间级别** 使用共享访问策略，从多个事件中心获取样本。
</details>
