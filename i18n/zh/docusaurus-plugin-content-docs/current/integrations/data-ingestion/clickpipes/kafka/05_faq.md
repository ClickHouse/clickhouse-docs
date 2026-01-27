---
sidebar_label: '常见问题'
description: '关于 ClickPipes for Kafka 的常见问题'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka ClickPipes 常见问题'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

## Kafka ClickPipes 常见问题 \{#faq\}

### 常规 \{#general\}

<details>

<summary>Kafka ClickPipe 如何工作?</summary>

ClickPipes 使用专用架构运行 Kafka Consumer API 从指定主题读取数据,然后将数据插入特定 ClickHouse Cloud 服务上的 ClickHouse 表中。

</details>

<details>

<summary>
  ClickPipes 与 ClickHouse Kafka 表引擎有什么区别?
</summary>

Kafka 表引擎是 ClickHouse 的核心功能,实现了"拉取模型",即 ClickHouse 服务器自身连接到 Kafka,拉取事件后在本地写入。

ClickPipes 是独立于 ClickHouse 服务运行的单独云服务。它连接到 Kafka(或其他数据源)并将事件推送到关联的 ClickHouse Cloud 服务。这种解耦架构提供了卓越的运营灵活性、清晰的关注点分离、可扩展的摄取能力、优雅的故障管理、可扩展性等优势。

</details>

<details>

<summary>使用 Kafka ClickPipe 有哪些要求?</summary>

要使用 Kafka ClickPipe,您需要一个正在运行的 Kafka 代理和一个启用了 ClickPipes 的 ClickHouse Cloud 服务。您还需要确保 ClickHouse Cloud 可以访问您的 Kafka 代理。这可以通过在 Kafka 端允许远程连接、在 Kafka 设置中将 [ClickHouse Cloud 出口 IP 地址](/manage/data-sources/cloud-endpoints-api)加入白名单来实现。或者,您可以使用 [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) 将 Kafka ClickPipe 连接到您的 Kafka 代理。

</details>

<details>

<summary>Kafka ClickPipe 是否支持 AWS PrivateLink?</summary>

支持 AWS PrivateLink。有关如何设置的更多信息,请参阅[文档](/integrations/clickpipes/aws-privatelink)。

</details>

<details>

<summary>
  我可以使用 Kafka ClickPipe 向 Kafka 主题写入数据吗?
</summary>

不可以,Kafka ClickPipe 设计用于从 Kafka 主题读取数据,而不是向其写入数据。要向 Kafka 主题写入数据,您需要使用专用的 Kafka 生产者。

</details>

<details>

<summary>ClickPipes 是否支持多个代理?</summary>

是的,如果代理属于同一仲裁组,可以使用 `,` 分隔符将它们一起配置。

</details>

<details>

<summary>ClickPipes 副本可以扩展吗?</summary>

是的,用于流式传输的 ClickPipes 可以进行水平和垂直扩展。
水平扩展通过添加更多副本来增加吞吐量,而垂直扩展则增加分配给每个副本的资源(CPU 和 RAM)以处理更密集的工作负载。
这可以在创建 ClickPipe 期间配置,或在任何其他时间点通过**设置** -> **高级设置** -> **扩展**进行配置。

</details>

### Azure Event Hubs \{#azure-eventhubs\}

<details>

<summary>
  Azure Event Hubs ClickPipe 在没有 Kafka 接口的情况下能否工作?
</summary>

不可以。ClickPipes 要求 Event Hubs 命名空间启用 Kafka 接口。这仅在**基本**层级以上可用。有关更多信息,请参阅 [Azure Event Hubs 文档](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)。

</details>

<details>

<summary>Azure Schema Registry 是否与 ClickPipes 兼容?</summary>

不兼容。ClickPipes 仅支持与 Confluent Schema Registry API 兼容的架构注册表,而 Azure Schema Registry 不属于此类。如果您需要对此架构注册表的支持,[请联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。

</details>

<details>

<summary>
  我的策略需要哪些权限才能从 Azure Event Hubs 消费数据?
</summary>

要列出主题和消费事件,提供给 ClickPipes 的共享访问策略至少需要"监听"声明。

</details>

<details>

<summary>为什么我的 Event Hubs 没有返回任何数据?</summary>

如果您的 ClickHouse 实例与 Event Hubs 部署位于不同的区域或大陆,您可能会在载入 ClickPipes 时遇到超时,并且在从 Event Hub 消费数据时遇到更高的延迟。我们建议将 ClickHouse Cloud 和 Azure Event Hubs 部署在同一云区域或彼此靠近的区域,以避免性能开销。

</details>

<details>

<summary>我应该为 Azure Event Hubs 包含端口号吗?</summary>

是的。ClickPipes 要求您为 Kafka 接口包含端口号,该端口应为 `:9093`。

</details>

<details>

<summary>ClickPipes 的 IP 对 Azure Event Hubs 仍然适用吗?</summary>

适用。若要限制访问您的 Event Hubs 实例的流量,请将[文档中列出的静态 NAT IP](../
/index.md#list-of-static-ips) 添加到相应的允许列表中。

</details>

<details>
<summary>连接字符串是针对 Event Hub,还是针对 Event Hub 命名空间?</summary>

两者都可以使用。我们强烈建议在**命名空间级别**使用共享访问策略,以便从多个 Event Hubs 中采集示例数据。

</details>