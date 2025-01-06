---
sidebar_label: ClickPipes for Postgres FAQ
description: Frequently asked questions about ClickPipes for Postgres.
slug: /en/integrations/clickpipes/postgres/faq
sidebar_position: 2
---

# ClickPipes for Postgres FAQ

### How does idling affect my Postgres CDC Clickpipe?

If your ClickHouse Cloud service is idling, your Postgres CDC clickpipe will continue to sync data, your service will wake-up at the next sync interval to handle the incoming data. Once the sync is finished and the idle period is reached, your service will go back to idling.

As an example, if your sync interval is set to 30 mins and your service idle time is set to 10 mins, Your service will wake-up every 30 mins and be active for 10 mins, then go back to idling.


### How are TOAST columns handled in ClickPipes for Postgres?

Please refer to the [Handling TOAST Columns](./toast) page for more information.


### How are generated columns handled in ClickPipes for Postgres?

Please refer to the [Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) page for more information.

