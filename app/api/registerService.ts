import { getApiDomain } from "@/utils/domain";

export const login = async (values: object): Promise<Response> => {
  return postValuesToPath("/login", values);
};

export const createUser = async (values: object):Promise<Response> => {
  return postValuesToPath("/users", values);
};

export const getUsers = async (token: string): Promise<Response> => {
  return fetch(`${getApiDomain()}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token,             
    },
  });
};

export const logoutUser = async (token: string):Promise<Response> => {
  return fetch(getApiDomain() + "/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Token": token
    },
  });
};

export const createLobby = async (token: string, lobbyData: object): Promise<Response> => {
  return fetch(getApiDomain() + "/lobbies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Token": token,
    },
    body: JSON.stringify(lobbyData),
  });
};

export const joinLobby = async (
  token: string,
  lobbyPIN: string,
  joinData: object //in case needed
): Promise<Response> => {
  return fetch(getApiDomain() + `/lobbies/${lobbyPIN}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Token": token,
    },
    body: JSON.stringify(joinData),
  });
}

export const postValuesToPath = async (path: string, values: object):Promise<Response> => {
  return fetch(getApiDomain() + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
};
