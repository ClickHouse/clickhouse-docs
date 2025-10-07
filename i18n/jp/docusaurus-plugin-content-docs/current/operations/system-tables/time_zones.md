---
'description': 'システムテーブルは、ClickHouseサーバーによってサポートされているタイムゾーンのリストを含みます。'
'keywords':
- 'system table'
- 'time_zones'
'slug': '/operations/system-tables/time_zones'
'title': 'system.time_zones'
'doc_type': 'reference'
---


# system.time_zones

ClickHouseサーバーがサポートするタイムゾーンのリストが含まれています。このタイムゾーンのリストは、ClickHouseのバージョンによって異なる場合があります。

カラム:

- `time_zone` (String) — サポートされているタイムゾーンのリスト。

**例**

```sql
SELECT * FROM system.time_zones LIMIT 10
```

```text
┌─time_zone──────────┐
│ Africa/Abidjan     │
│ Africa/Accra       │
│ Africa/Addis_Ababa │
│ Africa/Algiers     │
│ Africa/Asmara      │
│ Africa/Asmera      │
│ Africa/Bamako      │
│ Africa/Bangui      │
│ Africa/Banjul      │
│ Africa/Bissau      │
└────────────────────┘
```
