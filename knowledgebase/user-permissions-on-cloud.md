---
sidebar_position: 1
description: 'Improving Map performance'
date: 2022-12-06
---

# How to check grants and standard permissions for default user in ClickHouse Cloud

You can check the current privileges and permission (RBAC) for default user and other users' max privileges in [this part of the data plane code](https://github.com/ClickHouse/data-plane-application/blob/main/clickhouse-operator/util/clickhouseclient/database_user_supervisor.go#L54)

