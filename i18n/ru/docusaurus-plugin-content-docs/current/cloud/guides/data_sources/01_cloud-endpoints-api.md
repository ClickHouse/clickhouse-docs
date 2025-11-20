---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'IP-адреса Cloud'
title: 'IP-адреса Cloud'
description: 'На этой странице описаны функции безопасности Cloud Endpoints API в ClickHouse. Здесь объясняется, как защитить развертывания ClickHouse, управляя доступом с помощью механизмов аутентификации и авторизации.'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'static IP addresses', 'cloud endpoints', 'API', 'security', 'egress IPs', 'ingress IPs', 'firewall']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';


## API статических IP-адресов {#static-ips-api}

Если вам необходимо получить список статических IP-адресов, вы можете использовать следующую конечную точку API ClickHouse Cloud: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). Этот API предоставляет конечные точки для сервисов ClickHouse Cloud, такие как IP-адреса входящего и исходящего трафика, а также конечные точки S3 для каждого региона и облачного провайдера.

Если вы используете интеграцию, такую как движок MySQL или PostgreSQL, возможно, вам потребуется авторизовать ClickHouse Cloud для доступа к вашим экземплярам. Вы можете использовать этот API для получения публичных IP-адресов и настройки их в `firewalls` или `Authorized networks` в GCP, либо в `Security Groups` для Azure, AWS или в любой другой системе управления исходящим трафиком инфраструктуры, которую вы используете.

Например, чтобы разрешить доступ от сервиса ClickHouse Cloud, размещенного на AWS в регионе `ap-south-1`, вы можете добавить адреса `egress_ips` для этого региона:

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

Например, экземпляр AWS RDS, работающий в регионе `us-east-2`, который должен подключаться к сервису ClickHouse Cloud, должен иметь следующие правила входящего трафика в группе безопасности:

<Image img={aws_rds_mysql} size='lg' alt='Правила группы безопасности AWS' border />

Для того же сервиса ClickHouse Cloud, работающего в регионе `us-east-2`, но на этот раз подключенного к MySQL в GCP, настройка `Authorized networks` должна выглядеть следующим образом:

<Image
  img={gcp_authorized_network}
  size='md'
  alt='Авторизованные сети GCP'
  border
/>
