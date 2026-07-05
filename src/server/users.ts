import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import type { Role } from '../lib/types'

function adminClient() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas no servidor')
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

type CreateStaffUserInput = {
  name: string
  email: string
  password: string
  role: Role
  patientId?: string
}

export const createStaffUser = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as CreateStaffUserInput)
  .handler(async ({ data }) => {
    const admin = adminClient()

    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })
    if (error || !created.user) {
      throw new Error(error?.message ?? 'Falha ao criar usuário')
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id: created.user.id,
      name: data.name,
      role: data.role,
    })
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id)
      throw new Error(profileError.message)
    }

    if (data.role === 'paciente' && data.patientId) {
      await admin.from('patients').update({ user_id: created.user.id }).eq('id', data.patientId)
    }

    return { id: created.user.id }
  })

export const updateStaffUser = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { id: string; name: string; role: Role; password?: string })
  .handler(async ({ data }) => {
    const admin = adminClient()
    if (data.password) {
      const { error } = await admin.auth.admin.updateUserById(data.id, { password: data.password })
      if (error) throw new Error(error.message)
    }
    const { error } = await admin
      .from('profiles')
      .update({ name: data.name, role: data.role })
      .eq('id', data.id)
    if (error) throw new Error(error.message)
    return { ok: true }
  })

export const deleteStaffUser = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const admin = adminClient()
    await admin.from('profiles').delete().eq('id', data.id)
    await admin.auth.admin.deleteUser(data.id)
    return { ok: true }
  })
