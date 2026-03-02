---
slug: /use-cases/observability/clickstack/admin
title: 'ClickStack - 관리'
sidebar_label: '관리'
description: 'ClickStack에서 기본적인 관리 작업을 수행하는 방법입니다.'
doc_type: 'guide'
keywords: ['clickstack', 'admin']
---

ClickStack의 대부분의 관리 작업은 그 기반이 되는 ClickHouse 데이터베이스에서 직접 수행됩니다. ClickStack을 배포하는 사용자는 ClickHouse 개념과 기본적인 관리 작업에 익숙해야 합니다.

관리 작업은 일반적으로 DDL SQL 문 실행을 포함합니다. 사용 가능한 옵션은 Managed ClickStack을 사용하는지, ClickStack Open Source를 사용하는지에 따라 달라집니다.

## ClickStack 오픈 소스 \{#clickstack-oss\}

ClickStack 오픈 소스를 배포하는 환경에서는 [ClickHouse client](/interfaces/cli)를 사용하여 관리 작업을 수행합니다. 이 클라이언트는 네이티브 ClickHouse 프로토콜을 통해 데이터베이스에 연결하며, 전체 DDL 및 관리 작업을 지원할 뿐만 아니라 쿼리에 대한 대화형 피드백도 제공합니다.

## Managed ClickStack \{#clickstack-managed\}

Managed ClickStack에서는 ClickHouse 클라이언트와 [SQL Console](/cloud/get-started/sql-console)을 모두 사용할 수 있습니다. 클라이언트로 연결하려면 [서비스용 자격 증명](/cloud/guides/sql-console/gather-connection-details)을 확보해야 합니다.

[SQL Console](/cloud/get-started/sql-console)은 SQL 자동 완성, 쿼리 기록, 결과 시각화를 위한 내장 차트 기능 등 추가적인 편의 기능을 제공하는 웹 기반 인터페이스입니다.