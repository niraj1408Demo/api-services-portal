import * as React from 'react';
import api, { useApi, useApiMutation } from '@/shared/services/api';
import AuthorizationProfileForm from '@/components/authorization-profile-form';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  Link,
  PopoverArrow,
  Text,
  Avatar,
  Icon,
  MenuItem,
  useToast,
  Grid,
  Wrap,
  WrapItem,
  GridItem,
} from '@chakra-ui/react';
import { dehydrate } from 'react-query/hydration';
import { gql } from 'graphql-request';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { MdModeEditOutline } from 'react-icons/md';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQueryClient } from 'react-query';
import { Mutation, Query } from '@/shared/types/query.types';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import ActionsMenu from '@/components/actions-menu';
import EmptyPane from '@/components/empty-pane';
import { useAuth } from '@/shared/services/auth';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryKey = 'authorizationProfiles';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        {},
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const AuthorizationProfiles: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      href: '/manager/authorization-profiles',
      text: 'Authorization Profiles',
    },
  ]);
  const client = useQueryClient();
  const { user } = useAuth();
  const { data } = useApi(queryKey, { query }, { suspense: false });
  const { mutateAsync } = useApiMutation(mutation);
  const toast = useToast();

  // Events
  const handleDelete = React.useCallback(
    (id: string) => async () => {
      try {
        const res: Mutation = await mutateAsync({ id });
        toast({
          title: `${res.deleteCredentialIssuer?.name} deleted`,
          status: 'success',
        });
        client.invalidateQueries(queryKey);
      } catch (err) {
        toast({
          title: 'Unable to delete Credential Issuer',
          status: 'error',
        });
      }
    },
    [client, mutateAsync, toast, queryKey]
  );
  const authorizationProfileForm = (
    <AuthorizationProfileForm>
      <Button
        as="a"
        variant="primary"
        data-testid="create-new-auth-profile-btn"
      >
        Create New Profile
      </Button>
    </AuthorizationProfileForm>
  );

  return (
    <>
      <Head>
        <title>API Program Services | Authorization Profiles</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={authorizationProfileForm}
          breadcrumb={breadcrumbs}
          title="Authorization Profiles"
        >
          <Text>
            Authorization Profiles describe the type of authorization that
            protects your APIs.
          </Text>
        </PageHeader>
        <Box bgColor="white" mb={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">All Profiles</Heading>
          </Box>
          <Divider />
          <Table variant="simple" data-testid="ap-all-profiles-table">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Flow</Th>
                <Th>Mode</Th>
                <Th>Administrator</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {data.allCredentialIssuersByNamespace?.length === 0 && (
                <Tr>
                  <Td align="center" colspan={5}>
                    <EmptyPane
                      action={authorizationProfileForm}
                      title="Create your first Authorization Profile"
                      message={
                        user?.namespace
                          ? 'Manage authentication, authorization and clients access to your API'
                          : 'Select a namespace first to view its profiles'
                      }
                    />
                  </Td>
                </Tr>
              )}
              {data.allCredentialIssuersByNamespace?.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.name}</Td>
                  <Td>{c.flow}</Td>
                  <Td>{c.mode}</Td>
                  <Td>
                    <Popover isLazy trigger="hover">
                      <PopoverTrigger>
                        <Link color="bc-blue" fontWeight="bold">
                          {c.owner?.username}
                        </Link>
                      </PopoverTrigger>
                      <Portal>
                        <PopoverContent
                          border="1px solid"
                          width="auto"
                          borderColor="bc-component"
                        >
                          <PopoverArrow
                            borderTop="1px solid"
                            borderLeft="1px solid"
                            borderColor="bc-component"
                          />
                          <PopoverBody
                            d="grid"
                            gridTemplateColumns="auto 1fr"
                            gridGap={2}
                            p={4}
                          >
                            <Avatar name={c.owner?.name} />
                            <Grid
                              as="dl"
                              color="bc-component"
                              columnGap={2}
                              templateColumns="auto 1fr"
                            >
                              <GridItem as="dt" fontWeight="bold">
                                Username:
                              </GridItem>
                              <GridItem as="dd">{c.owner?.name}</GridItem>
                              <GridItem as="dt" fontWeight="bold" mr={1}>
                                Email:
                              </GridItem>
                              <GridItem as="dd">{c.owner?.email}</GridItem>
                            </Grid>
                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                  </Td>
                  <Td align="right">
                    <AuthorizationProfileForm id={c.id} data={c}>
                      <Button
                        leftIcon={<Icon as={MdModeEditOutline} />}
                        size="sm"
                        variant="flat"
                      >
                        Edit
                      </Button>
                    </AuthorizationProfileForm>
                    <ActionsMenu>
                      <MenuItem onClick={handleDelete(c.id)}>Delete</MenuItem>
                    </ActionsMenu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </>
  );
};

export default AuthorizationProfiles;

const query = gql`
  query GetCredentialIssuers {
    allCredentialIssuersByNamespace {
      id
      name
      flow
      mode
      owner {
        name
        username
        email
      }
      environmentDetails
      availableScopes
      clientAuthenticator
      clientRoles
      clientMappers
      apiKeyName
      resourceType
      resourceScopes
      resourceAccessScope
    }
  }
`;

const mutation = gql`
  mutation DeleteCredentialIssuer($id: ID!) {
    deleteCredentialIssuer(id: $id) {
      name
    }
  }
`;
