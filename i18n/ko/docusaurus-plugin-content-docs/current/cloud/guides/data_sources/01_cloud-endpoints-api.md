---
'slug': '/manage/data-sources/cloud-endpoints-api'
'sidebar_label': '클라우드 IP 주소'
'title': '클라우드 IP 주소'
'description': '이 페이지는 ClickHouse 내의 Cloud Endpoints API 보안 기능을 문서화합니다. 인증 및 권한 부여
  메커니즘을 통해 ClickHouse 배포를 보호하는 방법에 대해 자세히 설명합니다.'
'doc_type': 'reference'
'keywords':
- 'ClickHouse Cloud'
- 'static IP addresses'
- 'cloud endpoints'
- 'API'
- 'security'
- 'egress IPs'
- 'ingress IPs'
- 'firewall'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API {#static-ips-api}

정적 IP 목록을 가져와야 하는 경우, 다음 ClickHouse Cloud API 엔드포인트를 사용하면 됩니다: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). 이 API는 인그레스/이그레스 IP 및 지역별 클라우드에 대한 S3 엔드포인트와 같은 ClickHouse Cloud 서비스의 엔드포인트를 제공합니다.

MySQL 또는 PostgreSQL 엔진과 같은 통합을 사용하는 경우, ClickHouse Cloud가 인스턴스에 접근할 수 있도록 인가해야 할 수도 있습니다. 이 API를 사용하여 공용 IP를 검색하고 GCP의 `firewalls` 또는 `Authorized networks`에서, 또는 Azure, AWS의 `Security Groups`와 같은 다른 인프라 이그레스 관리 시스템에서 구성할 수 있습니다.

예를 들어, `ap-south-1` 지역의 AWS에 호스팅된 ClickHouse Cloud 서비스에 접근을 허용하려면, 해당 지역의 `egress_ips` 주소를 추가할 수 있습니다:

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

예를 들어, `us-east-2`에서 실행 중인 AWS RDS 인스턴스가 ClickHouse Cloud 서비스에 연결되어야 하는 경우, 다음과 같은 인바운드 보안 그룹 규칙이 필요합니다:

<Image img={aws_rds_mysql} size="lg" alt="AWS Security group rules" border />

`us-east-2`에서 실행 중인 동일한 ClickHouse Cloud 서비스가 GCP의 MySQL에 연결되어 있는 경우, `Authorized networks`는 다음과 같아야 합니다:

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
