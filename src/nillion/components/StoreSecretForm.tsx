import React, { useState } from 'react';
import * as nillion from '@nillion/client-web';
import { NillionClient } from '@nillion/client-web';
import { storeSecrets } from '../helpers/storeSecrets';
import { getQuote } from '../helpers/getQuote';
import {
  createNilChainClientAndWalletFromPrivateKey,
  payWithWalletFromPrivateKey,
} from '../helpers/nillion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import PayButton from './PayButton';

type SecretDataType = 'SecretBlob' | 'SecretInteger';

const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple'];

interface SecretFormProps {
  onNewStoredSecret: (data: any) => void;
  secretName: string;
  nillionClient: NillionClient | null;
  isDisabled?: boolean;
  isLoading?: boolean;
  secretType: SecretDataType;
  customSecretName?: boolean;
  hidePermissions?: boolean;
  itemName?: string;
  randomValue?: number;
  gameOn?: boolean;
  defaultUserWithComputePermissions?: string;
  defaultProgramIdForComputePermissions?: string;
}

const SecretForm: React.FC<SecretFormProps> = ({
  onNewStoredSecret,
  secretName,
  nillionClient,
  isDisabled = false,
  isLoading = false,
  customSecretName = false,
  secretType,
  gameOn,
  randomValue,
  hidePermissions = false,
  itemName = 'secret',
  defaultUserWithComputePermissions = '',
  defaultProgramIdForComputePermissions = '',
}) => {
  const [secretNameFromForm, setSecretNameFromForm] = useState(secretName);
  const [secret, setSecret] = useState('');
  const [quote, setQuote] = useState<any | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<any | null>(null);
  const [storedSecrets, setStoredSecrets] = useState<any | null>([]);
  const lastStoredSecret = storedSecrets.length
    ? storedSecrets[storedSecrets.length - 1]
    : null;
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(isLoading);
  const [permissionedUserIdForComputeSecret, setPermissionedUserIdForComputeSecret] =
    useState(defaultUserWithComputePermissions);
  const [programIdForComputePermissions, setProgramIdForComputePermissions] =
    useState(defaultProgramIdForComputePermissions);

  const reset = () => {
    setSecretNameFromForm(secretName);
    setSecret('');
    setQuote(null);
    setPaymentReceipt(null);
    setPermissionedUserIdForComputeSecret(defaultUserWithComputePermissions);
    setProgramIdForComputePermissions(defaultProgramIdForComputePermissions);
    setStoredSecrets(null);
    setLoadingQuote(false);
    setLoadingPayment(false);
  };

  const handleColorClick = (colorIndex: number) => {
    setSecret(colorIndex.toString());
  };

  const handleGetQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nillionClient) {
      setLoadingQuote(true);
      const secretForQuote = new nillion.NadaValues();

      const newSecretInteger = nillion.NadaValue.new_secret_integer(secret);
      secretForQuote.insert(secretNameFromForm, newSecretInteger);

      const ttl_days = 30;
      const storeOperation = nillion.Operation.store_values(
        secretForQuote,
        ttl_days
      );

      const quote = await getQuote({
        client: nillionClient,
        operation: storeOperation,
      });

      setQuote({
        quote,
        quoteJson: quote.toJSON(),
        secret: secretForQuote,
        rawSecret: { name: secretNameFromForm, value: secret },
        operation: storeOperation,
      });
      setLoadingQuote(false);
    }
  };

  const handlePayAndStore = async () => {
    if (nillionClient && quote?.operation) {
      setLoadingPayment(true);
      const [nilChainClient, nilChainWallet] =
        await createNilChainClientAndWalletFromPrivateKey();

      const paymentReceipt = await payWithWalletFromPrivateKey(
        nilChainClient,
        nilChainWallet,
        quote
      );

      setPaymentReceipt(paymentReceipt);

      const permissions = {
        usersWithComputePermissions: permissionedUserIdForComputeSecret
          ? [permissionedUserIdForComputeSecret]
          : [],
        programIdForComputePermissions,
      };

      const storeId = await storeSecrets({
        nillionClient,
        nillionSecrets: quote.secret,
        storeSecretsReceipt: paymentReceipt,
        ...permissions,
      });

      const newStoredSecret = {
        userId: nillionClient.user_id,
        storeId,
        secretType,
        name: quote.rawSecret.name,
        ...permissions,
      };
      setStoredSecrets((current: any) => {
        const updatedStoredSecrets = [...current];
        updatedStoredSecrets.push(newStoredSecret);
        return updatedStoredSecrets;
      });
      onNewStoredSecret(newStoredSecret);
      setLoadingPayment(false);
    }
  };

  return isLoading ? (
    'Storing secret...'
  ) : (
    <Box component="form" onSubmit={handleGetQuoteSubmit} sx={{ mt: 2 }}>
      <p>
        {gameOn
          ? "Select your guess for the secret color."
          : `Set the ${itemName} value. Get a quote, then pay to store the secret.`}
      </p>
      <br />
      {customSecretName && (
        <TextField
          label={`Set ${itemName} name`}
          value={secretNameFromForm}
          onChange={(e) => setSecretNameFromForm(e.target.value)}
          required
          disabled={isDisabled}
          fullWidth
          variant="outlined"
          margin="normal"
        />
      )}

      {gameOn ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Choose a color:</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {colors.map((color, index) => (
              <button
                key={color}
                className={`px-4 py-2 bg-${color.toLowerCase()}-500 text-white rounded hover:bg-${color.toLowerCase()}-700`}
                onClick={() => handleColorClick(index + 1)}
              >
                {color}
              </button>
            ))}
          </div>
        </>
      ) : (
        <TextField
          label={`Set ${itemName} value`}
          type="number"
          value={randomValue !== undefined ? randomValue : secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          disabled={randomValue !== undefined}
          fullWidth
          variant="outlined"
          margin="normal"
        />
      )}

      {!hidePermissions && (
        <TextField
          label="Optional: Set a user id to grant compute permissions to another user"
          value={permissionedUserIdForComputeSecret}
          onChange={(e) =>
            setPermissionedUserIdForComputeSecret(e.target.value)
          }
          disabled={isDisabled}
          fullWidth
          variant="outlined"
          margin="normal"
        />
      )}

      {!hidePermissions && (
        <TextField
          label="Optional: Set program id for compute permissions"
          value={programIdForComputePermissions}
          onChange={(e) => setProgramIdForComputePermissions(e.target.value)}
          disabled={isDisabled}
          fullWidth
          variant="outlined"
          margin="normal"
        />
      )}

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Get Quote{' '}
        {loadingQuote && (
          <CircularProgress
            size="14px"
            color="inherit"
            style={{ marginLeft: '10px' }}
          />
        )}
      </Button>
      <Button onClick={reset} sx={{ mt: 2, ml: 2 }}>
        Reset
      </Button>
      {quote && (
        <Box mt={2}>
          <p>Quote for storage</p>
          <List>
            <ListItem>
              <ListItemText primary={`expires_at: ${quote.quote.expires_at}`} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`quote cost base_fee: ${quote.quote.cost.base_fee}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`quote cost congestion_fee: ${quote.quote.cost.congestion_fee}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`quote cost total: ${quote.quote.cost.total}`}
              />
            </ListItem>
          </List>
          <PayButton
            buttonText="Pay and store secret"
            onClick={handlePayAndStore}
            loading={loadingPayment}
            displayList={!!storedSecrets.length && !!lastStoredSecret?.storeId}
            listItems={
              lastStoredSecret
                ? [
                    {
                      displayText: `store id:${lastStoredSecret.storeId}`,
                      copyText: lastStoredSecret.storeId,
                    },
                    {
                      displayText: `secret name: ${lastStoredSecret.name}`,
                      copyText: lastStoredSecret.name,
                    },
                  ]
                : []
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default SecretForm;