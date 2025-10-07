---
slug: '/integrations/data-visualization'
sidebar_label: Обзор
sidebar_position: 1
description: 'Узнайте о визуализации данных в ClickHouse'
title: 'Визуализация данных в ClickHouse'
keywords: ['ClickHouse', 'подключить', 'Luzmo', 'Explo', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', 'визуализация', 'инструмент']
doc_type: guide
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

Теперь, когда ваши данные находятся в ClickHouse, время проанализировать их, что часто включает в себя создание визуализаций с помощью инструментария BI. Многие популярные инструменты BI и визуализации подключаются к ClickHouse. Некоторые подключаются к ClickHouse из коробки, в то время как другим требуется установка коннектора. У нас есть документация для некоторых инструментов, включая:

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./astrato-and-clickhouse.md)
- [Chartbrew](./chartbrew-and-clickhouse.md)
- [Deepnote](./deepnote.md)
- [Draxlr](./draxlr-and-clickhouse.md)
- [Embeddable](./embeddable-and-clickhouse.md)
- [Explo](./explo-and-clickhouse.md)
- [Fabi.ai](./fabi-and-clickhouse.md)
- [Grafana](./grafana/index.md)
- [Looker](./looker-and-clickhouse.md)
- [Luzmo](./luzmo-and-clickhouse.md)
- [Metabase](./metabase-and-clickhouse.md)
- [Mitzu](./mitzu-and-clickhouse.md)
- [Omni](./omni-and-clickhouse.md)
- [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)
- [Rocket BI](./rocketbi-and-clickhouse.md)
- [Tableau](./tableau/tableau-and-clickhouse.md)
- [Zing Data](./zingdata-and-clickhouse.md)

## Совместимость ClickHouse Cloud с инструментами визуализации данных {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| Инструмент                                                                  | Поддерживается через                     | Протестировано | Документировано | Комментарий                                                                                                                                 |
|---------------------------------------------------------------------------|-----------------------------------------|----------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | Официальный коннектор ClickHouse | ✅              | ✅                |                                                                                                                                             |
| [Astrato](./astrato-and-clickhouse.md)      | Нативный коннектор                      | ✅              | ✅                | Работает нативно с использованием SQL pushdown (только прямой запрос). |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | Интерфейс MySQL                        | ✅              | ✅                | Работает с некоторыми ограничениями, смотрите [документацию](./quicksight-and-clickhouse.md) для получения дополнительных сведений                |
| [Chartbrew](./chartbrew-and-clickhouse.md)           | Официальный коннектор ClickHouse | ✅              | ✅                |                                                                                                                                             |
| [Deepnote](./deepnote.md)                            | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |
| [Explo](./explo-and-clickhouse.md)                   | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |
| [Fabi.ai](./fabi-and-clickhouse.md)                  | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |
| [Grafana](./grafana/index.md)                        | Официальный коннектор ClickHouse | ✅              | ✅                |                                                                                                                                             |
| [Hashboard](./hashboard-and-clickhouse.md)           | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |
| [Looker](./looker-and-clickhouse.md)                 | Нативный коннектор                      | ✅              | ✅                | Работает с некоторыми ограничениями, смотрите [документацию](./looker-and-clickhouse.md) для получения дополнительных сведений                    |
| Looker                                                                  | Интерфейс MySQL                        | 🚧              | ❌                |                                                                                                                                             |
| [Luzmo](./luzmo-and-clickhouse.md)                   | Официальный коннектор ClickHouse | ✅              | ✅                |                                                                                                                                             |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | Интерфейс MySQL                        | ✅              | ✅                |                                                                                                                                             |
| [Metabase](./metabase-and-clickhouse.md)             | Официальный коннектор ClickHouse | ✅              | ✅                |                                                                                                                                                |
| [Mitzu](./mitzu-and-clickhouse.md)                   | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |
| [Omni](./omni-and-clickhouse.md)                     | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | Официальный коннектор ClickHouse | ✅              | ✅                | Через ODBC, поддерживает режим прямого запроса                                                                                              |
| [Power BI service](/integrations/powerbi#power-bi-service)                                                    | Официальный коннектор ClickHouse | ✅              | ✅                | Требуется настройка [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | Нативный коннектор                      | ✅              | ✅                |        
| [Rocket BI](./rocketbi-and-clickhouse.md)            | Нативный коннектор                      | ✅              | ❌                |                                                                                                                                             |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | Официальный коннектор ClickHouse | ✅              | ✅                |                                                                                                                                                |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | Интерфейс MySQL                        | ✅              | ✅                | Работает с некоторыми ограничениями, смотрите [документацию](./tableau/tableau-online-and-clickhouse.md) для получения дополнительных сведений            |
| [Zing Data](./zingdata-and-clickhouse.md)            | Нативный коннектор                      | ✅              | ✅                |                                                                                                                                             |