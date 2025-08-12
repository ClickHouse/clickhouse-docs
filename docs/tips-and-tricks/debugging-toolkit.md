---
sidebar_position: 1
slug: /community-wisdom/debugging-toolkit
sidebar_label: 'Debugging Toolkit'
doc_type: 'how-to-guide'
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

# ClickHouse Operations: Community Debugging Insights
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Suffering from high operational costs? Check out the [Cost Optimization](./cost-optimization.md) community insights guide.*

## Essential System Tables

These system tables are fundamental for production debugging:

### system.errors
Shows all active errors in your ClickHouse instance.

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```

### system.replicas  
Contains replication lag and status information for monitoring cluster health.

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas 
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```

### system.replication_queue
Provides detailed information for diagnosing replication problems.

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue 
WHERE last_exception != ''
ORDER BY create_time DESC;
```

### system.merges
Shows current merge operations and can identify stuck processes.

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```

### system.parts
Essential for monitoring part counts and identifying fragmentation issues.

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```

## Common Production Issues

### Disk Space Problems

Disk space exhaustion in replicated setups creates cascading problems. When one node runs out of space, other nodes continue trying to sync with it, causing network traffic spikes and confusing symptoms. One community member spent 4 hours debugging what was simply low disk space.

AWS users should be aware that default general purpose EBS volumes have a 16TB limit.

### Too Many Parts Error

Small frequent inserts create performance problems. The community has identified that insert rates above 10 per second often trigger "too many parts" errors because ClickHouse cannot merge parts fast enough.

**Solutions:**
- Batch data using 30-second or 200MB thresholds
- Enable async_insert for automatic batching  
- Use buffer tables for server-side batching
- Configure Kafka for controlled batch sizes

Official recommendation: minimum 1,000 rows per insert, ideally 10,000 to 100,000.

### Data Quality Issues

Applications that send data with arbitrary timestamps create partition problems. This leads to partitions with data from unrealistic dates (like 1998 or 2050), causing unexpected storage behavior.

### ALTER Operation Risks

Large ALTER operations on multi-terabyte tables can consume significant resources and potentially lock databases. One community example involved changing an INT to FLOAT on 14TB of data, which locked the entire database and required rebuilding from backups.

**Prevention:**
```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

Test schema changes on smaller datasets first.

## Memory and Performance

### External Aggregation
Enable external aggregation for memory-intensive operations. It's slower but prevents out-of-memory crashes by spilling to disk.

### Async Insert Details
Async insert uses 16 threads by default to collect and batch data. You can configure it to return acknowledgment only after data is flushed to storage, though this impacts performance.

Since ClickHouse 2023, async insert supports deduplication using hash IDs.

### Buffer Tables
Buffer tables provide server-side batching but can lose data if not flushed before crashes.

### Distributed Table Configuration
By default, distributed tables use single-threaded inserts. Enable `insert_distributed_sync` for parallel processing and immediate data sending to shards.

Monitor temporary data accumulation when using distributed tables.

### Performance Monitoring Thresholds

Community-recommended monitoring thresholds:
- Parts per partition: preferably less than 100
- Delayed inserts: should stay at zero
- Insert rate: limit to about 1 per second for optimal performance

## Quick Reference

| Issue | Detection | Solution |
|-------|-----------|----------|
| Disk Space | Check `system.parts` total bytes | Monitor usage, plan scaling |
| Too Many Parts | Count parts per table | Batch inserts, enable async_insert |
| Replication Lag | Check `system.replicas` delay | Monitor network, restart replicas |
| Bad Data | Validate partition dates | Implement timestamp validation |
| Stuck Mutations | Check `system.mutations` status | Test on small data first |

## Resources

### Video Sources
- [10 Lessons from Operating ClickHouse](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM)