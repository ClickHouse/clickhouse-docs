---
slug: /use-cases/observability/clickstack/production
title: 'Going to Production'
sidebar_label: 'Production'
pagination_prev: null
pagination_next: null
description: 'Going to production with ClickStack'
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

When deploying ClickStack in production, there are several additional considerations to ensure security, stability, and correct configuration.

## Network and Port Security {#network-security}

By default, Docker Compose exposes ports on the host, making them accessible from outside the container - even if tools like `ufw` (Uncomplicated Firewall) are enabled. This behavior is due to the Docker networking stack, which can bypass host-level firewall rules unless explicitly configured.

**Recommendation:**

Only expose ports that are necessary for production use. Typically the OTLP endpoints, API server, and frontend.

For example, remove or comment out unnecessary port mappings in your `docker-compose.yml` file:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

Refer to the [Docker networking documentation](https://docs.docker.com/network/) for details on isolating containers and hardening access.

## Session Secret Configuration {#session-secret}

In production, you must set a strong, random value for the `EXPRESS_SESSION_SECRET` environment variable to protect session data and prevent tampering.

Here's how to add it to your `docker-compose.yml` file for the app service:

```yaml
  app:
    image: ${IMAGE_NAME_HDX}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
      HYPERDX_APP_PORT: ${HYPERDX_APP_PORT}
      HYPERDX_APP_URL: ${HYPERDX_APP_URL}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      MINER_API_URL: 'http://miner:5123'
      MONGO_URI: 'mongodb://db:27017/hyperdx'
      NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
      OTEL_SERVICE_NAME: 'hdx-oss-api'
      USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
      EXPRESS_SESSION_SECRET: "super-secure-random-string"
    networks:
      - internal
    depends_on:
      - ch-server
      - db1
```

You can generate a strong secret using openssl:

```bash
openssl rand -hex 32
```

Avoid committing secrets to source control. In production, consider using environment variable management tools (e.g. Docker Secrets, HashiCorp Vault, or environment-specific CI/CD configs).

## Secure ingestion {#secure-ingestion}

All ingestion should occur via the OTLP ports exposed by ClickStack distribution of the OpenTelemetry (OTel) collector. By default, this requires a secure ingestion API key generated at startup. This key is required when sending data to the OTel ports, and can be found in the HyperDX UI under `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Additionally, we recommend enabling TLS for OTLP endpoints and creating a [dedicated user for ClickHouse ingestion](#ingestion-user).

## ClickHouse {#clickhouse}

### ClickHouse Cloud {#clickhouse-cloud}

For production deployments, we recommend using [ClickHouse Cloud](https://clickhouse.com/cloud), which applies industry-standard [security practices](/cloud/security) by default - including [enhanced encryption](/cloud/security/cmek), [authentication and connectivity](/cloud/security/connectivity), and [managed access controls](/cloud/security/cloud-access-management).

### User Permissions {#user-permissions}

#### HyperDX user {#hyperdx-user}

The Clickhouse user for HyperDX only needs to be a `readonly` user with access to change the following settings:

- `max_rows_to_read` (at least up to 1 million)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

By default the `default` user in both OSS and ClickHouse Cloud will have these permissions available but we recommend you create a new user with these permissions.

#### Database and ingestion user {#database-ingestion-user}

We recommend creating a dedicated user for the OTel collector for ingestion into ClickHouse and ensuring ingestion is sent to a specific database e.g. `otel`. See ["Creating an ingestion user"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) for further details.

### Self-managed security {#self-managed-security}

If you are managing your own ClickHouse instance, it's essential to enable **SSL/TLS**, enforce authentication, and follow best practices for hardening access. See [this blog post](https://www.wiz.io/blog/clickhouse-and-wiz) for context on real-world misconfigurations and how to avoid them.

ClickHouse OSS provides robust security features out of the box. However, these require configuration:

- **Use SSL/TLS** via `tcp_port_secure` and `<openSSL>` in `config.xml`. See [guides/sre/configuring-ssl](/guides/sre/configuring-ssl).
- **Set a strong password** for the `default` user or disable it.
- **Avoid exposing ClickHouse externally** unless explicitly intended. By default, ClickHouse binds only to `localhost` unless `listen_host` is modified.
- **Use authentication methods** such as passwords, certificates, SSH keys, or [external authenticators](/operations/external-authenticators).
- **Restrict access** using IP filtering and the `HOST` clause. See [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Enable Role-Based Access Control (RBAC)** to grant granular privileges. See [operations/access-rights](/operations/access-rights).
- **Enforce quotas and limits** using [quotas](/operations/quotas), [settings profiles](/operations/settings/settings-profiles), and read-only modes.
- **Encrypt data at rest** and use secure external storage. See [operations/storing-data](/operations/storing-data) and [cloud/security/CMEK](/cloud/security/cmek).
- **Avoid hard coding credentials.** Use [named collections](/operations/named-collections) or IAM roles in ClickHouse Cloud.
- **Audit access and queries** using [system logs](/operations/system-tables/query_log) and [session logs](/operations/system-tables/session_log).

See also [external authenticators](/operations/external-authenticators) and [query complexity settings](/operations/settings/query-complexity) for managing users and ensuring query/resource limits.


## MongoDB Guidelines {#mongodb-guidelines}

Follow the official [MongoDB security checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/).
