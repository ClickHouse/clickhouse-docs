---
slug: /use-cases/observability/clickstack/deployment/oss
title: 'Open Source Deployment Options'
pagination_prev: null
pagination_next: null
description: 'Deploying Open Source ClickStack - The ClickHouse Observability Stack'
doc_type: 'reference'
keywords: ['ClickStack', 'observability', 'Open Source']
---

Open Source ClickStack provides multiple deployment options to suit various use cases.

Each of the deployment options are summarized below. The [Open Source Getting Started Guide](/use-cases/observability/clickstack/getting-started/oss) specifically demonstrates options 1, included here for completeness.

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | Single Docker container with all ClickStack components bundled.                                                      | Non-production deployments, demos, proof of concepts                                                                        | Not recommended for production                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | Official Helm chart for Kubernetes-based deployments. Supports ClickHouse Cloud and production scaling.             | Production deployments on Kubernetes                                                                   | Kubernetes knowledge required, customization via Helm                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | Deploy each ClickStack component individually via Docker Compose.                                                    | Local testing, proof of concepts, production on single server, BYO ClickHouse                                       | No fault tolerance, requires managing multiple containers                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | Use HyperDX independently with your own ClickHouse and schema.                                                       | Existing ClickHouse users, custom event pipelines                                                       | No ClickHouse included, user must manage ingestion and schema                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | Runs entirely in the browser with local storage. No backend or persistence.                                          | Demos, debugging, dev with HyperDX                                                                     | No auth, no persistence, no alerting, single-user only                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |
