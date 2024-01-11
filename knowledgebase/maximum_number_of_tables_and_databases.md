---
date: 2021-09-01
---

# How many maximum databases, tables, partitions, or parts are recommended in a ClickHouse cluster?

We recommend having a maximum of 1000 databases and 5000 tables, 50000 partitions, and 100000 parts across all databases for a service. Databases in ClickHouse are more of a _namespace_ and have no performance impact; 1000 databases is a loose guideline. However, the number of tables would affect the service startup time, so we recommend limiting the number of tables or partitions. ClickHouse provides a warning if these thresholds are hit. 
