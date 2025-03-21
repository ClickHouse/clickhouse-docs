---
sidebar_label: 部署模式
description: 'ClickHouse 提供四种部署选项，所有选项都使用相同强大的数据库引擎，只是以不同方式打包，以满足您的特定需求。'
title: 部署模式
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';

ClickHouse 是一个多功能的数据库系统，可以根据您的需求以几种不同的方式进行部署。在其核心，所有部署选项 **使用相同强大的 ClickHouse 数据库引擎** – 不同的是您如何与它互动以及它运行在哪里。

无论您是在生产环境中进行大规模分析，进行本地数据分析，还是构建应用程序，都有一个为您的用例设计的部署选项。底层引擎的一致性意味着您在所有部署模式中都能获得相同的高性能和 SQL 兼容性。
本指南探讨了部署和使用 ClickHouse 的四种主要方式：

* ClickHouse Server 适用于传统的客户端/服务器部署
* ClickHouse Cloud 用于完全托管的数据库操作
* clickhouse-local 用于命令行数据处理
* chDB 用于将 ClickHouse 直接嵌入应用程序

每种部署模式都有其自身的优势和理想的用例，下面我们将详细探讨。

<iframe width="560" height="315" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server 代表传统的客户端/服务器架构，适用于生产部署。该部署模式提供了完整的 OLAP 数据库功能，具备 ClickHouse 所知的高吞吐量和低延迟查询能力。

<img src={chServer} alt="ClickHouse Server" class="image" style={{width: '50%'}} />
<br/>

在部署灵活性方面，ClickHouse Server 可以安装在您的本地机器上进行开发或测试，部署到像 AWS、GCP 或 Azure 等主要云服务提供商进行基于云的操作，或者在您自己的本地硬件上进行设置。对于大规模操作，可以配置为分布式集群以处理增加的负载并提供高可用性。

该部署模式是生产环境的首选，可靠性、性能和完整的功能访问至关重要。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的完全托管版本，消除了运行自有部署的操作性开销。它保持了 ClickHouse Server 的所有核心功能，并通过额外的功能增强体验，旨在简化开发和操作。

<img src={chCloud} alt="ClickHouse Cloud" class="image" style={{width: '50%'}} />
<br/>

ClickHouse Cloud 的一个关键优势是其集成的工具。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes) 提供了强大的数据摄取框架，使您能够轻松连接和流式传输来自各种来源的数据，而无需管理复杂的 ETL 管道。该平台还提供专用的 [查询 API](/cloud/get-started/query-endpoints)，使构建应用程序变得更加简单。

ClickHouse Cloud 中的 SQL 控制台包括强大的 [仪表板](/cloud/manage/dashboards) 功能，让您能够将查询转换为交互式可视化。您可以创建和共享基于保存查询构建的仪表板，并通过查询参数添加交互元素。这些仪表板可以使用全局过滤器进行动态处理，使用户能够通过可自定义的视图探索数据 – 尽管重要的是要注意，用户需要至少具有查看基础保存查询的读取权限才能查看可视化。

为了监控和优化，ClickHouse Cloud 包含内置的图表和 [查询洞察](/cloud/get-started/query-insights)。这些工具提供了对集群性能的深度可见性，帮助您理解查询模式、资源利用率和潜在的优化机会。这种级别的可观察性对需要维护高性能分析操作而不需要 dedicar 资源用于基础设施管理的团队尤其有价值。

该服务的托管性质意味着您无需担心更新、备份、扩展或安全补丁 – 这些都由系统自动处理。这使其成为希望将焦点放在数据和应用程序而非数据库管理上的组织的理想选择。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个强大的命令行工具，提供 ClickHouse 的完整功能，作为一个独立的可执行文件。它本质上与 ClickHouse Server 相同的数据库，但以一种让您可以从命令行直接利用所有 ClickHouse 功能的方式打包，而无需运行服务器实例。

<img src={chLocal} alt="clickhouse-local" class="image" style={{width: '50%'}} />
<br/>

该工具在临时数据分析方面表现卓越，特别是在处理本地文件或存储在云存储服务中的数据时。您可以直接使用 ClickHouse 的 SQL 方言查询各种格式的文件（CSV、JSON、Parquet 等），使其成为快速数据探索或一次性分析任务的优秀选择。

由于 clickhouse-local 包含 ClickHouse 的所有功能，您可以用它进行数据转换、格式转换或任何其他通常与 ClickHouse Server 一起进行的数据库操作。虽然主要用于临时操作，但在需要时它也可以使用与 ClickHouse Server 相同的存储引擎来持续数据。

远程表函数和对本地文件系统的访问的结合使得 clickhouse-local 在需要将数据在 ClickHouse Server 与本地机器上的文件之间进行连接的场景中特别有用。在处理敏感或临时本地数据时尤其有价值，因为您不想将其上传到服务器。

## chDB {#chdb}

[chDB](/chdb) 是 ClickHouse 作为一个内嵌数据库引擎的实现，Python 是主要实现语言，尽管它也可用于 Go、Rust、NodeJS 和 Bun。此部署选项将 ClickHouse 强大的 OLAP 能力直接带入您的应用程序进程，消除了单独数据库安装的需要。

<img src={chDB} alt="chDB - Embedded ClickHouse" class="image" style={{width: '50%'}} />
<br/>

chDB 提供与您应用程序生态系统的无缝集成。例如，在 Python 中，它经过优化，可以高效地与常见的数据科学工具（如 Pandas 和 Arrow）协同工作，通过 Python memoryview 最小化数据复制开销。这使其对希望在现有工作流程中利用 ClickHouse 查询性能的数据科学家和分析师尤为珍贵。

chDB 还可以连接到使用 clickhouse-local 创建的数据库，提供灵活的数据处理方式。这意味着您可以在本地开发、在 Python 中进行数据探索以及更持久的存储解决方案之间无缝切换，而无需改变数据访问模式。
