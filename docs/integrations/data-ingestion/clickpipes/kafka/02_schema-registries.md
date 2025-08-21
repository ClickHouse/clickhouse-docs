---
sidebar_label: 'Schema registries for Avro data streams'
description: 'Information on schema registries for Kafka ClickPipe'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: 'Schema registries for Kafka ClickPipe'
doc_type: 'explanation'
---

# Schema registries {#schema-registries}

ClickPipes supports schema registries for Avro data streams.

## Supported registries for Kafka ClickPipes {#supported-schema-registries}

Schema registries that use the Confluent Schema Registry API are supported. This includes:
- Confluent Kafka and Cloud
- Redpanda
- AWS MSK
- Upstash

ClickPipes is not currently compatible with the AWS Glue Schema registry or the Azure Schema Registry.

## Configuration {#schema-registry-configuration}

ClickPipes with Avro data require a schema registry. This can be configured in one of three ways:

1. Providing a complete path to the schema subject (e.g. `https://registry.example.com/subjects/events`)
    - Optionally, a specific version can be referenced by appending `/versions/[version]` to the url (otherwise ClickPipes will retrieve the latest version).
2. Providing a complete path to the schema id (e.g. `https://registry.example.com/schemas/ids/1000`)
3. Providing the root schema registry URL (e.g. `https://registry.example.com`)

## How it works {#how-schema-registries-work}

ClickPipes dynamically retrieves and applies the Avro schema from the configured Schema Registry.
- If there's a schema id embedded in the message, it will use that to retrieve the schema.
- If there's no schema id embedded in the message, it will use the schema id or subject name specified in the ClickPipe configuration to retrieve the schema.
- If the message is written without an embedded schema id, and no schema id or subject name is specified in the ClickPipe configuration, then the schema will not be retrieved and the message will be skipped with a `SOURCE_SCHEMA_ERROR` logged in the ClickPipes errors table.
- If the message does not conform to the schema, then the message will be skipped with a `DATA_PARSING_ERROR` logged in the ClickPipes errors table.

## Schema mapping {#schema-mapping}

The following rules are applied to the mapping between the retrieved Avro schema and the ClickHouse destination table:

- If the Avro schema contains a field that is not included in the ClickHouse destination mapping, that field is ignored.
- If the Avro schema is missing a field defined in the ClickHouse destination mapping, the ClickHouse column will be populated with a "zero" value, such as 0 or an empty string. Note that DEFAULT expressions are not currently evaluated for ClickPipes inserts (this is temporary limitation pending updates to the ClickHouse server default processing).
- If the Avro schema field and the ClickHouse column are incompatible, inserts of that row/message will fail, and the failure will be recorded in the ClickPipes errors table. Note that several implicit conversions are supported (like between numeric types), but not all (for example, an Avro record field can not be inserted into an Int32 ClickHouse column).
