---
sidebar_label: ClickHouse Connector Sink on Confluent Platform
sidebar_position: 2
slug: /en/integrations/kafka/cloud/confluent/custom-connector
description: Using ClickHouse Connector Sink with Kafka Connect and ClickHouse
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Integrating Confluent Cloud with ClickHouse

## Prerequisites
We assume you are familiar with:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud and [Custom Connectors](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html).

## The official Kafka connector from ClickHouse with Confluent Cloud

### Installing on Confluent Cloud
This is meant to be a quick guide to get you started with the ClickHouse Sink Connector on Confluent Cloud.
For more details, please refer to the [official Confluent documentation](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector).

#### Create a Topic
Creating a topic on Confluent Cloud is fairly simple, and there are detailed instructions [here](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html).

#### Important Notes
* The Kafka topic name must be the same as the ClickHouse table name. The way to tweak this is by using a transformer (for example [ExtractTopic](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)).
* More partitions does not always mean more performance - see our upcoming guide for more details and performance tips.

#### Install Connector
You can download the connector from our [repository](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) - please feel free to submit comments and issues there as well!

Navigate to “Connector Plugins” -> “Add plugin” and using the following settings:

```
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. This will ensure entries of the ClickHouse password are masked during configuration.
```
Example:
<img src={require('./images/AddCustomConnectorPlugin.png').default} class="image" alt="Settings for adding a custom connector" style={{width: '50%'}}/>

#### Gather your connection details
<ConnectionDetails />

#### Configure the Connector
Navigate to `Connectors` -> `Add Connector` and use the following settings (note that the values are examples only):

```json
{
  "database": "<DATABASE_NAME>",
  "errors.retry.timeout": "30",
  "exactlyOnce": "false",
  "schemas.enable": "false",
  "hostname": "<CLICKHOUSE_HOSTNAME>",
  "password": "<SAMPLE_PASSWORD>",
  "port": "8443",
  "ssl": "true",
  "topics": "<TOPIC_NAME>",
  "username": "<SAMPLE_USERNAME>",
  "key.converter": "org.apache.kafka.connect.storage.StringConverter",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "value.converter.schemas.enable": "false"
}
```

#### Specify the connection endpoints
You need to specify the allow-list of endpoints that the connector can access.
You must use a fully-qualified domain name (FQDN) when adding the networking egress endpoint(s).
Example: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
You must specify HTTP(S) port. The Connector doesn't support Native protocol yet.
:::

[Read the documentation.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

You should be all set!

#### Known Limitations
* Custom Connectors must use public internet endpoints. Static IP addresses aren't supported.
* You can override some Custom Connector properties. See the fill [list in the official documentation.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Custom Connectors are available only in [some AWS regions](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)
* See the list of [Custom Connectors limitations in the official docs](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
