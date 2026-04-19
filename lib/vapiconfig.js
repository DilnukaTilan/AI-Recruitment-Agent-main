import Vapi from "@vapi-ai/web";

let vapiInstance = null;

export const getVapiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;

  if (!apiKey) {
    console.error(
      "Vapi public key is missing. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your environment.",
    );
    return null;
  }

  if (!vapiInstance) {
    vapiInstance = new Vapi(apiKey);
  }

  return vapiInstance;
};
