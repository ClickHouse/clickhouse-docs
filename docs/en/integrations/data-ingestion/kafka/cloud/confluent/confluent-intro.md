---
sidebar_label: Confluent Platform intro
sidebar_position: 1
slug: /en/integrations/kafka/confluent/intro
description: Introduction into Confluent Platform
---
# Confluent Platform intro
We assume you are familiar with the Confluent Platform, specifically Kafka Connect. We recommend the [Getting Started guide](https://docs.confluent.io/platform/current/connect/userguide.html) for Kafka Connect and the [Kafka Connect 101](https://developer.confluent.io/learn-kafka/kafka-connect) guide.

### Pre-requisites
1. [Download and install the Confluent platform](https://www.confluent.io/installation). This main Confluent package contains the tested version of Kafka Connect v7.0.1. 
2. Java is required for the Confluent Platform. Refer to their documentation for the currently [supported java versions](https://docs.confluent.io/platform/current/installation/versions-interoperability.html).
3. Ensure you have a ClickHouse instance available.
4. Kafka instance - Confluent cloud is the easiest for this; otherwise, set up a self-managed instance using the above Confluent package. The setup of Kafka is beyond the scope of these docs.
