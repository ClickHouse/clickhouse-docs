---
slug: /deployment-modes
sidebar_label: '部署模式'
description: 'ClickHouse 提供四种部署选项，它们都使用同一个强大的数据库引擎，只是以不同的形式提供，以满足您的特定需求。'
title: '部署模式'
keywords: ['部署模式', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个多功能的数据库系统，可以根据您的需求采用多种方式进行部署。本质上，所有部署选项**都使用同一个强大的 ClickHouse 数据库引擎**——不同之处在于您如何与它交互，以及它运行在何处。

无论您是在生产环境中运行大规模分析、进行本地数据分析，还是构建应用程序，都有针对您使用场景设计的部署选项。底层引擎的一致性意味着在所有部署模式下，您都能获得同样的高性能和 SQL 兼容性。

本指南将介绍部署和使用 ClickHouse 的四种主要方式：

* 用于传统客户端/服务器部署的 ClickHouse Server
* 用于全托管数据库运维的 ClickHouse Cloud
* 用于命令行数据处理的 clickhouse-local
* 用于在应用程序中直接嵌入 ClickHouse 的 chDB

每种部署模式都有其自身的优势和理想的使用场景，我们将在下文中详细介绍。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server {#clickhouse-server}

ClickHouse Server 采用传统的客户端/服务器架构,是生产环境部署的理想选择。该部署模式提供完整的 OLAP 数据库功能,具备 ClickHouse 所擅长的高吞吐量和低延迟查询性能。

<Image img={chServer} alt='ClickHouse Server' size='sm' />

<br />

在部署灵活性方面,ClickHouse Server 可以安装在本地机器上用于开发或测试,也可以部署到 AWS、GCP 或 Azure 等主流云服务提供商以实现云端运维,或者在您自有的本地硬件上搭建。对于大规模应用场景,可以将其配置为分布式集群,以应对更高的负载并提供高可用性保障。

该部署模式是生产环境的首选方案,尤其适用于对可靠性、性能和完整功能支持有严格要求的场景。


## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的完全托管版本,消除了自行部署运维的负担。它保留了 ClickHouse Server 的所有核心功能,同时通过旨在简化开发和运维的附加特性增强了使用体验。

<Image img={chCloud} alt='ClickHouse Cloud' size='sm' />

ClickHouse Cloud 的一个关键优势是其集成工具。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes) 提供了强大的数据摄取框架,让您能够轻松连接并从各种数据源流式传输数据,而无需管理复杂的 ETL 管道。该平台还提供专用的[查询 API](/cloud/get-started/query-endpoints),大幅简化了应用程序的构建过程。

ClickHouse Cloud 中的 SQL Console 包含强大的[仪表板](/cloud/manage/dashboards)功能,可将您的查询转换为交互式可视化图表。您可以基于已保存的查询创建和共享仪表板,并能够通过查询参数添加交互元素。这些仪表板可以使用全局过滤器实现动态化,允许用户通过可自定义的视图探索数据——但需要注意的是,用户至少需要对底层已保存查询具有读取权限才能查看可视化内容。

在监控和优化方面,ClickHouse Cloud 包含内置图表和[查询洞察](/cloud/get-started/query-insights)功能。这些工具深入展示集群性能,帮助您了解查询模式、资源利用率和潜在的优化机会。这种可观测性水平对于需要维持高性能分析操作而又不想投入资源进行基础设施管理的团队尤为宝贵。

该服务的托管特性意味着您无需担心更新、备份、扩展或安全补丁——这些都会自动处理。这使其成为希望专注于数据和应用程序而非数据库管理的组织的理想选择。


## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个功能强大的命令行工具,以独立可执行文件的形式提供 ClickHouse 的完整功能。它本质上与 ClickHouse Server 是相同的数据库,但采用了一种无需运行服务器实例即可直接从命令行使用 ClickHouse 全部功能的打包方式。

<Image img={chLocal} alt='clickHouse-local' size='sm' />

该工具在即席数据分析方面表现出色,尤其适用于处理本地文件或云存储服务中的数据。您可以使用 ClickHouse 的 SQL 方言直接查询各种格式的文件(CSV、JSON、Parquet 等),这使其成为快速数据探索或一次性分析任务的理想选择。

由于 clickhouse-local 包含 ClickHouse 的全部功能,您可以使用它进行数据转换、格式转换或通常使用 ClickHouse Server 执行的任何其他数据库操作。虽然主要用于临时操作,但在需要时它也可以使用与 ClickHouse Server 相同的存储引擎持久化数据。

远程表函数与本地文件系统访问的结合使 clickhouse-local 在需要关联 ClickHouse Server 与本地机器上文件之间的数据时特别有用。当处理不希望上传到服务器的敏感或临时本地数据时,这一特性尤其有价值。


## chDB {#chdb}

[chDB](/chdb) 是作为进程内数据库引擎嵌入的 ClickHouse,主要实现为 Python 版本,同时也提供 Go、Rust、NodeJS 和 Bun 版本。这种部署方式将 ClickHouse 强大的 OLAP 能力直接集成到应用程序进程中,无需单独安装数据库。

<Image img={chDB} alt='chDB - Embedded ClickHouse' size='sm' />

chDB 可与应用程序生态系统无缝集成。例如在 Python 中,它经过优化可高效配合 Pandas 和 Arrow 等常用数据科学工具使用,通过 Python memoryview 最大限度地减少数据复制开销。这使其对希望在现有工作流程中利用 ClickHouse 查询性能的数据科学家和分析师尤为实用。

chDB 还可以连接到使用 clickhouse-local 创建的数据库,为数据处理方式提供了灵活性。这意味着您可以在本地开发、Python 数据探索和更持久的存储解决方案之间无缝切换,而无需改变数据访问模式。
