import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { deleteSession, getSession, setSession, verifyPassword } from "../auth.js";
import { getDb } from "../database/index.js";
import { t } from "../i18n.js";

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "User login",
  description: "Authenticate user and establish session",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            account: z.string(),
            password: z.string(),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({}),
        },
      },
      description: "Login successful",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Bad request",
    },
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "User logout",
  description: "Destroy session and clear cookie",
  tags: ["Auth"],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({}),
        },
      },
      description: "Logout successful",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
  },
});

const getUserInfoRoute = createRoute({
  method: "get",
  path: "/getUserInfo",
  summary: "Get user info",
  description: "Retrieve authenticated user details and status",
  tags: ["Auth"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            account: z.string().nullable(),
          }),
        },
      },
      description: "User details",
    },
  },
});

export const authRouter = new OpenAPIHono()
  .openapi(loginRoute, async (c) => {
    const { account, password } = c.req.valid("json");
    const db = getDb(c);

    const user = await db.query.users.findFirst({
      where: { account },
    });

    if (!user) {
      return c.json({ error: t(c, "server.auth.user not found") }, 400);
    }

    const match = await verifyPassword(user.password, password);
    if (!match) {
      return c.json({ error: t(c, "server.auth.wrong password") }, 400);
    }

    await setSession(c, {
      id: user.id,
      account: user.account,
    });

    return c.json({}, 200);
  })
  .openapi(logoutRoute, async (c) => {
    const session = await getSession(c);
    if (!session?.id) {
      return c.json({ error: "UNAUTHORIZED" }, 401);
    }

    deleteSession(c);
    return c.json({}, 200);
  })
  .openapi(getUserInfoRoute, async (c) => {
    const session = await getSession(c);
    return c.json(
      {
        success: !!session?.id,
        account: session?.account ?? null,
      },
      200,
    );
  });
