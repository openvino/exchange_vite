import { createThirdwebClient } from "thirdweb";
import { TEMPLATE_CLIENT_ID } from ".";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = TEMPLATE_CLIENT_ID;

export const client = createThirdwebClient({
  clientId: clientId,
});
