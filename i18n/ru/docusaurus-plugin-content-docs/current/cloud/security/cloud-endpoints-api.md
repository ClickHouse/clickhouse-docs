---
slug: /manage/security/cloud-endpoints-api
sidebar_label: 'Облачные IP-адреса'
title: 'Облачные IP-адреса'
description: 'Эта страница документирует функции безопасности API облачных конечных точек в ClickHouse. Она описывает, как обеспечить безопасность ваших развертываний ClickHouse, управляя доступом через механизмы аутентификации и авторизации.'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## API статических IP-адресов {#static-ips-api}

Если вам нужно получить список статических IP-адресов, вы можете использовать следующий конечный пункт API ClickHouse Cloud: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). Этот API предоставляет конечные точки для услуг ClickHouse Cloud, таких как входящие/исходящие IP-адреса и S3 конечные точки по регионам и облакам.

Если вы используете интеграцию, такую как MySQL или PostgreSQL Engine, возможно, вам потребуется авторизовать ClickHouse Cloud для доступа к вашим экземплярам. Вы можете использовать этот API для получения общественных IP-адресов и их настройки в `firewalls` или `Authorized networks` в GCP или в `Security Groups` для Azure, AWS, или в любой другой системе управления исходящим трафиком, которую вы используете.

Например, чтобы разрешить доступ из службы ClickHouse Cloud, размещенной на AWS в регионе `ap-south-1`, вы можете добавить адреса `egress_ips` для этого региона:

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

Например, экземпляр AWS RDS, работающий в `us-east-2`, который должен подключиться к службе ClickHouse Cloud, должен иметь следующие правила для группы безопасности на входящий трафик:

<Image img={aws_rds_mysql} size="lg" alt="Правила группы безопасности AWS" border />

Для той же службы ClickHouse Cloud, работающей в `us-east-2`, но на этот раз подключенной к MySQL в GCP, `Authorized networks` должны выглядеть следующим образом:

<Image img={gcp_authorized_network} size="md" alt="Авторизованные сети GCP" border />
