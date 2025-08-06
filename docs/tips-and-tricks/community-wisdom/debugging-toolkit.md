---
sidebar_position: 1
slug: /community-wisdom/debugging-toolkit
sidebar_label: 'Debugging Toolkit'
keywords: [
  'clickhouse troubleshooting',
  'clickhouse errors',
  'slow queries',
  'memory problems', 
  'connection issues',
  'performance optimization',
  'database errors',
  'configuration problems',
  'debug',
  'solutions'
]
title: 'Lessons - Debugging Toolkit'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# Operations: The 2AM Debugging Toolkit {#operations-debugging}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Suffering from high operational costs? Check out the [Cost Optimization](./cost-optimization.md) community insights guide.*

## When Everything is Broken: Emergency Diagnostics {#emergency-diagnostics}

**Community philosophy:** *"If something looks odd even just slightly something is wrong - investigate before it gets worse"*

**The nightmare scenario:** *"One of the worst days of my life over the past three years... it locked the database you couldn't insert anything couldn't read anything CPU went crazy memory usage went crazy"*

## EMERGENCY: Production Incident Queries (Copy-Paste Ready) {#emergency-queries}

**When your ClickHouse is down at 2AM, run these in order:**

```sql
-- Step 1: What's broken right now?
SELECT name, value, 'CRITICAL ERROR' as urgency 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```

```sql
-- Step 2: Disk space check (most common killer)
SELECT 
    database, table,
    formatReadableSize(sum(bytes_on_disk)) as size,
    count() as parts,
    CASE 
        WHEN sum(bytes_on_disk) > 15*1024*1024*1024*1024 THEN 'CRITICAL: Near 16TB limit'
        WHEN count() > 1000 THEN 'PARTS EXPLOSION'
        ELSE 'OK'
    END as status
FROM system.parts 
WHERE active=1 AND database NOT IN ('system')
GROUP BY database, table 
ORDER BY sum(bytes_on_disk) DESC;
```

```sql
-- Step 3: Replication problems
SELECT 
    database, table, absolute_delay, queue_size,
    CASE 
        WHEN absolute_delay > 300 THEN 'CRITICAL: 5+ min lag'
        WHEN is_readonly = 1 THEN 'READ-ONLY ERROR'  
        ELSE 'OK'
    END as status
FROM system.replicas 
ORDER BY absolute_delay DESC;
```

```sql
-- Step 4: Kill resource hogs
SELECT query_id, user, elapsed, formatReadableSize(memory_usage) as memory,
       substring(query, 1, 80) as query_preview
FROM system.processes 
WHERE elapsed > 60 OR memory_usage > 4*1024*1024*1024
ORDER BY memory_usage DESC;

-- To kill: KILL QUERY WHERE query_id = 'paste_id_here';
```

```sql
-- Step 5: Stuck merges  
SELECT database, table, elapsed, progress, 
       CASE WHEN elapsed > 3600 AND progress < 0.1 THEN 'STUCK' ELSE 'OK' END
FROM system.merges 
ORDER BY elapsed DESC;
```

## Learning: Incident Pattern Recognition {#incident-patterns}

**Understand the failure modes with working examples:**

### Memory Exhaustion Detection {#memory-exhaustion}

```sql runnable editable
-- Challenge: Try different cardinality combinations to see which ones are most dangerous
-- Experiment: Add SAMPLE 0.1 to this query if it's slow on large datasets
SELECT 
    'Memory Risk Analysis' as analysis_type,
    count() as total_events,
    uniq(actor_login, repo_name, event_type) as unique_combinations,
    round(uniq(actor_login, repo_name, event_type) / count() * 100, 2) as cardinality_percent,
    CASE 
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.9 
        THEN 'CRITICAL: Nearly every row unique - will exhaust memory!'
        WHEN uniq(actor_login, repo_name, event_type) / count() > 0.5 
        THEN 'HIGH RISK: Too many unique groups'
        ELSE 'SAFE: Reasonable aggregation ratio'
    END as memory_risk_level
FROM github.github_events 
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
LIMIT 1;
```

### Bad Data Detection {#bad-data-detection}

```sql runnable editable
-- Challenge: Modify the year thresholds (2010, 2030) based on your expected data ranges
-- Experiment: Try different time ranges to see what suspicious data patterns emerge
SELECT 
    'Data Quality Check' as analysis,
    data_year,
    count() as events,
    CASE 
        WHEN data_year < 2010 THEN 'BAD: Suspiciously old timestamps'
        WHEN data_year > 2030 THEN 'BAD: Far future timestamps'  
        ELSE 'NORMAL'
    END as data_quality
FROM (
    SELECT toYear(created_at) as data_year
    FROM github.github_events 
    WHERE created_at >= '2020-01-01'
)
GROUP BY data_year
ORDER BY data_year DESC;
```

## The 2AM Methodology {#the-2am-methodology}

**Follow this exact sequence when everything is broken:**

### Phase 1: Immediate Triage (30 seconds) {#phase-1-immediate-triage}

1. Run `system.errors` - any non-zero = active incident
2. Check disk space - *"It took us from 12 to 4 AM... it was as simple as low disk"*
3. Look for replication lag > 5 minutes

### Phase 2: Resource Investigation (2 minutes) {#phase-2-resource-investigation}

4. Find memory-hungry queries in `system.processes`
5. Check for stuck merges running >1 hour
6. Kill obviously problematic queries

### Phase 3: Data Quality Check (5 minutes) {#phase-3-data-quality-check}

7. Look for bad partitions (1998, 2050 dates)
8. Check for parts explosion (>1000 parts per table)

## Emergency Actions Reference {#emergency-actions}

**Production-tested solutions:**

| Problem | Detection Query | Solution |
|---------|-----------------|----------|
| **Memory OOM** | `SELECT * FROM system.processes WHERE memory_usage > 8GB` | Enable `external_aggregation=1` |
| **Disk Full** | `SELECT sum(bytes_on_disk) FROM system.parts` | Delete old partitions, expand disk |
| **Replication Lag** | `SELECT * FROM system.replicas WHERE absolute_delay > 300` | Check network, restart lagging replica |
| **Stuck Query** | `SELECT * FROM system.processes WHERE elapsed > 300` | `KILL QUERY WHERE query_id = '...'` |
| **Parts Explosion** | `SELECT count() FROM system.parts WHERE active=1` | Enable async_insert, increase batch sizes |

**The golden rule:** *"Problems very rarely just pop out of nowhere there are signs... investigate before it goes from 15 milliseconds to 30 seconds"*

## Community War Stories & Lessons {#war-stories}

**Disk Space Issues:**
- *"Default AWS EBS limit of 16TB hits you when you least expect it"*
- *"Other nodes keep sending data to the full node creating cascading failure"*

**Memory Exhaustion:**  
- *"Out of memory typically appears when you have a big aggregation with a lot of keys"*
- *"Enable external aggregation - query will be slower but won't crash"*

**Bad Data:**
- *"Developers send data from 1998 or 2050 causing partition chaos"*
- *"Always validate timestamps before they hit production"*

**The key insight:** Most 2AM incidents are preventable if you recognize the warning signs and have ready-to-use diagnostic queries.

## How to Use This Guide {#how-to-use-guide}

*This interactive guide represents collective wisdom from hundreds of production deployments. Each runnable example helps you understand ClickHouse patterns using real GitHub events data - practice these concepts to avoid common mistakes and accelerate your success.*
