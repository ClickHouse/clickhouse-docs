---
'sidebar_label': '개요'
'sidebar_position': 1
'keywords':
- 'ClickHouse'
- 'connect'
- 'Luzmo'
- 'Explo'
- 'Fabi.ai'
- 'Tableau'
- 'Grafana'
- 'Metabase'
- 'Mitzu'
- 'superset'
- 'Databrain'
- 'Deepnote'
- 'Draxlr'
- 'RocketBI'
- 'Omni'
- 'bi'
- 'visualization'
- 'tool'
- 'lightdash'
'title': 'ClickHouse에서 데이터 시각화'
'slug': '/integrations/data-visualization'
'description': 'ClickHouse에서 데이터 시각화에 대해 배우기'
'doc_type': 'guide'
---


# ClickHouse에서 데이터 시각화하기

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

이제 데이터가 ClickHouse에 있으므로 분석할 시간입니다. 여기에는 BI 도구를 사용하여 시각화를 구축하는 것이 포함됩니다. 많은 인기 있는 BI 및 시각화 도구가 ClickHouse에 연결됩니다. 일부는 기본적으로 ClickHouse에 연결되며, 다른 일부는 커넥터를 설치해야 합니다. 다음은 몇 가지 도구에 대한 문서입니다:

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
- [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)
- [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)
- [Tableau](./tableau/tableau-and-clickhouse.md)
- [Zing Data](./community_integrations/zingdata-and-clickhouse.md)

## ClickHouse Cloud와 데이터 시각화 도구의 호환성 {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| 도구                                                                      | 지원 방식                     | 테스트 여부 | 문서화 여부 | 비고                                                                                                                                 |
|---------------------------------------------------------------------------|-------------------------------|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouse 공식 커넥터         | ✅      | ✅          |                                                                                                                                         |
| [Astrato](./community_integrations/astrato-and-clickhouse.md)      | 네이티브 커넥터              | ✅      | ✅          | 푸시다운 SQL(직접 쿼리 전용)을 사용하여 네이티브로 작동합니다. |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQL 인터페이스               | ✅      | ✅          | 일부 제한 사항이 있으며, 더 자세한 내용은 [문서](./quicksight-and-clickhouse.md)를 참조하세요.                |
| [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)           | ClickHouse 공식 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Databrain](./community_integrations/databrain-and-clickhouse.md)           | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Deepnote](./community_integrations/deepnote.md)                            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Dot](./community_integrations/dot-and-clickhouse.md)                            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Explo](./community_integrations/explo-and-clickhouse.md)                   | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)                  | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | ClickHouse 공식 커넥터         | ✅      | ✅          |                                                                                                                                         |
| [Hashboard](./community_integrations/hashboard-and-clickhouse.md)           | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Lightdash](./lightdash-and-clickhouse.md)      | 네이티브 커넥터              | ✅      | ✅          | 
            |
| [Looker](./looker-and-clickhouse.md)                 | 네이티브 커넥터              | ✅      | ✅          | 일부 제한 사항이 있으며, 더 자세한 내용은 [문서](./looker-and-clickhouse.md)를 참조하세요.                    |
| Looker                                                                  | MySQL 인터페이스               | 🚧     | ❌          |                                                                                                                                         |
| [Luzmo](./community_integrations/luzmo-and-clickhouse.md)                   | ClickHouse 공식 커넥터         | ✅      | ✅          |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQL 인터페이스               | ✅      | ✅          |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouse 공식 커넥터         | ✅      | ✅          |
| [Mitzu](./community_integrations/mitzu-and-clickhouse.md)                   | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouse 공식 커넥터         | ✅      | ✅          | ODBC를 통해 직접 쿼리 모드를 지원합니다.                                                                                                    |
| [Power BI 서비스](/integrations/powerbi#power-bi-service)                                                    | ClickHouse 공식 커넥터         | ✅    | ✅          | [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) 설정이 필요합니다. |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | 네이티브 커넥터              | ✅      | ✅          |
| [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)            | 네이티브 커넥터              | ✅      | ❌          |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouse 공식 커넥터         | ✅      | ✅          |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQL 인터페이스               | ✅      | ✅          | 일부 제한 사항이 있으며, 더 자세한 내용은 [문서](./tableau/tableau-online-and-clickhouse.md)를 참조하세요.            |
| [Zing Data](./community_integrations/zingdata-and-clickhouse.md)            | 네이티브 커넥터              | ✅      | ✅          |                                                                                                                                         |
