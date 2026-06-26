Create a new authenticated API route for this Next.js project.

The user will provide a route path (e.g. `/api/nodes`). Create the file at `app/api/<path>/route.ts` following this project's pattern:

- Always call `getServerSession(authOptions)` and return 401 if no session
- Use `prisma` from `@/lib/prisma`
- Import `authOptions` from `@/lib/auth`
- Return `NextResponse.json(...)` for all responses
- Use `session.user.id` for ownership checks

Example template:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // TODO: implement
}
```

Ask the user what HTTP methods and data model the route needs before writing.
