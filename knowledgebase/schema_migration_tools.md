---
date: 2023-06-07
title: "Schema migration tools for ClickHouse"
description: "Learn about schema migration tools for ClickHouse and how to manage changing database schemas over time."
tags: ['Tools and Utilities']
keywords: ['Automatic Schema Migration']
---

{frontMatter.description}
{/* truncate */}

# Schema Migration Tools for ClickHouse

## What is Schema Management?

Schema management is the practice of applying version control principles to database schemas. It often encompasses actions such as tracking and automating changes to tables, columns, and their
relationships so that schema updates are repeatable, auditable, and consistent across environments. Schema management comes into play when the shape of the data in the database needs to be modified
for a new use case or performance optimization.

### Why is it important?

Schema management tools let you automate schema changes alongside application deployments. It's common for schema changes
to be a prerequisite to deploying a new application version. These tools are also referred to as "schema migration" or "database migration" tools because users are "migrating" from one version of the
database to another.

Without schema management tooling, database changes are manual, error-prone, and hard to coordinate across teams and environments. While you can always execute DDL directly to the database, these
tools enable version control (tracking changes as versioned code), automated deployments (applying changes consistently across dev/staging/prod), rollback support (reverting changes when something
goes wrong), and audit trails (recording what changed and when). For ClickHouse specifically, where certain DDL changes can be expensive or irreversible, having a structured migration process with
review steps is especially critical.

### Types of schema management approaches

Schema management tools generally fall into two categories.

#### Imperative
These tools use versioned SQL files that describe *how* to get from state A to state B. You write explicit DDL statements like `CREATE TABLE`, `ALTER TABLE`, or `DROP COLUMN` into files. Then the tool runs the files in order and tracks which have been applied. In this category, you dictate the exact SQL to run.
**Examples**: *golang-migrate, Goose, Flyway*

#### Declarative
These tools start with the user defining a "desired state" schema definition. The tool detects the difference between the current database and the desired state, then generates and applies the necessary migration. This approach reduces manual migration writing and schema drift. In this category, the tool dictates the exact SQL to run.
**Example**: *Atlas, Liquibase* 

There is a third category of tools that focus less on the database schema change and more on transforming the data itself rather than the schema structure.  
**Example**: *dbt* 
For this document, we will focus solely on tools for database schema changes.

Overall, we recommend that you choose a tool that aligns with how you and your team want to operate. Imperative tools give full visibility into exactly what DDL will run. But it requires dedicated user focus for diff-ing and managing schema drift. Declarative tools are valuable for automating a lot of the boilerplate maintenance and preventing schema drift, but you should always review the generated plan before applying it to
ClickHouse to ensure no surprise mutation or expensive rewrite hidden behind an auto-generated plan.

---

## What to Consider When Choosing a Tool

### What does your team already use?

Users tend to choose tools based on ecosystem familiarity. If your team is a Go shop, golang-migrate or Goose may feel natural. If you're in the Java ecosystem, you may already have Flyway or
Liquibase in place. If your infrastructure team uses Terraform and infrastructure-as-code patterns, Atlas's declarative model may be a comfortable fit. There's real value in picking something your
team already knows — the best tool is one that actually gets adopted and used consistently.

### What is your desired process?

Think about how schema changes flow through your organization. Take into account if you need a

- simple "write SQL, run it in CI, done" workflow (ex. Goose, golang-migrate)
- managed approval workflows, audit trails, and RBAC (ex. Bytebase, Liquidbase)
- to define your schema declaratively and have the tool figure out the diff (ex. Atlas)

Match the tool to your requirements and process. 

---

## Recommended Tools

These are the tools we generally recommend for ClickHouse users based on maturity, ClickHouse compatibility, community adoption, and operational fit.

### Atlas

[Atlas](https://atlasgo.io/guides/clickhouse) is a schema-as-code tool that takes a declarative approach. You define your desired schema state in HCL or SQL, and Atlas inspects your current database, computes the diff, generates a migration plan, and applies it — optionally after your review.

**Why it works well for ClickHouse:** Atlas has first-class ClickHouse support including tables, views, materialized views, projections, partitions, and UDFs. They added cluster support in v0.37 (September 2025). Supports both HCL and plain SQL schema definitions.

**What to watch out for:** Atlas generates migration plans, but does not understand the *cost* of those plans. A diff might look simple (e.g., change a column type) but trigger an expensive mutation on a multi-terabyte table. Always review generated plans before applying them. 

**Best for:** Teams that want infrastructure-as-code workflows and automatic drift detection, 

- **Type:** Declarative
- **Language:** Go (single binary)
- **License:** Open Core (Apache 2.0 community; paid tiers for advanced features)
- **Cluster support:** Yes

### golang-migrate

[golang-migrate](https://github.com/golang-migrate/migrate) is a simple, widely-used migration runner. You write versioned SQL files with up/down steps, and the tool applies them in order, tracking state in a `schema_migrations` table in your ClickHouse database.

**Why it works well for ClickHouse:** Simple and flexible. You write exactly the ClickHouse DDL you want to run. It's a single Go binary with no runtime dependencies, making it easy to incorporate into a CI/CD pipeline or Docker container. 

**What to watch out for:** If a migration file contains multiple statements and one fails partway, the database can end up in a partial flawed state that requires manual intervention. This is manageable by following the one-statement-per-file discipline. 

**Best for:** Teams that want simplicity and full control over exactly what SQL runs against their ClickHouse instance. 

- **Type:** Imperative
- **Language:** Go 
- **License:** Open Source (MIT, free)
- **Cluster support:** Yes

### Goose

[Goose](https://github.com/pressly/goose) is another Go-based migration runner with a similar philosophy to golang-migrate. You write versioned SQL files (or Go functions for complex logic), and Goose applies them sequentially, tracking state in a version table in ClickHouse.

**Why it works well for ClickHouse:** Same fundamental strengths as golang-migrate — SQL-first, minimal configuration, easy CLI, straightforward CI/CD integration. Goose also supports writing migrations as Go functions, which gives you more flexibility for complex logic that pure SQL can't express.

**What to watch out for:** No schema diffing or autogeneration. 

**Best for:** Teams already using Goose, or those who prefer its migration file conventions over golang-migrate's. 

- **Type:** Imperative 
- **Language:** Go (single binary)
- **License:** Open Source (MIT, free)
- **Cluster support:** No

---

## Other Tools in the Ecosystem

The following tools also work with ClickHouse. They may be a better fit for your specific situations and requirements. However we generally recommend the tools above.

| Tool | License | Consider for... | 
| :--- | :--- | :--- | 
| [Bytebase](https://www.bytebase.com/) | Open Core | For large organizations that need governance, approval workflows, and audit trails for multiple environments | 
| [Flyway](https://flywaydb.org/) | Open Source | Teams already standardized on Flyway or JVM-based infrastructure |
| [Liquibase](https://www.liquibase.org/) | Open Core | Teams that use Liquibase across multiple databases and want consistency| 
| [clickhouse-migrations](https://www.npmjs.com/package/clickhouse-migrations) | Open Source | Node/TypeScript teams wanting a simple, ClickHouse-focused runner | 
| [Houseplant](https://github.com/junehq/houseplant) | Open Source | Python teams wanting environment-aware, ClickHouse-specific tooling | 
| [Sqitch](https://sqitch.org/) | Open Source | Teams needing explicit dependency management across complex deployments. | 
| [Alembic](https://alembic.sqlalchemy.org/) (SQLAlchemy) | Open Source | Python shops already using SQLAlchemy for database access |
