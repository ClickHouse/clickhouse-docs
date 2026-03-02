---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'Cloud IP 주소'
title: 'Cloud IP 주소'
description: '이 페이지에서는 ClickHouse 내 Cloud Endpoints API의 보안 기능을 설명합니다. 인증 및 인가 메커니즘을 통해 액세스를 관리함으로써 ClickHouse 배포를 안전하게 운영하는 방법을 자세히 다룹니다.'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '정적 IP 주소', 'Cloud Endpoints', 'API', '보안', 'egress IP 주소', '인그레스 IP 주소', '방화벽']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## 정적 IP API \{#static-ips-api\}

정적 IP 목록을 가져와야 하는 경우 다음 ClickHouse Cloud API 엔드포인트를 사용할 수 있습니다: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). 이 API는 인그레스/이그레스 IP 및 리전별, Cloud별 S3 엔드포인트 등 ClickHouse Cloud 서비스용 엔드포인트를 제공합니다.

MySQL 또는 PostgreSQL Engine과 같은 통합을 사용하는 경우 ClickHouse Cloud가 인스턴스에 접근할 수 있도록 허용해야 할 수 있습니다. 이 API를 사용하여 퍼블릭 IP를 조회한 뒤, GCP의 `firewalls` 또는 `Authorized networks`, Azure·AWS 또는 사용하는 기타 인프라 이그레스 관리 시스템의 `Security Groups`에 해당 IP를 설정할 수 있습니다.

예를 들어, AWS의 `ap-south-1` 리전에 호스팅된 ClickHouse Cloud 서비스에서의 접근을 허용하려면 해당 리전에 대한 `egress_ips` 주소를 추가하면 됩니다:

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

예를 들어, `us-east-2`에서 실행 중이며 ClickHouse Cloud 서비스에 연결해야 하는 AWS RDS 인스턴스에는 다음과 같은 Inbound 보안 그룹 규칙이 있어야 합니다:

<Image img={aws_rds_mysql} size="lg" alt="AWS 보안 그룹 규칙" border />

같은 `us-east-2`에서 실행 중인 동일한 ClickHouse Cloud 서비스에, 이번에는 GCP에서 실행 중인 MySQL에 연결하는 경우 `Authorized networks`는 다음과 같아야 합니다:

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
