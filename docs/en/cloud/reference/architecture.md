---
sidebar_label: Architecture
slug: /en/cloud/reference/architecture
---

# ClickHouse Cloud Architecture

![ClickHouse Cloud architecture](@site/docs/en/cloud/reference/images/architecture.svg)

## Storage backed by object store
- Virtually unlimited storage
- No need to manually shard data
- Significantly lower price point for storing data, especially data that is accessed less frequently

## Compute
- Automatic scaling and idling: No need to size up front, and no need to over-provision for peak use
- Automatic idling and resume: No need to have unused compute running while no one is using it
- Secure and HA by default

## Administration
- Setup, monitoring, backups, and billing are performed for you.
- Cost controls are enabled by default, and can be adjusted by you through the Cloud console.
