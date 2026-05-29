---
sidebar_label: 'Easypanel'
slug: /integrations/easypanel
keywords: ['clickhouse', 'Easypanel', '배포', '통합', '설치']
description: '자체 서버에 ClickHouse를 배포하는 데 사용할 수 있습니다.'
title: 'Easypanel에서 ClickHouse 배포하기'
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

[Easypanel](https://easypanel.io)는 최신 서버 제어 패널입니다. 자체 서버에 ClickHouse를 배포하는 데 사용할 수 있습니다.

[![Easypanel에 배포](https://easypanel.io/img/deploy-on-easypanel-40.svg)](https://easypanel.io/docs/templates/clickhouse)

## 지침 \{#instructions\}

1. 클라우드 제공업체에서 Ubuntu를 실행하는 VM을 생성합니다.
2. 웹사이트의 지침에 따라 Easypanel을 설치합니다.
3. 새 프로젝트를 생성합니다.
4. 전용 템플릿을 사용해 ClickHouse를 설치합니다.