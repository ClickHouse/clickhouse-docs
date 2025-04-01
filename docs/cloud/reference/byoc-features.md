## Features {#features}

### Supported features {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud and BYOC use the same binary and configuration. Therefore all features from ClickHouse core are supported in BYOC such as SharedMergeTree.
- **Console access for managing service state**:
  - Supports operations such as start, stop, and terminate.
  - View services and status.
- **Backup and restore.**
- **Manual vertical and horizontal scaling.**
- **Idling.**
- **Warehouses**: Compute-Compute Separation
- **Zero Trust Network via Tailscale.**
- **Monitoring**:
  - The Cloud console includes built-in health dashboards for monitoring service health.
  - Prometheus scraping for centralized monitoring with Prometheus, Grafana, and Datadog. See the [Prometheus documentation](/integrations/prometheus) for setup instructions.
- **VPC Peering.**
- **Integrations**: See the full list on [this page](/integrations).
- **Secure S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Planned features (currently unsupported) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) aka CMEK (customer-managed encryption keys)
- ClickPipes for ingest
- Autoscaling
- MySQL interface