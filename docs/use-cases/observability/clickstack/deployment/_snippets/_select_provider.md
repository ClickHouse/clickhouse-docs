import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';
import ResourceEstimation from '@site/docs/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

:::note Scale vs Enterprise
We recommend this [Scale tier](/cloud/manage/cloud-tiers) for most ClickStack workloads. Choose the Enterprise tier if you require advanced security features such as SAML, CMEK, or HIPAA compliance. It also offers custom hardware profiles for very large ClickStack deployments. In these cases, we recommend contacting support.
:::

Select the Cloud provider and region.

<Image img={region_resources} size="md" alt='Resource selector' border/>

When specifying the select CPU and memory, estimate it based on your expected ClickStack ingestion throughput. The table below provides guidance for sizing these resources.

<ResourceEstimation/>
 
Once you have specified the requirements, your Managed ClickStack service will take several minutes to provision. Feel free to explore the rest of the [ClickHouse Cloud console](/cloud/overview) whilst waiting for provisioning.

Once **provisioning is complete, the 'ClickStack' option on the left menu will be enabled**.
