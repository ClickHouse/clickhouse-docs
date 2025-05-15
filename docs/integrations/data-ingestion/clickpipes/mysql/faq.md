---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about ClickPipes for MySQL.'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL FAQ'
---

# ClickPipes for MySQL FAQ

### Does the MySQL ClickPipe support MariaDB?  {#does-the-clickpipe-support-mariadb}
Yes, the MySQL ClickPipe supports MariaDB 10.0 and above. The configuration for it is very similar to MySQL, with the GTID behaviour being enabled by default.

### Does the MySQL ClickPipe support Planetscale, Vitess? {#does-the-clickpipe-support-planetscale-vitess}
Currently, we support only standard MySQL. Since PlanetScale is built on Vitess, integrating with Vitess's VStream API and handling VGtids (Vitess Global Transaction IDs) to track incremental changes is required. This differs from how CDC operates in native MySQL. Adding support for this functionality is being actively worked on.

### Why am I getting a TLS certificate validation error when connecting to MySQL? {#tls-certificate-validation-error}
If you see an error like `failed to verify certificate: x509: certificate is not valid for any names`, this occurs when the SSL/TLS certificate on your MySQL server doesn't include the connecting hostname (e.g., EC2 instance DNS name) in its list of valid names. ClickPipes enables TLS by default to provide secure encrypted connections.

To resolve this issue, you have three options:

1. Use the IP address instead of hostname in the connection settings, while leaving the "TLS Host (optional)" field empty. While this is the easiest solution, it's not the most secure as it bypasses hostname verification.

2. Set the "TLS Host (optional)" field to match the actual hostname that's in the certificate's Subject Alternative Name (SAN) field - this maintains proper verification.

3. Update your MySQL server's SSL certificate to include the actual hostname you're using to connect in its certificate.

This is a common configuration issue with MySQL TLS certificates, particularly when connecting to databases self-hosted in cloud environments where the public DNS name differs from what's in the certificate.
