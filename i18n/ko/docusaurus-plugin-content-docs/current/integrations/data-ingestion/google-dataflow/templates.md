---
sidebar_label: 'Templates'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: 'Google Dataflow Templates를 사용하여 데이터를 ClickHouse로 수집할 수 있습니다'
title: 'Google Dataflow Templates'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', 'data pipeline', 'templates', 'batch processing']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow 템플릿 \{#google-dataflow-templates\}

<ClickHouseSupportedBadge/>

Google Dataflow 템플릿은 미리 구축된 즉시 사용 가능한 데이터 파이프라인을 별도의 사용자 정의 코드를 작성하지 않고도 실행할 수 있게 해 주는 편리한 방법입니다. 이러한 템플릿은 일반적인 데이터 처리 작업을 단순화하도록 설계되었으며, [Apache Beam](https://beam.apache.org/)을 사용해 구축되고 `ClickHouseIO`와 같은 커넥터를 활용하여 ClickHouse 데이터베이스와 원활하게 통합되도록 합니다. 이러한 템플릿을 Google Dataflow에서 실행하면 최소한의 노력으로 고도로 확장 가능한 분산 데이터 처리를 구현할 수 있습니다.

## Dataflow 템플릿을 사용하는 이유 \{#why-use-dataflow-templates\}

- **사용 편의성**: Template은 특정 사용 사례에 맞게 사전 구성된 파이프라인을 제공하여 코드를 작성할 필요가 없습니다.
- **확장성**: Dataflow는 분산 처리를 통해 파이프라인이 자동으로 확장되어 대용량 데이터도 효율적으로 처리하도록 합니다.
- **비용 효율성**: 소비한 리소스에 대해서만 비용을 지불하고, 파이프라인 실행 비용을 최적화할 수 있습니다.

## Dataflow Template 실행 방법 \{#how-to-run-dataflow-templates\}

현재 ClickHouse 공식 Template은 Google Cloud Console, CLI 또는 Dataflow REST API에서 실행할 수 있습니다.
단계별 자세한 지침은 [Google Dataflow Run Pipeline From a Template Guide](https://cloud.google.com/dataflow/docs/templates/provided-templates)를 참조하십시오.

## ClickHouse Template 목록 \{#list-of-clickhouse-templates\}

* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (곧 제공될 예정입니다)
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (곧 제공될 예정입니다)