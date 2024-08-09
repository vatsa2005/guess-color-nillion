from nada_dsl import *

def nada_main():
    # Define Parties
    player = Party(name="Player")
    computer = Party(name="Computer")

    # Inputs
    guess = SecretInteger(Input(name="guess", party=player))
    secret_color = SecretInteger(Input(name="secret_color", party=computer))

    # Check if the guess is correct
    correct = guess.public_equals(secret_color)

    # Output the result
    result = correct.if_else(Integer(1), Integer(0))  # 1 for correct, 0 for incorrect
    out = Output(result, "guess_result", player)

    return [out]
