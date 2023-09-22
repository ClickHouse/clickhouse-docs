---
sidebar_label: Amazon MSK
description: Integrating Amazon MSK with ClickHouse
slug: /en/integrations/msk
---

# Integrating Amazon MSK with ClickHouse

## Prerequisites

- You are familiar with the Amazon MSK and Confluent Platform, specifically Kafka Connect. We recommend the Amazon MSK [Getting Started guide](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) and [MSK Connect guide](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).
- The MSK broker is publicly accessible. See the [Public Access](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) section of the Developer Guide.
  - If you wish to allow-list the static IPs for Clickpipes, they can be found [here](../clickpipes/index.md#list-of-static-ips).

## The official Kafka connector from ClickHouse with Amazon MSK

### Steps
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

## Performance tuning
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