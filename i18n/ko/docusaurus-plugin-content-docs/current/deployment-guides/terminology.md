---
slug: /architecture/introduction
sidebar_label: '소개'
title: '소개'
sidebar_position: 1
description: 'ClickHouse Support 및 Services 조직에서 ClickHouse 사용자에게 제공한 조언을 기반으로 한 배포 예시가 포함된 페이지입니다'
doc_type: 'guide'
keywords: ['배포', '아키텍처', '복제', '샤딩', '클러스터 설정']
---

import ReplicationShardingTerminology from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

이 섹션의 배포 예제는 ClickHouse 사용자에게 ClickHouse Support and Services 팀이 제공한 권장 사항을 기반으로 합니다.
이 예제들은 실제로 동작하는 구성이므로, 먼저 시도해 본 후 환경과 요구 사항에 맞게 조정해서 사용하기를 권장합니다.
여기에서 요구 사항에 정확히 부합하는 예제를 찾을 수도 있습니다.

[예제 리포지토리](https://github.com/ClickHouse/examples/tree/main/docker-compose-recipes/recipes)에서 다양한 토폴로지에 대한 「레시피」를 제공하므로,
이 섹션의 예제가 요구 사항에 정확히 맞지 않는 경우 해당 레시피들을 확인해 볼 것을 권장합니다.

<ReplicationShardingTerminology />

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/vBjCJtw_Ei0"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>
