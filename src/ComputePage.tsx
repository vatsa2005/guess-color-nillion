import React, { useEffect, useMemo, useState } from 'react';
import GenerateUserKey from './nillion/components/GenerateUserKey';
import CreateClient from './nillion/components/CreateClient';
import * as nillion from '@nillion/client-web';

import { NillionClient, NadaValues } from '@nillion/client-web';
import StoreSecretForm from './nillion/components/StoreSecretForm';
import StoreProgram from './nillion/components/StoreProgramForm';
import ComputeForm from './nillion/components/ComputeForm';
import ConnectionInfo from './nillion/components/ConnectionInfo';

export default function Main() {
  const programName = 'guess_the_color';
  const outputName = 'guess_result';
  const player = 'Player';
  const computer = 'Computer';
  const [userkey, setUserKey] = useState<string | null>(null);
  const [client, setClient] = useState<NillionClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [playerGuess, setPlayerGuess] = useState<string | null>(null);
  const [secretColor, setSecretColor] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [additionalComputeValues, setAdditionalComputeValues] = useState<NadaValues | null>(null);
  const [computeResult, setComputeResult] = useState<string | null>(null);
  const [randomValue, setRandomValue] = useState<number | null>(null);

  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple'];
  
  const memoizedRandomValue = useMemo(() => {
    return Math.floor(Math.random() * 6) + 1;  // Computer selects a color between 1 and 6
  }, []);

  useEffect(() => {
    if (userkey && client) {
      setUserId(client.user_id);
      setPartyId(client.party_id);
      const additionalComputeValues = new nillion.NadaValues();
      setAdditionalComputeValues(additionalComputeValues);
    }
  }, [userkey, client]);

  useEffect(() => {
    setRandomValue(memoizedRandomValue);
  }, [memoizedRandomValue]);

  const interpretResult = (result: string) => {
    switch (result) {
      case '1':
        return "Correct guess!";
      case '0':
        return "Incorrect guess. Try again!";
      default:
        return "Invalid result";
    }
  };

  const interpretColor = (colorNumber: number) => {
    return colors[colorNumber - 1] || "Unknown color";
  };

  return (
    <div>
      <h1>Guess the Color on Nillion</h1>
      <p>Connect to Nillion with a user key, then follow the steps to play 'Guess the Color' using Nillion's blind computation</p>
      <ConnectionInfo client={client} userkey={userkey} />

      <h1>1. Connect to Nillion Client {client && ' ✅'}</h1>
      <GenerateUserKey setUserKey={setUserKey} />
      {userkey && <CreateClient userKey={userkey} setClient={setClient} />}
      
      <h1>2. Store Program for Nillion's blind computation {programId && ' ✅'}</h1>
      {client && (
        <StoreProgram
          nillionClient={client}
          defaultProgram={programName}
          onNewStoredProgram={(program) => setProgramId(program.program_id)}
        />
      )}
      
      <h1>3. Store Player's Guess and Computer's Secret Color {playerGuess && secretColor && ' ✅'}</h1>
      {userId && programId && (
        <>
          <h2>Player's Guess {playerGuess && ' ✅'}</h2>
          <StoreSecretForm
            secretName={'guess'}
            onNewStoredSecret={(secret) => setPlayerGuess(secret.storeId)}
            nillionClient={client}
            secretType="SecretInteger"
            isLoading={false}
            gameOn={true}
            itemName=""
            hidePermissions
            defaultUserWithComputePermissions={userId}
            defaultProgramIdForComputePermissions={programId}
          />

          <h2>Computer's Secret Color {secretColor && ' ✅'}</h2>
          <StoreSecretForm
            secretName={'secret_color'}
            onNewStoredSecret={(secret) => setSecretColor(secret.storeId)}
            nillionClient={client}
            secretType="SecretInteger"
            isLoading={false}
            randomValue={randomValue}  // Use the memoized random value
            itemName={interpretColor(randomValue)}  // Display the selected color
            hidePermissions
            defaultUserWithComputePermissions={userId}
            defaultProgramIdForComputePermissions={programId}
          />
        </>
      )}
      
      <h1>4. Compute Result {computeResult && ' ✅'}</h1>
      {client && programId && playerGuess && secretColor && partyId && additionalComputeValues && (
        <>
          <ComputeForm
            nillionClient={client}
            programId={programId}
            additionalComputeValues={additionalComputeValues}
            storeIds={[playerGuess, secretColor]}
            inputParties={[
              { partyName: player, partyId: partyId },
              { partyName: computer, partyId: partyId }
            ]}
            outputParties={[
              { partyName: player, partyId: partyId }
            ]}
            outputName={outputName}
            onComputeProgram={(result) => {
              if (result.error) {
                console.error("Computation error:", result.error);
                setComputeResult("Error: " + result.error.message);
              } else {
                setComputeResult(result.value);
              }
            }}
          />
          {computeResult && (
            <div>
              <h2>Game Result:</h2>
              <p>{interpretResult(computeResult)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
