---
date: 2021-09-01
---

# How many maximum databases, tables, partitions or parts is recommended in a ClickHouse cluster?

We recommend having a maximum of 1000 databases and 5000 tables, 50000 partitions, and 100000 parts across all databases for a Service. Databases in ClickHouse are more of a namespace and have no performance impact, so 1000 databases is a loose guideline. However, the number of tables would affect the Service startup time, so we recommend limiting the number of tables or partitions. ClickHouse will provide warning if these threshold are met. 
