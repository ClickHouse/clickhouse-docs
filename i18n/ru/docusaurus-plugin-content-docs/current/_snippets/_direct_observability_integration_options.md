import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

### Прямая интеграция с плагином Grafana \\{#direct-grafana\\}

Плагин источника данных ClickHouse для Grafana позволяет визуализировать и исследовать данные непосредственно из ClickHouse, используя системные таблицы. Такой подход хорошо работает для мониторинга производительности и создания настраиваемых дашбордов для детализированного анализа системы.
Сведения об установке и настройке плагина см. в разделе о плагине [источника данных](/integrations/grafana) для ClickHouse. Полное решение для мониторинга с использованием Prometheus-Grafana mix-in с преднастроенными дашбордами и правилами оповещений описано в статье [Monitor ClickHouse with the new Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in).

### Прямая интеграция с Datadog \\{#direct-datadog\\}

Datadog предлагает плагин ClickHouse Monitoring для своего агента, который напрямую запрашивает системные таблицы. Эта интеграция обеспечивает всесторонний мониторинг базы данных с учетом кластера благодаря функциональности clusterAllReplicas. 
:::note
Эта интеграция не рекомендуется для развертываний ClickHouse Cloud из-за несовместимости с оптимизацией затрат при простое и операционных ограничений прокси-слоя в облаке.
:::

### Непосредственное использование системных таблиц \{#system-tables\}

Вы можете выполнять глубокий анализ производительности запросов, подключаясь к системным таблицам ClickHouse, в частности к `system.query_log`, и выполняя запросы напрямую. Используя SQL-консоль или clickhouse client, команды могут выявлять медленные запросы, анализировать использование ресурсов и отслеживать характер использования по всей организации.

**Анализ производительности запросов**

Вы можете использовать журналы запросов в системных таблицах для выполнения анализа производительности запросов.

**Пример запроса**: Найти пять самых долгих по времени выполнения запросов по всем репликам кластера:

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
