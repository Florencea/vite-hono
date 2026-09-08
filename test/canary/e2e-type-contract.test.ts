import type { InferRequestType, InferResponseType } from "hono/client";
import { expectTypeOf, test } from "vitest";
import type { z } from "zod";
import type { api } from "../../src/client/api";
import type { RouterInputs } from "../../src/client/constants/routes";
import type {
  LoginReqSchema,
  UserInfoResSchema,
} from "../../src/server/routes/auth/auth.schema";

test("E2E Type Contract: Client RouterInputs[auth][login] matches Server LoginReqSchema", () => {
  type ServerLoginReq = z.infer<typeof LoginReqSchema>;
  type ClientLoginInput = RouterInputs["auth"]["login"];
  type RpcLoginJson = InferRequestType<typeof api.auth.login.$post>["json"];

  // Static assertion: Client input type equals server Zod input
  expectTypeOf<ClientLoginInput>().toEqualTypeOf<ServerLoginReq>();

  // Static assertion: Hono RPC client inferred body equals server Zod input
  expectTypeOf<RpcLoginJson>().toEqualTypeOf<ServerLoginReq>();

  // Strict property checks
  expectTypeOf<ClientLoginInput>().toHaveProperty("account").toBeString();
  expectTypeOf<ClientLoginInput>().toHaveProperty("password").toBeString();
});

test("E2E Type Contract: Server UserInfoResSchema matches Client RPC InferResponseType", () => {
  type ServerUserInfoRes = z.infer<typeof UserInfoResSchema>;
  type RpcUserInfoRes200 = InferResponseType<
    typeof api.auth.getUserInfo.$get,
    200
  >;

  // Static assertion: Client 200 response type equals server Zod response
  expectTypeOf<RpcUserInfoRes200>().toEqualTypeOf<ServerUserInfoRes>();
  expectTypeOf<RpcUserInfoRes200>().toHaveProperty("success").toBeBoolean();
  expectTypeOf<RpcUserInfoRes200>()
    .toHaveProperty("account")
    .toEqualTypeOf<string | null>();
});
