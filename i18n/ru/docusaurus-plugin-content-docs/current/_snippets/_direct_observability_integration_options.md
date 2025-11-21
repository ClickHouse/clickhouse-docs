import Image from "@theme/IdealImage"
import AdvancedDashboard from "@site/static/images/cloud/manage/monitoring/advanced_dashboard.png"
import NativeAdvancedDashboard from "@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png"

### Прямая интеграция плагина Grafana {#direct-grafana}

Плагин источника данных ClickHouse для Grafana позволяет визуализировать и исследовать данные непосредственно из ClickHouse с использованием системных таблиц. Этот подход хорошо подходит для мониторинга производительности и создания пользовательских дашбордов для детального анализа системы.
Подробности установки и настройки плагина см. в разделе [плагин источника данных](/integrations/grafana) ClickHouse. Для полной настройки мониторинга с использованием Prometheus-Grafana mix-in с готовыми дашбордами и правилами оповещений см. [Мониторинг ClickHouse с новым Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in).

### Прямая интеграция с Datadog {#direct-datadog}

Datadog предлагает плагин Clickhouse Monitoring для своего агента, который напрямую запрашивает системные таблицы. Эта интеграция обеспечивает комплексный мониторинг базы данных с поддержкой кластерной архитектуры через функциональность clusterAllReplicas.
:::note
Эта интеграция не рекомендуется для развертываний ClickHouse Cloud из-за несовместимости с режимом простоя, оптимизирующим затраты, и операционных ограничений облачного прокси-слоя.
:::

### Прямое использование системных таблиц {#system-tables}

Пользователи могут выполнять глубокий анализ производительности запросов, подключаясь к системным таблицам ClickHouse, в частности к `system.query_log`, и выполняя запросы напрямую. Используя консоль SQL или клиент clickhouse, команды могут выявлять медленные запросы, анализировать использование ресурсов и отслеживать шаблоны использования в организации.

**Анализ производительности запросов**

Пользователи могут использовать журналы запросов системных таблиц для выполнения анализа производительности запросов.

**Пример запроса**: Найти 5 самых долго выполняющихся запросов по всем репликам кластера:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```
