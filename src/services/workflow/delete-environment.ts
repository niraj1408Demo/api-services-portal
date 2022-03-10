import { strict as assert } from 'assert';

import {
  deleteRecord,
  deleteRecords,
  lookupCredentialReferenceByServiceAccess,
  lookupCredentialIssuerById,
  lookupServiceAccessesByEnvironment,
} from '../keystone';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
  getUma2FromIssuer,
} from '../keycloak';
import { KongConsumerService } from '../kong';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import { Logger } from '../../logger';
import { UMAPolicyService } from '../uma2';

const logger = Logger('wf.DeleteEnvironment');

export const DeleteEnvironment = async (
  context: any,
  ns: string,
  id: string,
  force: boolean
) => {
  logger.debug(
    'Deleting Service Accesses for Environment ns=%s, id=%s - force? %s',
    ns,
    id,
    force
  );

  const accessList = await lookupServiceAccessesByEnvironment(context, ns, [
    id,
  ]);

  assert.strictEqual(
    force === true || accessList.length == 0,
    true,
    `${accessList.length} ${
      accessList.length == 1 ? 'consumer has' : 'consumers have'
    } access to this environment.`
  );

  await deleteRecords(
    context,
    'ServiceAccess',
    { productEnvironment: { id } },
    true,
    ['id']
  );

  await deleteRecords(context, 'Environment', { id }, false, ['id']);
};
