---
'sidebar_label': '템플릿'
'slug': '/integrations/google-dataflow/templates'
'sidebar_position': 3
'description': '사용자는 Google Dataflow 템플릿을 사용하여 ClickHouse에 데이터를 수집할 수 있습니다.'
'title': 'Google Dataflow 템플릿'
'doc_type': 'guide'
'keywords':
- 'google dataflow'
- 'gcp'
- 'data pipeline'
- 'templates'
- 'batch processing'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow 템플릿

<ClickHouseSupportedBadge/>

Google Dataflow 템플릿은 사용자 정의 코드를 작성할 필요 없이 미리 작성된, 바로 사용할 수 있는 데이터 파이프라인을 실행하는 편리한 방법을 제공합니다. 이러한 템플릿은 일반적인 데이터 처리 작업을 단순화하도록 설계되었으며, `ClickHouseIO`와 같은 커넥터를 활용하여 ClickHouse 데이터베이스와 원활하게 통합됩니다. Google Dataflow에서 이러한 템플릿을 실행함으로써 최소한의 노력으로 높은 확장성의 분산 데이터 처리를 달성할 수 있습니다.

## Dataflow 템플릿을 사용하는 이유는 무엇인가요? {#why-use-dataflow-templates}

- **사용 용이성**: 템플릿은 특정 사용 사례에 맞춘 사전 구성된 파이프라인을 제공하여 코딩의 필요성을 없앱니다.
- **확장성**: Dataflow는 파이프라인이 효율적으로 확장되도록 보장하여 대량의 데이터를 분산 처리합니다.
- **비용 효율성**: 소비한 리소스에 대해서만 비용을 지불하며, 파이프라인 실행 비용을 최적화할 수 있는 기능이 있습니다.

## Dataflow 템플릿 실행 방법 {#how-to-run-dataflow-templates}

오늘 날짜 기준으로 ClickHouse 공식 템플릿은 Google Cloud Console, CLI 또는 Dataflow REST API를 통해 사용할 수 있습니다. 자세한 단계별 지침은 [Google Dataflow 템플릿에서 파이프라인 실행 가이드](https://cloud.google.com/dataflow/docs/templates/provided-templates)를 참조하세요.

## ClickHouse 템플릿 목록 {#list-of-clickhouse-templates}
* [BigQuery To ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (곧 출시 예정!)
* [Pub Sub To ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (곧 출시 예정!)
