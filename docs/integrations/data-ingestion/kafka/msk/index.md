---
sidebar_label: 'Amazon MSK with Kafka Connector Sink'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'The official Kafka connector from ClickHouse with Amazon MSK'
keywords: ['integration', 'kafka', 'amazon msk', 'sink', 'connector']
title: 'Integrating Amazon MSK with ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Integrating Amazon MSK with ClickHouse

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/6lKI_WlQ3-s"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

> Note: The policy shown in the video is permissive and intended for quick start only. See least‑privilege IAM guidance below.

## Prerequisites {#prerequisites}
We assume:
* you are familiar with [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md),Amazon MSK and MSK Connectors. We recommend the Amazon MSK [Getting Started guide](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) and [MSK Connect guide](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).
* The MSK broker is publicly accessible. See the [Public Access](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) section of the Developer Guide.

## The official Kafka connector from ClickHouse with Amazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

### Steps {#steps}
1. Make sure you're familiar with the [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
1. [Create an MSK instance](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html).
1. [Create and assign IAM role](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html).
1. Download a `jar` file from ClickHouse Connect Sink [Release page](https://github.com/ClickHouse/clickhouse-kafka-connect/releases).
1. Install the downloaded `jar` file on [Custom plugin page](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) of Amazon MSK console.
1. If Connector communicates with a public ClickHouse instance, [enable internet access](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html).
1. Provide a topic name, ClickHouse instance hostname, and password in config.
```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

## Recommended IAM permissions (least privilege) {#iam-least-privilege}

Use the smallest set of permissions required for your setup. Start with the baseline below and add optional services only if you use them.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MSKClusterAccess",
      "Effect": "Allow",
      "Action": [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeClusterV2",
        "kafka:ListClusters",
        "kafka:ListClustersV2"
      ],
      "Resource": "*"
    },
    {
      "Sid": "KafkaAuthorization",
      "Effect": "Allow",
      "Action": [
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeCluster",
        "kafka-cluster:DescribeGroup",
        "kafka-cluster:DescribeTopic",
        "kafka-cluster:ReadData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalGlueSchemaRegistry",
      "Effect": "Allow",
      "Action": [
        "glue:GetSchema*",
        "glue:ListSchemas",
        "glue:ListSchemaVersions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalSecretsManager",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

- Use the Glue block only if you use AWS Glue Schema Registry.
- Use the Secrets Manager block only if you fetch credentials/truststores from Secrets Manager. Scope the ARN.
- Use the S3 block only if you load artifacts (e.g., truststore) from S3. Scope to bucket/prefix.

See also: [Kafka best practices – IAM](../../clickpipes/kafka/04_best_practices.md#iam).

## Performance tuning {#performance-tuning}
One way of increasing performance is to adjust the batch size and the number of records that are fetched from Kafka by adding the following to the **worker** configuration:
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

The specific values you use are going to vary, based on desired number of records and record size. For example, the default values are:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

You can find more details (both implementation and other considerations) in the official [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) and 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) documentation.

## Notes on networking for MSK Connect {#notes-on-networking-for-msk-connect}

In order for MSK Connect to connect to ClickHouse, we recommend your MSK cluster to be in a private subnet with a Private NAT connected for internet access. Instructions on how to set this up are provided below. Note that public subnets are supported but not recommended due to the need to constantly assign an Elastic IP address to your ENI, [AWS provides more details here](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **Create a Private Subnet:** Create a new subnet within your VPC, designating it as a private subnet. This subnet should not have direct access to the internet.
1. **Create a NAT Gateway:** Create a NAT gateway in a public subnet of your VPC. The NAT gateway enables instances in your private subnet to connect to the internet or other AWS services, but prevents the internet from initiating a connection with those instances.
1. **Update the Route Table:** Add a route that directs internet-bound traffic to the NAT gateway
1. **Ensure Security Group(s) and Network ACLs Configuration:** Configure your [security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) and [network ACLs (Access Control Lists)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) to allow relevant traffic.
   1. From MSK Connect worker ENIs to MSK brokers on TLS port (commonly 9094).
   1. From MSK Connect worker ENIs to ClickHouse endpoint: 9440 (native TLS) or 8443 (HTTPS).
   1. Allow inbound on broker SG from the MSK Connect worker SG.
   1. For self-hosted ClickHouse, open the port configured in your server (default 8123 for HTTP).
1. **Attach Security Group(s) to MSK:** Ensure that these security groups are attached to your MSK cluster and MSK Connect workers.
1. **Connectivity to ClickHouse Cloud:**
   1. Public endpoint + IP allowlist: requires NAT egress from private subnets.
   1. Private connectivity where available (e.g., VPC peering/PrivateLink/VPN). Ensure VPC DNS hostnames/resolution are enabled and DNS can resolve the private endpoint.
1. **Validate connectivity (quick checklist):**
   1. From the connector environment, resolve MSK bootstrap DNS and connect via TLS to broker port.
   1. Establish TLS connection to ClickHouse on port 9440 (or 8443 for HTTPS).
   1. If using AWS services (Glue/Secrets Manager), allow egress to those endpoints.
