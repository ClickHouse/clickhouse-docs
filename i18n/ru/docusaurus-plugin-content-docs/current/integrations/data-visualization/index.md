---
sidebar_label: 'Обзор'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', 'visualization', 'tool']
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

Теперь, когда ваши данные находятся в ClickHouse, пора их проанализировать, что часто включает в себя создание визуализаций с использованием инструмента BI. Многие популярные инструменты BI и визуализации подключаются к ClickHouse. Некоторые подключаются к ClickHouse "из коробки", в то время как другим требуется установка соединителя. У нас есть документация для некоторых инструментов, включая:

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./astrato-and-clickhouse.md)
- [Deepnote](./deepnote.md)
- [Draxlr](./draxlr-and-clickhouse.md)
- [Explo](./explo-and-clickhouse.md)
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

| Инструмент                                                             | Поддерживается через          | Протестировано | Задокументировано | Комментарий                                                                                                                            |
|------------------------------------------------------------------------|-------------------------------|----------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | Официальный соединитель ClickHouse | ✅              | ✅                 |                                                                                                                                         |
| [Astrato](./astrato-and-clickhouse.md)      | Нативный соединитель           | ✅              | ✅                 | Работает нативно, используя pushdown SQL (только прямой запрос).                                                                          |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | Интерфейс MySQL               | ✅              | ✅                 | Работает с некоторыми ограничениями, смотрите [документацию](./quicksight-and-clickhouse.md) для получения более подробной информации                |
| [Deepnote](./deepnote.md)                            | Нативный соединитель          | ✅              | ✅                 |                                                                                                                                         |
| [Explo](./explo-and-clickhouse.md)                   | Нативный соединитель          | ✅              | ✅                 |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | Официальный соединитель ClickHouse | ✅              | ✅                 |                                                                                                                                         |
| [Hashboard](./hashboard-and-clickhouse.md)           | Нативный соединитель          | ✅              | ✅                 |                                                                                                                                         |
| [Looker](./looker-and-clickhouse.md)                 | Нативный соединитель          | ✅              | ✅                 | Работает с некоторыми ограничениями, смотрите [документацию](./looker-and-clickhouse.md) для получения более подробной информации                    |
| Looker                                                                  | Интерфейс MySQL               | 🚧             | ❌                 |                                                                                                                                         |
| [Luzmo](./luzmo-and-clickhouse.md)                   | Официальный соединитель ClickHouse | ✅              | ✅                 |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | Интерфейс MySQL               | ✅              | ✅                 |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | Официальный соединитель ClickHouse | ✅              | ✅                 |                                                                                                        
| [Mitzu](./mitzu-and-clickhouse.md)                   | Нативный соединитель          | ✅              | ✅                 |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | Нативный соединитель          | ✅              | ✅                 |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | Официальный соединитель ClickHouse | ✅              | ✅                 | Через ODBC, поддерживает режим прямых запросов                                                                                          |
| [Power BI service](/integrations/powerbi#power-bi-service)                                           | Официальный соединитель ClickHouse | ✅            | ✅                 | Для этого требуется настройка [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | Нативный соединитель          | ✅              | ✅                 |        
| [Rocket BI](./rocketbi-and-clickhouse.md)            | Нативный соединитель          | ✅              | ❌                 |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | Официальный соединитель ClickHouse | ✅              | ✅                 |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | Интерфейс MySQL               | ✅              | ✅                 | Работает с некоторыми ограничениями, смотрите [документацию](./tableau/tableau-online-and-clickhouse.md) для получения более подробной информации            |
| [Zing Data](./zingdata-and-clickhouse.md)            | Нативный соединитель          | ✅              | ✅                 |                                                                                                                                         |

