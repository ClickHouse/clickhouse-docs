---
sidebar_label: '개요'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Fabi.ai', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Databrain','Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'Querio', 'bi', 'visualization', 'tool', 'lightdash']
title: 'ClickHouse에서 데이터 시각화하기'
slug: /integrations/data-visualization
description: 'ClickHouse에서 데이터 시각화에 대해 알아봅니다'
doc_type: 'guide'
---

# ClickHouse에서 데이터 시각화하기 \{#visualizing-data-in-clickhouse\}

<div class='vimeo-container'>
<iframe
   src="https://player.vimeo.com/video/754460217?h=3dcae2e1ca"
   width="640"
   height="360"
   frameborder="0"
   allow="autoplay; fullscreen; picture-in-picture"
   allowfullscreen>
</iframe>
</div>

<br/>

이제 데이터가 ClickHouse에 저장되었으므로, BI 도구를 사용해 시각화를 만드는 작업을 포함하여 분석을 진행할 차례입니다. 많이 사용되는 BI 및 시각화 도구 대부분이 ClickHouse에 연결됩니다. 일부 도구는 별도 설정 없이 바로 ClickHouse에 연결되며, 다른 도구는 커넥터 설치가 필요합니다. 다음 도구에 대해서는 관련 문서를 제공합니다:

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./community_integrations/astrato-and-clickhouse.md)
- [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)
- [Databrain](./community_integrations/databrain-and-clickhouse.md)
- [Deepnote](./community_integrations/deepnote.md)
- [Dot](./community_integrations/dot-and-clickhouse.md)
- [Draxlr](./community_integrations/draxlr-and-clickhouse.md)
- [Embeddable](./community_integrations/embeddable-and-clickhouse.md)
- [Explo](./community_integrations/explo-and-clickhouse.md)
- [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)
- [Grafana](./grafana/index.md)
- [Lightdash](./lightdash-and-clickhouse.md)
- [Looker](./looker-and-clickhouse.md)
- [Luzmo](./community_integrations/luzmo-and-clickhouse.md)
- [Metabase](./metabase-and-clickhouse.md)
- [Mitzu](./community_integrations/mitzu-and-clickhouse.md)
- [Omni](./omni-and-clickhouse.md)
- [Querio](./community_integrations/querio-and-clickhouse.md)
- [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)
- [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)
- [Tableau](./tableau/tableau-and-clickhouse.md)
- [Zing Data](./community_integrations/zingdata-and-clickhouse.md)
- [Holistics BI](./community_integrations/holistics-and-clickhouse.md)

## 데이터 시각화 도구와 ClickHouse Cloud 호환성 \{#clickhouse-cloud-compatibility-with-data-visualization-tools\}

| 도구                                                                    | 지원 방식                 | 테스트 완료 | 문서화 완료 | 비고                                                                                                                                 |
|-------------------------------------------------------------------------|-------------------------------|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouse 공식 커넥터 | ✅      | ✅          |                                                                                                                                         |
| [Astrato](./community_integrations/astrato-and-clickhouse.md)      | 네이티브 커넥터 | ✅      | ✅          | 푸시다운 SQL을 사용하여 네이티브로 작동합니다(직접 쿼리만 지원). |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQL 인터페이스               | ✅      | ✅          | 일부 제한 사항이 있습니다. 자세한 내용은 [문서](./quicksight-and-clickhouse.md)를 참조하세요                |
| [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)           | ClickHouse 공식 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Databrain](./community_integrations/databrain-and-clickhouse.md)           | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Deepnote](./community_integrations/deepnote.md)                            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Dot](./community_integrations/dot-and-clickhouse.md)                            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Explo](./community_integrations/explo-and-clickhouse.md)                   | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)                  | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | ClickHouse 공식 커넥터 | ✅      | ✅          |                                                                                                                                         |
| [Hashboard](./community_integrations/hashboard-and-clickhouse.md)           | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Holistics](./community_integrations/holistics-and-clickhouse.md)           | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Lightdash](./lightdash-and-clickhouse.md)      | 네이티브 커넥터 | ✅      | ✅          | 
            |
| [Looker](./looker-and-clickhouse.md)                 | 네이티브 커넥터              | ✅      | ✅          | 일부 제한 사항이 있습니다. 자세한 내용은 [문서](./looker-and-clickhouse.md)를 참조하세요                    |
| Looker                                                                  | MySQL 인터페이스               | 🚧     | ❌          |                                                                                                                                         |
| [Luzmo](./community_integrations/luzmo-and-clickhouse.md)                   | ClickHouse 공식 커넥터 | ✅      | ✅          |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQL 인터페이스               | ✅      | ✅          |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouse 공식 커넥터 | ✅      | ✅          |
| [Mitzu](./community_integrations/mitzu-and-clickhouse.md)                   |  네이티브 커넥터 | ✅      | ✅          |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouse 공식 커넥터 | ✅      | ✅          | ODBC를 통해 직접 쿼리 모드를 지원합니다                                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service)                                                    | ClickHouse 공식 커넥터 | ✅    | ✅          | [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) 설정이 필요합니다 |
| [Querio](./community_integrations/querio-and-clickhouse.md)            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | 네이티브 커넥터              | ✅      | ✅          |
| [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)            | 네이티브 커넥터              | ✅      | ❌          |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouse 공식 커넥터 | ✅      | ✅          |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQL 인터페이스               | ✅      | ✅          | 일부 제한 사항이 있습니다. 자세한 내용은 [문서](./tableau/tableau-online-and-clickhouse.md)를 참조하세요            |
| [Zing Data](./community_integrations/zingdata-and-clickhouse.md)            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |