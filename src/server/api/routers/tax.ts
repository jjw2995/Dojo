import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  memberProcedure,
  passcodeProcedure,
} from "~/server/api/trpc";
import { taxes, stores, members } from "~/server/db/schema";

export const taxRouter = createTRPCRouter({
  create: passcodeProcedure
    .input(
      z.object({
        taxName: z.string().min(1),
        taxPercent: z.number().min(0.01),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const d = await tx.insert(taxes).values({
          name: input.taxName,
          percent: input.taxPercent,
          storeId: ctx.storeId,
        });
        return await tx
          .selectDistinct()
          .from(taxes)
          .where(eq(taxes.id, Number(d.insertId)));
      });
    }),

  get: memberProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(taxes)
      .where(eq(taxes.storeId, ctx.storeId));
  }),

  delete: passcodeProcedure
    .input(z.object({ taxId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        // await tx.delete(item)
        // del item ref
        // del tax
      });
    }),

  // delete if owner is only member
  // delete: protectedProcedure.input({storeId: z.string().min(1)}).mutation(async ({ctx, input})=>{
  //   // await ctx.db.transaction()
  // }),
});