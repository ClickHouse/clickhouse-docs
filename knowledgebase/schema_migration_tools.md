---
date: 2023-06-07
---

# Automatic schema migration tools for ClickHouse

We often get asked about a good schema migration tool for ClickHouse and what is the best practice to manage database schemas in ClickHouse that might change over time? There is no standard schema migration tool for ClickHouse, but we have compiled the following list (in no particular order) of automatic schema migration tools with support for ClickHouse that we know:

- [Bytebase](https://www.bytebase.com/)
- [Flyway](https://www.red-gate.com/products/flyway/)
- [Liquibase](https://www.liquibase.com/)
- A [simple community tool](https://github.com/VVVi/clickhouse-migrations) named `clickhouse-migrations`
- Another [community tool](https://github.com/golang-migrate/migrate/tree/master/database/clickhouse) written in Go
