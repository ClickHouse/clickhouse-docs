## Upgrade process {#upgrade-process}

We regularly upgrade the software, including ClickHouse database version upgrades, ClickHouse Operator, EKS, and other components.

While we aim for seamless upgrades (e.g., rolling upgrades and restarts), some, such as ClickHouse version changes and EKS node upgrades, may impact service. Customers can specify a maintenance window (e.g., every Tuesday at 1:00 a.m. PDT), ensuring such upgrades occur only during the scheduled time.

:::note
Maintenance windows do not apply to security and vulnerability fixes. These are handled as off-cycle upgrades, with timely communication to coordinate a suitable time and minimize operational impact.
:::