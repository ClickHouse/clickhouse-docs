---
slug: /manage/security/cloud-endpoints-api
sidebar_label: 'Облачные IP-адреса'
title: 'Облачные IP-адреса'
description: 'Эта страница документирует функции безопасности API Облачных конечных точек в ClickHouse. В ней подробно описан процесс обеспечения безопасности вашей реализации ClickHouse с управлением доступом через механизмы аутентификации и авторизации.'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## API статических IP-адресов {#static-ips-api}

Если вам необходимо получить список статических IP-адресов, вы можете использовать следующую конечную точку API ClickHouse Cloud: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). Этот API предоставляет конечные точки для служб ClickHouse Cloud, таких как входящие/исходящие IP-адреса и конечные точки S3 по регионам и облакам.

Если вы используете интеграцию, такую как движок MySQL или PostgreSQL, возможно, вам нужно авторизовать ClickHouse Cloud для доступа к вашим экземплярам. Вы можете использовать этот API для получения публичных IP-адресов и настройки их в `firewalls` или `Authorized networks` в GCP, или в `Security Groups` для Azure, AWS, или в любой другой системе управления исходящим трафиком, которую вы используете.

Например, чтобы разрешить доступ от службы ClickHouse Cloud, размещенной в AWS в регионе `ap-south-1`, вы можете добавить адреса `egress_ips` для этого региона:

```bash
❯ curl -s https://api.clickhouse.cloud/static-ips.json | jq '.'
{
  "aws": [
    {
      "egress_ips": [
        "3.110.39.68",
        "15.206.7.77",
        "3.6.83.17"
      ],
      "ingress_ips": [
        "15.206.78.111",
        "3.6.185.108",
        "43.204.6.248"
      ],
      "region": "ap-south-1",
      "s3_endpoints": "vpce-0a975c9130d07276d"
    },
...
```

Например, экземпляр AWS RDS, работающий в `us-east-2`, которому нужно подключиться к службе ClickHouse Cloud, должен иметь следующие правила для входящей группы безопасности:

<Image img={aws_rds_mysql} size="lg" alt="Правила группы безопасности AWS" border />

Для той же службы ClickHouse Cloud, работающей в `us-east-2`, но в этот раз подключенной к MySQL в GCP, `Authorized networks` должны выглядеть следующим образом:

<Image img={gcp_authorized_network} size="md" alt="Авторизованные сети GCP" border />
