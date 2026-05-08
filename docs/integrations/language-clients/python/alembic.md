---
sidebar_label: 'Alembic'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'alembic', 'migrations', 'sqlalchemy', 'schema']
description: 'Alembic database migration support for the ClickHouse SQLAlchemy dialect'
slug: /integrations/language-clients/python/alembic
title: 'Alembic migrations'
doc_type: 'guide'
---

# Alembic Migrations {#alembic}

ClickHouse Connect includes Alembic integration for the `clickhousedb` SQLAlchemy dialect. This lets you use standard Alembic workflows to manage ClickHouse schema changes. You can autogenerate revisions from model diffs, apply migrations with `alembic upgrade`, and roll back with `alembic downgrade`.

## Prerequisites {#prerequisites}

You need:

- A running ClickHouse server
- `clickhouse-connect`, `sqlalchemy`, and `alembic` installed
- An existing ClickHouse database (Alembic manages tables, not databases)

```bash
pip install clickhouse-connect[alembic]
```

This installs `sqlalchemy` and `alembic` at compatible versions.

## Setup {#setup}

After running `alembic init alembic`, two files need configuration.

### alembic.ini {#alembic-ini}

Set the connection URL:

```ini
sqlalchemy.url = clickhousedb://default:@localhost:8123/mydb
```

This uses the same `clickhousedb://` URL scheme as the [SQLAlchemy dialect](sqlalchemy.md#sqlalchemy-connect).

### env.py {#env-py}

Replace the generated `alembic/env.py` with a ClickHouse-aware version. The key additions are importing the `clickhouse_connect.cc_sqlalchemy.alembic` module and wiring up its helpers:

```python
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from clickhouse_connect.cc_sqlalchemy import alembic as ch_alembic
from models import metadata  # your models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_server_default=True,
        include_object=ch_alembic.include_object,
        dialect_name="clickhousedb",
        version_table="alembic_version",
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        default_schema = connection.exec_driver_sql(
            "SELECT currentDatabase()"
        ).scalar()
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            include_name=ch_alembic.make_include_name(
                include_schemas=frozenset({default_schema}),
                default_schema=default_schema,
            ),
            compare_server_default=True,
            include_object=ch_alembic.include_object,
            process_revision_directives=ch_alembic.clickhouse_writer,
            version_table="alembic_version",
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

The helpers used here:

| Helper                   | Purpose                                                                                                                          |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `include_object`         | Filters out the `alembic_version` table, `system` schema tables, and internal materialized view storage tables from autogenerate |
| `make_include_name(...)` | Limits autogenerate to the specified database(s), preventing cross-database noise                                                |
| `clickhouse_writer`      | Ensures generated revision files include the required ClickHouse imports (`cc_sqlalchemy` types and engines)                     |

## Autogenerate workflow {#autogenerate}

The day-to-day loop is standard Alembic:

1. Define or edit your models
2. Run `alembic revision --autogenerate -m "describe change"`
3. Review the generated migration file
4. Run `alembic upgrade head`
5. If needed, roll back with `alembic downgrade -1`

### Example model {#example-model}

```python
from sqlalchemy import Column, MetaData, Table, text

from clickhouse_connect.cc_sqlalchemy import engines, types

metadata = MetaData()

events = Table(
    "events",
    metadata,
    Column("id", types.UInt32(), nullable=False),
    Column("event_name", types.String(), nullable=False),
    Column("payload", types.String(), nullable=True, server_default=text("'{}'")),
    Column("created_at", types.DateTime64(3, "UTC"), server_default=text("now64(3)")),
    engines.MergeTree(order_by="id"),
)
```

Running `alembic revision --autogenerate` against an empty database will detect the `events` table and generate a `create_table` operation with the correct ClickHouse types and engine.

## Supported autogenerate operations {#supported-operations}

The following operations are detected by `revision --autogenerate` and applied by `upgrade`/`downgrade`:

- Create and drop tables (including ClickHouse engine preservation)
- Create and drop dictionaries
- Add, alter, drop, and rename columns
- Alter column type, nullability, default, and comment
- Downgrade support for dropped tables and dictionaries

ClickHouse-specific features preserved through autogenerate:

- Positional table engines (`MergeTree(order_by=...)`, `ReplacingMergeTree(version=...)`, etc.)
- Engine settings (`settings={"index_granularity": 1024}`)
- Dictionary `SOURCE`, `LAYOUT`, `LIFETIME`, and `PRIMARY KEY`
- `TextClause` expressions in `partition_by`, `order_by`, and `ttl`
- Column `DEFAULT` and `COMMENT`

## Manual migration operations {#manual-operations}

Autogenerate handles common cases, but you can also write migration operations by hand. This is useful for ClickHouse-specific features like column placement and per-operation settings.

### Add a column {#add-column}

```python
from alembic import op
from sqlalchemy import Column, text
from clickhouse_connect.cc_sqlalchemy import types

op.add_column(
    "events",
    Column(
        "payload",
        types.String(),
        server_default=text("'{}'"),
        clickhouse_after="id",
    ),
    schema="analytics",
    if_not_exists=True,
    clickhouse_settings={"alter_sync": 2},
)
```

| Parameter             | Description                                                                |
|-----------------------|----------------------------------------------------------------------------|
| `clickhouse_after`    | Column keyword. Places the new column after the specified existing column. |
| `if_not_exists`       | Adds an `IF NOT EXISTS` guard to the DDL.                                  |
| `clickhouse_settings` | ClickHouse settings applied to this `ALTER TABLE` statement.               |

### Alter a column {#alter-column}

```python
op.alter_column(
    "events",
    "payload",
    schema="analytics",
    existing_type=types.String(),
    server_default=text("'[]'"),
    clickhouse_settings={"alter_sync": 2},
)
```

Column type, nullability, default, comment, and name can all be altered. Renaming a column and modifying its type in the same operation is supported. `existing_type` is required when modifying type, nullability, or default.

### Drop a column {#drop-column}

```python
op.drop_column(
    "events",
    "payload",
    schema="analytics",
    if_exists=True,
)
```

### Raw DDL {#raw-ddl}

For DDL that Alembic does not model, use `op.execute(...)` directly:

```python
op.execute("CREATE MATERIALIZED VIEW ...")
```

This is typical for materialized views, engine rewrites, data-skipping indexes, and codec/TTL changes on existing columns.

## Advanced env.py configuration {#advanced-configuration}

### Excluding tables and materialized views {#excluding-tables}

`make_include_object` provides finer-grained control than the default `include_object`:

```python
from clickhouse_connect.cc_sqlalchemy import alembic as ch_alembic

context.configure(
    # ...
    include_object=ch_alembic.make_include_object(
        exclude_tables=frozenset({"legacy_events", "analytics.tmp_staging"}),
        include_schemas=frozenset({"mydb"}),
        exclude_mv_pattern="_mv",
    ),
)
```

| Parameter                | Type           | Default | Description                                                                          |
|--------------------------|----------------|---------|--------------------------------------------------------------------------------------|
| `exclude_tables`         | frozenset[str] | None    | Table names to skip. Supports both bare names and `schema.table` qualified names.    |
| `include_schemas`        | frozenset[str] | None    | Only include tables in these schemas.                                                |
| `exclude_mv_pattern`     | str            | `"_mv"` | Tables whose names end with this suffix are excluded (materialized view convention). |
| `base_include_object_fn` | callable       | None    | Chain with your own filter function. It runs first.                                  |

### Preventing empty migrations {#preventing-empty-migrations}

Wrap `clickhouse_writer` with `prevent_empty_migrations` to skip generating revision files when autogenerate detects no changes:

```python
context.configure(
    # ...
    process_revision_directives=ch_alembic.prevent_empty_migrations(
        ch_alembic.clickhouse_writer
    ),
)
```

## Version table {#version-table}

Alembic tracks the current revision in a `alembic_version` table. The ClickHouse integration creates this as a `MergeTree` table ordered by `version_num`. Upgrades and downgrades use insert-then-delete semantics with `mutations_sync = 2` to ensure consistency, since ClickHouse does not support transactional `UPDATE`.

## What needs op.execute {#what-needs-execute}

The following ClickHouse features are not currently supported through autogenerate or built-in operations and should be handled with `op.execute(...)`:

- Engine rewrites on existing tables (ClickHouse itself has no `ALTER TABLE ... ENGINE` syntax)
- Codec, TTL, materialized, or alias changes on existing columns
- Materialized views
- Data-skipping and secondary index DDL

## Migrating from clickhouse_sqlalchemy {#migrating}

If you have an existing Alembic setup using `clickhouse_sqlalchemy`, here is what needs to change.

### Imports and URL {#migration-imports}

| Old                                                       | New                                                                  |
|-----------------------------------------------------------|----------------------------------------------------------------------|
| `from clickhouse_sqlalchemy import engines, types`        | `from clickhouse_connect.cc_sqlalchemy import engines, types`        |
| `from clickhouse_sqlalchemy import alembic as ch_alembic` | `from clickhouse_connect.cc_sqlalchemy import alembic as ch_alembic` |
| `from clickhouse_sqlalchemy import Table`                 | `from sqlalchemy import Table`                                       |
| Dialect URL `clickhouse://...`                            | `clickhousedb://...`                                                 |

`ReplacingMergeTree` accepts both the new `version=` keyword and the legacy `ver=` alias. All engine parameters (`order_by`, `partition_by`, `ttl`, `settings`, etc.), `text()` expressions, and the `clickhouse_writer`/`include_object`/`make_include_name` helpers have the same API.

### Template and helpers {#migration-template}

If you have a custom `script.py.mako` from `clickhouse_sqlalchemy`, you can delete it. The standard Alembic template works because `clickhouse_writer` injects the ClickHouse imports automatically.

`patch_alembic_version` is now a no-op. You can remove it from your `env.py` when convenient.

### Existing migration files {#migration-existing-files}

If your existing revision files have `from clickhouse_sqlalchemy ...` imports that were injected by the old writer, you have two options:

- Update the imports in each revision file to point to `clickhouse_connect.cc_sqlalchemy`.
- Keep `clickhouse_sqlalchemy` installed alongside `clickhouse-connect` until those old migrations are archived.

New revisions generated after the switch will get the correct imports automatically.
