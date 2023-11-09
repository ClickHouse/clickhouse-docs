---
date: 2021-09-01
---

# How many maximum databases or tables is recommended in a ClickHouse cluster?

We recommend having a maximum of 100 databases and 1000 tables across all databases for a Service. Databases in ClickHouse are more of a namespace and have no performance impact, so 100 databases is a loose guideline. However, the number of tables would affect the Service startup time, so we recommend limiting the number of tables or partitions.
