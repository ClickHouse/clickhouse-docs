---
title: 'Setup new BYOC infrastructure'
slug: /cloud/reference/byoc/onboarding/new_region
sidebar_label: 'New BYOC Setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding', 'new region']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_new_infra_1 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'
import byoc_new_infra_2 from '@site/static/images/cloud/reference/byoc-new-infra-2.png'
import byoc_new_infra_3 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'

After completing the initial onboarding, you may wish to deploy additional BYOC infrastructure in a different region or in another AWS account or GCP project.

To add a new BYOC deployment:

1. Navigate to your organization's "Infrastructure" page in the ClickHouse Cloud console.

<Image img={byoc_new_infra_1} size="lg" alt="BYOC infra page" background='black'/>

2. Select "Add new account" or "Add new infrastructure" and follow the guided interface to complete the setup process.

<Image img={byoc_new_infra_2} size="lg" alt="BYOC infra page" background='black'/>