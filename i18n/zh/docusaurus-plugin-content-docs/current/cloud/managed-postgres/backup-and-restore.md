---
slug: /cloud/managed-postgres/backup-and-restore
sidebar_label: '备份和恢复'
title: '备份和恢复'
description: '了解 ClickHouse Managed Postgres 的备份策略和时间点恢复'
keywords: ['备份', '恢复', '时间点恢复', 'pitr', '灾难恢复', 'Postgres 备份']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import backupAndRestore from '@site/static/images/managed-postgres/backup-and-restore.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="backup-and-restore" />

Managed Postgres 通过自动备份和时间点恢复功能保障数据的安全性和可用性。你可以在实例的 **Backups** 视图中查看备份历史并发起恢复操作。

<Image img={backupAndRestore} alt="Backups 视图显示备份历史和时间点恢复选项" size="lg" border />


## 备份 \{#backups\}

### 备份频率 \{#backup-frequency\}

托管版 Postgres 会对您的数据库执行每日完整备份。除了完整备份之外，预写式日志（Write-Ahead Log，WAL）文件会每 60 秒归档一次，或者在累计产生 16 MB 的 WAL 数据时归档，以先发生者为准。完整备份与持续 WAL 归档的结合，使您能够在保留期内恢复到任意时间点。

### 保留期 \{#retention-period\}

备份会保留 7 天，在发生数据丢失或损坏时，提供充足的时间窗口用于恢复。如果您需要更长的备份保留期，请联系[技术支持](https://clickhouse.com/support/program)。

### 存储与持久性 \{#storage-and-durability\}

备份使用纠删码在多台服务器之间进行冗余存储，即使部分存储服务器不可用，也能确保备份仍然可访问。备份存储在 bucket 级别进行隔离——每个 Managed Postgres 实例都有自己专用的存储 bucket，且凭据的作用范围被限制为只能访问该实例的备份。

## 时间点恢复 \{#point-in-time-recovery\}

时间点恢复允许你在备份保留期内，将数据库恢复到任意一个特定时刻。这对于从误删数据、数据损坏或其他需要回滚到已知正常状态的问题中进行恢复非常有用。

要执行时间点恢复：

1. 进入托管 Postgres 实例的 **Backups** 视图。
2. 在 **Point in time recovery** 部分，选择你希望恢复到的目标日期和时间（UTC）。
3. 点击 **Restore to point in time**。

恢复操作会创建一个新的托管 Postgres 实例，其数据库状态与所选时间点时的状态一致。你的原始实例保持不变，使你可以在决定保留哪个实例之前先验证恢复后的数据。