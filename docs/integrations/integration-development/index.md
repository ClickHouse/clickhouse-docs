---
slug: /integrations/integration-development
title: 'Integration development'
sidebar_label: 'Overview'
sidebar_position: 1
description: 'Guides for building, testing, and documenting ClickHouse integrations.'
keywords: ['integration development', 'build integration', 'partner', 'integration partner']
doc_type: 'landing-page'
---

# Integration development

These guides orient you if you build a product that connects to ClickHouse. They cover the integration surface, how to validate your connector, and how to publish documentation on this site.

:::note[Partner portal]
A dedicated [partner portal](https://clickhouse.com/partners) is launching soon. Until then, use these pages to get started. [Sign up](https://clickhouse.com/partners) when the [partner portal](https://clickhouse.com/partners) is available to register your integration.
:::

## Guides {#guides}

Read them in this order:

| Guide | What it covers |
| ----- | -------------- |
| [Building integrations](/integrations/integration-development/building-integrations) | Ingestion and consumption paths, wire protocols, clients, and user-agent conventions |
| [Testing your integration](/integrations/integration-development/testing-your-integration) | Deployment modes, datasets, type coverage, and what to report before review |
| [Documenting your integration](/integrations/integration-development/documenting-your-integration) | Required doc sections, style rules, and a PR skeleton for your product page |

After you prototype and test, contribute your integration page under [`/docs/integrations/<category>/<your-integration>/`](/integrations/integration-development/documenting-your-integration) and open a pull request against [`clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs).
