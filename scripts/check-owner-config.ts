import { query, pool } from '../src/db';
import { passwordMatches } from '../src/auth';
try {
  const owners = await query('SELECT email,password_hash FROM owners');
  console.log('Owner accounts:', owners.length);
  for (const account of owners) {
    console.log('Account login email:', account.email);
    console.log('Email matches .env:', account.email === process.env.OWNER_EMAIL?.trim().toLowerCase());
    console.log('Password matches .env:', passwordMatches(process.env.OWNER_PASSWORD ?? '', account.password_hash));
  }
} finally {
  await pool().end();
}
