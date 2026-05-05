---
title: '추가 인프라 배포'
slug: /cloud/reference/byoc/onboarding/new_region
sidebar_label: '추가 인프라'
keywords: ['BYOC', '클라우드', 'bring your own cloud', '온보딩', '추가 인프라', '멀티 리전', '멀티 계정']
description: '새로운 리전이나 계정에 추가 BYOC 인프라를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_new_infra_1 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'
import byoc_new_infra_2 from '@site/static/images/cloud/reference/byoc-new-infra-2.png'
import byoc_new_infra_3 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'

초기 온보딩 절차를 완료한 후에는 다른 리전이나 다른 AWS 계정, 또는 GCP 프로젝트에 추가 BYOC 인프라를 배포해야 할 수도 있습니다.

새로운 BYOC 배포를 추가하려면:

<VerticalStepper headerLevel="list">
  1. ClickHouse Cloud 콘솔에서 조직의 「Infrastructure」 페이지로 이동합니다.

  <Image img={byoc_new_infra_1} size="lg" alt="BYOC 인프라 페이지" />

  2. 「Add new account」 또는 「Add new infrastructure」를 선택하고 안내에 따라 설정 과정을 완료합니다.

  <Image img={byoc_new_infra_2} size="lg" alt="BYOC 인프라 페이지" />
</VerticalStepper>
