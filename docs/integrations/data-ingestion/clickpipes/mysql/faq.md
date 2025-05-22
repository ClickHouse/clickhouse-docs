---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about ClickPipes for MySQL.'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL FAQ'
---

# ClickPipes for MySQL FAQ

### Does the MySQL ClickPipe support MariaDB?  {#does-the-clickpipe-support-mariadb}
Yes, the MySQL ClickPipe supports MariaDB 10.0 and above. The configuration for it is very similar to MySQL, using GTID replication by default.

### Does the MySQL ClickPipe support PlanetScale, Vitess, TiDB? {#does-the-clickpipe-support-planetscale-vitess}
No, these do not support MySQL's binlog API.

### How is replication managed?
We support both GTID & FilePos replication. Unlike Postgres there is no slot to manage offset. Instead, you must configure your MySQL server to have a sufficient binlog retention period. If our offset into the binlog becomes invalidated (eg, mirror paused too long, or database failover occurs while using FilePos replication) then you will need to resync the pipe. Make sure to optimize materialized views depending on destination tables, as inefficient queries can slow down ingestion to fall behind the retention period.

It is also possible for an inactive database to rotate the log file without allowing ClickPipes to progress to a more recent offset. You may need to setup a heartbeat table with regularly scheduled updates.

### Why am I getting a TLS certificate validation error when connecting to MySQL? {#tls-certificate-validation-error}
If you see an error like `failed to verify certificate: x509: certificate is not valid for any names`, this occurs when the SSL/TLS certificate on your MySQL server doesn't include the connecting hostname (e.g., EC2 instance DNS name) in its list of valid names. ClickPipes enables TLS by default to provide secure encrypted connections.

To resolve this issue, you have three options:

1. Use the IP address instead of hostname in the connection settings, while leaving the "TLS Host (optional)" field empty. While this is the easiest solution, it's not the most secure as it bypasses hostname verification.

2. Set the "TLS Host (optional)" field to match the actual hostname that's in the certificate's Subject Alternative Name (SAN) field - this maintains proper verification.

3. Update your MySQL server's SSL certificate to include the actual hostname you're using to connect in its certificate.

This is a common configuration issue with MySQL TLS certificates, particularly when connecting to databases self-hosted in cloud environments (or when using AWS Private Link via Endpoint Service) where the public DNS name differs from what's in the certificate.
