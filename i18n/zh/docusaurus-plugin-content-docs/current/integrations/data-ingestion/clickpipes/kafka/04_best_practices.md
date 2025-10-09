---
'sidebar_label': '最佳实践'
'description': '详细说明在使用 Kafka ClickPipes 时应遵循的最佳实践'
'slug': '/integrations/clickpipes/kafka/best-practices'
'sidebar_position': 1
'title': '最佳实践'
'doc_type': 'guide'
---


# 最佳实践 {#best-practices}

## 消息压缩 {#compression}

我们强烈建议对您的 Kafka 主题使用压缩。压缩可以显著节省数据传输成本，并几乎不会影响性能。
要了解有关 Kafka 中消息压缩的更多信息，我们建议您首先查看 [指南](https://www.confluent.io/blog/apache-kafka-message-compression/)。

## 限制 {#limitations}

- [`DEFAULT`](/sql-reference/statements/create/table#default) 不受支持。

## 交付语义 {#delivery-semantics}

ClickPipes for Kafka 提供 `at-least-once` 交付语义（这是最常用的方法之一）。我们欢迎您通过 [联系表单](https://clickhouse.com/company/contact?loc=clickpipes) 提供有关交付语义的反馈。如果您需要 exactly-once 语义，我们建议您使用我们的官方 [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) 汇点。

## 认证 {#authentication}

对于 Apache Kafka 协议数据源，ClickPipes 支持 [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 认证，并提供 TLS 加密，以及 `SASL/SCRAM-SHA-256` 和 `SASL/SCRAM-SHA-512`。根据流媒体源（Redpanda、MSK 等），将启用所有或部分这些认证机制，具体取决于兼容性。如果您的认证需求有所不同，请 [给我们反馈](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe 的 IAM 认证是一个 beta 功能。
:::

ClickPipes 支持以下 AWS MSK 认证

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 认证
- [IAM 凭证或基于角色的访问](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 认证

使用 IAM 认证连接到 MSK 代理时，IAM 角色必须具有必要权限。
以下是 MSK 用于 Apache Kafka API 的必要 IAM 策略的示例：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": [
                "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
            ]
        }
    ]
}
```

#### 配置受信任关系 {#configuring-a-trusted-relationship}

如果您使用 IAM 角色 ARN 进行 MSK 身份验证，则需要在您的 ClickHouse Cloud 实例之间添加受信任关系，以便角色可以被使用。

:::note
基于角色的访问仅适用于部署到 AWS 的 ClickHouse Cloud 实例。
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        ...
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::12345678912:role/CH-S3-your-clickhouse-cloud-role"
            },
            "Action": "sts:AssumeRole"
        },
    ]
}
```

### 自定义证书 {#custom-certificates}

ClickPipes for Kafka 支持为使用非公共服务器证书的 Kafka 代理上传自定义证书。
也支持上传客户端证书和密钥，以进行基于 TLS 的双向认证（mTLS）。

## 性能 {#performance}

### 批处理 {#batching}

ClickPipes 将数据批量插入到 ClickHouse 中。这是为了避免在数据库中创建过多的部分，从而导致集群中的性能问题。

当满足以下任一条件时，批量将被插入：
- 批量大小达到最大值（每 1GB 虚拟内存 100,000 行或 32MB）
- 批处理已打开的最长时间（5 秒）

### 延迟 {#latency}

延迟（定义为生产 Kafka 消息与消息在 ClickHouse 中可用之间的时间）将取决于多个因素（即代理延迟、网络延迟、消息大小/格式）。上面描述的 [批处理](#batching) 也将影响延迟。我们始终建议在典型负载下测试您的特定用例，以确定预期延迟。

ClickPipes 不提供关于延迟的任何保证。如果您有特定的低延迟要求，请 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。

### 扩展性 {#scaling}

ClickPipes for Kafka 旨在横向和纵向扩展。默认情况下，我们创建一个包含一个消费者的消费者组。可以在 ClickPipe 创建期间或在 **设置** -> **高级设置** -> **扩展** 下的任何其他时间进行配置。

ClickPipes 提供高可用性，并采用可用区分布式体系结构。
这需要至少扩展到两个消费者。

无论运行消费者的数量如何，容错都是设计的结果。
如果消费者或其底层基础设施发生故障，ClickPipe 将自动重启该消费者并继续处理消息。

### 基准 {#benchmarks}

下面是一些 ClickPipes for Kafka 的非正式基准，可以用于获取基准性能的一般想法。需要了解的是，许多因素可以影响性能，包括消息大小、数据类型和数据格式。您的结果可能会有所不同，我们在此显示的内容不是实际性能的保证。

基准详细信息：

- 我们使用了生产的 ClickHouse Cloud 服务，确保资源足够，以确保通过插入处理不会对 ClickHouse 产生瓶颈。
- ClickHouse Cloud 服务、Kafka 集群（Confluent Cloud）和 ClickPipe 均在同一区域（`us-east-2`）运行。
- ClickPipe 配置为单个 L 大小的副本（4 GiB 的 RAM 和 1 vCPU）。
- 示例数据包括嵌套数据，混合有 `UUID`、`String` 和 `Int` 数据类型。其他数据类型，如 `Float`、`Decimal` 和 `DateTime`，可能性能较差。
- 使用压缩和未压缩数据的性能没有明显差异。

| 副本大小  | 消息大小 | 数据格式 | 吞吐量 |
|-----------|----------|-----------|--------|
| Large (L) | 1.6kb    | JSON      | 63mb/s |
| Large (L) | 1.6kb    | Avro      | 99mb/s |
