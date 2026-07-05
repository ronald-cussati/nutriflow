// Cria o primeiro usuário admin do NutriFlow (auth + profiles) usando a service_role key.
// Só precisa ser rodado UMA VEZ, depois que a migration supabase/migrations/0001_init.sql
// já tiver sido executada no banco.
//
// Uso:
//   node --env-file=.env scripts/bootstrap-admin.mjs "Seu Nome" seu@email.com "sua-senha"

import { createClient } from '@supabase/supabase-js'

const [, , name, email, password] = process.argv

if (!name || !email || !password) {
  console.error('Uso: node --env-file=.env scripts/bootstrap-admin.mjs "Nome" email senha')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const { data: created, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error || !created.user) {
  console.error('Falha ao criar usuário de autenticação:', error?.message)
  process.exit(1)
}

const { error: profileError } = await admin.from('profiles').insert({
  id: created.user.id,
  name,
  role: 'admin',
})

if (profileError) {
  console.error('Usuário de auth criado, mas falhou ao criar o profile:', profileError.message)
  console.error(
    'Rode manualmente no SQL Editor: insert into public.profiles (id, name, role) values (\'' +
      created.user.id +
      "', '" + name.replace(/'/g, "''") + "', 'admin');",
  )
  process.exit(1)
}

console.log('Admin criado com sucesso!')
console.log('Email:', email)
console.log('UID:', created.user.id)
console.log('Já pode logar no app com esse email e senha.')
