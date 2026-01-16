## 社区监控解决方案 \\{#community-monitoring\\}

ClickHouse 社区已开发出与主流可观测性技术栈集成的完善监控解决方案。[ClickHouse Monitoring](https://github.com/duyet/clickhouse-monitoring) 提供了带有预构建仪表盘的完整监控部署方案。这个开源项目为希望基于既有最佳实践和成熟仪表盘配置来实施 ClickHouse 监控的团队提供了一种快速入门途径。

:::note
与其他直接数据库监控方法类似，该解决方案会直接查询 ClickHouse 的 system 系统表，使实例无法进入空闲状态，从而影响成本优化。
:::