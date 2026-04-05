---
slug: /use-cases/observability/clickstack/dashboards/dashboard-templates
title: 'Шаблоны дашбордов'
sidebar_label: 'Шаблоны дашбордов'
pagination_prev: null
pagination_next: null
description: 'Импорт готовых шаблонов дашбордов в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'дашборды', 'шаблоны', 'импорт', 'обсервабилити']
---

import Image from '@theme/IdealImage';
import browse_dashboard_template from '@site/static/images/use-cases/observability/browse-dashboard-template.png';
import dashboard_template_gallery from '@site/static/images/use-cases/observability/dashboard-template-gallery.png';
import import_dashboard_template from '@site/static/images/use-cases/observability/import-dashboard-template.png';

ClickStack включает библиотеку готовых шаблонов дашбордов, которые сразу дают представление о распространённых метриках инфраструктуры и приложений.

## Просмотр доступных шаблонов \{#browsing-templates\}

Чтобы открыть встроенную библиотеку шаблонов, перейдите в раздел **Дашборды** и нажмите **Browse dashboard templates**.

<Image img={browse_dashboard_template} alt="Кнопка Browse Dashboard Templates" size="lg" />

Откроется галерея шаблонов, в которой шаблоны сгруппированы по категориям. Нажмите **Import**, чтобы начать импорт выбранного шаблона.

<Image img={dashboard_template_gallery} alt="Галерея шаблонов дашборда" size="lg" />

## Импорт шаблона \{#importing-a-template\}

Чтобы импортировать шаблон, для каждой визуализации на дашборде необходимо указать источник данных. Выберите источник данных из раскрывающегося списка для каждой визуализации, затем нажмите `Finish Import`.

<Image img={import_dashboard_template} alt="Импорт шаблона дашборда" size="lg" />

## Готовые шаблоны \{#pre-built-templates\}

### Метрики среды выполнения OTel \{#otel-runtime-metrics\}

Встроенные шаблоны OTel Runtime Metrics предназначены для приложений, в которых используются [метрики среды выполнения OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/runtime/).

| Шаблон                      | Описание                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **.NET Runtime Metrics**    | Циклы GC, размер кучи, использование пула потоков и число сборок для приложений .NET                 |
| **Go Runtime Metrics**      | Количество goroutine, время пауз GC, использование кучи и статистика памяти для приложений Go        |
| **JVM Runtime Metrics**     | Память кучи и вне кучи, длительность GC, количество потоков и загрузка классов для приложений на JVM |
| **Node.js Runtime Metrics** | Задержка цикла событий, использование кучи, загрузка CPU и память V8 для приложений Node.js          |

Примечания:

* Каждый шаблон настроен с [пользовательским фильтром](./#custom-filters) для сервисов, у которых значение атрибута ресурса [`telemetry.sdk.language`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/telemetry/#telemetry-sdk-language) соответствует среде выполнения, для которой предназначена панель.
  * В средах с пользовательскими schema таблиц метрик ClickHouse может потребоваться скорректировать этот фильтр, чтобы выполнять запрос по правильным столбцам Service Name и Resource Attributes.
  * В средах с большими объёмами данных время загрузки фильтра можно сократить, [материализовав](../managing/performance_tuning.md#materialize-frequently-queried-attributes) столбец `ResourceAttributes['telemetry.sdk.language']`.
* На момент публикации шаблоны ссылаются на актуальные OTel Semantic Conventions и периодически обновляются по мере обновления OTel Spec. Для сервисов, инструментированных более старыми OTel SDKs, может потребоваться [отредактировать](./#dashboards-editing-visualizations) визуализации, чтобы они ссылались на более старые имена метрик.