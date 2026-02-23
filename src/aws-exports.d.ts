import type { ResourcesConfig } from 'aws-amplify';

declare module './aws-exports' {
  const awsExports: ResourcesConfig;
  export default awsExports;
}
