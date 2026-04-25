'use server'

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleGameVisibility } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function toggleGameHidden(gameId: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { isModerator: true }
    });

    if (!user?.isModerator) throw new Error("Forbidden");

    await toggleGameVisibility(gameId);
    revalidatePath('/dashboard/moderator');
    revalidatePath('/dashboard/games');
}
