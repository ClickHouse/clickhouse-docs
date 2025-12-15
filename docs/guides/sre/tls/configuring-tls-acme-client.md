---
slug: /guides/sre/configuring-tls-acme-client
sidebar_label: 'Configuring ACME client'
sidebar_position: 20
title: 'Configuring ACME client'
description: 'This guide provides simple and minimal settings to configure ClickHouse to use OpenSSL certificates to validate connections.'
keywords: ['ACME configuration', 'TLS setup', 'OpenSSL certificates', 'secure connections', 'SRE guide', 'Let`s Encrypt']
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

# Configuring ACME client

<SelfManaged />

This guide provides describes how to configure ClickHouse to use ACME (RFC8555) protocol to automatically update TLS certificates.

# Overview

ACME protocol defines automatic certificate update process with services like Let's Encrypt or ZeroSSL. In short, certificate requester needs to confirm domain ownership via predefined challenge types in order to get a certificate.

Here is a configuration sample which may be used to enable ACME protocol in ClickHouse server:

```yaml
    <http_port>80</http_port>
    <https_port>443</https_port>

    <acme>
        <email>valid_email@example.com</email>
        <terms_of_service_agreed>true</terms_of_service_agreed>
        <domains>
            <domain>example.com</domain>
        </domains>
    </acme>
```

First, we need to enable HTTP and HTTPS ports; former will be used during ACME challenge (current implementation supports only HTTP-01 challenge types), and the latter is for serving HTTPS traffic when certificate issuing process is complete.
HTTP port should not necessarily be configured to `80`, you may want to remap it with other ways, like `nftables`. Consult your ACME provider documentation for accepted ports for HTTP-01 challenge.

In the `acme` block, we're defining `email` for account creation, and accepting ACME service terms of service.
After that, the only thing we need is a list of domains.

# Configuration parameters

Configuration options available in `acme` section:

| Parameter                             | Default value | Description |
|--------------------------------------|---------------|-------------|
| `zookeeper_path`                     | `/clickhouse/acme`   | ZooKeeper path used to store ACME account data, certificates, and coordination state between ClickHouse nodes. |
| `directory_url`                     | `https://acme-v02.api.letsencrypt.org/directory` | ACME directory endpoint used for certificate issuance. Defaults to the Let’s Encrypt production server. |
| `email`                              | —             | Email address used to create and manage the ACME account. ACME providers may use it for expiration notices and important updates. |
| `terms_of_service_agreed`            | `false`       | Indicates whether the ACME provider’s Terms of Service are accepted. Must be set to `true` to enable ACME. |
| `domains`                            | —             | List of domain names for which TLS certificates should be issued. Each domain is specified as a `<domain>` entry. |
| `refresh_certificates_before`        | `2592000` (one month, in seconds)         | Time before certificate expiration when ClickHouse will attempt to renew the certificate. |
| `refresh_certificates_task_interval` | `3600000` (one hour, in milliseconds)          | Interval at which ClickHouse checks whether certificates need renewal. |

Note that configuration uses Let's Encrypt production directory by default. To avoid hitting request quota due to probable misconfiguration, it is recommended to test certificate issuing process with [staging directory](https://letsencrypt.org/docs/staging-environment/) first.

# Administration

## Initial deployment {#initial-deployment}

When enabling the ACME client on a cluster with multiple replicas, additional care is required during the initial certificate issuance.

The first replica that starts with ACME enabled will immediately attempt to create an ACME order and perform HTTP-01 challenge validation. If only a subset of replicas is serving traffic at that moment, the challenge is likely to fail, as other replicas will not be able to respond to validation requests.

If possible, it is recommended to temporarily route traffic to a single replica (for example, by adjusting DNS records) and allow it to complete the initial certificate issuance. Once the certificate is successfully issued and stored in Keeper, ACME can be enabled on the remaining replicas. They will automatically reuse the existing certificate and participate in future renewals.

If routing traffic to a single replica is not feasible, an alternative approach is to manually upload the existing certificate and private key into Keeper before enabling the ACME client. This avoids the initial validation step and allows all replicas to start with a valid certificate already present.

After the initial certificate has been issued or imported, certificate renewal does not require special handling, as all replicas will already be running the ACME client and sharing state through Keeper.

## Keeper data structure {#keeper-data-structure}

```
/clickhouse/acme
└── <acme-directory-host>
    ├── account_private_key          # ACME account private key (PEM)
    ├── challenges                   # Active HTTP-01 challenge state
    └── domains
        └── <domain-name>
            ├── certificate          # Issued TLS certificate (PEM)
            └── private_key          # Domain private key (PEM)
```

## Migrating from other ACME clients {#migrating-from-other-acme-clients}

It is possible to migrate current TLS certificate and key to Keeper for easier migration.
At the moment, server supports only RSA2048 keys.

Assuming we're migrating from `certbot` and using `/etc/letsencrypt/live` directory, one may use the following set of commands:

```bash
DOMAIN=example.com
CERT_DIR=/etc/letsencrypt/live/$DOMAIN
ZK_BASE=/clickhouse/acme/acme-v02.api.letsencrypt.org/domains/$DOMAIN

clickhouse keeper-client -q "create '/clickhouse' ''"
clickhouse keeper-client -q "create '/clickhouse/acme' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org/domains' ''"
clickhouse keeper-client -q "create '$ZK_BASE' ''"

clickhouse keeper-client -q "create '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""

clickhouse keeper-client -q "create '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
```
