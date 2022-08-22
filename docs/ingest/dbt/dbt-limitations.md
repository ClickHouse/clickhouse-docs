---
sidebar_label: Limitations
sidebar_position: 9
slug: /en/integrations/dbt/dbt-limitations
description: Limitations of the dbt ClickHouse plugin
---

# Limitations

The current ClickHouse plugin for dbt has several limitations users should be aware of:

1. The plugin currently materializes models as tables using an `INSERT TO SELECT`. This effectively means data duplication. Very large datasets (PB) can result in extremely long run times, making some models unviable. Aim to minimize the number of rows returned by any query, utilizing GROUP BY where possible. Prefer models which summarize data over those which simply perform a transform whilst maintaining row counts of the source.
2. [Ephemeral materializations](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/materializations#ephemeral) are not supported.
3. To use Distributed tables to represent a model, users must create the underlying replicated tables on each node manually. The Distributed table can, in turn, be created on top of these. The plugin does not manage cluster creation.
4. Only the ClickHouse native protocol is supported. There is no support for HTTP.
5. When dbt creates a relation (table/view) in a database, it usually creates it as: `{{ database }}.{{ schema }}.{{ table/view id }}`. ClickHouse has no notion of schemas. The plugin therefore uses `{{schema}}.{{ table/view id }}`, where `schema` is the ClickHouse database.

Further Information

The previous guides only touch the surface of dbt functionality. Users are recommended to read the excellent [dbt documentation](https://docs.getdbt.com/docs/introduction).

Additional configuration for the plugin is described [here](https://github.com/silentsokolov/dbt-clickhouse#model-configuration).
