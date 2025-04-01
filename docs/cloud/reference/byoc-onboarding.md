## Onboarding Process {#onboarding-process}

Customers can initiate the onboarding process by reaching out to [us](https://clickhouse.com/cloud/bring-your-own-cloud). Customers need to have a dedicated AWS account and know the region they will use. At this time, we are allowing users to launch BYOC services only in the regions that we support for ClickHouse Cloud.

### Prepare a Dedicated AWS Account {#prepare-a-dedicated-aws-account}

Customers must prepare a dedicated AWS account for hosting the ClickHouse BYOC deployment to ensure better isolation. With this and the initial organization admin email, you can contact ClickHouse support.

### Apply CloudFormation Template {#apply-cloudformation-template}

BYOC setup is initialized via a [CloudFormation stack](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), which creates only a role allowing BYOC controllers from ClickHouse Cloud to manage infrastructure. The S3, VPC, and compute resources for running ClickHouse are not included in this stack.

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### Setup BYOC Infrastructure {#setup-byoc-infrastructure}

After creating the CloudFormation stack, you will be prompted to set up the infrastructure, including S3, VPC, and the EKS cluster, from the cloud console. Certain configurations must be determined at this stage, as they cannot be changed later. Specifically:

- **The region you want to use**, you can choose one of any [public regions](/cloud/reference/supported-regions) we have for ClickHouse Cloud.
- **The VPC CIDR range for BYOC**: By default, we use `10.0.0.0/16` for the BYOC VPC CIDR range. If you plan to use VPC peering with another account, ensure the CIDR ranges do not overlap. Allocate a proper CIDR range for BYOC, with a minimum size of `/22` to accommodate necessary workloads.
- **Availability Zones for BYOC VPC**: If you plan to use VPC peering, aligning availability zones between the source and BYOC accounts can help reduce cross-AZ traffic costs. In AWS, availability zone suffixes (`a, b, c`) may represent different physical zone IDs across accounts. See the [AWS guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) for details.