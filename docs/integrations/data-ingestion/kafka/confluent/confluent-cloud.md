---
sidebar_label: 'Kafka Connector Sink on Confluent Cloud'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: 'Guide to using the fully managed ClickHouse Connector Sinkon Confluent Cloud'
title: 'Integrating Confluent Cloud with ClickHouse'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: explanation
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';

# Integrating Confluent Cloud with ClickHouse

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SQAiPVbd3gg"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## Prerequisites {#prerequisites}
We assume you are familiar with:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud

## The official Kafka connector from ClickHouse with Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### Create a Topic {#create-a-topic}
Creating a topic on Confluent Cloud is fairly simple, and there are detailed instructions [here](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Important notes {#important-notes}

* The Kafka topic name must be the same as the ClickHouse table name. The way to tweak this is by using a transformer (for example [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* More partitions does not always mean more performance - see our upcoming guide for more details and performance tips.

#### Gather your connection details {#gather-your-connection-details}
<ConnectionDetails />

#### Install Connector {#install-connector}
Install the fully managed ClickHouse Sink Connector on Confluent Cloud following the [official documentation](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html).

#### Configure the Connector {#configure-the-connector}
During the configuration of the ClickHouse Sink Connector, you will need to provide the following details:
- hostname of your ClickHouse server
- port of your ClickHouse server (default is 8443)
- username and password for your ClickHouse server
- database name in ClickHouse where the data will be written
- topic name in Kafka that will be used to write data to ClickHouse

The Confluent Cloud UI supports advanced configuration options to adjust poll intervals, batch sizes, and other parameters to optimize performance.

#### Known limitations {#known-limitations}
* See the list of [Connectors limitations in the official docs](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)
