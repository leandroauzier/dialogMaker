Run a Prisma migration for this project. Ask the user for a migration name if not provided.

Usage: /db-migrate <migration-name>

```bash
npx prisma migrate dev --name $ARGUMENTS
```

After migrating, remind the user to verify the Supabase dashboard to confirm the schema change was applied.
