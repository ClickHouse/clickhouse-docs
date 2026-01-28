---
title: 'Развертывание дополнительной инфраструктуры'
slug: /cloud/reference/byoc/onboarding/new_region
sidebar_label: 'Дополнительная инфраструктура'
keywords: ['BYOC', 'облако', 'использование собственного облака', 'онбординг', 'дополнительная инфраструктура', 'многорегиональная', 'мультиаккаунт']
description: 'Развертывание дополнительной инфраструктуры BYOC в новых регионах или учетных записях'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_new_infra_1 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'
import byoc_new_infra_2 from '@site/static/images/cloud/reference/byoc-new-infra-2.png'
import byoc_new_infra_3 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'

После завершения первоначального онбординга вы можете развернуть дополнительную инфраструктуру BYOC в другом регионе, в другой учётной записи AWS или проекте GCP.

Чтобы добавить новое развертывание BYOC:

<VerticalStepper headerLevel="list">
  1. Перейдите на страницу &quot;Infrastructure&quot; вашей организации в консоли ClickHouse Cloud.

  <Image img={byoc_new_infra_1} size="lg" alt="Страница инфраструктуры BYOC" />

  2. Выберите &quot;Add new account&quot; или &quot;Add new infrastructure&quot; и следуйте указаниям мастера настройки, чтобы завершить процесс.

  <Image img={byoc_new_infra_2} size="lg" alt="Страница инфраструктуры BYOC" />
</VerticalStepper>
