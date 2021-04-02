import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  Container,
  Stack,
  VStack,
  Skeleton,
  Text,
  Flex,
  ButtonGroup,
  FormControl,
  FormLabel,
  Link,
  Divider,
  Textarea,
  Checkbox,
  HStack,
  Heading,
  Avatar,
  Select,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { gql } from 'graphql-request';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import api, { useApi } from '@/shared/services/api';
import { dehydrate } from 'react-query/hydration';
import { FieldsetBox, RadioGroup } from '@/components/forms';

const queryKey = 'newAccessRequest';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const NewRequestsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data } = useApi(
    queryKey,
    {
      query,
      variables: {
        id,
      },
    },
    { suspense: false }
  );
  const dataset = data?.allProducts[0];
  const requestor = data?.allTemporaryIdentities[0];

  return (
    <>
      <Head>
        <title>API Program Services | API Discovery</title>
      </Head>
      <Container maxW="6xl">
        {data.allApplications?.length === 0 && (
          <Alert status="warning">
            <AlertIcon />
            {'To get started, you must '}
            <NextLink passHref href="/devportal/poc/applications">
              <Link colorScheme="blue" size="sm">
                Register an Application
              </Link>
            </NextLink>
            {' first.'}
          </Alert>
        )}
        <PageHeader title="New Access Request">
          <Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias ipsum
            sapiente eligendi. Ea sapiente quae quos. Eveniet doloribus
            temporibus inventore expedita totam corporis ut, tenetur molestiae
            perspiciatis ducimus veniam dignissimos!
          </Text>
        </PageHeader>
        <FieldsetBox title="APIs">
          <HStack>
            <Box flex={1}>{data.allProducts.map((d) => d.name)}</Box>
            <Box flex={1}>
              <Heading size="sm" mb={2}>
                Your Details
              </Heading>
              <Flex>
                <Avatar name={requestor.name} />
                <Box ml={2}>
                  <Text>
                    {requestor.name} ({requestor.username})
                  </Text>
                  <Text>{requestor.email}</Text>
                </Box>
              </Flex>
            </Box>
            <Box flex={1}>
              <Heading size="sm" mb={3}>
                OR select an application to consume the API
              </Heading>
              <Select>
                <option>Available Application</option>
                {data.allApplications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{' '}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>
        </FieldsetBox>
        <FieldsetBox title={`Which ${dataset?.name} API Environment?`}>
          <RadioGroup
            options={dataset?.environments
              .filter((e) => e.active)
              .map((e) => ({
                value: e.id,
                label: `${e.name}: ${e.flow}`,
              }))}
          />
        </FieldsetBox>
        <FieldsetBox title="Additional Information & Terms">
          <Textarea
            name="other"
            placeholder="Write any additional instructions for the API Manager"
            variant="bc-input"
          />
          <Box mt={4} p={4} bgColor="blue.50" borderRadius={4}>
            <Checkbox colorScheme="blue">
              I agree to the terms and agreements of this API
            </Checkbox>
          </Box>
        </FieldsetBox>
        <Box mt={4} bgColor="white">
          <Flex justify="flex-end" p={4}>
            <ButtonGroup>
              <Button>Cancel</Button>
              <Button variant="primary">Submit</Button>
            </ButtonGroup>
          </Flex>
        </Box>
      </Container>
    </>
  );
};

export default NewRequestsPage;

const query = gql`
  query Get($id: ID!) {
    allProducts(where: { id: $id }) {
      id
      name
      environments {
        id
        name
        active
        flow
      }
    }
    allApplications {
      id
      name
    }
    allTemporaryIdentities {
      id
      userId
      name
      username
      email
    }
  }
`;
