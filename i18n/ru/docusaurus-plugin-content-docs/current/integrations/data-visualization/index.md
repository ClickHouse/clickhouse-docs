---
sidebar_label: 'Обзор'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Fabi.ai', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Databrain','Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', 'visualization', 'tool', 'lightdash']
title: 'Визуализация данных в ClickHouse'
slug: /integrations/data-visualization
description: 'Руководство по визуализации данных в ClickHouse'
doc_type: 'guide'
---



# Визуализация данных в ClickHouse

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

Теперь, когда ваши данные уже в ClickHouse, пришло время их анализировать, что часто включает построение визуализаций с помощью BI‑инструментов. Многие популярные BI‑ и инструменты визуализации умеют подключаться к ClickHouse. Некоторые работают с ClickHouse «из коробки», для других требуется установка коннектора. У нас есть документация по некоторым из этих инструментов, включая:

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



## Совместимость ClickHouse Cloud с инструментами визуализации данных {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| Инструмент                                                          | Поддержка через               | Протестирован | Документирован | Комментарий                                                                                                                             |
| ------------------------------------------------------------------- | ----------------------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Apache Superset](./superset-and-clickhouse.md)                     | Официальный коннектор ClickHouse | ✅     | ✅         |                                                                                                                                         |
| [Astrato](./community_integrations/astrato-and-clickhouse.md)       | Нативный коннектор              | ✅     | ✅         | Работает нативно с использованием pushdown SQL (только прямые запросы).                                                                                  |
| [AWS QuickSight](./quicksight-and-clickhouse.md)                    | Интерфейс MySQL               | ✅     | ✅         | Работает с некоторыми ограничениями, подробности см. в [документации](./quicksight-and-clickhouse.md)                                   |
| [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)   | Официальный коннектор ClickHouse | ✅     | ✅         |                                                                                                                                         |
| [Databrain](./community_integrations/databrain-and-clickhouse.md)   | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Deepnote](./community_integrations/deepnote.md)                    | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Dot](./community_integrations/dot-and-clickhouse.md)               | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Explo](./community_integrations/explo-and-clickhouse.md)           | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)          | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Grafana](./grafana/index.md)                                       | Официальный коннектор ClickHouse | ✅     | ✅         |                                                                                                                                         |
| [Hashboard](./community_integrations/hashboard-and-clickhouse.md)   | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Lightdash](./lightdash-and-clickhouse.md)                          | Нативный коннектор              | ✅     | ✅         |
|  |
| [Looker](./looker-and-clickhouse.md)                                | Нативный коннектор              | ✅     | ✅         | Работает с некоторыми ограничениями, подробности см. в [документации](./looker-and-clickhouse.md)                                       |
| Looker                                                              | Интерфейс MySQL               | 🚧     | ❌         |                                                                                                                                         |
| [Luzmo](./community_integrations/luzmo-and-clickhouse.md)           | Официальный коннектор ClickHouse | ✅     | ✅         |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)                  | Интерфейс MySQL               | ✅     | ✅         |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)                            | Официальный коннектор ClickHouse | ✅     | ✅         |
| [Mitzu](./community_integrations/mitzu-and-clickhouse.md)           | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                                    | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)                     | Официальный коннектор ClickHouse | ✅     | ✅         | Через ODBC, поддерживает режим прямых запросов                                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service)          | Официальный коннектор ClickHouse | ✅     | ✅         | Требуется настройка [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse) | Нативный коннектор              | ✅     | ✅         |
| [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)    | Нативный коннектор              | ✅     | ❌         |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)              | Официальный коннектор ClickHouse | ✅     | ✅         |                                                                                                                                         |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md)        | Интерфейс MySQL               | ✅     | ✅         | Работает с некоторыми ограничениями, подробности см. в [документации](./tableau/tableau-online-and-clickhouse.md)                       |
| [Zing Data](./community_integrations/zingdata-and-clickhouse.md)    | Нативный коннектор              | ✅     | ✅         |                                                                                                                                         |
