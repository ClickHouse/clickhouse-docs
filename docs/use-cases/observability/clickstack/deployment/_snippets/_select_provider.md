import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

Select your cloud provider, the region in which you wish to deploy, and the volume of data that you have per month via the 'Memory and Scaling' drop-down.

This should be a rough estimate of the amount of data you have, either logs or traces, in an uncompressed form. 

<Image img={provider_selection} size="md" alt='Resource selector' border force/>

This estimate will be used to size the compute supporting your Managed ClickStack service. By default, new organizations are put on the [Scale tier](/cloud/manage/cloud-tiers). [Vertical autoscaling](/manage/scaling#vertical-auto-scaling) will be enabled by default in the Scale tier. You can change your organization tier later on the 'Plans' page.

Advanced users with an understanding of their requirements can alternatively specify the exact resources provisionned, as well as any enterprise features, by selecting 'Custom Configuration' from the 'Memory and Scaling' dropdown.

<Image img={advanced_resources} size="md" alt='Advanced resource selector' border force/>

Once you have specified the requirements, your Managed ClickStack service will take several minutes to provision. The completion of provisionning is indicated on the subsequent 'ClickStack' page. Feel free to explore the rest of the [ClickHouse Cloud console](/cloud/overview) whilst waiting for provisioning.

<Image img={service_provisioned} size="md" alt='Service provisioned' border />

Once provisioning is complete, users can select 'Start Ingestion'.
