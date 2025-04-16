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
