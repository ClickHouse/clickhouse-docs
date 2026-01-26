---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'Облачные IP-адреса'
title: 'Облачные IP-адреса'
description: 'На этой странице описаны функции безопасности API Cloud Endpoints в ClickHouse. Здесь подробно рассматривается, как защитить развертывания ClickHouse, управляя доступом с помощью механизмов аутентификации и авторизации.'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'статические IP-адреса', 'облачные конечные точки', 'API', 'безопасность', 'исходящие IP-адреса', 'входящие IP-адреса', 'межсетевой экран']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## API статических IP-адресов \{#static-ips-api\}

Если вам нужно получить список статических IP-адресов, вы можете использовать следующий API-эндпоинт ClickHouse Cloud: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). Этот API предоставляет эндпоинты для сервисов ClickHouse Cloud, такие как ingress/egress IP-адреса и S3-эндпоинты по каждому региону и облаку.

Если вы используете интеграцию, такую как MySQL или PostgreSQL Engine, возможно, вам потребуется авторизовать ClickHouse Cloud для доступа к вашим экземплярам. Вы можете использовать этот API, чтобы получить публичные IP-адреса и указать их в `firewalls` или `Authorized networks` в GCP, либо в `Security Groups` для Azure, AWS или любой другой используемой вами системе управления исходящим трафиком.

Например, чтобы разрешить доступ от сервиса ClickHouse Cloud, размещённого в AWS в регионе `ap-south-1`, вы можете добавить адреса `egress_ips` для этого региона:

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

Например, экземпляр AWS RDS, запущенный в `us-east-2`, которому необходимо подключиться к облачному сервису ClickHouse, должен иметь следующие правила входящего трафика в группе безопасности:

<Image img={aws_rds_mysql} size="lg" alt="Правила группы безопасности AWS" border />

Для того же сервиса ClickHouse Cloud, запущенного в `us-east-2`, но на этот раз подключённого к MySQL в GCP, раздел `Authorized networks` должен выглядеть следующим образом:

<Image img={gcp_authorized_network} size="md" alt="Разрешённые сети GCP" border />
