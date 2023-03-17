---
sidebar_label: Amazon MSK
description: Integrating Amazon MSK with ClickHouse
slug: /en/integrations/msk
---

# Integrating Amazon MSK with ClickHouse

## Prerequisites

We assume you are familiar with the Amazon MSK and Confluent Platform, specifically Kafka Connect. We recommend the Amazon MSK [Getting Started guide](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) and [MSK Connect guide](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html).

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

