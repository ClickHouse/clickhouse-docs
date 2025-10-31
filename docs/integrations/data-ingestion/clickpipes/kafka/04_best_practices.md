---
sidebar_label: 'Best practices'
description: 'Details best practices to follow when working with Kafka ClickPipes'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: 'Best practices'
doc_type: 'guide'
keywords: ['kafka best practices', 'clickpipes', 'compression', 'authentication', 'scaling']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Best practices {#best-practices}

## Message Compression {#compression}

We strongly recommend using compression for your Kafka topics. Compression can result in a significant saving in data transfer costs with virtually no performance hit.
To learn more about message compression in Kafka, we recommend starting with this [guide](https://www.confluent.io/blog/apache-kafka-message-compression/).

## Limitations {#limitations}

- [`DEFAULT`](/sql-reference/statements/create/table#default) is not supported.

## Delivery semantics {#delivery-semantics}
ClickPipes for Kafka provides `at-least-once` delivery semantics (as one of the most commonly used approaches). We'd love to hear your feedback on delivery semantics [contact form](https://clickhouse.com/company/contact?loc=clickpipes). If you need exactly-once semantics, we recommend using our official [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) sink.

## Authentication {#authentication}
For Apache Kafka protocol data sources, ClickPipes supports [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) authentication with TLS encryption, as well as `SASL/SCRAM-SHA-256` and `SASL/SCRAM-SHA-512`. Depending on the streaming source (Redpanda, MSK, etc) will enable all or a subset of these auth mechanisms based on compatibility. If you auth needs differ please [give us feedback](https://clickhouse.com/company/contact?loc=clickpipes).

### IAM {#iam}

:::info
IAM Authentication for the MSK ClickPipe is a beta feature.
:::

ClickPipes supports the following AWS MSK authentication

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) authentication
- [IAM Credentials or Role-based access](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) authentication

When using IAM authentication to connect to an MSK broker, the IAM role must have the necessary permissions.
Below is an example of the required IAM policy for Apache Kafka APIs for MSK:

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

#### Configuring a trusted relationship {#configuring-a-trusted-relationship}

If you are authenticating to MSK with a IAM role ARN, you will need to add a trusted relationship between your ClickHouse Cloud instance so the role can be assumed.

:::note
Role-based access only works for ClickHouse Cloud instances deployed to AWS.
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

### Custom Certificates {#custom-certificates}
ClickPipes for Kafka supports the upload of custom certificates for Kafka brokers which use non-public server certificates.
Upload of client certificates and keys is also supported for mutual TLS (mTLS) based authentication.

## Performance {#performance}

### Batching {#batching}
ClickPipes inserts data into ClickHouse in batches. This is to avoid creating too many parts in the database which can lead to performance issues in the cluster.

Batches are inserted when one of the following criteria has been met:
- The batch size has reached the maximum size (100,000 rows or 32MB per 1GB of pod memory)
- The batch has been open for a maximum amount of time (5 seconds)

### Latency {#latency}

Latency (defined as the time between the Kafka message being produced and the message being available in ClickHouse) will be dependent on a number of factors (i.e. broker latency, network latency, message size/format). The [batching](#batching) described in the section above will also impact latency. We always recommend testing your specific use case with typical loads to determine the expected latency.

ClickPipes does not provide any guarantees concerning latency. If you have specific low-latency requirements, please [contact us](https://clickhouse.com/company/contact?loc=clickpipes).

### Scaling {#scaling}

ClickPipes for Kafka is designed to scale horizontally and vertically. By default, we create a consumer group with one consumer. This can be configured during ClickPipe creation, or at any other point under **Settings** -> **Advanced Settings** -> **Scaling**.

ClickPipes provides a high-availability with an availability zone distributed architecture.
This requires scaling to at least two consumers.

Regardless number of running consumers, fault tolerance is available by design.
If a consumer or its underlying infrastructure fails,
the ClickPipe will automatically restart the consumer and continue processing messages.

### Benchmarks {#benchmarks}

Below are some informal benchmarks for ClickPipes for Kafka that can be used to get a general idea of the baseline performance. It's important to know that many factors can impact performance, including message size, data types, and data format. Your mileage may vary, and what we show here is not a guarantee of actual performance.

Benchmark details:

- We used production ClickHouse Cloud services with enough resources to ensure that throughput was not bottlenecked by the insert processing on the ClickHouse side.
- The ClickHouse Cloud service, the Kafka cluster (Confluent Cloud), and the ClickPipe were all running in the same region (`us-east-2`).
- The ClickPipe was configured with a single L-sized replica (4 GiB of RAM and 1 vCPU).
- The sample data included nested data with a mix of `UUID`, `String`, and `Int` datatypes. Other datatypes, such as `Float`, `Decimal`, and `DateTime`, may be less performant.
- There was no appreciable difference in performance using compressed and uncompressed data.

| Replica Size  | Message Size | Data Format | Throughput |
|---------------|--------------|-------------|------------|
| Large (L)     | 1.6kb        |   JSON      | 63mb/s     |
| Large (L)     | 1.6kb        |   Avro      | 99mb/s     |
