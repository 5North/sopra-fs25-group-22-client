import { getApiDomain } from "@/utils/domain";

export const login = async (values: any): Promise<Response> => {
  return postValuesToPath("/login", values);
};

export const createUser = async (values: any):Promise<Response> => {
  return postValuesToPath("/users", values);
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

export const postValuesToPath = async (path: string, values: any):Promise<Response> => {
  return fetch(getApiDomain() + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
};
