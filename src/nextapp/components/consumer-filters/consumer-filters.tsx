import * as React from 'react';
import { gql } from 'graphql-request';
import { Select } from '@chakra-ui/react';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import { useAuth } from '@/shared/services/auth';

interface ConsumerFiltersProps {
  value?: string;
}

const ConsumerFilters: React.FC<ConsumerFiltersProps> = ({ value }) => {
  const { user } = useAuth();
  const { data, isLoading, isSuccess } = useApi(
    ['consumersFilter', value],
    {
      query: productsQuery,
      variables: {
        namespace: user?.namespace,
      },
    },
    { enabled: Boolean(user?.namespace) }
  );
  const options: { name: string; id: string }[] = React.useMemo(() => {
    if (isSuccess) {
      switch (value) {
        case 'products':
          return data.allProductsByNamespace.map((f) => ({
            id: f.id,
            name: f.name,
          }));

        case 'environments':
          return data.allProductsByNamespace.reduce((memo, d) => {
            if (d.environments?.length > 0) {
              return [
                ...memo,
                ...d.environments.map((e) => ({
                  id: e.id,
                  name: e.name,
                })),
              ];
            }
            return memo;
          }, []);

        case 'scopes':
          return data.allConsumerScopesAndRoles.scopes.map((scope) => ({
            id: scope,
            name: scope,
          }));

        case 'roles':
          return data.allConsumerScopesAndRoles.roles.map((role) => ({
            id: role,
            name: role,
          }));

        default:
          return [];
      }
    }
    return [];
  }, [value, data, isSuccess]);

  return (
    <>
      <Select isDisabled={isLoading || options.length === 0} name="value">
        {isSuccess &&
          options.map((f) => (
            <option key={uid(f)} value={f.id}>
              {f.name}
            </option>
          ))}
      </Select>
    </>
  );
};

export default ConsumerFilters;

const productsQuery = gql`
  query GetFilterConsumers($namespace: String!) {
    allConsumerScopesAndRoles

    allProductsByNamespace(where: { namespace: $namespace }) {
      name
      id
      environments {
        id
        name
      }
    }
  }
`;
