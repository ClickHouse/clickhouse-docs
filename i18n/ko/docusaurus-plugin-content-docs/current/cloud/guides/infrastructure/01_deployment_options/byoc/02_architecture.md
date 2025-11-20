---
'title': '아키텍처'
'slug': '/cloud/reference/byoc/architecture'
'sidebar_label': '아키텍처'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
'description': '자신의 클라우드 인프라에 ClickHouse 배포하기'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';

## Architecture {#architecture}

메트릭 및 로그는 고객의 BYOC VPC 내에 저장됩니다. 로그는 현재 로컬에서 EBS에 저장됩니다. 향후 업데이트에서는 로그가 고객의 BYOC VPC 내의 ClickHouse 서비스인 LogHouse에 저장될 예정입니다. 메트릭은 고객의 BYOC VPC 내에 로컬로 저장된 Prometheus 및 Thanos 스택을 통해 구현됩니다.

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />
