/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from "react";
import Axios from "axios";
import { AUTH, CHAT, CONNECTIONS, CONVERSATION, TPAUTH } from "./endpoints";
import sign from "jwt-encode";
import { SET_AUTHENTICATION } from "@/redux/types";
import { AuthStateInterface } from "./interfaces";
import jwtDecode from "jwt-decode";
import { API_URL, LOCAL_TOKEN_SECRET } from "./env";

const API = API_URL;
const SECRET = LOCAL_TOKEN_SECRET;

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "x-access-token": token,
});

/**
 * Pull the message the server actually sent.
 *
 * Sign-in errors now originate on chatterloop and are passed through Neon
 * verbatim - "this account is deactivated", "incorrect password" - so throwing
 * them away and showing something generic would hide the one thing that tells
 * a user what to do. The old code only console.logged these.
 */
const messageFrom = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

const applySession = (
  result: any,
  dispatch: Dispatch<any>,
) => {
  const decodedToken: any = jwtDecode(result.usertoken);
  const authtoken = {
    ...decodedToken,
    token: result.authtoken,
  };

  localStorage.setItem("authtoken", sign(authtoken, SECRET));
  dispatch({
    type: SET_AUTHENTICATION,
    payload: {
      authentication: {
        auth: true,
        user: authtoken,
      },
    },
  });
};

const signOutState = (
  dispatch: Dispatch<any>,
  authentication: AuthStateInterface,
) => {
  dispatch({
    type: SET_AUTHENTICATION,
    payload: {
      authentication: { ...authentication, auth: false },
    },
  });
};

/**
 * Sign in with a chatterloop account.
 *
 * Neon forwards the credential to chatterloop and issues its own session from
 * the result, so the response shape here is unchanged from when Neon checked
 * passwords itself.
 */
const LoginRequest = (
  payload: any,
  dispatch: Dispatch<any>,
  authentication: AuthStateInterface,
  onError?: (message: string) => void,
) => {
  Axios.post(`${API}${AUTH.login}`, payload, {
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (response.data.status) {
        applySession(response.data.result, dispatch);
      } else {
        signOutState(dispatch, authentication);
        onError?.(response.data.message || "Could not sign you in.");
      }
    })
    .catch((err) => {
      signOutState(dispatch, authentication);
      onError?.(messageFrom(err, "Could not sign you in."));
    });
};

const ThirdPartyAuthenticationRequest = async (params: any) => {
  return await Axios.post(`${API}${TPAUTH.auth}`, params, {
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not sign you in with Google."));
    });
};

const RefreshAuthRequest = async (payload: any, username: string) => {
  return await Axios.get(`${API}${AUTH.refreshauth}/${username}/`, {
    headers: authHeaders(payload),
  })
    .then((response) => response)
    .catch((err) => {
      throw new Error(messageFrom(err, "Session could not be restored."));
    });
};

// ------------------------------------------------------------ connections --

/** The identities this account can publish bots as. */
const GetConnectionsRequest = async (params: any) => {
  return await Axios.get(`${API}${CONNECTIONS.list}`, {
    headers: authHeaders(params.token),
  })
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not load your connections."));
    });
};

/** Chatterloop pages this account could connect but has not yet. */
const GetAvailablePagesRequest = async (params: any) => {
  return await Axios.get(`${API}${CONNECTIONS.availablePages}`, {
    headers: authHeaders(params.token),
  })
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not load your pages."));
    });
};

/**
 * Connect a page.
 *
 * Only the entity id is sent. Whether this account may act as that page is
 * decided server-side against chatterloop's own membership table - a client
 * that could supply the role is a client that could lie about it.
 */
const ConnectPageRequest = async (params: any, payload: any) => {
  return await Axios.post(`${API}${CONNECTIONS.connectPage}`, payload, {
    headers: authHeaders(params.token),
  })
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not connect that page."));
    });
};

/**
 * What disconnecting an identity would stop, read BEFORE the confirmation.
 *
 * The dialog used to say "any bots published as this identity will be
 * deactivated" - true, but not answerable by the person reading it. This
 * returns the actual list, so the confirmation names what it breaks.
 */
const GetConnectionImpactRequest = async (params: any) => {
  return await Axios.get(`${API}${CONNECTIONS.detail}${params.connection_id}`, {
    headers: authHeaders(params.token),
  })
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not check what that would affect."));
    });
};

const DisconnectRequest = async (params: any) => {
  return await Axios.delete(
    `${API}${CONNECTIONS.detail}${params.connection_id}`,
    { headers: authHeaders(params.token) },
  )
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not disconnect."));
    });
};

// --------------------------------------------------------------- messaging --

/**
 * The caller's conversations.
 *
 * `origins` narrows to particular surfaces - see `ConversationOrigin`. Sent
 * comma-separated because the platform accepts that as well as repeated
 * params, and one value is easier to read in a network log. Omitted entirely
 * when nothing is selected: an empty `origin=` would be sent as a filter that
 * matches nothing on some servers, and here means "no filter" only by luck.
 */
const GetMessagesListRequest = async (params: any) => {
  const origins: string[] = params.origins ?? [];
  return await Axios.get(`${API}${CHAT.list}`, {
    headers: authHeaders(params.token),
    params: origins.length ? { origin: origins.join(",") } : undefined,
  })
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not load conversations."));
    });
};

const GetConversationInfoRequest = async (params: any) => {
  return await Axios.get(
    `${API}${CONVERSATION.info}${params.conversation_id}`,
    { headers: authHeaders(params.token) },
  )
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not load this conversation."));
    });
};

const GetMessagesRequest = async (params: any) => {
  return await Axios.get(
    `${API}${CHAT.messages}${params.conversation_id}`,
    { headers: authHeaders(params.token) },
  )
    .then((response) => response.data)
    .catch((err) => {
      throw new Error(messageFrom(err, "Could not load messages."));
    });
};

const StreamMessageRequest = async (
  params: any,
  payload: any,
  callbacks: {
    onChunk?: (chunk: string) => void;
    onDone?: () => void;
  } = {},
) => {
  // fetch rather than Axios: this response is an SSE stream read
  // incrementally, and Axios buffers the whole body before resolving.
  return await fetch(`${API}${CHAT.messages}${params.conversation_id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": params.token,
    },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullStream = "";

      try {
        for (;;) {
          const { done, value } = await reader.read();

          if (done) {
            callbacks.onDone?.();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullStream += chunk;
          callbacks.onChunk?.(chunk);
        }

        return fullStream;
      } finally {
        reader.releaseLock();
      }
    })
    .catch((err) => {
      throw new Error(messageFrom(err, "The reply could not be streamed."));
    });
};

export {
  LoginRequest,
  RefreshAuthRequest,
  ThirdPartyAuthenticationRequest,
  GetConnectionsRequest,
  GetAvailablePagesRequest,
  ConnectPageRequest,
  GetConnectionImpactRequest,
  DisconnectRequest,
  GetMessagesListRequest,
  GetConversationInfoRequest,
  GetMessagesRequest,
  StreamMessageRequest,
};
