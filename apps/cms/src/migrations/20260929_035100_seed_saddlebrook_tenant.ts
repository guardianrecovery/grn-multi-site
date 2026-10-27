import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

// Seeds the pilot tenant. The domain is a local-dev placeholder (*.localhost resolves to
// loopback in browsers): replace it in the admin panel with the real hostname before launch.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`INSERT OR IGNORE INTO \`tenants\` (\`name\`, \`slug\`, \`domain\`)
    VALUES ('Saddlebrook Counseling', 'saddlebrook-counseling', 'saddlebrook-counseling.localhost');`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DELETE FROM \`tenants\` WHERE \`slug\` = 'saddlebrook-counseling';`)
}
