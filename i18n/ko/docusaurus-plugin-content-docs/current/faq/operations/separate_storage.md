---
slug: /faq/operations/deploy-separate-storage-and-compute
title: '스토리지와 컴퓨트를 분리하여 ClickHouse를 배포할 수 있습니까?'
sidebar_label: '스토리지와 컴퓨트를 분리하여 ClickHouse를 배포할 수 있습니까?'
toc_hidden: true
toc_priority: 20
description: '이 페이지에서는 스토리지와 컴퓨트를 분리하여 ClickHouse를 배포할 수 있는지에 대한 답변을 제공합니다'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

짧은 답은 "예"입니다.

객체 스토리지(S3, GCS)는 ClickHouse 테이블 데이터의 탄력적인 기본 스토리지 백엔드로 사용할 수 있습니다. [S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) 및 [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) 가이드가 제공됩니다. 이 구성에서는 메타데이터만 컴퓨트 노드의 로컬에 저장됩니다. 추가 노드는 메타데이터만 복제하면 되므로, 이 구성에서는 컴퓨트 리소스를 손쉽게 확장하거나 축소할 수 있습니다.