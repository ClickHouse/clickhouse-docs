import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
<summary>Why are we introducing a pricing model for ClickPipes now?</summary>
We decided to initially launch ClickPipes for free with the idea to gather
feedback, refine features, and ensure it meets user needs.
As the GA platform has grown, it has effectively stood the test of time by
moving trillions of rows. Introducing a pricing model allows us to continue
improving the service, maintaining the infrastructure, and providing dedicated
support and new connectors.
</details>

<details>
<summary>What are ClickPipes replicas?</summary>
ClickPipes ingests data from remote data sources via a dedicated infrastructure
that runs and scales independently of the ClickHouse Cloud service.
For this reason, it uses dedicated compute replicas.
The diagrams below show a simplified architecture.
For streaming ClickPipes, ClickPipes replicas access the remote data sources (e.g., a Kafka broker),
pull the data, process and ingest it into the destination ClickHouse service.
<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes Replicas - Streaming ClickPipes" border force/>
In the case of object storage ClickPipes,
the ClickPipes replica orchestrates the data loading task
(identifying files to copy, maintaining the state, and moving partitions),
while the data is pulled directly from the ClickHouse service.
<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes Replicas - Object Storage ClickPipes" border force/>
</details>

<details>
<summary>What's the default number of replicas and their size?</summary>
Each ClickPipe defaults to 1 replica that's provided with 2 GiB of RAM and 0.5 vCPU.
This corresponds to **0.25** ClickHouse compute units (1 unit = 8 GiB RAM, 2 vCPUs).
</details>

<details>
<summary>Can ClickPipes replicas be scaled?</summary>
ClickPipes for streaming can be scaled horizontally
by adding more replicas each with a base unit of **0.25** ClickHouse compute units.
Vertical scaling is also available on demand for specific use cases (adding more CPU and RAM per replica).
</details>

<details>
<summary>How many ClickPipes replicas do I need?</summary>
It depends on the workload throughput and latency requirements.
We recommend starting with the default value of 1 replica, measuring your latency, and adding replicas if needed.
Keep in mind that for Kafka ClickPipes, you also have to scale the Kafka broker partitions accordingly.
The scaling controls are available under "settings" for each streaming ClickPipe.
<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes Replicas - How many ClickPipes replicas do I need?" border force/>
</details>

<details>
<summary>What does the ClickPipes pricing structure look like?</summary>
It consists of two dimensions:
- **Compute**: Price per unit per hour
Compute represents the cost of running the ClickPipes replica pods whether they actively ingest data or not.
It applies to all ClickPipes types.
- **Ingested data**: per GB pricing
The ingested data rate applies to all streaming ClickPipes
(Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream,
Azure Event Hubs) for the data transferred via the replica pods.
The ingested data size (GB) is charged based on bytes received from the source (uncompressed or compressed).
</details>

<details>
<summary>What are the ClickPipes public prices?</summary>
- Compute: \$0.20 per unit per hour ($0.05 per replica per hour)
- Ingested data: $0.04 per GB
</details>

<details>
<summary>How does it look in an illustrative example?</summary>
For example, ingesting 1 TB of data over 24 hours using the Kafka connector using a single replica (0.25 compute unit) costs:
$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
For object storage connectors (S3 and GCS),
only the ClickPipes compute cost is incurred since the ClickPipes pod is not processing data
but only orchestrating the transfer which is operated by the underlying ClickHouse service:
$$
0.25 \times 0,20 \times 24 = \$1.2
$$
</details>

<details>
<summary>When does the new pricing model take effect?</summary>
The new pricing model takes effect for all organizations created after January 27th, 2025.
</details>

<details>
<summary>What happens to current users?</summary>
Existing users will have a **60-day grace period** where the ClickPipes service continues to be offered for free.
Billing will automatically start for ClickPipes for existing users on **March 24th, 2025.**
</details>

<details>
<summary>How does ClickPipes pricing compare to the market?</summary>
The philosophy behind ClickPipes pricing is
to cover the operating costs of the platform while offering an easy and reliable way to move data to ClickHouse Cloud.
From that angle, our market analysis revealed that we are positioned competitively.
</details>
