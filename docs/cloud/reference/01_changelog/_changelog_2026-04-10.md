<!-- 
  Changelog entry for the week of April 10, 2026.
  Insert the content below into docs/cloud/reference/01_changelog/01_changelog.md
  immediately BEFORE the "## April 3, 2026" section.
-->

## April 10, 2026 {#april-10-2026}

### Centralized marketplace billing {#centralized-marketplace-billing}

Customers can now switch an organization from credit card billing to an existing marketplace subscription from another org, consolidating PAYG billing across orgs through a single cloud marketplace subscription (AWS, Azure, and GCP). Organizations can also update which marketplace subscription is linked to a given org. Additionally, orgs on marketplace billing can now add a credit card as a backup payment method in case the primary marketplace subscription is cancelled or expires. See the [documentation](/manage/manage/billing/managing-payment-methods) for more details.

### ClickHouse Docs RAG API in the SQL Console {#docs-rag-api}

The ClickHouse Docs RAG API is now live in the ClickHouse Assistant within the SQL Console. It delivers a full RAG pipeline — embeddings, vector search, reranking, and response generation — orchestrated through a single API. Every assistant conversation in the SQL Console now benefits from grounded, context-aware responses backed by the full ClickHouse documentation.

### `clickhousectl` CLI (Public Beta) {#clickhousectl-cli}

`clickhousectl` is the new official ClickHouse CLI that manages local ClickHouse installations, runs local servers, and operates ClickHouse Cloud through one predictable interface — designed to let AI agents develop locally and operate Cloud services. Install with `curl https://clickhouse.com/cli | sh`. See the [GitHub repo](https://github.com/ClickHouse/clickhousectl) for more details.
