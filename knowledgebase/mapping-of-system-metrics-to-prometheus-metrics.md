---
title: Mapping of metrics used in system.dashboards to Prometheus metrics in system.custom_metrics
description: “Mapping of metrics used in system.dashboards to Prometheus metrics in system.custom_metrics“
date: 2024-07-23
---

# Mapping of metrics used in system.dashboards to Prometheus metrics in system.custom_metrics

The table below provides the mapping for the metrics used in `system.dashboards` to Prometheus metrics in `system.custom_metrics`.  
This is useful for customers who want to monitor for the same metrics found in `system.dashboards`. 

### Mapping table for metrics in system.dashboards to Prometheus metrics in system.custom_metrics

Dashboard | Title | Prometheus Metric Name (system.custom_metrics)
-- | -- | --
Overview | Queries/second | ClickHouseProfileEvents_Query
Overview | CPU Usage (cores) | ClickHouseProfileEvents_OSCPUVirtualTimeMicroseconds
Overview | Queries Running | ClickHouseMetrics_Query
Overview | Merges Running | ClickHouseMetrics_Merge
Overview | Selected Bytes/second | ClickHouseProfileEvents_SelectedBytes
Overview | IO Wait | ClickHouseProfileEvents_OSIOWaitMicroseconds
Overview | CPU Wait | ClickHouseProfileEvents_OSCPUWaitMicroseconds
Overview | OS CPU Usage (Userspace) | ClickHouseAsyncMetrics_OSUserTimeNormalized
Overview | OS CPU Usage (Kernel) | ClickHouseAsyncMetrics_OSSystemTimeNormalized
Overview | Read From Disk | ClickHouseProfileEvents_OSReadBytes
Overview | Read From Filesystem | ClickHouseProfileEvents_OSReadChars
Overview | Memory (tracked) | ClickHouseMetrics_MemoryTracking
Overview | Load Average (15 minutes) | ClickHouseAsyncMetrics_LoadAverage15
Overview | Selected Rows/second | ClickHouseProfileEvents_SelectedRows
Overview | Inserted Rows/second | ClickHouseProfileEvents_InsertedRows
Overview | Total MergeTree Parts | ClickHouseAsyncMetrics_TotalPartsOfMergeTreeTables
Overview | Max Parts For Partition | ClickHouseAsyncMetrics_MaxPartCountForPartition
Cloud overview | Queries/second | ClickHouseProfileEvents_Query
Cloud overview | CPU Usage (cores) | ClickHouseProfileEvents_OSCPUVirtualTimeMicroseconds
Cloud overview | Queries Running | ClickHouseMetrics_Query
Cloud overview | Merges Running | ClickHouseMetrics_Merge
Cloud overview | Selected Bytes/second | ClickHouseProfileEvents_SelectedBytes
Cloud overview | IO Wait (local fs) | ClickHouseProfileEvents_OSIOWaitMicroseconds
Cloud overview | S3 read wait | ClickHouseProfileEvents_ReadBufferFromS3Microseconds
Cloud overview | S3 read errors/sec | ProfileEvent_ReadBufferFromS3RequestsErrors
Cloud overview | CPU Wait | ClickHouseProfileEvents_OSCPUWaitMicroseconds
Cloud overview | OS CPU Usage (Userspace, normalized) | ClickHouseAsyncMetrics_OSUserTimeNormalized
Cloud overview | OS CPU Usage (Kernel, normalized) | ClickHouseAsyncMetrics_OSSystemTimeNormalized
Cloud overview | Read From Disk (bytes/sec) | ClickHouseProfileEvents_OSReadBytes
Cloud overview | Read From Filesystem (bytes/sec) | ClickHouseProfileEvents_OSReadChars
Cloud overview | Memory (tracked, bytes) | ClickHouseMetrics_MemoryTracking
Cloud overview | Load Average (15 minutes) | ClickHouseAsyncMetrics_LoadAverage15
Cloud overview | Selected Rows/sec | ClickHouseProfileEvents_SelectedRows
Cloud overview | Inserted Rows/sec | ClickHouseProfileEvents_InsertedRows
Cloud overview | Total MergeTree Parts | ClickHouseAsyncMetrics_TotalPartsOfMergeTreeTables
Cloud overview | Max Parts For Partition | ClickHouseAsyncMetrics_MaxPartCountForPartition
Cloud overview | Read From S3 (bytes/sec) | ClickHouseProfileEvents_ReadBufferFromS3Bytes
Cloud overview | Filesystem Cache Size | ClickHouseMetrics_FilesystemCacheSize
Cloud overview | Disk S3 write req/sec | ClickHouseProfileEvents_DiskS3PutObject + ClickHouseProfileEvents_DiskS3UploadPart + ClickHouseProfileEvents_DiskS3CreateMultipartUpload + ClickHouseProfileEvents_DiskS3CompleteMultipartUpload
Cloud overview | Disk S3 read req/sec | ClickHouseProfileEvents_DiskS3GetObject + ClickHouseProfileEvents_DiskS3HeadObject + ClickHouseProfileEvents_DiskS3ListObjects
Cloud overview | FS cache hit rate | ClickHouseProfileEvents_CachedReadBufferReadFromCacheBytes / (ClickHouseProfileEvents_CachedReadBufferReadFromCacheBytes + ClickHouseProfileEvents_CachedReadBufferReadFromSourceBytes)
Cloud overview | Page cache hit rate | greatest(0, (sum(ClickHouseProfileEvents_OSReadChars) - sum(ClickHouseProfileEvents_OSReadBytes)) /  (sum(ClickHouseProfileEvents_OSReadChars) + sum(ClickHouseProfileEvents_ReadBufferFromS3Bytes)))
Cloud overview | Network receive bytes/sec | ClickHouseProfileEvents_NetworkReceiveBytes
Cloud overview | Network send bytes/sec | ClickHouseProfileEvents_NetworkSendBytes


Related links:  
https://clickhouse.com/docs/en/integrations/prometheus