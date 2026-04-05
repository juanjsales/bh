import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { calculateShipping } from "../services/shippingService";

export const shippingRouter = router({
  calculate: publicProcedure
    .input(z.object({ cep: z.string() }))
    .query(async ({ input }) => {
      const value = await calculateShipping(input.cep);
      return { value };
    }),
});
