---
sidebar_label: Push to ClickHouse
sidebar_position: 2
slug: /en/integrations/redshift/redshift-push-to-clickhouse
description: Push Data from Redshift to ClickHouse
---

# Push Data from Redshift to ClickHouse

In the push scenario, the idea is to leverage a third-party tool or service (either custom code or an [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)) to send your data to your ClickHouse instance. For example, you can use a software like [Airbyte](https://www.airbyte.com/) to move data between your Redshift instance (as a source) and ClickHouse as a destination ([see our integration guide for Airbyte](../airbyte-and-clickhouse))


<img src={require('./images/push.png').default} class="image" alt="PUSH Redshit to ClickHouse"/>

#### Pros

* It can leverage the existing catalog of connectors from the ETL/ELT software.
* Built-in capabilities to keep data in sync (append/overwrite/increment logic).
* Enable data transformation scenarios (for example, see our [integration guide for dbt](../dbt)).

#### Cons

* Users need to set up and maintain an ETL/ELT infrastructure.
* Introduces a third-party element in the architecture which can turn into a potential scalability bottleneck.
