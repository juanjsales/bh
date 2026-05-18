import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { logger } from "./logger";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Log server errors for monitoring
    logger.error('tRPC error:', { message: error.message, code: (error as any).code, stack: error.stack });
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Error handling middleware that converts unexpected errors to TRPCError
const errorHandler = t.middleware(async (opts) => {
  try {
    return await opts.next();
  } catch (err: unknown) {
    if (err instanceof TRPCError) throw err;
    logger.error('Unhandled error in tRPC procedure', err);
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
  }
});

const baseProcedure = t.procedure.use(errorHandler);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const publicProcedure = baseProcedure;
export const protectedProcedure = baseProcedure.use(requireUser);

export const adminProcedure = baseProcedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
