import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  ListItem,
  Radio,
  RadioGroup,
  Select,
  UnorderedList,
} from '@chakra-ui/react';
import { ExpandableCards, ExpandableCard } from '@/components/card';
import { FaDoorClosed } from 'react-icons/fa';
import { HiChartBar } from 'react-icons/hi';
import startCase from 'lodash/startCase';
import { gql } from 'graphql-request';
import { uid } from 'react-uid';
import { useApi } from '@/shared/services/api';

import type { IpRestrictionPayload, RateLimitingPayload } from './types';
import TagInput from '../tag-input';

const Controls: React.FC = () => {
  const [restrictionType, setRestrictionType] = React.useState('service');
  const [rateLimitingType, setRateLimitingType] = React.useState('service');
  const [restrictions, setRestrictions] = React.useState([]);
  const [rateLimits, setRateLimits] = React.useState([]);
  const { data, isLoading } = useApi(
    'consumerControls',
    { query },
    { suspense: false }
  );
  const ipRestrictionOptions = React.useMemo(() => {
    if (data?.allGatewayServicesByNamespace) {
      if (restrictionType === 'route') {
        return data.allGatewayServicesByNamespace.map((s) => s.routes).flat();
      } else {
        return data.allGatewayServicesByNamespace;
      }
    }
    return [];
  }, [data, restrictionType]);
  const rateLimitingOptions = React.useMemo(() => {
    if (data?.allGatewayServicesByNamespace) {
      if (rateLimitingType === 'route') {
        return data.allGatewayServicesByNamespace.map((s) => s.routes).flat();
      } else {
        return data.allGatewayServicesByNamespace;
      }
    }
    return [];
  }, [data, rateLimitingType]);
  // Look up a service or route based on the
  const getControlName = (control): string => {
    if (control.name === 'rate-limiting') {
      if (control.config.service) {
        return data.allGatewayServicesByNamespace.find(
          (d) => d.extForeignKey === control.config.service
        )?.name;
      }
      return data.allGatewayServicesByNamespace
        .map((s) => s.routes)
        .flat()
        .find((d) => d.extForeignKey === control.config.route)?.name;
    } else {
      if (control.service) {
        return data.allGatewayServicesByNamespace.find(
          (d) => d.extForeignKey === control.service.id
        )?.name;
      } else {
        return data.allGatewayServicesByNamespace
          .map((s) => s.routes)
          .flat()
          .find((d) => d.extForeignKey === control.route.id)?.name;
      }
    }
  };

  // Events
  const handleRateLimitingSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) {
      const formData = new FormData(event.currentTarget);
      const entries = Object.fromEntries(formData);
      const payload: RateLimitingPayload = {
        name: 'rate-limiting',
        protocols: ['http', 'https'],
        config: entries,
        tags: [],
      };
      setRateLimits((state) => [...state, payload]);
      event.currentTarget.reset();
    }
  };
  const handleIpRestrictionSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) {
      const formData = new FormData(event.currentTarget);
      const entries = Object.fromEntries(formData);
      const payload: IpRestrictionPayload = {
        name: 'ip-restriction',
        config: {
          allow: [entries.allow as string],
        },
        tags: ['consumer'],
      };
      if (entries.scope === 'route') {
        payload.route = {
          id: entries.route as string,
        };
      } else {
        payload.service = {
          id: entries.service as string,
        };
      }
      setRestrictions((state) => [...state, payload]);
      event.currentTarget.reset();
    }
  };

  return (
    <Box>
      <ExpandableCards>
        <ExpandableCard heading="IP Restrictions" icon={FaDoorClosed}>
          <Grid templateColumns="1fr 1fr" gap={9}>
            <form
              onSubmit={handleIpRestrictionSubmit}
              name="ipRestrictionsForm"
            >
              <FormControl mb={5}>
                <FormLabel>Scope</FormLabel>
                <RadioGroup
                  name="scope"
                  onChange={setRestrictionType}
                  value={restrictionType}
                >
                  <HStack spacing={4}>
                    <Radio value="service">Service</Radio>
                    <Radio value="route">Route</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <Box as="fieldset" borderLeft="1px solid" borderColor="ui" px={4}>
                <Select
                  isDisabled={isLoading}
                  mb={5}
                  name={restrictionType}
                  data-testid="ip-restriction-service-dropdown"
                >
                  {ipRestrictionOptions.map((s) => (
                    <option key={s.id} value={s.extForeignKey}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <FormControl isRequired>
                  <FormLabel>Allowed IPs</FormLabel>
                  <FormHelperText>
                    Comma-separated list, i.e. 1.1.1.1, 0.0.0.0
                  </FormHelperText>
                  <TagInput
                    isRequired
                    name="allow"
                    data-testid="allow-ip-restriction-input"
                  />
                </FormControl>
              </Box>
              <ButtonGroup mt={9}>
                <Button type="reset" variant="secondary">
                  Clear
                </Button>
                <Button type="submit">Apply</Button>
              </ButtonGroup>
            </form>
            <GridItem>
              <Heading size="sm" fontWeight="normal" mb={3}>
                Applied Controls
              </Heading>
              <UnorderedList>
                {restrictions.map((r) => (
                  <ListItem key={uid(r)}>{getControlName(r)}</ListItem>
                ))}
              </UnorderedList>
            </GridItem>
          </Grid>
        </ExpandableCard>
        <ExpandableCard heading="Rate Limiting" icon={HiChartBar}>
          <Grid templateColumns="1fr 1fr" gap={9}>
            <form onSubmit={handleRateLimitingSubmit} name="rateLimitingForm">
              <FormControl mb={5}>
                <FormLabel>Scope</FormLabel>
                <RadioGroup
                  name="scope"
                  onChange={setRateLimitingType}
                  value={rateLimitingType}
                >
                  <HStack spacing={4}>
                    <Radio value="service">Service</Radio>
                    <Radio value="route">Route</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <Box
                as="fieldset"
                borderLeft="1px solid"
                borderColor="ui.500"
                px={4}
              >
                <Select
                  isDisabled={isLoading}
                  mb={5}
                  name={rateLimitingType}
                  data-testid="ratelimit-service-dropdown"
                >
                  {rateLimitingOptions.map((s) => (
                    <option key={s.id} value={s.extForeignKey}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <HStack spacing={5} mb={5}>
                  {['second', 'minute', 'hour', 'day'].map((t) => (
                    <FormControl key={t}>
                      <FormLabel>{startCase(t)}</FormLabel>
                      <Input
                        placeholder="00"
                        type="number"
                        name={t}
                        data-testid={`ratelimit-${t}-input`}
                      />
                    </FormControl>
                  ))}
                </HStack>
                <FormControl>
                  <FormLabel>Policy</FormLabel>
                  <Select name="policy" data-testid="ratelimit-policy-dropdown">
                    <option value="local">Local</option>
                    <option value="redis">Redis</option>
                  </Select>
                </FormControl>
              </Box>
              <ButtonGroup mt={9}>
                <Button type="reset" variant="secondary">
                  Clear
                </Button>
                <Button type="submit">Apply</Button>
              </ButtonGroup>
            </form>
            <GridItem>
              <Heading size="sm" fontWeight="normal" mb={3}>
                Applied Controls
              </Heading>
              <UnorderedList>
                {rateLimits.map((r) => (
                  <ListItem key={uid(r)}>{getControlName(r)}</ListItem>
                ))}
              </UnorderedList>
            </GridItem>
          </Grid>
        </ExpandableCard>
      </ExpandableCards>
    </Box>
  );
};

export default Controls;

const query = gql`
  query GetControlContent {
    allGatewayServicesByNamespace {
      id
      name
      extForeignKey
      routes {
        id
        name
        extForeignKey
      }
    }
  }
`;
